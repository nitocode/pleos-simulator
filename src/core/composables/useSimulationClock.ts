import { onMounted, onScopeDispose } from 'vue'
import { useVehicleStore } from '../vehicle/store'

/** Fait avancer la simulation du véhicule une fois par seconde tant que le composant est monté. */
export function useSimulationClock() {
  const vehicle = useVehicleStore()
  let id: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    id = setInterval(() => vehicle.tick(1), 1000)
  })
  onScopeDispose(() => clearInterval(id))
}
