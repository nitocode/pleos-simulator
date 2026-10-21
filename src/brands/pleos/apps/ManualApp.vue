<script lang="ts">
import { ref } from 'vue'
const query = ref('')
</script>

<script setup lang="ts">
import { computed, nextTick, ref as vref, watch } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { MANUAL } from '../data/manual'
import { searchManual } from '../data/search'
import { askGleo, manualSelection } from '../gleo/useGleo'

/** Manuel numérique : sommaire par chapitre, recherche, fiche et question à Gleo. */
const entry = computed(() => MANUAL.find((m) => m.id === manualSelection.value) ?? MANUAL[0]!)
const items = computed(() => (query.value ? searchManual(query.value).map((r) => r.entry) : MANUAL))
const body = vref<HTMLElement | null>(null)
watch(manualSelection, () => nextTick(() => body.value?.scrollTo({ top: 0 })))
function select(id: string) {
  manualSelection.value = id
}
</script>

<template>
  <div class="grid h-full min-h-0 grid-rows-[minmax(0,40%)_minmax(0,1fr)] @min-[620px]:grid-cols-[290px_minmax(0,1fr)] @min-[620px]:grid-rows-1">
    <aside class="flex min-h-0 flex-col border-b border-line bg-surface-2/60 @min-[620px]:border-r @min-[620px]:border-b-0">
      <label class="flex h-[52px] flex-none items-center gap-2 border-b border-line px-4 text-ink-2">
        <Icon name="search" size="18" />
        <input id="manual-query" v-model="query" class="h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3" placeholder="Rechercher dans le manuel" autocomplete="off" />
      </label>
      <div class="thin-scrollbar min-h-0 flex-1 overflow-auto p-2">
        <template v-for="(m, i) in items" :key="m.id">
          <p v-if="!query && (i === 0 || items[i - 1]!.chapter !== m.chapter)" class="px-3 pt-3 pb-1 text-[11px] font-bold tracking-wider text-ink-3 uppercase">{{ m.chapter }}</p>
          <button type="button" class="press w-full rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold transition-colors" :class="m.id === manualSelection ? 'bg-accent text-on-accent' : 'hover:bg-surface-2'" @click="select(m.id)">{{ m.title }}</button>
        </template>
        <p v-if="!items.length" class="p-3 text-ink-2">Aucun résultat.</p>
      </div>
    </aside>
    <article ref="body" class="thin-scrollbar min-h-0 overflow-auto p-6 @min-[620px]:p-7">
      <Transition name="slide" mode="out-in">
        <div :key="entry.id">
          <p class="text-[12px] font-bold tracking-wider text-ink-3 uppercase">{{ entry.chapter }}</p>
          <h3 class="mt-1 mb-3 text-[24px] font-bold text-balance">{{ entry.title }}</h3>
          <p class="max-w-[62ch] text-[16px] leading-relaxed text-ink-2">{{ entry.body }}</p>
          <button type="button" class="press mt-5 flex h-11 items-center gap-2 rounded-xl bg-surface-2 px-4 font-semibold" @click="askGleo(`Explique-moi : ${entry.title}`)">
            <Icon name="gleo" size="18" :stroke="2.6" class="text-[#6b4fe0]" />Demander à Gleo
          </button>
          <p class="mt-6 text-[12px] text-ink-3">Résumé de démonstration. Référez-vous au manuel officiel du véhicule.</p>
        </div>
      </Transition>
    </article>
  </div>
</template>
