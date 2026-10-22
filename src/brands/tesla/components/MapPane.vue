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
import StatusBar from './StatusBar.vue'

/**
 * Carte (captures du manuel) : barre d'état en haut, champ « Naviguer » dessous, colonne de boutons à droite
 * (orientation Nord/Direction/Aperçu, satellite, trafic, lieux, recharge), guidage avec batterie à l'arrivée.
 */
const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const view = ref<'2D' | '3D' | 'Nord'>('2D')
const zoom = ref(1)
const list = ref<null | 'search' | 'places' | 'chargers'>(null)
const unit = computed(() => tesla.prefs.distanceUnit as DistanceUnit)
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
  if (list.value === 'places') return PLACES.filter((p) => p.kind === 'home' || p.kind === 'work' || p.kind === 'poi').slice(0, 5)
  const n = normalize(tesla.search)
  return PLACES.filter((p) => !n || normalize(`${p.name} ${p.address}`).includes(n)).slice(0, 5)
})
const ICON: Record<Place['kind'], IconName> = { home: 'home', work: 'building', charger: 'bolt', poi: 'pin', parking: 'parking', address: 'pin' }
const MANEUVER = { 'turn-left': 'turn-left', 'turn-right': 'turn-right', straight: 'straight', arrive: 'arrive' } as const
const VIEW_LABEL = { '2D': 'Direction en haut', '3D': 'Aperçu', Nord: 'Nord en haut' } as const
const hidden = computed(() => tesla.panel === 'controls' || tesla.panel === 'climate')

function go(p: Place) {
  vehicle.navigateTo(p)
  list.value = null
  tesla.search = ''
  zoom.value = 1.35
  if (p.kind === 'charger' && vehicle.charge.preconditioning) tesla.notify('Préchauffage de la batterie pour la recharge', 'thermometer')
}
function cycleView() {
  const order = ['2D', 'Nord', '3D'] as const
  view.value = order[(order.indexOf(view.value) + 1) % order.length]!
  tesla.notify(VIEW_LABEL[view.value], 'map')
}
function toggle(key: 'satellite' | 'traffic', label: string) {
  tesla.prefs[key] = !tesla.prefs[key]
  tesla.notify(`${label} ${tesla.prefs[key] ? 'affiché' : 'masqué'}`, key === 'satellite' ? 'globe' : 'traffic')
}
</script>

