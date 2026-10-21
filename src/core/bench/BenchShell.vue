<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { BrandDefinition } from '../brands'
import { useBenchStore, type BenchView } from './useBench'
import SimulationPanel from './SimulationPanel.vue'

/**
 * Banc d'essai commun : en-tête (marque, vue, taille), emplacements des écrans et commandes,
 * panneau de simulation. Chaque marque fournit le contenu des emplacements.
 */
const props = defineProps<{ brand: BrandDefinition; brands: BrandDefinition[] }>()
const bench = useBenchStore()
const router = useRouter()
const VIEWS: [BenchView, string][] = [
  ['cockpit', 'Cockpit'],
  ['central', 'Écran central'],
  ['driver', 'Écran conducteur'],
]
const size = computed(() => props.brand.sizes.find((s) => s.id === bench.size) ?? props.brand.sizes.find((s) => s.id === props.brand.defaultSize)!)
</script>

<template>
  <div class="mx-auto flex max-w-[1560px] flex-col gap-5 px-[max(16px,env(safe-area-inset-left))] py-5">
    <header class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div class="min-w-0">
        <h1 class="text-[21px] font-bold text-balance text-white">{{ brand.system }} · {{ brand.maker }} {{ brand.model }}</h1>
        <p class="mt-0.5 text-[12px] font-semibold tracking-[0.08em] text-bench-dim uppercase">{{ brand.summary }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2.5">
        <label v-if="brands.length > 1" class="flex items-center gap-2 text-[13px] text-bench-dim">
          Interface
          <select id="brand-select" class="h-9 rounded-full border border-bench-line bg-bench-panel px-3 text-bench-ink" :value="brand.id" @change="router.push(`/${($event.target as HTMLSelectElement).value}`)">
            <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.maker }} · {{ b.system }}</option>
          </select>
        </label>
        <div class="flex rounded-full border border-bench-line bg-bench-panel p-1" role="tablist" aria-label="Vue">
          <button v-for="[id, label] in VIEWS" :key="id" type="button" role="tab" :aria-selected="bench.view === id" class="rounded-full px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors duration-200" :class="bench.view === id ? 'bg-bench-raised text-white' : 'text-bench-dim hover:text-bench-ink'" @click="bench.view = id">{{ label }}</button>
        </div>
        <div v-if="brand.sizes.length > 1" class="flex rounded-full border border-bench-line bg-bench-panel p-1" role="tablist" aria-label="Taille de l’écran">
          <button v-for="s in brand.sizes" :key="s.id" type="button" role="tab" :aria-selected="size.id === s.id" class="rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-200" :class="size.id === s.id ? 'bg-bench-raised text-white' : 'text-bench-dim hover:text-bench-ink'" @click="bench.size = s.id">{{ s.label }}</button>
        </div>
      </div>
    </header>

    <section class="flex flex-col items-center gap-5">
      <div v-show="bench.view !== 'central'" class="flex w-full flex-col items-center gap-2">
        <p class="text-[11px] font-semibold tracking-[0.08em] text-bench-dim uppercase">Écran conducteur</p>
        <slot name="driver" :view="bench.view" />
      </div>
      <div v-show="bench.view !== 'driver'" class="flex w-full flex-col items-center gap-2">
        <p class="text-[11px] font-semibold tracking-[0.08em] text-bench-dim uppercase">Écran central tactile</p>
        <slot name="central" :size="size" />
      </div>
      <div v-show="bench.view !== 'driver'" class="w-full">
        <slot name="hardware" />
      </div>
    </section>

    <SimulationPanel>
      <template #events="p"><slot name="sim-events" v-bind="p" /></template>
    </SimulationPanel>
    <p class="max-w-[960px] text-[12px] leading-relaxed text-bench-dim"><slot name="note" /></p>
  </div>
</template>
