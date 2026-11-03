import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'

// Exercise the runtime resolver (including historical French elisions).
// No database, generator, network call or seed execution is involved.
const imagesModule = { exports: {} }
vm.runInNewContext(ts.transpileModule(readFileSync('lib/recipe-images.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: imagesModule.exports })
const { getRecipeImageUrl, getFallbackRecipeImageUrl } = imagesModule.exports
const fallback = getFallbackRecipeImageUrl()
assert.ok(fallback.startsWith('/') && !fallback.startsWith('//'), 'Le repli doit être local')
assert.ok(statSync(path.join('public', fallback)).size > 0, 'Image de remplacement absente ou vide')

const files = ['supabase/seed.sql', ...readdirSync('supabase/new-import').filter(file => file.endsWith('.sql')).map(file => `supabase/new-import/${file}`)]
const local = new Set()
const remote = new Set()
const remoteFiles = []
for (const file of files) {
  const content = readFileSync(file, 'utf8')
  for (const [, image] of content.matchAll(/['"]((?:\/assets\/recipe_images)\/[^'"\s]+\.(?:jpe?g|png|webp))['"]/gi)) local.add(image)
  const urls = [...content.matchAll(/https?:\/\/images\.pexels\.com\/[^'"\s]+/gi)].map(match => match[0])
  urls.forEach(url => remote.add(url))
  if (urls.length) remoteFiles.push(file)
}
assert.ok(local.size > 0, 'Aucune photo locale référencée')
for (const imageUrl of local) {
  const resolved = getRecipeImageUrl({ imageUrl, nom: 'Test' })
  assert.ok(existsSync(path.join('public', resolved)), `Photo locale absente : ${resolved}`)
}
// External photos are optional only while every surface uses the local fallback.
for (const file of ['components/swipe-deck.tsx', 'components/weekly-calendar.tsx', 'components/recipe-detail-sheet.tsx', 'components/personal-recipe-form.tsx', 'app/admin/import/page.tsx']) {
  const source = readFileSync(file, 'utf8')
  assert.ok(source.includes('<RecipeImage'), `${file}: repli partagé manquant`)
  assert.ok(!/<img\b/.test(source), `${file}: image sans repli partagé`)
}
function checkResources(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) checkResources(file)
    else if (/\.(tsx?|css)$/.test(file)) {
      const source = readFileSync(file, 'utf8')
      assert.ok(!/next\/font\/google|url\(\s*['"]?https?:\/\/|<script[^>]+src=['"]https?:\/\/|<link[^>]+href=['"]https?:\/\//i.test(source), `${file}: ressource distante obligatoire à examiner`)
    }
  }
}
checkResources('app'); checkResources('components')
console.log(`PASS: ${local.size} chemins locaux résolus, repli local et cinq surfaces recette protégées, aucune police/CSS/script CDN obligatoire.`)
console.log(`OPTIONNEL: ${remote.size} URLs Pexels dans ${remoteFiles.length} fichiers SQL conservées avec leurs attributions. Photo distante indisponible → ${fallback}.`)
console.log('Ce contrôle statique ne remplace pas le test navigateur avec trafic externe bloqué ni un redémarrage complet sans WAN.')
