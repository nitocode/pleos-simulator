import { ref } from 'vue'
import { defineMebStore } from '../meb/store'

/** Écrans de l'Enyaq : les trois boutons de base (Paramètres du véhicule, Accueil, Apps) et les apps. */
export type EnyaqScreen = 'home' | 'apps' | 'vehicle' | 'nav' | 'media' | 'phone' | 'climate' | 'charge' | 'laura'

/**
 * Raccourcis de la barre supérieure (jusqu'à 5, infographie « Explore Enyaq 2024 ») ; les exemples du dossier de
 * presse sont Lane Assist, le chauffage du pare-brise et l'air recyclé.
 */
export type EnyaqShortcut = 'laneAssist' | 'autoHold' | 'profile' | 'windscreen' | 'recirc' | 'parking' | 'esound' | 'lighting' | 'hud' | 'interior'

export const useEnyaqBase = defineMebStore<EnyaqScreen, EnyaqShortcut>('skodaEnyaq', 'home', ['laneAssist', 'autoHold', 'profile', 'windscreen', 'recirc'])

/** Sous-page des Paramètres du véhicule ouverte (tuiles de l'infographie), ou édition des favoris. */
export const vehiclePage = ref<string | null>(null)
/** Raccourcis d'apps de la barre inférieure (3, infographie : médias, téléphone, navigation). */
export const appShortcuts = ref<EnyaqScreen[]>(['media', 'phone', 'nav'])
/** Intensité du mode AUTO de la climatisation (capture : « AUTO Medium »). */
export const autoLevel = ref<'Léger' | 'Moyen' | 'Intense'>('Moyen')
