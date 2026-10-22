<script setup lang="ts">
import { useVehicleStore } from '@/core/vehicle/store'

/** Météo Route : conditions actuelles et prévisions sur le trajet. */
const vehicle = useVehicleStore()
const STEPS = [
  { place: 'Paris', delta: 0, sky: 'Ensoleillé', icon: '☀️' },
  { place: 'Fontainebleau', delta: -2, sky: 'Nuageux', icon: '⛅' },
  { place: 'Auxerre', delta: -3, sky: 'Averses', icon: '🌧️' },
  { place: 'Lyon', delta: -4, sky: 'Pluie légère', icon: '🌦️' },
]
</script>

<template>
  <div class="thin-scrollbar h-full overflow-auto p-5">
    <div class="flex items-center gap-4">
      <span class="text-[56px] leading-none">⛅</span>
      <div><b class="tnum block text-[44px] leading-none">{{ vehicle.outsideTemp }}°</b><span class="text-ink-2">Extérieur · partiellement nuageux</span></div>
    </div>
    <p class="mt-6 mb-2 text-[13px] font-semibold text-ink-2">Sur votre itinéraire</p>
    <ul>
      <li v-for="s in STEPS" :key="s.place" class="flex items-center gap-3 border-b border-line py-3 last:border-0">
        <span class="text-[28px]">{{ s.icon }}</span>
        <span class="flex-1"><b class="block text-[15px]">{{ s.place }}</b><small class="text-ink-2">{{ s.sky }}</small></span>
        <b class="tnum text-[17px]">{{ vehicle.outsideTemp + s.delta }}°</b>
      </li>
    </ul>
  </div>
</template>
