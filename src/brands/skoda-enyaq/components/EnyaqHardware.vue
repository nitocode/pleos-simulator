<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import TouchSlider from '../../meb/components/TouchSlider.vue'
import { useEnyaqBase } from '../store'

/**
 * Commandes physiques de l'Enyaq. Reconstitution non sourcée par une documentation 2024 (voir docs/models/skoda-enyaq.md) :
 * curseur tactile de volume sous l'écran, sélecteur de marche à bascule sur la planche de bord (P, R, N, D/B),
 * molettes au volant (volume à gauche, pistes à droite) et touche vocale pour Laura.
 */
const vehicle = useVehicleStore()
const ui = useEnyaqBase()
function rocker(dir: 'up' | 'down' | 'P') {
  if (dir === 'P') return vehicle.setGear('P')
  const order = ['R', 'N', 'D'] as const
  const i = order.indexOf(vehicle.gear as (typeof order)[number])
  const next = dir === 'up' ? order[Math.max(0, (i < 0 ? 1 : i) - 1)] : order[Math.min(2, (i < 0 ? 1 : i) + 1)]
  vehicle.setGear(next!)
}
function voice() {
  ui.voice = ui.voice ? null : { phase: 'listen' }
}
const btn = 'press grid size-10 place-items-center rounded-xl bg-[#22262d] text-[#c9cfd8] hover:bg-[#2a2f37]'
</script>

<template>
  <div class="flex flex-wrap items-end justify-center gap-x-6 gap-y-4">
    <div class="flex items-end gap-5 rounded-[28px] border border-bench-line bg-gradient-to-b from-[#1b1e23] to-[#141619] px-5 py-3">
      <div class="flex flex-col items-center gap-1.5">
        <button type="button" class="press grid h-[40px] w-[56px] place-items-center rounded-xl bg-gradient-to-b from-[#2b2f36] to-[#1c1f24] text-[#ff5c61] shadow-[inset_0_1px_0_#3b4048,0_2px_5px_#0009]" aria-label="Feux de détresse" :aria-pressed="vehicle.hazard" @click="vehicle.toggleHazard()"><Icon name="hazard" size="22" :class="vehicle.hazard && 'animate-blink'" /></button>
        <span class="text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">Détresse</span>
      </div>
      <TouchSlider label="Volume" :min="0" :max="40" :step="1" :value="vehicle.media.volume" :width="260" @change="vehicle.setVolume($event)" />
    </div>

    <div class="flex items-center gap-2 rounded-[28px] border border-bench-line bg-[#141619] px-4 py-3">
      <span class="pr-1 text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">Sélecteur</span>
      <div class="flex flex-col overflow-hidden rounded-xl bg-[#22262d]">
        <button type="button" class="press h-8 px-4 text-[12px] font-bold text-[#c9cfd8]" aria-label="Basculer vers le haut (vers R)" @click="rocker('up')">▲ R</button>
        <button type="button" class="press h-8 border-t border-[#30353c] px-4 text-[12px] font-bold text-[#c9cfd8]" aria-label="Basculer vers le bas (vers D)" @click="rocker('down')">D ▼</button>
      </div>
      <button type="button" :class="[btn, 'w-auto px-3 text-[12px] font-bold']" aria-label="Bouton P" @click="rocker('P')">P</button>
      <span class="tnum w-6 text-center text-[16px] font-bold text-white">{{ vehicle.gear }}</span>
    </div>

    <div class="flex items-center gap-1.5 rounded-[28px] border border-bench-line bg-[#141619] px-3 py-3">
      <span class="px-1 text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">Volant</span>
      <button type="button" :class="btn" aria-label="Molette gauche vers le haut : volume plus" @click="vehicle.setVolume(vehicle.media.volume + 1)"><Icon name="chevron-up" size="18" /></button>
      <button type="button" :class="btn" aria-label="Molette gauche vers le bas : volume moins" @click="vehicle.setVolume(vehicle.media.volume - 1)"><Icon name="chevron-down" size="18" /></button>
      <button type="button" :class="btn" aria-label="Appui molette gauche : couper le son" @click="vehicle.toggleMute()"><Icon :name="vehicle.media.muted ? 'volume-mute' : 'volume'" size="18" /></button>
      <span class="mx-1 h-6 w-px bg-bench-line" />
      <button type="button" :class="btn" aria-label="Piste précédente" @click="vehicle.step(-1)"><Icon name="prev" size="18" /></button>
      <button type="button" :class="btn" aria-label="Piste suivante" @click="vehicle.step(1)"><Icon name="next" size="18" /></button>
      <button type="button" :class="btn" aria-label="Touche vocale (Laura)" @click="voice"><Icon name="mic" size="18" /></button>
      <button type="button" :class="[btn, vehicle.cruise && 'text-[#78faae]']" aria-label="Régulateur adaptatif" :disabled="vehicle.gear !== 'D' || vehicle.speed < 30" @click="vehicle.toggleCruise()"><Icon name="gauge" size="18" /></button>
    </div>
  </div>
</template>
