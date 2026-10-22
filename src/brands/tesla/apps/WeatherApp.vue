<script setup lang="ts">
import { useVehicleStore } from '@/core/vehicle/store'

/** Météo : conditions locales et à destination (manuel, icônes de la barre d'état : risque de pluie, humidité, UV). */
const vehicle = useVehicleStore()
const DETAILS = [
  ['Risque de pluie', '20 %'],
  ['Humidité', '62 %'],
  ['Indice UV', '3'],
  ['Qualité de l’air', 'Bonne'],
] as const
</script>

<template>
  <div class="thin-scrollbar h-full overflow-auto p-5">
    <div class="flex items-center gap-4"><span class="text-[56px] leading-none">⛅</span><div><b class="tnum block text-[44px] leading-none font-light">{{ vehicle.outsideTemp }}°</b><span class="text-ink-2">{{ vehicle.nav.destination ? `À destination : ${vehicle.nav.destination.name}` : 'Position actuelle' }}</span></div></div>
    <dl class="mt-6 grid grid-cols-2 gap-2.5"><div v-for="[k, v] in DETAILS" :key="k" class="rounded-xl bg-surface-2 px-3.5 py-2.5"><dt class="text-[12px] text-ink-2">{{ k }}</dt><dd class="text-[17px] font-semibold">{{ v }}</dd></div></dl>
    <p class="mt-4 text-[12.5px] text-ink-2">Données de démonstration (la météo détaillée nécessite la connexion Premium).</p>
  </div>
</template>
