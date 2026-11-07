-- ==============================================================================
-- PEERFORGE (OPG WORLD SCHOOL PLATFORM) - MASTER SUPABASE / POSTGRESQL SCHEMA
-- Version: 3.0 (Production Verified)
-- ==============================================================================
-- This file defines ALL 12 tables, columns, indexes, Row Level Security (RLS)
-- policies, and Realtime publications required by PeerForge.
--
-- HOW TO USE:
-- 1. Open your Supabase Project: https://supabase.com/dashboard/project/_
-- 2. Click "SQL Editor" in the left sidebar.
-- 3. Click "+ New Query", paste this entire file, and click "RUN".
-- 
-- Safe for both FRESH databases and EXISTING databases (uses IF NOT EXISTS).
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. STUDENTS TABLE
-- ==============================================================================
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
  is_approved BOOLEAN DEFAULT true,
  "isDeactivated" BOOLEAN DEFAULT false,
  is_deactivated BOOLEAN DEFAULT false,
  default_theme TEXT DEFAULT 'light',
  "defaultTheme" TEXT DEFAULT 'light',
  "joinedDate" TEXT DEFAULT CURRENT_DATE::text,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist for existing tables
ALTER TABLE students ADD COLUMN IF NOT EXISTS "gmailAccount" TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS house TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE students ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "academicStrengths" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Active & Seeking Projects';
ALTER TABLE students ADD COLUMN IF NOT EXISTS "privacySettings" JSONB DEFAULT '{"showGradeToAll": true, "allowDirectMessages": "anyone", "showAchievements": true}'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS completeness INTEGER DEFAULT 80;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT true;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT true;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "isDeactivated" BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_deactivated BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS default_theme TEXT DEFAULT 'light';
ALTER TABLE students ADD COLUMN IF NOT EXISTS "defaultTheme" TEXT DEFAULT 'light';
ALTER TABLE students ADD COLUMN IF NOT EXISTS "joinedDate" TEXT DEFAULT CURRENT_DATE::text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_students_email ON students (email);
CREATE INDEX IF NOT EXISTS idx_students_role ON students (role);

-- ==============================================================================
-- 2. PROJECTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "ownerName" TEXT NOT NULL,
  "ownerGrade" TEXT,
  "ownerAvatar" TEXT,
  "teamSize" INTEGER DEFAULT 3,
  deadline TEXT,
  status TEXT DEFAULT 'recruiting',
  "requiredSkills" JSONB DEFAULT '[]'::jsonb,
  "openRoles" JSONB DEFAULT '[]'::jsonb,
  members JSONB DEFAULT '[]'::jsonb,
  applications JSONB DEFAULT '[]'::jsonb,
  tasks JSONB DEFAULT '[]'::jsonb,
  updates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS "ownerId" TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "ownerName" TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "ownerGrade" TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "ownerAvatar" TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "teamSize" INTEGER DEFAULT 3;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'recruiting';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "requiredSkills" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "openRoles" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS applications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects ("ownerId");
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);

-- ==============================================================================
-- 3. QUESTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  "authorId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "authorGrade" TEXT,
  "authorAvatar" TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  topic TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  "createdAt" TEXT DEFAULT 'Just now',
  upvotes INTEGER DEFAULT 0,
  "upvotedBy" JSONB DEFAULT '[]'::jsonb,
  "answersCount" INTEGER DEFAULT 0,
  "acceptedAnswerId" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE questions ADD COLUMN IF NOT EXISTS "authorId" TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS "authorName" TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS "authorGrade" TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS "authorAvatar" TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS "createdAt" TEXT DEFAULT 'Just now';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS "upvotedBy" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS "answersCount" INTEGER DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS "acceptedAnswerId" TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_questions_author ON questions ("authorId");
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions (topic);

