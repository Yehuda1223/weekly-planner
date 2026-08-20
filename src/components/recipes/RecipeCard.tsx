import React from 'react';
import { Clock, Edit2, Trash2, Star, MessageSquare, Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Recipe, UserProfile, FamilyGroup } from '@/src/types';
import { ItemScopeBadge } from '@/src/components/common/ItemScopeBadge';

interface RecipeCardProps {
  recipe: Recipe;
  currentUser?: UserProfile | null;
  activeGroup?: FamilyGroup | null;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isSuperAdmin?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  currentUser,
  activeGroup,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  isSuperAdmin = false
}) => {
  const isCreator = Boolean(
    currentUser && !currentUser.isGuest && (
      (recipe.createdBy && recipe.createdBy === currentUser.id) ||
      (recipe.creatorEmail && recipe.creatorEmail.toLowerCase() === currentUser.email.toLowerCase())
    )
  );

  const canEditOrDelete = Boolean(currentUser && !currentUser.isGuest && (isSuperAdmin || isCreator));

  // 🛡️ Moderation Authority Check
  const isGroupAdminForThisRecipe = Boolean(
    recipe.groupId && activeGroup && activeGroup.id === recipe.groupId && activeGroup.createdBy === currentUser?.id
  );
  const canModerate = Boolean(
    (recipe.status === 'pending_super_admin' && isSuperAdmin) ||
    (recipe.status === 'pending_group_admin' && (isGroupAdminForThisRecipe || isSuperAdmin))
  );

  const ratings = recipe.ratings || [];
  const averageRating = ratings.length > 0
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : null;

  const displayCategory =
    recipe.category === 'Breakfast' || recipe.category === 'בוקר' ? 'בוקר' :
    recipe.category === 'Lunch' || recipe.category === 'צהריים' ? 'צהריים' :
    recipe.category === 'Dinner' || recipe.category === 'ערב' ? 'ערב' :
    recipe.category === 'Dessert' || recipe.category === 'קינוח' ? 'קינוח' : recipe.category;

  return (
    <div
      onClick={() => onView(recipe)}
      className={`group bg-slate-50 dark:bg-zinc-800/40 border rounded-2xl p-3 flex gap-3 cursor-pointer hover:shadow-md transition-all duration-200 ${
        recipe.status === 'pending_super_admin'
          ? 'border-amber-300 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/10'
          : recipe.status === 'pending_group_admin'
          ? 'border-blue-300 dark:border-blue-800/60 bg-blue-50/30 dark:bg-blue-950/10'
          : recipe.status === 'rejected'
          ? 'border-rose-300 dark:border-rose-800/60 bg-rose-50/30 dark:bg-rose-950/10 opacity-75'
          : 'border-slate-100 dark:border-zinc-800/50 hover:border-orange-500/30 dark:hover:border-orange-500/20'
      }`}
    >
      {/* Image Thumbnail or Color Gradient */}
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative shadow-inner bg-slate-200 dark:bg-zinc-800">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-tr ${
              recipe.image_gradient || 'from-orange-400 to-amber-500'
            } flex items-center justify-center text-white/90 text-2xl font-bold`}
          >
            {recipe.title.charAt(0)}
          </div>
        )}
      </div>

      {/* Text Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0 text-right">
        <div>
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                {displayCategory}
              </span>
              {/* 🏷️ Crystal-clear Scope & Group Badge */}
              <ItemScopeBadge item={recipe} currentUser={currentUser} activeGroup={activeGroup} />

              {/* 🛡️ Moderation Status Badges */}
              {recipe.status === 'pending_super_admin' && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-2xs">
                  ⏳ ממתין למנהל בכיר
                </span>
              )}
              {recipe.status === 'pending_group_admin' && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 shadow-2xs">
                  ⏳ ממתין למנהל קבוצה
                </span>
              )}
              {recipe.status === 'rejected' && (
                <span 
                  className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-2xs"
                  title={recipe.rejectionReason ? `סיבה: ${recipe.rejectionReason}` : undefined}
                >
                  ❌ נדחה{recipe.rejectionReason ? `: ${recipe.rejectionReason}` : ''}
                </span>
              )}
            </div>

            <span className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> {recipe.prep_time}
            </span>
          </div>

          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm mt-0.5 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
            {recipe.title}
          </h3>

          <p className="text-slate-500 dark:text-zinc-400 text-xs line-clamp-1 mt-0.5">
            {recipe.description}
          </p>
        </div>

        {/* Footer Meta: Rating, Comments, Creator */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 pt-1 border-t border-slate-200/40 dark:border-zinc-700/30">
          <div className="flex items-center gap-2">
            {averageRating && (
              <span className="flex items-center gap-0.5 text-amber-500 font-black">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{averageRating}</span>
              </span>
            )}
            {recipe.comments && recipe.comments.length > 0 && (
              <span className="flex items-center gap-0.5">
                <MessageSquare className="w-3 h-3 text-slate-400" />
                <span>{recipe.comments.length}</span>
              </span>
            )}
            <span className="truncate max-w-[80px]">
              {recipe.creatorName || 'משתמש'}
            </span>
          </div>

          <span className="font-medium">
            {recipe.ingredients.length} רכיבים
          </span>
        </div>
      </div>

      {/* Action Buttons: Moderation OR Edit/Delete */}
      <div className="flex items-center gap-1.5 flex-shrink-0 self-center">
        {/* 🛡️ Moderation Buttons (Approve / Reject) for Authorized Admins */}
        {canModerate && (
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-xs">
            {onApprove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove(recipe.id);
                }}
                className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                title="אשר ופרסם מתכון זה"
              >
                <Check className="w-3.5 h-3.5" />
                <span>אשר</span>
              </button>
            )}
            {onReject && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(recipe.id);
                }}
                className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 active:scale-95 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                title="דחה מתכון זה"
              >
                <X className="w-3.5 h-3.5" />
                <span>דחה</span>
              </button>
            )}
          </div>
        )}

        {/* Regular Edit / Delete for Creator or Super Admin */}
        {canEditOrDelete && !canModerate && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(recipe);
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-orange-100 active:scale-95 dark:bg-zinc-800 dark:hover:bg-orange-950/40 text-slate-500 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400 transition-all cursor-pointer flex items-center justify-center border border-slate-200/40 dark:border-zinc-700/40"
              title="עריכת מתכון"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(recipe.id);
                }}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center justify-center border border-rose-200/50 dark:border-rose-900/40"
                title="מחיקת מתכון (מנהל בכיר)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
