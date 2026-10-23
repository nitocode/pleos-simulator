<script setup lang="ts">
import { computed } from 'vue'
import { chargeKw } from '@/core/vehicle/simulation'
import { useVehicleStore } from '@/core/vehicle/store'

/** Courbe de charge du modèle (puissance acceptée selon l'état de charge, température et borne actuelles) et relevé de la séance. */
const vehicle = useVehicleStore()
const W = 520
const H = 140
const ac = computed(() => vehicle.plug === 'ac')
const yMax = computed(() => (ac.value ? 12 : Math.max(...vehicle.spec.dcCurve.map(([, kw]) => kw)) * 1.1))
const x = (soc: number) => 30 + (soc / 100) * (W - 42)
const y = (kw: number) => 8 + (1 - Math.min(kw, yMax.value) / yMax.value) * (H - 30)
const ctx = computed(() => ({ batteryTemp: vehicle.batteryTemp, chargerKw: vehicle.chargerKw, spec: vehicle.spec }))
const curve = computed(() => Array.from({ length: 101 }, (_, s) => `${x(s).toFixed(1)},${y(chargeKw(s, ac.value ? 'ac' : 'dc', vehicle.charge, ctx.value)).toFixed(1)}`).join(' '))
const trace = computed(() => (vehicle.session.active && vehicle.session.points.length > 1 ? vehicle.session.points.map((p) => `${x(p.soc).toFixed(1)},${y(p.kw).toFixed(1)}`).join(' ') : ''))
const limit = computed(() => (ac.value ? vehicle.charge.acLimit : vehicle.charge.dcLimit))
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="h-auto w-full" role="img" aria-label="Courbe de charge">
    <line v-for="t in [0, 0.5, 1]" :key="t" x1="30" :x2="W - 12" :y1="y(yMax * t)" :y2="y(yMax * t)" stroke="var(--ui-line)" />
    <g class="fill-ink-2 text-[10px]">
      <text v-for="s in [0, 20, 40, 60, 80, 100]" :key="s" :x="x(s)" :y="H - 6" text-anchor="middle">{{ s }} %</text>
      <text x="26" :y="y(yMax) + 4" text-anchor="end">{{ Math.round(yMax) }}</text>
      <text x="26" :y="y(0) + 4" text-anchor="end">0</text>
    </g>
    <line :x1="x(limit)" :x2="x(limit)" y1="8" :y2="H - 22" stroke="var(--ui-warn)" stroke-dasharray="4 4" />
    <polyline :points="curve" fill="none" stroke="var(--ui-ink-3)" stroke-width="2" stroke-dasharray="5 4" />
    <polyline v-if="trace" :points="trace" fill="none" stroke="var(--ui-accent)" stroke-width="3" stroke-linejoin="round" />
    <circle :cx="x(vehicle.battery)" :cy="y(vehicle.chargeInfo.charging ? vehicle.chargeInfo.kw : 0)" r="5.5" fill="var(--ui-accent)" stroke="var(--ui-surface)" stroke-width="2" />
  </svg>
</template>
