import type { BrandDefinition } from '@/core/brands'
import { IONIQ3_SPEC } from '@/core/vehicle/simulation'

export const pleos: BrandDefinition = {
  id: 'pleos',
  maker: 'Hyundai',
  system: 'Pleos Connect',
  model: 'Ioniq 3',
  summary: 'Simulateur web non officiel · d’après le manuel en ligne Pleos Connect',
  tagline: 'Écran 3 zones, zone de contrôle, Gleo AI et écran plat conducteur.',
  year: '2027',
  screenLabel: '12,9″ ou 14,6″ + écran plat',
  accent: '#2f7bf6',
  vehicle: IONIQ3_SPEC,
  driverDisplay: true,
  sizes: [
    { id: '12.9', label: '12,9″', width: 1280, height: 760 },
    { id: '14.6', label: '14,6″', width: 1440, height: 800 },
  ],
  defaultSize: '14.6',
  cockpit: () => import('./PleosCockpit.vue'),
}
