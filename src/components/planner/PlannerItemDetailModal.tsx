import React, { useState, useEffect, useRef } from 'react';
import { X, Dumbbell, Heart, Utensils, MapPin, Star, Clock, CheckCircle2, Circle, Camera, Save, StickyNote, Navigation, Trash2, ImageIcon, CheckSquare } from 'lucide-react';
import { MealPlanItem, Recipe, Workout, DateSpot, DayExerciseOverride } from '@/src/types';
import { uploadPlannerPhotoToSupabase } from '@/src/utils/imageUtils';

interface PlannerItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: MealPlanItem | null;
  recipes: Recipe[];
  workouts: Workout[];
  dateSpots: DateSpot[];
  onUpdatePlanItem?: (itemId: string, updates: Partial<Pick<MealPlanItem, 'dayNotes' | 'dayPhotos' | 'dayExerciseOverrides'>>) => void;
  onDeleteItem?: (itemId?: string, day?: string, meal?: string) => void;
}

export const PlannerItemDetailModal: React.FC<PlannerItemDetailModalProps> = ({
  isOpen,
  onClose,
  plan,
  recipes,
  workouts,
  dateSpots,
  onUpdatePlanItem,
  onDeleteItem
}) => {
  const [dayNotes, setDayNotes] = useState('');
  const [dayPhotos, setDayPhotos] = useState<string[]>([]);
  const [exerciseOverrides, setExerciseOverrides] = useState<DayExerciseOverride[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing data when modal opens
  useEffect(() => {
    if (isOpen && plan) {
      setDayNotes(plan.dayNotes || '');
      setDayPhotos(plan.dayPhotos || []);
      setExerciseOverrides(plan.dayExerciseOverrides || []);
      setHasChanges(false);
      setSavedMessage(false);
    }
  }, [isOpen, plan]);

  if (!isOpen || !plan) return null;

  const isWorkout = plan.meal === 'אימון יומי' || plan.meal.includes('אימון');
  const isDate = plan.meal === 'דייט / בילוי' || plan.meal.includes('דייט');
  const isTask = plan.meal === 'מטלה יומית' || plan.meal.includes('מטלה') || plan.meal.includes('סידורים') || (plan.customName && plan.customName.startsWith('📝'));

  const workout = isWorkout && plan.recipeId ? workouts.find(w => w.id === plan.recipeId) : null;
  const dateSpot = isDate && plan.recipeId ? dateSpots.find(d => d.id === plan.recipeId) : null;
  const recipe = !isWorkout && !isDate && !isTask && plan.recipeId ? recipes.find(r => r.id === plan.recipeId) : null;

  // Resolve sub-item recipes
  const subItemRecipes = plan.items?.map(sub => ({
    ...sub,
    resolvedRecipe: sub.recipeId ? recipes.find(r => r.id === sub.recipeId) : null
  })) || [];

  // Get effective exercise value (override or original)
  const getExerciseValue = (exerciseId: string, field: 'sets' | 'reps' | 'weight', originalValue: number) => {
    const override = exerciseOverrides.find(o => o.exerciseId === exerciseId);
    if (override && override[field] !== undefined) return override[field]!;
    return originalValue;
  };

  const getExerciseNotes = (exerciseId: string) => {
    const override = exerciseOverrides.find(o => o.exerciseId === exerciseId);
    return override?.notes || '';
  };

  const updateExerciseOverride = (exerciseId: string, field: 'sets' | 'reps' | 'weight' | 'notes', value: number | string) => {
    setExerciseOverrides(prev => {
      const existing = prev.find(o => o.exerciseId === exerciseId);
      if (existing) {
        return prev.map(o => o.exerciseId === exerciseId ? { ...o, [field]: value } : o);
      }
      return [...prev, { exerciseId, [field]: value }];
    });
    setHasChanges(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(f => uploadPlannerPhotoToSupabase(f));
      const urls = await Promise.all(uploadPromises);
      setDayPhotos(prev => [...prev, ...urls]);
      setHasChanges(true);
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setDayPhotos(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!plan.id || !onUpdatePlanItem) return;
    onUpdatePlanItem(plan.id, {
      dayNotes,
      dayPhotos,
      dayExerciseOverrides: exerciseOverrides
    });
    setHasChanges(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className={`p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center ${
          isDate ? 'bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent'
            : isWorkout ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent'
            : isTask ? 'bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent'
            : 'bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDate ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : isWorkout ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : isTask ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
            }`}>
              {isDate ? <Heart className="w-5 h-5 fill-rose-500/20" />
                : isWorkout ? <Dumbbell className="w-5 h-5" />
                : isTask ? <CheckSquare className="w-5 h-5" />
                : <Utensils className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                פרטי {isDate ? 'דייט' : isWorkout ? 'אימון' : isTask ? 'מטלה' : 'ארוחה'}
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                {plan.day} • {plan.meal}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {hasChanges && (
              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer animate-fadeIn"
              >
                <Save className="w-3.5 h-3.5" /> שמור
              </button>
            )}
            {savedMessage && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn">✅ נשמר!</span>
            )}
            {onDeleteItem && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`האם למחוק פריט זה (${plan.meal}) מלוח התכנון?`)) {
                    onDeleteItem(plan.id, plan.day, plan.meal);
                    onClose();
                  }
                }}
                className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center text-rose-500 transition-colors cursor-pointer"
                title="מחיקת פריט זה מלוח התכנון"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-right">

          {/* Completion Status Badge */}
          <div className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl border ${
            plan.completed
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40'
              : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
          }`}>
            {plan.completed
              ? <><CheckCircle2 className="w-3.5 h-3.5" /> הושלם ✅</>
              : <><Circle className="w-3.5 h-3.5" /> טרם הושלם</>}
          </div>

          {/* ====== WORKOUT DETAILS WITH EDITABLE WEIGHTS ====== */}
          {isWorkout && (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">
                {workout ? `${workout.splitGroup}: ${workout.title}` : plan.customName || 'אימון'}
              </h4>

              {workout && (
                <>
                  {/* Muscle groups */}
                  <div className="flex flex-wrap gap-1.5">
                    {workout.targetMuscleGroups.map(mg => (
                      <span key={mg} className="text-[10px] font-bold bg-amber-100/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-900/40">
                        {mg}
                      </span>
                    ))}
                  </div>

                  {/* Editable Exercises list */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                    <span className="text-xs font-black text-slate-700 dark:text-zinc-200 flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5 text-orange-500" /> תרגילים ({workout.exercises.length}) — ערוך משקלים וחזרות ליום זה
                    </span>
                    {workout.exercises.map((ex, idx) => {
                      const currentSets = getExerciseValue(ex.id, 'sets', ex.sets);
                      const currentReps = getExerciseValue(ex.id, 'reps', ex.reps);
                      const currentWeight = getExerciseValue(ex.id, 'weight', ex.weight);
                      const currentNotes = getExerciseNotes(ex.id);

                      return (
                        <div key={ex.id || idx} className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 space-y-2">
                          <div className="flex items-center gap-1.5 justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-100">{ex.name}</span>
                              <span className="text-[9px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-900/40">
                                {ex.muscleGroup}
                              </span>
                            </div>
                          </div>

                          {/* Editable fields: sets × reps × weight */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 block text-center">סטים</label>
                              <input
                                type="number"
                                min={1}
                                value={currentSets}
                                onChange={e => updateExerciseOverride(ex.id, 'sets', parseInt(e.target.value) || 0)}
                                className="w-full text-center text-xs font-black bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-orange-600 dark:text-orange-400 focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-800 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 block text-center">חזרות</label>
                              <input
                                type="number"
                                min={1}
                                value={currentReps}
                                onChange={e => updateExerciseOverride(ex.id, 'reps', parseInt(e.target.value) || 0)}
                                className="w-full text-center text-xs font-black bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-orange-600 dark:text-orange-400 focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-800 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 block text-center">משקל (ק״ג)</label>
                              <input
                                type="number"
                                min={0}
                                step={0.5}
                                value={currentWeight}
                                onChange={e => updateExerciseOverride(ex.id, 'weight', parseFloat(e.target.value) || 0)}
                                className="w-full text-center text-xs font-black bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-800 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Per-exercise notes */}
                          <input
                            type="text"
                            placeholder="הערה על התרגיל..."
                            value={currentNotes}
                            onChange={e => updateExerciseOverride(ex.id, 'notes', e.target.value)}
                            className="w-full text-[11px] font-bold bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-700/60 rounded-xl px-2.5 py-1.5 text-slate-600 dark:text-zinc-400 placeholder:text-slate-300 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-amber-300 focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {workout.notes && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
                      💡 <strong>דגשים:</strong> {workout.notes}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ====== DATE DETAILS (FULL) ====== */}
          {isDate && (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">
                🥂 {dateSpot ? dateSpot.title : plan.customName || 'דייט'}
              </h4>

              {dateSpot && (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-md border border-rose-200/50 dark:border-rose-900/40">
                      {dateSpot.category}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-900/40 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-500" /> {dateSpot.rating}/5
                    </span>
                    <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-900/40">
                      ביקורים: {dateSpot.visitCount}
                    </span>
                  </div>

                  {dateSpot.address && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-800">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span className="font-bold flex-1">{dateSpot.address}</span>
                      {dateSpot.wazeUrl && (
                        <a
                          href={dateSpot.wazeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-lg border border-blue-200/60 dark:border-blue-900/40 flex items-center gap-0.5 hover:bg-blue-100 transition-colors"
                        >
                          <Navigation className="w-3 h-3" /> Waze
                        </a>
                      )}
                    </div>
                  )}

                  {dateSpot.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200/60 dark:border-zinc-800">
                      <img src={dateSpot.imageUrl} alt={dateSpot.title} className="w-full h-32 object-cover" />
                    </div>
                  )}

                  {dateSpot.notes && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 rounded-2xl text-xs text-rose-800 dark:text-rose-300">
                      💡 <strong>הערות:</strong> {dateSpot.notes}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ====== TASK DETAILS ====== */}
          {isTask && (
            <div className="space-y-3">
              <div className="p-4 bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-orange-500" />
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">
                    {plan.customName ? plan.customName.replace(/^📝\s*/, '') : plan.meal}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-md border border-orange-200/60">
                    מטלה בלוח השבועי
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    יום {plan.day}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ====== MEAL DETAILS (FULL - with ingredients + instructions) ====== */}
          {!isWorkout && !isDate && !isTask && (
            <div className="space-y-3">
              {/* Multi-item meal */}
              {subItemRecipes.length > 0 ? (
                <div className="space-y-2.5">
                  <span className="text-xs font-black text-slate-700 dark:text-zinc-200 flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-orange-500" /> מנות בארוחה ({subItemRecipes.length})
                  </span>
                  {subItemRecipes.map(sub => (
                    <div key={sub.id} className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950 px-1.5 py-0.5 rounded-md">
                          {sub.courseType}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                          {sub.resolvedRecipe ? sub.resolvedRecipe.title : sub.customName || '—'}
                        </span>
                      </div>

                      {sub.resolvedRecipe && (
                        <div className="space-y-2 pt-1.5 border-t border-slate-200/40 dark:border-zinc-700/60">
                          {sub.resolvedRecipe.description && (
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">{sub.resolvedRecipe.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-bold bg-orange-100/80 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-md">{sub.resolvedRecipe.category}</span>
                            {sub.resolvedRecipe.prep_time && (
                              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {sub.resolvedRecipe.prep_time}
                              </span>
                            )}
                          </div>
                          {sub.resolvedRecipe.ingredients.length > 0 && (
                            <div>
                              <span className="text-[11px] font-black text-slate-600 dark:text-zinc-300">מרכיבים:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sub.resolvedRecipe.ingredients.map((ing, i) => (
                                  <span key={i} className="text-[10px] font-bold bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-zinc-700">
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {sub.resolvedRecipe.instructions && (
                            <div className="pt-1.5 border-t border-slate-200/40 dark:border-zinc-700/60">
                              <span className="text-[11px] font-black text-slate-600 dark:text-zinc-300">הוראות הכנה:</span>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line mt-1">{sub.resolvedRecipe.instructions}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : recipe ? (
                /* Single recipe detail - FULL */
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">
                    {recipe.title}
                  </h4>
                  {recipe.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200/60 dark:border-zinc-800">
                      <img src={recipe.image_url} alt={recipe.title} className="w-full h-36 object-cover" />
                    </div>
                  )}
                  {recipe.description && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{recipe.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold bg-orange-100/80 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-md border border-orange-200/50">
                      {recipe.category}
                    </span>
                    {recipe.prep_time && (
                      <span className="text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-zinc-700 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {recipe.prep_time}
                      </span>
                    )}
                  </div>
                  {/* Full ingredients list */}
                  {recipe.ingredients.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 space-y-1">
                      <span className="text-xs font-black text-slate-700 dark:text-zinc-200">🧂 מרכיבים:</span>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.map((ing, i) => (
                          <span key={i} className="text-[10px] font-bold bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-zinc-700">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Full cooking instructions */}
                  {recipe.instructions && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 space-y-1">
                      <span className="text-xs font-black text-slate-700 dark:text-zinc-200">📋 הוראות הכנה:</span>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-slate-200/40 dark:border-zinc-700/60">
                        {recipe.instructions}
                      </p>
                    </div>
                  )}
                </div>
              ) : plan.customName ? (
                <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">{plan.customName}</h4>
              ) : null}
            </div>
          )}

          {/* ====== DIVIDER ====== */}
          <div className="border-t border-dashed border-slate-200 dark:border-zinc-800 pt-3 space-y-3">

            {/* ====== DAY NOTES ====== */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-zinc-200 flex items-center gap-1">
                <StickyNote className="w-3.5 h-3.5 text-amber-500" /> הערות ליום זה
              </label>
              <textarea
                value={dayNotes}
                onChange={e => { setDayNotes(e.target.value); setHasChanges(true); }}
                placeholder="כתוב הערות, דגשים, או רשמים מהיום..."
                rows={3}
                className="w-full text-xs font-bold bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2.5 text-slate-700 dark:text-zinc-300 placeholder:text-slate-300 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-800 focus:outline-none resize-none"
              />
            </div>

            {/* ====== DAY PHOTOS ====== */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-zinc-200 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-blue-500" /> תמונות מהיום
              </label>

              {/* Photo grid */}
              {dayPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {dayPhotos.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200/60 dark:border-zinc-700 aspect-square cursor-pointer" onClick={() => setExpandedPhoto(url)}>
                      <img src={url} alt={`תמונה ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemovePhoto(i); }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-950/40 text-xs font-extrabold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <span className="animate-pulse">⏳ מעלה תמונות...</span>
                ) : (
                  <><ImageIcon className="w-3.5 h-3.5" /> הוספת תמונות</>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Sticky Save Footer - Only show when there are changes */}
        {hasChanges && (
          <div className="sticky bottom-0 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-t border-slate-100 dark:border-zinc-800 flex justify-center">
            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-extrabold flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" /> שמור שינויים
            </button>
          </div>
        )}

      </div>
    </div>

    {/* Expanded Photo Lightbox */}
    {expandedPhoto && (
      <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={() => setExpandedPhoto(null)}>
        <div className="relative max-w-lg w-full">
          <img src={expandedPhoto} alt="תמונה מורחבת" className="w-full rounded-2xl shadow-2xl" />
          <button
            onClick={() => setExpandedPhoto(null)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}
    </>
  );
};
