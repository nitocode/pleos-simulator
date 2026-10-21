<script setup lang="ts">
import { computed } from 'vue'
import type { SettingItem } from '../../data/settings'
import { useSettingBinding } from '../../composables/useSettingBinding'
import PSwitch from '../ui/PSwitch.vue'
import PSegmented from '../ui/PSegmented.vue'
import PSlider from '../ui/PSlider.vue'
import PButton from '../ui/PButton.vue'

const props = defineProps<{ item: SettingItem }>()
const emit = defineEmits<{ action: [id: string] }>()
const binding = useSettingBinding()

/** Valeur liée en lecture/écriture, quel que soit le type de contrôle. */
const value = computed({
  get: () => ('key' in props.item ? binding.get(props.item.key) : ''),
  set: (v) => 'key' in props.item && binding.set(props.item.key, v),
})
const wide = computed(() => props.item.type === 'segment' && (props.item.options.length > 3 || props.item.options.join('').length > 24))
</script>

<template>
  <p v-if="item.type === 'header'" class="mt-6 mb-1 text-[12.5px] font-bold tracking-[0.08em] text-ink-2 uppercase">{{ item.label }}</p>
  <div v-else-if="item.type === 'slider'" class="flex items-center gap-4 border-b border-line py-3 last:border-0">
    <span class="w-[150px] flex-none text-[15.5px] font-semibold">{{ item.label }}</span>
    <PSlider v-model="(value as number)" :min="item.min" :max="item.max" :step="item.step" :icon="item.icon" :unit="item.unit" :label="item.label" />
    <PButton v-if="item.reset !== undefined" small @click="value = item.reset!">Réinitialiser</PButton>
  </div>
  <div v-else class="flex justify-between gap-4 border-b border-line py-3.5 last:border-0" :class="wide ? 'flex-col items-start' : 'items-center'">
    <div class="min-w-0">
      <b class="block text-[15.5px] font-semibold">{{ item.label }}</b>
      <small v-if="'hint' in item && item.hint" class="mt-0.5 block text-[13px] leading-snug text-ink-2">{{ item.hint }}</small>
    </div>
    <PSwitch v-if="item.type === 'switch'" v-model="(value as boolean)" :label="item.label" />
    <PSegmented v-else-if="item.type === 'segment'" v-model="(value as string)" :options="item.options" :icons="item.icons" />
    <div v-else-if="item.type === 'color'" class="flex gap-2.5">
      <button
        v-for="[name, hex] in item.options"
        :key="hex"
        type="button"
        class="press size-9 rounded-full ring-offset-2 ring-offset-surface transition-shadow duration-200"
        :class="value === hex ? 'ring-[3px] ring-accent' : 'ring-1 ring-black/10'"
        :style="{ background: hex }"
        :aria-label="name"
        :aria-pressed="value === hex"
        @click="value = hex"
      />
    </div>
    <span v-else-if="item.type === 'info'" class="text-right text-[14px] text-ink-2">{{ item.value }}</span>
    <PButton v-else-if="item.type === 'action'" small :variant="item.danger ? 'danger' : 'default'" @click="emit('action', item.id)">{{ item.button }}</PButton>
  </div>
</template>
