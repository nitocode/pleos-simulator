<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import TouchSlider from '../../meb/components/TouchSlider.vue'
import { bMode, useId3Base } from '../store'

/**
 * Commandes physiques de l'ID.3 (communiqué 49/2024 et photos) : curseurs tactiles rétroéclairés de température et de
 * volume sous l'écran, feux de détresse, commodo de marche séparé à droite de la colonne (D/B, N, R, P en bout),
 * volant multifonction à commandes tactiles (voix, volume, pistes, téléphone).
 */
const vehicle = useVehicleStore()
const ui = useId3Base()

function stalk(pos: 'forward' | 'back' | 'P') {
  if (pos === 'P') return vehicle.setGear('P')
  if (pos === 'back') return vehicle.setGear('R')
  // vers l'avant : D, puis B à la seconde poussée
  if (vehicle.gear === 'D') {
    bMode.value = !bMode.value
    ui.notify(bMode.value ? 'Mode B : récupération renforcée' : 'Mode D', 'gauge')
  } else vehicle.setGear('D')
}
function voice() {
  ui.voice = ui.voice ? null : { phase: 'listen' }
}
function call() {
  if (!vehicle.call) return ui.open('phone')
  if (vehicle.call.status === 'incoming') return vehicle.answer()
  vehicle.hangUp()
}
const btn = 'press grid size-10 place-items-center rounded-xl bg-[#22262d] text-[#c9cfd8] hover:bg-[#2a2f37]'
</script>

<template>
  <div class="flex flex-wrap items-end justify-center gap-x-6 gap-y-4">
    <div class="flex items-end gap-5 rounded-[28px] border border-bench-line bg-gradient-to-b from-[#1b1e23] to-[#141619] px-5 py-3">
      <TouchSlider label="Température" tone="temp" :min="16" :max="28" :step="0.5" :value="vehicle.climate.temp.L" @change="vehicle.setTemp('L', $event)" />
      <div class="flex flex-col items-center gap-1.5">
        <button type="button" class="press grid h-[40px] w-[56px] place-items-center rounded-xl bg-gradient-to-b from-[#2b2f36] to-[#1c1f24] text-[#ff5c61] shadow-[inset_0_1px_0_#3b4048,0_2px_5px_#0009]" aria-label="Feux de détresse" :aria-pressed="vehicle.hazard" @click="vehicle.toggleHazard()"><Icon name="hazard" size="22" :class="vehicle.hazard && 'animate-blink'" /></button>
        <span class="text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">Détresse</span>
      </div>
      <TouchSlider label="Volume" :min="0" :max="40" :step="1" :value="vehicle.media.volume" @change="vehicle.setVolume($event)" />
    </div>

    <div class="flex items-center gap-2 rounded-[28px] border border-bench-line bg-[#141619] px-4 py-3">
      <span class="pr-1 text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">Commodo</span>
      <button type="button" :class="[btn, 'w-auto px-3 text-[12px] font-bold']" aria-label="Pousser vers l’avant : D, puis B" @click="stalk('forward')">D/B ▲</button>
      <button type="button" :class="[btn, 'w-auto px-3 text-[12px] font-bold']" aria-label="Tirer vers l’arrière : R" @click="stalk('back')">R ▼</button>
      <button type="button" :class="[btn, 'w-auto px-3 text-[12px] font-bold']" aria-label="Bouton P en bout de commodo" @click="stalk('P')">P</button>
    </div>

    <div class="flex items-center gap-1.5 rounded-[28px] border border-bench-line bg-[#141619] px-3 py-3">
      <span class="px-1 text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">Volant</span>
      <button type="button" :class="btn" aria-label="Commande vocale IDA" @click="voice"><Icon name="mic" size="18" /></button>
      <button type="button" :class="btn" aria-label="Volume moins" @click="vehicle.setVolume(vehicle.media.volume - 1)"><Icon name="minus" size="18" /></button>
      <button type="button" :class="btn" aria-label="Volume plus" @click="vehicle.setVolume(vehicle.media.volume + 1)"><Icon name="plus" size="18" /></button>
      <button type="button" :class="btn" aria-label="Piste précédente" @click="vehicle.step(-1)"><Icon name="prev" size="18" /></button>
      <button type="button" :class="btn" aria-label="Piste suivante" @click="vehicle.step(1)"><Icon name="next" size="18" /></button>
      <button type="button" :class="btn" aria-label="Téléphone" @click="call"><Icon name="phone" size="18" /></button>
      <button type="button" :class="[btn, vehicle.cruise && 'text-[#2f9bff]']" aria-label="Travel Assist" :disabled="vehicle.gear !== 'D' || vehicle.speed < 30" @click="vehicle.toggleCruise()"><Icon name="gauge" size="18" /></button>
    </div>
  </div>
</template>
