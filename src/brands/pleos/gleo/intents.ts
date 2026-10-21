import { distance, normalize } from '@/core/format'
import { CONTACTS, MESSAGES, PLACES, RADIO } from '@/core/vehicle/data'
import { etaMinutes } from '@/core/vehicle/simulation'
import type { VehicleStore } from '@/core/vehicle/store'
import type { Place } from '@/core/vehicle/types'
import { BUILTIN_APPS, type BuiltinAppId } from '../catalog'
import { searchManual } from '../data/search'
import type { PleosStore } from '../store/pleos'

export interface GleoReply {
  text: string
  link?: { label: string; manualId: string }
}

interface Ctx {
  vehicle: VehicleStore
  pleos: PleosStore
}

type Intent = (t: string, raw: string, ctx: Ctx) => GleoReply | string | null

const OFF = /(eteins|arrete|coupe|desactive|stop)/
const QUESTION = /^(comment|que |qu'|quel|quelle|pourquoi|c'est quoi|a quoi|ou se|ou est|explique)/

const fmtT = (v: number) => v.toFixed(1).replace('.', ',') + ' °C'

function findPlace(q: string): Place | undefined {
  if (/travail|bureau|boulot/.test(q)) return PLACES.find((p) => p.id === 'work')
  if (/maison|domicile|chez moi/.test(q)) return PLACES.find((p) => p.id === 'home')
  return PLACES.find(
    (p) => normalize(p.name).includes(q) || q.split(' ').some((w) => w.length > 3 && normalize(`${p.name} ${p.address}`).includes(w)),
  )
}

function go(ctx: Ctx, place: Place): string {
  ctx.vehicle.navigateTo(place)
  ctx.pleos.launch('nav')
  const arrival = Math.round(ctx.vehicle.battery - place.km / 4.96)
  return `Itinéraire vers ${place.name} : ${distance(place.km)}, environ ${place.minutes} min.${arrival < 10 ? ' Un arrêt recharge sera nécessaire.' : ''}`
}

