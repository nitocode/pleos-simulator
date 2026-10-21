/** Formats français partagés par toutes les interfaces. */

export type DistanceUnit = 'km' | 'mi'
export type TempUnit = '°C' | '°F'

export const fmt1 = (v: number) => v.toFixed(1).replace('.', ',')
export const pad2 = (n: number) => String(n).padStart(2, '0')

export function mmss(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`
}

export function distance(km: number, unit: DistanceUnit = 'km'): string {
  const v = unit === 'mi' ? km * 0.621371 : km
  return `${v < 10 ? fmt1(v) : Math.round(v)} ${unit}`
}

export function speedIn(kmh: number, unit: DistanceUnit = 'km'): number {
  return unit === 'mi' ? Math.round(kmh * 0.621371) : kmh
}

export function temperature(c: number, unit: TempUnit = '°C'): { whole: string; decimal: string } {
  if (unit === '°F') return { whole: String(Math.round((c * 9) / 5 + 32)), decimal: '' }
  const [w, d] = c.toFixed(1).split('.')
  return { whole: w!, decimal: d === '0' ? '0' : d! }
}

export function clock(date: Date, h24 = true): string {
  if (h24) return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
  const h = date.getHours() % 12 || 12
  return `${h}:${pad2(date.getMinutes())} ${date.getHours() < 12 ? 'AM' : 'PM'}`
}

/** Minuscules sans accents, pour les recherches et la compréhension des commandes vocales. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’]/g, "'")
}
