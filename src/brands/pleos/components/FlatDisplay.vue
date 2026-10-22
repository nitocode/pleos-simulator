<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { distance, fmt1, speedIn, type DistanceUnit } from '@/core/format'
import { guidance } from '@/core/vehicle/simulation'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore } from '../store/pleos'

/**
 * Écran plat (affichage conducteur) : témoins des phares, repères de clignotants,
 * et trois zones de widgets réglables dans Paramètres › Écran.
 */
defineProps<{ width: number; height: number }>()
const vehicle = useVehicleStore()
const pleos = usePleosStore()

const unit = computed(() => pleos.prefs.distanceUnit as DistanceUnit)
const blinkL = computed(() => vehicle.hazard || vehicle.turn === 'L')
const blinkR = computed(() => vehicle.hazard || vehicle.turn === 'R')
const step = computed(() => guidance(vehicle.nav))
const efficiency = computed(() =>
  pleos.prefs.consumptionUnit === 'km/kWh'
    ? { v: 100 / vehicle.consumption, u: 'km/kWh', max: 10, ticks: ['0', '5', '10'] }
    : { v: vehicle.consumption, u: 'kWh/100 km', max: 30, ticks: ['0', '10', '20', '30'] },
)
const media = computed(() =>
  vehicle.media.source === 'radio'
    ? { t: `FM ${vehicle.currentStation.freq}`, s: vehicle.currentStation.name, c: ['#ff5fa2', '#e0337f'], ratio: 0 }
    : { t: vehicle.currentTrack.title, s: vehicle.currentTrack.artist, c: vehicle.currentTrack.colors, ratio: vehicle.media.position / vehicle.currentTrack.duration },
)
const MODE = { Eco: '#16b157', Normal: '#2f7bf6', Sport: '#ef5a2a', Snow: '#59b7e8' } as const
</script>

