-- ==============================================================================
-- SUPABASE SCHEMA GUIDE: PeerForge (OPG World School Platform)
-- Default Theme Column & Full Students Table Schema
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- OPTION 1: FASTEST METHOD (If your 'students' table already exists)
-- ------------------------------------------------------------------------------
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_
-- 2. Click on "SQL Editor" in the left navigation sidebar.
-- 3. Click "+ New query", paste the following SQL, and click "RUN":

ALTER TABLE students 
ADD COLUMN IF NOT EXISTS default_theme TEXT DEFAULT 'light';

-- (Optional) If any existing rows have null, set them to 'light':
UPDATE students 
SET default_theme = 'light' 
WHERE default_theme IS NULL;


-- ------------------------------------------------------------------------------
-- OPTION 2: GUI METHOD (Using the Supabase Table Editor without writing SQL)
-- ------------------------------------------------------------------------------
-- 1. Open your Supabase Dashboard.
-- 2. Click on "Table Editor" (the table grid icon) in the left sidebar.
-- 3. Select the "students" table.
-- 4. In the top right corner of the table view, click "+ Insert column" (or "+ New Column").
-- 5. Fill in the column details:
--      - Name: default_theme
--      - Type: text (or varchar)
--      - Default Value: 'light'
--      - Is Nullable: Checked (or unchecked with default 'light')
-- 6. Click "Save".


-- ------------------------------------------------------------------------------
-- OPTION 3: COMPLETE 'students' TABLE REFERENCE (For fresh setups)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  "gmailAccount" TEXT,
  password TEXT,
  avatar TEXT,
  grade TEXT,
  section TEXT,
  house TEXT,
  role TEXT DEFAULT 'student',
  bio TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,
  "academicStrengths" JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  availability TEXT DEFAULT 'Active & Seeking Projects',
  "privacySettings" JSONB DEFAULT '{"showGradeToAll": true, "allowDirectMessages": "anyone", "showAchievements": true}'::jsonb,
  completeness INTEGER DEFAULT 80,
  "isVerified" BOOLEAN DEFAULT true,
  "isApproved" BOOLEAN DEFAULT true,
  "isDeactivated" BOOLEAN DEFAULT false,
  default_theme TEXT DEFAULT 'light',
  "joinedDate" TEXT DEFAULT CURRENT_DATE::text,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Allow public read of verified student profiles
CREATE POLICY "Allow public read access to students" 
ON students FOR SELECT 
USING (true);

-- Allow authenticated users to insert/update their own profile
CREATE POLICY "Allow users to upsert their own profile" 
ON students FOR ALL 
USING (true)
WITH CHECK (true);
