<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'

defineProps<{ id: 'aa' | 'cp' }>()
const vehicle = useVehicleStore()
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-ink-2">
    <Icon name="smartphone" size="44" />
    <b class="text-[19px] text-ink">{{ vehicle.features.projection ? 'Connectez votre téléphone' : 'Projection sans fil désactivée' }}</b>
    <p class="max-w-[36ch]">
      {{ vehicle.features.projection ? (id === 'aa' ? 'Ouvrez Android Auto sur votre téléphone associé en Bluetooth.' : 'Activez CarPlay sur votre iPhone associé en Bluetooth.') : 'Activez-la dans Paramètres › Connexions.' }}
    </p>
    <button v-if="!vehicle.features.projection" type="button" class="press mt-2 h-11 rounded-xl bg-accent px-5 font-semibold text-on-accent" @click="vehicle.setFeature('projection', true)">Activer</button>
  </div>
</template>
