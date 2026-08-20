import React from 'react';
import { X, Calendar, CheckCircle2, Copy, History, Eye } from 'lucide-react';
import { Recipe, MealPlanItem, WeekHistoryRecord } from '@/src/types';
import { 
  getWeekOffsetFromDate, 
  getSundayOfWeek, 
  getWeekKey, 
  formatMonthYearHeader, 
  formatHebrewDateShort 
} from '@/src/utils/dateUtils';

interface PlannerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyRecords: WeekHistoryRecord[];
  recipes: Recipe[];
  onSelectWeekOffset: (offset: number) => void;
  onCopyPastWeek: (weekKey: string) => void;
}

export const PlannerHistoryModal: React.FC<PlannerHistoryModalProps> = ({
  isOpen,
  onClose,
  historyRecords,
  recipes,
  onSelectWeekOffset,
  onCopyPastWeek
}) => {
  const [timeFilter, setTimeFilter] = React.useState<'all' | '1m' | '3m' | '1y'>('all');

  if (!isOpen) return null;

  // Calculate number of weeks for the selected filter
  const targetMaxWeeks = timeFilter === '1m' ? 4 :
                         timeFilter === '3m' ? 12 : 52; // '1y' or 'all' = 52 weeks

  // Map existing records by weekKey
  const historyMap = new Map<string, WeekHistoryRecord>();
  historyRecords.forEach(rec => historyMap.set(rec.weekKey, rec));

  // Generate continuous list of all weeks in period (including weeks with no data)
  const filteredRecords: WeekHistoryRecord[] = [];
  for (let offset = -1; offset >= -targetMaxWeeks; offset--) {
    const wKey = getWeekKey(offset);
    if (historyMap.has(wKey)) {
      filteredRecords.push(historyMap.get(wKey)!);
    } else {
      const sunDate = getSundayOfWeek(new Date(), offset);
      const satDate = new Date(sunDate);
      satDate.setDate(sunDate.getDate() + 6);

      filteredRecords.push({
        weekKey: wKey,
        monthYearTitle: formatMonthYearHeader(offset),
        startDateFormatted: formatHebrewDateShort(sunDate),
        endDateFormatted: formatHebrewDateShort(satDate),
        items: [],
        completedCount: 0,
        totalAssigned: 0
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                ארכיון והיסטוריית שבועות
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                צפייה בתכנונים קודמים ושחזור שבועות
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Time Period Filter Pills */}
        <div className="p-3 bg-slate-50/80 dark:bg-zinc-800/40 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
              timeFilter === 'all'
                ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 hover:bg-orange-50'
            }`}
          >
            הכל ({historyRecords.length})
          </button>

          <button
            onClick={() => setTimeFilter('1m')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
              timeFilter === '1m'
                ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 hover:bg-orange-50'
            }`}
          >
            חודש אחרון
          </button>

          <button
            onClick={() => setTimeFilter('3m')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
              timeFilter === '3m'
                ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 hover:bg-orange-50'
            }`}
          >
            3 חודשים
          </button>

          <button
            onClick={() => setTimeFilter('1y')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
              timeFilter === '1y'
                ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 hover:bg-orange-50'
            }`}
          >
            שנה אחרונה
          </button>
        </div>

        {/* Aggregate Period Statistics Summary Card */}
        {(() => {
          const totalWeeksInPeriod = filteredRecords.length;
          const totalAssignedInPeriod = filteredRecords.reduce((acc, rec) => acc + rec.totalAssigned, 0);
          const totalCompletedInPeriod = filteredRecords.reduce((acc, rec) => acc + rec.completedCount, 0);
          const aggregatePercentage = totalAssignedInPeriod > 0 
            ? Math.round((totalCompletedInPeriod / totalAssignedInPeriod) * 100)
            : 0;

          let totalMeals = 0;
          let totalWorkouts = 0;
          let totalDates = 0;

          filteredRecords.forEach(rec => {
            rec.items.forEach(item => {
              if (item.recipeId || item.customName || (item.items && item.items.length > 0)) {
                if (item.meal === 'אימון יומי' || item.meal.includes('אימון')) {
                  totalWorkouts++;
                } else if (item.meal === 'דייט / בילוי' || item.meal.includes('דייט')) {
                  totalDates++;
                } else {
                  totalMeals++;
                }
              }
            });
          });

          if (totalWeeksInPeriod === 0) return null;

          return (
            <div className="mx-4 mt-3 p-3.5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 dark:from-orange-950/40 dark:via-zinc-800 dark:to-emerald-950/30 rounded-2xl border border-orange-200/60 dark:border-zinc-800 space-y-2.5 shadow-2xs text-right">
              <div className="flex justify-between items-center text-xs font-black text-slate-800 dark:text-zinc-100">
                <span>
                  📊 סטטיסטיקה מצטברת - {
                    timeFilter === '1m' ? 'חודש אחרון' :
                    timeFilter === '3m' ? '3 חודשים אחרונים' :
                    timeFilter === '1y' ? 'שנה אחרונה' : 'כל הזמנים'
                  }
                </span>
                <span className="text-orange-600 dark:text-orange-400 font-extrabold bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-md text-[11px]">
                  {totalWeeksInPeriod} שבועות רשומים
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                  <span>עמידה ביעדים: <strong className="text-orange-600 dark:text-orange-400">{totalCompletedInPeriod} מתוך {totalAssignedInPeriod}</strong> פריטים הושלמו</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">{aggregatePercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-white/80 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-zinc-700 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${aggregatePercentage}%` }}
                  />
                </div>
              </div>

              {/* Category Breakdown Pills */}
              <div className="flex items-center gap-2 pt-1 text-[10px] font-extrabold text-slate-700 dark:text-zinc-300">
                <span className="bg-white/80 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-1">
                  🍲 {totalMeals} ארוחות
                </span>
                <span className="bg-white/80 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-1">
                  💪 {totalWorkouts} אימונים
                </span>
                <span className="bg-white/80 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-1">
                  🥂 {totalDates} דייטים
                </span>
              </div>
            </div>
          );
        })()}

        {/* Modal Content - History List */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-right">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-slate-50/50 dark:bg-zinc-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 p-6">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto" />
              <p className="text-sm font-black text-slate-700 dark:text-zinc-200">
                אין נתונים היסטוריים לתקופת זמן זו
              </p>
              <span className="text-xs text-slate-400 dark:text-zinc-500 block leading-relaxed">
                טרם נרשמו תכנונים לתקופת הזמן הנבחרת. לחצו על "הכל" או עברו לשבועות השונים כדי למלא ארוחות.
              </span>
            </div>
          ) : (
            filteredRecords.map(record => {
              const completionPercent = record.totalAssigned > 0
                ? Math.round((record.completedCount / record.totalAssigned) * 100)
                : 0;

              // Calculate week offset
              const [yyyy, mm, dd] = record.weekKey.split('-').map(Number);
              const weekDate = new Date(yyyy, mm - 1, dd);
              const calculatedOffset = getWeekOffsetFromDate(weekDate);

              return (
                <div
                  key={record.weekKey}
                  className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3"
                >
                  {/* Record Header & Action Buttons */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">
                        {record.startDateFormatted} – {record.endDateFormatted}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold block mt-0.5">
                        {record.monthYearTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Go to Week Button */}
                      <button
                        onClick={() => {
                          onSelectWeekOffset(calculatedOffset);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                        title="צפייה בשבוע זה במתכנן"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>מעבר לשבוע</span>
                      </button>

                      {/* Copy Week Button */}
                      <button
                        onClick={() => {
                          onCopyPastWeek(record.weekKey);
                          onClose();
                        }}
                        className="p-1.5 rounded-xl bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer"
                        title="שחזור פריטי שבוע זה ללוח השבוע הנוכחי"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Completion Status Bar / Empty Notice */}
                  {record.totalAssigned > 0 ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                        <span>ביצוע: {record.completedCount} מתוך {record.totalAssigned} פריטים</span>
                        <span>{completionPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {/* Detailed Preview of Meals / Workouts / Dates OR Empty Week Badge */}
                  {record.totalAssigned === 0 ? (
                    <div className="pt-2 border-t border-slate-200/40 dark:border-zinc-800/40 text-center py-2">
                      <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-slate-200/50 dark:border-zinc-700/60 inline-flex items-center gap-1.5">
                        ⚪ אין נתונים לשבוע זה (שבוע ריק)
                      </span>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-1 text-xs">
                      {record.items.map((item, idx) => {
                        const recipe = item.recipeId ? recipes.find(r => r.id === item.recipeId) : null;
                        const title = recipe ? recipe.title : item.customName;
                        const hasSubItems = item.items && item.items.length > 0;

                        return (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-slate-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
                            <div className="flex items-center gap-1.5 truncate">
                              {item.completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-zinc-600 flex-shrink-0" />
                              )}
                              <span className="font-bold text-orange-600 dark:text-orange-400">{item.day}:</span>
                              <span className="truncate font-semibold">
                                {item.meal} - {hasSubItems ? `${item.items?.length} מנות` : title || 'פריט בלתי משוים'}
                              </span>
                            </div>

                            {item.isShared === false ? (
                              <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                                🔒 פרטי
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                                👨‍👩‍👧‍👦 משותף
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
