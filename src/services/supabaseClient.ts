import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentProfile, RequestTicket, HelpOffer } from '../types';
import { INITIAL_PROFILES, INITIAL_REQUESTS } from './seedData';

// Local storage keys
const STORAGE_KEY_PROFILES = 'peerforge_profiles_v1';
const STORAGE_KEY_REQUESTS = 'peerforge_requests_v1';
const STORAGE_KEY_SUPABASE_CONFIG = 'peerforge_supabase_creds';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}

// Default fallback or env values
const DEFAULT_SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const DEFAULT_SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export function getStoredSupabaseConfig(): SupabaseConfig {
  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
    isCustom: false
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  // Configuration is locked to root environment variables
}

let supabaseInstance: SupabaseClient | null = null;
let isConnectedToLiveSupabase = false;

export function initSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (config.url && config.anonKey && config.url.startsWith('https://')) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      isConnectedToLiveSupabase = true;
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize live Supabase client, falling back to managed offline store:', err);
      supabaseInstance = null;
      isConnectedToLiveSupabase = false;
    }
  } else {
    supabaseInstance = null;
    isConnectedToLiveSupabase = false;
  }
  return null;
}

// Initial setup
initSupabaseClient();

export function getSupabase(): SupabaseClient | null {
  return supabaseInstance;
}

export function isLiveSupabaseActive(): boolean {
  return isConnectedToLiveSupabase && !!supabaseInstance;
}

/* =====================================================================
   DATA REPOSITORY API (Graceful live Supabase with fallback engine)
===================================================================== */

export async function fetchAllProfiles(): Promise<StudentProfile[]> {
  // Read local storage and strictly filter out any mock/sample profiles
  const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
  let localRealProfiles: StudentProfile[] = [];
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        localRealProfiles = parsed.filter((p) => p && p.isRealRegistration === true);
      }
    } catch {
      localRealProfiles = [];
    }
  }
  // Keep local storage strictly real
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(localRealProfiles));

  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      const { data, error } = await supabaseInstance
        .from('profiles')
        .select('*')
        .order('joinedDate', { ascending: false });

      if (!error && data && data.length > 0) {
        const realFromDb = (data as StudentProfile[]).filter((p) => p && p.isRealRegistration === true);
        const combined = [...realFromDb];
        for (const lp of localRealProfiles) {
          if (!combined.some((cp) => cp.id === lp.id)) {
            combined.push(lp);
          }
        }
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(combined));
        return combined;
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local dataset', err);
    }
  }

  return localRealProfiles;
}

export async function saveProfile(profile: StudentProfile): Promise<StudentProfile> {
  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      const { error } = await supabaseInstance
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });
      if (error) console.warn('Supabase upsert profile warning:', error.message);
    } catch (err) {
      console.warn('Supabase upsert error:', err);
    }
  }

  // Always update local cache for instant UI responsiveness
  const profiles = await fetchAllProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  let updated: StudentProfile[];
  if (index >= 0) {
    updated = [...profiles];
    updated[index] = profile;
  } else {
    updated = [profile, ...profiles];
  }
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(updated));
  return profile;
}

export async function deleteProfile(profileId: string): Promise<boolean> {
  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      const { error } = await supabaseInstance
        .from('profiles')
        .delete()
        .eq('id', profileId);
      if (error) console.warn('Supabase delete profile warning:', error.message);
    } catch (err) {
      console.warn('Supabase delete profile error:', err);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((p) => p && p.id !== profileId);
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn('Local storage profiles parse error during delete:', e);
    }
  }
  return true;
}

export async function endorseSkill(profileId: string, skillId: string): Promise<StudentProfile | null> {
  const profiles = await fetchAllProfiles();
  const target = profiles.find((p) => p.id === profileId);
  if (!target) return null;

  const updatedSkills = target.skills.map((s) => {
    if (s.id === skillId) {
      return { ...s, endorsementsCount: s.endorsementsCount + 1 };
    }
    return s;
  });

  const updatedProfile: StudentProfile = {
    ...target,
    skills: updatedSkills
  };

  return saveProfile(updatedProfile);
}

