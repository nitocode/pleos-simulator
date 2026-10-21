<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { vLongPress } from '@/core/composables/useLongPress'
import type { TempUnit } from '@/core/format'
import { useVehicleStore } from '@/core/vehicle/store'
import { AIRFLOW_ICON, CLIMATE_SHORTCUTS, TONE_CLASS, isShortcut, type SlotItem } from '../../catalog'
import { usePleosStore, type SlotId } from '../../store/pleos'
import AppIcon from '../ui/AppIcon.vue'
import TempValue from '../ui/TempValue.vue'

/**
 * Zone de contrôle (GNB), dans l'ordre du guide Pleos Connect-S :
 * paramètres du véhicule · température conducteur · emplacements conducteur · navigation · favoris ·
 * bibliothèque d'apps · apps récentes · emplacements passager · température passager.
 */
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const unit = computed(() => pleos.prefs.tempUnit as TempUnit)

const visibleIds = computed(() => (pleos.cameraFull ? ['camera'] : pleos.visible))
const recents = computed(() =>
  pleos.recent.filter((id) => !Object.values(pleos.slots).includes(id) && id !== 'nav').slice(0, 2),
)

function shortcutIcon(item: SlotItem) {
  if (item === 'cf:airflow') return AIRFLOW_ICON[vehicle.climate.airflow]
  return isShortcut(item) ? CLIMATE_SHORTCUTS[item].icon : 'apps-grid'
}
function shortcutLevel(item: SlotItem) {
  return isShortcut(item) && /seat/.test(item) ? CLIMATE_SHORTCUTS[item].level(vehicle) : 0
}
function shortcutOn(item: SlotItem) {
  return isShortcut(item) && CLIMATE_SHORTCUTS[item].active(vehicle)
}
function tap(slot: SlotId) {
  if (pleos.editMode) {
    pleos.editSlot = slot
    return
  }
  const item = pleos.slots[slot]
  if (item) pleos.runSlot(item)
  else pleos.startEditing(slot)
}
const slotClass = (slot: SlotId) => [
  'press relative grid h-[64px] w-[60px] flex-none place-items-center rounded-2xl transition-colors duration-200',
  pleos.editMode && 'animate-wiggle',
  pleos.editMode && pleos.editSlot === slot ? 'bg-accent-soft ring-2 ring-accent' : pleos.editMode ? 'outline-2 outline-dashed outline-ink-3/50 -outline-offset-4' : '',
]
</script>

