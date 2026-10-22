import type { Component } from 'vue'
import type { VehicleSpec } from './vehicle/simulation'

/** Taille d'écran proposée par une interface, en pixels « véhicule » (mis à l'échelle à l'affichage). */
export interface ScreenSize {
  id: string
  label: string
  width: number
  height: number
}

/**
 * Description d'une interface de marque. Ajouter une marque :
 * 1. créer src/brands/<id>/ avec son thème, ses composants et un index.ts exportant une BrandDefinition ;
 * 2. l'ajouter à BRANDS dans src/brands/index.ts.
 * Le banc d'essai, la simulation du véhicule et le routage sont fournis par src/core.
 */
export interface BrandDefinition {
  id: string
  maker: string
  system: string
  model: string
  summary: string
  /** Accroche affichée sur la page d'accueil. */
  tagline: string
  /** Millésime et description de l'écran, pour la page d'accueil. */
  year: string
  screenLabel: string
  /** Couleur d'accent de la carte d'accueil. */
  accent: string
  /** Caractéristiques de la batterie et de la charge du modèle simulé. */
  vehicle: VehicleSpec
  /** Le modèle a-t-il un écran conducteur distinct de l'écran central ? */
  driverDisplay: boolean
  sizes: ScreenSize[]
  defaultSize: string
  /** Chargé à la demande : chaque marque est un chunk séparé. */
  cockpit: () => Promise<{ default: Component }>
}
