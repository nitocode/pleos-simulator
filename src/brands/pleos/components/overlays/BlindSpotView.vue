<script setup lang="ts">
import { inject, reactive, ref, type Ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'

/** Affichage de l'angle mort au clignotant, déplaçable (maintenir puis faire glisser). */
const vehicle = useVehicleStore()
const scale = inject<Ref<number>>('screenScale', ref(1))
const pos = reactive({ x: 0, y: 0 })
let start: { x: number; y: number; px: number; py: number } | null = null

function down(e: PointerEvent) {
  start = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function move(e: PointerEvent) {
  if (!start) return
  pos.x = start.px + (e.clientX - start.x) / scale.value
  pos.y = start.py + (e.clientY - start.y) / scale.value
}
function up() {
  start = null
}
</script>

<template>
  <div class="absolute top-16 left-1/2 z-30 w-[360px] overflow-hidden rounded-[18px] border-2 border-white/40 bg-black shadow-pop" :style="{ transform: `translate(calc(-50% + ${pos.x}px), ${pos.y}px)` }">
    <div class="flex cursor-grab touch-none items-center justify-between bg-[#0b0f15] px-3 py-1.5 text-[12px] font-semibold text-white active:cursor-grabbing" @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up">
      <span>Angle mort · {{ vehicle.turn === 'L' ? 'gauche' : 'droite' }}</span>
      <Icon name="grip" size="16" />
    </div>
    <svg viewBox="0 0 360 200" class="block" aria-hidden="true">
      <rect width="360" height="200" fill="#4b5a6a" />
      <rect y="86" width="360" height="114" fill="#2f3237" />
      <path :d="vehicle.turn === 'L' ? 'M360 200L132 86' : 'M0 200L228 86'" stroke="#eee" stroke-width="4" stroke-dasharray="16 12" />
      <g v-if="vehicle.speed > 30" class="animate-pulse">
        <rect :x="vehicle.turn === 'L' ? 60 : 230" y="110" width="74" height="44" rx="11" fill="#9aa5b4" />
      </g>
      <path :d="vehicle.turn === 'L' ? 'M326 200L360 130V200Z' : 'M34 200L0 130V200Z'" fill="#111" />
    </svg>
  </div>
</template>
