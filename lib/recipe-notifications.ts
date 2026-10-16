import { notificationTransport } from './notification-transport'
import { createClient } from '@supabase/supabase-js'

export function notificationDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Configuration serveur Supabase manquante')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function sendRecipeNotifications(targetId?: string) {
  const db = notificationDatabase()
  const send = notificationTransport() // Validate before reserving jobs.
  const { data: jobs, error } = await db.rpc('claim_recipe_notifications', { target_id: targetId ?? null })
  if (error) throw error
  let failed = 0
  for (const job of jobs ?? []) {
    try {
      const { data: recipe, error: recipeError } = await db.from('recipes').select('nom,moderation_status').eq('id', job.recipe_id).single()
      if (recipeError) throw recipeError
      if (recipe.moderation_status !== 'pending') continue
      await send(job.recipe_id, recipe.nom)
      const { error: updateError } = await db.from('recipe_review_notifications').update({ sent_at: new Date().toISOString(), last_error: null }).eq('recipe_id', job.recipe_id).eq('claimed_at', job.claimed_at)
      if (updateError) throw updateError
    } catch {
      failed++
      await db.from('recipe_review_notifications').update({ last_error: 'Échec d’envoi, nouvelle tentative après cinq minutes.' }).eq('recipe_id', job.recipe_id).eq('claimed_at', job.claimed_at)
    }
  }
  return { processed: jobs?.length ?? 0, failed }
}
