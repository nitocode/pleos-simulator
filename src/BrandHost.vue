<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { BRANDS } from '@/brands'

/** Charge l'interface demandée dans l'URL (#/pleos). */
const props = defineProps<{ brand: string }>()
const def = computed(() => BRANDS.find((b) => b.id === props.brand))
const Cockpit = computed(() => (def.value ? defineAsyncComponent(def.value.cockpit) : null))
</script>

<template>
  <component :is="Cockpit" v-if="Cockpit" :key="brand" />
  <div v-else class="grid min-h-[60vh] place-items-center p-6 text-center">
    <div>
      <h1 class="text-[22px] font-bold text-white">Interface introuvable</h1>
      <p class="mt-2 text-bench-dim">« {{ brand }} » n’existe pas. Interfaces disponibles :</p>
      <RouterLink v-for="b in BRANDS" :key="b.id" :to="`/${b.id}`" class="mt-3 inline-block rounded-full bg-bench-raised px-4 py-2 font-semibold text-white">{{ b.maker }} · {{ b.system }}</RouterLink>
    </div>
  </div>
</template>
