<script setup lang="ts">
import { useVehicleStore } from '@/core/vehicle/store'

/** Caméra de recul (manuel, « Caméra(s) arrière ») : image simulée avec les lignes de guidage ; s'ouvre en marche arrière. */
const vehicle = useVehicleStore()
</script>

<template>
  <div class="relative h-full overflow-hidden bg-[#2b3038]">
    <div class="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-[#59636f] to-[#3b424b]" />
    <div class="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-b from-[#2a2d33] to-[#16181c]" />
    <svg viewBox="0 0 400 300" preserveAspectRatio="none" class="absolute inset-0 size-full" aria-hidden="true">
      <path d="M90 300L140 120" stroke="#3ed07e" stroke-width="5" fill="none" />
      <path d="M310 300L260 120" stroke="#3ed07e" stroke-width="5" fill="none" />
      <path d="M115 215L285 215" stroke="#ffb547" stroke-width="4" /><path d="M128 170L272 170" stroke="#ff4d63" stroke-width="4" />
      <rect x="170" y="20" width="60" height="26" rx="4" fill="#d8dce2" opacity="0.8" />
    </svg>
    <span class="absolute top-3 left-3 rounded-full bg-black/55 px-3 py-1 text-[13px] font-semibold text-white">Caméra de recul · rapport {{ vehicle.gear }}</span>
  </div>
</template>
