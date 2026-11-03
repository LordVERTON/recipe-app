import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

// Browser and API must both remain local. Never load .env.local or Cloud keys.
const appUrl = new URL(process.env.TEST_APP_URL || 'http://localhost:3000')
assert.ok(['localhost', '127.0.0.1'].includes(appUrl.hostname))
const args = ['node_modules/supabase/dist/supabase.js', 'status', '-o', 'json']
if (process.env.TEST_SUPABASE_WORKDIR) args.push('--workdir', process.env.TEST_SUPABASE_WORKDIR)
const status = JSON.parse(execFileSync(process.execPath, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
assert.equal(new URL(status.API_URL).hostname, '127.0.0.1')
const { chromium, devices } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const mobile = process.env.TEST_MOBILE === '1'
const options = { auth: { persistSession: false, autoRefreshToken: false } }
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, options)
const owner = createClient(status.API_URL, status.ANON_KEY, options)
const suffix = crypto.randomUUID()
const email = `photo-browser-${suffix}@example.com`
const password = `${crypto.randomUUID()}Aa1!`
const title = `Photo navigateur ${suffix}`
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')
let userId, browser
try {
  const account = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  assert.ifError(account.error)
  userId = account.data.user.id
  const login = await owner.auth.signInWithPassword({ email, password })
  assert.ifError(login.error)
  const role = await owner.rpc('is_recipe_admin')
  assert.ifError(role.error)
  assert.equal(role.data, false, 'The author must be a regular user')
  const ingredient = await owner.from('ingredients').select('name').limit(1).single()
  assert.ifError(ingredient.error)
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage(mobile ? devices['Pixel 7'] : { viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.name))
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort()
    return route.continue()
  })
  // Notification transport is unrelated to photos; do not send fixture mail,
  // especially when a different local project uses the default Mailpit port.
  await page.route('**/api/recipe-notifications', route => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ processed: 0, failed: 0 }),
  }))
  await page.addInitScript(session => localStorage.setItem('broco-chou-supabase-local-auth', JSON.stringify(session)), login.data.session)
  await page.addInitScript(() => {
    const read = File.prototype.arrayBuffer
    File.prototype.arrayBuffer = function () {
      if (window.__failPhotoRead && this.name === 'fixture.png') return Promise.reject(new DOMException('Synthetic unavailable gallery file', 'NotReadableError'))
      return read.call(this)
    }
  })
  await page.goto(new URL('/?review', appUrl).href, { waitUntil: 'domcontentloaded', timeout: 120_000 })
  // A dev server configured for another stack must fail before any fixture upload.
  const api = await page.request.get(new URL('/__supabase/rest/v1/ingredients?select=name&limit=1', appUrl).href, { headers: { apikey: status.ANON_KEY } })
  assert.equal(api.status(), 200, 'The app must proxy local Supabase')
  assert.equal((await api.json())[0]?.name, ingredient.data.name, 'The app must use the same local stack')
  await page.getByRole('button', { name: 'Ajouter ma recette', exact: true }).click({ timeout: 60_000 })
  await page.getByLabel('Nom de la recette', { exact: true }).fill(title)
  await page.getByLabel('Ingrédient 1', { exact: true }).fill(ingredient.data.name)
  await page.getByLabel('Préparation', { exact: false }).fill('Préparer les ingrédients puis servir.')
  const photoInput = page.getByLabel('Photo (facultative', { exact: false })
  await photoInput.setInputFiles({ name: 'fixture.heic', mimeType: 'image/heic', buffer: png })
  await page.getByRole('alert').filter({ hasText: 'Choisis une image JPG, PNG ou WebP' }).waitFor()
  assert.equal(await photoInput.inputValue(), '')
  await photoInput.setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(5242881) })
  await page.getByRole('alert').filter({ hasText: 'Choisis une image JPG, PNG ou WebP' }).waitFor()
  assert.equal(await photoInput.inputValue(), '')
  await photoInput.setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: png })
  await page.getByAltText('Aperçu de ta recette', { exact: true }).waitFor()
  const submit = page.getByRole('button', { name: 'Enregistrer et soumettre', exact: true })
  await page.evaluate(() => { window.__failPhotoRead = true })
  await submit.click()
  await page.getByRole('alert').filter({ hasText: 'référence : photo/lecture' }).waitFor()
  await page.evaluate(() => { window.__failPhotoRead = false })
  const uploadPattern = '**/__supabase/storage/v1/object/recipe-photos/**'
  await page.route(uploadPattern, route => route.request().method() === 'POST'
    ? route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ statusCode: '403', error: 'AccessDenied', message: 'fixture details must stay private' }) })
    : route.fallback())
  await submit.click()
  await page.getByRole('alert').filter({ hasText: 'référence : photo/' }).waitFor()
  assert.equal(await page.getByLabel('Nom de la recette', { exact: true }).inputValue(), title)
  assert.ifError((await owner.from('recipes').select('id').eq('nom', title)).error)
  assert.equal((await owner.from('recipes').select('id').eq('nom', title)).data.length, 0)
  await page.unroute(uploadPattern)
  const savePattern = '**/__supabase/rest/v1/rpc/submit_recipe'
  await page.route(savePattern, route => route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ code: '42501', message: 'fixture details must stay private' }) }))
  await submit.click()
  await page.getByRole('alert').filter({ hasText: 'référence : recette/42501' }).waitFor()
  assert.equal(await page.getByLabel('Nom de la recette', { exact: true }).inputValue(), title)
  assert.equal(await page.getByText('fixture details must stay private', { exact: false }).count(), 0)
  const afterFailure = await admin.storage.from('recipe-photos').list(userId)
  assert.ifError(afterFailure.error)
  assert.equal(afterFailure.data.length, 0, 'An uploaded photo must be cleaned up when saving fails')
  await page.unroute(savePattern)
  await submit.click()
  await page.getByRole('dialog').waitFor({ state: 'hidden', timeout: 60_000 })
  const saved = await owner.from('recipes').select('id,created_by,moderation_status,image_path').eq('nom', title).single()
  assert.ifError(saved.error)
  assert.equal(saved.data.created_by, userId)
  assert.equal(saved.data.moderation_status, 'pending')
  assert.ok(saved.data.image_path.startsWith(`${userId}/`))
  const signed = await owner.storage.from('recipe-photos').createSignedUrl(saved.data.image_path, 60)
  assert.ifError(signed.error)
  assert.equal((await fetch(signed.data.signedUrl)).status, 200)
  assert.deepEqual(Buffer.from(await (await fetch(signed.data.signedUrl)).arrayBuffer()), png, 'The stored image must contain the complete original bytes')
  await page.reload({ waitUntil: 'domcontentloaded' })
  const card = page.locator('article').filter({ hasText: title })
  await card.getByRole('button', { name: 'Voir la recette', exact: true }).click({ timeout: 60_000 })
  const image = page.getByRole('img', { name: title, exact: true })
  await image.waitFor()
  await image.evaluate(img => img.decode())
  assert.deepEqual(errors, [])
  console.log(`PASS: ${mobile ? 'Android Chrome emulation' : 'desktop'}, regular author, invalid format/size, unreadable gallery file, upload/save refusals, cleanup, fields preserved, retry, original photo bytes readable after reload; no page errors.`)
} finally {
  await browser?.close()
  if (userId) {
    assert.ifError((await admin.from('recipes').delete().eq('created_by', userId)).error)
    const files = await admin.storage.from('recipe-photos').list(userId)
    assert.ifError(files.error)
    if (files.data.length) assert.ifError((await admin.storage.from('recipe-photos').remove(files.data.map(file => `${userId}/${file.name}`))).error)
    assert.ifError((await admin.auth.admin.deleteUser(userId)).error)
    console.log('PASS: fixture recipes, photos and account removed.')
  }
}
