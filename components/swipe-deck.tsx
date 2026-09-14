"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence, PanInfo, animate, useMotionValue, useTransform, type MotionValue } from "framer-motion"
import { X, Heart, Star, RotateCcw, ChefHat, Clock, Users, Utensils } from "lucide-react"
import { useBrocoChouStore } from "@/lib/store"
import type { Recipe } from "@/lib/types"
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
    acceptedRecipes,
    preferences,
    resetSwipes
  } = useBrocoChouStore()

  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null)
  const [showOverlay, setShowOverlay] = useState<"accept" | "reject" | null>(null)
  const isDraggingRef = useRef(false)
  const isSwipeAnimatingRef = useRef(false)
  const dragX = useMotionValue(0)
  const rotate = useTransform(dragX, [-240, 0, 240], [-16, 0, 16])
  const acceptOpacity = useTransform(dragX, [35, 145], [0, 1])
  const rejectOpacity = useTransform(dragX, [-145, -35], [1, 0])

  const currentRecipe = recipes[currentRecipeIndex]
  const nextRecipe = recipes[currentRecipeIndex + 1]
  const thirdRecipe = recipes[currentRecipeIndex + 2]

  const resetSwipeVisualState = useCallback(() => {
    dragX.stop()
    dragX.set(0)
    setShowOverlay(null)
    setExitDirection(null)
  }, [dragX])

  const advanceAfterSwipe = useCallback((action: "accepted" | "rejected" | "favorite") => {
    resetSwipeVisualState()

    swipeRecipe(action)

    requestAnimationFrame(() => {
      resetSwipeVisualState()
      isSwipeAnimatingRef.current = false
    })
  }, [resetSwipeVisualState, swipeRecipe])

  const handleUndo = useCallback(() => {
    if (isSwipeAnimatingRef.current || currentRecipeIndex === 0) return
    resetSwipeVisualState()
    isSwipeAnimatingRef.current = false
    undoLastSwipe()
  }, [currentRecipeIndex, resetSwipeVisualState, undoLastSwipe])

  const handleSwipe = useCallback((direction: "left" | "right") => {
    if (isSwipeAnimatingRef.current) return

    isSwipeAnimatingRef.current = true
    isDraggingRef.current = false
    setExitDirection(direction)
    setShowOverlay(direction === "right" ? "accept" : "reject")
    animate(dragX, direction === "right" ? 520 : -520, { duration: 0.22, ease: "easeOut" })
    setTimeout(() => {
      advanceAfterSwipe(direction === "right" ? "accepted" : "rejected")
    }, 200)
  }, [advanceAfterSwipe, dragX])

  const resetDragPosition = useCallback(() => {
    setShowOverlay(null)
    animate(dragX, 0, { type: "spring", stiffness: 420, damping: 32 })
  }, [dragX])

  const finishDrag = useCallback((offsetX = 0, velocityX = 0) => {
    if (isSwipeAnimatingRef.current) return

    const currentX = dragX.get()
    const effectiveOffset = Math.abs(currentX) > Math.abs(offsetX) ? currentX : offsetX
    const threshold = 100
    const velocity = 500

    isDraggingRef.current = false

    if (effectiveOffset > threshold || velocityX > velocity) {
      handleSwipe("right")
    } else if (effectiveOffset < -threshold || velocityX < -velocity) {
      handleSwipe("left")
    } else {
      resetDragPosition()
    }
  }, [dragX, handleSwipe, resetDragPosition])

  useEffect(() => {
    const handlePointerRelease = () => {
      if (!isDraggingRef.current) return
      finishDrag()
    }

    window.addEventListener("pointerup", handlePointerRelease)
    window.addEventListener("pointercancel", handlePointerRelease)
    window.addEventListener("blur", handlePointerRelease)

    return () => {
      window.removeEventListener("pointerup", handlePointerRelease)
      window.removeEventListener("pointercancel", handlePointerRelease)
      window.removeEventListener("blur", handlePointerRelease)
    }
  }, [finishDrag])

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
    finishDrag(info.offset.x, info.velocity.x)
  }, [finishDrag])

  const handleFavorite = useCallback(() => {
    if (isSwipeAnimatingRef.current) return

    isSwipeAnimatingRef.current = true
    isDraggingRef.current = false
    setExitDirection("right")
    setShowOverlay("accept")
    animate(dragX, 520, { duration: 0.22, ease: "easeOut" })
    setTimeout(() => {
      advanceAfterSwipe("favorite")
    }, 200)
  }, [advanceAfterSwipe, dragX])

  // Older persisted sessions can contain duplicate acceptances. Count only
  // distinct recipes so the deck never declares a week complete too early.
  const uniqueAcceptedRecipes = acceptedRecipes.filter(
    (recipe, index, recipes) => recipes.findIndex(candidate => candidate.id === recipe.id) === index
  )
  const selectedMainMeals = uniqueAcceptedRecipes.filter(isMainMealRecipe)
  const selectedBreakfasts = uniqueAcceptedRecipes.filter(isBreakfastRecipe)
  const selectedDesserts = uniqueAcceptedRecipes.filter(isDessertRecipe)
  const requiredMainMeals = (preferences.mealSlots.includes("dejeuner") ? 7 : 0)
    + (preferences.mealSlots.includes("diner") ? 7 : 0)
  const requiredBreakfasts = preferences.includeBreakfast && preferences.mealSlots.includes("petit_dejeuner") ? 7 : 0
  const requiredDesserts = preferences.includeDessert && preferences.mealSlots.includes("dessert") ? 7 : 0
  const missingMainMeals = Math.max(0, requiredMainMeals - selectedMainMeals.length)
  const missingBreakfasts = Math.max(0, requiredBreakfasts - selectedBreakfasts.length)
  const missingDesserts = Math.max(0, requiredDesserts - selectedDesserts.length)
  const missingRecipeCount = missingMainMeals + missingBreakfasts + missingDesserts
  const selectedRecipeCount = selectedMainMeals.length + selectedBreakfasts.length + selectedDesserts.length
  const hasEnoughRecipes = missingRecipeCount === 0
  const remainingLabel = getRemainingLabel(missingMainMeals, missingBreakfasts, missingDesserts)

  if (hasEnoughRecipes) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-lavender/50 flex items-center justify-center mb-6">
          <Utensils className="h-10 w-10 text-mauve-taupe" />
        </div>
        <h2 className="text-xl font-semibold text-charcoal-soft mb-2">
          Ta semaine est prete !
        </h2>
        <p className="text-warm-gray mb-6">
          Chaque repas prévu pour les 7 prochains jours a une recette différente.
        </p>
        <Button
          onClick={onComplete}
          className="bg-gradient-to-r from-dusty-violet to-mauve-taupe text-white hover:opacity-90"
        >
          Generer mon planning
        </Button>
      </div>
    )
  }
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
          {selectedRecipeCount} recettes sélectionnées. Il manque {remainingLabel} pour compléter la semaine sans répétition.
        </p>
        <Button
          onClick={resetSwipes}
          className="bg-gradient-to-r from-dusty-violet to-mauve-taupe text-white hover:opacity-90"
        >
          Recommencer ma sélection
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[calc(100svh-5rem)] flex-col overflow-hidden">
      {/* Selection Header */}
      <div className="flex h-12 shrink-0 items-center justify-end px-4">
        <div className="text-sm text-warm-gray">
          <div
            className="flex h-8 min-w-12 items-center justify-center gap-1.5 rounded-full bg-soft-sand px-3 font-semibold text-charcoal-soft"
            aria-label={`${selectedRecipeCount} recettes sélectionnées, ${remainingLabel} restant`}
            title={`${selectedRecipeCount} recettes sélectionnées, ${remainingLabel} restant`}
          >
            <Utensils className="h-4 w-4 text-mauve-taupe" />
            <span>{selectedRecipeCount}</span>
          </div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative flex min-h-0 flex-1 items-start justify-center px-4 pb-2 pt-0">
        <div className="relative h-[clamp(280px,52vh,500px)] w-[min(88vw,360px)] swipe-card">
          <AnimatePresence mode="popLayout">
            {/* Deeper Background Card */}
            {thirdRecipe && (
              <motion.div
                key={thirdRecipe.id + "-third-bg"}
                className="absolute inset-0"
                initial={{ scale: 0.88, opacity: 0, x: 0, y: 28, rotate: 0 }}
                animate={{ scale: 0.9, opacity: 0.38, x: 0, y: 28, rotate: 0 }}
                style={{ zIndex: 0, x: 0, rotate: 0 }}
              >
                <RecipeCardContent recipe={thirdRecipe} isBackground />
              </motion.div>
            )}

            {/* Background Card (Next Recipe) */}
            {nextRecipe && (
              <motion.div
                key={nextRecipe.id + "-bg"}
                className="absolute inset-0"
                initial={{ scale: 0.9, opacity: 0, x: 0, y: 14, rotate: 0 }}
                animate={{ scale: exitDirection ? 1 : 0.95, opacity: 0.72, x: 0, y: exitDirection ? 0 : 14, rotate: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 260 }}
                style={{ zIndex: 1, x: 0, rotate: 0 }}
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
              onDragStart={() => {
                isDraggingRef.current = true
              }}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              initial={{ scale: 1, x: 0, y: 0, rotate: 0 }}
              animate={{ 
                scale: 1, 
                opacity: exitDirection ? 0 : 1
              }}
              exit={{ opacity: 0 }}
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
      <div className="shrink-0 px-4 pb-5 pt-2">
        <div className="flex items-center justify-center gap-4">
          {/* Undo Button */}
          <button
            onClick={handleUndo}
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

      </div>
    </div>
  )
}

function normalizedRecipeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function isBreakfastRecipe(recipe: Recipe): boolean {
  const tag = normalizedRecipeText(recipe.tag)
  return tag.includes("petit") && tag.includes("dejeuner")
}

function isDessertRecipe(recipe: Recipe): boolean {
  return normalizedRecipeText(recipe.tag) === "dessert" || normalizedRecipeText(recipe.categorie).includes("sucre")
}

function isMainMealRecipe(recipe: Recipe): boolean {
  const tag = normalizedRecipeText(recipe.tag)
  return !isBreakfastRecipe(recipe) && !isDessertRecipe(recipe)
    && (tag.includes("dejeuner") || tag.includes("diner"))
}

function getRemainingLabel(missingMainMeals: number, missingBreakfasts: number, missingDesserts: number): string {
  const missingByType = [
    missingMainMeals > 0 && `${missingMainMeals} plat${missingMainMeals > 1 ? "s" : ""}`,
    missingBreakfasts > 0 && `${missingBreakfasts} petit${missingBreakfasts > 1 ? "s" : ""}-déjeuner${missingBreakfasts > 1 ? "s" : ""}`,
    missingDesserts > 0 && `${missingDesserts} dessert${missingDesserts > 1 ? "s" : ""}`,
  ].filter(Boolean)

  return missingByType.join(", ") || "aucune recette"
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
  const imageSrc = getRecipeImageUrl(recipe)

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
      <div className="relative h-[52%] bg-lavender/30">
        <img
          src={imageSrc}
          alt={recipeTitle(recipe)}
          className="absolute inset-0 h-full w-full object-cover"
          loading={isBackground ? "lazy" : "eager"}
          onError={event => {
            event.currentTarget.onerror = null
            event.currentTarget.src = getFallbackRecipeImageUrl()
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-soft/25 via-transparent to-transparent" />
      </div>

      {/* Content Section */}
      <div className="flex h-[48%] flex-col p-5">
        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-pretty text-lg font-semibold leading-tight text-charcoal-soft">
          {recipeTitle(recipe)}
        </h3>

        {/* Meta Info */}
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-warm-gray">
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
        </div>

        {/* Main Ingredients */}
        <div className="flex-1 min-h-0">
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
            className="mt-4 text-sm font-medium text-mauve-taupe transition-colors hover:text-deep-plum"
          >
            Details
          </button>
        )}
      </div>
    </div>
  )
}
