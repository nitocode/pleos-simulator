<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'

withDefaults(defineProps<{ icon?: IconName; variant?: 'default' | 'primary' | 'danger' | 'ghost'; disabled?: boolean; small?: boolean }>(), {
  variant: 'default',
})
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="press inline-flex flex-none items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap disabled:opacity-40"
    :class="[
      small ? 'h-10 px-4 text-[14px]' : 'h-12 px-5 text-[15px]',
      variant === 'primary' && 'bg-accent text-on-accent',
      variant === 'default' && 'bg-surface-2 text-ink',
      variant === 'danger' && 'bg-surface-2 text-crit',
      variant === 'ghost' && 'text-ink-2',
    ]"
  >
    <Icon v-if="icon" :name="icon" size="20" />
    <slot />
  </button>
</template>
