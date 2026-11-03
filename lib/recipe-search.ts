/** Search titles regardless of accents, French ligatures, punctuation or case. */
export function normalizeRecipeSearch(value: string): string {
  return value.toLocaleLowerCase('fr-FR').replaceAll('œ', 'oe').replaceAll('æ', 'ae')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim()
}
