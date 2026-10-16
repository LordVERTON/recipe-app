import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { createClient } from '@supabase/supabase-js'

// Set PLAYWRIGHT_MODULE to an installed playwright module when it is not a dependency.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const localEnv = parseEnv(readFileSync('.env.development.local', 'utf8'))
const status = { API_URL: localEnv.NEXT_PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY: localEnv.SUPABASE_SERVICE_ROLE_KEY, ANON_KEY: localEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY }
assert.equal(new URL(status.API_URL).hostname, '127.0.0.1')
const options = { auth: { persistSession: false, autoRefreshToken: false } }
const db = createClient(status.API_URL, status.SERVICE_ROLE_KEY, options)
const client = createClient(status.API_URL, status.ANON_KEY, options)
const email = `browser-review-${crypto.randomUUID()}@example.com`
const password = `${crypto.randomUUID()}Aa1!`
let userId, recipeId, browser
try {
  const account = await db.auth.admin.createUser({ email, password, email_confirm: true })
  assert.ifError(account.error)
  userId = account.data.user.id
  assert.ifError((await db.from('recipe_admin_emails').insert({ email })).error)
  const login = await client.auth.signInWithPassword({ email, password })
  assert.ifError(login.error)
  const result = await client.rpc('submit_recipe', { payload: {
    nom: 'Recette navigateur', description: 'Test du parcours administrateur', saison: 'automne', categorie: 'salé',
    tag: 'dejeuner/diner', servings: 2, estimated_time: 20,
    ingredients: [{ name: 'tomate', quantity: '200', unit: 'g' }], instructions: ['Couper puis cuire.'],
  } })
  assert.ifError(result.error)
  recipeId = result.data
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(session => localStorage.setItem('broco-chou-supabase-local-auth', JSON.stringify(session)), login.data.session)
  await page.goto(`http://localhost:3000/?review=${recipeId}`, { waitUntil: 'domcontentloaded', timeout: 120_000 })
  const card = page.locator('article').filter({ has: page.getByRole('button', { name: 'Modifier la recette', exact: true }) }).filter({ hasText: 'Recette navigateur' })
  await card.getByRole('button', { name: 'Modifier la recette', exact: true }).click({ timeout: 60_000 })
  await page.getByLabel('Nom de la recette', { exact: true }).fill('Recette navigateur corrigée')
  await page.getByRole('button', { name: 'Enregistrer les modifications', exact: true }).click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  await card.getByRole('heading', { name: 'Recette navigateur corrigée', exact: true }).waitFor()
  await card.getByRole('button', { name: 'Ne pas publier', exact: true }).click()
  await card.getByRole('alert').filter({ hasText: 'Ajoute un commentaire' }).waitFor()
  await card.getByLabel('Message à l’auteur', { exact: false }).fill('Merci de préciser la cuisson.')
  await card.getByRole('button', { name: 'Ne pas publier', exact: true }).click()
  await card.waitFor({ state: 'hidden' })
  const saved = await db.from('recipes').select('nom,moderation_status,moderation_note').eq('id', recipeId).single()
  assert.equal(saved.data.nom, 'Recette navigateur corrigée')
  assert.equal(saved.data.moderation_status, 'rejected')
  assert.equal(saved.data.moderation_note, 'Merci de préciser la cuisson.')
  assert.deepEqual(errors, [])
  console.log('PASS: mobile browser, invitation link, admin dashboard, edit dialog, required rejection comment and persisted decision; no browser errors.')
} finally {
  await browser?.close()
  if (recipeId) assert.ifError((await db.from('recipes').delete().eq('id', recipeId)).error)
  assert.ifError((await db.from('recipe_admin_emails').delete().eq('email', email)).error)
  if (userId) assert.ifError((await db.auth.admin.deleteUser(userId)).error)
}
