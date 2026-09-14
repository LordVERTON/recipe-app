"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Star, History, Settings, RefreshCw, ChefHat, Utensils, Cake, Minus, Plus } from "lucide-react"
import { useBrocoChouStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface ProfilePageProps {
  onOpenPreferences: () => void
}

export function ProfilePage({ onOpenPreferences }: ProfilePageProps) {
  const { 
    favoriteRecipes, 
    recipeHistory, 
    weeklyPlan,
    acceptedRecipes,
    recipeCatalog,
    preferences,
    setPreferences,
    householdSize,
    setHouseholdSize,
    addRecipeToAccepted,
    rateRecipeHistory,
    resetSwipes
  } = useBrocoChouStore()

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Calculate stats
  const weeksPlanned = recipeHistory.length > 0 ? Math.ceil(recipeHistory.length / 7) : 0
  const cookedRecipes = recipeHistory.filter(h => !h.skipped).length
  
  // Most used ingredients
  const ingredientCounts = new Map<string, number>()
  recipeHistory.forEach(h => {
    const recipe = acceptedRecipes.find(r => r.id === h.recipeId)
    recipe?.main_ingredients?.forEach(ing => {
      ingredientCounts.set(ing, (ingredientCounts.get(ing) || 0) + 1)
    })
  })
  const topIngredients = Array.from(ingredientCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name)
  const recentHistory = recipeHistory
    .map((entry, index) => ({ entry, index, recipe: recipeCatalog.find(recipe => recipe.id === entry.recipeId) || acceptedRecipes.find(recipe => recipe.id === entry.recipeId) }))
    .reverse()
    .slice(0, 6)

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-charcoal-soft">Mon profil</h1>
      </div>

      {/* Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-4 text-center broco-chou-shadow">
            <div className="w-10 h-10 rounded-full bg-lavender/50 mx-auto mb-2 flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-mauve-taupe" />
            </div>
            <p className="text-2xl font-bold text-charcoal-soft">{weeksPlanned}</p>
            <p className="text-xs text-warm-gray">Semaines</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center broco-chou-shadow">
            <div className="w-10 h-10 rounded-full bg-sage-mist/50 mx-auto mb-2 flex items-center justify-center">
              <Utensils className="h-5 w-5 text-sage-mist" />
            </div>
            <p className="text-2xl font-bold text-charcoal-soft">{cookedRecipes}</p>
            <p className="text-xs text-warm-gray">Cuisinés</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center broco-chou-shadow">
            <div className="w-10 h-10 rounded-full bg-dusty-violet/30 mx-auto mb-2 flex items-center justify-center">
              <Star className="h-5 w-5 text-deep-plum" />
            </div>
            <p className="text-2xl font-bold text-charcoal-soft">{favoriteRecipes.length}</p>
            <p className="text-xs text-warm-gray">Favoris</p>
          </div>
        </div>
      </div>

      {/* Favorites Preview */}
      {favoriteRecipes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 mb-6"
        >
          <h3 className="text-sm font-semibold text-charcoal-soft mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-mauve-taupe" />
            Mes favoris
          </h3>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-6 px-6">
            {favoriteRecipes.slice(0, 5).map(recipe => (
              <div
                key={recipe.id}
                className="flex-shrink-0 w-36 p-3 rounded-2xl bg-card broco-chou-shadow"
              >
                <div className={cn(
                  "w-full h-20 rounded-xl mb-2 flex items-center justify-center",
                  recipe.categorie === "sucré" ? "bg-lavender/40" : "bg-dusty-violet/20"
                )}>
                  {recipe.categorie === "sucré" ? (
                    <Cake className="h-8 w-8 text-deep-plum/60" />
                  ) : (
                    <Utensils className="h-8 w-8 text-mauve-taupe/60" />
                  )}
                </div>
                <p className="text-sm font-medium text-charcoal-soft line-clamp-2">
                  {recipe.nom.charAt(0).toUpperCase() + recipe.nom.slice(1)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top Ingredients */}
      {topIngredients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-6 mb-6"
        >
          <h3 className="text-sm font-semibold text-charcoal-soft mb-3">
            Ingrédients les plus utilisés
          </h3>
          <div className="flex flex-wrap gap-2">
            {topIngredients.map(ingredient => (
              <span
                key={ingredient}
                className="px-3 py-1.5 rounded-full text-sm bg-card broco-chou-shadow text-charcoal-soft"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Menu Items */}
      <div className="px-6 mb-6">
        <h3 className="text-sm font-semibold text-charcoal-soft mb-3">Paramètres</h3>
        <div className="space-y-2">
          <button
            onClick={onOpenPreferences}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-card broco-chou-shadow hover:bg-lavender/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lavender/40 flex items-center justify-center">
                <Settings className="h-5 w-5 text-mauve-taupe" />
              </div>
              <div className="text-left">
                <p className="font-medium text-charcoal-soft">Préférences</p>
                <p className="text-xs text-warm-gray">Régime, équipement, budget</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-warm-gray" />
          </button>

          <div className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl bg-card broco-chou-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-mist/40 flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-sage-mist" />
              </div>
              <div className="text-left">
                <p className="font-medium text-charcoal-soft">Recettes de saison</p>
                <p className="text-xs text-warm-gray">
                  {preferences.includeSeasonalRecipes !== false
                    ? "Suggestions limitees a la saison en cours"
                    : "Suggestions ouvertes a toutes les saisons"}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.includeSeasonalRecipes !== false}
              onCheckedChange={(checked) => setPreferences({ includeSeasonalRecipes: checked })}
              aria-label="Activer les recettes de saison"
            />
          </div>

          <div className="rounded-2xl bg-card p-4 broco-chou-shadow">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-charcoal-soft">Repas à planifier</p>
                <p className="text-xs text-warm-gray">Le générateur respecte ces choix.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["petit_dejeuner", "Petit-déjeuner"],
                ["dejeuner", "Déjeuner"],
                ["diner", "Dîner"],
                ["dessert", "Dessert"],
              ].map(([slot, label]) => {
                const selected = preferences.mealSlots.includes(slot as typeof preferences.mealSlots[number])
                return (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPreferences({
                      mealSlots: selected
                        ? preferences.mealSlots.filter(item => item !== slot)
                        : [...preferences.mealSlots, slot as typeof preferences.mealSlots[number]],
                      includeBreakfast: slot === "petit_dejeuner" ? !selected : preferences.includeBreakfast,
                      includeDessert: slot === "dessert" ? !selected : preferences.includeDessert,
                    })}
                    className={cn(
                      "min-h-10 rounded-full px-3 text-sm font-medium transition-colors",
                      selected ? "bg-mauve-taupe text-white" : "bg-soft-sand text-charcoal-soft hover:bg-lavender"
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 broco-chou-shadow">
            <div>
              <p className="font-medium text-charcoal-soft">Nombre de personnes</p>
              <p className="text-xs text-warm-gray">Les quantités de courses seront multipliées.</p>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-soft-sand p-1">
              <button type="button" onClick={() => setHouseholdSize(householdSize - 1)} disabled={householdSize <= 1} aria-label="Diminuer le nombre de personnes" className="flex h-9 w-9 items-center justify-center rounded-lg text-warm-gray hover:bg-lavender disabled:opacity-40"><Minus className="h-4 w-4" /></button>
              <span className="min-w-7 text-center text-sm font-semibold text-charcoal-soft">{householdSize}</span>
              <button type="button" onClick={() => setHouseholdSize(householdSize + 1)} aria-label="Augmenter le nombre de personnes" className="flex h-9 w-9 items-center justify-center rounded-lg text-warm-gray hover:bg-lavender"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <button
            onClick={() => setShowHistory(value => !value)}
            aria-expanded={showHistory}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-card broco-chou-shadow hover:bg-lavender/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-mist/40 flex items-center justify-center">
                <History className="h-5 w-5 text-sage-mist" />
              </div>
              <div className="text-left">
                <p className="font-medium text-charcoal-soft">Historique</p>
                <p className="text-xs text-warm-gray">{cookedRecipes} recettes cuisinées</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-warm-gray" />
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="px-6 mb-6">
          <h3 className="mb-3 text-sm font-semibold text-charcoal-soft">À cuisiner à nouveau</h3>
          {recentHistory.length === 0 ? (
            <p className="rounded-2xl bg-card p-4 text-sm text-warm-gray broco-chou-shadow">Marque un repas comme cuisiné dans ton planning pour le retrouver ici.</p>
          ) : (
            <div className="space-y-2">
              {recentHistory.map(({ entry, index, recipe }) => (
                <div key={`${entry.recipeId}-${index}`} className="rounded-2xl bg-card p-4 broco-chou-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-charcoal-soft">{recipe?.nom || "Recette"}</p>
                      <p className="text-xs text-warm-gray">{new Date(entry.cookedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
                    </div>
                    {recipe && <Button variant="outline" size="sm" onClick={() => addRecipeToAccepted(recipe)} className="shrink-0 border-soft-sand text-mauve-taupe">Refaire</Button>}
                  </div>
                  <div className="mt-3 flex items-center gap-1" aria-label="Noter cette recette">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button key={rating} type="button" onClick={() => rateRecipeHistory(index, rating)} aria-label={`Donner ${rating} étoiles`} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-lavender/30">
                        <Star className={cn("h-4 w-4", (entry.rating || 0) >= rating ? "fill-mauve-taupe text-mauve-taupe" : "text-soft-sand")} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reset Actions */}
      <div className="px-6 mb-6">
        <h3 className="text-sm font-semibold text-charcoal-soft mb-3">Actions</h3>
        <div className="space-y-2">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card broco-chou-shadow hover:bg-lavender/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-soft-sand flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-warm-gray" />
              </div>
              <div className="text-left">
                <p className="font-medium text-charcoal-soft">Réinitialiser les refus</p>
                <p className="text-xs text-warm-gray">Revoir les recettes refusées</p>
              </div>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-lavender/30 border border-lavender">
              <p className="text-sm text-charcoal-soft mb-3">
                Cela réinitialisera tes swipes et te permettra de revoir toutes les recettes.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 border-soft-sand"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    resetSwipes()
                    setShowResetConfirm(false)
                  }}
                  className="flex-1 bg-mauve-taupe text-white hover:opacity-90"
                >
                  Confirmer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* App Info */}
      <div className="px-6 pt-4 mt-auto">
        <div className="text-center text-xs text-warm-gray">
          <p className="mb-1">Broco-Chou</p>
          <p>Recettes basées sur les calendriers du Crous</p>
        </div>
      </div>
    </div>
  )
}
