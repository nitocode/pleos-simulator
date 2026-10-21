<script lang="ts">
import { ref } from 'vue'
const tab = ref<'fav' | 'list' | 'manual'>('list')
</script>

<script setup lang="ts">
import Icon from '@/core/ui/Icon.vue'
import { RADIO } from '@/core/vehicle/data'
import { useVehicleStore } from '@/core/vehicle/store'

/** Radio : onglets Favoris, Liste stations et Réglage manuel, comme dans le manuel. */
const vehicle = useVehicleStore()
const isOn = (i: number) => vehicle.media.source === 'radio' && vehicle.media.station === i
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex gap-6 border-b border-line px-5">
      <button
        v-for="t in ([['fav', 'Favoris'], ['list', 'Liste stations'], ['manual', 'Réglage manuel']] as const)"
        :key="t[0]"
        type="button"
        class="relative py-3 text-[15px] font-bold transition-colors"
        :class="tab === t[0] ? 'text-accent' : 'text-ink-2'"
        @click="tab = t[0]"
      >
        {{ t[1] }}
        <span class="absolute inset-x-0 -bottom-px h-[3px] origin-center rounded-full bg-accent transition-transform duration-300 ease-ui" :class="tab === t[0] ? 'scale-x-100' : 'scale-x-0'" />
      </button>
    </div>
    <div class="thin-scrollbar min-h-0 flex-1 overflow-auto">
      <Transition name="fade" mode="out-in">
        <div v-if="tab === 'manual'" key="manual" class="flex h-full flex-col items-center justify-center gap-6 py-8">
          <div class="tnum text-[68px] leading-none font-light">{{ vehicle.currentStation.freq }}<small class="text-[18px] text-ink-2"> MHz</small></div>
          <div class="flex gap-3">
            <button type="button" class="press flex h-12 items-center gap-1 rounded-xl bg-surface-2 px-5 font-semibold" @click="vehicle.media.source = 'radio'; vehicle.step(-1)"><Icon name="chevron-left" size="20" />Rechercher</button>
            <button type="button" class="press flex h-12 items-center gap-1 rounded-xl bg-surface-2 px-5 font-semibold" @click="vehicle.media.source = 'radio'; vehicle.step(1)">Rechercher<Icon name="chevron-right" size="20" /></button>
          </div>
        </div>
        <div v-else :key="tab">
          <div v-if="tab === 'list'" class="flex gap-3 px-5 pt-3 text-[12px] font-bold text-ink-3">
            <span class="text-ink">Nom ↓</span><span>@ · # · A · E · I · M · Q · U · Z</span>
          </div>
          <p v-if="tab === 'fav' && !vehicle.media.favorites.length" class="p-6 text-ink-2">Touchez l’étoile d’une station pour l’ajouter aux favoris.</p>
          <TransitionGroup name="pop" tag="div" class="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5 p-4">
            <div
              v-for="i in tab === 'fav' ? vehicle.media.favorites : RADIO.map((_, k) => k)"
              :key="i"
              class="press flex cursor-pointer items-center gap-3 rounded-2xl border bg-surface p-3 shadow-card transition-colors night:bg-surface-2"
              :class="isOn(i) ? 'border-accent' : 'border-line'"
              role="button"
              tabindex="0"
              @click="vehicle.playStation(i)"
              @keydown.enter="vehicle.playStation(i)"
            >
              <span class="grid size-11 flex-none place-items-center rounded-xl bg-surface-2 text-ink-2 night:bg-surface-3"><Icon name="radio" size="22" /></span>
              <span class="min-w-0 flex-1">
                <b class="block truncate text-[15px]" :class="isOn(i) && 'text-accent'">{{ RADIO[i]!.name }}</b>
                <small class="tnum text-[13px] text-ink-2">FM {{ RADIO[i]!.freq }}</small>
              </span>
              <Icon v-if="isOn(i) && vehicle.media.playing" name="audio-lines" size="20" class="text-accent" />
              <button type="button" class="press grid size-9 place-items-center rounded-full" :class="vehicle.media.favorites.includes(i) ? 'text-accent' : 'text-ink-3'" :aria-label="vehicle.media.favorites.includes(i) ? 'Retirer des favoris' : 'Ajouter aux favoris'" @click.stop="vehicle.toggleFavoriteStation(i)">
                <Icon :name="vehicle.media.favorites.includes(i) ? 'star-filled' : 'star'" size="20" />
              </button>
            </div>
          </TransitionGroup>
        </div>
      </Transition>
    </div>
    <div class="flex items-center gap-3 border-t border-line px-4 py-3">
      <span class="grid size-12 flex-none place-items-center rounded-xl bg-gradient-to-br from-[#ff5fa2] to-[#e0337f] text-[13px] font-bold text-white">FM</span>
      <div class="min-w-0 flex-1">
        <b class="block truncate">{{ vehicle.currentStation.name }}</b>
        <small class="block truncate text-ink-2">{{ vehicle.currentStation.show }}</small>
      </div>
      <button type="button" class="press grid size-11 place-items-center rounded-full" aria-label="Station précédente" @click="vehicle.media.source = 'radio'; vehicle.step(-1)"><Icon name="prev" size="24" /></button>
      <button type="button" class="press grid size-11 place-items-center rounded-full" aria-label="Couper ou rétablir" @click="vehicle.media.source !== 'radio' ? vehicle.playStation(vehicle.media.station) : vehicle.togglePlay()">
        <Icon :name="vehicle.media.source === 'radio' && vehicle.media.playing ? 'volume' : 'volume-mute'" size="24" />
      </button>
      <button type="button" class="press grid size-11 place-items-center rounded-full" aria-label="Station suivante" @click="vehicle.media.source = 'radio'; vehicle.step(1)"><Icon name="next" size="24" /></button>
    </div>
  </div>
</template>
