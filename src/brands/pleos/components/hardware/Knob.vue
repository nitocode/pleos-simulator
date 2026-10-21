<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'

/** Molette physique : tourner (boutons ou molette de la souris) et appuyer. */
const props = defineProps<{ label: string; icon: IconName }>()
const emit = defineEmits<{ turn: [dir: -1 | 1]; press: [] }>()
const angle = ref(0)
function turn(dir: -1 | 1) {
  angle.value += dir * 24
  emit('turn', dir)
}
function wheel(e: WheelEvent) {
  turn(e.deltaY > 0 ? -1 : 1)
}
</script>

<template>
  <div class="flex flex-col items-center gap-1.5">
    <div class="flex items-center gap-1">
      <button type="button" class="press grid size-8 place-items-center rounded-full text-bench-dim hover:text-bench-ink" :aria-label="`${props.label} : tourner à gauche`" @click="turn(-1)"><Icon name="rotate-ccw" size="16" /></button>
      <button
        type="button"
        class="press relative grid size-[54px] place-items-center rounded-full bg-[radial-gradient(circle_at_40%_32%,#5a616b,#1b1e23_68%)] text-[#c3cad3] shadow-[0_3px_8px_#000a,inset_0_0_0_2px_#2c3139]"
        :aria-label="`${props.label} : appuyer`"
        @click="emit('press')"
        @wheel.prevent="wheel"
      >
        <span class="absolute inset-1 rounded-full transition-transform duration-200 ease-ui" :style="{ transform: `rotate(${angle}deg)` }">
          <span class="absolute top-1 left-1/2 h-2 w-[3px] -translate-x-1/2 rounded-full bg-[#9aa3ae]" />
        </span>
        <Icon :name="icon" size="18" />
      </button>
      <button type="button" class="press grid size-8 place-items-center rounded-full text-bench-dim hover:text-bench-ink" :aria-label="`${props.label} : tourner à droite`" @click="turn(1)"><Icon name="rotate-cw" size="16" /></button>
    </div>
    <span class="text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">{{ label }}</span>
  </div>
</template>
