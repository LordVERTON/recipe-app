import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import Module from 'node:module'
import test from 'node:test'
import ts from 'typescript'
import { cake, narrative, groups } from './fixtures/ocr-recipes.mjs'

// Same lightweight TS transpilation approach as existing repository checks.
function load(file) {
  const mod = new Module(file)
  mod._compile(ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file)
  return mod.exports
}
const { parseRecipeText: parse, parseIngredient, parseInstagramCaption } = load('lib/ocr/parse.ts')
const { mergeOcrPages: merge, orderOcrLines } = load('lib/ocr/merge.ts')
const { validateRecipeDraft: validate, toPersonalRecipeFormData: convert } = load('lib/ocr/draft.ts')
const { validateImageFiles } = load('lib/ocr/images.ts')

test('Structured ingredients, French units, fractions, ranges, decimals and optional notes', () => {
  const result = parse(cake)
  assert.equal(result.ingredients.length, 10)
  assert.deepEqual(result.ingredients[0], { name: 'chocolat pâtissier', quantity: '250', unit: 'g', group: undefined, optional: false, raw: '250 g de chocolat pâtissier', warnings: [] })
  assert.equal(result.ingredients[2].name, 'œufs')
  assert.equal(result.ingredients[3].quantity, '1/2')
  assert.equal(result.ingredients[3].unit, 'paquet')
  assert.equal(result.ingredients[4].unit, 'c. à soupe')
  assert.equal(result.ingredients[4].name, "huile d'olive")
  assert.equal(result.ingredients[5].optional, true)
  assert.equal(result.ingredients[6].quantity, 'Un peu')
  assert.equal(result.ingredients[6].name, 'sel')
  assert.equal(result.ingredients[7].unit, 'feuilles')
  assert.equal(result.ingredients[8].quantity, '1,5')
  assert.equal(result.ingredients[9].quantity, '2 à 3')
  assert.ok(result.ingredients[9].warnings.length)
  assert.equal(result.servings, 4)
  assert.equal(result.preparationTime, 15)
  assert.equal(result.cookingTime, 70)
  assert.equal(result.estimatedTime, undefined, 'No total time fabricated from separate times')
  assert.equal(result.instructions.length, 3)
})
test('Decimal point and compact quantity preserved, accents, unicode fractions and no quantity', () => {
  assert.equal(parse('Ingrédients :\n1.5 l de lait').ingredients[0].quantity, '1.5')
  assert.equal(parseIngredient('½ c. à café de curry').quantity, '½')
  assert.equal(parseIngredient('250g de farine').unit, 'g')
  assert.equal(parseIngredient('Basilic frais').quantity, undefined)
  assert.equal(parseIngredient('2O g de farine').name, '2O g de farine')
  assert.equal(parseIngredient('2O g de farine').quantity, undefined)
  assert.ok(parseIngredient('2O g de farine').warnings.some(w => w.includes('ambigu')))
})
test('Narrative extraction preserves all instructions and only literal food spans', () => {
  const result = parse(narrative)
  assert.equal(result.instructions.length, 4)
  assert.equal(result.ingredients.find(i => i.name === 'oignon').quantity, 'un')
  assert.equal(result.ingredients.find(i => i.name === 'bouillon de poule').unit, 'cube')
  assert.equal(result.ingredients.find(i => i.name === 'viande de porc').quantity, undefined)
  assert.equal(result.cookingTime, undefined, 'Cooking instruction is not an explicit time field')
  assert.equal(parse('Ajouter 2 à 3 oignons.').ingredients[0].quantity, '2 à 3')
  assert.equal(parseIngredient('Environ 200 g de farine').quantity, 'Environ 200')
  assert.ok(result.ingredients.every(i => narrative.includes(i.name)))
  assert.ok(result.warnings.some(w => w.includes('partielle')))
  assert.equal(parse('Couper en morceaux.').ingredients.length, 0, 'No eau from morceaux')
})
test('Four ingredient groups and promotional text kept out of steps', () => {
  const result = parse(groups)
  assert.equal(new Set(result.ingredients.map(i => i.group)).size, 4)
  assert.equal(result.instructions.length, 2)
  assert.equal(result.unrecognized.length, 3)
  assert.equal(result.ingredients.at(-1).name, 'basilic frais')
})
test('Missing fields remain absent; no OCR corrections invented', () => {
  for (const text of ['', 'Ingrédients :\nSel', 'Ajouter un oignon.', '#recette']) {
    const result = parse(text)
    assert.equal(result.nom, undefined)
    assert.equal(result.servings, undefined)
    assert.equal(result.estimatedTime, undefined)
    assert.equal(result.saison, undefined)
    assert.ok(result.warnings.length > 0)
  }
  assert.ok(parse('Ingrédients :\n2O g de farine').rawText.includes('2O'))
})
test('Legacy Instagram output contract preserved', () => {
  assert.deepEqual(parseInstagramCaption('Gâteau test\nIngrédients :\n250 g chocolat\n3 œufs\nPréparation :\n1. Mélanger.\n2. Cuire.\n#test'), {
    title: 'Gâteau test', description: 'Gâteau test\nIngrédients :\n250 g chocolat\n3 œufs\nPréparation :\n1. Mélanger.\n2. Cuire.\n#test',
    ingredients: [{ quantity: '250 g', name: 'chocolat' }, { quantity: '3', name: 'œufs' }], instructions: ['Mélanger.', 'Cuire.'],
  })
  assert.equal(parseInstagramCaption('Ingrédients :\nPréparation :').title, 'Nouvelle recette')
})
test('Conversion preserves manual data, omissions and review notes; local RPC bounds', () => {
  const draft = parse(cake)
  assert.ok(validate(draft).length > 0)
  const absent = convert(draft)
  assert.equal(absent.values.estimated_time, undefined)
  draft.nom = '  Nom manuel  '; draft.estimatedTime = 90; draft.saison = 'été'; draft.categorie = 'sucré'; draft.tag = 'dessert'
  draft.origins.nom = 'manual'
  const result = convert(draft)
  assert.equal(result.values.nom, '  Nom manuel  ')
  assert.equal(result.origins.nom, 'manual')
  assert.equal(result.ingredientNotes[5].optional, true)
  assert.equal(result.timingNotes.cookingTime, 70)
  assert.deepEqual(validate(draft), [])
  for (const servings of [0, 51, 1.5, NaN]) assert.ok(validate({ ...draft, servings }).some(e => e.includes('Portions')))
  assert.ok(validate({ ...draft, instructions: [''] }).length)
  assert.ok(validate({ ...draft, cookingTime: -1 }).length)
  assert.ok(validate({ ...draft, ingredients: Array(61).fill({ name: 'sel' }) }).length)
})
test('No overlap, exact overlap, accents/case/punctuation', () => {
  assert.equal(merge([['A'], ['B']]).text, 'A\nB')
  const a = ['Titre', '100 g de yaourt', "1 c. à soupe d’huile", 'Du basilic frais']
  const b = ['100 g de yaourt', "1 c. à soupe d’huile", 'Du basilic frais', 'Couper les légumes.']
  const copy = JSON.stringify([a, b])
  assert.equal(merge([a, b]).overlaps[0].removed, 3)
  assert.equal(JSON.stringify([a, b]), copy, 'Raw OCR unchanged')
  assert.equal(merge([['Mélanger la crème soigneusement.'], ['MELANGER LA CREME SOIGNEUSEMENT !', 'Servir.']]).overlaps[0].removed, 1)
})
test('Controlled fuzzy overlap needs multiple long lines, never changed quantities', () => {
  const a = ['100 g de yaourt nature épais', 'Quelques grandes feuilles de basilic']
  const b = ['100 g de yaourt nature epals', 'Quelques grandes feuilles de basilic', 'Servir.']
  assert.equal(merge([a, b]).overlaps[0].removed, 2)
  assert.deepEqual(merge([a, ['200 g de yaourt nature épais', a[1]]]).overlaps, [])
  assert.deepEqual(merge([['Couper les légumes.'], ['Couper les legurnes.']]).overlaps, [])
})
test('Legitimate repetitions, reversed order, empty pages and multiple pages', () => {
  const repeated = ['Remuer.', 'Ajouter de l’eau.', 'Remuer.']
  assert.equal(merge([repeated, ['Servir.']]).text.split('Remuer.').length, 3)
  assert.deepEqual(merge([['suite'], ['titre', 'suite']]).overlaps, [])
  assert.equal(merge([[], ['A'], [], ['A'], ['B']]).text, 'A\nA\nB')
  assert.deepEqual(merge([]), { text: '', overlaps: [] })
  const line = 'Mélanger soigneusement la préparation.'
  assert.equal(merge([['Titre', line], [line, 'Deuxième page'], ['Deuxième page', 'Fin']]).text, `Titre\n${line}\nDeuxième page\nDeuxième page\nFin`)
})
test('OCR geometry yields row order and preserves source indexes and confidence', () => {
  const line = (text, x, y) => ({ text, score: .8, sourceIndex: 2, poly: [[x,y],[x+100,y],[x+100,y+20],[x,y+20]] })
  const ordered = orderOcrLines([line('C',0,50), line('B',200,1), line('A',0,0)])
  assert.deepEqual(ordered.map(l => l.text), ['A','B','C'])
  assert.equal(ordered[0].sourceIndex, 2)
  assert.equal(ordered[0].score, .8)
})
test('Image limits reject unsupported, empty, oversized and excessive selections', () => {
  const file = { type: 'image/png', size: 100 }
  assert.throws(() => validateImageFiles([{ ...file, type: 'image/heic' }]))
  assert.throws(() => validateImageFiles([{ ...file, size: 0 }]))
  assert.throws(() => validateImageFiles([{ ...file, size: 10 * 1048576 + 1 }]))
  assert.throws(() => validateImageFiles(Array(5).fill(file)))
  assert.doesNotThrow(() => validateImageFiles([file]))
})
