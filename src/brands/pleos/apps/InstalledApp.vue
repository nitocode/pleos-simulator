<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import { MARKET_APPS, type MarketAppId } from '../catalog'
import StreamingApp from './StreamingApp.vue'
import VideoApp from './VideoApp.vue'
import PlacesApp from './PlacesApp.vue'
import WeatherApp from './WeatherApp.vue'
import BrowserApp from './BrowserApp.vue'
import ArcadeApp from './ArcadeApp.vue'

/** Écran d'une app installée depuis l'App Market : écran dédié si elle en a un, sinon écran générique. */
const props = defineProps<{ id: MarketAppId }>()
const vehicle = useVehicleStore()
const app = computed(() => MARKET_APPS.find((a) => a.id === props.id)!)
const locked = computed(() => app.value.parkedOnly && (vehicle.moving || vehicle.gear !== 'P'))
const SCREENS: Partial<Record<MarketAppId, unknown>> = {
  'm:spotify': StreamingApp,
  'm:deezer': StreamingApp,
  'm:youtube': VideoApp,
  'm:chargemap': PlacesApp,
  'm:parking': PlacesApp,
  'm:meteo': WeatherApp,
  'm:browser': BrowserApp,
  'm:arcade': ArcadeApp,
}
const screen = computed(() => SCREENS[props.id])
</script>

<template>
  <component :is="screen" v-if="screen && !locked" :id="id" />
  <div v-else class="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-ink-2">
    <template v-if="locked">
      <Icon name="lock" size="42" />
      <b class="text-[18px] text-ink">{{ app.name }} est disponible à l’arrêt</b>
      <span>Passez en P pour utiliser cette app.</span>
    </template>
    <template v-else>
      <span class="grid size-20 place-items-center rounded-[22px] text-[34px] font-bold text-white" :style="{ background: app.color }">{{ app.name[0] }}</span>
      <b class="text-[20px] text-ink">{{ app.name }}</b>
      <span class="max-w-[36ch]">{{ app.description }} Écran de démonstration de l’app installée.</span>
    </template>
  </div>
</template>
