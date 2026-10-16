import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { createClient } from '@supabase/supabase-js'

// Always use the local stack; never load the app's potentially remote .env.local.
const localEnv = parseEnv(readFileSync('.env.development.local', 'utf8'))
const status = { API_URL: localEnv.NEXT_PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY: localEnv.SUPABASE_SERVICE_ROLE_KEY, ANON_KEY: localEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY }
assert.equal(new URL(status.API_URL).hostname, '127.0.0.1')
const options = { auth: { persistSession: false, autoRefreshToken: false } }
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, options)
const owner = createClient(status.API_URL, status.ANON_KEY, options)
const visitor = createClient(status.API_URL, status.ANON_KEY, options)
const suffix = crypto.randomUUID()
const email = `recipe-test-${suffix}@example.com`
const password = `${crypto.randomUUID()}Aa1!`
let moderatorId
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
  const queued = await admin.from('recipe_review_notifications').select('*').eq('recipe_id', recipeId).single()
  assert.ifError(queued.error)
  assert.equal(queued.data.sent_at, null)
  assert.deepEqual((await owner.from('recipe_review_notifications').select('*')).data ?? [], [])
  assert.ok((await owner.rpc('edit_pending_recipe', { recipe_id: recipeId, payload })).error)
  if (process.env.TEST_APP_URL) {
    const endpoint = new URL('/api/recipe-notifications', process.env.TEST_APP_URL)
    assert.equal((await fetch(endpoint, { method: 'POST' })).status, 401)
    const { data: { session } } = await owner.auth.getSession()
    const send = () => fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ recipeId }) })
    const first = await send()
    assert.equal(first.status, 200, await first.text())
    const second = await send()
    assert.equal(second.status, 200)
    assert.equal((await second.json()).processed, 0)
    assert.ok((await admin.from('recipe_review_notifications').select('sent_at').eq('recipe_id', recipeId).single()).data.sent_at)
    const inbox = await (await fetch('http://127.0.0.1:54324/api/v1/messages')).json()
    const invitation = inbox.messages.find(message => message.Subject === 'Nouvelle recette à valider')
    assert.ok(invitation)
    const message = await (await fetch(`http://127.0.0.1:54324/api/v1/message/${invitation.ID}`)).json()
    assert.ok(message.Text.includes(recipeId))
    assert.ok(message.To.some(recipient => recipient.Address === 'admin@example.test'))
    console.log('PASS: authenticated notification API, Mailpit delivery, recipe link, no duplicate notification.')
  }
  const moderatorEmail = `moderator-${suffix}@example.com`
  const moderatorAccount = await admin.auth.admin.createUser({ email: moderatorEmail, password, email_confirm: true })
  assert.ifError(moderatorAccount.error)
  moderatorId = moderatorAccount.data.user.id
  assert.ifError((await admin.from('recipe_admin_emails').insert({ email: moderatorEmail })).error)
  const moderator = createClient(status.API_URL, status.ANON_KEY, options)
  assert.ifError((await moderator.auth.signInWithPassword({ email: moderatorEmail, password })).error)
  assert.equal((await moderator.rpc('is_recipe_admin')).data, true)
  assert.ifError((await moderator.from('recipes').select('id').eq('id', recipeId).single()).error)
  assert.ifError((await moderator.rpc('edit_pending_recipe', { recipe_id: recipeId, payload: { ...payload, nom: 'Recette corrigée' } })).error)
  const edited = await owner.from('recipes').select('*').eq('id', recipeId).single()
  assert.equal(edited.data.nom, 'Recette corrigée')
  assert.equal(edited.data.created_by, userId)
  assert.equal(edited.data.image_path, photoPath)
  assert.equal(edited.data.moderation_status, 'pending')
  assert.ok((await moderator.rpc('review_recipe', { recipe_id: recipeId, decision: 'rejected', note: '  ' })).error)
  assert.ifError((await moderator.rpc('review_recipe', { recipe_id: recipeId, decision: 'rejected', note: 'Préciser les étapes.' })).error)
  assert.equal((await owner.from('recipes').select('moderation_note').eq('id', recipeId).single()).data.moderation_note, 'Préciser les étapes.')
  assert.ok((await moderator.rpc('edit_pending_recipe', { recipe_id: recipeId, payload })).error)
  assert.ok((await moderator.rpc('review_recipe', { recipe_id: recipeId, decision: 'approved' })).error)
  assert.deepEqual((await visitor.from('recipes').select('id').eq('id', recipeId)).data, [])
  // Reset only our fixture to exercise approval and racing reviewers.
  assert.ifError((await admin.from('recipes').update({ moderation_status: 'pending' }).eq('id', recipeId)).error)
  const decisions = await Promise.all([
    moderator.rpc('review_recipe', { recipe_id: recipeId, decision: 'approved' }),
    moderator.rpc('review_recipe', { recipe_id: recipeId, decision: 'rejected', note: 'Concurrent' }),
  ])
  assert.equal(decisions.filter(result => !result.error).length, 1)
  const final = await admin.from('recipes').select('moderation_status').eq('id', recipeId).single()
  if (final.data.moderation_status === 'approved') assert.ifError((await visitor.from('recipes').select('id').eq('id', recipeId).single()).error)
  // Confirmed email is mandatory, and changing away from an allowed email revokes access.
  assert.ifError((await admin.auth.admin.updateUserById(moderatorId, { email: `changed-${suffix}@example.com` })).error)
  assert.equal((await moderator.rpc('is_recipe_admin')).data, false)
  console.log('PASS: editing, rejection comments, approval, concurrent decisions, email admin rights, outbox privacy;')
  console.log('PASS: authenticated submission, photo upload/read, ingredient matching, validation, private visibility, and moderation permissions.')
} finally {
  await admin.from('recipe_admin_emails').delete().eq('email', `moderator-${suffix}@example.com`)
  if (recipeId) await admin.from('recipes').update({ reviewed_by: null }).eq('id', recipeId)
  if (moderatorId) assert.ifError((await admin.auth.admin.deleteUser(moderatorId)).error)
  if (recipeId) assert.ifError((await admin.from('recipes').delete().eq('id', recipeId)).error)
  if (photoPath) assert.ifError((await admin.storage.from('recipe-photos').remove([photoPath])).error)
  if (userId) assert.ifError((await admin.auth.admin.deleteUser(userId)).error)
}
