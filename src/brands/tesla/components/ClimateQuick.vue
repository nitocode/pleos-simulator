<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { clampTemp, TEMP_MAX, TEMP_MIN, useVehicleStore } from '@/core/vehicle/store'
import { useTeslaStore } from '../store/tesla'

/**
 * Fenêtre contextuelle de climatisation (capture du manuel) : réglages, siège chauffant/froid, dégivreurs avant et
 * arrière, curseur de température bleu → rouge et « Séparer ».
 */
const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const c = vehicle.climate
const ratio = computed(() => ((c.temp.L - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100)

function setTemp(e: Event) {
  vehicle.setTemp('L', clampTemp(+(e.target as HTMLInputElement).value))
}
const btn = 'press grid h-12 place-items-center rounded-xl border border-line text-ink-2'
</script>

<template>
  <section class="w-[430px] rounded-[22px] bg-surface p-4 shadow-pop" aria-label="Climatisation rapide">
    <div class="flex items-center gap-2.5">
      <button type="button" :class="[btn, 'w-14']" aria-label="Écran principal de climatisation" @click="tesla.panel = 'climate'"><Icon name="settings" size="22" class="text-ink" /></button>
      <div class="flex flex-1 overflow-hidden rounded-xl border border-line">
        <button type="button" class="press grid h-12 flex-1 place-items-center" :aria-pressed="c.seatHeat.L > 0" aria-label="Siège chauffant" @click="vehicle.cycleSeat('L', 'heat')"><Icon name="seat-heat" size="22" :class="c.seatHeat.L ? 'text-heat' : 'text-ink-2'" /></button>
        <button type="button" class="press h-12 flex-1 border-l border-line text-[14px] font-semibold" :class="c.seatVent.L ? 'text-cool' : 'text-ink-2'" :aria-pressed="c.seatVent.L > 0" @click="vehicle.cycleSeat('L', 'vent')">Froid</button>
      </div>
      <div class="flex overflow-hidden rounded-xl border border-line">
        <button type="button" class="press grid h-12 w-14 place-items-center" :aria-pressed="c.defrostFront" aria-label="Dégivreur avant" @click="vehicle.toggleClimate('defrostFront')"><Icon name="defrost-front" size="22" :class="c.defrostFront ? 'text-warn' : 'text-ink-2'" /></button>
        <button type="button" class="press grid h-12 w-14 place-items-center border-l border-line" :aria-pressed="c.defrostRear" aria-label="Dégivreur arrière" @click="vehicle.toggleClimate('defrostRear')"><Icon name="defrost-rear" size="22" :class="c.defrostRear ? 'text-warn' : 'text-ink-2'" /></button>
      </div>
    </div>
    <div class="mt-4 flex items-center gap-4">
      <input
        type="range"
        :min="TEMP_MIN"
        :max="TEMP_MAX"
        step="0.5"
        :value="c.temp.L"
        aria-label="Température"
        class="t-temp h-8 flex-1 cursor-pointer appearance-none bg-transparent"
        :style="{ '--pos': `${ratio}%` }"
        @input="setTemp"
      />
      <button type="button" class="press text-[14px] font-semibold" :class="!c.sync ? 'text-accent' : 'text-ink-2'" :aria-pressed="!c.sync" @click="vehicle.toggleClimate('sync')">Séparer</button>
    </div>
  </section>
</template>

<style scoped>
.t-temp::-webkit-slider-runnable-track {
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(to right, #3e6ae1, #8a6fd1 50%, #e8472b);
}
.t-temp::-moz-range-track {
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(to right, #3e6ae1, #8a6fd1 50%, #e8472b);
}
.t-temp::-webkit-slider-thumb {
  appearance: none;
  margin-top: -8px;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: var(--ui-ink);
}
.t-temp::-moz-range-thumb {
  width: 19px;
  height: 19px;
  border: 0;
  border-radius: 50%;
  background: var(--ui-ink);
}
</style>
