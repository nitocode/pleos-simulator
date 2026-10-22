<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { distance, speedIn, type DistanceUnit } from '@/core/format'
import type { Gear } from '@/core/vehicle/types'
import { useVehicleStore } from '@/core/vehicle/store'
import { useTeslaStore } from '../store/tesla'

/**
 * Zone « État du véhicule » (manuel) : rapport, vitesse, batterie, visualisation du véhicule et de la route,
 * ouverture des coffres et de la trappe de charge en P, puis les cartes Multimédia, Pneus et Trajet.
 */
const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const GEARS: Gear[] = ['P', 'R', 'N', 'D']
const unit = computed(() => tesla.prefs.distanceUnit as DistanceUnit)
const parked = computed(() => vehicle.gear === 'P' && !vehicle.moving)
const speed = computed(() => speedIn(vehicle.speed, unit.value))
const laneSeconds = computed(() => (vehicle.speed > 0 ? Math.max(0.35, 3.2 - vehicle.speed / 45) : 0))

function shift(g: Gear) {
  vehicle.setGear(g)
}
function toggleChargePort() {
  vehicle.toggleBody('chargePortOpen')
  tesla.notify(vehicle.body.chargePortOpen ? 'Trappe de recharge ouverte' : 'Trappe de recharge fermée', 'charge-port')
}
function toggleTrunk() {
  vehicle.toggleBody('trunkOpen')
}
</script>

