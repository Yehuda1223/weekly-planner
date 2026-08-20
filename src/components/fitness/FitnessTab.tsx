import React, { useState } from 'react';
import { 
  Dumbbell, 
  Plus, 
  History, 
  Flame, 
  Trophy, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  Layers, 
  Target,
  Lock
} from 'lucide-react';
import { Workout, WorkoutSplit, MuscleGroup, WorkoutLogRecord, UserProfile, FamilyGroup } from '@/src/types';
import { SPLIT_GROUPS, MUSCLE_GROUPS } from '@/src/constants/defaults';
import { WorkoutFormModal } from './WorkoutFormModal';
import { WorkoutDetailModal } from './WorkoutDetailModal';
import { WorkoutHistoryModal } from './WorkoutHistoryModal';
import { ItemScopeBadge } from '@/src/components/common/ItemScopeBadge';

interface FitnessTabProps {
  workouts: Workout[];
  currentUser?: UserProfile | null;
  activeGroup?: FamilyGroup | null;
  groups?: FamilyGroup[];
  workoutLogs: WorkoutLogRecord[];
  fitnessGoal: number; // workouts per week
  onAddWorkout: (workoutData: Omit<Workout, 'id'>) => void;
  onUpdateWorkout: (id: string, updatedWorkout: Omit<Workout, 'id'>) => void;
  onDeleteWorkout: (id: string) => void;
  onUpdateExerciseWeight: (workoutId: string, exerciseId: string, newWeight: number) => void;
  onLogWorkoutCompleted: (workout: Workout) => void;
  isGuest?: boolean;
}

