// Core recipe types for Broco-Chou

export type Season = "hiver" | "printemps" | "été" | "automne"
export type MealType = "petit_dejeuner" | "dejeuner" | "diner" | "dessert" | "aperitif" | "dejeuner/diner"
export type Difficulty = "très facile" | "facile" | "intermédiaire"
export type RecipeSource = "crous" | "broco-chou"
export type CanonicalStatus = "verified" | "partial" | "unknown"

export interface Ingredient {
  name: string
  quantity?: string
  unit?: string
  category?: string
  canonical?: boolean
}

export interface Recipe {
  id: string
  nom: string
  description?: string
  saison: Season
  mois: string
  mois_numero: number
  semaine?: number
  jour?: string
  tag: string
  categorie: "salé" | "sucré"
  theme_special?: string
  portions: string
  estimatedTime?: number
  difficulty?: Difficulty
  imageUrl?: string
  ingredients: Ingredient[]
  instructions: string[]
  astuce?: string
  cuisson_micro_ondes: boolean
  sans_four: boolean
  source: RecipeSource
  source_pdf?: string
  source_page?: number
  dietary_tags?: string[]
  main_ingredients?: string[]
  equipment?: string[]
  canonical_ingredients_status: CanonicalStatus
}

export type MealSlot = "dejeuner" | "diner" | "dessert"

export interface PlannedMeal {
  id: string
  recipeId: string
  recipe: Recipe
  dayDate: Date
  mealSlot: MealSlot
  status: "planifie" | "cuisine" | "remplace" | "saute"
}

export interface WeeklyPlan {
  id: string
  weekStart: Date
  weekEnd: Date
  meals: PlannedMeal[]
  balanceScore: number
  status: "draft" | "active" | "completed"
}

export interface RecipeHistory {
  recipeId: string
  cookedAt: Date
  feedback?: string
  rating?: number
  skipped: boolean
}

export interface UserPreferences {
  diet: "omnivore" | "vegetarien" | "pescetarien" | "sans_porc" | "sans_poisson"
  excludedIngredients: string[]
  favoriteIngredients: string[]
  mealSlots: MealSlot[]
  includeDessert: boolean
  includeBreakfast: boolean
  maxRepetitionPerMonth: number
  equipment: string[]
  budgetLevel: "etudiant" | "standard"
  difficultyLevel: Difficulty
}

export interface SwipeAction {
  recipeId: string
  action: "accepted" | "rejected" | "favorite"
  timestamp: Date
}

export interface GroceryItem {
  name: string
  quantity: string
  category: string
  checked: boolean
  recipeIds: string[]
}

export interface GroceryList {
  items: GroceryItem[]
  weeklyPlanId: string
  generatedAt: Date
}

// Day names in French
export const DAYS_FR = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche"
] as const

export const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre"
] as const

export const SEASONS_FR: Record<Season, string> = {
  hiver: "Hiver",
  printemps: "Printemps",
  été: "Été",
  automne: "Automne"
}

export const MEAL_TYPES_FR: Record<string, string> = {
  petit_dejeuner: "Petit-déjeuner",
  dejeuner: "Déjeuner",
  diner: "Dîner",
  dessert: "Dessert",
  aperitif: "Apéritif",
  "dejeuner/diner": "Déjeuner/Dîner"
}

// Grocery categories for grouping
export const GROCERY_CATEGORIES = [
  "Fruits, légumes et légumineuses",
  "Crèmerie et produits laitiers",
  "Viandes, poissons et protéines",
  "Féculents, pains et céréales",
  "Épicerie, condiments et produits sucrés",
  "Épices et herbes aromatiques"
] as const
