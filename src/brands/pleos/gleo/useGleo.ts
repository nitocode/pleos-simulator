import { ref } from 'vue'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore } from '../store/pleos'
import { interpret } from './intents'

/** Fiche du manuel affichée (partagée entre l'app Manuel, la recherche globale et Gleo). */
export const manualSelection = ref('zones')

export function openManual(id: string) {
  manualSelection.value = id
  const pleos = usePleosStore()
  pleos.gleo = null
  pleos.launch('manual')
}

let talkTimer: ReturnType<typeof setTimeout> | undefined

/** Envoie une demande à Gleo : écoute → réflexion → réponse, puis retour à l'écoute. */
export function askGleo(text: string) {
  const content = text.trim()
  if (!content) return
  const pleos = usePleosStore()
  const vehicle = useVehicleStore()
  pleos.panel = null
  pleos.gleo = { phase: 'think', heard: content }
  pleos.gleoHistory = [...pleos.gleoHistory, { from: 'user', text: content }]
  clearTimeout(talkTimer)
  setTimeout(() => {
    const reply = interpret(content, { vehicle, pleos })
    pleos.gleoHistory = [...pleos.gleoHistory, { from: 'gleo', text: reply.text }]
    if (!pleos.prefs.gleoHistory && pleos.gleoHistory.length > 8) pleos.gleoHistory = pleos.gleoHistory.slice(-6)
    pleos.gleo = {
      phase: 'talk',
      heard: content,
      reply: reply.text,
      link: reply.link ? { label: reply.link.label, manualId: reply.link.manualId } : undefined,
    }
    talkTimer = setTimeout(() => {
      if (pleos.gleo?.phase === 'talk' && pleos.gleo.heard === content) pleos.gleo = { ...pleos.gleo, phase: 'listen' }
    }, 2800)
  }, 650)
}
