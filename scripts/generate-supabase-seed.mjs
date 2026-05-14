import fs from "node:fs"
import path from "node:path"
import vm from "node:vm"

const root = process.cwd()
const sourcePath = path.join(root, "lib", "mock-recipes.ts")
const seedPath = path.join(root, "supabase", "seed.sql")

const source = fs.readFileSync(sourcePath, "utf8")
const marker = "export const mockRecipes"
const start = source.indexOf(marker)

if (start === -1) {
  throw new Error("mockRecipes export not found")
}

const equals = source.indexOf("=", start)
const arrayStart = source.indexOf("[", equals)
let depth = 0
let arrayEnd = -1

for (let i = arrayStart; i < source.length; i += 1) {
  const char = source[i]
  if (char === "[") depth += 1
  if (char === "]") depth -= 1
  if (depth === 0) {
    arrayEnd = i + 1
    break
  }
}

if (arrayStart === -1 || arrayEnd === -1) {
  throw new Error("Could not extract mockRecipes array")
}

const arraySource = source.slice(arrayStart, arrayEnd)
const recipes = vm.runInNewContext(`(${arraySource})`, {}, { timeout: 5000 })

function sqlString(value) {
  if (value === undefined || value === null || value === "") return "null"
  return `'${String(value).replaceAll("'", "''")}'`
}

function sqlJson(value) {
  return `'${JSON.stringify(value ?? []).replaceAll("'", "''")}'::jsonb`
}

function sqlTextArray(value) {
  const items = Array.isArray(value) ? value : []
  if (items.length === 0) return "'{}'::text[]"
  return `array[${items.map(item => sqlString(item)).join(", ")}]::text[]`
}

function sqlNumber(value) {
  return Number.isFinite(value) ? String(value) : "null"
}

function sqlBoolean(value) {
  return value ? "true" : "false"
}

function normalizeSeason(value) {
  return value === "Ã©tÃ©" ? "été" : value
}

function normalizeCategory(value) {
  return value === "sucrÃ©" ? "sucré" : value === "salÃ©" ? "salé" : value
}

const columns = [
  "id",
  "nom",
  "description",
  "saison",
  "mois",
  "mois_numero",
  "semaine",
  "jour",
  "tag",
  "categorie",
  "theme_special",
  "portions",
  "estimated_time",
  "difficulty",
  "image_url",
  "ingredients",
  "instructions",
  "astuce",
  "cuisson_micro_ondes",
  "sans_four",
  "source",
  "source_pdf",
  "source_page",
  "dietary_tags",
  "main_ingredients",
  "equipment",
  "canonical_ingredients_status",
]

const rows = recipes.map(recipe => `(
  ${sqlString(recipe.id)},
  ${sqlString(recipe.nom)},
  ${sqlString(recipe.description)},
  ${sqlString(normalizeSeason(recipe.saison))},
  ${sqlString(recipe.mois)},
  ${sqlNumber(recipe.mois_numero)},
  ${sqlNumber(recipe.semaine)},
  ${sqlString(recipe.jour)},
  ${sqlString(recipe.tag)},
  ${sqlString(normalizeCategory(recipe.categorie))},
  ${sqlString(recipe.theme_special)},
  ${sqlString(recipe.portions)},
  ${sqlNumber(recipe.estimatedTime)},
  ${sqlString(recipe.difficulty)},
  ${sqlString(recipe.imageUrl)},
  ${sqlJson(recipe.ingredients)},
  ${sqlJson(recipe.instructions)},
  ${sqlString(recipe.astuce)},
  ${sqlBoolean(recipe.cuisson_micro_ondes)},
  ${sqlBoolean(recipe.sans_four)},
  ${sqlString(recipe.source)},
  ${sqlString(recipe.source_pdf)},
  ${sqlNumber(recipe.source_page)},
  ${sqlTextArray(recipe.dietary_tags)},
  ${sqlTextArray(recipe.main_ingredients)},
  ${sqlTextArray(recipe.equipment)},
  ${sqlString(recipe.canonical_ingredients_status)}
)`)

const catalog = new Map()
for (const recipe of recipes) {
  for (const ingredient of recipe.ingredients ?? []) {
    const name = ingredient.name?.trim()
    if (!name) continue
    const key = name.toLowerCase()
    if (!catalog.has(key)) {
      catalog.set(key, {
        name,
        category: ingredient.category || "Épicerie, condiments et produits sucrés",
      })
    }
  }
}

const catalogRows = [...catalog.values()].map(ingredient => `(
  ${sqlString(ingredient.name)},
  ${sqlString(ingredient.category)},
  '{}'::text[]
)`)

const sql = `-- Generated from lib/mock-recipes.ts. Run: node scripts/generate-supabase-seed.mjs
begin;

insert into public.recipes (${columns.join(", ")})
values
${rows.join(",\n")}
on conflict (id) do update set
  nom = excluded.nom,
  description = excluded.description,
  saison = excluded.saison,
  mois = excluded.mois,
  mois_numero = excluded.mois_numero,
  semaine = excluded.semaine,
  jour = excluded.jour,
  tag = excluded.tag,
  categorie = excluded.categorie,
  theme_special = excluded.theme_special,
  portions = excluded.portions,
  estimated_time = excluded.estimated_time,
  difficulty = excluded.difficulty,
  image_url = excluded.image_url,
  ingredients = excluded.ingredients,
  instructions = excluded.instructions,
  astuce = excluded.astuce,
  cuisson_micro_ondes = excluded.cuisson_micro_ondes,
  sans_four = excluded.sans_four,
  source = excluded.source,
  source_pdf = excluded.source_pdf,
  source_page = excluded.source_page,
  dietary_tags = excluded.dietary_tags,
  main_ingredients = excluded.main_ingredients,
  equipment = excluded.equipment,
  canonical_ingredients_status = excluded.canonical_ingredients_status;

insert into public.ingredients_catalog (name, category, aliases)
values
${catalogRows.join(",\n")}
on conflict (name) do update set
  category = excluded.category,
  aliases = excluded.aliases;

commit;
`

fs.writeFileSync(seedPath, sql, "utf8")
console.log(`Generated ${seedPath} with ${recipes.length} recipes and ${catalog.size} ingredients.`)
