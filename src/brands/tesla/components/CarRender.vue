<script setup lang="ts">
/**
 * Model 3 vue de trois quarts avant (avant en bas à gauche, comme la visualisation du manuel), dessinée en SVG :
 * carrosserie argent, toit vitré noir. Le coffre avant et le coffre arrière se soulèvent quand ils sont ouverts.
 */
defineProps<{ frunkOpen?: boolean; trunkOpen?: boolean; blinkL?: boolean; blinkR?: boolean }>()
</script>

<template>
  <svg viewBox="0 0 320 190" class="block h-auto w-full" role="img" aria-label="Model 3">
    <defs>
      <linearGradient id="t-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fbfbfc" />
        <stop offset="0.55" stop-color="#dfe1e5" />
        <stop offset="1" stop-color="#a9adb4" />
      </linearGradient>
      <linearGradient id="t-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3a3e46" />
        <stop offset="1" stop-color="#0c0d10" />
      </linearGradient>
      <radialGradient id="t-rim" cx="0.45" cy="0.4" r="0.7">
        <stop offset="0" stop-color="#d4d7dc" />
        <stop offset="1" stop-color="#6d727a" />
      </radialGradient>
      <radialGradient id="t-shadow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#000" stop-opacity="0.35" />
        <stop offset="1" stop-color="#000" stop-opacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx="168" cy="150" rx="150" ry="26" fill="url(#t-shadow)" />

    <!-- roues arrière (côté opposé) -->
    <ellipse cx="272" cy="126" rx="12" ry="16" fill="#121316" />

    <!-- carrosserie -->
    <path d="M22 132C18 118 30 108 56 102L112 88C128 72 150 62 180 58C215 54 245 58 262 70C272 76 282 80 300 84C308 88 310 104 304 114L290 124L80 152C50 156 26 148 22 132Z" fill="url(#t-body)" stroke="#9fa3aa" stroke-width="1" />
    <!-- capot -->
    <path v-if="!frunkOpen" d="M30 120C40 110 70 102 106 94L114 90C110 96 108 102 106 106C78 110 52 116 30 120Z" fill="#f7f8f9" opacity="0.9" />
    <path v-else d="M56 102L112 88L120 62L62 80Z" fill="#eef0f2" stroke="var(--ui-warn)" stroke-width="2" />
    <!-- vitrage : pare-brise, toit, lunette -->
    <path d="M114 88C130 72 152 62 182 59C214 55 244 59 262 71C270 76 276 80 284 83L250 86C210 80 170 82 140 92Z" fill="url(#t-glass)" />
    <path d="M146 94C176 88 214 87 248 90L276 86C270 94 262 100 254 102L156 108Z" fill="#26292f" />
    <path d="M200 89L198 106" stroke="#9fa3aa" stroke-width="1.5" />
    <!-- coffre arrière -->
    <path v-if="trunkOpen" d="M262 70L300 84L312 62L274 50Z" fill="#eef0f2" stroke="var(--ui-warn)" stroke-width="2" />
    <!-- rétroviseur, poignée, phares -->
    <path d="M138 96L150 92L152 100L142 102Z" fill="#1a1c20" />
    <path d="M28 118C42 112 60 109 80 108" stroke="#2b2e34" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M292 92L306 92" stroke="#b3161f" stroke-width="3" stroke-linecap="round" />
    <path d="M62 146L286 124" stroke="#30333a" stroke-width="5" stroke-linecap="round" opacity="0.55" />
    <!-- roues avant (côté visible) -->
    <g transform="translate(86 144)">
      <ellipse rx="22" ry="26" fill="#121316" />
      <ellipse rx="15" ry="18.5" fill="url(#t-rim)" />
      <ellipse rx="4" ry="5" fill="#2a2d33" />
    </g>
    <g transform="translate(246 128)">
      <ellipse rx="18" ry="22" fill="#121316" />
      <ellipse rx="12" ry="15.5" fill="url(#t-rim)" />
      <ellipse rx="3.5" ry="4.5" fill="#2a2d33" />
    </g>
    <!-- clignotants -->
    <circle v-if="blinkL" cx="32" cy="114" r="5" fill="#ffb02e" class="animate-blink" />
    <circle v-if="blinkR" cx="304" cy="96" r="5" fill="#ffb02e" class="animate-blink" />
  </svg>
</template>
