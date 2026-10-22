<script setup lang="ts">
/**
 * Model 3 (2024+) de profil, avant à gauche, posée à plat sur le sol. Proportions à l'échelle du véhicule
 * (longueur 4,72 m, hauteur 1,44 m, empattement 2,88 m, roues de 0,67 m) : 1 unité ≈ 12 mm.
 * Le capot avant et le coffre arrière se soulèvent quand ils sont ouverts ; les clignotants clignotent.
 */
defineProps<{ frunkOpen?: boolean; trunkOpen?: boolean; blinkL?: boolean; blinkR?: boolean }>()

// Roues : centres à 76 et 310 (empattement), rayon de pneu 26,5, sol à y = 128.
const WHEELS = [76, 310] as const
const SPOKES = [0, 72, 144, 216, 288] as const
</script>

<template>
  <svg viewBox="0 0 400 140" class="block h-auto w-full" role="img" aria-label="Model 3 de profil">
    <defs>
      <linearGradient id="m3-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fbfbfc" />
        <stop offset="0.42" stop-color="#eceef1" />
        <stop offset="0.7" stop-color="#d2d5da" />
        <stop offset="1" stop-color="#9ea3ab" />
      </linearGradient>
      <linearGradient id="m3-glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0b0c0e" />
        <stop offset="1" stop-color="#25282e" />
      </linearGradient>
      <linearGradient id="m3-window" x1="0" y1="0" x2="1" y2="0.6">
        <stop offset="0" stop-color="#2f343c" />
        <stop offset="0.45" stop-color="#16181c" />
        <stop offset="0.7" stop-color="#3a3f48" />
        <stop offset="1" stop-color="#121417" />
      </linearGradient>
      <radialGradient id="m3-rim" cx="0.42" cy="0.38" r="0.75">
        <stop offset="0" stop-color="#e3e6ea" />
        <stop offset="0.6" stop-color="#9aa0a8" />
        <stop offset="1" stop-color="#5e646c" />
      </radialGradient>
      <radialGradient id="m3-shadow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#000" stop-opacity="0.45" />
        <stop offset="0.7" stop-color="#000" stop-opacity="0.12" />
        <stop offset="1" stop-color="#000" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- ombre au sol -->
    <ellipse cx="200" cy="129" rx="196" ry="8" fill="url(#m3-shadow)" />

    <!-- passages de roue -->
    <circle v-for="x in WHEELS" :key="`w${x}`" :cx="x" cy="104" r="29" fill="#0c0d0f" />

    <!-- capot soulevé (derrière la carrosserie) -->
    <path v-if="frunkOpen" d="M20 76C50 70 90 64 120 56C92 42 54 36 24 46Z" fill="#e9ebee" stroke="var(--ui-warn)" stroke-width="2" stroke-linejoin="round" />

    <!-- carrosserie -->
    <path
      d="M16 113C10 110 6 102 7 93C8 85 12 79 20 76C50 70 90 64 120 56C140 40 165 22 200 14C235 10 275 14 305 24C325 31 345 40 360 44L367 42.5C381 43 389 50 391 61C393 74 392 88 389 100C387 108 383 113 376 113L337 113A29 29 0 1 0 283 113L103 113A29 29 0 1 0 49 113L24 113C20 113 18 113 16 113Z"
      fill="url(#m3-body)"
      stroke="#a4a9b0"
      stroke-width="0.8"
    />
    <!-- capot fermé : arête -->
    <path v-if="!frunkOpen" d="M20 76C50 70 90 64 120 56" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.9" />
    <path v-else d="M20 76C50 70 90 64 120 56" fill="none" stroke="#2a2d33" stroke-width="1.5" />

    <!-- toit vitré et vitres latérales -->
    <path d="M120 57C140 40 165 22 200 14C235 10 275 14 305 24C325 31 345 40 358 44L346 49C280 53 200 58 128 63Z" fill="url(#m3-glass)" />
    <path d="M138 60C156 44 178 29 206 23C240 18 280 22 316 36C326 40 332 44 335 48L136 61Z" fill="url(#m3-window)" />
    <path d="M233 19L234 55" stroke="#0b0c0e" stroke-width="3.2" />
    <path d="M130 63C200 58 280 53 348 49" fill="none" stroke="#1a1c20" stroke-width="1.2" />

    <!-- ligne d'épaule (reflet) et bas de caisse -->
    <path d="M22 80C60 72 100 67 140 65C220 61 300 57 386 57" fill="none" stroke="#ffffff" stroke-width="1.4" opacity="0.75" />
    <path d="M104 111.5L282 111.5" stroke="#2a2d33" stroke-width="3.5" stroke-linecap="round" />

    <!-- portes, poignées affleurantes, rétroviseur -->
    <g fill="none" stroke="#b8bcc3" stroke-width="0.9">
      <path d="M138 63C135 80 135 98 139 111" />
      <path d="M234 57L233 111" />
      <path d="M314 51C318 62 314 76 302 82" />
    </g>
    <rect x="182" y="68" width="18" height="2.6" rx="1.3" fill="#9095a0" />
    <rect x="266" y="63" width="16" height="2.6" rx="1.3" fill="#9095a0" />
    <path d="M134 58C140 55 150 55 152 59L150 64C144 64 138 63 134 62Z" fill="#17191d" />

    <!-- phare, prise d'air, feu arrière -->
    <path d="M11 84C22 80 36 78 50 77" fill="none" stroke="#24272c" stroke-width="2.6" stroke-linecap="round" />
    <path d="M10 101C14 106 22 108 36 108" fill="none" stroke="#3a3e45" stroke-width="1.6" stroke-linecap="round" />
    <path d="M376 48C383 50 388 54 391 60" fill="none" stroke="#b3161f" stroke-width="4" stroke-linecap="round" />
    <path d="M380 98L390 96" stroke="#3a3e45" stroke-width="1.6" stroke-linecap="round" />

    <!-- coffre arrière soulevé -->
    <path v-if="trunkOpen" d="M340 38L366 43C380 44 388 48 391 54L384 26C372 18 354 18 342 24Z" fill="#e9ebee" stroke="var(--ui-warn)" stroke-width="2" stroke-linejoin="round" />

    <!-- roues : pneu, jante aéro à 5 branches, cache-moyeu -->
    <g v-for="x in WHEELS" :key="x" :transform="`translate(${x} 101)`">
      <circle r="26.5" fill="#111214" />
      <circle r="25" fill="none" stroke="#24262a" stroke-width="2" />
      <circle r="19.5" fill="url(#m3-rim)" />
      <path v-for="a in SPOKES" :key="a" :transform="`rotate(${a})`" d="M-3 -4L-5.5 -18.5L5.5 -18.5L3 -4Z" fill="#5b6068" opacity="0.55" />
      <circle r="19.5" fill="none" stroke="#7b818a" stroke-width="1" />
      <circle r="4.5" fill="#2b2e34" />
      <circle r="1.6" fill="#c9ccd1" />
    </g>

    <!-- clignotants : avant, répétiteur d'aile, arrière -->
    <g fill="#ffb02e">
      <circle v-if="blinkL || blinkR" cx="14" cy="84" r="3.5" class="animate-blink" />
      <rect v-if="blinkL || blinkR" x="108" y="68" width="7" height="2.6" rx="1.3" class="animate-blink" />
      <circle v-if="blinkL || blinkR" cx="388" cy="57" r="3.5" class="animate-blink" />
    </g>
  </svg>
</template>
