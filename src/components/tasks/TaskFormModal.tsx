import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, Tag, CheckSquare, Plus, Sparkles, BookOpen, StickyNote, Palette } from 'lucide-react';
import { TaskItem, TaskCategory, TaskPriority, FamilyGroup, UserProfile } from '@/src/types';
import { TASK_CATEGORIES, DAYS_OF_WEEK } from '@/src/constants/defaults';
import { PublishScopeSelector, PublishScope } from '@/src/components/common/PublishScopeSelector';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  editingTask?: TaskItem | null;
  formType: 'task' | 'note'; // Strictly 'note' or 'task'
  groups?: FamilyGroup[];
  activeGroup?: FamilyGroup | null;
  currentUser?: UserProfile | null;
}

const NOTE_COLORS: { id: TaskItem['noteColor']; label: string; bgClass: string; borderClass: string }[] = [
  { id: 'yellow', label: 'צהוב', bgClass: 'bg-amber-100 dark:bg-amber-950/60', borderClass: 'border-amber-300 dark:border-amber-800' },
  { id: 'blue', label: 'כחול', bgClass: 'bg-sky-100 dark:bg-sky-950/60', borderClass: 'border-sky-300 dark:border-sky-800' },
  { id: 'green', label: 'ירוק', bgClass: 'bg-emerald-100 dark:bg-emerald-950/60', borderClass: 'border-emerald-300 dark:border-emerald-800' },
  { id: 'pink', label: 'ורוד', bgClass: 'bg-rose-100 dark:bg-rose-950/60', borderClass: 'border-rose-300 dark:border-rose-800' },
  { id: 'purple', label: 'סגול', bgClass: 'bg-purple-100 dark:bg-purple-950/60', borderClass: 'border-purple-300 dark:border-purple-800' },
  { id: 'amber', label: 'כתום', bgClass: 'bg-orange-100 dark:bg-orange-950/60', borderClass: 'border-orange-300 dark:border-orange-800' }
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
  formType,
  groups = [],
  activeGroup,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('כללי');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [assignedDay, setAssignedDay] = useState('');
  const [assignedMeal, setAssignedMeal] = useState('מטלה יומית');
  const [addToPlanner, setAddToPlanner] = useState(false);
  const [noteColor, setNoteColor] = useState<TaskItem['noteColor']>('yellow');

  // 🔒 Scope & Group state
  const [scope, setScope] = useState<PublishScope>('group');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const isNote = formType === 'note';

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategory(editingTask.category || 'כללי');
      setPriority(editingTask.priority || 'medium');
      setDueDate(editingTask.dueDate || '');
      setDueTime(editingTask.dueTime || '');
      setAssignedDay(editingTask.assignedDay || '');
      setAssignedMeal(editingTask.assignedMeal || 'מטלה יומית');
      setAddToPlanner(!!(editingTask.assignedDay && editingTask.assignedMeal));
      setNoteColor(editingTask.noteColor || 'yellow');
      setScope(editingTask.isShared === false ? 'private' : 'group');
      setSelectedGroupId(editingTask.groupId || activeGroup?.id || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('כללי');
      setPriority('medium');
      setDueDate('');
      setDueTime('');
      setAssignedDay('');
      setAssignedMeal('מטלה יומית');
      setAddToPlanner(false);
      setNoteColor('yellow');
      setScope(activeGroup ? 'group' : 'private');
      setSelectedGroupId(activeGroup?.id || '');
    }
  }, [editingTask, isOpen, formType, activeGroup]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !description.trim()) return;

    if (isNote) {
      // Pure Sticky Note
      onSubmit({
        itemType: 'note',
        title: title.trim() || 'פתק ללא כותרת',
        description: description.trim() || undefined,
        category,
        priority: 'low',
        completed: false,
        noteColor: noteColor || 'yellow',
        isShared: scope !== 'private',
        groupId: scope === 'group' ? (selectedGroupId || activeGroup?.id || undefined) : undefined
      });
    } else {
      // Pure Task with Due Date & Planner
      onSubmit({
        itemType: 'task',
        title: title.trim() || 'מטלה ללא כותרת',
        description: description.trim() || undefined,
        category,
        priority,
        completed: editingTask ? editingTask.completed : false,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        assignedDay: addToPlanner && assignedDay ? assignedDay : undefined,
        assignedMeal: addToPlanner && assignedMeal ? assignedMeal : undefined,
        isShared: scope !== 'private',
        groupId: scope === 'group' ? (selectedGroupId || activeGroup?.id || undefined) : undefined
      });
    }

    onClose();
  };

  // Quick date setter helpers
  const setQuickDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const setEndOfMonthDate = (dayOfMonth = 20) => {
    const d = new Date();
    if (d.getDate() >= dayOfMonth) {
      d.setMonth(d.getMonth() + 1);
    }
    d.setDate(dayOfMonth);
    setDueDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className={`p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center ${
          isNote ? 'bg-amber-500/10' : 'bg-orange-500/10'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              isNote
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                : 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
            }`}>
              {isNote ? <StickyNote className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-zinc-100">
                {editingTask ? (isNote ? 'עריכת פתק 📝' : 'עריכת מטלה 📋') : (isNote ? 'פתק חדש 📝' : 'מטלה חדשה 📋')}
              </h2>
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                {isNote ? 'כתיבת פתק מהיר ופשוט ללא תאריכים' : 'הגדרת זמני יעד, ספירה לאחור ושיבוץ למתכנן'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-right">
          
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

          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              {isNote ? 'כותרת הפתק' : 'כותרת המטלה *'}
            </label>
            <input
              type="text"
              required={!isNote}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isNote ? 'למשל: רעיונות למתכונים, קודים חשובים, תזכורת כללית...' : 'למשל: תשלום חשבון חשמל, איסוף חבילה, קניות...'}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
            />
          </div>

          {/* Description / Notes Textarea */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              {isNote ? 'תוכן הפתק *' : 'תוכן הפתק / פירוט נוסף (אופציונלי)'}
            </label>
            <textarea
              rows={isNote ? 6 : 3}
              required={isNote}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isNote ? 'רשמו כאן את כל מה שחשוב: רשימות, טקסט חופשי, קישורים, רעיונות...' : 'רשמו כאן פרטים, רשימת ציוד, קישורים או הערות...'}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 leading-relaxed"
            />
          </div>

          {/* 🎨 Sticky Note Color Picker (Only for Notes) */}
          {isNote && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-amber-500" />
                צבע רקע לפתק:
              </label>
              <div className="flex gap-2">
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setNoteColor(c.id)}
                    className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${c.bgClass} ${
                      noteColor === c.id ? `${c.borderClass} scale-110 shadow-sm ring-2 ring-amber-400` : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {noteColor === c.id && <span className="text-xs font-black text-slate-700 dark:text-zinc-200">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              קטגוריה
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 font-bold"
            >
              {TASK_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* ⏰ Task-Only Section: Priority, Deadlines & Weekly Planner */}
          {!isNote && (
            <>
              {/* Priority Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  רמת דחיפות
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: 'רגילה 🟢', color: 'border-emerald-200 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50' },
                    { id: 'medium', label: 'בינונית 🟡', color: 'border-amber-200 text-amber-700 dark:text-amber-300 bg-amber-50/50' },
                    { id: 'high', label: 'דחופה 🔥', color: 'border-rose-200 text-rose-700 dark:text-rose-300 bg-rose-50/50' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id as TaskPriority)}
                      className={`py-2 px-2 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                        priority === p.id 
                          ? `${p.color} border-2 shadow-xs scale-[1.02]` 
                          : 'border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date & Time Section */}
              <div className="space-y-2 p-3 bg-orange-50/40 dark:bg-zinc-800/40 border border-orange-100 dark:border-zinc-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    זמן יעד לביצוע (Due Date & Countdown)
                  </label>
                  {dueDate && (
                    <button
                      type="button"
                      onClick={() => { setDueDate(''); setDueTime(''); }}
                      className="text-[10px] text-slate-400 hover:text-rose-500 font-bold cursor-pointer"
                    >
                      נקה יעד
                    </button>
                  )}
                </div>

                {/* Quick Date Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickDate(0)}
                    className="px-2 py-1 text-[11px] font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    היום
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="px-2 py-1 text-[11px] font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    מחר
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(3)}
                    className="px-2 py-1 text-[11px] font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    עוד 3 ימים
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(7)}
                    className="px-2 py-1 text-[11px] font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    עוד שבוע
                  </button>
                  <button
                    type="button"
                    onClick={() => setEndOfMonthDate(20)}
                    className="px-2 py-1 text-[11px] font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    עד ה-20 לחודש
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(30)}
                    className="px-2 py-1 text-[11px] font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    עוד 30 יום
                  </button>
                </div>

                {/* Explicit Date & Time Inputs */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                      תאריך יעד
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                      שעת יעד (אופציונלי)
                    </label>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              {/* Weekly Planner Schedule Option */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-2xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addToPlanner}
                    onChange={(e) => setAddToPlanner(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400"
                  />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                    שבץ מטלה זו בלוח התכנון השבועי
                  </span>
                </label>

                {addToPlanner && (
                  <div className="grid grid-cols-2 gap-2 pt-1 animate-fadeIn">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                        יום לשיבוץ בלוח
                      </label>
                      <select
                        value={assignedDay}
                        onChange={(e) => setAssignedDay(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                      >
                        <option value="">בחר יום...</option>
                        {DAYS_OF_WEEK.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                        סוג המשבצת
                      </label>
                      <select
                        value={assignedMeal}
                        onChange={(e) => setAssignedMeal(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                      >
                        <option value="מטלה יומית">מטלה יומית 📝</option>
                        <option value="סידורים ומשימות">סידורים ומשימות 📋</option>
                        <option value="מטלה דחופה">מטלה דחופה 🔥</option>
                        <option value="תזכורת ופתק">תזכורת ופתק 📌</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-3 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-extrabold text-white rounded-xl shadow-md active:scale-95 transition-all cursor-pointer ${
                isNote ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
              }`}
            >
              {editingTask ? 'שמור שינויים' : isNote ? 'שמור פתק 📝' : 'הוסף מטלה 📋'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
