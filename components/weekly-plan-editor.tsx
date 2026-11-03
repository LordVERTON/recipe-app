"use client"

import { useMemo, useRef, useState } from "react"
import { AlertTriangle, Check, ChevronLeft, ChevronRight, PencilLine, Plus, RotateCcw, Search, X } from "lucide-react"
import { useBrocoChouStore } from "@/lib/store"
import type { MealSlot, PlannedMeal, Recipe, Season } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { recipeTitle } from "@/lib/recipe-images"
import { normalizeRecipeSearch } from "@/lib/recipe-search"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"

interface WeeklyPlanEditorProps {
  onDone: () => void
  initialQuery?: string
  onViewRecipe: (recipe: Recipe) => void
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

export function WeeklyPlanEditor({ onDone, initialQuery = '', onViewRecipe }: WeeklyPlanEditorProps) {
  const { weeklyPlan, recipeCatalog, preferences, setMealInPlan, removeMealFromPlan } = useBrocoChouStore()
  const [selectedDay, setSelectedDay] = useState(0)
  const [query, setQuery] = useState(initialQuery)
  const [visibleCount, setVisibleCount] = useState(20)
  const searchInput = useRef<HTMLInputElement>(null)
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>(preferences.mealSlots[0] ?? 'dejeuner')
  const [pendingReplacement, setPendingReplacement] = useState<{ recipe: Recipe; meal: PlannedMeal; date: Date; slot: MealSlot } | null>(null)
  const [feedback, setFeedback] = useState('')
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
    const words = normalizeRecipeSearch(query).split(' ').filter(Boolean)
    return recipes.filter(recipe => {
      const title = normalizeRecipeSearch(recipeTitle(recipe))
      const matchesQuery = words.every(word => title.includes(word))
      const matchesSeason = season === "all" || recipe.saison === season
      const matchesTime = maxTime === "all" || (recipe.estimatedTime ?? Number.POSITIVE_INFINITY) <= maxTime
      const tags = recipe.dietary_tags?.map(tag => tag.toLocaleLowerCase("fr-FR")) ?? []
      const matchesDiet = diet === "all" || (diet === "vegetarien" ? tags.includes("végétarien") : tags.includes("poisson"))
      const matchesEquipment = equipment === "all" || recipe.equipment?.some(item => item === equipment)
      return matchesQuery && matchesSeason && matchesTime && matchesDiet && matchesEquipment
    }).sort((a, b) => recipeTitle(a).localeCompare(recipeTitle(b), 'fr'))
  }, [diet, equipment, maxTime, query, recipes, season])

  const equipmentOptions = useMemo(() => Array.from(new Set(recipes.flatMap(recipe => recipe.equipment ?? []))).sort(), [recipes])

  if (!weeklyPlan || days.length === 0) return null

  const activeDate = days[selectedDay]
  const activeMeals = weeklyPlan.meals.filter(meal => sameCalendarDay(meal.dayDate, activeDate))
  const plannedCount = weeklyPlan.meals.filter(meal => meal.status !== "saute").length

  const getMeal = (slot: MealSlot) => activeMeals.find(meal => meal.mealSlot === slot)
  const visibleMealSlots = mealSlots.filter(slot => preferences.mealSlots.includes(slot.id))
  const slotsToDisplay = visibleMealSlots.length > 0 ? visibleMealSlots : mealSlots

  const activeSlot = slotsToDisplay.find(slot => slot.id === selectedSlot) ?? slotsToDisplay[0]
  const addRecipe = (recipe: Recipe) => {
    const meal = getMeal(activeSlot.id)
    if (weeklyPlan.meals.some(planned => planned.recipeId === recipe.id)) return
    if (meal) {
      setPendingReplacement({ recipe, meal, date: activeDate, slot: activeSlot.id })
      return
    }
    setMealInPlan(activeDate, activeSlot.id, recipe)
    setFeedback(`${recipeTitle(recipe)} ajouté au ${activeSlot.label.toLowerCase()} du ${getDayLabel(activeDate)}.`)
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
                selected={slot.id === activeSlot.id}
                onSelect={() => { setSelectedSlot(slot.id); setFeedback(''); searchInput.current?.focus() }}
                onClear={() => requestRemoval(slot.id)}
              />
            )
          })}
        </div>
        <section className="mt-6" aria-labelledby="recipe-results-title">
          <h2 id="recipe-results-title" className="text-lg font-semibold text-charcoal-soft">Choisir un plat</h2>
          <p className="mt-1 text-sm text-warm-gray">Pour le {activeSlot.label.toLowerCase()} du {getDayLabel(activeDate)}. Choisis un autre créneau ci-dessus si besoin.</p>
        <div className="mt-4 rounded-2xl bg-card p-3 broco-chou-shadow">
          <label className="sr-only" htmlFor="recipe-search">Rechercher une recette</label>
          <div className="flex items-center gap-2 rounded-xl border border-soft-sand bg-warm-ivory px-3">
            <Search className="h-4 w-4 text-warm-gray" />
            <input
              ref={searchInput}
              id="recipe-search"
              type="search"
              value={query}
              onChange={event => { setQuery(event.target.value); setVisibleCount(20); setFeedback('') }}
              placeholder="Quel plat veux-tu cuisiner ?"
              className="min-h-10 w-full bg-transparent text-sm text-charcoal-soft outline-none placeholder:text-warm-gray"
            />
          </div>
          <details className="mt-3">
          <summary className="cursor-pointer text-sm font-medium text-mauve-taupe">Filtres{[season, maxTime, diet, equipment].filter(value => value !== 'all').length > 0 ? ' actifs' : ' (facultatifs)'}</summary>
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
          </details>
          {(query || [season, maxTime, diet, equipment].some(value => value !== 'all')) && <button type="button" onClick={() => { setQuery(''); setSeason('all'); setMaxTime('all'); setDiet('all'); setEquipment('all'); searchInput.current?.focus() }} className="mt-2 min-h-11 text-sm text-mauve-taupe">Effacer la recherche et les filtres</button>}
        </div>
          <p role="status" className="my-3 text-sm text-deep-plum">{feedback || `${filteredRecipes.length} recette${filteredRecipes.length > 1 ? 's' : ''} trouvée${filteredRecipes.length > 1 ? 's' : ''}`}</p>
          {filteredRecipes.length === 0 ? <p className="rounded-2xl bg-card p-4 text-sm text-charcoal-soft">Aucune recette trouvée. Essaie un autre nom ou efface les filtres.</p> : (
            <ul className="grid gap-3 md:grid-cols-2">
              {filteredRecipes.slice(0, visibleCount).map(recipe => {
                const planned = weeklyPlan.meals.find(meal => meal.recipeId === recipe.id)
                return <li key={recipe.id} className="min-w-0 rounded-2xl bg-card p-4 broco-chou-shadow">
                  <h3 className="break-words font-semibold text-charcoal-soft">{recipeTitle(recipe)}</h3>
                  <p className="mt-1 text-sm text-warm-gray">{recipe.estimatedTime ? `${recipe.estimatedTime} min · ` : ''}{recipe.portions}{recipe.moderationStatus === 'pending' ? ' · En attente de validation' : recipe.moderationStatus === 'rejected' ? ' · Privée' : ''}</p>
                  {planned && <p className="mt-2 text-sm text-deep-plum">Déjà prévu : {mealSlots.find(slot => slot.id === planned.mealSlot)?.label}, {getDayLabel(new Date(planned.dayDate))}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={() => onViewRecipe(recipe)} aria-label={`Voir la recette ${recipeTitle(recipe)}`}>Voir la recette</Button>
                    <Button type="button" disabled={!!planned} onClick={() => addRecipe(recipe)} aria-label={`Choisir ${recipeTitle(recipe)}`} className="min-h-11 bg-mauve-taupe text-white hover:bg-deep-plum">{planned ? 'Déjà au planning' : getMeal(activeSlot.id) ? 'Remplacer ce repas' : 'Choisir ce plat'}</Button>
                  </div>
                </li>
              })}
            </ul>
          )}
          {filteredRecipes.length > visibleCount && <Button type="button" variant="outline" className="mt-4 min-h-11 w-full" onClick={() => setVisibleCount(count => count + 20)}>Afficher plus de recettes</Button>}
        </section>
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
      <Dialog open={!!pendingReplacement} onOpenChange={open => { if (!open) setPendingReplacement(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remplacer ce repas ?</DialogTitle>
            <DialogDescription>{pendingReplacement && `${recipeTitle(pendingReplacement.meal.recipe)} sera remplacé par ${recipeTitle(pendingReplacement.recipe)} pour le ${mealSlots.find(slot => slot.id === pendingReplacement.slot)?.label.toLowerCase()} du ${getDayLabel(pendingReplacement.date)}.`}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPendingReplacement(null)}>Annuler</Button>
            <Button onClick={() => {
              if (!pendingReplacement) return
              setMealInPlan(pendingReplacement.date, pendingReplacement.slot, pendingReplacement.recipe)
              setFeedback(`${recipeTitle(pendingReplacement.recipe)} ajouté en remplacement.`)
              setPendingReplacement(null)
            }}>Confirmer le remplacement</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MealSlotPicker({
  slot,
  meal,
  selected,
  onSelect,
  onClear,
}: {
  slot: (typeof mealSlots)[number]
  meal?: Recipe
  selected: boolean
  onSelect: () => void
  onClear: () => void
}) {
  return (
    <section className={cn("min-w-0 rounded-2xl border bg-card p-4 broco-chou-shadow", selected ? 'border-mauve-taupe' : 'border-transparent')}>
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
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className="min-h-11 w-full rounded-xl border border-soft-sand bg-warm-ivory px-3 py-2 text-left text-sm text-charcoal-soft focus-visible:ring-2 focus-visible:ring-dusty-violet"
      >
        Choisir pour {slot.label.toLowerCase()}
      </button>
      <p className="mt-2 break-words text-sm text-mauve-taupe">{meal ? `Prévu : ${recipeTitle(meal)}` : 'Aucune recette prévue'}</p>
    </section>
  )
}
