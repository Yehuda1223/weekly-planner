'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, ShoppingBag, Dumbbell, Heart, CheckSquare } from 'lucide-react';
import { TabType, Recipe } from '@/src/types';
import { useRecipesData } from '@/src/hooks/useRecipesData';
import { Header } from '@/src/components/layout/Header';
import { InvitationsBanner } from '@/src/components/layout/InvitationsBanner';
import { RecipesTab } from '@/src/components/recipes/RecipesTab';
import { RecipeDetailModal } from '@/src/components/recipes/RecipeDetailModal';
import { RecipeFormModal } from '@/src/components/recipes/RecipeFormModal';
import { MealPlannerTab } from '@/src/components/planner/MealPlannerTab';
import { AssignMealModal } from '@/src/components/planner/AssignMealModal';
import { ShoppingListTab } from '@/src/components/shopping/ShoppingListTab';
import { SaveListModal } from '@/src/components/shopping/SaveListModal';
import { FitnessTab } from '@/src/components/fitness/FitnessTab';
import { DatesTab } from '@/src/components/dates/DatesTab';
import { TasksTab } from '@/src/components/tasks/TasksTab';
import { AuthModal } from '@/src/components/auth/AuthModal';
import { ResetPasswordModal } from '@/src/components/auth/ResetPasswordModal';
import { GroupManagementModal } from '@/src/components/auth/GroupManagementModal';
import { TabSettingsModal } from '@/src/components/layout/TabSettingsModal';
import { AboutAppModal } from '@/src/components/common/AboutAppModal';
import { supabase } from '@/src/lib/supabaseClient';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('recipes');

  // Local Modal States
  const [viewedRecipe, setViewedRecipe] = useState<Recipe | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [activePlannerSlot, setActivePlannerSlot] = useState<{ day: string; meal: string; existingItem?: any } | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  // Auth, Sharing & Settings Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isShareGroupModalOpen, setIsShareGroupModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Custom Data Hook
  const {
    syncStatus,
    currentUser,
    registeredUsers,
    enabledTabs,
    handleSaveEnabledTabs,
    handleLogin,
    handleRegister,
    handleVerifyCode,
    handleVerifyAccount,
    handleResendVerificationEmail,
    handleResetPassword,
    handleLogout,
    handleContinueAsGuest,
    handleDeleteUser,
    handleSaveSharingPermissions,
    recipes,
    mealPlan,
    customShoppingItems,
    savedLists,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    checkedIngredients,
    filteredRecipes,
    shoppingList,
    categorizedShoppingList,
    weekOffset,
    setWeekOffset,
    toggleMealCompletion,
    copyPastWeekPlan,
    workouts,
    workoutLogs,
    fitnessGoal,
    dateSpots,
    handleAddDateSpot,
    handleUpdateDateSpot,
    handleDeleteDateSpot,
    handleIncrementVisitCount,
    // 📝 Tasks & Notes
    tasks,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    handleToggleTaskCompleted,
    handleAssignTaskToPlanner,
    handleAddWorkout,
    handleUpdateWorkout,
    handleDeleteWorkout,
    handleUpdateExerciseWeight,
    handleLogWorkoutCompleted,
    handleAddRecipe,
    handleDeleteRecipe,
    handleUpdateRecipe,
    handleApproveRecipe,
    handleRejectRecipe,
    handleToggleUserPublicPublishPermission,
    handleToggleMemberGroupPublishPermission,
    pendingModerationRecipes,
    handleRateRecipe,
    handleAddComment,
    handleAddReply,
    handleAssignMeal,
    handleDeleteMealPlanItem,
    clearMealPlanner,
    handleAddCustomItem,
    handleDeleteCustomItem,
    handleSaveShoppingList,
    handleDeleteSavedList,
    toggleIngredientCheck,
    shareShoppingList,
    updateMealPlanItemData,
    // 👥 Groups & Invitations
    groups,
    activeGroup,
    invitations,
    pendingInvitations,
    handleCreateGroup,
    handleSwitchGroup,
    handleInviteToGroup,
    handleRespondInvitation,
    handleRemoveGroupMember,
    handleUpdateGroupPermissions,
    handleDeleteGroup,
    handleCancelInvitation
  } = useRecipesData();

  // Compute effective enabled tabs considering active group member permissions
  const groupMemberPerms = activeGroup?.members?.find(m => m.userId === currentUser?.id || m.email?.toLowerCase() === currentUser?.email?.toLowerCase())?.permissions;
  const effectiveEnabledTabs: EnabledTabsConfig = {
    recipes: enabledTabs.recipes !== false,
    planner: enabledTabs.planner !== false && (groupMemberPerms ? groupMemberPerms.planner !== false : true),
    shopping: enabledTabs.shopping !== false && (groupMemberPerms ? groupMemberPerms.shopping !== false : true),
    fitness: enabledTabs.fitness !== false && (groupMemberPerms ? groupMemberPerms.fitness !== false : true),
    dates: enabledTabs.dates !== false && (groupMemberPerms ? groupMemberPerms.dates !== false : true),
    tasks: enabledTabs.tasks !== false && (groupMemberPerms ? groupMemberPerms.tasks !== false : true)
  };

  // Check for email verification link in URL hash (#type=verify&email=...&token=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.includes('type=verify')) {
      const params = new URLSearchParams(hash.substring(1));
      const email = params.get('email');
      const token = params.get('token');
      if (email && token) {
        const res = handleVerifyAccount(email, token);
        alert(res.message);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [handleVerifyAccount]);

  // Recipe Modal Handlers
  const handleOpenAddModal = () => {
    if (!currentUser || currentUser.isGuest) {
      alert('מצב אורח הינו לצפייה בלבד. יש להתחבר או להירשם כדי להוסיף מתכון חדש.');
      setIsAuthModalOpen(true);
      return;
    }
    setEditingRecipe(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (recipe: Recipe) => {
    if (!currentUser || currentUser.isGuest) {
      alert('מצב אורח הינו לצפייה בלבד. יש להתחבר או להירשם כדי לערוך מתכונים.');
      setIsAuthModalOpen(true);
      return;
    }
    setViewedRecipe(null);
    setEditingRecipe(recipe);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (recipeData: Omit<Recipe, 'id'>) => {
    if (editingRecipe) {
      handleUpdateRecipe(editingRecipe.id, recipeData);
    } else {
      handleAddRecipe(recipeData);
    }
    setIsFormModalOpen(false);
    setEditingRecipe(null);
  };

  // Assign Meal Handler
  const handleOpenAssignModal = (day: string, meal: string, existingItem?: any) => {
    if (!currentUser || currentUser.isGuest) {
      alert('מצב אורח הינו לצפייה בלבד. יש להתחבר או להירשם כדי לשבץ תוכניות.');
      setIsAuthModalOpen(true);
      return;
    }
    setActivePlannerSlot({ day, meal, existingItem });
  };

  // Get current assigned meal/workout/date for slot
  const currentSlotAssignment = activePlannerSlot
    ? mealPlan.find(item => item.day === activePlannerSlot.day && item.meal === activePlannerSlot.meal)
    : undefined;

  // Save List Title formatting
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  const defaultSaveTitle = `רשימה לשבוע של ${dateStr}`;

  // 🔑 Detect Password Recovery Email Link on Mount or Auth Event
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash.includes('type=recovery')) {
        setIsResetPasswordModalOpen(true);
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetPasswordModalOpen(true);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <div className="h-screen max-h-screen bg-slate-100 dark:bg-zinc-950 font-sans flex flex-col antialiased overflow-hidden">
      {/* Mobile Frame Container - Fixed Viewport Height */}
      <div className="w-full max-w-md mx-auto h-full max-h-[100dvh] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col relative overflow-hidden border-x border-slate-200 dark:border-zinc-800">
        
        {/* Sticky Header with App Name, Chef Logo, Settings, Active Group & User Auth Status */}
        <Header 
          syncStatus={syncStatus}
          currentUser={currentUser}
          activeGroup={activeGroup}
          pendingInvitationsCount={pendingInvitations.length}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenShareGroup={() => setIsShareGroupModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenAbout={() => setIsAboutModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* 🔔 In-App Invitations Notification Banner */}
        <InvitationsBanner 
          invitations={pendingInvitations} 
          onRespond={handleRespondInvitation} 
        />

        {/* Main Content Area (Scrolls independently while bottom nav stays pinned) */}
        <main className="flex-1 p-4 overflow-y-auto pb-4">
          {activeTab === 'recipes' && effectiveEnabledTabs.recipes && (
            <RecipesTab
              recipes={filteredRecipes}
              currentUser={currentUser}
              activeGroup={activeGroup}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onOpenAddModal={handleOpenAddModal}
              onViewRecipe={setViewedRecipe}
              onEditRecipe={handleOpenEditModal}
              onDeleteRecipe={handleDeleteRecipe}
              onApproveRecipe={handleApproveRecipe}
              onRejectRecipe={handleRejectRecipe}
              pendingModerationRecipes={pendingModerationRecipes}
              isSuperAdmin={currentUser?.isSuperAdmin}
            />
          )}

          {activeTab === 'planner' && effectiveEnabledTabs.planner && (
            <MealPlannerTab
              mealPlan={mealPlan}
              recipes={recipes}
              workouts={workouts}
              dateSpots={dateSpots}
              tasks={tasks}
              enabledTabs={effectiveEnabledTabs}
              weekOffset={weekOffset}
              setWeekOffset={setWeekOffset}
              onOpenAssignModal={handleOpenAssignModal}
              onAssignMeal={handleAssignMeal}
              onDeleteMealPlanItem={handleDeleteMealPlanItem}
              onClearMealPlanner={clearMealPlanner}
              onToggleCompletion={toggleMealCompletion}
              onCopyPastWeek={copyPastWeekPlan}
              onUpdatePlanItem={updateMealPlanItemData}
              isGuest={!currentUser || currentUser.isGuest}
            />
          )}

          {activeTab === 'shopping' && effectiveEnabledTabs.shopping && (
            <ShoppingListTab
              shoppingListCount={shoppingList.length}
              customShoppingItems={customShoppingItems}
              categorizedShoppingList={categorizedShoppingList}
              checkedIngredients={checkedIngredients}
              savedLists={savedLists}
              onAddCustomItem={handleAddCustomItem}
              onDeleteCustomItem={handleDeleteCustomItem}
              onToggleIngredientCheck={toggleIngredientCheck}
              onShareShoppingList={shareShoppingList}
              onOpenSaveModal={() => setIsSaveModalOpen(true)}
              onDeleteSavedList={handleDeleteSavedList}
              onResetChecks={() => {}}
              isGuest={!currentUser || currentUser.isGuest}
            />
          )}

          {activeTab === 'fitness' && effectiveEnabledTabs.fitness && (
            <FitnessTab
              workouts={workouts}
              currentUser={currentUser}
              activeGroup={activeGroup}
              groups={groups}
              workoutLogs={workoutLogs}
              fitnessGoal={fitnessGoal}
              onAddWorkout={handleAddWorkout}
              onUpdateWorkout={handleUpdateWorkout}
              onDeleteWorkout={handleDeleteWorkout}
              onUpdateExerciseWeight={handleUpdateExerciseWeight}
              onLogWorkoutCompleted={handleLogWorkoutCompleted}
              isGuest={!currentUser || currentUser.isGuest}
            />
          )}

          {activeTab === 'dates' && effectiveEnabledTabs.dates && (
            <DatesTab
              dateSpots={dateSpots}
              currentUser={currentUser}
              activeGroup={activeGroup}
              groups={groups}
              onAddDateSpot={handleAddDateSpot}
              onUpdateDateSpot={handleUpdateDateSpot}
              onDeleteDateSpot={handleDeleteDateSpot}
              onIncrementVisitCount={handleIncrementVisitCount}
              isGuest={!currentUser || currentUser.isGuest}
            />
          )}

          {activeTab === 'tasks' && effectiveEnabledTabs.tasks && (
            <TasksTab
              tasks={tasks}
              currentUser={currentUser}
              activeGroup={activeGroup}
              groups={groups}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onToggleComplete={handleToggleTaskCompleted}
              onAssignToPlanner={handleAssignTaskToPlanner}
              isGuest={!currentUser || currentUser.isGuest}
            />
          )}
        </main>

        {/* 📌 Fixed Bottom Tab Bar Navigation (Always Pinned at Bottom of Screen) */}
        <nav className="h-16 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-t border-slate-150 dark:border-zinc-800/80 grid grid-flow-col auto-cols-fr items-center px-1 z-30 flex-shrink-0">
          
          {effectiveEnabledTabs.recipes && (
            <button
              type="button"
              onClick={() => setActiveTab('recipes')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'recipes'
                  ? 'text-orange-500 font-bold'
                  : 'text-slate-400 dark:text-zinc-550 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-[9px] tracking-tight font-extrabold">מתכונים</span>
            </button>
          )}

          {effectiveEnabledTabs.planner && (
            <button
              type="button"
              onClick={() => setActiveTab('planner')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'planner'
                  ? 'text-orange-500 font-bold'
                  : 'text-slate-400 dark:text-zinc-550 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-[9px] tracking-tight font-extrabold">מתכנן</span>
            </button>
          )}

          {effectiveEnabledTabs.shopping && (
            <button
              type="button"
              onClick={() => setActiveTab('shopping')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all relative cursor-pointer ${
                activeTab === 'shopping'
                  ? 'text-orange-500 font-bold'
                  : 'text-slate-400 dark:text-zinc-550 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-[9px] tracking-tight font-extrabold">קניות</span>
              {(shoppingList.length > 0 || customShoppingItems.length > 0) && (
                <span className="absolute -top-1 right-0.5 w-3.5 h-3.5 rounded-full bg-orange-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {shoppingList.length + customShoppingItems.length}
                </span>
              )}
            </button>
          )}

          {effectiveEnabledTabs.fitness && (
            <button
              type="button"
              onClick={() => setActiveTab('fitness')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'fitness'
                  ? 'text-orange-500 font-bold'
                  : 'text-slate-400 dark:text-zinc-550 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span className="text-[9px] tracking-tight font-extrabold">אימונים</span>
            </button>
          )}

          {effectiveEnabledTabs.dates && (
            <button
              type="button"
              onClick={() => setActiveTab('dates')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'dates'
                  ? 'text-rose-500 font-bold'
                  : 'text-slate-400 dark:text-zinc-550 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              <Heart className="w-4 h-4 fill-rose-500/20" />
              <span className="text-[9px] tracking-tight font-extrabold">דייטים</span>
            </button>
          )}

          {effectiveEnabledTabs.tasks && (
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'text-orange-500 font-bold'
                  : 'text-slate-400 dark:text-zinc-550 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span className="text-[9px] tracking-tight font-extrabold text-center">פתקים ומטלות</span>
            </button>
          )}

        </nav>

        {/* User Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onVerifyCode={handleVerifyCode}
          onResendVerification={handleResendVerificationEmail}
          onResetPassword={handleResetPassword}
          onContinueAsGuest={handleContinueAsGuest}
        />

        {/* Reset Password Modal (Triggered by Recovery Email Link) */}
        <ResetPasswordModal
          isOpen={isResetPasswordModalOpen}
          onClose={() => setIsResetPasswordModalOpen(false)}
          onSuccess={async (newPass) => {
            setIsResetPasswordModalOpen(false);
            const registered = JSON.parse(localStorage.getItem('registered_users') || '[]');
            const email = registered[0]?.email || 'yz0556774323@gmail.com';
            await handleLogin(email, newPass, true);
          }}
        />

        {/* 👥 Group Management & Permissions Modal */}
        <GroupManagementModal
          isOpen={isShareGroupModalOpen}
          onClose={() => setIsShareGroupModalOpen(false)}
          currentUser={currentUser}
          registeredUsers={registeredUsers}
          groups={groups}
          activeGroup={activeGroup}
          invitations={invitations}
          pendingInvitations={pendingInvitations}
          onCreateGroup={handleCreateGroup}
          onSwitchGroup={handleSwitchGroup}
          onInviteToGroup={handleInviteToGroup}
          onRespondInvitation={handleRespondInvitation}
          onRemoveMember={handleRemoveGroupMember}
          onUpdatePermissions={handleUpdateGroupPermissions}
          onDeleteGroup={handleDeleteGroup}
          onCancelInvitation={handleCancelInvitation}
          onDeleteUserAccount={handleDeleteUser}
          onToggleUserPublicPublishPermission={handleToggleUserPublicPublishPermission}
        />

        {/* Tab Visibility Settings Modal */}
        <TabSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          enabledTabs={enabledTabs}
          onSaveEnabledTabs={handleSaveEnabledTabs}
        />

        {/* About App & Engineering Guide Modal */}
        <AboutAppModal
          isOpen={isAboutModalOpen}
          onClose={() => setIsAboutModalOpen(false)}
        />

        {/* Recipe Detail Modal */}
        {viewedRecipe && (
          <RecipeDetailModal
            recipe={recipes.find(r => r.id === viewedRecipe.id) || viewedRecipe}
            currentUser={currentUser}
            activeGroup={activeGroup}
            onClose={() => setViewedRecipe(null)}
            onEdit={handleOpenEditModal}
            onDelete={(id) => {
              handleDeleteRecipe(id);
              setViewedRecipe(null);
            }}
            onApprove={handleApproveRecipe}
            onReject={handleRejectRecipe}
            onRate={handleRateRecipe}
            onAddComment={handleAddComment}
            onAddReply={handleAddReply}
            isSuperAdmin={currentUser?.isSuperAdmin}
          />
        )}

        {/* Recipe Add / Edit Modal */}
        <RecipeFormModal
          isOpen={isFormModalOpen}
          initialRecipe={editingRecipe}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingRecipe(null);
          }}
          onSubmit={handleFormSubmit}
          groups={groups}
          activeGroup={activeGroup}
          currentUser={currentUser}
        />

        {/* Assign Meal / Workout / Date / Task Modal */}
        <AssignMealModal
          isOpen={!!activePlannerSlot}
          activeSlot={activePlannerSlot}
          recipes={recipes}
          workouts={workouts}
          dateSpots={dateSpots}
          tasks={tasks}
          enabledTabs={effectiveEnabledTabs}
          onClose={() => setActivePlannerSlot(null)}
          onAssign={handleAssignMeal}
          onDeleteMealPlanItem={handleDeleteMealPlanItem}
        />

        {/* Save Shopping List Modal */}
        <SaveListModal
          isOpen={isSaveModalOpen}
          defaultTitle={defaultSaveTitle}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleSaveShoppingList}
        />

      </div>
    </div>
  );
}
