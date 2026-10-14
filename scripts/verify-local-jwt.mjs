import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { createClient } from '@supabase/supabase-js'
import { confirmLocalTestSignup } from './confirm-local-test-signup.mjs'

// Exercise real Auth-issued JWTs; anonymous keys alone cannot expose this bug.
// Only local credentials are loaded. No existing account is modified.
const env = parseEnv(readFileSync('.env.development.local', 'utf8'))
const url = new URL(env.NEXT_PUBLIC_SUPABASE_URL)
assert.ok(['127.0.0.1', 'localhost'].includes(url.hostname), 'Local Supabase only')
const endpoint = process.argv[2] ? new URL('/__supabase', process.argv[2]) : url
assert.ok(['127.0.0.1', 'localhost'].includes(endpoint.hostname), 'Local proxy only')
const options = { auth: { persistSession: false, autoRefreshToken: false } }
const admin = createClient(url.href, env.SUPABASE_SERVICE_ROLE_KEY, options)
const client = createClient(endpoint.href, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options)
const email = `jwt-check-${crypto.randomUUID()}@example.com`
const password = `${crypto.randomUUID()}Aa1!`
let userId

async function checkCatalogue() {
  const result = await client.from('recipes').select('id').limit(1)
  assert.ifError(result.error)
  assert.ok(result.data.length, 'Expected seeded recipes')
}

try {
  await checkCatalogue()
  const signup = await client.auth.signUp({ email, password })
  assert.ifError(signup.error)
  userId = signup.data.user?.id
  assert.ok(userId)
  await confirmLocalTestSignup({ admin, client, email, password, signup })
  await checkCatalogue()
  assert.ifError((await client.auth.signOut()).error)
  assert.ifError((await client.auth.signInWithPassword({ email, password })).error)
  await checkCatalogue()
  for (let i = 0; i < 5; i++) {
    // No delay or retry: REST must accept the freshly issued token immediately.
    assert.ifError((await client.auth.refreshSession()).error)
    await Promise.all([checkCatalogue(), checkCatalogue(), checkCatalogue()])
    const role = await client.rpc('is_recipe_admin')
    assert.ifError(role.error)
    assert.equal(role.data, false)
  }
  assert.ifError((await client.auth.signOut()).error)
  console.log('PASS: guest catalogue, email confirmation required, confirmation and login JWTs, 5 fresh JWTs, 15 concurrent catalogue reads, role checks and logout.')
} finally {
  if (userId) {
    assert.ifError((await admin.auth.admin.deleteUser(userId)).error)
    console.log('Temporary local account removed.')
  }
}
