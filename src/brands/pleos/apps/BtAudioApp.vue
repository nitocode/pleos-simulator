<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { mmss } from '@/core/format'
import { TRACKS } from '@/core/vehicle/data'
import { useVehicleStore } from '@/core/vehicle/store'

/** Bluetooth Audio : pochette centrée, titre, progression, commandes ; liste des titres en bas. */
const vehicle = useVehicleStore()
const active = computed(() => vehicle.media.source === 'bluetooth')
const track = computed(() => vehicle.currentTrack)
const ratio = computed(() => (active.value ? vehicle.media.position / track.value.duration : 0))

function toggle() {
  if (!active.value) {
    vehicle.media.source = 'bluetooth'
    vehicle.media.playing = true
  } else vehicle.togglePlay()
}
function seek(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  vehicle.media.position = Math.round(((e.clientX - r.left) / r.width) * track.value.duration)
}
</script>

<template>
  <div
    class="relative flex h-full flex-col overflow-hidden"
    :style="{ background: `radial-gradient(120% 70% at 50% 18%, color-mix(in srgb, ${track.colors[0]} 26%, transparent), transparent 70%)` }"
  >
    <div class="flex flex-1 flex-col items-center justify-center gap-5 px-8 pt-4">
      <Transition name="pop" mode="out-in">
        <div
          :key="vehicle.media.track"
          class="grid aspect-square w-[min(220px,52%)] place-items-center rounded-[22px] shadow-pop"
          :style="{ background: `linear-gradient(140deg, ${track.colors[0]}, ${track.colors[1]})` }"
        >
          <svg viewBox="0 0 100 100" class="h-3/5 w-3/5 opacity-70" aria-hidden="true">
            <path d="M50 12c16 18 26 30 26 46a26 26 0 0 1-52 0c0-16 10-28 26-46z" fill="rgb(255 255 255 / 0.22)" />
            <path d="M50 30c8 10 13 17 13 26a13 13 0 0 1-26 0c0-9 5-16 13-26z" fill="rgb(255 255 255 / 0.3)" />
          </svg>
        </div>
      </Transition>
      <div class="min-w-0 text-center">
        <Transition name="fade" mode="out-in">
          <div :key="track.title">
            <h3 class="truncate text-[26px] font-bold">{{ track.title }}</h3>
            <p class="mt-1 text-[17px] text-ink-2">{{ track.artist }}</p>
          </div>
        </Transition>
      </div>
    </div>
    <div class="px-8 pb-6">
      <div class="h-5 cursor-pointer py-2" role="slider" aria-label="Position de lecture" :aria-valuenow="vehicle.media.position" @click="seek">
        <div class="h-1 overflow-hidden rounded-full bg-surface-3">
          <div class="h-full rounded-full bg-ink transition-[width] duration-1000 ease-linear" :style="{ width: `${ratio * 100}%` }" />
        </div>
      </div>
      <div class="tnum flex justify-between text-[12px] text-ink-2">
        <span>{{ mmss(active ? vehicle.media.position : 0) }}</span><span>{{ mmss(track.duration) }}</span>
      </div>
      <div class="mt-3 flex items-center justify-center gap-10">
        <button type="button" class="press grid size-14 place-items-center rounded-full" aria-label="Titre précédent" @click="vehicle.media.source = 'bluetooth'; vehicle.step(-1)"><Icon name="prev" size="30" /></button>
        <button type="button" class="press grid size-16 place-items-center rounded-full" aria-label="Lecture ou pause" @click="toggle"><Icon :name="active && vehicle.media.playing ? 'pause' : 'play'" size="36" /></button>
        <button type="button" class="press grid size-14 place-items-center rounded-full" aria-label="Titre suivant" @click="vehicle.media.source = 'bluetooth'; vehicle.step(1)"><Icon name="next" size="30" /></button>
      </div>
      <div class="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        <button
          v-for="(t, i) in TRACKS"
          :key="t.title"
          type="button"
          class="press flex flex-none items-center gap-2 rounded-xl py-1.5 pr-3 pl-1.5 text-left transition-colors"
          :class="i === vehicle.media.track && active ? 'bg-surface shadow-card night:bg-surface-2' : 'bg-surface-2/60'"
          @click="vehicle.playTrack(i)"
        >
          <span class="size-8 rounded-lg" :style="{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }" />
          <span class="text-[13px] font-semibold">{{ t.title }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
