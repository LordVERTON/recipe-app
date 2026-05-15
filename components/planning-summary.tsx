"use client"

import { motion } from "framer-motion"
import { Check, Utensils, Cake, AlertTriangle, Lightbulb, ArrowRight, Star } from "lucide-react"
import { useBrocoChouStore } from "@/lib/store"
import { checkRepetition, getBalanceAdvice } from "@/lib/recipe-logic"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PlanningSummaryProps {
  onContinueSwiping: () => void
  onGeneratePlan: () => void
  onModifySelection: () => void
}

export function PlanningSummary({ 
  onContinueSwiping, 
  onGeneratePlan, 
  onModifySelection 
}: PlanningSummaryProps) {
  const { acceptedRecipes, favoriteRecipes } = useBrocoChouStore()

  const mainDishes = acceptedRecipes.filter(r => 
    r.tag.includes("déjeuner") || r.tag.includes("dîner")
  )
  const desserts = acceptedRecipes.filter(r => 
    r.tag === "dessert" || r.categorie === "sucré"
  )
  const breakfasts = acceptedRecipes.filter(r => 
    r.tag.includes("petit-déjeuner")
  )

  // Check for repetition issues
  const repetitionCheck = checkRepetition(acceptedRecipes)
  const balanceAdvice = getBalanceAdvice(acceptedRecipes)

  // Calculate completion score
  const hasEnoughMainDishes = mainDishes.length >= 7
  const hasEnoughDesserts = desserts.length >= 2
  const completionScore = Math.min(100, Math.round(
    ((mainDishes.length / 7) * 70) + ((Math.min(desserts.length, 3) / 3) * 30)
  ))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-xl font-bold text-charcoal-soft mb-1">
          Ta sélection
        </h2>
        <p className="text-sm text-warm-gray">
          Vérifie ton équilibre avant de générer le planning
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 hide-scrollbar">
        {/* Selection Indicator */}
        <div className="mb-6 flex justify-end">
          <div
            className="flex h-10 min-w-14 items-center justify-center gap-2 rounded-full bg-soft-sand px-4 font-semibold text-charcoal-soft"
            aria-label={`${acceptedRecipes.length} recettes selectionnees`}
            title={`${acceptedRecipes.length} recettes selectionnees`}
          >
            <Utensils className="h-5 w-5 text-mauve-taupe" />
            <span>{acceptedRecipes.length}</span>
          </div>
        </div>
        {/* Completion Progress */}
        <div className="bg-card rounded-2xl p-4 mb-6 broco-chou-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-charcoal-soft">Complétion</span>
            <span className={cn(
              "text-sm font-semibold",
              completionScore >= 80 ? "text-sage-mist" : "text-mauve-taupe"
            )}>
              {completionScore}%
            </span>
          </div>
          <div className="h-2 bg-soft-sand rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                completionScore >= 80 
                  ? "bg-sage-mist" 
                  : "bg-gradient-to-r from-dusty-violet to-mauve-taupe"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${completionScore}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-warm-gray">
            <span>{mainDishes.length}/7 plats minimum</span>
            <span>{desserts.length}/2 desserts minimum</span>
          </div>
        </div>

        {/* Warnings */}
        {!repetitionCheck.valid && (
          <div className="mb-6 p-4 rounded-2xl bg-lavender/30 border border-lavender">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-mauve-taupe shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-charcoal-soft mb-1">
                  Attention aux répétitions
                </p>
                <ul className="space-y-1">
                  {repetitionCheck.warnings.map((warning, i) => (
                    <li key={i} className="text-xs text-warm-gray">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Balance Advice */}
        {balanceAdvice.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-sage-mist/20 border border-sage-mist/30">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-sage-mist shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-charcoal-soft mb-1">
                  Conseils équilibre
                </p>
                <ul className="space-y-1">
                  {balanceAdvice.map((advice, i) => (
                    <li key={i} className="text-xs text-warm-gray">
                      {advice}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Selected Recipes Preview */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-charcoal-soft mb-3">Recettes acceptées</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
            {acceptedRecipes.slice(0, 8).map(recipe => (
              <div 
                key={recipe.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-card/50"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  recipe.categorie === "sucré" ? "bg-lavender/40" : "bg-dusty-violet/20"
                )}>
                  {recipe.categorie === "sucré" ? (
                    <Cake className="h-4 w-4 text-deep-plum" />
                  ) : (
                    <Utensils className="h-4 w-4 text-mauve-taupe" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal-soft truncate">
                    {recipe.nom.charAt(0).toUpperCase() + recipe.nom.slice(1)}
                  </p>
                  <p className="text-xs text-warm-gray capitalize">{recipe.tag}</p>
                </div>
                {favoriteRecipes.some(f => f.id === recipe.id) && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-lavender/50 text-deep-plum">
                    <Star className="h-3 w-3" />
                    Favori
                  </span>
                )}
              </div>
            ))}
            {acceptedRecipes.length > 8 && (
              <p className="text-xs text-center text-warm-gray py-2">
                + {acceptedRecipes.length - 8} autres recettes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 pt-4 space-y-3">
        <Button
          onClick={onGeneratePlan}
          disabled={!hasEnoughMainDishes}
          className={cn(
            "w-full text-white",
            hasEnoughMainDishes 
              ? "bg-gradient-to-r from-dusty-violet to-mauve-taupe hover:opacity-90"
              : "bg-muted text-muted-foreground"
          )}
        >
          Générer mon planning
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onContinueSwiping}
            className="flex-1 border-soft-sand text-warm-gray hover:bg-lavender/20"
          >
            Continuer à swiper
          </Button>
          <Button
            variant="outline"
            onClick={onModifySelection}
            className="flex-1 border-soft-sand text-warm-gray hover:bg-lavender/20"
          >
            Modifier
          </Button>
        </div>
      </div>
    </div>
  )
}
