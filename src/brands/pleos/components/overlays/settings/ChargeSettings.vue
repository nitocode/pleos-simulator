<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { clock, distance } from '@/core/format'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore } from '../../../store/pleos'
import SettingItemRow from '../SettingItemRow.vue'
import PSlider from '../../ui/PSlider.vue'
import PButton from '../../ui/PButton.vue'
import EnergyApp from '../../../apps/EnergyApp.vue'
import ChargeCurve from './ChargeCurve.vue'

/** Paramètres de Charger : état de la batterie, limites CC/CA et options du manuel. */
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const status = computed(() => vehicle.chargeInfo)
const end = computed(() => clock(new Date(Date.now() + status.value.minutesLeft * 60000), pleos.prefs.clock === '24 heures'))
</script>

<template>
  <div v-if="pleos.settingsSub === 'energy'">
    <h2 class="mb-2 flex items-center gap-2 text-[21px] font-bold">
      <button type="button" class="press grid size-10 place-items-center rounded-xl" aria-label="Retour" @click="pleos.settingsSub = null"><Icon name="arrow-left" size="22" /></button>
      Rapport énergie
    </h2>
    <div class="-mx-6"><EnergyApp /></div>
  </div>
  <div v-else>
    <h2 class="mb-4 text-[21px] font-bold">Charger</h2>
    <div class="flex flex-wrap items-center gap-6 rounded-2xl bg-surface-2 p-5">
      <div class="tnum text-[52px] leading-none font-extralight">{{ Math.round(vehicle.battery) }}<small class="text-[20px] text-ink-2"> %</small></div>
      <div class="min-w-[220px] flex-1">
        <div class="relative h-3.5 overflow-hidden rounded-full bg-surface-3">
          <div class="h-full rounded-full bg-ok transition-[width] duration-700 ease-ui" :style="{ width: `${vehicle.battery}%` }" />
          <span class="absolute inset-y-0 w-0.5 bg-ink/50" :style="{ left: `${vehicle.plug === 'dc' ? vehicle.charge.dcLimit : vehicle.charge.acLimit}%` }" />
        </div>
        <div class="mt-2 flex flex-wrap justify-between gap-2 text-[14px] text-ink-2">
          <span>{{ distance(vehicle.range) }} d’autonomie</span>
          <span class="flex items-center gap-1.5 font-semibold" :class="status.charging && 'text-ok'">
            <Icon v-if="status.charging" name="bolt" size="16" />{{ status.label }}<template v-if="status.charging"> · fin à {{ end }}</template>
          </span>
        </div>
      </div>
    </div>
    <ChargeCurve />
    <div class="flex items-center gap-4 border-b border-line py-3">
      <span class="w-[150px] flex-none text-[15.5px] font-semibold">Chargeur CC</span>
      <PSlider v-model="vehicle.charge.dcLimit" :min="50" :max="100" :step="5" unit=" %" icon="bolt" label="Limite de charge CC" />
    </div>
    <div class="flex items-center gap-4 border-b border-line py-3">
      <span class="w-[150px] flex-none text-[15.5px] font-semibold">Chargeur CA</span>
      <PSlider v-model="vehicle.charge.acLimit" :min="50" :max="100" :step="5" unit=" %" icon="plug" label="Limite de charge CA" />
    </div>
    <div class="flex items-center justify-between border-b border-line py-3.5">
      <span><b class="block text-[15.5px] font-semibold">Rapport énergie</b><small class="text-[13px] text-ink-2">Consommation, autonomie, batterie</small></span>
      <PButton small icon="chevron-right" @click="pleos.settingsSub = 'energy'">Ouvrir</PButton>
    </div>
    <SettingItemRow :item="{ type: 'switch', key: 'c:preconditioning', label: 'Conditionnement de la batterie', hint: 'Prépare la batterie avant une recharge rapide' }" />
    <SettingItemRow :item="{ type: 'segment', key: 'c:acCurrent', label: 'Paramètres charge CA › Courant de charge CA', options: ['Maximum', 'Réduit', 'Minimum'] }" />
    <SettingItemRow :item="{ type: 'switch', key: 'c:scheduled', label: 'Paramètres charge CA › Charge programmée', hint: 'Charge pendant les heures creuses' }" />
    <SettingItemRow :item="{ type: 'segment', key: 'c:departure', label: 'Heure du prochain départ', options: ['06:30', '07:30', '08:30'] }" />
    <SettingItemRow :item="{ type: 'segment', key: 'c:cableLock', label: 'Verrouillage du câble de charge', options: ['Toujours', 'Pendant la charge', 'Désactivé'] }" />
    <SettingItemRow :item="{ type: 'switch', key: 'c:plugAndCharge', label: 'Plug & Charge' }" />
    <SettingItemRow :item="{ type: 'slider', key: 'c:minLevel', label: 'Niveau minimum', min: 10, max: 80, step: 5, unit: ' %', icon: 'battery' }" />
    <SettingItemRow :item="{ type: 'switch', key: 'c:voiceMessage', label: 'Message vocal relatif au niveau de la charge' }" />
  </div>
</template>
