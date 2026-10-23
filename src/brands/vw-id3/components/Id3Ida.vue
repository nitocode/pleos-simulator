<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import { SUGGESTIONS, understand, type VoiceTarget } from '../../meb/voice'
import { useId3Base, type Id3Screen } from '../store'

/**
 * Assistant vocal IDA (photo officielle) : volet IDA / Activation / Astuces / Réglages, accueil « Bonjour, je suis IDA »,
 * carte « Bonne route ! », colonne « Suggestions ». Le champ de saisie remplace la voix dans le simulateur.
 */
const vehicle = useVehicleStore()
const ui = useId3Base()
const tab = ref<'IDA' | 'Activation' | 'Astuces' | 'Réglages'>('IDA')
const text = ref('')
const log = ref<{ from: 'me' | 'ida'; text: string }[]>([])
const TARGET: Record<VoiceTarget, Id3Screen> = { nav: 'nav', media: 'media', phone: 'phone', climate: 'climate', charge: 'charge' }

function ask(q: string) {
  const content = q.trim()
  if (!content) return
  log.value = [...log.value, { from: 'me' as const, text: content }].slice(-6)
  ui.voice = { phase: 'think', heard: content }
  text.value = ''
  setTimeout(() => {
    let goTo: Id3Screen | null = null
    const reply = understand(content, vehicle, (t) => (goTo = TARGET[t]))
    log.value = [...log.value, { from: 'ida' as const, text: reply }].slice(-6)
    ui.voice = { phase: 'talk', heard: content, reply }
    setTimeout(() => {
      if (ui.voice?.heard === content) ui.voice = null
      if (goTo) ui.open(goTo)
    }, 1600)
  }, 700)
}
const TABS = [
  ['IDA', 'audio-lines'],
  ['Activation', 'mic'],
  ['Astuces', 'info'],
  ['Réglages', 'settings'],
] as const
</script>

<template>
  <div class="grid h-full grid-cols-[220px_1fr_280px] gap-0">
    <nav class="flex flex-col gap-1 border-r border-line p-3" aria-label="IDA">
      <button v-for="[id, icon] in TABS" :key="id" type="button" class="press flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14.5px] font-semibold" :class="tab === id ? 'bg-accent text-on-accent' : 'text-ink-2'" @click="tab = id"><Icon :name="icon" size="18" />{{ id }}</button>
    </nav>
    <section class="flex min-h-0 flex-col p-6">
      <template v-if="tab === 'IDA'">
        <h2 class="text-[22px] font-bold">Bienvenue</h2>
        <p class="text-ink-2">Bonjour, je suis IDA, votre assistante vocale personnelle.</p>
        <div class="mt-4 flex items-center gap-3 rounded-2xl bg-surface-2 p-4"><Icon name="car-front" size="26" class="text-ok" /><span><b class="block">Bonne route !</b><small class="text-ink-2">Aucun message du véhicule</small></span></div>
        <ul class="thin-scrollbar mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
          <li v-for="(m, i) in log" :key="i" class="max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px]" :class="m.from === 'me' ? 'self-end bg-accent text-on-accent' : 'bg-surface-2'">{{ m.text }}</li>
          <li v-if="ui.voice?.phase === 'think'" class="flex gap-1 rounded-2xl bg-surface-2 px-4 py-3"><i v-for="n in 3" :key="n" class="animate-blink size-2 rounded-full bg-ink-2" :style="{ animationDelay: `${n * 0.15}s` }" /></li>
        </ul>
        <form class="mt-3 flex items-center gap-2" @submit.prevent="ask(text)">
          <span class="grid size-11 place-items-center rounded-full" :class="ui.voice ? 'bg-accent text-on-accent' : 'bg-surface-2 text-accent'"><Icon name="mic" size="20" /></span>
          <input v-model="text" type="text" placeholder="« Hello IDA… » puis votre demande" aria-label="Demande à IDA" class="h-11 min-w-0 flex-1 rounded-full bg-surface-2 px-4 text-[15px] outline-none placeholder:text-ink-3" />
          <button type="submit" class="press grid size-11 place-items-center rounded-full bg-accent text-on-accent" aria-label="Envoyer"><Icon name="send" size="18" /></button>
        </form>
      </template>
      <div v-else-if="tab === 'Activation'" class="text-[15px] leading-relaxed text-ink-2"><h2 class="mb-2 text-[22px] font-bold text-ink">Activation</h2>Dites « Hello IDA » ou appuyez sur la touche de commande vocale du volant. IDA comprend le langage naturel et répond aussi à des questions générales.</div>
      <div v-else-if="tab === 'Astuces'" class="text-[15px] leading-relaxed text-ink-2"><h2 class="mb-2 text-[22px] font-bold text-ink">Astuces</h2><p v-for="s in SUGGESTIONS" :key="s">« {{ s }} »</p></div>
      <div v-else class="text-[15px] leading-relaxed text-ink-2"><h2 class="mb-2 text-[22px] font-bold text-ink">Réglages</h2>Mot d’activation, voix et réponses de l’assistant : réglages de démonstration.</div>
    </section>
    <aside class="flex flex-col gap-3 bg-surface-2/60 p-4">
      <h3 class="text-[15px] font-bold">Suggestions</h3>
      <button v-for="s in SUGGESTIONS.slice(0, 4)" :key="s" type="button" class="press rounded-2xl bg-surface p-3.5 text-left text-[14px] shadow-card" @click="tab = 'IDA'; ask(s)">« {{ s }} »</button>
    </aside>
  </div>
</template>
