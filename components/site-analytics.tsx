'use client'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
export function SiteAnalytics() {
  const pathname = usePathname()
  return process.env.NODE_ENV === 'production' && !pathname.startsWith('/auth/') ? <Analytics /> : null
}
