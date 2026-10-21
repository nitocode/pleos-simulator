<script setup lang="ts">
import { computed } from 'vue'
import { temperature, type TempUnit } from '@/core/format'

/** Température au format Pleos : « 23.5° » avec la décimale en exposant. */
const props = defineProps<{ value: number; unit: TempUnit; off?: boolean }>()
const parts = computed(() => temperature(props.value, props.unit))
</script>

<template>
  <span v-if="off" class="font-medium text-ink-3">OFF</span>
  <span v-else class="tnum inline-flex items-start leading-none">
    <span>{{ parts.whole }}</span>
    <span v-if="parts.decimal" class="mt-[0.08em] text-[0.55em] font-semibold">.{{ parts.decimal }}°</span>
    <span v-else class="mt-[0.08em] text-[0.55em]">°</span>
  </span>
</template>
