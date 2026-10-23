<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'
import { useVehicleStore } from '@/core/vehicle/store'
import type { Airflow, Side } from '@/core/vehicle/types'
import { useId3Base } from '../store'

/**
 * Climatisation AirCare bizone avec Smart Climate (fiche officielle : « Pieds chauds », « Vue dégagée ») :
 * températures, AUTO, A/C, ventilation, diffusion, dégivrage, sièges et volant chauffants, synchronisation.
 */
const vehicle = useVehicleStore()
const ui = useId3Base()
const c = vehicle.climate
const FLOWS: [Airflow, IconName, string][] = [
  ['face', 'air-face', 'Visage'],
  ['both', 'air-both', 'Visage et pieds'],
  ['feet', 'air-feet', 'Pieds'],
  ['defrost', 'air-defrost', 'Pare-brise'],
]
/** Préréglages Smart Climate : chaque bouton combine plusieurs réglages en un seul geste. */
const PRESETS = [
  {
    id: 'Pieds chauds',
    icon: 'air-feet' as IconName,
    run: () => {
      c.on = true
      c.airflow = 'feet'
      vehicle.nudgeTemp('L', 1)
      vehicle.setFan(5)
    },
  },
  {
    id: 'Vue dégagée',
    icon: 'defrost-front' as IconName,
    run: () => {
      c.on = true
      c.defrostFront = true
      c.airflow = 'defrost'
      c.ac = true
      vehicle.setFan(7)
    },
  },
]
function preset(p: (typeof PRESETS)[number]) {
  p.run()
  ui.preset = p.id
  ui.notify(`Smart Climate : ${p.id}`, p.icon)
}
function step(side: Side, d: number) {
  vehicle.nudgeTemp(side, d)
  ui.preset = null
}
</script>

<template>
  <div class="grid h-full grid-cols-[1fr_1.15fr_1fr] gap-4 p-5">
    <section v-for="side in (['L', 'R'] as const)" :key="side" class="flex flex-col items-center justify-center gap-4 rounded-3xl bg-surface p-5 shadow-card" :class="side === 'R' && 'order-3'">
      <span class="text-[13px] font-semibold text-ink-2">{{ side === 'L' ? 'Conducteur' : 'Passager' }}</span>
      <button type="button" class="press grid size-14 place-items-center rounded-full bg-surface-2" :aria-label="`Augmenter ${side === 'L' ? 'conducteur' : 'passager'}`" @click="step(side, 0.5)"><Icon name="chevron-up" size="26" /></button>
      <b class="tnum text-[56px] leading-none font-light">{{ c.temp[side].toFixed(1).replace('.', ',') }}<small class="text-[20px] text-ink-2">°</small></b>
      <button type="button" class="press grid size-14 place-items-center rounded-full bg-surface-2" :aria-label="`Baisser ${side === 'L' ? 'conducteur' : 'passager'}`" @click="step(side, -0.5)"><Icon name="chevron-down" size="26" /></button>
      <button type="button" class="press flex h-11 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold" :class="c.seatHeat[side] ? 'bg-heat-soft text-heat' : 'bg-surface-2 text-ink-2'" @click="vehicle.cycleSeat(side, 'heat')"><Icon name="seat-heat" size="20" />{{ c.seatHeat[side] ? `Niveau ${c.seatHeat[side]}` : 'Siège' }}</button>
    </section>

    <section class="order-2 flex flex-col gap-3">
      <div class="grid grid-cols-3 gap-2.5">
        <button type="button" class="press h-14 rounded-2xl text-[15px] font-bold" :class="c.on ? 'bg-accent text-on-accent' : 'bg-surface text-ink-2 shadow-card'" @click="vehicle.toggleClimate('on')">{{ c.on ? 'Marche' : 'Arrêt' }}</button>
        <button type="button" class="press h-14 rounded-2xl text-[15px] font-bold" :class="c.auto && c.on ? 'bg-accent text-on-accent' : 'bg-surface text-ink-2 shadow-card'" @click="vehicle.toggleClimate('auto')">AUTO</button>
        <button type="button" class="press h-14 rounded-2xl text-[15px] font-bold" :class="c.ac && c.on ? 'bg-accent text-on-accent' : 'bg-surface text-ink-2 shadow-card'" @click="vehicle.toggleClimate('ac')">A/C</button>
      </div>
      <div class="rounded-2xl bg-surface p-4 shadow-card">
        <p class="mb-2 text-[13px] font-semibold text-ink-2">Smart Climate</p>
        <div class="grid grid-cols-2 gap-2.5">
          <button v-for="p in PRESETS" :key="p.id" type="button" class="press flex h-14 items-center justify-center gap-2 rounded-xl text-[15px] font-semibold" :class="ui.preset === p.id ? 'bg-accent-soft text-accent' : 'bg-surface-2'" @click="preset(p)"><Icon :name="p.icon" size="22" />{{ p.id }}</button>
        </div>
      </div>
      <div class="rounded-2xl bg-surface p-4 shadow-card">
        <div class="flex items-center gap-3">
          <Icon name="fan" size="22" class="text-ink-2" />
          <div class="flex flex-1 gap-1">
            <button v-for="n in 8" :key="n" type="button" class="press h-8 flex-1 rounded-md" :class="n <= c.fan && c.on ? 'bg-accent' : 'bg-surface-3'" :aria-label="`Ventilation ${n}`" @click="vehicle.setFan(n)" />
          </div>
        </div>
        <div class="mt-3 grid grid-cols-4 gap-2">
          <button v-for="[id, icon, label] in FLOWS" :key="id" type="button" class="press grid h-12 place-items-center rounded-xl" :class="c.airflow === id ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-ink-2'" :aria-label="label" @click="c.airflow = id"><Icon :name="icon" size="22" /></button>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2.5">
        <button type="button" class="press flex h-12 items-center justify-center gap-2 rounded-xl text-[13px] font-semibold" :class="c.defrostRear ? 'bg-heat-soft text-heat' : 'bg-surface text-ink-2 shadow-card'" @click="vehicle.toggleClimate('defrostRear')"><Icon name="defrost-rear" size="20" />Arrière</button>
        <button type="button" class="press flex h-12 items-center justify-center gap-2 rounded-xl text-[13px] font-semibold" :class="c.wheelHeat ? 'bg-heat-soft text-heat' : 'bg-surface text-ink-2 shadow-card'" @click="vehicle.toggleClimate('wheelHeat')"><Icon name="wheel-heat" size="20" />Volant</button>
        <button type="button" class="press flex h-12 items-center justify-center gap-2 rounded-xl text-[13px] font-semibold" :class="c.sync ? 'bg-accent-soft text-accent' : 'bg-surface text-ink-2 shadow-card'" @click="vehicle.toggleClimate('sync')">SYNC</button>
      </div>
    </section>
  </div>
</template>
