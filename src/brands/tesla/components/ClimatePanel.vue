<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'
import { AIRFLOW_ICON_NAME } from '../catalog'
import { useVehicleStore } from '@/core/vehicle/store'
import type { Side } from '@/core/vehicle/types'
import { useTeslaStore } from '../store/tesla'
import TSlider from './ui/TSlider.vue'

/**
 * Écran principal des commandes de climatisation (manuel, « Réglage des paramètres de climatisation ») :
 * marche/arrêt, Auto, sièges chauffants à 3 niveaux, volant, dégivreurs (pare-brise à 3 états), vitesse de
 * ventilation, air extérieur ou recyclé, direction du flux, Séparer et Planifier.
 */
const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const c = vehicle.climate

function seat(side: Side) {
  vehicle.cycleSeat(side, 'heat')
}
const seatLabel = (side: Side) => (c.seatHeat[side] ? `niveau ${c.seatHeat[side]}` : 'éteint')

/** Pare-brise : 1er appui désembuage (orange), 2e dégivrage, 3e arrêt. */
function windscreen() {
  if (!c.defrostFront) {
    c.defrostFront = true
    c.on = true
    tesla.notify('Désembuage du pare-brise', 'defrost-front')
  } else if (c.airflow !== 'defrost') {
    c.airflow = 'defrost'
    tesla.notify('Dégivrage du pare-brise', 'defrost-front')
  } else {
    c.defrostFront = false
    c.airflow = 'both'
    tesla.notify('Dégivreur du pare-brise désactivé', 'defrost-front')
  }
}
const toggles: { icon: IconName; label: string; on: () => boolean; run: () => void }[] = [
  { icon: 'wheel-heat', label: 'Volant chauffant', on: () => c.wheelHeat, run: () => vehicle.toggleClimate('wheelHeat') },
  { icon: 'defrost-front', label: 'Pare-brise', on: () => c.defrostFront, run: windscreen },
  { icon: 'defrost-rear', label: 'Lunette arrière', on: () => c.defrostRear, run: () => vehicle.toggleClimate('defrostRear') },
]
</script>

<template>
  <section class="w-[560px] rounded-[26px] bg-surface p-5 shadow-pop" aria-label="Commandes de climatisation">
    <header class="mb-4 flex items-center gap-3">
      <button type="button" class="press grid size-11 place-items-center rounded-full" :class="c.on ? 'bg-accent text-on-accent' : 'bg-surface-2'" aria-label="Marche/arrêt de la climatisation" :aria-pressed="c.on" @click="vehicle.toggleClimate('on')"><Icon name="power" size="22" /></button>
      <button type="button" class="press h-11 rounded-full px-5 text-[15px] font-semibold" :class="c.auto && c.on ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-ink-2'" :aria-pressed="c.auto" @click="vehicle.toggleClimate('auto')">Auto</button>
      <button type="button" class="press h-11 rounded-full px-5 text-[15px] font-semibold" :class="!c.sync ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-ink-2'" :aria-pressed="!c.sync" @click="vehicle.toggleClimate('sync')">Séparer</button>
      <button type="button" class="press ml-auto h-11 rounded-full bg-surface-2 px-5 text-[15px] font-semibold" @click="tesla.notify('Planifier : préchauffage prévu pour 07:30', 'clock')">Planifier</button>
      <button type="button" class="press grid size-11 place-items-center rounded-full text-ink-2" aria-label="Fermer" @click="tesla.closePanel()"><Icon name="close" size="20" /></button>
    </header>

    <div class="grid grid-cols-2 gap-3">
      <button v-for="side in (['L', 'R'] as const)" :key="side" type="button" class="press flex items-center gap-3 rounded-2xl bg-surface-2 p-3 text-left" :aria-label="`Siège chauffant ${side === 'L' ? 'conducteur' : 'passager'}`" @click="seat(side)">
        <Icon name="seat-heat" size="28" :class="c.seatHeat[side] ? 'text-heat' : 'text-ink-3'" />
        <span class="flex-1"><b class="block text-[15px]">Siège {{ side === 'L' ? 'conducteur' : 'passager' }}</b><small class="text-ink-2">{{ seatLabel(side) }}</small></span>
        <span class="flex gap-1"><i v-for="n in 3" :key="n" class="h-5 w-1.5 rounded-full" :class="n <= c.seatHeat[side] ? 'bg-heat' : 'bg-surface-3'" /></span>
      </button>
    </div>

    <div class="mt-3 grid grid-cols-3 gap-3">
      <button v-for="t in toggles" :key="t.label" type="button" class="press flex h-[72px] flex-col items-center justify-center gap-1 rounded-2xl text-[13px] font-semibold" :class="t.on() ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-ink-2'" :aria-pressed="t.on()" @click="t.run()">
        <Icon :name="t.icon" size="26" :class="t.on() && (t.label === 'Pare-brise' && c.airflow !== 'defrost' ? 'text-warn' : 'text-heat')" />{{ t.label }}
      </button>
    </div>

    <div class="mt-4 flex items-center gap-4">
      <Icon name="fan" size="22" class="text-ink-2" />
      <TSlider :model-value="c.fan" :min="1" :max="8" label="Vitesse de ventilation" @update:model-value="vehicle.setFan($event)" />
      <span class="tnum w-6 text-right text-[16px] font-semibold">{{ c.fan }}</span>
    </div>

    <div class="mt-3 grid grid-cols-[1fr_1fr_1.4fr] gap-3">
      <button type="button" class="press flex h-14 items-center justify-center gap-2 rounded-2xl text-[14px] font-semibold" :class="!c.recirc ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-ink-2'" @click="c.recirc = false"><Icon name="air-face" size="22" />Air extérieur</button>
      <button type="button" class="press flex h-14 items-center justify-center gap-2 rounded-2xl text-[14px] font-semibold" :class="c.recirc ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-ink-2'" @click="c.recirc = true"><Icon name="recirc" size="22" />Recyclé</button>
      <button type="button" class="press flex h-14 items-center justify-center gap-2 rounded-2xl bg-surface-2 text-[14px] font-semibold" aria-label="Direction du flux d’air" @click="vehicle.cycleAirflow()"><Icon :name="AIRFLOW_ICON_NAME[c.airflow]" size="22" />Flux : {{ { face: 'visage', both: 'visage et pieds', feet: 'pieds', defrost: 'pare-brise' }[c.airflow] }}</button>
    </div>
    <p class="mt-3 text-[12.5px] text-ink-2">La climatisation est alimentée par la batterie haute tension : son usage prolongé réduit l’autonomie.</p>
  </section>
</template>