-- ==============================================================================
-- 4. ANSWERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  "questionId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "authorGrade" TEXT,
  "authorAvatar" TEXT,
  body TEXT NOT NULL,
  "createdAt" TEXT DEFAULT 'Just now',
  upvotes INTEGER DEFAULT 0,
  "upvotedBy" JSONB DEFAULT '[]'::jsonb,
  "isAccepted" BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE answers ADD COLUMN IF NOT EXISTS "questionId" TEXT;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS "authorId" TEXT;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS "authorName" TEXT;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS "authorGrade" TEXT;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS "authorAvatar" TEXT;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS "createdAt" TEXT DEFAULT 'Just now';
ALTER TABLE answers ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS "upvotedBy" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS "isAccepted" BOOLEAN DEFAULT false;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE answers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_answers_question ON answers ("questionId");
CREATE INDEX IF NOT EXISTS idx_answers_author ON answers ("authorId");

-- ==============================================================================
-- 5. EVENTS TABLE
-- ==============================================================================
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
  "registeredUserIds" JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Official Announcement';
ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS "isOfficial" BOOLEAN DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS "rsvpCount" INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS "isRsvpd" BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS "linkText" TEXT DEFAULT 'RSVP Now';
ALTER TABLE events ADD COLUMN IF NOT EXISTS "registeredUserIds" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_events_date ON events (date);

-- ==============================================================================
-- 6. EVENT REGISTRATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  "eventId" TEXT,
  user_id TEXT NOT NULL,
  "userId" TEXT,
  user_name TEXT,
  "userName" TEXT,
  user_email TEXT,
  "userEmail" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS event_id TEXT;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS "eventId" TEXT;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS "userName" TEXT;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS "userEmail" TEXT;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Sync camelCase & snake_case columns
UPDATE event_registrations SET "eventId" = event_id WHERE "eventId" IS NULL AND event_id IS NOT NULL;
UPDATE event_registrations SET event_id = "eventId" WHERE event_id IS NULL AND "eventId" IS NOT NULL;
UPDATE event_registrations SET "userId" = user_id WHERE "userId" IS NULL AND user_id IS NOT NULL;
UPDATE event_registrations SET user_id = "userId" WHERE user_id IS NULL AND "userId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_reg_event ON event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_user ON event_registrations (user_id);

-- ==============================================================================
-- 7. NOTIFICATIONS TABLE (Targeted & Role-Based)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  user_id TEXT,
  type TEXT DEFAULT 'system',
  title TEXT NOT NULL,
  description TEXT,
  read BOOLEAN DEFAULT false,
  timestamp TEXT DEFAULT 'Just now',
  "actionTab" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'system';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS timestamp TEXT DEFAULT 'Just now';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "actionTab" TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Sync camelCase & snake_case columns
UPDATE notifications SET "userId" = user_id WHERE "userId" IS NULL AND user_id IS NOT NULL;
UPDATE notifications SET user_id = "userId" WHERE user_id IS NULL AND "userId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_target ON notifications ("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (read);

-- ==============================================================================
-- 8. CONVERSATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  name TEXT,
  "isGroup" BOOLEAN DEFAULT false,
  "participantIds" JSONB DEFAULT '[]'::jsonb,
  "lastMessage" JSONB,
  "updatedAt" TEXT DEFAULT 'Just now',
  "projectId" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS "isGroup" BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS "participantIds" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS "lastMessage" JSONB;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS "updatedAt" TEXT DEFAULT 'Just now';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS "projectId" TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- 9. MESSAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "senderAvatar" TEXT,
  text TEXT NOT NULL,
  timestamp TEXT DEFAULT 'Just now',
  reactions JSONB DEFAULT '{}'::jsonb,
  "replyTo" JSONB,
  "readBy" JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS "conversationId" TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "senderId" TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "senderName" TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "senderAvatar" TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS timestamp TEXT DEFAULT 'Just now';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "replyTo" JSONB;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "readBy" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages ("conversationId");
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages ("senderId");

