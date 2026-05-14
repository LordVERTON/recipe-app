"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Copy, Share, ChevronDown, ShoppingCart, Sparkles } from "lucide-react"
import { useLumoraStore } from "@/lib/store"
import { GROCERY_CATEGORIES } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface GroceryListProps {
  onBack: () => void
}

// Common pantry items that users likely already have
const PANTRY_STAPLES = [
  "sel", "poivre", "huile", "vinaigre", "farine", "sucre", 
  "moutarde", "beurre", "ail", "oignon"
]

export function GroceryList({ onBack }: GroceryListProps) {
  const { groceryList, toggleGroceryItem } = useLumoraStore()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(GROCERY_CATEGORIES)
  )
  const [showPantryItems, setShowPantryItems] = useState(false)
  const [copied, setCopied] = useState(false)

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped = new Map<string, typeof groceryList>()
    
    GROCERY_CATEGORIES.forEach(cat => grouped.set(cat, []))
    
    groceryList.forEach(item => {
      const category = item.category || "Épicerie, condiments et produits sucrés"
      const existing = grouped.get(category) || []
      grouped.set(category, [...existing, item])
    })
    
    return grouped
  }, [groceryList])

  // Separate pantry items
  const { regularItems, pantryItems } = useMemo(() => {
    const regular: typeof groceryList = []
    const pantry: typeof groceryList = []
    
    groceryList.forEach(item => {
      const isPantry = PANTRY_STAPLES.some(staple => 
        item.name.toLowerCase().includes(staple)
      )
      if (isPantry) {
        pantry.push(item)
      } else {
        regular.push(item)
      }
    })
    
    return { regularItems: regular, pantryItems: pantry }
  }, [groceryList])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const checkedCount = groceryList.filter(i => i.checked).length
  const totalCount = groceryList.length
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  const copyToClipboard = async () => {
    const text = GROCERY_CATEGORIES
      .map(category => {
        const items = itemsByCategory.get(category) || []
        if (items.length === 0) return null
        
        const itemLines = items
          .map(i => `  ${i.checked ? "✓" : "○"} ${i.quantity ? i.quantity + " " : ""}${i.name}`)
          .join("\n")
        
        return `${category}:\n${itemLines}`
      })
      .filter(Boolean)
      .join("\n\n")

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (groceryList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-lavender/50 flex items-center justify-center mb-6">
          <ShoppingCart className="h-10 w-10 text-mauve-taupe" />
        </div>
        <h2 className="text-xl font-semibold text-charcoal-soft mb-2">
          Pas encore de liste
        </h2>
        <p className="text-warm-gray mb-6">
          Génère ton planning pour créer ta liste de courses automatiquement.
        </p>
        <Button
          onClick={onBack}
          variant="outline"
          className="border-dusty-violet text-mauve-taupe hover:bg-lavender/20"
        >
          Retour au calendrier
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-charcoal-soft">Liste de courses</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-full hover:bg-lavender/30 transition-colors"
            >
              {copied ? (
                <Check className="h-5 w-5 text-sage-mist" />
              ) : (
                <Copy className="h-5 w-5 text-warm-gray" />
              )}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-soft-sand rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sage-mist to-dusty-violet rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm text-warm-gray whitespace-nowrap">
            {checkedCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-4 hide-scrollbar">
        {GROCERY_CATEGORIES.map(category => {
          const items = (itemsByCategory.get(category) || [])
            .filter(item => showPantryItems || !PANTRY_STAPLES.some(s => item.name.toLowerCase().includes(s)))
          
          if (items.length === 0) return null

          const isExpanded = expandedCategories.has(category)
          const categoryChecked = items.filter(i => i.checked).length
          const allChecked = categoryChecked === items.length

          return (
            <div key={category} className="mb-4">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between py-2 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium",
                    allChecked ? "text-warm-gray line-through" : "text-charcoal-soft"
                  )}>
                    {category}
                  </span>
                  <span className="text-xs text-warm-gray">
                    ({categoryChecked}/{items.length})
                  </span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-warm-gray transition-transform",
                  isExpanded && "rotate-180"
                )} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 pb-2">
                      {items.map((item, index) => (
                        <button
                          key={`${item.name}-${index}`}
                          onClick={() => toggleGroceryItem(item.name)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                            item.checked 
                              ? "bg-sage-mist/20" 
                              : "bg-card hover:bg-lavender/20"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            item.checked 
                              ? "border-sage-mist bg-sage-mist" 
                              : "border-soft-sand"
                          )}>
                            {item.checked && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={cn(
                              "text-sm",
                              item.checked 
                                ? "text-warm-gray line-through" 
                                : "text-charcoal-soft"
                            )}>
                              {item.quantity && (
                                <span className="font-medium">{item.quantity} </span>
                              )}
                              {item.name}
                            </span>
                          </div>
                          {item.recipeIds.length > 1 && (
                            <span className="text-xs text-warm-gray bg-soft-sand px-1.5 py-0.5 rounded">
                              x{item.recipeIds.length}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {/* Pantry Items Toggle */}
        {pantryItems.length > 0 && (
          <div className="mt-4 mb-8">
            <button
              onClick={() => setShowPantryItems(!showPantryItems)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-lavender/30 text-sm text-mauve-taupe hover:bg-lavender/50 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              {showPantryItems ? "Masquer les basiques" : `Afficher ${pantryItems.length} basiques du placard`}
            </button>
            <p className="text-xs text-center text-warm-gray mt-2">
              Sel, poivre, huile... probablement déjà dans ta cuisine
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="px-4 py-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full border-soft-sand text-warm-gray hover:bg-lavender/20"
        >
          Retour au calendrier
        </Button>
      </div>
    </div>
  )
}
