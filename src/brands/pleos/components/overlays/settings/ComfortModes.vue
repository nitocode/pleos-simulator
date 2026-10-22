<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'
import { useVehicleStore } from '@/core/vehicle/store'
import { SETTINGS } from '../../../data/settings'
import { usePleosStore } from '../../../store/pleos'
import SettingItemRow from '../SettingItemRow.vue'
import PButton from '../../ui/PButton.vue'
import PSlider from '../../ui/PSlider.vue'

/**
 * Confort : « Schnellsteuerungen – Komfort » du manuel Pleos Connect-S. Standmodus (EV), Tiermodus, Autowäsche-Modus
 * et Parken in N s'activent depuis une carte avec ses conditions, une confirmation et un état ; le reste des
 * paramètres de la catégorie suit en dessous.
 */
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const f = vehicle.features
const category = SETTINGS.find((c) => c.id === 'comfort')!
const OWN = new Set(['f:washMode', 'f:utilityMode', 'f:petMode', 'f:parkInNeutral'])
const rest = (category.items ?? []).filter((i) => !('key' in i && OWN.has(i.key)))

const confirm = ref<null | 'utility' | 'pet' | 'wash'>(null)
const parked = computed(() => vehicle.gear === 'P' && !vehicle.moving)

const WASH_ITEMS: { label: string; icon: IconName; on: () => string }[] = [
  { label: 'Rétroviseurs rabattus', icon: 'mirror', on: () => 'Rabattus' },
  { label: 'Vitres fermées', icon: 'window-lock', on: () => 'Fermées' },
  { label: 'Essuie-glaces à l’arrêt', icon: 'defrost-front', on: () => 'Désactivés' },
  { label: 'Poignées de porte rentrées', icon: 'door', on: () => 'Rentrées' },
  { label: 'Ouverture du hayon extérieure désactivée', icon: 'tailgate', on: () => 'Désactivée' },
  { label: 'Recyclage de l’air', icon: 'recirc', on: () => 'Activé' },
]

const washBlock = computed(() => (vehicle.speed > 20 ? 'La vitesse dépasse 20 km/h' : ''))
const petBlock = computed(() => (!vehicle.ready ? 'Démarrez le véhicule' : !parked.value ? 'Passez en P à l’arrêt' : ''))
const utilityBlock = computed(() => (!parked.value ? 'Passez en P à l’arrêt' : ''))
const neutralBlock = computed(() => (vehicle.speed > 5 ? 'Arrêtez le véhicule' : ''))

function startUtility() {
  vehicle.setFeature('utilityMode', true)
  confirm.value = null
  pleos.notify('Standmodus activé', 'bolt')
}
function startPet() {
  vehicle.climate.on = true
  vehicle.climate.temp.L = f.petTemp
  vehicle.climate.temp.R = f.petTemp
  vehicle.media.playing = false
  vehicle.setFeature('petMode', true)
  confirm.value = null
  pleos.closePanel()
  pleos.notify('Verrouillez les portes de l’extérieur dans les 5 minutes', 'lock')
}
function startWash() {
  vehicle.body.mirrorsFolded = true
  vehicle.body.windowsOpen = false
  vehicle.climate.recirc = true
  vehicle.setFeature('washMode', true)
  confirm.value = null
  pleos.notify('Autowäsche-Modus activé', 'sparkle')
}
function stopWash() {
  vehicle.body.mirrorsFolded = false
  vehicle.climate.recirc = false
  vehicle.setFeature('washMode', false)
  pleos.notify('Mode lavage désactivé : rétroviseurs dépliés, air frais', 'check')
}
function stopNeutral() {
  vehicle.setGear('P')
  vehicle.setFeature('parkInNeutral', false)
  pleos.notify('Stationnement sur N terminé', 'check')
}
function shiftN() {
  if (vehicle.setGear('N')) pleos.notify('Frein de stationnement et AUTO HOLD relâchés', 'warning')
}
</script>

