<script setup lang="ts">
import { computed, reactive } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import MebRows, { type MebRow } from '../../meb/components/MebRows.vue'
import { bMode, useId3Base, wellness, type Id3Screen } from '../store'

/**
 * Écrans de réglages de l'ID.3 (Véhicule, Parking, Clim. à l'arrêt, Assistants, Réglages, App-Connect, Wellness).
 * Les intitulés des assistants reprennent le communiqué 49/2024 ; le contenu détaillé est une reconstitution.
 */
const props = defineProps<{ page: Id3Screen }>()
const vehicle = useVehicleStore()
const ui = useId3Base()
const f = vehicle.features
const parked = computed(() => vehicle.gear === 'P' && !vehicle.moving)
// Assistants propres à l'ID.3 (pas d'équivalent dans les fonctions communes du véhicule).
const assist = reactive({ front: true, side: true, car2x: true })

const PAGES: Partial<Record<Id3Screen, { title: string; rows: MebRow[] }>> = {
  vehicle: {
    title: 'Véhicule',
    rows: [
      { kind: 'info', label: 'Kilométrage', value: () => `${Math.round(vehicle.odometer)} km` },
      { kind: 'switch', label: 'Verrouillage', get: () => vehicle.body.locked, set: (v) => (vehicle.body.locked = v) },
      { kind: 'switch', label: 'Rétroviseurs rabattus', get: () => vehicle.body.mirrorsFolded, set: (v) => (vehicle.body.mirrorsFolded = v) },
      { kind: 'seg', label: 'Profil de conduite', options: ['Eco', 'Normal', 'Sport'], get: () => f.driveMode, set: (v) => (f.driveMode = v as typeof f.driveMode) },
      { kind: 'switch', label: 'Mode B (récupération renforcée)', hint: 'Commodo de marche poussé deux fois vers l’avant', get: () => bMode.value, set: (v) => (bMode.value = v) },
      { kind: 'seg', label: 'Feux', options: ['OFF', 'AUTO'], get: () => (f.headlights === 'OFF' ? 'OFF' : 'AUTO'), set: (v) => vehicle.setFeature('headlights', v as never) },
    ],
  },
  parking: {
    title: 'Parking',
    rows: [
      { kind: 'action', label: 'Park Assist Plus', hint: 'Manœuvre de stationnement assistée (option)', button: 'Démarrer', run: () => ui.notify('Park Assist Plus : recherche d’une place…', 'parking'), disabled: () => vehicle.speed > 20 },
      { kind: 'action', label: 'Mémoire de stationnement', hint: 'Rejoue une manœuvre enregistrée jusqu’à 50 m', button: 'Rejouer', run: () => ui.notify('Manœuvre enregistrée en cours', 'parking'), disabled: () => !parked.value },
      { kind: 'action', label: 'Caméra de recul', button: 'Afficher', run: () => ui.notify('La caméra s’affiche automatiquement en marche arrière', 'camera') },
    ],
  },
  standklima: {
    title: 'Climatisation à l’arrêt',
    rows: [
      { kind: 'switch', label: 'Climatisation à l’arrêt', hint: 'Prépare l’habitacle avant le départ, sur batterie ou branché', get: () => f.utilityMode, set: (v) => { vehicle.setFeature('utilityMode', v); if (v) vehicle.climate.on = true } },
      { kind: 'seg', label: 'Heure de départ', options: ['06:30', '07:30', '08:30'], get: () => vehicle.charge.departure, set: (v) => (vehicle.charge.departure = v) },
      { kind: 'slider', label: 'Température', min: 16, max: 28, step: 0.5, unit: ' °C', get: () => vehicle.climate.temp.L, set: (v) => vehicle.setTemp('L', v) },
    ],
  },
  assist: {
    title: 'Assistants',
    rows: [
      { kind: 'switch', label: 'Travel Assist', hint: 'Guidage longitudinal et latéral assisté sur toute la plage de vitesse', get: () => vehicle.cruise, set: () => vehicle.toggleCruise() },
      { kind: 'switch', label: 'Lane Assist', get: () => f.lka, set: (v) => vehicle.setFeature('lka', v) },
      { kind: 'switch', label: 'Front Assist', hint: 'Freinage d’urgence avec détection piétons et cyclistes', get: () => assist.front, set: (v) => (assist.front = v) },
      { kind: 'switch', label: 'Side Assist', get: () => assist.side, set: (v) => (assist.side = v) },
      { kind: 'switch', label: 'Alerte de sortie', hint: 'Empêche brièvement l’ouverture d’une porte si un véhicule arrive', get: () => f.sea, set: (v) => vehicle.setFeature('sea', v) },
      { kind: 'switch', label: 'Car2X', hint: 'Alerte des dangers signalés par les autres véhicules', get: () => assist.car2x, set: (v) => (assist.car2x = v) },
    ],
  },
  setup: {
    title: 'Réglages',
    rows: [
      { kind: 'seg', label: 'Affichage', options: ['Auto', 'Jour', 'Nuit'], get: () => ui.prefs.displayMode, set: (v) => (ui.prefs.displayMode = v as typeof ui.prefs.displayMode) },
      { kind: 'slider', label: 'Luminosité', min: 20, max: 100, step: 5, unit: ' %', get: () => ui.prefs.brightness, set: (v) => (ui.prefs.brightness = v) },
      { kind: 'switch', label: 'Format 24 h', get: () => ui.prefs.clock24, set: (v) => (ui.prefs.clock24 = v) },
      { kind: 'info', label: 'Logiciel', value: () => 'ID. Software (démonstration)' },
    ],
  },
  appconnect: {
    title: 'App-Connect',
    rows: [
      { kind: 'switch', label: 'Android Auto sans fil', get: () => f.projection, set: (v) => vehicle.setFeature('projection', v) },
      { kind: 'switch', label: 'Apple CarPlay sans fil', get: () => f.projection, set: (v) => vehicle.setFeature('projection', v) },
      { kind: 'info', label: 'Téléphone connecté', value: () => 'Smartphone de démonstration' },
    ],
  },
}
const page = computed(() => PAGES[props.page])
const MODES = [
  { id: 'Fresh Up', icon: 'snowflake', text: 'Air frais, lumière froide et son tonique', run: () => { vehicle.setTemp('L', 19.5); vehicle.setFan(6) } },
  { id: 'Calm Down', icon: 'moon', text: 'Lumière douce, son apaisant, ventilation réduite', run: () => { vehicle.setTemp('L', 21.5); vehicle.setFan(2) } },
  { id: 'Power Break', icon: 'bolt', text: 'Pause tonique pendant la recharge', run: () => { vehicle.setTemp('L', 20.5); vehicle.setFan(4) } },
] as const
function startMode(m: (typeof MODES)[number]) {
  wellness.value = wellness.value === m.id ? null : m.id
  if (wellness.value) m.run()
  ui.notify(wellness.value ? `Wellness : ${m.id}` : 'Wellness arrêté', 'leaf')
}
</script>

<template>
  <div class="thin-scrollbar h-full overflow-auto p-6">
    <template v-if="page">
      <h2 class="mb-2 text-[22px] font-bold">{{ page.title }}</h2>
      <div class="rounded-3xl bg-surface px-5 shadow-card"><MebRows :rows="page.rows" /></div>
    </template>
    <template v-else-if="props.page === 'wellness'">
      <h2 class="mb-1 text-[22px] font-bold">Wellness</h2>
      <p class="mb-4 text-ink-2">Éclairage d’ambiance, son et climatisation pour se détendre en roulant ou pendant une pause.</p>
      <div class="grid grid-cols-3 gap-4">
        <button v-for="m in MODES" :key="m.id" type="button" class="press flex flex-col gap-3 rounded-3xl p-5 text-left shadow-card" :class="wellness === m.id ? 'bg-accent text-on-accent' : 'bg-surface'" @click="startMode(m)">
          <Icon :name="m.icon" size="30" /><b class="text-[18px]">{{ m.id }}</b><small :class="wellness === m.id ? 'opacity-90' : 'text-ink-2'">{{ m.text }}</small>
        </button>
      </div>
    </template>
  </div>
</template>
