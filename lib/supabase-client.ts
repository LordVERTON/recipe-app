import { createClient } from '@supabase/supabase-js'
import { hasRecoveryCallback, recordRecoverySession } from './auth-recovery-state'
export { hasRecoveryCallback, hasRecoverySession, isRecoverySession } from './auth-recovery-state'

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const localProxy = process.env.NODE_ENV === 'development'
  && process.env.NEXT_PUBLIC_SUPABASE_LOCAL_PROXY === 'true'
const url = localProxy && typeof window !== 'undefined'
  ? `${window.location.origin}/__supabase`
  : configuredUrl
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key, {
  // Keep local sessions separate from Cloud and stable across LAN addresses.
  ...(localProxy ? { auth: { storageKey: 'broco-chou-supabase-local-auth' } } : {}),
}) : null

// Normal session initialization stays with AccountProvider. Subscribe early
// only on a recovery callback, so ordinary navigation adds no Auth listener.
if (hasRecoveryCallback()) {
  supabase?.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') recordRecoverySession(session?.access_token)
    else if (event === 'SIGNED_OUT' || event === 'SIGNED_IN' || event === 'USER_UPDATED') recordRecoverySession(undefined)
  })
}
