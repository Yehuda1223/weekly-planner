import React, { useState } from 'react';
import { X, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { HEBREW_MONTHS, getWeekOffsetFromDate, getSundayOfWeek, getWeekKey } from '@/src/utils/dateUtils';
import { MealPlanItem } from '@/src/types';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeekOffset: number;
  mealPlan?: MealPlanItem[];
  onSelectDateOffset: (newOffset: number) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  currentWeekOffset,
  mealPlan = [],
  onSelectDateOffset
}) => {
  const currentSunday = getSundayOfWeek(new Date(), currentWeekOffset);
  const [viewYear, setViewYear] = useState<number>(currentSunday.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(currentSunday.getMonth());

  if (!isOpen) return null;

  // Days in selected month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (dayNum: number) => {
    const selectedDate = new Date(viewYear, viewMonth, dayNum);
    const newOffset = getWeekOffsetFromDate(selectedDate);
    onSelectDateOffset(newOffset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-orange-500/10 to-amber-500/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
              בחירת תאריך בלוח השנה
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Controller */}
        <div className="p-4 space-y-4 text-center">
          
          {/* Month & Year Navigation */}
          <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-2xl border border-slate-200/60 dark:border-zinc-700">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">
              {HEBREW_MONTHS[viewMonth]} {viewYear}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Days Header (Sun - Sat) */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 dark:text-zinc-500">
            <span>א׳</span>
            <span>ב׳</span>
            <span>ג׳</span>
            <span>ד׳</span>
            <span>ה׳</span>
            <span>ו׳</span>
            <span>ש׳</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for first week padding */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-9" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const thisDate = new Date(viewYear, viewMonth, dayNum);
              const isToday = new Date().toDateString() === thisDate.toDateString();

              // Check if date has planned items
              const dayOffset = getWeekOffsetFromDate(thisDate);
              const dayWeekKey = getWeekKey(dayOffset);
              const hasPlans = mealPlan.some(i => (i.weekKey || getWeekKey(0)) === dayWeekKey && (i.recipeId || i.customName || (i.items && i.items.length > 0)));

              return (
                <button
                  key={dayNum}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-9 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center relative border ${
                    isToday
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                      : hasPlans
                      ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/40 font-black'
                      : 'bg-slate-50 dark:bg-zinc-800/40 text-slate-700 dark:text-zinc-200 border-slate-200/60 dark:border-zinc-800 hover:bg-orange-100 dark:hover:bg-orange-950/40'
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasPlans && (
                    <span className="w-1 h-1 rounded-full bg-orange-500 dark:bg-orange-400 absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
