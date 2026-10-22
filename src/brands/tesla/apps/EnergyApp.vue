<script setup lang="ts">
import { computed } from 'vue'
import { distance, fmt1 } from '@/core/format'
import { useVehicleStore } from '@/core/vehicle/store'

/** Énergie : consommation moyenne, autonomie et répartition estimée de la consommation d'énergie. */
const vehicle = useVehicleStore()
const parts = computed(() => {
  const clim = vehicle.climate.on ? (vehicle.climate.ac ? 14 : 9) : 2
  const seats = vehicle.climate.seatHeat.L + vehicle.climate.seatHeat.R + (vehicle.climate.wheelHeat ? 2 : 0)
  return [
    { label: 'Conduite', value: 100 - clim - seats - 6, color: 'var(--ui-accent)' },
    { label: 'Climatisation', value: clim, color: 'var(--ui-cool)' },
    { label: 'Sièges et volant chauffants', value: seats, color: 'var(--ui-heat)' },
    { label: 'Équipements du véhicule', value: 6, color: 'var(--ui-warn)' },
  ]
})
const bars = [60, 66, 58, 72, 64, 52, 69, 61, 55, 63]
</script>

<template>
  <div class="thin-scrollbar h-full overflow-auto p-5">
    <div class="flex flex-wrap gap-8">
      <div><p class="text-[12px] font-bold tracking-wider text-ink-2 uppercase">Consommation moyenne</p><p class="tnum text-[40px] leading-tight font-light">{{ fmt1(vehicle.consumption * 10) }} <small class="text-[16px] text-ink-2">Wh/km</small></p></div>
      <div><p class="text-[12px] font-bold tracking-wider text-ink-2 uppercase">Autonomie estimée</p><p class="tnum text-[40px] leading-tight font-light">{{ distance(vehicle.range) }}</p></div>
    </div>
    <h3 class="mt-6 mb-2 text-[12px] font-bold tracking-wider text-ink-2 uppercase">Consommation d’énergie</h3>
    <div class="flex h-4 overflow-hidden rounded-full bg-surface-2"><div v-for="p in parts" :key="p.label" class="h-full transition-[width] duration-700 ease-ui" :style="{ width: `${p.value}%`, background: p.color }" /></div>
    <ul class="mt-3 grid grid-cols-2 gap-2 text-[14px]"><li v-for="p in parts" :key="p.label" class="flex items-center gap-2"><span class="size-2.5 rounded-full" :style="{ background: p.color }" />{{ p.label }}<b class="tnum ml-auto">{{ p.value }} %</b></li></ul>
    <h3 class="mt-6 mb-2 text-[12px] font-bold tracking-wider text-ink-2 uppercase">Derniers trajets (km)</h3>
    <div class="flex h-[110px] items-end gap-2 border-b border-line"><span v-for="(b, i) in bars" :key="i" class="flex-1 rounded-t-md bg-accent/70" :style="{ height: `${b}%` }" /></div>
  </div>
</template>
