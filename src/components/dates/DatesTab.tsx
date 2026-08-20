import React, { useState } from 'react';
import { 
  Heart, 
  Plus, 
  MapPin, 
  Star, 
  Edit2, 
  Trash2, 
  CalendarCheck, 
  Sparkles, 
  UtensilsCrossed, 
  Trees, 
  Film, 
  Coffee, 
  Home,
  Navigation,
  Lock
} from 'lucide-react';
import { DateSpot, DateCategory, UserProfile, FamilyGroup } from '@/src/types';
import { DATE_CATEGORIES } from '@/src/constants/defaults';
import { DateSpotFormModal } from './DateSpotFormModal';
import { ItemScopeBadge } from '@/src/components/common/ItemScopeBadge';

interface DatesTabProps {
  dateSpots: DateSpot[];
  currentUser?: UserProfile | null;
  activeGroup?: FamilyGroup | null;
  groups?: FamilyGroup[];
  onAddDateSpot: (spotData: Omit<DateSpot, 'id'>) => void;
  onUpdateDateSpot: (id: string, updatedData: Omit<DateSpot, 'id'>) => void;
  onDeleteDateSpot: (id: string) => void;
  onIncrementVisitCount: (id: string) => void;
  isGuest?: boolean;
}

export const DatesTab: React.FC<DatesTabProps> = ({
  dateSpots,
  currentUser,
  activeGroup,
  groups = [],
  onAddDateSpot,
  onUpdateDateSpot,
  onDeleteDateSpot,
  onIncrementVisitCount,
  isGuest = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('הכל');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<DateSpot | null>(null);

  // Compute total visits
  const totalVisitsCount = dateSpots.reduce((sum, spot) => sum + spot.visitCount, 0);

  // Filter spots by category
  const filteredSpots = dateSpots.filter(spot => 
    selectedCategory === 'הכל' || spot.category === selectedCategory
  );

  const handleOpenAdd = () => {
    setEditingSpot(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (spot: DateSpot) => {
    setEditingSpot(spot);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (spotData: Omit<DateSpot, 'id'>) => {
    if (editingSpot) {
      onUpdateDateSpot(editingSpot.id, spotData);
    } else {
      onAddDateSpot(spotData);
    }
    setIsFormModalOpen(false);
    setEditingSpot(null);
  };

  const getCategoryIcon = (cat: DateCategory) => {
    switch (cat) {
      case 'מסעדות וברים': return <UtensilsCrossed className="w-3.5 h-3.5" />;
      case 'טבע, ים ופיקניק': return <Trees className="w-3.5 h-3.5" />;
      case 'קולנוע ותרבות': return <Film className="w-3.5 h-3.5" />;
      case 'בתי קפה וקינוחים': return <Coffee className="w-3.5 h-3.5" />;
      case 'דייט ביתי': return <Home className="w-3.5 h-3.5" />;
      default: return <Heart className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* 🥂 Header & Total Visits Card */}
      <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-orange-500/10 dark:from-rose-950/30 dark:via-amber-950/20 dark:to-zinc-900 border border-rose-200/60 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3">
        
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
              <h2 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                ספריית דייטים ובילויים
              </h2>
            </div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 block">
              מקומות מומלצים, רעיונות ומעקב ביקורים בעבר 🥂
            </span>
          </div>

          <button
            onClick={handleOpenAdd}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all ${
              isGuest
                ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-300 dark:border-zinc-700 opacity-60 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-md shadow-rose-500/20 active:scale-95 cursor-pointer'
            }`}
            title={isGuest ? 'מצב אורח - צפייה בלבד' : 'הוספת דייט חדש'}
          >
            {isGuest ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>דייט חדש</span>
          </button>
        </div>

        {/* Total Visits Summary Bar */}
        <div className="pt-2 border-t border-rose-200/40 dark:border-zinc-800/60 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            סך הכל: {dateSpots.length} מקומות שמרנו
          </span>
          <span className="text-rose-600 dark:text-rose-400 font-extrabold bg-white/80 dark:bg-zinc-800 px-2.5 py-0.5 rounded-lg border border-rose-200/60 dark:border-zinc-700">
            {totalVisitsCount} ביקורים בעבר 🥂
          </span>
        </div>

      </div>

      {/* 🏷️ Sticky Filter Pills: Categories */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md -mx-4 px-4 py-2 flex gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-slate-100 dark:border-zinc-800/80 shadow-2xs">
        <button
          onClick={() => setSelectedCategory('הכל')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer border ${
            selectedCategory === 'הכל'
              ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 hover:bg-slate-50'
          }`}
        >
          הכל ({dateSpots.length})
        </button>

        {DATE_CATEGORIES.map(cat => {
          const count = dateSpots.filter(s => s.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 hover:bg-slate-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* 🥂 Date Spot Cards Grid */}
      <div className="space-y-3">
        {filteredSpots.length === 0 ? (
          <div className="text-center py-12 space-y-2 bg-slate-50 dark:bg-zinc-800/20 border border-slate-100 dark:border-zinc-800/40 rounded-3xl">
            <Heart className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto" />
            <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">
              לא נמצאו מקומות בקטגוריה זו
            </p>
            <button
              onClick={handleOpenAdd}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              לחצו כאן ליצירת רעיון לדייט חדש +
            </button>
          </div>
        ) : (
          filteredSpots.map(spot => (
            <div
              key={spot.id}
              className="bg-slate-50 dark:bg-zinc-800/30 border border-slate-200/80 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-900/50 rounded-3xl overflow-hidden shadow-xs transition-all text-right group"
            >
              {/* Optional Photo or Gradient Banner */}
              {spot.imageUrl ? (
                <div className="h-36 w-full relative overflow-hidden">
                  <img src={spot.imageUrl} alt={spot.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-2 right-3 text-white text-xs font-extrabold flex items-center gap-1">
                    {getCategoryIcon(spot.category)}
                    {spot.category}
                  </span>
                </div>
              ) : null}

              {/* Body Content */}
              <div className="p-4 space-y-2.5">
                
                {/* Header Title & Edit/Delete */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {!spot.imageUrl && (
                        <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-950/40 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          {getCategoryIcon(spot.category)}
                          {spot.category}
                        </span>
                      )}
                      <ItemScopeBadge item={spot} currentUser={currentUser} activeGroup={activeGroup} />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100">
                      {spot.title}
                    </h3>
                    {spot.address && (
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {spot.address}
                      </span>
                    )}
                  </div>

                  {!isGuest && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(spot)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                        title="עריכה"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDateSpot(spot.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="מחיקה"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= spot.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-zinc-700'
                      }`}
                    />
                  ))}
                </div>

                {spot.notes && (
                  <p className="text-xs text-slate-600 dark:text-zinc-300 bg-white/80 dark:bg-zinc-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                    💡 {spot.notes}
                  </p>
                )}

                {/* Footer: Visit Counter, Waze Button & Quick +1 Button */}
                <div className="pt-2 border-t border-slate-200/50 dark:border-zinc-800/60 flex justify-between items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1 text-[11px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded-xl border border-rose-200/60 dark:border-rose-900/30">
                    <span>ביקרנו {spot.visitCount} פעמים 🥂</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Waze Navigation Button */}
                    <a
                      href={spot.wazeUrl || `https://waze.com/ul?q=${encodeURIComponent(spot.address || spot.title)}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                      title="פתיחת ניווט ב-Waze"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Waze 🚗</span>
                    </a>

                    {/* Increment Visit Count */}
                    {!isGuest && (
                      <button
                        onClick={() => onIncrementVisitCount(spot.id)}
                        className="px-2 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="הוספת ביקור נוסף"
                      >
                        <Plus className="w-3 h-3" /> +1
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      <DateSpotFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingSpot={editingSpot}
        groups={groups}
        activeGroup={activeGroup}
        currentUser={currentUser}
      />

    </div>
  );
};
