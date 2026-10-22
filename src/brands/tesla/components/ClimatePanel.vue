<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'
import { useVehicleStore } from '@/core/vehicle/store'
import type { Airflow, Side } from '@/core/vehicle/types'
import { useTeslaStore, type ClimateKeeper } from '../store/tesla'

/**
 * Écran principal des commandes de climatisation (capture du manuel, repères 1 à 16) : en haut marche/arrêt, Auto, A/C,
 * direction du flux, Avant/Arrière, Maintien de la climatisation / Mode Animaux / Mode Camping et Planifier ; au centre
 * l'habitacle avec les ondes d'air ; en bas sièges, volant, dégivreurs, ventilation et air recyclé.
 */
const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const c = vehicle.climate
const parked = computed(() => vehicle.gear === 'P' && !vehicle.moving)
const KEEPERS: ClimateKeeper[] = ['Arrêt', 'Maintien', 'Animaux', 'Camping']
const FLOWS: [Airflow, IconName, string][] = [
  ['face', 'air-face', 'Visage'],
  ['both', 'air-both', 'Visage et pieds'],
  ['feet', 'air-feet', 'Pieds'],
]
const fanLabel = computed(() => (c.auto ? (c.fan <= 3 ? 'Bas' : c.fan <= 6 ? 'Moyen' : 'Haut') : String(c.fan)))
const waveColor = computed(() => (!c.on ? 'transparent' : c.temp.L >= 23 ? '#e8472b' : c.temp.L <= 19 ? '#3e6ae1' : '#8a9bb5'))
const waveSeconds = computed(() => Math.max(0.8, 3.4 - c.fan * 0.3))

function keeper(k: ClimateKeeper) {
  if (k !== 'Arrêt' && !parked.value) return tesla.notify('Disponible uniquement en P (stationnement)', 'warning')
  if (k !== 'Arrêt' && vehicle.battery < 20) return tesla.notify('Batterie inférieure à 20 % : branchez le véhicule', 'warning')
  tesla.keeper = k
  if (k !== 'Arrêt') c.on = true
  tesla.notify(k === 'Arrêt' ? 'Maintien de la climatisation désactivé' : k === 'Maintien' ? 'Maintien de la climatisation activé' : `Mode ${k} activé`, k === 'Animaux' ? 'sofa' : 'thermometer')
}
function seat(side: Side) {
  vehicle.cycleSeat(side, 'heat')
}
function wipers() {
  tesla.prefs.wiperDefrost = !tesla.prefs.wiperDefrost
  if (tesla.prefs.wiperDefrost) tesla.notify('Dégivreurs d’essuie-glaces activés pour 30 minutes', 'defrost-front')
}
function fan(dir: -1 | 1) {
  vehicle.setFan(c.fan + dir)
}
const pill = (on: boolean) => (on ? 'text-accent' : 'text-ink-2')
</script>

