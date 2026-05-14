"use client"

import { motion } from "framer-motion"
import { Clock, Users, ChefHat, Flame, Microwave, Leaf, Fish, Drumstick } from "lucide-react"
import type { Recipe } from "@/lib/types"
import { SEASONS_FR } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RecipeCardProps {
  recipe: Recipe
  onViewDetails?: () => void
  className?: string
  isActive?: boolean
}

export function RecipeCard({ recipe, onViewDetails, className, isActive = false }: RecipeCardProps) {
  const getDietaryIcon = () => {
    if (recipe.dietary_tags?.includes("végétarien")) {
      return <Leaf className="h-3.5 w-3.5" />
    }
    if (recipe.dietary_tags?.includes("poisson")) {
      return <Fish className="h-3.5 w-3.5" />
    }
    if (recipe.main_ingredients?.some(i => i.includes("poulet"))) {
      return <Drumstick className="h-3.5 w-3.5" />
    }
    return null
  }

  return (
    <div
      className={cn(
        "relative w-full h-full rounded-3xl overflow-hidden bg-card broco-chou-shadow",
        "border border-soft-sand",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative h-[45%] bg-gradient-to-br from-lavender/30 to-dusty-violet/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-lavender/40 flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-mauve-taupe/60" />
          </div>
        </div>
        
        {/* Source Badge */}
        <div className="absolute top-4 left-4">
          <span className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium",
            recipe.source === "crous" 
              ? "bg-sage-mist text-charcoal-soft" 
              : "bg-lavender text-deep-plum"
          )}>
            {recipe.source === "crous" ? "Recette Crous" : "Suggestion Broco-Chou"}
          </span>
        </div>

        {/* Season Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-warm-ivory/90 text-warm-gray">
            {SEASONS_FR[recipe.saison]}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 h-[55%] flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-semibold text-charcoal-soft leading-tight line-clamp-2 mb-2 text-pretty">
          {recipe.nom.charAt(0).toUpperCase() + recipe.nom.slice(1)}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-warm-gray mb-3">
          {recipe.estimatedTime && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{recipe.estimatedTime} min</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{recipe.portions}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Dietary Tag */}
          {getDietaryIcon() && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-sage-mist/50 text-charcoal-soft">
              {getDietaryIcon()}
              {recipe.dietary_tags?.includes("végétarien") && "Végétarien"}
              {recipe.dietary_tags?.includes("poisson") && "Poisson"}
              {recipe.dietary_tags?.includes("légumineuses") && "Légumineuses"}
            </span>
          )}
          
          {/* Sans Four */}
          {recipe.sans_four && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-lavender/50 text-deep-plum">
              <Flame className="h-3 w-3" />
              Sans four
            </span>
          )}
          
          {/* Micro-ondes */}
          {recipe.cuisson_micro_ondes && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-dusty-violet/30 text-deep-plum">
              <Microwave className="h-3 w-3" />
              Micro-ondes
            </span>
          )}
        </div>

        {/* Main Ingredients Preview */}
        <div className="flex-1">
          <p className="text-xs text-warm-gray mb-1">Ingrédients principaux</p>
          <p className="text-sm text-charcoal-soft line-clamp-2">
            {recipe.main_ingredients?.slice(0, 4).join(", ") || 
             recipe.ingredients.slice(0, 4).map(i => i.name).join(", ")}
          </p>
        </div>

        {/* View Details Button */}
        {onViewDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails()
            }}
            className="mt-3 w-full py-2 text-sm font-medium text-mauve-taupe hover:text-deep-plum transition-colors"
          >
            Voir les détails
          </button>
        )}
      </div>
    </div>
  )
}

// Swipeable Recipe Card with gesture support
interface SwipeableRecipeCardProps {
  recipe: Recipe
  onSwipe: (direction: "left" | "right") => void
  onViewDetails: () => void
  isTop: boolean
}

export function SwipeableRecipeCard({ 
  recipe, 
  onSwipe, 
  onViewDetails,
  isTop 
}: SwipeableRecipeCardProps) {
  const handleDragEnd = (
    _: any,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const threshold = 100
    const velocity = info.velocity.x
    const offset = info.offset.x

    if (offset > threshold || velocity > 500) {
      onSwipe("right")
    } else if (offset < -threshold || velocity < -500) {
      onSwipe("left")
    }
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ 
        zIndex: isTop ? 1 : 0,
        pointerEvents: isTop ? "auto" : "none"
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.5 }}
      animate={{ 
        scale: isTop ? 1 : 0.95, 
        opacity: isTop ? 1 : 0.5,
        y: isTop ? 0 : 10
      }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.2 }
      }}
      whileDrag={{ cursor: "grabbing" }}
    >
      <motion.div
        className="w-full h-full"
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <RecipeCard recipe={recipe} onViewDetails={onViewDetails} isActive={isTop} />
        
        {/* Swipe Indicators */}
        {isTop && (
          <>
            <motion.div
              className="absolute top-1/2 left-6 -translate-y-1/2 px-4 py-2 rounded-xl bg-muted/90 text-muted-foreground font-semibold text-lg rotate-[-15deg] border-2 border-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              style={{ opacity: 0 }}
            >
              PAS CETTE SEMAINE
            </motion.div>
            <motion.div
              className="absolute top-1/2 right-6 -translate-y-1/2 px-4 py-2 rounded-xl bg-mauve-taupe/90 text-white font-semibold text-lg rotate-[15deg] border-2 border-mauve-taupe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              style={{ opacity: 0 }}
            >
              JE VEUX LA FAIRE
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
