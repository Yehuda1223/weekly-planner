import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import {
  Recipe,
  MealPlanItem,
  DayExerciseOverride,
  CustomShoppingItem,
  SavedShoppingList,
  SyncStatus,
  Workout,
  WorkoutLogRecord,
  Exercise,
  DateSpot,
  TaskItem,
  EnabledTabsConfig,
  UserProfile,
  isSuperAdminEmail,
  FamilyGroup,
  GroupMember,
  GroupInvitation,
  CategoryPermissions,
  RecipeRating,
  RecipeComment,
  RecipeCommentReply
} from '@/src/types';
import {
  DEFAULT_RECIPES,
  DEFAULT_MEAL_PLAN,
  DEFAULT_WORKOUTS,
  DEFAULT_DATE_SPOTS,
  DEFAULT_TASKS,
  getSampleHistoryMealPlan
} from '@/src/constants/defaults';
import {
  parseIngredient,
  standardizeUnit,
  getDisplayUnit,
  formatNumber,
  getIngredientCategory
} from '@/src/utils/ingredientUtils';
import { 
  getWeekKey, 
  getWeekDates, 
  formatMonthYearHeader, 
  formatHebrewDateShort, 
  formatIsoDate 
} from '@/src/utils/dateUtils';

export function useRecipesData() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('checking');
  
  // 🔐 Auth & User Profile States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Core Data States
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanItem[]>([]);
  const [customShoppingItems, setCustomShoppingItems] = useState<CustomShoppingItem[]>([]);
  const [savedLists, setSavedLists] = useState<SavedShoppingList[]>([]);

  // 🏋️ Fitness States
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogRecord[]>([]);
  const [fitnessGoal, setFitnessGoal] = useState<number>(4);

  // Week Calendar Navigation State (0 = Current Week, -1 = Last Week, +1 = Next Week)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');

  // Shopping List Checked State
  const [checkedIngredients, setCheckedIngredients] = useState<{ [key: string]: boolean }>({});

  // 🥂 Date Night States
  const [dateSpots, setDateSpots] = useState<DateSpot[]>([]);

  // 📝 Tasks & Notes State
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  // 👥 Group Management & Invitations States
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);

  // 1. Initial State Loading & Auth Restoration
  useEffect(() => {
    async function initApp() {
      // 🧹 Wipe all existing accounts & sessions completely on request
      if (!localStorage.getItem('users_cleaned_v5')) {
        localStorage.removeItem('registered_users');
        localStorage.removeItem('app_current_user');
        sessionStorage.removeItem('app_current_user');
        localStorage.setItem('users_cleaned_v5', 'true');
        setCurrentUser(null);
        setRegisteredUsers([]);
      }

      // Restore user session (Remember Me from localStorage or sessionStorage)
      const savedUser = localStorage.getItem('app_current_user') || sessionStorage.getItem('app_current_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.email && isSuperAdminEmail(parsed.email)) {
            parsed.isSuperAdmin = true;
            parsed.role = 'admin';
            if (!parsed.displayName || parsed.displayName === parsed.email.split('@')[0]) {
              parsed.displayName = 'יהודה זילבר';
            }
          }
          setCurrentUser(parsed);
          if (parsed.activeGroupId) {
            setActiveGroupId(parsed.activeGroupId);
          }
        } catch (e) {}
      }

      // Load custom items, saved lists, workouts, date spots, groups and invitations
      const cachedCustomItems = localStorage.getItem('family_custom_shopping_items');
      const cachedSavedLists = localStorage.getItem('family_saved_shopping_lists');
      const cachedWorkouts = localStorage.getItem('family_workouts');
      const cachedWorkoutLogs = localStorage.getItem('family_workout_logs');
      const cachedDateSpots = localStorage.getItem('family_date_spots');
      const cachedGroups = localStorage.getItem('family_groups_v1');
      const cachedInvitations = localStorage.getItem('group_invitations_v1');

      if (cachedGroups) {
        try {
          setGroups(JSON.parse(cachedGroups));
        } catch (e) {}
      }
      if (cachedInvitations) {
        try {
          setInvitations(JSON.parse(cachedInvitations));
        } catch (e) {}
      }

      if (cachedCustomItems) setCustomShoppingItems(JSON.parse(cachedCustomItems));
      if (cachedSavedLists) setSavedLists(JSON.parse(cachedSavedLists));
      
      if (cachedWorkouts) {
        setWorkouts(JSON.parse(cachedWorkouts));
      } else {
        setWorkouts(DEFAULT_WORKOUTS);
        localStorage.setItem('family_workouts', JSON.stringify(DEFAULT_WORKOUTS));
      }

      if (cachedWorkoutLogs) {
        setWorkoutLogs(JSON.parse(cachedWorkoutLogs));
      }

      if (cachedDateSpots) {
        setDateSpots(JSON.parse(cachedDateSpots));
      } else {
        setDateSpots(DEFAULT_DATE_SPOTS);
        localStorage.setItem('family_date_spots', JSON.stringify(DEFAULT_DATE_SPOTS));
      }

      const cachedTasks = localStorage.getItem('family_tasks_v1');
      if (cachedTasks) {
        try {
          setTasks(JSON.parse(cachedTasks));
        } catch (e) {
          setTasks(DEFAULT_TASKS);
        }
      } else {
        setTasks(DEFAULT_TASKS);
        localStorage.setItem('family_tasks_v1', JSON.stringify(DEFAULT_TASKS));
      }

      const hasSupabaseEnv =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!hasSupabaseEnv) {
        loadLocalStorageData();
        setSyncStatus('local');
        return;
      }

      try {
        // 1. Fetch Recipes & Meal Planner
        const { data: dbRecipes } = await supabase
          .from('recipes')
          .select('*')
          .order('title', { ascending: true });

        const { data: dbMeals } = await supabase
          .from('meal_planner')
          .select('*');

        if (dbRecipes && dbRecipes.length > 0) {
          const formattedRecipes: Recipe[] = dbRecipes.map((r: any) => ({
            ...r,
            prepTime: r.prep_time || r.prepTime,
            imageUrl: r.image_url || r.imageUrl,
            imageGradient: r.image_gradient || r.imageGradient,
            isPublic: r.is_public !== undefined ? r.is_public : r.isPublic,
            isShared: r.is_shared !== undefined ? r.is_shared : (r.isShared !== undefined ? r.isShared : true),
            groupId: r.group_id || r.groupId,
            createdBy: r.created_by || r.createdBy,
            creatorName: r.creator_name || r.creatorName,
            creatorEmail: r.creator_email || r.creatorEmail,
            approvedBy: r.approved_by || r.approvedBy,
            approvedAt: r.approved_at || r.approvedAt
          }));
          setRecipes(formattedRecipes);
        } else {
          await seedDefaultRecipes();
        }

        if (dbMeals && dbMeals.length > 0) {
          const formattedMeals: MealPlanItem[] = dbMeals.map((m: any) => ({
            id: m.id,
            day: m.day,
            meal: m.meal,
            recipeId: m.recipe_id || m.recipeId || '',
            customName: m.custom_name || m.customName || '',
            items: m.items || [],
            weekOffset: m.week_offset !== undefined ? m.week_offset : (m.weekOffset || 0),
            weekKey: m.week_key || m.weekKey || getWeekKey(0),
            completed: Boolean(m.completed),
            isShared: m.is_shared !== undefined ? m.is_shared : (m.isShared !== undefined ? m.isShared : true),
            groupId: m.group_id || m.groupId,
            userId: m.user_id || m.userId,
            dayNotes: m.day_notes || m.dayNotes,
            dayPhotos: m.day_photos || m.dayPhotos,
            dayExerciseOverrides: m.day_exercise_overrides || m.dayExerciseOverrides
          }));
          setMealPlan(formattedMeals);
        } else {
          await seedDefaultMealPlan();
        }

        // 2. Fetch Family Groups & Invitations from Supabase
        try {
          const { data: dbGroups } = await supabase.from('family_groups').select('*');
          if (dbGroups && dbGroups.length > 0) {
            const formattedGroups = dbGroups.map((g: any) => ({
              id: g.id,
              name: g.name,
              createdBy: g.created_by || g.createdBy,
              createdByName: g.created_by_name || g.createdByName,
              members: g.members || [],
              createdAt: g.created_at || g.createdAt
            }));
            setGroups(formattedGroups);
            localStorage.setItem('family_groups_v1', JSON.stringify(formattedGroups));
          }
        } catch (e) {}

        try {
          const { data: dbInvites } = await supabase.from('group_invitations').select('*');
          if (dbInvites && dbInvites.length > 0) {
            const formattedInvites = dbInvites.map((i: any) => ({
              id: i.id,
              groupId: i.group_id || i.groupId,
              groupName: i.group_name || i.groupName,
              invitedByUserId: i.invited_by_user_id || i.invitedByUserId,
              invitedByName: i.invited_by_name || i.invitedByName,
              invitedUserEmail: i.invited_user_email || i.invitedUserEmail,
              status: i.status,
              createdAt: i.created_at || i.createdAt
            }));
            setInvitations(formattedInvites);
            localStorage.setItem('group_invitations_v1', JSON.stringify(formattedInvites));
          }
        } catch (e) {}

        // 3. Fetch Tasks from Supabase
        try {
          const { data: dbTasks } = await supabase.from('tasks').select('*');
          if (dbTasks && dbTasks.length > 0) {
            const formattedTasks: TaskItem[] = dbTasks.map((t: any) => ({
              id: t.id,
              itemType: t.item_type || t.itemType || 'task',
              title: t.title,
              description: t.description,
              category: t.category,
              priority: t.priority,
              completed: t.completed,
              dueDate: t.due_date || t.dueDate,
              dueTime: t.due_time || t.dueTime,
              assignedDay: t.assigned_day || t.assignedDay,
              assignedMeal: t.assigned_meal || t.assignedMeal,
              noteColor: t.note_color || t.noteColor || 'yellow',
              isShared: t.is_shared !== undefined ? t.is_shared : (t.isShared !== undefined ? t.isShared : true),
              groupId: t.group_id || t.groupId,
              createdBy: t.created_by || t.createdBy,
              createdAt: t.created_at || t.createdAt
            }));
            setTasks(formattedTasks);
            localStorage.setItem('family_tasks_v1', JSON.stringify(formattedTasks));
          }
        } catch (e) {}

        // 4. Fetch Workouts from Supabase
        try {
          const { data: dbWorkouts } = await supabase.from('workouts').select('*');
          if (dbWorkouts && dbWorkouts.length > 0) {
            const formattedWorkouts: Workout[] = dbWorkouts.map((w: any) => ({
              id: w.id,
              title: w.title,
              splitGroup: w.split_group || w.splitGroup || 'אימון A',
              type: w.type || 'strength',
              targetMuscleGroups: w.target_muscle_groups || w.targetMuscleGroups || [],
              notes: w.notes,
              exercises: w.exercises || [],
              isShared: w.is_shared !== undefined ? w.is_shared : (w.isShared !== undefined ? w.isShared : true),
              groupId: w.group_id || w.groupId,
              createdBy: w.created_by || w.createdBy
            }));
            setWorkouts(formattedWorkouts);
            localStorage.setItem('family_workouts', JSON.stringify(formattedWorkouts));
          }
        } catch (e) {}

        // 5. Fetch Date Spots from Supabase
        try {
          const { data: dbDateSpots } = await supabase.from('date_spots').select('*');
          if (dbDateSpots && dbDateSpots.length > 0) {
            const formattedDateSpots: DateSpot[] = dbDateSpots.map((d: any) => ({
              id: d.id,
              title: d.title,
              category: d.category,
              address: d.address,
              wazeUrl: d.waze_url || d.wazeUrl,
              rating: d.rating,
              visitCount: d.visit_count !== undefined ? d.visit_count : (d.visitCount || 1),
              notes: d.notes,
              imageUrl: d.image_url || d.imageUrl,
              isShared: d.is_shared !== undefined ? d.is_shared : (d.isShared !== undefined ? d.isShared : true),
              groupId: d.group_id || d.groupId,
              createdBy: d.created_by || d.createdBy
            }));
            setDateSpots(formattedDateSpots);
            localStorage.setItem('family_date_spots', JSON.stringify(formattedDateSpots));
          }
        } catch (e) {}

        // 6. Sync and Fetch Registered Profiles from Supabase
        try {
          // Pre-seed known core family profiles if empty
          await supabase.from('profiles').upsert([
            {
              id: 'u_yehuda_admin',
              email: 'yapexweb.service@gmail.com',
              display_name: 'יהודה זילבר',
              role: 'admin',
              is_super_admin: true,
              is_verified: true,
              updated_at: new Date().toISOString()
            },
            {
              id: 'u_tehila_member',
              email: 't0548459860@gmail.com',
              display_name: 'תהילה',
              role: 'user',
              is_super_admin: false,
              is_verified: true,
              updated_at: new Date().toISOString()
            }
          ]);

          const { data: dbProfiles } = await supabase.from('profiles').select('*');
          if (dbProfiles && dbProfiles.length > 0) {
            const formattedProfiles: UserProfile[] = dbProfiles.map((p: any) => ({
              id: p.id,
              email: p.email,
              displayName: p.display_name || p.displayName || p.email.split('@')[0],
              role: p.role,
              isSuperAdmin: p.is_super_admin || isSuperAdminEmail(p.email),
              isVerified: p.is_verified ?? true,
              isGuest: false
            }));
            setRegisteredUsers(formattedProfiles);
            localStorage.setItem('registered_users', JSON.stringify(formattedProfiles));
          }
        } catch (e) {}

        setSyncStatus('synced');

        // 🚀 Real-time Subscriptions for Instant Multi-Device Sync
        const multiSyncChannel = supabase
          .channel('app-realtime-all')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
            const { data } = await supabase.from('profiles').select('*');
            if (data && data.length > 0) {
              const formattedProfiles: UserProfile[] = data.map((p: any) => ({
                id: p.id,
                email: p.email,
                displayName: p.display_name || p.displayName || p.email.split('@')[0],
                role: p.role,
                isSuperAdmin: p.is_super_admin || isSuperAdminEmail(p.email),
                isVerified: p.is_verified ?? true,
                isGuest: false
              }));
              setRegisteredUsers(formattedProfiles);
              localStorage.setItem('registered_users', JSON.stringify(formattedProfiles));
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, async () => {
            const { data } = await supabase.from('recipes').select('*').order('title', { ascending: true });
            if (data) {
              const formattedRecipes: Recipe[] = data.map((r: any) => ({
                ...r,
                prepTime: r.prep_time || r.prepTime,
                imageUrl: r.image_url || r.imageUrl,
                imageGradient: r.image_gradient || r.imageGradient,
                isPublic: r.is_public !== undefined ? r.is_public : r.isPublic,
                isShared: r.is_shared !== undefined ? r.is_shared : (r.isShared !== undefined ? r.isShared : true),
                groupId: r.group_id || r.groupId,
                createdBy: r.created_by || r.createdBy,
                creatorName: r.creator_name || r.creatorName,
                creatorEmail: r.creator_email || r.creatorEmail,
                approvedBy: r.approved_by || r.approvedBy,
                approvedAt: r.approved_at || r.approvedAt
              }));
              setRecipes(formattedRecipes);
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_planner' }, async () => {
            const { data } = await supabase.from('meal_planner').select('*');
            if (data) {
              const formattedMeals: MealPlanItem[] = data.map((m: any) => ({
                id: m.id,
                day: m.day,
                meal: m.meal,
                recipeId: m.recipe_id || m.recipeId || '',
                customName: m.custom_name || m.customName || '',
                items: m.items || [],
                weekOffset: m.week_offset !== undefined ? m.week_offset : (m.weekOffset || 0),
                weekKey: m.week_key || m.weekKey || getWeekKey(0),
                completed: Boolean(m.completed),
                isShared: m.is_shared !== undefined ? m.is_shared : (m.isShared !== undefined ? m.isShared : true),
                groupId: m.group_id || m.groupId,
                userId: m.user_id || m.userId,
                dayNotes: m.day_notes || m.dayNotes,
                dayPhotos: m.day_photos || m.dayPhotos,
                dayExerciseOverrides: m.day_exercise_overrides || m.dayExerciseOverrides
              }));
              setMealPlan(formattedMeals);
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'family_groups' }, async () => {
            const { data } = await supabase.from('family_groups').select('*');
            if (data) {
              const formattedGroups = data.map((g: any) => ({
                id: g.id,
                name: g.name,
                createdBy: g.created_by || g.createdBy,
                createdByName: g.created_by_name || g.createdByName,
                members: g.members || [],
                createdAt: g.created_at || g.createdAt
              }));
              setGroups(formattedGroups);
              localStorage.setItem('family_groups_v1', JSON.stringify(formattedGroups));
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'group_invitations' }, async () => {
            const { data } = await supabase.from('group_invitations').select('*');
            if (data) {
              const formattedInvites = data.map((i: any) => ({
                id: i.id,
                groupId: i.group_id || i.groupId,
                groupName: i.group_name || i.groupName,
                invitedByUserId: i.invited_by_user_id || i.invitedByUserId,
                invitedByName: i.invited_by_name || i.invitedByName,
                invitedUserEmail: i.invited_user_email || i.invitedUserEmail,
                status: i.status,
                createdAt: i.created_at || i.createdAt
              }));
              setInvitations(formattedInvites);
              localStorage.setItem('group_invitations_v1', JSON.stringify(formattedInvites));
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
            const { data } = await supabase.from('tasks').select('*');
            if (data) {
              const formatted = data.map((t: any) => ({
                id: t.id,
                itemType: t.item_type || t.itemType || 'task',
                title: t.title,
                description: t.description,
                category: t.category,
                priority: t.priority,
                completed: t.completed,
                dueDate: t.due_date || t.dueDate,
                dueTime: t.due_time || t.dueTime,
                assignedDay: t.assigned_day || t.assignedDay,
                assignedMeal: t.assigned_meal || t.assignedMeal,
                noteColor: t.note_color || t.noteColor || 'yellow',
                isShared: t.is_shared !== undefined ? t.is_shared : true,
                groupId: t.group_id || t.groupId,
                createdBy: t.created_by || t.createdBy,
                createdAt: t.created_at || t.createdAt
              }));
              setTasks(formatted);
              localStorage.setItem('family_tasks_v1', JSON.stringify(formatted));
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts' }, async () => {
            const { data } = await supabase.from('workouts').select('*');
            if (data) {
              const formatted = data.map((w: any) => ({
                id: w.id,
                title: w.title,
                splitGroup: w.split_group || w.splitGroup || 'אימון A',
                type: w.type || 'strength',
                targetMuscleGroups: w.target_muscle_groups || w.targetMuscleGroups || [],
                notes: w.notes,
                exercises: w.exercises || [],
                isShared: w.is_shared !== undefined ? w.is_shared : true,
                groupId: w.group_id || w.groupId,
                createdBy: w.created_by || w.createdBy
              }));
              setWorkouts(formatted);
              localStorage.setItem('family_workouts', JSON.stringify(formatted));
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'date_spots' }, async () => {
            const { data } = await supabase.from('date_spots').select('*');
            if (data) {
              const formatted = data.map((d: any) => ({
                id: d.id,
                title: d.title,
                category: d.category,
                address: d.address,
                wazeUrl: d.waze_url || d.wazeUrl,
                rating: d.rating,
                visitCount: d.visit_count !== undefined ? d.visit_count : 1,
                notes: d.notes,
                imageUrl: d.image_url || d.imageUrl,
                isShared: d.is_shared !== undefined ? d.is_shared : true,
                groupId: d.group_id || d.groupId,
                createdBy: d.created_by || d.createdBy
              }));
              setDateSpots(formatted);
              localStorage.setItem('family_date_spots', JSON.stringify(formatted));
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
            const { data } = await supabase.from('profiles').select('*');
            if (data) {
              const formatted: UserProfile[] = data.map((p: any) => ({
                id: p.id,
                email: p.email,
                displayName: p.display_name || p.email.split('@')[0],
                role: p.role,
                isSuperAdmin: p.is_super_admin || isSuperAdminEmail(p.email),
                isVerified: p.is_verified ?? true,
                isGuest: false
              }));
              setRegisteredUsers(formatted);
              localStorage.setItem('registered_users', JSON.stringify(formatted));
            }
          })
          .subscribe();

        return () => {
          supabase.removeChannel(multiSyncChannel);
        };
      } catch (err) {
        console.warn('Supabase DB error, falling back to local storage:', err);
        loadLocalStorageData();
        setSyncStatus('local');
      }
    }

    initApp();
  }, []);

  // Seed Default Recipes to Supabase
  const seedDefaultRecipes = async () => {
    try {
      const { data, error } = await supabase.from('recipes').insert(
        DEFAULT_RECIPES.map(({ id, ...rest }) => ({
          ...rest,
          image_gradient: rest.image_gradient || 'from-orange-500 to-amber-600'
        }))
      ).select();
      if (!error && data) {
        setRecipes(data);
      }
    } catch (e) {
      console.error('Failed to seed recipes:', e);
    }
  };

  // Seed Default Meal Plan to Supabase
  const seedDefaultMealPlan = async () => {
    try {
      const { data, error } = await supabase.from('meal_planner').insert(DEFAULT_MEAL_PLAN).select();
      if (!error && data) {
        setMealPlan(data);
      }
    } catch (e) {
      console.error('Failed to seed meal plan:', e);
    }
  };

  // Load data from LocalStorage
  const loadLocalStorageData = () => {
    const cachedRecipes = localStorage.getItem('family_recipes');
    const cachedMealPlan = localStorage.getItem('family_meal_plan');

    if (cachedRecipes) {
      try {
        const parsed: Recipe[] = JSON.parse(cachedRecipes);
        // Auto-sanitize any legacy uncompressed heavy base64 images (>300KB)
        const cleaned = parsed.map(r => {
          if (r.image_url && r.image_url.startsWith('data:image/') && r.image_url.length > 300000) {
            return { ...r, image_url: undefined };
          }
          return r;
        });
        setRecipes(cleaned);
      } catch (err) {
        setRecipes(DEFAULT_RECIPES);
      }
    } else {
      setRecipes(DEFAULT_RECIPES);
      saveRecipesSafe(DEFAULT_RECIPES);
    }

    if (cachedMealPlan) {
      try {
        const parsed: MealPlanItem[] = JSON.parse(cachedMealPlan);
        const sampleHistory = typeof getSampleHistoryMealPlan === 'function' ? getSampleHistoryMealPlan() : [];
        
        // Merge missing sample history items for previous weeks
        const existingKeys = new Set(parsed.map(i => i.weekKey));
        const missingSamples = sampleHistory.filter(s => s.weekKey && !existingKeys.has(s.weekKey));
        
        if (missingSamples.length > 0) {
          const merged = [...parsed, ...missingSamples];
          setMealPlan(merged);
          localStorage.setItem('family_meal_plan', JSON.stringify(merged));
        } else {
          setMealPlan(parsed);
        }
      } catch (e) {
        const samples = typeof getSampleHistoryMealPlan === 'function' ? getSampleHistoryMealPlan() : [];
        setMealPlan(samples);
        localStorage.setItem('family_meal_plan', JSON.stringify(samples));
      }
    } else {
      const samples = typeof getSampleHistoryMealPlan === 'function' ? getSampleHistoryMealPlan() : [];
      setMealPlan(samples);
      localStorage.setItem('family_meal_plan', JSON.stringify(samples));
    }
  };

  const saveRecipesSafe = (updatedRecipes: Recipe[]) => {
    setRecipes(updatedRecipes);
    try {
      localStorage.setItem('family_recipes', JSON.stringify(updatedRecipes));
    } catch (err) {
      console.warn('LocalStorage quota exceeded, sanitizing oversized images:', err);
      const sanitized = updatedRecipes.map(r => {
        if (r.image_url && r.image_url.startsWith('data:image/') && r.image_url.length > 200000) {
          return { ...r, image_url: undefined };
        }
        return r;
      });
      try {
        localStorage.setItem('family_recipes', JSON.stringify(sanitized));
        setRecipes(sanitized);
      } catch (e) {
        console.error('Failed to save recipes even after sanitizing:', e);
      }
    }
  };

  const saveCustomItemsLocally = (items: CustomShoppingItem[]) => {
    setCustomShoppingItems(items);
    localStorage.setItem('family_custom_shopping_items', JSON.stringify(items));
  };

  const saveSavedListsLocally = (lists: SavedShoppingList[]) => {
    setSavedLists(lists);
    localStorage.setItem('family_saved_shopping_lists', JSON.stringify(lists));
  };

  // 🛡️ Guest & Auth Protection Helper
  const checkGuestOrUnauthorized = (actionName = 'לבצע פעולה זו'): boolean => {
    if (!currentUser || currentUser.isGuest) {
      alert(`מצב אורח הינו לצפייה בלבד. יש להתחבר או להירשם כדי ${actionName}.`);
      return true;
    }
    return false;
  };

  // CRUD Operations: Recipes with Creator Attribution & Moderation Workflow
  const handleAddRecipe = async (newRecipeData: Omit<Recipe, 'id'>) => {
    if (checkGuestOrUnauthorized('להוסיף מתכונים')) return;

    const tempId = 'r_' + Date.now();

    // 🛡️ Moderation Status Calculation:
    let initialStatus: RecipeModerationStatus = 'approved';
    let approvedBy: string | undefined = undefined;
    let approvedAt: string | undefined = undefined;

    if (newRecipeData.is_public === true) {
      // 🌐 Public Community Recipe
      const canPublishPublicDirectly = Boolean(currentUser?.isSuperAdmin || currentUser?.canPublishPublicWithoutApproval);
      if (canPublishPublicDirectly) {
        initialStatus = 'approved';
        approvedBy = currentUser?.isSuperAdmin ? 'מנהל בכיר' : 'יוצר מורשה';
        approvedAt = new Date().toISOString();
      } else {
        initialStatus = 'pending_super_admin';
      }
    } else if (newRecipeData.isShared !== false && newRecipeData.groupId) {
      // 👥 Group Recipe
      const targetGroup = groups.find(g => g.id === newRecipeData.groupId);
      const isGroupAdmin = Boolean(targetGroup && (targetGroup.createdBy === currentUser?.id || currentUser?.isSuperAdmin));
      const member = targetGroup?.members?.find(m => m.userId === currentUser?.id || (currentUser?.email && m.email?.toLowerCase() === currentUser.email.toLowerCase()));
      const canPublishGroupDirectly = Boolean(isGroupAdmin || member?.permissions?.canPublishWithoutApproval);

      if (canPublishGroupDirectly) {
        initialStatus = 'approved';
        approvedBy = isGroupAdmin ? 'מנהל קבוצה' : 'חבר מורשה';
        approvedAt = new Date().toISOString();
      } else {
        initialStatus = 'pending_group_admin';
      }
    } else {
      // 🔒 Private Recipe -> Always approved directly
      initialStatus = 'approved';
    }

    const enrichedData: Recipe = {
      ...newRecipeData,
      id: tempId,
      createdBy: currentUser?.id || 'u_' + Date.now(),
      creatorName: currentUser?.displayName || 'משתמש',
      creatorEmail: currentUser?.email || '',
      createdAt: new Date().toISOString(),
      ratings: [],
      comments: [],
      status: initialStatus,
      approvedBy,
      approvedAt
    };

    if (syncStatus === 'synced' || (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      try {
        const { error } = await supabase.from('recipes').insert([{
          id: enrichedData.id,
          title: enrichedData.title,
          description: enrichedData.description,
          ingredients: enrichedData.ingredients,
          instructions: enrichedData.instructions,
          category: enrichedData.category,
          prep_time: enrichedData.prepTime || enrichedData.prep_time || '20 דק׳',
          image_url: enrichedData.image_url || enrichedData.imageUrl || null,
          image_gradient: enrichedData.image_gradient || enrichedData.imageGradient || 'from-orange-500 to-amber-600',
          is_public: Boolean(enrichedData.is_public || enrichedData.isPublic),
          is_shared: enrichedData.isShared !== undefined ? enrichedData.isShared : true,
          group_id: enrichedData.groupId || activeGroup?.id || null,
          created_by: enrichedData.createdBy,
          creator_name: enrichedData.creatorName,
          creator_email: enrichedData.creatorEmail,
          status: enrichedData.status || 'approved',
          approved_by: enrichedData.approvedBy || null,
          approved_at: enrichedData.approvedAt || null,
          ratings: enrichedData.ratings || [],
          comments: enrichedData.comments || []
        }]);
        if (error) throw error;
      } catch (err) {
        console.error('Failed to save to Supabase, saving locally:', err);
        saveRecipesSafe([...recipes, enrichedData]);
      }
    } else {
      saveRecipesSafe([...recipes, enrichedData]);
    }

    // Inform user of the status
    if (initialStatus === 'pending_super_admin') {
      alert('🎉 המתכון נשמר בהצלחה ונשלח לאישור מנהל בכיר! הוא יפורסם לקהילה לאחר אישור.');
    } else if (initialStatus === 'pending_group_admin') {
      alert('🎉 המתכון נשמר בהצלחה ונשלח לאישור מנהל הקבוצה! הוא יוצג לכל חברי הקבוצה לאחר אישור.');
    }
  };

  const saveRecipeLocally = (recipe: Recipe) => {
    saveRecipesSafe([...recipes, recipe]);
  };

  // ✅ Approve Recipe (Super Admin for public, or Group Admin for group recipes)
  const handleApproveRecipe = async (recipeId: string) => {
    if (!currentUser) return;
    const target = recipes.find(r => r.id === recipeId);
    if (!target) return;

    if (target.status === 'pending_super_admin' && !currentUser.isSuperAdmin) {
      alert('רק מנהל בכיר רשאי לאשר מתכונים לפרסום כללי.');
      return;
    }

    if (target.status === 'pending_group_admin') {
      const group = groups.find(g => g.id === target.groupId);
      const isGroupAdmin = group?.createdBy === currentUser.id || currentUser.isSuperAdmin;
      if (!isGroupAdmin) {
        alert('רק מנהל הקבוצה או מנהל מערכת רשאים לאשר מתכונים לקבוצה.');
        return;
      }
    }

    const updatedRecipe: Recipe = {
      ...target,
      status: 'approved',
      approvedBy: currentUser.isSuperAdmin ? 'מנהל בכיר' : (currentUser.displayName || 'מנהל קבוצה'),
      approvedAt: new Date().toISOString(),
      rejectionReason: undefined
    };

    updateRecipeLocally(updatedRecipe);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        await supabase.from('recipes').update({
          status: 'approved',
          approvedBy: updatedRecipe.approvedBy,
          approvedAt: updatedRecipe.approvedAt,
          rejectionReason: null
        }).eq('id', recipeId);
      } catch (e) {
        console.error('Failed to sync approval to Supabase:', e);
      }
    }

    alert(`✅ המתכון "${target.title}" אושר בהצלחה ופורסם!`);
  };

  // ❌ Reject Recipe
  const handleRejectRecipe = async (recipeId: string, reason?: string) => {
    if (!currentUser) return;
    const target = recipes.find(r => r.id === recipeId);
    if (!target) return;

    if (target.status === 'pending_super_admin' && !currentUser.isSuperAdmin) {
      alert('רק מנהל בכיר רשאי לדחות מתכונים כלליים.');
      return;
    }

    if (target.status === 'pending_group_admin') {
      const group = groups.find(g => g.id === target.groupId);
      const isGroupAdmin = group?.createdBy === currentUser.id || currentUser.isSuperAdmin;
      if (!isGroupAdmin) {
        alert('רק מנהל הקבוצה או מנהל מערכת רשאים לדחות מתכונים לקבוצה.');
        return;
      }
    }

    const promptReason = reason !== undefined ? reason : (prompt('סיבת הדחייה (אופציונלי):') || undefined);

    const updatedRecipe: Recipe = {
      ...target,
      status: 'rejected',
      rejectionReason: promptReason
    };

    updateRecipeLocally(updatedRecipe);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        await supabase.from('recipes').update({
          status: 'rejected',
          rejectionReason: promptReason || null
        }).eq('id', recipeId);
      } catch (e) {
        console.error('Failed to sync rejection to Supabase:', e);
      }
    }

    alert(`המתכון "${target.title}" נדחה.`);
  };

  // 🔓 Super Admin: Toggle Public Direct Publishing Permission for a User
  const handleToggleUserPublicPublishPermission = (userId: string) => {
    if (!currentUser?.isSuperAdmin) {
      alert('רק מנהל בכיר רשאי להעניק הרשאת פרסום ישיר לקהילה.');
      return;
    }

    const allRegistered = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const targetUser = allRegistered.find((u: any) => u.id === userId);
    if (!targetUser) return;

    const newPerm = !targetUser.canPublishPublicWithoutApproval;
    const updatedAll = allRegistered.map((u: any) => 
      u.id === userId ? { ...u, canPublishPublicWithoutApproval: newPerm } : u
    );

    localStorage.setItem('registered_users', JSON.stringify(updatedAll));
    setRegisteredUsers(updatedAll);
    alert(`הרשאת פרסום כללי ישיר ל-${targetUser.displayName} ${newPerm ? 'הוענקה בהצלחה! 🔓' : 'בוטלה 🔒'}`);
  };

  // 🔓 Group Admin: Toggle Group Direct Publishing Permission for a Member
  const handleToggleMemberGroupPublishPermission = (groupId: string, memberUserId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !currentUser) return;

    const isGroupAdmin = group.createdBy === currentUser.id || currentUser.isSuperAdmin;
    if (!isGroupAdmin) {
      alert('רק מנהל הקבוצה או מנהל מערכת רשאים לעדכן הרשאות פרסום ישיר.');
      return;
    }

    const updatedGroups = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          members: (g.members || []).map(m => {
            if (m.userId === memberUserId) {
              const currentPerm = m.permissions?.canPublishWithoutApproval || false;
              return {
                ...m,
                permissions: {
                  ...m.permissions,
                  canPublishWithoutApproval: !currentPerm
                }
              };
            }
            return m;
          })
        };
      }
      return g;
    });

    setGroups(updatedGroups);
    localStorage.setItem('family_groups_v1', JSON.stringify(updatedGroups));
    alert('הרשאת פרסום ישיר לקבוצה עודכנה בהצלחה! ✨');
  };

  const handleDeleteRecipe = async (id: string) => {
    if (checkGuestOrUnauthorized('למחוק מתכונים')) return;

    const target = recipes.find(r => r.id === id);
    const isCreator = target && currentUser && (target.createdBy === currentUser.id || target.creatorEmail === currentUser.email);
    const isAllowed = currentUser?.isSuperAdmin || isCreator;

    if (!isAllowed) {
      alert('פעולה זו מורשית למנהל בכיר או למי שיצר את המתכון בלבד');
      return;
    }

    if (!confirm('האם אתם בטוחים שברצונכם למחוק את המתכון הזה?')) return;

    // 1. Immediate optimistic local update
    deleteRecipeLocally(id);

    // 2. Supabase deletion
    if (syncStatus === 'synced' || (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      try {
        await supabase.from('meal_planner').update({ recipeId: '' }).eq('recipeId', id);
        const { error } = await supabase.from('recipes').delete().eq('id', id);
        if (error) {
          console.warn('Supabase recipe delete warning:', error.message);
        }
      } catch (err) {
        console.error('Failed to delete recipe from Supabase:', err);
      }
    }
  };

  const deleteRecipeLocally = (id: string) => {
    const updatedRecipes = recipes.filter(r => r.id !== id);
    saveRecipesSafe(updatedRecipes);

    const updatedPlanner = mealPlan
      .map(item => {
        if (item.recipeId === id) {
          return { ...item, recipeId: '' };
        }
        if (item.items && item.items.length > 0) {
          const filteredItems = item.items.filter(sub => sub.recipeId !== id);
          return { ...item, items: filteredItems };
        }
        return item;
      })
      .filter(item => {
        const hasRecipe = Boolean(item.recipeId);
        const hasCustom = Boolean(item.customName && item.customName.trim());
        const hasSubItems = Boolean(item.items && item.items.length > 0);
        return hasRecipe || hasCustom || hasSubItems;
      });

    setMealPlan(updatedPlanner);
    localStorage.setItem('family_meal_plan', JSON.stringify(updatedPlanner));
  };

  const handleUpdateRecipe = async (id: string, updatedRecipeData: Omit<Recipe, 'id'>) => {
    if (checkGuestOrUnauthorized('לערוך מתכונים')) return;

    const target = recipes.find(r => r.id === id);
    const isCreator = target && currentUser && (target.createdBy === currentUser.id || target.creatorEmail === currentUser.email);
    const isAllowed = currentUser?.isSuperAdmin || isCreator;

    if (!isAllowed) {
      alert('עריכת מתכון מורשית למנהל בכיר או למי שיצר את המתכון בלבד');
      return;
    }

    // Determine status if scope changed
    let nextStatus = target?.status || 'approved';
    if (updatedRecipeData.is_public && !target?.is_public) {
      const canPublishPublic = Boolean(currentUser?.isSuperAdmin || currentUser?.canPublishPublicWithoutApproval);
      nextStatus = canPublishPublic ? 'approved' : 'pending_super_admin';
    } else if (updatedRecipeData.groupId && updatedRecipeData.groupId !== target?.groupId) {
      const targetGroup = groups.find(g => g.id === updatedRecipeData.groupId);
      const isGroupAdmin = Boolean(targetGroup && (targetGroup.createdBy === currentUser?.id || currentUser?.isSuperAdmin));
      const member = targetGroup?.members?.find(m => m.userId === currentUser?.id);
      const canPublishGroup = Boolean(isGroupAdmin || member?.permissions?.canPublishWithoutApproval);
      nextStatus = canPublishGroup ? 'approved' : 'pending_group_admin';
    }

    const merged: Recipe = {
      ...updatedRecipeData,
      id,
      createdBy: target?.createdBy || currentUser?.id,
      creatorName: target?.creatorName || currentUser?.displayName,
      creatorEmail: target?.creatorEmail || currentUser?.email,
      createdAt: target?.createdAt || new Date().toISOString(),
      ratings: target?.ratings || [],
      comments: target?.comments || [],
      status: nextStatus
    };

    if (syncStatus === 'synced' || (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      try {
        const { error } = await supabase
          .from('recipes')
          .update({
            title: merged.title,
            description: merged.description,
            ingredients: merged.ingredients,
            instructions: merged.instructions,
            category: merged.category,
            prep_time: merged.prepTime || merged.prep_time,
            image_url: merged.image_url || merged.imageUrl || null,
            image_gradient: merged.image_gradient || merged.imageGradient,
            is_public: Boolean(merged.is_public || merged.isPublic),
            is_shared: merged.isShared !== undefined ? merged.isShared : true,
            group_id: merged.groupId || null,
            status: merged.status,
            ratings: merged.ratings || [],
            comments: merged.comments || []
          })
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Failed to update recipe in Supabase, updating locally:', err);
        updateRecipeLocally(merged);
      }
    } else {
      updateRecipeLocally(merged);
    }
  };

  const updateRecipeLocally = (updatedRec: Recipe) => {
    const updated = recipes.map(r => r.id === updatedRec.id ? { ...r, ...updatedRec } : r);
    saveRecipesSafe(updated);
  };

  // ⭐ Rating Handler with User Transparency
  const handleRateRecipe = (recipeId: string, ratingValue: number) => {
    if (checkGuestOrUnauthorized('לדרג מתכונים')) return;

    const updated = recipes.map(r => {
      if (r.id === recipeId) {
        const existingRatings = r.ratings || [];
        const filtered = existingRatings.filter(rt => rt.userId !== currentUser?.id && rt.userName !== currentUser?.displayName);
        const newRating: RecipeRating = {
          userId: currentUser?.id || '',
          userName: currentUser?.displayName || '',
          rating: ratingValue,
          createdAt: new Date().toISOString()
        };
        return {
          ...r,
          ratings: [...filtered, newRating]
        };
      }
      return r;
    });

    saveRecipesSafe(updated);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const target = updated.find(r => r.id === recipeId);
      if (target) {
        supabase.from('recipes').update({ ratings: target.ratings }).eq('id', recipeId).then();
      }
    }
  };

  // 💬 Comment Handler
  const handleAddComment = (recipeId: string, content: string) => {
    if (checkGuestOrUnauthorized('להגיב על מתכונים')) return;
    if (!content.trim()) return;

    const updated = recipes.map(r => {
      if (r.id === recipeId) {
        const newComment: RecipeComment = {
          id: 'cmt_' + Date.now(),
          userId: currentUser?.id || '',
          userName: currentUser?.displayName || '',
          content: content.trim(),
          createdAt: new Date().toISOString(),
          replies: []
        };
        return {
          ...r,
          comments: [...(r.comments || []), newComment]
        };
      }
      return r;
    });

    saveRecipesSafe(updated);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const target = updated.find(r => r.id === recipeId);
      if (target) {
        supabase.from('recipes').update({ comments: target.comments }).eq('id', recipeId).then();
      }
    }
  };

  // ↩️ Reply to Comment Handler
  const handleAddReply = (recipeId: string, commentId: string, content: string) => {
    if (checkGuestOrUnauthorized('להגיב לתגובות')) return;
    if (!content.trim()) return;

    const updated = recipes.map(r => {
      if (r.id === recipeId) {
        const updatedComments = (r.comments || []).map(cmt => {
          if (cmt.id === commentId) {
            const newReply: RecipeCommentReply = {
              id: 'rpl_' + Date.now(),
              userId: currentUser.id,
              userName: currentUser.displayName,
              content: content.trim(),
              createdAt: new Date().toISOString()
            };
            return {
              ...cmt,
              replies: [...(cmt.replies || []), newReply]
            };
          }
          return cmt;
        });
        return {
          ...r,
          comments: updatedComments
        };
      }
      return r;
    });

    saveRecipesSafe(updated);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const target = updated.find(r => r.id === recipeId);
      if (target) {
        supabase.from('recipes').update({ comments: target.comments }).eq('id', recipeId).then();
      }
    }
  };

  const saveMealPlanSafe = async (updatedPlan: MealPlanItem[]) => {
    setMealPlan(updatedPlan);
    localStorage.setItem('family_meal_plan', JSON.stringify(updatedPlan));

    if (syncStatus === 'synced' || (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      try {
        await supabase.from('meal_planner').upsert(
          updatedPlan.map(item => ({
            id: item.id || 'm_' + Date.now(),
            day: item.day,
            meal: item.meal,
            recipe_id: item.recipeId || (item as any).recipe_id || '',
            custom_name: item.customName || (item as any).custom_name || '',
            items: item.items || [],
            week_offset: item.weekOffset !== undefined ? item.weekOffset : 0,
            week_key: item.weekKey || getWeekKey(0),
            completed: Boolean(item.completed),
            is_shared: item.isShared !== undefined ? item.isShared : true,
            group_id: item.groupId || activeGroup?.id || null,
            user_id: item.userId || currentUser?.id || null,
            day_notes: item.dayNotes || '',
            day_photos: item.dayPhotos || [],
            day_exercise_overrides: item.dayExerciseOverrides || []
          }))
        );
      } catch (err) {
        console.warn('Supabase meal_planner sync notice:', err);
      }
    }
  };

  const handleDeleteMealPlanItem = async (itemId?: string, day?: string, meal?: string, weekKeyStr?: string) => {
    if (checkGuestOrUnauthorized('למחוק מהתפריט השבועי')) return;

    const targetWeekKey = weekKeyStr || getWeekKey(weekOffset);
    let deletedId = itemId;

    const updatedPlan = mealPlan.filter(item => {
      if (itemId && item.id && item.id === itemId) {
        deletedId = item.id;
        return false;
      }
      const itemWeekKey = item.weekKey || getWeekKey(0);
      if (day && meal && item.day === day && item.meal === meal && (!item.weekKey || itemWeekKey === targetWeekKey)) {
        deletedId = item.id;
        return false;
      }
      return true;
    });

    setMealPlan(updatedPlan);
    localStorage.setItem('family_meal_plan', JSON.stringify(updatedPlan));

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        if (deletedId) {
          await supabase.from('meal_planner').delete().eq('id', deletedId);
        } else if (day && meal) {
          await supabase.from('meal_planner').delete().match({ day, meal, weekKey: targetWeekKey });
        }
      } catch (err) {
        console.warn('Supabase delete meal plan item notice:', err);
      }
    }
  };

  const handleAssignMeal = (
    day: string, 
    meal: string, 
    recipeId = '', 
    customName = '', 
    items?: MealSubItem[], 
    isShared = true
  ) => {
    if (checkGuestOrUnauthorized('לשבץ ארוחות ואימונים בתפריט')) return;
    const currentWeekKey = getWeekKey(weekOffset);
    saveMealLocally(day, meal, recipeId, recipeId ? '' : customName.trim(), currentWeekKey, items, isShared);
  };

  const saveMealLocally = async (
    day: string, 
    meal: string, 
    recipeId: string, 
    customName: string, 
    weekKeyStr?: string,
    items?: MealSubItem[],
    isShared = true
  ) => {
    const targetWeekKey = weekKeyStr || getWeekKey(weekOffset);
    const existingIndex = mealPlan.findIndex(item => {
      const itemWeekKey = item.weekKey || getWeekKey(0);
      return item.day === day && item.meal === meal && itemWeekKey === targetWeekKey;
    });

    const isEmpty = !recipeId && !customName && (!items || items.length === 0);

    if (isEmpty) {
      if (existingIndex >= 0) {
        const itemToDelete = mealPlan[existingIndex];
        const updated = mealPlan.filter((_, idx) => idx !== existingIndex);
        setMealPlan(updated);
        localStorage.setItem('family_meal_plan', JSON.stringify(updated));

        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && itemToDelete.id) {
          try {
            await supabase.from('meal_planner').delete().eq('id', itemToDelete.id);
          } catch (e) {
            console.warn('Failed to delete empty meal slot from Supabase:', e);
          }
        }
      }
      return;
    }

    let updated = [...mealPlan];

    if (existingIndex >= 0) {
      updated[existingIndex] = { 
        ...updated[existingIndex], 
        recipeId, 
        customName,
        items,
        isShared,
        weekKey: targetWeekKey 
      };
    } else {
      const newItemId = 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      updated.push({ id: newItemId, day, meal, recipeId, customName, items, isShared, weekKey: targetWeekKey, completed: false });
    }

    saveMealPlanSafe(updated);
  };

  // 📝 Update day-specific data (notes, photos, exercise overrides) for a MealPlanItem
  const updateMealPlanItemData = (itemId: string, updates: Partial<Pick<MealPlanItem, 'dayNotes' | 'dayPhotos' | 'dayExerciseOverrides'>>) => {
    if (checkGuestOrUnauthorized('לעדכן תוכניות בלוח התכנון')) return;
    const updated = mealPlan.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      return item;
    });
    saveMealPlanSafe(updated);
  };

  const toggleMealCompletion = (day: string, meal: string, targetWeekKeyStr?: string, itemId?: string) => {
    if (checkGuestOrUnauthorized('לסמן השלמת משימות')) return;
    setMealPlan(prevPlan => {
      const targetWeekKey = targetWeekKeyStr || getWeekKey(weekOffset);
      const updated = prevPlan.map(item => {
        const matchesId = Boolean(itemId && item.id && item.id === itemId);
        const itemWeekKey = item.weekKey || getWeekKey(0);
        const matchesDayMealKey = item.day === day && item.meal === meal && itemWeekKey === targetWeekKey;
        const matchesDayMealFallback = item.day === day && item.meal === meal;

        if (matchesId || matchesDayMealKey || matchesDayMealFallback) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });

      // Synchronize immediately to LocalStorage
      localStorage.setItem('family_meal_plan', JSON.stringify(updated));

      // Synchronize to Supabase if connected
      if (syncStatus === 'synced') {
        const payload = updated.map(item => ({
          id: item.id || 'm_' + Date.now(),
          day: item.day,
          meal: item.meal,
          recipeId: item.recipeId || '',
          customName: item.customName || '',
          items: item.items || [],
          isShared: item.isShared !== undefined ? item.isShared : true,
          weekKey: item.weekKey || getWeekKey(0),
          completed: item.completed || false
        }));

        supabase.from('meal_planner').upsert(payload)
          .then(({ data, error }) => {
            if (error) {
              console.error('❌ [DB ERROR] Supabase upsert failed:', error);
            }
          })
          .catch(err => {
            console.error('💥 [DB EXCEPTION] Supabase request exception:', err);
          });
      }

      return updated;
    });
  };

  const copyPastWeekPlan = (sourceWeekKey: string) => {
    if (checkGuestOrUnauthorized('להעתיק תוכניות שבועיות')) return;
    const sourceItems = mealPlan.filter(item => (item.weekKey || getWeekKey(0)) === sourceWeekKey);
    if (sourceItems.length === 0) return;

    const currentWeekKey = getWeekKey(weekOffset);
    const updated = mealPlan.filter(item => (item.weekKey || getWeekKey(0)) !== currentWeekKey);

    sourceItems.forEach(source => {
      updated.push({
        day: source.day,
        meal: source.meal,
        recipeId: source.recipeId,
        customName: source.customName,
        weekKey: currentWeekKey,
        completed: false
      });
    });

    saveMealPlanSafe(updated);
  };

  const clearMealPlanner = async () => {
    if (checkGuestOrUnauthorized('לנקות את התפריט השבועי')) return;
    if (!confirm('האם אתה בטוח שברצונך לנקות ולמחוק את כל המנות מהתפריט לשבוע זה?')) return;

    const currentWeekKey = getWeekKey(weekOffset);
    const itemsToDelete = mealPlan.filter(item => (item.weekKey || getWeekKey(0)) === currentWeekKey);
    const updated = mealPlan.filter(item => (item.weekKey || getWeekKey(0)) !== currentWeekKey);

    setMealPlan(updated);
    localStorage.setItem('family_meal_plan', JSON.stringify(updated));

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const itemIds = itemsToDelete.map(i => i.id).filter(Boolean);
        if (itemIds.length > 0) {
          await supabase.from('meal_planner').delete().in('id', itemIds);
        } else {
          await supabase.from('meal_planner').delete().eq('weekKey', currentWeekKey);
        }
      } catch (err) {
        console.warn('Supabase clearMealPlanner error:', err);
      }
    }
  };


  // CRUD Operations: Custom Shopping Items
  const handleAddCustomItem = (name: string, category: string) => {
    if (checkGuestOrUnauthorized('להוסיף מצרכים לרשימת הקניות')) return;
    if (!name.trim()) return;

    const newItem: CustomShoppingItem = {
      id: 'c_' + Date.now(),
      name: name.trim(),
      category
    };

    saveCustomItemsLocally([...customShoppingItems, newItem]);
  };

  const handleDeleteCustomItem = (id: string) => {
    if (checkGuestOrUnauthorized('למחוק מצרכים מרשימת הקניות')) return;
    const updated = customShoppingItems.filter(item => item.id !== id);
    saveCustomItemsLocally(updated);
  };

  const toggleIngredientCheck = (name: string) => {
    if (checkGuestOrUnauthorized('לסמן מצרכים שנקנו')) return;
    setCheckedIngredients(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Saved Shopping Lists Handlers
  const handleSaveShoppingList = async (title: string, clearPlanner: boolean) => {
    if (checkGuestOrUnauthorized('לשמור רשימות קניות')) return;
    if (!title.trim()) return;

    const itemsToSave: { name: string; category: string; checked: boolean }[] = [];

    Object.entries(categorizedShoppingList).forEach(([category, items]) => {
      items.forEach(item => {
        itemsToSave.push({
          name: item.name,
          category,
          checked: !!checkedIngredients[item.name]
        });
      });
    });

    const newList: SavedShoppingList = {
      id: 'list_' + Date.now(),
      title: title.trim(),
      savedAt: new Date().toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: itemsToSave
    };

    saveSavedListsLocally([newList, ...savedLists]);

    if (clearPlanner) {
      const currentWeekKey = getWeekKey(weekOffset);
      const updatedPlanner = mealPlan.filter(item => (item.weekKey || getWeekKey(0)) !== currentWeekKey);
      setMealPlan(updatedPlanner);
      localStorage.setItem('family_meal_plan', JSON.stringify(updatedPlanner));
      saveCustomItemsLocally([]);
    }
  };

  const handleDeleteSavedList = (id: string) => {
    if (checkGuestOrUnauthorized('למחוק רשימות שמורות')) return;
    if (!confirm('האם למחוק רשימה שמורה זו?')) return;
    const updated = savedLists.filter(l => l.id !== id);
    saveSavedListsLocally(updated);
  };

  // Concurrent state, LocalStorage & Supabase Workouts synchronizer
  const saveWorkoutsSafe = async (updatedWorkouts: Workout[]) => {
    setWorkouts(updatedWorkouts);
    localStorage.setItem('family_workouts', JSON.stringify(updatedWorkouts));

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        console.log('🔄 [SYNCING WORKOUTS & WEIGHTS TO DB]...', updatedWorkouts.length, 'workouts');
        const { error } = await supabase.from('workouts').upsert(
          updatedWorkouts.map(w => ({
            id: w.id,
            title: w.title,
            split_group: w.splitGroup,
            type: w.type,
            target_muscle_groups: w.targetMuscleGroups,
            exercises: w.exercises,
            notes: w.notes || ''
          }))
        );
        if (error) {
          console.warn('⚠️ [SUPABASE WORKOUTS UPSERT NOTICE]:', error.message);
        } else {
          console.log('✅ [SUPABASE WORKOUTS & WEIGHTS SYNCED SUCCESSFULLY]');
        }
      } catch (e) {
        console.warn('⚠️ [SUPABASE WORKOUTS SYNC CATCH]:', e);
      }
    }
  };

  // 🏋️ CRUD Operations: Workouts & Weight Progression
  const handleAddWorkout = (workoutData: Omit<Workout, 'id'>) => {
    if (checkGuestOrUnauthorized('להוסיף אימונים')) return;
    const newWorkout: Workout = {
      ...workoutData,
      id: 'w_' + Date.now()
    };
    const updated = [newWorkout, ...workouts];
    saveWorkoutsSafe(updated);
  };

  const handleUpdateWorkout = (id: string, updatedWorkout: Omit<Workout, 'id'>) => {
    if (checkGuestOrUnauthorized('לערוך אימונים')) return;
    const updated = workouts.map(w => w.id === id ? { ...updatedWorkout, id } : w);
    saveWorkoutsSafe(updated);
  };

  const handleDeleteWorkout = (id: string) => {
    if (checkGuestOrUnauthorized('למחוק אימונים')) return;
    if (!confirm('האם למחוק אימון זה מספריית האימונים?')) return;
    const updated = workouts.filter(w => w.id !== id);
    saveWorkoutsSafe(updated);
  };

  const handleUpdateExerciseWeight = (workoutId: string, exerciseId: string, newWeight: number) => {
    if (checkGuestOrUnauthorized('לשנות משקלים באימון')) return;
    const updated = workouts.map(w => {
      if (w.id === workoutId) {
        const updatedExercises = w.exercises.map(ex => 
          ex.id === exerciseId ? { ...ex, weight: newWeight } : ex
        );
        return { ...w, exercises: updatedExercises };
      }
      return w;
    });
    saveWorkoutsSafe(updated);
  };

  const handleLogWorkoutCompleted = (workout: Workout) => {
    if (checkGuestOrUnauthorized('לתעד אימונים שהושלמו')) return;
    const todayStr = formatIsoDate(new Date());
    const currentWeekKey = getWeekKey(0);

    const newLog: WorkoutLogRecord = {
      id: 'log_' + Date.now(),
      workoutId: workout.id,
      workoutTitle: workout.title,
      splitGroup: workout.splitGroup,
      date: todayStr,
      weekKey: currentWeekKey,
      completedExercises: workout.exercises.map(ex => ({
        exerciseName: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight
      }))
    };

    const updatedLogs = [newLog, ...workoutLogs];
    setWorkoutLogs(updatedLogs);
    localStorage.setItem('family_workout_logs', JSON.stringify(updatedLogs));
  };

  // 🥂 Date Night CRUD Handlers
  const handleAddDateSpot = async (spotData: Omit<DateSpot, 'id'>) => {
    if (checkGuestOrUnauthorized('להוסיף מקומות לדייט')) return;
    const newSpot: DateSpot = {
      ...spotData,
      id: 'd_' + Date.now(),
      createdBy: currentUser?.id
    };
    const updated = [newSpot, ...dateSpots];
    setDateSpots(updated);
    localStorage.setItem('family_date_spots', JSON.stringify(updated));

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('date_spots').upsert({
          id: newSpot.id,
          title: newSpot.title,
          category: newSpot.category,
          address: newSpot.address,
          waze_url: newSpot.wazeUrl,
          rating: newSpot.rating,
          visit_count: newSpot.visitCount,
          notes: newSpot.notes,
          image_url: newSpot.imageUrl,
          is_shared: newSpot.isShared !== undefined ? newSpot.isShared : true,
          group_id: newSpot.groupId,
          created_by: newSpot.createdBy
        });
      }
    } catch (e) {}
  };

  const handleUpdateDateSpot = async (id: string, updatedData: Omit<DateSpot, 'id'>) => {
    if (checkGuestOrUnauthorized('לערוך מקומות לדייט')) return;
    const updated = dateSpots.map(s => s.id === id ? { ...updatedData, id } : s);
    setDateSpots(updated);
    localStorage.setItem('family_date_spots', JSON.stringify(updated));

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('date_spots').upsert({
          id,
          title: updatedData.title,
          category: updatedData.category,
          address: updatedData.address,
          waze_url: updatedData.wazeUrl,
          rating: updatedData.rating,
          visit_count: updatedData.visitCount,
          notes: updatedData.notes,
          image_url: updatedData.imageUrl,
          is_shared: updatedData.isShared !== undefined ? updatedData.isShared : true,
          group_id: updatedData.groupId,
          created_by: updatedData.createdBy
        });
      }
    } catch (e) {}
  };

  const handleDeleteDateSpot = async (id: string) => {
    if (checkGuestOrUnauthorized('למחוק מקומות לדייט')) return;
    const updated = dateSpots.filter(s => s.id !== id);
    setDateSpots(updated);
    localStorage.setItem('family_date_spots', JSON.stringify(updated));

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('date_spots').delete().eq('id', id);
      }
    } catch (e) {}
  };

  const handleIncrementVisitCount = async (id: string) => {
    if (checkGuestOrUnauthorized('לעדכן ביקורים בדייטים')) return;
    const updated = dateSpots.map(s => s.id === id ? { ...s, visitCount: s.visitCount + 1 } : s);
    setDateSpots(updated);
    localStorage.setItem('family_date_spots', JSON.stringify(updated));

    const target = updated.find(s => s.id === id);
    if (target) {
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          await supabase.from('date_spots').update({ visit_count: target.visitCount }).eq('id', id);
        }
      } catch (e) {}
    }
  };

  // 📝 Tasks & Notes Handlers
  const handleAddTask = async (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    if (checkGuestOrUnauthorized('להוסיף מטלות ופתקים')) return;

    const newTask: TaskItem = {
      ...taskData,
      id: 'task_' + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id,
      creatorName: currentUser?.displayName || 'משתמש'
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    try {
      localStorage.setItem('family_tasks_v1', JSON.stringify(updatedTasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
    }

    // Sync to Supabase
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('tasks').upsert({
          id: newTask.id,
          item_type: newTask.itemType || 'task',
          title: newTask.title,
          description: newTask.description,
          category: newTask.category,
          priority: newTask.priority,
          completed: newTask.completed,
          due_date: newTask.dueDate,
          due_time: newTask.dueTime,
          assigned_day: newTask.assignedDay,
          assigned_meal: newTask.assignedMeal,
          note_color: newTask.noteColor || 'yellow',
          is_shared: newTask.isShared !== undefined ? newTask.isShared : true,
          group_id: newTask.groupId,
          created_by: newTask.createdBy,
          created_at: newTask.createdAt
        });
      }
    } catch (e) {}

    // If assigned to weekly planner day & slot, also insert into mealPlan
    if (newTask.assignedDay && newTask.assignedMeal) {
      handleAssignMeal(
        newTask.assignedDay,
        newTask.assignedMeal,
        undefined,
        `📝 ${newTask.title}`
      );
    }
  };

  const handleUpdateTask = async (id: string, updatedData: Partial<TaskItem>) => {
    if (checkGuestOrUnauthorized('לערוך מטלות ופתקים')) return;

    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, ...updatedData } : task
    );
    setTasks(updatedTasks);
    try {
      localStorage.setItem('family_tasks_v1', JSON.stringify(updatedTasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
    }

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const target = updatedTasks.find(t => t.id === id);
        if (target) {
          await supabase.from('tasks').upsert({
            id: target.id,
            item_type: target.itemType || 'task',
            title: target.title,
            description: target.description,
            category: target.category,
            priority: target.priority,
            completed: target.completed,
            due_date: target.dueDate,
            due_time: target.dueTime,
            assigned_day: target.assignedDay,
            assigned_meal: target.assignedMeal,
            note_color: target.noteColor || 'yellow',
            is_shared: target.isShared !== undefined ? target.isShared : true,
            group_id: target.groupId,
            created_by: target.createdBy
          });
        }
      }
    } catch (e) {}
  };

  const handleDeleteTask = async (id: string) => {
    if (checkGuestOrUnauthorized('למחוק מטלות')) return;

    if (!confirm('האם למחוק מטלה זו?')) return;

    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    try {
      localStorage.setItem('family_tasks_v1', JSON.stringify(updatedTasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
    }

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('tasks').delete().eq('id', id);
      }
    } catch (e) {}
  };

  const handleToggleTaskCompleted = async (id: string) => {
    if (checkGuestOrUnauthorized('לסמן השלמת מטלות')) return;

    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    try {
      localStorage.setItem('family_tasks_v1', JSON.stringify(updatedTasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
    }

    const target = updatedTasks.find(t => t.id === id);
    if (target) {
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          await supabase.from('tasks').update({ completed: target.completed }).eq('id', id);
        }
      } catch (e) {}
    }
  };

  const handleAssignTaskToPlanner = (taskId: string, day: string, meal: string) => {
    if (checkGuestOrUnauthorized('לשבץ מטלה במתכנן')) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    handleAssignMeal(day, meal, undefined, `📝 ${task.title}`);
    handleUpdateTask(taskId, { assignedDay: day, assignedMeal: meal });
    alert(`המטלה "${task.title}" שובצה בהצלחה ב-${day} (${meal})!`);
  };

  // 🔐 Auth Handlers (Login, Register, Logout, Remember Me, Super Admin)
  const handleLogin = async (email: string, pass: string, rememberMe: boolean): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return { success: false, error: 'אנא הזן כתובת דוא״ל תקינה' };
    }

    const isSuperAdmin = isSuperAdminEmail(trimmedEmail);
    const registeredUsersList = JSON.parse(localStorage.getItem('registered_users') || '[]');
    
    // Look for user by email in local registry
    const userByEmail = registeredUsersList.find((u: any) => u.email?.toLowerCase() === trimmedEmail.toLowerCase());

    // Also check cloud profiles table if not found locally
    let cloudUser: any = null;
    if (!userByEmail && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { data: pData } = await supabase.from('profiles').select('*').eq('email', trimmedEmail).maybeSingle();
        if (pData) {
          cloudUser = pData;
        }
      } catch (e) {}
    }

    // 🛑 If user does NOT exist in the system
    if (!userByEmail && !cloudUser) {
      return { 
        success: false, 
        error: 'כתובת דוא״ל זו אינה קיימת במערכת. אנא לחץ על "הרשמה" כדי ליצור חשבון חדש.' 
      };
    }

    // 🔑 Verify Password
    const targetUser = userByEmail || cloudUser;
    if (userByEmail && userByEmail.password && userByEmail.password !== pass) {
      return { 
        success: false, 
        error: 'סיסמה שגויה. אנא נסה שנית או לחץ על "שכחת סיסמה?".' 
      };
    }

    // 🛑 Check Email Verification Status (Must verify email before login, unless Super Admin)
    if (!isSuperAdmin && targetUser.isVerified === false) {
      return {
        success: false,
        error: 'חשבונך עדיין אינו מאומת. אנא היכנס לתיבת המייל שלך והזן את קוד האימות כדי להפעיל את החשבון.'
      };
    }

    const profile: UserProfile = {
      id: targetUser.id,
      email: targetUser.email,
      displayName: isSuperAdmin ? (targetUser.displayName || 'יהודה זילבר') : (targetUser.displayName || targetUser.display_name || targetUser.email.split('@')[0]),
      groupId: targetUser.groupId || targetUser.group_id,
      groupName: targetUser.groupName || targetUser.group_name,
      groupCode: targetUser.groupCode || targetUser.group_code,
      isGuest: false,
      isSuperAdmin: isSuperAdmin,
      isVerified: targetUser.isVerified ?? true,
      role: isSuperAdmin ? 'admin' : 'user'
    };

    setCurrentUser(profile);

    if (rememberMe) {
      localStorage.setItem('app_current_user', JSON.stringify(profile));
    } else {
      sessionStorage.setItem('app_current_user', JSON.stringify(profile));
    }

    // Sync to cloud if Supabase is connected
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('profiles').upsert({
          id: profile.id,
          email: profile.email,
          display_name: profile.displayName,
          role: profile.role,
          is_super_admin: profile.isSuperAdmin,
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {}

    return { success: true };
  };

  const handleRegister = async (displayName: string, email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const isSuperAdmin = isSuperAdminEmail(email);
    const registeredUsersList = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const existing = registeredUsersList.find((u: any) => u.email?.toLowerCase() === email.trim().toLowerCase());

    if (existing) {
      return { success: false, message: 'כתובת דוא״ל זו כבר רשומה במערכת.' };
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newProfile: UserProfile = {
      id: isSuperAdmin ? 'u_admin_yehuda' : 'u_' + Date.now(),
      email: email.trim(),
      displayName: isSuperAdmin ? (displayName || 'יהודה זילבר') : displayName,
      isGuest: false,
      isSuperAdmin: isSuperAdmin,
      isVerified: false, // 🛑 MUST enter code from email to activate!
      verificationCode: verificationCode,
      role: isSuperAdmin ? 'admin' : 'user'
    };

    // Save to registered users
    const updatedUsers = [...registeredUsersList, { ...newProfile, password: pass }];
    localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
    setRegisteredUsers(updatedUsers);

    console.log('📨 Sending 6-digit code to:', email.trim(), 'code:', verificationCode);

    let resendErrorMsg: string | null = null;
    try {
      const res = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          displayName: displayName.trim(),
          verificationCode
        })
      });
      const data = await res.json();
      console.log('📬 Verification email response:', data);
      if (!res.ok) {
        resendErrorMsg = data.error || 'שגיאה בשליחת המייל';
      }
    } catch (e: any) {
      console.error('Failed to send verification email:', e);
      resendErrorMsg = e?.message || 'שגיאת רשת בשליחת מייל אימות';
    }

    // Also notify Supabase Auth if connected
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('profiles').upsert({
          id: newProfile.id,
          email: newProfile.email,
          display_name: newProfile.displayName,
          role: newProfile.role,
          is_super_admin: newProfile.isSuperAdmin,
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {}

    return { 
      success: true, 
      message: resendErrorMsg || undefined
    };
  };

  // 🔄 Resend 6-Digit Code Handler
  const handleResendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    const trimmed = email.trim();
    const registeredUsersList = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const userIndex = registeredUsersList.findIndex((u: any) => u.email?.toLowerCase() === trimmed.toLowerCase());

    if (userIndex === -1) {
      return { success: false, message: 'כתובת דוא״ל זו אינה קיימת במערכת.' };
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    registeredUsersList[userIndex].verificationCode = newCode;
    registeredUsersList[userIndex].isVerified = false;
    localStorage.setItem('registered_users', JSON.stringify(registeredUsersList));
    setRegisteredUsers(registeredUsersList);

    try {
      const res = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          displayName: registeredUsersList[userIndex].displayName,
          verificationCode: newCode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { 
          success: false, 
          message: data.error || 'שגיאה בשליחת המייל'
        };
      }

      return { 
        success: true, 
        message: `קוד אימות חדש בן 6 ספרות נשלח בהצלחה לכתובת ${trimmed}!`
      };
    } catch (e: any) {
      return { 
        success: false, 
        message: e?.message || 'שגיאת רשת בשליחת מייל אימות'
      };
    }
  };

  // 🔢 6-Digit Code Verification Handler
  const handleVerifyCode = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();
    const registeredUsersList = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const userIndex = registeredUsersList.findIndex((u: any) => u.email?.toLowerCase() === trimmedEmail.toLowerCase());

    if (userIndex === -1) {
      return { success: false, message: 'כתובת דוא״ל זו אינה קיימת במערכת.' };
    }

    const user = registeredUsersList[userIndex];
    if (!user.verificationCode || user.verificationCode !== trimmedCode) {
      return { success: false, message: 'קוד אימות שגוי. אנא בדוק את הקוד בן 6 הספרות שנשלח למייל שלך.' };
    }

    // Mark verified and remove verification code
    user.isVerified = true;
    user.verificationCode = undefined;
    registeredUsersList[userIndex] = user;
    localStorage.setItem('registered_users', JSON.stringify(registeredUsersList));
    setRegisteredUsers(registeredUsersList);

    const isSuperAdmin = isSuperAdminEmail(user.email);
    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isGuest: false,
      isSuperAdmin: isSuperAdmin,
      isVerified: true,
      role: isSuperAdmin ? 'admin' : 'user'
    };

    setCurrentUser(profile);
    localStorage.setItem('app_current_user', JSON.stringify(profile));

    // Sync verified profile to Supabase
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('profiles').upsert({
          id: profile.id,
          email: profile.email,
          display_name: profile.displayName,
          role: profile.role,
          is_super_admin: profile.isSuperAdmin,
          is_verified: true,
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {}

    return { success: true, message: '🎉 החשבון אומת והופעל בהצלחה! ברוך הבא למתכנן השבועי!' };
  };

  // ✅ Account Verification Handler (Activated when user clicks link in email)
  const handleVerifyAccount = async (email: string, token: string): Promise<{ success: boolean; message: string }> => {
    const registeredUsersList = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const userIndex = registeredUsersList.findIndex((u: any) => u.email?.toLowerCase() === email.trim().toLowerCase());

    if (userIndex === -1) {
      return { success: false, message: 'כתובת דוא״ל זו אינה קיימת במערכת.' };
    }

    const user = registeredUsersList[userIndex];
    if (user.verificationToken && user.verificationToken !== token) {
      return { success: false, message: 'קישור האימות אינו תקין או שפג תוקפו.' };
    }

    // Mark as verified
    user.isVerified = true;
    registeredUsersList[userIndex] = user;
    localStorage.setItem('registered_users', JSON.stringify(registeredUsersList));
    setRegisteredUsers(registeredUsersList);

    // Auto-login verified user
    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isGuest: false,
      isSuperAdmin: user.isSuperAdmin,
      isVerified: true,
      role: user.role || 'user'
    };

    setCurrentUser(profile);
    localStorage.setItem('app_current_user', JSON.stringify(profile));

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('profiles').upsert({
          id: profile.id,
          email: profile.email,
          display_name: profile.displayName,
          role: profile.role,
          is_super_admin: profile.isSuperAdmin,
          is_verified: true,
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {}

    return { success: true, message: '🎉 חשבונך אומת והופעל בהצלחה! ברוך הבא למתכנן השבועי!' };
  };

  // 🔑 Password Reset Handler (Email Recovery & Direct Password Update)
  const handleResetPassword = async (email: string, newPassword?: string): Promise<{ success: boolean; message: string }> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return { success: false, message: 'אנא הזן כתובת דוא״ל תקינה' };
    }

    // Option A: If user provided a new password to reset directly
    if (newPassword && newPassword.trim()) {
      const registeredUsersList = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const userIndex = registeredUsersList.findIndex((u: any) => u.email?.toLowerCase() === trimmedEmail.toLowerCase());

      if (userIndex !== -1) {
        registeredUsersList[userIndex].password = newPassword.trim();
        localStorage.setItem('registered_users', JSON.stringify(registeredUsersList));
        setRegisteredUsers(registeredUsersList);

        // Try updating in Supabase Auth as well
        try {
          if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            await supabase.auth.updateUser({ password: newPassword.trim() });
          }
        } catch (e) {}

        return {
          success: true,
          message: 'הסיסמה עודכנה בהצלחה! כעת ניתן להתחבר עם הסיסמה החדשה.'
        };
      }
    }

    // Option B: Send reset password email directly via Resend API Route + Supabase
    try {
      const resetLink = typeof window !== 'undefined' ? `${window.location.origin}/#type=recovery` : 'http://localhost:3000/#type=recovery';
      
      const apiRes = await fetch('/api/auth/send-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, resetLink })
      });

      const apiData = await apiRes.json();

      if (!apiRes.ok) {
        throw new Error(apiData.error || 'שגיאה בשליחת המייל');
      }

      // Also trigger Supabase Auth recovery in background if available
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          await supabase.auth.resetPasswordForEmail(trimmedEmail, {
            redirectTo: resetLink
          });
        }
      } catch (e) {}

      return {
        success: true,
        message: `הוראות לאיפוס הסיסמה נשלחו בהצלחה לכתובת ${trimmedEmail}! אנא בדוק את תיבת הדואר הנכנס.`
      };
    } catch (err: any) {
      console.error('Password reset error:', err);
      return {
        success: false,
        message: err?.message || 'שגיאה בשליחת מייל איפוס. אנא נסה שנית.'
      };
    }
  };


  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('app_current_user');
    sessionStorage.removeItem('app_current_user');
  };

  const handleContinueAsGuest = () => {
    const guestProfile: UserProfile = {
      id: 'guest',
      email: 'guest@app.local',
      displayName: 'אורח',
      isGuest: true,
      isSuperAdmin: false,
      role: 'user'
    };
    setCurrentUser(guestProfile);
  };

  // 👑 Super Admin: Delete a user from the entire system
  const handleDeleteUser = async (userId: string) => {
    if (!currentUser?.isSuperAdmin) {
      alert('פעולה זו מורשית למנהל בכיר בלבד (יהודה זילבר)');
      return;
    }

    if (userId === currentUser.id || userId === 'u_admin_yehuda') {
      alert('לא ניתן למחוק את חשבון המנהל הראשי');
      return;
    }

    if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה לצמיתות מהמערכת?')) return;

    const updated = registeredUsers.filter(u => u.id !== userId);
    setRegisteredUsers(updated);
    localStorage.setItem('registered_users', JSON.stringify(updated));

    // Try deleting from cloud
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('profiles').delete().eq('id', userId);
      }
    } catch (e) {
      console.warn('Failed to delete user profile in Supabase:', e);
    }
  };

  const DEFAULT_REGISTERED_USERS: UserProfile[] = [
    {
      id: 'u_yehuda_admin',
      email: 'yapexweb.service@gmail.com',
      displayName: 'יהודה זילבר',
      role: 'admin',
      isSuperAdmin: true,
      isGuest: false,
      isVerified: true
    },
    {
      id: 'u_tehila_member',
      email: 't0548459860@gmail.com',
      displayName: 'תהילה',
      role: 'user',
      isSuperAdmin: false,
      isGuest: false,
      isVerified: true
    }
  ];

  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(DEFAULT_REGISTERED_USERS);
  const [enabledTabs, setEnabledTabs] = useState<EnabledTabsConfig>({
    recipes: true,
    planner: true,
    shopping: true,
    fitness: true,
    dates: true,
    tasks: true
  });

  useEffect(() => {
    // 1. Load local users and merge with core family defaults
    const loadedLocal = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const mergedMap = new Map<string, UserProfile>();
    DEFAULT_REGISTERED_USERS.forEach(u => mergedMap.set(u.email.toLowerCase(), u));
    loadedLocal.forEach((u: UserProfile) => { if (u.email) mergedMap.set(u.email.toLowerCase(), u); });
    const initialMerged = Array.from(mergedMap.values());
    setRegisteredUsers(initialMerged);
    localStorage.setItem('registered_users', JSON.stringify(initialMerged));

    // 2. Fetch all registered users from Supabase profiles if table exists
    async function syncCloudProfiles() {
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          // Pre-seed core family profiles to Supabase
          try {
            await supabase.from('profiles').upsert([
              {
                id: 'u_yehuda_admin',
                email: 'yapexweb.service@gmail.com',
                display_name: 'יהודה זילבר',
                role: 'admin',
                is_super_admin: true,
                is_verified: true,
                updated_at: new Date().toISOString()
              },
              {
                id: 'u_tehila_member',
                email: 't0548459860@gmail.com',
                display_name: 'תהילה',
                role: 'user',
                is_super_admin: false,
                is_verified: true,
                updated_at: new Date().toISOString()
              }
            ]);
          } catch (e) {}

          const { data: profiles, error } = await supabase.from('profiles').select('*');
          if (!error && profiles && profiles.length > 0) {
            const formatted: UserProfile[] = profiles.map((p: any) => ({
              id: p.id,
              email: p.email,
              displayName: p.display_name || p.displayName || p.email.split('@')[0],
              role: p.role,
              isSuperAdmin: p.is_super_admin || isSuperAdminEmail(p.email),
              isVerified: p.is_verified ?? true,
              isGuest: false
            }));

            // Merge local and cloud profiles without duplicates
            formatted.forEach((u: UserProfile) => { if (u.email) mergedMap.set(u.email.toLowerCase(), u); });

            const mergedList = Array.from(mergedMap.values());
            setRegisteredUsers(mergedList);
            localStorage.setItem('registered_users', JSON.stringify(mergedList));
          }
        }
      } catch (e) {
        console.warn('Profiles table sync skipped:', e);
      }
    }

    syncCloudProfiles();

    const savedTabs = localStorage.getItem('app_enabled_tabs');
    if (savedTabs) {
      try {
        const parsed = JSON.parse(savedTabs);
        setEnabledTabs({
          recipes: parsed.recipes !== false,
          planner: parsed.planner !== false,
          shopping: parsed.shopping !== false,
          fitness: parsed.fitness !== false,
          dates: parsed.dates !== false,
          tasks: parsed.tasks !== false
        });
      } catch (e) {}
    } else if (currentUser?.enabledTabs) {
      setEnabledTabs({
        recipes: currentUser.enabledTabs.recipes !== false,
        planner: currentUser.enabledTabs.planner !== false,
        shopping: currentUser.enabledTabs.shopping !== false,
        fitness: currentUser.enabledTabs.fitness !== false,
        dates: currentUser.enabledTabs.dates !== false,
        tasks: currentUser.enabledTabs.tasks !== false
      });
    }
  }, [currentUser]);

  const handleSaveEnabledTabs = (config: EnabledTabsConfig) => {
    setEnabledTabs(config);
    localStorage.setItem('app_enabled_tabs', JSON.stringify(config));

    if (currentUser) {
      const updatedProfile = { ...currentUser, enabledTabs: config };
      setCurrentUser(updatedProfile);
      localStorage.setItem('app_current_user', JSON.stringify(updatedProfile));
    }
  };

  // 🤝 Direct User Sharing Handlers with Category Permissions
  const handleSaveSharingPermissions = (targetUserId: string, permissions: CategoryPermissions) => {
    if (!currentUser) return;
    const updatedShared = {
      ...(currentUser.sharedPermissions || {}),
      [targetUserId]: permissions
    };
    const updatedProfile: UserProfile = {
      ...currentUser,
      sharedPermissions: updatedShared
    };

    setCurrentUser(updatedProfile);
    localStorage.setItem('app_current_user', JSON.stringify(updatedProfile));

    const allRegistered = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const updatedAll = allRegistered.map((u: any) => u.id === currentUser.id ? { ...u, sharedPermissions: updatedShared } : u);
    localStorage.setItem('registered_users', JSON.stringify(updatedAll));
    setRegisteredUsers(updatedAll);
  };

  // Active Group Resolution
  const activeGroup = useMemo(() => {
    if (!currentUser || currentUser.isGuest) return null;
    if (activeGroupId === 'none' || activeGroupId === '') return null;
    if (activeGroupId) {
      const found = groups.find(g => g.id === activeGroupId);
      if (found) return found;
    }
    // Return first group where user is member or creator
    return groups.find(g => g.members?.some(m => m.userId === currentUser.id || m.email?.toLowerCase() === currentUser.email?.toLowerCase())) || null;
  }, [groups, activeGroupId, currentUser]);

  // Pending Invitations for current user
  const pendingInvitations = useMemo(() => {
    if (!currentUser?.email) return [];
    const normalized = currentUser.email.trim().toLowerCase();
    return invitations.filter(inv => inv.invitedUserEmail?.trim().toLowerCase() === normalized && inv.status === 'pending');
  }, [invitations, currentUser]);

  // 👥 Create Group (with optional initial members to invite)
  const handleCreateGroup = async (groupName: string, initialInviteEmails: string[] = []) => {
    if (!currentUser) {
      alert('יש להתחבר כדי ליצור קבוצה');
      return;
    }
    if (!groupName.trim()) return;

    const newGroup: FamilyGroup = {
      id: 'grp_' + Date.now(),
      name: groupName.trim(),
      createdBy: currentUser.id,
      createdByName: currentUser.displayName,
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: currentUser.id,
          email: currentUser.email,
          displayName: currentUser.displayName,
          role: 'admin',
          permissions: { planner: true, shopping: true, fitness: true, dates: true },
          joinedAt: new Date().toISOString()
        }
      ]
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem('family_groups_v1', JSON.stringify(updatedGroups));
    setActiveGroupId(newGroup.id);

    // Sync group to Supabase
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('family_groups').upsert({
          id: newGroup.id,
          name: newGroup.name,
          created_by: newGroup.createdBy,
          created_by_name: newGroup.createdByName,
          members: newGroup.members,
          created_at: newGroup.createdAt
        });
      }
    } catch (e) {}

    // Create invitations for each invited email
    if (initialInviteEmails.length > 0) {
      const newInvites: GroupInvitation[] = initialInviteEmails.map((email, idx) => ({
        id: 'inv_' + (Date.now() + idx),
        groupId: newGroup.id,
        groupName: newGroup.name,
        invitedByUserId: currentUser.id,
        invitedByName: currentUser.displayName,
        invitedUserEmail: email.trim().toLowerCase(),
        status: 'pending',
        createdAt: new Date().toISOString()
      }));

      const updatedInvitations = [...invitations, ...newInvites];
      setInvitations(updatedInvitations);
      localStorage.setItem('group_invitations_v1', JSON.stringify(updatedInvitations));

      // Sync invitations to Supabase
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          await supabase.from('group_invitations').upsert(
            newInvites.map(inv => ({
              id: inv.id,
              group_id: inv.groupId,
              group_name: inv.groupName,
              invited_by_user_id: inv.invitedByUserId,
              invited_by_name: inv.invitedByName,
              invited_user_email: inv.invitedUserEmail,
              status: inv.status,
              created_at: inv.createdAt
            }))
          );
        }
      } catch (e) {}
    }

    const updatedUser = {
      ...currentUser,
      activeGroupId: newGroup.id,
      joinedGroupIds: [...(currentUser.joinedGroupIds || []), newGroup.id]
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('app_current_user', JSON.stringify(updatedUser));
  };

  // 🗑️ Cancel/Delete Sent Invitation
  const handleCancelInvitation = async (invitationId: string) => {
    const updated = invitations.filter(i => i.id !== invitationId);
    setInvitations(updated);
    localStorage.setItem('group_invitations_v1', JSON.stringify(updated));

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('group_invitations').delete().eq('id', invitationId);
      }
    } catch (e) {}
  };

  // 👥 Switch Active Group
  const handleSwitchGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    if (currentUser) {
      const updatedUser = { ...currentUser, activeGroupId: groupId };
      setCurrentUser(updatedUser);
      localStorage.setItem('app_current_user', JSON.stringify(updatedUser));
    }
  };

  // ✉️ Invite User to Group
  const handleInviteToGroup = async (groupId: string, targetEmail: string) => {
    if (!currentUser) return;
    const trimmedEmail = targetEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      alert('אנא הזן כתובת דוא״ל');
      return;
    }

    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    // Check if already in group
    if (group.members?.some(m => m.email?.toLowerCase() === trimmedEmail)) {
      alert('משתמש זה כבר חבר בקבוצה');
      return;
    }

    // Check if invitation already pending
    if (invitations.some(inv => inv.groupId === groupId && inv.invitedUserEmail?.toLowerCase() === trimmedEmail && inv.status === 'pending')) {
      alert('כבר נשלחה הזמנה למשתמש זה הממתינה לאישור');
      return;
    }

    const newInvitation: GroupInvitation = {
      id: 'inv_' + Date.now(),
      groupId: group.id,
      groupName: group.name,
      invitedByUserId: currentUser.id,
      invitedByName: currentUser.displayName,
      invitedUserEmail: trimmedEmail,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updatedInvitations = [...invitations, newInvitation];
    setInvitations(updatedInvitations);
    localStorage.setItem('group_invitations_v1', JSON.stringify(updatedInvitations));

    // Sync to Supabase
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('group_invitations').upsert({
          id: newInvitation.id,
          group_id: newInvitation.groupId,
          group_name: newInvitation.groupName,
          invited_by_user_id: newInvitation.invitedByUserId,
          invited_by_name: newInvitation.invitedByName,
          invited_user_email: newInvitation.invitedUserEmail,
          status: newInvitation.status,
          created_at: newInvitation.createdAt
        });
      }
    } catch (e) {}

    alert(`ההזמנה לקבוצה "${group.name}" נשלחה בהצלחה ל-${trimmedEmail}!`);
  };

  // 🔔 Respond to Invitation (Accept / Decline)
  const handleRespondInvitation = async (invitationId: string, accept: boolean) => {
    if (!currentUser) return;

    const inv = invitations.find(i => i.id === invitationId);
    if (!inv) return;

    const updatedInvitations = invitations.map(i => 
      i.id === invitationId ? { ...i, status: (accept ? 'accepted' : 'declined') as any } : i
    );
    setInvitations(updatedInvitations);
    localStorage.setItem('group_invitations_v1', JSON.stringify(updatedInvitations));

    // Sync invitation status to Supabase
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('group_invitations').update({ status: accept ? 'accepted' : 'declined' }).eq('id', invitationId);
      }
    } catch (e) {}

    if (accept) {
      let targetUpdatedGroup: FamilyGroup | null = null;
      const updatedGroups = groups.map(g => {
        if (g.id === inv.groupId) {
          const alreadyMember = g.members?.some(m => m.userId === currentUser.id || m.email?.toLowerCase() === currentUser.email.toLowerCase());
          if (alreadyMember) {
            targetUpdatedGroup = g;
            return g;
          }
          const updated = {
            ...g,
            members: [
              ...(g.members || []),
              {
                userId: currentUser.id,
                email: currentUser.email,
                displayName: currentUser.displayName,
                role: 'member' as const,
                permissions: { planner: true, shopping: true, fitness: true, dates: true },
                joinedAt: new Date().toISOString()
              }
            ]
          };
          targetUpdatedGroup = updated;
          return updated;
        }
        return g;
      });

      setGroups(updatedGroups);
      localStorage.setItem('family_groups_v1', JSON.stringify(updatedGroups));
      setActiveGroupId(inv.groupId);

      // Sync updated group to Supabase
      if (targetUpdatedGroup) {
        try {
          if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            await supabase.from('family_groups').upsert({
              id: (targetUpdatedGroup as FamilyGroup).id,
              name: (targetUpdatedGroup as FamilyGroup).name,
              created_by: (targetUpdatedGroup as FamilyGroup).createdBy,
              created_by_name: (targetUpdatedGroup as FamilyGroup).createdByName,
              members: (targetUpdatedGroup as FamilyGroup).members,
              created_at: (targetUpdatedGroup as FamilyGroup).createdAt
            });
          }
        } catch (e) {}
      }

      alert(`🎉 הצטרפת בהצלחה לקבוצה "${inv.groupName}"!`);
    } else {
      alert(`ההזמנה לקבוצה "${inv.groupName}" נדחתה.`);
    }
  };

  // 🛡️ Remove Group Member (Group Admin or Super Admin only)
  const handleRemoveGroupMember = async (groupId: string, memberUserId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !currentUser) return;

    const isGroupAdmin = group.createdBy === currentUser.id || currentUser.isSuperAdmin;
    if (!isGroupAdmin) {
      alert('רק מנהל הקבוצה או מנהל מערכת רשאים להסיר חברים.');
      return;
    }

    if (group.createdBy === memberUserId) {
      alert('לא ניתן להסיר את יוצר/מנהל הקבוצה.');
      return;
    }

    let updatedTargetGroup: FamilyGroup | null = null;
    const updatedGroups = groups.map(g => {
      if (g.id === groupId) {
        const updated = {
          ...g,
          members: (g.members || []).filter(m => m.userId !== memberUserId)
        };
        updatedTargetGroup = updated;
        return updated;
      }
      return g;
    });

    setGroups(updatedGroups);
    localStorage.setItem('family_groups_v1', JSON.stringify(updatedGroups));

    if (updatedTargetGroup) {
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          await supabase.from('family_groups').upsert({
            id: (updatedTargetGroup as FamilyGroup).id,
            name: (updatedTargetGroup as FamilyGroup).name,
            created_by: (updatedTargetGroup as FamilyGroup).createdBy,
            created_by_name: (updatedTargetGroup as FamilyGroup).createdByName,
            members: (updatedTargetGroup as FamilyGroup).members
          });
        }
      } catch (e) {}
    }
  };

  // 🔐 Update Group Member Permissions (Group Admin or Super Admin)
  const handleUpdateGroupPermissions = async (groupId: string, memberUserId: string, perms: CategoryPermissions) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !currentUser) return;

    const isGroupAdmin = group.createdBy === currentUser.id || currentUser.isSuperAdmin;
    if (!isGroupAdmin) {
      alert('רק מנהל הקבוצה או מנהל מערכת רשאים לעדכן הרשאות.');
      return;
    }

    let updatedTargetGroup: FamilyGroup | null = null;
    const updatedGroups = groups.map(g => {
      if (g.id === groupId) {
        const updated = {
          ...g,
          members: (g.members || []).map(m => m.userId === memberUserId ? { ...m, permissions: perms } : m)
        };
        updatedTargetGroup = updated;
        return updated;
      }
      return g;
    });

    setGroups(updatedGroups);
    localStorage.setItem('family_groups_v1', JSON.stringify(updatedGroups));

    if (updatedTargetGroup) {
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          await supabase.from('family_groups').upsert({
            id: (updatedTargetGroup as FamilyGroup).id,
            name: (updatedTargetGroup as FamilyGroup).name,
            created_by: (updatedTargetGroup as FamilyGroup).createdBy,
            created_by_name: (updatedTargetGroup as FamilyGroup).createdByName,
            members: (updatedTargetGroup as FamilyGroup).members
          });
        }
      } catch (e) {}
    }
  };

  // 🗑️ Delete Group (Creator or Super Admin only)
  const handleDeleteGroup = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !currentUser) return;

    const isGroupAdmin = group.createdBy === currentUser.id || currentUser.isSuperAdmin;
    if (!isGroupAdmin) {
      alert('רק מנהל הקבוצה או מנהל מערכת רשאים למחוק את הקבוצה.');
      return;
    }

    if (!confirm(`האם אתה בטוח שברצונך למחוק את הקבוצה "${group.name}"?`)) return;

    const updatedGroups = groups.filter(g => g.id !== groupId);
    setGroups(updatedGroups);
    localStorage.setItem('family_groups_v1', JSON.stringify(updatedGroups));
    if (activeGroupId === groupId) {
      setActiveGroupId(null);
    }

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from('family_groups').delete().eq('id', groupId);
      }
    } catch (e) {}
  };

  // 🔐 DATA ISOLATION & GROUP SCOPING HELPER
  const isItemVisible = (item: { 
    createdBy?: string; 
    creatorEmail?: string; 
    userId?: string; 
    groupId?: string; 
    isShared?: boolean; 
    is_public?: boolean;
    author_id?: string;
    status?: RecipeModerationStatus;
  }) => {
    // 1. Guest: sees default/starter items and anything created during guest session
    if (!currentUser || currentUser.isGuest) {
      if (currentUser?.isGuest) {
        if (item.createdBy === currentUser.id || item.userId === currentUser.id) return true;
      }
      return !item.createdBy && !item.userId;
    }

    // 2. Super Admin: sees everything (including all pending and public recipes)
    if (currentUser.isSuperAdmin) return true;

    // 3. User's OWN items: always visible to creator (so they can track pending and rejected status)
    const isOwner = Boolean(
      (item.createdBy && item.createdBy === currentUser.id) ||
      (item.userId && item.userId === currentUser.id) ||
      (item.author_id && item.author_id === currentUser.id) ||
      (item.creatorEmail && item.creatorEmail.toLowerCase() === currentUser.email?.toLowerCase())
    );

    if (isOwner) return true;

    // 4. If item is rejected: hidden from everyone except the creator / super admin
    if (item.status === 'rejected') return false;

    // 5. Default / Public starter items (items without creator/group or marked public)
    const isSystemDefault = !item.createdBy && !item.userId && !item.groupId;
    if (isSystemDefault) return true;

    // 6. Public Community Recipes: visible only if approved (or legacy undefined)
    const isPublicRecipe = item.is_public === true || (item as any).isPublic === true;
    if (isPublicRecipe) {
      return item.status === 'approved' || item.status === undefined;
    }

    // 7. Group items (either active group, or any group user is member of):
    const userGroups = groups.filter(g => 
      g.createdBy === currentUser.id ||
      g.members?.some(m => m.userId === currentUser.id || (currentUser.email && m.email?.toLowerCase() === currentUser.email.toLowerCase()))
    );

    const isMemberOfItemGroup = userGroups.some(g => g.id === item.groupId);
    if (isMemberOfItemGroup && item.isShared !== false) {
      const isApprovedForGroup = item.status === 'approved' || item.status === undefined;
      return isApprovedForGroup;
    }

    // 8. Shared items created without a specific group (shared with all family):
    if (item.isShared !== false && !item.groupId) {
      return true;
    }

    // 9. Otherwise: Hidden from this user!
    return false;
  };

  // ⏳ Pending Moderation Recipes (for Super Admin & Group Admins to review)
  const pendingModerationRecipes = useMemo(() => {
    if (!currentUser || currentUser.isGuest) return [];
    return recipes.filter(r => {
      if (currentUser.isSuperAdmin && r.status === 'pending_super_admin') return true;
      if (r.status === 'pending_group_admin' && r.groupId) {
        const grp = groups.find(g => g.id === r.groupId);
        if (grp && (grp.createdBy === currentUser.id || currentUser.isSuperAdmin)) return true;
      }
      return false;
    });
  }, [recipes, currentUser, groups]);

  // 👥 Derived Scoped Collections (Only own items + active group shared items)
  const visibleRecipes = useMemo(() => recipes.filter(isItemVisible), [recipes, currentUser, activeGroup]);
  const visibleMealPlan = useMemo(() => mealPlan.filter(isItemVisible), [mealPlan, currentUser, activeGroup]);
  const visibleWorkouts = useMemo(() => workouts.filter(isItemVisible), [workouts, currentUser, activeGroup]);
  const visibleWorkoutLogs = useMemo(() => workoutLogs.filter(isItemVisible), [workoutLogs, currentUser, activeGroup]);
  const visibleDateSpots = useMemo(() => dateSpots.filter(isItemVisible), [dateSpots, currentUser, activeGroup]);
  const visibleTasks = useMemo(() => tasks.filter(isItemVisible), [tasks, currentUser, activeGroup]);
  const visibleCustomShoppingItems = useMemo(() => customShoppingItems.filter(isItemVisible), [customShoppingItems, currentUser, activeGroup]);
  const visibleSavedLists = useMemo(() => savedLists.filter(isItemVisible), [savedLists, currentUser, activeGroup]);

  // Filtered Recipes (Search & Category on visibleRecipes)
  const filteredRecipes = useMemo(() => {
    return visibleRecipes.filter(recipe => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));

      const mappedCategory = selectedCategory === 'הכל' ? 'All' :
                             selectedCategory === 'בוקר' ? 'Breakfast' :
                             selectedCategory === 'צהריים' ? 'Lunch' :
                             selectedCategory === 'ערב' ? 'Dinner' :
                             selectedCategory === 'קינוח' ? 'Dessert' : selectedCategory;

      const matchesCategory = selectedCategory === 'הכל' || recipe.category === selectedCategory || recipe.category === mappedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [visibleRecipes, searchQuery, selectedCategory]);

  // Compiled Shopping List from planned recipes (Current Selected Week on visibleMealPlan)
  const shoppingList = useMemo(() => {
    const aggregatedMap: { [key: string]: { name: string; unit: string; quantity: number; sources: { recipeTitle: string; count: number }[] } } = {};
    const currentWeekKey = getWeekKey(weekOffset);
    const activeWeekItems = visibleMealPlan.filter(item => (item.weekKey || getWeekKey(0)) === currentWeekKey);

    activeWeekItems.forEach(item => {
      // Extract recipes from multi-item meal subItems OR legacy single recipeId
      const targetRecipeIds: { recipeId: string; courseType?: string }[] = [];
      
      if (item.items && item.items.length > 0) {
        item.items.forEach(sub => {
          if (sub.recipeId) targetRecipeIds.push({ recipeId: sub.recipeId, courseType: sub.courseType });
        });
      } else if (item.recipeId) {
        targetRecipeIds.push({ recipeId: item.recipeId });
      }

      targetRecipeIds.forEach(({ recipeId }) => {
        const recipe = visibleRecipes.find(r => r.id === recipeId);
        if (recipe) {
          recipe.ingredients.forEach(ingredient => {
            const parsed = parseIngredient(ingredient);
            const stdUnit = standardizeUnit(parsed.unit);

            const key = `${parsed.name.toLowerCase().trim()}||${stdUnit}`;

            if (!aggregatedMap[key]) {
              aggregatedMap[key] = {
                name: parsed.name,
                unit: stdUnit,
                quantity: parsed.quantity,
                sources: [{ recipeTitle: recipe.title, count: 1 }]
              };
            } else {
              aggregatedMap[key].quantity += parsed.quantity;

              const existingSourceIdx = aggregatedMap[key].sources.findIndex(s => s.recipeTitle === recipe.title);
              if (existingSourceIdx >= 0) {
                aggregatedMap[key].sources[existingSourceIdx].count += 1;
              } else {
                aggregatedMap[key].sources.push({ recipeTitle: recipe.title, count: 1 });
              }
            }
          });
        }
      });
    });

    return Object.values(aggregatedMap).map(item => {
      const displayUnitStr = getDisplayUnit(item.unit, item.quantity);
      const quantityStr = item.quantity > 0 ? formatNumber(item.quantity) : '';

      const displayName = quantityStr 
        ? `${quantityStr} ${displayUnitStr} ${item.name}`.trim().replace(/\s+/g, ' ') 
        : item.name;

      return {
        name: displayName,
        sources: item.sources
      };
    });
  }, [visibleMealPlan, visibleRecipes, weekOffset]);

  // Categorized Shopping List
  const categorizedShoppingList = useMemo(() => {
    const categories: { 
      [key: string]: { 
        name: string; 
        sources: { recipeTitle: string; count: number }[]; 
        isCustom?: boolean; 
        customId?: string; 
      }[] 
    } = {
      'ירקות ופירות': [],
      'בשר, עוף ודגים': [],
      'מוצרי חלב ומקרר': [],
      'מזווה ותבלינים': [],
      'אחר': []
    };

    shoppingList.forEach(item => {
      const cat = getIngredientCategory(item.name);
      categories[cat].push({
        ...item,
        isCustom: false
      });
    });

    visibleCustomShoppingItems.forEach(item => {
      const cat = categories[item.category] ? item.category : 'אחר';
      categories[cat].push({
        name: item.name,
        sources: [{ recipeTitle: 'הוספה ידנית', count: 1 }],
        isCustom: true,
        customId: item.id
      });
    });

    return categories;
  }, [shoppingList, visibleCustomShoppingItems]);

  // Share Shopping List
  const shareShoppingList = (type: 'whatsapp' | 'copy') => {
    if (shoppingList.length === 0 && visibleCustomShoppingItems.length === 0) return;

    let text = '*🛒 רשימת קניות משפחתית - ביסים משפחתיים:*\n\n';
    const categoriesOrder = ['ירקות ופירות', 'בשר, עוף ודגים', 'מוצרי חלב ומקרר', 'מזווה ותבלינים', 'אחר'];

    categoriesOrder.forEach(category => {
      const items = categorizedShoppingList[category];
      const uncompletedItems = items.filter(item => !checkedIngredients[item.name]);

      if (uncompletedItems.length > 0) {
        const icon = category === 'ירקות ופירות' ? '🥦' :
                     category === 'בשר, עוף ודגים' ? '🥩' :
                     category === 'מוצרי חלב ומקרר' ? '🧀' :
                     category === 'מזווה ותבלינים' ? '🥫' : '🛒';

        text += `*${icon} ${category}:*\n`;
        uncompletedItems.forEach(item => {
          const sourcesStr = item.sources.map(s => s.recipeTitle + (s.count > 1 ? ` x${s.count}` : '')).join(', ');
          text += `  □ ${item.name} (${sourcesStr})\n`;
        });
        text += '\n';
      }
    });

    if (type === 'whatsapp') {
      const encodedText = encodeURIComponent(text);
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    } else {
      navigator.clipboard.writeText(text);
      alert('רשימת הקניות הועתקה ללוח בהצלחה!');
    }
  };

  return {
    syncStatus,
    currentUser,
    registeredUsers,
    enabledTabs,
    handleSaveEnabledTabs,
    handleLogin,
    handleRegister,
    handleVerifyCode,
    handleVerifyAccount,
    handleResendVerificationEmail,
    handleResetPassword,
    handleLogout,
    handleContinueAsGuest,
    handleDeleteUser,
    handleSaveSharingPermissions,
    recipes: visibleRecipes,
    mealPlan: visibleMealPlan,
    customShoppingItems: visibleCustomShoppingItems,
    savedLists: visibleSavedLists,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    checkedIngredients,
    filteredRecipes,
    shoppingList,
    categorizedShoppingList,
    weekOffset,
    setWeekOffset,
    toggleMealCompletion,
    copyPastWeekPlan,
    workouts: visibleWorkouts,
    workoutLogs: visibleWorkoutLogs,
    fitnessGoal,
    dateSpots: visibleDateSpots,
    handleAddDateSpot,
    handleUpdateDateSpot,
    handleDeleteDateSpot,
    handleIncrementVisitCount,
    // 📝 Tasks & Notes
    tasks: visibleTasks,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    handleToggleTaskCompleted,
    handleAssignTaskToPlanner,
    handleAddWorkout,
    handleUpdateWorkout,
    handleDeleteWorkout,
    handleUpdateExerciseWeight,
    handleLogWorkoutCompleted,
    handleAddRecipe,
    handleDeleteRecipe,
    handleUpdateRecipe,
    handleApproveRecipe,
    handleRejectRecipe,
    handleToggleUserPublicPublishPermission,
    handleToggleMemberGroupPublishPermission,
    pendingModerationRecipes,
    handleRateRecipe,
    handleAddComment,
    handleAddReply,
    handleAssignMeal,
    handleDeleteMealPlanItem,
    clearMealPlanner,
    handleAddCustomItem,
    handleDeleteCustomItem,
    handleSaveShoppingList,
    handleDeleteSavedList,
    toggleIngredientCheck,
    shareShoppingList,
    updateMealPlanItemData,
    // 👥 Group Management & Invitations
    groups,
    activeGroup,
    invitations,
    pendingInvitations,
    handleCreateGroup,
    handleSwitchGroup,
    handleInviteToGroup,
    handleRespondInvitation,
    handleRemoveGroupMember,
    handleUpdateGroupPermissions,
    handleDeleteGroup,
    handleCancelInvitation
  };
}

