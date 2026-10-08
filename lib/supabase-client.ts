import { createClient } from '@supabase/supabase-js'

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
