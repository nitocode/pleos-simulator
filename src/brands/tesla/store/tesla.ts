import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import type { IconName } from '@/core/ui/icons'

export type TeslaPanel = null | 'controls' | 'climate' | 'launcher' | 'volume'
export type TeslaApp = 'media' | 'phone' | 'energy' | 'charge' | 'camera' | 'weather'
export type ControlsTab = 'quick' | 'dynamics' | 'charge' | 'lights' | 'display' | 'safety' | 'nav' | 'service' | 'software'

export const APPS: Record<TeslaApp, { name: string; icon: IconName; color: string }> = {
  media: { name: 'Multimédia', icon: 'music', color: '#e8472b' },
  phone: { name: 'Téléphone', icon: 'phone', color: '#1f9d55' },
  camera: { name: 'Caméra', icon: 'camera', color: '#5c5e62' },
  charge: { name: 'Recharge', icon: 'bolt', color: '#3e6ae1' },
  energy: { name: 'Énergie', icon: 'bar-chart', color: '#1f9d55' },
  weather: { name: 'Météo', icon: 'sun', color: '#e58a00' },
}

/** État propre à l'interface Tesla (panneaux, apps, réglages d'affichage) ; le véhicule reste dans useVehicleStore. */
export const useTeslaStore = defineStore('tesla', () => {
  const panel = ref<TeslaPanel>(null)
  const app = ref<TeslaApp | null>(null)
  const controlsTab = ref<ControlsTab>('quick')
  const search = ref('')
  const searching = ref(false)
  const myApps = ref<TeslaApp[]>(['media', 'phone', 'camera'])
  const recent = ref<TeslaApp[]>([])
  const toast = ref<{ id: number; text: string; icon: IconName } | null>(null)
  const forcedNight = ref<boolean | null>(null)
  const cameraFull = ref(false)
  const frunkOpen = ref(false)
  /** Redémarrage de l'écran tactile (deux boutons du volant, appui long) : écran noir quelques secondes. */
  const rebooting = ref(false)
  let toastTimer: ReturnType<typeof setTimeout> | undefined
  let toastId = 0

  const prefs = reactive({
    displayMode: 'Auto' as 'Auto' | 'Jour' | 'Nuit',
    brightness: 80,
    tempUnit: '°C' as '°C' | '°F',
    distanceUnit: 'km' as 'km' | 'mi',
    steeringFeel: 'Standard' as 'Légère' | 'Standard' | 'Lourde',
    acceleration: 'Standard' as 'Chill' | 'Standard',
    sentinel: false,
    valet: false,
    mobileAccess: true,
    autoMirrorFold: true,
    headlights: 'Auto' as 'Éteints' | 'Position' | 'Auto' | 'Allumés',
    ambient: true,
    avoidTolls: true,
    autoUpdate: true,
  })

  /** Mode nuit : forcé par la simulation, sinon selon le réglage Affichage (Auto : de 19 h à 7 h). */
  const night = computed(() => {
    if (forcedNight.value !== null && prefs.displayMode === 'Auto') return forcedNight.value
    if (prefs.displayMode === 'Nuit') return true
    if (prefs.displayMode === 'Jour') return false
    const h = new Date().getHours()
    return h >= 19 || h < 7
  })

  function notify(text: string, icon: IconName = 'check') {
    clearTimeout(toastTimer)
    toast.value = { id: ++toastId, text, icon }
    toastTimer = setTimeout(() => (toast.value = null), 2600)
  }
  function togglePanel(p: Exclude<TeslaPanel, null>) {
    panel.value = panel.value === p ? null : p
    if (p === 'controls' && panel.value) app.value = null
  }
  function closePanel() {
    panel.value = null
  }
  function launch(id: TeslaApp) {
    app.value = id
    panel.value = null
    recent.value = [id, ...recent.value.filter((r) => r !== id)].slice(0, 4)
  }
  function closeApp() {
    app.value = null
  }
  function toggleMyApp(id: TeslaApp) {
    myApps.value = myApps.value.includes(id) ? myApps.value.filter((a) => a !== id) : [...myApps.value, id].slice(-4)
  }

  return { panel, app, controlsTab, search, searching, myApps, recent, toast, forcedNight, cameraFull, frunkOpen, rebooting, prefs, night, notify, togglePanel, closePanel, launch, closeApp, toggleMyApp }
})
