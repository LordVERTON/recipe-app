import type { ParsedRecipe } from './types'

export function validateRecipeDraft(draft: ParsedRecipe): string[] {
  const errors: string[] = []
  if (!draft.nom || draft.nom.trim().length < 2 || draft.nom.trim().length > 150) errors.push('Nom : entre 2 et 150 caractères.')
  if ((draft.description?.length ?? 0) > 2000) errors.push('Description : 2 000 caractères maximum.')
  if (!Number.isInteger(draft.servings) || draft.servings! < 1 || draft.servings! > 50) errors.push('Portions : entier de 1 à 50 requis.')
  if (!Number.isInteger(draft.estimatedTime) || draft.estimatedTime! < 1 || draft.estimatedTime! > 1440) errors.push('Durée totale : entier de 1 à 1 440 minutes requis.')
  for (const time of [draft.preparationTime, draft.cookingTime]) {
    if (time !== undefined && (!Number.isInteger(time) || time < 0 || time > 1440)) errors.push('Préparation/cuisson : entier de 0 à 1 440 minutes si renseigné.')
  }
  if (!['hiver', 'printemps', 'été', 'automne'].includes(draft.saison ?? '')) errors.push('Choisir une saison.')
  if (!['salé', 'sucré'].includes(draft.categorie ?? '')) errors.push('Choisir une catégorie.')
  if (!['dejeuner/diner', 'petit_dejeuner', 'dessert', 'aperitif'].includes(draft.tag ?? '')) errors.push('Choisir un type de repas.')
  if (draft.ingredients.length < 1 || draft.ingredients.length > 60) errors.push('Prévoir entre 1 et 60 ingrédients.')
  draft.ingredients.forEach((i, index) => {
    if (!i.name.trim() || i.name.trim().length > 120 || (i.quantity?.length ?? 0) > 40 || (i.unit?.length ?? 0) > 30) errors.push(`Ingrédient ${index + 1} : nom 1–120, quantité ≤40 et unité ≤30 caractères.`)
  })
  if (draft.instructions.length < 1 || draft.instructions.length > 50 || draft.instructions.some(s => !s.trim() || s.trim().length > 2000)) errors.push('Prévoir entre 1 et 50 étapes, de 1 à 2 000 caractères chacune.')
  return errors
}
/** Form prefill contract, NOT a submission payload: absent data stays absent. */
export function toPersonalRecipeFormData(draft: ParsedRecipe) {
  return {
    values: {
      nom: draft.nom, description: draft.description, servings: draft.servings,
      estimated_time: draft.estimatedTime, saison: draft.saison, categorie: draft.categorie, tag: draft.tag,
      ingredients: draft.ingredients.map(({ name, quantity, unit }) => ({ name, quantity, unit })),
      instructions: [...draft.instructions],
    },
    origins: { ...draft.origins },
    ingredientNotes: draft.ingredients.map(({ group, optional, warnings }) => ({ group, optional, warnings: [...warnings] })),
    timingNotes: { preparationTime: draft.preparationTime, cookingTime: draft.cookingTime },
    unrecognized: [...draft.unrecognized],
    rawText: draft.rawText,
  }
}
