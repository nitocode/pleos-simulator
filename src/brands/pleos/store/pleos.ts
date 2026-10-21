import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import type { IconName } from '@/core/ui/icons'
import { useVehicleStore } from '@/core/vehicle/store'
import {
  closeApp as closeWindow,
  effectiveLayout,
  openApp as openWindow,
  swapWindows,
  toggleLayout,
  visibleApps,
  type WindowState,
} from '../windows/policy'
import { appMeta, isShortcut, CLIMATE_SHORTCUTS, MARKET_APPS, type AppId, type MarketAppId, type SlotItem } from '../catalog'

export type Panel =
  | 'climate'
  | 'library'
  | 'settings'
  | 'notifications'
  | 'profile'
  | 'bluetooth'
  | 'volume'
  | 'search'
  | 'update'
  | 'defrost'

export interface Notification {
  id: number
  icon: IconName
  title: string
  body: string
  system?: boolean
}

export interface GleoTurn {
  from: 'user' | 'gleo'
  text: string
}

export interface GleoState {
  phase: 'listen' | 'think' | 'talk'
  heard?: string
  reply?: string
  link?: { label: string; manualId: string }
}

/** Emplacements modifiables de la zone de contrôle (d = conducteur, f = favoris, p = passager). */
export const SLOT_IDS = ['d1', 'd2', 'd3', 'f1', 'f2', 'f3', 'p1', 'p2', 'p3'] as const
export type SlotId = (typeof SLOT_IDS)[number]

/** Préférences d'affichage propres à Pleos Connect (Paramètres › Écran, Son, Généraux…). */
const DEFAULT_PREFS = {
  theme: 'Automatique',
  brightness: 18,
  autoBrightness: true,
  iceWarning: true,
  flatTheme: 'Automatique',
  flatLights: true,
  flatLeft: 'Autonomie',
  flatCenter: 'Média',
  flatRight: 'Conso.',
  clock: '24 heures',
  autoTime: true,
  dst: true,
  fontSize: 'Moyenne',
  language: 'Français',
  dualSpeed: false,
  distanceUnit: 'km',
  tempUnit: '°C',
  consumptionUnit: 'km/kWh',
  tireUnit: 'bar',
  keyboard: 'AZERTY',
  keepMedia: true,
  speedVolume: true,
  startVolume: true,
  eqBass: 1,
  eqMid: 0,
  eqTreble: 1,
  fader: 'Tout l’habitacle',
  radioNoise: 'Auto',
  guideVoice: true,
  guideTone: true,
  navDuringCalls: true,
  navPriority: false,
  speedCameras: true,
  speedCameraType: 'Tous',
  chargeProvider: 'Tous',
  navHistory: true,
  gleoVoice: 'Voix 1',
  gleoHistory: true,
  profile: 'Profil 1',
  profilePassword: false,
  syncData: true,
  remoteServices: true,
  liveServices: true,
  modem: true,
}
export type Prefs = typeof DEFAULT_PREFS

