<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { distance, fmt1, mmss, type DistanceUnit } from '@/core/format'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore } from '../../store/pleos'

/** Widgets utilitaires sous la vue de conduite : trajet actuel, média, pneus. */
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const COUNT = 3
const direction = ref(1)

function go(delta: number) {
  direction.value = delta
  pleos.widget = (pleos.widget + delta + COUNT) % COUNT
}
let startX = 0
function down(e: PointerEvent) {
  startX = e.clientX
}
function up(e: PointerEvent) {
  const dx = e.clientX - startX
  if (Math.abs(dx) > 30) go(dx < 0 ? 1 : -1)
}

const unit = computed(() => pleos.prefs.distanceUnit as DistanceUnit)
const efficiency = computed(() =>
  pleos.prefs.consumptionUnit === 'km/kWh' ? { v: fmt1(100 / vehicle.consumption), u: 'km/kWh' } : { v: fmt1(vehicle.consumption), u: 'kWh/100 km' },
)
const duration = computed(() => {
  const m = Math.round(vehicle.tripMinutes)
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
})
const media = computed(() =>
  vehicle.media.source === 'radio'
    ? { title: vehicle.currentStation.name, sub: `FM ${vehicle.currentStation.freq}`, colors: ['#ff5fa2', '#e0337f'], art: 'FM' }
    : { title: vehicle.currentTrack.title, sub: vehicle.currentTrack.artist, colors: vehicle.currentTrack.colors, art: '' },
)
function resetTrip() {
  vehicle.trip = 0
  vehicle.tripMinutes = 0
  pleos.notify('Trajet actuel réinitialisé', 'rotate-ccw')
}
</script>

<template>
  <div class="-mx-6 mt-1 overflow-hidden transition-[height] duration-300 ease-ui" :style="{ height: pleos.widgetOpen ? '150px' : '34px' }">
    <div class="mx-3 h-[146px] rounded-[18px] bg-surface-2 px-4 pt-1 pb-2">
      <button type="button" class="mx-auto flex h-6 w-16 items-center justify-center" :aria-label="pleos.widgetOpen ? 'Fermer les widgets' : 'Ouvrir les widgets'" @click="pleos.widgetOpen = !pleos.widgetOpen">
        <span class="h-[5px] w-10 rounded-full bg-ink-3/60" />
      </button>
      <div class="relative h-[92px] touch-pan-y select-none" @pointerdown="down" @pointerup="up">
        <Transition :name="direction > 0 ? 'slide' : 'slide-back'" mode="out-in">
          <div v-if="pleos.widget === 0" key="trip" class="flex h-full items-center gap-4">
            <div class="flex flex-col gap-2">
              <b class="text-[15px]">Trajet actuel</b>
              <button type="button" class="press flex h-9 items-center gap-1.5 rounded-lg bg-surface px-3 text-[13px] font-semibold shadow-card night:bg-surface-3" @click="resetTrip">
                <Icon name="rotate-ccw" size="16" />Réinitialiser
              </button>
            </div>
            <div class="grid flex-1 grid-cols-3 text-center">
              <div v-for="cell in [
                { k: 'Distance', v: distance(vehicle.trip, unit).split(' ')[0], u: unit },
                { k: 'Temps', v: duration, u: 'h:m' },
                { k: 'Efficacité', v: efficiency.v, u: efficiency.u },
              ]" :key="cell.k" class="flex flex-col">
                <span class="text-[12px] font-semibold text-ink-2">{{ cell.k }}</span>
                <span class="tnum text-[22px] font-semibold">{{ cell.v }}</span>
                <span class="text-[11px] text-ink-3">{{ cell.u }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="pleos.widget === 1" key="media" class="flex h-full items-center gap-3">
            <span class="grid size-[64px] flex-none place-items-center rounded-xl text-[15px] font-bold text-white" :style="{ background: `linear-gradient(135deg, ${media.colors[0]}, ${media.colors[1]})` }">{{ media.art || '♪' }}</span>
            <div class="min-w-0 flex-1">
              <b class="block truncate text-[16px]">{{ media.title }}</b>
              <span class="block truncate text-[13px] text-ink-2">{{ media.sub }}</span>
              <span v-if="vehicle.media.source === 'bluetooth'" class="tnum text-[11px] text-ink-3">{{ mmss(vehicle.media.position) }} / {{ mmss(vehicle.currentTrack.duration) }}</span>
            </div>
            <button type="button" class="press grid size-10 place-items-center rounded-full" aria-label="Précédent" @click="vehicle.step(-1)"><Icon name="prev" size="20" /></button>
            <button type="button" class="press grid size-11 place-items-center rounded-full bg-ink text-surface" aria-label="Lecture ou pause" @click="vehicle.togglePlay()"><Icon :name="vehicle.media.playing ? 'pause' : 'play'" size="20" /></button>
            <button type="button" class="press grid size-10 place-items-center rounded-full" aria-label="Suivant" @click="vehicle.step(1)"><Icon name="next" size="20" /></button>
          </div>
          <div v-else key="tires" class="flex h-full items-center gap-5">
            <b class="text-[15px]">Pneus</b>
            <div class="tnum grid flex-1 grid-cols-2 gap-x-6 gap-y-1 text-[17px]">
              <span>AV G <b>2,5</b></span><span>AV D <b>2,5</b></span><span>AR G <b>2,4</b></span><span>AR D <b>2,4</b></span>
            </div>
            <span class="text-[12px] font-semibold text-ok">Normal</span>
          </div>
        </Transition>
      </div>
      <div class="flex justify-center gap-1.5">
        <button v-for="i in COUNT" :key="i" type="button" class="h-1.5 rounded-full transition-all duration-300" :class="pleos.widget === i - 1 ? 'w-4 bg-ink-2' : 'w-1.5 bg-ink-3/50'" :aria-label="`Widget ${i}`" @click="go(i - 1 - pleos.widget)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-back-enter-active,
.slide-back-leave-active {
  transition: transform 0.24s var(--ease-ui), opacity 0.2s var(--ease-ui);
}
.slide-back-enter-from {
  transform: translateX(-14px);
  opacity: 0;
}
.slide-back-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
