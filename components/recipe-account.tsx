"use client"

import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase-client'
import { authErrorMessage } from '@/lib/auth-errors'
import { useAccount } from './account-provider'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function RecipeAccount() {
  const { user } = useAccount()
  const [signup, setSignup] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [confirmationPending, setConfirmationPending] = useState(false)
  const [resendAvailableAt, setResendAvailableAt] = useState(0)

  async function resendConfirmation() {
    if (!supabase || busy || !email.trim()) return
    if (Date.now() < resendAvailableAt) {
      setMessage('Patiente une minute entre deux demandes de mail de confirmation.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      })
      setResendAvailableAt(Date.now() + 60_000)
      setMessage(error
        ? authErrorMessage(error.code, 'Impossible de renvoyer le mail de confirmation. Réessaie plus tard.')
        : 'Si cette adresse correspond à un compte en attente de confirmation, un nouveau mail a été demandé. Vérifie aussi les courriers indésirables.')
    } catch { setMessage('Envoi impossible. Vérifie ta connexion internet.') }
    finally { setBusy(false) }
  }

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
        setConfirmationPending(error.code === 'email_not_confirmed')
        setMessage(authErrorMessage(error.code, signup
          ? 'Inscription impossible. Vérifie ton adresse et choisis un mot de passe plus robuste, ou réessaie plus tard.'
          : 'Connexion impossible. Vérifie ton e-mail et ton mot de passe, ou réessaie plus tard.'))
      } else if (!data.session) {
        setConfirmationPending(true)
        setResendAvailableAt(Date.now() + 60_000)
        setMessage('Vérifie ta boîte mail et les courriers indésirables pour confirmer ton compte. Si nécessaire, renvoie le mail après une minute.')
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
    <label className="block text-sm">Adresse e-mail<Input name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => { setEmail(event.target.value); setConfirmationPending(false); setMessage('') }} /></label>
    <label className="block text-sm">Mot de passe<Input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} required minLength={signup ? 8 : 1} maxLength={128} /></label>
    {message && <p role="status" className="text-sm">{message}</p>}
    {confirmationPending && <Button type="button" variant="outline" disabled={busy} onClick={resendConfirmation}>Renvoyer le mail de confirmation</Button>}
    <div className="flex flex-wrap gap-2">
      <Button disabled={busy}>{busy ? 'Connexion…' : signup ? 'Créer mon compte' : 'Se connecter'}</Button>
      <Button type="button" variant="ghost" disabled={busy} onClick={() => { setSignup(!signup); setMessage('') }}>{signup ? 'J’ai déjà un compte' : 'Créer un compte'}</Button>
    </div>
  </form>
}
