import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const batch = Number(process.argv[2])
const status = process.argv[3] ?? "synchronized-local-production"
const dir = path.join(root, "supabase", "new-import")
const manifestPath = path.join(dir, "city-cafe-manifest.json")
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
for (const item of manifest.batches) if (item.batch === batch) item.status = status
for (const recipe of manifest.generated_recipes) if (recipe.batch === batch) recipe.status = status
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8")

const orderPath = path.join(dir, "city-cafe-import-order.md")
const order = readFileSync(orderPath, "utf8").split(/\r?\n/).map(line => {
  const fields = line.split("|").map(value => value.trim())
  if (Number(fields[1]) !== batch || fields.length < 6) return line
  fields[4] = String(manifest.batches.find(row => row.batch === batch)?.recipe_count ?? manifest.batches.find(row => row.batch === batch)?.source_count ?? 0)
  fields[5] = status
  return `| ${fields.slice(1, -1).join(" | ")} |`
}).join("\n")
writeFileSync(orderPath, `${order.replace(/\n*$/, "\n")}`, "utf8")
const orderText = readFileSync(orderPath, "utf8")
const doneSources = manifest.batches.filter(item => item.status === "synchronized-local-production").reduce((sum, item) => sum + item.source_count, 0)
const orderProgress = orderText.replace(/^Progression source :.*$/m, `Progression source : **${doneSources} / ${manifest.source_count} (${(doneSources / manifest.source_count * 100).toFixed(2).replace(".", ",")} %)**. Les lots synchronisés ne sont pas réimportés hors correction documentée.`)
writeFileSync(orderPath, orderProgress, "utf8")

const roadmapPath = path.join(root, "docs", "roadmap.md")
let roadmap = readFileSync(roadmapPath, "utf8")
const recipeCount = manifest.batches.filter(item => item.status === "synchronized-local-production").reduce((sum, item) => sum + item.source_count, 0)
const pct = (recipeCount / manifest.source_count * 100).toFixed(2).replace(".", ",")
const tableLine = new RegExp(`^\\| ${String(batch).padStart(2, "0")} \\|.*$`, "m")
roadmap = roadmap.replace(tableLine, line => {
  const fields = line.split("|").map(value => value.trim())
  fields[4] = `Terminé : ${manifest.batches.find(row => row.batch === batch)?.recipe_count ?? manifest.batches.find(row => row.batch === batch)?.source_count} recette(s) synchronisée(s) en local et en production`
  return `| ${fields.slice(1, -1).join(" | ")} |`
})
roadmap = roadmap.replace(/^\*\*Progression :.*$/m, `**Progression : ${recipeCount} / ${manifest.source_count} intitulés source (${pct} %).** La fusion des items 34 et 133 reste enregistrée au manifeste.`)
writeFileSync(roadmapPath, roadmap, "utf8")
