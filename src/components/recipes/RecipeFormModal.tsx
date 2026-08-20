import React, { useState, useEffect, ChangeEvent } from 'react';
import { X, Upload, Image as ImageIcon, Trash2, Camera, Loader2 } from 'lucide-react';
import { Recipe, FamilyGroup, UserProfile } from '@/src/types';
import { compressImage, uploadRecipeImageToSupabase } from '@/src/utils/imageUtils';
import { PublishScopeSelector, PublishScope } from '@/src/components/common/PublishScopeSelector';

interface RecipeFormModalProps {
  isOpen: boolean;
  initialRecipe?: Recipe | null;
  onClose: () => void;
  onSubmit: (recipeData: Omit<Recipe, 'id'>) => void;
  groups?: FamilyGroup[];
  activeGroup?: FamilyGroup | null;
  currentUser?: UserProfile | null;
}

export const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  isOpen,
  initialRecipe,
  onClose,
  onSubmit,
  groups = [],
  activeGroup,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ערב');
  const [prepTime, setPrepTime] = useState('20 דק׳');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructions, setInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'camera' | 'upload'>('camera');
  const [isCompressing, setIsCompressing] = useState(false);
  
  // 🔒 Scope & Visibility State
  const [scope, setScope] = useState<PublishScope>('group');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  useEffect(() => {
    if (initialRecipe) {
      setTitle(initialRecipe.title);
      setDescription(initialRecipe.description);
      setCategory(
        initialRecipe.category === 'Breakfast' || initialRecipe.category === 'בוקר' ? 'בוקר' :
        initialRecipe.category === 'Lunch' || initialRecipe.category === 'צהריים' ? 'צהריים' :
        initialRecipe.category === 'Dinner' || initialRecipe.category === 'ערב' ? 'ערב' :
        initialRecipe.category === 'Dessert' || initialRecipe.category === 'קינוח' ? 'קינוח' : initialRecipe.category
      );
      setPrepTime(initialRecipe.prep_time);
      setIngredientsText(initialRecipe.ingredients.join('\n'));
      setInstructions(initialRecipe.instructions);
      setImageUrl(initialRecipe.image_url || '');
      
      if (initialRecipe.is_public) {
        setScope('public');
      } else if (initialRecipe.isShared === false) {
        setScope('private');
      } else {
        setScope('group');
      }
      setSelectedGroupId(initialRecipe.groupId || activeGroup?.id || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('ערב');
      setPrepTime('20 דק׳');
      setIngredientsText('');
      setInstructions('');
      setImageUrl('');
      setScope(activeGroup ? 'group' : 'private');
      setSelectedGroupId(activeGroup?.id || '');
    }
  }, [initialRecipe, isOpen, activeGroup]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        // Automatically compress & upload to Supabase Storage Bucket ('recipe-images')
        const uploadedUrl = await uploadRecipeImageToSupabase(file);
        setImageUrl(uploadedUrl);
      } catch (err) {
        console.error('Failed to upload image:', err);
        alert('אירעה שגיאה בעיבוד והעלאת התמונה. אנא נסה תמונה אחרת.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const ingredientsList = ingredientsText
      .split('\n')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const randomGradients = [
      'from-orange-400 to-amber-500',
      'from-pink-400 to-rose-500',
      'from-emerald-400 to-teal-500',
      'from-blue-400 to-indigo-500',
      'from-violet-400 to-purple-500'
    ];
    const randomGradient = initialRecipe?.image_gradient || randomGradients[Math.floor(Math.random() * randomGradients.length)];

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      prep_time: prepTime,
      ingredients: ingredientsList,
      instructions: instructions.trim(),
      image_gradient: randomGradient,
      image_url: imageUrl.trim() || undefined,
      is_public: scope === 'public',
      isShared: scope !== 'private',
      groupId: scope === 'group' ? (selectedGroupId || activeGroup?.id || undefined) : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
              {initialRecipe ? 'עריכת מתכון' : 'הוספת מתכון חדש'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              {initialRecipe ? 'עדכון פרטי המתכון והתמונות' : 'מילוי פרטי המתכון באופן ידני'}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-right">
          
          {/* 🔒 Visibility / Publishing Scope */}
          <PublishScopeSelector
            scope={scope}
            onChangeScope={setScope}
            selectedGroupId={selectedGroupId}
            onChangeGroupId={setSelectedGroupId}
            groups={groups}
            activeGroup={activeGroup}
            currentUser={currentUser}
            allowPublic={true}
          />

          {/* 📢 Dynamic Approval Notice */}
          {(() => {
            const isSuperAdmin = currentUser?.isSuperAdmin;
            const canPublishPublicDirectly = Boolean(isSuperAdmin || currentUser?.canPublishPublicWithoutApproval);
            
            const targetGroup = groups.find(g => g.id === (selectedGroupId || activeGroup?.id));
            const isGroupAdmin = Boolean(targetGroup && (targetGroup.createdBy === currentUser?.id || isSuperAdmin));
            const member = targetGroup?.members?.find(m => m.userId === currentUser?.id || (currentUser?.email && m.email?.toLowerCase() === currentUser.email.toLowerCase()));
            const canPublishGroupDirectly = Boolean(isGroupAdmin || member?.permissions?.canPublishWithoutApproval);

            if (scope === 'public' && !canPublishPublicDirectly) {
              return (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <span className="text-sm">⏳</span>
                  <span><strong>שימו לב:</strong> מתכון בפרסום כללי יישלח לאישור מנהל בכיר לפני שיוצג לכלל המשתמשים.</span>
                </div>
              );
            }

            if (scope === 'group' && !canPublishGroupDirectly) {
              return (
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-800 dark:text-sky-300 flex items-center gap-2">
                  <span className="text-sm">⏳</span>
                  <span><strong>שימו לב:</strong> מתכון קבוצתי יישלח לאישור מנהל הקבוצה לפני שיוצג לשאר החברים.</span>
                </div>
              );
            }

            return null;
          })()}

          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              שם המתכון *
            </label>
            <input
              type="text"
              required
              placeholder="לדוגמה: עוף טוסקני ברוטב שמנת"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              תיאור קצר
            </label>
            <textarea
              rows={2}
              placeholder="תיאור קצר ומעורר תאבון של המנה..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
            />
          </div>

          {/* Image Input Section (Camera / Gallery Upload & URL) */}
          <div className="space-y-2 bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-zinc-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-orange-500" />
                <span>תמונת המתכון (כיווץ אוטומטי)</span>
              </span>

              {/* Mode Toggle Pills */}
              <div className="flex bg-slate-200/70 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setImageInputMode('camera')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    imageInputMode === 'camera'
                      ? 'bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  מצלמה / קובץ
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    imageInputMode === 'upload'
                      ? 'bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  קישור URL
                </button>
              </div>
            </div>

            {/* Camera / File Capture Input */}
            {imageInputMode === 'camera' ? (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-orange-400 dark:hover:border-orange-500 rounded-xl cursor-pointer bg-white dark:bg-zinc-800/60 transition-colors">
                  {isCompressing ? (
                    <div className="flex flex-col items-center gap-1 text-orange-500">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[11px] font-bold">מכווץ תמונה...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-zinc-400">
                      <Camera className="w-6 h-6 text-orange-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                        צלם במצלמה או בחר מהגלריה
                      </span>
                      <span className="text-[10px] text-slate-400">
                        התמונה תכווץ אוטומטית לטעינה מהירה
                      </span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    disabled={isCompressing}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              /* URL Input Option */
              <div className="space-y-1">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
                />
              </div>
            )}

            {/* Image Preview & Clear */}
            {imageUrl && (
              <div className="relative rounded-xl overflow-hidden h-28 border border-slate-200 dark:border-zinc-700 group">
                <img
                  src={imageUrl}
                  alt="תצוגה מקדימה"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 transition-colors shadow-md cursor-pointer"
                  title="הסרת תמונה"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Category & Prep Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                קטגוריה *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 text-right cursor-pointer"
              >
                <option value="מנות עיקריות">מנות עיקריות</option>
                <option value="תוספות">תוספות</option>
                <option value="סלטים וממרחים">סלטים וממרחים</option>
                <option value="מרקים ותבשילים">מרקים ותבשילים</option>
                <option value="מאפים ולחמים">מאפים ולחמים</option>
                <option value="קינוחים ומתוקים">קינוחים ומתוקים</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                זמן הכנה
              </label>
              <input
                type="text"
                placeholder="למשל: 25 דק׳"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Ingredients Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              מצרכים (מצרך בכל שורה) *
            </label>
            <textarea
              required
              rows={4}
              placeholder={'2 חזות עוף פרוסים\n1 כף שמן זית\n1 כוס שמנת לבישול...'}
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Instructions Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              הוראות הכנה *
            </label>
            <textarea
              required
              rows={4}
              placeholder={'1. מחממים מחבת...\n2. צורבים את העוף...\n3. מוסיפים את הרוטב...'}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isCompressing}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all cursor-pointer text-xs"
            >
              {initialRecipe ? 'שמירת שינויים במתכון' : 'הוספת המתכון'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
