import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { createClient } from '@supabase/supabase-js'
import vm from 'node:vm'
import ts from 'typescript'

// Read-only, anonymous visibility. Never reads or uses service-role credentials.
const remote = process.argv.includes('--remote-readonly')
const env = parseEnv(readFileSync(remote ? '.env.local' : '.env.development.local', 'utf8'))
const api = new URL(env.NEXT_PUBLIC_SUPABASE_URL)
if (remote) assert.equal(api.hostname, 'cbwrvcifxcqyrgtcpvbd.supabase.co')
else assert.ok(['127.0.0.1', 'localhost'].includes(api.hostname))
const corrections = JSON.parse(readFileSync('lib/data/crous-preparations.json', 'utf8'))
const compiledModule = { exports: {} }
vm.runInNewContext(ts.transpileModule(readFileSync('lib/recipe-preparation.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText, { exports: compiledModule.exports, require: () => corrections })
const { restoreRecipePreparation, hasBriefPreparation } = compiledModule.exports
const db = createClient(api.href, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
const rows = []
for (let offset = 0; ; offset += 500) {
  const { data, error } = await db.from('recipes').select('id,nom,source,source_pdf,source_page,instructions,ingredients,portions').order('id').range(offset, offset + 499)
  assert.ifError(error)
  rows.push(...data)
  if (data.length < 500) break
}
let repaired = 0, missing = 0, brief = 0, importedSuspect = 0
for (const row of rows) {
  const restored = restoreRecipePreparation(row)
  if (JSON.stringify(row.instructions) !== JSON.stringify(restored.instructions)) repaired++
  if (!restored.instructions?.length) missing++
  if (hasBriefPreparation(restored.instructions ?? [])) brief++
  if (row.source !== 'community' && restored.instructions.some(s => !/[.!?:»)]$/.test(s.trim()))) importedSuspect++
}
console.log(JSON.stringify({ environment: remote ? 'Cloud read-only (anon)' : 'local read-only (anon)', recipes: rows.length, repairedByFrontend: repaired, missingPreparations: missing, briefPreparations: brief, suspectImportedStepEndings: importedSuspect }))
assert.equal(missing, 0)
assert.equal(importedSuspect, 0)
