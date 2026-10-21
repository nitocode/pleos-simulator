import type { Charger, Message, Place, RadioStation, RecentCall, Track } from './types'

/** Contenu de démonstration commun à toutes les interfaces. */

export const PLACES: Place[] = [
  { id: 'home', name: 'Domicile', address: 'Rue des Lilas, Paris 11e', km: 6.4, minutes: 19, kind: 'home' },
  { id: 'work', name: 'Travail', address: 'Parvis de La Défense, Puteaux', km: 14.8, minutes: 27, kind: 'work' },
  { id: 'ionity', name: 'Ionity Lisses (A6)', address: 'Aire de Lisses · 6 bornes 350 kW', km: 34, minutes: 31, kind: 'charger' },
  { id: 'gare', name: 'Gare de Lyon', address: 'Paris 12e', km: 4.1, minutes: 14, kind: 'poi' },
  { id: 'cdg', name: 'Aéroport Paris-CDG', address: 'Roissy-en-France', km: 31, minutes: 38, kind: 'poi' },
  { id: 'versailles', name: 'Château de Versailles', address: 'Place d’Armes, Versailles', km: 22, minutes: 35, kind: 'poi' },
  { id: 'lyon', name: 'Lyon Part-Dieu', address: 'Lyon 3e · longue distance', km: 465, minutes: 282, kind: 'poi' },
]

export const CHARGERS: Charger[] = [
  { name: 'Belib’ Oberkampf', detail: 'CA 22 kW · 2/4 libres', km: 1.2, dc: false },
  { name: 'Ionity Lisses (A6)', detail: 'CC 350 kW · 4/6 libres', km: 34, dc: true, placeId: 'ionity' },
  { name: 'Fastned Bercy', detail: 'CC 300 kW · 3/8 libres', km: 5.6, dc: true },
]

export const PARKINGS: Charger[] = [
  { name: 'Parking Saemes Bastille', detail: 'Ouvert 24h/24 · 412 places', km: 0.8, dc: false },
  { name: 'Indigo Opéra', detail: 'Ouvert 24h/24 · bornes CA', km: 3.4, dc: false },
]

export const STREETS = [
  'Boulevard Voltaire',
  'Rue de la Roquette',
  'Avenue Parmentier',
  'Quai de la Rapée',
  'Boulevard Périphérique',
  'A6 · Autoroute du Soleil',
  'Rue de Charonne',
  'Avenue Daumesnil',
]

export const MANEUVERS = ['turn-right', 'straight', 'turn-left', 'turn-right', 'straight', 'turn-left'] as const

export const RADIO: RadioStation[] = [
  { name: 'FIP', freq: '105.1', show: 'Le direct musical' },
  { name: 'France Inter', freq: '87.8', show: 'Le journal du soir' },
  { name: 'TSF Jazz', freq: '89.9', show: 'Jazz non-stop' },
  { name: 'Radio Nova', freq: '101.5', show: 'Nova Club' },
  { name: 'RTL', freq: '104.3', show: 'Les infos du soir' },
  { name: 'France Culture', freq: '93.5', show: 'Le magazine du soir' },
]

export const TRACKS: Track[] = [
  { title: 'Wave On You', artist: 'Velour Static', duration: 214, colors: ['#1f4d3a', '#7fa38a'] },
  { title: 'Kilomètre zéro', artist: 'Mona Délice', duration: 187, colors: ['#00897b', '#1e3a5f'] },
  { title: 'Recharge lente', artist: 'Atelier Volt', duration: 242, colors: ['#f4511e', '#6d214f'] },
  { title: 'Ciel de Bercy', artist: 'Orchestre Nuit Blanche', duration: 201, colors: ['#283593', '#00acc1'] },
  { title: 'Route du Sud', artist: 'Les Phares', duration: 233, colors: ['#f9a825', '#c62828'] },
]

export const CONTACTS = ['Camille Martin', 'Garage Hyundai Paris 12', 'Julien Robert', 'Maman', 'Sarah Benali', 'Thomas (bureau)']

export const RECENT_CALLS: RecentCall[] = [
  { name: 'Camille Martin', when: 'Aujourd’hui, 17:42', direction: 'in' },
  { name: 'Garage Hyundai Paris 12', when: 'Hier, 09:15', direction: 'out' },
  { name: '06 12 •• •• 48', when: 'Hier, 08:02', direction: 'missed' },
  { name: 'Julien Robert', when: 'Lundi', direction: 'out' },
]

export const MESSAGES: Message[] = [
  { from: 'Camille Martin', text: 'Tu arrives vers quelle heure ?', when: '17:40' },
  { from: 'Garage Hyundai Paris 12', text: 'Votre rendez-vous est confirmé jeudi 9 h.', when: 'Hier' },
]
