import { onScopeDispose, ref } from 'vue'

/** Heure courante réactive, rafraîchie toutes les 15 secondes. */
export function useNow(intervalMs = 15000) {
  const now = ref(new Date())
  const id = setInterval(() => (now.value = new Date()), intervalMs)
  onScopeDispose(() => clearInterval(id))
  return now
}
