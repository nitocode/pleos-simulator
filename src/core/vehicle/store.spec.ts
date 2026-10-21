import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useVehicleStore } from './store'
import { PLACES } from './data'

describe('véhicule simulé', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('refuse de passer en P en roulant', () => {
    const v = useVehicleStore()
    v.setGear('D')
    v.setSpeed(60)
    expect(v.setGear('P')).toBe(false)
    expect(v.gear).toBe('D')
  })

  it('limite la vitesse selon le rapport', () => {
    const v = useVehicleStore()
    v.setSpeed(50)
    expect(v.speed).toBe(0)
    v.setGear('R')
    v.setSpeed(50)
    expect(v.speed).toBe(15)
  })

  it('consomme la batterie et rapproche la destination en roulant', () => {
    const v = useVehicleStore()
    v.navigateTo(PLACES[0]!)
    v.setGear('D')
    v.setSpeed(90)
    const battery = v.battery
    v.tick(1)
    expect(v.nav.remainingKm).toBeCloseTo(PLACES[0]!.km - 0.5, 1)
    expect(v.battery).toBeLessThan(battery)
  })

  it('recharge jusqu’à la limite puis le signale', () => {
    const v = useVehicleStore()
    const events: string[] = []
    v.onEvent((e) => events.push(e.type))
    v.battery = 79.9
    v.setPlug('dc')
    for (let i = 0; i < 5; i++) v.tick(1)
    expect(v.battery).toBe(80)
    expect(events).toContain('charge-complete')
  })

  it('synchronise la température passager tant que SYNC est actif', () => {
    const v = useVehicleStore()
    v.setTemp('L', 23.5)
    expect(v.climate.temp.R).toBe(23.5)
    v.setTemp('R', 20)
    expect(v.climate.sync).toBe(false)
  })

  it('n’active jamais chauffage et ventilation du même siège', () => {
    const v = useVehicleStore()
    v.cycleSeat('L', 'heat')
    v.cycleSeat('L', 'vent')
    expect(v.climate.seatHeat.L).toBe(0)
    expect(v.climate.seatVent.L).toBe(3)
  })
})
