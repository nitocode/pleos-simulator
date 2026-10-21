import type { IconName } from '@/core/ui/icons'
import type { VehicleStore } from '@/core/vehicle/store'

/** Apps intégrées de Pleos Connect (noms du manuel français). */
export const BUILTIN_APPS = {
  nav: { name: 'Navigation', icon: 'navigation', bg: 'linear-gradient(160deg,#3c8bff,#1f63e6)' },
  bta: { name: 'Bluetooth Audio', icon: 'music', bg: 'linear-gradient(160deg,#9b6bff,#6c3df0)' },
  radio: { name: 'Radio', icon: 'radio', bg: 'linear-gradient(160deg,#ff5fa2,#e0337f)' },
  phone: { name: 'Appel/message', icon: 'phone', bg: 'linear-gradient(160deg,#3ad37b,#18a957)' },
  gleo: { name: 'Gleo AI', icon: 'gleo', bg: 'linear-gradient(150deg,#3d6bff,#8a5cff 60%,#d86bff)' },
  camera: { name: 'Vue de la caméra', icon: 'camera', bg: 'linear-gradient(160deg,#5b6370,#373d47)' },
  climate: { name: 'CLIMATE', icon: 'fan', bg: 'linear-gradient(160deg,#9aa3ae,#717a86)' },
  energy: { name: 'Rapport énergie', icon: 'battery-charging', bg: 'linear-gradient(160deg,#34c77b,#139a56)' },
  market: { name: 'Pleos App Market', icon: 'bag-smile', bg: 'linear-gradient(160deg,#4aa3ff,#2563eb)' },
  manual: { name: 'Manuel', icon: 'book', bg: 'linear-gradient(160deg,#a1a9b4,#77808c)' },
  aa: { name: 'Android Auto', icon: 'smartphone', bg: 'linear-gradient(160deg,#4cc38a,#2f8f62)' },
  cp: { name: 'Apple CarPlay', icon: 'smartphone', bg: 'linear-gradient(160deg,#6b7280,#3f4652)' },
  bluelink: { name: 'Bluelink', icon: 'globe', bg: 'linear-gradient(160deg,#2b78d6,#0d4f9e)' },
} as const satisfies Record<string, { name: string; icon: IconName; bg: string }>

export type BuiltinAppId = keyof typeof BUILTIN_APPS
export type MarketAppId = `m:${string}`
export type AppId = BuiltinAppId | MarketAppId

export interface MarketApp {
  id: MarketAppId
  name: string
  category: 'Musique' | 'Vidéo' | 'Recharge' | 'Utilitaires' | 'Jeux'
  description: string
  size: string
  color: string
  parkedOnly?: boolean
}

export const MARKET_APPS: MarketApp[] = [
  { id: 'm:youtube', name: 'YouTube', category: 'Vidéo', description: 'Vidéos en ligne, à l’arrêt uniquement.', size: '48 Mo', color: '#d63a3a', parkedOnly: true },
  { id: 'm:spotify', name: 'Spotify', category: 'Musique', description: 'Musique et podcasts en streaming.', size: '36 Mo', color: '#1db954' },
  { id: 'm:deezer', name: 'Deezer', category: 'Musique', description: 'Flow, playlists et radios.', size: '41 Mo', color: '#7b4dff' },
  { id: 'm:chargemap', name: 'Chargemap', category: 'Recharge', description: 'Bornes, disponibilités et avis.', size: '22 Mo', color: '#16a34a' },
  { id: 'm:parking', name: 'Parking Finder', category: 'Utilitaires', description: 'Places libres à proximité.', size: '18 Mo', color: '#0ea5e9' },
  { id: 'm:meteo', name: 'Météo Route', category: 'Utilitaires', description: 'Prévisions sur l’itinéraire.', size: '12 Mo', color: '#3b82f6' },
  { id: 'm:browser', name: 'Navigateur', category: 'Utilitaires', description: 'Web, à l’arrêt uniquement.', size: '30 Mo', color: '#475569', parkedOnly: true },
  { id: 'm:arcade', name: 'Arcade', category: 'Jeux', description: 'Mini-jeux pendant la recharge.', size: '64 Mo', color: '#ea7a1e', parkedOnly: true },
]

/**
 * Raccourcis de climatisation pouvant être placés dans la zone de contrôle ou la bibliothèque d'apps.
 * Chacun lit son état et agit directement sur le véhicule.
 */
export interface ClimateShortcut {
  name: string
  icon: IconName
  tone: 'heat' | 'cool' | 'neutral'
  level: (v: VehicleStore) => number
  active: (v: VehicleStore) => boolean
  run: (v: VehicleStore) => string
}

