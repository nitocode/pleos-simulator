<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import MebRows, { type MebRow } from '../../meb/components/MebRows.vue'
import { SHORTCUTS, VEHICLE_TILES } from '../catalog'
import { useEnyaqBase, vehiclePage, type EnyaqShortcut } from '../store'

/**
 * Paramètres du véhicule (infographie) : grille de tuiles, sous-pages de réglages, et « Ajuster les favoris » avec le
 * bouton vert « Terminer ». Le menu des sièges permet aussi de régler le siège passager (dossier de presse).
 */
const vehicle = useVehicleStore()
const ui = useEnyaqBase()
const f = vehicle.features
const ids = Object.keys(SHORTCUTS) as EnyaqShortcut[]

const PAGES: Record<string, MebRow[]> = {
  vehicle: [
    { kind: 'info', label: 'Kilométrage', value: () => `${Math.round(vehicle.odometer)} km` },
    { kind: 'switch', label: 'Verrouillage', get: () => vehicle.body.locked, set: (v) => (vehicle.body.locked = v) },
    { kind: 'switch', label: 'KESSY : verrouillage en s’éloignant', hint: 'Verrouille les portes quand la clé s’éloigne de 2 à 2,5 m', get: () => f.walkAwayLock, set: (v) => vehicle.setFeature('walkAwayLock', v) },
    { kind: 'switch', label: 'Rétroviseurs rabattus', get: () => vehicle.body.mirrorsFolded, set: (v) => (vehicle.body.mirrorsFolded = v) },
  ],
  assist: [
    { kind: 'switch', label: 'Lane Assist', get: () => f.lka, set: (v) => vehicle.setFeature('lka', v) },
    { kind: 'switch', label: 'Intelligent Speed Assist', hint: 'Adapte la vitesse aux panneaux et aux données de navigation', get: () => f.isla, set: (v) => vehicle.setFeature('isla', v) },
    { kind: 'switch', label: 'Régulateur adaptatif', get: () => vehicle.cruise, set: () => vehicle.toggleCruise() },
  ],
  parking: [
    { kind: 'switch', label: 'Activation automatique des capteurs', get: () => f.pdwAuto, set: (v) => vehicle.setFeature('pdwAuto', v) },
    { kind: 'switch', label: 'Vue à 360° automatique', get: () => f.svmAuto, set: (v) => vehicle.setFeature('svmAuto', v) },
  ],
  users: [{ kind: 'info', label: 'Utilisateur actif', value: () => 'Conducteur principal' }],
  profile: [{ kind: 'seg', label: 'Profil de conduite', options: ['Eco', 'Normal', 'Sport'], get: () => f.driveMode, set: (v) => vehicle.setFeature('driveMode', v as typeof f.driveMode) }],
  lighting: [
    { kind: 'slider', label: 'Intensité', min: 0, max: 10, get: () => f.ambientLevel, set: (v) => vehicle.setFeature('ambientLevel', v) },
    { kind: 'seg', label: 'Couleur', options: ['Vert', 'Bleu', 'Blanc'], get: () => (f.ambientColor === '#78faae' ? 'Vert' : f.ambientColor === '#4c9bff' ? 'Bleu' : 'Blanc'), set: (v) => vehicle.setFeature('ambientColor', v === 'Vert' ? '#78faae' : v === 'Bleu' ? '#4c9bff' : '#ffffff') },
  ],
  seats: [
    { kind: 'seg', label: 'Chauffage siège conducteur', options: ['0', '1', '2', '3'], get: () => String(vehicle.climate.seatHeat.L), set: (v) => vehicle.setSeat('L', 'heat', +v as 0 | 1 | 2 | 3) },
    { kind: 'seg', label: 'Chauffage siège passager', options: ['0', '1', '2', '3'], get: () => String(vehicle.climate.seatHeat.R), set: (v) => vehicle.setSeat('R', 'heat', +v as 0 | 1 | 2 | 3) },
    { kind: 'action', label: 'Régler le siège passager', hint: 'Le conducteur avance ou recule le siège passager (siège électrique)', button: 'Régler', run: () => ui.notify('Siège passager avancé', 'seat') },
  ],
  standklima: [
    { kind: 'switch', label: 'Climatisation à l’arrêt', get: () => f.utilityMode, set: (v) => { vehicle.setFeature('utilityMode', v); if (v) vehicle.climate.on = true } },
    { kind: 'seg', label: 'Heure de départ', options: ['06:30', '07:30', '08:30'], get: () => vehicle.charge.departure, set: (v) => (vehicle.charge.departure = v) },
  ],
  sound: [{ kind: 'slider', label: 'Volume', min: 0, max: 40, get: () => vehicle.media.volume, set: (v) => vehicle.setVolume(v) }],
}
const tile = computed(() => VEHICLE_TILES.find((t) => t.id === vehiclePage.value))

function openTile(id: string) {
  if (id === 'charging') return ui.open('charge')
  vehiclePage.value = id
}
</script>

<template>
  <div class="thin-scrollbar h-full overflow-auto p-6">
    <template v-if="vehiclePage === 'favourites'">
      <div class="mb-5 flex items-center justify-between">
        <span><h2 class="text-[21px] font-bold">Ajuster les favoris</h2><p class="text-ink-2">Choisissez jusqu’à cinq raccourcis pour la barre supérieure.</p></span>
        <button type="button" class="press h-11 rounded-full bg-accent px-6 text-[15px] font-semibold text-on-accent" @click="vehiclePage = null; ui.open('home')">Terminer</button>
      </div>
      <div class="grid grid-cols-5 gap-4">
        <button v-for="id in ids" :key="id" type="button" class="press flex flex-col items-center gap-2 rounded-2xl p-3 text-center text-[13px]" @click="ui.toggleFav(id, 5)">
          <span class="grid size-16 place-items-center rounded-2xl" :class="ui.favs.includes(id) ? 'bg-accent-soft text-accent ring-2 ring-accent' : 'bg-surface-2 text-ink-2'">
            <span v-if="SHORTCUTS[id].text" class="text-[11px] leading-[1.05] font-extrabold whitespace-pre">{{ SHORTCUTS[id].text }}</span>
            <Icon v-else :name="SHORTCUTS[id].icon" size="26" />
          </span>
          {{ SHORTCUTS[id].label }}
        </button>
      </div>
    </template>
    <template v-else-if="tile">
      <h2 class="mb-2 flex items-center gap-2 text-[21px] font-bold"><button type="button" class="press grid size-10 place-items-center rounded-full text-ink-2" aria-label="Retour" @click="vehiclePage = null"><Icon name="arrow-left" size="20" /></button>{{ tile.label }}</h2>
      <div class="rounded-2xl bg-surface px-5 shadow-card"><MebRows :rows="PAGES[tile.id] ?? []" /></div>
    </template>
    <template v-else>
      <h2 class="mb-5 text-[21px] font-bold">Paramètres du véhicule</h2>
      <div class="grid grid-cols-5 gap-x-4 gap-y-6">
        <button v-for="t in VEHICLE_TILES" :key="t.id" type="button" class="press flex flex-col items-center gap-2.5 text-center text-[13.5px]" @click="openTile(t.id)">
          <span class="grid size-[68px] place-items-center rounded-2xl bg-surface-2 text-ink shadow-card"><Icon :name="t.icon" size="30" /></span>{{ t.label }}
        </button>
      </div>
    </template>
  </div>
</template>
