<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Curseur tactile rétroéclairé (sous l'écran de l'ID.3, communiqué Volkswagen 2024) : on glisse le doigt pour régler,
 * on touche une extrémité pour un pas. La barre s'allume jusqu'à la valeur, en dégradé bleu → rouge pour la température.
 */
const props = withDefaults(defineProps<{ label: string; min: number; max: number; step: number; value: number; tone?: 'temp' | 'volume'; width?: number }>(), { tone: 'volume', width: 220 })
const emit = defineEmits<{ change: [number] }>()
const bar = ref<HTMLElement | null>(null)
const active = ref(false)
const ratio = computed(() => (props.value - props.min) / (props.max - props.min))

function fromPointer(e: PointerEvent) {
  const r = bar.value!.getBoundingClientRect()
  const raw = props.min + ((e.clientX - r.left) / r.width) * (props.max - props.min)
  emit('change', Math.max(props.min, Math.min(props.max, Math.round(raw / props.step) * props.step)))
}
function down(e: PointerEvent) {
  active.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  fromPointer(e)
}
function move(e: PointerEvent) {
  if (active.value) fromPointer(e)
}
</script>

<template>
  <div class="flex flex-col items-center gap-1.5">
    <div
      ref="bar"
      class="relative h-9 cursor-pointer touch-none overflow-hidden rounded-full bg-[#101215] shadow-[inset_0_1px_0_#2a2e34,0_2px_5px_#0009]"
      :style="{ width: `${width}px` }"
      role="slider"
      :aria-label="label"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="value"
      tabindex="0"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="active = false"
      @pointercancel="active = false"
      @keydown.left.prevent="emit('change', Math.max(min, value - step))"
      @keydown.right.prevent="emit('change', Math.min(max, value + step))"
    >
      <span
        class="absolute inset-y-[13px] left-3 rounded-full transition-[width] duration-150"
        :style="{ width: `calc(${ratio} * (100% - 24px))`, background: tone === 'temp' ? 'linear-gradient(90deg, #3e8bff, #b06ad8, #ff5a3c)' : '#e8edf4', boxShadow: tone === 'temp' ? '0 0 10px #ff6a4d88' : '0 0 10px #ffffff66' }"
      />
      <span class="absolute inset-y-[13px] right-3 left-3 -z-0 rounded-full bg-white/10" />
      <span class="absolute top-1/2 left-2 -translate-y-1/2 text-[13px] font-bold text-white/50">−</span>
      <span class="absolute top-1/2 right-2 -translate-y-1/2 text-[13px] font-bold text-white/50">+</span>
    </div>
    <span class="text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">{{ label }}</span>
  </div>
</template>
