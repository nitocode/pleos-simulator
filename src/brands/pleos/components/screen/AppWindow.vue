<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/core/ui/Icon.vue'
import { appMeta, type AppId } from '../../catalog'
import { resolveApp } from '../../apps/registry'
import { usePleosStore } from '../../store/pleos'
import AppIcon from '../ui/AppIcon.vue'

/** Fenêtre d'app : en-tête (icône, nom, bouton de fenêtre, fermeture) et contenu. La navigation n'a pas d'en-tête. */
const props = defineProps<{ id: AppId; index: number }>()
const pleos = usePleosStore()
const app = computed(() => resolveApp(props.id))
const meta = computed(() => appMeta(props.id))
const split = computed(() => pleos.layout === 'split')
</script>

<template>
  <section class="relative flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] bg-surface shadow-card transition-colors duration-500 night:rounded-[14px] night:shadow-none" :aria-label="meta.name">
    <header v-if="app.chrome" class="flex h-[60px] flex-none items-center gap-3 pr-2 pl-4">
      <AppIcon :id="id" :size="32" />
      <h2 class="min-w-0 flex-1 truncate text-[18px] font-bold">{{ meta.name }}</h2>
      <button type="button" class="press grid size-11 place-items-center rounded-xl text-ink-2" :title="split ? 'Afficher en plein écran' : 'Afficher en écran partagé'" @click="pleos.resize(id)">
        <Icon :name="split ? 'window' : 'split'" size="22" />
      </button>
      <button type="button" class="press grid size-11 place-items-center rounded-xl text-ink-2" title="Fermer (glisser trois doigts vers le bas)" @click="pleos.close(id)">
        <Icon name="chevron-down" size="24" />
      </button>
    </header>
    <div class="@container relative min-h-0 flex-1">
      <component :is="app.component" v-bind="app.props" />
      <button
        v-if="!app.chrome"
        type="button"
        class="press absolute top-[136px] right-3 grid size-12 place-items-center rounded-2xl bg-surface shadow-card"
        :title="split ? 'Afficher en plein écran' : 'Afficher en écran partagé'"
        @click="pleos.resize(id)"
      >
        <Icon :name="split ? 'window' : 'split'" size="22" />
      </button>
    </div>
  </section>
</template>
