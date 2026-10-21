<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'

/** Tuile d'accès rapide : fond clair et barre verte quand la fonction est active. */
defineProps<{ label: string; state: string; on: boolean; icon: IconName }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    type="button"
    class="press relative flex min-h-[112px] flex-col justify-between rounded-2xl p-4 text-left transition-[background-color,box-shadow] duration-300"
    :class="on ? 'bg-surface shadow-card night:bg-surface-3' : 'bg-surface-2'"
    :aria-pressed="on"
    @click="$emit('toggle')"
  >
    <span class="absolute top-4 right-4 h-5 w-1 rounded-full transition-colors duration-300" :class="on ? 'bg-ok' : 'bg-surface-3 night:bg-[#45484f]'" />
    <span class="pr-4">
      <b class="block text-[15px] leading-tight font-bold">{{ label }}</b>
      <small class="mt-1 block text-[13px] font-semibold text-ink-2">{{ state }}</small>
    </span>
    <Icon :name="icon" size="24" class="self-end" />
  </button>
</template>
