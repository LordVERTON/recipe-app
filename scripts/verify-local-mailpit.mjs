import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { createClient } from '@supabase/supabase-js'

const env = parseEnv(readFileSync('.env.development.local', 'utf8'))
const base = new URL(env.NEXT_PUBLIC_SUPABASE_URL)
assert.ok(['localhost', '127.0.0.1'].includes(base.hostname), 'Only local Supabase is allowed')
const inbox = 'http://127.0.0.1:54324'
const options = { auth: { persistSession: false, autoRefreshToken: false } }
const client = createClient(base.href, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options)
const admin = createClient(base.href, env.SUPABASE_SERVICE_ROLE_KEY, options)
const email = `mailpit-${crypto.randomUUID()}@example.com`
const password = `${crypto.randomUUID()}Aa1!`
let userId
let messageId
const request = async (path, init) => {
  const response = await fetch(`${inbox}${path}`, { ...init, signal: AbortSignal.timeout(10000) })
  assert.ok(response.ok, `Mailpit returned ${response.status}`)
  return response
}

try {
  const signup = await client.auth.signUp({ email, password, options: { emailRedirectTo: 'http://localhost:3000' } })
  assert.ifError(signup.error)
  userId = signup.data.user?.id
  assert.ok(userId)
  assert.equal(signup.data.session, null, 'Signup must require email confirmation')
  const blocked = await client.auth.signInWithPassword({ email, password })
  assert.equal(blocked.error?.code, 'email_not_confirmed')
  for (let attempt = 0; attempt < 20; attempt++) {
    const result = await (await request(`/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`)).json()
    messageId = result.messages?.find(message => message.To.some(to => to.Address === email))?.ID
    if (messageId) break
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  assert.ok(messageId, 'Confirmation email must arrive in Mailpit')
  const message = await (await request(`/api/v1/message/${messageId}`)).json()
  const links = [...message.HTML.matchAll(/href="([^"]+)"/g)].map(match => new URL(match[1].replaceAll('&amp;', '&')))
  const confirmation = links.find(url => url.pathname === '/auth/v1/verify')
  assert.ok(confirmation, 'Email must contain the Supabase confirmation link')
  assert.equal(confirmation.origin, base.origin, 'Confirmation must target local Auth')
  const response = await fetch(confirmation, { redirect: 'manual', signal: AbortSignal.timeout(10000) })
  assert.equal(response.status, 303)
  const redirect = new URL(response.headers.get('location'))
  assert.equal(redirect.origin, 'http://localhost:3000')
  assert.ok(new URLSearchParams(redirect.hash.slice(1)).get('access_token'), 'Confirmation must create a session')
  const login = await client.auth.signInWithPassword({ email, password })
  assert.ifError(login.error)
  assert.equal(login.data.user.id, userId)
  assert.ok(login.data.user.email_confirmed_at)
  assert.ifError((await client.auth.signOut()).error)
  console.log('PASS: signup, blocked login, Mailpit email delivery, real confirmation link, local redirect and login.')
} finally {
  try {
    if (userId) assert.ifError((await admin.auth.admin.deleteUser(userId)).error)
  } finally {
    if (messageId) await request('/api/v1/messages', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ IDs: [messageId] }),
    })
  }
}
