import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const publicDirectory = path.join(root, "public")
const seed = readFileSync(path.join(root, "supabase", "seed.sql"), "utf8")
const importDirectory = path.join(root, "supabase", "new-import")
const localImagePaths = [...seed.matchAll(/'((?:\/assets\/recipe_images\/pexels)\/[^']+\.(?:jpe?g|png))'/gi)].map(match => match[1])

if (localImagePaths.length === 0) throw new Error("Le seed ne référence aucune image locale.")
const resolvedImagePath = imagePath => existsSync(path.join(publicDirectory, imagePath))
  ? imagePath
  : imagePath.replaceAll("-d-", "-d").replaceAll("-l-", "-l")
const missing = [...new Set(localImagePaths)].filter(imagePath => !existsSync(path.join(publicDirectory, resolvedImagePath(imagePath))))
if (missing.length > 0) throw new Error(`Images locales manquantes (${missing.length}) : ${missing.slice(0, 5).join(", ")}`)

const filesToCheck = [path.join(root, "supabase", "seed.sql"), ...readdirSync(importDirectory).filter(file => file.endsWith(".sql")).map(file => path.join(importDirectory, file))]
const remotePexels = filesToCheck.filter(file => /https?:\/\/images\.pexels\.com/i.test(readFileSync(file, "utf8")))
if (remotePexels.length > 0) throw new Error(`URLs Pexels distantes restantes : ${remotePexels.map(file => path.relative(root, file)).join(", ")}`)

console.log(`Validation hors ligne réussie : ${new Set(localImagePaths).size} images locales référencées par le seed.`)
