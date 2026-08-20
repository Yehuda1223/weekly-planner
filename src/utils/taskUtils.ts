/**
 * ⏰ Helper utility for computing live deadline countdowns and due date status
 */

export interface DueDateStatus {
  status: 'expired' | 'today' | 'tomorrow' | 'upcoming' | 'none';
  text: string;
  daysRemaining: number;
  badgeClass: string;
}

export function getDueDateStatus(dueDateStr?: string, dueTimeStr?: string): DueDateStatus {
  if (!dueDateStr) {
    return {
      status: 'none',
      text: 'ללא תאריך יעד',
      daysRemaining: 0,
      badgeClass: 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
    };
  }

  const now = new Date();
  
  // Combine date and time if available
  let targetDate: Date;
  if (dueDateStr.includes('T')) {
    targetDate = new Date(dueDateStr);
  } else if (dueTimeStr) {
    targetDate = new Date(`${dueDateStr}T${dueTimeStr}:00`);
  } else {
    // End of that day by default (23:59:59)
    targetDate = new Date(`${dueDateStr}T23:59:59`);
  }

  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  // If already in the past
  if (diffMs < 0) {
    const absDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return {
      status: 'expired',
      text: absDays <= 1 ? 'פג תוקף היום ⚠️' : `עבר הזמן ב-${absDays} ימים ⚠️`,
      daysRemaining: -absDays,
      badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 animate-pulse'
    };
  }

  // Today (less than 24h)
  const isSameDay = 
    now.getFullYear() === targetDate.getFullYear() &&
    now.getMonth() === targetDate.getMonth() &&
    now.getDate() === targetDate.getDate();

  if (isSameDay) {
    const text = diffHours <= 1 ? 'נשארה פחות משעה!' : `היום! (נשארו ${diffHours} שעות)`;
    return {
      status: 'today',
      text,
      daysRemaining: 0,
      badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
    };
  }

  if (diffDays === 1) {
    return {
      status: 'tomorrow',
      text: 'מחר!',
      daysRemaining: 1,
      badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
    };
  }

  if (diffDays <= 7) {
    return {
      status: 'upcoming',
      text: `נשארו ${diffDays} ימים`,
      daysRemaining: diffDays,
      badgeClass: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50'
    };
  }

  return {
    status: 'upcoming',
    text: `נשארו ${diffDays} ימים`,
    daysRemaining: diffDays,
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
  };
}
