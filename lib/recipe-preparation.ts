import corrections from './data/crous-preparations.json'
import type { Recipe, Ingredient } from './types'

interface PreparationCorrection {
  title: string
  correctedTitle?: string
  sourcePdf: string
  sourcePage: number
  legacyInstructions: string[]
  instructions: string[]
  legacyIngredients?: Ingredient[]
  ingredients?: Ingredient[]
  legacyPortions?: string
  portions?: string
}

const recipes: Record<string, PreparationCorrection> = corrections.recipes
const comparable = (steps: string[]) => JSON.stringify(steps.map(step => step.replace(/\s+/g, ' ').trim()))
const comparableIngredients = (items: Ingredient[]) => JSON.stringify(items.map(item => [item.name, item.quantity ?? '', item.unit ?? '', item.category ?? '', item.canonical ?? true]))

/** Repair only the known imported text; a subsequent editorial edit wins. */
export function restoreRecipePreparation(recipe: Recipe): Recipe {
  const correction = recipes[recipe.id]
  if (recipe.source !== 'crous' || !correction || recipe.source_pdf !== correction.sourcePdf
    || recipe.nom.trim().toLocaleLowerCase('fr-FR') !== correction.title.trim().toLocaleLowerCase('fr-FR')
    || comparable(recipe.instructions) !== comparable(correction.legacyInstructions)) return recipe
  const ingredientsMatch = correction.legacyIngredients
    && comparableIngredients(recipe.ingredients) === comparableIngredients(correction.legacyIngredients)
  return {
    ...recipe,
    nom: correction.correctedTitle ?? recipe.nom,
    instructions: correction.instructions,
    source_page: correction.sourcePage,
    ...(ingredientsMatch && correction.ingredients ? {
      ingredients: correction.ingredients,
      canonical_ingredients_status: 'partial' as const,
      ...(recipe.portions === correction.legacyPortions && correction.portions ? { portions: correction.portions } : {}),
    } : {}),
  }
}

export function preparationSteps(instructions: string[]): string[] {
  return instructions.flatMap(step => step.replace(/\r\n?/g, '\n')
    .split(/\n(?=\s*(?:(?:[Éé]tape\s+)?\d+[.)°]\s+|[-•]\s+))/))
    .map(step => step.replace(/^\s*(?:(?:[Éé]tape\s+)?\d+[.)°]\s+|[-•]\s+)/, '').trim())
    .filter(Boolean)
}

export function hasBriefPreparation(instructions: string[]): boolean {
  return instructions.join(' ').trim().length < 50
}
