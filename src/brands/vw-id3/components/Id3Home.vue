<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { distance } from '@/core/format'
import { useVehicleStore } from '@/core/vehicle/store'
import MebMap from '../../meb/components/MebMap.vue'
import { useId3Base } from '../store'

/**
 * Accueil : carte à gauche, widgets à droite (médias, état de la batterie). Disposition déduite de l'ID.7, qui partage
 * la même génération d'infodivertissement (non vue sur une photo de l'ID.3 : voir docs/models/vw-id3.md).
 */
const vehicle = useVehicleStore()
const ui = useId3Base()
const radio = computed(() => vehicle.media.source === 'radio')
</script>

<template>
  <div class="grid h-full grid-cols-[1fr_330px] gap-3 p-3">
    <div class="relative overflow-hidden rounded-2xl">
      <MebMap @preheat="ui.notify('Préconditionnement de la batterie démarré pour la recharge rapide', 'thermometer')" />
    </div>
    <div class="flex min-h-0 flex-col gap-3">
      <button type="button" class="press flex flex-1 flex-col justify-between rounded-2xl bg-surface p-4 text-left shadow-card" @click="ui.open('media')">
        <span class="flex items-center gap-2 text-[13px] font-semibold text-ink-2"><Icon :name="radio ? 'radio' : 'music'" size="16" />{{ radio ? 'Radio' : 'Bluetooth' }}</span>
        <span class="min-w-0">
          <b class="block truncate text-[19px]">{{ radio ? vehicle.currentStation.name : vehicle.currentTrack.title }}</b>
          <small class="block truncate text-ink-2">{{ radio ? `FM ${vehicle.currentStation.freq}` : vehicle.currentTrack.artist }}</small>
        </span>
        <span class="flex items-center gap-5" @click.stop>
          <button type="button" class="press grid size-10 place-items-center rounded-full" aria-label="Précédent" @click="vehicle.step(-1)"><Icon name="prev" size="22" /></button>
          <button type="button" class="press grid size-12 place-items-center rounded-full bg-accent text-on-accent" aria-label="Lecture ou pause" @click="vehicle.togglePlay()"><Icon :name="vehicle.media.playing ? 'pause' : 'play'" size="22" /></button>
          <button type="button" class="press grid size-10 place-items-center rounded-full" aria-label="Suivant" @click="vehicle.step(1)"><Icon name="next" size="22" /></button>
        </span>
      </button>
      <button type="button" class="press flex flex-1 flex-col justify-between rounded-2xl bg-surface p-4 text-left shadow-card" @click="ui.open('charge')">
        <span class="flex items-center gap-2 text-[13px] font-semibold text-ink-2"><Icon name="battery-charging" size="16" />Batterie</span>
        <span class="flex items-end gap-3"><b class="tnum text-[40px] leading-none font-light">{{ Math.round(vehicle.battery) }}<small class="text-[18px] text-ink-2"> %</small></b><span class="pb-1 text-ink-2">{{ distance(vehicle.range) }}</span></span>
        <span class="h-2 overflow-hidden rounded-full bg-surface-3"><span class="block h-full rounded-full transition-[width] duration-700" :class="vehicle.battery < 20 ? 'bg-crit' : 'bg-ok'" :style="{ width: `${vehicle.battery}%` }" /></span>
        <small class="font-semibold" :class="vehicle.chargeInfo.charging ? 'text-ok' : 'text-ink-2'">{{ vehicle.chargeInfo.label }}</small>
      </button>
    </div>
  </div>
</template>
