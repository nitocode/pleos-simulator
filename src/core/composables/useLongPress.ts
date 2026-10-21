import type { Directive } from 'vue'

/**
 * v-long-press="handler" : appel après un appui maintenu (650 ms).
 * Le clic qui suit un appui long est annulé pour ne pas déclencher l'action simple.
 */
type El = HTMLElement & { __lp?: { cleanup: () => void } }

export const vLongPress: Directive<El, () => void> = {
  mounted(el, binding) {
    let timer: ReturnType<typeof setTimeout> | undefined
    let fired = false
    const start = (e: PointerEvent) => {
      if (e.button !== 0) return
      fired = false
      timer = setTimeout(() => {
        fired = true
        binding.value()
      }, 650)
    }
    const cancel = () => clearTimeout(timer)
    const swallow = (e: MouseEvent) => {
      if (fired) {
        e.stopImmediatePropagation()
        e.preventDefault()
        fired = false
      }
    }
    el.addEventListener('pointerdown', start)
    el.addEventListener('pointerup', cancel)
    el.addEventListener('pointerleave', cancel)
    el.addEventListener('pointercancel', cancel)
    el.addEventListener('click', swallow, true)
    el.__lp = {
      cleanup: () => {
        cancel()
        el.removeEventListener('pointerdown', start)
        el.removeEventListener('pointerup', cancel)
        el.removeEventListener('pointerleave', cancel)
        el.removeEventListener('pointercancel', cancel)
        el.removeEventListener('click', swallow, true)
      },
    }
  },
  unmounted(el) {
    el.__lp?.cleanup()
  },
}
