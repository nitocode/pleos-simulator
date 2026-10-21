<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { askGleo, openManual } from '../../gleo/useGleo'
import { usePleosStore } from '../../store/pleos'

/** Gleo AI : halo dégradé en haut de la zone d'apps, état (écoute, réflexion, expression orale) et réponse. */
const pleos = usePleosStore()
const text = ref('')
const input = ref<HTMLInputElement | null>(null)
const SUGGESTIONS = [
  'Augmenter la température',
  'Activer le chauffage du siège',
  'Aller à : Gare de Lyon',
  'Annuler l’itinéraire',
  'Appeler Camille Martin',
  'Ouvrir Radio',
  'Titre suivant',
  'Ouvrir la trappe de recharge',
  'Fermer toutes les fenêtres',
  'Dis-moi quelle est l’autonomie actuelle du véhicule',
  'Dis-moi quelle est la pression des pneus',
  'Que peux-tu faire ?',
]
const PHASE = { listen: 'Écoute', think: 'Réflexion', talk: 'Expression orale' } as const

function send(value = text.value) {
  askGleo(value)
  text.value = ''
}
const focus = () => nextTick(() => input.value?.focus())
onMounted(focus)
watch(() => pleos.gleo?.phase, (p) => p === 'listen' && focus())
</script>

<template>
  <div v-if="pleos.gleo" class="absolute inset-x-4 top-1 z-40 flex flex-col items-center gap-2" role="dialog" aria-label="Gleo AI">
    <button type="button" class="gleo-glow h-9 w-[72%] rounded-[50%]" :class="`is-${pleos.gleo.phase}`" aria-label="Fermer Gleo" @click="pleos.gleo = null" />
    <div class="w-[min(680px,100%)] rounded-[24px] border border-line bg-surface/95 p-4 shadow-pop backdrop-blur-xl">
      <div class="flex items-center justify-between">
        <span class="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.1em] text-ink-2 uppercase">
          <span class="grid size-6 place-items-center rounded-lg bg-gradient-to-br from-[#3d6bff] via-[#8a5cff] to-[#d86bff] text-white"><Icon name="gleo" size="15" :stroke="2.8" /></span>
          Gleo AI · {{ PHASE[pleos.gleo.phase] }}
        </span>
        <button type="button" class="press grid size-9 place-items-center rounded-full text-ink-2" aria-label="Fermer" @click="pleos.gleo = null"><Icon name="close" size="18" /></button>
      </div>
      <Transition name="fade" mode="out-in">
        <div :key="(pleos.gleo.heard ?? '') + pleos.gleo.phase" class="mt-2">
          <p v-if="pleos.gleo.heard" class="text-[17px] text-ink-2 italic">« {{ pleos.gleo.heard }} »</p>
          <div v-if="pleos.gleo.phase === 'think'" class="mt-3 flex gap-1.5" aria-label="Réflexion en cours">
            <span v-for="i in 3" :key="i" class="size-2 animate-bounce rounded-full bg-[#8a5cff]" :style="{ animationDelay: `${i * 0.12}s` }" />
          </div>
          <p v-if="pleos.gleo.reply" class="mt-2 text-[17px] leading-relaxed">{{ pleos.gleo.reply }}</p>
          <button v-if="pleos.gleo.link" type="button" class="press mt-2 inline-flex items-center gap-1 font-semibold text-accent" @click="openManual(pleos.gleo.link.manualId)">
            {{ pleos.gleo.link.label }}<Icon name="chevron-right" size="18" />
          </button>
        </div>
      </Transition>
      <template v-if="pleos.gleo.phase === 'listen'">
        <div class="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-1">
          <button v-for="s in SUGGESTIONS" :key="s" type="button" class="press flex-none rounded-full border border-line bg-surface-2 px-3.5 py-2 text-[13.5px] font-semibold" @click="send(s)">{{ s }}</button>
        </div>
        <form class="mt-2 flex gap-2" @submit.prevent="send()">
          <input id="gleo-input" ref="input" v-model="text" class="h-12 flex-1 rounded-2xl border border-line bg-surface-2 px-4 text-[16px] outline-none placeholder:text-ink-3 focus:border-[#8a5cff]" placeholder="Parlez… ou écrivez votre demande" autocomplete="off" />
          <button type="submit" class="press grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#3d6bff] to-[#8a5cff] text-white" aria-label="Envoyer"><Icon name="send" size="20" /></button>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.gleo-glow {
  background: radial-gradient(50% 50% at 50% 50%, var(--g1), var(--g2) 45%, transparent 72%);
  filter: blur(3px);
  animation: glow 1.6s ease-in-out infinite;
  transition: --g1 0.4s;
}
.is-listen {
  --g1: #2e6bff;
  --g2: #2e6bff88;
}
.is-think {
  --g1: #8b5cff;
  --g2: #c46bff77;
  animation-duration: 0.6s;
}
.is-talk {
  --g1: #14c3c9;
  --g2: #2e9bff77;
}
</style>
