<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { usePleosStore } from '../store/pleos'

/** App Gleo AI : historique des conversations (Consulter l’historique des conversations). */
const pleos = usePleosStore()
const list = ref<HTMLElement | null>(null)
const scrollDown = () => nextTick(() => list.value?.scrollTo({ top: list.value.scrollHeight, behavior: 'smooth' }))
onMounted(scrollDown)
watch(() => pleos.gleoHistory.length, scrollDown)
</script>

<template>
  <div class="flex h-full flex-col">
    <div ref="list" class="thin-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-auto p-5">
      <TransitionGroup name="pop">
        <div
          v-for="(m, i) in pleos.gleoHistory"
          :key="i"
          class="max-w-[82%] rounded-[18px] px-4 py-2.5 text-[15px] leading-snug"
          :class="m.from === 'gleo' ? 'self-start rounded-bl-md bg-surface-2' : 'self-end rounded-br-md bg-gradient-to-br from-[#3d6bff] to-[#8a5cff] text-white'"
        >
          {{ m.text }}
        </div>
      </TransitionGroup>
    </div>
    <div class="flex items-center gap-3 border-t border-line p-4">
      <button type="button" class="press flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3d6bff] via-[#8a5cff] to-[#d86bff] font-semibold text-white" @click="pleos.gleo = { phase: 'listen' }">
        <Icon name="mic" size="20" />Parler à Gleo
      </button>
      <button type="button" class="press grid size-12 place-items-center rounded-xl bg-surface-2" aria-label="Réinitialiser la conversation" @click="pleos.gleoHistory = pleos.gleoHistory.slice(0, 1); pleos.notify('Conversation réinitialisée', 'rotate-ccw')">
        <Icon name="rotate-ccw" size="20" />
      </button>
    </div>
  </div>
</template>
