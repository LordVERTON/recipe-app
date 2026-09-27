import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const envText = existsSync(path.join(root, ".env.local")) ? readFileSync(path.join(root, ".env.local"), "utf8") : ""
const apiKey = process.env.PEXELS_API_KEY ?? envText.match(/^PEXELS_API_KEY=(.*)$/m)?.[1]?.trim()
if (!apiKey) throw new Error("PEXELS_API_KEY is not configured")
const batch = Number(process.argv[2])
const refreshId = process.argv[3] ?? ""
if (!Number.isInteger(batch) || batch < 1) throw new Error("Pass a positive batch number")
const dir = path.join(root, "supabase", "new-import")
const file = path.join(dir, `city-cafe-recipes-batch-${String(batch).padStart(2, "0")}.json`)
const recipes = JSON.parse(readFileSync(file, "utf8"))
const used = new Set(JSON.parse(readFileSync(path.join(dir, "city-cafe-pexels-attribution.json"), "utf8")).map(row => row.photo_id))
for (const recipe of recipes) if (recipe.pexels_photo_id) used.add(recipe.pexels_photo_id)
const stop = new Set(["with", "and", "the", "fresh", "homemade", "food", "dish"])
const tokens = value => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9]+/).filter(word => word.length > 2 && !stop.has(word))
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

for (const recipe of recipes) {
  if (recipe.pexels_photo_id && recipe.id !== refreshId) continue
  const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(recipe.pexels_query)}&per_page=20`, { headers: { Authorization: apiKey } })
  if (!response.ok) {
    writeFileSync(file, `${JSON.stringify(recipes, null, 2)}\n`, "utf8")
    console.log(`${recipe.id}\tPexels HTTP ${response.status}; stopped without retrying`)
    break
  }
  const data = await response.json()
  const wanted = tokens(recipe.pexels_query)
  const candidates = data.photos.filter(photo => !used.has(photo.id) && !/\b(bird|wildlife|perched on a branch|animal)\b/i.test(`${photo.alt ?? ""} ${photo.url ?? ""}`)).map(photo => {
    const text = tokens(`${photo.alt ?? ""} ${photo.url ?? ""}`).join(" ")
    const score = wanted.reduce((sum, term) => sum + (text.includes(term) ? 1 : 0), 0)
    return { photo, score }
  }).sort((a, b) => b.score - a.score)
  let selected
  for (const candidate of candidates.slice(0, 8)) {
    const check = await fetch(candidate.photo.src.large, { method: "HEAD" })
    if (check.ok) { selected = candidate.photo; break }
  }
  if (!selected) {
    recipe.image_url = null
    console.log(`${recipe.id}\tNO_ACCEPTABLE_PHOTO`)
    await wait(1000)
    continue
  }
  const photoId = selected.id
  const extension = new URL(selected.src.large).pathname.match(/\.(jpe?g|png|webp)$/i)?.[1] ?? "jpeg"
  recipe.pexels_photo_id = photoId
  recipe.pexels_alt = selected.alt ?? ""
  recipe.pexels_photographer = selected.photographer
  recipe.pexels_photographer_url = selected.photographer_url
  recipe.pexels_url = selected.url
  recipe.image_url = `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.${extension}?auto=compress&cs=tinysrgb&h=650&w=940`
  used.add(photoId)
  writeFileSync(file, `${JSON.stringify(recipes, null, 2)}\n`, "utf8")
  console.log(`${recipe.id}\t${photoId}\t${recipe.pexels_alt}`)
  await wait(1000)
}
writeFileSync(file, `${JSON.stringify(recipes, null, 2)}\n`, "utf8")
