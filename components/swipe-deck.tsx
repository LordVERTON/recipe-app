"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence, PanInfo, animate, useMotionValue, useTransform, type MotionValue } from "framer-motion"
import { X, Heart, Star, RotateCcw, ChefHat, Clock, Users, Leaf, Fish, Flame, Microwave } from "lucide-react"
import { useBrocoChouStore } from "@/lib/store"
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
  } = useBrocoChouStore()

  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null)
  const [showOverlay, setShowOverlay] = useState<"accept" | "reject" | null>(null)
  const dragX = useMotionValue(0)
  const rotate = useTransform(dragX, [-240, 0, 240], [-16, 0, 16])
  const acceptOpacity = useTransform(dragX, [35, 145], [0, 1])
  const rejectOpacity = useTransform(dragX, [-145, -35], [1, 0])

  const currentRecipe = recipes[currentRecipeIndex]
  const nextRecipe = recipes[currentRecipeIndex + 1]
  const thirdRecipe = recipes[currentRecipeIndex + 2]
  const progress = getSwipeProgress()

  const handleSwipe = useCallback((direction: "left" | "right") => {
    setExitDirection(direction)
    setShowOverlay(direction === "right" ? "accept" : "reject")
    animate(dragX, direction === "right" ? 520 : -520, { duration: 0.22, ease: "easeOut" })
    setTimeout(() => {
      swipeRecipe(direction === "right" ? "accepted" : "rejected")
      setExitDirection(null)
      setShowOverlay(null)
      dragX.set(0)
    }, 200)
  }, [dragX, swipeRecipe])

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
      animate(dragX, 0, { type: "spring", stiffness: 420, damping: 32 })
    }
  }, [dragX, handleSwipe])

  const handleFavorite = useCallback(() => {
    setExitDirection("right")
    setShowOverlay("accept")
    animate(dragX, 520, { duration: 0.22, ease: "easeOut" })
    setTimeout(() => {
      swipeRecipe("favorite")
      setExitDirection(null)
      setShowOverlay(null)
      dragX.set(0)
    }, 200)
  }, [dragX, swipeRecipe])

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
    <div className="flex h-full min-h-[calc(100svh-5rem)] flex-col overflow-hidden">
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
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-3">
        <div className="relative h-[clamp(300px,56vh,520px)] w-[min(88vw,360px)] swipe-card">
          <AnimatePresence mode="popLayout">
            {/* Deeper Background Card */}
            {thirdRecipe && (
              <motion.div
                key={thirdRecipe.id + "-third-bg"}
                className="absolute inset-0"
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 0.9, opacity: 0.38, y: 28 }}
                style={{ zIndex: 0 }}
              >
                <RecipeCardContent recipe={thirdRecipe} isBackground />
              </motion.div>
            )}

            {/* Background Card (Next Recipe) */}
            {nextRecipe && (
              <motion.div
                key={nextRecipe.id + "-bg"}
                className="absolute inset-0"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: exitDirection ? 1 : 0.95, opacity: 0.72, y: exitDirection ? 0 : 14 }}
                transition={{ type: "spring", damping: 25, stiffness: 260 }}
                style={{ zIndex: 1 }}
              >
                <RecipeCardContent recipe={nextRecipe} isBackground />
              </motion.div>
            )}

            {/* Active Card */}
            <motion.div
              key={currentRecipe.id}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{ zIndex: 2, x: dragX, rotate }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.9}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              initial={{ scale: 1, x: 0 }}
              animate={{ 
                scale: 1, 
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
                acceptOpacity={acceptOpacity}
                rejectOpacity={rejectOpacity}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="shrink-0 px-4 pb-4 pt-1">
        <div className="flex items-center justify-center gap-4">
          {/* Undo Button */}
          <button
            onClick={undoLastSwipe}
            disabled={currentRecipeIndex === 0}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center transition-all",
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
              "h-16 w-16 rounded-full flex items-center justify-center transition-all",
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
              "h-16 w-16 rounded-full flex items-center justify-center transition-all",
              "bg-gradient-to-br from-dusty-violet to-mauve-taupe text-white",
              "hover:opacity-90 active:scale-95 broco-chou-shadow"
            )}
          >
            <Heart className="h-7 w-7" />
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center transition-all",
              "bg-lavender text-mauve-taupe",
              "hover:bg-dusty-violet/30 active:scale-95"
            )}
          >
            <Star className="h-5 w-5" />
          </button>
        </div>

        {/* Action Labels */}
        <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-warm-gray">
          <span className="text-center">Annuler</span>
          <span className="text-center">Pas cette semaine</span>
          <span className="text-center">Je veux la faire</span>
          <span className="text-center">Favori</span>
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
  acceptOpacity?: MotionValue<number>
  rejectOpacity?: MotionValue<number>
}

function RecipeCardContent({ recipe, isBackground, onViewDetails, showOverlay, acceptOpacity, rejectOpacity }: RecipeCardContentProps) {
  const [imageSrc, setImageSrc] = useState(getRecipeImageUrl(recipe))

  useEffect(() => {
    setImageSrc(getRecipeImageUrl(recipe))
  }, [recipe])

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
        "relative h-full w-full overflow-hidden rounded-[28px] bg-card broco-chou-shadow",
        "border border-soft-sand",
        isBackground && "pointer-events-none"
      )}
    >
      {/* Swipe Overlays */}
      <AnimatePresence>
        {!isBackground && (
          <motion.div 
            key="accept-overlay"
            className="absolute inset-0 bg-mauve-taupe/20 z-10 flex items-center justify-center pointer-events-none"
            style={{ opacity: showOverlay === "accept" ? 1 : acceptOpacity }}
          >
            <div className="px-6 py-3 rounded-xl bg-mauve-taupe text-white font-semibold text-lg rotate-[-15deg] border-2 border-white">
              JE VEUX LA FAIRE
            </div>
          </motion.div>
        )}
        {!isBackground && (
          <motion.div 
            key="reject-overlay"
            className="absolute inset-0 bg-warm-gray/20 z-10 flex items-center justify-center pointer-events-none"
            style={{ opacity: showOverlay === "reject" ? 1 : rejectOpacity }}
          >
            <div className="px-6 py-3 rounded-xl bg-warm-gray text-white font-semibold text-lg rotate-[15deg] border-2 border-white">
              PAS CETTE SEMAINE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Section */}
      <div className="relative h-[43%] bg-gradient-to-br from-lavender/40 to-dusty-violet/30">
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
          {recipe.source === "crous" ? "Recette Crous" : "Suggestion Broco-Chou"}
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
      <div className="flex h-[57%] flex-col p-4">
        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-pretty text-lg font-semibold leading-tight text-charcoal-soft">
          {recipeTitle(recipe)}
        </h3>

        {/* Meta Info */}
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-warm-gray">
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
            <span className="rounded-full bg-lavender/30 px-2 py-0.5 text-xs text-deep-plum">
              {recipe.difficulty}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-1.5">
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
          <p className="line-clamp-2 text-sm text-charcoal-soft">
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
            className="mt-2 rounded-full bg-lavender/45 py-2 text-sm font-medium text-mauve-taupe transition-colors hover:bg-lavender hover:text-deep-plum"
          >
            Voir la recette complète
          </button>
        )}
      </div>
    </div>
  )
}
