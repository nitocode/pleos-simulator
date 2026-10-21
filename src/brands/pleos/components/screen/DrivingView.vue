<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { distance, speedIn, type DistanceUnit } from '@/core/format'
import { guidance } from '@/core/vehicle/simulation'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore } from '../../store/pleos'
import CarIllustration from './CarIllustration.vue'
import RoadView from './RoadView.vue'
import UtilityWidgets from './UtilityWidgets.vue'

const vehicle = useVehicleStore()
const pleos = usePleosStore()

const MODE_COLOR = { Eco: '#16b157', Normal: '#2f7bf6', Sport: '#ef5a2a', Snow: '#59b7e8' } as const
const unit = computed(() => pleos.prefs.distanceUnit as DistanceUnit)
const driving = computed(() => vehicle.gear === 'D' || vehicle.gear === 'R' || vehicle.moving)
const step = computed(() => guidance(vehicle.nav))
const blinkL = computed(() => vehicle.hazard || vehicle.turn === 'L')
const blinkR = computed(() => vehicle.hazard || vehicle.turn === 'R')
const outside = computed(() => (pleos.prefs.tempUnit === '°F' ? `${Math.round((vehicle.outsideTemp * 9) / 5 + 32)}°F` : `${vehicle.outsideTemp}°C`))
const batteryColor = computed(() => (vehicle.battery < 15 ? 'var(--ui-crit)' : vehicle.battery < 30 ? 'var(--ui-warn)' : 'var(--ui-ok)'))
const regenLabel = computed(() => (vehicle.features.ipedal ? 'i-Pedal' : `Lv ${vehicle.features.regen}`))

function toggleBody(key: 'mirrorsFolded' | 'trunkOpen' | 'chargePortOpen') {
  if (key === 'trunkOpen' && vehicle.moving) return pleos.notify('Le hayon s’ouvre uniquement à l’arrêt', 'warning')
  vehicle.toggleBody(key)
  const labels = {
    mirrorsFolded: ['Rétroviseurs rabattus', 'Rétroviseurs dépliés'],
    trunkOpen: ['Hayon ouvert', 'Hayon fermé'],
    chargePortOpen: ['Trappe de recharge ouverte', 'Trappe de recharge fermée'],
  }
  pleos.notify(labels[key][vehicle.body[key] ? 0 : 1]!, key === 'chargePortOpen' ? 'charge-port' : key === 'trunkOpen' ? 'tailgate' : 'mirror')
}
</script>

