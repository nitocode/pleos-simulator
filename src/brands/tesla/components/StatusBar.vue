<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useNow } from '@/core/composables/useNow'
import { clock } from '@/core/format'
import { useVehicleStore } from '@/core/vehicle/store'
import { useTeslaStore } from '../store/tesla'

/**
 * Barre d'état supérieure, au-dessus de la carte (capture du manuel) : verrouillage, heure, température, Sentinelle
 * et Profil à l'arrêt ; à droite Wi-Fi, réseau et état de l'airbag passager avant.
 */
const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const now = useNow()
const parked = computed(() => vehicle.gear === 'P' && !vehicle.moving)
const temp = computed(() => (tesla.prefs.tempUnit === '°F' ? `${Math.round((vehicle.outsideTemp * 9) / 5 + 32)}°F` : `${vehicle.outsideTemp}°C`))

function toggleLock() {
  vehicle.toggleBody('locked')
  tesla.notify(vehicle.body.locked ? 'Véhicule verrouillé' : 'Véhicule déverrouillé', vehicle.body.locked ? 'lock' : 'unlock')
}
</script>

<template>
  <header class="flex h-full items-center gap-5 bg-surface/85 px-4 text-[14px] font-semibold backdrop-blur-md">
    <button type="button" class="press grid size-8 place-items-center rounded-full" :aria-label="vehicle.body.locked ? 'Déverrouiller' : 'Verrouiller'" @click="toggleLock">
      <Icon :name="vehicle.body.locked ? 'lock' : 'unlock'" size="18" />
    </button>
    <span class="tnum">{{ clock(now, true) }}</span>
    <button type="button" class="press" aria-label="Météo" @click="tesla.launch('weather')">{{ temp }}</button>
    <button v-if="parked" type="button" class="press flex items-center gap-1.5 text-ink-2" aria-label="Profils conducteurs" @click="tesla.notify('Profil conducteur : Conducteur 1', 'user')"><Icon name="user" size="17" />Profil</button>
    <button v-if="parked" type="button" class="press grid size-8 place-items-center rounded-full" :class="tesla.prefs.sentinel ? 'text-crit' : 'text-ink-3'" aria-label="Mode Sentinelle" :aria-pressed="tesla.prefs.sentinel" @click="tesla.prefs.sentinel = !tesla.prefs.sentinel; tesla.notify(tesla.prefs.sentinel ? 'Mode Sentinelle activé' : 'Mode Sentinelle désactivé', 'eye')">
      <Icon name="eye" size="18" />
    </button>
    <span class="ml-auto flex items-center gap-4 text-ink-2">
      <Icon name="wifi" size="17" />
      <span class="flex items-center gap-1 text-[11px]"><Icon name="signal" size="17" />LTE</span>
      <Icon name="bluetooth" size="17" />
      <span class="flex items-center gap-1.5 rounded-md border border-line px-1.5 py-0.5 text-[9.5px] leading-[1.05] font-bold text-ink-2" title="État de l’airbag passager avant">
        <Icon name="user" size="13" /><span>AIRBAG<br />PASSAGER <span class="text-warn">ON</span></span>
      </span>
    </span>
  </header>
</template>
