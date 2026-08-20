import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface SaveListModalProps {
  isOpen: boolean;
  defaultTitle: string;
  onClose: () => void;
  onSave: (title: string, clearPlanner: boolean) => void;
}

export const SaveListModal: React.FC<SaveListModalProps> = ({
  isOpen,
  defaultTitle,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [clearPlanner, setClearPlanner] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), clearPlanner);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl flex flex-col animate-scaleUp">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 px-5 py-4 flex items-center justify-between z-10">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
            שמירת רשימת קניות להיסטוריה
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-right">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">
              כותרת הרשימה
            </label>
            <input
              type="text"
              required
              placeholder="למשל: רשימה לשבוע של 16/08/2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 text-right"
            />
          </div>

          <div
            onClick={() => setClearPlanner(prev => !prev)}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100/80 dark:border-zinc-800/40 cursor-pointer"
          >
            <div
              className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                clearPlanner
                  ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700'
              }`}
            >
              {clearPlanner && <Check className="w-3 h-3 stroke-[3px]" />}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                איפוס מתכנן הארוחות והמוצרים האישיים לקראת שבוע חדש
              </p>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                סימון זה ינקה את לוח הארוחות ואת רשימת הקניות הנוכחית.
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 rounded-xl text-xs font-extrabold shadow-md shadow-orange-500/20 active:scale-98 transition-all cursor-pointer"
            >
              שמור וסגור שבוע
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 px-4 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              ביטול
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
