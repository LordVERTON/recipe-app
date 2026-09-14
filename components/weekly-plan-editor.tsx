"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Check, ChevronLeft, ChevronRight, PencilLine, Plus, RotateCcw, Search, X } from "lucide-react"
import { useBrocoChouStore } from "@/lib/store"
import type { MealSlot, PlannedMeal, Recipe, Season } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { recipeTitle } from "@/lib/recipe-images"

interface WeeklyPlanEditorProps {
  onDone: () => void
}

const mealSlots: { id: MealSlot; label: string; description: string }[] = [
  { id: "petit_dejeuner", label: "Petit-déjeuner", description: "Commencer la journée" },
  { id: "dejeuner", label: "Déjeuner", description: "Le midi" },
  { id: "diner", label: "Dîner", description: "Le soir" },
  { id: "dessert", label: "Dessert", description: "Une touche sucrée" },
]

function sameCalendarDay(first: Date | string, second: Date | string) {
  const firstDate = new Date(first)
  const secondDate = new Date(second)
  return firstDate.getFullYear() === secondDate.getFullYear()
    && firstDate.getMonth() === secondDate.getMonth()
    && firstDate.getDate() === secondDate.getDate()
}

function getDayLabel(date: Date, short = false) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: short ? "short" : "long",
    day: "numeric",
    month: short ? undefined : "long",
  }).format(date)
}

