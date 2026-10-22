import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Shape,
  type Material,
} from 'three'

/**
 * Model 3 (2024+) en 3D, construite à partir du profil latéral dessiné en SVG (viewBox 400 × 140, sol à y = 128) :
 * 1 unité = 11,8 mm, soit 4,72 m de long. Le bas de caisse est extrudé sur toute la largeur (1,85 m) et l'habitacle
 * vitré, plus étroit, posé dessus. Repère : avant vers −X, haut +Y, côté conducteur +Z.
 */
const S = 4.72 / 400
const X = (u: number) => (u - 200) * S
const Y = (u: number) => (128 - u) * S
export const WIDTH = 1.85
export const WHEEL_R = 0.33
export const AXLES = [X(76), X(310)] as const
export const WHEEL_Y = Y(102)

type Pt = [number, number]
function shape(start: Pt, build: (s: Shape, p: (x: number, y: number) => [number, number]) => void): Shape {
  const s = new Shape()
  const p = (x: number, y: number): [number, number] => [X(x), Y(y)]
  s.moveTo(...p(...start))
  build(s, p)
  return s
}
const bez = (s: Shape, p: (x: number, y: number) => [number, number], a: Pt, b: Pt, c: Pt) => s.bezierCurveTo(...p(...a), ...p(...b), ...p(...c))

/** Bas de caisse : nez, capot, ligne de ceinture, plage arrière, poupe et passages de roue. */
function lowerBody(): Shape {
  return shape([16, 113], (s, p) => {
    bez(s, p, [10, 110], [6, 102], [7, 93])
    bez(s, p, [8, 85], [12, 79], [20, 76])
    bez(s, p, [50, 70], [90, 64], [120, 57])
    bez(s, p, [180, 56], [280, 52], [346, 47])
    s.lineTo(...p(367, 42.5))
    bez(s, p, [381, 43], [389, 50], [391, 61])
    bez(s, p, [393, 74], [392, 88], [389, 100])
    bez(s, p, [387, 108], [383, 113], [376, 113])
    s.lineTo(...p(337, 113))
    // passages de roue : arcs de rayon 29 centrés sur les essieux, au-dessus du bas de caisse
    s.absarc(X(310), Y(104), 29 * S, -0.32, Math.PI + 0.32, false)
    s.lineTo(...p(103, 113))
    s.absarc(X(76), Y(104), 29 * S, -0.32, Math.PI + 0.32, false)
    s.lineTo(...p(24, 113))
    s.lineTo(...p(16, 113))
  })
}

/** Habitacle vitré (pare-brise, toit en verre, lunette), plus étroit que la caisse. */
function greenhouse(): Shape {
  return shape([118, 59], (s, p) => {
    bez(s, p, [140, 40], [165, 22], [200, 14])
    bez(s, p, [235, 10], [275, 14], [305, 24])
    bez(s, p, [325, 31], [345, 40], [360, 45])
    bez(s, p, [300, 52], [200, 58], [118, 59])
  })
}

function hoodShape(): Shape {
  return shape([20, 76], (s, p) => {
    bez(s, p, [50, 70], [90, 64], [120, 57])
    s.lineTo(...p(120, 60))
    bez(s, p, [90, 67], [50, 73], [22, 79])
  })
}
function trunkShape(): Shape {
  return shape([346, 47], (s, p) => {
    s.lineTo(...p(367, 42.5))
    bez(s, p, [381, 43], [389, 50], [391, 61])
    s.lineTo(...p(388, 62))
    bez(s, p, [386, 52], [378, 47], [366, 46])
    s.lineTo(...p(346, 50))
  })
}

/** Galbe : rétrécit la largeur (z) selon la position — avant et arrière arrondis en plan, flancs et toit rentrants. */
type Taper = (x: number, y: number) => number
const XMIN = X(6)
const XMAX = X(393)
const planTaper = (x: number) => {
  const u = (x - XMIN) / (XMAX - XMIN)
  if (u < 0.2) return 0.74 + 0.26 * Math.sin(((u / 0.2) * Math.PI) / 2)
  if (u > 0.86) return 0.84 + 0.16 * Math.cos((((u - 0.86) / 0.14) * Math.PI) / 2)
  return 1
}
const BODY_TAPER: Taper = (x, y) => planTaper(x) * (y > 0.5 ? 1 - 0.1 * ((y - 0.5) / 0.5) ** 1.4 : y < 0.18 ? 0.95 + (y / 0.18) * 0.05 : 1)
const CABIN_TAPER: Taper = (x, y) => (0.9 + 0.1 * planTaper(x)) * (1 - 0.3 * MathUtils.clamp((y - 0.78) / 0.6, 0, 1) ** 1.2)

function extrude(sh: Shape, width: number, bevel: number, segments = 5, taper?: Taper) {
  const g = new ExtrudeGeometry(sh, { depth: width - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: Math.min(bevel * 0.7, 0.05), bevelSegments: segments, curveSegments: 18 })
  g.translate(0, 0, -(width - bevel * 2) / 2)
  if (taper) {
    const pos = g.attributes.position!
    for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) * taper(pos.getX(i), pos.getY(i)))
    g.computeVertexNormals()
  }
  return g
}

export interface Model3 {
  root: Group
  hood: Group
  trunk: Group
  wheels: Group[]
  blinkers: { left: Mesh[]; right: Mesh[] }
  paint: MeshStandardMaterial
  dispose: () => void
}

