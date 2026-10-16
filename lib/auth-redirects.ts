export const PRODUCTION_ORIGIN = 'https://recipe-app-alpha-wine.vercel.app'

/** Only deployment configuration can allow a preview; never trust a query parameter. */
export function authReturnUrl(path: '/auth/complete' | '/auth/reset-password', origin: string,
  configured = process.env.NEXT_PUBLIC_SITE_URL, development = process.env.NODE_ENV === 'development') {
  const current = new URL(origin)
  const allowed = new URL(configured || PRODUCTION_ORIGIN)
  if (allowed.username || allowed.password || allowed.origin !== (configured || PRODUCTION_ORIGIN).replace(/\/$/, '')) throw new Error('URL du site invalide')
  const local = development && ['localhost', '127.0.0.1'].includes(current.hostname) && ['http:', 'https:'].includes(current.protocol)
  if (!local && (current.protocol !== 'https:' || current.origin !== allowed.origin)) throw new Error('Cet environnement ne permet pas la connexion. Ouvre le site officiel.')
  return `${current.origin}${path}`
}
