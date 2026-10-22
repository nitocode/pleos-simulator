<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'
import { normalize } from '@/core/format'
import { useVehicleStore } from '@/core/vehicle/store'
import { useTeslaStore, type ControlsTab } from '../store/tesla'
import TSwitch from './ui/TSwitch.vue'
import TSegmented from './ui/TSegmented.vue'
import TSlider from './ui/TSlider.vue'

/**
 * Écran Contrôles (manuel, « Écran tactile ») : catégories à gauche, réglages à droite, recherche en haut.
 * Les réglages sont décrits en données : le même tableau alimente les onglets et la recherche.
 */
const vehicle = useVehicleStore()
const tesla = useTeslaStore()
const p = tesla.prefs

type Base = { tab: ControlsTab; label: string; hint?: string }
type Row =
  | (Base & { kind: 'switch'; get: () => boolean; set: (v: boolean) => void })
  | (Base & { kind: 'seg'; options: readonly string[]; get: () => string; set: (v: string) => void })
  | (Base & { kind: 'slider'; min: number; max: number; step?: number; unit?: string; get: () => number; set: (v: number) => void })
  | (Base & { kind: 'action'; button: string; run: () => void; disabled?: () => boolean })
  | (Base & { kind: 'info'; value: () => string })

const TABS: { id: ControlsTab; label: string; icon: IconName }[] = [
  { id: 'quick', label: 'Rapide', icon: 'sliders' },
  { id: 'dynamics', label: 'Dynamique', icon: 'steering' },
  { id: 'charge', label: 'Recharge', icon: 'bolt' },
  { id: 'lights', label: 'Éclairage', icon: 'lightbulb' },
  { id: 'display', label: 'Affichage', icon: 'monitor' },
  { id: 'safety', label: 'Sécurité', icon: 'shield-check' },
  { id: 'nav', label: 'Navigation', icon: 'navigation' },
  { id: 'service', label: 'Entretien', icon: 'settings' },
  { id: 'software', label: 'Logiciel', icon: 'download' },
]
const parked = computed(() => vehicle.gear === 'P' && !vehicle.moving)
const nightFlag = (v: boolean) => (tesla.forcedNight = v)

