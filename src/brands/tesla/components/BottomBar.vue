<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import type { Side } from '@/core/vehicle/types'
import { APPS, useTeslaStore } from '../store/tesla'

/**
 * Barre inférieure, toujours sombre (capture du manuel, repères 5 à 13) : Contrôles, température conducteur (Auto/Manuel),
 * siège chauffant, Mes applis, lanceur d'applications, applis récentes, siège et température passager, volume.
 * Les flèches < > changent la température et ouvrent la fenêtre contextuelle ; toucher la valeur ouvre l'écran principal.
 */
const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const c = vehicle.climate
const fmt = (v: number) => (tesla.prefs.tempUnit === '°F' ? String(Math.round((v * 9) / 5 + 32)) : v.toFixed(1).replace('.', ','))
const recents = computed(() => tesla.recent.filter((id) => !tesla.myApps.includes(id)).slice(0, 3))
const box = 'flex h-14 items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.04] px-1.5'

function step(side: Side, dir: -1 | 1) {
  vehicle.nudgeTemp(side, dir * 0.5)
  tesla.panel = 'climate-quick'
}
function seat(side: Side) {
  vehicle.cycleSeat(side, 'heat')
}
function volume(dir: -1 | 1) {
  vehicle.setVolume(vehicle.media.volume + dir)
}
const seatTone = (side: Side) => (c.seatHeat[side] ? 'text-heat' : c.seatVent[side] ? 'text-cool' : 'text-ink-2')
</script>

<template>
  <nav class="t-dock flex h-full items-center gap-2.5 bg-[#050506] px-3 text-ink" aria-label="Barre inférieure">
    <button type="button" class="press grid size-14 place-items-center rounded-xl" :class="tesla.panel === 'controls' ? 'bg-white/15' : ''" aria-label="Contrôles" @click="tesla.togglePanel('controls')"><Icon name="car-front" size="28" /></button>

    <!-- température conducteur -->
    <div :class="box">
      <button type="button" class="press grid h-12 w-7 place-items-center text-ink-2" aria-label="Baisser la température" @click="step('L', -1)"><Icon name="chevron-left" size="20" :stroke="2.4" /></button>
      <button type="button" class="press flex w-[78px] flex-col items-center leading-none" aria-label="Commandes de climatisation" @click="tesla.togglePanel('climate')">
        <span class="text-[10px] font-semibold text-ink-2">{{ c.on ? (c.auto ? 'Auto' : 'Manuel') : 'Arrêt' }}</span>
        <span class="tnum mt-1 text-[27px] font-light" :class="!c.on && 'text-ink-3'">{{ fmt(c.temp.L) }}</span>
      </button>
      <button type="button" class="press grid h-12 w-7 place-items-center text-ink-2" aria-label="Augmenter la température" @click="step('L', 1)"><Icon name="chevron-right" size="20" :stroke="2.4" /></button>
    </div>
    <button type="button" class="press relative grid size-12 place-items-center rounded-xl" aria-label="Siège chauffant conducteur" @click="seat('L')">
      <Icon name="seat-heat" size="24" :class="seatTone('L')" />
      <span class="absolute bottom-1.5 flex gap-0.5"><i v-for="n in 3" :key="n" class="h-[3px] w-[5px] rounded-full" :class="n <= c.seatHeat.L ? 'bg-heat' : 'bg-white/15'" /></span>
    </button>

    <!-- Mes applis · lanceur · récentes -->
    <div class="mx-auto flex items-center gap-2">
      <div v-if="tesla.myApps.length" :class="box">
        <button v-for="id in tesla.myApps" :key="id" type="button" class="press grid size-11 place-items-center rounded-xl" :class="tesla.app === id && 'bg-white/15'" :aria-label="APPS[id].name" @click="tesla.app === id ? tesla.closeApp() : tesla.launch(id)"><span class="grid size-8 place-items-center rounded-lg text-white" :style="{ background: APPS[id].color }"><Icon :name="APPS[id].icon" size="18" /></span></button>
      </div>
      <div :class="box"><button type="button" class="press grid size-11 place-items-center rounded-xl" :class="tesla.panel === 'launcher' && 'bg-white/15'" aria-label="Lanceur d’applications" @click="tesla.togglePanel('launcher')"><Icon name="apps-grid" size="24" /></button></div>
      <div v-if="recents.length" :class="box">
        <button v-for="id in recents" :key="id" type="button" class="press grid size-11 place-items-center rounded-xl" :class="tesla.app === id && 'bg-white/15'" :aria-label="APPS[id].name" @click="tesla.app === id ? tesla.closeApp() : tesla.launch(id)"><span class="grid size-8 place-items-center rounded-lg text-white" :style="{ background: APPS[id].color }"><Icon :name="APPS[id].icon" size="18" /></span></button>
      </div>
    </div>

    <!-- siège et température passager -->
    <button type="button" class="press relative flex size-12 flex-col items-center justify-center rounded-xl" aria-label="Siège chauffant passager" @click="seat('R')">
      <Icon name="seat-heat" size="24" :class="seatTone('R')" class="-scale-x-100" />
      <span class="absolute bottom-1.5 flex gap-0.5"><i v-for="n in 3" :key="n" class="h-[3px] w-[5px] rounded-full" :class="n <= c.seatHeat.R ? 'bg-heat' : 'bg-white/15'" /></span>
    </button>
    <div v-if="!c.sync" :class="box">
      <button type="button" class="press grid h-12 w-7 place-items-center text-ink-2" aria-label="Baisser la température passager" @click="step('R', -1)"><Icon name="chevron-left" size="20" :stroke="2.4" /></button>
      <button type="button" class="press flex w-[78px] flex-col items-center leading-none" aria-label="Commandes de climatisation passager" @click="tesla.togglePanel('climate')">
        <span class="text-[10px] font-semibold text-ink-2">{{ c.auto ? 'Auto' : 'Manuel' }}</span>
        <span class="tnum mt-1 text-[27px] font-light">{{ fmt(c.temp.R) }}</span>
      </button>
      <button type="button" class="press grid h-12 w-7 place-items-center text-ink-2" aria-label="Augmenter la température passager" @click="step('R', 1)"><Icon name="chevron-right" size="20" :stroke="2.4" /></button>
    </div>

    <!-- volume -->
    <div :class="box">
      <button type="button" class="press grid h-12 w-7 place-items-center text-ink-2" aria-label="Baisser le volume" @click="volume(-1)"><Icon name="chevron-left" size="20" :stroke="2.4" /></button>
      <button type="button" class="press grid size-11 place-items-center rounded-xl" :class="tesla.panel === 'volume' && 'bg-white/15'" aria-label="Volume" @click="tesla.togglePanel('volume')"><Icon :name="vehicle.media.muted ? 'volume-mute' : 'volume'" size="24" /></button>
      <button type="button" class="press grid h-12 w-7 place-items-center text-ink-2" aria-label="Augmenter le volume" @click="volume(1)"><Icon name="chevron-right" size="20" :stroke="2.4" /></button>
    </div>
  </nav>
</template>
