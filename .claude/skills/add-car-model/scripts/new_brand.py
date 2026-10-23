"""Crée le squelette d'une nouvelle interface de marque dans src/brands/<id>/.

Usage (depuis la racine du dépôt) :
  python .claude/skills/add-car-model/scripts/new_brand.py vw-id3 "Volkswagen" "ID. Software" "ID.3"

Fichiers créés (jamais écrasés) : index.ts, theme.css, <Nom>Cockpit.vue, components/<Nom>Screen.vue.
Les valeurs à compléter sont marquées TODO. Pense ensuite à ajouter la marque à BRANDS (src/brands/index.ts).
"""
import pathlib
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

if len(sys.argv) != 5:
    raise SystemExit(__doc__)

brand_id, maker, system, model = sys.argv[1:]
if not re.fullmatch(r'[a-z0-9-]+', brand_id):
    raise SystemExit('Identifiant attendu en minuscules, chiffres et tirets (ex. vw-id3).')

pascal = ''.join(p.capitalize() for p in brand_id.split('-'))
camel = pascal[0].lower() + pascal[1:]
root = pathlib.Path('src/brands') / brand_id
(root / 'components').mkdir(parents=True, exist_ok=True)

files = {
    root / 'index.ts': f"""import type {{ BrandDefinition }} from '@/core/brands'
import type {{ VehicleSpec }} from '@/core/vehicle/simulation'

/** TODO : version de référence et sources (voir docs/models/{brand_id}.md). */
export const {camel.upper().replace('-', '_')}_SPEC: VehicleSpec = {{
  batteryKwh: 60, // TODO capacité nette
  kmPerPercent: 4.5, // TODO autonomie WLTP / 100
  dcCurve: [[0, 80], [10, 120], [50, 100], [80, 60], [100, 8]], // TODO calibrer (calibrate_curve.py)
  acKw: 11,
}}

export const {camel}: BrandDefinition = {{
  id: '{brand_id}',
  maker: '{maker}',
  system: '{system}',
  model: '{model}',
  summary: 'Simulateur web non officiel · TODO source principale',
  tagline: 'TODO accroche de la page d’accueil.',
  year: 'TODO',
  screenLabel: 'TODO taille de l’écran',
  accent: '#3b82f6',
  vehicle: {camel.upper().replace('-', '_')}_SPEC,
  driverDisplay: false,
  sizes: [{{ id: 'main', label: 'TODO', width: 1280, height: 720 }}],
  defaultSize: 'main',
  cockpit: () => import('./{pascal}Cockpit.vue'),
}}
""",
    root / 'theme.css': f"""/* {maker} {model} : valeurs des jetons --ui-* (voir src/styles/main.css). TODO couleurs relevées sur les captures. */
.{brand_id} {{
  --ui-bg: #f2f3f5; --ui-drive: #ffffff; --ui-surface: #ffffff; --ui-surface-2: #eef0f3; --ui-surface-3: #e0e3e8;
  --ui-line: #e2e5ea; --ui-ink: #121418; --ui-ink-2: #5c636e; --ui-ink-3: #9aa0aa;
  --ui-accent: #3b82f6; --ui-accent-soft: #e2edff; --ui-on-accent: #ffffff;
  --ui-ok: #16b157; --ui-warn: #e58a00; --ui-crit: #e8383d; --ui-cool: #2f73ef; --ui-heat: #ec4436;
  --ui-heat-soft: #fde6e1; --ui-cool-soft: #e0eefd; --ui-scrim: rgb(20 26 36 / 0.22);
  --ui-shadow: 0 4px 14px rgb(15 23 42 / 0.08); --ui-shadow-pop: 0 18px 50px rgb(15 23 42 / 0.18);
  --map-land: #eef0f2; --map-block: #e2e5e9; --map-park: #d4ecd9; --map-water: #9fcdf0; --map-road: #ffffff;
  --map-road-edge: #d5dbe2; --map-major: #fde8a8; --map-route: #22a94b; --map-route-edge: #ffffff;
  font-family: var(--font-sans);
  color: var(--ui-ink);
}}
.{brand_id}.night {{
  --ui-bg: #0b0c0e; --ui-drive: #101114; --ui-surface: #1b1d21; --ui-surface-2: #25272c; --ui-surface-3: #32353b;
  --ui-line: #2a2d33; --ui-ink: #f4f5f6; --ui-ink-2: #aeb2b9; --ui-ink-3: #70747c;
  --map-land: #1c2026; --map-block: #232830; --map-park: #1c2b24; --map-water: #18344d; --map-road: #353b45;
  --map-road-edge: #15181d; --map-major: #48505e; --map-route: #5b8cff; --map-route-edge: #0c1018;
}}
""",
    root / f'{pascal}Cockpit.vue': f"""<script setup lang="ts">
import {{ onScopeDispose }} from 'vue'
import BenchShell from '@/core/bench/BenchShell.vue'
import ScaledScreen from '@/core/ui/ScaledScreen.vue'
import {{ useBenchStore }} from '@/core/bench/useBench'
import {{ useSimulationClock }} from '@/core/composables/useSimulationClock'
import {{ useVehicleStore }} from '@/core/vehicle/store'
import {{ BRANDS }} from '@/brands'
import {{ {camel} as brand }} from './index'
import {pascal}Screen from './components/{pascal}Screen.vue'
import './theme.css'

const vehicle = useVehicleStore()
const bench = useBenchStore()
vehicle.setSpec(brand.vehicle)
useSimulationClock()
// TODO : afficher les événements du véhicule (arrived, charge-complete, gear-refused, power-refused, power).
const off = vehicle.onEvent(() => {{}})
onScopeDispose(() => off())
if (!bench.size) bench.size = brand.defaultSize
</script>

<template>
  <BenchShell :brand="brand" :brands="BRANDS">
    <template #driver><span /></template>
    <template #central="{{ size }}">
      <ScaledScreen :width="size.width" :height="size.height">
        <{pascal}Screen :width="size.width" :height="size.height" />
      </ScaledScreen>
    </template>
    <template #hardware><span /></template>
    <template #note>Reconstruction non officielle, sans lien avec {maker}. TODO sources.</template>
  </BenchShell>
</template>
""",
    root / 'components' / f'{pascal}Screen.vue': f"""<script setup lang="ts">
import {{ useVehicleStore }} from '@/core/vehicle/store'

/** Écran central {maker} {model}. TODO : disposition d'après les captures (docs/models/{brand_id}.md). */
defineProps<{{ width: number; height: number }}>()
const vehicle = useVehicleStore()
</script>

<template>
  <div class="{brand_id} relative overflow-hidden rounded-[18px] bg-bg" :style="{{ width: `${{width}}px`, height: `${{height}}px` }}">
    <p class="p-6 text-[20px]">{model} · {{{{ Math.round(vehicle.battery) }}}} %</p>
  </div>
</template>
""",
}

for path, content in files.items():
    if path.exists():
        print(f'existe déjà, ignoré : {path}')
        continue
    path.write_text(content, encoding='utf-8')
    print(f'créé : {path}')

print(f"\nÀ faire : importer {{ {camel} }} depuis './{brand_id}' et l'ajouter à BRANDS dans src/brands/index.ts.")
