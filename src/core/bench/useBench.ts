import { defineStore } from 'pinia'
import { ref } from 'vue'

export type BenchView = 'cockpit' | 'central' | 'driver'

/** Réglages du banc d'essai : vue affichée et taille d'écran. */
export const useBenchStore = defineStore('bench', () => {
  const view = ref<BenchView>('cockpit')
  const size = ref('')
  return { view, size }
})
