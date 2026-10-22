<script setup lang="ts">
import { computed } from 'vue'

/**
 * Carte vectorielle générée (rues, parcs, eau), colorée par les jetons --map-* du thème.
 * Le mode 3D incline la carte en perspective ; « Nord » garde le nord en haut.
 */
const props = defineProps<{ progress: number | null; zoom: number; view: '2D' | '3D' | 'Nord' }>()

const ROUTE: [number, number][] = [
  [500, 560],
  [500, 300],
  [760, 300],
  [760, 120],
  [900, 60],
]

function routePoint(f: number): [number, number, number] {
  let total = 0
  const seg: number[] = []
  for (let i = 1; i < ROUTE.length; i++) {
    const l = Math.hypot(ROUTE[i]![0] - ROUTE[i - 1]![0], ROUTE[i]![1] - ROUTE[i - 1]![1])
    seg.push(l)
    total += l
  }
  let t = f * total
  for (let i = 0; i < seg.length; i++) {
    if (t <= seg[i]!) {
      const a = ROUTE[i]!
      const b = ROUTE[i + 1]!
      const k = t / seg[i]!
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI + 90]
    }
    t -= seg[i]!
  }
  const e = ROUTE[ROUTE.length - 1]!
  return [e[0], e[1], 0]
}

/** Géométrie statique, calculée une seule fois. */
const geo = (() => {
  let seed = 7
  const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  const blocks: string[] = []
  for (let i = 0; i < 40; i++) blocks.push(`M${Math.round(r() * 980)} ${Math.round(r() * 580)}h${22 + Math.round(r() * 40)}v${16 + Math.round(r() * 30)}h-${22 + Math.round(r() * 40)}z`)
  let minor = ''
  for (let y = 30; y < 620; y += 58 + r() * 30) minor += `M-20 ${y.toFixed(0)}L1020 ${(y + (r() - 0.5) * 60).toFixed(0)}`
  for (let x = 20; x < 1020; x += 70 + r() * 40) minor += `M${x.toFixed(0)} -20L${(x + (r() - 0.5) * 80).toFixed(0)} 620`
  return {
    blocks: blocks.join(''),
    minor,
    major: 'M-20 600L1020 40M500 -20L500 620M-20 300L1020 300',
    parks: [
      [80, 70, 160, 110],
      [620, 470, 180, 90],
      [760, 140, 140, 110],
      [280, 180, 120, 80],
    ],
  }
})()

const pos = computed(() => (props.progress === null ? ([500, 470, 0] as const) : routePoint(props.progress)))
const heading = computed(() => (props.view === 'Nord' || props.progress === null ? 0 : pos.value[2]))
const routePts = ROUTE.map((p) => p.join(',')).join(' ')
</script>

<template>
  <div class="map absolute inset-0 overflow-hidden">
    <div class="absolute inset-0 transition-transform duration-700 ease-ui" :style="{ transform: view === '3D' ? 'perspective(1100px) rotateX(48deg) scale(1.55) translateY(-6%)' : 'none', transformOrigin: '50% 70%' }">
      <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" class="h-full w-full">
        <g :transform="`translate(500 ${view === '3D' ? 400 : 330}) rotate(${-heading}) scale(${zoom}) translate(${-pos[0]} ${-pos[1]})`" class="map-move">
          <rect x="-600" y="-600" width="2200" height="1800" class="m-land" />
          <path d="M-50 410C200 360 380 470 560 420S900 330 1100 380" class="m-water" stroke-width="30" fill="none" />
          <path d="M640 -20C600 120 690 200 620 330" class="m-water" stroke-width="12" fill="none" />
          <rect v-for="(p, i) in geo.parks" :key="i" :x="p[0]" :y="p[1]" :width="p[2]" :height="p[3]" rx="28" class="m-park" />
          <path :d="geo.blocks" class="m-block" />
          <path :d="geo.minor" class="m-edge" stroke-width="10" fill="none" />
          <path :d="geo.minor" class="m-road" stroke-width="6.5" fill="none" />
          <path :d="geo.major" class="m-edge" stroke-width="18" fill="none" />
          <path :d="geo.major" class="m-major" stroke-width="13" fill="none" />
          <g class="m-label" font-size="13" font-weight="600">
            <text x="520" y="214">Bd Voltaire</text>
            <text x="250" y="292">Rue de la Roquette</text>
            <text x="790" y="96">Av. Parmentier</text>
          </g>
          <template v-if="progress !== null">
            <polyline :points="routePts" class="m-route-edge" stroke-width="17" fill="none" stroke-linejoin="round" stroke-linecap="round" />
            <polyline :points="routePts" class="m-route" stroke-width="11" fill="none" stroke-linejoin="round" stroke-linecap="round" />
            <g transform="translate(900 60)">
              <circle r="14" fill="#e8383d" stroke="#fff" stroke-width="4" />
            </g>
          </template>
          <g :transform="`translate(${pos[0]} ${pos[1]}) rotate(${progress === null ? 0 : pos[2]})`">
            <circle r="30" fill="#2f7bf6" opacity="0.14" />
            <circle r="18" fill="#fff" stroke="#2f7bf6" stroke-width="3" />
            <path d="M0 -10 L8 8 L0 4 L-8 8Z" fill="#2f7bf6" />
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.map {
  background: var(--map-land);
  transition: background-color 0.5s;
}
.map-move {
  transition: transform 1s linear;
}
.m-land { fill: var(--map-land); }
.m-water { stroke: var(--map-water); }
.m-park { fill: var(--map-park); }
.m-block { fill: var(--map-block); }
.m-edge { stroke: var(--map-road-edge); }
.m-road { stroke: var(--map-road); }
.m-major { stroke: var(--map-major); }
.m-route { stroke: var(--map-route); }
.m-route-edge { stroke: var(--map-route-edge); }
.m-label { fill: var(--ui-ink-2); paint-order: stroke; stroke: var(--map-land); stroke-width: 4px; }
.m-land, .m-park, .m-block, .m-water, .m-edge, .m-road, .m-major {
  transition: fill 0.5s, stroke 0.5s;
}
</style>
