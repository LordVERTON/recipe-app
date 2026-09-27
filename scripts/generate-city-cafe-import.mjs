import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const importDirectory = path.join(root, "supabase", "new-import")
const batchNumber = Number.parseInt(process.argv[2] ?? "1", 10)
if (!Number.isInteger(batchNumber) || batchNumber < 1) throw new Error("Batch number must be a positive integer")
const batchLabel = String(batchNumber).padStart(2, "0")
const inputPath = path.join(importDirectory, `city-cafe-recipes-batch-${batchLabel}.json`)
const recipes = JSON.parse(readFileSync(inputPath, "utf8"))
const categoryByIngredient = new Map([
  ["Pâte brisée", "Féculents, pains et céréales"],
  ["Pepperoni", "Viandes, poissons et protéines"],
  ["Reblochon", "Crèmerie et produits laitiers"],
  ["Sauge", "Épices et herbes aromatiques"],
  ["Saumon fumé", "Viandes, poissons et protéines"],
  ["Thon", "Viandes, poissons et protéines"],
  ["Œufs", "Crèmerie et produits laitiers"],
  ["Crème", "Crèmerie et produits laitiers"],
  ["Lait", "Crèmerie et produits laitiers"],
  ["Ciboulette", "Épices et herbes aromatiques"],
  ["Moutarde", "Épicerie, condiments et produits sucrés"],
  ["Poivre", "Épices et herbes aromatiques"],
  ["Fromage frais", "Crèmerie et produits laitiers"],
  ["Curry", "Épices et herbes aromatiques"],
  ["Citrons", "Fruits, légumes et légumineuses"],
  ["Céleri", "Fruits, légumes et légumineuses"], ["Potiron", "Fruits, légumes et légumineuses"],
  ["Potimarron", "Fruits, légumes et légumineuses"], ["Roquette", "Fruits, légumes et légumineuses"],
  ["Noix", "Épicerie, condiments et produits sucrés"], ["Champignons des bois", "Fruits, légumes et légumineuses"],
  ["Spaghetti", "Féculents, pains et céréales"], ["Fusilli", "Féculents, pains et céréales"],
  ["Casarecce", "Féculents, pains et céréales"], ["Penne", "Féculents, pains et céréales"],
  ["Gnocchetti sardi", "Féculents, pains et céréales"], ["Triangoli aux courgettes", "Féculents, pains et céréales"],
  ["Agnolotti à la burrata", "Féculents, pains et céréales"], ["Tagliatelles vertes", "Féculents, pains et céréales"],
  ["Ravioli", "Féculents, pains et céréales"], ["Cannellonis", "Féculents, pains et céréales"],
  ["Crozets", "Féculents, pains et céréales"], ["Bleu de Bresse", "Crèmerie et produits laitiers"],
  ["Ricotta salata", "Crèmerie et produits laitiers"], ["Grana Padano", "Crèmerie et produits laitiers"],
  ["Burrata", "Crèmerie et produits laitiers"], ["Vacherin", "Crèmerie et produits laitiers"],
  ["Veau", "Viandes, poissons et protéines"], ["Gambas", "Viandes, poissons et protéines"],
  ["Anchois", "Viandes, poissons et protéines"], ["Vin rouge", "Épicerie, condiments et produits sucrés"],
  ["Concentré de tomate", "Épicerie, condiments et produits sucrés"], ["Pignons de pin", "Épicerie, condiments et produits sucrés"],
  ["Safran", "Épices et herbes aromatiques"], ["Sauge", "Épices et herbes aromatiques"],
  ["Huile de truffe", "Épicerie, condiments et produits sucrés"],
  ["Oignons", "Fruits, légumes et légumineuses"], ["Aubergines", "Fruits, légumes et légumineuses"],
  ["Basilic", "Épices et herbes aromatiques"], ["Gnocchis", "Féculents, pains et céréales"],
  ["Échalotes", "Fruits, légumes et légumineuses"], ["Ricotta", "Crèmerie et produits laitiers"],
  ["Mozzarella", "Crèmerie et produits laitiers"], ["Macaroni", "Féculents, pains et céréales"],
  ["Riz", "Féculents, pains et céréales"], ["Chapelure", "Féculents, pains et céréales"],
  ["Cannelle", "Épices et herbes aromatiques"], ["Muscade", "Épices et herbes aromatiques"],
  ["Tomates", "Fruits, légumes et légumineuses"],
  ["Chorizo", "Viandes, poissons et protéines"],
  ["Feta", "Crèmerie et produits laitiers"],
  ["Origan", "Épices et herbes aromatiques"],
  ["Poulet", "Viandes, poissons et protéines"],
  ["Estragon", "Épices et herbes aromatiques"],
  ["Huile", "Épicerie, condiments et produits sucrés"],
  ["Lardons", "Viandes, poissons et protéines"],
  ["Patates douces", "Fruits, légumes et légumineuses"],
  ["Thym", "Épices et herbes aromatiques"],
  ["Butternut", "Fruits, légumes et légumineuses"],
  ["Pommes de terre", "Fruits, légumes et légumineuses"],
  ["Miel", "Épicerie, condiments et produits sucrés"],
  ["Bagel", "Féculents, pains et céréales"], ["Baguette", "Féculents, pains et céréales"],
  ["Pain", "Féculents, pains et céréales"], ["Panko", "Féculents, pains et céréales"],
  ["Rosette", "Viandes, poissons et protéines"], ["Bœuf", "Viandes, poissons et protéines"],
  ["Saumon", "Viandes, poissons et protéines"], ["Poisson blanc", "Viandes, poissons et protéines"],
  ["Jambon", "Viandes, poissons et protéines"], ["Mayonnaise", "Épicerie, condiments et produits sucrés"],
  ["Cornichons", "Épicerie, condiments et produits sucrés"], ["Câpres", "Épicerie, condiments et produits sucrés"],
  ["Sauce soja", "Épicerie, condiments et produits sucrés"], ["Vinaigre", "Épicerie, condiments et produits sucrés"],
  ["Sucre", "Épicerie, condiments et produits sucrés"], ["Yaourt", "Crèmerie et produits laitiers"],
  ["Chèvre", "Crèmerie et produits laitiers"], ["Gruyère", "Crèmerie et produits laitiers"],
  ["Cheddar", "Crèmerie et produits laitiers"], ["Parmesan", "Crèmerie et produits laitiers"],
  ["Beurre", "Crèmerie et produits laitiers"], ["Avocats", "Fruits, légumes et légumineuses"],
  ["Courgettes", "Fruits, légumes et légumineuses"], ["Grenade", "Fruits, légumes et légumineuses"],
  ["Salade", "Fruits, légumes et légumineuses"], ["Carottes", "Fruits, légumes et légumineuses"],
  ["Concombres", "Fruits, légumes et légumineuses"], ["Épinards", "Fruits, légumes et légumineuses"],
  ["Chou rouge", "Fruits, légumes et légumineuses"], ["Ail", "Fruits, légumes et légumineuses"],
  ["Coriandre", "Épices et herbes aromatiques"], ["Cumin", "Épices et herbes aromatiques"],
  ["Paprika", "Épices et herbes aromatiques"], ["Persil", "Épices et herbes aromatiques"],
  ["Piment", "Épices et herbes aromatiques"], ["Gingembre", "Épices et herbes aromatiques"],
  ["Sésame", "Épices et herbes aromatiques"], ["Aneth", "Épices et herbes aromatiques"],
  ["Farine", "Féculents, pains et céréales"], ["Huile d'olive", "Épicerie, condiments et produits sucrés"],
])

