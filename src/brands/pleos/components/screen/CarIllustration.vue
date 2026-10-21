<script setup lang="ts">
/** Ioniq 3 de profil (silhouette « aero hatch »), dessinée en SVG. */
withDefaults(defineProps<{ paint?: [string, string]; mirrorsFolded?: boolean; trunkOpen?: boolean; chargePortOpen?: boolean; windowsOpen?: boolean }>(), {
  paint: () => ['#f4f6f8', '#a9b1bb'],
})
</script>

<template>
  <svg viewBox="0 0 400 170" class="block h-auto w-full" aria-hidden="true">
    <defs>
      <linearGradient id="car-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="paint[0]" />
        <stop offset="0.55" :stop-color="paint[0]" />
        <stop offset="1" :stop-color="paint[1]" />
      </linearGradient>
      <linearGradient id="car-glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3c4552" />
        <stop offset="1" stop-color="#151a21" />
      </linearGradient>
      <radialGradient id="car-rim" cx="0.4" cy="0.35" r="0.8">
        <stop offset="0" stop-color="#e6e9ed" />
        <stop offset="1" stop-color="#7d858f" />
      </radialGradient>
      <radialGradient id="car-shadow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#000" stop-opacity="0.32" />
        <stop offset="1" stop-color="#000" stop-opacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx="200" cy="154" rx="188" ry="13" fill="url(#car-shadow)" />
    <!-- hayon ouvert -->
    <path v-if="trunkOpen" d="M286 40 L346 8 L356 16 L300 44 Z" fill="url(#car-body)" stroke="#8a929c" stroke-width="1" class="transition-opacity" />
    <!-- carrosserie -->
    <path
      d="M24 106 C24 95 29 89 41 86 L128 71 C150 53 174 41 200 39 L282 40 C301 41 319 51 350 71 C361 78 367 86 368 98 L368 114 C368 120 363 124 357 124 L339 124 A38 38 0 0 0 262 124 L134 124 A38 38 0 0 0 57 124 L35 124 C28 124 24 118 24 110 Z"
      fill="url(#car-body)"
      stroke="rgb(0 0 0 / 0.18)"
      stroke-width="1"
    />
    <!-- ligne d'épaule -->
    <path d="M44 92 L130 78 L352 80" fill="none" stroke="rgb(255 255 255 / 0.7)" stroke-width="1.4" />
    <path d="M58 118 L338 118" fill="none" stroke="rgb(0 0 0 / 0.12)" stroke-width="5" stroke-linecap="round" />
    <!-- vitrages -->
    <path d="M140 72 C158 56 178 47 201 46 L262 46 L266 73 Z" fill="url(#car-glass)" />
    <path d="M273 46 L283 46 C299 47 314 55 334 71 L276 73 Z" fill="url(#car-glass)" />
    <path v-if="windowsOpen" d="M146 72 C160 60 176 52 196 51 L258 51 L261 72 Z" fill="rgb(255 255 255 / 0.18)" />
    <path d="M202 46 L204 120 M268 46 L270 118" stroke="rgb(0 0 0 / 0.16)" stroke-width="1.2" fill="none" />
    <rect x="236" y="86" width="16" height="3.5" rx="1.75" fill="rgb(0 0 0 / 0.22)" />
    <rect x="300" y="86" width="16" height="3.5" rx="1.75" fill="rgb(0 0 0 / 0.22)" />
    <!-- rétroviseur -->
    <path
      :d="mirrorsFolded ? 'M134 74 L146 70 L150 76 L138 78 Z' : 'M128 74 C128 68 138 66 146 68 L148 76 L132 78 Z'"
      fill="url(#car-body)"
      stroke="rgb(0 0 0 / 0.25)"
      stroke-width="1"
      class="transition-all duration-500"
    />
    <!-- feux pixel -->
    <g fill="#ffffff" opacity="0.95">
      <rect x="30" y="90" width="5" height="3" rx="0.8" />
      <rect x="37" y="89" width="5" height="3" rx="0.8" />
      <rect x="44" y="88" width="5" height="3" rx="0.8" />
      <rect x="51" y="87" width="5" height="3" rx="0.8" />
    </g>
    <g fill="#e2302f">
      <rect x="352" y="80" width="5" height="3" rx="0.8" />
      <rect x="359" y="82" width="5" height="3" rx="0.8" />
      <rect x="352" y="85" width="5" height="3" rx="0.8" />
      <rect x="359" y="87" width="5" height="3" rx="0.8" />
    </g>
    <!-- trappe de recharge -->
    <rect x="318" y="84" width="16" height="12" rx="3" :fill="chargePortOpen ? '#1b2027' : 'none'" stroke="rgb(0 0 0 / 0.22)" stroke-width="1" />
    <circle v-if="chargePortOpen" cx="326" cy="90" r="3" fill="#34d27a" />
    <!-- roues -->
    <g v-for="cx in [95, 300]" :key="cx">
      <circle :cx="cx" cy="124" r="31" fill="#15181d" />
      <circle :cx="cx" cy="124" r="21" fill="url(#car-rim)" />
      <g :transform="`translate(${cx} 124)`" stroke="#5f6772" stroke-width="3" stroke-linecap="round">
        <path v-for="a in [0, 72, 144, 216, 288]" :key="a" :transform="`rotate(${a})`" d="M0 -5 L0 -19" />
      </g>
      <circle :cx="cx" cy="124" r="5" fill="#3a4049" />
    </g>
  </svg>
</template>
