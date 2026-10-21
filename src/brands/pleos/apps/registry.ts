import type { Component } from 'vue'
import { isMarketApp, type AppId } from '../catalog'
import NavApp from './nav/NavApp.vue'
import BtAudioApp from './BtAudioApp.vue'
import RadioApp from './RadioApp.vue'
import PhoneApp from './PhoneApp.vue'
import GleoApp from './GleoApp.vue'
import EnergyApp from './EnergyApp.vue'
import MarketApp from './MarketApp.vue'
import ManualApp from './ManualApp.vue'
import ProjectionApp from './ProjectionApp.vue'
import BluelinkApp from './BluelinkApp.vue'
import InstalledApp from './InstalledApp.vue'

/** Composant et propriétés d'affichage de chaque app. */
export function resolveApp(id: AppId): { component: Component; props?: Record<string, unknown>; chrome: boolean } {
  if (isMarketApp(id)) return { component: InstalledApp, props: { id }, chrome: true }
  switch (id) {
    case 'nav':
      return { component: NavApp, chrome: false }
    case 'bta':
      return { component: BtAudioApp, chrome: true }
    case 'radio':
      return { component: RadioApp, chrome: true }
    case 'phone':
      return { component: PhoneApp, chrome: true }
    case 'gleo':
      return { component: GleoApp, chrome: true }
    case 'energy':
      return { component: EnergyApp, chrome: true }
    case 'market':
      return { component: MarketApp, chrome: true }
    case 'manual':
      return { component: ManualApp, chrome: true }
    case 'aa':
    case 'cp':
      return { component: ProjectionApp, props: { id }, chrome: true }
    case 'bluelink':
      return { component: BluelinkApp, chrome: true }
    default:
      return { component: BluelinkApp, chrome: true }
  }
}
