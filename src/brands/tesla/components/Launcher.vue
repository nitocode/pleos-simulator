<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { APPS, useTeslaStore, type TeslaApp } from '../store/tesla'

/**
 * Tiroir d'applications (manuel, « Lanceur d'applications ») : toucher une application l'ouvre sur le haut de la carte.
 * L'épingle l'ajoute à Mes applis (4 au maximum : la plus ancienne est remplacée).
 */
const tesla = useTeslaStore()
const ids = Object.keys(APPS) as TeslaApp[]
</script>

<template>
  <section class="w-[520px] rounded-[26px] bg-surface p-5 shadow-pop" aria-label="Applications">
    <header class="mb-3 flex items-center justify-between"><h2 class="text-[18px] font-bold">Applications</h2><button type="button" class="press grid size-10 place-items-center rounded-full text-ink-2" aria-label="Fermer" @click="tesla.closePanel()"><Icon name="close" size="20" /></button></header>
    <ul class="grid grid-cols-3 gap-3">
      <li v-for="id in ids" :key="id" class="relative">
        <button type="button" class="press flex w-full flex-col items-center gap-2 rounded-2xl bg-surface-2 py-4 text-[13.5px] font-semibold" @click="tesla.launch(id)">
          <span class="grid size-14 place-items-center rounded-2xl text-white" :style="{ background: APPS[id].color }"><Icon :name="APPS[id].icon" size="28" /></span>{{ APPS[id].name }}
        </button>
        <button type="button" class="press absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-full" :class="tesla.myApps.includes(id) ? 'text-accent' : 'text-ink-3'" :aria-label="tesla.myApps.includes(id) ? `Retirer ${APPS[id].name} de Mes applis` : `Ajouter ${APPS[id].name} à Mes applis`" :aria-pressed="tesla.myApps.includes(id)" @click="tesla.toggleMyApp(id)"><Icon :name="tesla.myApps.includes(id) ? 'star-filled' : 'star'" size="16" /></button>
      </li>
    </ul>
  </section>
</template>
