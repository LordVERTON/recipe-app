import type { Recipe } from "./types"

const PEXELS_IMAGE_BASE = "/assets/recipe_images/pexels"
const FALLBACK_IMAGE = "/placeholder.jpg"
const IMAGE_PATH_ALIASES: Record<string, string> = {
  "/assets/recipe_images/pexels/chakchouka-d-hiver.jpg": "/assets/recipe_images/pexels/chakchouka-dhiver.jpg",
}

function resolveLocalImagePath(imageUrl: string): string {
  const alias = IMAGE_PATH_ALIASES[imageUrl]
  if (alias) return alias

  // The initial seed used hyphenated French elisions (d-hiver, l-avocat),
  // while the checked-in JPEG filenames omit that separator (dhiver, lavocat).
  // Normalize them here so both existing and future local databases work.
  if (imageUrl.startsWith(PEXELS_IMAGE_BASE)) {
    if (imageUrl.endsWith("/linguines-a-l-artichaut.jpg") || imageUrl.endsWith("/tartinade-d-artichaut.jpg")) {
      return imageUrl
    }
    return imageUrl.replaceAll("-d-", "-d").replaceAll("-l-", "-l")
  }

  return imageUrl
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
    return resolveLocalImagePath(recipe.imageUrl)
  }

  return `${PEXELS_IMAGE_BASE}/${slugifyRecipeName(recipe.nom)}.jpg`
}

export function getFallbackRecipeImageUrl(): string {
  return FALLBACK_IMAGE
}
