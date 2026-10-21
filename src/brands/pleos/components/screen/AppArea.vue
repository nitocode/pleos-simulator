<script setup lang="ts">
import { usePleosStore } from '../../store/pleos'
import AppWindow from './AppWindow.vue'

/**
 * Zone d'apps : une fenêtre (2:0) ou deux (1:1). Les fenêtres glissent et se redimensionnent
 * (transition de flex-grow), et l'échange de position est animé (FLIP de TransitionGroup).
 */
const pleos = usePleosStore()
</script>

<template>
  <div class="absolute inset-0">
    <TransitionGroup name="win" tag="div" class="absolute inset-0 flex">
      <div v-for="(id, i) in pleos.visible" :key="id" class="win relative h-full min-w-0" :class="i > 0 && 'win-gap'">
        <AppWindow :id="id" :index="i" />
      </div>
    </TransitionGroup>
    <Transition name="fade">
      <button
        v-if="pleos.layout === 'split'"
        type="button"
        class="group absolute top-1/2 left-1/2 z-[2] grid h-24 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center"
        title="Inverser les fenêtres (barre de fenêtre)"
        @click="pleos.swap()"
      >
        <span class="h-14 w-[5px] rounded-full bg-ink-3/70 transition-all duration-200 group-hover:h-20 group-hover:bg-accent group-active:scale-90" />
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.win {
  flex: 1 1 0;
}
.win-gap {
  margin-left: 10px;
}
.win-move {
  transition: transform 0.42s var(--ease-ui);
}
.win-enter-active,
.win-leave-active {
  transition:
    flex-grow 0.42s var(--ease-ui),
    margin 0.42s var(--ease-ui),
    opacity 0.3s var(--ease-ui),
    transform 0.42s var(--ease-ui);
}
.win-enter-from,
.win-leave-to {
  flex-grow: 0.0001;
  margin-left: 0;
  opacity: 0;
  transform: scale(0.97);
}
</style>
