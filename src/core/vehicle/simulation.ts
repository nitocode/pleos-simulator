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

export function chargeStatus(battery: number, plug: PlugType, s: ChargeSettings): ChargeStatus {
  if (plug === 'none') return { charging: false, kw: 0, limit: 0, minutesLeft: 0, label: 'Non branché' }
  const limit = plug === 'ac' ? s.acLimit : s.dcLimit
  const kw =
    plug === 'ac'
      ? s.acCurrent === 'Maximum'
        ? 11
        : s.acCurrent === 'Réduit'
          ? 7.4
          : 3.7
      : battery < 50
        ? 148
        : battery < 80
          ? 104
          : 42
  if (battery >= limit) return { charging: false, kw: 0, limit, minutesLeft: 0, label: `Charge terminée · limite ${limit} %` }
  const minutesLeft = Math.round((((limit - battery) / 100) * BATTERY_KWH) / kw * 60)
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
