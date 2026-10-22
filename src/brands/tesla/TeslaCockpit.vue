<script setup lang="ts">
import { onScopeDispose, watch } from 'vue'
import BenchShell from '@/core/bench/BenchShell.vue'
import Icon from '@/core/ui/Icon.vue'
import ScaledScreen from '@/core/ui/ScaledScreen.vue'
import { useBenchStore } from '@/core/bench/useBench'
import { useSimulationClock } from '@/core/composables/useSimulationClock'
import { useVehicleStore } from '@/core/vehicle/store'
import { BRANDS } from '@/brands'
import { tesla as brand } from './index'
import { useTeslaStore } from './store/tesla'
import TeslaScreen from './components/TeslaScreen.vue'
import WheelControls from './components/hardware/WheelControls.vue'
import './theme.css'

const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const bench = useBenchStore()
vehicle.setSpec(brand.vehicle)
useSimulationClock()

// Les événements du véhicule s'affichent en message contextuel, comme sur l'écran réel.
const off = vehicle.onEvent((e) => {
  if (e.type === 'arrived') tesla.notify(`Vous êtes arrivé : ${e.place}`, 'arrive')
  if (e.type === 'charge-complete') tesla.notify('Recharge terminée', 'battery-charging')
  if (e.type === 'gear-refused') tesla.notify(e.reason === 'moving' ? 'Arrêtez le véhicule avant de changer de rapport' : e.reason === 'off' ? 'Démarrez le véhicule pour changer de rapport' : 'Débranchez le câble de recharge', 'warning')
  if (e.type === 'power-refused') tesla.notify('Arrêtez le véhicule et passez en P pour l’éteindre', 'warning')
  if (e.type === 'power' && !e.on) {
    tesla.closePanel()
    tesla.closeApp()
  }
})
onScopeDispose(() => off())

// Marche arrière : la caméra s'affiche en grand, sans quitter l'application ouverte.
watch(
  () => vehicle.gear,
  (g) => {
    if (g === 'R') tesla.closePanel()
  },
)

function toggleDayNight() {
  tesla.prefs.displayMode = 'Auto'
  tesla.forcedNight = !tesla.night
  tesla.notify(tesla.night ? 'Affichage de nuit' : 'Affichage de jour', tesla.night ? 'moon' : 'sun')
}
function incomingCall() {
  vehicle.ringIncoming('Camille Martin')
}
if (!bench.size) bench.size = brand.defaultSize
</script>

<template>
  <BenchShell :brand="brand" :brands="BRANDS">
    <template #driver><span /></template>
    <template #central="{ size }">
      <ScaledScreen :width="size.width" :height="size.height">
        <TeslaScreen :width="size.width" :height="size.height" />
      </ScaledScreen>
    </template>
    <template #hardware><WheelControls /></template>
    <template #sim-events="{ btn, on }">
      <button type="button" :class="[btn, on(tesla.night)]" @click="toggleDayNight"><Icon :name="tesla.night ? 'sun' : 'moon'" size="16" />{{ tesla.night ? 'Passer en jour' : 'Passer en nuit' }}</button>
      <button type="button" :class="[btn, on(false)]" @click="incomingCall"><Icon name="phone-in" size="16" />Appel entrant</button>
    </template>
    <template #note>
      Reconstruction non officielle, sans lien avec Tesla. La structure de l’écran (barre d’état, zone d’état du véhicule, carte, écran Contrôles, barre
      inférieure avec Mes applis et lanceur), les commandes de climatisation, le changement de rapport, les boutons de défilement du volant et le
      redémarrage de l’écran suivent le manuel du conducteur du Model 3 (2024+). Graphismes et données sont des reconstitutions de démonstration. La
      charge suit une courbe estimée d’après des relevés publics (≈ 27 min de 10 à 80 % sur un Superchargeur). Le temps de trajet et de recharge est accéléré ×20.
    </template>
  </BenchShell>
</template>
