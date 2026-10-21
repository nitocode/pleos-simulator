import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore } from '../store/pleos'
import { interpret } from './intents'

describe('Gleo AI', () => {
  let ctx: { vehicle: ReturnType<typeof useVehicleStore>; pleos: ReturnType<typeof usePleosStore> }
  beforeEach(() => {
    setActivePinia(createPinia())
    ctx = { vehicle: useVehicleStore(), pleos: usePleosStore() }
  })

  it('enchaîne plusieurs commandes dans une même phrase', () => {
    const r = interpret('Mets 20 degrés et active le chauffage du siège', ctx)
    expect(ctx.vehicle.climate.temp.L).toBe(20)
    expect(ctx.vehicle.climate.seatHeat.L).toBe(2)
    expect(r.text).toContain('20,0 °C')
  })

  it('lance un itinéraire et affiche la navigation', () => {
    interpret('Aller à : Gare de Lyon', ctx)
    expect(ctx.vehicle.nav.destination?.name).toBe('Gare de Lyon')
    expect(ctx.pleos.visible).toContain('nav')
  })

  it('répond aux questions avec le manuel', () => {
    const r = interpret('Comment passer en écran partagé ?', ctx)
    expect(r.link?.manualId).toBe('split')
  })

  it('appelle un contact', () => {
    interpret('Appeler Camille Martin', ctx)
    expect(ctx.vehicle.call?.name).toBe('Camille Martin')
  })

  it('refuse d’ouvrir le coffre en roulant', () => {
    ctx.vehicle.setGear('D')
    ctx.vehicle.setSpeed(50)
    expect(interpret('Ouvrir le coffre', ctx).text).toContain('à l’arrêt')
    expect(ctx.vehicle.body.trunkOpen).toBe(false)
  })

  it('signale une demande incomprise', () => {
    expect(interpret('blabla', ctx).text).toContain('pas compris')
  })
})
