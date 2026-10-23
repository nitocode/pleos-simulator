<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { clock, distance, fmt1 } from '@/core/format'
import { useVehicleStore } from '@/core/vehicle/store'
import MebChargeCurve from '../../meb/components/MebChargeCurve.vue'
import { useId3Base } from '../store'

/**
 * Recharge : état de la batterie, puissance et temps restant, niveau cible, courant CA, et préconditionnement de la
 * batterie lancé à la main (communiqué 49/2024 : « manuellement depuis le menu de recharge » sans guidage actif).
 */
const vehicle = useVehicleStore()
const ui = useId3Base()
const info = computed(() => vehicle.chargeInfo)
const end = computed(() => clock(new Date(Date.now() + info.value.minutesLeft * 60000), true))
const target = computed({
  get: () => vehicle.charge.dcLimit,
  set: (v: number) => {
    vehicle.charge.dcLimit = v
    vehicle.charge.acLimit = v
  },
})
function preheat() {
  vehicle.preheatOn = !vehicle.preheatOn
  ui.notify(vehicle.preheatOn ? 'Préconditionnement de la batterie activé' : 'Préconditionnement de la batterie arrêté', 'thermometer')
}
</script>

<template>
  <div class="grid h-full grid-cols-[1fr_1.1fr] gap-4 p-5">
    <section class="flex flex-col gap-4 rounded-3xl bg-surface p-6 shadow-card">
      <div class="flex items-end gap-4">
        <b class="tnum text-[68px] leading-none font-light">{{ Math.round(vehicle.battery) }}<small class="text-[24px] text-ink-2"> %</small></b>
        <div class="pb-2"><p class="font-semibold" :class="info.charging ? 'text-ok' : 'text-ink-2'"><Icon v-if="info.charging" name="bolt" size="16" class="mr-1 inline" />{{ info.label }}</p><p class="text-ink-2">{{ distance(vehicle.range) }}</p></div>
      </div>
      <div class="relative h-4 overflow-hidden rounded-full bg-surface-3">
        <div class="h-full rounded-full bg-ok transition-[width] duration-700" :style="{ width: `${vehicle.battery}%` }" />
        <span class="absolute inset-y-0 w-1 rounded bg-ink" :style="{ left: `calc(${target}% - 2px)` }" />
      </div>
      <label class="flex items-center gap-4"><span class="w-[150px] flex-none font-semibold">Niveau de charge cible</span><input v-model.number="target" type="range" min="50" max="100" step="5" class="flex-1 accent-[var(--ui-accent)]" aria-label="Niveau de charge cible" /><b class="tnum w-14 text-right">{{ target }} %</b></label>
      <dl class="grid grid-cols-2 gap-2.5">
        <div class="rounded-xl bg-surface-2 px-3.5 py-2.5"><dt class="text-[12px] text-ink-2">Puissance</dt><dd class="tnum text-[18px] font-semibold">{{ fmt1(info.kw) }} kW</dd></div>
        <div class="rounded-xl bg-surface-2 px-3.5 py-2.5"><dt class="text-[12px] text-ink-2">Fin de charge</dt><dd class="tnum text-[18px] font-semibold">{{ info.charging ? `${info.minutesLeft} min · ${end}` : '—' }}</dd></div>
        <div class="rounded-xl bg-surface-2 px-3.5 py-2.5"><dt class="text-[12px] text-ink-2">Énergie chargée</dt><dd class="tnum text-[18px] font-semibold">{{ fmt1(vehicle.session.kwh) }} kWh</dd></div>
        <div class="rounded-xl bg-surface-2 px-3.5 py-2.5"><dt class="text-[12px] text-ink-2">Température batterie</dt><dd class="tnum text-[18px] font-semibold">{{ Math.round(vehicle.batteryTemp) }} °C</dd></div>
      </dl>
    </section>
    <section class="flex flex-col gap-4">
      <div class="rounded-3xl bg-surface p-5 shadow-card">
        <div class="flex items-center gap-3">
          <Icon name="thermometer" size="26" :class="vehicle.preheatOn ? 'text-warn' : 'text-ink-2'" />
          <span class="flex-1"><b class="block">Préconditionnement de la batterie</b><small class="text-ink-2">Chauffe la batterie pour une recharge rapide jusqu’à 175 kW. Démarre seul en route vers une borne rapide.</small></span>
          <button type="button" class="press h-11 rounded-xl px-4 text-[14px] font-semibold" :class="vehicle.preheatOn ? 'bg-warn text-white' : 'bg-accent text-on-accent'" @click="preheat">{{ vehicle.preheatOn ? 'Arrêter' : 'Démarrer' }}</button>
        </div>
      </div>
      <div class="rounded-3xl bg-surface p-5 shadow-card">
        <p class="mb-1 text-[13px] font-semibold text-ink-2">Courbe de charge {{ vehicle.plug === 'ac' ? 'CA' : 'CC' }} · batterie à {{ Math.round(vehicle.batteryTemp) }} °C</p>
        <MebChargeCurve />
      </div>
      <div class="flex items-center gap-3 rounded-3xl bg-surface p-5 shadow-card">
        <span class="flex-1 font-semibold">Courant de charge CA</span>
        <div class="flex rounded-xl bg-surface-2 p-1">
          <button v-for="o in (['Minimum', 'Réduit', 'Maximum'] as const)" :key="o" type="button" class="press rounded-lg px-3 py-1.5 text-[13.5px] font-semibold" :class="vehicle.charge.acCurrent === o ? 'bg-accent text-on-accent' : 'text-ink-2'" @click="vehicle.charge.acCurrent = o">{{ o }}</button>
        </div>
      </div>
    </section>
  </div>
</template>
