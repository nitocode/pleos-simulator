<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useId3Base, type Id3Fav } from '../store'
import { APPS, FAVS } from '../catalog'

/**
 * Menu principal (photo officielle) : tuiles d'applis sur deux rangées de cinq, pages repérées par des points.
 * En mode édition (« + » de la barre supérieure), toucher une tuile l'ajoute ou la retire des favoris (4 au plus).
 */
const ui = useId3Base()
const page = ref(0)
const isFav = (id: string): id is Id3Fav => id in FAVS

function tap(id: (typeof APPS)[number][number]['id']) {
  if (ui.editing) {
    if (isFav(id)) ui.toggleFav(id, 4)
    else ui.notify('Cette appli ne peut pas être placée en favori', 'info')
    return
  }
  ui.open(id)
}
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-5 p-6">
    <div class="w-full max-w-[880px] rounded-3xl bg-surface/70 p-6 shadow-card backdrop-blur">
      <div v-if="ui.editing" class="mb-4 flex items-center justify-between">
        <b class="text-[17px]">Modifier les favoris</b>
        <button type="button" class="press h-10 rounded-full bg-accent px-5 text-[14px] font-semibold text-on-accent" @click="ui.editing = false">Terminé</button>
      </div>
      <div class="grid grid-cols-5 gap-x-4 gap-y-6">
        <button v-for="a in APPS[page]" :key="a.id" type="button" class="press relative flex flex-col items-center gap-2.5 rounded-2xl py-2 text-[14px]" :class="ui.editing && 'animate-wiggle'" @click="tap(a.id)">
          <span class="grid size-[68px] place-items-center rounded-2xl bg-surface-2 shadow-card" :style="{ color: a.color }"><Icon :name="a.icon" size="32" /></span>
          {{ a.label }}
          <span v-if="ui.editing && isFav(a.id)" class="absolute top-0 right-3 grid size-6 place-items-center rounded-full text-white" :class="ui.favs.includes(a.id) ? 'bg-accent' : 'bg-surface-3'"><Icon :name="ui.favs.includes(a.id) ? 'check' : 'plus'" size="14" /></span>
        </button>
      </div>
      <div class="mt-5 flex justify-center gap-2" role="tablist" aria-label="Pages">
        <button v-for="(_, i) in APPS" :key="i" type="button" role="tab" :aria-selected="page === i" class="press size-2.5 rounded-full" :class="page === i ? 'bg-ink' : 'bg-ink-3/50'" :aria-label="`Page ${i + 1}`" @click="page = i" />
      </div>
    </div>
  </div>
</template>
