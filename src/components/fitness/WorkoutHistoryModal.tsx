import React from 'react';
import { X, History, Dumbbell, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { WorkoutLogRecord } from '@/src/types';

interface WorkoutHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: WorkoutLogRecord[];
}

export const WorkoutHistoryModal: React.FC<WorkoutHistoryModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                היסטוריית אימונים ושיאים
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                תיעוד אימונים שבוצעו, משקלים והתקדמות
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

        {/* Logs List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 text-right">
          {logs.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Dumbbell className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto" />
              <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">
                טרם נרשמו אימונים בהיסטוריה
              </p>
              <span className="text-xs text-slate-400 dark:text-zinc-550 block">
                בסיום אימון, לחצו על "סיימתי אימון זה היום!" והאימון יישמר כאן.
              </span>
            </div>
          ) : (
            logs.map(log => (
              <div
                key={log.id}
                className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-2.5"
              >
                {/* Log Header */}
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-zinc-800/60 pb-2">
                  <div>
                    <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-100/60 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                      {log.splitGroup}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 mt-1">
                      {log.workoutTitle}
                    </h4>
                  </div>

                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-orange-500" />
                      {log.date}
                    </span>
                  </div>
                </div>

                {/* Exercises Performed */}
                <div className="space-y-1 text-xs">
                  {log.completedExercises.map((ex, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-zinc-300">
                      <span className="font-semibold">{ex.exerciseName}</span>
                      <span className="font-black text-orange-600 dark:text-orange-400">
                        {ex.sets} סטים x {ex.reps} • {ex.weight} ק״ג
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
