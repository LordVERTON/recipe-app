'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toPersonalRecipeFormData, validateRecipeDraft } from '@/lib/ocr/draft'
import type { ParsedRecipe } from '@/lib/ocr/types'

export function DraftEditor({ draft, onChange }: { draft: ParsedRecipe; onChange: (draft: ParsedRecipe) => void }) {
  const [reviewed, setReviewed] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [confirmed, setConfirmed] = useState<ReturnType<typeof toPersonalRecipeFormData> | null>(null)
  function change(next: ParsedRecipe) { setConfirmed(null); setReviewed(false); setErrors([]); onChange(next) }
  function field<K extends keyof ParsedRecipe>(key: K, value: ParsedRecipe[K]) {
    change({ ...draft, [key]: value, origins: { ...draft.origins, [key]: 'manual' } })
  }
  return <section aria-labelledby="ocr-draft-title" className="space-y-5 rounded-2xl border bg-card p-4 sm:p-6">
    <h2 id="ocr-draft-title" className="text-xl font-semibold">Brouillon modifiable</h2>
    <details><summary className="cursor-pointer">Observations de l’analyse initiale ({draft.warnings.length})</summary><ul className="list-disc pl-5 text-sm">{draft.warnings.map(w => <li key={w}>{w}</li>)}</ul></details>
    <label className="block text-sm">Nom de la recette<Input value={draft.nom ?? ''} maxLength={150} onChange={e => field('nom', e.target.value)} /></label>
    <div><label htmlFor="ocr-description" className="block text-sm">Description</label><Textarea id="ocr-description" value={draft.description ?? ''} maxLength={2000} onChange={e => field('description', e.target.value)} /></div>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Portions<Input type="number" min={1} max={50} value={draft.servings ?? ''} placeholder="Inconnu" onChange={e => field('servings', e.target.value ? Number(e.target.value) : undefined)} /></label>
      <label className="text-sm">Durée totale (minutes)<Input type="number" min={1} max={1440} value={draft.estimatedTime ?? ''} placeholder="Inconnue" onChange={e => field('estimatedTime', e.target.value ? Number(e.target.value) : undefined)} /></label>
      <label className="text-sm">Préparation (minutes, facultatif)<Input type="number" min={0} max={1440} value={draft.preparationTime ?? ''} onChange={e => field('preparationTime', e.target.value ? Number(e.target.value) : undefined)} /></label>
      <label className="text-sm">Cuisson (minutes, facultatif)<Input type="number" min={0} max={1440} value={draft.cookingTime ?? ''} onChange={e => field('cookingTime', e.target.value ? Number(e.target.value) : undefined)} /></label>
      <div><label htmlFor="ocr-season" className="text-sm">Saison</label><select id="ocr-season" className="mt-1 min-h-11 w-full rounded-md border bg-background p-2" value={draft.saison ?? ''} onChange={e => field('saison', e.target.value as ParsedRecipe['saison'])}><option value="">À choisir</option>{['hiver', 'printemps', 'été', 'automne'].map(s => <option key={s}>{s}</option>)}</select></div>
      <div><label htmlFor="ocr-category" className="text-sm">Catégorie</label><select id="ocr-category" className="mt-1 min-h-11 w-full rounded-md border bg-background p-2" value={draft.categorie ?? ''} onChange={e => field('categorie', e.target.value as ParsedRecipe['categorie'])}><option value="">À choisir</option><option>salé</option><option>sucré</option></select></div>
      <div><label htmlFor="ocr-meal" className="text-sm">Type de repas</label><select id="ocr-meal" className="mt-1 min-h-11 w-full rounded-md border bg-background p-2" value={draft.tag ?? ''} onChange={e => field('tag', e.target.value as ParsedRecipe['tag'])}><option value="">À choisir</option><option value="dejeuner/diner">Déjeuner / dîner</option><option value="petit_dejeuner">Petit-déjeuner</option><option value="dessert">Dessert</option><option value="aperitif">Apéritif</option></select></div>
    </div>
    <h3 className="font-semibold">Ingrédients ({draft.ingredients.length}/60)</h3>
    {draft.ingredients.map((item, index) => <div key={index} className="space-y-2 rounded-xl border p-3">
      {item.group && <p className="text-sm font-semibold">{item.group}</p>}
      <label className="block text-sm">Ingrédient {index + 1}<Input value={item.name} maxLength={120} onChange={e => field('ingredients', draft.ingredients.map((i, j) => j === index ? { ...i, name: e.target.value } : i))} /></label>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">Quantité {index + 1}<Input value={item.quantity ?? ''} maxLength={40} placeholder="Non indiquée" onChange={e => field('ingredients', draft.ingredients.map((i, j) => j === index ? { ...i, quantity: e.target.value } : i))} /></label>
        <label className="text-sm">Unité {index + 1}<Input value={item.unit ?? ''} maxLength={30} onChange={e => field('ingredients', draft.ingredients.map((i, j) => j === index ? { ...i, unit: e.target.value } : i))} /></label>
      </div>
      {item.warnings.length > 0 && <ul className="list-disc pl-5 text-xs">{item.warnings.map(w => <li key={w}>{w}</li>)}</ul>}
      <Button variant="ghost" onClick={() => field('ingredients', draft.ingredients.filter((_, j) => j !== index))}>Retirer l’ingrédient {index + 1}</Button>
    </div>)}
    <Button variant="outline" disabled={draft.ingredients.length >= 60} onClick={() => field('ingredients', [...draft.ingredients, { name: '', warnings: [] }])}>Ajouter un ingrédient</Button>
    <h3 className="font-semibold">Préparation ({draft.instructions.length}/50)</h3>
    {draft.instructions.map((step, index) => <div key={index} className="space-y-1">
      <div><label htmlFor={`ocr-step-${index}`} className="block text-sm">Étape {index + 1}</label><Textarea id={`ocr-step-${index}`} value={step} maxLength={2000} onChange={e => field('instructions', draft.instructions.map((s, j) => j === index ? e.target.value : s))} /></div>
      <Button variant="ghost" onClick={() => field('instructions', draft.instructions.filter((_, j) => j !== index))}>Retirer l’étape {index + 1}</Button>
    </div>)}
    <Button variant="outline" disabled={draft.instructions.length >= 50} onClick={() => field('instructions', [...draft.instructions, ''])}>Ajouter une étape</Button>
    <details><summary className="cursor-pointer">Texte non classé et texte utilisé pour ce brouillon</summary><pre className="whitespace-pre-wrap break-words text-sm">{draft.unrecognized.join('\n')}</pre><pre className="whitespace-pre-wrap break-words text-sm">{draft.rawText}</pre></details>
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />J’ai relu les quantités, les étapes et les observations. Les données sont prêtes pour ce test local.</label>
    <Button disabled={!reviewed} onClick={() => {
      const problems = validateRecipeDraft(draft); setErrors(problems)
      setConfirmed(problems.length ? null : toPersonalRecipeFormData(draft))
    }}>Vérifier et confirmer le brouillon local</Button>
    {errors.length > 0 && <ul role="alert" className="list-disc pl-5 text-sm text-destructive">{errors.map(error => <li key={error}>{error}</li>)}</ul>}
    {confirmed && <div role="status" className="space-y-2 rounded-xl bg-secondary p-4"><p>Brouillon confirmé localement. Aucune recette enregistrée.</p><details><summary className="cursor-pointer">Contrat pour le futur formulaire</summary><pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(confirmed, null, 2)}</pre></details></div>}
  </section>
}
