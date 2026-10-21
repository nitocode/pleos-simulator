<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore } from '../../store/pleos'
import { AIRFLOW_ICON, AIRFLOW_LABEL } from '../../catalog'
import Knob from './Knob.vue'
import Rocker from './Rocker.vue'

/**
 * Commandes physiques, dans l'ordre des visuels Hyundai : chauffage/ventilation des sièges, volume,
 * température, ventilation, feux de détresse, mode, température passager, recherche, sièges passager.
 * À droite, les commandes au volant (OSD affiché 2 s dans la zone de contrôle).
 */
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const c = vehicle.climate

function volume(dir: -1 | 1) {
  vehicle.setVolume(vehicle.media.volume + dir)
  pleos.showOsd('Média', vehicle.media.volume, 40, vehicle.media.muted ? 'volume-mute' : 'volume')
}
function knobPress() {
  if (vehicle.media.source === 'radio') {
    vehicle.toggleMute()
    pleos.showOsd(vehicle.media.muted ? 'Son coupé' : 'Média', vehicle.media.muted ? 0 : vehicle.media.volume, 40, vehicle.media.muted ? 'volume-mute' : 'volume')
  } else vehicle.togglePlay()
}
function tune(dir: -1 | 1) {
  vehicle.step(dir)
}
function fan(dir: -1 | 1) {
  vehicle.setFan(c.fan + dir)
  pleos.showOsd('Ventilation', c.fan, 8, 'fan')
}
function temp(side: 'L' | 'R', dir: -1 | 1) {
  vehicle.nudgeTemp(side, dir * 0.5)
}
function seat(side: 'L' | 'R', kind: 'heat' | 'vent') {
  vehicle.cycleSeat(side, kind)
  const level = kind === 'heat' ? c.seatHeat[side] : c.seatVent[side]
  pleos.showOsd(`${kind === 'heat' ? 'Chauffage' : 'Ventilation'} siège ${side === 'L' ? 'conducteur' : 'passager'}`, level, 3, kind === 'heat' ? 'seat-heat' : 'seat-vent')
}
function mode() {
  vehicle.cycleAirflow()
  pleos.notify(`Diffusion : ${AIRFLOW_LABEL[c.airflow]}`, AIRFLOW_ICON[c.airflow])
}
function call() {
  if (!vehicle.call) return pleos.launch('phone')
  if (vehicle.call.status === 'incoming') return vehicle.answer()
  vehicle.hangUp()
  pleos.notify('Appel terminé', 'phone-off')
}
function voice() {
  pleos.gleo = pleos.gleo ? null : { phase: 'listen' }
}
function paddle(dir: -1 | 1) {
  pleos.notify(vehicle.paddle(dir), 'gauge')
}
</script>

<template>
  <div class="flex flex-wrap items-start justify-center gap-x-6 gap-y-4">
    <div class="flex flex-wrap items-start justify-center gap-4 rounded-[28px] border border-bench-line bg-gradient-to-b from-[#1b1e23] to-[#141619] px-5 py-3">
      <Rocker label="Sièges G" left="seat-heat" right="seat-vent" left-label="Chauffage siège conducteur" right-label="Ventilation siège conducteur" :left-on="c.seatHeat.L > 0" :right-on="c.seatVent.L > 0" left-tone="text-[#ff7a45]" right-tone="text-[#5cc8ff]" @left="seat('L', 'heat')" @right="seat('L', 'vent')" />
      <Knob label="Volume" icon="volume" @turn="volume" @press="knobPress" />
      <Rocker label="Temp." left="chevron-down" right="chevron-up" left-label="Baisser la température" right-label="Monter la température" @left="temp('L', -1)" @right="temp('L', 1)" />
      <Rocker label="Ventil." left="minus" right="plus" left-label="Moins de ventilation" right-label="Plus de ventilation" @left="fan(-1)" @right="fan(1)" />
      <div class="flex flex-col items-center gap-1.5">
        <button type="button" class="press relative grid h-[46px] w-[64px] place-items-center rounded-full bg-gradient-to-b from-[#2b2f36] to-[#1c1f24] text-[#ff5c61] shadow-[inset_0_1px_0_#3b4048,0_2px_5px_#0009]" aria-label="Feux de détresse" :aria-pressed="vehicle.hazard" @click="vehicle.toggleHazard()">
          <Icon name="hazard" size="24" :class="vehicle.hazard && 'animate-blink'" />
        </button>
        <span class="text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">Détresse</span>
      </div>
      <Rocker label="Mode" :left="AIRFLOW_ICON[c.airflow]" right="recirc" left-label="Mode de diffusion" right-label="Air recyclé" :right-on="c.recirc" @left="mode" @right="vehicle.toggleClimate('recirc')" />
      <Rocker label="Temp. D" left="chevron-down" right="chevron-up" left-label="Baisser la température passager" right-label="Monter la température passager" @left="temp('R', -1)" @right="temp('R', 1)" />
      <Knob label="Recherche" icon="disc" @turn="tune" @press="vehicle.togglePlay()" />
      <Rocker label="Sièges D" left="seat-heat" right="seat-vent" left-label="Chauffage siège passager" right-label="Ventilation siège passager" :left-on="c.seatHeat.R > 0" :right-on="c.seatVent.R > 0" left-tone="text-[#ff7a45]" right-tone="text-[#5cc8ff]" @left="seat('R', 'heat')" @right="seat('R', 'vent')" />
    </div>

    <div class="flex flex-wrap items-center justify-center gap-1.5 rounded-[28px] border border-bench-line bg-[#141619] px-3 py-3">
      <span class="px-1 text-[10.5px] font-semibold tracking-wider text-bench-dim uppercase">Volant</span>
      <button v-for="b in ([
        { icon: 'volume-mute', label: 'Silence', run: () => { vehicle.toggleMute(); pleos.showOsd(vehicle.media.muted ? 'Son coupé' : 'Média', vehicle.media.muted ? 0 : vehicle.media.volume, 40, vehicle.media.muted ? 'volume-mute' : 'volume') } },
        { icon: 'minus', label: 'Volume moins', run: () => volume(-1) },
        { icon: 'plus', label: 'Volume plus', run: () => volume(1) },
        { icon: 'prev', label: 'Piste précédente', run: () => tune(-1) },
        { icon: 'next', label: 'Piste suivante', run: () => tune(1) },
        { icon: 'phone', label: 'Appeler / répondre', run: call },
        { icon: 'mic', label: 'Reconnaissance vocale (Gleo AI)', run: voice },
      ] as const)" :key="b.label" type="button" class="press grid size-10 place-items-center rounded-xl bg-[#22262d] text-[#c9cfd8] hover:bg-[#2a2f37]" :aria-label="b.label" :title="b.label" @click="b.run()">
        <Icon :name="b.icon" size="18" />
      </button>
      <button type="button" class="press h-10 rounded-xl bg-[#22262d] px-3 text-[12px] font-semibold text-[#c9cfd8]" @click="paddle(-1)">◀ Palette</button>
      <button type="button" class="press h-10 rounded-xl bg-[#22262d] px-3 text-[12px] font-semibold text-[#c9cfd8]" @click="paddle(1)">Palette ▶</button>
    </div>
  </div>
</template>
