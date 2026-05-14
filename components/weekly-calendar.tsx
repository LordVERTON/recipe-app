"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ChefHat, Check, Repeat, SkipForward, Clock, ShoppingCart, RefreshCw } from "lucide-react"
import { useBrocoChouStore } from "@/lib/store"
import type { Recipe, PlannedMeal } from "@/lib/types"
import { DAYS_FR } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getFallbackRecipeImageUrl, getRecipeImageUrl, recipeTitle } from "@/lib/recipe-images"

interface WeeklyCalendarProps {
  onViewRecipe: (recipe: Recipe) => void
  onReplaceMeal: (meal: PlannedMeal) => void
  onGenerateGroceryList: () => void
  onRedoPlan: () => void
}

export function WeeklyCalendar({ 
  onViewRecipe, 
  onReplaceMeal, 
  onGenerateGroceryList,
  onRedoPlan 
}: WeeklyCalendarProps) {
  const { weeklyPlan, updateMealStatus } = useBrocoChouStore()
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)

  if (!weeklyPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-lavender/50 flex items-center justify-center mb-6">
          <ChefHat className="h-10 w-10 text-mauve-taupe" />
        </div>
        <h2 className="text-xl font-semibold text-charcoal-soft mb-2">
          Pas encore de planning
        </h2>
        <p className="text-warm-gray mb-6">
          Commence par swiper quelques recettes pour créer ton planning de la semaine.
        </p>
      </div>
    )
  }

  // Group meals by day
  const mealsByDay = new Map<number, PlannedMeal[]>()
  weeklyPlan.meals.forEach(meal => {
    const dayIndex = new Date(meal.dayDate).getDay()
    const normalizedIndex = dayIndex === 0 ? 6 : dayIndex - 1 // Monday = 0
    const existing = mealsByDay.get(normalizedIndex) || []
    mealsByDay.set(normalizedIndex, [...existing, meal])
  })

  const today = new Date()
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1

  const selectedMeals = mealsByDay.get(selectedDay) || []

  // Format date for display
  const formatDate = (dayOffset: number) => {
    const date = new Date(weeklyPlan.weekStart)
    date.setDate(date.getDate() + dayOffset)
    return date.getDate()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Balance Score Header */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-charcoal-soft">Ton planning</h2>
          <BalanceScore score={weeklyPlan.balanceScore} />
        </div>
        
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-warm-gray">
            Semaine du {new Date(weeklyPlan.weekStart).toLocaleDateString("fr-FR", { 
              day: "numeric", 
              month: "long" 
            })}
          </span>
        </div>
      </div>

      {/* Day Selector */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
          {DAYS_FR.map((day, index) => {
            const meals = mealsByDay.get(index) || []
            const hasMainMeal = meals.some(m => m.mealSlot !== "dessert")
            const hasDessert = meals.some(m => m.mealSlot === "dessert")
            const allCooked = meals.length > 0 && meals.every(m => m.status === "cuisine")
            const isToday = index === todayIndex
            const isSelected = index === selectedDay

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(index)}
                className={cn(
                  "flex flex-col items-center min-w-[4.5rem] py-2 px-3 rounded-2xl transition-all",
                  isSelected 
                    ? "bg-gradient-to-br from-dusty-violet to-mauve-taupe text-white broco-chou-shadow" 
                    : isToday
                    ? "bg-lavender/50 text-charcoal-soft"
                    : "bg-card text-charcoal-soft hover:bg-lavender/20"
                )}
              >
                <span className="text-xs font-medium mb-1">
                  {day.slice(0, 3)}
                </span>
                <span className={cn(
                  "text-lg font-semibold mb-1",
                  isSelected ? "text-white" : "text-charcoal-soft"
                )}>
                  {formatDate(index)}
                </span>
                <div className="flex gap-0.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    hasMainMeal 
                      ? allCooked ? "bg-sage-mist" : isSelected ? "bg-white/80" : "bg-mauve-taupe"
                      : isSelected ? "bg-white/30" : "bg-soft-sand"
                  )} />
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    hasDessert 
                      ? allCooked ? "bg-sage-mist" : isSelected ? "bg-white/80" : "bg-dusty-violet"
                      : isSelected ? "bg-white/30" : "bg-soft-sand"
                  )} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Meals */}
      <div className="flex-1 px-4 overflow-y-auto hide-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-charcoal-soft">
                {DAYS_FR[selectedDay]} {formatDate(selectedDay)}
              </h3>
              {selectedDay === todayIndex && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-lavender text-deep-plum">
                  Aujourd&apos;hui
                </span>
              )}
            </div>

            {selectedMeals.length === 0 ? (
              <div className="py-8 text-center text-warm-gray">
                <p className="text-sm">Aucun repas prévu ce jour</p>
              </div>
            ) : (
              selectedMeals.map(meal => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onView={() => onViewRecipe(meal.recipe)}
                  onReplace={() => onReplaceMeal(meal)}
                  onToggleCooked={() => {
                    const newStatus = meal.status === "cuisine" ? "planifie" : "cuisine"
                    updateMealStatus(meal.id, newStatus)
                  }}
                  onSkip={() => updateMealStatus(meal.id, "saute")}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 py-4 flex gap-3">
        <Button
          variant="outline"
          onClick={onRedoPlan}
          className="flex-1 border-soft-sand text-warm-gray hover:bg-lavender/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refaire
        </Button>
        <Button
          onClick={onGenerateGroceryList}
          className="flex-1 bg-gradient-to-r from-dusty-violet to-mauve-taupe text-white hover:opacity-90"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Liste de courses
        </Button>
      </div>
    </div>
  )
}

// Balance Score Component
function BalanceScore({ score }: { score: number }) {
  const getScoreColor = () => {
    if (score >= 80) return "text-sage-mist"
    if (score >= 60) return "text-dusty-violet"
    return "text-warm-gray"
  }

  const getScoreLabel = () => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Bon"
    return "À améliorer"
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-soft-sand"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${(score / 100) * 100.5} 100.5`}
            className={getScoreColor()}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-charcoal-soft">
          {score}
        </span>
      </div>
      <div className="text-xs text-right">
        <span className={cn("font-medium", getScoreColor())}>{getScoreLabel()}</span>
        <p className="text-warm-gray">Équilibre</p>
      </div>
    </div>
  )
}

