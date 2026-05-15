"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Calendar,
  ChefHat,
  Sparkles,
  ShoppingCart,
  Clock,
  Utensils,
  Cake,
  Coffee,
  CheckCircle,
  PlusCircle,
} from "lucide-react"
import { useBrocoChouStore } from "@/lib/store"
import { getCurrentMonthFr, getCurrentSeason } from "@/lib/mock-recipes"
import { sortRecipesForSwipe, suggestMissingRecipes } from "@/lib/recipe-logic"
import { SEASONS_FR } from "@/lib/types"
import type { PlannedMeal, Recipe } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { NavTab } from "./bottom-navigation"
import { getFallbackRecipeImageUrl, getRecipeImageUrl, recipeTitle } from "@/lib/recipe-images"

interface HomeDashboardProps {
  userName?: string
  onNavigate: (tab: NavTab) => void
  onViewRecipe: (recipe: Recipe) => void
}

export function HomeDashboard({ userName = "toi", onNavigate, onViewRecipe }: HomeDashboardProps) {
  const {
    weeklyPlan,
    acceptedRecipes,
    groceryList,
    recipes,
    preferences,
    recipeHistory,
    addRecipeToAccepted,
    generateWeeklyPlan,
  } = useBrocoChouStore()
  const [suggestionImageSrc, setSuggestionImageSrc] = useState<string | null>(null)

  const currentSeason = getCurrentSeason() as keyof typeof SEASONS_FR
  const currentMonth = getCurrentMonthFr()
  const mainDishes = acceptedRecipes.filter(r => r.tag.includes("dÃ©jeuner") || r.tag.includes("dÃ®ner"))
  const plannedMeals = weeklyPlan?.meals || []
  const cookedMeals = plannedMeals.filter(m => m.status === "cuisine").length
  const today = new Date()
  const todayMeals = weeklyPlan?.meals.filter(m => new Date(m.dayDate).toDateString() === today.toDateString()) || []
  const hasWeeklyPlan = weeklyPlan !== null
  const hasGroceryList = groceryList.length > 0

  const recommendedRecipes = useMemo(
    () => sortRecipesForSwipe(recipes, recipeHistory, preferences)
      .filter(recipe => !acceptedRecipes.some(selected => selected.id === recipe.id)),
    [acceptedRecipes, preferences, recipeHistory, recipes],
  )
  const recipeOfTheDay = recommendedRecipes[0] || recipes[0]
  const nextSuggestions = useMemo(
    () => suggestMissingRecipes(acceptedRecipes, recommendedRecipes, preferences)
      .flatMap(group => group.recipes.map(recipe => ({ recipe, reason: group.type })))
      .slice(0, 3),
    [acceptedRecipes, preferences, recommendedRecipes],
  )

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="px-6 pb-4 pt-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 text-2xl font-bold text-charcoal-soft">Bonjour, {userName}</h1>
          <p className="text-warm-gray">
            {hasWeeklyPlan
              ? `${cookedMeals}/${plannedMeals.length} repas cuisinés cette semaine`
              : "Prêt à préparer ta semaine ?"}
          </p>
        </motion.div>
      </div>

      <div className="mb-6 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 broco-chou-gradient broco-chou-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/50">
              <Sparkles className="h-7 w-7 text-mauve-taupe" />
            </div>
            <div className="flex-1">
              <h2 className="mb-1 text-lg font-semibold text-charcoal-soft">
                {hasWeeklyPlan ? "Voir ton planning" : "Préparer ta semaine"}
              </h2>
              <p className="mb-4 text-sm text-warm-gray">
                {hasWeeklyPlan
                  ? `${SEASONS_FR[currentSeason]} - ${currentMonth}`
                  : "Swipe les recettes, Broco-Chou compose ton planning équilibré."}
              </p>
              <Button
                onClick={() => onNavigate(hasWeeklyPlan ? "calendar" : "swipe")}
                className="bg-gradient-to-r from-dusty-violet to-mauve-taupe text-white hover:opacity-90"
              >
                {hasWeeklyPlan ? "Voir le planning" : "Commencer"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {todayMeals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-charcoal-soft">
            <Calendar className="h-4 w-4 text-mauve-taupe" />
            Aujourd&apos;hui
          </h3>
          <div className="space-y-2">
            {todayMeals.map(meal => (
              <button
                key={meal.id}
                onClick={() => onViewRecipe(meal.recipe)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-all",
                  meal.status === "cuisine" ? "bg-sage-mist/30" : "bg-card broco-chou-shadow hover:bg-lavender/20",
                )}
              >
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", meal.mealSlot === "dessert" ? "bg-lavender/40" : meal.mealSlot === "petit_dejeuner" ? "bg-sage-mist/30" : "bg-dusty-violet/20")}>
                  {meal.status === "cuisine" ? <CheckCircle className="h-6 w-6 text-sage-mist" /> : meal.mealSlot === "dessert" ? <Cake className="h-6 w-6 text-deep-plum" /> : meal.mealSlot === "petit_dejeuner" ? <Coffee className="h-6 w-6 text-charcoal-soft" /> : <Utensils className="h-6 w-6 text-mauve-taupe" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-xs capitalize text-warm-gray">{getMealSlotLabel(meal.mealSlot)}</p>
                  <p className={cn("truncate font-medium", meal.status === "cuisine" ? "text-warm-gray line-through" : "text-charcoal-soft")}>
                    {recipeTitle(meal.recipe)}
                  </p>
                </div>
                {meal.recipe.estimatedTime && (
                  <div className="flex items-center gap-1 text-xs text-warm-gray">
                    <Clock className="h-3 w-3" />
                    {meal.recipe.estimatedTime}min
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {hasWeeklyPlan && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-6">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Utensils} label="Plats prévus" value={plannedMeals.filter(m => m.mealSlot === "dejeuner" || m.mealSlot === "diner").length} />
            <StatCard icon={Cake} label="Desserts" value={plannedMeals.filter(m => m.mealSlot === "dessert").length} />
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-6">
        <h3 className="mb-3 text-sm font-semibold text-charcoal-soft">Accès rapide</h3>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction icon={Sparkles} title="Swiper" subtitle="Choisir des recettes" onClick={() => onNavigate("swipe")} />
          <QuickAction
            icon={ShoppingCart}
            title="Courses"
            subtitle={hasGroceryList ? `${groceryList.length} articles` : "Pas encore"}
            onClick={() => onNavigate("grocery")}
          />
        </div>
      </motion.div>

      {recipeOfTheDay && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-charcoal-soft">
            <ChefHat className="h-4 w-4 text-mauve-taupe" />
            Suggestion du jour
          </h3>
          <button
            onClick={() => onViewRecipe(recipeOfTheDay)}
            className="w-full rounded-2xl bg-card p-4 text-left transition-colors broco-chou-shadow hover:bg-lavender/20"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-lavender/30">
                <img
                  src={suggestionImageSrc || getRecipeImageUrl(recipeOfTheDay)}
                  alt={recipeTitle(recipeOfTheDay)}
                  className="h-full w-full object-cover"
                  onError={() => setSuggestionImageSrc(getFallbackRecipeImageUrl())}
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs text-warm-gray">{recipeOfTheDay.source === "crous" ? "Recette Crous" : "Suggestion Broco-Chou"}</span>
                <p className="truncate font-medium text-charcoal-soft">{recipeTitle(recipeOfTheDay)}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-warm-gray">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {recipeOfTheDay.estimatedTime || 25} min
                  </span>
                  <span>{recipeOfTheDay.portions}</span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-warm-gray" />
            </div>
          </button>
        </motion.div>
      )}

      {nextSuggestions.length > 0 && !hasWeeklyPlan && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-charcoal-soft">
              <Sparkles className="h-4 w-4 text-mauve-taupe" />
              Suggestions pour compléter
            </h3>
            <span className="text-xs text-warm-gray">{mainDishes.length}/7 plats</span>
          </div>
          <div className="space-y-2">
            {nextSuggestions.map(({ recipe, reason }) => (
              <SuggestionRow
                key={recipe.id}
                recipe={recipe}
                reason={reason}
                onView={() => onViewRecipe(recipe)}
                onAdd={() => addRecipeToAccepted(recipe)}
              />
            ))}
          </div>
          {mainDishes.length >= 4 && (
            <Button
              onClick={() => {
                generateWeeklyPlan()
                onNavigate("calendar")
              }}
              className="mt-4 w-full bg-gradient-to-r from-dusty-violet to-mauve-taupe text-white hover:opacity-90"
            >
              Générer le planning
              <Calendar className="ml-2 h-4 w-4" />
            </Button>
          )}
        </motion.div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Utensils; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card p-4 broco-chou-shadow">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dusty-violet/20">
          <Icon className="h-4 w-4 text-mauve-taupe" />
        </div>
        <span className="text-xs text-warm-gray">{label}</span>
      </div>
      <p className="text-2xl font-bold text-charcoal-soft">{value}</p>
    </div>
  )
}

function getMealSlotLabel(slot: PlannedMeal["mealSlot"]): string {
  switch (slot) {
    case "petit_dejeuner":
      return "Petit dej"
    case "dejeuner":
      return "Dejeuner"
    case "diner":
      return "Diner"
    case "dessert":
      return "Dessert"
  }
}

function QuickAction({ icon: Icon, title, subtitle, onClick }: { icon: typeof Sparkles; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 rounded-2xl bg-card p-4 text-left transition-colors broco-chou-shadow hover:bg-lavender/20">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dusty-violet/30 to-mauve-taupe/30">
        <Icon className="h-5 w-5 text-mauve-taupe" />
      </div>
      <div>
        <p className="text-sm font-medium text-charcoal-soft">{title}</p>
        <p className="text-xs text-warm-gray">{subtitle}</p>
      </div>
    </button>
  )
}

function SuggestionRow({ recipe, reason, onView, onAdd }: { recipe: Recipe; reason: string; onView: () => void; onAdd: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3 broco-chou-shadow">
      <button onClick={onView} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-lavender/30">
          <img
            src={getRecipeImageUrl(recipe)}
            alt={recipeTitle(recipe)}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = getFallbackRecipeImageUrl()
            }}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-charcoal-soft">{recipeTitle(recipe)}</p>
          <p className="truncate text-xs text-warm-gray">À ajouter : {reason}</p>
        </div>
      </button>
      <button
        onClick={onAdd}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lavender text-mauve-taupe transition-colors hover:bg-dusty-violet/30"
        aria-label={`Ajouter ${recipeTitle(recipe)}`}
      >
        <PlusCircle className="h-5 w-5" />
      </button>
    </div>
  )
}
