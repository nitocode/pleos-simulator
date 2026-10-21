<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import type { TempUnit } from '@/core/format'
import { useVehicleStore } from '@/core/vehicle/store'
import type { Level, Side } from '@/core/vehicle/types'
import { AIRFLOW_ICON, AIRFLOW_LABEL } from '../../catalog'
import { usePleosStore } from '../../store/pleos'
import TempValue from '../ui/TempValue.vue'

/** Écran de la climatisation avant (manuel : Accès à l’écran de la climatisation). */
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const c = vehicle.climate
const unit = computed(() => pleos.prefs.tempUnit as TempUnit)
const outside = computed(() => (unit.value === '°F' ? Math.round((vehicle.outsideTemp * 9) / 5 + 32) : vehicle.outsideTemp))

const toggle = (k: 'on' | 'auto' | 'ac' | 'recirc' | 'defrostFront' | 'defrostRear' | 'sync' | 'wheelHeat') => vehicle.toggleClimate(k)
const seat = (side: Side, kind: 'heat' | 'vent') => vehicle.cycleSeat(side, kind)
const lv = (n: Level) => [1, 2, 3].map((i) => n >= i)
const flowOn = (mode: 'face' | 'feet' | 'defrost') =>
  c.on && (c.airflow === mode || (c.airflow === 'both' && mode !== 'defrost') || (c.airflow === 'defrost' && mode === 'feet'))
function setFlow(mode: 'face' | 'feet' | 'defrost') {
  const next = mode === 'face' ? (c.airflow === 'feet' ? 'both' : 'face') : mode === 'feet' ? (c.airflow === 'face' ? 'both' : 'feet') : 'defrost'
  c.airflow = next
  c.auto = false
  c.on = true
}
const fanLabel = computed(() => (c.fan > 5 ? 'HIGH' : c.fan > 2 ? 'MED' : 'LOW'))
</script>

