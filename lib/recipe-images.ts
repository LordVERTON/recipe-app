import type { Recipe } from "./types"

const PEXELS_IMAGE_BASE = "/assets/recipe_images/pexels"
const FALLBACK_IMAGE = "/placeholder.jpg"
const IMAGE_PATH_ALIASES: Record<string, string> = {
  "/assets/recipe_images/pexels/chakchouka-d-hiver.jpg": "/assets/recipe_images/pexels/chakchouka-dhiver.jpg",
}

const mojibakeMap: Record<string, string> = {
  "Ã©": "e",
  "Ã¨": "e",
  "Ãª": "e",
  "Ã«": "e",
  "Ã ": "a",
  "Ã¢": "a",
  "Ã¹": "u",
  "Ã»": "u",
  "Ã®": "i",
  "Ã¯": "i",
  "Ã´": "o",
  "Ã¶": "o",
  "Ã§": "c",
  "Å“": "oe",
  "Ã‰": "e",
  "Ã€": "a",
  "Ã‡": "c",
  "Â½": "demi",
}

export function recipeTitle(recipe: Recipe): string {
  return recipe.nom.charAt(0).toUpperCase() + recipe.nom.slice(1)
}

export function slugifyRecipeName(name: string): string {
  const repaired = Object.entries(mojibakeMap).reduce(
    (value, [bad, good]) => value.replaceAll(bad, good),
    name,
  )

  return repaired
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getRecipeImageUrl(recipe: Recipe): string {
  if (recipe.imageUrl && !recipe.imageUrl.includes("placeholder")) {
    return IMAGE_PATH_ALIASES[recipe.imageUrl] || recipe.imageUrl
  }

  return `${PEXELS_IMAGE_BASE}/${slugifyRecipeName(recipe.nom)}.jpg`
}

export function getFallbackRecipeImageUrl(): string {
  return FALLBACK_IMAGE
}