// Meal Card Component
interface MealCardProps {
  meal: PlannedMeal
  onView: () => void
  onReplace: () => void
  onToggleCooked: () => void
  onSkip: () => void
}

function MealCard({ meal, onView, onReplace, onToggleCooked, onSkip }: MealCardProps) {
  const { recipe, mealSlot, status } = meal
  const isCooked = status === "cuisine"
  const isSkipped = status === "saute"
  const [imageSrc, setImageSrc] = useState(getRecipeImageUrl(recipe))

  useEffect(() => {
    setImageSrc(getRecipeImageUrl(recipe))
  }, [recipe])

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden transition-all",
        isSkipped 
          ? "bg-soft-sand/50 opacity-60" 
          : isCooked 
          ? "bg-sage-mist/30" 
          : "bg-card broco-chou-shadow"
      )}
    >
      <button
        onClick={onView}
        className="w-full text-left p-4"
      >
        <div className="flex items-start gap-3">
          {/* Image/Icon */}
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden",
            mealSlot === "dessert" 
              ? "bg-lavender/40" 
              : "bg-dusty-violet/20"
          )}>
            <img
              src={imageSrc}
              alt={recipeTitle(recipe)}
              className="h-full w-full object-cover"
              onError={() => setImageSrc(getFallbackRecipeImageUrl())}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                mealSlot === "dessert" 
                  ? "bg-lavender/50 text-deep-plum" 
                  : "bg-dusty-violet/20 text-mauve-taupe"
              )}>
                {mealSlot === "dessert" ? "Dessert" : "Dîner"}
              </span>
              {recipe.source === "broco-chou" && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-warm-ivory text-warm-gray">
                  Broco-Chou
                </span>
              )}
              {isCooked && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-sage-mist text-charcoal-soft">
                  Cuisiné
                </span>
              )}
            </div>
            <h4 className={cn(
              "font-medium text-charcoal-soft line-clamp-1 mb-1",
              isSkipped && "line-through"
            )}>
              {recipeTitle(recipe)}
            </h4>
            <div className="flex items-center gap-3 text-xs text-warm-gray">
              {recipe.estimatedTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.estimatedTime} min
                </span>
              )}
              <span>{recipe.portions}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Quick Actions */}
      {!isSkipped && (
        <div className="flex border-t border-soft-sand">
          <button
            onClick={onToggleCooked}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
              isCooked 
                ? "text-sage-mist hover:bg-sage-mist/20" 
                : "text-warm-gray hover:bg-lavender/20"
            )}
          >
            <Check className="h-3.5 w-3.5" />
            {isCooked ? "Cuisiné" : "Marquer cuisiné"}
          </button>
          <div className="w-px bg-soft-sand" />
          <button
            onClick={onReplace}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-warm-gray hover:bg-lavender/20 transition-colors"
          >
            <Repeat className="h-3.5 w-3.5" />
            Remplacer
          </button>
          <div className="w-px bg-soft-sand" />
          <button
            onClick={onSkip}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-warm-gray hover:bg-lavender/20 transition-colors"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Passer
          </button>
        </div>
      )}
    </div>
  )
}
