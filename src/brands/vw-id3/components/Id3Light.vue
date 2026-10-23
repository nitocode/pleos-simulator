<script setup lang="ts">
import { computed } from 'vue'
import { guidance } from '@/core/vehicle/simulation'
import { useVehicleStore } from '@/core/vehicle/store'
import { useId3Base } from '../store'

/**
 * ID. Light (fiche officielle) : bandeau lumineux sous le pare-brise qui accompagne la commande vocale, les appels entrants,
 * les avertissements et la navigation. Couleurs et animations : reconstitution.
 */
const vehicle = useVehicleStore()
const ui = useId3Base()
const step = computed(() => guidance(vehicle.nav))
const state = computed(() => {
  if (!vehicle.ready) return { cls: 'opacity-0', color: '#000' }
  if (vehicle.overLimit || vehicle.battery < 10) return { cls: 'animate-blink', color: '#ff3b3b' }
  if (vehicle.call?.status === 'incoming') return { cls: 'idl-pulse', color: '#3fd27f' }
  if (ui.voice) return { cls: 'idl-pulse', color: '#2f9bff' }
  if (vehicle.chargeInfo.charging) return { cls: '', color: '#3fd27f', fill: vehicle.battery }
  if (step.value && step.value.distanceKm < 0.3 && step.value.maneuver !== 'straight') return { cls: step.value.maneuver === 'turn-left' ? 'idl-left' : 'idl-right', color: '#2f9bff' }
  return { cls: '', color: '#d8e4f2', dim: true }
})
</script>

<template>
  <div class="relative h-2.5 w-full max-w-[720px] overflow-hidden rounded-full bg-[#0b0d10]" role="img" aria-label="ID. Light">
    <div
      class="absolute inset-y-0 left-0 rounded-full transition-[width,background-color,opacity] duration-500"
      :class="state.cls"
      :style="{ width: state.fill !== undefined ? `${state.fill}%` : '100%', background: state.color, opacity: state.dim ? 0.18 : 1, boxShadow: `0 0 14px ${state.color}` }"
    />
  </div>
</template>

<style scoped>
.idl-pulse {
  animation: idl-pulse 1.2s ease-in-out infinite;
}
@keyframes idl-pulse {
  50% { opacity: 0.35; }
}
.idl-left,
.idl-right {
  background: linear-gradient(90deg, transparent, #2f9bff, transparent) !important;
  background-size: 40% 100% !important;
  background-repeat: no-repeat !important;
  animation: idl-sweep 1.1s linear infinite;
}
.idl-left {
  animation-direction: reverse;
}
@keyframes idl-sweep {
  from { background-position: -40% 0; }
  to { background-position: 140% 0; }
}
</style>
