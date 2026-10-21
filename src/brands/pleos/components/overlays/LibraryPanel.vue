<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { vLongPress } from '@/core/composables/useLongPress'
import { useVehicleStore } from '@/core/vehicle/store'
import { BUILTIN_APPS, CLIMATE_SHORTCUTS, TONE_CLASS, appMeta, isMarketApp, type AppId, type BuiltinAppId, type ShortcutId, type SlotItem } from '../../catalog'
import { usePleosStore } from '../../store/pleos'
import AppIcon from '../ui/AppIcon.vue'

/**
 * Bibliothèque d'apps (guide Pleos : commandes de climatisation en haut, séparateur, apps en dessous,
 * jusqu'à 7 éléments par rangée ; appui long = mode édition avec guide et bouton Terminé).
 */
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const shortcuts = Object.keys(CLIMATE_SHORTCUTS) as ShortcutId[]
const apps = computed<AppId[]>(() => [...(Object.keys(BUILTIN_APPS) as BuiltinAppId[]), ...pleos.installed])
const placed = computed(() => new Set(Object.values(pleos.slots)))

function tap(item: SlotItem) {
  if (pleos.editMode) return pleos.assign(item)
  if (item.startsWith('cf:')) pleos.notify(CLIMATE_SHORTCUTS[item as ShortcutId].run(vehicle), CLIMATE_SHORTCUTS[item as ShortcutId].icon)
  else pleos.launch(item as AppId)
}
</script>

<template>
  <div class="absolute inset-x-0 bottom-0 z-20 rounded-[22px] border border-line bg-surface px-5 pt-4 pb-5 shadow-pop night:rounded-[16px]" role="dialog" aria-label="Bibliothèque d’apps">
    <Transition name="fade">
      <div v-if="pleos.editMode" class="mb-3 flex items-center gap-3 rounded-2xl bg-accent-soft px-4 py-3 text-[14px]">
        <Icon name="pencil" size="20" class="text-accent" />
        <span class="flex-1">Touchez un emplacement dans la zone de contrôle, puis une app ou une commande pour l’y placer. Emplacement actif : <b>{{ pleos.editSlot?.toUpperCase() }}</b></span>
        <button v-if="pleos.editSlot && pleos.slots[pleos.editSlot]" type="button" class="press h-10 rounded-xl px-3 font-semibold text-crit" @click="pleos.clearSlot(pleos.editSlot!)">Vider</button>
        <button type="button" class="press h-10 rounded-xl bg-accent px-4 font-semibold text-on-accent" @click="pleos.stopEditing(); pleos.closePanel()">Terminé</button>
      </div>
    </Transition>
    <div class="grid grid-cols-7 gap-1">
      <button
        v-for="id in shortcuts"
        :key="id"
        type="button"
        v-long-press="() => pleos.startEditing()"
        class="press relative flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 text-center"
        :class="[pleos.editMode && 'animate-wiggle', pleos.editMode && placed.has(id) && 'opacity-40']"
        @click="tap(id)"
      >
        <span class="grid size-[52px] place-items-center rounded-2xl bg-surface-2 transition-colors" :class="CLIMATE_SHORTCUTS[id].active(vehicle) && TONE_CLASS[CLIMATE_SHORTCUTS[id].tone]">
          <Icon :name="CLIMATE_SHORTCUTS[id].icon" size="28" />
        </span>
        <span class="line-clamp-2 text-[12px] leading-tight font-semibold">{{ CLIMATE_SHORTCUTS[id].name }}</span>
      </button>
    </div>
    <div class="my-3 h-px bg-line" />
    <TransitionGroup name="pop" tag="div" class="grid grid-cols-7 gap-1">
      <button
        v-for="id in apps"
        :key="id"
        type="button"
        v-long-press="() => pleos.startEditing()"
        class="press relative flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 text-center"
        :class="[pleos.editMode && 'animate-wiggle', pleos.editMode && placed.has(id) && 'opacity-40']"
        @click="tap(id)"
      >
        <AppIcon :id="id" :size="52" />
        <span class="line-clamp-2 text-[12px] leading-tight font-semibold">{{ appMeta(id).name }}</span>
        <span
          v-if="pleos.editMode && isMarketApp(id)"
          role="button"
          class="absolute top-1 right-2 grid size-6 place-items-center rounded-full bg-crit text-white"
          :aria-label="`Supprimer ${appMeta(id).name}`"
          @click.stop="pleos.uninstall(id)"
        >
          <Icon name="close" size="12" :stroke="2.6" />
        </span>
      </button>
    </TransitionGroup>
  </div>
</template>
