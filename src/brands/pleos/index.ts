import type { BrandDefinition } from '@/core/brands'

export const pleos: BrandDefinition = {
  id: 'pleos',
  maker: 'Hyundai',
  system: 'Pleos Connect',
  model: 'Ioniq 3',
  summary: 'Simulateur web non officiel · d’après le manuel en ligne Pleos Connect',
  sizes: [
    { id: '12.9', label: '12,9″', width: 1280, height: 760 },
    { id: '14.6', label: '14,6″', width: 1440, height: 800 },
  ],
  defaultSize: '14.6',
  cockpit: () => import('./PleosCockpit.vue'),
}
