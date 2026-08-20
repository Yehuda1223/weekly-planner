import React, { useState } from 'react';
import { X, Dumbbell, CheckCircle2, Flame, Edit2, TrendingUp } from 'lucide-react';
import { Workout, Exercise } from '@/src/types';

interface WorkoutDetailModalProps {
  workout: Workout | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (workout: Workout) => void;
  onUpdateWeight: (workoutId: string, exerciseId: string, newWeight: number) => void;
  onLogWorkoutCompleted: (workout: Workout) => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workout,
  isOpen,
  onClose,
  onEdit,
  onUpdateWeight,
  onLogWorkoutCompleted
}) => {
  const [completedToday, setCompletedToday] = useState(false);

  if (!isOpen || !workout) return null;

  const handleLogClick = () => {
    onLogWorkoutCompleted(workout);
    setCompletedToday(true);
    setTimeout(() => {
      setCompletedToday(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                  {workout.splitGroup}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                  {workout.title}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {workout.exercises.length} תרגילים • {workout.targetMuscleGroups.join(', ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(workout)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer"
              title="עריכת אימון"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Exercises & Weights List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 text-right">
          <h4 className="text-xs font-black text-slate-700 dark:text-zinc-300 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            <span>תרגילים ועדכון משקלים בלייב</span>
          </h4>

          {workout.exercises.map((ex, idx) => (
            <div
              key={ex.id || idx}
              className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-extrabold text-slate-800 dark:text-zinc-100">
                    {ex.name}
                  </h5>
                  <span className="text-[9px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-900/40">
                    {ex.muscleGroup || 'כללי'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {ex.sets} סטים x {ex.reps} חזרות
                </span>
              </div>

              {/* Weight Quick & Live Adjuster */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => onUpdateWeight(workout.id, ex.id, Math.max(0, parseFloat((ex.weight - 2.5).toFixed(1))))}
                  className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-zinc-700 font-black text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors cursor-pointer text-sm shadow-2xs"
                  title="-2.5 ק״ג"
                >
                  -
                </button>

                <div className="flex items-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-0.5 shadow-2xs">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={ex.weight}
                    onChange={e => onUpdateWeight(workout.id, ex.id, parseFloat(e.target.value) || 0)}
                    className="w-12 text-center font-black text-orange-600 dark:text-orange-400 bg-transparent focus:outline-none text-xs"
                  />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 pr-0.5">ק״ג</span>
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateWeight(workout.id, ex.id, parseFloat((ex.weight + 2.5).toFixed(1)))}
                  className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-zinc-700 font-black text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors cursor-pointer text-sm shadow-2xs"
                  title="+2.5 ק״ג"
                >
                  +
                </button>
              </div>
            </div>
          ))}

          {workout.notes && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
              💡 <strong>דגשים לאימון:</strong> {workout.notes}
            </div>
          )}
        </div>

        {/* Action Button: Log Workout Completed */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={handleLogClick}
            disabled={completedToday}
            className={`w-full py-3 px-4 rounded-2xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              completedToday
                ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 active:scale-[0.99]'
            }`}
          >
            {completedToday ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>האימון נרשם בהצלחה! 💪</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                <span>סיימתי אימון זה היום! (רישום בהיסטוריה)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
