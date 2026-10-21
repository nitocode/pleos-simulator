<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import type { IconName } from '@/core/ui/icons'
import { distance, normalize } from '@/core/format'
import { PLACES } from '@/core/vehicle/data'
import { useVehicleStore } from '@/core/vehicle/store'
import { BUILTIN_APPS, type BuiltinAppId } from '../../catalog'
import { SETTINGS } from '../../data/settings'
import { searchManual } from '../../data/search'
import { openManual } from '../../gleo/useGleo'
import { usePleosStore } from '../../store/pleos'
import AppIcon from '../ui/AppIcon.vue'
import PSwitch from '../ui/PSwitch.vue'
import PButton from '../ui/PButton.vue'

/** Menus de la barre d'état : notifications, profil, Bluetooth, volume, recherche globale, mise à jour. */
const vehicle = useVehicleStore()
const pleos = usePleosStore()

const query = ref('')
const input = ref<HTMLInputElement | null>(null)
watch(
  () => pleos.panel,
  (p) => {
    if (p === 'search') {
      query.value = ''
      nextTick(() => input.value?.focus())
    }
  },
)

type Result = { key: string; title: string; sub: string; icon?: IconName; app?: BuiltinAppId; run: () => void }
const results = computed<Result[]>(() => {
  const n = normalize(query.value.trim())
  if (!n) return []
  const out: Result[] = []
  for (const id of Object.keys(BUILTIN_APPS) as BuiltinAppId[])
    if (normalize(BUILTIN_APPS[id].name).includes(n)) out.push({ key: `a-${id}`, title: BUILTIN_APPS[id].name, sub: 'App', app: id, run: () => pleos.launch(id) })
  for (const c of SETTINGS) {
    if (normalize(c.label).includes(n)) out.push({ key: `c-${c.id}`, title: c.label, sub: 'Paramètres du véhicule', icon: c.icon, run: () => pleos.openSettings(c.id) })
    for (const it of [...(c.items ?? []), ...(c.tiles ?? []).map((t) => ({ ...t, type: 'tile' as const }))])
      if ('label' in it && it.type !== 'header' && normalize(it.label).includes(n))
        out.push({ key: `s-${c.id}-${it.label}`, title: it.label, sub: `Paramètres › ${c.label}`, icon: 'sliders', run: () => pleos.openSettings(c.id) })
  }
  for (const p of PLACES)
    if (normalize(`${p.name} ${p.address}`).includes(n))
      out.push({ key: `p-${p.id}`, title: p.name, sub: `Destination · ${distance(p.km)}`, icon: 'pin', run: () => (vehicle.navigateTo(p), pleos.launch('nav')) })
  for (const r of searchManual(query.value).slice(0, 3)) out.push({ key: `m-${r.entry.id}`, title: r.entry.title, sub: 'Manuel', icon: 'book', run: () => openManual(r.entry.id) })
  return out.slice(0, 24)
})
const SUGGEST = ['charge', 'adas', 'display'] as const

function run(r: Result) {
  pleos.panel = null
  r.run()
}
const PROFILES = ['Profil 1', 'Profil 2', 'Invité']
</script>

