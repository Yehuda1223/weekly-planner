import React, { useState } from 'react';
import { X, Users, CheckSquare, Square, User, Calendar, ShoppingBag, Dumbbell, Save, Check, Trash2, Crown, ShieldCheck } from 'lucide-react';
import { UserProfile, CategoryPermissions } from '@/src/types';

interface ShareGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  registeredUsers: UserProfile[];
  onSaveSharingPermissions: (targetUserId: string, permissions: CategoryPermissions) => void;
  onDeleteUser?: (userId: string) => void;
}

export const ShareGroupModal: React.FC<ShareGroupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  registeredUsers,
  onSaveSharingPermissions,
  onDeleteUser
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [permissions, setPermissions] = useState<CategoryPermissions>({
    planner: true,
    shopping: true,
    fitness: false,
    dates: false
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter out current logged in user from list
  const otherUsers = registeredUsers.filter(u => u.id !== currentUser?.id && !u.isGuest);

  const handleSelectUser = (uId: string) => {
    setSelectedUserId(uId);
    // Load existing permissions if any
    const existing = currentUser?.sharedPermissions?.[uId];
    if (existing) {
      setPermissions(existing);
    } else {
      setPermissions({ planner: true, shopping: true, fitness: false, dates: false });
    }
    setSavedSuccess(false);
  };

  const handleToggleCategory = (key: keyof CategoryPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSavedSuccess(false);
  };

  const handleSave = () => {
    if (!selectedUserId) {
      alert('אנא בחר משתמש מתוך הרשימה לשיתוף');
      return;
    }
    onSaveSharingPermissions(selectedUserId, permissions);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              {currentUser?.isSuperAdmin ? <Crown className="w-5 h-5 text-amber-500" /> : <Users className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                  {currentUser?.isSuperAdmin ? 'ניהול משתמשים והרשאות' : 'שיתוף משתמשים והרשאות'}
                </h3>
                {currentUser?.isSuperAdmin && (
                  <span className="text-[9px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> מנהל בכיר
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {currentUser?.isSuperAdmin ? 'ניהול מאגר המשתמשים בענן והגדרת הרשאות' : 'בחירת אדם מתוך המאגר והגדרת קטגוריות לשיתוף'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-right overflow-y-auto max-h-[75vh]">
          
          {/* Step 1: Choose User from Registry */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <User className="w-4 h-4 text-orange-500" />
              <span>1. בחירת משתמש מתוך המאגר {currentUser?.isSuperAdmin ? '(ניהול מלא)' : ''}</span>
            </label>

            {otherUsers.length === 0 ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold">טרם נרשמו משתמשים נוספים במערכת</p>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  כאשר משתמשים נוספים (כמו תהילה או בני משפחה) נרשמים באפליקציה, שמותיהם יופיעו כאן אוטומטית.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {otherUsers.map(user => {
                  const isSelected = selectedUserId === user.id;
                  const hasActiveShare = currentUser?.sharedPermissions?.[user.id];

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user.id)}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex justify-between items-center ${
                        isSelected
                          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-400 dark:border-orange-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200/80 dark:border-zinc-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-center">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                              {user.displayName}
                            </h5>
                            {user.isSuperAdmin && (
                              <span className="text-[8px] bg-amber-500/20 text-amber-600 font-extrabold px-1.5 py-0.2 rounded-md">
                                מנהל
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasActiveShare && (
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            משותף פעיל
                          </span>
                        )}

                        {/* Super Admin can delete users */}
                        {currentUser?.isSuperAdmin && onDeleteUser && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteUser(user.id);
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer border border-rose-200/50"
                            title="מחיקת משתמש לצמיתות מהמערכת"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          {/* Step 2: Choose Categories to Share */}
          {selectedUserId && (
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800 animate-fadeIn">
              <label className="text-xs font-black text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <span>2. באילו קטגוריות לשתף משתמש זה?</span>
              </label>

              <div className="space-y-2">
                
                {/* Planner Checkbox */}
                <div
                  onClick={() => handleToggleCategory('planner')}
                  className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <div>
                      <h6 className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                        מתכנן ארוחות שבועי
                      </h6>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                        חשיפת תכנון הארוחות היומי והשבועי
                      </span>
                    </div>
                  </div>
                  {permissions.planner ? (
                    <CheckSquare className="w-5 h-5 text-orange-500 fill-orange-100 dark:fill-orange-950" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 dark:text-zinc-600" />
                  )}
                </div>

                {/* Shopping List Checkbox */}
                <div
                  onClick={() => handleToggleCategory('shopping')}
                  className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-orange-500" />
                    <div>
                      <h6 className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                        רשימת קניות
                      </h6>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                        חשיפה וסנכרון של מצרכי הקניות
                      </span>
                    </div>
                  </div>
                  {permissions.shopping ? (
                    <CheckSquare className="w-5 h-5 text-orange-500 fill-orange-100 dark:fill-orange-950" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 dark:text-zinc-600" />
                  )}
                </div>

                {/* Fitness Checkbox */}
                <div
                  onClick={() => handleToggleCategory('fitness')}
                  className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-orange-500" />
                    <div>
                      <h6 className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                        אימונים וכושר
                      </h6>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                        חשיפת תוכניות האימון והמשקלים
                      </span>
                    </div>
                  </div>
                  {permissions.fitness ? (
                    <CheckSquare className="w-5 h-5 text-orange-500 fill-orange-100 dark:fill-orange-950" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 dark:text-zinc-600" />
                  )}
                </div>

              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSave}
                className={`w-full font-extrabold py-3 px-4 rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  savedSuccess
                    ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 active:scale-[0.99]'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>הרשאות השיתוף שנשמרו בהצלחה!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>שמירת הרשאות שיתוף</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
