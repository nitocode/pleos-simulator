<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/core/ui/Icon.vue'
import { BRANDS } from '@/brands'

/** Page d'accueil : choix de la marque, puis du modèle, avant d'ouvrir le simulateur. */
const router = useRouter()
const makers = computed(() => [...new Set(BRANDS.map((b) => b.maker))])
const maker = ref(makers.value[0]!)
const models = computed(() => BRANDS.filter((b) => b.maker === maker.value))
const accent = computed(() => models.value[0]?.accent ?? '#3b82f6')

function open(id: string) {
  router.push(`/${id}`)
}
</script>

<template>
  <main class="relative isolate min-h-screen overflow-hidden">
    <!-- fond : halo de la couleur de la marque choisie -->
    <div class="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-700" :style="{ background: `radial-gradient(900px 520px at 78% -8%, color-mix(in srgb, ${accent} 26%, transparent), transparent 70%), radial-gradient(700px 420px at 4% 108%, color-mix(in srgb, ${accent} 12%, transparent), transparent 70%)` }" />
    <div class="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000,transparent_75%)]" />

    <div class="mx-auto flex min-h-screen max-w-[1120px] flex-col px-[max(20px,env(safe-area-inset-left))] pt-10 pb-8">
      <header class="flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.14em] text-bench-dim uppercase">
        <span class="grid size-8 place-items-center rounded-lg bg-bench-raised text-white"><Icon name="car-front" size="18" /></span>
        Banc d’essai d’interfaces auto
      </header>

      <section class="mt-14 max-w-[720px]">
        <h1 class="text-[clamp(34px,6vw,60px)] leading-[1.04] font-extrabold tracking-[-0.02em] text-balance text-white">Essayez l’écran de votre voiture, <span class="text-bench-dim">depuis le navigateur.</span></h1>
        <p class="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-bench-dim">Choisissez une marque et un modèle : l’interface, la climatisation, la navigation et la recharge réagissent comme à bord. Reconstitutions non officielles, d’après les manuels des constructeurs.</p>
      </section>

      <!-- 1 · marque -->
      <section class="mt-12" aria-labelledby="brand-title">
        <h2 id="brand-title" class="mb-3 text-[12px] font-bold tracking-[0.12em] text-bench-dim uppercase">1 · Marque</h2>
        <div class="flex flex-wrap gap-3" role="tablist" aria-label="Marque">
          <button
            v-for="m in makers"
            :key="m"
            type="button"
            role="tab"
            :aria-selected="maker === m"
            class="press group relative h-[72px] min-w-[170px] overflow-hidden rounded-2xl border px-6 text-left transition-colors duration-300"
            :class="maker === m ? 'border-white/30 bg-white/[0.07]' : 'border-bench-line bg-bench-panel/70 hover:border-white/20'"
            @click="maker = m"
          >
            <span class="block text-[22px] font-extrabold tracking-[0.2em] uppercase" :class="maker === m ? 'text-white' : 'text-bench-dim group-hover:text-bench-ink'">{{ m }}</span>
            <span class="text-[12px] text-bench-dim">{{ BRANDS.filter((b) => b.maker === m).length }} modèle{{ BRANDS.filter((b) => b.maker === m).length > 1 ? 's' : '' }}</span>
            <span class="absolute inset-x-0 bottom-0 h-[3px] transition-opacity duration-300" :class="maker === m ? 'opacity-100' : 'opacity-0'" :style="{ background: BRANDS.find((b) => b.maker === m)!.accent }" />
          </button>
        </div>
      </section>

      <!-- 2 · modèle -->
      <section class="mt-10" aria-labelledby="model-title">
        <h2 id="model-title" class="mb-3 text-[12px] font-bold tracking-[0.12em] text-bench-dim uppercase">2 · Modèle</h2>
        <TransitionGroup tag="div" name="cards" class="grid gap-5 sm:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
          <button
            v-for="b in models"
            :key="b.id"
            type="button"
            class="group relative flex flex-col overflow-hidden rounded-[26px] border border-bench-line bg-bench-panel text-left transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_24px_60px_rgb(0_0_0/0.45)] focus-visible:-translate-y-1"
            @click="open(b.id)"
          >
            <!-- aperçu de l'écran -->
            <div class="relative grid h-[210px] place-items-center overflow-hidden" :style="{ background: `linear-gradient(160deg, color-mix(in srgb, ${b.accent} 20%, #14171c), #0d0f12)` }">
              <div v-if="b.id === 'pleos'" class="h-[132px] w-[250px] rounded-[14px] bg-[#e4e7ec] p-1.5 shadow-[0_0_0_4px_#050608,0_18px_36px_rgb(0_0_0/0.55)] transition-transform duration-500 group-hover:scale-[1.04]">
                <div class="grid h-full grid-cols-[34%_1fr_1fr] gap-1">
                  <div class="rounded-lg bg-white p-1.5"><div class="h-2 w-6 rounded bg-[#121418]/80" /><div class="mt-3 h-8 rounded-md bg-[#eef0f3]" /></div>
                  <div class="rounded-lg bg-[#dfe7df]"><div class="m-2 h-1 w-10 rotate-[-24deg] rounded bg-white" /><div class="mx-3 h-[3px] w-12 rotate-[30deg] rounded bg-[#22a94b]" /></div>
                  <div class="rounded-lg bg-white p-1.5"><div class="mx-auto mt-2 size-9 rounded-lg bg-gradient-to-br from-[#1f4d3a] to-[#7fa38a]" /><div class="mx-auto mt-2 h-1 w-14 rounded bg-[#e0e3e8]" /></div>
                </div>
                <div class="absolute inset-x-3 bottom-2.5 flex h-4 items-center gap-1.5 rounded-md bg-white px-2"><span v-for="i in 7" :key="i" class="size-2 rounded-sm" :class="i === 3 ? 'bg-[#2f7bf6]' : 'bg-[#cfd3da]'" /></div>
              </div>
              <!-- ID.3 : barre de favoris, menu des applis, barre de climatisation -->
              <div v-else-if="b.id === 'vw-id3'" class="flex h-[140px] w-[230px] flex-col rounded-[12px] bg-[#070a0f] p-1.5 shadow-[0_0_0_4px_#050608,0_18px_36px_rgb(0_0_0/0.55)] transition-transform duration-500 group-hover:scale-[1.04]">
                <div class="flex h-4 items-center gap-1 px-1"><span class="size-2 rounded-sm bg-[#2f9bff]" /><span v-for="i in 4" :key="i" class="size-2 rounded-sm bg-[#5f6b7b]" /><span class="ml-auto h-1 w-6 rounded bg-[#9eabbc]" /></div>
                <div class="grid flex-1 grid-cols-5 place-items-center gap-1 px-3 py-1.5"><span v-for="(c, i) in ['#34d27a', '#ff4d6a', '#2f9bff', '#c7d0db', '#4aa3ff', '#2f7ee8', '#3fd27f', '#7fc4ff', '#4ad6d6', '#c7d0db']" :key="i" class="size-5 rounded-md bg-[#1d2530] ring-1 ring-white/5" :style="{ boxShadow: `inset 0 0 0 5px #1d2530, inset 0 0 0 9px ${c}` }" /></div>
                <div class="flex h-4 items-center gap-1.5 rounded-sm bg-[#151b24] px-1.5"><span class="h-1.5 w-4 rounded bg-white/80" /><span class="h-1 w-3 rounded bg-[#ff9a1f]" /><span class="mx-auto size-2 rounded-[2px] border border-[#2f9bff]" /><span class="h-1.5 w-4 rounded bg-white/80" /></div>
              </div>
              <!-- Enyaq : raccourcis en haut, Laura et carte, barre inférieure -->
              <div v-else-if="b.id === 'skoda-enyaq'" class="flex h-[132px] w-[250px] flex-col rounded-[12px] bg-[#121517] p-1.5 shadow-[0_0_0_4px_#050608,0_18px_36px_rgb(0_0_0/0.55)] transition-transform duration-500 group-hover:scale-[1.04]">
                <div class="flex h-4 items-center gap-1 px-1"><span class="size-2 rounded-sm bg-white/80" /><span v-for="i in 5" :key="i" class="size-2 rounded-sm" :class="i === 2 ? 'bg-[#78faae]' : 'bg-[#66706d]'" /><span class="mx-auto h-1 w-5 rounded bg-white/70" /></div>
                <div class="grid flex-1 grid-cols-[34%_1fr] gap-1 py-1"><div class="flex flex-col gap-1"><div class="flex-1 rounded-md bg-[#23282b] p-1"><span class="block size-1.5 rounded-full bg-[#78faae]" /><span class="mt-1 block h-1 w-10 rounded bg-white/60" /></div><div class="flex-1 rounded-md bg-[#23282b]" /></div><div class="relative rounded-md bg-[#1d2224]"><div class="absolute top-5 left-3 h-[3px] w-24 rotate-[15deg] rounded bg-[#384046]" /><div class="absolute top-10 left-10 h-[3px] w-16 rotate-[-25deg] rounded bg-[#78faae]/80" /></div></div>
                <div class="flex h-4 items-center justify-between px-1"><span class="h-1.5 w-8 rounded bg-white/70" /><span class="flex gap-1"><span class="size-2 rounded-sm bg-[#78faae]" /><span v-for="i in 4" :key="i" class="size-2 rounded-sm bg-[#66706d]" /></span><span class="h-1.5 w-8 rounded bg-white/70" /></div>
              </div>
              <div v-else-if="b.id === 'tesla'" class="h-[132px] w-[250px] rounded-[10px] bg-[#101114] p-1.5 shadow-[0_0_0_4px_#050608,0_18px_36px_rgb(0_0_0/0.55)] transition-transform duration-500 group-hover:scale-[1.04]">
                <div class="grid h-full grid-cols-[30%_1fr] gap-1.5">
                  <div class="rounded-md bg-[#17181c] p-1.5"><div class="h-5 w-8 rounded bg-white/90" /><div class="mt-2.5 h-9 rounded-md bg-gradient-to-b from-[#2a2c32] to-[#1e2025]" /></div>
                  <div class="relative rounded-md bg-[#20242b]"><div class="absolute top-4 left-3 h-[3px] w-20 rotate-[18deg] rounded bg-[#3a414c]" /><div class="absolute top-9 left-8 h-[3px] w-16 rotate-[-30deg] rounded bg-[#4d5563]" /><div class="absolute right-3 bottom-3 h-12 w-16 rounded-md bg-[#17181c]/95 ring-1 ring-white/10" /></div>
                </div>
                <div class="absolute inset-x-3 bottom-2.5 flex h-4 items-center justify-between rounded-md bg-[#17181c] px-2"><span class="h-1.5 w-8 rounded bg-white/80" /><span class="flex gap-1"><span v-for="i in 4" :key="i" class="size-2 rounded-sm bg-[#3a3d44]" /></span><span class="h-1.5 w-8 rounded bg-white/80" /></div>
              </div>
              <span class="absolute top-4 left-4 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur">{{ b.year }}</span>
            </div>
            <div class="flex flex-1 flex-col gap-3 p-6">
              <div>
                <p class="text-[12px] font-bold tracking-[0.12em] uppercase" :style="{ color: b.accent }">{{ b.system }}</p>
                <h3 class="mt-0.5 text-[28px] font-extrabold tracking-[-0.01em] text-white">{{ b.maker }} {{ b.model }}</h3>
              </div>
              <p class="text-[15px] leading-relaxed text-bench-dim">{{ b.tagline }}</p>
              <ul class="flex flex-wrap gap-2 text-[12.5px] font-semibold text-bench-ink">
                <li class="rounded-full bg-bench-raised px-3 py-1">{{ b.screenLabel }}</li>
                <li class="rounded-full bg-bench-raised px-3 py-1">{{ b.vehicle.batteryKwh }} kWh</li>
                <li class="rounded-full bg-bench-raised px-3 py-1">CA {{ b.vehicle.acKw }} kW</li>
              </ul>
              <span class="mt-auto flex items-center gap-2 pt-3 text-[15px] font-semibold text-white">Ouvrir le simulateur <Icon name="chevron-right" size="18" class="transition-transform duration-300 group-hover:translate-x-1" /></span>
            </div>
          </button>
        </TransitionGroup>
      </section>

      <footer class="mt-auto pt-14 text-[12px] leading-relaxed text-bench-dim">
        Projet indépendant, sans lien avec Hyundai ni Tesla. Graphismes, données et textes sont des reconstitutions de démonstration d’après les manuels en ligne des constructeurs.
      </footer>
    </div>
  </main>
</template>

<style scoped>
.cards-enter-active,
.cards-leave-active {
  transition: opacity 0.35s var(--ease-ui), transform 0.35s var(--ease-ui);
}
.cards-enter-from,
.cards-leave-to {
  opacity: 0;
  transform: translateY(14px);
}
.cards-leave-active {
  position: absolute;
}
</style>
