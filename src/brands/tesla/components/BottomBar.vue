<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import type { Side } from '@/core/vehicle/types'
import { APPS, useTeslaStore } from '../store/tesla'

/**
 * Barre inférieure (manuel) : climatisation conducteur, Mes applis, lanceur d'applications, applis récentes,
 * climatisation passager (si les températures sont séparées) et volume.
 */
const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const c = vehicle.climate
const fmt = (v: number) => (tesla.prefs.tempUnit === '°F' ? String(Math.round((v * 9) / 5 + 32)) : v.toFixed(1).replace('.', ','))
const recents = computed(() => tesla.recent.filter((id) => !tesla.myApps.includes(id)).slice(0, Math.max(0, 4 - tesla.myApps.length)))
const seatTone = (side: Side) => (c.seatHeat[side] ? 'text-heat' : c.seatVent[side] ? 'text-cool' : 'text-ink-3')

function step(side: Side, dir: -1 | 1) {
  vehicle.nudgeTemp(side, dir * 0.5)
}
</script>

<template>
  <nav class="flex h-full items-center gap-2 px-4" aria-label="Barre inférieure">
    <!-- climatisation conducteur -->
    <div class="flex items-center">
      <button type="button" class="press grid size-12 place-items-center rounded-xl text-ink-2" aria-label="Baisser la température" @click="step('L', -1)"><Icon name="chevron-left" size="24" :stroke="2.4" /></button>
      <button type="button" class="press flex min-w-[100px] items-center justify-center gap-1.5 rounded-xl px-2 py-1" :class="tesla.panel === 'climate' && 'bg-surface-2'" aria-label="Commandes de climatisation" @click="tesla.togglePanel('climate')">
        <Icon name="seat-heat" size="18" :class="seatTone('L')" />
        <span class="tnum text-[30px] leading-none font-light" :class="!c.on && 'text-ink-3'">{{ c.on ? fmt(c.temp.L) : 'OFF' }}</span>
        <span v-if="c.on" class="text-[14px] text-ink-2">{{ tesla.prefs.tempUnit }}</span>
      </button>
      <button type="button" class="press grid size-12 place-items-center rounded-xl text-ink-2" aria-label="Augmenter la température" @click="step('L', 1)"><Icon name="chevron-right" size="24" :stroke="2.4" /></button>
    </div>

    <!-- Mes applis, lanceur, récentes -->
    <div class="mx-auto flex items-center gap-2">
      <button type="button" class="press grid size-12 place-items-center rounded-2xl" :class="tesla.panel === 'launcher' ? 'bg-accent text-on-accent' : 'bg-surface-2'" aria-label="Lanceur d’applications" @click="tesla.togglePanel('launcher')"><Icon name="apps-grid" size="24" /></button>
      <button v-for="id in [...tesla.myApps, ...recents]" :key="id" type="button" class="press grid size-12 place-items-center rounded-2xl text-white" :class="tesla.app === id && 'ring-2 ring-ink'" :style="{ background: APPS[id].color }" :aria-label="APPS[id].name" @click="tesla.app === id ? tesla.closeApp() : tesla.launch(id)"><Icon :name="APPS[id].icon" size="22" /></button>
      <button type="button" class="press grid size-12 place-items-center rounded-2xl" :class="tesla.panel === 'controls' ? 'bg-accent text-on-accent' : 'bg-surface-2'" aria-label="Contrôles" @click="tesla.togglePanel('controls')"><Icon name="car-front" size="24" /></button>
    </div>

    <!-- climatisation passager, volume -->
    <div class="flex items-center">
      <div v-if="!c.sync" class="flex items-center">
        <button type="button" class="press grid size-12 place-items-center rounded-xl text-ink-2" aria-label="Baisser la température passager" @click="step('R', -1)"><Icon name="chevron-left" size="24" :stroke="2.4" /></button>
        <span class="flex min-w-[90px] items-center justify-center gap-1.5"><Icon name="seat-heat" size="18" :class="seatTone('R')" /><span class="tnum text-[30px] leading-none font-light">{{ fmt(c.temp.R) }}</span></span>
        <button type="button" class="press grid size-12 place-items-center rounded-xl text-ink-2" aria-label="Augmenter la température passager" @click="step('R', 1)"><Icon name="chevron-right" size="24" :stroke="2.4" /></button>
      </div>
      <button type="button" class="press grid size-12 place-items-center rounded-xl" :class="tesla.panel === 'volume' && 'bg-surface-2'" aria-label="Volume" @click="tesla.togglePanel('volume')"><Icon :name="vehicle.media.muted ? 'volume-mute' : 'volume'" size="24" /></button>
    </div>
  </nav>
</template>
