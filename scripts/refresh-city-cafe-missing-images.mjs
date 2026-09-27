import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const envText = existsSync(path.join(root, ".env.local")) ? readFileSync(path.join(root, ".env.local"), "utf8") : ""
const apiKey = process.env.PEXELS_API_KEY ?? envText.match(/^PEXELS_API_KEY=(.*)$/m)?.[1]?.trim()
if (!apiKey) throw new Error("PEXELS_API_KEY is not configured")
const dir = path.join(root, "supabase", "new-import")
const file = path.join(dir, "city-cafe-recipes-batch-09.json")
const recipes = JSON.parse(readFileSync(file, "utf8"))
const selections = new Map([
  ["city-cafe-fletan-en-papillote-d-ete", { id: 37367757, query: "baked halibut fish foil lemon herbs" }],
  ["city-cafe-filets-de-perche-au-beurre-citron-basilic-et-pommes-frites", { id: 32651690, query: "perch fillet fish fries lemon" }],
  ["city-cafe-bar-roti-aux-herbes-de-provence-et-aioli", { id: 37534677, query: "roasted sea bass herbs aioli" }],
])

for (const recipe of recipes.filter(item => selections.has(item.id))) {
  const selection = selections.get(recipe.id)
  const response = await fetch(`https://api.pexels.com/v1/photos/${selection.id}`, { headers: { Authorization: apiKey } })
  if (!response.ok) throw new Error(`Pexels photo lookup failed for ${recipe.id}: HTTP ${response.status}`)
  const photo = await response.json()
  const sourceUrl = photo.src.large
  const imageUrl = `https://images.pexels.com/photos/${photo.id}/pexels-photo-${photo.id}.jpeg?auto=compress&cs=tinysrgb&h=650&w=940`
  const check = await fetch(imageUrl, { method: "HEAD" })
  if (!check.ok) throw new Error(`Pexels image unavailable for ${recipe.id}: HTTP ${check.status}`)
  Object.assign(recipe, {
    pexels_query: selection.query,
    pexels_photo_id: photo.id,
    pexels_alt: photo.alt ?? "",
    pexels_photographer: photo.photographer,
    pexels_photographer_url: photo.photographer_url,
    pexels_url: photo.url,
    pexels_source_url: sourceUrl,
    image_url: imageUrl,
  })
  console.log(`${recipe.id}\t${photo.id}\tHTTP ${check.status}\t${photo.alt ?? ""}`)
}
writeFileSync(file, `${JSON.stringify(recipes, null, 2)}\n`, "utf8")

const attributionFile = path.join(dir, "city-cafe-pexels-attribution.json")
const attribution = JSON.parse(readFileSync(attributionFile, "utf8"))
const refreshed = recipes.filter(item => selections.has(item.id)).map(recipe => ({
  recipe_id: recipe.id,
  photo_id: recipe.pexels_photo_id,
  query: recipe.pexels_query,
  alt: recipe.pexels_alt,
  photographer: recipe.pexels_photographer,
  photographer_url: recipe.pexels_photographer_url,
  pexels_url: recipe.pexels_url,
  image_url: recipe.image_url,
  batch: 9,
}))
const refreshedIds = new Set(refreshed.map(row => row.recipe_id))
const all = [...attribution.filter(row => !refreshedIds.has(row.recipe_id)), ...refreshed]
const photoIds = all.map(row => row.photo_id)
if (new Set(photoIds).size !== photoIds.length) throw new Error("Duplicate Pexels photo IDs detected")
writeFileSync(attributionFile, `${JSON.stringify(all, null, 2)}\n`, "utf8")

const manifestFile = path.join(dir, "city-cafe-manifest.json")
const manifest = JSON.parse(readFileSync(manifestFile, "utf8"))
for (const recipe of manifest.generated_recipes) {
  const fresh = recipes.find(item => item.id === recipe.id && selections.has(item.id))
  if (!fresh) continue
  Object.assign(recipe, {
    pexels_query: fresh.pexels_query,
    pexels_photo_id: fresh.pexels_photo_id,
    pexels_url: fresh.pexels_url,
    image_url: fresh.image_url,
  })
}
writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8")
