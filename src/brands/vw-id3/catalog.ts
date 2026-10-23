import type { IconName } from '@/core/ui/icons'
import type { Id3Fav, Id3Screen } from './store'

/** Favoris assignables de la barre supérieure. */
export const FAVS: Record<Id3Fav, { icon: IconName; label: string }> = {
  vehicle: { icon: 'car-front', label: 'Véhicule' },
  parking: { icon: 'parking', label: 'Parking' },
  assist: { icon: 'lane', label: 'Assistants' },
  standklima: { icon: 'fan', label: 'Clim. à l’arrêt' },
  charge: { icon: 'bolt', label: 'Recharge' },
  media: { icon: 'music', label: 'Radio/Médias' },
  nav: { icon: 'navigation', label: 'Navigation' },
}

/**
 * Menu des applis, dans l'ordre de la photo officielle (libellés allemands traduits) :
 * Telefon, Radio/Medien, Navigation, Fahrzeug, App-Connect / Parken, Laden, Standklima, Assistenten, Setup.
 * La deuxième page regroupe IDA et l'app Wellness (communiqué 49/2024).
 */
export const APPS: { id: Id3Screen; label: string; icon: IconName; color: string }[][] = [
  [
    { id: 'phone', label: 'Téléphone', icon: 'phone', color: '#34d27a' },
    { id: 'media', label: 'Radio/Médias', icon: 'music', color: '#ff4d6a' },
    { id: 'nav', label: 'Navigation', icon: 'navigation', color: '#2f9bff' },
    { id: 'vehicle', label: 'Véhicule', icon: 'car-front', color: '#c7d0db' },
    { id: 'appconnect', label: 'App-Connect', icon: 'smartphone', color: '#4aa3ff' },
    { id: 'parking', label: 'Parking', icon: 'parking', color: '#2f7ee8' },
    { id: 'charge', label: 'Recharge', icon: 'battery-charging', color: '#3fd27f' },
    { id: 'standklima', label: 'Clim. à l’arrêt', icon: 'fan', color: '#7fc4ff' },
    { id: 'assist', label: 'Assistants', icon: 'lane', color: '#4ad6d6' },
    { id: 'setup', label: 'Réglages', icon: 'settings', color: '#c7d0db' },
  ],
  [
    { id: 'ida', label: 'IDA', icon: 'mic', color: '#2f9bff' },
    { id: 'wellness', label: 'Wellness', icon: 'leaf', color: '#7ad6a0' },
    { id: 'climate', label: 'Climatisation', icon: 'thermometer', color: '#ff8a5c' },
  ],
]
