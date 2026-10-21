<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { clock, distance, normalize, type DistanceUnit } from '@/core/format'
import { CHARGERS, PARKINGS, PLACES, STREETS } from '@/core/vehicle/data'
import { etaMinutes, guidance } from '@/core/vehicle/simulation'
import { useVehicleStore } from '@/core/vehicle/store'
import type { Place } from '@/core/vehicle/types'
import { usePleosStore } from '../../store/pleos'
import MapCanvas from './MapCanvas.vue'

/** App Navigation : carte de base (non fermable), recherche, guidage pas à pas et carte d'arrivée. */
const vehicle = useVehicleStore()
const pleos = usePleosStore()

const view = ref<'2D' | '3D' | 'Nord'>('2D')
const zoom = ref(1)
const query = ref('')
const sheet = ref<null | 'search' | 'favorites' | 'chargers' | 'parkings'>(null)

const unit = computed(() => pleos.prefs.distanceUnit as DistanceUnit)
const progress = computed(() => (vehicle.nav.destination ? 1 - vehicle.nav.remainingKm / vehicle.nav.totalKm : null))
const step = computed(() => guidance(vehicle.nav))
const next = computed(() => guidance(vehicle.nav, 1))
const eta = computed(() => {
  const m = etaMinutes(vehicle.nav)
  return { minutes: m, time: clock(new Date(Date.now() + m * 60000), pleos.prefs.clock === '24 heures') }
})
const arrival = computed(() => Math.round(vehicle.battery - vehicle.nav.remainingKm / 4.96))
const results = computed(() => {
  const n = normalize(query.value)
  return PLACES.filter((p) => !n || normalize(`${p.name} ${p.address}`).includes(n))
})
const ICON = { home: 'home', work: 'building', charger: 'bolt', poi: 'pin', parking: 'parking', address: 'pin' } as const

function go(p: Place) {
  vehicle.navigateTo(p)
  sheet.value = null
  query.value = ''
  zoom.value = 1.35
}
function goFree() {
  const q = query.value.trim()
  if (!q) return
  const found = results.value[0]
  go(found ?? { id: 'custom', name: q, address: 'Adresse', km: 12.5, minutes: 24, kind: 'address' })
}
function goCharger(i: number) {
  const c = CHARGERS[i]!
  go(PLACES.find((p) => p.id === c.placeId) ?? { id: `c${i}`, name: c.name, address: c.detail, km: c.km, minutes: Math.round(c.km * 2.4 + 4), kind: 'charger' })
  if (c.dc && vehicle.charge.preconditioning) pleos.notify('Conditionnement de la batterie activé pour la recharge rapide', 'thermometer')
}
function cycleView() {
  const order = ['2D', '3D', 'Nord'] as const
  view.value = order[(order.indexOf(view.value) + 1) % order.length]!
}
const LANES = ['turn-left', 'straight', 'straight', 'turn-right'] as const
</script>

