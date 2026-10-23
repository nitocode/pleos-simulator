<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'
import { useVehicleStore } from '@/core/vehicle/store'
import type { Airflow } from '@/core/vehicle/types'
import { autoLevel, useEnyaqBase } from '../store'

/**
 * Climatisation (infographie « New interface for quicker access to climate control ») : OFF, A/C, dégivrage et air
 * recyclé en haut ; pastille « AUTO » et son intensité au centre ; ventilation à gauche ; Arrière, info et réglages à
 * droite ; flux d'air vers la silhouette ; préréglages « Air frais », « Pieds chauds », « Mains chaudes » en bas.
 */
const vehicle = useVehicleStore()
const ui = useEnyaqBase()
const c = vehicle.climate
const rear = ref(false)
const LEVELS = ['Léger', 'Moyen', 'Intense'] as const
const FLOWS: [Airflow, string, string][] = [
  ['defrost', 'Pare-brise', 'top-[18%] right-[30%]'],
  ['face', 'Visage', 'top-[44%] right-[34%]'],
  ['feet', 'Pieds', 'top-[70%] right-[30%]'],
]
const PRESETS: { id: string; icon: IconName; run: () => void }[] = [
  { id: 'Air frais', icon: 'air-face', run: () => { c.recirc = false; c.airflow = 'face'; vehicle.setFan(5) } },
  { id: 'Pieds chauds', icon: 'air-feet', run: () => { c.airflow = 'feet'; vehicle.nudgeTemp('L', 1); vehicle.setFan(4) } },
  { id: 'Mains chaudes', icon: 'wheel-heat', run: () => { c.wheelHeat = true; c.airflow = 'face'; vehicle.nudgeTemp('L', 0.5) } },
]
function preset(p: (typeof PRESETS)[number]) {
  c.on = true
  p.run()
  ui.preset = p.id
  ui.notify(p.id, p.icon)
}
function cycleAuto() {
  if (!c.auto) {
    vehicle.toggleClimate('auto')
    return
  }
  autoLevel.value = LEVELS[(LEVELS.indexOf(autoLevel.value) + 1) % LEVELS.length]!
  vehicle.setFan(autoLevel.value === 'Léger' ? 2 : autoLevel.value === 'Moyen' ? 4 : 7)
  c.auto = true
}
const top = (on: boolean) => (on ? 'bg-accent text-on-accent' : 'bg-surface-2 text-ink-2')
</script>

<template>
  <div class="relative flex h-full flex-col p-5">
    <header class="flex items-center gap-2">
      <button type="button" class="press h-11 rounded-xl px-4 text-[14px] font-bold" :class="top(!c.on)" @click="vehicle.toggleClimate('on')">OFF</button>
      <button type="button" class="press h-11 rounded-xl px-4 text-[14px] font-bold" :class="top(c.ac && c.on)" @click="vehicle.toggleClimate('ac')">A/C</button>
      <button type="button" class="press grid size-11 place-items-center rounded-xl" :class="top(c.defrostFront)" aria-label="Dégivrage" @click="vehicle.toggleClimate('defrostFront')"><Icon name="defrost-front" size="20" /></button>
      <button type="button" class="press grid size-11 place-items-center rounded-xl" :class="top(c.recirc)" aria-label="Air recyclé" @click="vehicle.toggleClimate('recirc')"><Icon name="recirc" size="20" /></button>
      <span class="ml-auto flex items-center gap-2">
        <button type="button" class="press flex h-11 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold" :class="top(rear)" @click="rear = !rear"><Icon name="seat" size="18" />Arrière</button>
        <button type="button" class="press grid size-11 place-items-center rounded-xl bg-surface-2 text-ink-2" aria-label="Informations" @click="ui.notify('Le mode AUTO règle température, ventilation et diffusion', 'info')"><Icon name="info" size="20" /></button>
        <button type="button" class="press grid size-11 place-items-center rounded-xl bg-surface-2 text-ink-2" aria-label="Réglages de la climatisation" @click="ui.notify('Réglages : climatisation intelligente activée', 'settings')"><Icon name="settings" size="20" /></button>
      </span>
    </header>

    <div class="relative grid min-h-0 flex-1 grid-cols-[140px_1fr_300px] items-center gap-4">
      <div class="flex flex-col items-center gap-3">
        <button type="button" class="press grid size-14 place-items-center rounded-2xl bg-surface-2 text-[26px]" aria-label="Plus de ventilation" @click="vehicle.setFan(c.fan + 1)">+</button>
        <Icon name="fan" size="30" class="text-ink-2" />
        <span class="flex flex-col-reverse gap-1"><i v-for="n in 8" :key="n" class="h-1.5 w-10 rounded-full" :class="n <= c.fan && c.on ? 'bg-accent' : 'bg-surface-3'" /></span>
        <button type="button" class="press grid size-14 place-items-center rounded-2xl bg-surface-2 text-[26px]" aria-label="Moins de ventilation" @click="vehicle.setFan(c.fan - 1)">−</button>
      </div>
      <div class="flex justify-center">
        <button type="button" class="press flex h-16 items-center gap-3 rounded-full border-2 px-7" :class="c.auto && c.on ? 'border-accent text-accent' : 'border-line text-ink-2'" @click="cycleAuto">
          <Icon name="fan" size="22" />
          <span class="text-left leading-tight"><b class="block text-[18px]">AUTO</b><small>{{ c.auto ? autoLevel : 'Désactivé' }}</small></span>
        </button>
      </div>
      <div class="relative h-full">
        <svg viewBox="0 0 120 160" class="absolute right-0 bottom-[6%] h-[80%] text-ink-3" aria-hidden="true">
          <path d="M70 18a10 10 0 1 1 0.1 0ZM58 40c-8 10-10 30-8 52l30 2 4 46h14l-4-56-24-4 4-38c1-6-12-10-16-2Z" fill="currentColor" opacity="0.7" />
        </svg>
        <button v-for="[id, label, pos] in FLOWS" :key="id" type="button" class="press absolute grid size-12 place-items-center rounded-full" :class="[pos, c.airflow === id || (c.airflow === 'both' && id !== 'defrost') ? 'bg-accent text-on-accent' : 'bg-surface-2 text-ink-2']" :aria-label="`Flux d’air : ${label}`" @click="c.airflow = id"><Icon name="arrow-left" size="20" class="rotate-180" /></button>
      </div>
    </div>

    <footer class="grid grid-cols-3 gap-3">
      <button v-for="p in PRESETS" :key="p.id" type="button" class="press flex h-14 items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold" :class="ui.preset === p.id ? 'bg-accent-soft text-accent' : 'bg-surface-2'" @click="preset(p)"><Icon :name="p.icon" size="22" />{{ p.id }}</button>
    </footer>
    <p v-if="rear" class="absolute top-20 left-1/2 -translate-x-1/2 rounded-full bg-surface px-4 py-2 text-[13px] text-ink-2 shadow-card">Climatisation arrière : sièges arrière chauffants et diffusion arrière</p>
  </div>
</template>
