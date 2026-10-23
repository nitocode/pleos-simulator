<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import MebMap from '../../meb/components/MebMap.vue'
import MebMedia from '../../meb/components/MebMedia.vue'
import MebPhone from '../../meb/components/MebPhone.vue'
import { useId3Base } from '../store'
import Id3TopBar from './Id3TopBar.vue'
import Id3ClimateBar from './Id3ClimateBar.vue'
import Id3Home from './Id3Home.vue'
import Id3Apps from './Id3Apps.vue'
import Id3Climate from './Id3Climate.vue'
import Id3Charge from './Id3Charge.vue'
import Id3Ida from './Id3Ida.vue'
import Id3Pages from './Id3Pages.vue'

/**
 * Écran central 12,9″ de l'ID.3 (photos officielles) : barre supérieure (menu, favoris, température, heure), contenu,
 * barre de climatisation toujours visible en bas. Messages et appel entrant s'affichent par-dessus.
 */
defineProps<{ width: number; height: number }>()
const vehicle = useVehicleStore()
const ui = useId3Base()
const TITLES: Partial<Record<typeof ui.screen, string>> = { nav: 'Navigation', media: 'Radio/Médias', phone: 'Téléphone', climate: 'Climatisation', charge: 'Recharge', ida: 'IDA' }
const title = computed(() => TITLES[ui.screen])
const brightness = computed(() => 0.55 + (ui.prefs.brightness / 100) * 0.45)
</script>

<template>
  <div class="vw-id3 relative overflow-hidden rounded-[22px] bg-bg text-ink shadow-[0_0_0_12px_#050608,0_24px_48px_rgb(0_0_0/0.6)] select-none" :class="{ night: ui.night }" :style="{ width: `${width}px`, height: `${height}px`, filter: `brightness(${brightness})` }">
    <div class="grid h-full" style="grid-template-rows: 64px minmax(0, 1fr) 72px">
      <Id3TopBar class="border-b border-line" />
      <main class="relative min-h-0">
        <Transition name="fade" mode="out-in">
          <div :key="ui.screen" class="absolute inset-0 flex flex-col">
            <header v-if="title" class="flex h-12 flex-none items-center gap-2 px-4">
              <button type="button" class="press grid size-10 place-items-center rounded-full text-ink-2" aria-label="Retour" @click="ui.back()"><Icon name="arrow-left" size="20" /></button>
              <h2 class="text-[18px] font-bold">{{ title }}</h2>
            </header>
            <div class="relative min-h-0 flex-1">
              <Id3Home v-if="ui.screen === 'home'" />
              <Id3Apps v-else-if="ui.screen === 'apps'" />
              <div v-else-if="ui.screen === 'nav'" class="absolute inset-3 overflow-hidden rounded-2xl"><MebMap @preheat="ui.notify('Préconditionnement de la batterie démarré pour la recharge rapide', 'thermometer')" /></div>
              <MebMedia v-else-if="ui.screen === 'media'" />
              <MebPhone v-else-if="ui.screen === 'phone'" />
              <Id3Climate v-else-if="ui.screen === 'climate'" />
              <Id3Charge v-else-if="ui.screen === 'charge'" />
              <Id3Ida v-else-if="ui.screen === 'ida'" />
              <Id3Pages v-else :page="ui.screen" />
            </div>
          </div>
        </Transition>

        <!-- IDA à l'écoute, depuis n'importe quel écran -->
        <Transition name="drop">
          <div v-if="ui.voice && ui.screen !== 'ida'" class="absolute top-3 left-1/2 z-20 flex w-[520px] -translate-x-1/2 items-center gap-3 rounded-2xl bg-surface p-3.5 shadow-pop">
            <span class="grid size-10 place-items-center rounded-full bg-accent text-on-accent"><Icon name="audio-lines" size="20" /></span>
            <span class="min-w-0 flex-1 text-[15px]">{{ ui.voice.reply ?? (ui.voice.heard ? `« ${ui.voice.heard} »` : 'IDA vous écoute…') }}</span>
            <button type="button" class="press text-[13px] font-semibold text-accent" @click="ui.open('ida')">Ouvrir IDA</button>
          </div>
        </Transition>

        <!-- appel entrant -->
        <Transition name="drop">
          <div v-if="vehicle.call?.status === 'incoming'" class="absolute top-3 right-3 z-30 flex w-[400px] items-center gap-3 rounded-2xl bg-surface p-3 shadow-pop">
            <span class="grid size-12 place-items-center rounded-full bg-surface-3 text-[18px] font-bold">{{ vehicle.call.name[0] }}</span>
            <span class="min-w-0 flex-1"><b class="block truncate">{{ vehicle.call.name }}</b><small class="text-ink-2">Appel entrant</small></span>
            <button type="button" class="press grid size-11 place-items-center rounded-full bg-crit text-white" aria-label="Refuser" @click="vehicle.hangUp()"><Icon name="phone-off" size="20" /></button>
            <button type="button" class="press grid size-11 place-items-center rounded-full bg-ok text-white" aria-label="Répondre" @click="vehicle.answer(); ui.open('phone')"><Icon name="phone" size="20" /></button>
          </div>
        </Transition>
      </main>
      <Id3ClimateBar class="border-t border-line bg-surface/60" />
    </div>

    <Transition name="toast">
      <div v-if="ui.toast" :key="ui.toast.id" class="absolute bottom-[86px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-[15px] font-semibold text-bg shadow-pop"><Icon :name="ui.toast.icon" size="19" />{{ ui.toast.text }}</div>
    </Transition>

    <!-- véhicule éteint : l'écran s'éteint, la charge continue -->
    <Transition name="fade">
      <div v-if="!vehicle.ready" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black text-white">
        <span class="text-[15px] font-semibold tracking-[0.12em] uppercase opacity-60">Véhicule éteint</span>
        <b class="tnum text-[64px] leading-none font-extralight">{{ Math.round(vehicle.battery) }}<small class="text-[22px] opacity-60"> %</small></b>
        <span v-if="vehicle.chargeInfo.charging" class="flex items-center gap-2 text-[#3fd27f]"><Icon name="bolt" size="18" />{{ vehicle.chargeInfo.label }}</span>
        <button type="button" class="press mt-3 flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-black" @click="vehicle.setReady(true)"><Icon name="power" size="20" />Démarrer</button>
      </div>
    </Transition>
  </div>
</template>