const ROWS: Row[] = [
  // Rapide
  { tab: 'quick', kind: 'switch', label: 'Verrouiller le véhicule', get: () => vehicle.body.locked, set: (v) => (vehicle.body.locked = v) },
  { tab: 'quick', kind: 'switch', label: 'Coffre avant', get: () => tesla.frunkOpen, set: (v) => (tesla.frunkOpen = v), hint: 'Disponible en P' },
  { tab: 'quick', kind: 'switch', label: 'Coffre arrière', get: () => vehicle.body.trunkOpen, set: (v) => (vehicle.body.trunkOpen = v), hint: 'Disponible en P' },
  { tab: 'quick', kind: 'switch', label: 'Ouvrir la trappe de recharge', get: () => vehicle.body.chargePortOpen, set: (v) => (vehicle.body.chargePortOpen = v) },
  { tab: 'quick', kind: 'switch', label: 'Rétroviseurs rabattus', get: () => vehicle.body.mirrorsFolded, set: (v) => (vehicle.body.mirrorsFolded = v) },
  { tab: 'quick', kind: 'switch', label: 'Mode Sentinelle', get: () => p.sentinel, set: (v) => (p.sentinel = v), hint: 'Surveille les alentours véhicule garé' },
  // Dynamique
  { tab: 'dynamics', kind: 'seg', label: 'Souplesse de direction', options: ['Légère', 'Standard', 'Lourde'], get: () => p.steeringFeel, set: (v) => (p.steeringFeel = v as typeof p.steeringFeel), hint: 'Légère facilite les manœuvres en ville ; Lourde donne plus de réactivité à vitesse élevée.' },
  { tab: 'dynamics', kind: 'seg', label: 'Modes d’accélération', options: ['Chill', 'Standard'], get: () => p.acceleration, set: (v) => (p.acceleration = v as typeof p.acceleration) },
  { tab: 'dynamics', kind: 'switch', label: 'Retenue en côte', get: () => vehicle.features.autoHold, set: (v) => vehicle.setFeature('autoHold', v) },
  { tab: 'dynamics', kind: 'info', label: 'Freinage régénératif', value: () => 'Standard' },
  // Recharge
  { tab: 'charge', kind: 'slider', label: 'Limite de charge', min: 50, max: 100, step: 5, unit: ' %', get: () => vehicle.charge.dcLimit, set: (v) => { vehicle.charge.dcLimit = v; vehicle.charge.acLimit = v }, hint: '90 % ou moins pour l’usage quotidien ; 100 % avant un long trajet.' },
  { tab: 'charge', kind: 'seg', label: 'Courant de recharge CA', options: ['Minimum', 'Réduit', 'Maximum'], get: () => vehicle.charge.acCurrent, set: (v) => (vehicle.charge.acCurrent = v as typeof vehicle.charge.acCurrent) },
  { tab: 'charge', kind: 'switch', label: 'Préchauffage de la batterie', get: () => vehicle.charge.preconditioning, set: (v) => (vehicle.charge.preconditioning = v), hint: 'Réchauffe la batterie en route vers un Superchargeur.' },
  { tab: 'charge', kind: 'switch', label: 'Recharge planifiée', get: () => vehicle.charge.scheduled, set: (v) => (vehicle.charge.scheduled = v), hint: 'Charge en heures creuses, prêt à l’heure de départ.' },
  { tab: 'charge', kind: 'action', label: 'Trappe de recharge', button: 'Ouvrir', run: () => { vehicle.body.chargePortOpen = true; tesla.notify('Trappe de recharge ouverte', 'charge-port') }, disabled: () => !parked.value },
  // Éclairage
  { tab: 'lights', kind: 'seg', label: 'Phares', options: ['Éteints', 'Position', 'Auto', 'Allumés'], get: () => p.headlights, set: (v) => (p.headlights = v as typeof p.headlights) },
  { tab: 'lights', kind: 'switch', label: 'Éclairage d’ambiance', get: () => p.ambient, set: (v) => (p.ambient = v) },
  { tab: 'lights', kind: 'switch', label: 'Feux de détresse', get: () => vehicle.hazard, set: (v) => { if (v !== vehicle.hazard) vehicle.toggleHazard() } },
  // Affichage
  { tab: 'display', kind: 'seg', label: 'Mode d’affichage', options: ['Auto', 'Jour', 'Nuit'], get: () => p.displayMode, set: (v) => { p.displayMode = v as typeof p.displayMode; nightFlag(false) } },
  { tab: 'display', kind: 'slider', label: 'Luminosité', min: 20, max: 100, step: 5, unit: ' %', get: () => p.brightness, set: (v) => (p.brightness = v) },
  { tab: 'display', kind: 'seg', label: 'Unité de température', options: ['°C', '°F'], get: () => p.tempUnit, set: (v) => (p.tempUnit = v as typeof p.tempUnit) },
  { tab: 'display', kind: 'seg', label: 'Unité de distance', options: ['km', 'mi'], get: () => p.distanceUnit, set: (v) => (p.distanceUnit = v as typeof p.distanceUnit) },
  { tab: 'display', kind: 'action', label: 'Mes applis', button: 'Réinitialiser', run: () => { tesla.myApps = ['media', 'phone', 'camera']; tesla.notify('Mes applis réinitialisées', 'refresh') } },
  // Sécurité
  { tab: 'safety', kind: 'switch', label: 'Mode Sentinelle', get: () => p.sentinel, set: (v) => (p.sentinel = v) },
  { tab: 'safety', kind: 'switch', label: 'Mode voiturier', get: () => p.valet, set: (v) => (p.valet = v), hint: 'Limite la vitesse et verrouille le coffre avant et la boîte à gants.' },
  { tab: 'safety', kind: 'switch', label: 'Autoriser l’accès mobile', get: () => p.mobileAccess, set: (v) => (p.mobileAccess = v) },
  { tab: 'safety', kind: 'switch', label: 'Rabattre les rétroviseurs au verrouillage', get: () => p.autoMirrorFold, set: (v) => (p.autoMirrorFold = v) },
  // Navigation
  { tab: 'nav', kind: 'switch', label: 'Éviter les péages', get: () => p.avoidTolls, set: (v) => (p.avoidTolls = v) },
  { tab: 'nav', kind: 'info', label: 'Volume des instructions', value: () => 'Réglé séparément du multimédia' },
  { tab: 'nav', kind: 'action', label: 'Itinéraire en cours', button: 'Annuler', run: () => { vehicle.cancelRoute(); tesla.notify('Itinéraire annulé', 'close') }, disabled: () => !vehicle.nav.destination },
  // Entretien
  { tab: 'service', kind: 'info', label: 'Pression des pneus', value: () => '2,9 bar · 2,9 bar · 2,9 bar · 2,9 bar' },
  { tab: 'service', kind: 'info', label: 'Compteur kilométrique', value: () => `${Math.round(vehicle.odometer)} km` },
  { tab: 'service', kind: 'action', label: 'Redémarrer l’écran tactile', button: 'Redémarrer', run: () => rebootScreen(), disabled: () => !parked.value, hint: 'À l’arrêt en P uniquement. Équivalent : appui long sur les deux boutons de défilement du volant.' },
  // Logiciel
  { tab: 'software', kind: 'info', label: 'Version du logiciel', value: () => '2026.32' },
  { tab: 'software', kind: 'switch', label: 'Mises à jour automatiques', get: () => p.autoUpdate, set: (v) => (p.autoUpdate = v) },
]

