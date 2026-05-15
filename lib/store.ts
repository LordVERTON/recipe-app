import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Recipe, WeeklyPlan, PlannedMeal, SwipeAction, UserPreferences, GroceryItem, RecipeHistory, MealSlot } from './types'
import { mockRecipes, getCurrentSeason, getCurrentMonthFr } from './mock-recipes'

interface BrocoChouState {
  // Recipes
  recipeCatalog: Recipe[]
  recipes: Recipe[]
  currentRecipeIndex: number
  
  // Swipe actions
  swipeActions: SwipeAction[]
  acceptedRecipes: Recipe[]
  rejectedRecipes: Recipe[]
  favoriteRecipes: Recipe[]
  
  // Planning
  weeklyPlan: WeeklyPlan | null
  
  // History
  recipeHistory: RecipeHistory[]
  
  // Preferences
  preferences: UserPreferences
  
  // Grocery
  groceryList: GroceryItem[]
  
  // UI State
  currentStep: 'envies' | 'equilibre' | 'planning' | 'courses'
  hasCompletedOnboarding: boolean
  
  // Actions
  setRecipes: (recipes: Recipe[]) => void
  swipeRecipe: (action: 'accepted' | 'rejected' | 'favorite') => void
  undoLastSwipe: () => void
  resetSwipes: () => void
  addRecipeToAccepted: (recipe: Recipe) => void
  generateWeeklyPlan: () => void
  updateMealStatus: (mealId: string, status: PlannedMeal['status']) => void
  replaceMeal: (mealId: string, newRecipe: Recipe) => void
  setPreferences: (prefs: Partial<UserPreferences>) => void
  generateGroceryList: () => void
  toggleGroceryItem: (itemName: string) => void
  setCurrentStep: (step: BrocoChouState['currentStep']) => void
  addToHistory: (recipeId: string, rating?: number) => void
  getCurrentRecipe: () => Recipe | null
  getSwipeProgress: () => { accepted: number; total: number; desserts: number }
  completeOnboarding: () => void
}

const defaultPreferences: UserPreferences = {
  diet: 'omnivore',
  excludedIngredients: [],
  favoriteIngredients: [],
  mealSlots: ['dejeuner', 'diner', 'dessert'],
  includeDessert: true,
  includeBreakfast: true,
  includeSeasonalRecipes: true,
  maxRepetitionPerMonth: 2,
  equipment: ['poele', 'casserole'],
  budgetLevel: 'etudiant',
  difficultyLevel: 'facile'
}

