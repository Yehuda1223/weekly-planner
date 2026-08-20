import React, { useState } from 'react';
import { Plus, CheckCircle, ShoppingBag, Check, Trash2, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { CustomShoppingItem, SavedShoppingList } from '@/src/types';

interface ShoppingListTabProps {
  shoppingListCount: number;
  customShoppingItems: CustomShoppingItem[];
  categorizedShoppingList: {
    [key: string]: {
      name: string;
      sources: { recipeTitle: string; count: number }[];
      isCustom?: boolean;
      customId?: string;
    }[];
  };
  checkedIngredients: { [key: string]: boolean };
  savedLists: SavedShoppingList[];
  onAddCustomItem: (name: string, category: string) => void;
  onDeleteCustomItem: (id: string) => void;
  onToggleIngredientCheck: (name: string) => void;
  onShareShoppingList: (type: 'whatsapp' | 'copy') => void;
  onOpenSaveModal: () => void;
  onDeleteSavedList: (id: string) => void;
  onResetChecks?: () => void;
  isGuest?: boolean;
}

export const ShoppingListTab: React.FC<ShoppingListTabProps> = ({
  shoppingListCount,
  customShoppingItems,
  categorizedShoppingList,
  checkedIngredients,
  savedLists,
  onAddCustomItem,
  onDeleteCustomItem,
  onToggleIngredientCheck,
  onShareShoppingList,
  onOpenSaveModal,
  onDeleteSavedList,
  isGuest = false
}) => {
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState('אחר');
  const [expandedListId, setExpandedListId] = useState<string | null>(null);

  const handleCustomFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;
    if (!customItemName.trim()) return;
    onAddCustomItem(customItemName, customItemCategory);
    setCustomItemName('');
  };

  const hasItems = shoppingListCount > 0 || customShoppingItems.length > 0;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-md font-bold text-slate-800 dark:text-zinc-200">רשימת קניות שבועית</h2>
      </div>

      {/* Add Custom Item Form */}
      <form
        onSubmit={handleCustomFormSubmit}
        className="bg-slate-50 dark:bg-zinc-800/30 border border-slate-100/80 dark:border-zinc-800/40 rounded-2xl p-3 flex gap-2 items-center"
      >
        <input
          type="text"
          disabled={isGuest}
          placeholder={isGuest ? 'מצב אורח (צפייה בלבד) – יש להתחבר כדי להוסיף' : 'הוסיפו מוצר ידנית (למשל: ספוג כלים)...'}
          value={customItemName}
          onChange={(e) => setCustomItemName(e.target.value)}
          className={`flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 text-right ${
            isGuest ? 'border-slate-200 dark:border-zinc-800 opacity-60 cursor-not-allowed' : 'border-slate-200 dark:border-zinc-700'
          }`}
        />

        <select
          disabled={isGuest}
          value={customItemCategory}
          onChange={(e) => setCustomItemCategory(e.target.value)}
          className={`px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 text-right max-w-[100px] ${
            isGuest ? 'border-slate-200 dark:border-zinc-800 opacity-60 cursor-not-allowed' : 'border-slate-200 dark:border-zinc-700 cursor-pointer'
          }`}
        >
          <option value="אחר">אחר</option>
          <option value="ירקות ופירות">ירקות ופירות</option>
          <option value="בשר, עוף ודגים">עוף ובשר</option>
          <option value="מוצרי חלב ומקרר">חלב ומקרר</option>
          <option value="מזווה ותבלינים">מזווה</option>
        </select>

        <button
          type="submit"
          disabled={isGuest}
          className={`p-2 rounded-xl transition-all flex items-center justify-center flex-shrink-0 ${
            isGuest
              ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 opacity-60 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95 cursor-pointer shadow-xs'
          }`}
          title={isGuest ? 'מצב אורח - צפייה בלבד' : 'הוסיפו מוצר'}
        >
          {isGuest ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
        </button>
      </form>

      {/* Action Buttons: Share & Save */}
      {hasItems && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onShareShoppingList('whatsapp')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              שתף לוואטסאפ
            </button>
            <button
              type="button"
              onClick={() => onShareShoppingList('copy')}
              className="bg-slate-800 hover:bg-slate-900 dark:bg-zinc-200 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              העתק רשימה
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenSaveModal}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isGuest
                ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-300 dark:border-zinc-700 opacity-60 cursor-not-allowed shadow-none'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md cursor-pointer active:scale-[0.99]'
            }`}
            title={isGuest ? 'מצב אורח - צפייה בלבד' : 'סגרו רשימה ושמרו להיסטוריה'}
          >
            {isGuest ? <Lock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            <span>סגרו רשימה ושמרו להיסטוריה</span>
          </button>
        </div>
      )}

      {/* Shopping List Items by Category */}
      {!hasItems ? (
        <div className="text-center py-16 space-y-2">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto" />
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">רשימת הקניות ריקה</p>
          <p className="text-xs text-slate-400 dark:text-zinc-550">
            תכננו ארוחות במתכנן השבועי או הוסיפו מוצר ידנית כדי להתחיל את הרשימה.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(categorizedShoppingList).map(([category, items]) => {
            if (items.length === 0) return null;
            const icon =
              category === 'ירקות ופירות' ? '🥦' :
              category === 'בשר, עוף ודגים' ? '🥩' :
              category === 'מוצרי חלב ומקרר' ? '🧀' :
              category === 'מזווה ותבלינים' ? '🥫' : '🛒';

            return (
              <div
                key={category}
                className="bg-slate-50 dark:bg-zinc-800/20 border border-slate-100 dark:border-zinc-800/40 rounded-2xl p-3.5 space-y-2 text-right"
              >
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 border-b border-slate-200/50 dark:border-zinc-800/50 pb-1.5">
                  <span>{icon}</span>
                  <span>{category}</span>
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800/30">
                  {items.map(({ name, sources, isCustom, customId }) => {
                    const isChecked = !!checkedIngredients[name];
                    return (
                      <div
                        key={name}
                        onClick={() => {
                          if (isGuest) return;
                          onToggleIngredientCheck(name);
                        }}
                        className={`py-2.5 flex items-start gap-2.5 transition-all ${
                          isGuest ? 'cursor-not-allowed opacity-75' : 'cursor-pointer group'
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                            isChecked
                              ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                              : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 group-hover:border-orange-400'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3px]" />}
                        </div>

                        <div className="flex-1 min-w-0 text-right">
                          <p
                            className={`text-xs font-semibold leading-tight transition-all ${
                              isChecked
                                ? 'line-through text-slate-400 dark:text-zinc-600'
                                : 'text-slate-700 dark:text-zinc-200'
                            }`}
                          >
                            {name}
                          </p>

                          {/* Sources Badges */}
                          <div className="flex flex-wrap gap-1 mt-0.5 justify-start">
                            {sources.map(src => (
                              <span
                                key={src.recipeTitle}
                                className="text-[8px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-1 py-0.5 rounded"
                              >
                                {src.recipeTitle} {src.count > 1 ? `x${src.count}` : ''}
                              </span>
                            ))}
                          </div>
                        </div>

                        {isCustom && !isGuest && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCustomItem(customId!);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 active:scale-95 transition-all cursor-pointer"
                            title="מחיקת מוצר"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historical Saved Lists Section */}
      {savedLists.length > 0 && (
        <div className="border-t border-slate-200 dark:border-zinc-800 pt-6 mt-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 justify-start">
            <span>📜</span>
            <span>היסטוריית רשימות קניות</span>
          </h3>

          <div className="space-y-2">
            {savedLists.map((list) => {
              const isExpanded = expandedListId === list.id;
              const completedCount = list.items.filter(item => item.checked).length;

              return (
                <div
                  key={list.id}
                  className="bg-slate-50 dark:bg-zinc-800/10 border border-slate-150 dark:border-zinc-800 rounded-xl overflow-hidden transition-all text-right"
                >
                  <div
                    onClick={() => setExpandedListId(isExpanded ? null : list.id)}
                    className="p-3 flex justify-between items-center cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSavedList(list.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="מחיקה מההיסטוריה"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">
                        {completedCount}/{list.items.length} נקנו
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <div className="text-right">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-200">{list.title}</h4>
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500">
                        {list.savedAt}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800/30">
                      {list.items.map((item, idx) => (
                        <div key={idx} className="py-2 flex justify-between items-center">
                          <span className="text-[8px] font-bold bg-slate-100 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              item.checked ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-700 dark:text-zinc-200'
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
