"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { X, Heart, Star, RotateCcw, ChefHat, Clock, Users, Leaf, Fish, Flame, Microwave } from "lucide-react"
import { useLumoraStore } from "@/lib/store"
import type { Recipe } from "@/lib/types"
import { SEASONS_FR } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getFallbackRecipeImageUrl, getRecipeImageUrl, recipeTitle } from "@/lib/recipe-images"

interface SwipeDeckProps {
  onViewRecipeDetails: (recipe: Recipe) => void
  onComplete: () => void
}

export function SwipeDeck({ onViewRecipeDetails, onComplete }: SwipeDeckProps) {
  const { 
    recipes, 
    currentRecipeIndex, 
    swipeRecipe, 
    undoLastSwipe,
    getSwipeProgress,
    acceptedRecipes
  } = useLumoraStore()

  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null)
  const [showOverlay, setShowOverlay] = useState<"accept" | "reject" | null>(null)

  const currentRecipe = recipes[currentRecipeIndex]
  const nextRecipe = recipes[currentRecipeIndex + 1]
  const progress = getSwipeProgress()

  const handleSwipe = useCallback((direction: "left" | "right") => {
    setExitDirection(direction)
    setTimeout(() => {
      swipeRecipe(direction === "right" ? "accepted" : "rejected")
      setExitDirection(null)
      setShowOverlay(null)
    }, 200)
  }, [swipeRecipe])

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    const threshold = 50
    if (info.offset.x > threshold) {
      setShowOverlay("accept")
    } else if (info.offset.x < -threshold) {
      setShowOverlay("reject")
    } else {
      setShowOverlay(null)
    }
  }, [])

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 100
    const velocity = 500

    if (info.offset.x > threshold || info.velocity.x > velocity) {
      handleSwipe("right")
    } else if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      handleSwipe("left")
    } else {
      setShowOverlay(null)
    }
  }, [handleSwipe])

  const handleFavorite = useCallback(() => {
    setExitDirection("right")
    setTimeout(() => {
      swipeRecipe("favorite")
      setExitDirection(null)
    }, 200)
  }, [swipeRecipe])

  // Check if enough recipes are selected
  const hasEnoughRecipes = acceptedRecipes.length >= 7
  const mainDishes = acceptedRecipes.filter(r => r.tag.includes("déjeuner") || r.tag.includes("dîner"))
  const desserts = acceptedRecipes.filter(r => r.tag === "dessert" || r.categorie === "sucré")

  if (!currentRecipe) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-lavender/50 flex items-center justify-center mb-6">
          <ChefHat className="h-10 w-10 text-mauve-taupe" />
        </div>
        <h2 className="text-xl font-semibold text-charcoal-soft mb-2">
          Tu as parcouru toutes les recettes !
        </h2>
        <p className="text-warm-gray mb-6">
          {acceptedRecipes.length} recettes sélectionnées
        </p>
        <Button
          onClick={onComplete}
          className="bg-gradient-to-r from-dusty-violet to-mauve-taupe text-white hover:opacity-90"
        >
          Générer mon planning
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-warm-gray">
            {currentRecipeIndex + 1} / {recipes.length}
          </span>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-mauve-taupe font-medium">
              {mainDishes.length} plats
            </span>
            <span className="text-dusty-violet font-medium">
              {desserts.length} desserts
            </span>
            <span className="sr-only">{progress.accepted} recettes retenues</span>
          </div>
        </div>
        <div className="h-1.5 bg-soft-sand rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-dusty-violet to-mauve-taupe rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentRecipeIndex / recipes.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative px-4 pb-4">
        <div className="relative w-full h-full max-w-sm mx-auto">
          <AnimatePresence mode="popLayout">
            {/* Background Card (Next Recipe) */}
            {nextRecipe && (
              <motion.div
                key={nextRecipe.id + "-bg"}
                className="absolute inset-0"
                initial={{ scale: 0.92, opacity: 0.5 }}
                animate={{ scale: 0.95, opacity: 0.7 }}
                style={{ zIndex: 0 }}
              >
                <RecipeCardContent recipe={nextRecipe} isBackground />
              </motion.div>
            )}

            {/* Active Card */}
            <motion.div
              key={currentRecipe.id}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{ zIndex: 1 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.9}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              initial={{ scale: 1, x: 0 }}
              animate={{ 
                scale: 1, 
                x: exitDirection === "left" ? -400 : exitDirection === "right" ? 400 : 0,
                rotate: exitDirection === "left" ? -20 : exitDirection === "right" ? 20 : 0,
                opacity: exitDirection ? 0 : 1
              }}
              exit={{ 
                x: exitDirection === "left" ? -400 : 400,
                rotate: exitDirection === "left" ? -20 : 20,
                opacity: 0 
              }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <RecipeCardContent 
                recipe={currentRecipe} 
                onViewDetails={() => onViewRecipeDetails(currentRecipe)}
                showOverlay={showOverlay}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-center gap-4">
          {/* Undo Button */}
          <button
            onClick={undoLastSwipe}
            disabled={currentRecipeIndex === 0}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              "bg-soft-sand text-warm-gray",
              currentRecipeIndex === 0 ? "opacity-40" : "hover:bg-muted active:scale-95"
            )}
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          {/* Reject Button */}
          <button
            onClick={() => handleSwipe("left")}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all",
              "bg-soft-sand text-warm-gray border-2 border-soft-sand",
              "hover:border-warm-gray hover:bg-warm-ivory active:scale-95"
            )}
          >
            <X className="h-7 w-7" />
          </button>

          {/* Accept Button */}
          <button
            onClick={() => handleSwipe("right")}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all",
              "bg-gradient-to-br from-dusty-violet to-mauve-taupe text-white",
              "hover:opacity-90 active:scale-95 lumora-shadow"
            )}
          >
            <Heart className="h-7 w-7" />
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              "bg-lavender text-mauve-taupe",
              "hover:bg-dusty-violet/30 active:scale-95"
            )}
          >
            <Star className="h-5 w-5" />
          </button>
        </div>

        {/* Action Labels */}
        <div className="flex items-center justify-center gap-12 mt-3 text-xs text-warm-gray">
          <span className="w-16 text-center">Annuler</span>
          <span className="w-20 text-center">Pas cette semaine</span>
          <span className="w-20 text-center">Je veux la faire</span>
          <span className="w-16 text-center">Favori</span>
        </div>

        {/* Complete Button when enough recipes */}
        {hasEnoughRecipes && (
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-dusty-violet to-mauve-taupe text-white hover:opacity-90"
            >
              Générer mon planning ({acceptedRecipes.length} recettes)
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Recipe Card Content Component
interface RecipeCardContentProps {
  recipe: Recipe
  isBackground?: boolean
  onViewDetails?: () => void
  showOverlay?: "accept" | "reject" | null
}

function RecipeCardContent({ recipe, isBackground, onViewDetails, showOverlay }: RecipeCardContentProps) {
  const [imageSrc, setImageSrc] = useState(getRecipeImageUrl(recipe))

  const getDietaryInfo = () => {
    if (recipe.dietary_tags?.includes("végétarien")) {
      return { icon: <Leaf className="h-3.5 w-3.5" />, label: "Végétarien", color: "bg-sage-mist/50" }
    }
    if (recipe.dietary_tags?.includes("poisson")) {
      return { icon: <Fish className="h-3.5 w-3.5" />, label: "Poisson", color: "bg-dusty-violet/30" }
    }
    if (recipe.dietary_tags?.includes("légumineuses")) {
      return { icon: <Leaf className="h-3.5 w-3.5" />, label: "Légumineuses", color: "bg-sage-mist/50" }
    }
    return null
  }

  const dietaryInfo = getDietaryInfo()

  return (
    <div
      className={cn(
        "w-full h-full rounded-3xl overflow-hidden bg-card lumora-shadow",
        "border border-soft-sand relative",
        isBackground && "pointer-events-none"
      )}
    >
      {/* Swipe Overlays */}
      <AnimatePresence>
        {showOverlay === "accept" && (
          <motion.div 
            className="absolute inset-0 bg-mauve-taupe/20 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="px-6 py-3 rounded-xl bg-mauve-taupe text-white font-semibold text-lg rotate-[-15deg] border-2 border-white">
              JE VEUX LA FAIRE
            </div>
          </motion.div>
        )}
        {showOverlay === "reject" && (
          <motion.div 
            className="absolute inset-0 bg-warm-gray/20 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="px-6 py-3 rounded-xl bg-warm-gray text-white font-semibold text-lg rotate-[15deg] border-2 border-white">
              PAS CETTE SEMAINE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Section */}
      <div className="relative h-[42%] bg-gradient-to-br from-lavender/40 to-dusty-violet/30">
        <img
          src={imageSrc}
          alt={recipeTitle(recipe)}
          className="absolute inset-0 h-full w-full object-cover"
          loading={isBackground ? "lazy" : "eager"}
          onError={() => setImageSrc(getFallbackRecipeImageUrl())}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-soft/25 via-transparent to-charcoal-soft/10" />
        
        {/* Source Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            recipe.source === "crous" 
              ? "bg-sage-mist/90 text-charcoal-soft" 
              : "bg-lavender/90 text-deep-plum"
          )}>
          {recipe.source === "crous" ? "Recette Crous" : "Suggestion Lumora"}
          </span>
        </div>

        {/* Season Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-warm-gray">
            {SEASONS_FR[recipe.saison]} - {recipe.mois}
          </span>
        </div>

        {/* Meal Type */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-charcoal-soft capitalize">
            {recipe.tag}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 h-[58%] flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-semibold text-charcoal-soft leading-tight line-clamp-2 mb-2 text-pretty">
          {recipeTitle(recipe)}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-warm-gray mb-3">
          {recipe.estimatedTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.estimatedTime} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.portions}</span>
          </div>
          {recipe.difficulty && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-lavender/30 text-deep-plum">
              {recipe.difficulty}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {dietaryInfo && (
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
              dietaryInfo.color, "text-charcoal-soft"
            )}>
              {dietaryInfo.icon}
              {dietaryInfo.label}
            </span>
          )}
          
          {recipe.sans_four && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-lavender/40 text-deep-plum">
              <Flame className="h-3 w-3" />
              Sans four
            </span>
          )}
          
          {recipe.cuisson_micro_ondes && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-dusty-violet/20 text-deep-plum">
              <Microwave className="h-3 w-3" />
              Micro-ondes
            </span>
          )}
        </div>

        {/* Main Ingredients */}
        <div className="flex-1 min-h-0">
          <p className="text-xs text-warm-gray mb-1">Ingrédients principaux</p>
          <p className="text-sm text-charcoal-soft line-clamp-2">
            {recipe.main_ingredients?.slice(0, 4).join(", ") || 
             recipe.ingredients.slice(0, 3).map(i => i.name.split("(")[0].trim()).join(", ")}
          </p>
        </div>

        {/* View Details */}
        {onViewDetails && !isBackground && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails()
            }}
            className="mt-2 py-2 text-sm font-medium text-mauve-taupe hover:text-deep-plum transition-colors"
          >
            Voir la recette complète
          </button>
        )}
      </div>
    </div>
  )
}
