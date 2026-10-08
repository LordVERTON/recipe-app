"use client"

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase-client'
import { useAccount } from './account-provider'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

type Food = { id: string; name: string; aliases: string[] }
type Line = { id: string; name: string; quantity: string; unit: string }
const newLine = (): Line => ({ id: crypto.randomUUID(), name: '', quantity: '', unit: '' })
const normalize = (s: string) => s.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ')
const selectStyle = 'mt-1 min-h-10 w-full rounded-md border border-input bg-background px-3 text-sm'

export function PersonalRecipeForm({ onSaved, onCancel, onBusyChange }: { onSaved: () => void; onCancel: () => void; onBusyChange: (busy: boolean) => void }) {
  const { user, refresh } = useAccount()
  const [lines, setLines] = useState<Line[]>(() => [newLine()])
  const [foods, setFoods] = useState<Food[]>([])
  const [foodError, setFoodError] = useState(false)
  const [foodAttempt, setFoodAttempt] = useState(0)
  const [photo, setPhoto] = useState<File | null>(null)
  const photoInput = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      if (!supabase) return
      try {
        const rows: Food[] = []
        for (let offset = 0; ; offset += 500) {
          const { data, error } = await supabase.from('ingredients').select('id,name,aliases').order('id').range(offset, offset + 499)
          if (error) throw error
          rows.push(...data)
          if (data.length < 500) break
        }
        if (active) { setFoods(rows); setFoodError(false) }
      } catch { if (active) setFoodError(true) }
    }
    void load()
    return () => { active = false }
  }, [foodAttempt])

  useEffect(() => {
    if (!photo) { setPreview(''); return }
    const url = URL.createObjectURL(photo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  function update(id: string, field: keyof Omit<Line, 'id'>, value: string) {
    setLines(current => current.map(line => line.id === id ? { ...line, [field]: value } : line))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !user || busy) return
    const form = new FormData(event.currentTarget)
    if (String(form.get('nom')).trim().length < 2 || lines.some(line => !line.name.trim())) {
      setError('Indique un nom de recette et un nom pour chaque ingrédient.'); return
    }
    const instructions = String(form.get('instructions')).split('\n').map(s => s.trim()).filter(Boolean)
    if (!instructions.length || instructions.length > 50 || instructions.some(step => step.length > 2000)) {
      setError('Ajoute entre 1 et 50 étapes, de 2 000 caractères maximum chacune.'); return
    }
    setBusy(true)
    onBusyChange(true)
    setError('')
    let path: string | undefined
    let saved = false
    try {
      if (photo) {
        const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
        if (!extensions[photo.type] || photo.size > 5 * 1024 * 1024) throw new Error('Image : choisis un fichier JPG, PNG ou WebP de 5 Mo maximum.')
        path = `${user.id}/${crypto.randomUUID()}.${extensions[photo.type]}`
        const { error } = await supabase.storage.from('recipe-photos').upload(path, photo, { contentType: photo.type })
        if (error) throw new Error('L’envoi de l’image a échoué. Réessaie.')
      }
      const { error } = await supabase.rpc('submit_recipe', { payload: {
        nom: String(form.get('nom')).trim(), description: String(form.get('description')).trim(),
        saison: form.get('saison'), tag: form.get('tag'), categorie: form.get('categorie'),
        servings: Number(form.get('servings')), estimated_time: Number(form.get('estimated_time')),
        ingredients: lines.map(({ name, quantity, unit }) => ({ name: name.trim(), quantity: quantity.trim(), unit: unit.trim() })),
        instructions, image_path: path,
      } })
      if (error) throw new Error('La recette n’a pas pu être enregistrée. Vérifie les champs et réessaie.')
      saved = true
      await refresh()
      onSaved()
    } catch (error) {
      if (path && !saved) {
        // Cleanup must not hide the save error if the network is unavailable.
        try { await supabase.storage.from('recipe-photos').remove([path]) } catch { /* Retry the submission after reconnecting. */ }
      }
      setError(error instanceof Error ? error.message : 'Enregistrement impossible. Réessaie.')
    } finally { setBusy(false); onBusyChange(false) }
  }

  return <form onSubmit={submit} className="space-y-5">
    <h3 className="text-lg font-semibold">Ma nouvelle recette</h3>
    <p className="text-sm text-warm-gray">Les quantités sont indiquées pour le nombre de portions choisi. Ta recette restera privée jusqu’à sa validation.</p>
    <fieldset disabled={busy} className="space-y-4">
      <label className="block text-sm">Nom de la recette<Input name="nom" required minLength={2} maxLength={150} /></label>
      <label className="block text-sm">Description<Textarea name="description" maxLength={2000} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Portions<Input name="servings" type="number" min={1} max={50} defaultValue={1} required /></label>
        <label className="text-sm">Durée (minutes)<Input name="estimated_time" type="number" min={1} max={1440} defaultValue={30} required /></label>
        <label className="text-sm">Saison<select className={selectStyle} name="saison" defaultValue="automne"><option value="hiver">Hiver</option><option value="printemps">Printemps</option><option value="été">Été</option><option value="automne">Automne</option></select></label>
        <label className="text-sm">Catégorie<select className={selectStyle} name="categorie"><option value="salé">Salé</option><option value="sucré">Sucré</option></select></label>
        <label className="col-span-2 text-sm">Type de repas<select className={selectStyle} name="tag" defaultValue="dejeuner/diner"><option value="dejeuner/diner">Déjeuner / dîner</option><option value="petit_dejeuner">Petit-déjeuner</option><option value="dessert">Dessert</option><option value="aperitif">Apéritif</option></select></label>
      </div>
      <label className="block text-sm">Photo (facultative, 5 Mo maximum)<Input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
        const file = event.target.files?.[0] ?? null
        if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5242880)) {
          setError('Choisis une image JPG, PNG ou WebP de 5 Mo maximum.'); event.target.value = ''; setPhoto(null); return
        }
        setError(''); setPhoto(file)
      }} /></label>
      {preview && <div><Image src={preview} alt="Aperçu de ta recette" width={480} height={240} unoptimized className="max-h-48 rounded-xl object-cover" /><Button type="button" variant="ghost" onClick={() => { setPhoto(null); if (photoInput.current) photoInput.current.value = ''; }}>Retirer la photo</Button></div>}
      <div className="space-y-3">
        <h4 className="font-semibold">Ingrédients</h4>
        <p className="text-sm text-warm-gray">Choisis un nom générique proposé (par exemple « tomate ») ou saisis un nouvel aliment. Il sera ajouté au catalogue lors de l’enregistrement.</p>
        {foodError && <p role="status" className="text-sm">Suggestions indisponibles, la saisie manuelle reste possible. <button type="button" className="underline" onClick={() => setFoodAttempt(n => n + 1)}>Réessayer</button></p>}
        {lines.map((line, index) => {
          const query = normalize(line.name)
          const suggestions = foods.filter(food => normalize(food.name).includes(query) || food.aliases?.some(alias => normalize(alias).includes(query))).slice(0, 20)
          const existing = foods.some(food => normalize(food.name) === query || food.aliases?.some(alias => normalize(alias) === query))
          return <div key={line.id} className="rounded-xl border p-3 space-y-2">
            <label className="block text-sm">Ingrédient {index + 1}<Input required maxLength={120} list={`foods-${line.id}`} value={line.name} onChange={e => update(line.id, 'name', e.target.value)} placeholder="Nom générique" /></label>
            <datalist id={`foods-${line.id}`}>{suggestions.map(food => <option key={food.id} value={food.name} />)}</datalist>
            {query && <p className="text-xs text-warm-gray">{existing ? 'Aliment déjà présent dans le catalogue' : 'Saisie manuelle : cet aliment sera ajouté s’il est nouveau'}</p>}
            <div className="grid grid-cols-2 gap-2">
              <label className="text-sm">Quantité<Input maxLength={40} value={line.quantity} onChange={e => update(line.id, 'quantity', e.target.value)} placeholder="200" /></label>
              <label className="text-sm">Unité<Input maxLength={30} value={line.unit} onChange={e => update(line.id, 'unit', e.target.value)} placeholder="g, ml, pièce…" /></label>
            </div>
            <Button type="button" variant="ghost" size="sm" disabled={lines.length === 1} onClick={() => setLines(current => current.filter(item => item.id !== line.id))}>Retirer cet ingrédient</Button>
          </div>
        })}
        <Button type="button" variant="outline" disabled={lines.length >= 60} onClick={() => setLines(current => [...current, newLine()])}>Ajouter un ingrédient</Button>
      </div>
      <label className="block text-sm">Préparation (une étape par ligne)<Textarea name="instructions" required rows={7} maxLength={50000} placeholder={'Faire chauffer la poêle.\nAjouter les ingrédients.'} /></label>
    </fieldset>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex flex-wrap gap-2"><Button disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer et soumettre'}</Button><Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Annuler</Button></div>
  </form>
}
