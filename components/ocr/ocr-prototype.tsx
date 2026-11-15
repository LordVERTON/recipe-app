'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DraftEditor } from './draft-editor'
import { parseRecipeText } from '@/lib/ocr/parse'
import { mergeOcrPages } from '@/lib/ocr/merge'
import { prepareImage, validateImageFiles } from '@/lib/ocr/images'
import type { OcrEngine } from '@/lib/ocr/engine'
import type { OcrPage, ParsedRecipe } from '@/lib/ocr/types'

type Source = { id: string; file: File; url: string }
type Page = OcrPage & { preview: string; name: string; variant: string }
const MAX_TEXT = 50_000

export function OcrPrototype() {
  const [mode, setMode] = useState<'photo' | 'captures' | 'text'>('photo')
  const [sources, setSources] = useState<Source[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [text, setText] = useState('')
  const [draft, setDraft] = useState<ParsedRecipe | null>(null)
  const [draftVersion, setDraftVersion] = useState(0)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('En attente de fichier ou de texte.')
  const [error, setError] = useState('')
  const [enhance, setEnhance] = useState(true)
  const [backend, setBackend] = useState<'wasm' | 'webgpu'>('wasm')
  const [mainThread, setMainThread] = useState(false)
  const [metrics, setMetrics] = useState<{ load: number; recognition: number; total: number; variant: string; execution: string }[]>([])
  const urls = useRef(new Set<string>())
  const engine = useRef<OcrEngine | null>(null)
  const controller = useRef<AbortController | null>(null)
  const generation = useRef(0)
  const inputVersion = useRef(0)
  const [fileKey, setFileKey] = useState(0)
  useEffect(() => () => {
    generation.current++; controller.current?.abort(); engine.current?.dispose()
    urls.current.forEach(url => URL.revokeObjectURL(url)); urls.current.clear()
  }, [])
  const objectUrl = (blob: Blob) => { const url = URL.createObjectURL(blob); urls.current.add(url); return url }
  const revoke = (url: string) => { URL.revokeObjectURL(url); urls.current.delete(url) }
  function clearPages() { pages.forEach(p => revoke(p.preview)); setPages([]) }
  function reset() {
    generation.current++; inputVersion.current++; controller.current?.abort(); engine.current?.dispose(); engine.current = null
    urls.current.forEach(url => URL.revokeObjectURL(url)); urls.current.clear()
    setSources([]); setPages([]); setText(''); setDraft(null); setMetrics([]); setBusy(false); setError(''); setFileKey(v => v + 1)
    setStatus('En attente de fichier ou de texte.')
  }
  function selectFiles(files: FileList | null) {
    if (!files) return
    const selected = Array.from(files)
    try {
      validateImageFiles([...sources.map(s => s.file), ...selected])
      clearPages()
      const additions = selected.map(file => ({ id: `${++inputVersion.current}`, file, url: objectUrl(file) }))
      setSources(current => [...current, ...additions])
      setError(''); setStatus('Images sélectionnées. Vérifier leur ordre puis lancer la reconnaissance.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Fichier invalide.') }
    setFileKey(v => v + 1)
  }
  function move(index: number, offset: number) {
    const next = [...sources]; [next[index], next[index + offset]] = [next[index + offset], next[index]]
    clearPages(); setSources(next); setStatus('Ordre modifié. Relancer la reconnaissance ; le texte précédent reste disponible.')
  }
  async function recognize() {
    if (!sources.length || busy) return
    if (text && !window.confirm('Remplacer la transcription actuelle par une nouvelle reconnaissance ? Le brouillon existant sera conservé.')) return
    const run = ++generation.current
    const abort = new AbortController(); controller.current = abort
    const start = performance.now()
    const produced: Page[] = []
    setBusy(true); setError('')
    try {
      let load = 0
      let recognition = 0
      for (const [index, source] of sources.entries()) {
        setStatus(`Préparation de l’image ${index + 1}/${sources.length}…`)
        const prepared = await prepareImage(source.file, enhance)
        if (run !== generation.current) return
        if (!engine.current) {
          setStatus('Chargement du moteur et des modèles locaux… Le premier chargement peut prendre du temps.')
          const { createOcrEngine } = await import('@/lib/ocr/engine')
          const initialized = await createOcrEngine(backend, mainThread, abort.signal)
          if (run !== generation.current) { initialized.dispose(); return }
          engine.current = initialized; load = initialized.loadMs
        }
        setStatus(`Reconnaissance en cours : image ${index + 1}/${sources.length}…`)
        const result = await engine.current.predict(prepared.blob, index)
        if (run !== generation.current) return
        recognition += result.elapsedMs
        produced.push({ ...result, preview: objectUrl(prepared.blob), name: source.file.name, variant: enhance ? 'Prétraitée' : 'Originale orientée' })
      }
      const merged = mergeOcrPages(produced.map(p => p.lines.map(l => l.text)))
      if (merged.text.length > MAX_TEXT) throw new Error('Transcription trop longue (50 000 caractères maximum). Retirer des images.')
      clearPages(); setPages(produced); setText(merged.text)
      setMetrics(current => [...current.slice(-5), { load, recognition, total: performance.now() - start, variant: enhance ? 'Prétraitée' : 'Originale', execution: engine.current?.execution ?? '' }])
      setStatus(merged.text.trim() ? `Transcription disponible. ${merged.overlaps.reduce((n, o) => n + o.removed, 0)} lignes de chevauchement retirées. Relire avant l’analyse.` : 'Aucun texte reconnu. Essayer l’image originale ou coller le texte.')
    } catch (e) {
      produced.forEach(p => revoke(p.preview))
      if (run === generation.current) {
        engine.current?.dispose(); engine.current = null
        setError(e instanceof Error ? e.message : 'Reconnaissance impossible. Réessayer.'); setStatus('Échec de la reconnaissance.')
      }
    } finally { if (run === generation.current) setBusy(false) }
  }
  function analyze() {
    if (!text.trim()) { setError('Ajouter ou corriger le texte avant l’analyse.'); return }
    if (draft && !window.confirm('Remplacer le brouillon existant et ses corrections par une nouvelle analyse ?')) return
    setStatus('Analyse du texte…'); setError('')
    setDraft(parseRecipeText(text)); setDraftVersion(v => v + 1); setStatus('Brouillon disponible. Compléter les informations et vérifier les quantités.')
  }
  return <main className="mx-auto min-h-screen max-w-4xl space-y-6 px-4 py-8 text-foreground sm:px-6">
    <header className="space-y-2"><p className="text-sm font-semibold text-primary">Broco-Chou · Laboratoire local</p><h1 className="text-3xl font-bold">Numériser une recette</h1><p className="text-sm">Prototype expérimental. Photos et texte restent dans ce navigateur, sans enregistrement. La précision manuscrite reste à évaluer.</p></header>
    <div className="flex flex-wrap gap-2" aria-label="Mode d’import">{([['photo', 'Photographier une recette'], ['captures', 'Importer des captures'], ['text', 'Coller un texte']] as const).map(([value, label]) => <Button key={value} variant={mode === value ? 'default' : 'outline'} disabled={busy} aria-pressed={mode === value} onClick={() => setMode(value)}>{label}</Button>)}</div>
    <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6" aria-label="Sources de la recette">
      <fieldset disabled={busy} className="space-y-4">
        {mode !== 'text' && <>
          <p className="text-sm">4 images maximum, 10 Mio par image, 24 mégapixels. JPEG, PNG ou WebP. Convertir les HEIC/HEIF avant import.</p>
          {mode === 'photo' && <label className="block text-sm">Prendre une photo<Input key={`camera-${fileKey}`} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={e => selectFiles(e.target.files)} /></label>}
          <label className="block text-sm">{mode === 'photo' ? 'Choisir dans la galerie' : 'Sélectionner des captures'}<Input key={`files-${fileKey}`} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => selectFiles(e.target.files)} /></label>
          <ol className="grid gap-3 sm:grid-cols-2">{sources.map((source, index) => <li key={source.id} className="min-w-0 space-y-2 rounded-xl border p-3">
            <Image src={source.url} alt={`Source ${index + 1}`} width={480} height={320} unoptimized className="h-40 w-full rounded-lg object-contain" />
            <p className="break-words text-sm">{index + 1}. {source.file.name}</p>
            <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Avancer l’image ${index + 1}`}>Monter</Button><Button size="sm" variant="outline" disabled={index === sources.length - 1} onClick={() => move(index, 1)} aria-label={`Reculer l’image ${index + 1}`}>Descendre</Button><Button size="sm" variant="ghost" onClick={() => { revoke(source.url); clearPages(); setSources(current => current.filter(s => s.id !== source.id)) }} aria-label={`Retirer l’image ${index + 1}`}>Retirer</Button></div>
          </li>)}</ol>
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={enhance} onChange={e => setEnhance(e.target.checked)} />Prétraiter : contraste léger et côté maximal 2 400 px. Décocher pour comparer à l’original orienté.</label>
          <details className="space-y-3"><summary className="cursor-pointer text-sm">Options du moteur et préparation hors ligne</summary><p className="text-sm">Préparer une fois avec Internet : <code>npm run ocr:prepare</code>. Puis <code>npm run ocr:check</code> vérifie les fichiers sans réseau. Le moteur reste chargé pour les essais suivants.</p>
            <label className="block text-sm">Runtime<select value={backend} className="m-2 rounded-md border bg-background p-2" onChange={e => { engine.current?.dispose(); engine.current = null; setBackend(e.target.value as 'wasm' | 'webgpu') }}><option value="wasm">WebAssembly (recommandé)</option><option value="webgpu">WebGPU (expérimental, appareil compatible requis)</option></select></label>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={mainThread} onChange={e => { engine.current?.dispose(); engine.current = null; setMainThread(e.target.checked) }} />Repli sur le fil principal si le Worker est indisponible (peut ralentir l’interface).</label>
          </details>
          <Button disabled={!sources.length} onClick={() => void recognize()}>Lancer la reconnaissance</Button>
        </>}
        <div><label htmlFor="ocr-transcript" className="block text-sm">{mode === 'text' ? 'Texte de la recette' : 'Transcription fusionnée à corriger'}</label><Textarea id="ocr-transcript" maxLength={MAX_TEXT} rows={12} value={text} onChange={e => setText(e.target.value)} placeholder="Coller une description ou reconnaître des images…" /></div>
        <Button onClick={analyze} disabled={!text.trim()}>Analyser le texte et créer un brouillon</Button>
      </fieldset>
    </section>
    <p role="status" aria-live="polite" className="rounded-xl bg-secondary p-3 text-sm">{status}</p>
    {error && <p role="alert" className="rounded-xl border p-3 text-sm text-destructive">{error}</p>}
    <Button variant="outline" onClick={reset}>Réinitialiser{busy ? ' et interrompre' : ''}</Button>
    {pages.length > 0 && <section aria-label="Résultats OCR bruts" className="space-y-4"><h2 className="text-xl font-semibold">Vérification OCR par image</h2><p className="text-sm">Les scores ne sont pas des probabilités calibrées. Relire aussi les lignes à score élevé. Sous 0,85 : ligne à vérifier en priorité. Ordre prévu pour une seule colonne.</p>{pages.map((page, index) => <details key={index} className="rounded-xl border bg-card p-4"><summary className="cursor-pointer break-words">Image {index + 1} · {page.name} · {page.variant} · {page.runtime}</summary><div className="mt-3 grid gap-4 sm:grid-cols-2"><Image src={page.preview} width={page.width} height={page.height} unoptimized alt={`Image reconnue ${index + 1}`} className="h-auto max-h-[70vh] w-full object-contain" /><ol className="space-y-2 text-sm">{page.lines.map(line => <li key={line.order} className={line.score < 0.85 ? 'rounded border p-2' : ''}><span>{line.text}</span> <span className="text-xs">(score {line.score.toFixed(2)}{line.score < 0.85 ? ', à vérifier' : ''})</span><details><summary className="cursor-pointer text-xs">Zone reconnue</summary><code className="break-all text-xs">{JSON.stringify(line.poly)}</code></details></li>)}</ol></div></details>)}</section>}
    {metrics.length > 0 && <details><summary className="cursor-pointer">Mesures observées pour comparer les essais</summary><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr><th>Image</th><th>Exécution</th><th>Chargement</th><th>OCR</th><th>Total</th></tr></thead><tbody>{metrics.map((m, i) => <tr key={i}><td>{m.variant}</td><td>{m.execution}</td><td>{(m.load / 1000).toFixed(2)} s</td><td>{(m.recognition / 1000).toFixed(2)} s</td><td>{(m.total / 1000).toFixed(2)} s</td></tr>)}</tbody></table></div><p className="text-xs">Chargement à 0 si moteur réutilisé ; total incluant préparation et import du SDK. Mémoire non mesurée.</p></details>}
    {draft && <DraftEditor key={draftVersion} draft={draft} onChange={setDraft} />}
  </main>
}
