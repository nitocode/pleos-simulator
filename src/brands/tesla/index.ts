import type { BrandDefinition } from '@/core/brands'
import type { VehicleSpec } from '@/core/vehicle/simulation'

/**
 * Model 3 Grande Autonomie Propulsion (2024+) : ~75 kWh utiles, pic de charge rapide de 250 kW,
 * courbe calée sur environ 27 min pour 10→80 % (25 à 28 min selon les relevés publics), CA 11 kW.
 * L'autonomie par % est une estimation (≈ 580 km réels).
 */
export const MODEL3_SPEC: VehicleSpec = {
  batteryKwh: 75,
  kmPerPercent: 5.8,
  dcCurve: [
    [0, 150], [5, 200], [10, 250], [20, 228], [30, 180], [40, 140], [50, 114], [60, 94], [70, 78], [80, 60], [90, 40], [95, 25], [100, 10],
  ],
  acKw: 11,
}

export const tesla: BrandDefinition = {
  id: 'tesla',
  maker: 'Tesla',
  system: 'Interface Tesla',
  model: 'Model 3',
  summary: 'Simulateur web non officiel · d’après le manuel du conducteur du Model 3',
  tagline: 'Un seul grand écran tactile : carte, climatisation et contrôles du véhicule.',
  year: '2024+',
  screenLabel: '15,4″ tactile, sans écran conducteur',
  accent: '#e31937',
  vehicle: MODEL3_SPEC,
  driverDisplay: false,
  sizes: [{ id: '15.4', label: '15,4″', width: 1280, height: 800 }],
  defaultSize: '15.4',
  cockpit: () => import('./TeslaCockpit.vue'),
}
