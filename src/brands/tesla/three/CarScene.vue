<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  Clock,
  Color,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { ANCHORS, buildModel3, WHEEL_R } from './model3'

/**
 * Visualisation du véhicule : à l'arrêt, la Model 3 est vue de trois quarts avant (comme sur les captures du manuel) ;
 * dès qu'un rapport est engagé, la caméra glisse en vue à la troisième personne, derrière et au-dessus, et la route
 * apparaît avec ses marquages, les véhicules voisins et, sous régulateur, la trajectoire en bleu.
 * Le rendu ne tourne que lorsque quelque chose bouge.
 */
const props = defineProps<{
  driving: boolean
  speed: number
  frunkOpen: boolean
  trunkOpen: boolean
  blinkL: boolean
  blinkR: boolean
  night: boolean
  cruise: boolean
}>()
export type Anchor = { x: number; y: number }
const emit = defineEmits<{ anchors: [Record<keyof typeof ANCHORS, Anchor>, boolean]; fallback: [] }>()

const host = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const DAY = { bg: '#f4f4f5', road: '#e3e5e9', lane: '#9a9da3', ghost: '#b8bcc3' }
const NIGHT = { bg: '#101114', road: '#1d1f24', lane: '#80858e', ghost: '#4a4f57' }
/** Poses de caméra : trois quarts avant à l'arrêt, troisième personne en conduite (champ horizontal en degrés). */
/** La caméra tourne autour du centre du véhicule (azimut en radians, rayon et hauteur en mètres) : elle part de l'avant
 * gauche, longe le flanc et se place derrière, au lieu de traverser la scène en ligne droite. */
const CENTER = new Vector3(0, 0.5, 0)
const PARK = { az: Math.atan2(6.6, -5.4), r: Math.hypot(6.6, -5.4), h: 2.0, look: new Vector3(0.35, 0.55, 0), hfov: 44 }
const DRIVE = { az: 0, r: 6.4, h: 2.6, look: new Vector3(-7, 0.3, 0), hfov: 62 }
const DASH = 3
const PERIOD = 9

let dispose = () => {}

