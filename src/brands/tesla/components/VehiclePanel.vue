<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { distance, speedIn, type DistanceUnit } from '@/core/format'
import type { Gear } from '@/core/vehicle/types'
import { useVehicleStore } from '@/core/vehicle/store'
import { useTeslaStore } from '../store/tesla'
import CarRender from './CarRender.vue'

/**
 * Zone « État du véhicule », d'après les captures du manuel : P R N D et batterie en haut, témoins à gauche,
 * bande des modes de conduite (glisser vers le haut : D, vers le bas : R, toucher : P), véhicule avec repères
 * Coffre avant / Coffre arrière / verrou / prise de recharge, puis le mini-lecteur multimédia.
 */
const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const GEARS: Gear[] = ['P', 'R', 'N', 'D']
const unit = computed(() => tesla.prefs.distanceUnit as DistanceUnit)
const parked = computed(() => vehicle.gear === 'P' && !vehicle.moving)
const driving = computed(() => vehicle.gear !== 'P')
const speed = computed(() => speedIn(vehicle.speed, unit.value))
const hold = computed(() => vehicle.features.autoHold && vehicle.gear === 'D' && vehicle.speed === 0)
/** La bande est masquée aux vitesses d'autoroute (manuel, « Changement »). */
const stripVisible = computed(() => vehicle.speed < 80)
const laneSeconds = computed(() => (vehicle.speed > 0 ? Math.max(0.3, 2.6 - vehicle.speed / 50) : 0))
const playing = computed(() => vehicle.media.playing)

// bande des modes de conduite : glissé vertical sur la poignée
const dragStart = ref<number | null>(null)
const dragDy = ref(0)
function down(e: PointerEvent) {
  dragStart.value = e.clientY
  dragDy.value = 0
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
}
function move(e: PointerEvent) {
  if (dragStart.value !== null) dragDy.value = Math.max(-60, Math.min(60, e.clientY - dragStart.value))
}
function up() {
  if (dragStart.value === null) return
  const dy = dragDy.value
  dragStart.value = null
  dragDy.value = 0
  if (dy < -25) vehicle.setGear('D')
  else if (dy > 25) vehicle.setGear('R')
  else vehicle.setGear('P')
}

function frunk() {
  if (!parked.value) return
  tesla.frunkOpen = !tesla.frunkOpen
}
function trunk() {
  if (!parked.value) return
  vehicle.toggleBody('trunkOpen')
}
function port() {
  vehicle.toggleBody('chargePortOpen')
  tesla.notify(vehicle.body.chargePortOpen ? 'Trappe de recharge ouverte' : 'Trappe de recharge fermée', 'charge-port')
}
function lock() {
  vehicle.toggleBody('locked')
  tesla.notify(vehicle.body.locked ? 'Véhicule verrouillé' : 'Véhicule déverrouillé', vehicle.body.locked ? 'lock' : 'unlock')
}
</script>