<template>
  <div class="absolute inset-x-0 bottom-0 z-20 rounded-[22px] border border-line bg-surface p-4 shadow-pop night:rounded-[16px]" role="dialog" aria-label="Climatisation">
    <div class="grid grid-cols-[188px_1fr_188px] gap-4">
      <!-- colonne conducteur -->
      <div class="flex flex-col gap-2.5">
        <div class="grid grid-cols-3 gap-2">
          <button type="button" class="press h-12 rounded-xl bg-surface-2 text-[14px] font-extrabold transition-colors" :class="c.on ? 'text-ok' : 'text-ink-3'" @click="toggle('on')">{{ c.on ? 'ON' : 'OFF' }}</button>
          <button type="button" class="press grid h-12 place-items-center rounded-xl bg-surface-2 transition-colors" :class="c.defrostFront ? 'text-heat' : 'text-ink-2'" aria-label="Dégivrage avant" :aria-pressed="c.defrostFront" @click="toggle('defrostFront')"><Icon name="defrost-front" size="24" /></button>
          <button type="button" class="press grid h-12 place-items-center rounded-xl bg-surface-2 transition-colors" :class="c.defrostRear ? 'text-heat' : 'text-ink-2'" aria-label="Dégivrage arrière" :aria-pressed="c.defrostRear" @click="toggle('defrostRear')"><Icon name="defrost-rear" size="24" /></button>
          <button type="button" class="press flex h-12 flex-col items-center justify-center rounded-xl bg-surface-2 leading-none font-extrabold transition-colors" :class="c.auto && c.on ? 'text-ok' : 'text-ink-3'" @click="toggle('auto')"><span class="text-[13px]">AUTO</span><span class="text-[10px]">{{ fanLabel }}</span></button>
          <button type="button" class="press h-12 rounded-xl bg-surface-2 text-[14px] font-extrabold transition-colors" :class="c.ac && c.on ? 'text-ok' : 'text-ink-3'" @click="toggle('ac')">A/C</button>
          <button type="button" class="press grid h-12 place-items-center rounded-xl bg-surface-2 transition-colors" :class="c.recirc ? 'text-ok' : 'text-ink-2'" aria-label="Air recyclé" :aria-pressed="c.recirc" @click="toggle('recirc')"><Icon name="recirc" size="24" /></button>
        </div>
        <div class="flex flex-1 items-center justify-between rounded-2xl bg-surface-2 px-2">
          <button type="button" class="press grid size-12 place-items-center rounded-xl text-cool" aria-label="Baisser" @click="vehicle.nudgeTemp('L', -0.5)"><Icon name="chevron-down" size="26" :stroke="2.4" /></button>
          <span class="text-[34px] font-light"><TempValue :value="c.temp.L" :unit="unit" :off="!c.on" /></span>
          <button type="button" class="press grid size-12 place-items-center rounded-xl text-heat" aria-label="Monter" @click="vehicle.nudgeTemp('L', 0.5)"><Icon name="chevron-up" size="26" :stroke="2.4" /></button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button type="button" class="press grid h-[54px] place-items-center rounded-xl bg-surface-2 transition-colors" :class="c.wheelHeat ? 'text-heat' : 'text-ink-2'" aria-label="Volant chauffant" :aria-pressed="c.wheelHeat" @click="toggle('wheelHeat')"><Icon name="wheel-heat" size="26" /></button>
          <button type="button" class="press flex h-[54px] flex-col items-center justify-center gap-1 rounded-xl bg-surface-2" :class="c.seatVent.L ? 'text-cool' : 'text-ink-2'" aria-label="Ventilation siège conducteur" @click="seat('L', 'vent')">
            <Icon name="seat-vent" size="24" /><span class="flex gap-0.5"><i v-for="(on, i) in lv(c.seatVent.L)" :key="i" class="h-[3px] w-2 rounded-full transition-colors" :class="on ? 'bg-cool' : 'bg-surface-3'" /></span>
          </button>
          <button type="button" class="press flex h-[54px] flex-col items-center justify-center gap-1 rounded-xl bg-surface-2" :class="c.seatHeat.L ? 'text-heat' : 'text-ink-2'" aria-label="Chauffage siège conducteur" @click="seat('L', 'heat')">
            <Icon name="seat-heat" size="24" /><span class="flex gap-0.5"><i v-for="(on, i) in lv(c.seatHeat.L)" :key="i" class="h-[3px] w-2 rounded-full transition-colors" :class="on ? 'bg-heat' : 'bg-surface-3'" /></span>
          </button>
        </div>
      </div>

      <!-- habitacle et diffusion -->
      <div class="relative min-h-[292px] overflow-hidden rounded-2xl bg-gradient-to-b from-surface-2 to-surface">
        <div class="absolute top-3 left-1/2 flex -translate-x-1/2 rounded-full bg-surface-3/70 p-1 text-[12px] font-extrabold">
          <span class="rounded-full bg-surface px-4 py-1.5 shadow-card">FRONT</span>
          <button type="button" class="px-4 py-1.5 text-ink-3" @click="pleos.notify('Climatisation arrière non disponible sur ce véhicule', 'info')">REAR</button>
        </div>
        <div class="absolute top-3 right-4 text-right text-[11px] leading-tight font-extrabold tracking-wide text-ink-2">
          <span class="inline-flex items-center gap-1"><Icon name="leaf" size="14" class="text-ok" />OUTSIDE</span>
          <div class="tnum text-[18px] text-ink">{{ outside }}°</div>
        </div>
        <svg viewBox="0 0 600 300" class="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <g fill="none" stroke="var(--ui-ink-3)" stroke-width="2" opacity="0.6">
            <path d="M40 300 L120 112 Q300 70 480 112 L560 300" />
            <path d="M150 104 Q300 76 450 104" />
            <circle cx="210" cy="206" r="52" />
            <circle cx="210" cy="206" r="16" />
            <rect x="262" y="132" width="104" height="62" rx="10" />
            <path d="M84 262 Q300 236 516 262" />
          </g>
        </svg>
        <!-- zones de diffusion cliquables -->
        <button type="button" class="press absolute top-[30%] left-[16%] flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-extrabold transition-colors" :class="flowOn('defrost') ? 'bg-heat-soft text-heat' : 'text-ink-3'" aria-label="Diffusion vers le pare-brise" @click="setFlow('defrost')">
          <Icon name="defrost-front" size="24" />PARE-BRISE
        </button>
        <button type="button" class="press absolute top-[38%] right-[14%] flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-extrabold transition-colors" :class="flowOn('face') ? 'bg-cool-soft text-cool' : 'text-ink-3'" aria-label="Diffusion vers le visage" @click="setFlow('face')">
          <Icon name="air-face" size="24" />VISAGE
        </button>
        <button type="button" class="press absolute bottom-[22%] left-[44%] flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-extrabold transition-colors" :class="flowOn('feet') ? 'bg-cool-soft text-cool' : 'text-ink-3'" aria-label="Diffusion vers les pieds" @click="setFlow('feet')">
          <Icon name="air-feet" size="24" />PIEDS
        </button>
        <div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-2xl bg-surface p-1 shadow-card night:bg-surface-2">
          <button type="button" class="press grid size-11 place-items-center rounded-xl" aria-label="Moins de ventilation" @click="vehicle.setFan(c.fan - 1)"><Icon name="chevron-left" size="22" /></button>
          <span class="flex items-center gap-1.5 px-1"><Icon name="fan" size="22" :class="c.on && 'animate-spin'" style="animation-duration: 3s" /><b class="tnum w-4 text-[18px]">{{ c.fan }}</b></span>
          <button type="button" class="press grid size-11 place-items-center rounded-xl" aria-label="Plus de ventilation" @click="vehicle.setFan(c.fan + 1)"><Icon name="chevron-right" size="22" /></button>
          <span class="mx-1 h-7 w-px bg-line" />
          <button type="button" class="press flex h-11 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold" @click="vehicle.cycleAirflow()"><Icon :name="AIRFLOW_ICON[c.airflow]" size="22" />{{ AIRFLOW_LABEL[c.airflow] }}</button>
        </div>
      </div>

      <!-- colonne passager -->
      <div class="flex flex-col gap-2.5">
        <div class="grid grid-cols-3 gap-2">
          <span />
          <span />
          <button type="button" class="press h-12 rounded-xl bg-surface-2 text-[13px] font-extrabold transition-colors" :class="c.sync ? 'text-ok' : 'text-ink-3'" @click="toggle('sync')">SYNC</button>
        </div>
        <div class="h-12" />
        <div class="flex flex-1 items-center justify-between rounded-2xl bg-surface-2 px-2">
          <button type="button" class="press grid size-12 place-items-center rounded-xl text-cool" aria-label="Baisser" @click="vehicle.nudgeTemp('R', -0.5)"><Icon name="chevron-down" size="26" :stroke="2.4" /></button>
          <span class="text-[34px] font-light"><TempValue :value="c.temp.R" :unit="unit" :off="!c.on" /></span>
          <button type="button" class="press grid size-12 place-items-center rounded-xl text-heat" aria-label="Monter" @click="vehicle.nudgeTemp('R', 0.5)"><Icon name="chevron-up" size="26" :stroke="2.4" /></button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <span />
          <button type="button" class="press flex h-[54px] flex-col items-center justify-center gap-1 rounded-xl bg-surface-2" :class="c.seatHeat.R ? 'text-heat' : 'text-ink-2'" aria-label="Chauffage siège passager" @click="seat('R', 'heat')">
            <Icon name="seat-heat" size="24" /><span class="flex gap-0.5"><i v-for="(on, i) in lv(c.seatHeat.R)" :key="i" class="h-[3px] w-2 rounded-full transition-colors" :class="on ? 'bg-heat' : 'bg-surface-3'" /></span>
          </button>
          <button type="button" class="press flex h-[54px] flex-col items-center justify-center gap-1 rounded-xl bg-surface-2" :class="c.seatVent.R ? 'text-cool' : 'text-ink-2'" aria-label="Ventilation siège passager" @click="seat('R', 'vent')">
            <Icon name="seat-vent" size="24" /><span class="flex gap-0.5"><i v-for="(on, i) in lv(c.seatVent.R)" :key="i" class="h-[3px] w-2 rounded-full transition-colors" :class="on ? 'bg-cool' : 'bg-surface-3'" /></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
