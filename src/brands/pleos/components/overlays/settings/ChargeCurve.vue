<script setup lang="ts">
import { computed } from 'vue'
import { chargeKw } from '@/core/vehicle/simulation'
import { clock, fmt1 } from '@/core/format'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore } from '../../../store/pleos'

/**
 * Courbe de charge : puissance acceptée par la batterie selon l'état de charge, à la température et à la
 * puissance de borne actuelles. Le tracé plein est le relevé de la séance, le point la position courante.
 */
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const W = 560
const H = 190
const PAD = { l: 38, r: 12, t: 12, b: 26 }
const ac = computed(() => vehicle.plug === 'ac')
const yMax = computed(() => (ac.value ? 12 : 120))
const x = (soc: number) => PAD.l + (soc / 100) * (W - PAD.l - PAD.r)
const y = (kw: number) => PAD.t + (1 - Math.min(kw, yMax.value) / yMax.value) * (H - PAD.t - PAD.b)

const ctx = computed(() => ({ batteryTemp: vehicle.batteryTemp, chargerKw: vehicle.chargerKw }))
const curve = computed(() => {
  const pts: string[] = []
  for (let soc = 0; soc <= 100; soc += 1) pts.push(`${x(soc).toFixed(1)},${y(chargeKw(soc, ac.value ? 'ac' : 'dc', vehicle.charge, ctx.value)).toFixed(1)}`)
  return pts.join(' ')
})
const trace = computed(() => {
  const s = vehicle.session
  if (!s.active || s.points.length < 2) return ''
  return [{ soc: s.startSoc, kw: s.points[0]!.kw }, ...s.points].map((p) => `${x(p.soc).toFixed(1)},${y(p.kw).toFixed(1)}`).join(' ')
})
const info = computed(() => vehicle.chargeInfo)
const limit = computed(() => (ac.value ? vehicle.charge.acLimit : vehicle.charge.dcLimit))
const yTicks = computed(() => (ac.value ? [0, 4, 8, 12] : [0, 40, 80, 120]))
const mmss = (sec: number) => `${Math.floor(sec / 3600)} h ${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')} min`
const end = computed(() => clock(new Date(Date.now() + info.value.minutesLeft * 60000), pleos.prefs.clock === '24 heures'))
const stats = computed(() => [
  { label: 'Puissance', value: info.value.charging ? `${fmt1(info.value.kw)} kW` : '0 kW' },
  { label: 'Énergie reçue', value: `${fmt1(vehicle.session.kwh)} kWh` },
  { label: 'Durée de la séance', value: mmss(vehicle.session.seconds) },
  { label: 'Temps restant', value: info.value.charging ? `${info.value.minutesLeft} min · ${end.value}` : '—' },
  { label: 'Température batterie', value: `${Math.round(vehicle.batteryTemp)} °C` },
  { label: ac.value ? 'Courant CA' : 'Borne', value: ac.value ? vehicle.charge.acCurrent : `${vehicle.chargerKw} kW` },
])
</script>

<template>
  <section class="mt-3 rounded-2xl bg-surface-2 p-4" aria-label="Courbe de charge">
    <h3 class="mb-2 text-[13px] font-bold tracking-wider text-ink-2 uppercase">Courbe de charge {{ ac ? 'CA' : 'CC' }}</h3>
    <svg :viewBox="`0 0 ${W} ${H}`" class="h-auto w-full" role="img" :aria-label="`Puissance de charge selon l’état de charge, ${info.charging ? fmt1(info.kw) + ' kW actuellement' : 'à l’arrêt'}`">
      <g class="text-ink-3" stroke="currentColor" stroke-opacity="0.25">
        <line v-for="t in yTicks" :key="t" :x1="PAD.l" :x2="W - PAD.r" :y1="y(t)" :y2="y(t)" />
      </g>
      <g class="fill-ink-2 text-[11px]">
        <text v-for="t in yTicks" :key="t" :x="PAD.l - 6" :y="y(t) + 4" text-anchor="end">{{ t }}</text>
        <text v-for="t in [0, 20, 40, 60, 80, 100]" :key="t" :x="x(t)" :y="H - 8" text-anchor="middle">{{ t }} %</text>
        <text :x="PAD.l" :y="PAD.t - 2" text-anchor="start">kW</text>
      </g>
      <line :x1="x(limit)" :x2="x(limit)" :y1="PAD.t" :y2="H - PAD.b" stroke="var(--ui-warn)" stroke-dasharray="4 4" />
      <polyline :points="curve" fill="none" stroke="var(--ui-ink-3)" stroke-width="2" stroke-dasharray="5 4" />
      <polyline v-if="trace" :points="trace" fill="none" stroke="var(--ui-ok)" stroke-width="3" stroke-linejoin="round" />
      <circle :cx="x(vehicle.battery)" :cy="y(info.charging ? info.kw : 0)" r="6" fill="var(--ui-accent)" stroke="var(--ui-surface)" stroke-width="2" />
    </svg>
    <p class="mb-3 text-[12.5px] text-ink-2">Pointillé : capacité de la batterie à {{ Math.round(vehicle.batteryTemp) }} °C{{ ac ? '' : `, borne ${vehicle.chargerKw} kW` }}. Trait orange : limite de charge.</p>
    <dl class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
      <div v-for="s in stats" :key="s.label" class="rounded-xl bg-surface px-3 py-2">
        <dt class="text-[12px] text-ink-2">{{ s.label }}</dt>
        <dd class="tnum text-[16px] font-semibold">{{ s.value }}</dd>
      </div>
    </dl>
  </section>
</template>
