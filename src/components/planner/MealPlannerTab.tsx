import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  History, 
  Sparkles, 
  Lock, 
  Dumbbell, 
  Heart, 
  Utensils, 
  Edit2,
  CheckSquare
} from 'lucide-react';
import { EnabledTabsConfig, Recipe, Workout, DateSpot, TaskItem, MealPlanItem, WeekHistoryRecord, UserProfile, FamilyGroup } from '@/src/types';
import { DAYS_OF_WEEK } from '@/src/constants/defaults';
import { 
  getWeekDates, 
  getWeekKey, 
  formatMonthYearHeader, 
  formatHebrewDateShort, 
  getDateStatus 
} from '@/src/utils/dateUtils';
import { PlannerHistoryModal } from './PlannerHistoryModal';
import { DatePickerModal } from './DatePickerModal';
import { PlannerItemDetailModal } from './PlannerItemDetailModal';
import { ItemScopeBadge } from '@/src/components/common/ItemScopeBadge';

interface MealPlannerTabProps {
  mealPlan: MealPlanItem[];
  recipes: Recipe[];
  currentUser?: UserProfile | null;
  activeGroup?: FamilyGroup | null;
  workouts?: Workout[];
  dateSpots?: DateSpot[];
  tasks?: TaskItem[];
  enabledTabs?: EnabledTabsConfig;
  weekOffset: number;
  setWeekOffset: React.Dispatch<React.SetStateAction<number>>;
  onOpenAssignModal: (day: string, meal: string, existingItem?: MealPlanItem) => void;
  onAssignMeal: (day: string, meal: string, recipeId?: string, customName?: string, items?: any[]) => void;
  onDeleteMealPlanItem?: (itemId?: string, day?: string, meal?: string, weekKey?: string) => void;
  onClearMealPlanner: () => void;
  onToggleCompletion: (day: string, meal: string, weekKey?: string, itemId?: string) => void;
  onCopyPastWeek: (weekKey: string) => void;
  onUpdatePlanItem?: (itemId: string, updates: Partial<Pick<MealPlanItem, 'dayNotes' | 'dayPhotos' | 'dayExerciseOverrides'>>) => void;
  isGuest?: boolean;
}

