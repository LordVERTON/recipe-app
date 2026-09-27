import { readFileSync } from "node:fs"
import path from "node:path"

const directory = path.join(process.cwd(), "supabase", "new-import")
const readBatch = (number) => JSON.parse(readFileSync(path.join(directory, `city-cafe-recipes-batch-${String(number).padStart(2, "0")}.json`), "utf8"))
const batchNumber = Number.parseInt(process.argv[2] ?? "2", 10)
if (!Number.isInteger(batchNumber) || batchNumber < 2) throw new Error("Provide a batch number of at least 2")
const batches = Array.from({ length: batchNumber }, (_, index) => readBatch(index + 1))
const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
const validSeasons = new Set(["hiver", "printemps", "été", "automne"])
const validDifficulties = new Set(["très facile", "facile", "intermédiaire"])
const errors = []
const ids = new Set()
const photoIds = new Set()

for (const [batchIndex, recipes] of batches.entries()) {
  for (const recipe of recipes) {
    if (ids.has(recipe.id)) errors.push(`duplicate recipe ID: ${recipe.id}`)
    ids.add(recipe.id)
    if (!/^city-cafe-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recipe.id)) errors.push(`invalid ID: ${recipe.id}`)
    if (!/^(2|4) personnes$/.test(recipe.portions)) errors.push(`invalid portions: ${recipe.id}`)
    if (!validSeasons.has(recipe.saison)) errors.push(`invalid season: ${recipe.id}`)
    if (!validDifficulties.has(recipe.difficulty)) errors.push(`invalid difficulty: ${recipe.id}`)
    if (recipe.mois !== monthNames[recipe.mois_numero - 1]) errors.push(`month mismatch: ${recipe.id}`)
    if (!Number.isInteger(recipe.estimated_time) || recipe.estimated_time < 10) errors.push(`invalid time: ${recipe.id}`)
    if (recipe.ingredients.length < 5 || recipe.ingredients.some(ingredient => ingredient.canonical !== true)) errors.push(`ingredient/canonical issue: ${recipe.id}`)
    if (recipe.instructions.length < 4) errors.push(`too few instructions: ${recipe.id}`)
    if (recipe.source !== "broco-chou") errors.push(`invalid source: ${recipe.id}`)
    if (recipe.pexels_photo_id) {
      if (photoIds.has(recipe.pexels_photo_id)) errors.push(`duplicate Pexels photo ID: ${recipe.pexels_photo_id}`)
      photoIds.add(recipe.pexels_photo_id)
      if (!/^https:\/\/images\.pexels\.com\//.test(recipe.image_url) || !recipe.image_url.endsWith("?auto=compress&cs=tinysrgb&h=650&w=940")) errors.push(`invalid Pexels image URL: ${recipe.id}`)
    }
    if (batchIndex === 1 && recipe.dietary_tags.some(tag => tag === "viande")) errors.push(`unsupported dietary tag: ${recipe.id}`)
  }
}

const batchLabel = String(batchNumber).padStart(2, "0")
const sql = readFileSync(path.join(directory, `city-cafe-recipes-${batchLabel}.sql`), "utf8")
if (!sql.startsWith(`-- City Café batch ${batchLabel}`) || !sql.includes("BEGIN;") || !sql.trimEnd().endsWith("COMMIT;")) errors.push(`batch ${batchLabel} SQL is not a complete transaction`)
if (/\b(DROP|TRUNCATE|DELETE)\b/i.test(sql)) errors.push("destructive SQL statement found")
if (!/ON CONFLICT \(id\) DO (?:NOTHING|UPDATE)/.test(sql) || !sql.includes("ON CONFLICT (name) DO NOTHING")) errors.push("idempotent conflict handling missing")

if (errors.length) {
  process.stderr.write(`${errors.join("\n")}\n`)
  process.exitCode = 1
} else {
  console.log(`Validated batch ${batchLabel}: ${batches.at(-1).length} recipes; ${ids.size} unique IDs; ${photoIds.size} unique Pexels IDs across batches 1–${batchNumber}; transactional, non-destructive SQL.`)
}
