<script lang="ts">
import { ref } from 'vue'
const tab = ref<'recent' | 'contacts' | 'messages' | 'keypad'>('recent')
const dial = ref('')
</script>

<script setup lang="ts">
import { computed, onScopeDispose } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { mmss } from '@/core/format'
import { CONTACTS, MESSAGES, RECENT_CALLS } from '@/core/vehicle/data'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore } from '../store/pleos'

/** Appel/message : appels récents, contacts, messages, clavier, et écran d'appel en cours. */
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const elapsed = ref(0)
const id = setInterval(() => {
  if (vehicle.call?.status === 'active') elapsed.value = (Date.now() - vehicle.call.startedAt) / 1000
}, 500)
onScopeDispose(() => clearInterval(id))

const callLabel = computed(() =>
  !vehicle.call ? '' : vehicle.call.status === 'incoming' ? 'Appel entrant' : vehicle.call.status === 'dialing' ? 'Appel en cours…' : mmss(elapsed.value),
)
function press(k: string) {
  dial.value = k === 'del' ? dial.value.slice(0, -1) : (dial.value + k).slice(0, 14)
}
function call(n: string) {
  if (!n) return pleos.notify('Composez un numéro', 'keypad')
  vehicle.dial(n)
}
function read(m: { from: string; text: string }) {
  pleos.gleo = { phase: 'talk', heard: 'Lire mes derniers messages', reply: `Message de ${m.from} : ${m.text}` }
}
</script>

<template>
  <div class="relative h-full">
    <Transition name="fade" mode="out-in">
      <div v-if="vehicle.call" key="call" class="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-ok/10 to-transparent">
        <span class="grid size-24 place-items-center rounded-full bg-surface-3 text-[36px] font-bold">{{ vehicle.call.name[0] }}</span>
        <b class="text-[24px]">{{ vehicle.call.name }}</b>
        <span class="tnum text-[16px] text-ink-2">{{ callLabel }}</span>
        <div class="mt-4 flex gap-6">
          <button v-if="vehicle.call.status === 'incoming'" type="button" class="press grid size-16 place-items-center rounded-full bg-ok text-white" aria-label="Répondre" @click="vehicle.answer()"><Icon name="phone" size="28" /></button>
          <button type="button" class="press grid size-16 place-items-center rounded-full bg-crit text-white" aria-label="Raccrocher" @click="vehicle.hangUp(); pleos.notify('Appel terminé', 'phone-off')"><Icon name="phone-off" size="28" /></button>
        </div>
      </div>
      <div v-else-if="!vehicle.features.bluetooth" key="off" class="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-ink-2">
        <Icon name="bluetooth" size="40" />
        <b class="text-ink">Aucun téléphone connecté</b>
        <span>Activez le Bluetooth dans Paramètres › Connexions.</span>
        <button type="button" class="press mt-2 h-11 rounded-xl bg-accent px-5 font-semibold text-on-accent" @click="vehicle.setFeature('bluetooth', true)">Activer le Bluetooth</button>
      </div>
      <div v-else key="main" class="flex h-full flex-col">
        <div class="no-scrollbar flex gap-6 overflow-x-auto border-b border-line px-5">
          <button
            v-for="t in ([['recent', 'Appels récents'], ['contacts', 'Contacts'], ['messages', 'Messages'], ['keypad', 'Clavier']] as const)"
            :key="t[0]"
            type="button"
            class="relative py-3 text-[15px] font-bold whitespace-nowrap transition-colors"
            :class="tab === t[0] ? 'text-accent' : 'text-ink-2'"
            @click="tab = t[0]"
          >
            {{ t[1] }}<span class="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-accent transition-transform duration-300" :class="tab === t[0] ? 'scale-x-100' : 'scale-x-0'" />
          </button>
        </div>
        <div class="thin-scrollbar min-h-0 flex-1 overflow-auto p-3">
          <Transition name="fade" mode="out-in">
            <div v-if="tab === 'recent'" key="recent">
              <button v-for="r in RECENT_CALLS" :key="r.name" type="button" class="press flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-surface-2" @click="call(r.name)">
                <span class="grid size-10 place-items-center rounded-xl bg-surface-2" :class="r.direction === 'missed' ? 'text-crit' : 'text-ink-2'"><Icon :name="r.direction === 'in' ? 'phone-in' : r.direction === 'missed' ? 'phone-missed' : 'phone-out'" size="20" /></span>
                <span class="min-w-0 flex-1"><b class="block truncate">{{ r.name }}</b><small class="text-ink-2">{{ r.when }}</small></span>
                <Icon name="phone" size="20" class="text-ok" />
              </button>
            </div>
            <div v-else-if="tab === 'contacts'" key="contacts">
              <button v-for="c in CONTACTS" :key="c" type="button" class="press flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-surface-2" @click="call(c)">
                <span class="grid size-10 place-items-center rounded-full bg-surface-3 font-bold">{{ c[0] }}</span>
                <span class="min-w-0 flex-1"><b class="block truncate">{{ c }}</b><small class="text-ink-2">Mobile</small></span>
                <Icon name="phone" size="20" class="text-ok" />
              </button>
            </div>
            <div v-else-if="tab === 'messages'" key="messages">
              <button v-for="m in MESSAGES" :key="m.from" type="button" class="press flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-surface-2" @click="read(m)">
                <span class="grid size-10 place-items-center rounded-xl bg-surface-2 text-ink-2"><Icon name="message" size="20" /></span>
                <span class="min-w-0 flex-1"><b class="block truncate">{{ m.from }}</b><small class="block truncate text-ink-2">{{ m.text }}</small></span>
                <span class="text-[12px] text-ink-3">{{ m.when }}</span>
              </button>
              <p class="px-3 pt-2 text-[13px] text-ink-3">Touchez un message pour que Gleo le lise à voix haute.</p>
            </div>
            <div v-else key="keypad" class="mx-auto flex max-w-[340px] flex-col gap-3 pt-2">
              <div class="tnum h-12 text-center text-[32px] font-light tracking-wider">{{ dial || ' ' }}</div>
              <div class="grid grid-cols-3 gap-2.5">
                <button v-for="k in '123456789*0#'.split('')" :key="k" type="button" class="press h-14 rounded-2xl bg-surface-2 text-[26px] font-light" @click="press(k)">{{ k }}</button>
                <span />
                <button type="button" class="press grid h-14 place-items-center rounded-2xl bg-ok text-white" aria-label="Appeler" @click="call(dial)"><Icon name="phone" size="24" /></button>
                <button type="button" class="press grid h-14 place-items-center rounded-2xl bg-surface-2" aria-label="Effacer" @click="press('del')"><Icon name="backspace" size="24" /></button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
</template>