<template>
  <section class="relative flex h-full flex-col overflow-hidden px-5 pt-1 pb-4" aria-label="État du véhicule">
    <!-- batterie et rapport -->
    <div class="flex items-center justify-between">
      <button type="button" class="press flex items-center gap-2 rounded-xl py-1 pr-2" aria-label="Recharge" @click="tesla.launch('charge')">
        <span class="relative h-[14px] w-[30px] rounded-[4px] border-2 border-ink-2 p-[1px]"><span class="block h-full rounded-[2px]" :class="vehicle.battery < 20 ? 'bg-crit' : 'bg-ok'" :style="{ width: `${vehicle.battery}%` }" /><span class="absolute top-1/2 -right-[5px] h-[6px] w-[3px] -translate-y-1/2 rounded-r bg-ink-2" /></span>
        <Icon v-if="vehicle.chargeInfo.charging" name="bolt" size="16" class="text-ok" />
        <span class="tnum text-[20px] font-semibold">{{ distance(vehicle.range, unit) }}</span>
      </button>
      <div class="flex items-center gap-1.5 text-[22px] font-bold" role="group" aria-label="Rapport">
        <button v-for="g in GEARS" :key="g" type="button" class="press grid size-10 place-items-center rounded-xl transition-colors" :class="vehicle.gear === g ? 'bg-ink text-bg' : 'text-ink-3'" :aria-pressed="vehicle.gear === g" @click="shift(g)">{{ g }}</button>
      </div>
    </div>

    <!-- vitesse -->
    <div class="mt-4 flex items-end gap-2">
      <b class="tnum text-[72px] leading-[0.9] font-light">{{ speed }}</b>
      <span class="pb-2 text-[16px] text-ink-2">{{ unit === 'km' ? 'km/h' : 'mph' }}</span>
      <span v-if="vehicle.cruise" class="mb-2 ml-auto flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[13px] font-semibold text-accent"><Icon name="gauge" size="15" />{{ vehicle.cruiseSpeed }}</span>
    </div>

    <!-- visualisation du véhicule et de la route -->
    <div class="relative my-2 min-h-0 flex-1 overflow-hidden rounded-[22px] bg-surface-2">
      <div class="absolute inset-y-0 left-1/2 w-[170px] -translate-x-1/2 border-x-2 border-dashed border-ink-3/30" />
      <div v-if="laneSeconds" class="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 overflow-hidden">
        <div class="lane h-[200%] w-full" :style="{ animationDuration: `${laneSeconds}s` }" />
      </div>
      <svg viewBox="0 0 160 300" class="absolute top-1/2 left-1/2 h-[92%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_14px_14px_rgb(0_0_0/0.35)]" role="img" aria-label="Model 3 vue de dessus">
        <rect x="14" y="60" width="14" height="40" rx="5" fill="#1d1f23" />
        <rect x="132" y="60" width="14" height="40" rx="5" fill="#1d1f23" />
        <rect x="14" y="206" width="14" height="40" rx="5" fill="#1d1f23" />
        <rect x="132" y="206" width="14" height="40" rx="5" fill="#1d1f23" />
        <path d="M80 8C112 8 130 30 132 66L136 236C136 270 112 292 80 292S24 270 24 236L28 66C30 30 48 8 80 8Z" fill="#e8e9ec" stroke="#b7bac0" stroke-width="2" />
        <path d="M44 96C52 82 108 82 116 96L120 134C108 146 52 146 40 134Z" fill="#23262c" />
        <path d="M42 150H118L116 202C106 214 54 214 44 202Z" fill="#2a2d33" opacity="0.92" />
        <path d="M46 214H114L110 246C100 256 60 256 50 246Z" fill="#23262c" />
        <rect x="64" y="36" width="32" height="6" rx="3" fill="#b7bac0" />
        <g v-if="vehicle.body.trunkOpen"><path d="M46 262L80 296L114 262" fill="none" stroke="var(--ui-warn)" stroke-width="4" stroke-linecap="round" /></g>
        <g v-if="tesla.frunkOpen"><path d="M46 38L80 4L114 38" fill="none" stroke="var(--ui-warn)" stroke-width="4" stroke-linecap="round" /></g>
        <circle v-if="vehicle.body.chargePortOpen" cx="32" cy="256" r="6" fill="var(--ui-ok)" />
        <g v-if="vehicle.turn || vehicle.hazard" class="animate-blink" fill="#ffb02e">
          <circle v-if="vehicle.hazard || vehicle.turn === 'L'" cx="30" cy="20" r="6" /><circle v-if="vehicle.hazard || vehicle.turn === 'L'" cx="30" cy="280" r="6" />
          <circle v-if="vehicle.hazard || vehicle.turn === 'R'" cx="130" cy="20" r="6" /><circle v-if="vehicle.hazard || vehicle.turn === 'R'" cx="130" cy="280" r="6" />
        </g>
      </svg>
      <span v-if="vehicle.chargeInfo.charging" class="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[13px] font-semibold text-ok shadow-card"><Icon name="bolt" size="14" />{{ vehicle.chargeInfo.label }}</span>
    </div>

    <!-- ouvertures (à l'arrêt, en P) -->
    <div class="grid grid-cols-3 gap-2" :class="!parked && 'pointer-events-none opacity-40'">
      <button type="button" class="press flex h-11 items-center justify-center gap-1.5 rounded-xl bg-surface-2 text-[13px] font-semibold" :class="tesla.frunkOpen && 'text-warn'" :aria-pressed="tesla.frunkOpen" @click="tesla.frunkOpen = !tesla.frunkOpen"><Icon name="car-front" size="16" />Coffre avant</button>
      <button type="button" class="press flex h-11 items-center justify-center gap-1.5 rounded-xl bg-surface-2 text-[13px] font-semibold" :class="vehicle.body.trunkOpen && 'text-warn'" :aria-pressed="vehicle.body.trunkOpen" @click="toggleTrunk"><Icon name="tailgate" size="16" />Coffre arrière</button>
      <button type="button" class="press flex h-11 items-center justify-center gap-1.5 rounded-xl bg-surface-2 text-[13px] font-semibold" :class="vehicle.body.chargePortOpen && 'text-ok'" :aria-pressed="vehicle.body.chargePortOpen" @click="toggleChargePort"><Icon name="charge-port" size="16" />Recharge</button>
    </div>

    <!-- cartes : multimédia, pneus, trajet -->
    <div class="mt-2 grid grid-cols-3 gap-2 text-[12px]">
      <button type="button" class="press min-w-0 rounded-xl bg-surface-2 p-2.5 text-left" @click="tesla.launch('media')"><span class="flex items-center gap-1.5 text-ink-2"><Icon name="music" size="14" />Multimédia</span><b class="mt-1 block truncate text-[13px]">{{ vehicle.media.source === 'radio' ? vehicle.currentStation.name : vehicle.currentTrack.title }}</b></button>
      <div class="min-w-0 rounded-xl bg-surface-2 p-2.5"><span class="flex items-center gap-1.5 text-ink-2"><Icon name="gauge" size="14" />Pneus</span><b class="tnum mt-1 block text-[13px]">2,9 bar</b></div>
      <div class="min-w-0 rounded-xl bg-surface-2 p-2.5"><span class="flex items-center gap-1.5 text-ink-2"><Icon name="flag" size="14" />Trajet</span><b class="tnum mt-1 block truncate text-[13px]">{{ distance(vehicle.trip, unit) }}</b></div>
    </div>
  </section>
</template>

<style scoped>
.lane {
  background: repeating-linear-gradient(to bottom, var(--ui-ink-3) 0 28px, transparent 28px 64px);
  animation: lane-scroll linear infinite;
}
@keyframes lane-scroll {
  from { transform: translateY(-64px); }
  to { transform: translateY(0); }
}
</style>
