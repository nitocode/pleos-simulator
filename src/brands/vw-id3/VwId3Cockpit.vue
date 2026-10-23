<script setup lang="ts">
import { onScopeDispose, watch } from 'vue'
import BenchShell from '@/core/bench/BenchShell.vue'
import Icon from '@/core/ui/Icon.vue'
import ScaledScreen from '@/core/ui/ScaledScreen.vue'
import { useBenchStore } from '@/core/bench/useBench'
import { useSimulationClock } from '@/core/composables/useSimulationClock'
import { useVehicleStore } from '@/core/vehicle/store'
import { BRANDS } from '@/brands'
import DriverCluster from '../meb/components/DriverCluster.vue'
import { vwId3 as brand } from './index'
import { bMode, useId3Base } from './store'
import VwId3Screen from './components/VwId3Screen.vue'
import Id3Hardware from './components/Id3Hardware.vue'
import Id3Light from './components/Id3Light.vue'
import './theme.css'

const vehicle = useVehicleStore()
const ui = useId3Base()
const bench = useBenchStore()
vehicle.setSpec(brand.vehicle)
useSimulationClock()

const off = vehicle.onEvent((e) => {
  if (e.type === 'arrived') ui.notify(`Destination atteinte : ${e.place}`, 'arrive')
  if (e.type === 'charge-complete') ui.notify('Charge terminée', 'battery-charging')
  if (e.type === 'gear-refused') ui.notify(e.reason === 'moving' ? 'Arrêtez le véhicule pour changer de sens' : e.reason === 'off' ? 'Démarrez le véhicule' : 'Débranchez le câble de charge', 'warning')
  if (e.type === 'power-refused') ui.notify('Arrêtez le véhicule et passez en P', 'warning')
  if (e.type === 'power' && !e.on) ui.open('home')
})
onScopeDispose(() => off())
// Le mode B ne s'applique qu'en marche avant ; la récupération suit le réglage commun.
watch(
  () => vehicle.gear,
  (g) => {
    if (g !== 'D') bMode.value = false
  },
)
watch(bMode, (b) => vehicle.setFeature('regen', b ? '3' : '1'))

function toggleDayNight() {
  ui.prefs.displayMode = 'Auto'
  ui.forcedNight = !ui.night
}
if (!bench.size) bench.size = brand.defaultSize
</script>

<template>
  <BenchShell :brand="brand" :brands="BRANDS">
    <template #driver="{ view }">
      <div class="flex w-full flex-col items-center gap-3">
        <Id3Light />
        <ScaledScreen :width="760" :height="210" :max-scale="view === 'driver' ? 1.2 : 0.8">
          <DriverCluster :width="760" :height="210" brand-class="vw-id3" :night="true" :gears="['P', 'R', 'N', bMode ? 'B' : 'D/B']" />
        </ScaledScreen>
      </div>
    </template>
    <template #central="{ size }">
      <ScaledScreen :width="size.width" :height="size.height">
        <VwId3Screen :width="size.width" :height="size.height" />
      </ScaledScreen>
    </template>
    <template #hardware><Id3Hardware /></template>
    <template #sim-events="{ btn, on }">
      <button type="button" :class="[btn, on(ui.night)]" @click="toggleDayNight"><Icon :name="ui.night ? 'sun' : 'moon'" size="16" />{{ ui.night ? 'Passer en jour' : 'Passer en nuit' }}</button>
      <button type="button" :class="[btn, on(false)]" @click="vehicle.ringIncoming('Camille Martin')"><Icon name="phone-in" size="16" />Appel entrant</button>
    </template>
    <template #note>
      Reconstruction non officielle, sans lien avec Volkswagen. La disposition (barre supérieure avec menu et favoris, menu des applis, barre de
      climatisation, assistant IDA), les curseurs tactiles rétroéclairés, le commodo de marche séparé, l’ID. Light, le préconditionnement de la batterie et
      les chiffres de recharge suivent le communiqué Volkswagen 49/2024 et les photos officielles de l’écran (voir docs/models/vw-id3.md). L’écran d’accueil,
      les sous-écrans de réglages et la courbe de charge (≈ 28 min de 10 à 80 %, relevés publics) sont des reconstitutions. Temps de trajet et de recharge accéléré ×20.
    </template>
  </BenchShell>
</template>