export const useBrocoChouStore = create<BrocoChouState>()(
  persist(
    (set, get) => ({
      // Initial state
      recipeCatalog: mockRecipes,
      recipes: orderRecipeSuggestions(mockRecipes, defaultPreferences.includeSeasonalRecipes),
      currentRecipeIndex: 0,
      swipeActions: [],
      acceptedRecipes: [],
      rejectedRecipes: [],
      favoriteRecipes: [],
      weeklyPlan: null,
      recipeHistory: [],
      preferences: defaultPreferences,
      groceryList: [],
      currentStep: 'envies',
      hasCompletedOnboarding: false,

      // Actions
      setRecipes: (recipes) => set(state => ({
        recipeCatalog: recipes,
        recipes: orderRecipeSuggestions(recipes, state.preferences.includeSeasonalRecipes !== false),
        currentRecipeIndex: 0
      })),

      swipeRecipe: (action) => {
        const state = get()
        const currentRecipe = state.recipes[state.currentRecipeIndex]
        
        if (!currentRecipe) return

        const swipeAction: SwipeAction = {
          recipeId: currentRecipe.id,
          action,
          timestamp: new Date()
        }

        set(state => {
          const newState: Partial<BrocoChouState> = {
            swipeActions: [...state.swipeActions, swipeAction],
            currentRecipeIndex: state.currentRecipeIndex + 1
          }

          if (action === 'accepted' || action === 'favorite') {
            newState.acceptedRecipes = [...state.acceptedRecipes, currentRecipe]
          }
          if (action === 'favorite') {
            newState.favoriteRecipes = [...state.favoriteRecipes, currentRecipe]
          }
          if (action === 'rejected') {
            newState.rejectedRecipes = [...state.rejectedRecipes, currentRecipe]
          }

          return newState
        })
      },

      undoLastSwipe: () => {
        const state = get()
        if (state.swipeActions.length === 0 || state.currentRecipeIndex === 0) return

        const lastAction = state.swipeActions[state.swipeActions.length - 1]
        
        set(state => ({
          swipeActions: state.swipeActions.slice(0, -1),
          currentRecipeIndex: state.currentRecipeIndex - 1,
          acceptedRecipes: state.acceptedRecipes.filter(r => r.id !== lastAction.recipeId),
          rejectedRecipes: state.rejectedRecipes.filter(r => r.id !== lastAction.recipeId),
          favoriteRecipes: state.favoriteRecipes.filter(r => r.id !== lastAction.recipeId)
        }))
      },

      resetSwipes: () => set({
        currentRecipeIndex: 0,
        swipeActions: [],
        acceptedRecipes: [],
        rejectedRecipes: [],
        currentStep: 'envies'
      }),

      addRecipeToAccepted: (recipe) => {
        set(state => {
          if (state.acceptedRecipes.some(r => r.id === recipe.id)) {
            return state
          }

          return {
            acceptedRecipes: [...state.acceptedRecipes, recipe],
            swipeActions: [
              ...state.swipeActions,
              {
                recipeId: recipe.id,
                action: 'accepted' as const,
                timestamp: new Date()
              }
            ]
          }
        })
      },

      generateWeeklyPlan: () => {
        const state = get()
        const { acceptedRecipes, preferences } = state
        
        // Build the plan only from recipes explicitly selected in the swiper.
        const mainDishes = acceptedRecipes.filter(isMainMealRecipe)
        const desserts = acceptedRecipes.filter(isDessertRecipe)

        const plannedMainDishes = mergeRecipePools(mainDishes)
        const plannedBreakfasts = mergeRecipePools(acceptedRecipes.filter(isBreakfastRecipe))
        const plannedDesserts = mergeRecipePools(desserts)

        // Create 7-day plan
        const today = new Date()
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
        
        const meals: PlannedMeal[] = []
        const usedMainIngredients: Map<string, number> = new Map()

        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(weekStart)
          dayDate.setDate(weekStart.getDate() + i)

          // Select lunch and dinner while avoiding repetition of main ingredients.
          let selectedMain = selectRecipeAvoidingRepetition(
            plannedMainDishes, 
            meals.map(m => m.recipe), 
            usedMainIngredients
          )

          if (selectedMain) {
            meals.push({
              id: `meal-${i}-lunch`,
              recipeId: selectedMain.id,
              recipe: selectedMain,
              dayDate,
              mealSlot: 'dejeuner',
              status: 'planifie'
            })

            // Track main ingredients
            selectedMain.main_ingredients?.forEach(ing => {
              usedMainIngredients.set(ing, (usedMainIngredients.get(ing) || 0) + 1)
            })
          }

          const selectedDinner = selectRecipeAvoidingRepetition(
            plannedMainDishes,
            meals.map(m => m.recipe),
            usedMainIngredients
          )

          if (selectedDinner) {
            meals.push({
              id: `meal-${i}-dinner`,
              recipeId: selectedDinner.id,
              recipe: selectedDinner,
              dayDate,
              mealSlot: 'diner',
              status: 'planifie'
            })

            selectedDinner.main_ingredients?.forEach(ing => {
              usedMainIngredients.set(ing, (usedMainIngredients.get(ing) || 0) + 1)
            })
          }

          if (i >= 5 && plannedBreakfasts.length > 0) {
            const selectedBreakfast = selectRecipeAvoidingRepetition(
              plannedBreakfasts,
              meals.map(m => m.recipe),
              usedMainIngredients
            )

            if (selectedBreakfast) {
              meals.push({
                id: `meal-${i}-breakfast`,
                recipeId: selectedBreakfast.id,
                recipe: selectedBreakfast,
                dayDate,
                mealSlot: 'petit_dejeuner',
                status: 'planifie'
              })
            }
          }

          // Add dessert if preference enabled and we have desserts
          if (preferences.includeDessert && plannedDesserts.length > 0) {
            const dessertIndex = i % plannedDesserts.length
            meals.push({
              id: `meal-${i}-dessert`,
              recipeId: plannedDesserts[dessertIndex].id,
              recipe: plannedDesserts[dessertIndex],
              dayDate,
              mealSlot: 'dessert',
              status: 'planifie'
            })
          }
        }

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        const weeklyPlan: WeeklyPlan = {
          id: `plan-${Date.now()}`,
          weekStart,
          weekEnd,
          meals,
          balanceScore: calculateBalanceScore(meals),
          status: 'active'
        }

        set({ weeklyPlan, currentStep: 'planning' })
      },

      updateMealStatus: (mealId, status) => {
        set(state => {
          if (!state.weeklyPlan) return state
          return {
            weeklyPlan: {
              ...state.weeklyPlan,
              meals: state.weeklyPlan.meals.map(meal =>
                meal.id === mealId ? { ...meal, status } : meal
              )
            }
          }
        })
      },

      replaceMeal: (mealId, newRecipe) => {
        set(state => {
          if (!state.weeklyPlan) return state
          return {
            weeklyPlan: {
              ...state.weeklyPlan,
              meals: state.weeklyPlan.meals.map(meal =>
                meal.id === mealId 
                  ? { ...meal, recipe: newRecipe, recipeId: newRecipe.id, status: 'remplace' as const }
                  : meal
              )
            }
          }
        })
      },

      setPreferences: (prefs) => {
        set(state => ({
          preferences: { ...state.preferences, ...prefs },
          recipes: orderRecipeSuggestions(
            state.recipeCatalog.length > 0 ? state.recipeCatalog : state.recipes,
            prefs.includeSeasonalRecipes ?? (state.preferences.includeSeasonalRecipes !== false)
          ),
          currentRecipeIndex: prefs.includeSeasonalRecipes === undefined ? state.currentRecipeIndex : 0
        }))
      },

      generateGroceryList: () => {
        const state = get()
        if (!state.weeklyPlan) return

        const ingredientMap = new Map<string, GroceryItem>()

        state.weeklyPlan.meals.forEach(meal => {
          if (meal.status === 'saute') return

          meal.recipe.ingredients.forEach(ing => {
            const key = normalizeIngredientName(ing.name)
            const existing = ingredientMap.get(key)
            
            if (existing) {
              existing.recipeIds.push(meal.recipeId)
              // Try to combine quantities
              if (ing.quantity && existing.quantity) {
                existing.quantity = combineQuantities(existing.quantity, ing.quantity)
              }
            } else {
              ingredientMap.set(key, {
                name: ing.name,
                quantity: ing.quantity || '',
                category: ing.category || categorizeIngredient(ing.name),
                checked: false,
                recipeIds: [meal.recipeId]
              })
            }
          })
        })

        set({ 
          groceryList: Array.from(ingredientMap.values()),
          currentStep: 'courses'
        })
      },

      toggleGroceryItem: (itemName) => {
        set(state => ({
          groceryList: state.groceryList.map(item =>
            item.name === itemName ? { ...item, checked: !item.checked } : item
          )
        }))
      },

      setCurrentStep: (step) => set({ currentStep: step }),

      addToHistory: (recipeId, rating) => {
        set(state => ({
          recipeHistory: [
            ...state.recipeHistory,
            {
              recipeId,
              cookedAt: new Date(),
              rating,
              skipped: false
            }
          ]
        }))
      },

      getCurrentRecipe: () => {
        const state = get()
        return state.recipes[state.currentRecipeIndex] || null
      },

      getSwipeProgress: () => {
        const state = get()
        const desserts = state.acceptedRecipes.filter(r => 
          r.tag === 'dessert' || r.categorie === 'sucré'
        ).length
        return {
          accepted: state.acceptedRecipes.length,
          total: state.recipes.length,
          desserts
        }
      },

      completeOnboarding: () => set({ hasCompletedOnboarding: true })
    }),
    {
      name: 'broco-chou-storage',
      partialize: (state) => ({
        swipeActions: state.swipeActions,
        acceptedRecipes: state.acceptedRecipes,
        rejectedRecipes: state.rejectedRecipes,
        favoriteRecipes: state.favoriteRecipes,
        weeklyPlan: state.weeklyPlan,
        recipeHistory: state.recipeHistory,
        preferences: state.preferences,
        groceryList: state.groceryList,
        hasCompletedOnboarding: state.hasCompletedOnboarding
      })
    }
  )
)

