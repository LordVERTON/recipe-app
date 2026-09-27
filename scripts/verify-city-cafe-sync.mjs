import { readFileSync } from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

const root = process.cwd()
const dir = path.join(root, "supabase", "new-import")
const manifest = JSON.parse(readFileSync(path.join(dir, "city-cafe-manifest.json"), "utf8"))
const attribution = JSON.parse(readFileSync(path.join(dir, "city-cafe-pexels-attribution.json"), "utf8"))
const recipes = Array.from({ length: 10 }, (_, index) => JSON.parse(readFileSync(path.join(dir, `city-cafe-recipes-batch-${String(index + 1).padStart(2, "0")}.json`), "utf8"))).flat()
const ids = recipes.map(recipe => recipe.id)
const fields = ["id","nom","description","saison","mois","mois_numero","tag","categorie","portions","estimated_time","difficulty","image_url","ingredients","instructions","astuce","dietary_tags","main_ingredients","equipment","canonical_ingredients_status","source"]
const sqlIds = ids.map(id => `'${id.replaceAll("'", "''")}'`).join(",")
const localSql = `select coalesce(json_agg(row_to_json(r) order by r.id), '[]'::json)::text from (select ${fields.join(",")} from public.recipes where id in (${sqlIds})) r;`
const local = spawnSync("docker", ["exec","supabase_db_recipe-app","psql","-U","postgres","-d","postgres","-Atc",localSql], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 })
if (local.status !== 0) throw new Error(`Local read failed: ${local.stderr.trim()}`)
const localRows = JSON.parse(local.stdout.trim())
const localIngredientRead = spawnSync("docker", ["exec","supabase_db_recipe-app","psql","-U","postgres","-d","postgres","-Atc","select coalesce(json_agg(row_to_json(i) order by name), '[]'::json)::text from (select name, category from public.ingredients) i;"], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 })
if (localIngredientRead.status !== 0) throw new Error(`Local ingredients read failed: ${localIngredientRead.stderr.trim()}`)
const localIngredientRows = JSON.parse(localIngredientRead.stdout.trim())

const envFile = readFileSync(path.join(root, ".env.local"), "utf8")
const env = new Map(envFile.split(/\r?\n/).map(line => {
  const index = line.indexOf("=")
  return index < 0 ? ["", ""] : [line.slice(0,index).trim(), line.slice(index+1).trim().replace(/^['"]|['"]$/g, "")]
}))
const baseUrl = env.get("NEXT_PUBLIC_SUPABASE_URL")
const apiKey = env.get("SUPABASE_PROD_SERVICE_ROLE_KEY")
if (!baseUrl || !apiKey) throw new Error("Production verification credentials are not configured")
const headers = { apikey: apiKey, authorization: `Bearer ${apiKey}` }
const select = fields.join(",")
const productionUrl = new URL(`${baseUrl}/rest/v1/recipes`)
productionUrl.searchParams.set("select", select)
productionUrl.searchParams.set("id", `in.(${ids.join(",")})`)
productionUrl.searchParams.set("limit", "1000")
const response = await fetch(productionUrl, { headers })
if (!response.ok) throw new Error(`Production recipes read failed with HTTP ${response.status}`)
const productionRows = await response.json()

const canonicalNames = [...new Set(recipes.flatMap(recipe => recipe.ingredients.filter(item => item.canonical).map(item => item.name)))].sort()
const ingredientUrl = new URL(`${baseUrl}/rest/v1/ingredients`)
ingredientUrl.searchParams.set("select", "name")
ingredientUrl.searchParams.set("name", `in.(${canonicalNames.map(name => `"${name.replaceAll('"', '\\"')}"`).join(",")})`)
ingredientUrl.searchParams.set("limit", "2000")
const ingredientResponse = await fetch(ingredientUrl, { headers })
if (!ingredientResponse.ok) throw new Error(`Production ingredients read failed with HTTP ${ingredientResponse.status}`)
const productionIngredients = new Set((await ingredientResponse.json()).map(item => item.name))
const missingIngredients = canonicalNames.filter(name => !productionIngredients.has(name))
const allProdIngredientsUrl = new URL(`${baseUrl}/rest/v1/ingredients`)
allProdIngredientsUrl.searchParams.set("select", "name,category")
allProdIngredientsUrl.searchParams.set("limit", "2000")
const allProdIngredientsResponse = await fetch(allProdIngredientsUrl, { headers })
if (!allProdIngredientsResponse.ok) throw new Error(`Production ingredient catalog read failed with HTTP ${allProdIngredientsResponse.status}`)
const allProdIngredientRows = await allProdIngredientsResponse.json()
const localCategories = new Map(localIngredientRows.map(item => [item.name, item.category]))
const prodCategories = new Map(allProdIngredientRows.map(item => [item.name, item.category]))
const ingredientCategoryDiffs = [...localCategories.keys()].filter(name => prodCategories.has(name) && localCategories.get(name) !== prodCategories.get(name)).map(name => `${name}[${localCategories.get(name)}=>${prodCategories.get(name)}]`)

function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]))
  return value
}
const localById = new Map(localRows.map(row => [row.id, row]))
const productionById = new Map(productionRows.map(row => [row.id, row]))
const differences = []
for (const id of ids) {
  const left = localById.get(id)
  const right = productionById.get(id)
  if (!left || !right) { differences.push({ id, reason: !left ? "missing-local" : "missing-production" }); continue }
  const differentFields = fields.filter(field => JSON.stringify(stable(left[field])) !== JSON.stringify(stable(right[field])))
  if (differentFields.length) differences.push({ id, reason: "field-mismatch", fields: differentFields })
}
const localIngredientNames = new Set(localIngredientRows.map(item => item.name))
const localMissingCanonical = canonicalNames.filter(name => !localIngredientNames.has(name))
const localImageCount = localRows.filter(row => row.image_url).length
const prodImageCount = productionRows.filter(row => row.image_url).length
const duplicatePhotoIds = new Set(attribution.map(row => row.photo_id)).size !== attribution.length
const statusOk = manifest.processed_source_count === 158 && manifest.generated_recipes.length === 157 && manifest.batches.every(batch => batch.status === "synchronized-local-production")

