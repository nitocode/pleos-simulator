<script setup lang="ts">
import { computed } from 'vue'
import Icon from '../ui/Icon.vue'
import { useVehicleStore } from '../vehicle/store'
import type { Gear, PlugType } from '../vehicle/types'

/** Commandes de simulation communes à toutes les interfaces : rapport, vitesse, clignotants, recharge, appel. */
const vehicle = useVehicleStore()
const max = computed(() => vehicle.maxSpeed())
const GEARS: Gear[] = ['P', 'R', 'N', 'D']
const PLUGS: [PlugType, string][] = [
  ['none', 'Aucune'],
  ['ac', 'CA 11 kW'],
  ['dc', 'CC rapide'],
]
const btn = 'press flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40'
const on = (active: boolean) => (active ? 'border-[#3b74b5] bg-[#24466f] text-white' : 'border-bench-line bg-bench-raised text-bench-ink hover:border-[#3a414b]')
</script>

<template>
  <section class="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-x-6 gap-y-4 rounded-[18px] border border-bench-line bg-bench-panel p-4">
    <h2 class="col-span-full text-[12px] font-bold tracking-[0.1em] text-bench-dim uppercase">Simulation du véhicule</h2>
    <div class="flex flex-col gap-2">
      <span class="text-[12px] font-semibold text-bench-dim">Rapport</span>
      <div class="flex gap-1.5">
        <button v-for="g in GEARS" :key="g" type="button" :class="[btn, on(vehicle.gear === g), 'w-11 justify-center text-[15px]']" @click="vehicle.setGear(g)">{{ g }}</button>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <label for="sim-speed" class="flex justify-between text-[12px] font-semibold text-bench-dim">Vitesse <b class="tnum font-medium text-white">{{ vehicle.speed }} km/h</b></label>
      <input id="sim-speed" type="range" min="0" :max="max || 1" :value="vehicle.speed" :disabled="!max" class="w-full" @input="vehicle.setSpeed(+($event.target as HTMLInputElement).value)" />
      <span class="text-[11.5px] text-bench-dim">{{ max ? 'Faites glisser pour rouler' : 'Passez en D ou R pour rouler' }}</span>
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-[12px] font-semibold text-bench-dim">Clignotants et régulateur</span>
      <div class="flex flex-wrap gap-1.5">
        <button type="button" :class="[btn, on(vehicle.turn === 'L')]" @click="vehicle.toggleTurn('L')"><Icon name="arrow-left" size="16" />Gauche</button>
        <button type="button" :class="[btn, on(vehicle.turn === 'R')]" @click="vehicle.toggleTurn('R')">Droite<Icon name="arrow-left" size="16" class="rotate-180" /></button>
        <button type="button" :class="[btn, on(vehicle.cruise)]" :disabled="vehicle.gear !== 'D' || vehicle.speed < 30" @click="vehicle.toggleCruise()"><Icon name="gauge" size="16" />SCC</button>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-[12px] font-semibold text-bench-dim">Borne de recharge</span>
      <div class="flex flex-wrap gap-1.5">
        <button v-for="[p, label] in PLUGS" :key="p" type="button" :class="[btn, on(vehicle.plug === p)]" :disabled="p !== 'none' && vehicle.gear !== 'P'" @click="vehicle.setPlug(p)">{{ label }}</button>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-[12px] font-semibold text-bench-dim">Événements</span>
      <div class="flex flex-wrap gap-1.5">
        <button type="button" :class="[btn, on(false)]" @click="vehicle.ringIncoming('Camille Martin')"><Icon name="phone-in" size="16" />Appel entrant</button>
        <slot name="events" :btn="btn" :on="on" />
      </div>
    </div>
  </section>
</template>
