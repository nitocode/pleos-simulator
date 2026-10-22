<script setup lang="ts">
/** Interrupteur de l'interface Tesla : piste arrondie et pastille. */
defineProps<{ label?: string }>()
const model = defineModel<boolean>({ required: true })
</script>

<template>
  <button type="button" role="switch" :aria-checked="model" :aria-label="label" class="press relative h-[30px] w-[52px] flex-none rounded-full transition-colors duration-200" :class="model ? 'bg-accent' : 'bg-surface-3'" @click="model = !model">
    <span class="absolute top-[3px] left-[3px] size-6 rounded-full bg-white shadow transition-transform duration-200 ease-ui" :class="model && 'translate-x-[22px]'" />
  </button>
</template>
