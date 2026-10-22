<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'

/** Navigateur : page d'accueil de démonstration (à l'arrêt uniquement, géré par InstalledApp). */
const SITES = [
  { name: 'Actualités', color: '#e11d48' },
  { name: 'Météo', color: '#3b82f6' },
  { name: 'Cartes', color: '#16a34a' },
  { name: 'Recharge', color: '#0ea5e9' },
  { name: 'Wikipédia', color: '#64748b' },
  { name: 'Sport', color: '#f59e0b' },
]
</script>

<template>
  <div class="flex h-full flex-col gap-5 p-5">
    <div class="flex h-12 items-center gap-3 rounded-full bg-surface-2 px-4 text-ink-2"><Icon name="search" size="20" />Rechercher ou saisir une adresse</div>
    <div class="grid grid-cols-3 gap-3">
      <div v-for="s in SITES" :key="s.name" class="grid place-items-center gap-2 rounded-2xl bg-surface-2 py-5">
        <span class="grid size-12 place-items-center rounded-full text-[20px] font-bold text-white" :style="{ background: s.color }">{{ s.name[0] }}</span>
        <span class="text-[13px] font-semibold">{{ s.name }}</span>
      </div>
    </div>
  </div>
</template>
