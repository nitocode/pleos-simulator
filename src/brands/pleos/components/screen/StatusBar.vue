<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { clock } from '@/core/format'
import { useNow } from '@/core/composables/useNow'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore, type Panel } from '../../store/pleos'

/** Barre d'état : zones SP0 (verrouillage, recherche, notifications, appel) puis SP1 (mise à jour, son, réseau, profil, heure). */
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const now = useNow()
const time = computed(() => clock(now.value, pleos.prefs.clock === '24 heures'))

function lock() {
  vehicle.toggleBody('locked')
  pleos.notify(vehicle.body.locked ? 'Portes verrouillées' : 'Portes déverrouillées', vehicle.body.locked ? 'lock' : 'unlock')
}
const btn = (p: Panel) => [
  'press grid size-10 place-items-center rounded-xl transition-colors duration-200',
  pleos.panel === p ? 'bg-surface text-accent shadow-card night:bg-surface-2' : 'text-ink-2',
]
</script>

<template>
  <div class="flex h-[52px] flex-none items-center justify-between px-1">
    <div class="flex items-center gap-1">
      <button type="button" class="press grid size-10 place-items-center rounded-xl text-ink-2" :aria-label="vehicle.body.locked ? 'Déverrouiller les portes' : 'Verrouiller les portes'" @click="lock">
        <Icon :name="vehicle.body.locked ? 'lock' : 'unlock'" size="22" :class="!vehicle.body.locked && 'text-warn'" />
      </button>
      <button type="button" :class="btn('search')" aria-label="Recherche globale" @click="pleos.togglePanel('search')"><Icon name="search" size="22" /></button>
      <button v-if="pleos.notifications.length" type="button" class="relative" :class="btn('notifications')" aria-label="Notifications" @click="pleos.togglePanel('notifications')">
        <Icon name="bell" size="22" />
        <span class="absolute top-2 right-2 size-2 rounded-full bg-crit" />
      </button>
      <Transition name="pop">
        <button v-if="vehicle.call" type="button" class="press flex h-9 items-center gap-2 rounded-full bg-ok px-3 text-[13px] font-semibold text-white" @click="pleos.launch('phone')">
          <Icon name="phone" size="16" />{{ vehicle.call.status === 'incoming' ? 'Appel entrant' : 'En appel' }}
        </button>
      </Transition>
    </div>
    <div class="flex items-center gap-0.5">
      <button v-if="!pleos.update.installed" type="button" :class="btn('update')" class="!text-accent" aria-label="Mise à jour du logiciel" @click="pleos.togglePanel('update')"><Icon name="update" size="22" /></button>
      <span v-if="vehicle.features.hotspot" class="grid size-10 place-items-center text-ink-2" title="Point d’accès Wi-Fi actif"><Icon name="hotspot" size="22" /></span>
      <button type="button" :class="btn('volume')" aria-label="Volume" @click="pleos.togglePanel('volume')"><Icon :name="vehicle.media.muted ? 'volume-mute' : 'volume'" size="22" /></button>
      <button v-if="vehicle.features.wifi" type="button" class="press grid size-10 place-items-center rounded-xl text-ink-2" aria-label="Paramètres Wi-Fi" @click="pleos.openSettings('connections')"><Icon name="wifi" size="22" /></button>
      <span class="grid h-10 place-items-center px-1 text-ink-2" title="Réseau"><span class="flex items-end gap-1"><b class="text-[11px] leading-none">LTE</b><Icon name="signal" size="18" /></span></span>
      <button type="button" :class="btn('bluetooth')" aria-label="Bluetooth" @click="pleos.togglePanel('bluetooth')">
        <Icon name="bluetooth" size="22" :class="vehicle.features.bluetooth ? 'text-accent' : ''" />
      </button>
      <button type="button" :class="btn('profile')" aria-label="Profil" @click="pleos.togglePanel('profile')">
        <span class="grid size-8 place-items-center rounded-full text-[13px] font-bold transition-colors" :class="pleos.prefs.profile === 'Invité' ? 'bg-surface-3 text-ink-2' : 'bg-gradient-to-br from-[#4f8df7] to-[#2563eb] text-white'">
          <Icon v-if="pleos.prefs.profile === 'Invité'" name="user" size="18" />
          <template v-else>{{ pleos.prefs.profile.slice(-1) }}</template>
        </span>
      </button>
      <span class="tnum ml-2 text-[17px] font-semibold">{{ time }}</span>
    </div>
  </div>
</template>
