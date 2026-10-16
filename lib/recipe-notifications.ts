import { createClient } from '@supabase/supabase-js'

export function notificationDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Configuration serveur Supabase manquante')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function sendRecipeNotifications(targetId?: string) {
  const db = notificationDatabase()
  const local = process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname)
  // A local inbox must never silently replace production delivery.
  if (!local) throw new Error('Le service d’envoi en production doit être activé.')
  const { data: jobs, error } = await db.rpc('claim_recipe_notifications', { target_id: targetId ?? null })
  if (error) throw error
  let failed = 0
  for (const job of jobs ?? []) {
    try {
      const { data: recipe, error: recipeError } = await db.from('recipes').select('nom,moderation_status').eq('id', job.recipe_id).single()
      if (recipeError) throw recipeError
      if (recipe.moderation_status !== 'pending') continue
      const link = `http://localhost:3000/?review=${encodeURIComponent(job.recipe_id)}`
      const response = await fetch('http://127.0.0.1:54324/api/v1/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({ From: { Email: 'notifications@brocochou.com', Name: 'Broco-Chou' },
          To: [{ Email: 'admin@brocochou.com' }], Subject: 'Nouvelle recette à valider',
          Text: `Une nouvelle recette attend votre validation : ${recipe.nom}\n\nConnectez-vous à votre compte administrateur pour l’examiner, la modifier, la publier ou la refuser avec un commentaire.\n${link}` }),
      })
      if (!response.ok) throw new Error(`Mailpit HTTP ${response.status}`)
      const { error: updateError } = await db.from('recipe_review_notifications').update({ sent_at: new Date().toISOString(), last_error: null }).eq('recipe_id', job.recipe_id)
      if (updateError) throw updateError
    } catch {
      failed++
      await db.from('recipe_review_notifications').update({ last_error: 'Échec d’envoi, nouvelle tentative après cinq minutes.' }).eq('recipe_id', job.recipe_id)
    }
  }
  return { processed: jobs?.length ?? 0, failed }
}
