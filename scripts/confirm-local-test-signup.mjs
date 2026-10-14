import assert from 'node:assert/strict'

// Test-only helper: consume a real Supabase confirmation token without reading
// the inbox. This checks Auth confirmation, not email delivery or browser redirects.
export async function confirmLocalTestSignup({ admin, client, email, password, signup }) {
  assert.equal(signup.data.session, null, 'Email confirmation must be enabled')
  assert.ok(!signup.data.user.email_confirmed_at, 'Signup must start unconfirmed')
  const blocked = await client.auth.signInWithPassword({ email, password })
  assert.equal(blocked.error?.code, 'email_not_confirmed', 'Login must fail before confirmation')
  assert.equal(blocked.data.session, null)

  const confirmation = await admin.auth.admin.generateLink({ type: 'signup', email, password })
  assert.ifError(confirmation.error)
  assert.equal(confirmation.data.user.id, signup.data.user.id)
  assert.ok(confirmation.data.properties.hashed_token)
  const verified = await client.auth.verifyOtp({
    token_hash: confirmation.data.properties.hashed_token,
    type: 'signup',
  })
  assert.ifError(verified.error)
  assert.ok(verified.data.user?.email_confirmed_at)
  assert.ok(verified.data.session)
  assert.equal(verified.data.user.id, signup.data.user.id)
}
