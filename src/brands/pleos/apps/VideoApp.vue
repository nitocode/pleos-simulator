<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'

/** YouTube : lecteur de démonstration et vidéos suggérées (disponible à l'arrêt, géré par InstalledApp). */
const VIDEOS = [
  { title: 'Ioniq 3 : on a testé la recharge ultra-rapide', channel: 'Auto Électrique', length: '12:04', colors: ['#2b5876', '#4e4376'] },
  { title: 'Paris de nuit en 4K', channel: 'Urban Lights', length: '8:31', colors: ['#141e30', '#35577d'] },
  { title: 'Road trip Paris – Lyon en électrique', channel: 'Voyage Volt', length: '21:47', colors: ['#cc5333', '#23074d'] },
  { title: 'Conseils pour préserver sa batterie', channel: 'Garage Pédagogie', length: '9:15', colors: ['#134e5e', '#71b280'] },
]
const current = ref(0)
const playing = ref(true)
</script>

<template>
  <div class="flex h-full flex-col gap-3 p-4">
    <div class="relative grid min-h-0 flex-1 place-items-center overflow-hidden rounded-2xl" :style="{ background: `linear-gradient(140deg, ${VIDEOS[current].colors[0]}, ${VIDEOS[current].colors[1]})` }">
      <button type="button" class="press grid size-20 place-items-center rounded-full bg-black/45 text-white" aria-label="Lecture ou pause" @click="playing = !playing"><Icon :name="playing ? 'pause' : 'play'" size="38" /></button>
      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
        <b class="block truncate">{{ VIDEOS[current].title }}</b>
        <div class="mt-2 h-1 rounded-full bg-white/30"><div class="h-full w-1/3 rounded-full bg-[#ff3b3b]" /></div>
      </div>
    </div>
    <div class="no-scrollbar flex gap-2 overflow-x-auto">
      <button v-for="(v, i) in VIDEOS" :key="v.title" type="button" class="press w-[170px] flex-none rounded-xl bg-surface-2 p-2 text-left" :class="i === current && 'ring-2 ring-accent'" @click="current = i; playing = true">
        <span class="mb-1.5 block h-[72px] rounded-lg" :style="{ background: `linear-gradient(140deg, ${v.colors[0]}, ${v.colors[1]})` }" />
        <b class="line-clamp-2 text-[13px]">{{ v.title }}</b>
        <small class="text-ink-2">{{ v.channel }} · {{ v.length }}</small>
      </button>
    </div>
  </div>
</template>
