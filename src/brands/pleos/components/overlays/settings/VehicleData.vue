<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { usePleosStore } from '../../../store/pleos'
import PButton from '../../ui/PButton.vue'

/** Données du véhicule : diagnostic, pneus et mise à jour du logiciel. */
const pleos = usePleosStore()
</script>

<template>
  <h2 class="mb-2 text-[21px] font-bold">Données du véhicule</h2>
  <p class="mt-4 mb-1 text-[12.5px] font-bold tracking-[0.08em] text-ink-2 uppercase">Gestion du véhicule</p>
  <div class="flex items-center justify-between border-b border-line py-3.5">
    <span><b class="block text-[15.5px] font-semibold">Diagnostic du véhicule</b><small class="text-[13px] text-ink-2">Diagnostic à distance via Bluelink</small></span>
    <PButton small @click="pleos.notify('Diagnostic à distance : aucun problème détecté', 'check-circle')">Lancer</PButton>
  </div>
  <div class="flex items-center justify-between border-b border-line py-3.5">
    <span><b class="block text-[15.5px] font-semibold">Informations sur les pneus</b><small class="text-[13px] text-ink-2">AV 2,5 bar · AR 2,4 bar</small></span>
    <Icon name="check-circle" size="24" class="text-ok" />
  </div>
  <p class="mt-6 mb-1 text-[12.5px] font-bold tracking-[0.08em] text-ink-2 uppercase">Mise à jour du logiciel</p>
  <div class="flex items-center justify-between border-b border-line py-3.5">
    <span>
      <b class="block text-[15.5px] font-semibold">Pleos Connect 1.3.0</b>
      <small class="text-[13px] text-ink-2">{{ pleos.update.installed ? 'Installée' : 'Téléchargement terminé · installation à l’arrêt' }}</small>
    </span>
    <PButton small variant="primary" :disabled="pleos.update.installed" @click="pleos.installUpdate()">Installer</PButton>
  </div>
  <div class="flex items-center justify-between border-b border-line py-3.5">
    <b class="text-[15.5px] font-semibold">Version actuelle</b>
    <span class="text-[14px] text-ink-2">{{ pleos.update.installed ? 'Pleos Connect 1.3.0' : 'Pleos Connect 1.2.4' }} · AAOS 14</span>
  </div>
  <div class="flex items-center justify-between py-3.5">
    <b class="text-[15.5px] font-semibold">Stockage</b>
    <span class="text-[14px] text-ink-2">18,2 Go utilisés sur 64 Go</span>
  </div>
</template>
