import { distance, normalize } from '@/core/format'
import { CONTACTS, PLACES } from '@/core/vehicle/data'
import type { VehicleStore } from '@/core/vehicle/store'

/**
 * Compréhension simple des commandes vocales pour IDA (Volkswagen) et Laura (Škoda) : navigation, climatisation,
 * sièges, médias, appels, autonomie et recharge. `open` affiche l'écran concerné dans l'interface de la marque.
 */
export type VoiceTarget = 'nav' | 'media' | 'phone' | 'climate' | 'charge'

export function understand(raw: string, vehicle: VehicleStore, open: (t: VoiceTarget) => void): string {
  const t = normalize(raw)
  const temp = t.match(/(\d{2}(?:[.,]5)?)\s*(?:°|degre)/)
  if (/(maison|domicile|chez moi|travail|bureau)/.test(t)) {
    const place = PLACES.find((p) => p.id === (/(travail|bureau)/.test(t) ? 'work' : 'home'))!
    vehicle.navigateTo(place)
    open('nav')
    return `C’est parti pour ${place.name} : ${distance(place.km)}, environ ${place.minutes} min.`
  }
  if (/(borne|recharg|superchargeur|ionity)/.test(t) && /(trouve|cherche|va|aller|emmene|proche)/.test(t)) {
    const place = PLACES.find((p) => p.kind === 'charger')!
    vehicle.navigateTo(place)
    open('nav')
    return `Guidage vers ${place.name}. Le préchauffage de la batterie démarrera en route.`
  }
  if (temp) {
    vehicle.setTemp('L', parseFloat(temp[1]!.replace(',', '.')))
    open('climate')
    return `Température réglée à ${vehicle.climate.temp.L.toFixed(1).replace('.', ',')} °C.`
  }
  if (/(j'ai froid|il fait froid|rechauffe)/.test(t)) {
    vehicle.nudgeTemp('L', 1.5)
    return `J’augmente la température à ${vehicle.climate.temp.L.toFixed(1).replace('.', ',')} °C.`
  }
  if (/(j'ai chaud|il fait chaud|rafraichi)/.test(t)) {
    vehicle.nudgeTemp('L', -1.5)
    return `Je baisse la température à ${vehicle.climate.temp.L.toFixed(1).replace('.', ',')} °C.`
  }
  if (/siege/.test(t)) {
    vehicle.setSeat('L', 'heat', /(eteins|arrete|coupe)/.test(t) ? 0 : 3)
    return vehicle.climate.seatHeat.L ? 'Chauffage du siège conducteur au niveau 3.' : 'Chauffage du siège désactivé.'
  }
  if (/(autonomie|batterie|combien de km)/.test(t)) return `Batterie à ${Math.round(vehicle.battery)} %, environ ${distance(vehicle.range)} d’autonomie.`
  if (/(recharge|charge)/.test(t)) {
    open('charge')
    return vehicle.chargeInfo.charging ? `${vehicle.chargeInfo.label}, encore ${vehicle.chargeInfo.minutesLeft} min.` : vehicle.plug === 'none' ? 'Le véhicule n’est pas branché.' : vehicle.chargeInfo.label
  }
  if (/(suivant|chanson suivante|titre suivant)/.test(t)) {
    vehicle.step(1)
    return 'Titre suivant.'
  }
  if (/(pause|arrete la musique|stop)/.test(t)) {
    vehicle.media.playing = false
    return 'Lecture en pause.'
  }
  if (/(musique|joue|radio)/.test(t)) {
    if (/radio/.test(t)) vehicle.media.source = 'radio'
    vehicle.media.playing = true
    open('media')
    return 'Lecture en cours.'
  }
  const contact = CONTACTS.find((c) => t.includes(normalize(c).split(' ')[0]!))
  if (/appel/.test(t) && contact) {
    vehicle.dial(contact)
    open('phone')
    return `J’appelle ${contact}.`
  }
  if (/(aide|que peux-tu|tu sais faire)/.test(t)) return 'Je peux vous guider, régler la climatisation et les sièges, lancer la musique, appeler un contact ou vous informer sur la batterie et la recharge.'
  return 'Je n’ai pas compris. Essayez « Emmène-moi à la maison » ou « Mets 21 degrés ».'
}

export const SUGGESTIONS = ['Emmène-moi à la maison', 'Mets 21 degrés', 'Quelle est mon autonomie ?', 'Trouve une borne de recharge', 'Appelle Camille']
