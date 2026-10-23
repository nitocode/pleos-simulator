<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import type { Side } from '@/core/vehicle/types'
import { useId3Base } from '../store'

/**
 * Barre de climatisation toujours visible (photo officielle) : température conducteur, CLIMA, AUTO, siège et volant
 * chauffants, bouton Accueil au centre, dégivrage, siège passager, A/C, air recyclé, température passager.
 */
const vehicle = useVehicleStore()
const ui = useId3Base()
const c = vehicle.climate
const fmt = (v: number) => v.toFixed(1)
const heatTone = (side: Side) => (c.seatHeat[side] ? 'text-heat' : 'text-ink-2')
</script>

<template>
  <nav class="flex h-full items-center gap-1 px-3" aria-label="Barre de climatisation">
    <button type="button" class="press flex h-12 items-baseline gap-0.5 rounded-xl px-3" :class="!c.on && 'opacity-50'" aria-label="Température conducteur" @click="ui.open('climate')"><b class="tnum text-[26px] font-semibold">{{ fmt(c.temp.L).split('.')[0] }}</b><span class="tnum text-[16px] font-semibold">.{{ fmt(c.temp.L).split('.')[1] }}</span></button>
    <button type="button" class="press h-12 rounded-xl px-2.5 text-[12px] font-bold tracking-wider" :class="ui.screen === 'climate' ? 'text-accent' : 'text-ink-2'" @click="ui.screen === 'climate' ? ui.back() : ui.open('climate')">CLIMA</button>
    <button type="button" class="press h-12 rounded-xl px-2.5 text-[12px] font-bold tracking-wider" :class="c.auto && c.on ? 'text-warn' : 'text-ink-3'" :aria-pressed="c.auto" @click="vehicle.toggleClimate('auto')">AUTO</button>
    <button type="button" class="press relative grid size-12 place-items-center rounded-xl" aria-label="Siège chauffant conducteur" @click="vehicle.cycleSeat('L', 'heat')"><Icon name="seat-heat" size="22" :class="heatTone('L')" /><span class="absolute bottom-1.5 flex gap-0.5"><i v-for="n in 3" :key="n" class="h-[3px] w-[5px] rounded-full" :class="n <= c.seatHeat.L ? 'bg-heat' : 'bg-surface-3'" /></span></button>
    <button type="button" class="press grid size-12 place-items-center rounded-xl" aria-label="Volant chauffant" :aria-pressed="c.wheelHeat" @click="vehicle.toggleClimate('wheelHeat')"><Icon name="wheel-heat" size="22" :class="c.wheelHeat ? 'text-heat' : 'text-ink-2'" /></button>

    <button type="button" class="press mx-auto grid size-12 place-items-center rounded-xl" :class="ui.screen === 'home' ? 'text-accent' : 'text-ink-2'" aria-label="Accueil" @click="ui.open('home')">
      <span class="block size-[22px] rounded-[5px] border-2 border-current" />
    </button>

    <button type="button" class="press grid size-12 place-items-center rounded-xl" aria-label="Dégivrage du pare-brise" :aria-pressed="c.defrostFront" @click="vehicle.toggleClimate('defrostFront')"><Icon name="defrost-front" size="22" :class="c.defrostFront ? 'text-warn' : 'text-ink-2'" /></button>
    <button type="button" class="press relative grid size-12 place-items-center rounded-xl" aria-label="Siège chauffant passager" @click="vehicle.cycleSeat('R', 'heat')"><Icon name="seat-heat" size="22" class="-scale-x-100" :class="heatTone('R')" /><span class="absolute bottom-1.5 flex gap-0.5"><i v-for="n in 3" :key="n" class="h-[3px] w-[5px] rounded-full" :class="n <= c.seatHeat.R ? 'bg-heat' : 'bg-surface-3'" /></span></button>
    <button type="button" class="press h-12 rounded-xl px-2.5 text-[12px] font-bold tracking-wider" :class="c.ac && c.on ? 'text-warn' : 'text-ink-3'" :aria-pressed="c.ac" @click="vehicle.toggleClimate('ac')">A/C</button>
    <button type="button" class="press grid size-12 place-items-center rounded-xl" aria-label="Air recyclé" :aria-pressed="c.recirc" @click="vehicle.toggleClimate('recirc')"><Icon name="recirc" size="22" :class="c.recirc ? 'text-accent' : 'text-ink-2'" /></button>
    <button type="button" class="press flex h-12 items-baseline gap-0.5 rounded-xl px-3" :class="!c.on && 'opacity-50'" aria-label="Température passager" @click="ui.open('climate')"><b class="tnum text-[26px] font-semibold">{{ fmt(c.temp.R).split('.')[0] }}</b><span class="tnum text-[16px] font-semibold">.{{ fmt(c.temp.R).split('.')[1] }}</span></button>
  </nav>
</template>
