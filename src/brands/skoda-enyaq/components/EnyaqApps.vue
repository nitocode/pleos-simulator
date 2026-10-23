<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { APPS } from '../catalog'
import { appShortcuts, useEnyaqBase, type EnyaqScreen } from '../store'

/**
 * Écran Apps (troisième bouton de base de l'infographie). L'étoile place une app parmi les trois raccourcis de la
 * barre inférieure (personnalisation des apps, dossier de presse).
 */
const ui = useEnyaqBase()
function star(id: EnyaqScreen) {
  appShortcuts.value = appShortcuts.value.includes(id) ? appShortcuts.value.filter((a) => a !== id) : [...appShortcuts.value, id].slice(-3)
}
</script>

<template>
  <div class="p-8">
    <h2 class="mb-6 text-[21px] font-bold">Apps</h2>
    <div class="grid grid-cols-6 gap-x-4 gap-y-7">
      <div v-for="a in APPS" :key="a.id" class="relative">
        <button type="button" class="press flex w-full flex-col items-center gap-2.5 text-[14px]" @click="ui.open(a.id)"><span class="grid size-[72px] place-items-center rounded-2xl bg-surface-2 text-accent shadow-card"><Icon :name="a.icon" size="32" /></span>{{ a.label }}</button>
        <button type="button" class="press absolute top-0 right-2 grid size-7 place-items-center rounded-full" :class="appShortcuts.includes(a.id) ? 'text-accent' : 'text-ink-3'" :aria-label="`Raccourci ${a.label}`" :aria-pressed="appShortcuts.includes(a.id)" @click="star(a.id)"><Icon :name="appShortcuts.includes(a.id) ? 'star-filled' : 'star'" size="15" /></button>
      </div>
    </div>
  </div>
</template>