onMounted(() => {
  const el = canvas.value!
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas: el, antialias: true, powerPreference: 'low-power' })
  } catch {
    emit('fallback')
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = env
  scene.background = new Color(DAY.bg)
  scene.fog = new Fog(DAY.bg, 24, 75)

  const camera = new PerspectiveCamera(40, 1, 0.1, 200)

  scene.add(new HemisphereLight('#ffffff', '#8a8f98', 0.7))
  const sun = new DirectionalLight('#ffffff', 1.5)
  sun.position.set(-3, 9, 5)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.radius = 5
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 })
  scene.add(sun)

  const shadow = new Mesh(new PlaneGeometry(80, 80), new ShadowMaterial({ opacity: 0.24 }))
  shadow.rotation.x = -Math.PI / 2
  shadow.receiveShadow = true
  scene.add(shadow)

  // route : chaussée à trois voies, marquages en tirets, bords continus, trajectoire du régulateur
  const road = new Group()
  const roadMat = new MeshStandardMaterial({ color: DAY.road, transparent: true, opacity: 0, roughness: 0.95 })
  const surface = new Mesh(new PlaneGeometry(260, 11.4), roadMat)
  surface.rotation.x = -Math.PI / 2
  surface.position.set(-110, 0.002, 0)
  surface.receiveShadow = true
  road.add(surface)
  const laneMat = new MeshBasicMaterial({ color: DAY.lane, transparent: true, opacity: 0 })
  const dashGeo = new BoxGeometry(DASH, 0.01, 0.14)
  const dashes: Mesh[] = []
  for (const z of [-1.9, 1.9]) {
    for (let i = 0; i < 18; i++) {
      const d = new Mesh(dashGeo, laneMat)
      d.position.set(12 - i * PERIOD, 0.006, z)
      dashes.push(d)
      road.add(d)
    }
  }
  for (const z of [-5.6, 5.6]) {
    const edge = new Mesh(new BoxGeometry(200, 0.01, 0.16), laneMat)
    edge.position.set(-88, 0.006, z)
    road.add(edge)
  }
  const pathMat = new MeshBasicMaterial({ color: '#3e6ae1', transparent: true, opacity: 0 })
  const path = new Mesh(new PlaneGeometry(60, 1.7), pathMat)
  path.rotation.x = -Math.PI / 2
  path.position.set(-33, 0.004, 0)
  road.add(path)
  scene.add(road)

  const car = buildModel3()
  scene.add(car.root)
  // véhicules voisins (silhouettes grises, comme sur la visualisation de conduite)
  const ghosts = [buildModel3(DAY.ghost, true), buildModel3(DAY.ghost, true)]
  ghosts.forEach((g) => {
    g.paint.transparent = true
    g.paint.opacity = 0
    scene.add(g.root)
  })
  ghosts[0]!.root.position.set(-17, 0, 0)
  ghosts[1]!.root.position.set(-6, 0, 3.8)

  function applyTheme() {
    const c = props.night ? NIGHT : DAY
    ;(scene.background as Color).set(c.bg)
    ;(scene.fog as Fog).color.set(c.bg)
    roadMat.color.set(c.road)
    laneMat.color.set(c.lane)
    ghosts.forEach((g) => g.paint.color.set(c.ghost))
    sun.intensity = props.night ? 0.9 : 1.5
    dirty = true
  }

  let t = props.driving ? 1 : 0
  let hood = 0
  let trunk = 0
  let laneOffset = 0
  let wheelAngle = 0
  let sideX = -6
  let dirty = true
  let lastAnchors = ''
  const clock = new Clock()
  const tmp = new Vector3()
  const look = new Vector3()

  function resize() {
    const w = host.value?.clientWidth ?? 0
    const h = host.value?.clientHeight ?? 0
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    dirty = true
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host.value!)
  resize()
  applyTheme()

  function emitAnchors() {
    const out = {} as Record<keyof typeof ANCHORS, Anchor>
    for (const [k, p] of Object.entries(ANCHORS) as [keyof typeof ANCHORS, readonly [number, number, number]][]) {
      tmp.set(p[0], p[1], p[2]).project(camera)
      out[k] = { x: Math.round(((tmp.x + 1) / 2) * 1000) / 10, y: Math.round(((1 - tmp.y) / 2) * 1000) / 10 }
    }
    const key = JSON.stringify(out) + (t < 0.02)
    if (key !== lastAnchors) {
      lastAnchors = key
      emit('anchors', out, t < 0.02)
    }
  }

  let raf = 0
  function frame() {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    const target = props.driving ? 1 : 0
    const v = props.driving ? props.speed / 3.6 : 0
    const blinking = props.blinkL || props.blinkR

    const before = t + hood + trunk
    t += (target - t) * (1 - Math.exp(-dt * 2.6))
    if (Math.abs(target - t) < 0.001) t = target
    hood += ((props.frunkOpen ? 0.75 : 0) - hood) * (1 - Math.exp(-dt * 6))
    trunk += ((props.trunkOpen ? 0.85 : 0) - trunk) * (1 - Math.exp(-dt * 6))
    const moving = Math.abs(t + hood + trunk - before) > 1e-5 || v > 0 || t > 0
    if (!moving && !blinking && !dirty) return
    dirty = false

    // caméra : interpolation lissée entre les deux poses
    const k = MathUtils.smoothstep(t, 0, 1)
    const az = MathUtils.lerp(PARK.az, DRIVE.az, k)
    const r = MathUtils.lerp(PARK.r, DRIVE.r, k)
    // petite montée à mi-parcours pour survoler le flanc
    const h = MathUtils.lerp(PARK.h, DRIVE.h, k) + Math.sin(k * Math.PI) * 0.8
    camera.position.set(CENTER.x + r * Math.cos(az), CENTER.y + h, CENTER.z + r * Math.sin(az))
    look.lerpVectors(PARK.look, DRIVE.look, k)
    camera.lookAt(look)
    const hfov = MathUtils.lerp(PARK.hfov, DRIVE.hfov, k)
    camera.fov = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(hfov / 2)) / camera.aspect))
    camera.updateProjectionMatrix()

    // route, marquages et véhicules voisins
    roadMat.opacity = k * 0.95
    laneMat.opacity = k
    pathMat.opacity = props.cruise ? k * 0.32 : 0
    laneOffset = (laneOffset + v * dt) % PERIOD
    dashes.forEach((d, i) => (d.position.x = 12 - (i % 18) * PERIOD + laneOffset))
    sideX += (v > 0 ? -2.2 : 0) * dt
    if (sideX < -40) sideX = 14
    ghosts[1]!.root.position.x = sideX
    ghosts[0]!.root.position.x = -17 - Math.sin(clock.elapsedTime * 0.3) * 1.5
    ghosts.forEach((g) => {
      g.paint.opacity = MathUtils.clamp((k - 0.4) / 0.6, 0, 1) * 0.9
      g.root.visible = k > 0.4
    })

    // roues, capot, coffre, clignotants
    wheelAngle += (v / WHEEL_R) * dt
    car.wheels.forEach((w) => (w.rotation.z = wheelAngle))
    car.hood.rotation.z = -hood
    car.trunk.rotation.z = trunk
    const on = Math.floor(clock.elapsedTime / 0.4) % 2 === 0
    car.blinkers.left.forEach((b) => ((b.material as MeshStandardMaterial).emissiveIntensity = props.blinkL && on ? 2.4 : 0))
    car.blinkers.right.forEach((b) => ((b.material as MeshStandardMaterial).emissiveIntensity = props.blinkR && on ? 2.4 : 0))

    renderer.render(scene, camera)
    emitAnchors()
  }
  frame()

  const stopTheme = watch(() => props.night, applyTheme)
  const stopProps = watch(() => [props.frunkOpen, props.trunkOpen, props.cruise, props.driving], () => (dirty = true))

  dispose = () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    stopTheme()
    stopProps()
    car.dispose()
    ghosts.forEach((g) => g.dispose())
    scene.traverse((o) => o instanceof Mesh && o.geometry.dispose())
    ;[roadMat, laneMat, pathMat, shadow.material as ShadowMaterial].forEach((m) => m.dispose())
    env.dispose()
    pmrem.dispose()
    renderer.dispose()
  }
})

onBeforeUnmount(() => dispose())
</script>

<template>
  <div ref="host" class="absolute inset-0">
    <canvas ref="canvas" class="block size-full" aria-hidden="true" />
  </div>
</template>
