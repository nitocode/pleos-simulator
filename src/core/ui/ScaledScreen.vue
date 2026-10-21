<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'

/**
 * Affiche un écran de taille fixe (en pixels « véhicule ») réduit pour tenir dans la largeur disponible.
 * Les enfants peuvent lire l'échelle courante via inject('screenScale').
 */
const props = withDefaults(defineProps<{ width: number; height: number; maxScale?: number; fit?: number }>(), {
  maxScale: 1,
  fit: 1,
})

const host = ref<HTMLElement | null>(null)
const scale = ref(1)
provide('screenScale', scale)

let ro: ResizeObserver | undefined
function measure() {
  const avail = host.value?.parentElement?.clientWidth ?? props.width
  scale.value = Math.max(0.2, Math.min(props.maxScale, (avail * props.fit) / props.width))
}
onMounted(() => {
  measure()
  ro = new ResizeObserver(measure)
  if (host.value?.parentElement) ro.observe(host.value.parentElement)
})
onBeforeUnmount(() => ro?.disconnect())
watch(() => [props.width, props.fit, props.maxScale], measure)
</script>

<template>
  <div ref="host" class="relative max-w-full" :style="{ width: `${width * scale}px`, height: `${height * scale}px` }">
    <div class="absolute top-0 left-0 origin-top-left" :style="{ width: `${width}px`, height: `${height}px`, transform: `scale(${scale})` }">
      <slot />
    </div>
  </div>
</template>
