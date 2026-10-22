<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import type { TempUnit } from '@/core/format'
import { usePleosStore } from '../../store/pleos'
import TempValue from '../ui/TempValue.vue'

/** Éléments système au-dessus de tout : appel entrant, OSD, toast, installation, mode animaux. */
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const pet = computed(() => vehicle.features.petMode && vehicle.gear === 'P' && !vehicle.moving)
</script>

<template>
  <!-- véhicule éteint : écran noir ; l'état de la charge reste visible, le bouton redémarre -->
  <Transition name="fade">
    <div v-if="!vehicle.ready" class="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black text-white">
      <span class="text-[15px] font-semibold tracking-[0.12em] uppercase opacity-60">Véhicule éteint</span>
      <b class="tnum text-[64px] leading-none font-extralight">{{ Math.round(vehicle.battery) }}<small class="text-[22px] opacity-60"> %</small></b>
      <span v-if="vehicle.chargeInfo.charging" class="flex items-center gap-2 text-ok"><Icon name="bolt" size="18" />{{ vehicle.chargeInfo.label }}</span>
      <span v-else-if="vehicle.plug !== 'none'" class="text-[15px] opacity-70">{{ vehicle.chargeInfo.label }}</span>
      <button type="button" class="press mt-3 flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-black" @click="vehicle.setReady(true)"><Icon name="power" size="20" />Démarrer</button>
    </div>
  </Transition>

  <Transition name="drop">
    <div v-if="vehicle.call?.status === 'incoming'" class="absolute top-[64px] left-[calc(var(--drive-w)+24px)] z-40 flex w-[420px] items-center gap-3 rounded-[22px] border border-line bg-surface p-3 shadow-pop">
      <span class="grid size-12 place-items-center rounded-full bg-surface-3 text-[18px] font-bold">{{ vehicle.call.name[0] }}</span>
      <span class="min-w-0 flex-1"><b class="block truncate">{{ vehicle.call.name }}</b><small class="text-ink-2">Appel entrant</small></span>
      <button type="button" class="press grid size-12 place-items-center rounded-full bg-crit text-white" aria-label="Refuser" @click="vehicle.hangUp()"><Icon name="phone-off" size="22" /></button>
      <button type="button" class="press grid size-12 place-items-center rounded-full bg-ok text-white" aria-label="Répondre" @click="vehicle.answer(); pleos.launch('phone')"><Icon name="phone" size="22" /></button>
    </div>
  </Transition>

  <!-- OSD : retour des commandes au volant, affiché dans la zone de contrôle pendant 2 s -->
  <Transition name="toast">
    <div v-if="pleos.osd" :key="pleos.osd.id" class="absolute bottom-[calc(var(--gnb-h)+18px)] left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-[20px] bg-surface px-5 py-3.5 shadow-pop">
      <Icon :name="pleos.osd.icon" size="24" />
      <span class="text-[15px] font-semibold">{{ pleos.osd.label }}</span>
      <span class="h-2 w-[200px] overflow-hidden rounded-full bg-surface-3"><span class="block h-full rounded-full bg-accent transition-[width] duration-150" :style="{ width: `${(pleos.osd.value / pleos.osd.max) * 100}%` }" /></span>
      <b class="tnum w-7 text-right">{{ pleos.osd.value }}</b>
    </div>
  </Transition>

  <Transition name="toast">
    <div v-if="pleos.toast && !pleos.osd" :key="pleos.toast.id" class="absolute bottom-[calc(var(--gnb-h)+18px)] left-[calc(var(--drive-w)+(100%-var(--drive-w))/2)] z-40 flex max-w-[640px] -translate-x-1/2 items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-[15px] font-semibold text-surface shadow-pop">
      <Icon :name="pleos.toast.icon" size="20" />{{ pleos.toast.text }}
    </div>
  </Transition>

  <Transition name="fade">
    <div v-if="pleos.update.progress >= 0" class="absolute inset-0 z-50 grid place-items-center bg-scrim backdrop-blur-sm">
      <div class="w-[480px] rounded-[24px] bg-surface p-6 shadow-pop">
        <h3 class="text-[20px] font-bold">Installation de Pleos Connect 1.3.0</h3>
        <p class="mt-1 mb-4 text-ink-2">Ne démarrez pas le véhicule pendant l’installation.</p>
        <div class="h-2 overflow-hidden rounded-full bg-surface-3"><div class="h-full rounded-full bg-accent transition-[width] duration-150" :style="{ width: `${pleos.update.progress}%` }" /></div>
        <p class="tnum mt-2 text-right text-[13px] text-ink-2">{{ pleos.update.progress }} %</p>
      </div>
    </div>
  </Transition>

  <Transition name="fade">
    <button v-if="pet" type="button" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#0e1b2c] text-white" @click="vehicle.setFeature('petMode', false)">
      <span class="text-[15px] font-semibold tracking-[0.12em] uppercase opacity-70">Mode animaux domestiques</span>
      <b class="text-[130px] leading-none font-extralight"><TempValue :value="vehicle.climate.temp.L" :unit="pleos.prefs.tempUnit as TempUnit" /></b>
      <span class="max-w-[30ch] text-center text-[22px]">Mon conducteur revient bientôt. La climatisation reste active.</span>
      <span class="mt-6 text-[13px] opacity-60">Touchez l’écran pour désactiver</span>
    </button>
  </Transition>
</template>
