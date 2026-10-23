<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { mmss } from '@/core/format'
import { CONTACTS, RECENT_CALLS } from '@/core/vehicle/data'
import { useNow } from '@/core/composables/useNow'
import { useVehicleStore } from '@/core/vehicle/store'

/** Téléphone : appels récents et contacts, écran d'appel en cours. */
const vehicle = useVehicleStore()
const now = useNow(1000)
const elapsed = computed(() => (vehicle.call?.status === 'active' ? (now.value.getTime() - vehicle.call.startedAt) / 1000 : 0))
const ICON = { in: 'phone-in', out: 'phone-out', missed: 'phone-missed' } as const
</script>

<template>
  <div class="h-full p-6">
    <div v-if="vehicle.call" class="flex h-full flex-col items-center justify-center gap-3 text-center">
      <span class="grid size-24 place-items-center rounded-full bg-surface-3 text-[38px] font-bold">{{ vehicle.call.name[0] }}</span>
      <h3 class="text-[24px] font-bold">{{ vehicle.call.name }}</h3>
      <p class="tnum text-ink-2">{{ vehicle.call.status === 'incoming' ? 'Appel entrant' : vehicle.call.status === 'dialing' ? 'Appel en cours…' : mmss(elapsed) }}</p>
      <div class="mt-4 flex gap-6">
        <button v-if="vehicle.call.status === 'incoming'" type="button" class="press grid size-16 place-items-center rounded-full bg-ok text-white" aria-label="Répondre" @click="vehicle.answer()"><Icon name="phone" size="28" /></button>
        <button type="button" class="press grid size-16 place-items-center rounded-full bg-crit text-white" aria-label="Raccrocher" @click="vehicle.hangUp()"><Icon name="phone-off" size="28" /></button>
      </div>
    </div>
    <div v-else class="grid h-full grid-cols-2 gap-6">
      <section class="min-h-0"><h3 class="mb-2 text-[13px] font-bold tracking-wider text-ink-2 uppercase">Récents</h3>
        <ul><li v-for="c in RECENT_CALLS" :key="c.name + c.when"><button type="button" class="press flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left" @click="vehicle.dial(c.name)"><Icon :name="ICON[c.direction]" size="20" :class="c.direction === 'missed' ? 'text-crit' : 'text-ink-2'" /><span class="flex-1"><b class="block">{{ c.name }}</b><small class="text-ink-2">{{ c.when }}</small></span></button></li></ul>
      </section>
      <section class="thin-scrollbar min-h-0 overflow-auto"><h3 class="mb-2 text-[13px] font-bold tracking-wider text-ink-2 uppercase">Contacts</h3>
        <ul><li v-for="n in CONTACTS" :key="n"><button type="button" class="press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left" @click="vehicle.dial(n)"><span class="grid size-9 place-items-center rounded-full bg-surface-3 font-bold">{{ n[0] }}</span><b class="flex-1">{{ n }}</b><Icon name="phone" size="18" class="text-ok" /></button></li></ul>
      </section>
    </div>
  </div>
</template>
