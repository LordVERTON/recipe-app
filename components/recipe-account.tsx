"use client"

import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAccount } from './account-provider'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function RecipeAccount() {
  const { user } = useAccount()
  const [signup, setSignup] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || busy) return
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email')).trim()
    const password = String(form.get('password'))
    setBusy(true)
    setMessage('')
    try {
      const { data, error } = signup
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
        : await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.code === 'email_not_confirmed' ? 'Confirme ton adresse e-mail avant de te connecter.'
          : signup ? 'Inscription impossible. Vérifie ton adresse et choisis un mot de passe plus robuste, ou réessaie plus tard.'
            : 'Connexion impossible. Vérifie ton e-mail et ton mot de passe, ou réessaie plus tard.')
      } else if (!data.session) {
        setMessage('Vérifie ta boîte mail pour confirmer ton compte, puis connecte-toi ici.')
      }
    } catch { setMessage('Connexion impossible. Vérifie ta connexion internet.') }
    finally { setBusy(false) }
  }

  if (!supabase) return <p>La connexion aux comptes n’est pas encore configurée.</p>
  if (user) return <div className="flex flex-wrap items-center justify-between gap-3">
    <p className="min-w-0 break-all text-sm">Connecté : <strong>{user.email}</strong></p>
    <Button variant="outline" disabled={busy} onClick={async () => {
      if (!supabase) return
      setBusy(true)
      try {
        const { error } = await supabase.auth.signOut({ scope: 'local' })
        if (error) setMessage('Déconnexion impossible. Réessaie.')
      } catch { setMessage('Déconnexion impossible. Réessaie.') }
      finally { setBusy(false) }
    }}>Se déconnecter</Button>
    {message && <p role="status">{message}</p>}
  </div>
  return <form onSubmit={submit} className="space-y-4">
    <p className="text-sm text-warm-gray">Connecte-toi pour créer tes recettes et les utiliser dans ton planning avant leur validation.</p>
    <label className="block text-sm">Adresse e-mail<Input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
    <label className="block text-sm">Mot de passe<Input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} required minLength={signup ? 8 : 1} maxLength={128} /></label>
    {message && <p role="status" className="text-sm">{message}</p>}
    <div className="flex flex-wrap gap-2">
      <Button disabled={busy}>{busy ? 'Connexion…' : signup ? 'Créer mon compte' : 'Se connecter'}</Button>
      <Button type="button" variant="ghost" disabled={busy} onClick={() => { setSignup(!signup); setMessage('') }}>{signup ? 'J’ai déjà un compte' : 'Créer un compte'}</Button>
    </div>
  </form>
}
