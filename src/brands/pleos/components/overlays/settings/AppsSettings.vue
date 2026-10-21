<script setup lang="ts">
import { computed } from 'vue'
import { appMeta, BUILTIN_APPS, type AppId, type BuiltinAppId } from '../../../catalog'
import { usePleosStore } from '../../../store/pleos'
import AppIcon from '../../ui/AppIcon.vue'
import PButton from '../../ui/PButton.vue'

/** Paramètres des Applications : liste et arrêt forcé. */
const pleos = usePleosStore()
const ids = computed<AppId[]>(() => [...(Object.keys(BUILTIN_APPS) as BuiltinAppId[]).filter((k) => k !== 'climate'), ...pleos.installed])
function stop(id: AppId) {
  pleos.windows = { ...pleos.windows, stack: pleos.windows.stack.filter((x) => x !== id || x === 'nav') }
  pleos.notify(`${appMeta(id).name} : arrêt forcé`, 'power')
}
</script>

<template>
  <h2 class="mb-4 text-[21px] font-bold">Applications</h2>
  <div v-for="id in ids" :key="id" class="flex items-center gap-3 border-b border-line py-3 last:border-0">
    <AppIcon :id="id" :size="36" />
    <b class="min-w-0 flex-1 truncate text-[15.5px] font-semibold">{{ appMeta(id).name }}</b>
    <PButton small :disabled="id === 'nav'" @click="stop(id)">Forcer l’arrêt</PButton>
  </div>
</template>