<template>
  <section class="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] bg-drive px-6 pt-4 transition-colors duration-500 night:rounded-[14px]">
    <!-- vitesse, rapport, autonomie -->
    <header class="grid grid-cols-[1fr_auto_1fr] items-start">
      <div class="flex flex-col leading-none">
        <span class="tnum text-[64px] font-light tracking-tight">{{ speedIn(vehicle.speed, unit) }}</span>
        <span class="mt-1 text-[14px] font-semibold text-ink-2">{{ unit === 'mi' ? 'mph' : 'km/h' }}</span>
      </div>
      <div class="flex items-center gap-3 pt-2">
        <span class="text-ok transition-opacity" :class="blinkL ? 'animate-blink' : 'opacity-15'"><Icon name="arrow-left" size="26" :stroke="2.8" /></span>
        <Transition name="pop" mode="out-in">
          <span :key="vehicle.gear" class="text-[30px] font-extrabold">{{ vehicle.gear }}</span>
        </Transition>
        <span class="text-ok transition-opacity" :class="blinkR ? 'animate-blink' : 'opacity-15'"><Icon name="arrow-left" size="26" :stroke="2.8" class="rotate-180" /></span>
      </div>
      <div class="flex items-center justify-end gap-2 pt-2 text-[17px] font-semibold">
        <span class="tnum">{{ distance(vehicle.range, unit).replace(' ', '') }}</span>
        <Icon v-if="vehicle.plug !== 'none'" name="bolt" size="16" class="text-ok" />
        <span class="relative inline-flex h-[22px] w-[44px] items-center rounded-[6px] border-2 border-ink-3 p-[2px]">
          <span class="h-full rounded-[3px] transition-[width] duration-700 ease-ui" :style="{ width: `${vehicle.battery}%`, background: batteryColor }" />
          <span class="tnum absolute inset-0 grid place-items-center text-[11px] font-bold text-ink mix-blend-normal">{{ Math.round(vehicle.battery) }}</span>
        </span>
      </div>
    </header>

    <!-- témoins -->
    <div class="mt-2 flex h-6 items-center gap-3 text-ok">
      <Icon v-if="vehicle.features.headlights !== 'OFF'" name="headlight" size="22" />
      <Icon v-if="vehicle.features.hba" name="high-beam" size="22" class="text-accent" />
      <Icon v-if="vehicle.features.lka" name="lane" size="20" :class="vehicle.lkaActive ? 'text-ok' : 'text-ink-3'" />
      <span v-if="vehicle.features.autoHold" class="text-[10px] leading-[1.05] font-extrabold" :class="vehicle.gear === 'D' && !vehicle.moving ? 'text-ok' : 'text-ink-3'">AUTO<br />HOLD</span>
      <Icon v-if="vehicle.battery < 15" name="warning" size="20" class="text-warn" />
      <span class="ml-auto text-[13px] font-extrabold tracking-[0.14em]" :class="vehicle.moving ? 'text-ink-3' : 'text-ok'">READY</span>
    </div>

    <!-- vue centrale -->
    <div class="relative min-h-0 flex-1">
      <Transition name="fade" mode="out-in">
        <div v-if="driving" key="road" class="absolute inset-0">
          <div class="absolute top-2 left-0 z-[1] flex flex-col gap-3">
            <div
              class="grid size-[58px] place-items-center rounded-full border-[6px] border-[#e0262d] bg-white text-[21px] font-bold text-[#111]"
              :class="vehicle.overLimit && 'animate-pulse-ring'"
            >
              {{ vehicle.speedLimit }}
            </div>
            <div v-if="vehicle.cruise" class="flex flex-col items-center text-ok">
              <Icon name="gauge" size="24" />
              <span class="tnum text-[14px] font-bold">{{ vehicle.cruiseSpeed }}</span>
            </div>
          </div>
          <Transition name="fade">
            <div v-if="step" class="absolute top-1 right-0 left-20 z-[1] flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3">
              <Icon :name="step.maneuver" size="34" :stroke="2.6" />
              <div class="min-w-0">
                <div class="tnum text-[24px] leading-none font-bold">{{ step.distanceKm < 1 ? `${Math.max(10, Math.round(step.distanceKm * 100) * 10)} m` : distance(step.distanceKm, unit) }}</div>
                <div class="truncate text-[14px] text-ink-2">{{ step.street }}</div>
              </div>
            </div>
          </Transition>
          <RoadView class="absolute inset-0 pt-16" :speed="vehicle.speed" :lka="vehicle.lkaActive" :cruise="vehicle.cruise" :mode-color="MODE_COLOR[vehicle.features.driveMode]" :night="pleos.night" />
        </div>
        <div v-else key="car" class="absolute inset-0 flex items-center justify-center">
          <div class="relative w-[92%]">
            <CarIllustration
              :paint="pleos.night ? ['#dfe3e8', '#80878f'] : ['#f6f7f9', '#a7afb9']"
              :mirrors-folded="vehicle.body.mirrorsFolded"
              :trunk-open="vehicle.body.trunkOpen"
              :charge-port-open="vehicle.body.chargePortOpen"
              :windows-open="vehicle.body.windowsOpen"
            />
            <button
              v-for="spot in ([
                { key: 'mirrorsFolded', icon: 'mirror', x: 27, y: 16, label: 'Rétroviseurs' },
                { key: 'chargePortOpen', icon: 'charge-port', x: 82, y: 8, label: 'Trappe de recharge' },
                { key: 'trunkOpen', icon: 'tailgate', x: 96, y: 34, label: 'Hayon' },
              ] as const)"
              :key="spot.key"
              type="button"
              class="press absolute grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border shadow-card transition-colors duration-300"
              :class="vehicle.body[spot.key] ? 'border-transparent bg-accent text-on-accent' : 'border-line bg-surface text-ink'"
              :style="{ left: `${spot.x}%`, top: `${spot.y}%` }"
              :aria-label="spot.label"
              :aria-pressed="vehicle.body[spot.key]"
              @click="toggleBody(spot.key)"
            >
              <Icon :name="spot.icon" size="20" />
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- compteur, récupération, température extérieure -->
    <footer class="flex items-end justify-between pb-2 text-[14px] font-semibold">
      <span class="tnum text-ink-2">{{ Math.round(unit === 'mi' ? vehicle.odometer * 0.621371 : vehicle.odometer) }} {{ unit }}</span>
      <div class="flex items-end gap-3">
        <button type="button" class="press grid size-10 place-items-center rounded-xl bg-ink text-surface night:bg-surface-2 night:text-ink" aria-label="Rapport énergie" @click="pleos.launch('energy')">
          <Icon name="battery-charging" size="22" />
        </button>
        <div class="flex flex-col items-end leading-tight">
          <span class="border-b-2 border-ink pb-[1px] text-[13px] font-bold">{{ regenLabel }}</span>
          <span class="tnum text-ink-2">{{ outside }}</span>
        </div>
      </div>
    </footer>

    <UtilityWidgets />
  </section>
</template>
