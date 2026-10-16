import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const documents = ['PRD.md', 'TRD.md', 'APP_FLOW.md', 'DESIGN_BRIEF.md', 'BACKEND_SCHEMA.md', 'IMPLEMENTATION_PLAN.md', 'DECISIONS.md']
assert.deepEqual(readdirSync('docs').sort(), [...documents].sort(), 'docs doit contenir exactement les sept documents canoniques')
let links = 0
for (const file of ['README.md', 'AGENTS.md', ...documents.map(name => `docs/${name}`)]) {
  const content = readFileSync(file, 'utf8')
  assert.ok(!content.includes('\uFFFD'), `${file}: caractère de remplacement`)
  assert.ok(!/[^\S\r\n]+\r?$/m.test(content), `${file}: espaces en fin de ligne`)
  for (const label of ['Objectif', 'Dernière mise à jour', 'Statut', 'Documents liés']) {
    assert.ok(content.includes(`**${label} :**`), `${file}: métadonnée ${label}`)
  }
  assert.equal((content.match(/^```/gm) ?? []).length % 2, 0, `${file}: clôture des blocs de code`)
  for (const [, raw] of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = raw.split('#')[0]
    if (!target || /^(https?:|mailto:)/.test(target)) continue
    assert.ok(existsSync(path.resolve(path.dirname(file), target)), `${file}: lien introuvable ${target}`)
    links++
  }
}
const example = readFileSync('.env.example', 'utf8')
assert.ok(!/MAILJET_|RESEND_|TURNSTILE_|GOOGLE_/.test(example))
for (const [, key, value] of example.matchAll(/^([A-Z_]+)=(.*)$/gm)) {
  assert.ok(value.trim() === '' || (key === 'NEXT_PUBLIC_SUPABASE_RECIPES_TABLE' && value.trim() === 'recipes'), `${key}: valeur inattendue dans l'exemple`)
}
assert.ok(!existsSync('.env.local.example'), 'Un seul exemple de configuration')
console.log(`PASS: sept documents, métadonnées, blocs Markdown, ${links} liens locaux et exemple de configuration.`)
