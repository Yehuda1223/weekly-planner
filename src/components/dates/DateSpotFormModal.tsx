import React, { useState, useEffect, ChangeEvent } from 'react';
import { X, Heart, MapPin, Star, Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { DateSpot, DateCategory, FamilyGroup, UserProfile } from '@/src/types';
import { DATE_CATEGORIES } from '@/src/constants/defaults';
import { uploadRecipeImageToSupabase } from '@/src/utils/imageUtils';
import { PublishScopeSelector, PublishScope } from '@/src/components/common/PublishScopeSelector';

interface DateSpotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (spotData: Omit<DateSpot, 'id'>) => void;
  editingSpot?: DateSpot | null;
  groups?: FamilyGroup[];
  activeGroup?: FamilyGroup | null;
  currentUser?: UserProfile | null;
}

export const DateSpotFormModal: React.FC<DateSpotFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingSpot,
  groups = [],
  activeGroup,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DateCategory>('מסעדות וברים');
  const [address, setAddress] = useState('');
  const [wazeUrl, setWazeUrl] = useState('');
  const [rating, setRating] = useState(5);
  const [visitCount, setVisitCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // 🔒 Scope & Group state
  const [scope, setScope] = useState<PublishScope>('group');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  useEffect(() => {
    if (editingSpot) {
      setTitle(editingSpot.title);
      setCategory(editingSpot.category);
      setAddress(editingSpot.address || '');
      setWazeUrl(editingSpot.wazeUrl || '');
      setRating(editingSpot.rating);
      setVisitCount(editingSpot.visitCount);
      setNotes(editingSpot.notes || '');
      setImageUrl(editingSpot.imageUrl || '');
      setScope(editingSpot.isShared === false ? 'private' : 'group');
      setSelectedGroupId(editingSpot.groupId || activeGroup?.id || '');
    } else {
      setTitle('');
      setCategory('מסעדות וברים');
      setAddress('');
      setWazeUrl('');
      setRating(5);
      setVisitCount(1);
      setNotes('');
      setImageUrl('');
      setScope(activeGroup ? 'group' : 'private');
      setSelectedGroupId(activeGroup?.id || '');
    }
  }, [editingSpot, isOpen, activeGroup]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const uploadedUrl = await uploadRecipeImageToSupabase(file);
        setImageUrl(uploadedUrl);
      } catch (err) {
        console.error('Failed to upload image:', err);
        alert('אירעה שגיאה בטעינת התמונה');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('אנא הזן שם למקום / דייט');
      return;
    }

    onSubmit({
      title: title.trim(),
      category,
      address: address.trim(),
      wazeUrl: wazeUrl.trim() || undefined,
      rating,
      visitCount: Math.max(0, visitCount),
      notes: notes.trim(),
      imageUrl: imageUrl.trim() || undefined,
      isShared: scope !== 'private',
      groupId: scope === 'group' ? (selectedGroupId || activeGroup?.id || undefined) : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col max-h-[88vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-orange-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500/20" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                {editingSpot ? 'עריכת מקום לדייט' : 'הוספת מקום / רעיון לדייט'}
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                הזנת פרטים, מונה ביקורים בעבר ודירוג
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
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-right">
          
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

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              שם המקום / הרעיון לדייט *
            </label>
            <input
              type="text"
              required
              placeholder="למשל: מסעדת רומא כפרית"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-zinc-100"
            />
          </div>

          {/* Category & Rating Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                קטגוריה *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as DateCategory)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-zinc-100 cursor-pointer"
              >
                {DATE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                דירוג (כוכבים)
              </label>
              <div className="flex items-center gap-1 pt-1 justify-end">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 dark:text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Address & Visit Count Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                כתובת / מיקום
              </label>
              <input
                type="text"
                placeholder="למשל: שדרות רוטשילד, ת״א"
                value={address}
                onChange={e => {
                  const newAddr = e.target.value;
                  setAddress(newAddr);
                  if (newAddr && !wazeUrl) {
                    setWazeUrl(`https://waze.com/ul?q=${encodeURIComponent(newAddr)}&navigate=yes`);
                  }
                }}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                מונה ביקורים בעבר 🥂
              </label>
              <input
                type="number"
                min="0"
                value={visitCount}
                onChange={e => setVisitCount(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-zinc-100 text-center font-bold text-rose-600 dark:text-rose-400"
              />
            </div>
          </div>

          {/* Waze Link Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              קישור ל-Waze / ניווט ישיר 🚗
            </label>
            <input
              type="text"
              placeholder="https://waze.com/ul?q=..."
              value={wazeUrl}
              onChange={e => setWazeUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:text-zinc-100 ltr text-left font-mono"
            />
          </div>

          {/* Photo Capture / Upload */}
          <div className="space-y-1 bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-slate-200/60 dark:border-zinc-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              תמונה מהמקום (מצלמה / גלריה)
            </label>

            <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-rose-400 rounded-xl cursor-pointer bg-white dark:bg-zinc-800/60 transition-colors">
              {isCompressing ? (
                <div className="flex items-center gap-1.5 text-rose-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-bold">מעלה תמונה...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                  <Camera className="w-5 h-5 text-rose-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                    צלם במצלמה או בחר תמונה
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

            {imageUrl && (
              <div className="relative rounded-xl overflow-hidden h-24 border border-slate-200 dark:border-zinc-700 mt-2">
                <img src={imageUrl} alt="תצוגה" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              הערות מיוחדות / מנות מומלצות
            </label>
            <textarea
              rows={2}
              placeholder="למשל: להזמין את הפסטה כמהין והקוקטייל שפריץ!"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:text-zinc-100"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isCompressing}
              className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg shadow-rose-500/25 active:scale-[0.99] transition-all cursor-pointer text-xs"
            >
              {editingSpot ? 'שמירת שינויים' : 'הוספת מקום לדייט'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
