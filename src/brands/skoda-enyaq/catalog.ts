import type { IconName } from '@/core/ui/icons'
import type { VehicleStore } from '@/core/vehicle/store'
import type { EnyaqScreen, EnyaqShortcut } from './store'

/** Raccourcis véhicule (infographie, tuiles de l'écran « Ajuster les favoris », libellés traduits). */
export const SHORTCUTS: Record<EnyaqShortcut, { label: string; icon: IconName; text?: string; on?: (v: VehicleStore) => boolean; run: (v: VehicleStore) => string }> = {
  laneAssist: { label: 'Lane Assist', icon: 'lane', on: (v) => v.features.lka, run: (v) => (v.setFeature('lka', !v.features.lka), v.features.lka ? 'Lane Assist activé' : 'Lane Assist désactivé') },
  autoHold: { label: 'Auto Hold', icon: 'auto-hold', text: 'AUTO\nHOLD', on: (v) => v.features.autoHold, run: (v) => (v.setFeature('autoHold', !v.features.autoHold), v.features.autoHold ? 'Auto Hold activé' : 'Auto Hold désactivé') },
  profile: {
    label: 'Profil de conduite',
    icon: 'gauge',
    run: (v) => {
      const order = ['Eco', 'Normal', 'Sport'] as const
      const next = order[(order.indexOf(v.features.driveMode as (typeof order)[number]) + 1) % order.length] ?? 'Normal'
      v.setFeature('driveMode', next)
      return `Profil de conduite : ${next}`
    },
  },
  windscreen: { label: 'Chauffage du pare-brise', icon: 'defrost-front', on: (v) => v.climate.defrostFront, run: (v) => (v.toggleClimate('defrostFront'), v.climate.defrostFront ? 'Chauffage du pare-brise activé' : 'Chauffage du pare-brise désactivé') },
  recirc: { label: 'Air recyclé', icon: 'recirc', on: (v) => v.climate.recirc, run: (v) => (v.toggleClimate('recirc'), v.climate.recirc ? 'Air recyclé activé' : 'Air frais') },
  parking: { label: 'Stationnement', icon: 'parking', run: () => 'Aide au stationnement : capteurs activés' },
  esound: { label: 'e-sound', icon: 'audio-lines', run: () => 'Son extérieur du véhicule électrique' },
  lighting: { label: 'Éclairage d’ambiance', icon: 'lightbulb', run: () => 'Éclairage d’ambiance réglé' },
  hud: { label: 'Position de l’affichage tête haute', icon: 'monitor', run: () => 'Réglez la hauteur de l’affichage tête haute' },
  interior: { label: 'Surveillance de l’habitacle', icon: 'eye', run: () => 'Surveillance de l’habitacle activée' },
}

/** Apps (raccourcis de la barre inférieure et écran Apps). */
export const APPS: { id: EnyaqScreen; label: string; icon: IconName }[] = [
  { id: 'media', label: 'Médias', icon: 'music' },
  { id: 'phone', label: 'Téléphone', icon: 'phone' },
  { id: 'nav', label: 'Navigation', icon: 'navigation' },
  { id: 'charge', label: 'Recharge', icon: 'battery-charging' },
  { id: 'climate', label: 'Climatisation', icon: 'fan' },
  { id: 'laura', label: 'Laura', icon: 'mic' },
  { id: 'vehicle', label: 'Véhicule', icon: 'car-front' },
]

/** Tuiles des Paramètres du véhicule, dans l'ordre de l'infographie. */
export const VEHICLE_TILES: { id: string; label: string; icon: IconName }[] = [
  { id: 'vehicle', label: 'Véhicule', icon: 'car-front' },
  { id: 'assist', label: 'Systèmes d’assistance', icon: 'lane' },
  { id: 'parking', label: 'Stationnement', icon: 'parking' },
  { id: 'charging', label: 'Recharge', icon: 'plug' },
  { id: 'users', label: 'Utilisateurs', icon: 'user' },
  { id: 'profile', label: 'Profil de conduite', icon: 'gauge' },
  { id: 'lighting', label: 'Éclairage d’ambiance', icon: 'lightbulb' },
  { id: 'seats', label: 'Sièges', icon: 'seat' },
  { id: 'standklima', label: 'Climatisation à l’arrêt', icon: 'fan' },
  { id: 'sound', label: 'Son', icon: 'sliders' },
]
