<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import { SUGGESTIONS, understand, type VoiceTarget } from '../../meb/voice'
import { useEnyaqBase, type EnyaqScreen } from '../store'

/**
 * Assistante Laura (« Hi, I'm Laura » sur l'infographie). Le dossier de presse 2024 précise que la commande prononcée
 * est transcrite et affichée à l'écran : la phrase reconnue apparaît avant la réponse.
 */
const vehicle = useVehicleStore()
const ui = useEnyaqBase()
const text = ref('')
const log = ref<{ from: 'me' | 'laura'; text: string }[]>([])
const TARGET: Record<VoiceTarget, EnyaqScreen> = { nav: 'nav', media: 'media', phone: 'phone', climate: 'climate', charge: 'charge' }

function ask(q: string) {
  const content = q.trim()
  if (!content) return
  text.value = ''
  ui.voice = { phase: 'listen', heard: content }
  log.value = [...log.value, { from: 'me' as const, text: content }].slice(-6)
  setTimeout(() => {
    let goTo: EnyaqScreen | null = null
    const reply = understand(content, vehicle, (t) => (goTo = TARGET[t]))
    log.value = [...log.value, { from: 'laura' as const, text: reply }].slice(-6)
    ui.voice = { phase: 'talk', heard: content, reply }
    setTimeout(() => {
      if (ui.voice?.heard === content) ui.voice = null
      if (goTo) ui.open(goTo)
    }, 1700)
  }, 800)
}
</script>

<template>
  <div class="grid h-full grid-cols-[1fr_320px]">
    <section class="flex min-h-0 flex-col p-6">
      <div class="flex items-center gap-3"><span class="size-5 rounded-full bg-accent shadow-[0_0_16px_var(--ui-accent)]" :class="ui.voice && 'animate-pulse'" /><h2 class="text-[22px] font-bold">Bonjour, je suis Laura</h2></div>
      <p class="mt-1 text-ink-2">Dites « OK Laura » ou appuyez sur la touche vocale du volant.</p>
      <ul class="thin-scrollbar mt-5 flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
        <li v-for="(m, i) in log" :key="i" class="max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px]" :class="m.from === 'me' ? 'self-end bg-surface-3' : 'bg-surface'">
          <small v-if="m.from === 'me'" class="block text-[11px] font-semibold text-ink-2">Transcription</small>{{ m.text }}
        </li>
      </ul>
      <form class="mt-3 flex items-center gap-2" @submit.prevent="ask(text)">
        <span class="grid size-11 place-items-center rounded-full" :class="ui.voice ? 'bg-accent text-on-accent' : 'bg-surface-2 text-accent'"><Icon name="mic" size="20" /></span>
        <input v-model="text" type="text" placeholder="Votre demande à Laura" aria-label="Demande à Laura" class="h-11 min-w-0 flex-1 rounded-full bg-surface-2 px-4 text-[15px] outline-none placeholder:text-ink-3" />
        <button type="submit" class="press grid size-11 place-items-center rounded-full bg-accent text-on-accent" aria-label="Envoyer"><Icon name="send" size="18" /></button>
      </form>
    </section>
    <aside class="flex flex-col gap-2.5 border-l border-line p-4">
      <h3 class="text-[15px] font-bold">Essayez</h3>
      <button v-for="s in SUGGESTIONS" :key="s" type="button" class="press rounded-2xl bg-surface p-3.5 text-left text-[14px] shadow-card" @click="ask(s)">« {{ s }} »</button>
    </aside>
  </div>
</template>
