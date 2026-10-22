<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { clock, distance, fmt1 } from '@/core/format'
import { chargeKw } from '@/core/vehicle/simulation'
import { useVehicleStore } from '@/core/vehicle/store'
import TSlider from '../components/ui/TSlider.vue'

/**
 * Recharge : niveau de batterie, puissance en direct, énergie ajoutée et temps restant, limite de charge, et courbe de
 * charge du modèle (puissance acceptée selon l'état de charge, à la température et à la borne actuelles).
 */
const vehicle = useVehicleStore()
const info = computed(() => vehicle.chargeInfo)
const ac = computed(() => vehicle.plug === 'ac')
const W = 520
const H = 150
const yMax = computed(() => (ac.value ? 12 : vehicle.spec.dcCurve.reduce((m, [, kw]) => Math.max(m, kw), 0) * 1.08))
const x = (soc: number) => 28 + (soc / 100) * (W - 40)
const y = (kw: number) => 8 + (1 - Math.min(kw, yMax.value) / yMax.value) * (H - 30)
const ctx = computed(() => ({ batteryTemp: vehicle.batteryTemp, chargerKw: vehicle.chargerKw, spec: vehicle.spec }))
const curve = computed(() => Array.from({ length: 101 }, (_, s) => `${x(s).toFixed(1)},${y(chargeKw(s, ac.value ? 'ac' : 'dc', vehicle.charge, ctx.value)).toFixed(1)}`).join(' '))
const trace = computed(() => (vehicle.session.active && vehicle.session.points.length > 1 ? vehicle.session.points.map((p) => `${x(p.soc).toFixed(1)},${y(p.kw).toFixed(1)}`).join(' ') : ''))
const end = computed(() => clock(new Date(Date.now() + info.value.minutesLeft * 60000), true))
const limit = computed({
  get: () => (ac.value ? vehicle.charge.acLimit : vehicle.charge.dcLimit),
  set: (v: number) => {
    vehicle.charge.acLimit = v
    vehicle.charge.dcLimit = v
  },
})
const stats = computed(() => [
  { label: 'Puissance', value: `${fmt1(info.value.kw)} kW` },
  { label: 'Énergie ajoutée', value: `${fmt1(vehicle.session.kwh)} kWh` },
  { label: 'Temps restant', value: info.value.charging ? `${info.value.minutesLeft} min · ${end.value}` : '—' },
  { label: 'Batterie', value: `${Math.round(vehicle.batteryTemp)} °C` },
])
</script>

<template>
  <div class="thin-scrollbar h-full overflow-auto p-5">
    <div class="flex items-end gap-5">
      <b class="tnum text-[64px] leading-none font-light">{{ Math.round(vehicle.battery) }}<small class="text-[22px] text-ink-2"> %</small></b>
      <div class="pb-1.5">
        <p class="text-[15px] font-semibold" :class="info.charging ? 'text-ok' : 'text-ink-2'"><Icon v-if="info.charging" name="bolt" size="16" class="mr-1 inline" />{{ info.label }}</p>
        <p class="text-ink-2">{{ distance(vehicle.range) }} d’autonomie</p>
      </div>
    </div>
    <div class="relative mt-4 h-3 overflow-hidden rounded-full bg-surface-3">
      <div class="h-full rounded-full bg-ok transition-[width] duration-700 ease-ui" :style="{ width: `${vehicle.battery}%` }" />
      <span class="absolute inset-y-0 w-0.5 bg-ink" :style="{ left: `${limit}%` }" />
    </div>
    <div class="mt-4 flex items-center gap-4">
      <span class="w-[120px] flex-none text-[14px] font-semibold">Limite de charge</span>
      <TSlider v-model="limit" :min="50" :max="100" :step="5" label="Limite de charge" />
      <b class="tnum w-16 text-right whitespace-nowrap">{{ limit }} %</b>
    </div>
    <dl class="mt-4 grid grid-cols-2 gap-2.5">
      <div v-for="s in stats" :key="s.label" class="rounded-xl bg-surface-2 px-3.5 py-2.5"><dt class="text-[12px] text-ink-2">{{ s.label }}</dt><dd class="tnum text-[17px] font-semibold">{{ s.value }}</dd></div>
    </dl>
    <h3 class="mt-5 mb-1 text-[12px] font-bold tracking-wider text-ink-2 uppercase">Courbe de charge {{ ac ? 'CA' : 'CC' }}</h3>
    <svg :viewBox="`0 0 ${W} ${H}`" class="h-auto w-full" role="img" aria-label="Puissance de charge selon l’état de charge">
      <line v-for="t in [0, 0.5, 1]" :key="t" :x1="28" :x2="W - 12" :y1="y(yMax * t)" :y2="y(yMax * t)" stroke="var(--ui-line)" />
      <g class="fill-ink-2 text-[10px]"><text v-for="s in [0, 20, 40, 60, 80, 100]" :key="s" :x="x(s)" :y="H - 6" text-anchor="middle">{{ s }} %</text></g>
      <line :x1="x(limit)" :x2="x(limit)" y1="8" :y2="H - 22" stroke="var(--ui-warn)" stroke-dasharray="4 4" />
      <polyline :points="curve" fill="none" stroke="var(--ui-ink-3)" stroke-width="2" stroke-dasharray="5 4" />
      <polyline v-if="trace" :points="trace" fill="none" stroke="var(--ui-ok)" stroke-width="3" stroke-linejoin="round" />
      <circle :cx="x(vehicle.battery)" :cy="y(info.charging ? info.kw : 0)" r="5.5" fill="var(--ui-accent)" stroke="var(--ui-surface)" stroke-width="2" />
    </svg>
    <p class="mt-1 text-[12px] text-ink-2">Pointillé : capacité de la batterie à {{ Math.round(vehicle.batteryTemp) }} °C{{ ac ? '' : `, borne ${vehicle.chargerKw} kW` }}. La vitesse de charge baisse quand la batterie est froide ou presque pleine.</p>
  </div>
</template>
