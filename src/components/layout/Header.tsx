import React from 'react';
import { AlertCircle, User, Users, LogOut, LogIn, ChefHat, Sparkles, Heart, Settings, Bell, Crown, Info } from 'lucide-react';
import { SyncStatus, UserProfile, FamilyGroup } from '@/src/types';
import { ChefLogoAvatar } from './ChefLogoAvatar';

interface HeaderProps {
  syncStatus: SyncStatus;
  currentUser: UserProfile | null;
  activeGroup: FamilyGroup | null;
  pendingInvitationsCount: number;
  onOpenAuth: () => void;
  onOpenShareGroup: () => void;
  onOpenSettings: () => void;
  onOpenAbout?: () => void;
  onLogout: () => void;
}

function getPersonalizedGreeting(displayName: string) {
  const hour = new Date().getHours();
  const firstName = displayName.split(' ')[0] || displayName;

  if (hour >= 5 && hour < 12) {
    return { title: `בוקר טוב, ${firstName}! ☀️`, subtitle: 'שיהיה יום מזין ומלא באנרגיה!' };
  } else if (hour >= 12 && hour < 17) {
    return { title: `צהריים טובים, ${firstName}! 🍲`, subtitle: 'זמן לארוחה טעימה והפסקת כושר' };
  } else if (hour >= 17 && hour < 22) {
    return { title: `ערב טוב, ${firstName}! 🌙`, subtitle: 'זמן לתכנון ארוחת ערב רגועה' };
  } else {
    return { title: `לילה טוב, ${firstName}! 🌌`, subtitle: 'תכנון לקראת יום מחר' };
  }
}

export const Header: React.FC<HeaderProps> = ({
  syncStatus,
  currentUser,
  activeGroup,
  pendingInvitationsCount,
  onOpenAuth,
  onOpenShareGroup,
  onOpenSettings,
  onOpenAbout,
  onLogout
}) => {
  const greeting = currentUser && !currentUser.isGuest 
    ? getPersonalizedGreeting(currentUser.displayName) 
    : null;

  const isGroupAdmin = activeGroup?.createdBy === currentUser?.id;

  return (
    <>
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-100 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        
        {/* Brand & Chef Avatar */}
        <div className="flex items-center gap-2.5">
          <ChefLogoAvatar className="w-10 h-10" />

          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-base font-black tracking-tight text-slate-800 dark:text-zinc-100 leading-none">
                תכנון שבועי
              </h1>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold block mt-0.5">
              ארוחות, כושר וסגנון חיים
            </span>
          </div>
        </div>

        {/* User Badge, Settings & Group Actions Container */}
        <div className="flex items-center gap-1.5">
          
          {/* Notifications / Invitations Bell Button */}
          {pendingInvitationsCount > 0 && (
            <button
              onClick={onOpenShareGroup}
              className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer border border-amber-300 dark:border-amber-700 relative animate-bounce"
              title={`יש לך ${pendingInvitationsCount} הזמנות לקבוצות ממתינות!`}
            >
              <Bell className="w-4 h-4 text-amber-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {pendingInvitationsCount}
              </span>
            </button>
          )}

          {/* Tab Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer border border-slate-200/60 dark:border-zinc-800"
            title="הגדרות תצוגת לשוניות"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
          </button>

          {/* About / Guide Button */}
          {onOpenAbout && (
            <button
              onClick={onOpenAbout}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-zinc-700 text-orange-600 dark:text-orange-400 transition-colors cursor-pointer border border-slate-200/60 dark:border-zinc-800"
              title="מדריך המערכת והסבר טכנולוגי"
            >
              <Info className="w-4 h-4" />
            </button>
          )}

          {currentUser && !currentUser.isGuest ? (
            <div className="flex items-center gap-1.5">
              
              {/* Active Group Cute Pill Badge */}
              <button
                onClick={onOpenShareGroup}
                className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs active:scale-95 ${
                  activeGroup
                    ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-700 dark:text-orange-300 border-orange-300/80 dark:border-orange-800/80 hover:border-orange-400'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-200'
                }`}
                title={activeGroup ? `קבוצה פעילה: ${activeGroup.name} (לחץ להחלפה או ניהול)` : 'בחר או צור קבוצה'}
              >
                {activeGroup && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />}
                <Users className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span className="text-[11px] max-w-[85px] truncate font-extrabold">
                  {activeGroup ? activeGroup.name : 'קבוצות'}
                </span>
                {isGroupAdmin && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-rose-50 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer border border-slate-200/60 dark:border-zinc-800"
                title={`מחובר כ-${currentUser.displayName} (לחץ להתנתקות)`}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>

            </div>
          ) : (
            /* Log In Button */
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>התחברות</span>
            </button>
          )}

        </div>
      </header>

      {/* 👋 Warm Personalized Greeting Bar */}
      {currentUser && !currentUser.isGuest && greeting ? (
        <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/15 to-rose-500/10 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-zinc-900 border-b border-orange-200/50 dark:border-zinc-800/80 px-4 py-2.5 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            
            {/* First Letter Avatar Circle */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-xs flex items-center justify-center shadow-sm">
              {currentUser.displayName.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <h2 className="text-xs font-black text-slate-800 dark:text-zinc-100 flex items-center gap-1">
                <span>{greeting.title}</span>
                {currentUser.isSuperAdmin && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold px-1.5 py-0.2 rounded-md border border-amber-300 dark:border-amber-700 flex items-center gap-0.5">
                    👑 מנהל בכיר
                  </span>
                )}
              </h2>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold block">
                {currentUser.isSuperAdmin 
                  ? '⚡ הרשאות מנהל בכיר מלאות (ניהול חשבונות ומחיקות)'
                  : activeGroup 
                    ? `👨‍👩‍👧‍👦 מחובר לקבוצת "${activeGroup.name}"` 
                    : greeting.subtitle}
              </span>
            </div>

          </div>

          <button
            onClick={onOpenShareGroup}
            className="text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-white/90 dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-orange-200 dark:border-zinc-700 hover:bg-orange-50 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
          >
            {activeGroup ? (
              <>
                <Users className="w-3 h-3 text-orange-500" />
                <span>{activeGroup.name}</span>
              </>
            ) : (
              <span>ניהול קבוצות 👥</span>
            )}
          </button>
        </div>
      ) : null}
    </>
  );
};