export async function fetchAllRequests(): Promise<RequestTicket[]> {
  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      const { data, error } = await supabaseInstance
        .from('requests')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as RequestTicket[];
      }
    } catch (err) {
      console.warn('Supabase requests query failed, falling back to local', err);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Return only user created requests (non-mock)
        const realOnly = parsed.filter((r) => r && r.id && !r.isMock);
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(realOnly));
        return realOnly;
      }
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify([]));
  return [];
}

export async function createRequestTicket(ticket: Omit<RequestTicket, 'id' | 'createdAt' | 'offers'>): Promise<RequestTicket> {
  const newTicket: RequestTicket = {
    ...ticket,
    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
    offers: []
  };

  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      const { error } = await supabaseInstance.from('requests').insert([newTicket]);
      if (error) console.warn('Supabase insert request error:', error.message);
    } catch (err) {
      console.warn('Supabase request insert error:', err);
    }
  }

  const requests = await fetchAllRequests();
  const updated = [newTicket, ...requests];
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));
  return newTicket;
}

export async function addOfferToRequest(requestId: string, offer: Omit<HelpOffer, 'id' | 'createdAt'>): Promise<RequestTicket | null> {
  const requests = await fetchAllRequests();
  const target = requests.find((r) => r.id === requestId);
  if (!target) return null;

  const newOffer: HelpOffer = {
    ...offer,
    id: `off-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  const updatedTicket: RequestTicket = {
    ...target,
    status: target.status === 'Open' ? 'In Progress' : target.status,
    offers: [...target.offers, newOffer]
  };

  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      await supabaseInstance.from('requests').update(updatedTicket).eq('id', requestId);
    } catch (err) {
      console.warn('Supabase update offer error:', err);
    }
  }

  const updatedList = requests.map((r) => (r.id === requestId ? updatedTicket : r));
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedList));
  return updatedTicket;
}

export async function updateRequestStatus(requestId: string, status: 'Open' | 'In Progress' | 'Resolved'): Promise<RequestTicket | null> {
  const requests = await fetchAllRequests();
  const target = requests.find((r) => r.id === requestId);
  if (!target) return null;

  const updatedTicket: RequestTicket = {
    ...target,
    status
  };

  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      await supabaseInstance.from('requests').update({ status }).eq('id', requestId);
    } catch (err) {
      console.warn('Supabase update status error:', err);
    }
  }

  const updatedList = requests.map((r) => (r.id === requestId ? updatedTicket : r));
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedList));
  return updatedTicket;
}


/* =====================================================================
   NOTIFICATIONS & DIRECT MESSAGING ENGINE
===================================================================== */
const STORAGE_KEY_NOTIFICATIONS = 'peerforge_notifications_v1';
const STORAGE_KEY_MESSAGES = 'peerforge_messages_v1';

import { AppNotification, DirectMessage } from '../types';

export async function fetchNotifications(recipientId: string): Promise<AppNotification[]> {
  const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  if (!stored) return [];
  try {
    const all: AppNotification[] = JSON.parse(stored);
    return all
      .filter((n) => n.recipientId === recipientId || n.recipientId === 'all')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function addNotification(
  notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
): Promise<AppNotification> {
  const newNotif: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    read: false,
    createdAt: new Date().toISOString()
  };

  const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  let all: AppNotification[] = [];
  if (stored) {
    try {
      all = JSON.parse(stored);
    } catch {
      all = [];
    }
  }

  const updated = [newNotif, ...all];
  localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));

  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      await supabaseInstance.from('notifications').insert([newNotif]);
    } catch (e) {
      console.warn('Supabase notification insert warning:', e);
    }
  }

  return newNotif;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  if (!stored) return;
  try {
    const all: AppNotification[] = JSON.parse(stored);
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
  } catch {}
}

export async function markAllNotificationsAsRead(recipientId: string): Promise<void> {
  const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  if (!stored) return;
  try {
    const all: AppNotification[] = JSON.parse(stored);
    const updated = all.map((n) =>
      n.recipientId === recipientId || n.recipientId === 'all' ? { ...n, read: true } : n
    );
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
  } catch {}
}

export async function fetchDirectMessages(user1Id: string, user2Id: string): Promise<DirectMessage[]> {
  const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
  if (!stored) return [];
  try {
    const all: DirectMessage[] = JSON.parse(stored);
    return all
      .filter(
        (m) =>
          (m.senderId === user1Id && m.recipientId === user2Id) ||
          (m.senderId === user2Id && m.recipientId === user1Id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function fetchUserConversations(userId: string): Promise<DirectMessage[]> {
  const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
  if (!stored) return [];
  try {
    const all: DirectMessage[] = JSON.parse(stored);
    return all
      .filter((m) => m.senderId === userId || m.recipientId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function sendDirectMessage(
  msg: Omit<DirectMessage, 'id' | 'createdAt' | 'read'>
): Promise<DirectMessage> {
  const newMsg: DirectMessage = {
    ...msg,
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    read: false,
    createdAt: new Date().toISOString()
  };

  const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
  let all: DirectMessage[] = [];
  if (stored) {
    try {
      all = JSON.parse(stored);
    } catch {
      all = [];
    }
  }

  const updated = [...all, newMsg];
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));

  // Also trigger a notification for the recipient!
  await addNotification({
    recipientId: msg.recipientId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderAvatar: msg.senderAvatar,
    title: `Direct Message from ${msg.senderName}`,
    message: msg.content.length > 60 ? `${msg.content.substring(0, 60)}...` : msg.content,
    type: 'message',
    targetId: msg.senderId
  });

  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      await supabaseInstance.from('direct_messages').insert([newMsg]);
    } catch (e) {
      console.warn('Supabase direct message insert warning:', e);
    }
  }

  return newMsg;
}

export function resetDemoData(): void {
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(INITIAL_PROFILES));
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(INITIAL_REQUESTS));
}

export async function clearMockProfiles(): Promise<StudentProfile[]> {
  const all = await fetchAllProfiles();
  const realOnly = all.filter((p) => p.isRealRegistration);
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(realOnly));
  return realOnly;
}

export async function restoreSeedProfiles(): Promise<StudentProfile[]> {
  const current = await fetchAllProfiles();
  const realOnly = current.filter((p) => p.isRealRegistration);
  const combined = [...realOnly, ...INITIAL_PROFILES.filter((s) => !realOnly.some((r) => r.id === s.id))];
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(combined));
  return combined;
}


// SQL Schema for users/admins wanting to run it in Supabase SQL editor
export const SUPABASE_SQL_SCHEMA = `-- ============================================================
-- PEERFORGE: School Talent Directory & Matching Database Schema
-- Run this in your Supabase Project SQL Editor
-- ============================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  fullName TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  avatarUrl TEXT,
  grade TEXT NOT NULL,
  department TEXT NOT NULL,
  bio TEXT,
  gpaHonorRoll BOOLEAN DEFAULT true,
  isPeerTutorCertified BOOLEAN DEFAULT false,
  availability TEXT DEFAULT 'Available Now',
  enrolledClasses JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  tutoringSubjects JSONB DEFAULT '[]'::jsonb,
  seekingHelpWith JSONB DEFAULT '[]'::jsonb,
  contactMethods JSONB DEFAULT '{}'::jsonb,
  totalSessionsCompleted INT DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  joinedDate TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Help Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
  id TEXT PRIMARY KEY,
  creatorId TEXT NOT NULL,
  creatorName TEXT NOT NULL,
  creatorAvatar TEXT,
  creatorGrade TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subject TEXT NOT NULL,
  department TEXT NOT NULL,
  urgency TEXT NOT NULL,
  status TEXT DEFAULT 'Open',
  preferredLocation TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  offers JSONB DEFAULT '[]'::jsonb,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated and anonymous school members
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read requests" ON public.requests FOR SELECT USING (true);

-- Allow inserting and updating
CREATE POLICY "Allow upsert profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow upsert requests" ON public.requests FOR ALL USING (true);
`;
