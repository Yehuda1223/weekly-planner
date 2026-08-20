import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Square, 
  Calendar, 
  Clock, 
  Tag, 
  Edit2, 
  Trash2, 
  BookOpen, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  StickyNote,
  Copy,
  Check
} from 'lucide-react';
import { TaskItem } from '@/src/types';
import { getDueDateStatus } from '@/src/utils/taskUtils';

interface TaskDetailModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onAssignToPlanner?: (taskId: string, day: string, meal: string) => void;
  isGuest?: boolean;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
  onAssignToPlanner,
  isGuest = false
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !task) return null;

  const isNote = task.itemType === 'note';
  const dueStatus = getDueDateStatus(task.dueDate, task.dueTime);

  const handleCopyNote = () => {
    const textToCopy = `${task.title}\n\n${task.description || ''}`.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-1 rounded-xl">🔴 דחיפות גבוהה</span>;
      case 'medium':
        return <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl">🟡 דחיפות בינונית</span>;
      default:
        return <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl">🟢 רגיל</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            {isNote ? (
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <StickyNote className="w-5 h-5" />
              </div>
            ) : (
              <button
                onClick={() => onToggleComplete(task.id)}
                disabled={isGuest}
                className={`p-1.5 rounded-xl transition-all ${
                  task.completed 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 hover:bg-orange-200'
                }`}
                title={isGuest ? 'מצב אורח' : task.completed ? 'סמן כלא הושלם' : 'סמן כהושלם'}
              >
                {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Square className="w-5 h-5" />}
              </button>
            )}

            <div>
              <span className="text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                {isNote ? 'פתק מהיר 📝' : task.completed ? 'מטלה הושלמה 🎉' : 'מטלה פעילה 📋'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isNote && (
              <button
                type="button"
                onClick={handleCopyNote}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 rounded-xl hover:bg-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                title="העתק תוכן"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'הועתק!' : 'העתק'}</span>
              </button>
            )}

            {!isGuest && (
              <>
                <button
                  type="button"
                  onClick={() => { onClose(); onEdit(task); }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="עריכה"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { onDelete(task.id); onClose(); }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="מחיקה"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-right">
          
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-950/60 px-2.5 py-1 rounded-xl">
                📂 {task.category}
              </span>
              {!isNote && getPriorityBadge()}
            </div>

            {/* Countdown Badge for Tasks */}
            {!isNote && task.dueDate && dueStatus.badgeText && (
              <span className={`text-xs font-black px-2.5 py-1 rounded-xl border flex items-center gap-1 ${dueStatus.badgeColor}`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{dueStatus.badgeText}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className={`text-lg font-black text-slate-800 dark:text-zinc-100 ${task.completed ? 'line-through opacity-70' : ''}`}>
            {task.title}
          </h2>

          {/* Description / Full Note */}
          {task.description ? (
            <div className={`p-4 rounded-2xl border space-y-1 ${
              isNote 
                ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40 text-slate-800 dark:text-zinc-200'
                : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-200'
            }`}>
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 block">
                {isNote ? 'תוכן הפתק:' : 'תוכן הפתק / פירוט המטלה:'}
              </span>
              <p className="text-xs font-medium whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              אין פירוט נוסף.
            </p>
          )}

          {/* Due Date & Assignment info (Only for Tasks) */}
          {!isNote && (
            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-slate-100 dark:border-zinc-800">
              {task.dueDate && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/20 border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">תאריך יעד:</span>
                  <span className="text-slate-700 dark:text-zinc-200">
                    📅 {task.dueDate} {task.dueTime ? `(${task.dueTime})` : ''}
                  </span>
                </div>
              )}

              {task.assignedDay && (
                <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30">
                  <span className="text-[10px] text-orange-500 block mb-0.5">משובץ במתכנן השבועי:</span>
                  <span className="text-slate-700 dark:text-zinc-200">
                    🗓️ {task.assignedDay} - {task.assignedMeal || 'מטלה יומית'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Date info */}
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800/60">
            <span>נוצר: {new Date(task.createdAt).toLocaleDateString('he-IL')}</span>
            <span>{isNote ? '📝 פתק שמור' : '📋 מטלה'}</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/40">
          {!isNote ? (
            <button
              type="button"
              onClick={() => onToggleComplete(task.id)}
              disabled={isGuest}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                task.completed
                  ? 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              }`}
            >
              {task.completed ? 'בטל סימון ביצוע' : '✓ סמן כמטלה שהושלמה'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopyNote}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" /> העתק תוכן פתק
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            סגור
          </button>
        </div>

      </div>
    </div>
  );
};
