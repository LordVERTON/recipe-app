'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { supabase, isRecoverySession } from '@/lib/supabase-client'
import { authErrorMessage } from '@/lib/auth-errors'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function AuthReturn({ recovery = false }: { recovery?: boolean }) {
  const [message, setMessage] = useState('Vérification du lien…')
  const [valid, setValid] = useState(false)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  useEffect(() => {
    let active = true
    async function verify() {
      const params = new URLSearchParams(window.location.hash.slice(1))
      const query = new URLSearchParams(window.location.search)
      const hasError = params.has('error') || query.has('error')
      try {
        // Wait for SDK initialization: it consumes the implicit-flow fragment.
        const session = await supabase?.auth.getSession()
        window.history.replaceState(null, '', window.location.pathname)
        if (hasError || !session?.data.session || session.error) throw new Error('invalid')
        const user = await supabase!.auth.getUser()
        if (user.error || !user.data.user) throw new Error('invalid')
        if (recovery) {
          if (!isRecoverySession(session.data.session.access_token)) throw new Error('invalid')
          const result = await supabase!.auth.getClaims()
          const methods = result.data?.claims.amr as { method: string; timestamp: number }[] | undefined
          // Verified JWT evidence, not a query flag or an existing ordinary session.
          if (result.error || !methods?.some(method => method.method === 'otp' && Date.now() / 1000 - method.timestamp < 3600)) throw new Error('invalid')
        }
        if (active) { setValid(true); setMessage(recovery ? 'Choisis ton nouveau mot de passe.' : 'Ton adresse a été validée ou ta connexion a réussi. Tu peux retrouver ton espace.') }
      } catch {
        window.history.replaceState(null, '', window.location.pathname)
        if (active) { setValid(false); setMessage('Lien invalide, expiré ou déjà utilisé, ou session absente. Retourne à la connexion pour demander un nouveau lien.') }
      }
    }
    void verify()
    const subscription = supabase?.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT' && active) { setValid(false); setMessage('La session a expiré. Demande un nouveau lien.') }
    }).data.subscription
    return () => { active = false; subscription?.unsubscribe() }
  }, [recovery])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !valid || lock.current) return
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password'))
    if (password !== form.get('confirm')) { setMessage('Les mots de passe ne correspondent pas.'); return }
    lock.current = true; setBusy(true)
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session || !isRecoverySession(session.data.session.access_token)) { setValid(false); setMessage('Demande un nouveau lien de récupération.'); return }
      const result = await supabase.auth.getClaims()
      const methods = result.data?.claims.amr as { method: string; timestamp: number }[] | undefined
      if (result.error || !methods?.some(method => method.method === 'otp' && Date.now() / 1000 - method.timestamp < 3600)) { setValid(false); setMessage('Session de récupération expirée. Demande un nouveau lien.'); return }
      const { error } = await supabase.auth.updateUser({ password })
      if (error) setMessage(authErrorMessage(error.code, 'Modification impossible. Demande un nouveau lien ou réessaie.'))
      else {
        setValid(false)
        await supabase.auth.signOut({ scope: 'local' })
        setMessage('Mot de passe modifié. Tu peux maintenant te connecter avec ce mot de passe.')
      }
    } catch { setMessage('Connexion impossible. Réessaie.') }
    finally { lock.current = false; setBusy(false) }
  }
  return <main className="mx-auto max-w-lg space-y-6 px-6 py-12">
    <h1 className="text-2xl font-bold text-deep-plum">{recovery ? 'Nouveau mot de passe' : 'Retour dans Broco-Chou'}</h1>
    <p role="status">{message}</p>
    {recovery && valid && <form className="space-y-4" onSubmit={submit}>
      <label className="block">Nouveau mot de passe<Input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label>
      <label className="block">Confirmer le mot de passe<Input name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label>
      <Button disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer le mot de passe'}</Button>
    </form>}
    <Link className="block underline" href="/?account=1">Retour à mon espace</Link>
  </main>
}