<template>
  <div class="pleos-flat relative grid overflow-hidden rounded-[16px] bg-[var(--flat-bg)] text-[var(--flat-ink)] shadow-[0_0_0_7px_#050608,0_14px_30px_rgb(0_0_0/0.6)] transition-colors duration-500 select-none" :class="{ light: pleos.flatLight }" :style="{ width: `${width}px`, height: `${height}px`, gridTemplateColumns: '48px 1fr 1.25fr 1fr', filter: `brightness(${0.7 + (pleos.prefs.brightness / 20) * 0.3})` }">
    <div v-if="!vehicle.ready" class="absolute inset-0 z-10 bg-black" />
    <div class="flex h-full flex-col items-center justify-center gap-3 border-r border-[var(--flat-line)]">
      <template v-if="pleos.prefs.flatLights">
        <Icon v-if="vehicle.features.headlights !== 'OFF'" name="headlight" size="22" class="text-[#2fd36b]" />
        <Icon v-if="vehicle.features.hba" name="high-beam" size="22" class="text-[#3d8bff]" />
      </template>
    </div>
    <span class="absolute top-0 left-[38%] grid h-8 w-14 place-items-center rounded-b-lg border-2 border-t-0 border-[var(--flat-line)] text-[#2fd36b]"><Icon name="arrow-left" size="22" :stroke="2.8" :class="blinkL ? 'animate-blink' : 'opacity-15'" /></span>
    <span class="absolute top-0 right-[34%] grid h-8 w-14 place-items-center rounded-b-lg border-2 border-t-0 border-[var(--flat-line)] text-[#2fd36b]"><Icon name="arrow-left" size="22" :stroke="2.8" class="rotate-180" :class="blinkR ? 'animate-blink' : 'opacity-15'" /></span>

    <div v-for="(kind, zone) in { left: pleos.prefs.flatLeft, center: pleos.prefs.flatCenter, right: pleos.prefs.flatRight }" :key="zone" class="flex min-w-0 items-center gap-5 px-7" :class="zone === 'center' ? 'justify-center' : zone === 'right' ? 'justify-end' : ''">
      <Transition name="fade" mode="out-in">
        <!-- vitesse -->
        <div v-if="kind === 'Vitesse'" key="speed" class="flex items-center gap-7">
          <div v-if="vehicle.cruise" class="flex flex-col items-center text-[#2fd36b]"><Icon name="gauge" size="26" /><b class="tnum text-[17px]">{{ vehicle.cruiseSpeed }}</b></div>
          <div class="text-center leading-none">
            <div class="tnum text-[68px] font-semibold tracking-tight">{{ speedIn(vehicle.speed, unit) }}</div>
            <div class="mt-1 text-[15px] font-semibold text-[var(--flat-dim)]">{{ unit === 'mi' ? 'mph' : 'km/h' }}</div>
          </div>
          <div class="grid size-[64px] place-items-center rounded-full border-[7px] border-[#e0262d] bg-white text-[23px] font-bold text-[#111]" :class="vehicle.overLimit && 'animate-pulse-ring'">{{ vehicle.speedLimit }}</div>
        </div>
        <!-- autonomie -->
        <div v-else-if="kind === 'Autonomie'" key="range" class="w-[220px]">
          <div class="flex items-baseline gap-2"><span class="tnum text-[40px] font-semibold">{{ distance(vehicle.range, unit).split(' ')[0] }}</span><span class="text-[15px] text-[var(--flat-dim)]">{{ unit }}</span><span class="tnum ml-auto text-[22px] font-semibold">{{ Math.round(vehicle.battery) }}<small class="text-[13px]"> %</small></span></div>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--flat-line)]"><div class="h-full rounded-full bg-[var(--flat-ink)] transition-[width] duration-700" :style="{ width: `${vehicle.battery}%` }" /></div>
        </div>
        <!-- consommation -->
        <div v-else-if="kind === 'Conso.'" key="eff" class="w-[200px]">
          <div class="flex items-baseline gap-1.5"><span class="tnum text-[38px] font-semibold">{{ fmt1(efficiency.v) }}</span><span class="text-[14px] text-[var(--flat-dim)]">{{ efficiency.u }}</span></div>
          <div class="relative mt-2 h-1.5 rounded-full bg-[var(--flat-line)]"><div class="h-full rounded-full bg-[var(--flat-ink)] transition-[width] duration-700" :style="{ width: `${Math.min(100, (efficiency.v / efficiency.max) * 100)}%` }" /></div>
          <div class="tnum mt-1 flex justify-between text-[11px] text-[var(--flat-dim)]"><span v-for="t in efficiency.ticks" :key="t">{{ t }}</span></div>
        </div>
        <!-- mode de conduite -->
        <div v-else-if="kind === 'Mode de conduite'" key="mode" class="flex items-center gap-2 rounded-xl bg-[var(--flat-line)] px-5 py-3 text-[20px] font-bold uppercase" :style="{ color: MODE[vehicle.features.driveMode] }">
          <Icon name="car-side" size="22" />{{ vehicle.features.driveMode }}
        </div>
        <!-- média -->
        <div v-else-if="kind === 'Média'" key="media" class="flex min-w-0 items-center gap-4">
          <div class="min-w-0">
            <b class="block truncate text-[20px]">{{ media.t }}</b>
            <span class="block truncate text-[14px] text-[var(--flat-dim)]">{{ media.s }}</span>
            <div class="mt-2 h-1 w-[200px] overflow-hidden rounded-full bg-[var(--flat-line)]"><div class="h-full bg-[var(--flat-ink)] transition-[width] duration-1000 ease-linear" :style="{ width: `${media.ratio * 100}%` }" /></div>
          </div>
          <span class="grid size-[60px] flex-none place-items-center rounded-xl text-white" :style="{ background: `linear-gradient(135deg, ${media.c[0]}, ${media.c[1]})` }"><Icon :name="vehicle.media.source === 'radio' ? 'radio' : 'music'" size="24" /></span>
        </div>
        <!-- guidage -->
        <div v-else-if="kind === 'Virage après virage' || kind === 'Infos itinéraire'" key="nav" class="flex min-w-0 items-center gap-4">
          <template v-if="step && vehicle.nav.destination">
            <Icon v-if="kind === 'Virage après virage'" :name="step.maneuver" size="44" :stroke="2.6" class="text-[#2fd36b]" />
            <div class="min-w-0">
              <b class="tnum block text-[26px]">{{ kind === 'Virage après virage' ? distance(step.distanceKm, unit) : vehicle.nav.destination.name }}</b>
              <span class="block truncate text-[14px] text-[var(--flat-dim)]">{{ kind === 'Virage après virage' ? step.street : distance(vehicle.nav.remainingKm, unit) }}</span>
            </div>
          </template>
          <span v-else class="text-[15px] text-[var(--flat-dim)]">Aucun guidage</span>
        </div>
        <!-- trajet actuel -->
        <div v-else-if="kind === 'Trajet actuel'" key="trip" class="text-center">
          <div class="text-[14px] font-semibold text-[var(--flat-dim)]">Trajet actuel</div>
          <div class="flex items-baseline gap-6">
            <span><small class="block text-[12px] text-[var(--flat-dim)]">Distance ({{ unit }})</small><b class="tnum text-[30px]">{{ distance(vehicle.trip, unit).split(' ')[0] }}</b></span>
            <span><small class="block text-[12px] text-[var(--flat-dim)]">Temps (h:m)</small><b class="tnum text-[30px]">{{ Math.floor(vehicle.tripMinutes / 60) }}:{{ String(Math.round(vehicle.tripMinutes % 60)).padStart(2, '0') }}</b></span>
          </div>
        </div>
      </Transition>
    </div>
    <Transition name="fade">
      <div v-if="vehicle.call" class="absolute inset-x-0 bottom-2 text-center text-[14px] font-semibold text-[#2fd36b]">{{ vehicle.call.name }} · {{ vehicle.call.status === 'incoming' ? 'appel entrant' : 'en communication' }}</div>
    </Transition>
  </div>
</template>
