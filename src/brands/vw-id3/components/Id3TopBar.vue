<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { clock } from '@/core/format'
import { useNow } from '@/core/composables/useNow'
import { useVehicleStore } from '@/core/vehicle/store'
import { useId3Base } from '../store'
import { FAVS } from '../catalog'

/**
 * Barre supérieure (photo officielle) : bouton du menu principal (grille) à gauche, favoris librement assignables
 * et « + », température extérieure au centre, réseau / Wi-Fi et heure à droite.
 */
const vehicle = useVehicleStore()
const ui = useId3Base()
const now = useNow()
</script>

<template>
  <header class="flex h-full items-center gap-1.5 px-3">
    <button type="button" class="press grid size-12 place-items-center rounded-xl" :class="ui.screen === 'apps' ? 'bg-accent text-on-accent' : 'text-accent'" aria-label="Menu principal" @click="ui.screen === 'apps' ? ui.open('home') : ui.open('apps')">
      <svg viewBox="0 0 24 24" class="size-6" aria-hidden="true"><g fill="currentColor"><circle v-for="i in 9" :key="i" :cx="5 + ((i - 1) % 3) * 7" :cy="5 + Math.floor((i - 1) / 3) * 7" r="2" /></g></svg>
    </button>
    <button v-for="f in ui.favs" :key="f" type="button" class="press grid size-12 place-items-center rounded-xl" :class="ui.screen === f ? 'bg-surface-2 text-accent' : 'text-ink-2'" :aria-label="FAVS[f].label" @click="ui.open(f)"><Icon :name="FAVS[f].icon" size="22" /></button>
    <button type="button" class="press grid size-12 place-items-center rounded-xl text-ink-2" aria-label="Ajouter un favori" @click="ui.editing = !ui.editing; ui.open('apps')"><Icon name="plus" size="22" /></button>
    <span class="tnum mx-auto text-[15px] font-semibold text-ink-2">{{ vehicle.outsideTemp.toFixed(1).replace('.', ',') }} °C</span>
    <span class="flex items-center gap-3 text-ink-2">
      <Icon name="signal" size="17" />
      <Icon name="wifi" size="17" />
      <Icon v-if="vehicle.call" name="phone" size="17" class="text-ok" />
      <span class="tnum text-[15px] font-semibold text-ink">{{ clock(now, ui.prefs.clock24) }}</span>
    </span>
  </header>
</template>
