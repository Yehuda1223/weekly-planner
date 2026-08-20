import React from 'react';
import { Lock, Users, Sparkles, Globe } from 'lucide-react';
import { UserProfile, FamilyGroup } from '@/src/types';

interface ItemScopeBadgeProps {
  item: {
    createdBy?: string;
    creatorName?: string;
    creatorEmail?: string;
    userId?: string;
    groupId?: string;
    isShared?: boolean;
    is_public?: boolean;
  };
  currentUser?: UserProfile | null;
  activeGroup?: FamilyGroup | null;
  className?: string;
}

export const ItemScopeBadge: React.FC<ItemScopeBadgeProps> = ({
  item,
  currentUser,
  activeGroup,
  className = ''
}) => {
  const isMine = Boolean(
    currentUser && !currentUser.isGuest && (
      (item.createdBy && item.createdBy === currentUser.id) ||
      (item.userId && item.userId === currentUser.id) ||
      (item.creatorEmail && item.creatorEmail.toLowerCase() === currentUser.email?.toLowerCase())
    )
  );

  const isSystem = !item.createdBy && !item.userId && !item.groupId;

  // 1. Public Recipe (Community)
  if (item.is_public === true) {
    return (
      <span 
        className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950/60 dark:to-amber-950/60 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-900/40 shadow-2xs ${className}`}
        title={isMine ? 'מתכון ציבורי שיצרת - גלוי לכולם' : `מתכון ציבורי מהקהילה (נוצר ע״י ${item.creatorName || 'משתמש'})`}
      >
        <Globe className="w-2.5 h-2.5 text-orange-500" />
        <span>🌐 קהילתי {isMine ? '(שלי)' : ''}</span>
      </span>
    );
  }

  // 2. System Default Items
  if (isSystem) {
    return (
      <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 ${className}`}>
        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
        <span>מערכת</span>
      </span>
    );
  }

  // 3. User's OWN items
  if (isMine) {
    if (item.isShared === false || (!item.groupId && item.isShared === false)) {
      return (
        <span 
          className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-purple-100/90 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40 shadow-2xs ${className}`}
          title="פריט פרטי אישי שלך בלבד"
        >
          <Lock className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
          <span>🔒 אישי (רק אני)</span>
        </span>
      );
    }
    return (
      <span 
        className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 shadow-2xs ${className}`}
        title="פריט שלך שמשותף לקבוצה"
      >
        <Users className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
        <span>👥 קבוצתי (שלי)</span>
      </span>
    );
  }

  // 4. Belong to another group member
  return (
    <span 
      className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-teal-100/90 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200/60 dark:border-teal-900/40 shadow-2xs ${className}`}
      title={`שותף בקבוצה על ידי ${item.creatorName || 'חבר קבוצה'}`}
    >
      <Users className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
      <span>👥 קבוצתי ({item.creatorName || activeGroup?.name || 'משותף'})</span>
    </span>
  );
};
