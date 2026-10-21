<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'

const SERVICES = ['Commandes à distance', 'Localisation du véhicule', 'Trafic en temps réel', 'Disponibilité des bornes', 'Météo', 'Diagnostic à distance']
</script>

<template>
  <div class="thin-scrollbar h-full overflow-auto p-5">
    <div v-for="s in SERVICES" :key="s" class="flex items-center justify-between border-b border-line py-3.5 last:border-0">
      <span><b class="block text-[15px]">{{ s }}</b><small class="text-ink-2">Service Bluelink actif</small></span>
      <Icon name="check-circle" size="22" class="text-ok" />
    </div>
  </div>
</template>
