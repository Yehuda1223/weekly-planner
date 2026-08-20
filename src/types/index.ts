export interface RecipeRating {
  userId: string;
  userName: string;
  rating: number; // 1 - 5
  createdAt: string;
}

export interface RecipeCommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface RecipeComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  replies?: RecipeCommentReply[];
}

export type RecipeModerationStatus = 'approved' | 'pending_super_admin' | 'pending_group_admin' | 'rejected';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  category: string;
  prep_time: string;
  image_gradient?: string;
  image_url?: string;
  author_id?: string;
  is_public?: boolean;
  isShared?: boolean;
  groupId?: string;
  createdBy?: string;
  creatorName?: string;
  creatorEmail?: string;
  createdAt?: string;
  ratings?: RecipeRating[];
  comments?: RecipeComment[];
  status?: RecipeModerationStatus;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
}

// 🍱 Multi-Item Meal Course Support (Main, Side, Salad, Dessert, etc.)
export type MealCourseType = 'מנה עיקרית' | 'תוספת' | 'סלט וממרח' | 'מרק ותבשיל' | 'מאפה ולחם' | 'קינוח ומתוק' | 'אחר';

export interface MealSubItem {
  id: string;
  courseType: MealCourseType;
  recipeId?: string;
  customName?: string;
}

// 📝 Per-day exercise override (edited weights/reps/sets for a specific planned day)
export interface DayExerciseOverride {
  exerciseId: string;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
}

export interface MealPlanItem {
  id?: string;
  day: string;
  meal: string;            // e.g. "ארוחת בוקר", "ארוחת צהריים", "ארוחת ערב", "אימון יומי", "דייט / בילוי"
  recipeId?: string;       // Legacy / Workout ID / Date Spot ID
  customName?: string;     // Legacy custom title
  items?: MealSubItem[];   // 🍱 Multi-item support for rich meals (Main + Side + Dessert)
  date?: string;           // ISO Date e.g. "2026-08-16"
  weekKey?: string;        // Week Key e.g. "2026-08-16"
  completed?: boolean;     // Whether completed
  isShared?: boolean;      // 🔒🤝 Personal (false) vs Shared (true) scope
  workoutId?: string;
  dateSpotId?: string;
  userId?: string;
  // 📝 Per-day enrichment fields
  dayNotes?: string;                       // Free-text notes for this specific day's item
  dayPhotos?: string[];                    // URLs of photos uploaded for this day
  dayExerciseOverrides?: DayExerciseOverride[];  // Per-day weight/reps/sets overrides
}

export interface WeekHistoryRecord {
  weekKey: string;
  monthYearTitle: string;
  startDateFormatted: string;
  endDateFormatted: string;
  items: MealPlanItem[];
  completedCount: number;
  totalAssigned: number;
}

// 🏋️ Fitness & Workout Types
export type MuscleGroup = 'חזה' | 'גב' | 'רגליים' | 'כתפיים' | 'יד קדמית' | 'יד אחורית' | 'בטן' | 'אירובי';
export type WorkoutSplit = 'אימון A' | 'אימון B' | 'אימון C' | 'אימון D' | 'אירובי' | 'כללי';
export type WorkoutType = 'strength' | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: number;
  weight: number; // in kg
  notes?: string;
}

export interface Workout {
  id: string;
  title: string;
  splitGroup: WorkoutSplit;
  type: WorkoutType;
  targetMuscleGroups: MuscleGroup[];
  exercises: Exercise[];
  notes?: string;
  userId?: string;
  isShared?: boolean;
  groupId?: string;
  createdBy?: string;
  creatorName?: string;
  creatorEmail?: string;
  createdAt?: string;
}

