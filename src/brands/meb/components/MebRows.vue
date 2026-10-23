<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'

/** Liste de réglages décrite en données (interrupteur, choix, curseur, info, action), habillée par les jetons de la marque. */
export type MebRow =
  | { kind: 'switch'; label: string; hint?: string; get: () => boolean; set: (v: boolean) => void }
  | { kind: 'seg'; label: string; hint?: string; options: readonly string[]; get: () => string; set: (v: string) => void }
  | { kind: 'slider'; label: string; hint?: string; min: number; max: number; step?: number; unit?: string; get: () => number; set: (v: number) => void }
  | { kind: 'info'; label: string; hint?: string; value: () => string }
  | { kind: 'action'; label: string; hint?: string; button: string; run: () => void; disabled?: () => boolean }
defineProps<{ rows: MebRow[] }>()
</script>

<template>
  <div>
    <div v-for="r in rows" :key="r.label" class="flex items-center gap-4 border-b border-line py-3.5 last:border-0">
      <span class="min-w-0 flex-1"><b class="block text-[15.5px] font-semibold">{{ r.label }}</b><small v-if="r.hint" class="block text-[12.5px] leading-snug text-ink-2">{{ r.hint }}</small></span>
      <button v-if="r.kind === 'switch'" type="button" role="switch" :aria-checked="r.get()" :aria-label="r.label" class="press relative h-8 w-14 flex-none rounded-full transition-colors" :class="r.get() ? 'bg-accent' : 'bg-surface-3'" @click="r.set(!r.get())"><span class="absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform duration-200" :class="r.get() && 'translate-x-6'" /></button>
      <div v-else-if="r.kind === 'seg'" class="flex rounded-xl bg-surface-2 p-1" role="radiogroup" :aria-label="r.label">
        <button v-for="o in r.options" :key="o" type="button" role="radio" :aria-checked="r.get() === o" class="press rounded-lg px-3 py-1.5 text-[13.5px] font-semibold" :class="r.get() === o ? 'bg-accent text-on-accent' : 'text-ink-2'" @click="r.set(o)">{{ o }}</button>
      </div>
      <span v-else-if="r.kind === 'slider'" class="flex w-[240px] items-center gap-3">
        <input type="range" :min="r.min" :max="r.max" :step="r.step ?? 1" :value="r.get()" :aria-label="r.label" class="flex-1 accent-[var(--ui-accent)]" @input="r.set(+($event.target as HTMLInputElement).value)" />
        <b class="tnum w-14 text-right text-[14px]">{{ r.get() }}{{ r.unit }}</b>
      </span>
      <button v-else-if="r.kind === 'action'" type="button" class="press flex h-10 items-center gap-1.5 rounded-xl bg-surface-2 px-4 text-[14px] font-semibold disabled:opacity-40" :disabled="r.disabled?.()" @click="r.run()">{{ r.button }}<Icon name="chevron-right" size="16" /></button>
      <span v-else class="max-w-[220px] text-right text-[14px] text-ink-2">{{ r.value() }}</span>
    </div>
  </div>
</template>
