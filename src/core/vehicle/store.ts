import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { DEFAULT_FEATURES, type FeatureKey, type Features } from './features'
import { RADIO, TRACKS } from './data'
import {
  IONIQ3_SPEC,
  SIM_SPEEDUP,
  chargeStatus,
  estimateRange,
  nextBatteryTemp,
  smoothConsumption,
  speedLimitFor,
  type VehicleSpec,
} from './simulation'
import type {
  BodyState,
  CallState,
  ChargeSettings,
  ClimateState,
  Gear,
  Level,
  MediaState,
  NavState,
  Place,
  PlugType,
  Side,
  TurnSignal,
} from './types'

/** Événements émis par le véhicule, que chaque interface affiche à sa manière (toast, bandeau…). */
export type VehicleEvent =
  | { type: 'arrived'; place: string }
  | { type: 'charge-complete' }
  | { type: 'auto-locked' }
  | { type: 'gear-refused'; reason: 'moving' | 'plugged' | 'off'; gear: Gear }
  | { type: 'power'; on: boolean }
  | { type: 'power-refused' }

type Listener = (e: VehicleEvent) => void

export const TEMP_MIN = 16
export const TEMP_MAX = 28
export const clampTemp = (v: number) => Math.max(TEMP_MIN, Math.min(TEMP_MAX, Math.round(v * 2) / 2))
const cycleLevel = (l: Level): Level => (l === 0 ? 3 : ((l - 1) as Level))

/**
 * État du véhicule simulé, commun à toutes les marques.
 * Les interfaces lisent cet état et appellent ses actions ; elles gardent leur propre état d'écran ailleurs.
 */
