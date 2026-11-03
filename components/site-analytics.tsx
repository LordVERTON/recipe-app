'use client'

import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { hasRecoverySession, hasRecoveryCallback } from '@/lib/auth-recovery-state'

export function SiteAnalytics() {
  const pathname = usePathname()
  // Exclude recovery callbacks, including the root fallback used by Auth.
  const authFragment = typeof window !== 'undefined' && /(?:access_token|refresh_token|type=recovery|error_code)=?/.test(window.location.hash)
  return process.env.NODE_ENV === 'production' && !pathname.startsWith('/auth/') && !authFragment && !hasRecoverySession() && !hasRecoveryCallback()
    ? <Analytics /> : null
}