export const MealPlannerTab: React.FC<MealPlannerTabProps> = ({
  mealPlan,
  recipes,
  currentUser,
  activeGroup,
  workouts = [],
  dateSpots = [],
  tasks = [],
  enabledTabs = { recipes: true, planner: true, shopping: true, fitness: true, dates: true, tasks: true },
  weekOffset,
  setWeekOffset,
  onOpenAssignModal,
  onAssignMeal,
  onDeleteMealPlanItem,
  onClearMealPlanner,
  onToggleCompletion,
  onCopyPastWeek,
  onUpdatePlanItem,
  isGuest = false
}) => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);
  const [detailViewPlan, setDetailViewPlan] = useState<MealPlanItem | null>(null);

  // 1. Calculate dates for current selected week
  const weekDates = getWeekDates(weekOffset);
  const currentWeekKey = getWeekKey(weekOffset);
  const monthYearHeader = formatMonthYearHeader(weekOffset);

  // 2. Filter meal plan items for this specific week
  const currentWeekItems = mealPlan.filter(item => {
    const itemWeekKey = item.weekKey || getWeekKey(0);
    return itemWeekKey === currentWeekKey;
  });

  // 3. Compute completion stats
  const assignedMealsCount = currentWeekItems.filter(item => 
    item.recipeId || item.customName || (item.items && item.items.length > 0)
  ).length;
  
  const completedMealsCount = currentWeekItems.filter(item => 
    (item.recipeId || item.customName || (item.items && item.items.length > 0)) && item.completed
  ).length;
  
  const completionPercentage = assignedMealsCount > 0 ? Math.round((completedMealsCount / assignedMealsCount) * 100) : 0;

  // 4. Build history records grouped by weekKeys
  const historyMap = new Map<string, MealPlanItem[]>();
  mealPlan.forEach(item => {
    const wKey = item.weekKey || getWeekKey(0);
    if (!historyMap.has(wKey)) historyMap.set(wKey, []);
    historyMap.get(wKey)?.push(item);
  });

  const historyRecords: WeekHistoryRecord[] = Array.from(historyMap.entries())
    .map(([wKey, items]) => {
      const assigned = items.filter(i => i.recipeId || i.customName || (i.items && i.items.length > 0)).length;
      const completed = items.filter(i => (i.recipeId || i.customName || (i.items && i.items.length > 0)) && i.completed).length;
      
      const [yyyy, mm, dd] = wKey.split('-').map(Number);
      const sunDate = new Date(yyyy, mm - 1, dd);
      const satDate = new Date(sunDate);
      satDate.setDate(sunDate.getDate() + 6);

      return {
        weekKey: wKey,
        monthYearTitle: formatMonthYearHeader(0),
        startDateFormatted: formatHebrewDateShort(sunDate),
        endDateFormatted: formatHebrewDateShort(satDate),
        items,
        completedCount: completed,
        totalAssigned: assigned
      };
    })
    .sort((a, b) => b.weekKey.localeCompare(a.weekKey));

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* 🗓️ Calendar Week Navigator & Statistics Bar */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-zinc-900 border border-orange-200/60 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3">
        
        {/* Week Label Badge & Quick Week Switcher */}
        <div className="flex items-center justify-between">
          
          {/* Week Arrow Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              title="שבוע קודם"
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-extrabold shadow-2xs border border-slate-200/80 dark:border-zinc-700 transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4 text-orange-500" />
              <span>שבוע קודם</span>
            </button>

            <button
              onClick={() => setWeekOffset(0)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                weekOffset === 0
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-slate-200/80 dark:border-zinc-700 hover:bg-orange-50'
              }`}
            >
              השבוע הנוכחי
            </button>

            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              title="שבוע הבא"
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-extrabold shadow-2xs border border-slate-200/80 dark:border-zinc-700 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>שבוע הבא</span>
              <ChevronLeft className="w-4 h-4 text-orange-500" />
            </button>
          </div>

          {/* Month & Week Header (Date Trigger) */}
          <div 
            onClick={() => setIsDatePickerModalOpen(true)}
            className="text-left cursor-pointer hover:opacity-80 transition-opacity bg-white/70 dark:bg-zinc-800/60 px-3 py-1.5 rounded-2xl border border-slate-200/60 dark:border-zinc-700/60 shadow-2xs group"
            title="לחצו לבחירת תאריך בלוח השנה"
          >
            <div className="flex items-center gap-1.5 justify-end">
              <Calendar className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
              <h2 className="text-sm font-black text-slate-800 dark:text-zinc-100">
                {monthYearHeader}
              </h2>
            </div>
            <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 block">
              {formatHebrewDateShort(weekDates[0])} – {formatHebrewDateShort(weekDates[6])} 📅
            </span>
          </div>

        </div>

        {/* Dynamic Week Badge Banner */}
        <div className="flex items-center justify-between text-xs font-extrabold px-1">
          <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1">
            {weekOffset === 0 ? (
              <span className="text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-900/40">
                ✨ שבוע נוכחי
              </span>
            ) : weekOffset === -1 ? (
              <span className="text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40">
                ⏪ שבוע שעבר (היסטוריה)
              </span>
            ) : weekOffset < -1 ? (
              <span className="text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900/40">
                📜 לפני {Math.abs(weekOffset)} שבועות
              </span>
            ) : (
              <span className="text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
                ⏩ בעוד {weekOffset} שבועות
              </span>
            )}
          </span>

          {/* Action Buttons: History Modal & Clear Menu Button */}
          <div className="flex items-center gap-1.5">
            {assignedMealsCount > 0 && (
              <button
                type="button"
                onClick={onClearMealPlanner}
                className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-extrabold flex items-center gap-1 border border-rose-200/80 dark:border-rose-900/50 shadow-2xs cursor-pointer active:scale-95 transition-all"
                title="מחיקת כל המנות והפריטים מהתפריט של שבוע זה"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>איפוס תפריט שבועי</span>
              </button>
            )}

            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-extrabold flex items-center gap-1 border border-slate-200/80 dark:border-zinc-700 shadow-2xs cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-orange-500" />
              <span>היסטוריה</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Completion Statistics Summary */}
        <div className="pt-2 border-t border-orange-200/40 dark:border-zinc-800/60 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
            <span>סטטיסטיקת ביצוע שבועית: <strong className="text-orange-600 dark:text-orange-400">{completedMealsCount} מתוך {assignedMealsCount}</strong> הושלמו</span>
            <span className="text-orange-600 dark:text-orange-400 font-black">{completionPercentage}%</span>
          </div>

          <div className="w-full h-2.5 bg-white/80 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-zinc-700 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* 📅 Dynamic Clean Days List */}
      <div className="space-y-4">
        {DAYS_OF_WEEK.map((dayName, index) => {
          const dateForDay = weekDates[index];
          const formattedDate = formatHebrewDateShort(dateForDay);
          const dateStatus = getDateStatus(dateForDay);

          // Get assigned plans for this day
          const dayPlans = currentWeekItems.filter(item => 
            item.day === dayName && (item.recipeId || item.customName || (item.items && item.items.length > 0))
          );

          return (
            <div
              key={dayName}
              className={`border rounded-2xl p-4 space-y-3 text-right transition-colors ${
                dateStatus.isToday
                  ? 'bg-orange-50/40 dark:bg-orange-950/20 border-orange-300 dark:border-orange-900/50 shadow-xs'
                  : 'bg-slate-50 dark:bg-zinc-800/20 border-slate-100 dark:border-zinc-800/40'
              }`}
            >
              {/* Day Header with Real Date & Status Tag */}
              <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-zinc-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">
                    {dayName}
                  </h3>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100/60 dark:bg-orange-950/40 px-2.5 py-0.5 rounded-lg">
                    {formattedDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {dateStatus.isToday ? (
                    <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                      היום
                    </span>
                  ) : dateStatus.isPast ? (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> יום עבר
                    </span>
                  ) : null}

                  {/* Add Slot Button for Day */}
                  <button
                    type="button"
                    onClick={() => onOpenAssignModal(dayName, 'חדש')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all ${
                      isGuest
                        ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-300 dark:border-zinc-700 opacity-60 cursor-not-allowed shadow-none'
                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-2xs active:scale-95 cursor-pointer'
                    }`}
                    title={isGuest ? 'מצב אורח - צפייה בלבד' : 'הוספה ליום זה'}
                  >
                    {isGuest ? <Lock className="w-3 h-3" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>הוספה ליום זה</span>
                  </button>
                </div>
              </div>

              {/* Day Plans Container */}
              {dayPlans.length === 0 ? (
                <div 
                  onClick={() => onOpenAssignModal(dayName, 'חדש')}
                  className={`p-3 rounded-2xl border border-dashed text-center space-y-1 transition-colors ${
                    isGuest
                      ? 'border-slate-200 dark:border-zinc-800 opacity-50 cursor-not-allowed'
                      : 'border-slate-200 dark:border-zinc-800/80 cursor-pointer hover:bg-orange-50/50 dark:hover:bg-zinc-800/40 hover:border-orange-300'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500">
                    {isGuest ? 'מצב אורח (צפייה בלבד) – אין פריט ליום זה' : 'טרם תוכן פריט ליום זה – לחצו להוספה +'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dayPlans.map(plan => {
                    const isWorkout = plan.meal === 'אימון יומי' || plan.meal.includes('אימון');
                    const isDate = plan.meal === 'דייט / בילוי' || plan.meal.includes('דייט');
                    const isTask = plan.meal === 'מטלה יומית' || plan.meal.includes('מטלה') || plan.meal.includes('סידורים') || (plan.customName && plan.customName.startsWith('📝'));
                    const isCompleted = plan.completed || false;

                    const workout = isWorkout && plan.recipeId ? workouts.find(w => w.id === plan.recipeId) : null;
                    const dateSpot = isDate && plan.recipeId ? dateSpots.find(d => d.id === plan.recipeId) : null;

                    const handleToggleClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (isGuest) return;
                      onToggleCompletion(dayName, plan.meal, currentWeekKey, plan.id);
                    };

                    return (
                      <div
                        key={plan.meal + (plan.id || '')}
                        onClick={() => setDetailViewPlan(plan)}
                        className={`p-3 rounded-2xl border text-right transition-all space-y-1.5 cursor-pointer hover:shadow-md ${
                          isCompleted
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/40'
                            : isDate
                            ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                            : isWorkout
                            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                            : isTask
                            ? 'bg-orange-50/70 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40'
                            : 'bg-white dark:bg-zinc-800/60 border-slate-200/80 dark:border-zinc-700/80 shadow-2xs'
                        }`}
                      >
                        {/* Header: Meal Title & Completion Checkbox */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            {isDate ? (
                              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                            ) : isWorkout ? (
                              <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
                            ) : isTask ? (
                              <CheckSquare className="w-3.5 h-3.5 text-orange-500" />
                            ) : (
                              <Utensils className="w-3.5 h-3.5 text-orange-500" />
                            )}
                            <span className="text-xs font-black text-slate-800 dark:text-zinc-100">
                              {plan.meal}
                            </span>
                            <ItemScopeBadge item={plan} currentUser={currentUser} activeGroup={activeGroup} />
                          </div>

                          <div className="flex items-center gap-1.5">
                            {!isGuest && (
                              <>
                                {/* Edit & Delete Buttons - Available on all days */}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onOpenAssignModal(dayName, plan.meal, plan); }}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 cursor-pointer"
                                  title="עריכת ארוחה/פריט"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`האם למחוק את ${plan.meal} מיום ${dayName}?`)) {
                                      if (onDeleteMealPlanItem) {
                                        onDeleteMealPlanItem(plan.id, dayName, plan.meal, currentWeekKey);
                                      } else {
                                        onAssignMeal(dayName, plan.meal, '', '', []);
                                      }
                                    }
                                  }}
                                  className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                                  title="מחיקת פריט זה מיום זה"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={handleToggleClick}
                              className={`transition-colors p-0.5 ${
                                isGuest || !dateStatus.canToggleComplete ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                              ) : (
                                <Circle className="w-4.5 h-4.5 text-slate-300 dark:text-zinc-600 hover:text-emerald-500" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Multi-Item SubItems Render OR Legacy Single Recipe Render */}
                        {plan.items && plan.items.length > 0 ? (
                          <div className="space-y-1 pt-1">
                            {plan.items.map(sub => {
                              const recipe = sub.recipeId ? recipes.find(r => r.id === sub.recipeId) : null;
                              const title = recipe ? recipe.title : sub.customName;

                              return (
                                <div
                                  key={sub.id}
                                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-800/80 px-2.5 py-1 rounded-xl border border-slate-200/50 dark:border-zinc-700"
                                >
                                  <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950 px-1.5 py-0.5 rounded-md">
                                    {sub.courseType}
                                  </span>
                                  <span className={isCompleted ? 'line-through opacity-75' : ''}>
                                    {title}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-slate-700 dark:text-zinc-200 pt-0.5">
                            {workout ? (
                              <span>{workout.splitGroup}: {workout.title}</span>
                            ) : dateSpot ? (
                              <span>🥂 {dateSpot.title}</span>
                            ) : plan.recipeId ? (
                              <span>{recipes.find(r => r.id === plan.recipeId)?.title}</span>
                            ) : (
                              <span>{plan.customName}</span>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* History Modal */}
      <PlannerHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        historyRecords={historyRecords}
        recipes={recipes}
        onSelectWeekOffset={(newOffset) => setWeekOffset(newOffset)}
        onCopyPastWeek={onCopyPastWeek}
      />

      {/* Interactive Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerModalOpen}
        onClose={() => setIsDatePickerModalOpen(false)}
        currentWeekOffset={weekOffset}
        mealPlan={mealPlan}
        onSelectDateOffset={(newOffset) => setWeekOffset(newOffset)}
      />

      {/* Planner Item Detail View Modal */}
      <PlannerItemDetailModal
        isOpen={!!detailViewPlan}
        onClose={() => setDetailViewPlan(null)}
        plan={detailViewPlan ? (mealPlan.find(m => m.id === detailViewPlan.id) || detailViewPlan) : null}
        recipes={recipes}
        workouts={workouts}
        dateSpots={dateSpots}
        onUpdatePlanItem={onUpdatePlanItem}
        onDeleteItem={onDeleteMealPlanItem}
      />

    </div>
  );
};
