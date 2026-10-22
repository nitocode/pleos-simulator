<script setup lang="ts" generic="T extends string">
/** Choix exclusif sous forme de segments. */
defineProps<{ options: readonly T[]; label?: string }>()
const model = defineModel<T>({ required: true })
</script>

<template>
  <div class="inline-flex rounded-xl bg-surface-2 p-1" role="radiogroup" :aria-label="label">
    <button v-for="o in options" :key="o" type="button" role="radio" :aria-checked="model === o" class="press rounded-lg px-3.5 py-1.5 text-[14px] font-semibold transition-colors duration-200" :class="model === o ? 'bg-surface text-ink shadow-card' : 'text-ink-2'" @click="model = o">{{ o }}</button>
  </div>
</template>
