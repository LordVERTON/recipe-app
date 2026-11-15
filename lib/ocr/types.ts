import type { Season } from '../types'

export type ParsedIngredient = {
  name: string
  quantity?: string
  unit?: string
  group?: string
  optional?: boolean
  raw?: string
  warnings: string[]
}
export type ParsedRecipe = {
  nom?: string
  description?: string
  servings?: number
  preparationTime?: number
  cookingTime?: number
  estimatedTime?: number
  saison?: Season
  categorie?: 'salé' | 'sucré'
  tag?: 'dejeuner/diner' | 'petit_dejeuner' | 'dessert' | 'aperitif'
  ingredients: ParsedIngredient[]
  instructions: string[]
  unrecognized: string[]
  warnings: string[]
  rawText: string
  origins: Record<string, 'extracted' | 'manual'>
}
export type OcrLine = {
  text: string
  score: number
  poly: [number, number][]
  sourceIndex: number
  order: number
}
export type OcrPage = {
  lines: OcrLine[]
  width: number
  height: number
  elapsedMs: number
  runtime: string
}
