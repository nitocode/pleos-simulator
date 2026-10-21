<script lang="ts">
import { ref } from 'vue'
const category = ref<'Tout' | 'Musique' | 'Vidéo' | 'Recharge' | 'Utilitaires' | 'Jeux'>('Tout')
</script>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { MARKET_APPS } from '../catalog'
import { usePleosStore } from '../store/pleos'

/** Pleos App Market : catégories, cartes d'apps avec Installer / progression / Ouvrir. */
const pleos = usePleosStore()
const CATS = ['Tout', 'Musique', 'Vidéo', 'Recharge', 'Utilitaires', 'Jeux'] as const
const list = computed(() => MARKET_APPS.filter((a) => category.value === 'Tout' || a.category === category.value))
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-4 pb-3">
      <button v-for="c in CATS" :key="c" type="button" class="press h-10 flex-none rounded-full px-4 text-[14px] font-semibold transition-colors" :class="category === c ? 'bg-ink text-surface' : 'bg-surface-2 text-ink-2'" @click="category = c">{{ c }}</button>
    </div>
    <TransitionGroup name="pop" tag="div" class="thin-scrollbar grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 overflow-auto px-5 pb-5">
      <div v-for="a in list" :key="a.id" class="flex items-center gap-3 rounded-2xl bg-surface-2 p-3.5">
        <span class="grid size-14 flex-none place-items-center rounded-2xl text-[24px] font-bold text-white" :style="{ background: a.color }">{{ a.name[0] }}</span>
        <span class="min-w-0 flex-1">
          <b class="block text-[15px]">{{ a.name }}</b>
          <small class="block text-[13px] leading-snug text-ink-2">{{ a.description }}</small>
          <small class="text-[12px] text-ink-3">{{ a.category }} · {{ a.size }}</small>
        </span>
        <button v-if="pleos.installed.includes(a.id)" type="button" class="press h-9 rounded-full bg-surface px-4 text-[13px] font-bold shadow-card night:bg-surface-3" @click="pleos.launch(a.id)">Ouvrir</button>
        <div v-else-if="pleos.installing[a.id] !== undefined" class="relative grid size-9 place-items-center" :aria-label="`Installation ${pleos.installing[a.id]} %`">
          <svg viewBox="0 0 36 36" class="absolute inset-0 -rotate-90"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--ui-surface-3)" stroke-width="3" /><circle cx="18" cy="18" r="15" fill="none" stroke="var(--ui-accent)" stroke-width="3" stroke-linecap="round" :stroke-dasharray="`${(pleos.installing[a.id]! / 100) * 94.2} 94.2`" class="transition-[stroke-dasharray] duration-200" /></svg>
          <Icon name="close" size="12" />
        </div>
        <button v-else type="button" class="press h-9 rounded-full bg-ink px-4 text-[13px] font-bold text-surface" @click="pleos.install(a.id)">Installer</button>
      </div>
    </TransitionGroup>
  </div>
</template>
