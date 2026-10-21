<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { appMeta, type AppId } from '../../catalog'

const props = withDefaults(defineProps<{ id: AppId; size?: number }>(), { size: 46 })
const meta = computed(() => appMeta(props.id))
</script>

<template>
  <span
    class="grid flex-none place-items-center text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]"
    :style="{ width: `${size}px`, height: `${size}px`, borderRadius: `${size * 0.3}px`, background: meta.bg }"
  >
    <Icon v-if="meta.icon" :name="meta.icon" :size="size * 0.54" :stroke="meta.icon === 'gleo' ? 2.6 : 2" />
    <b v-else :style="{ fontSize: `${size * 0.46}px` }">{{ meta.letter }}</b>
  </span>
</template>
