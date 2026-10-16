'use client'

import { Turnstile } from '@marsidev/react-turnstile'

export const captchaRequired = process.env.NEXT_PUBLIC_TURNSTILE_REQUIRED === 'true' || Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

export function AuthCaptcha({ onToken }: { onToken: (token: string) => void }) {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!captchaRequired) return null
  if (!key) return <p role="alert">La protection de connexion est indisponible. Réessaie plus tard.</p>
  return <Turnstile siteKey={key} options={{ language: 'fr', size: 'flexible' }}
    onSuccess={onToken} onExpire={() => onToken('')} onError={() => onToken('')}
    onTimeout={() => onToken('')} />
}
