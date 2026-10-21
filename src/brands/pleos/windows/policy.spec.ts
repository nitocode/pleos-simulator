import { describe, expect, it } from 'vitest'
import { closeApp, effectiveLayout, openApp, swapWindows, toggleLayout, visibleApps, type WindowState } from './policy'

const initial: WindowState = { stack: ['nav', 'bta'], layout: 'split' }

describe('politique de fenêtres Pleos Connect-S', () => {
  it('affiche la navigation et le média côte à côte au démarrage', () => {
    expect(visibleApps(initial)).toEqual(['nav', 'bta'])
  })

  it('ouvre une nouvelle app dans la fenêtre principale sans fermer les autres', () => {
    const s = openApp(initial, 'phone')
    expect(visibleApps(s)).toEqual(['phone', 'nav'])
    expect(s.stack).toContain('bta')
  })

  it('ne déplace pas une app déjà affichée', () => {
    expect(openApp(initial, 'bta')).toBe(initial)
  })

  it('garde l’orientation paysage pour une nouvelle app', () => {
    const full: WindowState = { stack: ['radio', 'nav'], layout: 'full' }
    const s = openApp(full, 'phone')
    expect(effectiveLayout(s)).toBe('full')
    expect(visibleApps(s)).toEqual(['phone'])
  })

  it('refuse de fermer la navigation', () => {
    expect(closeApp(initial, 'nav')).toBeNull()
  })

  it('fait réapparaître l’app activée juste avant après une fermeture', () => {
    const s = openApp(initial, 'phone')
    const closed = closeApp(s, 'phone')!
    expect(visibleApps(closed)).toEqual(['nav', 'bta'])
  })

  it('inverse les fenêtres', () => {
    expect(visibleApps(swapWindows(initial))).toEqual(['bta', 'nav'])
  })

  it('passe en paysage avec l’app choisie puis revient en portrait', () => {
    const full = toggleLayout(initial, 'bta')
    expect(visibleApps(full)).toEqual(['bta'])
    expect(visibleApps(toggleLayout(full))).toEqual(['bta', 'nav'])
  })

  it('complète avec la navigation quand une seule app tourne', () => {
    const single: WindowState = { stack: ['radio'], layout: 'full' }
    expect(visibleApps(toggleLayout(single))).toEqual(['radio', 'nav'])
  })
})
