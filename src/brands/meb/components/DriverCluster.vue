<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { distance } from '@/core/format'
import { guidance } from '@/core/vehicle/simulation'
import { useVehicleStore } from '@/core/vehicle/store'

/**
 * Petit écran conducteur (Digital Cockpit de l'ID.3, Virtual Cockpit de l'Enyaq) : vitesse, rapport, autonomie,
 * flèche de guidage, régulateur et témoins. `gears` donne l'ordre affiché (ID.3 : D/B N R, d'après la photo).
 */
const props = withDefaults(defineProps<{ width: number; height: number; gears?: string[]; brandClass: string; night: boolean }>(), { gears: () => ['P', 'R', 'N', 'D'] })
const vehicle = useVehicleStore()
const step = computed(() => guidance(vehicle.nav))
const gearLabel = (g: string) => (g === 'D/B' || g === 'B' ? 'D' : g)
const MANEUVER = { 'turn-left': 'turn-left', 'turn-right': 'turn-right', straight: 'straight', arrive: 'arrive' } as const
</script>

<template>
  <div
    class="relative grid overflow-hidden rounded-[14px] bg-bg text-ink shadow-[0_0_0_7px_#050608,0_14px_30px_rgb(0_0_0/0.6)]"
    :class="[props.brandClass, { night }]"
    :style="{ width: `${width}px`, height: `${height}px`, gridTemplateColumns: '1fr 1.2fr 1fr' }"
  >
    <div v-if="!vehicle.ready" class="absolute inset-0 z-10 bg-black" />
    <div class="flex flex-col justify-center gap-1 pl-6">
      <span class="flex items-center gap-2 text-[13px] text-ink-2"><Icon name="battery" size="16" />{{ Math.round(vehicle.battery) }} %</span>
      <b class="tnum text-[26px] leading-none font-semibold">{{ distance(vehicle.range) }}</b>
      <span v-if="vehicle.chargeInfo.charging" class="flex items-center gap-1 text-[12px] text-ok"><Icon name="bolt" size="13" />{{ vehicle.chargeInfo.kw }} kW</span>
    </div>
    <div class="flex flex-col items-center justify-center">
      <span v-if="vehicle.cruise" class="mb-1 flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent"><Icon name="gauge" size="12" />{{ vehicle.cruiseSpeed }}</span>
      <b class="tnum text-[64px] leading-none font-light">{{ vehicle.speed }}</b>
      <span class="text-[12px] text-ink-2">km/h</span>
    </div>
    <div class="flex items-center justify-between pr-5">
      <div v-if="vehicle.nav.destination && step" class="flex items-center gap-2 text-[13px]"><Icon :name="MANEUVER[step.maneuver]" size="26" class="text-accent" /><span class="tnum">{{ distance(step.distanceKm) }}</span></div>
      <span v-else />
      <ul class="flex flex-col items-end gap-0.5 text-[14px] font-bold" aria-label="Rapport">
        <li v-for="g in props.gears" :key="g" :class="vehicle.gear === gearLabel(g) ? 'text-ink' : 'text-ink-3/60'">{{ g }}</li>
      </ul>
    </div>
    <span v-if="vehicle.turn === 'L' || vehicle.hazard" class="animate-blink absolute top-2 left-3 text-ok"><Icon name="arrow-left" size="18" /></span>
    <span v-if="vehicle.turn === 'R' || vehicle.hazard" class="animate-blink absolute top-2 right-3 text-ok"><Icon name="arrow-left" size="18" class="rotate-180" /></span>
  </div>
</template>
