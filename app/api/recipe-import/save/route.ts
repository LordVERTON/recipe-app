import { NextResponse } from "next/server"

type ImportedRecipe = {
  title: string
  description?: string
  sourceUrl: string
  imageUrl: string
  ingredients: Array<{ name: string; quantity?: string }>
  instructions: string[]
}

function recipeId(title: string) {
  const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  return `instagram-${slug || "recipe"}-${crypto.randomUUID().slice(0, 8)}`
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "L'import est réservé au développement." }, { status: 403 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: "Ajoutez SUPABASE_SERVICE_ROLE_KEY à .env.local pour enregistrer les recettes." }, { status: 500 })
  }

  const recipe = await request.json() as ImportedRecipe
  if (!recipe.title?.trim() || !recipe.sourceUrl?.startsWith("https://www.instagram.com/") || !recipe.imageUrl || recipe.ingredients.length === 0) {
    return NextResponse.json({ error: "Titre, URL Instagram, image et ingrédients sont requis." }, { status: 400 })
  }

  const month = new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(new Date())
  const monthNumber = new Date().getMonth() + 1
  const seasons = ["hiver", "printemps", "été", "automne"] as const
  const season = seasons[Math.floor(((monthNumber % 12) / 3))]
  const payload = {
    id: recipeId(recipe.title),
    nom: recipe.title.trim(),
    description: recipe.description?.trim() || null,
    saison: season,
    mois: month,
    mois_numero: monthNumber,
    tag: "dejeuner/diner",
    categorie: "salé",
    portions: "À préciser",
    difficulty: "facile",
    image_url: recipe.imageUrl,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions.filter(Boolean),
    source: "instagram",
    source_pdf: recipe.sourceUrl,
    canonical_ingredients_status: "partial",
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/recipes`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) return NextResponse.json({ error: "L'enregistrement Supabase a échoué." }, { status: response.status })
  const [savedRecipe] = await response.json()
  return NextResponse.json({ recipe: savedRecipe })
}
