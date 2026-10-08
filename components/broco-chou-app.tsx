"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBrocoChouStore } from "@/lib/store";
import type { Recipe } from "@/lib/types";
import { AccountProvider, useAccount } from './account-provider';
import { PersonalRecipes } from './personal-recipes';
import { PersonalRecipeForm } from './personal-recipe-form';
import { RecipeAccount } from './recipe-account';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import type { NavTab } from "./bottom-navigation";
import { BottomNavigation } from "./bottom-navigation";
import { HomeDashboard } from "./home-dashboard";
import { SwipeDeck } from "./swipe-deck";
import { WeeklyCalendar } from "./weekly-calendar";
import { GroceryList } from "./grocery-list";
import { ProfilePage } from "./profile-page";
import { Onboarding } from "./onboarding";
import { RecipeDetailSheet } from "./recipe-detail-sheet";
import { WeeklyPlanEditor } from "./weekly-plan-editor";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function BrocoChouApp() {
  // Keep the creation intent while the account provider reloads after sign-in.
  const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);
  return <AccountProvider><BrocoChouContent isRecipeFormOpen={isRecipeFormOpen} setIsRecipeFormOpen={setIsRecipeFormOpen} /></AccountProvider>;
}

function BrocoChouContent({ isRecipeFormOpen, setIsRecipeFormOpen }: { isRecipeFormOpen: boolean; setIsRecipeFormOpen: (open: boolean) => void }) {
  const { user } = useAccount();
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isPlanEditorOpen, setIsPlanEditorOpen] = useState(false);
  const [planQuery, setPlanQuery] = useState('');
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const {
    hasCompletedOnboarding,
    generateWeeklyPlan,
    createWeeklyPlan,
    generateGroceryList,
    weeklyPlan,
    addRecipeToAccepted,
  } = useBrocoChouStore();

  if (!hasCompletedOnboarding) {
    return <Onboarding />;
  }

  const openRecipeDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const completeSwipe = () => {
    generateWeeklyPlan();
    setIsPlanEditorOpen(false);
    setActiveTab("calendar");
  };

  const openGroceryList = () => {
    generateGroceryList();
    setActiveTab("grocery");
  };

  const openPlanEditor = () => {
    if (!weeklyPlan) createWeeklyPlan();
    setPlanQuery('');
    setIsPlanEditorOpen(true);
  };

  const planPersonalRecipe = (recipe: Recipe) => {
    if (!weeklyPlan) createWeeklyPlan();
    setPlanQuery(recipe.nom);
    setIsPlanEditorOpen(true);
    setActiveTab('calendar');
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
        if (isPlanEditorOpen) {
          return <WeeklyPlanEditor initialQuery={planQuery} onDone={() => setIsPlanEditorOpen(false)} />;
        }
        return (
          <WeeklyCalendar
            onViewRecipe={openRecipeDetails}
            onGenerateGroceryList={openGroceryList}
            onEditPlan={openPlanEditor}
          />
        );
      case "grocery":
        return <GroceryList onBack={() => setActiveTab("calendar")} />;
      case "profile":
        return <><div className="pt-6"><PersonalRecipes onCreate={() => setIsRecipeFormOpen(true)} onView={openRecipeDetails} onPlan={planPersonalRecipe} /></div><ProfilePage onOpenPreferences={() => setActiveTab("home")} /></>;
      default:
        return <HomeDashboard onNavigate={setActiveTab} onViewRecipe={openRecipeDetails} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Toaster />
      {activeTab !== 'profile' && <div className="flex justify-end px-6 pt-3"><button className="rounded-lg border px-3 py-2 text-sm font-medium text-deep-plum" onClick={() => setIsRecipeFormOpen(true)}>Ajouter ma recette</button></div>}
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
      <Dialog open={isRecipeFormOpen} onOpenChange={open => { if (!isSavingRecipe) setIsRecipeFormOpen(open); }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl" showCloseButton={!isSavingRecipe} onInteractOutside={event => event.preventDefault()} onEscapeKeyDown={event => { if (isSavingRecipe) event.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle>Ajouter ma recette</DialogTitle>
            <DialogDescription>Crée ta recette pour l’utiliser dans ton planning. Elle sera publique après validation.</DialogDescription>
          </DialogHeader>
          {user ? <PersonalRecipeForm onBusyChange={setIsSavingRecipe} onCancel={() => setIsRecipeFormOpen(false)} onSaved={() => {
            setIsRecipeFormOpen(false);
            setActiveTab('profile');
            toast.success('Recette enregistrée ! Tu peux maintenant l’ajouter à ton planning.');
          }} /> : <RecipeAccount />}
        </DialogContent>
      </Dialog>
      <RecipeDetailSheet
        recipe={selectedRecipe}
        isOpen={selectedRecipe !== null}
        onClose={() => setSelectedRecipe(null)}
        onAddToPlanning={
          selectedRecipe && (selectedRecipe.moderationStatus === 'approved' || !selectedRecipe.moderationStatus || selectedRecipe.createdBy === user?.id)
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
