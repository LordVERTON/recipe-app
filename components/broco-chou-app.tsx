"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBrocoChouStore } from "@/lib/store";
import type { PlannedMeal, Recipe } from "@/lib/types";
import { fetchSupabaseRecipes } from "@/lib/supabase-recipes";
import type { NavTab } from "./bottom-navigation";
import { BottomNavigation } from "./bottom-navigation";
import { HomeDashboard } from "./home-dashboard";
import { SwipeDeck } from "./swipe-deck";
import { WeeklyCalendar } from "./weekly-calendar";
import { GroceryList } from "./grocery-list";
import { ProfilePage } from "./profile-page";
import { Onboarding } from "./onboarding";
import { RecipeDetailSheet } from "./recipe-detail-sheet";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function BrocoChouApp() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const hasLoadedSupabase = useRef(false);
  const {
    hasCompletedOnboarding,
    generateWeeklyPlan,
    generateGroceryList,
    replaceMeal,
    acceptedRecipes,
    setRecipes,
    addRecipeToAccepted,
    resetSwipes,
  } = useBrocoChouStore();

  useEffect(() => {
    if (hasLoadedSupabase.current) return;
    hasLoadedSupabase.current = true;

    fetchSupabaseRecipes()
      .then(remoteRecipes => {
        if (remoteRecipes.length > 0) {
          setRecipes(remoteRecipes);
        }
      })
      .catch(error => {
        console.warn("Supabase indisponible, recettes locales utilisées.", error);
      });
  }, [setRecipes]);

  if (!hasCompletedOnboarding) {
    return <Onboarding />;
  }

  const openRecipeDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const completeSwipe = () => {
    generateWeeklyPlan();
    setActiveTab("calendar");
  };

  const openGroceryList = () => {
    generateGroceryList();
    setActiveTab("grocery");
  };

  const replaceWithSuggestion = (meal: PlannedMeal) => {
    const replacement = acceptedRecipes.find(recipe =>
      recipe.id !== meal.recipeId &&
      recipe.categorie === meal.recipe.categorie &&
      recipe.tag === meal.recipe.tag
    ) || acceptedRecipes.find(recipe => recipe.id !== meal.recipeId)

    if (replacement) {
      replaceMeal(meal.id, replacement);
    }
  };

  const redoPlan = () => {
    resetSwipes();
    setActiveTab("swipe");
  };

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <HomeDashboard onNavigate={setActiveTab} onViewRecipe={openRecipeDetails} />;
      case "swipe":
        return (
          <SwipeDeck
            onViewRecipeDetails={openRecipeDetails}
            onComplete={completeSwipe}
          />
        );
      case "calendar":
        return (
          <WeeklyCalendar
            onViewRecipe={openRecipeDetails}
            onReplaceMeal={replaceWithSuggestion}
            onGenerateGroceryList={openGroceryList}
            onRedoPlan={redoPlan}
          />
        );
      case "grocery":
        return <GroceryList onBack={() => setActiveTab("calendar")} />;
      case "profile":
        return <ProfilePage onOpenPreferences={() => setActiveTab("home")} />;
      default:
        return <HomeDashboard onNavigate={setActiveTab} onViewRecipe={openRecipeDetails} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="min-h-0 flex-1 overflow-hidden pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full min-h-0"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <RecipeDetailSheet
        recipe={selectedRecipe}
        isOpen={selectedRecipe !== null}
        onClose={() => setSelectedRecipe(null)}
        onAddToPlanning={
          selectedRecipe
            ? () => {
                addRecipeToAccepted(selectedRecipe);
                setSelectedRecipe(null);
                setActiveTab("swipe");
              }
            : undefined
        }
      />
    </div>
  );
}
