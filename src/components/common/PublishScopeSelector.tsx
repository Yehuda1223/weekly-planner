import React from 'react';
import { Lock, Users, Globe, ChevronDown, Sparkles, AlertCircle } from 'lucide-react';
import { FamilyGroup, UserProfile } from '@/src/types';

export type PublishScope = 'private' | 'group' | 'public';

interface PublishScopeSelectorProps {
  scope: PublishScope;
  onChangeScope: (newScope: PublishScope) => void;
  selectedGroupId?: string;
  onChangeGroupId?: (groupId: string) => void;
  groups?: FamilyGroup[];
  activeGroup?: FamilyGroup | null;
  currentUser?: UserProfile | null;
  allowPublic?: boolean; // True ONLY for Recipes!
  className?: string;
}

export const PublishScopeSelector: React.FC<PublishScopeSelectorProps> = ({
  scope,
  onChangeScope,
  selectedGroupId,
  onChangeGroupId,
  groups = [],
  activeGroup,
  currentUser,
  allowPublic = false,
  className = ''
}) => {
  // Find all groups the user is a member or creator of
  const myGroups = groups.filter(g => 
    g.createdBy === currentUser?.id || 
    g.members?.some(m => m.userId === currentUser?.id || (currentUser?.email && m.email?.toLowerCase() === currentUser.email.toLowerCase()))
  );

  const hasGroups = myGroups.length > 0;
  const currentGroupId = selectedGroupId || activeGroup?.id || (myGroups[0]?.id || '');

  const handleScopeClick = (targetScope: PublishScope) => {
    if (targetScope === 'group' && !hasGroups) {
      alert('טרם הצטרפת או יצרת קבוצה. תוכל ליצור קבוצה חדשה דרך תפריט הניהול.');
      return;
    }
    onChangeScope(targetScope);
    if (targetScope === 'group' && onChangeGroupId && !selectedGroupId) {
      onChangeGroupId(currentGroupId);
    }
  };

  return (
    <div className={`space-y-2 p-3 bg-slate-50/80 dark:bg-zinc-800/40 rounded-2xl border border-slate-200/70 dark:border-zinc-800 ${className}`}>
      <label className="text-xs font-black text-slate-700 dark:text-zinc-200 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          הגדרת פרסום ונראות:
        </span>
        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
          {scope === 'private' ? 'רק אתה תוכל לצפות' : scope === 'group' ? 'משותף עם חברי הקבוצה' : 'פתוח לכל משתמשי האפליקציה'}
        </span>
      </label>

      {/* Scope Selector Pills */}
      <div className={`grid gap-1.5 ${allowPublic ? 'grid-cols-3' : 'grid-cols-2'}`}>
        
        {/* 1. Private / Personal */}
        <button
          type="button"
          onClick={() => handleScopeClick('private')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
            scope === 'private'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/30'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>אישי (פרטי)</span>
        </button>

        {/* 2. Group Sharing */}
        <button
          type="button"
          onClick={() => handleScopeClick('group')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
            scope === 'group'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/30'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>קבוצתי 👥</span>
        </button>

        {/* 3. Public to All (Only if allowPublic is true) */}
        {allowPublic && (
          <button
            type="button"
            onClick={() => handleScopeClick('public')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
              scope === 'public'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-sm shadow-orange-500/30'
                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>פרסום כללי 🌐</span>
          </button>
        )}
      </div>

      {/* Group Choice Dropdown (Visible only when scope is 'group') */}
      {scope === 'group' && (
        <div className="pt-1 animate-fadeIn">
          {hasGroups ? (
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-600 dark:text-zinc-400 block">
                בחר לאיזו קבוצה לפרסם:
              </label>
              <div className="relative">
                <select
                  value={selectedGroupId || currentGroupId}
                  onChange={(e) => onChangeGroupId && onChangeGroupId(e.target.value)}
                  className="w-full py-2 px-3 pl-8 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-900/60 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                >
                  {myGroups.map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      👥 {grp.name} {grp.id === activeGroup?.id ? '★ (קבוצה פעילה)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-center gap-2 text-[11px] font-bold text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>אינך רשום באף קבוצה. פתח קבוצה דרך תפריט הניהול כדי לשתף.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
