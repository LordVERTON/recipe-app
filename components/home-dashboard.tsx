"use client"

import { motion } from "framer-motion"
import { ArrowRight, Calendar, Cake, CheckCircle, Clock, Coffee, Sparkles, Utensils } from "lucide-react"
import { useBrocoChouStore } from "@/lib/store"
import { getCurrentMonthFr, getCurrentSeason } from "@/lib/mock-recipes"
import { SEASONS_FR } from "@/lib/types"
import type { PlannedMeal, Recipe } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { NavTab } from "./bottom-navigation"
import { recipeTitle } from "@/lib/recipe-images"

interface HomeDashboardProps {
  userName?: string
  onNavigate: (tab: NavTab) => void
  onViewRecipe: (recipe: Recipe) => void
}

export function HomeDashboard({ userName = "toi", onNavigate, onViewRecipe }: HomeDashboardProps) {
  const { weeklyPlan } = useBrocoChouStore()

  const currentSeason = getCurrentSeason() as keyof typeof SEASONS_FR
  const currentMonth = getCurrentMonthFr()
  const plannedMeals = weeklyPlan?.meals || []
  const cookedMeals = plannedMeals.filter(meal => meal.status === "cuisine").length
  const today = new Date()
  const todayMeals = plannedMeals.filter(meal => new Date(meal.dayDate).toDateString() === today.toDateString())
  const hasWeeklyPlan = weeklyPlan !== null

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="px-6 pb-4 pt-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 text-2xl font-bold text-charcoal-soft">Bonjour, {userName}</h1>
          <p className="text-warm-gray">
            {hasWeeklyPlan
              ? `${cookedMeals}/${plannedMeals.length} repas cuisines cette semaine`
              : "Pret a preparer ta semaine ?"}
          </p>
        </motion.div>
      </div>

      <div className="mb-6 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08 }}
          className="rounded-3xl p-6 broco-chou-gradient broco-chou-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/50">
              <Sparkles className="h-7 w-7 text-mauve-taupe" />
            </div>
            <div className="flex-1">
              <h2 className="mb-1 text-lg font-semibold text-charcoal-soft">
                {hasWeeklyPlan ? "Ton planning" : "Preparer ta semaine"}
              </h2>
              <p className="mb-4 text-sm text-warm-gray">
                {hasWeeklyPlan ? `${SEASONS_FR[currentSeason]} - ${currentMonth}` : "Choisis tes recettes, on s'occupe du reste."}
              </p>
              <Button
                onClick={() => onNavigate(hasWeeklyPlan ? "calendar" : "swipe")}
                className="bg-mauve-taupe text-white hover:bg-deep-plum"
              >
                {hasWeeklyPlan ? "Voir" : "Commencer"}
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
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  meal.mealSlot === "dessert" ? "bg-lavender/40" : meal.mealSlot === "petit_dejeuner" ? "bg-sage-mist/30" : "bg-dusty-violet/20",
                )}>
                  {meal.status === "cuisine" ? (
                    <CheckCircle className="h-6 w-6 text-sage-mist" />
                  ) : meal.mealSlot === "dessert" ? (
                    <Cake className="h-6 w-6 text-deep-plum" />
                  ) : meal.mealSlot === "petit_dejeuner" ? (
                    <Coffee className="h-6 w-6 text-charcoal-soft" />
                  ) : (
                    <Utensils className="h-6 w-6 text-mauve-taupe" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-xs text-warm-gray">{getMealSlotLabel(meal.mealSlot)}</p>
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-6">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Utensils} label="Plats" value={plannedMeals.filter(meal => meal.mealSlot === "dejeuner" || meal.mealSlot === "diner").length} />
            <StatCard icon={Cake} label="Desserts" value={plannedMeals.filter(meal => meal.mealSlot === "dessert").length} />
          </div>
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
