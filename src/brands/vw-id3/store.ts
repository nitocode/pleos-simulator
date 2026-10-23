import { ref } from 'vue'
import { defineMebStore } from '../meb/store'

/** Écrans de l'ID.3 : accueil, menu des applis (photo officielle) et une vue par appli. */
export type Id3Screen =
  | 'home'
  | 'apps'
  | 'nav'
  | 'media'
  | 'phone'
  | 'vehicle'
  | 'appconnect'
  | 'parking'
  | 'charge'
  | 'standklima'
  | 'assist'
  | 'setup'
  | 'climate'
  | 'ida'
  | 'wellness'

/** Favoris de la barre supérieure (photo : véhicule, P, assistants, chauffage, « + »). */
export type Id3Fav = 'vehicle' | 'parking' | 'assist' | 'standklima' | 'charge' | 'media' | 'nav'

export const useId3Base = defineMebStore<Id3Screen, Id3Fav>('vwId3', 'home', ['vehicle', 'parking', 'assist', 'standklima'])

/** Mode B (récupération renforcée) : commodo de marche poussé une seconde fois vers l'avant. */
export const bMode = ref(false)
/** Mode Wellness actif (communiqué : Fresh Up, Calm Down, Power Break). */
export const wellness = ref<null | 'Fresh Up' | 'Calm Down' | 'Power Break'>(null)
