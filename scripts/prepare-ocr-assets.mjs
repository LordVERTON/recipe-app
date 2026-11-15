import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

// No postinstall/network at app startup. Explicit, pinned and resumable preparation.
const manifest = JSON.parse(await readFile(new URL('./ocr-assets.lock.json', import.meta.url), 'utf8'))
const root = path.resolve('public/ocr/0.4.2')
const check = process.argv.includes('--check')
let total = 0
for (const asset of manifest.files) {
  const target = path.resolve(root, asset.file)
  if (!target.startsWith(root + path.sep)) throw new Error('Invalid asset path')
  let bytes
  try { bytes = await readFile(target) } catch { /* prepared below */ }
  const valid = data => data?.length === asset.bytes && createHash('sha256').update(data).digest('hex') === asset.sha256
  if (!valid(bytes)) {
    if (check) throw new Error(`Ressource OCR absente ou altérée : ${asset.file}. Exécuter npm run ocr:prepare.`)
    if (asset.source.startsWith('npm:')) bytes = await readFile(path.resolve('node_modules', asset.source.slice(4)))
    else {
      const response = await fetch(asset.source, { signal: AbortSignal.timeout(180_000) })
      if (!response.ok) throw new Error(`Téléchargement ${asset.file} : HTTP ${response.status}`)
      bytes = Buffer.from(await response.arrayBuffer())
    }
    if (!valid(bytes)) throw new Error(`Intégrité SHA-256 incorrecte : ${asset.file}. Aucun fichier remplacé.`)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, bytes)
  }
  total += asset.bytes
  console.log(`OK ${asset.file}: ${asset.bytes} octets`)
}
console.log(`PASS ressources OCR locales : ${total} octets (${(total / 1048576).toFixed(2)} Mio). ${check ? 'Aucun réseau utilisé.' : 'Fichiers déjà valides réutilisés.'}`)
