<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { clock, distance, fmt1 } from '@/core/format'
import { CHARGERS, PLACES } from '@/core/vehicle/data'
import { chargeKw } from '@/core/vehicle/simulation'
import { useVehicleStore } from '@/core/vehicle/store'
import MebChargeCurve from '../../meb/components/MebChargeCurve.vue'
import { useEnyaqBase } from '../store'

/**
 * Recharge (infographie « Preheating function ») : sous-menu Recharge / Optimisation / Lieux / Réglages ; l'écran
 * « Optimisation de la recharge rapide » affiche la capacité de recharge rapide actuelle (selon la température de la
 * batterie) et permet de lancer ou d'arrêter le chauffage de la batterie.
 */
const vehicle = useVehicleStore()
const ui = useEnyaqBase()
const tab = ref<'Recharge' | 'Optimisation' | 'Lieux' | 'Réglages'>('Recharge')
const info = computed(() => vehicle.chargeInfo)
const end = computed(() => clock(new Date(Date.now() + info.value.minutesLeft * 60000), true))
const peak = computed(() => Math.max(...vehicle.spec.dcCurve.map(([, kw]) => kw)))
/** Ce que la batterie accepterait maintenant sur une borne rapide, à sa température actuelle. */
const capability = computed(() => Math.round(chargeKw(vehicle.battery, 'dc', vehicle.charge, { batteryTemp: vehicle.batteryTemp, chargerKw: 350, spec: vehicle.spec })))
const limit = computed({
  get: () => vehicle.charge.dcLimit,
  set: (v: number) => {
    vehicle.charge.dcLimit = v
    vehicle.charge.acLimit = v
  },
})
function heat() {
  vehicle.preheatOn = !vehicle.preheatOn
  ui.notify(vehicle.preheatOn ? 'Chauffage de la batterie démarré' : 'Chauffage de la batterie arrêté', 'thermometer')
}
function goCharger(i: number) {
  const c = CHARGERS[i]!
  vehicle.navigateTo(PLACES.find((p) => p.id === c.placeId) ?? { id: `c${i}`, name: c.name, address: c.detail, km: c.km, minutes: Math.round(c.km * 2.4 + 4), kind: 'charger' })
  if (vehicle.charge.preconditioning && c.dc) ui.notify('Préchauffage automatique de la batterie en route', 'thermometer')
  ui.open('nav')
}
const TABS = [
  ['Recharge', 'battery-charging'],
  ['Optimisation', 'thermometer'],
  ['Lieux', 'pin'],
  ['Réglages', 'settings'],
] as const
</script>

