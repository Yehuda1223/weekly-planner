-- ==============================================================================
-- 👨‍🍳 Weekly Planner & Lifestyle Hub (תכנון שבועי)
-- Supabase PostgreSQL Database Schema & Real-Time Sync Tables
-- ==============================================================================

-- 1. Profiles Table (Users & Authentication)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'user',
  is_super_admin BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT true,
  verification_code TEXT,
  can_publish_public BOOLEAN DEFAULT false,
  active_group_id TEXT,
  joined_group_ids TEXT[],
  shared_permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Recipes Table
CREATE TABLE IF NOT EXISTS public.recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] DEFAULT '{}',
  instructions TEXT,
  category TEXT DEFAULT 'ערב',
  prep_time TEXT DEFAULT '20 דק׳',
  image_url TEXT,
  image_gradient TEXT,
  is_public BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT true,
  group_id TEXT,
  created_by TEXT,
  creator_name TEXT,
  creator_email TEXT,
  status TEXT DEFAULT 'approved',
  rejection_reason TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  ratings JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Meal Planner Table
CREATE TABLE IF NOT EXISTS public.meal_planner (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  meal TEXT NOT NULL,
  recipe_id TEXT,
  custom_name TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  week_offset INTEGER DEFAULT 0,
  week_key TEXT,
  completed BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT true,
  group_id TEXT,
  user_id TEXT,
  day_notes TEXT,
  day_photos TEXT[],
  day_exercise_overrides JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Family Groups Table
CREATE TABLE IF NOT EXISTS public.family_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_by_name TEXT,
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Group Invitations Table
CREATE TABLE IF NOT EXISTS public.group_invitations (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  invited_by_user_id TEXT,
  invited_by_name TEXT,
  invited_user_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Workouts Table
CREATE TABLE IF NOT EXISTS public.workouts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  split_group TEXT DEFAULT 'אימון A',
  type TEXT DEFAULT 'strength',
  target_muscle_groups TEXT[] DEFAULT '{}',
  notes TEXT,
  exercises JSONB DEFAULT '[]'::jsonb,
  is_shared BOOLEAN DEFAULT true,
  group_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Date Spots Table
CREATE TABLE IF NOT EXISTS public.date_spots (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'מסעדות וברים',
  address TEXT,
  waze_url TEXT,
  rating INTEGER DEFAULT 5,
  visit_count INTEGER DEFAULT 1,
  notes TEXT,
  image_url TEXT,
  is_shared BOOLEAN DEFAULT true,
  group_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Tasks & Notes Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  item_type TEXT DEFAULT 'task',
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'כללי',
  priority TEXT DEFAULT 'medium',
  completed BOOLEAN DEFAULT false,
  due_date TEXT,
  due_time TEXT,
  assigned_day TEXT,
  assigned_meal TEXT,
  note_color TEXT DEFAULT 'yellow',
  is_shared BOOLEAN DEFAULT true,
  group_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 🚀 Enable Realtime on all tables
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_planner;
ALTER PUBLICATION supabase_realtime ADD TABLE public.family_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workouts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.date_spots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- ==============================================================================
-- 🔒 Enable Public / Anon Access for Full Sync
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_planner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for all" ON public.recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for all" ON public.meal_planner FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for all" ON public.family_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for all" ON public.group_invitations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for all" ON public.workouts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for all" ON public.date_spots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for all" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