for (const recipe of recipes) {
  for (const ingredient of recipe.ingredients ?? []) {
    if (ingredient.name === "Citron") ingredient.name = "Citrons"
    if (ingredient.name === "Huile d’olive") ingredient.name = "Huile d'olive"
  }
  recipe.dietary_tags = (recipe.dietary_tags ?? []).map(tag => tag === "viande" ? "protéines" : tag)
  recipe.canonical_ingredients_status = "verified"
}
writeFileSync(inputPath, `${JSON.stringify(recipes, null, 2)}\n`, "utf8")

function sqlString(value) {
  return value == null ? "null" : `'${String(value).replaceAll("'", "''")}'`
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`
}

function sqlArray(value) {
  if (!value?.length) return "'{}'::text[]"
  return `array[${value.map(sqlString).join(", ")}]::text[]`
}

const ingredientMap = new Map()
const meatAndFish = new Set(["Cheval", "Cerf", "Faisan", "Canard", "Porc", "Agneau", "Cabillaud", "Sébaste", "Lotte", "Perche", "Églefin", "Flétan", "Daurade", "Bar", "Lieu noir", "Poulpe", "Raie", "Brochet", "Maigre", "Calamars", "Noix de Saint-Jacques"])
const produce = new Set(["Airelles", "Amandes", "Figues", "Noisettes", "Raisins", "Pruneaux", "Oseille", "Oignons rouges", "Cranberries séchées", "Citron vert"])
const dairy = new Set(["Fromage frais", "Mozzarella di bufala", "Crème glacée"])
const herbs = new Set(["Zaatar", "Noix de muscade"])
const grocery = new Set(["Toblerone", "Nutella", "Kinder Maxi", "Chocolat blanc", "Eau"])
function ingredientCategory(name) {
  return meatAndFish.has(name) ? "Viandes, poissons et protéines"
    : produce.has(name) ? "Fruits, légumes et légumineuses"
      : dairy.has(name) ? "Crèmerie et produits laitiers"
      : herbs.has(name) ? "Épices et herbes aromatiques"
        : grocery.has(name) ? "Épicerie, condiments et produits sucrés"
          : name === "Maïzena" ? "Féculents, pains et céréales"
          : /pâte|pain|riz|nouilles|spätzle|tortilla|naan|farine|semoule|spaghetti|macaroni/i.test(name) ? "Féculents, pains et céréales"
            : /huile|miso|nutella|toblerone|kinder|cacao|airelles|moutarde|vinaigre|sel|poivre/i.test(name) ? "Épicerie, condiments et produits sucrés"
              : /œuf|crème|fromage|mozzarella|beurre|yaourt|ricotta|cheddar|feta|lait/i.test(name) ? "Crèmerie et produits laitiers"
                : "Fruits, légumes et légumineuses"
}
for (const recipe of recipes) {
  for (const ingredient of recipe.ingredients) {
    if (!ingredient.category) ingredient.category = categoryByIngredient.get(ingredient.name) ?? ingredientCategory(ingredient.name)
    ingredientMap.set(ingredient.name, ingredient.category)
  }
}

const ingredientRows = [...ingredientMap].map(([name, category]) => `  (${sqlString(name)}, ${sqlString(category)}, '{}'::text[])`).join(",\n")
const recipeIds = recipes.map(recipe => sqlString(recipe.id)).join(", ")
const columns = [
  "id", "nom", "description", "saison", "mois", "mois_numero", "semaine", "jour", "tag", "categorie",
  "theme_special", "portions", "estimated_time", "difficulty", "image_url", "ingredients", "instructions", "astuce",
  "cuisson_micro_ondes", "sans_four", "source", "source_pdf", "source_page", "dietary_tags", "main_ingredients",
  "equipment", "canonical_ingredients_status",
]
const rows = recipes.map((recipe) => {
  const values = [
    sqlString(recipe.id), sqlString(recipe.nom), sqlString(recipe.description), sqlString(recipe.saison), sqlString(recipe.mois),
    String(recipe.mois_numero), "null", "null", sqlString(recipe.tag), sqlString(recipe.categorie), "null", sqlString(recipe.portions),
    String(recipe.estimated_time), sqlString(recipe.difficulty), sqlString(recipe.image_url), sqlJson(recipe.ingredients),
    sqlJson(recipe.instructions), sqlString(recipe.astuce), String(recipe.cuisson_micro_ondes), String(recipe.sans_four),
    sqlString(recipe.source), "null", "null", sqlArray(recipe.dietary_tags), sqlArray(recipe.main_ingredients),
    sqlArray(recipe.equipment), sqlString(recipe.canonical_ingredients_status),
  ]
  return `  (${values.join(", ")})`
}).join(",\n")
const recipeConflict = `ON CONFLICT (id) DO UPDATE SET\n${columns.filter(column => column !== "id").map(column => `  ${column} = EXCLUDED.${column}`).join(",\n")}`

const batchOne = batchNumber === 1
const sqlPath = path.join(importDirectory, batchOne ? "city-cafe-recipes.sql" : `city-cafe-recipes-${batchLabel}.sql`)
const descriptions = { 1: "quiches et tartes", 2: "bagels, sandwichs, paninis et burger" }
const categorySync = `UPDATE public.recipes AS recipe\nSET ingredients = (\n  SELECT jsonb_agg(jsonb_set(item.ingredient, '{category}', to_jsonb(canonical.category), true) ORDER BY item.ordinality)\n  FROM jsonb_array_elements(recipe.ingredients) WITH ORDINALITY AS item(ingredient, ordinality)\n  JOIN public.ingredients AS canonical ON canonical.name = item.ingredient->>'name'\n)\nWHERE recipe.id IN (${recipeIds});`
const imageSync = `UPDATE public.recipes AS recipe\nSET image_url = image.image_url\nFROM (VALUES\n${recipes.map(recipe => `  (${sqlString(recipe.id)}, ${sqlString(recipe.image_url)})`).join(",\n")}\n) AS image(id, image_url)\nWHERE recipe.id = image.id;`
const sql = `-- City Café batch ${batchLabel}: ${descriptions[batchNumber] ?? "recettes"}. Generated from city-cafe-recipes-batch-${batchLabel}.json.\nBEGIN;\n\nINSERT INTO public.ingredients (name, category, aliases)\nVALUES\n${ingredientRows}\nON CONFLICT (name) DO NOTHING;\n\nINSERT INTO public.recipes (${columns.join(", ")})\nVALUES\n${rows}\n${recipeConflict};\n\n-- Keep ingredient JSON category labels aligned with the canonical ingredient catalog.\n${categorySync}\n\n-- Keep recipe image choices in sync if reviewed later.\n${imageSync}\n\nCOMMIT;\n`
writeFileSync(sqlPath, sql, "utf8")

const batchFiles = readdirSync(importDirectory).filter(name => /^city-cafe-recipes-batch-\d+\.json$/.test(name)).sort()
const allRecipes = batchFiles.flatMap(name => JSON.parse(readFileSync(path.join(importDirectory, name), "utf8")).map(recipe => ({ ...recipe, batch: Number(name.match(/(\d+)/)?.[1] ?? 1) })))
const existingManifestPath = path.join(importDirectory, "city-cafe-manifest.json")
const oldManifest = existsSync(existingManifestPath) ? JSON.parse(readFileSync(existingManifestPath, "utf8")) : {}
const oldBatches = new Map((oldManifest.batches ?? []).map(batch => [batch.batch, batch]))
const ranges = { 1: [1, 9], 2: [10, 21], 3: [22, 36], 4: [37, 41], 5: [42, 67], 6: [68, 77], 7: [78, 87], 8: [88, 107], 9: [108, 146], 10: [147, 158] }
const batchInfo = batchFiles.map(name => {
  const batch = Number(name.match(/(\d+)/)?.[1] ?? 1)
  const count = JSON.parse(readFileSync(path.join(importDirectory, name), "utf8")).length
  const range = ranges[batch] ?? [1 + batchFiles.slice(0, batchFiles.indexOf(name)).reduce((n, f) => n + JSON.parse(readFileSync(path.join(importDirectory, f), "utf8")).length, 0), count]
  return { batch, source_range: range, source_count: range[1] - range[0] + 1, recipe_count: count, status: oldBatches.get(batch)?.status ?? "pending" }
})
const attribution = allRecipes.filter(recipe => recipe.pexels_photo_id).map(recipe => ({
  recipe_id: recipe.id,
  photo_id: recipe.pexels_photo_id,
  query: recipe.pexels_query,
  alt: recipe.pexels_alt,
  photographer: recipe.pexels_photographer,
  photographer_url: recipe.pexels_photographer_url,
  pexels_url: recipe.pexels_url,
  image_url: recipe.image_url,
  batch: recipe.batch,
}))
writeFileSync(path.join(importDirectory, "city-cafe-pexels-attribution.json"), `${JSON.stringify(attribution, null, 2)}\n`, "utf8")

const manifest = {
  ...oldManifest,
  source_count: 158,
  processed_source_count: batchInfo.reduce((sum, batch) => sum + batch.source_count, 0),
  batches: batchInfo,
  generated_recipes: allRecipes.map(recipe => ({
    id: recipe.id, name: recipe.nom, original_name: recipe.original_name ?? recipe.nom, portions: Number.parseInt(recipe.portions, 10),
    season: recipe.saison, month: recipe.mois, month_number: recipe.mois_numero, estimated_time: recipe.estimated_time,
    difficulty: recipe.difficulty, pexels_query: recipe.pexels_query, pexels_photo_id: recipe.pexels_photo_id,
    pexels_url: recipe.pexels_url, image_url: recipe.image_url, batch: recipe.batch,
    status: oldManifest.generated_recipes?.find(item => item.id === recipe.id)?.status ?? "created",
  })),
  duplicates: oldManifest.duplicates ?? [],
  existing_recipes: oldManifest.existing_recipes ?? [],
  ambiguous: oldManifest.ambiguous ?? [],
  skipped: oldManifest.skipped ?? [],
}
writeFileSync(existingManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8")

console.log(`Generated ${path.basename(sqlPath)}, cumulative Pexels attribution, and manifest for ${allRecipes.length} recipes.`)