export interface WorkoutLogRecord {
  id: string;
  workoutId: string;
  workoutTitle: string;
  splitGroup: WorkoutSplit;
  date: string;       // YYYY-MM-DD
  weekKey: string;    // YYYY-MM-DD
  completedExercises: {
    exerciseName: string;
    muscleGroup: MuscleGroup;
    sets: number;
    reps: number;
    weight: number;
  }[];
  notes?: string;
  userId?: string;
}

// 🥂 Date Night Types
export type DateCategory = 'מסעדות וברים' | 'טבע, ים ופיקניק' | 'קולנוע ותרבות' | 'בתי קפה וקינוחים' | 'דייט ביתי';

export interface DateSpot {
  id: string;
  title: string;
  category: DateCategory;
  address?: string;
  wazeUrl?: string;    // Waze direct navigation URL e.g. "https://waze.com/ul?q=..."
  rating: number;      // 1-5 stars
  visitCount: number;  // How many times visited in past
  notes?: string;
  imageUrl?: string;
  userId?: string;
  isShared?: boolean;
  groupId?: string;
  createdBy?: string;
  creatorName?: string;
  creatorEmail?: string;
  createdAt?: string;
}

export interface CustomShoppingItem {
  id: string;
  name: string;
  category: string;
  userId?: string;
  isShared?: boolean;
  groupId?: string;
  createdBy?: string;
  creatorName?: string;
  creatorEmail?: string;
}

export interface SavedShoppingListItem {
  name: string;
  category: string;
  checked: boolean;
}

export interface SavedShoppingList {
  id: string;
  title: string;
  savedAt: string;
  items: SavedShoppingListItem[];
  userId?: string;
}

export interface ParsedIngredient {
  quantity: number;
  unit: string;
  name: string;
}

// 🔐 Auth & User Profile Types
export const SUPER_ADMIN_EMAILS = [
  'yz0556774323@gmail.com',
  'yz0556774323@gmil.com'
];

export const isSuperAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalized);
};

// 📝 Tasks & Notes Types
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'כללי' | 'בית ומשפחה' | 'סידורים' | 'עבודה' | 'קניות' | 'לימודים' | 'אחר';

export interface TaskItem {
  id: string;
  itemType?: 'task' | 'note'; // 'task' = full task with due date & planner, 'note' = simple sticky note
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD or ISO date string
  dueTime?: string; // HH:mm optional
  assignedDay?: string; // e.g. 'יום שני'
  assignedMeal?: string; // slot name in planner
  noteColor?: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'amber'; // color theme for sticky notes
  createdAt: string;
  createdBy?: string;
  creatorName?: string;
  isShared?: boolean;
}

export interface CategoryPermissions {
  planner: boolean;
  shopping: boolean;
  fitness: boolean;
  dates: boolean;
  tasks?: boolean;
  canPublishWithoutApproval?: boolean; // 🔓 Permission to publish group recipes directly without group admin approval
}

export interface EnabledTabsConfig {
  recipes: boolean;
  planner: boolean;
  shopping: boolean;
  fitness: boolean;
  dates: boolean;
  tasks: boolean;
}

export interface GroupMember {
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'member';
  permissions: CategoryPermissions;
  joinedAt: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  members: GroupMember[];
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName: string;
  invitedByUserId: string;
  invitedByName: string;
  invitedUserEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  groupId?: string;
  groupName?: string;
  joinedGroupIds?: string[];
  activeGroupId?: string;
  sharedPermissions?: {
    [targetUserId: string]: CategoryPermissions;
  };
  canPublishPublicWithoutApproval?: boolean; // 🔓 Permission granted by Super Admin to publish public recipes directly
  enabledTabs?: EnabledTabsConfig;
  isGuest?: boolean;
  isSuperAdmin?: boolean;
  isVerified?: boolean;
  verificationToken?: string;
  verificationCode?: string;
  role?: 'admin' | 'user';
}

export type SyncStatus = 'checking' | 'synced' | 'local' | 'error';
export type TabType = 'recipes' | 'planner' | 'shopping' | 'fitness' | 'dates' | 'tasks';


