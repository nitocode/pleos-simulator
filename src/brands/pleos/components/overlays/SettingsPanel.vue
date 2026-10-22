<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import { SETTINGS } from '../../data/settings'
import { useSettingBinding } from '../../composables/useSettingBinding'
import { usePleosStore } from '../../store/pleos'
import PTile from '../ui/PTile.vue'
import SettingItemRow from './SettingItemRow.vue'
import ChargeSettings from './settings/ChargeSettings.vue'
import AppsSettings from './settings/AppsSettings.vue'
import VehicleData from './settings/VehicleData.vue'
import ComfortModes from './settings/ComfortModes.vue'

/** Paramètres du véhicule : panneau système au-dessus de la zone d'apps (navigation à gauche, contenu à droite). */
const pleos = usePleosStore()
const vehicle = useVehicleStore()
const binding = useSettingBinding()
const category = computed(() => SETTINGS.find((c) => c.id === pleos.settingsCategory) ?? SETTINGS[0]!)

// Le contenu ne remonte en haut que lorsqu'on change de catégorie, jamais quand on touche une option.
const content = ref<HTMLElement | null>(null)
watch(
  () => [pleos.settingsCategory, pleos.settingsSub],
  () => nextTick(() => content.value?.scrollTo({ top: 0 })),
)

function action(id: string) {
  const messages: Record<string, [string, Parameters<typeof pleos.notify>[1]]> = {
    navReset: ['Historique de navigation réinitialisé', 'rotate-ccw'],
    btAdd: ['Recherche de périphériques Bluetooth…', 'bluetooth'],
    digitalKey: ['Gérez vos clés depuis l’app Bluelink du téléphone', 'key'],
    sharedKeys: ['Gérez vos clés depuis l’app Bluelink du téléphone', 'key'],
  }
  if (id === 'gleoReset') {
    pleos.gleoHistory = pleos.gleoHistory.slice(0, 1)
    pleos.notify('Conversation réinitialisée', 'rotate-ccw')
  } else if (id === 'flatReset') {
    Object.assign(pleos.prefs, { flatLights: true, flatLeft: 'Autonomie', flatCenter: 'Média', flatRight: 'Conso.' })
    pleos.notify('Widgets de l’écran plat réinitialisés', 'rotate-ccw')
  } else if (messages[id]) pleos.notify(...messages[id]!)
}

function toggleTile(key: Parameters<typeof binding.toggle>[0]) {
  if (key === 'b:trunkOpen' && vehicle.moving) return pleos.notify('Le hayon s’ouvre uniquement à l’arrêt', 'warning')
  binding.toggle(key)
}
</script>

<template>
  <div class="absolute inset-0 z-20 flex overflow-hidden rounded-[20px] bg-surface shadow-pop night:rounded-[14px]">
    <nav class="thin-scrollbar flex w-[248px] flex-none flex-col gap-0.5 overflow-auto border-r border-line bg-surface p-2.5" aria-label="Catégories des paramètres">
      <button
        v-for="c in SETTINGS"
        :key="c.id"
        type="button"
        class="press flex flex-none items-center gap-3 rounded-full px-4 py-2.5 text-left text-[14.5px] font-semibold transition-colors duration-200"
        :class="c.id === category.id ? 'bg-accent text-on-accent' : 'text-ink hover:bg-surface-2'"
        :aria-current="c.id === category.id ? 'page' : undefined"
        @click="pleos.settingsCategory = c.id; pleos.settingsSub = null"
      >
        <Icon :name="c.icon" size="20" :stroke="c.icon === 'gleo' ? 2.6 : 1.8" :class="c.id === category.id ? '' : 'text-ink-2'" />
        <span class="truncate">{{ c.label }}</span>
      </button>
    </nav>
    <div ref="content" class="thin-scrollbar relative min-w-0 flex-1 overflow-auto px-7 pt-5 pb-8">
      <button type="button" class="press absolute top-3 right-3 z-[1] grid size-11 place-items-center rounded-xl text-ink-2" aria-label="Fermer les paramètres" @click="pleos.closePanel()">
        <Icon name="close" size="22" />
      </button>
      <Transition name="slide" mode="out-in">
        <div :key="category.id + (pleos.settingsSub ?? '')">
          <ChargeSettings v-if="category.special === 'charge'" />
          <AppsSettings v-else-if="category.special === 'apps'" />
          <VehicleData v-else-if="category.special === 'data'" />
          <ComfortModes v-else-if="category.special === 'comfort'" />
          <template v-else>
            <h2 class="mb-4 text-[21px] font-bold">{{ category.label }}</h2>
            <div v-if="category.tiles" class="mb-4 grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-2.5">
              <PTile
                v-for="t in category.tiles"
                :key="t.key"
                :label="t.label"
                :state="binding.get(t.key) ? t.on : t.off"
                :on="!!binding.get(t.key)"
                :icon="t.icon"
                @toggle="toggleTile(t.key)"
              />
            </div>
            <SettingItemRow v-for="(item, i) in category.items" :key="i" :item="item" @action="action" />
          </template>
        </div>
      </Transition>
    </div>
  </div>
</template>
