<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'
import MapCanvas from '@/core/ui/MapCanvas.vue'
import { clock, distance, normalize } from '@/core/format'
import { CHARGERS, PLACES } from '@/core/vehicle/data'
import { etaMinutes, guidance } from '@/core/vehicle/simulation'
import { useVehicleStore } from '@/core/vehicle/store'
import type { Place } from '@/core/vehicle/types'

/**
 * Carte et navigation partagées (ID.3, Enyaq) : recherche, destinations, bornes, guidage avec batterie à l'arrivée.
 * Le planificateur d'itinéraire électrique déclenche le préchauffage de la batterie en route vers une borne rapide
 * (communiqués Volkswagen et Škoda) : l'événement `preheat` le signale à l'interface.
 */
const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const emit = defineEmits<{ preheat: [] }>()
const vehicle = useVehicleStore()
const query = ref('')
const list = ref<null | 'search' | 'chargers'>(null)
const zoom = ref(1)
const progress = computed(() => (vehicle.nav.destination ? 1 - vehicle.nav.remainingKm / vehicle.nav.totalKm : null))
const step = computed(() => guidance(vehicle.nav))
const eta = computed(() => {
  const m = etaMinutes(vehicle.nav)
  return { m, time: clock(new Date(Date.now() + m * 60000), true) }
})
const arrival = computed(() => Math.max(0, Math.round(vehicle.battery - vehicle.nav.remainingKm / vehicle.spec.kmPerPercent)))
const items = computed<Place[]>(() => {
  if (list.value === 'chargers')
    return CHARGERS.map((c, i) => PLACES.find((p) => p.id === c.placeId) ?? { id: `c${i}`, name: c.name, address: c.detail, km: c.km, minutes: Math.round(c.km * 2.4 + 4), kind: 'charger' as const })
  const n = normalize(query.value)
  return PLACES.filter((p) => !n || normalize(`${p.name} ${p.address}`).includes(n)).slice(0, 5)
})
const ICON: Record<Place['kind'], IconName> = { home: 'home', work: 'building', charger: 'bolt', poi: 'pin', parking: 'parking', address: 'pin' }
const MANEUVER = { 'turn-left': 'turn-left', 'turn-right': 'turn-right', straight: 'straight', arrive: 'arrive' } as const

function go(p: Place) {
  vehicle.navigateTo(p)
  list.value = null
  query.value = ''
  zoom.value = 1.35
  if (p.kind === 'charger' && vehicle.charge.preconditioning) emit('preheat')
}
</script>

<template>
  <div class="absolute inset-0 overflow-hidden">
    <MapCanvas :progress="progress" :zoom="zoom" view="2D" />

    <div v-if="!props.compact" class="absolute top-3 left-3 w-[340px]">
      <div v-if="vehicle.nav.destination && step && !list" class="overflow-hidden rounded-2xl bg-surface shadow-pop">
        <div class="flex items-center gap-3 bg-accent p-3.5 text-on-accent">
          <Icon :name="MANEUVER[step.maneuver]" size="34" />
          <div class="min-w-0"><b class="tnum block text-[20px] leading-tight">{{ distance(step.distanceKm) }}</b><span class="block truncate text-[14px] opacity-90">{{ step.street }}</span></div>
        </div>
        <div class="flex items-center gap-3 px-3.5 py-2.5 text-[13px]">
          <span class="tnum flex-1"><b class="text-[15px]">{{ eta.time }}</b> · {{ eta.m }} min · {{ distance(vehicle.nav.remainingKm) }}</span>
          <span class="tnum flex items-center gap-1 font-semibold" :class="arrival < 10 ? 'text-crit' : 'text-ink-2'"><Icon name="battery" size="15" />{{ arrival }} %</span>
          <button type="button" class="press grid size-8 place-items-center rounded-full bg-surface-2" aria-label="Arrêter le guidage" @click="vehicle.cancelRoute()"><Icon name="close" size="16" /></button>
        </div>
      </div>
      <template v-else>
        <label class="flex h-12 items-center gap-3 rounded-2xl bg-surface px-4 shadow-card">
          <Icon name="search" size="19" class="text-ink-2" />
          <input v-model="query" type="search" placeholder="Rechercher une destination" aria-label="Rechercher une destination" class="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3" @focus="list = 'search'" />
          <button v-if="list" type="button" class="press grid size-8 place-items-center rounded-full text-ink-2" aria-label="Fermer" @click="list = null; query = ''"><Icon name="close" size="16" /></button>
        </label>
        <ul v-if="list" class="mt-2 overflow-hidden rounded-2xl bg-surface p-1.5 shadow-pop">
          <li v-for="p in items" :key="p.id"><button type="button" class="press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left" @click="go(p)"><span class="grid size-9 place-items-center rounded-full bg-surface-2" :class="p.kind === 'charger' ? 'text-accent' : 'text-ink-2'"><Icon :name="ICON[p.kind]" size="17" /></span><span class="min-w-0 flex-1"><b class="block truncate text-[14.5px]">{{ p.name }}</b><small class="text-ink-2">{{ distance(p.km) }} · {{ p.minutes }} min</small></span></button></li>
        </ul>
      </template>
    </div>
    <div v-if="!props.compact" class="absolute top-3 right-3 flex flex-col gap-2">
      <button type="button" class="press grid size-12 place-items-center rounded-2xl bg-surface shadow-card" :class="list === 'chargers' && 'text-accent'" aria-label="Bornes de recharge" @click="list = list === 'chargers' ? null : 'chargers'"><Icon name="charge-station" size="22" /></button>
      <button type="button" class="press grid size-12 place-items-center rounded-2xl bg-surface shadow-card" aria-label="Agrandir" @click="zoom = Math.min(2.2, zoom + 0.25)"><Icon name="plus" size="22" /></button>
      <button type="button" class="press grid size-12 place-items-center rounded-2xl bg-surface shadow-card" aria-label="Réduire" @click="zoom = Math.max(0.6, zoom - 0.25)"><Icon name="minus" size="22" /></button>
    </div>
  </div>
</template>
