<script setup lang="ts">
import { computed } from 'vue'
import { ICONS, type IconName } from './icons'

const props = withDefaults(defineProps<{ name: IconName; size?: number | string; stroke?: number }>(), {
  size: '1.25em',
  stroke: 1.8,
})

const markup = computed(() => ICONS[props.name])
const dim = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <!-- Les tracés sont des chaînes statiques du dépôt (icons.ts), pas des données externes. -->
  <svg
    class="ui-icon"
    viewBox="0 0 24 24"
    :width="dim"
    :height="dim"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="markup"
  />
</template>

<style>
.ui-icon {
  flex: none;
  display: block;
}
.ui-icon .f {
  fill: currentColor;
  stroke: none;
}
</style>
