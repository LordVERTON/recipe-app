"use client"

import { FormEvent, useState } from "react"

type Ingredient = { name: string; quantity?: string }
type Photo = { id: number; alt: string; url: string; photographer: string; photographer_url: string; src: { large: string } }

export default function RecipeImportPage() {
  const [sourceUrl, setSourceUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [title, setTitle] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [instructions, setInstructions] = useState<string[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [imageUrl, setImageUrl] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function extractRecipe(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    const response = await fetch("/api/recipe-import/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ caption }) })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) return setMessage(data.error)
    setTitle(data.title)
    setIngredients(data.ingredients)
    setInstructions(data.instructions)
    setMessage("Brouillon extrait. Corrigez les champs si nécessaire.")
  }

  async function findImages() {
    if (!title.trim()) return setMessage("Ajoutez un titre avant de chercher une image.")
    setLoading(true)
    const response = await fetch(`/api/recipe-import/images?query=${encodeURIComponent(title)}`)
    const data = await response.json()
    setLoading(false)
    if (!response.ok) return setMessage(data.error)
    setPhotos(data.photos)
  }

  async function saveRecipe() {
    setLoading(true)
    const response = await fetch("/api/recipe-import/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description: caption, sourceUrl, imageUrl, ingredients, instructions }) })
    const data = await response.json()
    setLoading(false)
    setMessage(response.ok ? `Recette enregistrée : ${data.recipe.nom}` : data.error)
  }

  return <main className="mx-auto min-h-screen max-w-4xl space-y-8 bg-background px-6 py-12 text-foreground">
    <div><h1 className="text-3xl font-bold">Importer une recette Instagram</h1><p className="mt-2 text-muted-foreground">Développement uniquement — collez la description d&apos;une publication ou d&apos;un Reel.</p></div>
    <form onSubmit={extractRecipe} className="space-y-4 rounded-xl border p-5">
      <label className="block text-sm font-medium">URL Instagram<input required type="url" value={sourceUrl} onChange={event => setSourceUrl(event.target.value)} placeholder="https://www.instagram.com/p/..." className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <label className="block text-sm font-medium">Description de la publication<textarea required value={caption} onChange={event => setCaption(event.target.value)} rows={12} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <button disabled={loading} className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50">{loading ? "Extraction..." : "Extraire le brouillon"}</button>
    </form>
    {(title || ingredients.length > 0) && <section className="space-y-4 rounded-xl border p-5">
      <h2 className="text-xl font-semibold">Vérifier la recette</h2>
      <label className="block text-sm font-medium">Titre<input value={title} onChange={event => setTitle(event.target.value)} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <label className="block text-sm font-medium">Ingrédients (une ligne par ingrédient)<textarea value={ingredients.map(item => [item.quantity, item.name].filter(Boolean).join(" ")).join("\n")} onChange={event => setIngredients(event.target.value.split("\n").filter(Boolean).map(name => ({ name })))} rows={8} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <label className="block text-sm font-medium">Instructions (une ligne par étape)<textarea value={instructions.join("\n")} onChange={event => setInstructions(event.target.value.split("\n").filter(Boolean))} rows={8} className="mt-1 w-full rounded-md border bg-background p-2" /></label>
      <button type="button" onClick={findImages} disabled={loading} className="rounded-md border px-4 py-2 disabled:opacity-50">Trouver des images Pexels</button>
      {photos.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{photos.map(photo => <button type="button" key={photo.id} onClick={() => setImageUrl(photo.src.large)} className={`overflow-hidden rounded-lg border text-left ${imageUrl === photo.src.large ? "ring-2 ring-primary" : ""}`}><img src={photo.src.large} alt={photo.alt || title} className="h-36 w-full object-cover" /><span className="block p-2 text-xs">Photo par {photo.photographer} sur Pexels</span></button>)}</div>}
      {imageUrl && <button type="button" onClick={saveRecipe} disabled={loading} className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50">Enregistrer dans Supabase</button>}
    </section>}
    {message && <p role="status" className="rounded-md bg-muted p-3 text-sm">{message}</p>}
  </main>
}
