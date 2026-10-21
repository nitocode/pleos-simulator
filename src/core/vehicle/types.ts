/** Types partagés par toutes les interfaces : ils décrivent le véhicule simulé, pas l'écran. */

export type Gear = 'P' | 'R' | 'N' | 'D'
export type PlugType = 'none' | 'ac' | 'dc'
export type TurnSignal = 'L' | 'R' | null
export type Side = 'L' | 'R'
export type DriveMode = 'Eco' | 'Normal' | 'Sport' | 'Snow'
export type Airflow = 'face' | 'both' | 'feet' | 'defrost'
export type MediaSource = 'radio' | 'bluetooth'
export type Level = 0 | 1 | 2 | 3

export interface Place {
  id: string
  name: string
  address: string
  km: number
  minutes: number
  kind: 'home' | 'work' | 'charger' | 'poi' | 'parking' | 'address'
}

export interface Charger {
  name: string
  detail: string
  km: number
  dc: boolean
  placeId?: string
}

export interface RadioStation {
  name: string
  freq: string
  show: string
}

export interface Track {
  title: string
  artist: string
  duration: number
  colors: [string, string]
}

export interface RecentCall {
  name: string
  when: string
  direction: 'in' | 'out' | 'missed'
}

export interface Message {
  from: string
  text: string
  when: string
}

export interface ClimateState {
  on: boolean
  temp: Record<Side, number>
  sync: boolean
  fan: number
  auto: boolean
  ac: boolean
  recirc: boolean
  defrostFront: boolean
  defrostRear: boolean
  seatHeat: Record<Side, Level>
  seatVent: Record<Side, Level>
  wheelHeat: boolean
  airflow: Airflow
}

export interface MediaState {
  source: MediaSource
  playing: boolean
  muted: boolean
  volume: number
  station: number
  track: number
  position: number
  favorites: number[]
}

export interface NavState {
  destination: Place | null
  totalKm: number
  remainingKm: number
}

export interface CallState {
  name: string
  status: 'incoming' | 'dialing' | 'active'
  startedAt: number
}

export interface BodyState {
  locked: boolean
  mirrorsFolded: boolean
  windowsOpen: boolean
  trunkOpen: boolean
  chargePortOpen: boolean
}

export interface ChargeSettings {
  acLimit: number
  dcLimit: number
  acCurrent: 'Maximum' | 'Réduit' | 'Minimum'
  scheduled: boolean
  departure: string
  cableLock: 'Toujours' | 'Pendant la charge' | 'Désactivé'
  plugAndCharge: boolean
  minLevel: number
  voiceMessage: boolean
  preconditioning: boolean
}

export interface ChargeStatus {
  charging: boolean
  kw: number
  limit: number
  minutesLeft: number
  label: string
}
