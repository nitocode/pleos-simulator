<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import { APPS, useTeslaStore, type TeslaApp } from '../store/tesla'
import StatusBar from './StatusBar.vue'
import VehiclePanel from './VehiclePanel.vue'
import MapPane from './MapPane.vue'
import BottomBar from './BottomBar.vue'
import ClimatePanel from './ClimatePanel.vue'
import ControlsPanel from './ControlsPanel.vue'
import Launcher from './Launcher.vue'
import TSlider from './ui/TSlider.vue'
import MediaApp from '../apps/MediaApp.vue'
import PhoneApp from '../apps/PhoneApp.vue'
import ChargeApp from '../apps/ChargeApp.vue'
import EnergyApp from '../apps/EnergyApp.vue'
import CameraApp from '../apps/CameraApp.vue'
import WeatherApp from '../apps/WeatherApp.vue'

/**
 * Écran tactile du Model 3 (manuel, « Écran tactile ») : barre d'état, zone d'état du véhicule à gauche, carte à droite
 * avec l'écran Contrôles ou une application par-dessus, barre inférieure (climatisation, Mes applis, volume).
 */
defineProps<{ width: number; height: number }>()
const vehicle = useVehicleStore()
const tesla = useTeslaStore()

const COMPONENTS: Record<TeslaApp, unknown> = { media: MediaApp, phone: PhoneApp, charge: ChargeApp, energy: EnergyApp, camera: CameraApp, weather: WeatherApp }
const brightness = computed(() => 0.55 + (tesla.prefs.brightness / 100) * 0.45)
const reversing = computed(() => vehicle.gear === 'R' && vehicle.ready)
const incoming = computed(() => vehicle.call?.status === 'incoming')
</script>

