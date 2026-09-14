"use client"

import { motion } from "framer-motion"
import { ArrowRight, CalendarDays, ShoppingCart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBrocoChouStore } from "@/lib/store"

export function Onboarding() {
  const { completeOnboarding } = useBrocoChouStore()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-card text-4xl broco-chou-shadow">
            🥦
          </div>
          <h1 className="font-serif text-4xl font-bold text-charcoal-soft">
            Broco-Chou
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.4 }}
          className="mb-10 max-w-xs text-lg leading-relaxed text-warm-gray text-pretty"
        >
          Choisis quelques recettes. On te prepare une semaine simple.
        </motion.p>

        <motion.ol
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.35 }}
          className="mb-8 w-full max-w-xs space-y-2 text-left"
          aria-label="Comment fonctionne Broco-Chou"
        >
          <li className="flex items-center gap-3 rounded-xl bg-card/70 px-3 py-2 text-sm text-charcoal-soft"><Sparkles className="h-4 w-4 text-mauve-taupe" /> 1. Choisis les recettes qui te donnent envie</li>
          <li className="flex items-center gap-3 rounded-xl bg-card/70 px-3 py-2 text-sm text-charcoal-soft"><CalendarDays className="h-4 w-4 text-mauve-taupe" /> 2. Compose ta semaine à partir d&apos;aujourd&apos;hui</li>
          <li className="flex items-center gap-3 rounded-xl bg-card/70 px-3 py-2 text-sm text-charcoal-soft"><ShoppingCart className="h-4 w-4 text-mauve-taupe" /> 3. Génère ta liste de courses</li>
        </motion.ol>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="w-full max-w-xs"
        >
          <Button
            onClick={completeOnboarding}
            size="lg"
            className="h-14 w-full rounded-2xl bg-mauve-taupe text-base font-semibold text-white broco-chou-shadow hover:bg-deep-plum"
          >
            Commencer
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </main>
    </div>
  )
}
