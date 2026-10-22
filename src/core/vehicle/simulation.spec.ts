import { describe, expect, it } from 'vitest'
import type { ChargeSettings } from './types'
import { MODEL3_SPEC } from '@/brands/tesla'
import { BRANDS } from '@/brands'
import { IONIQ3_SPEC, chargeKw, chargeMinutes, chargeStatus, nextBatteryTemp, tempFactor } from './simulation'

const DEFAULT_CHARGE: ChargeSettings = {
  acLimit: 100, dcLimit: 80, acCurrent: 'Maximum', scheduled: false, departure: '07:30', cableLock: 'Pendant la charge',
  plugAndCharge: true, minLevel: 20, voiceMessage: true, preconditioning: true,
}
const warm = { batteryTemp: 28, chargerKw: 350 }

describe('courbe de charge', () => {
  it('atteint 10→80 % en environ 30 min sur borne 350 kW, batterie chaude (chiffre Hyundai)', () => {
    const min = chargeMinutes(10, 80, 'dc', DEFAULT_CHARGE, warm)
    expect(min).toBeGreaterThan(28)
    expect(min).toBeLessThan(32)
  })

  it('plafonne à 110 kW et ralentit en fin de charge', () => {
    expect(chargeKw(20, 'dc', DEFAULT_CHARGE, warm)).toBeLessThanOrEqual(110)
    expect(chargeKw(20, 'dc', DEFAULT_CHARGE, warm)).toBeGreaterThan(105)
    expect(chargeKw(90, 'dc', DEFAULT_CHARGE, warm)).toBeLessThan(chargeKw(60, 'dc', DEFAULT_CHARGE, warm))
  })

  it('est limitée par la puissance de la borne', () => {
    expect(chargeKw(20, 'dc', DEFAULT_CHARGE, { batteryTemp: 28, chargerKw: 50 })).toBe(50)
    expect(chargeMinutes(10, 80, 'dc', DEFAULT_CHARGE, { batteryTemp: 28, chargerKw: 50 })).toBeGreaterThan(chargeMinutes(10, 80, 'dc', DEFAULT_CHARGE, warm))
  })

  it('perd de la puissance quand la batterie est froide', () => {
    expect(tempFactor(0)).toBeCloseTo(0.3)
    expect(tempFactor(30)).toBe(1)
    expect(chargeKw(30, 'dc', DEFAULT_CHARGE, { batteryTemp: 0, chargerKw: 350 })).toBeLessThan(chargeKw(30, 'dc', DEFAULT_CHARGE, warm) / 2)
  })

  it('suit le courant CA choisi et reste sous 11 kW', () => {
    expect(chargeKw(40, 'ac', { ...DEFAULT_CHARGE, acCurrent: 'Maximum' })).toBe(11)
    expect(chargeKw(40, 'ac', { ...DEFAULT_CHARGE, acCurrent: 'Minimum' })).toBe(3.7)
    expect(chargeKw(100, 'ac', DEFAULT_CHARGE)).toBeLessThan(11)
  })

  it('chauffe la batterie en charge et la refroidit à l’arrêt', () => {
    const idle = { kw: 0, speed: 0, outside: 10, preheat: false }
    expect(nextBatteryTemp(20, 600, { ...idle, kw: 100 })).toBeGreaterThan(20)
    expect(nextBatteryTemp(30, 3600, idle)).toBeLessThan(30)
    expect(nextBatteryTemp(10, 600, { ...idle, preheat: true })).toBeGreaterThan(10)
  })

  it('annonce la charge terminée à la limite', () => {
    expect(chargeStatus(80, 'dc', DEFAULT_CHARGE, warm).charging).toBe(false)
    expect(chargeStatus(40, 'dc', DEFAULT_CHARGE, warm).minutesLeft).toBeGreaterThan(0)
  })
})

describe('modèles', () => {
  it('Model 3 : 10→80 % en 25 à 28 min sur Superchargeur, comme les relevés publics', () => {
    const min = chargeMinutes(10, 80, 'dc', DEFAULT_CHARGE, { ...warm, spec: MODEL3_SPEC })
    expect(min).toBeGreaterThan(24)
    expect(min).toBeLessThan(29)
    expect(chargeKw(10, 'dc', DEFAULT_CHARGE, { ...warm, spec: MODEL3_SPEC })).toBeGreaterThan(chargeKw(10, 'dc', DEFAULT_CHARGE, { ...warm, spec: IONIQ3_SPEC }))
  })

  it('chaque interface déclare une courbe de charge complète de 0 à 100 %', () => {
    for (const b of BRANDS) {
      const c = b.vehicle.dcCurve
      expect(c[0]![0]).toBe(0)
      expect(c[c.length - 1]![0]).toBe(100)
      expect(b.vehicle.batteryKwh).toBeGreaterThan(30)
    }
    expect(new Set(BRANDS.map((b) => b.id)).size).toBe(BRANDS.length)
  })
})
