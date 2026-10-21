<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'

/** Interrupteur à bascule (sous l'écran) : deux moitiés, avec voyants optionnels. */
defineProps<{ label: string; left: IconName; right: IconName; leftOn?: boolean; rightOn?: boolean; leftLabel: string; rightLabel: string; leftTone?: string; rightTone?: string }>()
defineEmits<{ left: []; right: [] }>()
</script>

<template>
  <div class="flex flex-col items-center gap-1.5">
    <div class="flex h-[46px] overflow-hidden rounded-full bg-gradient-to-b from-[#2b2f36] to-[#1c1f24] shadow-[inset_0_1px_0_#3b4048,0_2px_5px_#0009]">
      <button type="button" class="press relative grid w-[54px] place-items-center text-[#c9cfd8] active:bg-white/5" :aria-label="leftLabel" @click="$emit('left')">
        <Icon :name="left" size="20" :class="leftOn && leftTone" />
        <span class="absolute bottom-1.5 h-[3px] w-3 rounded-full transition-colors" :class="leftOn ? 'bg-[#ffa64d] shadow-[0_0_6px_#ffa64d]' : 'bg-[#3a3f47]'" />
      </button>
      <span class="my-2.5 w-px bg-[#3a3f47]" />
      <button type="button" class="press relative grid w-[54px] place-items-center text-[#c9cfd8] active:bg-white/5" :aria-label="rightLabel" @click="$emit('right')">
        <Icon :name="right" size="20" :class="rightOn && rightTone" />
        <span class="absolute bottom-1.5 h-[3px] w-3 rounded-full transition-colors" :class="rightOn ? 'bg-[#ffa64d] shadow-[0_0_6px_#ffa64d]' : 'bg-[#3a3f47]'" />
      </button>
    </div>
    <span class="text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">{{ label }}</span>
  </div>
</template>