<template>
  <h2 class="mb-4 text-[21px] font-bold">Confort</h2>
  <div class="mb-3 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
    <!-- Standmodus (EV) -->
    <section class="flex flex-col gap-3 rounded-2xl bg-surface-2 p-4">
      <header class="flex items-center gap-3"><Icon name="bolt" size="24" class="text-accent" /><b class="flex-1 text-[16px]">Mode utilitaire</b><span class="rounded-full px-2.5 py-0.5 text-[12px] font-semibold" :class="f.utilityMode ? 'bg-ok/15 text-ok' : 'bg-surface-3 text-ink-2'">{{ f.utilityMode ? 'Actif' : 'Inactif' }}</span></header>
      <p class="text-[13.5px] text-ink-2">Alimente audio et éclairage intérieur pendant un temps limité, véhicule à l’arrêt. Il s’arrête si vous changez de rapport, appuyez sur le frein ou éteignez le véhicule.</p>
      <PButton v-if="!f.utilityMode" variant="primary" small :disabled="!!utilityBlock" @click="confirm = 'utility'">Activer</PButton>
      <PButton v-else small @click="vehicle.setFeature('utilityMode', false)">Actif · désactiver</PButton>
      <small v-if="utilityBlock && !f.utilityMode" class="text-crit">{{ utilityBlock }}</small>
    </section>

    <!-- Tiermodus -->
    <section class="flex flex-col gap-3 rounded-2xl bg-surface-2 p-4">
      <header class="flex items-center gap-3"><Icon name="thermometer" size="24" class="text-accent" /><b class="flex-1 text-[16px]">Mode animaux domestiques</b><span class="rounded-full px-2.5 py-0.5 text-[12px] font-semibold" :class="f.petMode ? 'bg-ok/15 text-ok' : 'bg-surface-3 text-ink-2'">{{ f.petMode ? 'Actif' : 'Inactif' }}</span></header>
      <p class="text-[13.5px] text-ink-2">Maintient la température de l’habitacle quand vous laissez brièvement votre animal. Disponible avec Bluelink actif, à l’arrêt en P.</p>
      <PSlider v-model="f.petTemp" :min="17" :max="27" :step="0.5" icon="thermometer" unit="°" />
      <PButton variant="primary" small :disabled="!!petBlock || f.petMode" @click="confirm = 'pet'">Activer</PButton>
      <small v-if="petBlock" class="text-crit">{{ petBlock }}</small>
    </section>

    <!-- Autowäsche-Modus -->
    <section class="flex flex-col gap-3 rounded-2xl bg-surface-2 p-4">
      <header class="flex items-center gap-3"><Icon name="sparkle" size="24" class="text-accent" /><b class="flex-1 text-[16px]">Mode lavage</b><span class="rounded-full px-2.5 py-0.5 text-[12px] font-semibold" :class="f.washMode ? 'bg-ok/15 text-ok' : 'bg-surface-3 text-ink-2'">{{ f.washMode ? 'Actif' : 'Inactif' }}</span></header>
      <p class="text-[13.5px] text-ink-2">Évite les infiltrations d’eau et protège les essuie-glaces. Indisponible au-delà de 20 km/h ou porte ouverte, et il se désactive dans ces cas.</p>
      <ul v-if="f.washMode" class="flex flex-col gap-1.5">
        <li v-for="w in WASH_ITEMS" :key="w.label" class="flex items-center gap-2.5 text-[13.5px]"><Icon :name="w.icon" size="18" class="text-ink-2" /><span class="flex-1">{{ w.label }}</span><span class="text-ok">{{ w.on() }}</span><Icon name="check-circle" size="18" class="text-ok" /></li>
      </ul>
      <PButton v-if="!f.washMode" variant="primary" small :disabled="!!washBlock" @click="confirm = 'wash'">Activer</PButton>
      <PButton v-else small @click="stopWash">Actif · désactiver</PButton>
      <small v-if="washBlock && !f.washMode" class="text-crit">{{ washBlock }}</small>
    </section>

    <!-- Parken in N -->
    <section class="flex flex-col gap-3 rounded-2xl bg-surface-2 p-4">
      <header class="flex items-center gap-3"><Icon name="gauge" size="24" class="text-accent" /><b class="flex-1 text-[16px]">Stationner sur N (point mort)</b><span class="rounded-full px-2.5 py-0.5 text-[12px] font-semibold" :class="f.parkInNeutral ? 'bg-ok/15 text-ok' : 'bg-surface-3 text-ink-2'">{{ f.parkInNeutral ? 'Actif' : 'Inactif' }}</span></header>
      <p class="text-[13.5px] text-ink-2">Pour pousser le véhicule, par exemple en cas de stationnement serré.</p>
      <template v-if="!f.parkInNeutral">
        <PButton variant="primary" small :disabled="!!neutralBlock" @click="vehicle.setFeature('parkInNeutral', true)">Activer</PButton>
        <small v-if="neutralBlock" class="text-crit">{{ neutralBlock }}</small>
      </template>
      <template v-else>
        <ol class="list-decimal pl-5 text-[13.5px] text-ink-2">
          <li :class="vehicle.gear === 'N' && 'text-ok'">Maintenez la pédale de frein et passez en N</li>
          <li :class="vehicle.gear === 'N' && 'text-ok'">Frein de stationnement et AUTO HOLD relâchés</li>
          <li>Relâchez la pédale de frein, puis « Terminer le stationnement »</li>
        </ol>
        <p class="flex items-start gap-2 text-[13px] text-crit"><Icon name="warning" size="18" class="mt-px flex-none" />Le véhicule peut bouger : sécurisez-le, surtout en pente.</p>
        <PButton v-if="vehicle.gear !== 'N'" small @click="shiftN">Passer en N</PButton>
        <PButton v-else variant="primary" small @click="stopNeutral">Terminer le stationnement</PButton>
      </template>
    </section>
  </div>

  <SettingItemRow v-for="(item, i) in rest" :key="i" :item="item" @action="() => {}" />

  <Transition name="fade">
    <div v-if="confirm" class="absolute inset-0 z-30 grid place-items-center bg-scrim p-6" @click.self="confirm = null">
      <div class="w-[min(460px,100%)] rounded-[24px] bg-surface p-6 shadow-pop" role="dialog" aria-modal="true">
        <template v-if="confirm === 'utility'">
          <h3 class="text-[19px] font-bold">Activer le mode utilitaire ?</h3>
          <p class="mt-2 text-ink-2">Avec un niveau de batterie bas, certaines fonctions peuvent être limitées ou le mode peut s’arrêter. Désactivez-le avant de rouler et vérifiez les alentours.</p>
        </template>
        <template v-else-if="confirm === 'pet'">
          <h3 class="text-[19px] font-bold">Activer le mode animaux ?</h3>
          <p class="mt-2 text-ink-2">La température sera maintenue à <b class="text-ink">{{ f.petTemp }}°</b>. Verrouillez le véhicule de l’extérieur dans les 5 minutes. Bluetooth et la projection seront déconnectés et le média coupé. N’y laissez pas d’enfant.</p>
        </template>
        <template v-else>
          <h3 class="text-[19px] font-bold">Activer le mode lavage ?</h3>
          <p class="mt-2 text-ink-2">Rétroviseurs rabattus, vitres fermées, essuie-glaces à l’arrêt, poignées rentrées, hayon extérieur désactivé, air recyclé.</p>
        </template>
        <div class="mt-5 flex justify-end gap-2">
          <PButton variant="ghost" @click="confirm = null">Annuler</PButton>
          <PButton variant="primary" @click="confirm === 'utility' ? startUtility() : confirm === 'pet' ? startPet() : startWash()">Activer</PButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
