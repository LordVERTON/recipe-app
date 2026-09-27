import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const directory = path.join(process.cwd(), "supabase", "new-import")
const recipes = Array.from({ length: 10 }, (_, index) => JSON.parse(readFileSync(path.join(directory, `city-cafe-recipes-batch-${String(index + 1).padStart(2, "0")}.json`), "utf8"))).flat()
const ids = recipes.map(recipe => `'${recipe.id.replaceAll("'", "''")}'`).join(", ")
const sql = `-- Align shared canonical categories and JSON ingredient labels across local and production.
BEGIN;

UPDATE public.ingredients
SET category = 'Féculents, pains et céréales'
WHERE name = 'Pâte à pizza';

UPDATE public.ingredients
SET category = 'Épices et herbes aromatiques'
WHERE name = 'Poivre';

UPDATE public.recipes AS recipe
SET ingredients = (
  SELECT jsonb_agg(jsonb_set(item.ingredient, '{category}', to_jsonb(canonical.category), true) ORDER BY item.ordinality)
  FROM jsonb_array_elements(recipe.ingredients) WITH ORDINALITY AS item(ingredient, ordinality)
  JOIN public.ingredients AS canonical ON canonical.name = item.ingredient->>'name'
)
WHERE recipe.id IN (${ids});

COMMIT;
`
const file = path.join(directory, "city-cafe-canonical-category-repair.sql")
writeFileSync(file, sql, "utf8")
console.log(`Generated a targeted canonical-category repair for ${recipes.length} City Café recipes.`)