<template>
  <nav class="col-span-2 flex h-full items-center gap-0.5 rounded-[22px] bg-surface px-2 shadow-card transition-colors duration-500 night:rounded-[14px] night:bg-bg night:shadow-none" aria-label="Zone de contrôle">
    <button type="button" class="press grid h-[64px] w-[56px] flex-none place-items-center rounded-2xl" :class="pleos.panel === 'settings' && 'bg-accent-soft text-accent'" aria-label="Paramètres du véhicule" @click="pleos.panel === 'settings' ? pleos.closePanel() : pleos.openSettings()">
      <Icon name="car-front" size="30" />
    </button>

    <!-- température conducteur -->
    <div class="flex flex-none items-center">
      <button type="button" class="press grid h-[64px] w-8 place-items-center text-cool" aria-label="Baisser la température conducteur" @click="vehicle.nudgeTemp('L', -0.5)"><Icon name="chevron-left" size="24" :stroke="2.4" /></button>
      <button type="button" class="press flex h-[64px] w-[70px] flex-col items-center justify-center rounded-2xl" :class="pleos.panel === 'climate' && 'bg-surface-2'" aria-label="Climatisation" @click="pleos.togglePanel('climate')">
        <span class="text-[27px] font-medium"><TempValue :value="vehicle.climate.temp.L" :unit="unit" :off="!vehicle.climate.on" /></span>
        <span class="text-[11px] font-extrabold" :class="vehicle.climate.ac && vehicle.climate.on ? 'text-ok' : 'text-ink-3'">A/C</span>
      </button>
      <button type="button" class="press grid h-[64px] w-8 place-items-center text-heat" aria-label="Monter la température conducteur" @click="vehicle.nudgeTemp('L', 0.5)"><Icon name="chevron-right" size="24" :stroke="2.4" /></button>
    </div>

    <template v-for="slot in (['d1', 'd2', 'd3'] as const)" :key="slot">
      <button type="button" :class="slotClass(slot)" v-long-press="() => pleos.startEditing(slot)" :aria-label="pleos.slots[slot] ?? 'Emplacement libre'" @click="tap(slot)">
        <template v-if="pleos.slots[slot] && isShortcut(pleos.slots[slot]!)">
          <Icon :name="shortcutIcon(pleos.slots[slot]!)" size="30" class="transition-colors duration-300" :class="shortcutOn(pleos.slots[slot]!) ? TONE_CLASS[CLIMATE_SHORTCUTS[pleos.slots[slot] as 'cf:ac'].tone] : ''" />
          <span v-if="shortcutLevel(pleos.slots[slot]!)" class="absolute bottom-2 flex gap-0.5"><i v-for="l in 3" :key="l" class="h-[3px] w-[7px] rounded-full transition-colors" :class="shortcutLevel(pleos.slots[slot]!) >= l ? 'bg-heat' : 'bg-surface-3'" /></span>
        </template>
        <AppIcon v-else-if="pleos.slots[slot]" :id="pleos.slots[slot] as 'nav'" :size="44" />
        <Icon v-else name="plus" size="22" class="text-ink-3" />
      </button>
    </template>

    <span class="mx-1 h-10 w-px flex-none bg-line" />

    <template v-for="slot in (['f1', 'f2', 'f3'] as const)" :key="slot">
      <button type="button" :class="[slotClass(slot), pleos.slots[slot] && visibleIds.includes(pleos.slots[slot]!) && !pleos.editMode && 'bg-surface-2']" v-long-press="() => pleos.startEditing(slot)" :aria-label="pleos.slots[slot] ?? 'Emplacement libre'" @click="tap(slot)">
        <Icon v-if="pleos.slots[slot] && isShortcut(pleos.slots[slot]!)" :name="shortcutIcon(pleos.slots[slot]!)" size="30" :class="shortcutOn(pleos.slots[slot]!) && TONE_CLASS[CLIMATE_SHORTCUTS[pleos.slots[slot] as 'cf:ac'].tone]" />
        <AppIcon v-else-if="pleos.slots[slot]" :id="pleos.slots[slot] as 'nav'" :size="44" />
        <Icon v-else name="plus" size="22" class="text-ink-3" />
      </button>
    </template>

    <button type="button" class="press grid h-[64px] w-[60px] flex-none place-items-center rounded-2xl" :class="visibleIds.includes('nav') && 'bg-surface-2'" aria-label="Navigation" @click="pleos.launch('nav')">
      <AppIcon id="nav" :size="44" />
    </button>
    <button type="button" class="press grid h-[64px] w-[60px] flex-none place-items-center rounded-2xl" :class="pleos.panel === 'library' && 'bg-surface-2'" aria-label="Bibliothèque d’apps" v-long-press="() => pleos.startEditing()" @click="pleos.togglePanel('library')">
      <Icon name="apps-grid" size="30" />
    </button>

    <span class="mx-1 h-10 w-px flex-none bg-line" />
    <TransitionGroup name="pop" tag="div" class="flex gap-0.5">
      <button v-for="id in recents" :key="id" type="button" class="press grid h-[64px] w-[60px] flex-none place-items-center rounded-2xl" :class="visibleIds.includes(id) && 'bg-surface-2'" :aria-label="id" @click="pleos.launch(id)">
        <AppIcon :id="id" :size="44" />
      </button>
    </TransitionGroup>
    <span class="mx-1 h-10 w-px flex-none bg-line" />

    <span class="flex-1" />

    <template v-for="slot in (['p1', 'p2', 'p3'] as const)" :key="slot">
      <button type="button" :class="slotClass(slot)" v-long-press="() => pleos.startEditing(slot)" :aria-label="pleos.slots[slot] ?? 'Emplacement libre'" @click="tap(slot)">
        <template v-if="pleos.slots[slot] === 'cf:fan'">
          <span class="flex flex-col items-center leading-none">
            <span class="flex items-center gap-0.5"><Icon name="fan" size="22" /><b class="tnum text-[15px]">{{ vehicle.climate.fan }}</b></span>
            <span class="mt-1 text-[10px] font-extrabold" :class="vehicle.climate.auto ? 'text-ok' : 'text-ink-3'">AUTO</span>
          </span>
        </template>
        <template v-else-if="pleos.slots[slot] && isShortcut(pleos.slots[slot]!)">
          <Icon :name="shortcutIcon(pleos.slots[slot]!)" size="30" class="transition-colors duration-300" :class="shortcutOn(pleos.slots[slot]!) ? TONE_CLASS[CLIMATE_SHORTCUTS[pleos.slots[slot] as 'cf:ac'].tone] : ''" />
          <span v-if="shortcutLevel(pleos.slots[slot]!)" class="absolute bottom-2 flex gap-0.5"><i v-for="l in 3" :key="l" class="h-[3px] w-[7px] rounded-full" :class="shortcutLevel(pleos.slots[slot]!) >= l ? 'bg-heat' : 'bg-surface-3'" /></span>
        </template>
        <AppIcon v-else-if="pleos.slots[slot]" :id="pleos.slots[slot] as 'nav'" :size="44" />
        <Icon v-else name="plus" size="22" class="text-ink-3" />
      </button>
    </template>

    <!-- température passager -->
    <div class="flex flex-none items-center">
      <button type="button" class="press grid h-[64px] w-8 place-items-center text-cool" aria-label="Baisser la température passager" @click="vehicle.nudgeTemp('R', -0.5)"><Icon name="chevron-left" size="24" :stroke="2.4" /></button>
      <button type="button" class="press flex h-[64px] w-[70px] flex-col items-center justify-center rounded-2xl" :class="pleos.panel === 'climate' && 'bg-surface-2'" aria-label="Climatisation" @click="pleos.togglePanel('climate')">
        <span class="text-[27px] font-medium"><TempValue :value="vehicle.climate.temp.R" :unit="unit" :off="!vehicle.climate.on" /></span>
        <span class="text-[11px] font-extrabold" :class="vehicle.climate.sync ? 'text-ok' : 'text-ink-3'">SYNC</span>
      </button>
      <button type="button" class="press grid h-[64px] w-8 place-items-center text-heat" aria-label="Monter la température passager" @click="vehicle.nudgeTemp('R', 0.5)"><Icon name="chevron-right" size="24" :stroke="2.4" /></button>
    </div>
  </nav>
</template>