function rebootScreen() {
  tesla.closePanel()
  tesla.rebooting = true
  setTimeout(() => (tesla.rebooting = false), 4000)
}

const query = computed(() => normalize(tesla.search.trim()))
const rows = computed(() => (query.value ? ROWS.filter((r) => normalize(`${r.label} ${r.hint ?? ''} ${TABS.find((t) => t.id === r.tab)!.label}`).includes(query.value)) : ROWS.filter((r) => r.tab === tesla.controlsTab)))
const title = computed(() => (query.value ? 'Résultats' : TABS.find((t) => t.id === tesla.controlsTab)!.label))
const tabOf = (id: ControlsTab) => TABS.find((t) => t.id === id)!
</script>

<template>
  <section class="flex h-full w-[600px] overflow-hidden rounded-[26px] bg-surface shadow-pop" aria-label="Contrôles">
    <nav class="thin-scrollbar flex w-[172px] flex-none flex-col gap-0.5 overflow-auto border-r border-line p-2.5" aria-label="Catégories des contrôles">
      <button v-for="t in TABS" :key="t.id" type="button" class="press flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold transition-colors" :class="!query && tesla.controlsTab === t.id ? 'bg-accent-soft text-accent' : 'text-ink-2'" :aria-current="!query && tesla.controlsTab === t.id ? 'page' : undefined" @click="tesla.search = ''; tesla.controlsTab = t.id">
        <Icon :name="t.icon" size="19" />{{ t.label }}
      </button>
    </nav>
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-center gap-2 p-3">
        <label class="flex h-11 flex-1 items-center gap-2 rounded-full bg-surface-2 px-4 text-ink-2">
          <Icon name="search" size="18" />
          <input v-model="tesla.search" type="search" placeholder="Rechercher" aria-label="Rechercher un paramètre" class="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3" />
        </label>
        <button type="button" class="press grid size-11 place-items-center rounded-full text-ink-2" aria-label="Fermer les contrôles" @click="tesla.closePanel()"><Icon name="close" size="20" /></button>
      </div>
      <div class="thin-scrollbar min-h-0 flex-1 overflow-auto px-5 pb-5">
        <h2 class="mb-1 text-[20px] font-bold">{{ title }}</h2>
        <p v-if="!rows.length" class="py-6 text-ink-2">Aucun paramètre ne correspond à « {{ tesla.search }} ».</p>
        <div v-for="r in rows" :key="r.tab + r.label" class="flex items-center gap-4 border-b border-line py-3.5 last:border-0">
          <span class="min-w-0 flex-1">
            <b class="block text-[15.5px] font-semibold">{{ r.label }}</b>
            <small v-if="query" class="text-[12px] text-accent">{{ tabOf(r.tab).label }}</small>
            <small v-if="r.hint" class="block text-[12.5px] leading-snug text-ink-2">{{ r.hint }}</small>
          </span>
          <TSwitch v-if="r.kind === 'switch'" :model-value="r.get()" :label="r.label" @update:model-value="r.set($event)" />
          <TSegmented v-else-if="r.kind === 'seg'" :model-value="r.get()" :options="r.options" :label="r.label" @update:model-value="r.set($event)" />
          <span v-else-if="r.kind === 'slider'" class="flex w-[220px] items-center gap-3"><TSlider :model-value="r.get()" :min="r.min" :max="r.max" :step="r.step" :label="r.label" @update:model-value="r.set($event)" /><b class="tnum w-14 text-right text-[15px]">{{ r.get() }}{{ r.unit }}</b></span>
          <button v-else-if="r.kind === 'action'" type="button" class="press h-11 rounded-xl bg-surface-2 px-4 text-[14px] font-semibold disabled:opacity-40" :disabled="r.disabled?.()" @click="r.run()">{{ r.button }}</button>
          <span v-else class="max-w-[200px] text-right text-[14px] text-ink-2">{{ r.value() }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