<template>
  <section class="relative flex size-full flex-col overflow-hidden bg-surface" aria-label="Commandes de climatisation">
    <!-- rangée du haut -->
    <header class="z-10 flex items-center gap-4 px-6 pt-4 text-[14px] font-semibold">
      <button type="button" class="press grid size-10 place-items-center rounded-full" :class="c.on ? 'text-accent' : 'text-ink-3'" aria-label="Marche/arrêt de la climatisation" :aria-pressed="c.on" @click="vehicle.toggleClimate('on')"><Icon name="power" size="22" /></button>
      <button type="button" class="press" :class="pill(c.auto && c.on)" :aria-pressed="c.auto" @click="vehicle.toggleClimate('auto')">Auto</button>
      <button type="button" class="press" :class="pill(c.ac && c.on)" :aria-pressed="c.ac" @click="vehicle.toggleClimate('ac')">A/C</button>
      <span class="flex gap-1 border-l border-line pl-3">
        <button v-for="[id, icon, label] in FLOWS" :key="id" type="button" class="press grid size-9 place-items-center rounded-lg" :class="c.airflow === id ? 'text-accent' : 'text-ink-3'" :aria-label="`Flux d’air : ${label}`" :aria-pressed="c.airflow === id" @click="c.airflow = id"><Icon :name="icon" size="20" /></button>
      </span>
      <div class="mx-auto flex flex-col items-center gap-1.5">
        <div class="flex rounded-xl bg-surface-2 p-1" role="radiogroup" aria-label="Maintien de la climatisation">
          <button v-for="k in KEEPERS" :key="k" type="button" role="radio" :aria-checked="tesla.keeper === k" class="press rounded-lg px-3.5 py-1.5 text-[13.5px]" :class="tesla.keeper === k ? 'bg-surface text-ink shadow-card' : 'text-ink-2'" @click="keeper(k)">{{ k }}</button>
        </div>
        <div class="flex gap-5 text-[13px]">
          <button v-for="z in (['Avant', 'Arrière'] as const)" :key="z" type="button" class="press" :class="tesla.climateZone === z ? 'text-ink' : 'text-ink-3'" @click="tesla.climateZone = z">{{ z }}</button>
        </div>
      </div>
      <button type="button" class="press flex items-center gap-1.5 text-ink-2" @click="tesla.notify('Planifier : véhicule prêt à 07:30 (préchauffage)', 'clock')">Planifier<Icon name="clock" size="18" /></button>
      <button type="button" class="press grid size-10 place-items-center rounded-full text-ink-2" aria-label="Fermer" @click="tesla.closePanel()"><Icon name="close" size="20" /></button>
    </header>

    <!-- habitacle -->
    <div class="relative min-h-0 flex-1">
      <svg viewBox="0 0 900 300" preserveAspectRatio="xMidYMid meet" class="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <linearGradient id="t-dash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ui-surface-2)" /><stop offset="1" stop-color="var(--ui-surface-3)" /></linearGradient>
        </defs>
        <template v-if="tesla.climateZone === 'Avant'">
          <path d="M40 120C200 90 700 90 860 120L860 170L40 170Z" fill="url(#t-dash)" />
          <rect x="120" y="128" width="660" height="10" rx="5" fill="var(--ui-line)" />
          <!-- volant -->
          <g transform="translate(270 196)" fill="none" stroke="var(--ui-ink-3)" stroke-width="12"><circle r="74" /><path d="M-70 8H70M0 8V70" stroke-width="10" /></g>
          <!-- écran central -->
          <rect x="390" y="140" width="130" height="78" rx="8" fill="var(--ui-ink)" opacity="0.85" />
          <!-- ondes d'air -->
          <g :stroke="waveColor" stroke-width="5" fill="none" stroke-linecap="round" class="wave" :style="{ animationDuration: `${waveSeconds}s` }">
            <path d="M200 130C240 110 300 110 340 130" /><path d="M560 130C600 110 660 110 700 130" />
            <path v-if="c.airflow !== 'face'" d="M220 260C250 245 290 245 320 260" opacity="0.7" /><path v-if="c.airflow !== 'face'" d="M580 260C610 245 650 245 680 260" opacity="0.7" />
            <path v-if="c.defrostFront || c.airflow === 'defrost'" d="M160 96C320 70 580 70 740 96" stroke="#ffb547" />
          </g>
        </template>
        <template v-else>
          <rect x="250" y="100" width="400" height="150" rx="28" fill="url(#t-dash)" />
          <rect x="385" y="150" width="130" height="60" rx="8" fill="var(--ui-ink)" opacity="0.85" />
          <g :stroke="waveColor" stroke-width="5" fill="none" stroke-linecap="round" class="wave" :style="{ animationDuration: `${waveSeconds}s` }"><path d="M330 120C370 100 420 100 450 120" /><path d="M460 120C490 100 540 100 580 120" /></g>
        </template>
      </svg>
      <p v-if="c.on && c.auto" class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[13px] text-ink-2">{{ vehicle.outsideTemp < c.temp.L ? 'Mise en température' : 'Refroidissement' }}</p>
    </div>

    <!-- rangée du bas -->
    <footer class="z-10 flex items-end justify-between px-6 pb-4 text-[11px] font-semibold text-ink-2">
      <button type="button" class="press flex flex-col items-center gap-1" aria-label="Siège chauffant conducteur" @click="seat('L')"><Icon name="seat-heat" size="26" :class="c.seatHeat.L ? 'text-heat' : ''" /><span class="flex gap-0.5"><i v-for="n in 3" :key="n" class="h-[3px] w-[6px] rounded-full" :class="n <= c.seatHeat.L ? 'bg-heat' : 'bg-surface-3'" /></span></button>
      <button type="button" class="press flex flex-col items-center gap-1" aria-label="Volant chauffant" :aria-pressed="c.wheelHeat" @click="vehicle.toggleClimate('wheelHeat')"><Icon name="wheel-heat" size="26" :class="c.wheelHeat ? 'text-heat' : ''" /></button>
      <button type="button" class="press flex flex-col items-center gap-0.5" aria-label="Dégivreurs d’essuie-glaces" :aria-pressed="tesla.prefs.wiperDefrost" @click="wipers"><span>Auto</span><Icon name="defrost-front" size="24" :class="tesla.prefs.wiperDefrost ? 'text-warn' : ''" /></button>
      <button type="button" class="press" aria-label="Dégivreur du pare-brise" :aria-pressed="c.defrostFront" @click="vehicle.toggleClimate('defrostFront')"><Icon name="defrost-front" size="26" :class="c.defrostFront ? 'text-warn' : ''" /></button>
      <button type="button" class="press" aria-label="Dégivreur de la lunette arrière" :aria-pressed="c.defrostRear" @click="vehicle.toggleClimate('defrostRear')"><Icon name="defrost-rear" size="26" :class="c.defrostRear ? 'text-warn' : ''" /></button>
      <div class="flex items-center gap-2 text-ink">
        <button type="button" class="press grid size-9 place-items-center text-ink-2" aria-label="Moins de ventilation" @click="fan(-1)"><Icon name="chevron-left" size="20" /></button>
        <Icon name="fan" size="22" /><b class="w-14 text-[14px]">{{ fanLabel }}</b>
        <button type="button" class="press grid size-9 place-items-center text-ink-2" aria-label="Plus de ventilation" @click="fan(1)"><Icon name="chevron-right" size="20" /></button>
      </div>
      <button type="button" class="press flex flex-col items-center gap-0.5" aria-label="Air recyclé" :aria-pressed="c.recirc" @click="vehicle.toggleClimate('recirc')"><span>Auto</span><Icon name="recirc" size="24" :class="c.recirc ? 'text-accent' : ''" /></button>
      <button type="button" class="press flex flex-col items-center gap-1" aria-label="Siège chauffant passager" @click="seat('R')"><Icon name="seat-heat" size="26" class="-scale-x-100" :class="c.seatHeat.R ? 'text-heat' : ''" /><span class="flex gap-0.5"><i v-for="n in 3" :key="n" class="h-[3px] w-[6px] rounded-full" :class="n <= c.seatHeat.R ? 'bg-heat' : 'bg-surface-3'" /></span></button>
    </footer>
  </section>
</template>

<style scoped>
/* Les ondes d'air défilent d'autant plus vite que la ventilation est forte (durée posée sur le groupe). */
.wave path {
  stroke-dasharray: 26 14;
  animation: wave linear infinite;
  animation-duration: inherit;
}
@keyframes wave {
  to { stroke-dashoffset: -80; }
}
</style>