const seatHeat = (side: 'L' | 'R'): ClimateShortcut => ({
  name: side === 'L' ? 'Chauffage siège conducteur' : 'Chauffage siège passager',
  icon: 'seat-heat',
  tone: 'heat',
  level: (v) => v.climate.seatHeat[side],
  active: (v) => v.climate.seatHeat[side] > 0,
  run: (v) => {
    v.cycleSeat(side, 'heat')
    const l = v.climate.seatHeat[side]
    return l ? `Chauffage du siège ${side === 'L' ? 'conducteur' : 'passager'} : niveau ${l}` : 'Chauffage du siège désactivé'
  },
})
const seatVent = (side: 'L' | 'R'): ClimateShortcut => ({
  name: side === 'L' ? 'Ventilation siège conducteur' : 'Ventilation siège passager',
  icon: 'seat-vent',
  tone: 'cool',
  level: (v) => v.climate.seatVent[side],
  active: (v) => v.climate.seatVent[side] > 0,
  run: (v) => {
    v.cycleSeat(side, 'vent')
    const l = v.climate.seatVent[side]
    return l ? `Ventilation du siège ${side === 'L' ? 'conducteur' : 'passager'} : niveau ${l}` : 'Ventilation du siège désactivée'
  },
})

export const CLIMATE_SHORTCUTS = {
  'cf:seatHeatL': seatHeat('L'),
  'cf:seatVentL': seatVent('L'),
  'cf:seatHeatR': seatHeat('R'),
  'cf:seatVentR': seatVent('R'),
  'cf:wheel': {
    name: 'Volant chauffant',
    icon: 'wheel-heat',
    tone: 'heat',
    level: () => 0,
    active: (v) => v.climate.wheelHeat,
    run: (v) => {
      v.toggleClimate('wheelHeat')
      return v.climate.wheelHeat ? 'Volant chauffant activé' : 'Volant chauffant désactivé'
    },
  },
  'cf:defrostFront': {
    name: 'Dégivrage avant',
    icon: 'defrost-front',
    tone: 'heat',
    level: () => 0,
    active: (v) => v.climate.defrostFront,
    run: (v) => {
      v.toggleClimate('defrostFront')
      return v.climate.defrostFront ? 'Dégivrage avant activé' : 'Dégivrage avant désactivé'
    },
  },
  'cf:defrostRear': {
    name: 'Dégivrage arrière',
    icon: 'defrost-rear',
    tone: 'heat',
    level: () => 0,
    active: (v) => v.climate.defrostRear,
    run: (v) => {
      v.toggleClimate('defrostRear')
      return v.climate.defrostRear ? 'Dégivrage arrière activé' : 'Dégivrage arrière désactivé'
    },
  },
  'cf:fan': {
    name: 'Ventilation',
    icon: 'fan',
    tone: 'neutral',
    level: (v) => v.climate.fan,
    active: (v) => v.climate.on,
    run: (v) => {
      v.toggleClimate('auto')
      return v.climate.auto ? 'Climatisation en mode AUTO' : 'Mode AUTO désactivé'
    },
  },
  'cf:airflow': {
    name: 'Mode de diffusion',
    icon: 'air-face',
    tone: 'neutral',
    level: () => 0,
    active: () => false,
    run: (v) => {
      v.cycleAirflow()
      return `Diffusion : ${AIRFLOW_LABEL[v.climate.airflow]}`
    },
  },
  'cf:recirc': {
    name: 'Air recyclé',
    icon: 'recirc',
    tone: 'neutral',
    level: () => 0,
    active: (v) => v.climate.recirc,
    run: (v) => {
      v.toggleClimate('recirc')
      return v.climate.recirc ? 'Air recyclé activé' : 'Air recyclé désactivé'
    },
  },
  'cf:ac': {
    name: 'A/C',
    icon: 'snowflake',
    tone: 'cool',
    level: () => 0,
    active: (v) => v.climate.ac,
    run: (v) => {
      v.toggleClimate('ac')
      return v.climate.ac ? 'A/C activée' : 'A/C désactivée'
    },
  },
} satisfies Record<string, ClimateShortcut>

export type ShortcutId = keyof typeof CLIMATE_SHORTCUTS
export type SlotItem = AppId | ShortcutId

export const AIRFLOW_LABEL = {
  face: 'visage',
  both: 'visage et pieds',
  feet: 'pieds',
  defrost: 'pieds et pare-brise',
} as const

export const AIRFLOW_ICON = {
  face: 'air-face',
  both: 'air-both',
  feet: 'air-feet',
  defrost: 'air-defrost',
} as const satisfies Record<string, IconName>

/** Couleur d'un raccourci actif : chaud, froid ou neutre. */
export const TONE_CLASS = { heat: 'text-heat', cool: 'text-cool', neutral: 'text-accent' } as const

export const isShortcut = (id: string): id is ShortcutId => id.startsWith('cf:')
export const isMarketApp = (id: string): id is MarketAppId => id.startsWith('m:')

export function appMeta(id: AppId): { name: string; icon: IconName | null; bg: string; letter?: string } {
  if (isMarketApp(id)) {
    const m = MARKET_APPS.find((a) => a.id === id)
    return { name: m?.name ?? id, icon: null, bg: m?.color ?? '#888', letter: m?.name[0] }
  }
  return BUILTIN_APPS[id]
}
