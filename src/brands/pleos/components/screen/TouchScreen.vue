<script setup lang="ts">
import { computed } from 'vue'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore } from '../../store/pleos'
import DrivingView from './DrivingView.vue'
import StatusBar from './StatusBar.vue'
import AppArea from './AppArea.vue'
import ControlBar from './ControlBar.vue'
import ClimatePanel from '../overlays/ClimatePanel.vue'
import LibraryPanel from '../overlays/LibraryPanel.vue'
import SettingsPanel from '../overlays/SettingsPanel.vue'
import StatusPanels from '../overlays/StatusPanels.vue'
import GleoOverlay from '../overlays/GleoOverlay.vue'
import CameraView from '../overlays/CameraView.vue'
import BlindSpotView from '../overlays/BlindSpotView.vue'
import SystemLayer from '../overlays/SystemLayer.vue'

/**
 * Écran tactile Pleos Connect-S : vue de conduite (1 unité) · zone d'apps (2 unités) · zone de contrôle.
 * Les panneaux système (climatisation, bibliothèque, paramètres) s'ouvrent au-dessus de la zone d'apps.
 */
const props = defineProps<{ width: number; height: number }>()
const vehicle = useVehicleStore()
const pleos = usePleosStore()

const PAD = 8
const GAP = 8
const GNB = 88
const driveWidth = computed(() => Math.round((props.width - PAD * 2 - GAP * 2) / 3))
const sheetOpen = computed(() => pleos.panel === 'climate' || pleos.panel === 'library' || pleos.panel === 'settings')
const dropdownOpen = computed(() => !!pleos.panel && !sheetOpen.value && pleos.panel !== 'defrost')
const blindSpot = computed(() => !!vehicle.turn && !vehicle.hazard && vehicle.features.bvm && vehicle.moving)
const brightness = computed(() => 0.7 + (pleos.prefs.brightness / 20) * 0.3)
</script>

<template>
  <div
    class="pleos relative overflow-hidden rounded-[26px] bg-bg shadow-[0_0_0_10px_#050608,0_24px_48px_rgb(0_0_0/0.6)] select-none"
    :class="{ night: pleos.night }"
    :style="{ width: `${width}px`, height: `${height}px`, padding: `${PAD}px`, '--drive-w': `${driveWidth}px`, '--gnb-h': `${GNB}px`, filter: `brightness(${brightness})` }"
  >
    <div class="grid h-full" :style="{ gridTemplateColumns: `${driveWidth}px minmax(0, 1fr)`, gridTemplateRows: `minmax(0, 1fr) ${GNB}px`, gap: `${GAP}px` }">
      <DrivingView />
      <div class="relative flex min-h-0 min-w-0 flex-col">
        <StatusBar />
        <div class="relative min-h-0 flex-1">
          <AppArea />
          <Transition name="fade">
            <div v-if="sheetOpen" class="absolute inset-0 z-10 rounded-[20px] bg-scrim" @click="pleos.closePanel()" />
          </Transition>
          <Transition name="sheet"><ClimatePanel v-if="pleos.panel === 'climate'" /></Transition>
          <Transition name="sheet"><LibraryPanel v-if="pleos.panel === 'library'" /></Transition>
          <Transition name="pop"><SettingsPanel v-if="pleos.panel === 'settings'" /></Transition>
          <Transition name="drop"><GleoOverlay v-if="pleos.gleo" /></Transition>
        </div>
      </div>
      <ControlBar />
    </div>

    <Transition name="fade">
      <div v-if="dropdownOpen" class="absolute inset-0 z-20" @click="pleos.closePanel()" />
    </Transition>
    <Transition name="drop"><StatusPanels v-if="dropdownOpen" /></Transition>

    <Transition name="pop">
      <div v-if="pleos.cameraFull" class="absolute z-30" :style="{ top: `${PAD}px`, left: `${PAD}px`, right: `${PAD}px`, bottom: `${PAD + GNB + GAP}px` }">
        <CameraView />
      </div>
    </Transition>
    <Transition name="pop"><BlindSpotView v-if="blindSpot && !pleos.cameraFull" /></Transition>
    <SystemLayer />
  </div>
</template>