<template>
  <div
    class="tesla relative overflow-hidden rounded-[18px] bg-bg text-ink shadow-[0_0_0_10px_#050608,0_24px_48px_rgb(0_0_0/0.6)] select-none"
    :class="{ night: tesla.night }"
    :style="{ width: `${width}px`, height: `${height}px`, filter: `brightness(${brightness})` }"
  >
    <div class="grid h-full" style="grid-template-columns: 372px minmax(0, 1fr); grid-template-rows: 48px minmax(0, 1fr) 84px">
      <div class="col-span-2"><StatusBar /></div>
      <VehiclePanel />
      <div class="relative min-h-0 pr-4 pb-2"><div class="relative size-full">
        <MapPane />

        <!-- Contrôles -->
        <Transition name="pop">
          <div v-if="tesla.panel === 'controls'" class="absolute top-0 bottom-0 left-0 z-10"><ControlsPanel /></div>
        </Transition>

        <!-- application sur le haut de la carte -->
        <Transition name="pop">
          <section v-if="tesla.app && !reversing" class="absolute top-0 right-0 bottom-0 z-10 flex w-[580px] flex-col overflow-hidden rounded-[26px] bg-surface shadow-pop" :aria-label="APPS[tesla.app].name">
            <header class="flex h-14 flex-none items-center gap-3 px-4">
              <span class="grid size-8 place-items-center rounded-xl text-white" :style="{ background: APPS[tesla.app].color }"><Icon :name="APPS[tesla.app].icon" size="18" /></span>
              <h2 class="flex-1 text-[17px] font-bold">{{ APPS[tesla.app].name }}</h2>
              <button type="button" class="press grid size-10 place-items-center rounded-full text-ink-2" aria-label="Fermer l’application" @click="tesla.closeApp()"><Icon name="chevron-down" size="22" /></button>
            </header>
            <div class="min-h-0 flex-1"><component :is="COMPONENTS[tesla.app]" /></div>
          </section>
        </Transition>

        <!-- marche arrière : caméra en grand -->
        <Transition name="fade">
          <div v-if="reversing" class="absolute inset-0 z-20 overflow-hidden rounded-[22px]"><CameraApp /></div>
        </Transition>

        <!-- appel entrant : message contextuel -->
        <Transition name="drop">
          <div v-if="incoming && vehicle.call" class="absolute top-4 left-1/2 z-30 flex w-[440px] -translate-x-1/2 items-center gap-3 rounded-[22px] bg-surface p-3 shadow-pop">
            <span class="grid size-12 place-items-center rounded-full bg-surface-3 text-[18px] font-bold">{{ vehicle.call.name[0] }}</span>
            <span class="min-w-0 flex-1"><b class="block truncate">{{ vehicle.call.name }}</b><small class="text-ink-2">Appel entrant</small></span>
            <button type="button" class="press grid size-12 place-items-center rounded-full bg-crit text-white" aria-label="Refuser" @click="vehicle.hangUp()"><Icon name="phone-off" size="22" /></button>
            <button type="button" class="press grid size-12 place-items-center rounded-full bg-ok text-white" aria-label="Répondre" @click="vehicle.answer(); tesla.launch('phone')"><Icon name="phone" size="22" /></button>
          </div>
        </Transition>
      </div></div>
      <div class="col-span-2 border-t border-line bg-surface"><BottomBar /></div>
    </div>

    <!-- fenêtres de la barre inférieure -->
    <Transition name="sheet"><div v-if="tesla.panel === 'climate'" class="absolute bottom-[96px] left-4 z-30"><ClimatePanel /></div></Transition>
    <Transition name="sheet"><div v-if="tesla.panel === 'launcher'" class="absolute bottom-[96px] left-1/2 z-30 -translate-x-1/2"><Launcher /></div></Transition>
    <Transition name="sheet">
      <section v-if="tesla.panel === 'volume'" class="absolute right-4 bottom-[96px] z-30 flex w-[340px] items-center gap-3 rounded-[22px] bg-surface p-4 shadow-pop" aria-label="Volume">
        <button type="button" class="press grid size-10 place-items-center rounded-full bg-surface-2" aria-label="Couper le son" @click="vehicle.toggleMute()"><Icon :name="vehicle.media.muted ? 'volume-mute' : 'volume'" size="20" /></button>
        <TSlider :model-value="vehicle.media.volume" :min="0" :max="40" label="Volume" @update:model-value="vehicle.setVolume($event)" />
        <b class="tnum w-7 text-right">{{ vehicle.media.volume }}</b>
      </section>
    </Transition>
    <div v-if="tesla.panel === 'climate' || tesla.panel === 'launcher' || tesla.panel === 'volume'" class="absolute inset-x-0 top-12 bottom-[84px] z-20" @click="tesla.closePanel()" />

    <!-- message contextuel -->
    <Transition name="toast">
      <div v-if="tesla.toast" :key="tesla.toast.id" class="absolute bottom-[100px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-[15px] font-semibold text-bg shadow-pop"><Icon :name="tesla.toast.icon" size="19" />{{ tesla.toast.text }}</div>
    </Transition>

    <!-- redémarrage de l'écran / véhicule éteint -->
    <Transition name="fade">
      <div v-if="tesla.rebooting" class="absolute inset-0 z-[70] grid place-items-center bg-black text-white"><div class="flex flex-col items-center gap-4"><span class="size-12 animate-spin rounded-full border-4 border-white/20 border-t-white" /><span class="text-[15px] opacity-70">Redémarrage de l’écran tactile…</span></div></div>
    </Transition>
    <Transition name="fade">
      <div v-if="!vehicle.ready && !tesla.rebooting" class="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black text-white">
        <span class="text-[15px] font-semibold tracking-[0.12em] uppercase opacity-60">Véhicule éteint</span>
        <b class="tnum text-[64px] leading-none font-extralight">{{ Math.round(vehicle.battery) }}<small class="text-[22px] opacity-60"> %</small></b>
        <span v-if="vehicle.chargeInfo.charging" class="flex items-center gap-2 text-ok"><Icon name="bolt" size="18" />{{ vehicle.chargeInfo.label }}</span>
        <span v-else-if="vehicle.plug !== 'none'" class="text-[15px] opacity-70">{{ vehicle.chargeInfo.label }}</span>
        <button type="button" class="press mt-3 flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-black" @click="vehicle.setReady(true)"><Icon name="power" size="20" />Démarrer</button>
      </div>
    </Transition>
  </div>
</template>