export const FitnessTab: React.FC<FitnessTabProps> = ({
  workouts,
  currentUser,
  activeGroup,
  groups = [],
  workoutLogs,
  fitnessGoal = 4,
  onAddWorkout,
  onUpdateWorkout,
  onDeleteWorkout,
  onUpdateExerciseWeight,
  onLogWorkoutCompleted,
  isGuest = false
}) => {
  const [selectedSplit, setSelectedSplit] = useState<string>('הכל');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('הכל');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Compute weekly workouts completed from logs
  const completedThisWeekCount = workoutLogs.filter(log => {
    const logDate = new Date(log.date);
    const today = new Date();
    const diffTime = today.getTime() - logDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const goalPercentage = Math.min(100, Math.round((completedThisWeekCount / fitnessGoal) * 100));

  // Filter workouts by split and muscle group
  const filteredWorkouts = workouts.filter(w => {
    const matchesSplit = selectedSplit === 'הכל' || w.splitGroup === selectedSplit;
    const matchesMuscle = selectedMuscle === 'הכל' || w.targetMuscleGroups.includes(selectedMuscle as MuscleGroup);
    return matchesSplit && matchesMuscle;
  });

  const handleOpenAddModal = () => {
    setEditingWorkout(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (workout: Workout) => {
    setSelectedWorkout(null);
    setEditingWorkout(workout);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (workoutData: Omit<Workout, 'id'>) => {
    if (editingWorkout) {
      onUpdateWorkout(editingWorkout.id, workoutData);
    } else {
      onAddWorkout(workoutData);
    }
    setIsFormModalOpen(false);
    setEditingWorkout(null);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* 🏋️ Header & Weekly Fitness Goal Card */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-zinc-900 border border-orange-200/60 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3">
        
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                ספריית אימונים וכושר
              </h2>
            </div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 block">
              חלוקת אימוני A/B/C, ניהול תרגילים ומשקלים
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1 border border-slate-200/80 dark:border-zinc-700 shadow-sm cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-orange-500" />
              <span>היסטוריה</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all ${
                isGuest
                  ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-300 dark:border-zinc-700 opacity-60 cursor-not-allowed shadow-none'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer'
              }`}
              title={isGuest ? 'מצב אורח - צפייה בלבד' : 'הוספת אימון חדש'}
            >
              {isGuest ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>אימון חדש</span>
            </button>
          </div>
        </div>

        {/* Weekly Goal Progress Bar */}
        <div className="pt-2 border-t border-orange-200/40 dark:border-zinc-800/60 space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-zinc-300">
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              יעד שבועי: {completedThisWeekCount} מתוך {fitnessGoal} אימונים
            </span>
            <span className="text-orange-600 dark:text-orange-400">{goalPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-white/80 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-zinc-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${goalPercentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* 📌 Sticky Filter Header: Split & Muscle Groups (Always visible during scroll) */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md -mx-4 px-4 pt-1 pb-2.5 space-y-2 border-b border-slate-100 dark:border-zinc-800/80 shadow-2xs">
        {/* 🏷️ Filter Pills: Split Groups */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => setSelectedSplit('הכל')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer border ${
              selectedSplit === 'הכל'
                ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 hover:bg-slate-50'
            }`}
          >
            הכל ({workouts.length})
          </button>

          {SPLIT_GROUPS.map(sg => {
            const count = workouts.filter(w => w.splitGroup === sg).length;
            return (
              <button
                key={sg}
                onClick={() => setSelectedSplit(sg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer border ${
                  selectedSplit === sg
                    ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 hover:bg-slate-50'
                }`}
              >
                {sg} ({count})
              </button>
            );
          })}
        </div>

        {/* 🏷️ Filter Pills: Muscle Groups */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => setSelectedMuscle('הכל')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedMuscle === 'הכל'
                ? 'bg-slate-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-black'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200'
            }`}
          >
            כל השרירים
          </button>

          {MUSCLE_GROUPS.map(mg => (
            <button
              key={mg}
              onClick={() => setSelectedMuscle(mg)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedMuscle === mg
                  ? 'bg-slate-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-black'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              {mg}
            </button>
          ))}
        </div>
      </div>

      {/* 🏋️ Workout Cards Grid */}
      <div className="space-y-3">
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-12 space-y-2 bg-slate-50 dark:bg-zinc-800/20 border border-slate-100 dark:border-zinc-800/40 rounded-3xl">
            <Dumbbell className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto" />
            <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">
              לא נמצאו אימונים בקטגוריה זו
            </p>
            <button
              onClick={handleOpenAddModal}
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
            >
              לחצו כאן ליצירת אימון חדש +
            </button>
          </div>
        ) : (
          filteredWorkouts.map(workout => {
            const maxWeight = Math.max(...workout.exercises.map(e => e.weight), 0);

            return (
              <div
                key={workout.id}
                onClick={() => setSelectedWorkout(workout)}
                className="bg-slate-50 dark:bg-zinc-800/30 border border-slate-200/80 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-900/50 rounded-2xl p-4 space-y-2.5 transition-all hover:shadow-md cursor-pointer text-right group"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-100/80 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                        {workout.splitGroup}
                      </span>
                      <ItemScopeBadge item={workout} currentUser={currentUser} activeGroup={activeGroup} />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 group-hover:text-orange-600 transition-colors mt-1">
                      {workout.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(workout);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                      title="עריכה"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWorkout(workout.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="מחיקה"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Muscle Badges */}
                <div className="flex flex-wrap gap-1">
                  {workout.targetMuscleGroups.map(mg => (
                    <span
                      key={mg}
                      className="text-[9px] font-bold bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-md"
                    >
                      {mg}
                    </span>
                  ))}
                </div>

                {/* Exercises Summary Preview */}
                <div className="pt-2 border-t border-slate-200/50 dark:border-zinc-800/60 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">
                    {workout.exercises.length} תרגילים • משקל שיא: <strong className="text-orange-600 dark:text-orange-400">{maxWeight} ק״ג</strong>
                  </span>
                  <span className="text-orange-500 font-bold flex items-center gap-0.5 group-hover:translate-x-[-2px] transition-transform text-[11px]">
                    הצג תרגילים <ChevronLeft className="w-3.5 h-3.5" />
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      <WorkoutFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingWorkout={editingWorkout}
        groups={groups}
        activeGroup={activeGroup}
        currentUser={currentUser}
      />

      {/* Detail Modal */}
      <WorkoutDetailModal
        workout={selectedWorkout ? (workouts.find(w => w.id === selectedWorkout.id) || selectedWorkout) : null}
        isOpen={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        onEdit={handleOpenEditModal}
        onUpdateWeight={onUpdateExerciseWeight}
        onLogWorkoutCompleted={onLogWorkoutCompleted}
      />

      {/* History Modal */}
      <WorkoutHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        logs={workoutLogs}
      />

    </div>
  );
};
