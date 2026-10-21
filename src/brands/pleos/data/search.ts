import { normalize } from '@/core/format'
import { MANUAL, type ManualEntry } from './manual'

const STOP = new Set(['comment', 'est', 'que', 'les', 'des', 'une', 'pour', 'quoi', 'mon', 'dans', 'faire', 'quel', 'quelle', 'avec', 'fonctionne', 'explique', 'moi'])

/** Recherche plein texte simple dans le manuel : une entrée gagne un point par mot trouvé. */
export function searchManual(query: string): { entry: ManualEntry; score: number }[] {
  const words = normalize(query)
    .split(/[^a-z0-9-]+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
  return MANUAL.map((entry) => ({
    entry,
    score: words.reduce((acc, w) => acc + (normalize(`${entry.keywords} ${entry.title}`).includes(w) ? 1 : 0), 0),
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
}
