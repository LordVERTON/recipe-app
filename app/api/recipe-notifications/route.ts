import { notificationDatabase, sendRecipeNotifications } from '@/lib/recipe-notifications'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
    if (!token) return Response.json({ error: 'Connexion requise' }, { status: 401 })
    const db = notificationDatabase()
    const { data: { user }, error } = await db.auth.getUser(token)
    if (error || !user) return Response.json({ error: 'Connexion requise' }, { status: 401 })
    const body = await request.json().catch(() => null)
    if (typeof body?.recipeId !== 'string' || body.recipeId.length > 100) return Response.json({ error: 'Recette invalide' }, { status: 400 })
    const { data: recipe } = await db.from('recipes').select('created_by').eq('id', body.recipeId).single()
    if (!recipe || recipe.created_by !== user.id) return Response.json({ error: 'Accès refusé' }, { status: 403 })
    const result = await sendRecipeNotifications(body.recipeId)
    return Response.json(result, { status: result.failed ? 503 : 200 })
  } catch {
    return Response.json({ error: 'Invitation conservée en attente d’envoi' }, { status: 503 })
  }
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Accès refusé' }, { status: 401 })
  }
  try {
    const result = await sendRecipeNotifications()
    return Response.json(result, { status: result.failed ? 503 : 200 })
  } catch { return Response.json({ error: 'Envoi indisponible' }, { status: 503 }) }
}
