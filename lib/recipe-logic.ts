import type { Recipe, RecipeHistory, UserPreferences } from './types'
import { getCurrentSeason, getCurrentMonthFr } from './mock-recipes'

/**
 * Score a recipe based on user history, preferences, and already selected recipes
 * Higher score = better recommendation
 */
export function scoreRecipe(
  recipe: Recipe,
  userHistory: RecipeHistory[],
  currentMonth: string,
  selectedRecipes: Recipe[],
  preferences: UserPreferences
): number {
  let score = 100

  // === PENALTIES ===
  
  // Recipe cooked in last 21 days
  const recentHistory = userHistory.filter(h => {
    const daysSince = (Date.now() - new Date(h.cookedAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysSince <= 21 && h.recipeId === recipe.id
  })
  if (recentHistory.length > 0) {
    score -= 40
  }

  // Same main ingredient already present 2+ times in selected recipes
  const mainIngredientCounts = new Map<string, number>()
  selectedRecipes.forEach(r => {
    r.main_ingredients?.forEach(ing => {
      mainIngredientCounts.set(ing, (mainIngredientCounts.get(ing) || 0) + 1)
    })
  })
  
  recipe.main_ingredients?.forEach(ing => {
    const count = mainIngredientCounts.get(ing) || 0
    if (count >= 2) score -= 25
    if (count >= 3) score -= 40 // Heavy penalty for 3+ same ingredient
  })

  // Same meal type too frequent
  const mealTypeCounts = selectedRecipes.filter(r => r.tag === recipe.tag).length
  if (mealTypeCounts >= 3) score -= 15

  // Recipe out of season
  if (recipe.saison !== getCurrentSeason()) {
    score -= 10
  }

  // Recipe rejected recently (multiple times)
  const rejectCount = userHistory.filter(h => 
    h.recipeId === recipe.id && h.skipped
  ).length
  if (rejectCount >= 2) score -= 30

  // Check dietary restrictions
  if (preferences.diet === 'vegetarien' && recipe.dietary_tags?.includes('viande')) {
    score -= 100 // Exclude entirely
  }
  if (preferences.diet === 'pescetarien' && 
      !recipe.dietary_tags?.includes('végétarien') && 
      !recipe.dietary_tags?.includes('poisson')) {
    score -= 100
  }
  if (preferences.diet === 'sans_porc' && recipe.ingredients.some(i => 
    i.name.toLowerCase().includes('porc') || i.name.toLowerCase().includes('lardon')
  )) {
    score -= 100
  }

  // Check excluded ingredients
  const hasExcluded = recipe.ingredients.some(ing => 
    preferences.excludedIngredients.some(excl => 
      ing.name.toLowerCase().includes(excl.toLowerCase())
    )
  )
  if (hasExcluded) score -= 100

  // Check equipment requirements
  if (!recipe.sans_four && !preferences.equipment.includes('four')) {
    score -= 50
  }

  // Difficulty check
  if (recipe.difficulty === 'intermédiaire' && preferences.difficultyLevel === 'très facile') {
    score -= 20
  }

  // === BONUSES ===

  // Current month recipe
  if (recipe.mois === currentMonth) {
    score += 25
  }

  // Current season recipe  
  if (recipe.saison === getCurrentSeason()) {
    score += 15
  }

  // Crous validated recipe
  if (recipe.source === 'crous') {
    score += 10
  }

  // Complete canonical ingredients
  if (recipe.canonical_ingredients_status === 'verified') {
    score += 5
  }

  // Recipe complements selected recipes (protein diversity)
  const existingProteins = new Set<string>()
  selectedRecipes.forEach(r => {
    if (r.dietary_tags?.includes('végétarien')) existingProteins.add('veg')
    if (r.dietary_tags?.includes('poisson')) existingProteins.add('fish')
    if (r.dietary_tags?.includes('légumineuses')) existingProteins.add('legumes')
    if (r.main_ingredients?.some(i => i.includes('poulet'))) existingProteins.add('poultry')
  })
  
  // Bonus for adding diversity
  if (recipe.dietary_tags?.includes('végétarien') && !existingProteins.has('veg')) {
    score += 10
  }
  if (recipe.dietary_tags?.includes('poisson') && !existingProteins.has('fish')) {
    score += 10
  }
  if (recipe.dietary_tags?.includes('légumineuses') && !existingProteins.has('legumes')) {
    score += 10
  }

  // Favorite ingredients
  const hasFavorite = recipe.ingredients.some(ing =>
    preferences.favoriteIngredients.some(fav =>
      ing.name.toLowerCase().includes(fav.toLowerCase())
    )
  )
  if (hasFavorite) score += 15

  // Sans four for students without oven
  if (recipe.sans_four && preferences.budgetLevel === 'etudiant') {
    score += 5
  }

  // Micro-ondes compatible
  if (recipe.cuisson_micro_ondes) {
    score += 3
  }

  return Math.max(0, score)
}

/**
 * Sort recipes for swipe deck based on scoring
 */
export function sortRecipesForSwipe(
  recipes: Recipe[],
  userHistory: RecipeHistory[],
  preferences: UserPreferences
): Recipe[] {
  const currentMonth = getCurrentMonthFr()
  
  return [...recipes]
    .map(recipe => ({
      recipe,
      score: scoreRecipe(recipe, userHistory, currentMonth, [], preferences)
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.recipe)
}

/**
 * Check if a weekly plan has too much repetition
 */
export function checkRepetition(
  selectedRecipes: Recipe[]
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []
  
  // Check main ingredient repetition
  const mainIngredientCounts = new Map<string, number>()
  selectedRecipes.forEach(r => {
    r.main_ingredients?.forEach(ing => {
      mainIngredientCounts.set(ing, (mainIngredientCounts.get(ing) || 0) + 1)
    })
  })
  
  mainIngredientCounts.forEach((count, ingredient) => {
    if (count >= 3) {
      warnings.push(`${ingredient} apparaît ${count} fois cette semaine`)
    }
  })

  // Check starch repetition (pâtes, riz)
  const starchCounts = new Map<string, number>()
  selectedRecipes.forEach(r => {
    r.main_ingredients?.forEach(ing => {
      const lower = ing.toLowerCase()
      if (lower.includes('pâtes') || lower.includes('pasta')) {
        starchCounts.set('pâtes', (starchCounts.get('pâtes') || 0) + 1)
      }
      if (lower.includes('riz')) {
        starchCounts.set('riz', (starchCounts.get('riz') || 0) + 1)
      }
    })
  })

  starchCounts.forEach((count, starch) => {
    if (count >= 3) {
      warnings.push(`Beaucoup de ${starch} cette semaine (${count} fois)`)
    }
  })

  // Check chocolate desserts
  const chocolateDesserts = selectedRecipes.filter(r => 
    r.categorie === 'sucré' && 
    r.main_ingredients?.some(i => i.toLowerCase().includes('chocolat'))
  )
  if (chocolateDesserts.length >= 3) {
    warnings.push('Plusieurs desserts au chocolat cette semaine')
  }

  return {
    valid: warnings.length === 0,
    warnings
  }
}

/**
 * Suggest missing recipes to complete a balanced week
 */
export function suggestMissingRecipes(
  selectedRecipes: Recipe[],
  allRecipes: Recipe[],
  preferences: UserPreferences
): { type: string; recipes: Recipe[] }[] {
  const suggestions: { type: string; recipes: Recipe[] }[] = []
  
  const mainDishes = selectedRecipes.filter(r => 
    r.tag.includes('déjeuner') || r.tag.includes('dîner')
  )
  const desserts = selectedRecipes.filter(r => 
    r.tag === 'dessert' || r.categorie === 'sucré'
  )

  // Need at least 7 main dishes
  if (mainDishes.length < 7) {
    const missing = 7 - mainDishes.length
    const suggested = allRecipes
      .filter(r => (r.tag.includes('déjeuner') || r.tag.includes('dîner')) && 
                   !selectedRecipes.some(s => s.id === r.id))
      .slice(0, missing)
    
    suggestions.push({
      type: `${missing} plat${missing > 1 ? 's' : ''} principal${missing > 1 ? 'aux' : ''}`,
      recipes: suggested
    })
  }

  // Need at least 2-3 desserts if preference enabled
  if (preferences.includeDessert && desserts.length < 2) {
    const missing = 2 - desserts.length
    const suggested = allRecipes
      .filter(r => (r.tag === 'dessert' || r.categorie === 'sucré') && 
                   !selectedRecipes.some(s => s.id === r.id))
      .slice(0, missing)
    
    suggestions.push({
      type: `${missing} dessert${missing > 1 ? 's' : ''}`,
      recipes: suggested
    })
  }

  // Check for vegetarian options
  const vegOptions = mainDishes.filter(r => r.dietary_tags?.includes('végétarien'))
  if (vegOptions.length < 2) {
    const suggested = allRecipes
      .filter(r => r.dietary_tags?.includes('végétarien') && 
                   !selectedRecipes.some(s => s.id === r.id))
      .slice(0, 2 - vegOptions.length)
    
    if (suggested.length > 0) {
      suggestions.push({
        type: 'plat végétarien',
        recipes: suggested
      })
    }
  }

  return suggestions
}

/**
 * Get balance advice for a weekly plan
 */
export function getBalanceAdvice(
  selectedRecipes: Recipe[]
): string[] {
  const advice: string[] = []
  
  const mainDishes = selectedRecipes.filter(r => 
    r.tag.includes('déjeuner') || r.tag.includes('dîner')
  )

  // Check legumes presence
  const hasLegumes = mainDishes.some(r => r.dietary_tags?.includes('légumineuses'))
  if (!hasLegumes) {
    advice.push('Ajoute un plat à base de légumineuses pour plus de fibres')
  }

  // Check fish presence
  const hasFish = mainDishes.some(r => r.dietary_tags?.includes('poisson'))
  if (!hasFish) {
    advice.push('Un plat avec du poisson serait bénéfique pour les oméga-3')
  }

  // Check vegetable variety
  const veggieCount = mainDishes.filter(r => 
    r.main_ingredients?.some(i => 
      ['légumes', 'carotte', 'épinard', 'courgette', 'poivron'].some(v => 
        i.toLowerCase().includes(v)
      )
    )
  ).length

  if (veggieCount < 3) {
    advice.push('Pense à intégrer plus de légumes dans tes plats')
  } else if (veggieCount >= 5) {
    advice.push('Belle variété de légumes cette semaine !')
  }

  // Check for fruit desserts
  const fruitDesserts = selectedRecipes.filter(r => 
    r.categorie === 'sucré' && 
    r.main_ingredients?.some(i => 
      ['fruit', 'pomme', 'banane', 'fraise', 'pêche'].some(f => 
        i.toLowerCase().includes(f)
      )
    )
  )
  if (fruitDesserts.length === 0 && selectedRecipes.some(r => r.categorie === 'sucré')) {
    advice.push('Pense à intégrer un dessert fruité')
  }

  return advice
}

/**
 * Detect current season from date
 */
export function detectSeason(date: Date = new Date()): string {
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return 'printemps'
  if (month >= 6 && month <= 8) return 'été'
  if (month >= 9 && month <= 11) return 'automne'
  return 'hiver'
}

/**
 * Prevent same recipe from being proposed too often
 */
export function preventRepetition(
  recipe: Recipe,
  history: RecipeHistory[],
  maxRepetitionsPerMonth: number = 2
): boolean {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentOccurrences = history.filter(h => 
    h.recipeId === recipe.id && 
    new Date(h.cookedAt) >= thirtyDaysAgo
  )

  return recentOccurrences.length < maxRepetitionsPerMonth
}