export function WeeklyPlanEditor({ onDone }: WeeklyPlanEditorProps) {
  const { weeklyPlan, recipeCatalog, preferences, setMealInPlan, removeMealFromPlan } = useBrocoChouStore()
  const [selectedDay, setSelectedDay] = useState(0)
  const [query, setQuery] = useState("")
  const [season, setSeason] = useState<Season | "all">("all")
  const [maxTime, setMaxTime] = useState<number | "all">("all")
  const [diet, setDiet] = useState<"all" | "vegetarien" | "poisson">("all")
  const [equipment, setEquipment] = useState("all")
  const [pendingRemoval, setPendingRemoval] = useState<{ meal: PlannedMeal; date: Date } | null>(null)
  const [lastRemoved, setLastRemoved] = useState<{ meal: PlannedMeal; date: Date } | null>(null)

  const days = useMemo(() => {
    if (!weeklyPlan) return []
    const start = new Date(weeklyPlan.weekStart)
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return date
    })
  }, [weeklyPlan])

  const recipes = useMemo(() => {
    if (!weeklyPlan) return recipeCatalog
    const plannedRecipes = weeklyPlan.meals.map(meal => meal.recipe)
    return [...recipeCatalog, ...plannedRecipes].filter(
      (recipe, index, list) => list.findIndex(candidate => candidate.id === recipe.id) === index
    )
  }, [recipeCatalog, weeklyPlan])

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr-FR")
    return recipes.filter(recipe => {
      const matchesQuery = !normalizedQuery || recipeTitle(recipe).toLocaleLowerCase("fr-FR").includes(normalizedQuery)
      const matchesSeason = season === "all" || recipe.saison === season
      const matchesTime = maxTime === "all" || (recipe.estimatedTime ?? Number.POSITIVE_INFINITY) <= maxTime
      const tags = recipe.dietary_tags?.map(tag => tag.toLocaleLowerCase("fr-FR")) ?? []
      const matchesDiet = diet === "all" || (diet === "vegetarien" ? tags.includes("végétarien") : tags.includes("poisson"))
      const matchesEquipment = equipment === "all" || recipe.equipment?.some(item => item === equipment)
      return matchesQuery && matchesSeason && matchesTime && matchesDiet && matchesEquipment
    })
  }, [diet, equipment, maxTime, query, recipes, season])

  const equipmentOptions = useMemo(() => Array.from(new Set(recipes.flatMap(recipe => recipe.equipment ?? []))).sort(), [recipes])

  if (!weeklyPlan || days.length === 0) return null

  const activeDate = days[selectedDay]
  const activeMeals = weeklyPlan.meals.filter(meal => sameCalendarDay(meal.dayDate, activeDate))
  const plannedCount = weeklyPlan.meals.filter(meal => meal.status !== "saute").length

  const getMeal = (slot: MealSlot) => activeMeals.find(meal => meal.mealSlot === slot)
  const visibleMealSlots = mealSlots.filter(slot => preferences.mealSlots.includes(slot.id))
  const slotsToDisplay = visibleMealSlots.length > 0 ? visibleMealSlots : mealSlots

  const updateSlot = (slot: MealSlot, recipeId: string) => {
    const recipe = recipes.find(candidate => candidate.id === recipeId)
    if (recipe) setMealInPlan(activeDate, slot, recipe)
  }

  const requestRemoval = (slot: MealSlot) => {
    const meal = getMeal(slot)
    if (meal) setPendingRemoval({ meal, date: activeDate })
  }

  const confirmRemoval = () => {
    if (!pendingRemoval) return
    removeMealFromPlan(pendingRemoval.date, pendingRemoval.meal.mealSlot)
    setLastRemoved(pendingRemoval)
    setPendingRemoval(null)
  }

  return (
    <div className="flex min-h-full flex-col pb-24">
      <header className="px-6 pb-4 pt-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-mauve-taupe">
              <PencilLine className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Planning personnalisé</span>
            </div>
            <h1 className="text-2xl font-bold text-charcoal-soft">Compose ta semaine</h1>
            <p className="mt-1 text-sm text-warm-gray">Du {getDayLabel(days[0])} au {getDayLabel(days[6])}</p>
          </div>
          <span className="shrink-0 rounded-full bg-lavender/50 px-3 py-1 text-xs font-medium text-deep-plum">
            {plannedCount} repas
          </span>
        </div>
        <p className="rounded-2xl bg-sage-mist/30 px-4 py-3 text-sm text-charcoal-soft">
          Tes changements sont enregistrés automatiquement. La liste de courses sera actualisée quand tu la régénéreras.
        </p>

        <div className="mt-4 rounded-2xl bg-card p-3 broco-chou-shadow">
          <label className="sr-only" htmlFor="recipe-search">Rechercher une recette</label>
          <div className="flex items-center gap-2 rounded-xl border border-soft-sand bg-warm-ivory px-3">
            <Search className="h-4 w-4 text-warm-gray" />
            <input
              id="recipe-search"
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Rechercher une recette"
              className="min-h-10 w-full bg-transparent text-sm text-charcoal-soft outline-none placeholder:text-warm-gray"
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-xs text-warm-gray">
              Saison
              <select value={season} onChange={event => setSeason(event.target.value as Season | "all")} className="mt-1 min-h-10 w-full rounded-lg border border-soft-sand bg-warm-ivory px-2 text-sm text-charcoal-soft">
                <option value="all">Toutes</option>
                <option value="hiver">Hiver</option>
                <option value="printemps">Printemps</option>
                <option value="été">Été</option>
                <option value="automne">Automne</option>
              </select>
            </label>
            <label className="text-xs text-warm-gray">
              Temps maximum
              <select value={maxTime} onChange={event => setMaxTime(event.target.value === "all" ? "all" : Number(event.target.value))} className="mt-1 min-h-10 w-full rounded-lg border border-soft-sand bg-warm-ivory px-2 text-sm text-charcoal-soft">
                <option value="all">Sans limite</option>
                <option value="20">20 minutes</option>
                <option value="40">40 minutes</option>
                <option value="60">1 heure</option>
              </select>
            </label>
            <label className="text-xs text-warm-gray">
              Régime
              <select value={diet} onChange={event => setDiet(event.target.value as typeof diet)} className="mt-1 min-h-10 w-full rounded-lg border border-soft-sand bg-warm-ivory px-2 text-sm text-charcoal-soft">
                <option value="all">Tous</option>
                <option value="vegetarien">Végétarien</option>
                <option value="poisson">Poisson</option>
              </select>
            </label>
            <label className="text-xs text-warm-gray">
              Équipement
              <select value={equipment} onChange={event => setEquipment(event.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-soft-sand bg-warm-ivory px-2 text-sm text-charcoal-soft">
                <option value="all">Tout équipement</option>
                {equipmentOptions.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <p className="mt-2 text-xs text-warm-gray">{filteredRecipes.length} recettes correspondent aux filtres.</p>
        </div>
      </header>

      <div className="mb-5 px-4">
        <div className="flex gap-2 overflow-x-auto py-1 hide-scrollbar" aria-label="Jours du planning">
          {days.map((date, index) => {
            const isSelected = index === selectedDay
            const mealCount = weeklyPlan.meals.filter(meal => sameCalendarDay(meal.dayDate, date)).length
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setSelectedDay(index)}
                aria-pressed={isSelected}
                className={cn(
                  "flex min-w-[4.25rem] flex-col items-center rounded-xl px-3 py-2 transition-all",
                  isSelected
                    ? "bg-gradient-to-br from-dusty-violet to-mauve-taupe text-white broco-chou-shadow"
                    : "bg-card text-charcoal-soft hover:bg-lavender/20"
                )}
              >
                <span className="text-xs font-medium capitalize">{getDayLabel(date, true).replace(".", "")}</span>
                <span className="my-1 text-lg font-semibold">{date.getDate()}</span>
                <span className={cn("text-[10px]", isSelected ? "text-white/80" : "text-warm-gray")}>
                  {mealCount === 0 ? "Libre" : `${mealCount} repas`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <main className="flex-1 px-6">
        <div className="mb-4 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={selectedDay === 0}
            onClick={() => setSelectedDay(day => Math.max(0, day - 1))}
            className="text-warm-gray"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
          </Button>
          <h2 className="font-semibold capitalize text-charcoal-soft">{getDayLabel(activeDate)}</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={selectedDay === days.length - 1}
            onClick={() => setSelectedDay(day => Math.min(days.length - 1, day + 1))}
            className="text-warm-gray"
          >
            Suivant <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {slotsToDisplay.map(slot => {
            const meal = getMeal(slot.id)
            return (
              <MealSlotPicker
                key={slot.id}
                slot={slot}
                meal={meal?.recipe}
                recipes={filteredRecipes.filter(recipe =>
                  recipe.id === meal?.recipeId || !weeklyPlan.meals.some(plannedMeal => plannedMeal.recipeId === recipe.id)
                )}
                onChange={recipeId => updateSlot(slot.id, recipeId)}
                onClear={() => requestRemoval(slot.id)}
              />
            )
          })}
        </div>
      </main>

      <div className="px-6 pt-6">
        {lastRemoved && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-lavender/40 px-3 py-2 text-sm text-charcoal-soft">
            <span className="truncate">Repas retiré</span>
            <button
              type="button"
              onClick={() => {
                setMealInPlan(lastRemoved.date, lastRemoved.meal.mealSlot, lastRemoved.meal.recipe)
                setLastRemoved(null)
              }}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 font-semibold text-mauve-taupe hover:bg-lavender"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Annuler
            </button>
          </div>
        )}
        <Button
          type="button"
          onClick={onDone}
          className="w-full bg-gradient-to-r from-dusty-violet to-mauve-taupe text-white hover:opacity-90"
        >
          <Check className="mr-2 h-4 w-4" />
          Voir mon planning
        </Button>
      </div>

      {pendingRemoval && (
        <div className="fixed inset-0 z-50 flex items-end bg-charcoal-soft/40 p-4 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="remove-meal-title">
          <div className="w-full max-w-sm rounded-3xl bg-warm-ivory p-6 broco-chou-shadow">
            <AlertTriangle className="mb-3 h-6 w-6 text-mauve-taupe" />
            <h2 id="remove-meal-title" className="text-lg font-semibold text-charcoal-soft">Retirer ce repas ?</h2>
            <p className="mt-2 text-sm text-warm-gray">{recipeTitle(pendingRemoval.meal.recipe)} sera retiré du planning et de la prochaine liste de courses.</p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" onClick={() => setPendingRemoval(null)} className="flex-1 border-soft-sand">Annuler</Button>
              <Button onClick={confirmRemoval} className="flex-1 bg-mauve-taupe text-white hover:bg-deep-plum">Retirer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MealSlotPicker({
  slot,
  meal,
  recipes,
  onChange,
  onClear,
}: {
  slot: (typeof mealSlots)[number]
  meal?: Recipe
  recipes: Recipe[]
  onChange: (recipeId: string) => void
  onClear: () => void
}) {
  const options = meal && !recipes.some(recipe => recipe.id === meal.id) ? [meal, ...recipes] : recipes
  return (
    <section className="rounded-2xl bg-card p-4 broco-chou-shadow">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-charcoal-soft">{slot.label}</h3>
          <p className="text-xs text-warm-gray">{slot.description}</p>
        </div>
        {meal ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-warm-gray hover:bg-lavender/30"
            aria-label={`Retirer ${recipeTitle(meal)} du ${slot.label.toLowerCase()}`}
          >
            <X className="h-3.5 w-3.5" /> Retirer
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-mauve-taupe"><Plus className="h-3.5 w-3.5" /> À choisir</span>
        )}
      </div>
      <label className="sr-only" htmlFor={`meal-${slot.id}`}>{slot.label}</label>
      <select
        id={`meal-${slot.id}`}
        value={meal?.id ?? ""}
        onChange={event => onChange(event.target.value)}
        className="min-h-11 w-full rounded-xl border border-soft-sand bg-warm-ivory px-3 text-sm text-charcoal-soft outline-none focus:border-dusty-violet focus:ring-2 focus:ring-dusty-violet/30"
      >
        <option value="">Aucune recette prévue</option>
        {options.map(recipe => (
          <option key={recipe.id} value={recipe.id}>{recipeTitle(recipe)}</option>
        ))}
      </select>
      {meal && <p className="mt-2 truncate text-xs text-mauve-taupe">Prévu : {recipeTitle(meal)}</p>}
    </section>
  )
}
