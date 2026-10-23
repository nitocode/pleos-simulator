import type { BrandDefinition } from '@/core/brands'
import { pleos } from './pleos'
import { tesla } from './tesla'
import { vwId3 } from './vw-id3'
import { skodaEnyaq } from './skoda-enyaq'

/** Interfaces disponibles. Ajouter une marque ici après avoir créé src/brands/<id>/. */
export const BRANDS: BrandDefinition[] = [pleos, tesla, vwId3, skodaEnyaq]
