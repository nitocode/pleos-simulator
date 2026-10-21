<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'

/** Curseur Pleos : chevrons de part et d'autre, barre remplie portant l'icône et la valeur. */
const props = withDefaults(defineProps<{ min: number; max: number; step?: number; icon?: IconName; unit?: string; label?: string }>(), {
  step: 1,
  unit: '',
})
const model = defineModel<number>({ required: true })

const ratio = computed(() => (model.value - props.min) / (props.max - props.min))
const clamp = (v: number) => Math.max(props.min, Math.min(props.max, Math.round(v / props.step) * props.step))
const track = ref<HTMLElement | null>(null)
let dragging = false

function fromPointer(e: PointerEvent) {
  const r = track.value!.getBoundingClientRect()
  model.value = clamp(props.min + ((e.clientX - r.left) / r.width) * (props.max - props.min))
}
function down(e: PointerEvent) {
  dragging = true
  ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  fromPointer(e)
}
function move(e: PointerEvent) {
  if (dragging) fromPointer(e)
}
function up() {
  dragging = false
}
</script>

<template>
  <div class="flex min-w-0 flex-1 items-center gap-1">
    <button type="button" class="press grid size-11 flex-none place-items-center rounded-xl text-ink-2" :aria-label="`Diminuer ${label ?? ''}`" @click="model = clamp(model - step)">
      <Icon name="chevron-left" size="22" />
    </button>
    <div
      ref="track"
      class="relative h-12 min-w-0 flex-1 cursor-pointer touch-none overflow-hidden rounded-xl bg-surface-3"
      role="slider"
      :aria-label="label"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="model"
      tabindex="0"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="up"
      @keydown.left.prevent="model = clamp(model - step)"
      @keydown.right.prevent="model = clamp(model + step)"
    >
      <div class="absolute inset-y-0 left-0 rounded-xl bg-surface shadow-card transition-[width] duration-150 ease-ui night:bg-[#4a4e56]" :style="{ width: `max(76px, ${ratio * 100}%)` }" />
      <div class="pointer-events-none relative flex h-full items-center gap-2 px-4 text-[15px] font-semibold text-ink">
        <Icon v-if="icon" :name="icon" size="18" />
        <span class="tnum">{{ model }}{{ unit }}</span>
      </div>
    </div>
    <button type="button" class="press grid size-11 flex-none place-items-center rounded-xl text-ink-2" :aria-label="`Augmenter ${label ?? ''}`" @click="model = clamp(model + step)">
      <Icon name="chevron-right" size="22" />
    </button>
  </div>
</template>
