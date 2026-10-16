import { createHash } from 'node:crypto'

export function notificationTransport(env: NodeJS.ProcessEnv = process.env, request: typeof fetch = fetch) {
  const local = env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(new URL(env.NEXT_PUBLIC_SUPABASE_URL || 'https://invalid.invalid').hostname)
  if (!local && (env.RECIPE_NOTIFICATION_EMAIL_ENABLED !== 'true' || env.VERCEL_ENV === 'preview')) throw new Error('Notifications désactivées')
  const from = local ? 'notifications@example.test' : env.MAILJET_FROM_EMAIL
  const to = local ? 'admin@example.test' : env.RECIPE_REVIEW_NOTIFICATION_TO
  if (!from || !to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)
    || (!local && (!env.MAILJET_API_KEY || !env.MAILJET_SECRET_KEY))) throw new Error('Configuration e-mail incomplète')
  return async (id: string, name: string) => {
    const link = `${local ? 'http://localhost:3000' : 'https://recipe-app-alpha-wine.vercel.app'}/?review=${encodeURIComponent(id)}`
    const message = { From: { Email: from, Name: 'Broco-Chou' }, To: [{ Email: to }], Subject: 'Nouvelle recette à valider' }
    const text = `Une nouvelle recette attend votre validation : ${name}\n\nConnectez-vous à votre compte administrateur pour l’examiner.\n${link}`
    const response = await request(local ? 'http://127.0.0.1:54324/api/v1/send' : 'https://api.mailjet.com/v3.1/send', {
      method: 'POST', signal: AbortSignal.timeout(10_000), headers: { 'Content-Type': 'application/json',
        ...(!local ? { Authorization: `Basic ${Buffer.from(`${env.MAILJET_API_KEY}:${env.MAILJET_SECRET_KEY}`).toString('base64')}` } : {}) },
      body: JSON.stringify(local ? { ...message, Text: text } : { Messages: [{ ...message, TextPart: text,
        CustomCampaign: `recipe-review-${createHash('sha256').update(`${env.NEXT_PUBLIC_SUPABASE_URL}:${id}`).digest('hex')}`,
        DeduplicateCampaign: true, TrackOpens: 'disabled', TrackClicks: 'disabled' }] }),
    })
    if (!response.ok) throw new Error('Échec du transport e-mail')
    if (!local) {
      const body = await response.json()
      if (body.Messages?.length !== 1 || body.Messages[0].Status !== 'success') throw new Error('Message non accepté')
    }
  }
}
