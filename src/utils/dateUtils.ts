/**
 * Date Utility Functions for Calendar Meal Planner
 */
export { DAYS_OF_WEEK } from '@/src/constants/defaults';

// Hebrew Month Names
export const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

// Hebrew Day Names (Sunday = 0)
export const HEBREW_DAYS = [
  'יום ראשון',
  'יום שני',
  'יום שלישי',
  'יום רביעי',
  'יום חמישי',
  'יום שישי',
  'שבת'
];

/**
 * Get Sunday date for a given reference date and week offset (0 = current week, -1 = last week, +1 = next week)
 */
export function getSundayOfWeek(refDate: Date = new Date(), weekOffset: number = 0): Date {
  const d = new Date(refDate);
  const day = d.getDay(); // 0 is Sunday
  const diff = d.getDate() - day + (weekOffset * 7);
  const sunday = new Date(d.setDate(diff));
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

/**
 * Get array of 7 Date objects (Sun-Sat) for a given week offset
 */
export function getWeekDates(weekOffset: number = 0): Date[] {
  const sunday = getSundayOfWeek(new Date(), weekOffset);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(sunday);
    nextDay.setDate(sunday.getDate() + i);
    dates.push(nextDay);
  }
  return dates;
}

/**
 * Calculate weekOffset for any target date relative to current week (0)
 */
export function getWeekOffsetFromDate(targetDate: Date): number {
  const currentSunday = getSundayOfWeek(new Date(), 0);
  const targetSunday = getSundayOfWeek(targetDate, 0);
  const diffTime = targetSunday.getTime() - currentSunday.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
  return Math.round(diffDays / 7);
}

/**
 * Generate unique Week Key (e.g., "2026-08-16")
 */
export function getWeekKey(weekOffset: number = 0): string {
  const sunday = getSundayOfWeek(new Date(), weekOffset);
  const yyyy = sunday.getFullYear();
  const mm = (sunday.getMonth() + 1).toString().padStart(2, '0');
  const dd = sunday.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Format a Date to Hebrew Day & Month string (e.g. "16 באוגוסט")
 */
export function formatHebrewDateShort(d: Date): string {
  const dayNum = d.getDate();
  const monthName = HEBREW_MONTHS[d.getMonth()];
  return `${dayNum} ב${monthName}`;
}

/**
 * Format Month & Year for Header (e.g. "אוגוסט 2026")
 */
export function formatMonthYearHeader(weekOffset: number = 0): string {
  const sunday = getSundayOfWeek(new Date(), weekOffset);
  const monthName = HEBREW_MONTHS[sunday.getMonth()];
  const year = sunday.getFullYear();
  return `${monthName} ${year}`;
}

/**
 * Format ISO date string (YYYY-MM-DD)
 */
export function formatIsoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Check Date Status for Business Rules:
 * - canPlan: true for Today or Future dates (can NOT plan new meals on past dates)
 * - canToggleComplete: true for Today, Future, or up to 30 days in the past (1 month grace period)
 */
export interface DateStatus {
  isPast: boolean;
  isFuture: boolean;
  isToday: boolean;
  canPlan: boolean;
  canToggleComplete: boolean;
}

export function getDateStatus(targetDate: Date): DateStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - target.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

  const isToday = diffDays === 0;
  const isPast = diffDays > 0;
  const isFuture = diffDays < 0;

  // Rule 1: Cannot add new items on past days (diffDays > 0)
  const canPlan = !isPast;

  // Rule 2: Completion toggle is ALWAYS allowed for items on the board
  const canToggleComplete = true;

  return {
    isPast,
    isFuture,
    isToday,
    canPlan,
    canToggleComplete,
  };
}