<template>
  <div class="grid h-full grid-cols-[220px_1fr]">
    <nav class="flex flex-col gap-1 border-r border-line p-3" aria-label="Recharge">
      <button v-for="[id, icon] in TABS" :key="id" type="button" class="press flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14.5px] font-semibold" :class="tab === id ? 'bg-surface-2 text-accent' : 'text-ink-2'" @click="tab = id"><Icon :name="icon" size="18" />{{ id }}</button>
    </nav>
    <section class="thin-scrollbar min-h-0 overflow-auto p-6">
      <template v-if="tab === 'Recharge'">
        <div class="flex items-end gap-4">
          <b class="tnum text-[64px] leading-none font-light">{{ Math.round(vehicle.battery) }}<small class="text-[22px] text-ink-2"> %</small></b>
          <div class="pb-2"><p class="font-semibold" :class="info.charging ? 'text-accent' : 'text-ink-2'"><Icon v-if="info.charging" name="bolt" size="16" class="mr-1 inline" />{{ info.label }}</p><p class="text-ink-2">{{ distance(vehicle.range) }}</p></div>
        </div>
        <div class="relative mt-4 h-3 overflow-hidden rounded-full bg-surface-3"><div class="h-full rounded-full bg-accent transition-[width] duration-700" :style="{ width: `${vehicle.battery}%` }" /><span class="absolute inset-y-0 w-1 rounded bg-ink" :style="{ left: `calc(${limit}% - 2px)` }" /></div>
        <label class="mt-4 flex items-center gap-4"><span class="w-[160px] flex-none font-semibold">Limite de charge</span><input v-model.number="limit" type="range" min="50" max="100" step="10" class="flex-1 accent-[var(--ui-accent)]" aria-label="Limite de charge" /><b class="tnum w-14 text-right">{{ limit }} %</b></label>
        <dl class="mt-4 grid grid-cols-3 gap-2.5">
          <div class="rounded-xl bg-surface-2 px-3.5 py-2.5"><dt class="text-[12px] text-ink-2">Puissance</dt><dd class="tnum text-[18px] font-semibold">{{ fmt1(info.kw) }} kW</dd></div>
          <div class="rounded-xl bg-surface-2 px-3.5 py-2.5"><dt class="text-[12px] text-ink-2">Fin de charge</dt><dd class="tnum text-[18px] font-semibold">{{ info.charging ? `${info.minutesLeft} min · ${end}` : '—' }}</dd></div>
          <div class="rounded-xl bg-surface-2 px-3.5 py-2.5"><dt class="text-[12px] text-ink-2">Énergie chargée</dt><dd class="tnum text-[18px] font-semibold">{{ fmt1(vehicle.session.kwh) }} kWh</dd></div>
        </dl>
        <div class="mt-4 rounded-2xl bg-surface p-4 shadow-card"><MebChargeCurve /></div>
      </template>
      <template v-else-if="tab === 'Optimisation'">
        <h2 class="text-[20px] font-bold">Optimisation de la recharge rapide</h2>
        <div class="mt-5 rounded-2xl bg-surface p-5 shadow-card">
          <div class="flex items-center justify-between"><span class="text-ink-2">Capacité de recharge rapide actuelle</span><b class="tnum text-[30px]">{{ capability }} kW</b></div>
          <div class="mt-3 h-4 overflow-hidden rounded-full bg-surface-3"><div class="h-full rounded-full bg-accent transition-[width] duration-700" :style="{ width: `${(capability / peak) * 100}%` }" /></div>
          <p class="mt-2 text-[13px] text-ink-2">Batterie à {{ Math.round(vehicle.batteryTemp) }} °C · jusqu’à {{ peak }} kW quand elle est à température optimale.</p>
          <button type="button" class="press mt-4 h-12 rounded-xl px-5 text-[15px] font-semibold" :class="vehicle.preheatOn ? 'bg-surface-2 text-ink' : 'bg-accent text-on-accent'" :disabled="vehicle.plug !== 'none'" @click="heat">{{ vehicle.preheatOn ? 'Arrêter le chauffage de la batterie' : 'Chauffer la batterie' }}</button>
        </div>
        <div class="mt-4 flex items-center gap-4 rounded-2xl bg-surface p-5 shadow-card">
          <span class="flex-1"><b class="block">Préchauffage automatique</b><small class="text-ink-2">Démarre en route vers une borne rapide, selon les données de navigation</small></span>
          <button type="button" role="switch" :aria-checked="vehicle.charge.preconditioning" class="press relative h-8 w-14 rounded-full" :class="vehicle.charge.preconditioning ? 'bg-accent' : 'bg-surface-3'" @click="vehicle.charge.preconditioning = !vehicle.charge.preconditioning"><span class="absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform" :class="vehicle.charge.preconditioning && 'translate-x-6'" /></button>
        </div>
      </template>
      <template v-else-if="tab === 'Lieux'">
        <h2 class="mb-3 text-[20px] font-bold">Lieux de recharge</h2>
        <ul><li v-for="(c, i) in CHARGERS" :key="c.name"><button type="button" class="press flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left shadow-card [&:not(:first-child)]:mt-2" @click="goCharger(i)"><Icon name="charge-station" size="24" class="text-accent" /><span class="flex-1"><b class="block">{{ c.name }}</b><small class="text-ink-2">{{ c.detail }} · {{ c.km }} km</small></span><Icon name="navigation" size="20" /></button></li></ul>
      </template>
      <template v-else>
        <h2 class="mb-3 text-[20px] font-bold">Réglages de recharge</h2>
        <div class="rounded-2xl bg-surface p-5 shadow-card">
          <div class="flex items-center gap-3"><span class="flex-1 font-semibold">Courant de charge CA</span><div class="flex rounded-xl bg-surface-2 p-1"><button v-for="o in (['Minimum', 'Réduit', 'Maximum'] as const)" :key="o" type="button" class="press rounded-lg px-3 py-1.5 text-[13.5px] font-semibold" :class="vehicle.charge.acCurrent === o ? 'bg-accent text-on-accent' : 'text-ink-2'" @click="vehicle.charge.acCurrent = o">{{ o }}</button></div></div>
          <div class="mt-4 flex items-center gap-3"><span class="flex-1 font-semibold">Heure de départ</span><div class="flex rounded-xl bg-surface-2 p-1"><button v-for="o in ['06:30', '07:30', '08:30']" :key="o" type="button" class="press rounded-lg px-3 py-1.5 text-[13.5px] font-semibold" :class="vehicle.charge.departure === o ? 'bg-accent text-on-accent' : 'text-ink-2'" @click="vehicle.charge.departure = o">{{ o }}</button></div></div>
        </div>
      </template>
    </section>
  </div>
</template>
