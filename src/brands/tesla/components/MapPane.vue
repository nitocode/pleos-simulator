<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'
import MapCanvas from '@/core/ui/MapCanvas.vue'
import { clock, distance, normalize, type DistanceUnit } from '@/core/format'
import { PLACES, CHARGERS } from '@/core/vehicle/data'
import { etaMinutes, guidance } from '@/core/vehicle/simulation'
import { useVehicleStore } from '@/core/vehicle/store'
import type { Place } from '@/core/vehicle/types'
import { useTeslaStore } from '../store/tesla'

/**
 * Carte et navigation (manuel, « Cartes et navigation ») : recherche de destination, guidage, arrivée estimée avec
 * niveau de batterie à l'arrivée, et accès aux Superchargeurs. L'écran Contrôles et les apps s'affichent par-dessus.
 */
const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const view = ref<'2D' | '3D' | 'Nord'>('2D')
const zoom = ref(1)
const unit = computed(() => tesla.prefs.distanceUnit as DistanceUnit)
const progress = computed(() => (vehicle.nav.destination ? 1 - vehicle.nav.remainingKm / vehicle.nav.totalKm : null))
const step = computed(() => guidance(vehicle.nav))
const eta = computed(() => {
  const m = etaMinutes(vehicle.nav)
  return { m, time: clock(new Date(Date.now() + m * 60000), true) }
})
const arrival = computed(() => Math.max(0, Math.round(vehicle.battery - vehicle.nav.remainingKm / vehicle.spec.kmPerPercent)))
const results = computed(() => {
  const n = normalize(tesla.search)
  const base = PLACES.filter((p) => !n || normalize(`${p.name} ${p.address}`).includes(n))
  return base.slice(0, 5)
})
const ICON: Record<Place['kind'], IconName> = { home: 'home', work: 'building', charger: 'bolt', poi: 'pin', parking: 'parking', address: 'pin' }
const MANEUVER = { 'turn-left': 'turn-left', 'turn-right': 'turn-right', straight: 'straight', arrive: 'arrive' } as const

function go(p: Place) {
  vehicle.navigateTo(p)
  tesla.searching = false
  tesla.search = ''
  zoom.value = 1.35
  if (p.kind === 'charger' && vehicle.charge.preconditioning) tesla.notify('Préchauffage de la batterie avant la recharge', 'thermometer')
}
function goCharger() {
  const c = CHARGERS.find((x) => x.dc) ?? CHARGERS[0]!
  go(PLACES.find((p) => p.id === c.placeId) ?? { id: c.name, name: c.name, address: c.detail, km: c.km, minutes: Math.round(c.km * 2.4 + 4), kind: 'charger' })
}
function cycleView() {
  const order = ['2D', '3D', 'Nord'] as const
  view.value = order[(order.indexOf(view.value) + 1) % order.length]!
}
</script>

<template>
  <div class="absolute inset-0 overflow-hidden rounded-[22px]">
    <MapCanvas :progress="progress" :zoom="zoom" :view="view" />

    <!-- recherche de destination -->
    <div class="absolute top-4 left-4 w-[360px]" :class="tesla.panel === 'controls' && 'pointer-events-none opacity-0'">
      <label class="flex h-12 items-center gap-3 rounded-full bg-surface px-4 shadow-card">
        <Icon name="search" size="20" class="text-ink-2" />
        <input v-model="tesla.search" type="search" placeholder="Naviguer" aria-label="Rechercher une destination" class="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink-3" @focus="tesla.searching = true" />
        <button v-if="tesla.searching" type="button" class="press grid size-8 place-items-center rounded-full text-ink-2" aria-label="Fermer la recherche" @click="tesla.searching = false; tesla.search = ''"><Icon name="close" size="18" /></button>
      </label>
      <Transition name="drop">
        <ul v-if="tesla.searching" class="mt-2 overflow-hidden rounded-2xl bg-surface p-1.5 shadow-pop">
          <li v-for="p in results" :key="p.id"><button type="button" class="press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left" @click="go(p)"><span class="grid size-9 place-items-center rounded-full bg-surface-2 text-ink-2"><Icon :name="ICON[p.kind]" size="18" /></span><span class="min-w-0 flex-1"><b class="block truncate text-[14.5px]">{{ p.name }}</b><small class="text-ink-2">{{ distance(p.km, unit) }} · {{ p.minutes }} min</small></span></button></li>
          <li v-if="!results.length" class="px-3 py-3 text-ink-2">Aucune destination trouvée.</li>
        </ul>
      </Transition>
      <button v-if="!tesla.searching && !vehicle.nav.destination" type="button" class="press mt-2 flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-[14px] font-semibold shadow-card" @click="goCharger"><Icon name="bolt" size="17" class="text-ok" />Superchargeur proche</button>
    </div>

    <!-- carte : boutons de vue -->
    <div class="absolute top-4 right-4 flex flex-col gap-2" :class="tesla.panel === 'controls' && 'opacity-0'">
      <button type="button" class="press grid size-12 place-items-center rounded-2xl bg-surface text-[13px] font-bold shadow-card" aria-label="Orientation de la carte" @click="cycleView">{{ view === 'Nord' ? 'N' : view }}</button>
      <button type="button" class="press grid size-12 place-items-center rounded-2xl bg-surface shadow-card" aria-label="Agrandir" @click="zoom = Math.min(2.2, zoom + 0.25)"><Icon name="plus" size="22" /></button>
      <button type="button" class="press grid size-12 place-items-center rounded-2xl bg-surface shadow-card" aria-label="Réduire" @click="zoom = Math.max(0.6, zoom - 0.25)"><Icon name="minus" size="22" /></button>
    </div>

    <!-- guidage -->
    <Transition name="sheet">
      <div v-if="vehicle.nav.destination && step" class="absolute bottom-4 left-4 flex w-[420px] items-center gap-4 rounded-[22px] bg-surface p-4 shadow-pop" :class="tesla.panel === 'controls' && 'opacity-0'">
        <span class="grid size-14 flex-none place-items-center rounded-2xl bg-accent text-on-accent"><Icon :name="MANEUVER[step.maneuver]" size="30" /></span>
        <div class="min-w-0 flex-1">
          <b class="block truncate text-[17px]">{{ step.street }}</b>
          <p class="tnum text-ink-2">dans {{ distance(step.distanceKm, unit) }}</p>
          <p class="tnum mt-1 text-[13px] text-ink-2">{{ distance(vehicle.nav.remainingKm, unit) }} · {{ eta.m }} min · arrivée {{ eta.time }} · <span :class="arrival < 10 && 'text-crit'">{{ arrival }} % à l’arrivée</span></p>
        </div>
        <button type="button" class="press grid size-11 flex-none place-items-center rounded-full bg-surface-2" aria-label="Annuler l’itinéraire" @click="vehicle.cancelRoute()"><Icon name="close" size="20" /></button>
      </div>
    </Transition>
  </div>
</template>
