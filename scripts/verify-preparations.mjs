import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const corrections = JSON.parse(readFileSync('lib/data/crous-preparations.json', 'utf8'))
const compiledModule = { exports: {} }
vm.runInNewContext(ts.transpileModule(readFileSync('lib/recipe-preparation.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText, { exports: compiledModule.exports, require: name => {
  assert.equal(name, './data/crous-preparations.json'); return corrections
} })
const { restoreRecipePreparation, preparationSteps, hasBriefPreparation } = compiledModule.exports
assert.equal(Object.keys(corrections.sources).length, 4)
assert.equal(Object.keys(corrections.recipes).length, 300)
let ingredients = 0, steps = 0
for (const [id, c] of Object.entries(corrections.recipes)) {
  assert.ok(c.instructions.length > 0)
  assert.ok(c.sourcePage > 0)
  for (const text of c.instructions) {
    assert.ok(text.trim().length > 0)
    assert.ok(!/[\r\n\x00-\x1f�]/.test(text), `${id}: extraction debris`)
    assert.ok(/[.!?:»)]$/.test(text), `${id}: unfinished step`)
  }
  const recipe = { id, nom: c.title, portions: c.legacyPortions ?? '1 personne', source: 'crous', source_pdf: c.sourcePdf, instructions: c.legacyInstructions, ingredients: (c.legacyIngredients ?? []).map(item => ({ ...item, quantity: item.quantity ?? '', unit: item.unit ?? '', category: item.category ?? '' })) }
  const restored = restoreRecipePreparation(recipe)
  assert.equal(JSON.stringify(restored.instructions), JSON.stringify(c.instructions))
  assert.equal(JSON.stringify(restoreRecipePreparation(restored)), JSON.stringify(restored), 'Restoration is idempotent')
  const edited = { ...recipe, instructions: ['Préparation corrigée par son auteur.'] }
  assert.equal(restoreRecipePreparation(edited), edited, 'A newer edit must win')
  const community = { ...recipe, source: 'community' }
  assert.equal(restoreRecipePreparation(community), community, 'Never modify community content')
  if (c.ingredients) {
    ingredients++
    assert.equal(JSON.stringify(restored.ingredients), JSON.stringify(c.ingredients))
    assert.equal(restored.portions, c.portions)
    const editedIngredients = { ...recipe, ingredients: [{ name: 'Ingrédient corrigé', quantity: '200', unit: 'g' }] }
    assert.equal(JSON.stringify(restoreRecipePreparation(editedIngredients).ingredients), JSON.stringify(editedIngredients.ingredients))
    const editedPortions = { ...recipe, portions: '12 personnes' }
    assert.equal(restoreRecipePreparation(editedPortions).portions, editedPortions.portions)
  }
  steps += c.instructions.length
}
assert.equal(JSON.stringify(preparationSteps(['  ', '1. Préparer.\n2. Cuire 10 min.'])), JSON.stringify(['Préparer.', 'Cuire 10 min.']))
assert.equal(hasBriefPreparation(['Faire cuire les bananes']), true)
console.log(`PASS: ${steps} full steps across 300 Crous recipes, ${ingredients} mismatched ingredient lists restored; original source guards, newer edits and community content preserved.`)
