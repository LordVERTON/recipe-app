"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Heart, History, Settings, Trash2, RefreshCw, ChefHat, Utensils, Cake } from "lucide-react"
import { useLumoraStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ProfilePageProps {
  onOpenPreferences: () => void
}

export function ProfilePage({ onOpenPreferences }: ProfilePageProps) {
  const { 
    favoriteRecipes, 
    recipeHistory, 
    weeklyPlan,
    acceptedRecipes,
    resetSwipes
  } = useLumoraStore()

  const [showResetConfirm, setShowResetConfirm] = useState(false)

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

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-charcoal-soft">Mon profil</h1>
      </div>

      {/* Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-4 text-center lumora-shadow">
            <div className="w-10 h-10 rounded-full bg-lavender/50 mx-auto mb-2 flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-mauve-taupe" />
            </div>
            <p className="text-2xl font-bold text-charcoal-soft">{weeksPlanned}</p>
            <p className="text-xs text-warm-gray">Semaines</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center lumora-shadow">
            <div className="w-10 h-10 rounded-full bg-sage-mist/50 mx-auto mb-2 flex items-center justify-center">
              <Utensils className="h-5 w-5 text-sage-mist" />
            </div>
            <p className="text-2xl font-bold text-charcoal-soft">{cookedRecipes}</p>
            <p className="text-xs text-warm-gray">Cuisinés</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center lumora-shadow">
            <div className="w-10 h-10 rounded-full bg-dusty-violet/30 mx-auto mb-2 flex items-center justify-center">
              <Heart className="h-5 w-5 text-deep-plum" />
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
            <Heart className="h-4 w-4 text-mauve-taupe" />
            Mes favoris
          </h3>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-6 px-6">
            {favoriteRecipes.slice(0, 5).map(recipe => (
              <div
                key={recipe.id}
                className="flex-shrink-0 w-36 p-3 rounded-2xl bg-card lumora-shadow"
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
                className="px-3 py-1.5 rounded-full text-sm bg-card lumora-shadow text-charcoal-soft"
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
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-card lumora-shadow hover:bg-lavender/20 transition-colors"
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

          <button
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-card lumora-shadow hover:bg-lavender/20 transition-colors"
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

      {/* Reset Actions */}
      <div className="px-6 mb-6">
        <h3 className="text-sm font-semibold text-charcoal-soft mb-3">Actions</h3>
        <div className="space-y-2">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card lumora-shadow hover:bg-lavender/20 transition-colors"
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
          <p className="mb-1">Lumora Recipes</p>
          <p>Recettes basées sur les calendriers du Crous</p>
        </div>
      </div>
    </div>
  )
}
