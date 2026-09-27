import { readFileSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const dir = path.join(root, "supabase", "new-import")
const recipes = Array.from({ length: 10 }, (_, index) => JSON.parse(readFileSync(path.join(dir, `city-cafe-recipes-batch-${String(index + 1).padStart(2, "0")}.json`), "utf8"))).flat()
const queue = [...recipes]
const failed = []
const workers = Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const recipe = queue.shift()
    try {
      const response = await fetch(recipe.image_url, { method: "HEAD", signal: AbortSignal.timeout(15000) })
      if (!response.ok || !recipe.image_url.startsWith("https://images.pexels.com/photos/") || !recipe.image_url.endsWith("?auto=compress&cs=tinysrgb&h=650&w=940")) {
        failed.push(`${recipe.id}: HTTP ${response.status}`)
      }
    } catch (error) {
      failed.push(`${recipe.id}: ${error.message}`)
    }
  }
})
await Promise.all(workers)
console.log(`CHECKED=${recipes.length}`)
console.log(`HTTP_200=${recipes.length - failed.length}`)
console.log(`FAILED=${failed.length}`)
for (const item of failed) console.log(item)
if (failed.length) process.exitCode = 1
