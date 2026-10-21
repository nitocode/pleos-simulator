<script setup lang="ts">
import { computed } from 'vue'

/** Vue ADAS en perspective : voies, véhicule suiveur et véhicule précédent. */
const props = defineProps<{ speed: number; lka: boolean; cruise: boolean; modeColor: string; night: boolean }>()

const lead = computed(() => props.speed > 15)
const gap = computed(() => (props.cruise ? 62 : Math.max(34, 112 - props.speed * 0.5)))
const laneColor = computed(() => (props.lka ? 'var(--ui-ok)' : props.night ? '#3a414c' : '#cdd3da'))
</script>

<template>
  <svg viewBox="0 0 440 260" preserveAspectRatio="xMidYMid meet" class="h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="road-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--ui-drive)" stop-opacity="1" />
        <stop offset="0.35" stop-color="var(--ui-drive)" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="ego" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="night ? '#eef1f5' : '#ffffff'" />
        <stop offset="1" :stop-color="night ? '#9aa3ae' : '#d5dae0'" />
      </linearGradient>
    </defs>
    <path d="M40 260 L196 18 L244 18 L400 260Z" :fill="night ? '#11161d' : '#eef1f4'" />
    <path d="M-60 260 L176 18 M500 260 L264 18" :stroke="night ? '#262d37' : '#d8dde3'" stroke-width="3" stroke-dasharray="14 14" fill="none" />
    <path d="M104 260 L203 18 M336 260 L237 18" :stroke="laneColor" :stroke-width="lka ? 6 : 4" stroke-linecap="round" fill="none" class="transition-[stroke] duration-500" />
    <g v-if="lead" :transform="`translate(220 ${gap}) scale(${0.4 + gap / 280})`" class="transition-transform duration-700 ease-ui">
      <rect x="-30" y="-20" width="60" height="44" rx="12" :fill="night ? '#8b95a3' : '#b4bcc6'" />
      <rect x="-23" y="-13" width="46" height="13" rx="5" :fill="night ? '#3a4352' : '#5d6774'" />
      <rect x="-26" y="8" width="13" height="4" rx="2" fill="#e2302f" />
      <rect x="13" y="8" width="13" height="4" rx="2" fill="#e2302f" />
    </g>
    <g v-if="cruise && lead" :fill="modeColor" opacity="0.7">
      <rect x="198" :y="gap + 36" width="44" height="5" rx="2.5" />
      <rect x="198" :y="gap + 48" width="44" height="5" rx="2.5" />
      <rect x="198" :y="gap + 60" width="44" height="5" rx="2.5" />
    </g>
    <rect x="0" y="0" width="440" height="260" fill="url(#road-fade)" />
    <g transform="translate(220 212)">
      <ellipse cx="0" cy="40" rx="48" ry="8" fill="#000" opacity="0.18" />
      <rect x="-42" y="-40" width="84" height="78" rx="22" fill="url(#ego)" :stroke="night ? 'none' : '#c4cbd3'" stroke-width="1.5" />
      <rect x="-33" y="-28" width="66" height="24" rx="8" fill="#232a34" />
      <rect x="-36" y="14" width="72" height="5" rx="2.5" fill="#e2302f" />
      <rect x="-42" y="-40" width="84" height="6" rx="3" :fill="modeColor" />
    </g>
  </svg>
</template>
