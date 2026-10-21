/**
 * Politique de fenêtres Pleos Connect-S (document.pleos.ai › Window Policy) :
 * - la zone d'apps vaut 2 unités, la vue de conduite 1 unité ;
 * - 2 apps : 1:1 (portrait) ; 1 app : 2:0 (paysage) ;
 * - une nouvelle app s'ouvre dans la fenêtre principale avec l'orientation courante ;
 * - une app retirée de l'écran n'est pas fermée : elle reste dans la pile ;
 * - la navigation (app par défaut) ne peut pas être fermée ;
 * - la caméra de recul s'affiche en 3:0, par-dessus la vue de conduite.
 */

export type Layout = 'split' | 'full'

export interface WindowState<Id extends string = string> {
  /** Apps lancées, la plus récemment activée en tête. */
  stack: Id[]
  layout: Layout
}

export const DEFAULT_APP = 'nav'

export function visibleApps<Id extends string>(s: WindowState<Id>): Id[] {
  if (s.layout === 'full' || s.stack.length < 2) return s.stack.slice(0, 1)
  return s.stack.slice(0, 2)
}

export function effectiveLayout(s: WindowState): Layout {
  return s.stack.length < 2 ? 'full' : s.layout
}

/** Ouvre une app : si elle est déjà affichée, rien ne bouge ; sinon elle prend la fenêtre principale. */
export function openApp<Id extends string>(s: WindowState<Id>, id: Id): WindowState<Id> {
  if (visibleApps(s).includes(id)) return s
  return { ...s, stack: [id, ...s.stack.filter((x) => x !== id)] }
}

/** Ferme une app affichée ; la suivante dans l'ordre d'activation reprend sa place. */
export function closeApp<Id extends string>(s: WindowState<Id>, id: Id): WindowState<Id> | null {
  if (id === DEFAULT_APP) return null
  const stack = s.stack.filter((x) => x !== id)
  if (stack.length === 0) return { stack: [DEFAULT_APP as Id], layout: 'full' }
  return { ...s, stack }
}

/** Inverse les deux fenêtres (appui sur la barre de fenêtre ou balayage à trois doigts). */
export function swapWindows<Id extends string>(s: WindowState<Id>): WindowState<Id> {
  if (effectiveLayout(s) !== 'split') return s
  const [a, b, ...rest] = s.stack
  return { ...s, stack: [b!, a!, ...rest] }
}

/** Bouton « fenêtre d'app » : bascule entre paysage (2:0) et portrait (1:1). */
export function toggleLayout<Id extends string>(s: WindowState<Id>, focus?: Id): WindowState<Id> {
  if (effectiveLayout(s) === 'split') {
    const stack = focus ? [focus, ...s.stack.filter((x) => x !== focus)] : s.stack
    return { stack, layout: 'full' }
  }
  if (s.stack.length < 2) {
    const fallback = (s.stack[0] === DEFAULT_APP ? null : DEFAULT_APP) as Id | null
    if (!fallback) return s
    return { stack: [...s.stack, fallback], layout: 'split' }
  }
  return { ...s, layout: 'split' }
}
