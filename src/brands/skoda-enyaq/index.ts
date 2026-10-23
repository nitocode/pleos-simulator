import type { BrandDefinition } from '@/core/brands'
import type { VehicleSpec } from '@/core/vehicle/simulation'

/**
 * Enyaq 85 (2024, propulsion) : 77 kWh nets, ≈ 565 km WLTP, recharge CC jusqu'à 135 kW (175 kW pour l'Enyaq 85x),
 * courbe calée sur ≈ 28 min de 10 à 80 % (relevés publics ev-database). Sources : docs/models/skoda-enyaq.md.
 */
export const ENYAQ_SPEC: VehicleSpec = {
  batteryKwh: 77,
  kmPerPercent: 5.65,
  dcCurve: [
    [0, 90], [5, 132], [10, 135], [30, 135], [40, 130], [50, 120], [60, 106], [70, 92], [80, 76], [90, 48], [95, 30], [100, 8],
  ],
  acKw: 11,
}

export const skodaEnyaq: BrandDefinition = {
  id: 'skoda-enyaq',
  maker: 'Škoda',
  system: 'Infotainment Škoda',
  model: 'Enyaq',
  summary: 'Simulateur web non officiel · d’après le dossier de presse et les infographies « Explore Enyaq 2024 »',
  tagline: 'Écran 13″, nouvelle identité Škoda : raccourcis favoris, Laura et climatisation en un geste.',
  year: '2024',
  screenLabel: '13″ + Virtual Cockpit',
  accent: '#78faae',
  vehicle: ENYAQ_SPEC,
  driverDisplay: true,
  sizes: [{ id: '13', label: '13″', width: 1280, height: 720 }],
  defaultSize: '13',
  cockpit: () => import('./SkodaEnyaqCockpit.vue'),
}
