<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useNow } from '@/core/composables/useNow'
import { clock } from '@/core/format'
import { useVehicleStore } from '@/core/vehicle/store'
import { useTeslaStore } from '../store/tesla'

/**
 * Barre d'état supérieure (manuel, « Icônes de la barre d'état supérieure ») : verrouillage, météo/température,
 * heure, mode Sentinelle (à l'arrêt), profil (à l'arrêt), puis Wi-Fi, réseau, Bluetooth et notifications.
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
  <header class="flex h-full items-center gap-4 px-5 text-[15px] font-semibold">
    <button type="button" class="press grid size-9 place-items-center rounded-full" :aria-label="vehicle.body.locked ? 'Déverrouiller' : 'Verrouiller'" @click="toggleLock">
      <Icon :name="vehicle.body.locked ? 'lock' : 'unlock'" size="20" :class="vehicle.body.locked ? 'text-ink' : 'text-warn'" />
    </button>
    <span class="flex items-center gap-1.5 text-ink-2"><Icon name="sun" size="18" />{{ temp }}</span>
    <span class="tnum text-ink">{{ clock(now, true) }}</span>
    <button v-if="parked" type="button" class="press grid size-9 place-items-center rounded-full" :class="tesla.prefs.sentinel ? 'text-crit' : 'text-ink-3'" aria-label="Mode Sentinelle" :aria-pressed="tesla.prefs.sentinel" @click="tesla.prefs.sentinel = !tesla.prefs.sentinel; tesla.notify(tesla.prefs.sentinel ? 'Mode Sentinelle activé' : 'Mode Sentinelle désactivé', 'eye')">
      <Icon name="eye" size="20" />
    </button>
    <span class="ml-auto flex items-center gap-4 text-ink-2">
      <Icon name="wifi" size="19" />
      <span class="flex items-center gap-1 text-[12px]"><Icon name="signal" size="19" />LTE</span>
      <Icon name="bluetooth" size="19" class="text-accent" />
      <button type="button" class="press grid size-9 place-items-center rounded-full" aria-label="Alertes du véhicule" @click="tesla.notify('Aucune alerte du véhicule', 'check')"><Icon name="bell" size="20" /></button>
      <button v-if="parked" type="button" class="press flex items-center gap-1.5 rounded-full bg-surface-2 py-1 pr-3 pl-1 text-[13px] text-ink" aria-label="Profil conducteur" @click="tesla.notify('Profil conducteur : Conducteur 1', 'user')"><span class="grid size-7 place-items-center rounded-full bg-accent text-on-accent"><Icon name="user" size="15" /></span>Conducteur 1</button>
    </span>
  </header>
</template>
