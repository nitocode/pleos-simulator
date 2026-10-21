import type { IconName } from '@/core/ui/icons'

/**
 * Paramètres du véhicule, dans l'ordre et avec les libellés du manuel Pleos Connect (Ioniq 3, FR).
 * Une clé désigne la valeur liée : « f: » fonction du véhicule, « p: » préférence d'écran,
 * « c: » réglage de charge, « b: » ouvrant, « v: » volume. Voir useSettingBinding().
 */
export type SettingKey = `${'f' | 'p' | 'c' | 'b' | 'v'}:${string}`

export type SettingItem =
  | { type: 'header'; label: string }
  | { type: 'switch'; key: SettingKey; label: string; hint?: string }
  | { type: 'segment'; key: SettingKey; label: string; options: string[]; icons?: IconName[]; hint?: string }
  | { type: 'slider'; key: SettingKey; label: string; min: number; max: number; step?: number; icon?: IconName; unit?: string; reset?: number }
  | { type: 'color'; key: SettingKey; label: string; options: [string, string][] }
  | { type: 'info'; label: string; value: string }
  | { type: 'action'; id: string; label: string; button: string; hint?: string; danger?: boolean }

export interface QuickTile {
  key: SettingKey
  label: string
  on: string
  off: string
  icon: IconName
}

export interface SettingsCategory {
  id: string
  label: string
  icon: IconName
  tiles?: QuickTile[]
  items?: SettingItem[]
  special?: 'charge' | 'apps' | 'data'
}

const tile = (key: SettingKey, label: string, on: string, off: string, icon: IconName): QuickTile => ({ key, label, on, off, icon })
const sw = (key: SettingKey, label: string, hint?: string): SettingItem => ({ type: 'switch', key, label, hint })
const seg = (key: SettingKey, label: string, options: string[], hint?: string): SettingItem => ({ type: 'segment', key, label, options, hint })
const head = (label: string): SettingItem => ({ type: 'header', label })
const action = (id: string, label: string, button: string, hint?: string, danger?: boolean): SettingItem => ({ type: 'action', id, label, button, hint, danger })

const HEADLIGHTS: SettingItem = {
  type: 'segment',
  key: 'f:headlights',
  label: 'Phares',
  options: ['OFF', 'AUTO', 'Feux de position', 'Feux de croisement'],
  icons: ['power', 'sun-moon', 'parking-lights', 'headlight'],
}

