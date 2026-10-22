<script setup lang="ts">
import { computed } from 'vue'

/** Curseur de l'interface Tesla : barre pleine jusqu'à la valeur, pastille blanche. */
const props = withDefaults(defineProps<{ min: number; max: number; step?: number; label: string }>(), { step: 1 })
const model = defineModel<number>({ required: true })
const ratio = computed(() => ((model.value - props.min) / (props.max - props.min)) * 100)
</script>

<template>
  <input
    v-model.number="model"
    type="range"
    :min="min"
    :max="max"
    :step="step"
    :aria-label="label"
    class="t-slider h-8 w-full cursor-pointer appearance-none bg-transparent"
    :style="{ '--fill': `${ratio}%` }"
  />
</template>

<style scoped>
.t-slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(to right, var(--ui-accent) var(--fill), var(--ui-surface-3) var(--fill));
}
.t-slider::-moz-range-track {
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(to right, var(--ui-accent) var(--fill), var(--ui-surface-3) var(--fill));
}
.t-slider::-webkit-slider-thumb {
  appearance: none;
  margin-top: -9px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.35);
}
.t-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.35);
}
</style>
