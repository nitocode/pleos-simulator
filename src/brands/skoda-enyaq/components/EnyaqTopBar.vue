<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { clock } from '@/core/format'
import { useNow } from '@/core/composables/useNow'
import { useVehicleStore } from '@/core/vehicle/store'
import { SHORTCUTS } from '../catalog'
import { useEnyaqBase, vehiclePage } from '../store'

/**
 * Barre supérieure (infographie « Explore Enyaq 2024 ») : bouton Paramètres du véhicule, jusqu'à cinq raccourcis
 * véhicule et « + », heure au centre, volume, notifications, utilisateur et connectivité à droite.
 */
const vehicle = useVehicleStore()
const ui = useEnyaqBase()
const now = useNow()

function shortcut(id: keyof typeof SHORTCUTS) {
  ui.notify(SHORTCUTS[id].run(vehicle), SHORTCUTS[id].icon)
}
function editFavourites() {
  vehiclePage.value = 'favourites'
  ui.open('vehicle')
}
</script>

<template>
  <header class="flex h-full items-center gap-1 px-3">
    <button type="button" class="press grid size-12 place-items-center rounded-xl" :class="ui.screen === 'vehicle' ? 'text-accent' : 'text-ink'" aria-label="Paramètres du véhicule" @click="vehiclePage = null; ui.screen === 'vehicle' ? ui.open('home') : ui.open('vehicle')"><Icon name="car-front" size="26" /></button>
    <span class="mx-1 h-7 w-px bg-line" />
    <button v-for="id in ui.favs" :key="id" type="button" class="press grid size-12 place-items-center rounded-xl" :class="SHORTCUTS[id].on?.(vehicle) ? 'text-accent' : 'text-ink-2'" :aria-label="SHORTCUTS[id].label" :aria-pressed="SHORTCUTS[id].on?.(vehicle)" @click="shortcut(id)">
      <span v-if="SHORTCUTS[id].text" class="text-[9px] leading-[1.05] font-extrabold whitespace-pre">{{ SHORTCUTS[id].text }}</span>
      <Icon v-else :name="SHORTCUTS[id].icon" size="22" />
    </button>
    <button type="button" class="press grid size-12 place-items-center rounded-xl text-ink-2" aria-label="Ajuster les favoris" @click="editFavourites"><Icon name="plus" size="22" /></button>
    <span class="tnum mx-auto text-[17px] font-semibold">{{ clock(now, ui.prefs.clock24) }}</span>
    <span class="flex items-center gap-1">
      <button type="button" class="press grid size-11 place-items-center rounded-xl text-ink-2" aria-label="Volume" @click="vehicle.toggleMute()"><Icon :name="vehicle.media.muted ? 'volume-mute' : 'volume'" size="20" /></button>
      <button type="button" class="press relative grid size-11 place-items-center rounded-xl text-ink-2" aria-label="Notifications" @click="ui.notify('Aucune nouvelle notification', 'bell')"><Icon name="bell" size="20" /><span class="absolute top-2.5 right-2.5 size-2 rounded-full bg-crit" /></button>
      <button type="button" class="press grid size-11 place-items-center rounded-xl text-ink-2" aria-label="Utilisateur" @click="ui.notify('Profil : Conducteur principal', 'user')"><Icon name="user" size="20" /></button>
      <span class="flex items-center gap-1 px-1 text-ink-2"><Icon name="signal" size="16" /><Icon name="bluetooth" size="16" /></span>
    </span>
  </header>
</template>