export const SETTINGS: SettingsCategory[] = [
  {
    id: 'quick',
    label: 'Accès rapide',
    icon: 'toggle',
    tiles: [
      tile('b:locked', 'Portes', 'Verrouillées', 'Déverrouillées', 'door'),
      tile('f:childLock', 'Sécurité enfant', 'Activée', 'Désactivée', 'child-lock'),
      tile('f:rearWindowLock', 'Verrouillage fenêtres arr.', 'Verrouillées', 'Déverrouillées', 'window-lock'),
      tile('b:trunkOpen', 'Hayon', 'Ouvert', 'Fermé', 'tailgate'),
      tile('b:mirrorsFolded', 'Rétroviseurs extérieurs', 'Rabattus', 'Dépliés', 'mirror'),
      tile('b:chargePortOpen', 'Trappe de recharge', 'Ouverte', 'Fermée', 'charge-port'),
      tile('f:autoHold', 'AUTO HOLD', 'Activé', 'Désactivé', 'auto-hold'),
      tile('f:parkInNeutral', 'Stationner sur N (point mort)', 'Activé', 'Désactivé', 'gauge'),
      tile('c:preconditioning', 'Conditionnement de la batterie', 'Activé', 'Désactivé', 'thermometer'),
      tile('f:muteCustomAlerts', 'Désactiver les alertes sonores personnalisées', 'M. muet act.', 'M. muet désact.', 'volume-mute'),
    ],
    items: [
      HEADLIGHTS,
      { type: 'slider', key: 'p:brightness', label: 'Luminosité', min: 1, max: 20, icon: 'sun', reset: 15 },
      { type: 'slider', key: 'v:media', label: 'Média', min: 0, max: 40, icon: 'volume' },
    ],
  },
  {
    id: 'light',
    label: 'Éclairage et feux',
    icon: 'sun',
    tiles: [tile('f:interiorDim', 'Attén. éclairage habitacle', 'Activé', 'Désactivé', 'lightbulb')],
    items: [
      HEADLIGHTS,
      seg('f:beamLevel', 'Portée des phares', ['0', '1', '2', '3']),
      sw('f:hba', 'HBA (assistant phares)', 'Réduit la portée des phares pour ne pas éblouir les véhicules en face'),
      sw('f:roadMode', 'Mode route', 'Pour un pays où l’on roule à gauche'),
      seg('f:oneTouchSignal', 'Clignotant monotouche', ['Off', '3 fois', '5 fois', '7 fois']),
      seg('f:welcomeLight', 'Rétros/éclairage d’accueil', ['Désactivé', 'Au déverrouillage', 'À l’approche']),
      seg('f:lightDelay', 'Délai éclairage', ['Off', '15 s', '30 s', '60 s']),
      sw('f:syncDoorLight', 'Synchroniser les portes et l’éclairage de l’habitacle'),
      {
        type: 'color',
        key: 'f:ambientColor',
        label: 'Lumière d’ambiance',
        options: [['Bleu', '#4c9bff'], ['Blanc', '#e6edf5'], ['Ambre', '#ffb547'], ['Vert', '#38d39f'], ['Violet', '#a77bff']],
      },
      { type: 'slider', key: 'f:ambientLevel', label: 'Intensité', min: 0, max: 10, icon: 'lightbulb' },
      sw('f:frameLight', 'Cadre lumineux des voyants toujours allumé'),
    ],
  },
  {
    id: 'adas',
    label: 'Assistance cond.',
    icon: 'car-front',
    tiles: [
      tile('f:lka', 'Assistance maintien file', 'Activée', 'Désactivée', 'lane'),
      tile('f:bvm', 'Affichage de l’angle mort', 'Activé', 'Désactivé', 'blind-spot'),
      tile('f:muteCustomAlerts', 'Désactiver les alertes sonores personnalisées', 'M. muet act.', 'M. muet désact.', 'volume-mute'),
    ],
    items: [
      head('Alertes'),
      sw('f:speedSound', 'Alerte sonore de limitation de vitesse'),
      sw('f:speedChangeSound', 'Alerte sonore de changement de limitation de vitesse'),
      sw('f:dawDeparture', 'DAW › Alerte de départ du véhicule', 'Informe du démarrage du véhicule qui précède'),
      sw('f:daw', 'DAW › Alerte baisse d’attention du conducteur', 'Recommande une pause si nécessaire'),
      sw('f:duckAudio', 'Réduire les volumes audio pendant la conduite'),
      seg('f:warningVolume', 'Volume d’avertissement', ['Faible', 'Moyen', 'Élevé']),
      sw('f:haptic', 'Avertissement tactile (vibration du volant)'),
      head('Conduite'),
      seg('f:sccDistance', 'SCC › Distance', ['1', '2', '3', '4']),
      seg('f:sccAcceleration', 'SCC › Accélération', ['Douce', 'Normale', 'Rapide']),
      seg('f:sccReactivity', 'SCC › Réactivité', ['Lente', 'Normale', 'Rapide']),
      sw('f:lfaAuto', 'Assistant maintien de voie automatiquement activé', 'S’active avec le régulateur intelligent'),
      sw('f:highwaySlowdown', 'Ralentissement auto autoroute'),
      sw('f:highwayLimit', 'Système de limitation de vitesse sur autoroute'),
      seg('f:collisionAssist', 'Assistant anti-collision', ['À l’avant', 'Avant / latérale', 'Angle mort']),
      sw('f:accelLimit', 'Assistant de limitation d’accélération'),
      sw('f:isla', 'Assistant de limitation de vitesse', 'Ajuste la vitesse selon la limitation et la tolérance'),
      seg('f:speedTolerance', 'Tolérance limitation de vitesse (km/h)', ['-5', '0', '+5', '+10']),
      head('Stationner'),
      sw('f:rearCollision', 'Assistant anti-collision › Arrière'),
      sw('f:sew', 'SEW (alerte descente du véhicule sécurisée)'),
      sw('f:sea', 'SEA (assistance de sortie en sécurité)'),
      sw('f:pdwAuto', 'PDW automatique'),
      sw('f:svmAuto', 'Monit. pan. aut. activé', 'Vue panoramique avec l’assistant de distance'),
      sw('f:keepRearCamera', 'Garder affichée la vue de la caméra arrière', 'Reste affichée en passant de R à N ou D'),
    ],
  },
  {
    id: 'drive',
    label: 'Configuration de la conduite',
    icon: 'gauge',
    tiles: [
      tile('f:autoHold', 'AUTO HOLD', 'Activé', 'Désactivé', 'auto-hold'),
      tile('f:downhillBrake', 'Syst. freinage en descente', 'Activé', 'Désactivé', 'mountain'),
      tile('f:esc', 'ESC', 'Activé', 'Désactivé', 'shield'),
    ],
    items: [
      seg('f:driveMode', 'Mode conduite', ['Eco', 'Normal', 'Sport', 'Snow']),
      sw('f:coast', 'Roue libre'),
      sw('f:snowChains', 'Chaînes à neige'),
      sw('f:smartRegen', 'Récupération intelligente'),
      sw('f:regenRoute', 'Récupération intelligente › Lier avec l’itinéraire'),
      seg('f:regenDistance', 'Récupération intelligente › Niveau de distance', ['Proche', 'Normal', 'Loin']),
      seg('f:regen', 'Niveau de récupération', ['0', '1', '2', '3'], 'Aussi réglable avec les palettes au volant'),
      sw('f:ipedal', 'i-Pedal', 'Conduite à une pédale'),
      sw('f:noIpedalReverse', 'i-Pedal › Ne pas utiliser l’i-Pedal en marche arrière'),
      sw('f:carrier', 'Équipements de transport montés', 'Porte-vélos ou attelage'),
    ],
  },
  {
    id: 'doors',
    label: 'Ouvrir/fermer',
    icon: 'door',
    tiles: [
      tile('b:locked', 'Portes', 'Verrouillées', 'Déverrouillées', 'door'),
      tile('f:childLock', 'Sécurité enfant', 'Activée', 'Désactivée', 'child-lock'),
      tile('f:rearWindowLock', 'Verrouillage fenêtres arr.', 'Verrouillées', 'Déverrouillées', 'window-lock'),
    ],
    items: [
      seg('f:autoLock', 'Verrouillage automatique', ['Désactivé', 'En fonction de la vitesse', 'Au changement de rapport']),
      seg('f:autoUnlock', 'Déverrouillage automatique', ['Désactivé', 'Véhicule éteint', 'En position P']),
      sw('f:approachUnlock', 'Déverrouiller à l’approche ou au contact'),
      sw('f:walkAwayLock', 'Verrouillage en s’éloignant du véhicule'),
      seg('f:lockAlert', 'Alerte avertissement', ['Feux', 'Feux et klaxon']),
      sw('f:twoPressUnlock', 'Déverrouillage = 2 pressions sur le bouton'),
      sw('f:remoteWindows', 'Commande à distance des fenêtres'),
      head('Coffre'),
      sw('f:powerTailgate', 'Coffre électrique'),
      seg('f:tailgateSpeed', 'Vitesse ouvert. coffre élect.', ['Normale', 'Rapide']),
      { type: 'slider', key: 'f:tailgateHeight', label: 'Hauteur ouver. coffre élect.', min: 50, max: 100, step: 5, unit: ' %', icon: 'tailgate' },
      sw('f:handsFreeTailgate', 'Coffre mains-libres'),
      sw('f:walkAwayTailgate', 'Fermeture du coffre en s’éloignant du véhicule'),
    ],
  },
  {
    id: 'seats',
    label: 'Sièges',
    icon: 'seat',
    items: [
      seg('f:easyAccess', 'Siège facilitant l’accès', ['Off', 'Normal', 'Étendu']),
      sw('f:postureAssist', 'Assistant position conduite'),
      sw('f:autoSeatClimate', 'Fonctions chauffage/ventilation automatiques', 'Selon la température de l’habitacle'),
    ],
  },
  {
    id: 'climate',
    label: 'Climatisation',
    icon: 'fan',
    items: [
      head('Air recyclé'),
      sw('f:recircWasher', 'Activer avec le liquide lave-glace'),
      sw('f:recircTunnel', 'Activer à l’entrée d’un tunnel'),
      sw('f:recircPlaces', 'Activer les lieux conseillés à proximité'),
      sw('f:purify', 'Activer le mode de purification de l’air'),
      head('Ventilation automatique'),
      sw('f:autoDefog', 'Désembuage automatique'),
      sw('f:autoDehumidify', 'Déshumidification automatique'),
      sw('f:smartVent', 'Ventilation intelligente'),
      sw('f:scheduledVent', 'Ventilation programmée'),
      head('Fonctions de climatisation'),
      sw('f:autoDry', 'Séchage automatique de la climatisation'),
      sw('f:ecoClimate', 'Commandes climatisation mode ECO'),
    ],
  },
  { id: 'charge', label: 'Charger', icon: 'battery-charging', special: 'charge' },
  {
    id: 'navigation',
    label: 'Navigation',
    icon: 'navigation',
    items: [
      head('Instructions vocales'),
      sw('p:guideVoice', 'Voix de guidage'),
      sw('p:guideTone', 'Son d’alerte de guidage'),
      sw('p:navDuringCalls', 'Navigation pendant les appels'),
      sw('p:navPriority', 'Prioriser la navigation'),
      head('Alertes'),
      sw('p:speedCameras', 'Alertes radar'),
      seg('p:speedCameraType', 'Type de radar', ['Fixe', 'Mobile', 'Tous']),
      head('Stations de charge'),
      seg('p:chargeProvider', 'Fournisseurs d’électricité favoris', ['Tous', 'Ionity', 'Fastned', 'TotalEnergies']),
      head('Gestion des données'),
      sw('p:navHistory', 'Enregistrer l’historique de la navigation'),
      action('navReset', 'Réinit. historique utilisation', 'Réinitialiser'),
      { type: 'info', label: 'Infos version', value: 'Carte EU 2026.09 · Logiciel 3.2.1' },
    ],
  },
  {
    id: 'gleo',
    label: 'Gleo AI',
    icon: 'gleo',
    items: [
      { type: 'slider', key: 'v:gleo', label: 'Volume', min: 0, max: 40, icon: 'volume' },
      seg('p:gleoVoice', 'Voix IA', ['Voix 1', 'Voix 2', 'Voix 3']),
      action('gleoReset', 'Réinitialiser la conversation', 'Réinitialiser'),
    ],
  },
  {
    id: 'display',
    label: 'Écran',
    icon: 'monitor',
    items: [
      { type: 'slider', key: 'p:brightness', label: 'Luminosité', min: 1, max: 20, icon: 'sun', reset: 15 },
      sw('p:autoBrightness', 'Ajuster automatiquement la luminosité'),
      head('Écran central'),
      seg('p:theme', 'Type d’affichage de l’écran', ['Automatique', 'Plus clair', 'Plus sombre'], 'Automatique : clair le jour, sombre la nuit'),
      sw('p:iceWarning', 'Avertissement de route gelée', 'Alerte quand il fait moins de 4 °C dehors'),
      head('Écran plat'),
      seg('p:flatTheme', 'Type d’affichage de l’écran', ['Automatique', 'Plus clair', 'Plus sombre']),
      sw('p:flatLights', 'Widget › Afficher le statut des phares'),
      seg('p:flatCenter', 'Widget › Zone centrale', ['Vitesse', 'Média', 'Infos itinéraire', 'Trajet actuel']),
      seg('p:flatLeft', 'Widget › Partie gauche', ['Autonomie', 'Conso.', 'Mode de conduite', 'Média', 'Virage après virage']),
      seg('p:flatRight', 'Widget › Partie droite', ['Autonomie', 'Conso.', 'Mode de conduite', 'Média', 'Virage après virage']),
      action('flatReset', 'Widgets de l’écran plat', 'Réinit.'),
    ],
  },
  {
    id: 'sound',
    label: 'Son',
    icon: 'volume',
    items: [
      sw('p:speedVolume', 'Ajuste le volume en fonction de la vitesse'),
      sw('p:startVolume', 'Volume au démarrage limité'),
      head('Égaliseur'),
      { type: 'slider', key: 'p:eqBass', label: 'Graves', min: -5, max: 5, reset: 0 },
      { type: 'slider', key: 'p:eqMid', label: 'Médiums', min: -5, max: 5, reset: 0 },
      { type: 'slider', key: 'p:eqTreble', label: 'Aigus', min: -5, max: 5, reset: 0 },
      seg('p:fader', 'Point de sortie du son', ['Conducteur', 'Avant', 'Tout l’habitacle']),
      head('Volume'),
      { type: 'slider', key: 'v:media', label: 'Média', min: 0, max: 40, icon: 'music' },
      { type: 'slider', key: 'v:nav', label: 'Navigation', min: 0, max: 40, icon: 'navigation' },
      { type: 'slider', key: 'v:call', label: 'Appel', min: 0, max: 40, icon: 'phone' },
      { type: 'slider', key: 'v:gleo', label: 'Gleo AI', min: 0, max: 40, icon: 'gleo' },
      seg('p:radioNoise', 'Contrôle bruit radio', ['Auto', 'Mono', 'Stéréo']),
      head('Alertes'),
      seg('f:warningVolume', 'Volume d’avertissement', ['Faible', 'Moyen', 'Élevé']),
      sw('f:haptic', 'Avertissement tactile (vibration du volant)'),
    ],
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: 'user',
    items: [
      { type: 'info', label: 'Informations de profil', value: 'Pleos ID connecté' },
      { type: 'info', label: 'Compte Bluelink', value: 'Associé' },
      sw('p:profilePassword', 'Se connecter : mot de passe requis'),
      head('Clés numériques'),
      action('digitalKey', 'Ma clé numérique', 'Gérer'),
      action('sharedKeys', 'Clés numériques partagées', 'Gérer'),
      { type: 'info', label: 'Carte de clef NFC', value: '2 cartes enregistrées' },
      head('Gestion des profils'),
      seg('p:profile', 'Profil actif', ['Profil 1', 'Profil 2', 'Invité']),
      sw('p:syncData', 'Synchroniser les données'),
    ],
  },
  {
    id: 'bluelink',
    label: 'Bluelink',
    icon: 'globe',
    items: [
      { type: 'info', label: 'Services Bluelink', value: 'Abonnement actif' },
      sw('p:remoteServices', 'Commandes à distance'),
      sw('p:liveServices', 'Services connectés (trafic, bornes, météo)'),
      sw('p:modem', 'Modem du véhicule'),
    ],
  },
  {
    id: 'comfort',
    label: 'Confort',
    icon: 'sofa',
    items: [
      sw('f:washMode', 'Mode lavage du véhicule', 'Prépare le véhicule au lavage automatique'),
      sw('f:utilityMode', 'Mode utilitaire', 'Garde climatisation et média actifs à l’arrêt'),
      sw('f:petMode', 'Mode animaux domestiques', 'Maintient la température de l’habitacle'),
      sw('f:valetMode', 'Mode voiturier'),
      sw('f:parkInNeutral', 'Stationner sur N (point mort)'),
      head('Interv. entret.'),
      sw('f:serviceReminder', 'Rappel des intervalles de maintenance'),
      seg('f:serviceDistance', 'Distance', ['15 000 km', '30 000 km']),
      head('Chargeur sans fil pour les appareils mobiles'),
      sw('f:wirelessChargeDriver', 'Conducteur'),
      sw('f:wirelessChargePassenger', 'Passager'),
      head('Paramètres supplémentaires'),
      sw('f:seatbeltAlert', 'Alerte ceinture de sécurité'),
      sw('f:rearOccupantAlert', 'Alerte passager à l’arrière'),
      sw('f:rearWiperReverse', 'Essuie-glace arrière automatique (en marche arrière)'),
      sw('f:reverseLines', 'Lignes de distances de recul'),
    ],
  },
  {
    id: 'connections',
    label: 'Connexions',
    icon: 'bluetooth',
    tiles: [
      tile('f:wifi', 'Wi-Fi', 'Activé', 'Désactivé', 'wifi'),
      tile('f:hotspot', 'Point d’accès Wi-Fi', 'Activé', 'Désactivé', 'hotspot'),
    ],
    items: [
      sw('f:bluetooth', 'Bluetooth', 'Appareil connecté : Pixel 9'),
      action('btAdd', 'Ajouter un nouveau périphérique', 'Ajouter'),
      sw('f:projection', 'Android Auto / Apple CarPlay sans fil'),
    ],
  },
  { id: 'apps', label: 'Applications', icon: 'apps-grid', special: 'apps' },
  {
    id: 'privacy',
    label: 'Confidentialité',
    icon: 'shield-check',
    items: [
      sw('f:shareData', 'Partage des données d’usage', 'Consentement demandé avant toute collecte'),
      sw('f:location', 'Services de localisation'),
      sw('f:micAccess', 'Accès au micro pour les apps'),
      sw('p:gleoHistory', 'Historique des conversations Gleo'),
    ],
  },
  {
    id: 'general',
    label: 'Généraux',
    icon: 'settings',
    items: [
      head('Date et heure'),
      sw('p:autoTime', 'Définir l’heure automatiquement'),
      sw('p:dst', 'Heure d’été'),
      seg('p:clock', 'Format de l’heure', ['12 heures', '24 heures']),
      head('Police d’écriture'),
      seg('p:fontSize', 'Taille de la police d’écriture', ['Petite', 'Moyenne', 'Grande']),
      seg('p:language', 'Langue/Language', ['Français', 'English', 'Deutsch']),
      head('Unités de mesure'),
      sw('p:dualSpeed', 'Tachymètre double'),
      seg('p:distanceUnit', 'Distance', ['km', 'mi']),
      seg('p:tempUnit', 'Température', ['°C', '°F']),
      seg('p:consumptionUnit', 'Consommation moyenne VE', ['kWh/100 km', 'km/kWh']),
      seg('p:tireUnit', 'Press. pneus', ['bar', 'psi', 'kPa']),
      seg('p:keyboard', 'Clavier', ['AZERTY', 'QWERTY']),
      sw('p:keepMedia', 'Poursuivre la lecture média à la coupure du contact'),
    ],
  },
  { id: 'data', label: 'Données du véhicule', icon: 'hard-drive', special: 'data' },
]
