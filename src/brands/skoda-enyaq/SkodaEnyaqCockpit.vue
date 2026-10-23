<script setup lang="ts">
import { onScopeDispose } from 'vue'
import BenchShell from '@/core/bench/BenchShell.vue'
import Icon from '@/core/ui/Icon.vue'
import ScaledScreen from '@/core/ui/ScaledScreen.vue'
import { useBenchStore } from '@/core/bench/useBench'
import { useSimulationClock } from '@/core/composables/useSimulationClock'
import { useVehicleStore } from '@/core/vehicle/store'
import { BRANDS } from '@/brands'
import DriverCluster from '../meb/components/DriverCluster.vue'
import { skodaEnyaq as brand } from './index'
import { useEnyaqBase } from './store'
import SkodaEnyaqScreen from './components/SkodaEnyaqScreen.vue'
import EnyaqHardware from './components/EnyaqHardware.vue'
import './theme.css'

const vehicle = useVehicleStore()
const ui = useEnyaqBase()
const bench = useBenchStore()
vehicle.setSpec(brand.vehicle)
useSimulationClock()

const off = vehicle.onEvent((e) => {
  if (e.type === 'arrived') ui.notify(`Vous êtes arrivé : ${e.place}`, 'arrive')
  if (e.type === 'charge-complete') ui.notify('Recharge terminée', 'battery-charging')
  if (e.type === 'gear-refused') ui.notify(e.reason === 'moving' ? 'Arrêtez le véhicule pour changer de sens' : e.reason === 'off' ? 'Démarrez le véhicule' : 'Débranchez le câble de recharge', 'warning')
  if (e.type === 'power-refused') ui.notify('Arrêtez le véhicule et passez en P', 'warning')
  if (e.type === 'power' && !e.on) ui.open('home')
})
onScopeDispose(() => off())

function toggleDayNight() {
  ui.prefs.displayMode = 'Auto'
  ui.forcedNight = !ui.night
}
if (!bench.size) bench.size = brand.defaultSize
</script>

<template>
  <BenchShell :brand="brand" :brands="BRANDS">
    <template #driver="{ view }">
      <ScaledScreen :width="760" :height="210" :max-scale="view === 'driver' ? 1.2 : 0.8">
        <DriverCluster :width="760" :height="210" brand-class="skoda-enyaq" :night="true" :gears="['P', 'R', 'N', 'D']" />
      </ScaledScreen>
    </template>
    <template #central="{ size }">
      <ScaledScreen :width="size.width" :height="size.height">
        <SkodaEnyaqScreen :width="size.width" :height="size.height" />
      </ScaledScreen>
    </template>
    <template #hardware><EnyaqHardware /></template>
    <template #sim-events="{ btn, on }">
      <button type="button" :class="[btn, on(ui.night)]" @click="toggleDayNight"><Icon :name="ui.night ? 'sun' : 'moon'" size="16" />{{ ui.night ? 'Passer en jour' : 'Passer en nuit' }}</button>
      <button type="button" :class="[btn, on(false)]" @click="vehicle.ringIncoming('Camille Martin')"><Icon name="phone-in" size="16" />Appel entrant</button>
    </template>
    <template #note>
      Reconstruction non officielle, sans lien avec Škoda. Les trois boutons de base (Paramètres du véhicule, Accueil, Apps), les cinq raccourcis véhicule
      et trois raccourcis d’apps, l’accueil avec Laura et la carte, l’écran de climatisation, l’optimisation de la recharge rapide et le préchauffage de la
      batterie suivent le dossier de presse et les infographies « Explore Enyaq 2024 » (voir docs/models/skoda-enyaq.md). Les commandes physiques, les
      sous-écrans de réglages et la courbe de charge (≈ 28 min de 10 à 80 %, relevés publics) sont des reconstitutions. Temps accéléré ×20.
    </template>
  </BenchShell>
</template>
