import { useVehicleStore } from '@/core/vehicle/store'
import type { FeatureKey } from '@/core/vehicle/features'
import type { BodyState, ChargeSettings } from '@/core/vehicle/types'
import { usePleosStore, type Prefs } from '../store/pleos'
import type { SettingKey } from '../data/settings'

type Value = string | number | boolean

/**
 * Lit et écrit la valeur désignée par une clé de paramètre (voir data/settings.ts).
 * Toute la logique de correspondance est ici : les composants d'affichage restent génériques.
 */
export function useSettingBinding() {
  const vehicle = useVehicleStore()
  const pleos = usePleosStore()

  function get(key: SettingKey): Value {
    const [ns, name] = key.split(':') as [string, string]
    switch (ns) {
      case 'f':
        return vehicle.features[name as FeatureKey]
      case 'p':
        return pleos.prefs[name as keyof Prefs]
      case 'c':
        return vehicle.charge[name as keyof ChargeSettings]
      case 'b':
        return vehicle.body[name as keyof BodyState]
      case 'v':
        return name === 'media' ? vehicle.media.volume : pleos.volumes[name as keyof typeof pleos.volumes]
    }
    return ''
  }

  function set(key: SettingKey, value: Value) {
    const [ns, name] = key.split(':') as [string, string]
    switch (ns) {
      case 'f':
        vehicle.setFeature(name as FeatureKey, value as never)
        break
      case 'p':
        ;(pleos.prefs as Record<string, Value>)[name] = value
        break
      case 'c':
        ;(vehicle.charge as unknown as Record<string, Value>)[name] = value
        break
      case 'b':
        if (vehicle.body[name as keyof BodyState] !== value) vehicle.toggleBody(name as keyof BodyState)
        break
      case 'v':
        if (name === 'media') vehicle.setVolume(Number(value))
        else pleos.volumes[name as keyof typeof pleos.volumes] = Number(value)
        break
    }
  }

  const toggle = (key: SettingKey) => set(key, !get(key))

  return { get, set, toggle }
}
