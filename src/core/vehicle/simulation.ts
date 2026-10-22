import { MANEUVERS, STREETS } from './data'
import type { ChargeSettings, ChargeStatus, DriveMode, NavState, PlugType } from './types'

/** Le temps simulé avance 20 fois plus vite que le temps réel (trajets et recharges courts). */
export const SIM_SPEEDUP = 20
/** Batterie utile et autonomie de référence de l'Ioniq 3 grande autonomie (≈ 496 km WLTP). */
export const BATTERY_KWH = 61
export const KM_PER_PERCENT = 4.96

export function estimateRange(battery: number, mode: DriveMode, climateOn: boolean): number {
  const modeFactor = mode === 'Eco' ? 1.05 : mode === 'Sport' ? 0.93 : 1
  return Math.round(battery * KM_PER_PERCENT * modeFactor * (climateOn ? 0.97 : 1))
}

/** Limitation affichée : liée à la route suivie, sinon déduite de la vitesse. */
export function speedLimitFor(speed: number, nav: NavState): number {
  if (nav.destination) return nav.destination.km > 60 ? (speed > 90 ? 130 : 110) : 50
  if (speed <= 50) return 50
  if (speed <= 80) return 80
  if (speed <= 110) return 110
  return 130
}

/**
 * Puissance maximale en charge rapide (CC) selon l'état de charge, batterie à bonne température (kW).
 * Pic de 110 kW (fiche technique Hyundai), calée pour que 10→80 % dure environ 30 min.
 */
export const DC_CURVE: readonly [soc: number, kw: number][] = [
  [0, 70], [5, 95], [10, 110], [30, 108], [40, 98], [50, 88], [60, 78], [70, 66], [80, 50], [85, 36], [90, 25], [95, 14], [100, 5],
]
export const AC_KW = { Maximum: 11, Réduit: 7.4, Minimum: 3.7 } as const
export const DC_CHARGER_KW = [50, 150, 350] as const

/** Contexte de la charge : température de la batterie et puissance que la borne peut fournir. */
export interface ChargeContext {
  batteryTemp: number
  chargerKw: number
}
export const WARM_BATTERY: ChargeContext = { batteryTemp: 25, chargerKw: 350 }

function interpolate(curve: readonly (readonly [number, number])[], x: number): number {
  const v = Math.max(0, Math.min(100, x))
  for (let i = 1; i < curve.length; i++) {
    const [x1, y1] = curve[i]!
    if (v <= x1) {
      const [x0, y0] = curve[i - 1]!
      return y0 + ((y1 - y0) * (v - x0)) / (x1 - x0)
    }
  }
  return curve[curve.length - 1]![1]
}

/** Une batterie froide accepte moins de puissance : 30 % à 0 °C, 100 % à partir de 25 °C. */
export function tempFactor(t: number): number {
  return t >= 25 ? 1 : 0.3 + 0.7 * Math.max(0, t) / 25
}

/** Puissance reçue par la batterie (kW) à un état de charge donné. */
export function chargeKw(soc: number, plug: PlugType, s: ChargeSettings, ctx: ChargeContext = WARM_BATTERY): number {
  if (plug === 'none') return 0
  if (plug === 'ac') {
    const base: number = AC_KW[s.acCurrent]
    return soc > 90 ? base * (1 - (0.5 * (soc - 90)) / 10) : base
  }
  return Math.min(interpolate(DC_CURVE, soc) * tempFactor(ctx.batteryTemp), ctx.chargerKw)
}

/** Durée (min) pour passer de `from` à `to` %, en intégrant la courbe par pas de 0,5 %. */
export function chargeMinutes(from: number, to: number, plug: PlugType, s: ChargeSettings, ctx: ChargeContext = WARM_BATTERY): number {
  let minutes = 0
  for (let soc = from; soc < to; soc += 0.5) {
    const step = Math.min(0.5, to - soc)
    minutes += ((step / 100) * BATTERY_KWH) / chargeKw(soc + step / 2, plug, s, ctx) * 60
  }
  return minutes
}

/** Évolution de la température de la batterie : chauffe en charge et en roulant, refroidit à l'arrêt. */
export function nextBatteryTemp(t: number, seconds: number, o: { kw: number; speed: number; outside: number; preheat: boolean }): number {
  const target = o.kw > 0 ? Math.min(42, 25 + o.kw * 0.12) : o.preheat ? 32 : o.speed > 0 ? o.outside + 14 : o.outside
  const tau = target > t ? 900 : 5400
  return t + (target - t) * (1 - Math.exp(-seconds / tau))
}

export function chargeStatus(battery: number, plug: PlugType, s: ChargeSettings, ctx: ChargeContext = WARM_BATTERY): ChargeStatus {
  if (plug === 'none') return { charging: false, kw: 0, limit: 0, minutesLeft: 0, label: 'Non branché' }
  const limit = plug === 'ac' ? s.acLimit : s.dcLimit
  if (battery >= limit) return { charging: false, kw: 0, limit, minutesLeft: 0, label: `Charge terminée · limite ${limit} %` }
  const kw = Math.round(chargeKw(battery, plug, s, ctx) * 10) / 10
  const minutesLeft = Math.round(chargeMinutes(battery, limit, plug, s, ctx))
  return { charging: true, kw, limit, minutesLeft, label: `En charge · ${String(kw).replace('.', ',')} kW` }
}

export type Maneuver = (typeof MANEUVERS)[number] | 'arrive'

export interface GuidanceStep {
  maneuver: Maneuver
  street: string
  distanceKm: number
}

const STEP_KM = 0.9

/** Instructions de guidage générées de façon déterministe à partir de la progression. */
export function guidance(nav: NavState, offset = 0): GuidanceStep | null {
  if (!nav.destination) return null
  const done = nav.totalKm - nav.remainingKm
  const step = Math.floor(done / STEP_KM) + offset
  let distanceKm = STEP_KM - (done % STEP_KM) + offset * STEP_KM
  if (distanceKm > nav.remainingKm) distanceKm = nav.remainingKm
  const arriving = nav.remainingKm < 0.25 && offset === 0
  return {
    maneuver: arriving ? 'arrive' : MANEUVERS[step % MANEUVERS.length]!,
    street: arriving ? nav.destination.name : STREETS[(step + nav.destination.name.length) % STREETS.length]!,
    distanceKm,
  }
}

export function etaMinutes(nav: NavState): number {
  if (!nav.destination || nav.totalKm === 0) return 0
  return Math.round((nav.destination.minutes * nav.remainingKm) / nav.totalKm)
}

/** Consommation moyenne lissée (kWh/100 km) selon la vitesse et le mode. */
export function smoothConsumption(current: number, speed: number, mode: DriveMode): number {
  const target = 11 + speed * 0.06 + (mode === 'Sport' ? 2 : 0) - (mode === 'Eco' ? 1 : 0)
  return Math.max(11, Math.min(22, current * 0.97 + target * 0.03))
}