<template>
  <div class="absolute top-[60px] right-3 z-30 w-[420px] origin-top-right rounded-[22px] border border-line bg-surface p-4 shadow-pop" :class="pleos.panel === 'search' && '!right-auto left-[calc(var(--drive-w)+24px)] w-[560px] origin-top-left'" role="dialog">
    <!-- notifications -->
    <template v-if="pleos.panel === 'notifications'">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-[17px] font-bold">Notifications</h3>
        <PButton small @click="pleos.notifications = pleos.notifications.filter((n) => n.system)">Tout supprimer</PButton>
      </div>
      <TransitionGroup name="pop" tag="div" class="flex flex-col gap-1">
        <div v-for="n in pleos.notifications" :key="n.id" class="flex items-start gap-3 rounded-2xl p-3 hover:bg-surface-2">
          <span class="grid size-10 flex-none place-items-center rounded-xl bg-surface-2"><Icon :name="n.icon" size="20" /></span>
          <span class="min-w-0 flex-1"><b class="block text-[15px]">{{ n.title }}</b><small class="text-[13px] leading-snug text-ink-2">{{ n.body }}</small></span>
          <button v-if="!n.system" type="button" class="press grid size-9 place-items-center rounded-full text-ink-2" aria-label="Supprimer" @click="pleos.notifications = pleos.notifications.filter((x) => x.id !== n.id)"><Icon name="close" size="18" /></button>
        </div>
      </TransitionGroup>
      <p v-if="!pleos.notifications.length" class="p-3 text-ink-2">Aucune notification.</p>
    </template>

    <!-- profil -->
    <template v-else-if="pleos.panel === 'profile'">
      <h3 class="mb-2 text-[17px] font-bold">Sélection du profil</h3>
      <button v-for="p in PROFILES" :key="p" type="button" class="press flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors" :class="pleos.prefs.profile === p ? 'bg-accent-soft' : 'hover:bg-surface-2'" @click="pleos.prefs.profile = p; pleos.panel = null; pleos.notify(`Profil : ${p}`, 'user')">
        <span class="grid size-10 place-items-center rounded-full font-bold" :class="p === 'Invité' ? 'bg-surface-3 text-ink-2' : 'bg-gradient-to-br from-[#4f8df7] to-[#2563eb] text-white'">
          <Icon v-if="p === 'Invité'" name="user" size="20" /><template v-else>{{ p.slice(-1) }}</template>
        </span>
        <span class="flex-1"><b class="block">{{ p }}</b><small class="text-ink-2">{{ p === 'Invité' ? 'Réglages par défaut' : 'Pleos ID connecté' }}</small></span>
        <Icon v-if="pleos.prefs.profile === p" name="check" size="20" class="text-accent" />
      </button>
      <PButton class="mt-2 w-full" @click="pleos.openSettings('profile')">Gestion des profils</PButton>
    </template>

    <!-- bluetooth -->
    <template v-else-if="pleos.panel === 'bluetooth'">
      <div class="flex items-center justify-between pb-3">
        <span><b class="block text-[17px]">Bluetooth</b><small class="text-ink-2">{{ vehicle.features.bluetooth ? 'Pixel 9 connecté' : 'Désactivé' }}</small></span>
        <PSwitch v-model="vehicle.features.bluetooth" label="Bluetooth" />
      </div>
      <Transition name="fade">
        <div v-if="vehicle.features.bluetooth" class="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
          <Icon name="smartphone" size="22" /><span class="flex-1"><b class="block">Pixel 9</b><small class="text-ink-2">Appels · Audio · Messages</small></span>
        </div>
      </Transition>
      <PButton class="mt-3 w-full" @click="pleos.openSettings('connections')">Paramètres de Connexions</PButton>
    </template>

    <!-- volume -->
    <template v-else-if="pleos.panel === 'volume'">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-[17px] font-bold">Volume</h3>
        <PButton small :icon="vehicle.media.muted ? 'volume' : 'volume-mute'" @click="vehicle.toggleMute()">{{ vehicle.media.muted ? 'Rétablir' : 'Couper' }}</PButton>
      </div>
      <label v-for="v in ([['media', 'Média', 'music'], ['nav', 'Navigation', 'navigation'], ['call', 'Appel', 'phone'], ['gleo', 'Gleo AI', 'gleo']] as const)" :key="v[0]" class="flex items-center gap-3 py-2">
        <Icon :name="v[2]" size="20" class="text-ink-2" :stroke="v[2] === 'gleo' ? 2.6 : 1.8" />
        <span class="w-24 text-[14px] font-semibold">{{ v[1] }}</span>
        <input
          :id="`vol-${v[0]}`"
          type="range"
          min="0"
          max="40"
          class="h-2 flex-1 cursor-pointer accent-[var(--ui-accent)]"
          :value="v[0] === 'media' ? vehicle.media.volume : pleos.volumes[v[0]]"
          @input="(e) => (v[0] === 'media' ? vehicle.setVolume(+(e.target as HTMLInputElement).value) : (pleos.volumes[v[0]] = +(e.target as HTMLInputElement).value))"
        />
        <b class="tnum w-7 text-right">{{ v[0] === 'media' ? vehicle.media.volume : pleos.volumes[v[0]] }}</b>
      </label>
    </template>

    <!-- recherche globale -->
    <template v-else-if="pleos.panel === 'search'">
      <label class="flex h-[52px] items-center gap-3 rounded-2xl bg-surface-2 px-4 text-ink-2">
        <Icon name="search" size="20" />
        <input id="global-search" ref="input" v-model="query" class="h-full flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-3" placeholder="Apps, paramètres, destinations, manuel…" autocomplete="off" />
      </label>
      <div class="thin-scrollbar mt-2 max-h-[440px] overflow-auto">
        <template v-if="!query">
          <p class="px-3 pt-2 pb-1 text-[12px] font-bold tracking-wider text-ink-2 uppercase">Suggestions</p>
          <button v-for="id in SUGGEST" :key="id" type="button" class="press flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-surface-2" @click="pleos.openSettings(id)">
            <span class="grid size-10 place-items-center rounded-xl bg-surface-2"><Icon :name="SETTINGS.find((s) => s.id === id)!.icon" size="20" /></span>
            <span><b class="block">{{ SETTINGS.find((s) => s.id === id)!.label }}</b><small class="text-ink-2">Paramètres du véhicule</small></span>
          </button>
        </template>
        <button v-for="r in results" :key="r.key" type="button" class="press flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-surface-2" @click="run(r)">
          <AppIcon v-if="r.app" :id="r.app" :size="40" />
          <span v-else class="grid size-10 place-items-center rounded-xl bg-surface-2"><Icon :name="r.icon ?? 'search'" size="20" /></span>
          <span class="min-w-0 flex-1"><b class="block truncate">{{ r.title }}</b><small class="text-ink-2">{{ r.sub }}</small></span>
        </button>
        <p v-if="query && !results.length" class="p-3 text-ink-2">Aucun résultat pour « {{ query }} ».</p>
      </div>
    </template>

    <!-- mise à jour -->
    <template v-else-if="pleos.panel === 'update'">
      <h3 class="text-[17px] font-bold">Mise à jour du logiciel</h3>
      <p class="mt-1 mb-3 text-[14px] leading-snug text-ink-2">Pleos Connect 1.3.0 est téléchargé. L’installation se fait à l’arrêt ; le véhicule ne peut pas être utilisé pendant ce temps.</p>
      <PButton variant="primary" class="w-full" @click="pleos.openSettings('data')">Ouvrir Données du véhicule</PButton>
    </template>
  </div>
</template>
