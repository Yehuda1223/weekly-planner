import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Edit2, 
  Trash2, 
  Sparkles, 
  Tag, 
  AlertCircle, 
  BookOpen, 
  Lock,
  Flame,
  Check,
  StickyNote,
  Copy
} from 'lucide-react';
import { TaskItem, TaskCategory, TaskPriority, UserProfile, FamilyGroup } from '@/src/types';
import { TASK_CATEGORIES } from '@/src/constants/defaults';
import { getDueDateStatus } from '@/src/utils/taskUtils';
import { TaskFormModal } from './TaskFormModal';
import { TaskDetailModal } from './TaskDetailModal';
import { ItemScopeBadge } from '@/src/components/common/ItemScopeBadge';

interface TasksTabProps {
  tasks: TaskItem[];
  currentUser?: UserProfile | null;
  activeGroup?: FamilyGroup | null;
  groups?: FamilyGroup[];
  onAddTask: (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updatedData: Partial<TaskItem>) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onAssignToPlanner?: (taskId: string, day: string, meal: string) => void;
  isGuest?: boolean;
}

const NOTE_COLOR_STYLES: Record<string, { card: string; badge: string }> = {
  yellow: {
    card: 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/40 text-amber-950 dark:text-amber-100',
    badge: 'bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
  },
  blue: {
    card: 'bg-sky-50/90 dark:bg-sky-950/30 border-sky-200/80 dark:border-sky-900/40 text-sky-950 dark:text-sky-100',
    badge: 'bg-sky-200/60 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200'
  },
  green: {
    card: 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-100',
    badge: 'bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
  },
  pink: {
    card: 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/40 text-rose-950 dark:text-rose-100',
    badge: 'bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
  },
  purple: {
    card: 'bg-purple-50/90 dark:bg-purple-950/30 border-purple-200/80 dark:border-purple-900/40 text-purple-950 dark:text-purple-100',
    badge: 'bg-purple-200/60 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200'
  },
  amber: {
    card: 'bg-orange-50/90 dark:bg-orange-950/30 border-orange-200/80 dark:border-orange-900/40 text-orange-950 dark:text-orange-100',
    badge: 'bg-orange-200/60 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200'
  }
};

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  currentUser,
  activeGroup,
  groups = [],
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onAssignToPlanner,
  isGuest = false
}) => {
  // Main view segment: strictly 'notes' (פתקים) vs 'tasks' (מטלות)
  const [activeSection, setActiveSection] = useState<'notes' | 'tasks'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('הכל');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'urgent'>('all');
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [viewingTask, setViewingTask] = useState<TaskItem | null>(null);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Split tasks vs notes strictly
  const taskItemsList = useMemo(() => tasks.filter(t => t.itemType !== 'note'), [tasks]);
  const noteItemsList = useMemo(() => tasks.filter(t => t.itemType === 'note'), [tasks]);

  // Filtered items based on current active section
  const currentSectionItems = activeSection === 'notes' ? noteItemsList : taskItemsList;

  const filteredItems = useMemo(() => {
    return currentSectionItems.filter(task => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesDesc) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'הכל' && task.category !== selectedCategory) {
        return false;
      }

      // 3. Status Filter (only for tasks)
      if (activeSection === 'tasks') {
        if (statusFilter === 'pending' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;
        if (statusFilter === 'urgent' && (task.priority !== 'high' || task.completed)) return false;
      }

      return true;
    });
  }, [currentSectionItems, activeSection, searchQuery, selectedCategory, statusFilter]);

  // Completed metrics for tasks
  const completedCount = taskItemsList.filter(t => t.completed).length;
  const pendingCount = taskItemsList.length - completedCount;
  const progressPercent = taskItemsList.length > 0 ? Math.round((completedCount / taskItemsList.length) * 100) : 0;

  const handleOpenAddModal = () => {
    if (isGuest) return;
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleCopyNote = (note: TaskItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${note.title}\n\n${note.description || ''}`.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 1800);
  };

  return (
    <div className="space-y-4 pb-16 animate-fadeIn text-right">
      
      {/* 🌟 Header & Action Buttons */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-rose-950/20 p-4 rounded-3xl border border-amber-200/60 dark:border-amber-900/30 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              {activeSection === 'notes' ? (
                <StickyNote className="w-5 h-5 text-amber-500" />
              ) : (
                <CheckSquare className="w-5 h-5 text-orange-500" />
              )}
              <span>פתקים ומטלות 📝</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {activeSection === 'notes'
                ? 'פתקים ומזכרים מהירים וחופשיים ללא תאריכים'
                : 'משימות עם תאריכי יעד, ספירה לאחור ושיבוץ למתכנן'}
            </p>
          </div>

          {/* Dedicated Action CTA for active section */}
          <div>
            {activeSection === 'notes' ? (
              <button
                type="button"
                onClick={handleOpenAddModal}
                disabled={isGuest}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  isGuest
                    ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-300 dark:border-zinc-700 opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer'
                }`}
              >
                {isGuest ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>+ פתק חדש 📝</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddModal}
                disabled={isGuest}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  isGuest
                    ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-300 dark:border-zinc-700 opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer'
                }`}
              >
                {isGuest ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>+ מטלה חדשה 📋</span>
              </button>
            )}
          </div>
        </div>

        {/* 🔀 Section Tabs: Strictly Notes (פתקים) vs Tasks (מטלות) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl border border-slate-200/70 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveSection('notes')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSection === 'notes'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <StickyNote className="w-4 h-4" />
            <span>פתקים ({noteItemsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('tasks')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSection === 'tasks'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>מטלות ({taskItemsList.length})</span>
          </button>
        </div>

        {/* 📊 Task Progress Bar (Only in Tasks view) */}
        {activeSection === 'tasks' && taskItemsList.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-[11px] font-extrabold text-slate-600 dark:text-zinc-300">
              <span>התקדמות ביצוע מטלות:</span>
              <span>{completedCount} מתוך {taskItemsList.length} הושלמו ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-200/80 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 🔍 Search & Filters Bar */}
      <div className="space-y-2.5">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSection === 'notes' ? "חיפוש פתקים לפי כותרת או תוכן..." : "חיפוש מטלות לפי כותרת או תיאור..."}
            className="w-full pr-10 pl-4 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 shadow-2xs"
          />
        </div>

        {/* Status Filters (Only for Tasks) */}
        {activeSection === 'tasks' && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: `כל המטלות (${taskItemsList.length})` },
              { id: 'pending', label: `לביצוע (${pendingCount})` },
              { id: 'urgent', label: `דחוף 🔥 (${taskItemsList.filter(t => t.priority === 'high' && !t.completed).length})` },
              { id: 'completed', label: `הושלם ✓ (${completedCount})` }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['הכל', ...TASK_CATEGORIES].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-800 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-white dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-800 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* 📋 Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-zinc-900/60 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-3">
          <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
            activeSection === 'notes' 
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-500' 
              : 'bg-orange-100 dark:bg-orange-950/60 text-orange-500'
          }`}>
            {activeSection === 'notes' ? <StickyNote className="w-6 h-6" /> : <CheckSquare className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">
              {activeSection === 'notes' ? 'אין פתקים להצגה' : 'אין מטלות להצגה'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
              {activeSection === 'notes' 
                ? 'לחצו על "+ פתק חדש 📝" כדי לכתוב פתק ראשון' 
                : 'לחצו על "+ מטלה חדשה 📋" כדי להגדיר משימה עם תאריך יעד'}
            </p>
          </div>
          {!isGuest && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${
                  activeSection === 'notes' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {activeSection === 'notes' ? '+ פתק חדש 📝' : '+ מטלה חדשה 📋'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map(item => {
            // 📝 NOTE STICKY CARD RENDERING (Pure Notes)
            if (activeSection === 'notes') {
              const colorStyle = NOTE_COLOR_STYLES[item.noteColor || 'yellow'] || NOTE_COLOR_STYLES.yellow;

              return (
                <div
                  key={item.id}
                  onClick={() => setViewingTask(item)}
                  className={`p-4 rounded-3xl border transition-all space-y-3 cursor-pointer hover:shadow-md relative group flex flex-col justify-between ${colorStyle.card}`}
                >
                  {/* Note Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${colorStyle.badge}`}>
                        {item.category}
                      </span>
                      {/* 🏷️ Scope & Group Badge */}
                      <ItemScopeBadge item={item} currentUser={currentUser} activeGroup={activeGroup} />
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Copy Note Button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyNote(item, e)}
                        className="p-1 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title="העתק תוכן פתק"
                      >
                        {copiedNoteId === item.id ? (
                          <span className="text-[10px] font-bold text-emerald-600">הועתק!</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {!isGuest && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(item);
                              setIsFormOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            title="ערוך פתק"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`האם למחוק את הפתק "${item.title}"?`)) {
                                onDeleteTask(item.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="מחק פתק"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Note Title & Content */}
                  <div className="space-y-1.5 flex-1">
                    {item.title && item.title !== 'פתק ללא כותרת' && (
                      <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100">
                        {item.title}
                      </h4>
                    )}
                    {item.description && (
                      <p className="text-xs text-slate-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed line-clamp-6">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Note Footer */}
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500">
                    <span>📝 פתק</span>
                    <span>{new Date(item.createdAt).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
              );
            }

            // 📋 TASK CARD RENDERING (Pure Tasks)
            const dueStatus = getDueDateStatus(item.dueDate, item.dueTime);
            const isCompleted = item.completed;

            return (
              <div
                key={item.id}
                onClick={() => setViewingTask(item)}
                className={`p-4 rounded-3xl border transition-all space-y-3 cursor-pointer hover:shadow-md relative group ${
                  isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 opacity-80'
                    : dueStatus.isExpired
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                    : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 shadow-2xs'
                }`}
              >
                {/* Header: Status, Category, Priority, and Quick Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Completion Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isGuest) return;
                        onToggleComplete(item.id);
                      }}
                      className={`transition-transform active:scale-90 ${
                        isGuest ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-zinc-600 hover:text-orange-500" />
                      )}
                    </button>

                    {/* Category Tag */}
                    <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>

                    {/* Priority Badge */}
                    {item.priority === 'high' && (
                      <span className="text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 fill-rose-500" /> דחוף
                      </span>
                    )}

                    {/* 🏷️ Scope & Group Badge */}
                    <ItemScopeBadge item={item} currentUser={currentUser} activeGroup={activeGroup} />
                  </div>

                  {/* Edit / Delete Buttons */}
                  {!isGuest && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask(item);
                          setIsFormOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="ערוך מטלה"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`האם למחוק את המטלה "${item.title}"?`)) {
                            onDeleteTask(item.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="מחק מטלה"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h4 className={`text-sm font-extrabold text-slate-800 dark:text-zinc-100 ${
                    isCompleted ? 'line-through text-slate-400 dark:text-zinc-500' : ''
                  }`}>
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Footer: Live Countdown & Planner info */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                  
                  {/* Countdown Badge */}
                  {dueStatus.badgeText ? (
                    <div className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-xl border ${dueStatus.badgeColor}`}>
                      <Clock className="w-3 h-3" />
                      <span>{dueStatus.badgeText}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400">ללא יעד מוגדר</span>
                  )}

                  {/* Planner Scheduled Tag */}
                  {item.assignedDay && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-900/40 px-2 py-0.5 rounded-lg">
                      <BookOpen className="w-3 h-3" />
                      <span>שובץ ל-{item.assignedDay}</span>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task / Note Add & Edit Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={(taskData) => {
          if (editingTask) {
            onUpdateTask(editingTask.id, taskData);
          } else {
            onAddTask(taskData);
          }
        }}
        editingTask={editingTask}
        formType={editingTask ? (editingTask.itemType || 'task') : activeSection === 'notes' ? 'note' : 'task'}
        groups={groups}
        activeGroup={activeGroup}
        currentUser={currentUser}
      />

      {/* Task / Note Detail Modal */}
      <TaskDetailModal
        isOpen={!!viewingTask}
        task={viewingTask}
        onClose={() => setViewingTask(null)}
        onToggleComplete={onToggleComplete}
        onEdit={(task) => {
          setViewingTask(null);
          setEditingTask(task);
          setIsFormOpen(true);
        }}
        onDelete={(id) => {
          onDeleteTask(id);
          setViewingTask(null);
        }}
        onAssignToPlanner={onAssignToPlanner}
        isGuest={isGuest}
      />

    </div>
  );
};