export const usePleosStore = defineStore('pleos', () => {
  const vehicle = useVehicleStore()

  const prefs = reactive<Prefs>({ ...DEFAULT_PREFS })
  const volumes = reactive({ nav: 14, call: 16, gleo: 14 })

  // ---------- Fenêtres d'apps ----------
  const windows = ref<WindowState<AppId>>({ stack: ['nav', 'bta'], layout: 'split' })
  const cameraFull = ref(false)
  const visible = computed(() => visibleApps(windows.value))
  const layout = computed(() => effectiveLayout(windows.value))

  // ---------- Panneaux système ----------
  const panel = ref<Panel | null>(null)
  const settingsCategory = ref('quick')
  const settingsSub = ref<string | null>(null)

  // ---------- Zone de contrôle ----------
  const slots = reactive<Record<SlotId, SlotItem | null>>({
    d1: 'cf:defrostFront',
    d2: 'cf:defrostRear',
    d3: 'cf:seatHeatL',
    f1: 'bta',
    f2: 'phone',
    f3: 'market',
    p1: 'cf:fan',
    p2: 'cf:airflow',
    p3: 'cf:seatHeatR',
  })
  const editMode = ref(false)
  const editSlot = ref<SlotId | null>(null)
  const recent = ref<AppId[]>(['manual', 'radio'])

  // ---------- App Market ----------
  const installed = ref<MarketAppId[]>([])
  const installing = reactive<Record<string, number>>({})

  // ---------- Notifications et retours ----------
  const notifications = ref<Notification[]>([
    { id: 1, icon: 'update', title: 'Mise à jour du logiciel', body: 'Pleos Connect 1.3.0 est téléchargé. Installation possible à l’arrêt.', system: true },
    { id: 2, icon: 'message', title: 'Camille Martin', body: 'Tu arrives vers quelle heure ?' },
    { id: 3, icon: 'battery-charging', title: 'Charge programmée', body: 'Prochaine charge à 23:00, départ prévu 07:30.' },
  ])
  const toast = ref<{ id: number; text: string; icon: IconName } | null>(null)
  const osd = ref<{ id: number; label: string; value: number; max: number; icon: IconName } | null>(null)
  const update = reactive({ installed: false, progress: -1 })

  // ---------- Gleo AI ----------
  const gleo = ref<GleoState | null>(null)
  const gleoHistory = ref<GleoTurn[]>([{ from: 'gleo', text: 'Bonjour, je suis Gleo. Comment puis-je vous aider ?' }])

  // ---------- Vue de conduite ----------
  const widget = ref(0)
  const widgetOpen = ref(true)
  const forcedNight = ref<boolean | null>(null)

  // ---------- Thème ----------
  const nowHour = ref(new Date().getHours())
  setInterval(() => (nowHour.value = new Date().getHours()), 60_000)
  const isNightTime = computed(() => nowHour.value < 8 || nowHour.value >= 19)
  const night = computed(() => {
    if (prefs.theme === 'Plus clair') return false
    if (prefs.theme === 'Plus sombre') return true
    return forcedNight.value ?? isNightTime.value
  })
  const flatLight = computed(() => {
    if (prefs.flatTheme === 'Plus clair') return true
    if (prefs.flatTheme === 'Plus sombre') return false
    return !(forcedNight.value ?? isNightTime.value)
  })

  // ---------- Actions ----------
  let toastId = 0
  let toastTimer: ReturnType<typeof setTimeout> | undefined
  function notify(text: string, icon: IconName = 'check') {
    toast.value = { id: ++toastId, text, icon }
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast.value = null), 2400)
  }

  let osdTimer: ReturnType<typeof setTimeout> | undefined
  function showOsd(label: string, value: number, max: number, icon: IconName) {
    osd.value = { id: ++toastId, label, value, max, icon }
    clearTimeout(osdTimer)
    osdTimer = setTimeout(() => (osd.value = null), 2000)
  }

  function togglePanel(p: Panel) {
    panel.value = panel.value === p ? null : p
    if (p !== 'library' && panel.value !== 'library') stopEditing()
  }
  function closePanel() {
    panel.value = null
    stopEditing()
  }

  function openSettings(category?: string) {
    if (category) {
      settingsCategory.value = category
      settingsSub.value = null
    }
    panel.value = 'settings'
    gleo.value = null
  }

  function launch(id: AppId) {
    if (id === 'climate') {
      togglePanel('climate')
      return
    }
    if (id === 'camera') {
      cameraFull.value = true
      panel.value = null
      return
    }
    panel.value = null
    stopEditing()
    windows.value = openWindow(windows.value, id)
    if (id !== 'nav') recent.value = [id, ...recent.value.filter((r) => r !== id)].slice(0, 4)
  }

  function runSlot(item: SlotItem) {
    if (isShortcut(item)) notify(CLIMATE_SHORTCUTS[item].run(vehicle), CLIMATE_SHORTCUTS[item].icon)
    else launch(item)
  }

  function close(id: AppId) {
    const next = closeWindow(windows.value, id)
    if (!next) {
      notify('La navigation ne peut pas être fermée', 'info')
      return
    }
    windows.value = next
  }
  function swap() {
    windows.value = swapWindows(windows.value)
  }
  function resize(focus?: AppId) {
    windows.value = toggleLayout(windows.value, focus)
  }
  function closeCamera() {
    cameraFull.value = false
  }

  // Édition des favoris
  function startEditing(slot?: SlotId) {
    editMode.value = true
    editSlot.value = slot ?? editSlot.value ?? 'f1'
    panel.value = 'library'
  }
  function stopEditing() {
    editMode.value = false
    editSlot.value = null
  }
  function assign(item: SlotItem) {
    if (!editSlot.value) return
    const existing = (Object.keys(slots) as SlotId[]).find((k) => slots[k] === item)
    if (existing) slots[existing] = slots[editSlot.value]
    slots[editSlot.value] = item
    const name = isShortcut(item) ? CLIMATE_SHORTCUTS[item].name : appMeta(item).name
    notify(`${name} placé dans la zone de contrôle`, 'check')
    const i = SLOT_IDS.indexOf(editSlot.value)
    editSlot.value = SLOT_IDS[(i + 1) % SLOT_IDS.length]!
  }
  function clearSlot(slot: SlotId) {
    slots[slot] = null
  }

  // App Market
  function install(id: MarketAppId) {
    if (installed.value.includes(id) || installing[id] !== undefined) return
    installing[id] = 0
    const timer = setInterval(() => {
      installing[id] = Math.min(100, (installing[id] ?? 0) + 14)
      if ((installing[id] ?? 0) >= 100) {
        clearInterval(timer)
        delete installing[id]
        installed.value = [...installed.value, id]
        notify(`${MARKET_APPS.find((a) => a.id === id)?.name} est installée`, 'download')
      }
    }, 260)
  }
  function uninstall(id: MarketAppId) {
    installed.value = installed.value.filter((x) => x !== id)
    for (const k of SLOT_IDS) if (slots[k] === id) slots[k] = null
    windows.value = { ...windows.value, stack: windows.value.stack.filter((x) => x !== id) }
    recent.value = recent.value.filter((x) => x !== id)
    notify(`${appMeta(id).name} est supprimée`, 'trash')
  }

  // Mise à jour logicielle
  function installUpdate() {
    if (vehicle.gear !== 'P' || vehicle.moving) {
      notify('Passez en P pour installer la mise à jour', 'warning')
      return
    }
    update.progress = 0
    panel.value = null
    const timer = setInterval(() => {
      update.progress = Math.min(100, update.progress + 4)
      if (update.progress >= 100) {
        clearInterval(timer)
        update.installed = true
        update.progress = -1
        notifications.value = notifications.value.filter((n) => !n.system)
        notify('Pleos Connect 1.3.0 est installé', 'check-circle')
      }
    }, 160)
  }

  function addNotification(n: Omit<Notification, 'id'>) {
    notifications.value = [{ ...n, id: Date.now() }, ...notifications.value]
  }

  return {
    prefs, volumes, windows, cameraFull, visible, layout, panel, settingsCategory, settingsSub,
    slots, editMode, editSlot, recent, installed, installing, notifications, toast, osd, update,
    gleo, gleoHistory, widget, widgetOpen, forcedNight, night, flatLight, isNightTime,
    notify, showOsd, togglePanel, closePanel, openSettings, launch, runSlot, close, swap, resize, closeCamera,
    startEditing, stopEditing, assign, clearSlot, install, uninstall, installUpdate, addNotification,
  }
})

export type PleosStore = ReturnType<typeof usePleosStore>
