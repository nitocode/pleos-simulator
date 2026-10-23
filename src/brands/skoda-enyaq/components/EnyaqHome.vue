<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { PLACES } from '@/core/vehicle/data'
import { useVehicleStore } from '@/core/vehicle/store'
import MebMap from '../../meb/components/MebMap.vue'
import { useEnyaqBase } from '../store'

/**
 * Accueil (infographie « Redesigned map layout ») : colonne gauche avec Laura et ses suggestions, widget téléphone et
 * médias ; carte à droite. La recharge s'affiche dans la colonne quand le véhicule est branché.
 */
const vehicle = useVehicleStore()
const ui = useEnyaqBase()
const home = PLACES.find((p) => p.id === 'home')!
const radio = computed(() => vehicle.media.source === 'radio')

function goHome() {
  vehicle.navigateTo(home)
  ui.notify(`Guidage vers ${home.name}`, 'navigation')
}
</script>

<template>
  <div class="grid h-full grid-cols-[360px_1fr] gap-3 p-3">
    <div class="flex min-h-0 flex-col gap-3">
      <section class="rounded-2xl bg-surface p-4 shadow-card">
        <button type="button" class="press flex w-full items-center gap-3 text-left" @click="ui.open('laura')">
          <span class="size-4 rounded-full bg-accent shadow-[0_0_12px_var(--ui-accent)]" />
          <b class="text-[18px]">Bonjour, je suis Laura</b>
        </button>
        <button type="button" class="press mt-3 flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left" @click="goHome"><Icon name="home" size="20" class="text-ink-2" /><span><b class="block text-[14.5px]">Rentrons à la maison</b><small class="text-ink-2">Démarrer le guidage</small></span></button>
        <button type="button" class="press flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left" @click="ui.open('charge')"><Icon name="battery-charging" size="20" class="text-ink-2" /><span><b class="block text-[14.5px]">Batterie à {{ Math.round(vehicle.battery) }} %</b><small class="text-ink-2">{{ vehicle.chargeInfo.label }}</small></span></button>
      </section>
      <section class="flex flex-1 flex-col justify-between rounded-2xl bg-surface p-4 shadow-card">
        <button type="button" class="press flex items-center gap-3 text-left" @click="ui.open('phone')"><span class="grid size-11 place-items-center rounded-full bg-surface-2"><Icon name="phone" size="20" /></span><span><b class="block">Smartphone connecté</b><small class="text-ink-2">{{ vehicle.call ? vehicle.call.name : 'Aucun appel en cours' }}</small></span></button>
        <div class="mt-3 border-t border-line pt-3">
          <button type="button" class="press flex w-full min-w-0 items-center gap-3 text-left" @click="ui.open('media')">
            <span class="size-11 flex-none rounded-xl" :style="{ background: radio ? 'linear-gradient(140deg,#2f5d9e,#132a4d)' : `linear-gradient(140deg, ${vehicle.currentTrack.colors[0]}, ${vehicle.currentTrack.colors[1]})` }" />
            <span class="min-w-0"><b class="block truncate">{{ radio ? vehicle.currentStation.name : vehicle.currentTrack.title }}</b><small class="block truncate text-ink-2">{{ radio ? `FM ${vehicle.currentStation.freq}` : vehicle.currentTrack.artist }}</small></span>
          </button>
          <div class="mt-3 flex items-center justify-center gap-6">
            <button type="button" class="press grid size-10 place-items-center rounded-full" aria-label="Précédent" @click="vehicle.step(-1)"><Icon name="prev" size="22" /></button>
            <button type="button" class="press grid size-12 place-items-center rounded-full bg-accent text-on-accent" aria-label="Lecture ou pause" @click="vehicle.togglePlay()"><Icon :name="vehicle.media.playing ? 'pause' : 'play'" size="22" /></button>
            <button type="button" class="press grid size-10 place-items-center rounded-full" aria-label="Suivant" @click="vehicle.step(1)"><Icon name="next" size="22" /></button>
          </div>
        </div>
      </section>
    </div>
    <div class="relative overflow-hidden rounded-2xl">
      <MebMap @preheat="ui.notify('Préchauffage de la batterie démarré pour la recharge rapide', 'thermometer')" />
    </div>
  </div>
</template>
