<script setup lang="ts">
import { computed } from 'vue'
import { distance, fmt1 } from '@/core/format'
import { useVehicleStore } from '@/core/vehicle/store'

/** Rapport énergie (VE) : répartition de la consommation, graphique d'autonomie, astuces. */
const vehicle = useVehicleStore()
const parts = computed(() => {
  const clim = vehicle.climate.on ? (vehicle.climate.ac ? 14 : 9) : 2
  const seats = (vehicle.climate.seatHeat.L + vehicle.climate.seatHeat.R + (vehicle.climate.wheelHeat ? 2 : 0)) * 1
  const drive = 100 - clim - seats - 6 - 4
  return [
    { label: 'Conduite', value: drive, color: 'var(--ui-accent)' },
    { label: 'Climatisation', value: clim, color: 'var(--ui-cool)' },
    { label: 'Sièges et volant chauffants', value: seats, color: 'var(--ui-heat)' },
    { label: 'Équipements électroniques', value: 6, color: '#9a7bff' },
    { label: 'Gestion de la batterie', value: 4, color: 'var(--ui-warn)' },
  ]
})
const predicted = [60, 58, 52, 47, 40, 34, 28]
const actual = [60, 59, 54, 50, 44, 39, 34]
</script>

<template>
  <div class="thin-scrollbar h-full overflow-auto p-6">
    <div class="flex flex-wrap items-end gap-8">
      <div>
        <p class="text-[13px] font-bold tracking-wider text-ink-2 uppercase">Efficacité moyenne</p>
        <p class="tnum text-[40px] leading-tight font-light">{{ fmt1(100 / vehicle.consumption) }} <small class="text-[16px] text-ink-2">km/kWh</small></p>
      </div>
      <div>
        <p class="text-[13px] font-bold tracking-wider text-ink-2 uppercase">Autonomie</p>
        <p class="tnum text-[40px] leading-tight font-light">{{ distance(vehicle.range) }}</p>
      </div>
    </div>
    <h3 class="mt-6 mb-3 text-[13px] font-bold tracking-wider text-ink-2 uppercase">Consommation électrique</h3>
    <div class="flex h-4 overflow-hidden rounded-full bg-surface-2">
      <div v-for="p in parts" :key="p.label" class="h-full transition-[width] duration-700 ease-ui" :style="{ width: `${p.value}%`, background: p.color }" />
    </div>
    <ul class="mt-3 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2 text-[14px]">
      <li v-for="p in parts" :key="p.label" class="flex items-center gap-2">
        <span class="size-2.5 rounded-full" :style="{ background: p.color }" />{{ p.label }}<b class="tnum ml-auto">{{ p.value }} %</b>
      </li>
    </ul>
    <h3 class="mt-7 mb-3 text-[13px] font-bold tracking-wider text-ink-2 uppercase">Graph. autonomie</h3>
    <div class="flex h-[140px] items-end gap-2.5 border-b border-line">
      <div v-for="(v, i) in predicted" :key="i" class="relative flex-1 rounded-t-md bg-surface-3" :style="{ height: `${v * 2.2}px` }">
        <span class="absolute inset-x-[22%] bottom-0 rounded-t transition-[height] duration-700" :style="{ height: `${actual[i]! * 2.2}px`, background: actual[i]! >= v ? 'var(--ui-ok)' : 'var(--ui-warn)' }" />
      </div>
    </div>
    <p class="mt-2 text-[13px] text-ink-2">Gris : autonomie estimée au départ. Vert : meilleur rendement que prévu. Orange : moins bon que prévu.</p>
    <h3 class="mt-7 mb-2 text-[13px] font-bold tracking-wider text-ink-2 uppercase">Astuces conso. élec.</h3>
    <p class="max-w-[60ch] text-[15px] leading-relaxed text-ink-2">Préchauffez l’habitacle pendant la charge et privilégiez le chauffage des sièges et du volant plutôt que l’air chaud : ils consomment beaucoup moins.</p>
  </div>
</template>
