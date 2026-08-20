import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle, 
  Trash2, 
  Edit2, 
  Star, 
  MessageSquare, 
  CornerDownLeft, 
  Send, 
  User, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Crown,
  Check
} from 'lucide-react';
import { Recipe, UserProfile, FamilyGroup } from '@/src/types';
import { scaleIngredient } from '@/src/utils/ingredientUtils';
import { ItemScopeBadge } from '@/src/components/common/ItemScopeBadge';

interface RecipeDetailModalProps {
  recipe: Recipe;
  currentUser: UserProfile | null;
  activeGroup?: FamilyGroup | null;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRate?: (recipeId: string, rating: number) => void;
  onAddComment?: (recipeId: string, content: string) => void;
  onAddReply?: (recipeId: string, commentId: string, content: string) => void;
  isSuperAdmin?: boolean;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  currentUser,
  activeGroup,
  onClose,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onRate,
  onAddComment,
  onAddReply,
  isSuperAdmin = false
}) => {
  const [servings, setServings] = useState<number>(4);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showRatingsList, setShowRatingsList] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Check if current user can edit or delete this recipe
  const isCreator = Boolean(
    currentUser && !currentUser.isGuest && (
      (recipe.createdBy && recipe.createdBy === currentUser.id) ||
      (recipe.creatorEmail && recipe.creatorEmail.toLowerCase() === currentUser.email.toLowerCase())
    )
  );

  const canEditOrDelete = Boolean(currentUser && !currentUser.isGuest && (isSuperAdmin || isCreator));

  // Calculate Average Rating
  const ratings = recipe.ratings || [];
  const averageRating = ratings.length > 0
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : null;

  const userExistingRating = currentUser 
    ? ratings.find(r => r.userId === currentUser.id || r.userName === currentUser.displayName)?.rating || 0
    : 0;

  const displayCategory =
    recipe.category === 'Breakfast' || recipe.category === 'בוקר' ? 'בוקר' :
    recipe.category === 'Lunch' || recipe.category === 'צהריים' ? 'צהריים' :
    recipe.category === 'Dinner' || recipe.category === 'ערב' ? 'ערב' :
    recipe.category === 'Dessert' || recipe.category === 'קינוח' ? 'קינוח' : recipe.category;

  const formattedCreatedAt = recipe.createdAt 
    ? new Date(recipe.createdAt).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'מתכון מקורי במערכת';

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !onAddComment) return;
    onAddComment(recipe.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleReplySubmit = (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !onAddReply) return;
    onAddReply(recipe.id, commentId, replyText.trim());
    setReplyText('');
    setReplyingToCommentId(null);
  };

  const handleRatingSubmit = () => {
    if (!onRate || selectedRating === 0) return;
    onRate(recipe.id, selectedRating);
  };

  // Helper to render author role badge (Super Admin or Recipe Creator)
  const renderAuthorBadge = (authorName: string, authorEmail?: string, authorId?: string) => {
    const isSuperAdminUser = 
      authorName === 'יהודה זילבר' ||
      authorId === 'u_admin_yehuda' ||
      (authorEmail && (authorEmail.toLowerCase() === 'yz0556774323@gmail.com' || authorEmail.toLowerCase() === 'yz0556774323@gmil.com'));

    const isRecipeCreatorUser = 
      (recipe.createdBy && authorId === recipe.createdBy) ||
      (recipe.creatorEmail && authorEmail && authorEmail.toLowerCase() === recipe.creatorEmail.toLowerCase()) ||
      authorName === (recipe.creatorName || 'יהודה זילבר');

    if (isSuperAdminUser) {
      return (
        <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black px-1.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-700 flex items-center gap-0.5 shadow-2xs">
          <Crown className="w-2.5 h-2.5 text-amber-500" /> מנהל בכיר
        </span>
      );
    }

    if (isRecipeCreatorUser) {
      return (
        <span className="text-[9px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-black px-1.5 py-0.5 rounded-md border border-orange-300 dark:border-orange-700 flex items-center gap-0.5 shadow-2xs">
          👨‍🍳 יוצר המתכון
        </span>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col animate-scaleUp">
        
        {/* Banner Image or Gradient */}
        <div className="relative h-48 w-full bg-slate-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-tr ${
                recipe.image_gradient || 'from-orange-400 to-amber-500'
              } flex items-center justify-center text-white text-4xl font-black`}
            >
              {recipe.title.charAt(0)}
            </div>
          )}

          {/* Close button on banner */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category Badge overlay */}
          <span className="absolute bottom-4 right-4 text-[10px] font-extrabold bg-white/90 dark:bg-zinc-900/90 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full uppercase shadow-md backdrop-blur-md">
            {displayCategory}
          </span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 text-right flex-1">
          
          {/* 🛡️ Moderation Status Banner (If Pending or Rejected) */}
          {(recipe.status === 'pending_super_admin' || recipe.status === 'pending_group_admin' || recipe.status === 'rejected') && (
            <div className={`p-3.5 rounded-2xl border space-y-2 ${
              recipe.status === 'pending_super_admin'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                : recipe.status === 'pending_group_admin'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {recipe.status === 'rejected' ? '❌' : '⏳'}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                      {recipe.status === 'pending_super_admin'
                        ? 'מתכון זה נשלח לפרסום כללי וממתין לאישור מנהל בכיר'
                        : recipe.status === 'pending_group_admin'
                        ? 'מתכון זה נשלח לקבוצה וממתין לאישור מנהל הקבוצה'
                        : `מתכון זה נדחה${recipe.rejectionReason ? `: ${recipe.rejectionReason}` : ''}`}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      {recipe.status === 'rejected' ? 'באפשרותך לערוך את המתכון ולהגישו שוב.' : 'רק אתה והמנהל האחראי יכולים לצפות במתכון זה כרגע.'}
                    </p>
                  </div>
                </div>

                {/* Quick Admin Actions inside modal */}
                {((recipe.status === 'pending_super_admin' && isSuperAdmin) ||
                  (recipe.status === 'pending_group_admin' && (isSuperAdmin || (activeGroup && activeGroup.id === recipe.groupId && activeGroup.createdBy === currentUser?.id)))) && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {onApprove && (
                      <button
                        type="button"
                        onClick={() => {
                          onApprove(recipe.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>אשר מתכון</span>
                      </button>
                    )}
                    {onReject && (
                      <button
                        type="button"
                        onClick={() => {
                          onReject(recipe.id);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-bold text-xs transition-all cursor-pointer"
                      >
                        דחה
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title & Prep Time */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">{recipe.title}</h2>
              {/* Creator & Date Metadata */}
              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
                <span className="flex items-center gap-1 font-semibold">
                  <User className="w-3 h-3 text-orange-500" />
                  <span>שף: <strong>{recipe.creatorName || 'משתמש'}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{formattedCreatedAt}</span>
                </span>
              </div>
            </div>

            <div className="text-left flex-shrink-0">
              <span className="text-xs text-slate-400 dark:text-zinc-550 block">זמן הכנה</span>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1 mt-0.5 justify-end">
                <Clock className="w-3.5 h-3.5 text-orange-500" /> {recipe.prep_time}
              </span>
            </div>
          </div>

          {/* ⭐ Star Rating & Selection with Explicit Submission */}
          <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  <span className="text-sm font-black text-slate-800 dark:text-zinc-100">
                    {averageRating ? averageRating : 'ללא דירוג'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  ({ratings.length} {ratings.length === 1 ? 'דירוג' : 'דירוגים'})
                </span>
              </div>

              {ratings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRatingsList(!showRatingsList)}
                  className="text-[11px] text-amber-700 dark:text-amber-300 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>מי דירג?</span>
                  {showRatingsList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>

            {/* Interactive Stars Selector: Pick + Submit Button */}
            {currentUser && onRate && (
              <div className="pt-2.5 border-t border-amber-200/50 dark:border-amber-900/30">
                {userExistingRating > 0 ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600 dark:text-zinc-300">
                      הדירוג שלך למתכון:
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-black">
                      <span>{'★'.repeat(userExistingRating)}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                        נשלח ✓
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-300">
                        בחר דירוג:
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = (hoverRating || selectedRating) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setSelectedRating(star)}
                              className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                            >
                              <Star
                                className={`w-5 h-5 transition-colors ${
                                  isFilled
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-300 dark:text-zinc-600'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedRating > 0 && (
                      <button
                        type="button"
                        onClick={handleRatingSubmit}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 self-end sm:self-auto"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>שלח דירוג ({selectedRating} כוכבים)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* List of who rated */}
            {showRatingsList && ratings.length > 0 && (
              <div className="pt-2 border-t border-amber-200/50 dark:border-amber-900/30 space-y-1.5 max-h-32 overflow-y-auto text-xs">
                {ratings.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] bg-white/70 dark:bg-zinc-800/60 p-2 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-700 dark:text-zinc-200">{r.userName}</span>
                      {renderAuthorBadge(r.userName, undefined, r.userId)}
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <span>{'★'.repeat(r.rating)}</span>
                      <span className="text-[10px] text-slate-400 mr-1.5">
                        {new Date(r.createdAt).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Servings Selector */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/40 px-3.5 py-2.5 rounded-2xl border border-slate-100 dark:border-zinc-800/30">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">כמות מנות:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setServings(prev => Math.max(1, prev - 1))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 font-bold active:scale-90 transition-transform cursor-pointer"
              >
                -
              </button>
              <span className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 w-6 text-center">
                {servings}
              </span>
              <button
                type="button"
                onClick={() => setServings(prev => Math.min(24, prev + 1))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 font-bold active:scale-90 transition-transform cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Description */}
          {recipe.description && (
            <div>
              <p className="text-sm text-slate-600 dark:text-zinc-300 italic leading-relaxed">
                "{recipe.description}"
              </p>
            </div>
          )}

          {/* Ingredients */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">רכיבים</h4>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-700 dark:text-zinc-200 flex items-start gap-2 bg-slate-50 dark:bg-zinc-800/40 px-3 py-2 rounded-xl border border-slate-100/50 dark:border-zinc-800/30"
                >
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>{scaleIngredient(ing, servings)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-4">
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">הוראות הכנה</h4>
            <p className="text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-zinc-800/20 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/50">
              {recipe.instructions}
            </p>
          </div>

          {/* 💬 Comments & Replies Section */}
          <div className="space-y-3 border-t border-slate-100 dark:border-zinc-800 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400 tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                <span>תגובות ({recipe.comments?.length || 0})</span>
              </h4>
            </div>

            {/* Add New Comment Box */}
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="כתוב תגובה על המתכון..."
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>שלח</span>
                </button>
              </form>
            ) : (
              <p className="text-[11px] text-slate-400">התחבר כדי לכתוב תגובות ולדרג את המתכון.</p>
            )}

            {/* List of Comments & Nested Replies */}
            <div className="space-y-2.5 pt-1">
              {(!recipe.comments || recipe.comments.length === 0) ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-2">
                  עדיין אין תגובות. היה הראשון להגיב!
                </p>
              ) : (
                recipe.comments.map(comment => (
                  <div
                    key={comment.id}
                    className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 rounded-2xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 font-extrabold flex items-center justify-center text-[10px]">
                          {comment.userName.charAt(0)}
                        </div>
                        <span className="font-extrabold text-slate-800 dark:text-zinc-100">{comment.userName}</span>
                        {/* Author Role Badge */}
                        {renderAuthorBadge(comment.userName, comment.userEmail, comment.userId)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleDateString('he-IL')}
                      </span>
                    </div>

                    <p className="text-slate-700 dark:text-zinc-300 pr-8">
                      {comment.content}
                    </p>

                    {/* Reply Button */}
                    {currentUser && (
                      <div className="pr-8 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
                          className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CornerDownLeft className="w-3 h-3" />
                          <span>השב לתגובה</span>
                        </button>
                      </div>
                    )}

                    {/* Nested Replies List */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mr-6 space-y-1.5 pt-1 border-r-2 border-orange-200 dark:border-orange-900/50 pr-3">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="p-2 bg-white dark:bg-zinc-800 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800 dark:text-zinc-200 text-[11px]">{reply.userName}</span>
                                {renderAuthorBadge(reply.userName, reply.userEmail, reply.userId)}
                              </div>
                              <span className="text-[9px] text-slate-400">{new Date(reply.createdAt).toLocaleDateString('he-IL')}</span>
                            </div>
                            <p className="text-slate-600 dark:text-zinc-300 text-[11px]">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input Form */}
                    {replyingToCommentId === comment.id && (
                      <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="mr-6 flex gap-1.5 pt-1">
                        <input
                          type="text"
                          required
                          placeholder={`תגובה ל-${comment.userName}...`}
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-[11px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 dark:text-zinc-100"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 bg-orange-500 text-white rounded-lg text-[10px] font-bold cursor-pointer hover:bg-orange-600"
                        >
                          השב
                        </button>
                      </form>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions: Edit & Delete (Creator or Super Admin ONLY) */}
          <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 flex gap-2">
            {canEditOrDelete && (
              <button
                type="button"
                onClick={() => onDelete(recipe.id)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-400 p-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-rose-100 dark:border-rose-900/30 cursor-pointer"
                title="מחק מתכון"
              >
                <Trash2 className="w-4 h-4" /> מחק
              </button>
            )}
            
            {canEditOrDelete && (
              <button
                type="button"
                onClick={() => onEdit(recipe)}
                className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 dark:text-orange-400 py-3 rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1 border border-orange-100 dark:border-orange-900/30 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" /> עריכת מתכון
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                canEditOrDelete 
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200' 
                  : 'flex-1 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3'
              }`}
            >
              סגור
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
