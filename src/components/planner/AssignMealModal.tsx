import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Utensils, Heart, Plus, Trash2, CheckSquare } from 'lucide-react';
import { EnabledTabsConfig, Recipe, Workout, DateSpot, TaskItem, MealSubItem, MealCourseType } from '@/src/types';

interface AssignMealModalProps {
  isOpen: boolean;
  activeSlot: { day: string; meal: string; existingItem?: any } | null;
  recipes: Recipe[];
  workouts?: Workout[];
  dateSpots?: DateSpot[];
  tasks?: TaskItem[];
  enabledTabs?: EnabledTabsConfig;
  onClose: () => void;
  onAssign: (day: string, meal: string, recipeId?: string, customName?: string, items?: MealSubItem[], isShared?: boolean) => void;
  onDeleteMealPlanItem?: (itemId?: string, day?: string, meal?: string) => void;
}

const COURSE_TYPES: MealCourseType[] = [
  'מנה עיקרית',
  'תוספת',
  'סלט וממרח',
  'מרק ותבשיל',
  'מאפה ולחם',
  'קינוח ומתוק',
  'אחר'
];

type SlotType = 'meal' | 'workout' | 'date' | 'task';

export const AssignMealModal: React.FC<AssignMealModalProps> = ({
  isOpen,
  activeSlot,
  recipes,
  workouts = [],
  dateSpots = [],
  tasks = [],
  enabledTabs = { recipes: true, planner: true, shopping: true, fitness: true, dates: true, tasks: true },
  onClose,
  onAssign,
  onDeleteMealPlanItem
}) => {
  const [slotType, setSlotType] = useState<SlotType>('meal');
  const [mealCategory, setMealCategory] = useState<string>('ארוחת צהריים');
  const [singleRecipeId, setSingleRecipeId] = useState<string>('');
  const [singleCustomName, setSingleCustomName] = useState<string>('');
  const [isShared, setIsShared] = useState<boolean>(true);
  
  // Multi-item courses list for Meals
  const [mealSubItems, setMealSubItems] = useState<MealSubItem[]>([]);

  useEffect(() => {
    if (isOpen && activeSlot) {
      const existing = activeSlot.existingItem;
      setIsShared(existing?.isShared !== undefined ? existing.isShared : true);

      if (activeSlot.meal === 'אימון יומי' || activeSlot.meal.includes('אימון')) {
        setSlotType('workout');
        // Pre-populate existing workout data
        setSingleRecipeId(existing?.recipeId || '');
        setSingleCustomName(existing?.customName || '');
      } else if (activeSlot.meal === 'דייט / בילוי' || activeSlot.meal.includes('דייט')) {
        setSlotType('date');
        // Pre-populate existing date spot data
        setSingleRecipeId(existing?.recipeId || '');
        setSingleCustomName(existing?.customName || '');
      } else {
        setSlotType('meal');
        setMealCategory(activeSlot.meal !== 'חדש' ? activeSlot.meal : 'ארוחת צהריים');
        // Pre-populate meal data
        setSingleRecipeId(existing?.recipeId || '');
        setSingleCustomName(existing?.customName || '');
      }

      if (existing?.items && existing.items.length > 0) {
        setMealSubItems(existing.items);
      } else if (existing?.recipeId || existing?.customName) {
        setMealSubItems([
          {
            id: 'sub_1',
            courseType: 'מנה עיקרית',
            recipeId: existing.recipeId || '',
            customName: existing.customName || ''
          }
        ]);
      } else {
        setSingleRecipeId('');
        setSingleCustomName('');
        setMealSubItems([
          { id: 'sub_1', courseType: 'מנה עיקרית', recipeId: '', customName: '' }
        ]);
      }
    }
  }, [isOpen, activeSlot]);

  if (!isOpen || !activeSlot) return null;

  const handleAddSubItem = () => {
    setMealSubItems(prev => [
      ...prev,
      { id: 'sub_' + Date.now(), courseType: 'תוספת', recipeId: '', customName: '' }
    ]);
  };

  const handleUpdateSubItem = (id: string, field: keyof MealSubItem, value: string) => {
    setMealSubItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'recipeId' && value) updated.customName = '';
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveSubItem = (id: string) => {
    if (mealSubItems.length <= 1) {
      setMealSubItems([{ id: 'sub_' + Date.now(), courseType: 'מנה עיקרית', recipeId: '', customName: '' }]);
      return;
    }
    setMealSubItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (slotType === 'workout') {
      onAssign(
        activeSlot.day,
        'אימון יומי',
        singleRecipeId,
        singleRecipeId ? '' : singleCustomName.trim(),
        [],
        isShared
      );
    } else if (slotType === 'date') {
      onAssign(
        activeSlot.day,
        'דייט / בילוי',
        singleRecipeId,
        singleRecipeId ? '' : singleCustomName.trim(),
        [],
        isShared
      );
    } else if (slotType === 'task') {
      const taskTitle = singleCustomName.trim() || (tasks.find(t => t.id === singleRecipeId)?.title || '');
      if (!taskTitle) {
        alert('אנא בחר מטלה או הזן שם מטלה');
        return;
      }
      onAssign(
        activeSlot.day,
        'מטלה יומית',
        singleRecipeId,
        taskTitle.startsWith('📝') ? taskTitle : `📝 ${taskTitle}`,
        [],
        isShared
      );
    } else {
      // Filter valid non-empty meal courses
      const validItems = mealSubItems.filter(item => item.recipeId || item.customName?.trim());
      
      if (validItems.length === 0) {
        alert('אנא בחר לפחות מנה אחת או הזן שם פריט לארוחה');
        return;
      }

      onAssign(
        activeSlot.day,
        mealCategory,
        validItems[0]?.recipeId || '',
        validItems[0]?.customName || '',
        validItems,
        isShared
      );
    }

    onClose();
  };

  const handleClearSlot = () => {
    if (confirm('האם למחוק פריט זה מלוח התכנון?')) {
      if (onDeleteMealPlanItem) {
        onDeleteMealPlanItem(activeSlot.existingItem?.id, activeSlot.day, activeSlot.meal);
      } else {
        onAssign(activeSlot.day, activeSlot.meal, '', '', []);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[88vh] animate-scaleUp overflow-hidden">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
              {slotType === 'date' ? (
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              ) : slotType === 'workout' ? (
                <Dumbbell className="w-4 h-4 text-orange-500" />
              ) : slotType === 'task' ? (
                <CheckSquare className="w-4 h-4 text-orange-500" />
              ) : (
                <Utensils className="w-4 h-4 text-orange-500" />
              )}
              <span>הוספה לתכנון היומי</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              {activeSlot.day}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-right flex-1">
          
          {/* 🏷️ Slot Type Picker Pills (Meal, Workout, Date, Task) */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              מה ברצונך להוסיף ליום זה?
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
              
              {/* Meal Option */}
              <button
                type="button"
                onClick={() => setSlotType('meal')}
                className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  slotType === 'meal'
                    ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>ארוחה</span>
              </button>

              {/* Workout Option (If enabled) */}
              {enabledTabs.fitness && (
                <button
                  type="button"
                  onClick={() => setSlotType('workout')}
                  className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    slotType === 'workout'
                      ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                  }`}
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>אימון</span>
                </button>
              )}

              {/* Date Option (If enabled) */}
              {enabledTabs.dates && (
                <button
                  type="button"
                  onClick={() => setSlotType('date')}
                  className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    slotType === 'date'
                      ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                  <span>דייט</span>
                </button>
              )}

              {/* Task Option (If enabled) */}
              {enabledTabs.tasks && (
                <button
                  type="button"
                  onClick={() => setSlotType('task')}
                  className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    slotType === 'task'
                      ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>מטלה</span>
                </button>
              )}

            </div>
          </div>

          {/* 🔒🤝 Privacy & Scope Selector (Personal vs Shared) */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              היקף השיתוף והפרטיות של פריט זה:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsShared(false)}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  !isShared
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 shadow-2xs'
                    : 'bg-slate-50 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                }`}
              >
                <span>🔒 פרטי שלי בלבד</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShared(true)}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  isShared
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                    : 'bg-slate-50 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                }`}
              >
                <span>👨‍👩‍👧‍👦 משותף לכולם</span>
              </button>
            </div>
          </div>

          {/* Meal Category Select (for meals) */}
          {slotType === 'meal' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                סוג הארוחה *
              </label>
              <select
                value={mealCategory}
                onChange={(e) => setMealCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 font-bold cursor-pointer"
              >
                <option value="ארוחת בוקר">ארוחת בוקר ☕</option>
                <option value="ארוחת צהריים">ארוחת צהריים 🍲</option>
                <option value="ארוחת ערב">ארוחת ערב 🥗</option>
                <option value="ארוחת ביניים / נשנוש">ארוחת ביניים / נשנוש 🍎</option>
              </select>
            </div>
          )}

          {/* Date Spot Picker */}
          {slotType === 'date' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                בחירת מקום/רעיון מספריית הדייטים
              </label>
              <select
                value={singleRecipeId}
                onChange={(e) => {
                  setSingleRecipeId(e.target.value);
                  if (e.target.value) setSingleCustomName('');
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-zinc-100 text-right cursor-pointer font-bold"
              >
                <option value="">-- בחר מקום לדייט מהספרייה --</option>
                {dateSpots.map(spot => (
                  <option key={spot.id} value={spot.id}>
                    {spot.category}: {spot.title} (ביקרנו {spot.visitCount} פעמים)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Workout Picker */}
          {slotType === 'workout' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                בחירת אימון מספריית האימונים
              </label>
              <select
                value={singleRecipeId}
                onChange={(e) => {
                  setSingleRecipeId(e.target.value);
                  if (e.target.value) setSingleCustomName('');
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 text-right cursor-pointer font-bold"
              >
                <option value="">-- בחר אימון מהספרייה --</option>
                {workouts.map(workout => (
                  <option key={workout.id} value={workout.id}>
                    {workout.splitGroup}: {workout.title} ({workout.exercises.length} תרגילים)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Picker */}
          {slotType === 'task' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                בחירת מטלה מספריית המטלות
              </label>
              <select
                value={singleRecipeId}
                onChange={(e) => {
                  setSingleRecipeId(e.target.value);
                  if (e.target.value) setSingleCustomName('');
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 text-right cursor-pointer font-bold"
              >
                <option value="">-- בחר מטלה מהרשימה --</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.title}>
                    {task.category}: {task.title} {task.dueDate ? `(יעד: ${task.dueDate})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Multi-Item Meal Course Builder */}
          {slotType === 'meal' && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                  <span>מנות ופריטים בארוחה זו (מנה עיקרית, תוספת, קינוח...)</span>
                </label>
                
                <button
                  type="button"
                  onClick={handleAddSubItem}
                  className="px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40 text-[11px] font-bold flex items-center gap-1 hover:bg-orange-100 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> הוספת מנה +
                </button>
              </div>

              <div className="space-y-3">
                {mealSubItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-100/60 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                        מנה #{index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveSubItem(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                        title={mealSubItems.length > 1 ? "הסרת מנה זו" : "איפוס בחירת מנה"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Course Type */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                          סוג מנה
                        </label>
                        <select
                          value={item.courseType}
                          onChange={e => handleUpdateSubItem(item.id, 'courseType', e.target.value as MealCourseType)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-right cursor-pointer"
                        >
                          {COURSE_TYPES.map(ct => (
                            <option key={ct} value={ct}>{ct}</option>
                          ))}
                        </select>
                      </div>

                      {/* Recipe Picker */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                          בחירת מתכון מהספרייה
                        </label>
                        <select
                          value={item.recipeId || ''}
                          onChange={e => handleUpdateSubItem(item.id, 'recipeId', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-right cursor-pointer font-semibold"
                        >
                          <option value="">-- ללא מתכון מוגדר --</option>
                          {recipes.map(r => (
                            <option key={r.id} value={r.id}>{r.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Custom Item Name if no recipe selected */}
                    {!item.recipeId && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                          או הזנת שם מנה חופשי
                        </label>
                        <input
                          type="text"
                          placeholder="למשל: אורז לבן / סלט ירקות קצוץ / פאי תפוחים..."
                          value={item.customName || ''}
                          onChange={e => handleUpdateSubItem(item.id, 'customName', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-right"
                        />
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single Custom Name for Workout/Date */}
          {(slotType === 'workout' || slotType === 'date') && (
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-zinc-800">
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                {slotType === 'date' ? 'או הזנת רעיון/מקום חופשי לדייט' : 'או הזנת אימון חופשי'}
              </label>
              <input
                type="text"
                placeholder={slotType === 'date' ? 'למשל: דייט גלידה וטיול בשקיעה...' : 'למשל: 40 דק׳ ריצה בפארק...'}
                value={singleCustomName}
                onChange={(e) => {
                  setSingleCustomName(e.target.value);
                  if (e.target.value) setSingleRecipeId('');
                }}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 text-right"
              />
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all cursor-pointer text-xs"
            >
              שמירה במתכנן השבועי
            </button>

            {activeSlot.existingItem && (
              <button
                type="button"
                onClick={handleClearSlot}
                className="px-4 py-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1"
                title="מחיקת פריט זה מלוח היממה"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>מחיקת פריט</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