console.log(`LOCAL_RECIPES=${localRows.length}`)
console.log(`PRODUCTION_RECIPES=${productionRows.length}`)
console.log(`LOCAL_PRODUCTION_FIELD_DIFFERENCES=${differences.length}`)
console.log(`PRODUCTION_MISSING_CANONICAL_INGREDIENTS=${missingIngredients.length}`)
console.log(`LOCAL_MISSING_CANONICAL_INGREDIENTS=${localMissingCanonical.length}`)
console.log(`INGREDIENT_CATEGORY_CATALOG_DIFFERENCES=${ingredientCategoryDiffs.length}`)
console.log(`LOCAL_CANONICAL_REFERENCE_ERRORS=${localMissingCanonical.length}`)
console.log(`PEXELS_ATTRIBUTIONS=${attribution.length}`)
console.log(`PEXELS_PHOTO_IDS_UNIQUE=${!duplicatePhotoIds}`)
console.log(`IMAGES_WITH_URL_LOCAL=${localImageCount}`)
console.log(`IMAGES_WITH_URL_PRODUCTION=${prodImageCount}`)
console.log(`ALL_BATCHES_SYNCHRONIZED=${statusOk}`)
if (differences.length) console.log(`DIFFERENCES=${differences.map(item => `${item.id}:${item.fields?.join("+") ?? item.reason}`).join(";")}`)
for (const diff of differences.filter(item => item.fields?.includes("ingredients"))) {
  const left = localById.get(diff.id)
  const right = productionById.get(diff.id)
  const leftItems = new Map(left.ingredients.map(item => [item.name, item.category ?? "(sans catégorie)"]))
  const rightItems = new Map(right.ingredients.map(item => [item.name, item.category ?? "(sans catégorie)"]))
  const names = [...new Set([...leftItems.keys(), ...rightItems.keys()])]
  const categoryDiffs = names.filter(name => leftItems.get(name) !== rightItems.get(name)).map(name => `${name}[${leftItems.get(name)}=>${rightItems.get(name)}]`)
  if (categoryDiffs.length) console.log(`INGREDIENT_CATEGORY_DIFFS=${diff.id}:${categoryDiffs.join(";")}`)
}
if (missingIngredients.length) console.log(`MISSING_INGREDIENT_NAMES=${missingIngredients.join(",")}`)
if (ingredientCategoryDiffs.length) console.log(`INGREDIENT_CATEGORY_CATALOG_DIFFS=${ingredientCategoryDiffs.slice(0,60).join(";")}`)
if (localRows.length !== 157 || productionRows.length !== 157 || differences.length || missingIngredients.length || localMissingCanonical.length || ingredientCategoryDiffs.length || duplicatePhotoIds || !statusOk) process.exitCode = 1
