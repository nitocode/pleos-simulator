<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'

const props = defineProps<{ options: string[]; icons?: IconName[]; size?: 'md' | 'lg' }>()
const model = defineModel<string>({ required: true })

/** Indicateur qui glisse sous l'option choisie (mesuré en pixels de mise en page, insensible à l'échelle). */
const buttons = ref<HTMLButtonElement[]>([])
const indicator = ref({ left: 0, width: 0, ready: false })
function place() {
  const i = props.options.indexOf(model.value)
  const el = buttons.value[i]
  if (!el) {
    indicator.value = { left: 0, width: 0, ready: false }
    return
  }
  indicator.value = { left: el.offsetLeft, width: el.offsetWidth, ready: true }
}
onMounted(() => nextTick(place))
watch(model, () => nextTick(place))
watch(() => props.options, () => nextTick(place))
</script>

<template>
  <div class="relative inline-flex max-w-full flex-wrap rounded-[14px] bg-surface-2 p-1" role="radiogroup">
    <span
      v-if="indicator.ready"
      class="absolute top-1 bottom-1 rounded-[11px] bg-surface shadow-card transition-all duration-300 ease-ui night:bg-surface-3"
      :style="{ left: `${indicator.left}px`, width: `${indicator.width}px` }"
    />
    <button
      v-for="(opt, i) in options"
      :key="opt"
      ref="buttons"
      type="button"
      role="radio"
      :aria-checked="model === opt"
      :aria-label="opt"
      class="press relative z-[1] flex items-center justify-center gap-2 rounded-[11px] font-semibold whitespace-nowrap transition-colors duration-200"
      :class="[size === 'lg' ? 'h-12 min-w-24 px-5 text-[15px]' : 'h-10 px-4 text-[14px]', model === opt ? 'text-accent' : 'text-ink-2']"
      @click="model = opt"
    >
      <Icon v-if="icons?.[i]" :name="icons[i]!" size="22" />
      <span v-if="!icons?.[i] || opt.length < 5">{{ opt }}</span>
    </button>
  </div>
</template>
