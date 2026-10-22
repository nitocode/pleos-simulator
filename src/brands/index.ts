import type { BrandDefinition } from '@/core/brands'
import { pleos } from './pleos'
import { tesla } from './tesla'

/** Interfaces disponibles. Ajouter une marque ici après avoir créé src/brands/<id>/. */
export const BRANDS: BrandDefinition[] = [pleos, tesla]
