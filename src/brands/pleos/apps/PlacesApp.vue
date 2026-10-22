<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { CHARGERS, PARKINGS, PLACES } from '@/core/vehicle/data'
import type { Charger, Place } from '@/core/vehicle/types'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore } from '../store/pleos'
import type { MarketAppId } from '../catalog'

/** Chargemap (bornes) et Parking Finder (places libres) : liste de lieux avec lancement du guidage. */
const props = defineProps<{ id: MarketAppId }>()
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const parking = computed(() => props.id === 'm:parking')
const items = computed(() => (parking.value ? PARKINGS : CHARGERS))

function go(c: Charger) {
  const known = c.placeId ? PLACES.find((p) => p.id === c.placeId) : undefined
  const place: Place = known ?? {
    id: c.name,
    name: c.name,
    address: c.detail,
    km: c.km,
    minutes: Math.max(3, Math.round(c.km * 3)),
    kind: parking.value ? 'parking' : 'charger',
  }
  vehicle.navigateTo(place)
  pleos.launch('nav')
  pleos.notify(`Guidage vers ${c.name}`, 'navigation')
}
</script>

<template>
  <ul class="thin-scrollbar h-full overflow-auto p-4">
    <li v-for="c in items" :key="c.name" class="flex items-center gap-3 border-b border-line py-3.5 last:border-0">
      <span class="grid size-12 flex-none place-items-center rounded-xl bg-surface-2 text-accent"><Icon :name="parking ? 'parking' : 'charge-station'" size="26" /></span>
      <span class="min-w-0 flex-1"><b class="block truncate text-[15px]">{{ c.name }}</b><small class="text-ink-2">{{ c.detail }} · {{ c.km }} km</small></span>
      <button type="button" class="press flex h-11 items-center gap-1.5 rounded-xl bg-accent px-4 text-[14px] font-semibold text-white" @click="go(c)"><Icon name="navigation" size="18" />Y aller</button>
    </li>
  </ul>
</template>
