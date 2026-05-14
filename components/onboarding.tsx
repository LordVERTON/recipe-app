"use client"

import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Calendar, ShoppingCart, Sparkles, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useBrocoChouStore } from "@/lib/store"

const features = [
  {
    icon: Leaf,
    title: "Recettes de saison",
    description: "Toujours en accord avec les produits du moment"
  },
  {
    icon: Calendar,
    title: "Planning automatique",
    description: "7 jours équilibrés générés pour toi"
  },
  {
    icon: ShoppingCart,
    title: "Liste de courses",
    description: "Tous les ingrédients regroupés par rayon"
  },
  {
    icon: Sparkles,
    title: "Anti-répétition",
    description: "Jamais la même base 3 fois par semaine"
  }
]

export function Onboarding() {
  const { completeOnboarding } = useBrocoChouStore()

  return (
    <div className="min-h-screen broco-chou-gradient flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-dusty-violet to-mauve-taupe flex items-center justify-center broco-chou-shadow mb-4 mx-auto text-5xl">
            🥦
          </div>
          <h1 className="text-3xl font-bold text-charcoal-soft text-center font-serif">
            Broco-Chou
          </h1>
          <p className="text-lg text-mauve-taupe font-medium text-center">
            Planning étudiant
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-xl text-charcoal-soft font-semibold mb-3 text-pretty">
            Planifie ta semaine avec douceur
          </h2>
          <p className="text-warm-gray max-w-xs mx-auto text-pretty">
            Swipe les recettes qui te donnent envie, Broco-Chou compose ton planning équilibré.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 broco-chou-shadow"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl mb-3 flex items-center justify-center",
                  index % 2 === 0 ? "bg-lavender/50" : "bg-sage-mist/50"
                )}>
                  <feature.icon className={cn(
                    "h-5 w-5",
                    index % 2 === 0 ? "text-mauve-taupe" : "text-deep-plum"
                  )} />
                </div>
                <h3 className="text-sm font-semibold text-charcoal-soft mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-warm-gray leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="px-8 pb-12"
      >
        <Button
          onClick={completeOnboarding}
          size="lg"
          className="w-full bg-gradient-to-r from-dusty-violet to-mauve-taupe text-white hover:opacity-90 h-14 text-base font-semibold rounded-2xl broco-chou-shadow"
        >
          Préparer ma semaine
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
        
        <Button
          onClick={completeOnboarding}
          variant="ghost"
          className="w-full mt-3 text-warm-gray hover:text-mauve-taupe hover:bg-transparent"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Explorer les recettes
        </Button>

        {/* Attribution */}
        <p className="text-center text-xs text-warm-gray mt-6">
          Recettes issues des calendriers du Crous
        </p>
      </motion.div>
    </div>
  )
}