<template>
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute inset-0 transition-[filter] duration-500" :style="{ filter: tesla.prefs.satellite ? 'saturate(1.6) hue-rotate(-18deg) brightness(0.82)' : 'none' }">
      <MapCanvas :progress="progress" :zoom="zoom" :view="view" />
    </div>
    <div class="absolute inset-x-0 top-0 z-10 h-11"><StatusBar /></div>

    <!-- Naviguer -->
    <div class="absolute top-[60px] left-4 z-20 w-[330px]" :class="(hidden || (vehicle.nav.destination && !list)) && 'pointer-events-none opacity-0'">
      <label class="flex h-11 items-center gap-3 rounded-lg bg-surface px-3.5 shadow-card">
        <Icon name="search" size="18" class="text-ink-2" />
        <input v-model="tesla.search" type="search" placeholder="Naviguer" aria-label="Rechercher une destination" class="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3" @focus="list = 'search'" />
        <button v-if="list" type="button" class="press grid size-7 place-items-center rounded-full text-ink-2" aria-label="Fermer la liste" @click="list = null; tesla.search = ''"><Icon name="close" size="16" /></button>
      </label>
      <Transition name="drop">
        <ul v-if="list" class="mt-2 overflow-hidden rounded-xl bg-surface p-1.5 shadow-pop">
          <li class="px-3 pt-1.5 pb-1 text-[11px] font-bold tracking-wider text-ink-3 uppercase">{{ list === 'chargers' ? 'Lieux de recharge' : list === 'places' ? 'Favoris et récents' : 'Destinations' }}</li>
          <li v-for="p in items" :key="p.id"><button type="button" class="press flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left" @click="go(p)"><span class="grid size-8 place-items-center rounded-full bg-surface-2" :class="p.kind === 'charger' ? 'text-crit' : 'text-ink-2'"><Icon :name="ICON[p.kind]" size="16" /></span><span class="min-w-0 flex-1"><b class="block truncate text-[14px]">{{ p.name }}</b><small class="text-ink-2">{{ distance(p.km, unit) }} · {{ p.minutes }} min</small></span></button></li>
          <li v-if="!items.length" class="px-3 py-3 text-ink-2">Aucune destination trouvée.</li>
        </ul>
      </Transition>
    </div>

    <!-- boutons de carte -->
    <div class="absolute top-[60px] right-3 z-10 flex flex-col gap-2" :class="hidden && 'opacity-0'">
      <button type="button" class="press flex size-11 flex-col items-center justify-center rounded-lg bg-surface text-[9px] leading-none font-bold shadow-card" :aria-label="`Orientation : ${VIEW_LABEL[view]}`" @click="cycleView">
        <span v-if="view === 'Nord'" class="text-crit">N</span><span v-else>SE&nbsp;S</span><Icon name="nav-arrow" size="15" class="mt-0.5" />
      </button>
      <div class="flex flex-col overflow-hidden rounded-lg bg-surface shadow-card">
        <button type="button" class="press grid size-11 place-items-center" :class="tesla.prefs.satellite ? 'text-accent' : 'text-ink-2'" aria-label="Vue satellite" :aria-pressed="tesla.prefs.satellite" @click="toggle('satellite', 'Satellite')"><Icon name="globe" size="20" /></button>
        <button type="button" class="press grid size-11 place-items-center border-t border-line" :class="tesla.prefs.traffic ? 'text-accent' : 'text-ink-2'" aria-label="Trafic" :aria-pressed="tesla.prefs.traffic" @click="toggle('traffic', 'Trafic')"><Icon name="traffic" size="20" /></button>
        <button type="button" class="press grid size-11 place-items-center border-t border-line" :class="list === 'places' ? 'text-accent' : 'text-ink-2'" aria-label="Lieux" @click="list = list === 'places' ? null : 'places'"><Icon name="pin" size="20" /></button>
        <button type="button" class="press grid size-11 place-items-center border-t border-line" :class="list === 'chargers' ? 'text-accent' : 'text-ink-2'" aria-label="Lieux de recharge" @click="list = list === 'chargers' ? null : 'chargers'"><Icon name="bolt" size="20" /></button>
      </div>
    </div>

    <!-- guidage -->
    <Transition name="sheet">
      <div v-if="vehicle.nav.destination && step" class="absolute top-[60px] left-4 z-10 flex w-[360px] flex-col overflow-hidden rounded-xl bg-surface shadow-pop" :class="(hidden || list) && 'opacity-0'">
        <div class="flex items-center gap-3 bg-[#1f2530] p-3.5 text-white">
          <Icon :name="MANEUVER[step.maneuver]" size="34" />
          <div class="min-w-0"><b class="tnum block text-[20px] leading-tight">{{ distance(step.distanceKm, unit) }}</b><span class="block truncate text-[14px] opacity-80">{{ step.street }}</span></div>
        </div>
        <div class="flex items-center gap-3 px-3.5 py-2.5 text-[13px]">
          <span class="tnum flex-1"><b class="text-[15px]">{{ eta.time }}</b> · {{ eta.m }} min · {{ distance(vehicle.nav.remainingKm, unit) }}</span>
          <span class="tnum flex items-center gap-1 font-semibold" :class="arrival < 10 ? 'text-crit' : 'text-ink-2'"><Icon name="battery" size="15" />{{ arrival }} %</span>
          <button type="button" class="press grid size-8 place-items-center rounded-full bg-surface-2" aria-label="Annuler l’itinéraire" @click="vehicle.cancelRoute()"><Icon name="close" size="16" /></button>
        </div>
      </div>
    </Transition>
  </div>
</template>
