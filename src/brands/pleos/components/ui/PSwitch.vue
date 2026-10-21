<script setup lang="ts">
defineProps<{ label?: string }>()
const model = defineModel<boolean>({ required: true })
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-label="label"
    class="relative h-[30px] w-[52px] flex-none rounded-full transition-colors duration-300 ease-ui"
    :class="model ? 'bg-accent' : 'bg-surface-3'"
    @click="model = !model"
  >
    <span
      class="absolute top-[3px] left-[3px] size-6 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-300 ease-spring"
      :class="model && 'translate-x-[22px]'"
    />
  </button>
</template>
