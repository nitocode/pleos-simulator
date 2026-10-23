<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { mmss } from '@/core/format'
import { RADIO, TRACKS } from '@/core/vehicle/data'
import { useVehicleStore } from '@/core/vehicle/store'

/** Radio / Médias : choix de la source, lecture en cours, stations ou titres. */
const vehicle = useVehicleStore()
const radio = computed(() => vehicle.media.source === 'radio')
const colors = computed(() => (radio.value ? ['#2f5d9e', '#132a4d'] : vehicle.currentTrack.colors))
const ratio = computed(() => (radio.value ? 0 : vehicle.media.position / vehicle.currentTrack.duration))
function source(s: 'radio' | 'bluetooth') {
  vehicle.media.source = s
  vehicle.media.playing = true
}
</script>

<template>
  <div class="flex h-full gap-6 p-6">
    <div class="flex w-[42%] flex-none flex-col items-center justify-center gap-4 text-center">
      <span class="grid aspect-square w-[min(220px,80%)] place-items-center rounded-3xl text-white shadow-pop" :style="{ background: `linear-gradient(140deg, ${colors[0]}, ${colors[1]})` }"><Icon :name="radio ? 'radio' : 'music'" size="72" /></span>
      <div class="min-w-0">
        <h3 class="truncate text-[24px] font-bold">{{ radio ? vehicle.currentStation.name : vehicle.currentTrack.title }}</h3>
        <p class="truncate text-ink-2">{{ radio ? `FM ${vehicle.currentStation.freq} · ${vehicle.currentStation.show}` : vehicle.currentTrack.artist }}</p>
      </div>
      <div v-if="!radio" class="flex w-full items-center gap-2 text-[12px] text-ink-2"><span class="tnum">{{ mmss(vehicle.media.position) }}</span><span class="h-1 flex-1 overflow-hidden rounded-full bg-surface-3"><span class="block h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear" :style="{ width: `${ratio * 100}%` }" /></span><span class="tnum">{{ mmss(vehicle.currentTrack.duration) }}</span></div>
      <div class="flex items-center gap-8">
        <button type="button" class="press grid size-12 place-items-center rounded-full" aria-label="Précédent" @click="vehicle.step(-1)"><Icon name="prev" size="28" /></button>
        <button type="button" class="press grid size-16 place-items-center rounded-full bg-accent text-on-accent" aria-label="Lecture ou pause" @click="vehicle.togglePlay()"><Icon :name="vehicle.media.playing ? 'pause' : 'play'" size="30" /></button>
        <button type="button" class="press grid size-12 place-items-center rounded-full" aria-label="Suivant" @click="vehicle.step(1)"><Icon name="next" size="28" /></button>
      </div>
    </div>
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="mb-3 flex gap-2">
        <button v-for="[s, label] in ([['radio', 'Radio'], ['bluetooth', 'Bluetooth']] as const)" :key="s" type="button" class="press h-10 rounded-full px-4 text-[14px] font-semibold" :class="vehicle.media.source === s ? 'bg-accent text-on-accent' : 'bg-surface-2 text-ink-2'" @click="source(s)">{{ label }}</button>
      </div>
      <ul class="thin-scrollbar min-h-0 flex-1 overflow-auto">
        <template v-if="radio">
          <li v-for="(s, i) in RADIO" :key="s.name"><button type="button" class="press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left" :class="i === vehicle.media.station && 'bg-surface-2'" @click="vehicle.playStation(i)"><Icon name="radio" size="18" class="text-ink-2" /><b class="flex-1">{{ s.name }}</b><span class="tnum text-ink-2">{{ s.freq }}</span></button></li>
        </template>
        <template v-else>
          <li v-for="(t, i) in TRACKS" :key="t.title"><button type="button" class="press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left" :class="i === vehicle.media.track && 'bg-surface-2'" @click="vehicle.playTrack(i)"><span class="size-9 flex-none rounded-lg" :style="{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }" /><span class="min-w-0 flex-1"><b class="block truncate">{{ t.title }}</b><small class="text-ink-2">{{ t.artist }}</small></span><span class="tnum text-[13px] text-ink-2">{{ mmss(t.duration) }}</span></button></li>
        </template>
      </ul>
    </div>
  </div>
</template>
