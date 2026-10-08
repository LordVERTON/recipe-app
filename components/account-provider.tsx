"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'
import { fetchSupabaseRecipes } from '@/lib/supabase-recipes'
import { switchPlanningAccount, useBrocoChouStore } from '@/lib/store'
import type { Recipe } from '@/lib/types'

type Account = { user: User | null; isAdmin: boolean; recipes: Recipe[]; error: string; refresh: () => Promise<void> }
const AccountContext = createContext<Account | null>(null)
export function useAccount() {
  const account = useContext(AccountContext)
  if (!account) throw new Error('AccountProvider manquant')
  return account
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [error, setError] = useState('')
  const identity = useRef<string | null | undefined>(undefined)
  const generation = useRef(0)

  const load = useCallback(async (userId: string | null, version: number) => {
    try {
      const [loaded, admin] = await Promise.all([
        fetchSupabaseRecipes(),
        userId && supabase ? supabase.rpc('is_recipe_admin') : Promise.resolve({ data: false }),
      ])
      if (version !== generation.current) return
      setRecipes(loaded)
      setIsAdmin(admin.data === true)
      setError('')
      const visible = loaded.filter(recipe => recipe.moderationStatus === 'approved' || recipe.createdBy === userId)
      if (supabase) {
        const store = useBrocoChouStore.getState()
        store.setRecipes(visible)
        // Refresh cached recipe data, including expiring photo URLs, and remove inaccessible records.
        const byId = new Map(visible.map(recipe => [recipe.id, recipe]))
        const update = (items: Recipe[]) => items.flatMap(recipe => byId.get(recipe.id) ? [byId.get(recipe.id)!] : [])
        useBrocoChouStore.setState({
          acceptedRecipes: update(store.acceptedRecipes), favoriteRecipes: update(store.favoriteRecipes),
          rejectedRecipes: update(store.rejectedRecipes),
          weeklyPlan: store.weeklyPlan ? { ...store.weeklyPlan, meals: store.weeklyPlan.meals.flatMap(meal => {
            const recipe = byId.get(meal.recipeId)
            return recipe ? [{ ...meal, recipe }] : []
          }) } : null,
        })
        if (store.groceryList.length) useBrocoChouStore.getState().generateGroceryList()
      }
    } catch (cause) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[catalogue] Échec du chargement Supabase', {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          error: cause,
        })
      }
      if (version === generation.current) setError('Connexion au catalogue impossible. Vérifie ta connexion puis réessaie.')
    }
  }, [])
  const refresh = useCallback(() => load(identity.current ?? null, generation.current), [load])

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined
    const applyUser = async (nextUser: User | null) => {
      if (!active) return
      const id = nextUser?.id ?? null
      if (identity.current === id) { setUser(nextUser); return }
      identity.current = id
      const version = ++generation.current
      setReady(false)
      setUser(nextUser)
      setRecipes([])
      setIsAdmin(false)
      await switchPlanningAccount(id)
      await load(id, version)
      if (active && version === generation.current) setReady(true)
    }
    if (!supabase) { void applyUser(null); return () => { active = false } }
    // Defer Supabase calls out of the auth callback to avoid the auth lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(timer)
      timer = setTimeout(() => { void applyUser(session?.user ?? null) }, 0)
    })
    return () => { active = false; clearTimeout(timer); subscription.unsubscribe(); identity.current = undefined; generation.current++ }
  }, [load])

  useEffect(() => {
    if (!ready) return
    const timer = setInterval(() => { void refresh() }, 60 * 60 * 1000)
    const onFocus = () => { void refresh() }
    window.addEventListener('focus', onFocus)
    return () => { clearInterval(timer); window.removeEventListener('focus', onFocus) }
  }, [ready, refresh])

  if (!ready) return <p className="p-8 text-center" role="status">Chargement de ton espace…</p>
  return <AccountContext.Provider value={{ user, isAdmin, recipes, error, refresh }}>
    <div key={user?.id ?? 'guest'}>{children}</div>
  </AccountContext.Provider>
}