<template>
  <section class="relative h-full overflow-hidden bg-drive transition-colors duration-500" aria-label="État du véhicule">
    <!-- P R N D · batterie -->
    <div class="absolute top-4 right-5 left-5 z-10 flex items-start justify-between">
      <div class="flex items-baseline gap-4">
        <div class="flex gap-1.5 text-[15px] font-bold tracking-wide" aria-label="Rapport engagé">
          <span v-for="g in GEARS" :key="g" :class="vehicle.gear === g ? 'text-ink' : 'text-ink-3/70'">{{ g }}</span>
        </div>
        <div v-if="driving" class="flex items-baseline gap-1.5">
          <b class="tnum text-[56px] leading-[0.85] font-semibold tracking-tight">{{ speed }}</b>
          <span class="text-[14px] font-semibold text-ink-2">{{ unit === 'km' ? 'km/h' : 'mph' }}</span>
        </div>
      </div>
      <button type="button" class="press flex items-center gap-2 text-[16px] font-semibold" aria-label="Recharge" @click="tesla.launch('charge')">
        <Icon v-if="vehicle.chargeInfo.charging" name="bolt" size="15" class="text-ok" />
        <span class="tnum">{{ tesla.prefs.energyDisplay === '%' ? `${Math.round(vehicle.battery)} %` : distance(vehicle.range, unit) }}</span>
        <span class="relative h-[13px] w-[28px] rounded-[3px] border-[1.5px] border-ink-2 p-[1.5px]"><span class="block h-full rounded-[1.5px]" :class="vehicle.battery < 20 ? 'bg-crit' : vehicle.chargeInfo.charging ? 'bg-ok' : 'bg-ink-2'" :style="{ width: `${vehicle.battery}%` }" /><span class="absolute top-1/2 -right-[4px] h-[5px] w-[2px] -translate-y-1/2 rounded-r bg-ink-2" /></span>
      </button>
    </div>

    <!-- témoins (manuel, « État du véhicule ») -->
    <ul class="absolute top-14 left-12 z-10 flex flex-col items-center gap-2.5" aria-label="Témoins">
      <li v-if="vehicle.gear === 'P'" class="flex flex-col items-center text-crit" title="Frein de stationnement serré"><span class="grid size-[22px] place-items-center rounded-full border-2 border-current text-[11px] font-black">P</span><b class="text-[8px] leading-none">PARK</b></li>
      <li v-if="tesla.prefs.headlights !== 'Éteints'" class="text-ok" title="Feux de croisement"><Icon name="headlight" size="22" /></li>
      <li v-if="hold" class="grid size-[22px] place-items-center rounded-full border-2 border-ink-2 text-[11px] font-black text-ink-2" title="Retenue (HOLD)">H</li>
      <li v-if="vehicle.battery < 20" class="text-warn" title="Batterie faible"><Icon name="battery" size="22" /></li>
      <li v-if="vehicle.turn === 'L' || vehicle.hazard" class="animate-blink text-ok"><Icon name="arrow-left" size="22" /></li>
      <li v-if="vehicle.turn === 'R' || vehicle.hazard" class="animate-blink text-ok"><Icon name="arrow-left" size="22" class="rotate-180" /></li>
    </ul>

    <!-- bande des modes de conduite -->
    <Transition name="fade">
      <div v-if="stripVisible" class="absolute top-14 left-2 z-20 flex w-8 flex-col items-center gap-1 py-1" aria-label="Bande des modes de conduite">
        <button type="button" class="press grid h-7 w-8 place-items-center text-ink-3" aria-label="Glisser vers le haut : marche avant (D)" @click="vehicle.setGear('D')"><Icon name="chevron-up" size="20" :stroke="2.4" /></button>
        <span class="h-12 w-px [background-image:linear-gradient(var(--ui-ink-3)_40%,transparent_40%)] [background-size:1px_6px]" />
        <button
          type="button"
          class="relative grid h-[52px] w-8 touch-none place-items-center rounded-full border border-line bg-surface shadow-card"
          :style="{ transform: `translateY(${dragDy}px)`, transition: dragStart === null ? 'transform 0.25s var(--ease-ui)' : 'none' }"
          aria-label="Bande des modes de conduite : glisser vers le haut pour D, vers le bas pour R, toucher pour P"
          @pointerdown="down"
          @pointermove="move"
          @pointerup="up"
          @pointercancel="up"
        >
          <Icon name="car-side" size="18" class="rotate-90" />
        </button>
        <span class="text-[10px] font-black leading-none">{{ vehicle.gear }}</span>
        <span v-if="hold" class="text-[8px] font-bold leading-none text-ink-2">HOLD</span>
        <span class="h-12 w-px [background-image:linear-gradient(var(--ui-ink-3)_40%,transparent_40%)] [background-size:1px_6px]" />
        <button type="button" class="press grid h-7 w-8 place-items-center text-ink-3" aria-label="Glisser vers le bas : marche arrière (R)" @click="vehicle.setGear('R')"><Icon name="chevron-down" size="20" :stroke="2.4" /></button>
      </div>
    </Transition>

    <!-- véhicule et repères : positions en % de la boîte de la voiture (rapport 400 × 140) -->
    <div class="absolute top-[46%] right-3 left-[56px] -translate-y-1/2">
      <div class="relative aspect-[400/140]">
        <!-- route en conduite : bords et marquage qui défilent sous la voiture -->
        <div v-if="driving" class="pointer-events-none absolute top-[88%] -right-3 -left-[56px] h-14 overflow-hidden" aria-hidden="true">
          <div class="absolute inset-x-0 top-[38%] h-[3px] bg-ink-3/25" />
          <div class="road absolute top-[70%] h-[4px] w-[200%]" :style="{ animationDuration: `${laneSeconds || 9999}s` }" />
          <div class="absolute inset-x-0 bottom-0 h-[3px] bg-ink-3/25" />
        </div>
        <CarRender :frunk-open="tesla.frunkOpen" :trunk-open="vehicle.body.trunkOpen" :blink-l="vehicle.hazard || vehicle.turn === 'L'" :blink-r="vehicle.hazard || vehicle.turn === 'R'" class="relative" />
        <template v-if="parked">
          <button type="button" class="press absolute -top-[92%] left-0 text-left text-[12.5px] leading-tight" @click="frunk"><span class="block text-ink-2">Coffre avant</span><b class="font-semibold">{{ tesla.frunkOpen ? 'Fermer' : 'Ouvrir' }}</b></button>
          <span class="pointer-events-none absolute -top-[48%] left-[17%] h-[94%] w-px bg-ink-3/60" />
          <button type="button" class="press absolute -top-[66%] left-[54%] grid size-9 -translate-x-1/2 place-items-center rounded-full" :aria-label="vehicle.body.locked ? 'Déverrouiller' : 'Verrouiller'" @click="lock"><Icon :name="vehicle.body.locked ? 'lock' : 'unlock'" size="20" /></button>
          <span class="pointer-events-none absolute -top-[30%] left-[54%] h-[38%] w-px bg-ink-3/60" />
          <button type="button" class="press absolute -top-[110%] right-0 text-right text-[12.5px] leading-tight" @click="trunk"><span class="block text-ink-2">Coffre arrière</span><b class="font-semibold">{{ vehicle.body.trunkOpen ? 'Fermer' : 'Ouvrir' }}</b></button>
          <span class="pointer-events-none absolute -top-[66%] left-[91%] h-[96%] w-px bg-ink-3/60" />
        </template>
        <button type="button" class="press absolute top-[22%] -right-3 grid size-8 place-items-center rounded-full" :class="vehicle.body.chargePortOpen ? 'text-ok' : 'text-ink'" :aria-label="vehicle.body.chargePortOpen ? 'Fermer la trappe de recharge' : 'Ouvrir la trappe de recharge'" @click="port"><Icon name="bolt" size="17" /></button>
      </div>
      <p v-if="vehicle.chargeInfo.charging" class="mt-6 text-center text-[13px] font-semibold text-ok">{{ vehicle.chargeInfo.label }} · {{ vehicle.chargeInfo.minutesLeft }} min</p>
    </div>

    <!-- mini-lecteur multimédia -->
    <div class="absolute inset-x-5 bottom-3 flex h-11 items-center gap-2 rounded-xl bg-surface px-3 shadow-card">
      <button type="button" class="press flex min-w-0 flex-1 items-center gap-2 text-left text-[13.5px]" @click="tesla.launch('media')">
        <Icon :name="vehicle.media.source === 'radio' ? 'radio' : 'music'" size="17" class="flex-none text-ink-2" />
        <span v-if="playing" class="min-w-0 truncate"><b class="font-semibold">{{ vehicle.media.source === 'radio' ? vehicle.currentStation.name : vehicle.currentTrack.title }}</b><span class="text-ink-2"> · {{ vehicle.media.source === 'radio' ? `FM ${vehicle.currentStation.freq}` : vehicle.currentTrack.artist }}</span></span>
        <span v-else class="truncate text-ink-2">Choisir la source multimédia</span>
      </button>
      <button type="button" class="press grid size-8 flex-none place-items-center" :aria-label="playing ? 'Pause' : 'Lecture'" @click="vehicle.togglePlay()"><Icon :name="playing ? 'pause' : 'play'" size="18" /></button>
      <button type="button" class="press grid size-8 flex-none place-items-center" aria-label="Suivant" @click="vehicle.step(1)"><Icon name="next" size="18" /></button>
    </div>

    <!-- poignée : élargir / rétrécir la visualisation -->
    <button type="button" class="press absolute top-1/2 right-1 z-20 h-16 w-2 -translate-y-1/2 rounded-full bg-ink-3/50 hover:bg-ink-3" :aria-label="tesla.wideVehicle ? 'Rétrécir la zone d’état du véhicule' : 'Élargir la zone d’état du véhicule'" @click="tesla.wideVehicle = !tesla.wideVehicle" />
  </section>
</template>

<style scoped>
/* Marquage au sol : défile vers l'arrière (la voiture roule vers la gauche). */
.road {
  background: repeating-linear-gradient(to right, var(--ui-ink-3) 0 26px, transparent 26px 60px);
  opacity: 0.55;
  animation: road linear infinite;
}
@keyframes road {
  from { transform: translateX(-60px); }
  to { transform: translateX(0); }
}
</style>