export function buildModel3(paintColor = '#f1f2f4', ghost = false): Model3 {
  const paint = new MeshStandardMaterial({ color: paintColor, metalness: ghost ? 0.1 : 0.35, roughness: ghost ? 0.6 : 0.3 })
  const glass = new MeshStandardMaterial({ color: '#0b0c0e', metalness: 0.6, roughness: 0.08 })
  const trim = new MeshStandardMaterial({ color: '#1c1e22', roughness: 0.7 })
  const tire = new MeshStandardMaterial({ color: '#111214', roughness: 0.9 })
  const rim = new MeshStandardMaterial({ color: '#9aa0a8', metalness: 0.8, roughness: 0.35 })
  const head = new MeshStandardMaterial({ color: '#ffffff', emissive: '#e8f0ff', emissiveIntensity: 1.2 })
  const tail = new MeshStandardMaterial({ color: '#7a0d14', emissive: '#d0101c', emissiveIntensity: 0.9 })
  const amber = new MeshStandardMaterial({ color: '#ffb02e', emissive: '#ffb02e', emissiveIntensity: 0 })
  const materials: Material[] = [paint, glass, trim, tire, rim, head, tail, amber]

  const root = new Group()
  const body = new Mesh(extrude(lowerBody(), WIDTH, 0.14, 6, BODY_TAPER), paint)
  const cabin = new Mesh(extrude(greenhouse(), WIDTH - 0.12, 0.16, 6, CABIN_TAPER), ghost ? paint : glass)
  root.add(body, cabin)

  // capot avant et coffre arrière : pivotent autour de leur charnière
  const hood = new Group()
  // légèrement surélevés pour ne pas se confondre avec la surface de la caisse
  hood.position.set(X(120), Y(57) + 0.008, 0)
  const hoodMesh = new Mesh(extrude(hoodShape(), WIDTH - 0.2, 0.05, 3, BODY_TAPER), paint)
  hoodMesh.position.set(-X(120), -Y(57), 0)
  hood.add(hoodMesh)
  const trunk = new Group()
  trunk.position.set(X(346), Y(47) + 0.008, 0)
  const trunkMesh = new Mesh(extrude(trunkShape(), WIDTH - 0.2, 0.05, 3, BODY_TAPER), paint)
  trunkMesh.position.set(-X(346), -Y(47), 0)
  trunk.add(trunkMesh)
  root.add(hood, trunk)

  if (!ghost) {
    // phares, feux arrière, rétroviseurs, bas de caisse noir
    for (const z of [-0.62, 0.62]) {
      const h = new Mesh(new BoxGeometry(0.06, 0.035, 0.42), head)
      h.position.set(X(13), Y(83), z)
      h.rotation.z = -0.35
      root.add(h)
    }
    const t = new Mesh(new BoxGeometry(0.05, 0.05, WIDTH - 0.32), tail)
    t.position.set(X(391), Y(57), 0)
    root.add(t)
    for (const z of [-1, 1]) {
      const m = new Mesh(new BoxGeometry(0.2, 0.09, 0.16), trim)
      m.position.set(X(144), Y(58), z * (WIDTH / 2 + 0.04))
      root.add(m)
    }
    const sill = new Mesh(new BoxGeometry(X(282) - X(104), 0.06, WIDTH + 0.01), trim)
    sill.position.set((X(282) + X(104)) / 2, Y(111), 0)
    root.add(sill)
  }

  const blinkers = { left: [] as Mesh[], right: [] as Mesh[] }
  if (!ghost) {
    for (const [side, z] of [['left', 1], ['right', -1]] as const) {
      for (const [x, y] of [[X(12), Y(86)], [X(388), Y(60)]] as const) {
        const b = new Mesh(new BoxGeometry(0.06, 0.04, 0.12), amber.clone())
        b.position.set(x, y, z * (WIDTH / 2 - 0.12))
        materials.push(b.material as Material)
        blinkers[side].push(b)
        root.add(b)
      }
    }
  }

  // roues : pneu, jante (côté extérieur) et moyeu ; axe de rotation Z
  const wheels: Group[] = []
  const tireGeo = new CylinderGeometry(WHEEL_R, WHEEL_R, 0.24, 36)
  tireGeo.rotateX(Math.PI / 2)
  const rimGeo = new CylinderGeometry(WHEEL_R * 0.72, WHEEL_R * 0.72, 0.02, 30)
  rimGeo.rotateX(Math.PI / 2)
  const spokeGeo = new BoxGeometry(0.05, WHEEL_R * 1.3, 0.025)
  for (const x of AXLES) {
    for (const z of [-1, 1]) {
      const w = new Group()
      w.position.set(x, WHEEL_Y, z * (WIDTH / 2 - 0.14))
      w.add(new Mesh(tireGeo, tire))
      if (!ghost) {
        const r = new Mesh(rimGeo, rim)
        r.position.z = z * 0.125
        w.add(r)
        for (let i = 0; i < 5; i++) {
          const sp = new Mesh(spokeGeo, trim)
          sp.position.z = z * 0.137
          sp.rotation.z = (i * Math.PI * 2) / 5
          w.add(sp)
        }
      }
      wheels.push(w)
      root.add(w)
    }
  }

  root.traverse((o) => {
    if (o instanceof Mesh) {
      o.castShadow = true
      o.receiveShadow = !ghost
    }
  })

  return {
    root,
    hood,
    trunk,
    wheels,
    blinkers,
    paint,
    dispose: () => {
      root.traverse((o) => o instanceof Mesh && o.geometry.dispose())
      materials.forEach((m) => m.dispose())
    },
  }
}

/** Points d'accroche des repères (coordonnées du véhicule). */
export const ANCHORS = {
  frunk: [X(70), Y(66), 0.4],
  roof: [X(215), Y(12), 0],
  trunk: [X(366), Y(44), 0.3],
  port: [X(386), Y(60), WIDTH / 2],
} as const