// Helper functions for recipe scoring and selection

function normalizeText(value: string): string {
  return value
    .replace(/Ã©|ÃƒÂ©/g, 'e')
    .replace(/Ã¨|ÃƒÂ¨/g, 'e')
    .replace(/Ãª|ÃƒÂª/g, 'e')
    .replace(/Ã®|ÃƒÂ®/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function isBreakfastRecipe(recipe: Recipe): boolean {
  const tag = normalizeText(recipe.tag)
  return tag.includes('petit') && (tag.includes('dejeuner') || tag.includes('dej'))
}

function isDessertRecipe(recipe: Recipe): boolean {
  return normalizeText(recipe.tag) === 'dessert' || normalizeText(recipe.categorie).includes('sucre')
}

function isMainMealRecipe(recipe: Recipe): boolean {
  const tag = normalizeText(recipe.tag)
  return !isDessertRecipe(recipe) && !isBreakfastRecipe(recipe) && (
    tag.includes('dejeuner') || tag.includes('diner')
  )
}

function getSuggestionRecipes(recipes: Recipe[], seasonalOnly: boolean): Recipe[] {
  if (!seasonalOnly) return recipes

  const currentSeason = getCurrentSeason()
  return recipes.filter(recipe => recipe.saison === currentSeason)
}

function orderRecipeSuggestions(recipes: Recipe[], seasonalOnly: boolean): Recipe[] {
  return [...getSuggestionRecipes(recipes, seasonalOnly)].sort(() => Math.random() - 0.5)
}

function mergeRecipePools(...pools: Recipe[][]): Recipe[] {
  const seen = new Set<string>()
  return pools.flat().filter(recipe => {
    if (seen.has(recipe.id)) return false
    seen.add(recipe.id)
    return true
  })
}

function selectRecipeAvoidingRepetition(
  recipes: Recipe[],
  alreadySelected: Recipe[],
  usedMainIngredients: Map<string, number>
): Recipe | null {
  const availableRecipes = recipes.filter(r => 
    !alreadySelected.some(s => s.id === r.id)
  )

  if (availableRecipes.length === 0) {
    // If all recipes used, pick from original list avoiding immediate repetition
    const lastRecipe = alreadySelected[alreadySelected.length - 1]
    return recipes.find(r => r.id !== lastRecipe?.id) || recipes[0]
  }

  // Score recipes based on ingredient diversity
  const scoredRecipes = availableRecipes.map(recipe => {
    let score = 100

    // Penalize if main ingredient already used 2+ times
    recipe.main_ingredients?.forEach(ing => {
      const count = usedMainIngredients.get(ing) || 0
      if (count >= 2) score -= 30
      if (count >= 3) score -= 50
    })

    // Bonus for current season
    if (recipe.saison === getCurrentSeason()) score += 20

    // Bonus for current month
    if (recipe.mois === getCurrentMonthFr()) score += 10

    return { recipe, score }
  })

  // Sort by score and pick best
  scoredRecipes.sort((a, b) => b.score - a.score)
  return scoredRecipes[0]?.recipe || null
}

function calculateBalanceScore(meals: PlannedMeal[]): number {
  let score = 0
  const maxScore = 100

  const mainMeals = meals.filter(m => m.mealSlot === 'dejeuner' || m.mealSlot === 'diner')
  const desserts = meals.filter(m => m.mealSlot === 'dessert')

  // Seasonality (20 pts)
  const currentSeason = getCurrentSeason()
  const seasonalMeals = mainMeals.filter(m => m.recipe.saison === currentSeason)
  score += Math.round((seasonalMeals.length / Math.max(mainMeals.length, 1)) * 20)

  // Ingredient variety (20 pts)
  const allMainIngredients = new Set<string>()
  mainMeals.forEach(m => m.recipe.main_ingredients?.forEach(i => allMainIngredients.add(i)))
  score += Math.min(allMainIngredients.size * 2, 20)

  // Protein diversity (20 pts)
  const proteins = new Set<string>()
  mainMeals.forEach(m => {
    if (m.recipe.dietary_tags?.includes('végétarien')) proteins.add('vegetarien')
    if (m.recipe.dietary_tags?.includes('légumineuses')) proteins.add('legumineuses')
    if (m.recipe.dietary_tags?.includes('poisson')) proteins.add('poisson')
    if (m.recipe.main_ingredients?.some(i => i.includes('poulet') || i.includes('viande'))) proteins.add('viande')
    if (m.recipe.ingredients.some(i => i.name.includes('œuf'))) proteins.add('oeufs')
  })
  score += Math.min(proteins.size * 4, 20)

  // Vegetables presence (15 pts)
  const withVeggies = mainMeals.filter(m => 
    m.recipe.main_ingredients?.some(i => 
      ['légumes', 'carottes', 'épinards', 'courgettes', 'poivrons', 'tomates'].some(v => i.includes(v))
    )
  )
  score += Math.round((withVeggies.length / Math.max(mainMeals.length, 1)) * 15)

  // Desserts distribution (10 pts)
  if (desserts.length >= 3 && desserts.length <= 7) {
    score += 10
  } else if (desserts.length > 0) {
    score += 5
  }

  // Non-repetition (15 pts)
  const uniqueRecipes = new Set(mainMeals.map(m => m.recipeId))
  score += Math.round((uniqueRecipes.size / Math.max(mainMeals.length, 1)) * 15)

  return Math.min(score, maxScore)
}

function normalizeIngredientName(name: string): string {
  return name.toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\d+/g, '')
    .replace(/c\. à [sc]\./g, '')
    .trim()
}

function categorizeIngredient(name: string): string {
  const lower = name.toLowerCase()
  
  if (['carotte', 'tomate', 'oignon', 'ail', 'poireau', 'épinard', 'courgette', 'aubergine', 'poivron', 'pomme', 'banane', 'citron', 'haricot', 'lentille', 'pois'].some(v => lower.includes(v))) {
    return 'Fruits, légumes et légumineuses'
  }
  if (['lait', 'crème', 'fromage', 'beurre', 'œuf', 'yaourt', 'mozzarella', 'parmesan', 'feta', 'chèvre'].some(v => lower.includes(v))) {
    return 'Crèmerie et produits laitiers'
  }
  if (['poulet', 'bœuf', 'porc', 'poisson', 'thon', 'saumon', 'sardine', 'jambon', 'lardon'].some(v => lower.includes(v))) {
    return 'Viandes, poissons et protéines'
  }
  if (['riz', 'pâte', 'pain', 'farine', 'semoule', 'quinoa', 'boulgour', 'tortilla'].some(v => lower.includes(v))) {
    return 'Féculents, pains et céréales'
  }
  if (['sel', 'poivre', 'cumin', 'curry', 'paprika', 'herbe', 'thym', 'basilic', 'persil', 'coriandre', 'cannelle'].some(v => lower.includes(v))) {
    return 'Épices et herbes aromatiques'
  }
  return 'Épicerie, condiments et produits sucrés'
}

function combineQuantities(q1: string, q2: string): string {
  // Simple combination - just append
  return `${q1} + ${q2}`
}
