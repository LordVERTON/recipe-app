import type { Ingredient, Recipe, Season } from "./types"
import { supabase } from './supabase-client'

type SupabaseRecipeRow = Record<string, unknown>

const recipeTable = process.env.NEXT_PUBLIC_SUPABASE_RECIPES_TABLE || "recipes"

const seasonMap: Record<string, Season> = {
  hiver: "hiver",
  printemps: "printemps",
  "été": "été",
  "ete": "été",
  "Ã©tÃ©": "été",
  automne: "automne",
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "string") return ["true", "1", "oui", "yes"].includes(value.toLowerCase())
  return false
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item)).filter(Boolean)
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.map(item => String(item)).filter(Boolean)
    } catch {
      return value.split(/\n|;/).map(item => item.trim()).filter(Boolean)
    }
  }

  return []
}

function asIngredients(value: unknown): Ingredient[] {
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === "object" && item !== null) {
        const row = item as Record<string, unknown>
        return {
          name: asString(row.name ?? row.nom ?? row.ingredient, "Ingrédient"),
          quantity: asString(row.quantity ?? row.quantite ?? row.quantité),
          unit: asString(row.unit ?? row.unite ?? row.unité),
          category: asString(row.category ?? row.categorie ?? row.catégorie),
          canonical: row.canonical === undefined ? true : asBoolean(row.canonical),
        }
      }

      return { name: String(item), canonical: true }
    })
  }

  if (typeof value === "string") {
    try {
      return asIngredients(JSON.parse(value))
    } catch {
      return value
        .split(/\n|;/)
        .map(item => item.trim())
        .filter(Boolean)
        .map(name => ({ name, canonical: true }))
    }
  }

  return []
}

function normalizeSeason(value: unknown): Season {
  const season = asString(value, "hiver").toLowerCase()
  return seasonMap[season] || "hiver"
}

function normalizeCategory(value: unknown): Recipe["categorie"] {
  const category = asString(value, "salé").toLowerCase()
  return category.includes("sucr") ? "sucré" : "salé"
}

export function mapRecipeRow(row: SupabaseRecipeRow, index = 0): Recipe {
  const nom = asString(row.nom ?? row.name ?? row.title, `Recette ${index + 1}`)
  const ingredients = asIngredients(row.ingredients ?? row.ingredient_list ?? row.liste_ingredients)

  return {
    createdBy: asString(row.created_by) || undefined,
    moderationStatus: asString(row.moderation_status, 'approved') as Recipe['moderationStatus'],
    moderationNote: asString(row.moderation_note),
    imagePath: asString(row.image_path) || undefined,
    id: asString(row.id ?? row.recipe_id ?? row.slug, `supabase-${index}`),
    nom,
    description: asString(row.description),
    saison: normalizeSeason(row.saison ?? row.season),
    mois: asString(row.mois ?? row.month, ""),
    mois_numero: asNumber(row.mois_numero ?? row.month_number, 1),
    semaine: asNumber(row.semaine ?? row.week, 1),
    jour: asString(row.jour ?? row.day, ""),
    tag: asString(row.tag ?? row.meal_type, "dÃ©jeuner/dÃ®ner"),
    categorie: normalizeCategory(row.categorie ?? row.category),
    theme_special: asString(row.theme_special),
    portions: asString(row.portions ?? row.servings, "1 personne"),
    estimatedTime: asNumber(row.estimatedTime ?? row.estimated_time ?? row.temps_estime, 25),
    difficulty: asString(row.difficulty ?? row.difficulte ?? row.difficulté, "facile") as Recipe["difficulty"],
    imageUrl: asString(row.imageUrl ?? row.image_url ?? row.image),
    ingredients,
    instructions: asStringArray(row.instructions ?? row.preparation ?? row.etapes),
    astuce: asString(row.astuce ?? row.tip),
    cuisson_micro_ondes: asBoolean(row.cuisson_micro_ondes ?? row.micro_ondes),
    sans_four: asBoolean(row.sans_four ?? row.no_oven),
    source: ["broco-chou", "instagram", "community"].includes(asString(row.source, "crous"))
      ? asString(row.source, "crous") as Recipe["source"]
      : "crous",
    source_pdf: asString(row.source_pdf),
    source_page: row.source_page === undefined ? undefined : asNumber(row.source_page, 0),
    dietary_tags: asStringArray(row.dietary_tags ?? row.tags_alimentaires),
    main_ingredients: asStringArray(row.main_ingredients ?? row.ingredients_principaux),
    equipment: asStringArray(row.equipment ?? row.equipement),
    canonical_ingredients_status: asString(row.canonical_ingredients_status, "verified") as Recipe["canonical_ingredients_status"],
  }
}

export async function fetchSupabaseRecipes(): Promise<Recipe[]> {
  if (!supabase) return []
  const recipes: Recipe[] = []
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from(recipeTable).select('*').order('id').range(offset, offset + 499)
    if (error) throw error
    recipes.push(...data.map(mapRecipeRow))
    if (data.length < 500) break
  }
  const paths = recipes.flatMap(recipe => recipe.imagePath ? [recipe.imagePath] : [])
  if (paths.length) {
    const { data } = await supabase.storage.from('recipe-photos').createSignedUrls(paths, 7200)
    const urls = new Map(data?.map(item => [item.path, item.signedUrl]))
    recipes.forEach(recipe => { if (recipe.imagePath) recipe.imageUrl = urls.get(recipe.imagePath) ?? undefined })
  }
  return recipes.filter(recipe => recipe.ingredients.length > 0)
}