export const useVehicleStore = defineStore('vehicle', () => {
  const gear = ref<Gear>('P')
  /** Contact : le véhicule est prêt (READY) ou éteint. L'écran s'éteint avec lui ; la charge continue. */
  const ready = ref(true)
  const speed = ref(0)
  const power = ref(0)
  const battery = ref(78)
  const odometer = ref(5035)
  const trip = ref(46.2)
  const tripMinutes = ref(24)
  const consumption = ref(14.8)
  const outsideTemp = ref(14)
  const plug = ref<PlugType>('none')
  const turn = ref<TurnSignal>(null)
  const hazard = ref(false)
  const cruise = ref(false)
  const cruiseSpeed = ref(0)
  /** Caractéristiques du modèle simulé (batterie, autonomie, courbe de charge) : fixées par l'interface affichée. */
  const spec = ref<VehicleSpec>(IONIQ3_SPEC)
  const batteryTemp = ref(24)
  const chargerKw = ref(150)
  /** Séance de charge en cours : énergie reçue, durée et relevé (état de charge, puissance) pour la courbe. */
  const session = reactive({ active: false, kwh: 0, seconds: 0, startSoc: 0, points: [] as { soc: number; kw: number }[] })
  let regenTicks = 0
  let chargeDoneSent = false

  const features = reactive<Features>({ ...DEFAULT_FEATURES })

  const climate = reactive<ClimateState>({
    on: true,
    temp: { L: 21, R: 21 },
    sync: true,
    fan: 3,
    auto: true,
    ac: true,
    recirc: false,
    defrostFront: false,
    defrostRear: false,
    seatHeat: { L: 0, R: 0 },
    seatVent: { L: 0, R: 0 },
    wheelHeat: false,
    airflow: 'face',
  })

  const media = reactive<MediaState>({
    source: 'bluetooth',
    playing: true,
    muted: false,
    volume: 12,
    station: 0,
    track: 0,
    position: 45,
    favorites: [0, 2],
  })

  const nav = reactive<NavState>({ destination: null, totalKm: 0, remainingKm: 0 })
  const call = ref<CallState | null>(null)
  const body = reactive<BodyState>({
    locked: true,
    mirrorsFolded: false,
    windowsOpen: false,
    trunkOpen: false,
    chargePortOpen: false,
  })
  const charge = reactive<ChargeSettings>({
    acLimit: 100,
    dcLimit: 80,
    acCurrent: 'Maximum',
    scheduled: false,
    departure: '07:30',
    cableLock: 'Pendant la charge',
    plugAndCharge: true,
    minLevel: 20,
    voiceMessage: true,
    preconditioning: true,
  })

  const listeners = new Set<Listener>()
  const emit = (e: VehicleEvent) => listeners.forEach((l) => l(e))
  function onEvent(l: Listener) {
    listeners.add(l)
    return () => listeners.delete(l)
  }

  // ---------- Lectures dérivées ----------
  const moving = computed(() => speed.value > 0)
  const range = computed(() => estimateRange(battery.value, features.driveMode, climate.on && climate.ac, spec.value))
  const speedLimit = computed(() => speedLimitFor(speed.value, nav))
  const overLimit = computed(
    () => features.isla && speed.value > speedLimit.value + (parseInt(String(features.speedTolerance)) || 0),
  )
  const chargeCtx = () => ({ batteryTemp: batteryTemp.value, chargerKw: chargerKw.value, spec: spec.value })
  const chargeInfo = computed(() => chargeStatus(battery.value, plug.value, charge, chargeCtx()))
  const lkaActive = computed(() => features.lka && speed.value >= 60)
  const currentTrack = computed(() => TRACKS[media.track]!)
  const currentStation = computed(() => RADIO[media.station]!)

  // ---------- Conduite ----------
  function setGear(g: Gear): boolean {
    if (g === gear.value) return true
    if (!ready.value) {
      emit({ type: 'gear-refused', reason: 'off', gear: g })
      return false
    }
    if (speed.value > 5 && (g === 'R' || g === 'P')) {
      emit({ type: 'gear-refused', reason: 'moving', gear: g })
      return false
    }
    if (plug.value !== 'none' && g !== 'P') {
      emit({ type: 'gear-refused', reason: 'plugged', gear: g })
      return false
    }
    gear.value = g
    if (g !== 'D') cruise.value = false
    if (g !== 'D' && g !== 'R') setSpeed(0)
    if (g === 'R') setSpeed(0)
    if (g === 'D' && features.autoLock === 'Au changement de rapport') body.locked = true
    if (g === 'P' && features.autoUnlock === 'En position P') body.locked = false
    return true
  }

  function maxSpeed() {
    return gear.value === 'R' ? 15 : gear.value === 'D' ? 150 : 0
  }

  /** Fixe le niveau de batterie (simulation) ; une charge terminée peut ainsi se relancer. */
  function setBattery(pct: number) {
    battery.value = Math.max(0, Math.min(100, Math.round(pct)))
    chargeDoneSent = false
  }

  /** Démarre ou éteint le véhicule ; on ne l'éteint qu'à l'arrêt, en P. */
  function setReady(on: boolean): boolean {
    if (on === ready.value) return true
    if (!on && (gear.value !== 'P' || speed.value > 0)) {
      emit({ type: 'power-refused' })
      return false
    }
    ready.value = on
    if (!on) {
      cruise.value = false
      turn.value = null
      power.value = 0
      features.utilityMode = false
    }
    emit({ type: 'power', on })
    return true
  }

  function setSpec(s: VehicleSpec) {
    spec.value = s
  }

  function setChargerKw(kw: number) {
    chargerKw.value = kw
  }

  function setSpeed(v: number) {
    const prev = speed.value
    const next = Math.max(0, Math.min(maxSpeed(), Math.round(v)))
    speed.value = next
    if (next > prev) power.value = 6 + next * 0.32 + (next - prev) * 4
    else if (next < prev) {
      power.value = -(prev - next) * 4
      regenTicks = 3
    } else power.value = next ? 6 + next * 0.32 : 0
    if (features.driveMode === 'Sport' && power.value > 0) power.value *= 1.2
    if (cruise.value && next < 20) cruise.value = false
    if (features.autoLock === 'En fonction de la vitesse' && next >= 15 && !body.locked) {
      body.locked = true
      emit({ type: 'auto-locked' })
    }
  }

  function toggleTurn(side: 'L' | 'R') {
    turn.value = turn.value === side ? null : side
  }
  function toggleHazard() {
    hazard.value = !hazard.value
  }
  function toggleCruise() {
    if (!cruise.value && (gear.value !== 'D' || speed.value < 30)) return false
    cruise.value = !cruise.value
    cruiseSpeed.value = Math.round(speed.value / 5) * 5
    return true
  }

  /** Palettes au volant : la palette gauche au niveau 3 active l'i-Pedal. */
  function paddle(dir: -1 | 1): string {
    const levels = ['0', '1', '2', '3'] as const
    if (dir < 0 && features.regen === '3') {
      features.ipedal = true
      return 'i-Pedal activé'
    }
    if (dir > 0 && features.ipedal) {
      features.ipedal = false
      return 'i-Pedal désactivé'
    }
    const i = Math.max(0, Math.min(3, levels.indexOf(features.regen) - dir))
    features.regen = levels[i]!
    return `Récupération niveau ${levels[i]}`
  }

  function setPlug(p: PlugType) {
    if (p !== 'none' && gear.value !== 'P') return false
    plug.value = p
    if (p !== 'none') body.chargePortOpen = true
    Object.assign(session, { active: p !== 'none', kwh: 0, seconds: 0, startSoc: battery.value, points: [] })
    chargeDoneSent = false
    return true
  }

  // ---------- Climatisation ----------
  function setTemp(side: Side, value: number) {
    climate.on = true
    climate.temp[side] = clampTemp(value)
    if (side === 'L' && climate.sync) climate.temp.R = climate.temp.L
    if (side === 'R' && climate.sync && climate.temp.R !== climate.temp.L) climate.sync = false
  }
  function nudgeTemp(side: Side, delta: number) {
    setTemp(side, climate.temp[side] + delta)
  }
  function setFan(v: number) {
    climate.on = true
    climate.fan = Math.max(1, Math.min(8, v))
    climate.auto = false
  }
  function toggleClimate(key: 'on' | 'sync' | 'auto' | 'ac' | 'recirc' | 'defrostFront' | 'defrostRear' | 'wheelHeat') {
    climate[key] = !climate[key]
    if (key === 'sync' && climate.sync) climate.temp.R = climate.temp.L
    if (key !== 'on' && key !== 'wheelHeat' && climate[key]) climate.on = true
  }
  function cycleSeat(side: Side, kind: 'heat' | 'vent') {
    const target = kind === 'heat' ? climate.seatHeat : climate.seatVent
    const other = kind === 'heat' ? climate.seatVent : climate.seatHeat
    target[side] = cycleLevel(target[side])
    if (target[side]) other[side] = 0
  }
  function setSeat(side: Side, kind: 'heat' | 'vent', level: Level) {
    const target = kind === 'heat' ? climate.seatHeat : climate.seatVent
    const other = kind === 'heat' ? climate.seatVent : climate.seatHeat
    target[side] = level
    if (level) other[side] = 0
  }
  function cycleAirflow() {
    const order = ['face', 'both', 'feet', 'defrost'] as const
    climate.airflow = order[(order.indexOf(climate.airflow) + 1) % order.length]!
    climate.auto = false
  }

  // ---------- Média ----------
  function togglePlay() {
    media.playing = !media.playing
  }
  function step(dir: -1 | 1) {
    if (media.source === 'radio') media.station = (media.station + dir + RADIO.length) % RADIO.length
    else {
      media.track = (media.track + dir + TRACKS.length) % TRACKS.length
      media.position = 0
    }
    media.playing = true
  }
  function playStation(i: number) {
    media.source = 'radio'
    media.station = i
    media.playing = true
  }
  function playTrack(i: number) {
    media.source = 'bluetooth'
    media.track = i
    media.position = 0
    media.playing = true
  }
  function setVolume(v: number) {
    media.volume = Math.max(0, Math.min(40, Math.round(v)))
    media.muted = false
  }
  function toggleMute() {
    media.muted = !media.muted
  }
  function toggleFavoriteStation(i: number) {
    const f = media.favorites
    media.favorites = f.includes(i) ? f.filter((x) => x !== i) : [...f, i]
  }

  // ---------- Navigation ----------
  function navigateTo(place: Place) {
    nav.destination = place
    nav.totalKm = place.km
    nav.remainingKm = place.km
  }
  function cancelRoute() {
    nav.destination = null
    nav.totalKm = 0
    nav.remainingKm = 0
  }

  // ---------- Téléphone ----------
  let dialTimer: ReturnType<typeof setTimeout> | undefined
  function dial(name: string) {
    call.value = { name, status: 'dialing', startedAt: Date.now() }
    clearTimeout(dialTimer)
    dialTimer = setTimeout(() => {
      if (call.value?.status === 'dialing') call.value = { ...call.value, status: 'active', startedAt: Date.now() }
    }, 1800)
  }
  function ringIncoming(name: string) {
    call.value = { name, status: 'incoming', startedAt: Date.now() }
  }
  function answer() {
    if (call.value) call.value = { ...call.value, status: 'active', startedAt: Date.now() }
  }
  function hangUp() {
    call.value = null
  }

  // ---------- Carrosserie et réglages ----------
  function toggleBody(key: keyof BodyState) {
    body[key] = !body[key]
    if (key === 'locked' && !body.locked && speed.value > 0) body.locked = true
  }
  function setFeature<K extends FeatureKey>(key: K, value: Features[K]) {
    features[key] = value
  }

  // ---------- Horloge de simulation ----------
  function tick(realSeconds = 1) {
    const seconds = realSeconds * SIM_SPEEDUP
    if (speed.value > 0) {
      const km = (speed.value / 3600) * seconds
      trip.value += km
      odometer.value += km
      tripMinutes.value += seconds / 60
      battery.value = Math.max(0, battery.value - km / spec.value.kmPerPercent)
      consumption.value = smoothConsumption(consumption.value, speed.value, features.driveMode)
      if (nav.destination) {
        nav.remainingKm -= km
        if (nav.remainingKm <= 0.02) {
          const name = nav.destination.name
          cancelRoute()
          emit({ type: 'arrived', place: name })
        }
      }
      if (regenTicks > 0 && --regenTicks === 0) power.value = 6 + speed.value * 0.32
    }
    // La charge est intégrée par pas de 5 s simulées : la puissance suit la courbe à chaque pas.
    const steps = Math.max(1, Math.ceil(seconds / 5))
    const dt = seconds / steps
    let kwNow = 0
    for (let i = 0; i < steps; i++) {
      const cs = chargeStatus(battery.value, plug.value, charge, chargeCtx())
      kwNow = cs.kw
      if (cs.charging) {
        battery.value = Math.min(cs.limit, battery.value + ((cs.kw * dt) / 3600 / spec.value.batteryKwh) * 100)
        session.kwh += (cs.kw * dt) / 3600
        session.seconds += dt
      }
      batteryTemp.value = nextBatteryTemp(batteryTemp.value, dt, {
        kw: cs.kw,
        speed: speed.value,
        outside: outsideTemp.value,
        preheat: charge.preconditioning && plug.value === 'none' && nav.destination?.kind === 'charger',
      })
    }
    if (session.active) {
      session.points.push({ soc: battery.value, kw: kwNow })
      if (session.points.length > 720) session.points.shift()
    }
    const end = chargeStatus(battery.value, plug.value, charge, chargeCtx())
    if (!end.charging && plug.value !== 'none' && !chargeDoneSent) {
      chargeDoneSent = true
      emit({ type: 'charge-complete' })
    }
    if (media.playing && media.source === 'bluetooth') {
      media.position += realSeconds
      if (media.position >= currentTrack.value.duration) step(1)
    }
  }

  return {
    gear, ready, spec, speed, power, battery, batteryTemp, chargerKw, session, odometer, trip, tripMinutes, consumption, outsideTemp, plug, turn, hazard, cruise, cruiseSpeed,
    features, climate, media, nav, call, body, charge,
    moving, range, speedLimit, overLimit, chargeInfo, lkaActive, currentTrack, currentStation,
    onEvent, setGear, maxSpeed, setSpeed, setBattery, setChargerKw, setReady, setSpec, toggleTurn, toggleHazard, toggleCruise, paddle, setPlug,
    setTemp, nudgeTemp, setFan, toggleClimate, cycleSeat, setSeat, cycleAirflow,
    togglePlay, step, playStation, playTrack, setVolume, toggleMute, toggleFavoriteStation,
    navigateTo, cancelRoute, dial, ringIncoming, answer, hangUp, toggleBody, setFeature, tick,
  }
})

export type VehicleStore = ReturnType<typeof useVehicleStore>
