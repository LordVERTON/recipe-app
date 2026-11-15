import type { ParsedIngredient, ParsedRecipe } from './types'

const ingredientHeading = /^(ingr[ée]dients?)\s*[:：]?$/i
const instructionHeading = /^(instructions?|pr[ée]paration|[ée]tapes?|m[ée]thode)\s*[:：]?$/i
const ignoredLine = /^(https?:\/\/|#|@[\w.]+|\*|\||---)/
const culinary = /^(?:ajouter|ajoutez|m[ée]langer|m[ée]langez|faire |faites |incorporer|incorporez|verser|versez|saupoudrer|saupoudrez|assaisonner|assaisonnez|laisser|laissez|couper|coupez|pr[ée]parer|assembler|enfourner|cuire|chauffer|battre|[ée]mincer|servir|r[ée]server|remuer|[ée]taler|[ée]plucher|pr[ée]chauffer)/i
const noise = /^(?:https?:|#|@|abonne[zr]|suivez|retrouve[zr]|lien en bio|code promo|partage[zr]|conseils?\s*:|astuces?\s*:)/i
const amountPattern = '(?:environ\\s+)?(?:\\d+(?:[.,]\\d+)?(?:\\s*\/\\s*\\d+)?|[½¼¾⅓⅔]|un peu|une?|quelques?|du|de la|des)'
const quantity = new RegExp(`^(${amountPattern}(?:\\s+(?:à|a|ou|-)\\s+${amountPattern})?)\\s*(.*)$`, 'i')
const unitPattern = /^(c\.?\s*(?:à|a)\s*(?:soupe|caf[ée])|cuill[èe]res?(?:\s+(?:à|a)\s+(?:soupe|caf[ée]))?|kg|mg|g|ml|cl|dl|litres?|l|grammes?|kilogrammes?|bo[iî]tes?|paquets?|sachets?|pinc[ée]es?|feuilles?|gousses?|verres?|tasses?|cubes?)(?:\s+|(?=d['’]))(.*)$/i
const cleanLine = (line: string) => line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').replace(/\s+/g, ' ').trim()
const cleanRecipeLine = (line: string) => line.replace(/^\s*(?:[-•*]\s*|\d+[.)]\s+)/, '').replace(/\s+/g, ' ').trim()

export function parseIngredient(line: string, group?: string): ParsedIngredient {
  const optional = /facultatif|en option|optionnel/i.test(line)
  const cleaned = line.replace(/\s*\(?\b(?:facultatif|en option|optionnel)(?:le)?\b\)?/gi, '').trim()
  const match = cleaned.match(quantity)
  let name = cleaned, amount: string | undefined, unit: string | undefined
  if (match && match[2] && !/^\d+[oOI](?=\s|$)/.test(cleaned)) {
    amount = match[1]; name = match[2]
    const unitMatch = name.match(unitPattern)
    if (unitMatch) { unit = unitMatch[1]; name = unitMatch[2] }
    name = name.replace(/^(?:de\s+|d['’])/, '').trim()
  }
  const warnings: string[] = []
  if (amount && /à|\bou\b|-|peu|quelques|environ|^du$|^de la$|^des$/i.test(amount)) warnings.push('Quantité approximative ou intervalle conservé : à vérifier.')
  if (optional) warnings.push('Ingrédient facultatif ; conserver cette mention lors de la future intégration.')
  if (!amount) warnings.push('Quantité non indiquée ou non reconnue.')
  if (/[0-9][oOlI]|[oOlI][0-9]/.test(line)) warnings.push('Caractère OCR ambigu dans la quantité ; aucune correction automatique.')
  return { name, quantity: amount, unit, group, optional, raw: line, warnings }
}
// Each returned food name is an exact source span; no guessed quantities or synonyms.
const narrativeFoods = /(?<![\p{L}])(?:huile d['’]olive|viande de porc|bouillon de poule|vin blanc|pois chiches|oignons?|porc|chocolat(?: p[âa]tissier)?|beurre(?: demi-sel)?|[œo]e?ufs?|farine|levure(?: chimique)?|basilic|paprika|curry|cr[èe]me|sucre|sel|poivre|eau)(?![\p{L}])/giu
function fromNarrative(line: string): ParsedIngredient[] {
  return [...line.matchAll(narrativeFoods)].map(match => {
    const prefix = line.slice(0, match.index)
    const amount = prefix.match(new RegExp(`(${amountPattern}(?:\\s+(?:à|a|ou|-)\\s+${amountPattern})?)\\s+(?:(cube|g|kg|ml|cl|l)\\s+de\\s+)?$`, 'i'))
    return { name: match[0], quantity: amount?.[1], unit: amount?.[2], raw: line,
      warnings: ['Extrait d’une instruction : vérifier le nom, la quantité et les ingrédients manquants.'] }
  })
}
export function parseRecipeText(rawText: string): ParsedRecipe {
  const result: ParsedRecipe = { rawText, ingredients: [], instructions: [], unrecognized: [], warnings: [], origins: {} }
  const lines = rawText.split(/\r?\n/).map(cleanRecipeLine).filter(Boolean)
  let section: 'ingredients' | 'instructions' | null = null
  let group: string | undefined
  const descriptions: string[] = []
  for (const [index, line] of lines.entries()) {
    if (noise.test(line)) { result.unrecognized.push(line); continue }
    const servings = line.match(/^(?:pour\s+)?(\d+)\s*(?:personnes?|pers\.?|portions?|parts?)\s*[:.]?$/i) ?? line.match(/^portions?\s*:\s*(\d+)$/i)
    if (servings) { result.servings = Number(servings[1]); result.origins.servings = 'extracted'; continue }
    const time = line.match(/^(temps\s+(?:de\s+)?)?(pr[ée]paration|cuisson|total|dur[ée]e(?: totale)?)\s*:\s*(?:(\d+)\s*h(?:eures?)?\s*)?(?:(\d+)\s*(?:min(?:utes?)?)?)?\s*$/i)
    if (time && (time[3] || time[4])) {
      const minutes = Number(time[3] ?? 0) * 60 + Number(time[4] ?? 0)
      const field = /^pr/i.test(time[2]) ? 'preparationTime' : /^cu/i.test(time[2]) ? 'cookingTime' : 'estimatedTime'
      result[field] = minutes; result.origins[field] = 'extracted'; continue
    }
    if (ingredientHeading.test(line)) { section = 'ingredients'; group = undefined; continue }
    if (instructionHeading.test(line)) { section = 'instructions'; continue }
    if (/^pour (?:la |le |les |l['’])[^:：]{1,80}\s*[:：]$/i.test(line)) { section = 'ingredients'; group = line.replace(/[:：]$/, '').trim(); continue }
    if (culinary.test(line)) section = 'instructions'
    if (section === 'instructions') { result.instructions.push(line); continue }
    if (section === 'ingredients' || quantity.test(line)) { result.ingredients.push(parseIngredient(line, group)); continue }
    if (!result.nom && index === 0 && line.length >= 4 && line.length <= 150 && !line.endsWith(':')) {
      result.nom = line; result.origins.nom = 'extracted'
    } else if (!section && result.nom) descriptions.push(line)
    else result.unrecognized.push(line)
  }
  if (descriptions.length) { result.description = descriptions.join('\n'); result.origins.description = 'extracted' }
  if (!result.ingredients.length && result.instructions.length) {
    for (const item of result.instructions.flatMap(fromNarrative)) {
      const existing = result.ingredients.find(i => i.name.toLocaleLowerCase('fr') === item.name.toLocaleLowerCase('fr') && (!i.quantity || !item.quantity || i.quantity === item.quantity))
      if (!existing) result.ingredients.push(item)
      else if (!existing.quantity && item.quantity) Object.assign(existing, item)
    }
    result.warnings.push('Extraction partielle depuis les phrases : liste des ingrédients à compléter manuellement.')
  }
  if (!result.nom) result.warnings.push('Aucun titre fiable trouvé.')
  else result.warnings.push('Titre candidat : confirmer qu’il s’agit bien du nom de la recette.')
  if (!result.ingredients.length) result.warnings.push('Aucun ingrédient identifié.')
  if (!result.instructions.length) result.warnings.push('Étapes absentes ou incomplètes.')
  if (result.servings === undefined) result.warnings.push('Nombre de portions inconnu.')
  if (result.estimatedTime === undefined) result.warnings.push('Durée totale inconnue : à renseigner, même si préparation/cuisson sont indiquées.')
  const numberedSteps = rawText.split(/\r?\n/).map(line => line.match(/^\s*(\d+)[.)]\s+\D/)).filter(match => match !== null).map(match => Number(match[1]))
  if (numberedSteps.some((n, i) => n !== i + 1)) result.warnings.push('Numérotation discontinue : vérifier que toutes les étapes sont présentes.')
  result.warnings.push('Saison, catégorie et type de repas à choisir avant confirmation.')
  return result
}

/** Existing Instagram API contract, deliberately unchanged during the experiment. */
export function parseInstagramCaption(caption: string) {
  const lines = caption.split(/\r?\n/).map(cleanLine).filter(Boolean)
  const ingredients: { name: string; quantity?: string }[] = []
  const instructions: string[] = []
  let section: 'ingredients' | 'instructions' | null = null
  for (const line of lines) {
    if (ingredientHeading.test(line)) { section = 'ingredients'; continue }
    if (instructionHeading.test(line)) { section = 'instructions'; continue }
    if (section === 'ingredients' && !ignoredLine.test(line)) {
      const match = line.match(/^((?:\d+[\d.,/]*|une?|un|quelques?)\s*(?:g|kg|ml|cl|l|c\.?(?:à|a)\s*soupe|c\.?(?:à|a)\s*café|cuillères?[^ ]*)?)\s+(.+)$/i)
      ingredients.push(match ? { quantity: match[1], name: match[2] } : { name: line })
    }
    if (section === 'instructions' && !ignoredLine.test(line)) instructions.push(line)
  }
  return {
    title: lines.find(line => line.length > 3 && line.length < 90 && !ignoredLine.test(line) && !ingredientHeading.test(line) && !instructionHeading.test(line)) || 'Nouvelle recette',
    ingredients, instructions, description: caption.slice(0, 500),
  }
}
