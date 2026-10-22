<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { mmss } from '@/core/format'
import { RADIO, TRACKS } from '@/core/vehicle/data'
import { useVehicleStore } from '@/core/vehicle/store'
import TSegmented from '../components/ui/TSegmented.vue'

/** Multimédia : source Radio ou Bluetooth (manuel, « Multimédia »), lecture en cours et liste des titres ou stations. */
const vehicle = useVehicleStore()
const radio = computed(() => vehicle.media.source === 'radio')
const source = computed({
  get: () => (radio.value ? 'Radio' : 'Bluetooth'),
  set: (v: string) => {
    vehicle.media.source = v === 'Radio' ? 'radio' : 'bluetooth'
    vehicle.media.playing = true
  },
})
const title = computed(() => (radio.value ? vehicle.currentStation.name : vehicle.currentTrack.title))
const subtitle = computed(() => (radio.value ? `FM ${vehicle.currentStation.freq} · ${vehicle.currentStation.show}` : vehicle.currentTrack.artist))
const colors = computed(() => (radio.value ? ['#e8472b', '#7a1d12'] : vehicle.currentTrack.colors))
const ratio = computed(() => (radio.value ? 0 : vehicle.media.position / vehicle.currentTrack.duration))
</script>

<template>
  <div class="flex h-full flex-col gap-4 p-5">
    <div class="flex items-center gap-5">
      <span class="grid size-[130px] flex-none place-items-center rounded-2xl text-white shadow-card" :style="{ background: `linear-gradient(140deg, ${colors[0]}, ${colors[1]})` }"><Icon :name="radio ? 'radio' : 'music'" size="52" /></span>
      <div class="min-w-0 flex-1">
        <TSegmented v-model="source" :options="['Radio', 'Bluetooth']" label="Source" />
        <h3 class="mt-3 truncate text-[24px] font-bold">{{ title }}</h3>
        <p class="truncate text-ink-2">{{ subtitle }}</p>
        <div v-if="!radio" class="mt-3 flex items-center gap-2 text-[12px] text-ink-2"><span class="tnum">{{ mmss(vehicle.media.position) }}</span><span class="h-1 flex-1 overflow-hidden rounded-full bg-surface-3"><span class="block h-full rounded-full bg-ink transition-[width] duration-1000 ease-linear" :style="{ width: `${ratio * 100}%` }" /></span><span class="tnum">{{ mmss(vehicle.currentTrack.duration) }}</span></div>
      </div>
    </div>
    <div class="flex items-center justify-center gap-8">
      <button type="button" class="press grid size-12 place-items-center rounded-full" aria-label="Précédent" @click="vehicle.step(-1)"><Icon name="prev" size="28" /></button>
      <button type="button" class="press grid size-16 place-items-center rounded-full bg-ink text-bg" aria-label="Lecture ou pause" @click="vehicle.togglePlay()"><Icon :name="vehicle.media.playing ? 'pause' : 'play'" size="30" /></button>
      <button type="button" class="press grid size-12 place-items-center rounded-full" aria-label="Suivant" @click="vehicle.step(1)"><Icon name="next" size="28" /></button>
    </div>
    <ul class="thin-scrollbar min-h-0 flex-1 overflow-auto">
      <template v-if="radio">
        <li v-for="(s, i) in RADIO" :key="s.name"><button type="button" class="press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left" :class="i === vehicle.media.station && 'bg-surface-2'" @click="vehicle.playStation(i)"><b class="flex-1">{{ s.name }}</b><span class="tnum text-ink-2">{{ s.freq }}</span><button type="button" class="press grid size-9 place-items-center" :aria-label="`Favori ${s.name}`" @click.stop="vehicle.toggleFavoriteStation(i)"><Icon :name="vehicle.media.favorites.includes(i) ? 'star-filled' : 'star'" size="18" :class="vehicle.media.favorites.includes(i) && 'text-warn'" /></button></button></li>
      </template>
      <template v-else>
        <li v-for="(t, i) in TRACKS" :key="t.title"><button type="button" class="press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left" :class="i === vehicle.media.track && 'bg-surface-2'" @click="vehicle.playTrack(i)"><span class="size-9 flex-none rounded-lg" :style="{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }" /><span class="min-w-0 flex-1"><b class="block truncate">{{ t.title }}</b><small class="text-ink-2">{{ t.artist }}</small></span><span class="tnum text-[13px] text-ink-2">{{ mmss(t.duration) }}</span></button></li>
      </template>
    </ul>
  </div>
</template>
