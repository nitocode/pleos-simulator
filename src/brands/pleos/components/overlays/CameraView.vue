<script lang="ts">
import { reactive, ref } from 'vue'
const view = ref<'rear' | 'front' | '3d' | 'side'>('rear')
const options = reactive({ distance: true, lines: true, midline: false, ghost: true })
const showSettings = ref(false)
</script>

<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { useVehicleStore } from '@/core/vehicle/store'
import { usePleosStore } from '../../store/pleos'
import PSwitch from '../ui/PSwitch.vue'

/** Vue de la caméra en 3:0 (par-dessus la vue de conduite), comme le prévoit la politique de fenêtres. */
const vehicle = useVehicleStore()
const pleos = usePleosStore()
const VIEWS = [
  ['rear', 'Arrière + dessus', 'chevron-down'],
  ['front', 'Face + dessus', 'chevron-up'],
  ['3d', 'Vue 3D', 'cube'],
  ['side', 'Profil', 'columns'],
] as const
const OPTS = [
  ['distance', 'Afficher les alertes de distance lors du stationnement'],
  ['lines', 'Afficher les lignes de guidage pour le stationnement'],
  ['midline', 'Afficher la ligne médiane sur l’écran de la marche arrière'],
  ['ghost', 'Utiliser une image translucide du véhicule'],
] as const
</script>

<template>
  <div class="absolute inset-0 z-30 flex overflow-hidden rounded-[20px] bg-black text-white">
    <div class="relative grid min-w-0 flex-1 gap-0.5" :class="view === '3d' ? 'grid-cols-1' : 'grid-cols-[1fr_1.45fr]'">
      <!-- vue de dessus -->
      <svg v-if="view === 'rear' || view === 'front'" viewBox="0 0 300 420" preserveAspectRatio="xMidYMid meet" class="h-full w-full bg-[#2a2d31]">
        <g stroke="#e6e6e6" stroke-width="4" opacity="0.6"><path d="M40 0V420M260 0V420" /></g>
        <rect x="30" y="300" width="70" height="80" fill="#4b5058" opacity="0.6" />
        <g transform="translate(150 210)" :opacity="options.ghost ? 0.78 : 1">
          <rect x="-46" y="-92" width="92" height="184" rx="28" fill="#e9eef5" />
          <rect x="-37" y="-56" width="74" height="34" rx="8" fill="#26303d" />
          <rect x="-34" y="48" width="68" height="22" rx="7" fill="#26303d" />
        </g>
        <g v-if="options.distance" fill="none" stroke-width="5" stroke-linecap="round">
          <path :d="view === 'rear' ? 'M98 322q52 18 104 0' : 'M98 98q52-18 104 0'" stroke="#ffcc33" />
          <path :d="view === 'rear' ? 'M88 350q62 22 124 0' : 'M88 70q62-22 124 0'" stroke="#38d39f" />
        </g>
      </svg>
      <!-- vue en perspective -->
      <svg v-if="view !== 'side'" viewBox="0 0 520 320" preserveAspectRatio="xMidYMid slice" class="h-full w-full">
        <defs>
          <linearGradient id="cam-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4b5e" /><stop offset=".45" stop-color="#596a7c" /><stop offset=".46" stop-color="#3c3f44" /><stop offset="1" stop-color="#26282c" /></linearGradient>
        </defs>
        <rect width="520" height="320" fill="url(#cam-sky)" />
        <path d="M70 320 L235 150 L285 150 L450 320Z" fill="#303338" />
        <template v-if="view === '3d'">
          <ellipse cx="260" cy="236" rx="230" ry="62" fill="#3a3e45" />
          <g transform="translate(260 205)">
            <path d="M-120 20L-90-30Q-60-55 0-58Q70-55 100-28L125 20Q120 40 100 42L-100 42Q-122 40-120 20Z" fill="#e9eef5" />
            <path d="M-70-28Q-40-48 20-48Q60-46 80-26Z" fill="#26303d" />
            <circle cx="-70" cy="42" r="20" fill="#111" /><circle cx="72" cy="42" r="20" fill="#111" />
          </g>
        </template>
        <g v-else-if="options.lines && !(options.midline && view === 'rear')" fill="none" stroke-width="4">
          <path d="M160 320L222 180M360 320L298 180" stroke="#ffcc33" />
          <path d="M180 275H340" stroke="#38d39f" /><path d="M205 220H315" stroke="#ffcc33" /><path d="M215 192H305" stroke="#e8383d" />
        </g>
        <path v-if="options.midline && view === 'rear'" d="M260 320V170" stroke="#fff" stroke-width="3" stroke-dasharray="10 8" />
      </svg>
      <template v-if="view === 'side'">
        <svg v-for="side in ['gauche', 'droite']" :key="side" viewBox="0 0 520 320" preserveAspectRatio="xMidYMid slice" class="h-full w-full bg-[#3c3f44]">
          <rect width="520" height="140" fill="#596a7c" />
          <path :d="side === 'gauche' ? 'M0 320L520 170' : 'M520 320L0 170'" stroke="#ddd" stroke-width="4" stroke-dasharray="16 12" />
        </svg>
      </template>
      <span class="absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-[14px] font-semibold backdrop-blur">{{ { rear: 'Vue arrière', front: 'Vue de face', '3d': 'Vue 3D', side: 'Vues de profil' }[view] }}</span>
      <Transition name="drop">
        <div v-if="showSettings" class="absolute top-4 right-4 w-[440px] rounded-[22px] bg-surface p-4 text-ink shadow-pop">
          <h3 class="mb-1 text-[17px] font-bold">Paramètres de la caméra</h3>
          <div v-for="o in OPTS" :key="o[0]" class="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
            <span class="text-[14.5px] font-semibold">{{ o[1] }}</span>
            <PSwitch v-model="options[o[0]]" :label="o[1]" />
          </div>
        </div>
      </Transition>
    </div>
    <div class="flex w-[104px] flex-none flex-col gap-1.5 bg-[#101318] p-2">
      <button v-for="v in VIEWS" :key="v[0]" type="button" class="press flex min-h-[70px] flex-col items-center justify-center gap-1.5 rounded-2xl px-1 text-center text-[11.5px] font-semibold transition-colors" :class="view === v[0] ? 'bg-[#2f7bf6]' : 'text-[#cfd6df] hover:bg-white/5'" @click="view = v[0]">
        <Icon :name="v[2] === 'columns' ? 'split' : v[2]" size="24" />{{ v[1] }}
      </button>
      <span class="flex-1" />
      <button type="button" class="press flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl text-[11.5px] font-semibold text-[#cfd6df]" :class="showSettings && 'bg-white/10'" @click="showSettings = !showSettings"><Icon name="settings" size="22" />Réglages</button>
      <button v-if="vehicle.gear !== 'R'" type="button" class="press flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl text-[11.5px] font-semibold text-[#cfd6df]" @click="pleos.closeCamera()"><Icon name="close" size="22" />Fermer</button>
    </div>
  </div>
</template>
