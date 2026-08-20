import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Dumbbell, Flame } from 'lucide-react';
import { Workout, Exercise, MuscleGroup, WorkoutSplit, WorkoutType, FamilyGroup, UserProfile } from '@/src/types';
import { MUSCLE_GROUPS, SPLIT_GROUPS } from '@/src/constants/defaults';
import { PublishScopeSelector, PublishScope } from '@/src/components/common/PublishScopeSelector';

interface WorkoutFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workoutData: Omit<Workout, 'id'>) => void;
  editingWorkout?: Workout | null;
  groups?: FamilyGroup[];
  activeGroup?: FamilyGroup | null;
  currentUser?: UserProfile | null;
}

export const WorkoutFormModal: React.FC<WorkoutFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingWorkout,
  groups = [],
  activeGroup,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [splitGroup, setSplitGroup] = useState<WorkoutSplit>('אימון A');
  const [type, setType] = useState<WorkoutType>('strength');
  const [targetMuscleGroups, setTargetMuscleGroups] = useState<MuscleGroup[]>(['חזה']);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Omit<Exercise, 'id'>[]>([
    { name: '', muscleGroup: 'חזה', sets: 3, reps: 10, weight: 0 }
  ]);

  // 🔒 Scope & Group state
  const [scope, setScope] = useState<PublishScope>('group');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  useEffect(() => {
    if (editingWorkout) {
      setTitle(editingWorkout.title);
      setSplitGroup(editingWorkout.splitGroup);
      setType(editingWorkout.type);
      setTargetMuscleGroups(editingWorkout.targetMuscleGroups);
      setNotes(editingWorkout.notes || '');
      setExercises(editingWorkout.exercises.map(({ id, ...rest }) => rest));
      setScope(editingWorkout.isShared === false ? 'private' : 'group');
      setSelectedGroupId(editingWorkout.groupId || activeGroup?.id || '');
    } else {
      setTitle('');
      setSplitGroup('אימון A');
      setType('strength');
      setTargetMuscleGroups(['חזה']);
      setNotes('');
      setExercises([{ name: '', muscleGroup: 'חזה', sets: 3, reps: 10, weight: 0 }]);
      setScope(activeGroup ? 'group' : 'private');
      setSelectedGroupId(activeGroup?.id || '');
    }
  }, [editingWorkout, isOpen, activeGroup]);

  if (!isOpen) return null;

  const handleAddExercise = () => {
    setExercises(prev => [...prev, { name: '', muscleGroup: 'חזה', sets: 3, reps: 10, weight: 0 }]);
  };

  const handleRemoveExercise = (index: number) => {
    if (exercises.length <= 1) return;
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: keyof Omit<Exercise, 'id'>, value: any) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleMuscleGroupToggle = (mg: MuscleGroup) => {
    setTargetMuscleGroups(prev => 
      prev.includes(mg) ? prev.filter(m => m !== mg) : [...prev, mg]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate title if empty
    let finalTitle = title.trim();
    if (!finalTitle) {
      if (type === 'cardio') {
        finalTitle = 'אימון אירובי יומי';
      } else if (targetMuscleGroups.length > 0) {
        finalTitle = `${splitGroup} - ${targetMuscleGroups.join(' ו-')}`;
      } else {
        finalTitle = `${splitGroup} - אימון כושר`;
      }
    }

    const validExercises: Exercise[] = exercises
      .filter(ex => ex.name.trim().length > 0)
      .map((ex, idx) => ({ ...ex, id: 'ex_' + Date.now() + '_' + idx }));

    if (validExercises.length === 0) {
      alert('אנא הזן לפחות תרגיל אחד לאימון');
      return;
    }

    onSubmit({
      title: finalTitle,
      splitGroup,
      type,
      targetMuscleGroups: targetMuscleGroups.length > 0 ? targetMuscleGroups : ['חזה'],
      exercises: validExercises,
      notes: notes.trim(),
      isShared: scope !== 'private',
      groupId: scope === 'group' ? (selectedGroupId || activeGroup?.id || undefined) : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                {editingWorkout ? 'עריכת תוכנית אימון' : 'יצירת אימון חדש'}
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                הגדרת תרגילים, חלוקת A/B/C ומשקלי יעד
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-right">
          
          {/* 🔒 Visibility Scope Selector */}
          <PublishScopeSelector
            scope={scope}
            onChangeScope={setScope}
            selectedGroupId={selectedGroupId}
            onChangeGroupId={setSelectedGroupId}
            groups={groups}
            activeGroup={activeGroup}
            currentUser={currentUser}
            allowPublic={false}
          />

          {/* Title (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              שם האימון <span className="text-slate-400 dark:text-zinc-500 font-normal">(אופציונלי - ייווצר אוטומטית אם יושאר ריק)</span>
            </label>
            <input
              type="text"
              placeholder="למשל: אימון A - חזה וזרוע אחורית (או השאירו ריק לשם אוטומטי)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
            />
          </div>

          {/* Split & Type Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                חלוקת אימון (Split)
              </label>
              <select
                value={splitGroup}
                onChange={e => setSplitGroup(e.target.value as WorkoutSplit)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 cursor-pointer"
              >
                {SPLIT_GROUPS.map(sg => (
                  <option key={sg} value={sg}>{sg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                סוג אימון
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as WorkoutType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 cursor-pointer"
              >
                <option value="strength">🏋️ כוח / משקולות</option>
                <option value="cardio">🏃 אירובי / ריצה</option>
              </select>
            </div>
          </div>

          {/* Target Muscle Groups Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              אזורי גוף / שרירים באימון
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MUSCLE_GROUPS.map(mg => {
                const isSelected = targetMuscleGroups.includes(mg);
                return (
                  <button
                    key={mg}
                    type="button"
                    onClick={() => handleMuscleGroupToggle(mg)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200/80 dark:border-zinc-700 hover:bg-slate-200'
                    }`}
                  >
                    {mg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Exercises List */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-orange-500" />
                <span>תרגילים באימון ({exercises.length})</span>
              </h4>

              <button
                type="button"
                onClick={handleAddExercise}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 cursor-pointer bg-orange-50 dark:bg-orange-950/20 px-2.5 py-1 rounded-lg border border-orange-200/60 dark:border-orange-900/30"
              >
                <Plus className="w-3.5 h-3.5" /> תרגיל נוסף
              </button>
            </div>

            {exercises.map((ex, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 space-y-2 relative group"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-100/60 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                    #{idx + 1}
                  </span>

                  <input
                    type="text"
                    required
                    placeholder="שם התרגיל (למשל: לחיצת חזה)"
                    value={ex.name}
                    onChange={e => handleExerciseChange(idx, 'name', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
                  />

                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Exercise Muscle Group Category Pills */}
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-1 font-bold">
                    קטגוריית שריר לתרגיל:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {MUSCLE_GROUPS.map(mg => {
                      const isMgSelected = ex.muscleGroup === mg;
                      return (
                        <button
                          key={mg}
                          type="button"
                          onClick={() => handleExerciseChange(idx, 'muscleGroup', mg)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer border ${
                            isMgSelected
                              ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                          }`}
                        >
                          {mg}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sets, Reps & Weight Inputs */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mb-0.5">סטים</span>
                    <input
                      type="number"
                      min="1"
                      value={ex.sets}
                      onChange={e => handleExerciseChange(idx, 'sets', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-center font-bold"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mb-0.5">חזרות</span>
                    <input
                      type="number"
                      min="1"
                      value={ex.reps}
                      onChange={e => handleExerciseChange(idx, 'reps', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-center font-bold"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mb-0.5">משקל (ק״ג)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={ex.weight}
                      onChange={e => handleExerciseChange(idx, 'weight', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-center font-bold text-orange-600 dark:text-orange-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all cursor-pointer text-xs"
            >
              {editingWorkout ? 'שמירת שינויים באימון' : 'יצירת אימון חדש'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
