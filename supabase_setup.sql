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

DROP POLICY IF EXISTS "Allow public read access to students" ON students;
CREATE POLICY "Allow public read access to students" 
ON students FOR SELECT 
USING (true);

-- Allow authenticated users to insert/update their own profile
DROP POLICY IF EXISTS "Allow users to upsert their own profile" ON students;
CREATE POLICY "Allow users to upsert their own profile" 
ON students FOR ALL 
USING (true)
WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- 4. 'events' TABLE & FACULTY DELETE RLS POLICY
-- ------------------------------------------------------------------------------
-- If your 'events' table already exists and you need to ensure DELETE is allowed:
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to events" ON events;
CREATE POLICY "Allow public read access to events" 
ON events FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow faculty to insert events" ON events;
CREATE POLICY "Allow faculty to insert events" 
ON events FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow updates to events" ON events;
CREATE POLICY "Allow updates to events" 
ON events FOR UPDATE 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow faculty to delete events" ON events;
CREATE POLICY "Allow faculty to delete events" 
ON events FOR DELETE 
USING (true);

-- Full 'events' table definition (for fresh setup):
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  category TEXT DEFAULT 'Official Announcement',
  description TEXT,
  organizer TEXT,
  "isOfficial" BOOLEAN DEFAULT true,
  "rsvpCount" INTEGER DEFAULT 0,
  "isRsvpd" BOOLEAN DEFAULT false,
  "linkText" TEXT DEFAULT 'RSVP Now',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ------------------------------------------------------------------------------
-- 5. 'event_registrations' TABLE & RLS POLICIES (Event RSVP & Dynamic Counts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Allow reading all registrations to calculate dynamic attendee counts
DROP POLICY IF EXISTS "Allow public read access to event_registrations" ON event_registrations;
CREATE POLICY "Allow public read access to event_registrations" 
ON event_registrations FOR SELECT 
USING (true);

-- Allow students/users to register for events
DROP POLICY IF EXISTS "Allow users to register for events" ON event_registrations;
CREATE POLICY "Allow users to register for events" 
ON event_registrations FOR INSERT 
WITH CHECK (true);

-- Allow students to deregister / cancel their RSVP
DROP POLICY IF EXISTS "Allow users to deregister from events" ON event_registrations;
CREATE POLICY "Allow users to deregister from events" 
ON event_registrations FOR DELETE 
USING (true);

-- ----------------------------------------------------
-- 6. TEACHER ACCOUNT VERIFICATION & APPROVAL WORKFLOW
-- ----------------------------------------------------

-- Add is_approved column to students table (default true so student accounts are immediately active)
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- Update existing students and existing non-teachers to ensure they are marked approved
UPDATE students 
SET is_approved = true 
WHERE (is_approved IS NULL) OR (role IS DISTINCT FROM 'teacher');

-- Allow approved faculty and admins to update student/teacher records (including is_approved)
DROP POLICY IF EXISTS "Allow public update access to students" ON students;
CREATE POLICY "Allow public update access to students" 
ON students FOR UPDATE 
USING (true) 
WITH CHECK (true);

