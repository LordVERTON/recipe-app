import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { createClient } from '@supabase/supabase-js'

// Never load Cloud credentials. All test data is removed in finally.
const env = parseEnv(readFileSync('.env.development.local', 'utf8'))
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname))
const origin = new URL(process.argv[2] || 'http://localhost:3000')
assert.ok(['127.0.0.1', 'localhost'].includes(origin.hostname), 'Only test a local Next.js server')
const options = { auth: { persistSession: false, autoRefreshToken: false } }
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, options)
const client = createClient(`${origin.origin}/__supabase`, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options)
const email = `local-auth-${crypto.randomUUID()}@example.com`
const password = `${crypto.randomUUID()}Aa1!`
let userId
let photoPath
try {
  const guest = await client.from('recipes').select('id').limit(1)
  assert.ifError(guest.error)
  assert.ok(guest.data.length, 'Local seed should contain recipes')
  const signup = await client.auth.signUp({ email, password, options: { emailRedirectTo: origin.origin } })
  assert.ifError(signup.error)
  userId = signup.data.user?.id
  assert.ok(userId)
  assert.ok(signup.data.session, 'This check expects local email auto-confirmation')
  assert.ifError((await client.auth.signOut()).error)
  const login = await client.auth.signInWithPassword({ email, password })
  assert.ifError(login.error)
  assert.equal(login.data.user.id, userId)
  assert.ifError((await client.auth.refreshSession()).error)
  const user = await client.auth.getUser()
  assert.ifError(user.error)
  assert.equal(user.data.user.id, userId)
  assert.ifError((await client.from('recipes').select('id').limit(1)).error)
  const role = await client.rpc('is_recipe_admin')
  assert.ifError(role.error)
  assert.equal(role.data, false)
  photoPath = `${userId}/proxy-test.png`
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')
  assert.ifError((await client.storage.from('recipe-photos').upload(photoPath, png, { contentType: 'image/png' })).error)
  const signed = await client.storage.from('recipe-photos').createSignedUrl(photoPath, 60)
  assert.ifError(signed.error)
  assert.ok(signed.data.signedUrl.startsWith(`${origin.origin}/__supabase/`))
  assert.equal((await fetch(signed.data.signedUrl, { signal: AbortSignal.timeout(15000) })).status, 200)
  assert.ifError((await client.auth.signOut()).error)
  console.log('PASS: local catalogue, signup, login, token refresh, user, role, photo upload/read and logout through Next.js.')
} finally {
  if (photoPath) assert.ifError((await admin.storage.from('recipe-photos').remove([photoPath])).error)
  if (userId) assert.ifError((await admin.auth.admin.deleteUser(userId)).error)
}
