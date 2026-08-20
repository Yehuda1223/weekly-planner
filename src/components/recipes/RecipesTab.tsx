import React, { useState } from 'react';
import { Search, Plus, Utensils, Lock, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import { Recipe, UserProfile, FamilyGroup } from '@/src/types';
import { CATEGORIES } from '@/src/constants/defaults';
import { RecipeCard } from './RecipeCard';

interface RecipesTabProps {
  recipes: Recipe[];
  currentUser?: UserProfile | null;
  activeGroup?: FamilyGroup | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onOpenAddModal: () => void;
  onViewRecipe: (recipe: Recipe) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onApproveRecipe?: (id: string) => void;
  onRejectRecipe?: (id: string) => void;
  pendingModerationRecipes?: Recipe[];
  isSuperAdmin?: boolean;
}

export const RecipesTab: React.FC<RecipesTabProps> = ({
  recipes,
  currentUser,
  activeGroup,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onOpenAddModal,
  onViewRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onApproveRecipe,
  onRejectRecipe,
  pendingModerationRecipes = [],
  isSuperAdmin = false
}) => {
  const isGuest = !currentUser || currentUser.isGuest;
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);

  // Check if current user has recipes pending or is admin with recipes to review
  const pendingCount = pendingModerationRecipes.length;
  const myPendingCount = recipes.filter(r => 
    r.status === 'pending_super_admin' || r.status === 'pending_group_admin'
  ).length;

  const displayedRecipes = filterPendingOnly
    ? recipes.filter(r => r.status === 'pending_super_admin' || r.status === 'pending_group_admin')
    : recipes;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 🛡️ Admin Moderation Banner (When there are items to review) */}
      {pendingCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-scaleUp">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                מתכונים הממתינים לאישורך ({pendingCount})
              </h4>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400">
                {isSuperAdmin ? 'מתכונים לפרסום כללי הממתינים לבדיקה ואישור' : 'מתכונים שנשלחו לשיתוף בקבוצה שלך'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterPendingOnly(!filterPendingOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs ${
              filterPendingOnly
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-zinc-800 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
            }`}
          >
            {filterPendingOnly ? 'הצג את כל המתכונים' : 'סנן לבדיקה'}
          </button>
        </div>
      )}

      {/* 📌 Sticky Header: Search & Category Pills (Always visible during scroll) */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md -mx-4 px-4 pt-1 pb-2.5 space-y-2.5 border-b border-slate-100 dark:border-zinc-800/80 shadow-2xs">
        {/* Search & Add Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="חיפוש מתכון או רכיב..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 transition-all shadow-2xs"
            />
          </div>
          <button
            onClick={onOpenAddModal}
            disabled={isGuest}
            className={`px-3 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all flex-shrink-0 shadow-sm ${
              isGuest
                ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-300 dark:border-zinc-700 opacity-60 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20 active:scale-95 cursor-pointer'
            }`}
            title={isGuest ? 'במצב אורח לא ניתן להוסיף מתכונים - יש להתחבר' : 'הוספת מתכון חדש'}
          >
            {isGuest ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : <Plus className="w-4 h-4" />}
            <span className="hidden sm:inline">מתכון חדש</span>
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => {
                setFilterPendingOnly(false);
                onCategoryChange(category);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                !filterPendingOnly && selectedCategory === category
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              {category}
            </button>
          ))}

          {/* Special Pending Filter Pill (If user has pending items or is admin) */}
          {(pendingCount > 0 || myPendingCount > 0) && (
            <button
              type="button"
              onClick={() => setFilterPendingOnly(!filterPendingOnly)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                filterPendingOnly
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>ממתינים לאישור ({filterPendingOnly ? displayedRecipes.length : (pendingCount || myPendingCount)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Recipes Grid */}
      {displayedRecipes.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Utensils className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto" />
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            {filterPendingOnly ? 'אין מתכונים הממתינים לאישור כרגע' : 'לא נמצאו מתכונים'}
          </p>
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            {filterPendingOnly ? 'כל המתכונים מאושרים או שעדיין לא הוגשו בקשות.' : 'נסו חיפוש אחר או הוסיפו מתכון חדש.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {displayedRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              currentUser={currentUser}
              activeGroup={activeGroup}
              onView={onViewRecipe}
              onEdit={onEditRecipe}
              onDelete={onDeleteRecipe}
              onApprove={onApproveRecipe}
              onReject={onRejectRecipe}
              isSuperAdmin={isSuperAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};
