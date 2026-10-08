"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import type { Recipe } from '@/lib/types'
import { useAccount } from './account-provider'
import { RecipeAccount } from './recipe-account'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'

const labels = { pending: 'En attente de validation', approved: 'Publiée', rejected: 'Non publiée' }

export function PersonalRecipes({ onCreate, onView, onPlan }: { onCreate: () => void; onView: (recipe: Recipe) => void; onPlan: (recipe: Recipe) => void }) {
  const { user, isAdmin, recipes, error, refresh } = useAccount()
  const [authors, setAuthors] = useState<Record<string, string>>({})
  const [authorError, setAuthorError] = useState(false)
  useEffect(() => {
    let active = true
    if (isAdmin && supabase) {
      void supabase.rpc('recipe_submission_authors').then(({ data, error }) => {
        if (!active) return
        setAuthorError(!!error)
        setAuthors(Object.fromEntries((data ?? []).map((author: { user_id: string; email: string }) => [author.user_id, author.email])))
      })
    }
    return () => { active = false }
  }, [isAdmin, recipes])

  return <section className="mx-6 mb-6 space-y-5 rounded-2xl bg-card p-4 broco-chou-shadow">
    <h2 className="text-lg font-semibold">Mes recettes</h2>
    <RecipeAccount />
    {error && <p role="alert" className="text-sm">{error} <button className="underline" onClick={() => void refresh()}>Réessayer</button></p>}
    {user && <>
      <Button onClick={onCreate}>Ajouter ma recette</Button>
      <p className="text-xs text-warm-gray">Ton planning est enregistré sur cet appareil, séparément pour chaque compte.</p>
      {recipes.filter(recipe => recipe.createdBy === user.id).map(recipe => <article key={recipe.id} className="space-y-2 rounded-xl border p-3">
        <h3 className="font-medium">{recipe.nom}</h3>
        <p className="text-xs text-warm-gray">{labels[recipe.moderationStatus ?? 'approved']}</p>
        {recipe.moderationNote && <p className="text-sm">Message de l’administrateur : {recipe.moderationNote}</p>}
        <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => onView(recipe)}>Voir la recette</Button><Button size="sm" onClick={() => onPlan(recipe)}>Ajouter au planning</Button></div>
      </article>)}
      {!recipes.some(recipe => recipe.createdBy === user.id) && <p className="text-sm text-warm-gray">Tu n’as pas encore créé de recette.</p>}
    </>}
    {isAdmin && <div className="space-y-3 border-t pt-4">
      <h2 className="text-lg font-semibold">Validation des recettes</h2>
      {authorError && <p role="alert" className="text-sm">Les adresses des auteurs n’ont pas pu être chargées. <button className="underline" onClick={() => void refresh()}>Réessayer</button></p>}
      {recipes.filter(recipe => recipe.moderationStatus === 'pending').map(recipe => <ReviewRecipe key={recipe.id} recipe={recipe} author={authors[recipe.createdBy ?? ''] ?? recipe.createdBy ?? ''} onView={onView} />)}
      {!recipes.some(recipe => recipe.moderationStatus === 'pending') && <p className="text-sm text-warm-gray">Aucune recette à valider.</p>}
    </div>}
  </section>
}

function ReviewRecipe({ recipe, author, onView }: { recipe: Recipe; author: string; onView: (recipe: Recipe) => void }) {
  const { refresh } = useAccount()
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function review(decision: 'approved' | 'rejected') {
    if (!supabase || busy) return
    setBusy(true); setError('')
    try {
      const { error } = await supabase.rpc('review_recipe', { recipe_id: recipe.id, decision, note })
      if (error) throw error
      await refresh()
    } catch { setError('Validation impossible. Réessaie ou actualise la liste si cette recette a déjà été traitée.') }
    finally { setBusy(false) }
  }
  return <article className="space-y-3 rounded-xl border p-3">
    <h3 className="font-medium">{recipe.nom}</h3><p className="break-all text-sm">Créée par : {author}</p>
    <Button variant="outline" size="sm" onClick={() => onView(recipe)}>Examiner la recette</Button>
    <label className="block text-sm">Message à l’auteur (facultatif)<Textarea maxLength={1000} value={note} onChange={e => setNote(e.target.value)} /></label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => void review('approved')}>Valider et publier</Button><Button disabled={busy} variant="outline" onClick={() => void review('rejected')}>Ne pas publier</Button></div>
  </article>
}
