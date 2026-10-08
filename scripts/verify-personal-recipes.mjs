import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

// Always use the local stack; never load the app's potentially remote .env.local.
const status = JSON.parse(execFileSync(process.execPath, ['node_modules/supabase/dist/supabase.js', 'status', '-o', 'json'], { encoding: 'utf8' }))
assert.equal(new URL(status.API_URL).hostname, '127.0.0.1')
const options = { auth: { persistSession: false, autoRefreshToken: false } }
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, options)
const owner = createClient(status.API_URL, status.ANON_KEY, options)
const visitor = createClient(status.API_URL, status.ANON_KEY, options)
const suffix = crypto.randomUUID()
const email = `recipe-test-${suffix}@example.com`
const password = `${crypto.randomUUID()}Aa1!`
let userId
let recipeId
let photoPath
try {
  const account = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  assert.ifError(account.error)
  userId = account.data.user.id
  assert.ifError((await owner.auth.signInWithPassword({ email, password })).error)
  const ingredient = await admin.from('ingredients').select('name').limit(1).single()
  assert.ifError(ingredient.error)
  photoPath = `${userId}/${suffix}.png`
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')
  assert.ifError((await owner.storage.from('recipe-photos').upload(photoPath, png, { contentType: 'image/png' })).error)
  const payload = {
    nom: `Recette test ${suffix}`, description: 'Vérification locale', saison: 'automne',
    categorie: 'salé', tag: 'dejeuner/diner', servings: 2, estimated_time: 20,
    ingredients: [{ name: ingredient.data.name, quantity: '200', unit: 'g' }],
    instructions: ['Préparer les ingrédients.', 'Faire cuire puis servir.'], image_path: photoPath,
  }
  assert.ok((await visitor.rpc('submit_recipe', { payload })).error, 'Guests cannot submit')
  assert.ok((await owner.rpc('submit_recipe', { payload: { ...payload, nom: ' ' } })).error, 'Blank names rejected')
  const saved = await owner.rpc('submit_recipe', { payload })
  assert.ifError(saved.error)
  recipeId = saved.data
  const ownRecipe = await owner.from('recipes').select('*').eq('id', recipeId).single()
  assert.ifError(ownRecipe.error)
  assert.equal(ownRecipe.data.created_by, userId)
  assert.equal(ownRecipe.data.moderation_status, 'pending')
  assert.equal(ownRecipe.data.portions, '2 personne(s)')
  assert.equal(ownRecipe.data.ingredients[0].name, ingredient.data.name)
  const hidden = await visitor.from('recipes').select('id').eq('id', recipeId)
  assert.ifError(hidden.error)
  assert.deepEqual(hidden.data, [])
  assert.ok((await owner.rpc('review_recipe', { recipe_id: recipeId, decision: 'approved' })).error, 'Owner cannot self-approve')
  const photo = await owner.storage.from('recipe-photos').createSignedUrl(photoPath, 60)
  assert.ifError(photo.error)
  assert.equal((await fetch(photo.data.signedUrl)).status, 200)
  console.log('PASS: authenticated submission, photo upload/read, ingredient matching, validation, private visibility, and moderation permissions.')
} finally {
  if (recipeId) assert.ifError((await admin.from('recipes').delete().eq('id', recipeId)).error)
  if (photoPath) assert.ifError((await admin.storage.from('recipe-photos').remove([photoPath])).error)
  if (userId) assert.ifError((await admin.auth.admin.deleteUser(userId)).error)
}
