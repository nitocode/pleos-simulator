import { defineStore } from 'pinia'
import { computed, reactive, ref, type Ref } from 'vue'
import type { IconName } from '@/core/ui/icons'

/**
 * État d'écran commun aux interfaces du groupe Volkswagen sur plateforme MEB (ID.3, Enyaq) : écran affiché,
 * messages, mode nuit, assistant vocal, raccourcis, préréglage de climatisation. Chaque marque crée son propre
 * store avec cette fabrique (identifiant distinct), puis l'habille à sa façon.
 */
export interface VoiceState {
  phase: 'listen' | 'think' | 'talk'
  heard?: string
  reply?: string
}

export function defineMebStore<S extends string, F extends string>(id: string, home: S, favourites: F[]) {
  return defineStore(id, () => {
    const screen = ref(home) as Ref<S>
    const previous = ref(null) as Ref<S | null>
    const toast = ref<{ id: number; text: string; icon: IconName } | null>(null)
    const forcedNight = ref<boolean | null>(null)
    const voice = ref<VoiceState | null>(null)
    const favs = ref([...favourites]) as Ref<F[]>
    const editing = ref(false)
    /** Préréglage de climatisation intelligente actif (ex. « Pieds chauds »). */
    const preset = ref<string | null>(null)
    const prefs = reactive({ displayMode: 'Auto' as 'Auto' | 'Jour' | 'Nuit', brightness: 80, tempUnit: '°C' as '°C' | '°F', clock24: true })
    let toastTimer: ReturnType<typeof setTimeout> | undefined
    let toastId = 0

    /** Nuit : forcée par la simulation, sinon selon le réglage d'affichage (Auto : de 19 h à 7 h). */
    const night = computed(() => {
      if (prefs.displayMode === 'Nuit') return true
      if (prefs.displayMode === 'Jour') return false
      if (forcedNight.value !== null) return forcedNight.value
      const h = new Date().getHours()
      return h >= 19 || h < 7
    })

    function open(s: S) {
      if (s !== screen.value) previous.value = screen.value
      screen.value = s
      voice.value = null
    }
    function back() {
      screen.value = previous.value ?? home
      previous.value = null
    }
    function notify(text: string, icon: IconName = 'check') {
      clearTimeout(toastTimer)
      toast.value = { id: ++toastId, text, icon }
      toastTimer = setTimeout(() => (toast.value = null), 2600)
    }
    function toggleFav(f: F, max: number) {
      favs.value = favs.value.includes(f) ? favs.value.filter((x) => x !== f) : [...favs.value, f].slice(-max)
    }

    return { screen, previous, toast, forcedNight, voice, favs, editing, preset, prefs, night, open, back, notify, toggleFav }
  })
}
