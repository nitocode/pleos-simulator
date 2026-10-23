import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useVehicleStore } from '@/core/vehicle/store'
import { understand, type VoiceTarget } from './voice'

describe('commandes vocales IDA / Laura', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('règle la température et ouvre la climatisation', () => {
    const v = useVehicleStore()
    const opened: VoiceTarget[] = []
    const reply = understand('Mets 22,5 degrés', v, (t) => opened.push(t))
    expect(v.climate.temp.L).toBe(22.5)
    expect(opened).toEqual(['climate'])
    expect(reply).toContain('22,5')
  })

  it('lance le guidage vers la maison', () => {
    const v = useVehicleStore()
    understand('Emmène-moi à la maison', v, () => {})
    expect(v.nav.destination?.id).toBe('home')
  })

  it('répond sur l’autonomie sans rien changer', () => {
    const v = useVehicleStore()
    expect(understand('Quelle est mon autonomie ?', v, () => {})).toContain(`${Math.round(v.battery)} %`)
    expect(v.nav.destination).toBeNull()
  })
})
