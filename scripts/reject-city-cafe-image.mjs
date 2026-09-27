import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const id = process.argv[2]
if (!id) throw new Error("Pass the recipe ID whose image is unsuitable")
const directory = path.join(process.cwd(), "supabase", "new-import")
let found = false
for (let batch = 1; batch <= 10; batch++) {
  const file = path.join(directory, `city-cafe-recipes-batch-${String(batch).padStart(2, "0")}.json`)
  let recipes
  try { recipes = JSON.parse(readFileSync(file, "utf8")) } catch { continue }
  const recipe = recipes.find(item => item.id === id)
  if (!recipe) continue
  recipe.image_url = null
  for (const key of ["pexels_photo_id", "pexels_alt", "pexels_photographer", "pexels_photographer_url", "pexels_url"]) delete recipe[key]
  writeFileSync(file, `${JSON.stringify(recipes, null, 2)}\n`, "utf8")
  found = true
  console.log(`Set image_url to NULL for ${id}`)
  break
}
if (!found) throw new Error(`Recipe not found: ${id}`)
