"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, Users, ChefHat, Leaf, Fish, Flame, Microwave, Check, Heart, Calendar, AlertCircle } from "lucide-react"
import type { Recipe } from "@/lib/types"
import { SEASONS_FR } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getFallbackRecipeImageUrl, getRecipeImageUrl, recipeTitle } from "@/lib/recipe-images"

interface RecipeDetailSheetProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  onAddToPlanning?: () => void
  onAddToFavorites?: () => void
}

export function RecipeDetailSheet({ 
  recipe, 
  isOpen, 
  onClose,
  onAddToPlanning,
  onAddToFavorites 
}: RecipeDetailSheetProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set())
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const resetChecks = () => {
    setCheckedSteps(new Set())
    setCheckedIngredients(new Set())
  }

  useEffect(() => {
    setImageSrc(recipe ? getRecipeImageUrl(recipe) : null)
    resetChecks()
  }, [recipe])

  if (!recipe) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-charcoal-soft/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden rounded-t-3xl bg-warm-ivory"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 rounded-full bg-soft-sand" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-soft-sand flex items-center justify-center text-warm-gray hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-3rem)] pb-safe hide-scrollbar">
              {/* Header Section */}
              <div className="px-6 pb-4">
                {/* Source Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    recipe.source === "crous" 
                      ? "bg-sage-mist text-charcoal-soft" 
                      : "bg-lavender text-deep-plum"
                  )}>
                    {recipe.source === "crous" ? "Recette Crous" : "Suggestion Broco-Chou"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-dusty-violet/20 text-deep-plum">
                    {SEASONS_FR[recipe.saison]}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-charcoal-soft mb-3 text-pretty">
                  {recipeTitle(recipe)}
                </h2>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-warm-gray">
                  {recipe.estimatedTime && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.estimatedTime} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{recipe.portions}</span>
                  </div>
                  {recipe.difficulty && (
                    <span className="px-2.5 py-1 rounded-full bg-lavender/30 text-deep-plum text-xs">
                      {recipe.difficulty}
                    </span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {recipe.dietary_tags?.includes("végétarien") && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-sage-mist/50 text-charcoal-soft">
                      <Leaf className="h-3.5 w-3.5" />
                      Végétarien
                    </span>
                  )}
                  {recipe.dietary_tags?.includes("poisson") && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-dusty-violet/30 text-deep-plum">
                      <Fish className="h-3.5 w-3.5" />
                      Poisson
                    </span>
                  )}
                  {recipe.dietary_tags?.includes("légumineuses") && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-sage-mist/50 text-charcoal-soft">
                      <Leaf className="h-3.5 w-3.5" />
                      Légumineuses
                    </span>
                  )}
                  {recipe.sans_four && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-lavender/40 text-deep-plum">
                      <Flame className="h-3.5 w-3.5" />
                      Sans four
                    </span>
                  )}
                  {recipe.cuisson_micro_ondes && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-dusty-violet/20 text-deep-plum">
                      <Microwave className="h-3.5 w-3.5" />
                      Micro-ondes
                    </span>
                  )}
                </div>

                {/* Canonical Status Warning */}
                {recipe.canonical_ingredients_status !== "verified" && (
                  <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-lavender/30 text-sm text-deep-plum">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      {recipe.canonical_ingredients_status === "partial" 
                        ? "Certains ingrédients n'ont pas été vérifiés dans la base canonique."
                        : "Les ingrédients de cette recette n'ont pas été vérifiés."}
                    </span>
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="mx-6 h-48 rounded-2xl bg-gradient-to-br from-lavender/40 to-dusty-violet/30 overflow-hidden mb-6">
                <img
                  src={imageSrc || getRecipeImageUrl(recipe)}
                  alt={recipeTitle(recipe)}
                  className="h-full w-full object-cover"
                  onError={() => setImageSrc(getFallbackRecipeImageUrl())}
                />
              </div>

              {/* Ingredients Section */}
              <div className="px-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-charcoal-soft">Ingrédients</h3>
                  {checkedIngredients.size > 0 && (
                    <button 
                      onClick={() => setCheckedIngredients(new Set())}
                      className="text-xs text-mauve-taupe"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {recipe.ingredients.map((ing, index) => (
                    <button
                      key={index}
                      onClick={() => toggleIngredient(index)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                        checkedIngredients.has(index) 
                          ? "bg-sage-mist/50 text-warm-gray line-through" 
                          : "bg-card hover:bg-lavender/20"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                        checkedIngredients.has(index) 
                          ? "border-sage-mist bg-sage-mist" 
                          : "border-soft-sand"
                      )}>
                        {checkedIngredients.has(index) && (
                          <Check className="h-3 w-3 text-charcoal-soft" />
                        )}
                      </div>
                      <span className="text-sm">
                        {ing.quantity && <span className="font-medium">{ing.quantity} </span>}
                        {ing.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Instructions Section */}
              <div className="px-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-charcoal-soft">Préparation</h3>
                  {checkedSteps.size > 0 && (
                    <button 
                      onClick={() => setCheckedSteps(new Set())}
                      className="text-xs text-mauve-taupe"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {recipe.instructions.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => toggleStep(index)}
                      className={cn(
                        "w-full flex items-start gap-3 p-4 rounded-xl transition-all text-left",
                        checkedSteps.has(index) 
                          ? "bg-sage-mist/50" 
                          : "bg-card hover:bg-lavender/20"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold transition-colors",
                        checkedSteps.has(index) 
                          ? "bg-sage-mist text-charcoal-soft" 
                          : "bg-dusty-violet/30 text-deep-plum"
                      )}>
                        {checkedSteps.has(index) ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <p className={cn(
                        "text-sm leading-relaxed pt-1",
                        checkedSteps.has(index) 
                          ? "text-warm-gray line-through" 
                          : "text-charcoal-soft"
                      )}>
                        {step}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips Section */}
              {recipe.astuce && (
                <div className="px-6 mb-6">
                  <h3 className="text-lg font-semibold text-charcoal-soft mb-3">Astuce</h3>
                  <div className="p-4 rounded-xl bg-lavender/30 text-sm text-charcoal-soft">
                    {recipe.astuce}
                  </div>
                </div>
              )}

              {/* Source Info */}
              {recipe.source === "crous" && recipe.source_pdf && (
                <div className="px-6 mb-6">
                  <p className="text-xs text-warm-gray">
                    Source : {recipe.source_pdf}
                    {recipe.source_page && `, page ${recipe.source_page}`}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="px-6 pb-8 flex gap-3">
                {onAddToFavorites && (
                  <Button
                    variant="outline"
                    onClick={onAddToFavorites}
                    className="flex-1 border-dusty-violet text-mauve-taupe hover:bg-lavender/30"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Favoris
                  </Button>
                )}
                {onAddToPlanning && (
                  <Button
                    onClick={onAddToPlanning}
                    className="flex-1 bg-gradient-to-r from-dusty-violet to-mauve-taupe text-white hover:opacity-90"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ajouter au planning
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
