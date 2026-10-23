<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import type { Side } from '@/core/vehicle/types'
import { APPS } from '../catalog'
import { appShortcuts, useEnyaqBase } from '../store'

/**
 * Barre inférieure (infographie) : sièges et « − 21.5 + » conducteur, Accueil, trois raccourcis d'apps et bouton Apps,
 * puis « − 21.5 + » et sièges passager. Toucher une température ouvre la climatisation.
 */
const vehicle = useVehicleStore()
const ui = useEnyaqBase()
const c = vehicle.climate
const app = (id: string) => APPS.find((a) => a.id === id)!
const fmt = (v: number) => v.toFixed(1)
</script>

<template>
  <nav class="flex h-full items-center gap-1 px-3" aria-label="Barre inférieure">
    <template v-for="side in (['L', 'R'] as Side[])" :key="side">
      <div class="flex items-center gap-1" :class="side === 'R' ? 'order-3 flex-row-reverse' : 'order-1'">
        <button type="button" class="press relative grid size-11 place-items-center rounded-xl" :aria-label="`Siège chauffant ${side === 'L' ? 'conducteur' : 'passager'}`" @click="vehicle.cycleSeat(side, 'heat')">
          <Icon name="seat-heat" size="21" :class="[c.seatHeat[side] ? 'text-heat' : 'text-ink-2', side === 'R' && '-scale-x-100']" />
          <span class="absolute bottom-1.5 flex gap-0.5"><i v-for="n in 3" :key="n" class="h-[3px] w-[5px] rounded-full" :class="n <= c.seatHeat[side] ? 'bg-heat' : 'bg-surface-3'" /></span>
        </button>
        <span class="flex items-center">
          <button type="button" class="press grid h-11 w-9 place-items-center text-[22px] font-light text-ink-2" :aria-label="`Baisser la température ${side === 'L' ? 'conducteur' : 'passager'}`" @click="vehicle.nudgeTemp(side, -0.5)">−</button>
          <button type="button" class="press tnum w-[60px] text-center text-[20px] font-semibold" :class="!c.on && 'text-ink-3'" aria-label="Climatisation" @click="ui.open('climate')">{{ c.on ? fmt(c.temp[side]) : 'OFF' }}</button>
          <button type="button" class="press grid h-11 w-9 place-items-center text-[22px] font-light text-heat" :aria-label="`Augmenter la température ${side === 'L' ? 'conducteur' : 'passager'}`" @click="vehicle.nudgeTemp(side, 0.5)">+</button>
        </span>
      </div>
    </template>
    <div class="order-2 mx-auto flex items-center gap-1">
      <button type="button" class="press grid h-11 w-14 place-items-center rounded-xl" :class="ui.screen === 'home' ? 'bg-accent text-on-accent' : 'text-ink'" aria-label="Accueil" @click="ui.open('home')"><Icon name="home" size="22" /></button>
      <button v-for="id in appShortcuts" :key="id" type="button" class="press grid h-11 w-14 place-items-center rounded-xl" :class="ui.screen === id ? 'text-accent' : 'text-ink'" :aria-label="app(id).label" @click="ui.open(id)"><Icon :name="app(id).icon" size="22" /></button>
      <button type="button" class="press grid h-11 w-14 place-items-center rounded-xl" :class="ui.screen === 'apps' ? 'text-accent' : 'text-ink'" aria-label="Apps" @click="ui.open('apps')"><Icon name="apps-grid" size="22" /></button>
    </div>
  </nav>
</template>