<template>
  <div class="absolute inset-0 overflow-hidden">
    <MapCanvas :progress="progress" :zoom="zoom" :view="view" />

    <!-- contrôles de carte -->
    <div class="absolute top-3 right-3 flex flex-col gap-2">
      <button type="button" class="press flex size-12 flex-col items-center justify-center rounded-2xl bg-surface text-[13px] leading-none font-bold shadow-card" title="Mode d’affichage de la carte" @click="cycleView">
        {{ view === 'Nord' ? 'N' : view }}<Icon name="nav-arrow" size="13" class="mt-0.5" :class="view === 'Nord' && 'text-crit'" />
      </button>
      <button type="button" class="press grid size-12 place-items-center rounded-2xl bg-surface shadow-card" title="Calques" @click="pleos.notify('Calques : trafic en temps réel affiché', 'map')"><Icon name="map" size="22" /></button>
    </div>
    <div class="absolute right-3 flex flex-col gap-2 transition-[bottom] duration-300 ease-ui" :class="vehicle.nav.destination ? 'bottom-[118px]' : 'bottom-3'">
      <button type="button" class="press grid size-12 place-items-center rounded-2xl bg-surface shadow-card" aria-label="Zoom avant" @click="zoom = Math.min(2.4, zoom + 0.25)"><Icon name="plus" size="22" /></button>
      <button type="button" class="press grid size-12 place-items-center rounded-2xl bg-surface shadow-card" aria-label="Zoom arrière" @click="zoom = Math.max(0.7, zoom - 0.25)"><Icon name="minus" size="22" /></button>
      <button type="button" class="press grid size-12 place-items-center rounded-2xl bg-surface shadow-card" aria-label="Paramètres de navigation" @click="pleos.openSettings('navigation')"><Icon name="settings" size="22" /></button>
    </div>

    <Transition name="fade" mode="out-in">
      <!-- guidage -->
      <div v-if="vehicle.nav.destination && step" key="guide">
        <div class="absolute top-3 left-3 w-[min(330px,calc(100%-90px))] overflow-hidden rounded-[20px] bg-surface shadow-pop">
          <div class="flex items-center gap-4 px-4 pt-4 pb-3">
            <Icon :name="step.maneuver" size="46" :stroke="2.6" />
            <div class="min-w-0">
              <div class="tnum text-[32px] leading-none font-bold">{{ step.distanceKm < 1 ? `${Math.max(10, Math.round(step.distanceKm * 100) * 10)}m` : distance(step.distanceKm, unit) }}</div>
              <div class="mt-1 truncate text-[14px] text-ink-2">{{ step.street }}</div>
            </div>
          </div>
          <div class="flex justify-center gap-3 px-4 pb-2 text-ink-3">
            <Icon v-for="(l, i) in LANES" :key="i" :name="l" size="22" :class="(step.maneuver === 'turn-right' && l === 'turn-right') || (step.maneuver === 'turn-left' && l === 'turn-left') || (step.maneuver === 'straight' && l === 'straight') ? 'text-ink' : ''" />
          </div>
          <div v-if="next" class="tnum flex items-center gap-2 border-t border-line px-4 py-2 text-[17px] font-bold">
            <Icon :name="next.maneuver" size="22" :stroke="2.4" />{{ distance(next.distanceKm, unit) }}
          </div>
        </div>
        <div class="absolute bottom-3 left-3 w-[min(330px,calc(100%-90px))] rounded-[20px] bg-surface p-4 shadow-pop">
          <div class="flex items-baseline justify-between">
            <span class="tnum text-[22px] font-bold">{{ eta.time }}</span>
            <span class="tnum text-[14px] text-ink-2">{{ eta.minutes }} min · {{ distance(vehicle.nav.remainingKm, unit) }}</span>
          </div>
          <div class="mt-1 flex items-center gap-2 text-[14px]">
            <span class="size-2.5 rounded-full bg-accent" /><span class="truncate">{{ vehicle.nav.destination.name }}</span>
            <span class="ml-auto flex items-center gap-1 text-[13px] font-semibold" :class="arrival < 10 ? 'text-crit' : 'text-ink-2'"><Icon name="battery" size="16" />{{ Math.max(0, arrival) }} %</span>
          </div>
          <div v-if="arrival < 10" class="mt-2 flex items-center gap-2 text-[13px] font-semibold text-warn"><Icon name="bolt" size="16" />Arrêt recharge ajouté · Ionity Mâcon</div>
          <div class="mt-3 grid grid-cols-3 gap-2">
            <button type="button" class="press grid h-11 place-items-center rounded-xl bg-surface-2" aria-label="Annuler l’itinéraire" @click="vehicle.cancelRoute(); pleos.notify('Itinéraire annulé', 'close')"><Icon name="close" size="22" /></button>
            <button type="button" class="press grid h-11 place-items-center rounded-xl bg-surface-2" aria-label="Recalculer" @click="pleos.notify('Itinéraire recalculé', 'refresh')"><Icon name="refresh" size="22" /></button>
            <button type="button" class="press grid h-11 place-items-center rounded-xl bg-surface-2" aria-label="Rechercher le long du trajet" @click="sheet = 'chargers'; vehicle.cancelRoute()"><Icon name="search" size="22" /></button>
          </div>
        </div>
      </div>

      <!-- recherche -->
      <div v-else key="search">
        <div class="absolute bottom-3 left-3 w-[min(340px,calc(100%-90px))] overflow-hidden rounded-[20px] bg-surface shadow-pop">
          <Transition name="sheet">
            <div v-if="sheet" class="thin-scrollbar max-h-[300px] overflow-auto border-b border-line p-1.5">
              <template v-if="sheet === 'chargers'">
                <button v-for="(c, i) in CHARGERS" :key="c.name" type="button" class="press flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-surface-2" @click="goCharger(i)">
                  <span class="grid size-10 place-items-center rounded-xl bg-surface-2"><Icon name="charge-station" size="20" /></span>
                  <span class="min-w-0 flex-1"><b class="block truncate text-[15px]">{{ c.name }}</b><small class="block truncate text-[13px] text-ink-2">{{ c.detail }}</small></span>
                  <span class="tnum text-[13px] text-ink-2">{{ distance(c.km, unit) }}</span>
                </button>
              </template>
              <template v-else-if="sheet === 'parkings'">
                <button v-for="c in PARKINGS" :key="c.name" type="button" class="press flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-surface-2" @click="go({ id: c.name, name: c.name, address: c.detail, km: c.km, minutes: 6, kind: 'parking' })">
                  <span class="grid size-10 place-items-center rounded-xl bg-surface-2"><Icon name="parking" size="20" /></span>
                  <span class="min-w-0 flex-1"><b class="block truncate text-[15px]">{{ c.name }}</b><small class="block truncate text-[13px] text-ink-2">{{ c.detail }}</small></span>
                  <span class="tnum text-[13px] text-ink-2">{{ distance(c.km, unit) }}</span>
                </button>
              </template>
              <template v-else>
                <p v-if="sheet === 'favorites'" class="px-2.5 pt-1.5 pb-1 text-[12px] font-bold tracking-wider text-ink-2 uppercase">Favoris et récents</p>
                <button v-for="p in results" :key="p.id" type="button" class="press flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-surface-2" @click="go(p)">
                  <span class="grid size-10 place-items-center rounded-xl bg-surface-2"><Icon :name="ICON[p.kind]" size="20" /></span>
                  <span class="min-w-0 flex-1"><b class="block truncate text-[15px]">{{ p.name }}</b><small class="block truncate text-[13px] text-ink-2">{{ p.address }}</small></span>
                  <span class="tnum text-[13px] text-ink-2">{{ distance(p.km, unit) }}</span>
                </button>
                <button v-if="query && !results.length" type="button" class="press flex w-full items-center gap-3 rounded-xl p-2.5 text-left" @click="goFree">
                  <span class="grid size-10 place-items-center rounded-xl bg-surface-2"><Icon name="pin" size="20" /></span><b class="text-[15px]">{{ query }}</b>
                </button>
              </template>
            </div>
          </Transition>
          <label class="flex h-[52px] items-center gap-2.5 px-4 text-ink-2">
            <Icon name="search" size="20" />
            <input id="nav-query" v-model="query" class="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-3" placeholder="Où allez-vous ?" autocomplete="off" @focus="sheet = sheet ?? 'search'" @keydown.enter="goFree" />
            <button v-if="sheet" type="button" class="press grid size-8 place-items-center rounded-full" aria-label="Fermer la recherche" @click="sheet = null; query = ''"><Icon name="close" size="18" /></button>
          </label>
          <div class="flex gap-1 px-2.5 pb-2.5">
            <button type="button" class="press grid h-11 flex-1 place-items-center rounded-xl hover:bg-surface-2" aria-label="Domicile" @click="go(PLACES[0]!)"><Icon name="home" size="22" /></button>
            <button type="button" class="press grid h-11 flex-1 place-items-center rounded-xl hover:bg-surface-2" aria-label="Travail" @click="go(PLACES[1]!)"><Icon name="building" size="22" /></button>
            <button type="button" class="press grid h-11 flex-1 place-items-center rounded-xl" :class="sheet === 'favorites' ? 'bg-accent-soft text-accent' : 'hover:bg-surface-2'" aria-label="Favoris" @click="sheet = sheet === 'favorites' ? null : 'favorites'"><Icon name="star" size="22" /></button>
            <button type="button" class="press grid h-11 flex-1 place-items-center rounded-xl" :class="sheet === 'chargers' ? 'bg-accent-soft text-accent' : 'hover:bg-surface-2'" aria-label="Stations de charge" @click="sheet = sheet === 'chargers' ? null : 'chargers'"><Icon name="bolt" size="22" /></button>
            <button type="button" class="press grid h-11 flex-1 place-items-center rounded-xl" :class="sheet === 'parkings' ? 'bg-accent-soft text-accent' : 'hover:bg-surface-2'" aria-label="Parkings" @click="sheet = sheet === 'parkings' ? null : 'parkings'"><Icon name="parking" size="22" /></button>
          </div>
        </div>
        <div class="pointer-events-none absolute bottom-6 left-[min(370px,48%)] hidden items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[13px] font-semibold shadow-card @min-[640px]:flex">
          <Icon name="pin" size="15" />À proximité {{ STREETS[0] }}
        </div>
      </div>
    </Transition>
  </div>
</template>
