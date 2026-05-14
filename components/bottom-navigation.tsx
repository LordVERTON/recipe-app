"use client"

import { motion } from "framer-motion"
import { Home, Sparkles, Calendar, ShoppingCart, User } from "lucide-react"
import { cn } from "@/lib/utils"

export type NavTab = "home" | "swipe" | "calendar" | "grocery" | "profile"

interface BottomNavigationProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

const tabs: { id: NavTab; icon: typeof Home; label: string }[] = [
  { id: "home", icon: Home, label: "Accueil" },
  { id: "swipe", icon: Sparkles, label: "Swipe" },
  { id: "calendar", icon: Calendar, label: "Planning" },
  { id: "grocery", icon: ShoppingCart, label: "Courses" },
  { id: "profile", icon: User, label: "Profil" },
]

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="bg-warm-ivory/95 backdrop-blur-md border-t border-soft-sand">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const isSwipe = tab.id === "swipe"
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-colors",
                  isSwipe && "relative -mt-4"
                )}
              >
                {isSwipe ? (
                  // Special center button for swipe
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                    isActive 
                      ? "bg-gradient-to-br from-dusty-violet to-mauve-taupe lumora-shadow" 
                      : "bg-lavender hover:bg-dusty-violet/30"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6",
                      isActive ? "text-white" : "text-mauve-taupe"
                    )} />
                  </div>
                ) : (
                  <>
                    <div className={cn(
                      "p-2 rounded-xl transition-colors",
                      isActive ? "bg-lavender/50" : "hover:bg-lavender/30"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        isActive ? "text-mauve-taupe" : "text-warm-gray"
                      )} />
                    </div>
                    <span className={cn(
                      "text-[10px] mt-0.5 transition-colors",
                      isActive ? "text-mauve-taupe font-medium" : "text-warm-gray"
                    )}>
                      {tab.label}
                    </span>
                  </>
                )}

                {/* Active Indicator */}
                {isActive && !isSwipe && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-mauve-taupe"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
