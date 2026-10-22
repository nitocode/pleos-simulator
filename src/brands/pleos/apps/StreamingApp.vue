<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { mmss } from '@/core/format'
import { TRACKS } from '@/core/vehicle/data'
import { useVehicleStore } from '@/core/vehicle/store'
import { MARKET_APPS, type MarketAppId } from '../catalog'

/** Spotify et Deezer : lecteur et liste de titres, branchés sur le média Bluetooth du véhicule. */
const props = defineProps<{ id: MarketAppId }>()
const vehicle = useVehicleStore()
const app = computed(() => MARKET_APPS.find((a) => a.id === props.id)!)
const track = computed(() => vehicle.currentTrack)
const active = computed(() => vehicle.media.source === 'bluetooth')

function toggle() {
  if (!active.value) vehicle.playTrack(vehicle.media.track)
  else vehicle.togglePlay()
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex items-center gap-4 px-6 pt-2 pb-4">
      <span class="size-20 flex-none rounded-2xl shadow-card" :style="{ background: `linear-gradient(140deg, ${track.colors[0]}, ${track.colors[1]})` }" />
      <div class="min-w-0 flex-1">
        <p class="text-[12px] font-semibold tracking-wider uppercase" :style="{ color: app.color }">{{ app.name }}</p>
        <h3 class="truncate text-[22px] font-bold">{{ track.title }}</h3>
        <p class="truncate text-ink-2">{{ track.artist }}</p>
      </div>
      <button type="button" class="press grid size-14 flex-none place-items-center rounded-full text-white" :style="{ background: app.color }" aria-label="Lecture ou pause" @click="toggle">
        <Icon :name="active && vehicle.media.playing ? 'pause' : 'play'" size="28" />
      </button>
    </div>
    <p class="px-6 pb-2 text-[13px] font-semibold text-ink-2">Mix du jour</p>
    <ul class="thin-scrollbar min-h-0 flex-1 overflow-auto px-3 pb-3">
      <li v-for="(t, i) in TRACKS" :key="t.title">
        <button type="button" class="press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left" :class="i === vehicle.media.track && active && 'bg-surface-2'" @click="vehicle.playTrack(i)">
          <span class="size-11 flex-none rounded-lg" :style="{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }" />
          <span class="min-w-0 flex-1"><b class="block truncate text-[15px]">{{ t.title }}</b><small class="text-ink-2">{{ t.artist }}</small></span>
          <span class="tnum text-[13px] text-ink-2">{{ mmss(t.duration) }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
