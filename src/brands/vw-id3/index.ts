import type { BrandDefinition } from '@/core/brands'
import type { VehicleSpec } from '@/core/vehicle/simulation'

/**
 * ID.3 Pro S (2024) : 77 kWh nets, jusqu'à 559 km WLTP, recharge CC jusqu'à 175 kW batterie préconditionnée
 * (Volkswagen Newsroom, communiqué 49/2024). Courbe calée sur ≈ 28 min de 10 à 80 % (relevés publics
 * ev-database). Sources détaillées : docs/models/vw-id3.md.
 */
export const ID3_SPEC: VehicleSpec = {
  batteryKwh: 77,
  kmPerPercent: 5.59,
  dcCurve: [
    [0, 100], [5, 170], [10, 175], [20, 168], [30, 155], [40, 136], [50, 118], [60, 99], [70, 84], [80, 68], [90, 45], [95, 28], [100, 8],
  ],
  acKw: 11,
}

export const vwId3: BrandDefinition = {
  id: 'vw-id3',
  maker: 'Volkswagen',
  system: 'ID. Software',
  model: 'ID.3',
  summary: 'Simulateur web non officiel · d’après le communiqué Volkswagen 49/2024 et les photos officielles de l’écran',
  tagline: 'Écran 12,9″, barre de climatisation, curseurs rétroéclairés, assistant IDA et ID. Light.',
  year: '2024',
  screenLabel: '12,9″ + Digital Cockpit',
  accent: '#1e8fff',
  vehicle: ID3_SPEC,
  driverDisplay: true,
  sizes: [{ id: '12.9', label: '12,9″', width: 1280, height: 800 }],
  defaultSize: '12.9',
  cockpit: () => import('./VwId3Cockpit.vue'),
}
