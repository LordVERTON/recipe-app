import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { createClient } from '@supabase/supabase-js'

const env = parseEnv(readFileSync('.env.development.local', 'utf8'))
const api = new URL(env.NEXT_PUBLIC_SUPABASE_URL)
const app = new URL(process.env.TEST_APP_URL || 'http://127.0.0.1:3000')
for (const url of [api, app]) assert.ok(['localhost', '127.0.0.1'].includes(url.hostname))
const inbox = 'http://127.0.0.1:54324'
const options = { auth: { persistSession: false, autoRefreshToken: false } }
const admin = createClient(api.href, env.SUPABASE_SERVICE_ROLE_KEY, options)
const client = createClient(api.href, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options)
const { chromium, devices } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ headless: true })
const mailIds = []
const users = []
const emails = []
const request = async (path, init) => {
  const response = await fetch(`${inbox}${path}`, { ...init, signal: AbortSignal.timeout(10000) })
  assert.ok(response.ok, 'Local Mailpit request failed')
  return response
}
try {
  for (const [name, device] of [['desktop', { viewport: { width: 1440, height: 1000 } }], ['mobile', devices['Pixel 7']]]) {
    const email = `recovery-browser-${crypto.randomUUID()}@example.com`
    emails.push(email)
    const password = `Aa1!${crypto.randomUUID()}`
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    assert.ifError(created.error); users.push(created.data.user.id)
    const context = await browser.newContext(device)
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', () => errors.push('pageerror'))
    await page.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort())
    await page.goto(new URL('/privacy', app).href)
    await page.getByRole('heading', { name: 'Confidentialité et données personnelles', exact: true }).waitFor()
    assert.ok(!(await page.locator('main').innerText()).match(/Mailjet|Turnstile|Google OAuth/))
    await page.goto(new URL('/auth/reset-password', app).href)
    await page.getByRole('status').filter({ hasText: 'Lien invalide' }).waitFor()
    assert.equal(await page.locator('input[type=password]').count(), 0)
    await page.goto(`${app.href}#error=access_denied&error_code=otp_expired`)
    await page.getByRole('status').filter({ hasText: 'Lien invalide' }).waitFor()
    assert.equal(new URL(page.url()).hash, '')
    await page.goto(new URL('/?account=1', app).href)
    await page.getByRole('button', { name: 'Mot de passe oublié ?', exact: true }).click()
    await page.getByLabel('Adresse e-mail', { exact: true }).fill(email)
    await page.getByRole('button', { name: 'Demander un lien', exact: true }).click()
    await page.getByRole('status').filter({ hasText: 'Si un compte correspond' }).waitFor()
    await page.getByRole('button', { name: 'Demander un lien', exact: true }).click()
    await page.getByRole('status').filter({ hasText: 'Patiente une minute' }).waitFor()
    let mailId
    for (let attempt = 0; attempt < 20; attempt++) {
      const result = await (await request(`/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`)).json()
      mailId = result.messages?.find(mail => mail.To.some(to => to.Address === email))?.ID
      if (mailId) break
      await new Promise(resolve => setTimeout(resolve, 250))
    }
    assert.ok(mailId, 'Recovery email must arrive in local Mailpit'); mailIds.push(mailId)
    const mail = await (await request(`/api/v1/message/${mailId}`)).json()
    const link = [...mail.HTML.matchAll(/href="([^"]+)"/g)].map(match => new URL(match[1].replaceAll('&amp;', '&'))).find(url => url.pathname === '/auth/v1/verify')
    assert.ok(link); assert.equal(link.origin, api.origin)
    assert.equal(link.searchParams.get('type'), 'recovery')
    // Consume the real emailed link without logging it or its session fragment.
    try { await page.goto(link.href, { waitUntil: 'domcontentloaded' }) } catch { throw Error('Local recovery navigation failed') }
    await page.getByLabel('Nouveau mot de passe', { exact: true }).waitFor()
    assert.equal(new URL(page.url()).hash, '')
    const nextPassword = `Bb2!${crypto.randomUUID()}`
    await page.getByLabel('Nouveau mot de passe', { exact: true }).fill(nextPassword)
    await page.getByLabel('Confirmer le mot de passe', { exact: true }).fill('different-password')
    await page.getByRole('button', { name: 'Enregistrer le mot de passe', exact: true }).click()
    await page.getByRole('status').filter({ hasText: 'ne correspondent pas' }).waitFor()
    await page.getByLabel('Confirmer le mot de passe', { exact: true }).fill(nextPassword)
    await page.getByRole('button', { name: 'Enregistrer le mot de passe', exact: true }).click()
    await page.getByRole('status').filter({ hasText: 'Mot de passe modifié' }).waitFor()
    assert.ok((await client.auth.signInWithPassword({ email, password })).error)
    assert.ifError((await client.auth.signInWithPassword({ email, password: nextPassword })).error)
    await client.auth.signOut()
    await page.getByRole('link', { name: 'Retour à mon espace', exact: true }).click()
    await page.getByLabel('Adresse e-mail', { exact: true }).waitFor()
    await page.getByLabel('Adresse e-mail', { exact: true }).fill(email)
    await page.getByLabel('Mot de passe', { exact: true }).fill(nextPassword)
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click()
    await page.getByRole('button', { name: 'Se déconnecter', exact: true }).waitFor()
    await page.goto(new URL('/auth/reset-password', app).href)
    await page.getByRole('status').filter({ hasText: 'Lien invalide' }).waitFor()
    assert.equal(await page.locator('input[type=password]').count(), 0, 'Ordinary stored session must not open recovery')
    const reused = await fetch(link.href, { redirect: 'manual' })
    const redirect = new URL(reused.headers.get('location'))
    assert.ok(new URLSearchParams(redirect.hash.slice(1)).has('error'), 'Used recovery link must fail')
    assert.deepEqual(errors, [])
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    console.log(`PASS ${name}: privacy, absent/ordinary recovery session rejected, invalid root callback scrubbed, forgotten-password UI, real Mailpit recovery link, cooldown, mismatch, password change, new login, reused link rejected, zero JS errors.`)
    await context.close()
  }
} finally {
  await browser.close()
  for (const userId of users) assert.ifError((await admin.auth.admin.deleteUser(userId)).error)
  // Include any additional mail generated by the test; never clear the inbox.
  for (const email of emails) {
    const result = await (await request(`/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`)).json()
    for (const mail of result.messages ?? []) if (mail.To.some(to => to.Address === email)) mailIds.push(mail.ID)
  }
  if (mailIds.length) await request('/api/v1/messages', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ IDs: [...new Set(mailIds)] }) })
}
