<script setup lang="ts">
import { onScopeDispose, watch } from 'vue'
import BenchShell from '@/core/bench/BenchShell.vue'
import Icon from '@/core/ui/Icon.vue'
import ScaledScreen from '@/core/ui/ScaledScreen.vue'
import { useBenchStore } from '@/core/bench/useBench'
import { useSimulationClock } from '@/core/composables/useSimulationClock'
import { useVehicleStore } from '@/core/vehicle/store'
import { BRANDS } from '@/brands'
import { pleos as brand } from './index'
import { usePleosStore } from './store/pleos'
import TouchScreen from './components/screen/TouchScreen.vue'
import FlatDisplay from './components/FlatDisplay.vue'
import PhysicalControls from './components/hardware/PhysicalControls.vue'
import './theme.css'

const vehicle = useVehicleStore()
const pleos = usePleosStore()
const bench = useBenchStore()
useSimulationClock()

// Les événements du véhicule s'affichent en toast, comme sur l'écran réel.
const off = vehicle.onEvent((e) => {
  if (e.type === 'arrived') pleos.notify(`Vous êtes arrivé : ${e.place}`, 'arrive')
  if (e.type === 'charge-complete') pleos.notify('Charge terminée', 'battery-charging')
  if (e.type === 'auto-locked') pleos.notify('Portes verrouillées automatiquement', 'lock')
  if (e.type === 'gear-refused') pleos.notify(e.reason === 'moving' ? `Arrêtez le véhicule avant de passer en ${e.gear}` : e.reason === 'off' ? 'Démarrez le véhicule pour changer de rapport' : 'Débranchez le câble de charge', 'warning')
  if (e.type === 'power-refused') pleos.notify('Arrêtez le véhicule et passez en P pour l’éteindre', 'warning')
  if (e.type === 'power' && !e.on) {
    pleos.panel = null
    pleos.gleo = null
    pleos.cameraFull = false
  }
})
onScopeDispose(() => off())

// Marche arrière : la vue de la caméra s'ouvre en 3:0 et se referme en quittant R (sauf réglage contraire).
watch(
  () => vehicle.gear,
  (g, prev) => {
    if (g === 'R') {
      pleos.gleo = null
      pleos.panel = null
      pleos.cameraFull = true
    } else if (prev === 'R' && !vehicle.features.keepRearCamera) pleos.cameraFull = false
  },
)
watch(
  () => vehicle.speed,
  (s) => {
    if (s > 10 && pleos.cameraFull && vehicle.gear !== 'R') pleos.cameraFull = false
  },
)

// Manuel Connect-S : le Standmodus s'arrête au changement de rapport, le mode lavage au-delà de 20 km/h.
watch(
  () => vehicle.gear,
  () => {
    if (vehicle.features.utilityMode) {
      vehicle.setFeature('utilityMode', false)
      pleos.notify('Standmodus désactivé', 'bolt')
    }
  },
)
watch(
  () => vehicle.speed,
  (s) => {
    if (s > 20 && vehicle.features.washMode) {
      vehicle.setFeature('washMode', false)
      vehicle.body.mirrorsFolded = false
      vehicle.climate.recirc = false
      pleos.notify('Mode lavage désactivé : vitesse supérieure à 20 km/h', 'warning')
    }
  },
)

function toggleDayNight() {
  pleos.prefs.theme = 'Automatique'
  pleos.prefs.flatTheme = 'Automatique'
  pleos.forcedNight = !pleos.night
  pleos.notify(pleos.night ? 'Affichage de nuit' : 'Affichage de jour', pleos.night ? 'moon' : 'sun')
}
function newNotification() {
  pleos.addNotification({ icon: 'message', title: 'Julien Robert', body: 'On se retrouve devant la gare ?' })
  pleos.notify('Nouvelle notification', 'bell')
}
if (!bench.size) bench.size = brand.defaultSize
</script>

<template>
  <BenchShell :brand="brand" :brands="BRANDS">
    <template #driver="{ view }">
      <ScaledScreen :width="1200" :height="176" :max-scale="view === 'driver' ? 1.1 : 0.82">
        <FlatDisplay :width="1200" :height="176" />
      </ScaledScreen>
    </template>
    <template #central="{ size }">
      <ScaledScreen :width="size.width" :height="size.height">
        <TouchScreen :width="size.width" :height="size.height" />
      </ScaledScreen>
    </template>
    <template #hardware>
      <PhysicalControls />
    </template>
    <template #sim-events="{ btn, on }">
      <button type="button" :class="[btn, on(false)]" @click="newNotification"><Icon name="bell" size="16" />Notification</button>
      <button type="button" :class="[btn, on(pleos.night)]" @click="toggleDayNight"><Icon :name="pleos.night ? 'sun' : 'moon'" size="16" />{{ pleos.night ? 'Passer en jour' : 'Passer en nuit' }}</button>
    </template>
    <template #note>
      Reconstruction non officielle, sans lien avec Hyundai. La structure (zones de l’écran, politique de fenêtres 1:1 / 2:0 / 3:0, zone de contrôle, bibliothèque
      d’apps, panneaux système, catégories des paramètres, Gleo AI, écran plat) suit le manuel en ligne Pleos Connect et le guide de design Pleos Playground.
      Graphismes et données sont des reconstitutions de démonstration. Le temps de trajet et de recharge est accéléré ×20. Astuce : appui long sur une icône de la
      zone de contrôle pour modifier les favoris.
    </template>
  </BenchShell>
</template>