/** Intentions dans l'ordre de priorité, d'après les exemples de commandes du manuel. */
const INTENTS: Intent[] = [
  (t) => (/que peux-tu faire|tu sais faire|aide/.test(t) ? 'Je peux gérer la navigation, les appels et messages, la climatisation, les fenêtres, le coffre et la trappe de recharge, la musique et le volume, et répondre sur le véhicule.' : null),
  (t, _r, { vehicle }) => (/(autonomie|combien de km)/.test(t) ? `Il vous reste environ ${distance(vehicle.range)} d’autonomie, batterie à ${Math.round(vehicle.battery)} %.` : null),
  (t) => (/pression.*pneu/.test(t) ? 'Pressions normales : 2,5 bar à l’avant, 2,4 bar à l’arrière.' : null),
  (t, _r, { vehicle }) => (/temps de conduite|resume du trajet/.test(t) ? `Trajet actuel : ${distance(vehicle.trip)} en ${Math.round(vehicle.tripMinutes)} min.` : null),
  (t) => {
    if (!QUESTION.test(t)) return null
    const hit = searchManual(t)[0]
    return hit ? { text: hit.entry.body, link: { label: `Ouvrir « ${hit.entry.title} »`, manualId: hit.entry.id } } : null
  },
  (t, _r, { vehicle }) => {
    const m = t.match(/(\d{2}(?:[.,]5)?)\s*(?:°|degre)/)
    if (!m) return null
    const v = parseFloat(m[1]!.replace(',', '.'))
    if (/passager/.test(t)) {
      vehicle.climate.sync = false
      vehicle.setTemp('R', v)
      return `Température passager réglée à ${fmtT(vehicle.climate.temp.R)}.`
    }
    vehicle.setTemp('L', v)
    return `Température réglée à ${fmtT(vehicle.climate.temp.L)}.`
  },
  (t, _r, { vehicle }) => {
    if (!/(augmente|monte).*temperature|j'?ai (un peu |trop )?froid/.test(t)) return null
    vehicle.nudgeTemp('L', 1)
    return `Je monte la température à ${fmtT(vehicle.climate.temp.L)}.`
  },
  (t, _r, { vehicle }) => {
    if (!/(baisse|diminue).*temperature|j'?ai (un peu |trop )?chaud/.test(t)) return null
    vehicle.nudgeTemp('L', -1)
    return `Je baisse la température à ${fmtT(vehicle.climate.temp.L)}.`
  },
  (t, _r, { vehicle }) => {
    if (!/siege/.test(t)) return null
    const side = /passager/.test(t) ? 'R' : 'L'
    const who = side === 'L' ? 'conducteur' : 'passager'
    const off = OFF.test(t)
    const kind = /ventil|rafraich/.test(t) ? 'vent' : 'heat'
    vehicle.setSeat(side, kind, off ? 0 : 2)
    if (kind === 'vent') return off ? 'Ventilation du siège désactivée.' : `Ventilation du siège ${who} activée.`
    return off ? 'Chauffage du siège désactivé.' : `Chauffage du siège ${who} activé.`
  },
  (t, _r, { vehicle }) => {
    if (!/volant/.test(t)) return null
    vehicle.climate.wheelHeat = !OFF.test(t)
    return vehicle.climate.wheelHeat ? 'Volant chauffant activé.' : 'Volant chauffant désactivé.'
  },
  (t, _r, { vehicle }) => {
    if (!/(recyclage|recirculation)/.test(t)) return null
    vehicle.climate.recirc = !OFF.test(t)
    return vehicle.climate.recirc ? 'Air recyclé activé.' : 'Air recyclé désactivé.'
  },
  (t, _r, { vehicle }) => {
    if (!/(chauffage|climatisation|\bclim)/.test(t)) return null
    const off = OFF.test(t)
    vehicle.climate.on = !off
    if (!off && /clim/.test(t)) vehicle.climate.ac = true
    return off ? (/chauffage/.test(t) ? 'Chauffage désactivé.' : 'Climatisation désactivée.') : 'Climatisation activée.'
  },
  (t, _r, { vehicle }) => {
    if (!/(fenetre|vitre)/.test(t)) return null
    const open = /(ouvr|baisse|descend|entrouv)/.test(t)
    if (open && vehicle.speed > 90) return 'Je préfère ne pas ouvrir les fenêtres au-delà de 90 km/h.'
    vehicle.body.windowsOpen = open
    return open ? (/entrouv/.test(t) ? 'J’entrouvre la fenêtre conducteur.' : 'J’ouvre les fenêtres.') : 'Je ferme toutes les fenêtres.'
  },
  (t, _r, { vehicle }) => {
    if (!/coffre|hayon/.test(t)) return null
    if (vehicle.moving) return 'Le coffre ne peut s’ouvrir qu’à l’arrêt.'
    vehicle.body.trunkOpen = /ouvr/.test(t)
    return vehicle.body.trunkOpen ? 'J’ouvre le coffre.' : 'Je ferme le coffre.'
  },
  (t, _r, { vehicle }) => {
    if (!/trappe/.test(t)) return null
    vehicle.body.chargePortOpen = /ouvr/.test(t)
    return vehicle.body.chargePortOpen ? 'J’ouvre la trappe de recharge.' : 'Je ferme la trappe de recharge.'
  },
  (t, _r, { vehicle }) => {
    if (!/retro/.test(t)) return null
    vehicle.body.mirrorsFolded = /(rabat|ferm|repli)/.test(t)
    return vehicle.body.mirrorsFolded ? 'Rétroviseurs rabattus.' : 'Rétroviseurs dépliés.'
  },
  (t, _r, { vehicle }) => {
    if (!/(annule|arrete|stop).*(guidage|navigation|itineraire)/.test(t)) return null
    vehicle.cancelRoute()
    return 'Itinéraire annulé.'
  },
  (t, _r, { vehicle }) => {
    if (!/apercu du trajet|informations sur la destination/.test(t)) return null
    if (!vehicle.nav.destination) return 'Aucun itinéraire en cours.'
    return `${vehicle.nav.destination.name} : ${distance(vehicle.nav.remainingKm)}, arrivée dans ${etaMinutes(vehicle.nav)} min.`
  },
  (t, _r, ctx) => (/(borne|recharger|station de charge|ou charger)/.test(t) ? go(ctx, PLACES.find((p) => p.id === 'ionity')!) : null),
  (t, _r, ctx) => {
    const m = t.match(/(?:aller a ?:?|emmene[- ]?moi|amene[- ]?moi|aller|va|navigue|itineraire|guide[- ]?moi|direction|conduis[- ]?moi|rentre)\s*(?:jusqu'a|a la|a l'|au|aux|a|vers|chez|pour|:)?\s*(.*)$/)
    if (!m) return null
    const q = (m[1] ?? '').replace(/^(le|la|les|l')\s*/, '').replace(/[.:]/g, '').trim()
    if (!q && !/rentre/.test(t)) return null
    const place = findPlace(q || 'maison')
    if (place) return go(ctx, place)
    const name = q.charAt(0).toUpperCase() + q.slice(1)
    return go(ctx, { id: 'custom', name, address: 'Adresse', km: 12.5, minutes: 24, kind: 'address' })
  },
  (t, _r, { vehicle }) => {
    const m = t.match(/(?:appel(?:le|er)?|composer le)\s+(.+)/)
    if (!m) return null
    const q = m[1]!
    const contact = CONTACTS.find((c) => normalize(c).split(/\s+/).some((w) => w.length > 2 && q.includes(w)))
    if (contact) {
      vehicle.dial(contact)
      return `J’appelle ${contact}.`
    }
    if (/\d/.test(q)) {
      vehicle.dial(q)
      return `Je compose le ${q}.`
    }
    return 'Je ne trouve pas ce contact.'
  },
  (t, _r, { vehicle }) => {
    if (!/^(accepter|repondre)/.test(t) || !vehicle.call) return null
    vehicle.answer()
    return 'Appel accepté.'
  },
  (t) => (/lire.*message/.test(t) ? `Message de ${MESSAGES[0]!.from} : ${MESSAGES[0]!.text}` : null),
  (t, _r, { pleos }) => {
    const m = t.match(/^ouvr\w*\s*(.+)/)
    if (!m) return null
    const q = m[1]!.replace(/^(l'|la |le )/, '').replace(/[.]/g, '').trim()
    const id = (Object.keys(BUILTIN_APPS) as BuiltinAppId[]).find((k) => normalize(BUILTIN_APPS[k].name).includes(q))
    if (!id) return null
    pleos.launch(id)
    return `J’ouvre ${BUILTIN_APPS[id].name}.`
  },
  (t, _r, { pleos }) => {
    const m = t.match(/rechercher parametres? pour (?:la |le )?(.+)/)
    if (!m) return null
    const q = m[1]!.replace(/[<>.]/g, '').trim()
    pleos.openSettings(/bluetooth|wi-?fi|connexion/.test(q) ? 'connections' : 'quick')
    return `Voici les paramètres pour « ${q} ».`
  },
  (t, _r, { vehicle }) => {
    const station = RADIO.findIndex((r) => t.includes(normalize(r.name)))
    if (station < 0) return null
    vehicle.playStation(station)
    return `Je mets ${RADIO[station]!.name}.`
  },
  (t, _r, { vehicle }) => {
    if (!/(pause|stop la musique)/.test(t)) return null
    vehicle.media.playing = false
    return 'Musique en pause.'
  },
  (t, _r, { vehicle }) => {
    if (!/(suivant|suivante|next)/.test(t)) return null
    vehicle.step(1)
    return 'Titre suivant.'
  },
  (t, _r, { vehicle }) => {
    if (!/mode muet|silence/.test(t)) return null
    vehicle.media.muted = true
    return 'Son coupé.'
  },
  (t, _r, { vehicle }) => {
    if (!/volume.*minimum/.test(t)) return null
    vehicle.setVolume(1)
    return 'Volume au minimum.'
  },
  (t, _r, { vehicle }) => {
    if (!/(augmente|monte).*volume|plus fort/.test(t)) return null
    vehicle.setVolume(vehicle.media.volume + 3)
    return `Volume à ${vehicle.media.volume}.`
  },
  (t, _r, { vehicle }) => {
    if (!/(baisse|diminue).*volume|moins fort/.test(t)) return null
    vehicle.setVolume(vehicle.media.volume - 3)
    return `Volume à ${vehicle.media.volume}.`
  },
  (t, _r, { vehicle }) => {
    if (!/^musique|joue|lance la musique|mets de la musique|reprends/.test(t)) return null
    vehicle.media.source = 'bluetooth'
    vehicle.media.playing = true
    return `Lecture : ${vehicle.currentTrack.title}.`
  },
  (t, _r, { vehicle }) => {
    const m = t.match(/mode\s*(eco|normal|sport|neige|snow)/)
    if (!m) return null
    const mode = ({ eco: 'Eco', normal: 'Normal', sport: 'Sport', neige: 'Snow', snow: 'Snow' } as const)[m[1] as 'eco']
    vehicle.setFeature('driveMode', mode)
    return `Mode ${mode} activé.`
  },
  (t) => (/signe du zodiaque/.test(t) ? 'Dites-moi votre date de naissance et je vous réponds.' : null),
  (t) => (/couleur porte-bonheur/.test(t) ? 'Aujourd’hui, le bleu. Il va bien avec l’éclairage d’ambiance.' : null),
  (t) => (/destination touristique|seoul/.test(t) ? 'À Séoul, le palais Gyeongbokgung et le village de Bukchon sont incontournables, surtout au printemps.' : null),
  (t) => {
    const hit = searchManual(t)[0]
    return hit && hit.score >= 2 ? { text: hit.entry.body, link: { label: 'Ouvrir dans le manuel', manualId: hit.entry.id } } : null
  },
]

/**
 * Interprète une demande (plusieurs commandes possibles, séparées par « et », « puis », virgules)
 * et exécute les actions correspondantes.
 */
export function interpret(text: string, ctx: Ctx): GleoReply {
  const t = normalize(text.trim())
  const parts = QUESTION.test(t) ? [t] : t.split(/\s+(?:et|puis|ensuite)\s+|[,;]\s*/).filter((p) => p.trim().length > 1)
  const texts: string[] = []
  let link: GleoReply['link']
  for (const part of parts) {
    for (const intent of INTENTS) {
      const r = intent(part.trim(), text, ctx)
      if (!r) continue
      if (typeof r === 'string') texts.push(r)
      else {
        texts.push(r.text)
        link = r.link
      }
      break
    }
  }
  if (!texts.length) return { text: 'Je n’ai pas compris. Essayez « Aller à : Gare de Lyon » ou « Activer le chauffage du siège ».' }
  return { text: texts.join(' '), link }
}
