<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

/** Arcade : mini-jeu de réflexes (taper la case allumée) pour patienter pendant la charge. */
const COUNT = 9
const lit = ref(-1)
const score = ref(0)
const started = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

function pick() {
  lit.value = Math.floor(Math.random() * COUNT)
}
function start() {
  score.value = 0
  started.value = true
  clearInterval(timer)
  timer = setInterval(pick, 900)
  pick()
}
function hit(i: number) {
  if (i !== lit.value) return
  score.value++
  lit.value = -1
}
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-4 p-5">
    <p class="text-[15px] text-ink-2">Score : <b class="tnum text-ink">{{ score }}</b></p>
    <div class="grid grid-cols-3 gap-3">
      <button v-for="i in COUNT" :key="i" type="button" class="press size-20 rounded-2xl transition-colors" :class="lit === i - 1 ? 'bg-[#ea7a1e]' : 'bg-surface-2'" :aria-label="`Case ${i}`" @click="hit(i - 1)" />
    </div>
    <button type="button" class="press h-11 rounded-xl bg-accent px-6 font-semibold text-white" @click="start">{{ started ? 'Rejouer' : 'Jouer' }}</button>
  </div>
</template>
