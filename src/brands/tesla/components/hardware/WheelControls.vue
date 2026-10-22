<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import { useTeslaStore } from '../../store/tesla'

/**
 * Commandes physiques du volant (manuel, « Boutons de défilement ») : le bouton gauche règle le volume (défilement),
 * change de morceau (inclinaison), met en pause (appui) et gère les appels ; les deux boutons ensemble, appui long,
 * redémarrent l'écran tactile. Les feux de détresse sont sur la console de pavillon.
 */
const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const parked = computed(() => vehicle.gear === 'P' && !vehicle.moving)
const incoming = computed(() => vehicle.call?.status === 'incoming')
const inCall = computed(() => vehicle.call && vehicle.call.status !== 'incoming')
let holdTimer: ReturnType<typeof setTimeout> | undefined

function volume(dir: -1 | 1) {
  vehicle.setVolume(vehicle.media.volume + dir)
  tesla.notify(`Volume ${vehicle.media.volume}`, vehicle.media.muted ? 'volume-mute' : 'volume')
}
function tilt(dir: -1 | 1) {
  if (incoming.value) return dir < 0 ? vehicle.answer() : vehicle.hangUp()
  if (inCall.value) {
    if (dir > 0) return vehicle.hangUp()
    vehicle.toggleMute()
    return
  }
  vehicle.step(dir)
}
function holdStart() {
  if (!parked.value) return tesla.notify('Redémarrage de l’écran uniquement à l’arrêt en P', 'warning')
  holdTimer = setTimeout(() => {
    tesla.closePanel()
    tesla.rebooting = true
    setTimeout(() => (tesla.rebooting = false), 4000)
  }, 1200)
}
function holdEnd() {
  clearTimeout(holdTimer)
}
const btn = 'press grid size-11 place-items-center rounded-xl bg-[#22262d] text-[#c9cfd8] hover:bg-[#2a2f37]'
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
    <div class="flex items-center gap-2 rounded-[28px] border border-bench-line bg-[#141619] px-4 py-3">
      <span class="pr-1 text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">Bouton gauche</span>
      <button type="button" :class="btn" aria-label="Incliner à gauche : morceau précédent, répondre ou couper le son" @click="tilt(-1)"><Icon name="prev" size="18" /></button>
      <div class="flex flex-col gap-1">
        <button type="button" :class="[btn, 'h-9']" aria-label="Défiler vers le haut : volume plus" @click="volume(1)"><Icon name="chevron-up" size="18" /></button>
        <button type="button" :class="[btn, 'h-9']" aria-label="Défiler vers le bas : volume moins" @click="volume(-1)"><Icon name="chevron-down" size="18" /></button>
      </div>
      <button type="button" :class="btn" aria-label="Incliner à droite : morceau suivant ou raccrocher" @click="tilt(1)"><Icon name="next" size="18" /></button>
      <button type="button" :class="[btn, 'w-auto px-3 text-[12px] font-semibold']" aria-label="Appui : lecture ou pause" @click="vehicle.togglePlay()"><Icon :name="vehicle.media.playing ? 'pause' : 'play'" size="18" /></button>
    </div>

    <div class="flex items-center gap-2 rounded-[28px] border border-bench-line bg-[#141619] px-4 py-3">
      <span class="pr-1 text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">Volant</span>
      <button type="button" :class="[btn, 'w-auto px-3 text-[12px] font-semibold']" aria-label="Deux boutons de défilement, appui long : redémarrer l’écran tactile" title="Maintenir pour redémarrer l’écran tactile (en P)" @pointerdown="holdStart" @pointerup="holdEnd" @pointerleave="holdEnd">Redémarrer l’écran (maintenir)</button>
      <button type="button" :class="btn" aria-label="Caméra arrière" @click="tesla.cameraFull ? ((tesla.cameraFull = false), tesla.closeApp()) : ((tesla.cameraFull = true), tesla.launch('camera'))"><Icon name="camera" size="18" /></button>
      <button type="button" :class="btn" aria-label="Commandes vocales" @click="tesla.notify('Commandes vocales : disponibles dans une prochaine version', 'mic')"><Icon name="mic" size="18" /></button>
      <button type="button" :class="btn" aria-label="Klaxon" title="Klaxon" @click="tesla.notify('Klaxon', 'bell')"><Icon name="bell" size="18" /></button>
    </div>

    <div class="flex flex-col items-center gap-1.5">
      <button type="button" class="press relative grid h-[46px] w-[64px] place-items-center rounded-full bg-gradient-to-b from-[#2b2f36] to-[#1c1f24] text-[#ff5c61] shadow-[inset_0_1px_0_#3b4048,0_2px_5px_#0009]" aria-label="Feux de détresse (console de pavillon)" :aria-pressed="vehicle.hazard" @click="vehicle.toggleHazard()"><Icon name="hazard" size="24" :class="vehicle.hazard && 'animate-blink'" /></button>
      <span class="text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">Détresse</span>
    </div>
  </div>
</template>