-- ==============================================================================
-- 10. REPORTS TABLE (Moderation)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  "reporterId" TEXT NOT NULL,
  "reportedUserId" TEXT NOT NULL,
  "reportedUserName" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  timestamp TEXT DEFAULT 'Just now',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ADD COLUMN IF NOT EXISTS "reporterId" TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS "reportedUserId" TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS "reportedUserName" TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS "targetType" TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS "targetId" TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS timestamp TEXT DEFAULT 'Just now';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);

-- ==============================================================================
-- 11. CONTACT INQUIRIES TABLE (Developer Support Tickets)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id TEXT PRIMARY KEY,
  "userId" TEXT,
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  "submittedAt" TEXT DEFAULT 'Just now',
  status TEXT DEFAULT 'new',
  "developerNotes" TEXT,
  "assignedDeveloper" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS "submittedAt" TEXT DEFAULT 'Just now';
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS "developerNotes" TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS "assignedDeveloper" TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE contact_inquiries SET "userId" = user_id WHERE "userId" IS NULL AND user_id IS NOT NULL;
UPDATE contact_inquiries SET user_id = "userId" WHERE user_id IS NULL AND "userId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON contact_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_user ON contact_inquiries ("userId");

-- ==============================================================================
-- 12. UPLOADED FILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS uploaded_files (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  size BIGINT DEFAULT 0,
  "mimeType" TEXT,
  url TEXT NOT NULL,
  "uploadedAt" TEXT DEFAULT 'Just now',
  "uploadedBy" JSONB NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  "projectId" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS filename TEXT;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS "originalName" TEXT;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS size BIGINT DEFAULT 0;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS "uploadedAt" TEXT DEFAULT 'Just now';
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS "uploadedBy" JSONB;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS "projectId" TEXT;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_uploaded_files_category ON uploaded_files (category);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_project ON uploaded_files ("projectId");

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - PERMISSIVE FOR PEER WORKFLOWS
-- ==============================================================================
DO $$ 
DECLARE 
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'students', 
    'projects', 
    'questions', 
    'answers', 
    'events', 
    'event_registrations', 
    'notifications', 
    'conversations', 
    'messages', 
    'reports', 
    'contact_inquiries', 
    'uploaded_files'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    
    -- Drop old policies to avoid duplicates
    EXECUTE format('DROP POLICY IF EXISTS "Public select on %1$s" ON %1$I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public insert on %1$s" ON %1$I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public update on %1$s" ON %1$I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public delete on %1$s" ON %1$I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated on %1$s" ON %1$I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public read access to %1$s" ON %1$I;', tbl);

    -- Create universal safe access policies
    EXECUTE format('CREATE POLICY "Allow public read access to %1$s" ON %1$I FOR SELECT USING (true);', tbl);
    EXECUTE format('CREATE POLICY "Allow public insert to %1$s" ON %1$I FOR INSERT WITH CHECK (true);', tbl);
    EXECUTE format('CREATE POLICY "Allow public update to %1$s" ON %1$I FOR UPDATE USING (true) WITH CHECK (true);', tbl);
    EXECUTE format('CREATE POLICY "Allow public delete to %1$s" ON %1$I FOR DELETE USING (true);', tbl);
  END LOOP;
END $$;

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
-- Add all 12 tables to Supabase Realtime publication so multi-device UI updates instantly
DO $$ 
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'students', 
    'projects', 
    'questions', 
    'answers', 
    'events', 
    'event_registrations', 
    'notifications', 
    'conversations', 
    'messages', 
    'reports', 
    'contact_inquiries', 
    'uploaded_files'
  ];
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH tbl IN ARRAY tables LOOP
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = tbl
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I;', tbl);
      END IF;
    END LOOP;
  END IF;
END $$;

-- ==============================================================================
-- SCHEMA COMPLETED SUCCESSFULLY
-- ==============================================================================
