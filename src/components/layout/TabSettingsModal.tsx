import React, { useState } from 'react';
import { X, Settings, CheckSquare, Square, BookOpen, Calendar, ShoppingBag, Dumbbell, Heart, Save, Check } from 'lucide-react';
import { EnabledTabsConfig } from '@/src/types';

interface TabSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enabledTabs: EnabledTabsConfig;
  onSaveEnabledTabs: (config: EnabledTabsConfig) => void;
}

export const TabSettingsModal: React.FC<TabSettingsModalProps> = ({
  isOpen,
  onClose,
  enabledTabs,
  onSaveEnabledTabs
}) => {
  const [config, setConfig] = useState<EnabledTabsConfig>(enabledTabs);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key: keyof EnabledTabsConfig) => {
    // Ensure at least one tab stays enabled
    const currentEnabledCount = Object.values(config).filter(Boolean).length;
    if (config[key] && currentEnabledCount <= 1) {
      alert('חובה להשאיר לפחות לשונית אחת פעילה באפליקציה.');
      return;
    }

    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSavedSuccess(false);
  };

  const handleSave = () => {
    onSaveEnabledTabs(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                הגדרות תצוגת לשוניות
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                בחירת הקטגוריות והלשוניות שיופיעו באפליקציה שלך
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

        {/* Modal Body */}
        <div className="p-5 space-y-3 text-right">
          <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
            סמנו ב-V את הקטגוריות שברצונכם להציג באפליקציה ובמתכנן השבועי:
          </p>

          <div className="space-y-2 pt-1">
            
            {/* Recipes Tab */}
            <div
              onClick={() => handleToggle('recipes')}
              className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">מתכונים</span>
              </div>
              {config.recipes ? (
                <CheckSquare className="w-5 h-5 text-orange-500 fill-orange-100 dark:fill-orange-950" />
              ) : (
                <Square className="w-5 h-5 text-slate-300 dark:text-zinc-600" />
              )}
            </div>

            {/* Weekly Planner Tab */}
            <div
              onClick={() => handleToggle('planner')}
              className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">מתכנן שבועי</span>
              </div>
              {config.planner ? (
                <CheckSquare className="w-5 h-5 text-orange-500 fill-orange-100 dark:fill-orange-950" />
              ) : (
                <Square className="w-5 h-5 text-slate-300 dark:text-zinc-600" />
              )}
            </div>

            {/* Shopping Tab */}
            <div
              onClick={() => handleToggle('shopping')}
              className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">רשימת קניות</span>
              </div>
              {config.shopping ? (
                <CheckSquare className="w-5 h-5 text-orange-500 fill-orange-100 dark:fill-orange-950" />
              ) : (
                <Square className="w-5 h-5 text-slate-300 dark:text-zinc-600" />
              )}
            </div>

            {/* Fitness Tab */}
            <div
              onClick={() => handleToggle('fitness')}
              className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <Dumbbell className="w-4 h-4 text-orange-500" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block">אימונים וכושר</span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">לשונית אימונים ומשבצת אימון יומי במתכנן</span>
                </div>
              </div>
              {config.fitness ? (
                <CheckSquare className="w-5 h-5 text-orange-500 fill-orange-100 dark:fill-orange-950" />
              ) : (
                <Square className="w-5 h-5 text-slate-300 dark:text-zinc-600" />
              )}
            </div>

            {/* Dates Tab */}
            <div
              onClick={() => handleToggle('dates')}
              className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block">דייטים ובילויים</span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">לשונית דייטים ומשבצת דייט במתכנן</span>
                </div>
              </div>
              {config.dates ? (
                <CheckSquare className="w-5 h-5 text-rose-500 fill-rose-100 dark:fill-rose-950" />
              ) : (
                <Square className="w-5 h-5 text-slate-300 dark:text-zinc-600" />
              )}
            </div>

            {/* Tasks & Notes Tab */}
            <div
              onClick={() => handleToggle('tasks')}
              className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-orange-500" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block">פתקים ומטלות</span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">לשונית פתקים חופשיים, משימות וזמני יעד</span>
                </div>
              </div>
              {config.tasks ? (
                <CheckSquare className="w-5 h-5 text-orange-500 fill-orange-100 dark:fill-orange-950" />
              ) : (
                <Square className="w-5 h-5 text-slate-300 dark:text-zinc-600" />
              )}
            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-3">
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
                  <span>הגדרות התצוגה שנשמרו בהצלחה!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>שמירת הגדרות תצוגה</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
