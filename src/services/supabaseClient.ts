import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentProfile, RequestTicket, HelpOffer, AppNotification, DirectMessage } from '../types';
import { INITIAL_PROFILES, INITIAL_REQUESTS } from './seedData';

// Local storage keys
const STORAGE_KEY_PROFILES = 'peerforge_profiles_v1';
const STORAGE_KEY_REQUESTS = 'peerforge_requests_v1';
const STORAGE_KEY_NOTIFICATIONS = 'peerforge_notifications_v1';
const STORAGE_KEY_MESSAGES = 'peerforge_messages_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://hgwmksnszoeqztqvvzkg.supabase.co',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
    isCustom: false
  };
}

export function saveSupabaseConfig(_url: string, _anonKey: string): void {
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
      console.warn('Failed to initialize live Supabase client, using live API backend:', err);
      supabaseInstance = null;
      isConnectedToLiveSupabase = false;
    }
  } else {
    supabaseInstance = null;
    isConnectedToLiveSupabase = false;
  }
  return null;
}

initSupabaseClient();

export function getSupabase(): SupabaseClient | null {
  return supabaseInstance;
}

export function isLiveSupabaseActive(): boolean {
  return isConnectedToLiveSupabase && !!supabaseInstance;
}

/* =====================================================================
   DATA REPOSITORY API (Live Cross-Device Server API + Supabase Mirror)
===================================================================== */

export async function fetchAllProfiles(): Promise<StudentProfile[]> {
  // 1. Try server API first (centralized cross-device database)
  try {
    const res = await fetch('/api/profiles');
    if (res.ok) {
      const serverProfiles: StudentProfile[] = await res.json();
      if (Array.isArray(serverProfiles)) {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(serverProfiles));
        return serverProfiles;
      }
    }
  } catch (err) {
    // network fallback
  }

  // 2. Try Supabase if live
  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      const { data, error } = await supabaseInstance
        .from('profiles')
        .select('*')
        .order('joinedDate', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(data));
        return data as StudentProfile[];
      }
    } catch (err) {
      console.warn('Supabase query fallback', err);
    }
  }

  // 3. Fallback to local cache
  const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((p) => p && p.isRealRegistration === true);
      }
    } catch {}
  }

  return [];
}

export async function saveProfile(profile: StudentProfile): Promise<StudentProfile> {
  // 1. Send to server API for live cross-device sync
  try {
    await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
  } catch (err) {
    console.warn('Server saveProfile error:', err);
  }

  // 2. Mirror to Supabase if live
  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      await supabaseInstance
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase upsert error:', err);
    }
  }

  // 3. Update local cache
  const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
  let localList: StudentProfile[] = [];
  if (stored) {
    try {
      localList = JSON.parse(stored);
    } catch {}
  }
  const index = localList.findIndex((p) => p.id === profile.id);
  const updated = index >= 0
    ? localList.map((p, i) => (i === index ? profile : p))
    : [profile, ...localList];
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(updated));

  return profile;
}

export async function deleteProfile(profileId: string): Promise<boolean> {
  // 1. Delete on server
  try {
    await fetch(`/api/profiles/${encodeURIComponent(profileId)}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Server deleteProfile error:', err);
  }

  // 2. Delete on Supabase if live
  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      await supabaseInstance
        .from('profiles')
        .delete()
        .eq('id', profileId);
    } catch (err) {
      console.warn('Supabase delete profile error:', err);
    }
  }

  // 3. Remove from local cache
  const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
  if (stored) {
    try {
      const parsed: StudentProfile[] = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((p) => p && p.id !== profileId);
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(filtered));
      }
    } catch {}
  }
  return true;
}

export async function endorseSkill(profileId: string, skillId: string): Promise<StudentProfile | null> {
  // 1. Send to server
  try {
    const res = await fetch(`/api/profiles/${encodeURIComponent(profileId)}/endorse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillId })
    });
    if (res.ok) {
      const updatedProfile = await res.json();
      return updatedProfile;
    }
  } catch {}

  // 2. Local fallback
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
  // 1. Server API
  try {
    const res = await fetch('/api/requests');
    if (res.ok) {
      const data: RequestTicket[] = await res.json();
      if (Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(data));
        return data;
      }
    }
  } catch {}

  // 2. Supabase if live
  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      const { data, error } = await supabaseInstance
        .from('requests')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!error && data && data.length > 0) {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(data));
        return data as RequestTicket[];
      }
    } catch {}
  }

  // 3. Local storage fallback
  const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((r) => r && r.id && !r.isMock);
      }
    } catch {}
  }
  return [];
}

export async function createRequestTicket(ticket: Omit<RequestTicket, 'id' | 'createdAt' | 'offers'>): Promise<RequestTicket> {
  const newTicket: RequestTicket = {
    ...ticket,
    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
    offers: []
  };

  // 1. Server API
  try {
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicket)
    });
  } catch (err) {
    console.warn('Server createRequestTicket error:', err);
  }

  // 2. Supabase mirror
  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      await supabaseInstance.from('requests').insert([newTicket]);
    } catch {}
  }

  // 3. Local cache
  const requests = await fetchAllRequests();
  const updated = [newTicket, ...requests];
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));
  return newTicket;
}

export async function addOfferToRequest(requestId: string, offer: Omit<HelpOffer, 'id' | 'createdAt'>): Promise<RequestTicket | null> {
  const newOffer: HelpOffer = {
    ...offer,
    id: `off-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  // 1. Server API
  try {
    const res = await fetch(`/api/requests/${encodeURIComponent(requestId)}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOffer)
    });
    if (res.ok) {
      const updated = await res.json();
      return updated;
    }
  } catch {}

  // 2. Fallback
  const requests = await fetchAllRequests();
  const target = requests.find((r) => r.id === requestId);
  if (!target) return null;

  const updatedTicket: RequestTicket = {
    ...target,
    status: target.status === 'Open' ? 'In Progress' : target.status,
    offers: [...target.offers, newOffer]
  };

  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      await supabaseInstance.from('requests').update(updatedTicket).eq('id', requestId);
    } catch {}
  }

  const updatedList = requests.map((r) => (r.id === requestId ? updatedTicket : r));
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedList));
  return updatedTicket;
}

export async function updateRequestStatus(requestId: string, status: 'Open' | 'In Progress' | 'Resolved'): Promise<RequestTicket | null> {
  // 1. Server API
  try {
    const res = await fetch(`/api/requests/${encodeURIComponent(requestId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const updated = await res.json();
      return updated;
    }
  } catch {}

  // 2. Fallback
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
    } catch {}
  }

  const updatedList = requests.map((r) => (r.id === requestId ? updatedTicket : r));
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedList));
  return updatedTicket;
}

/* =====================================================================
   NOTIFICATIONS & DIRECT MESSAGING (Cross-Device API)
===================================================================== */

export async function fetchNotifications(recipientId: string): Promise<AppNotification[]> {
  try {
    const res = await fetch(`/api/notifications/${encodeURIComponent(recipientId)}`);
    if (res.ok) {
      const data: AppNotification[] = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch {}

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

  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    });
  } catch {}

  const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  let all: AppNotification[] = [];
  if (stored) {
    try {
      all = JSON.parse(stored);
    } catch {}
  }
  const updated = [newNotif, ...all];
  localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));

  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      await supabaseInstance.from('notifications').insert([newNotif]);
    } catch {}
  }

  return newNotif;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH'
    });
  } catch {}

  const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  if (!stored) return;
  try {
    const all: AppNotification[] = JSON.parse(stored);
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
  } catch {}
}

export async function markAllNotificationsAsRead(recipientId: string): Promise<void> {
  try {
    await fetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId })
    });
  } catch {}

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
  try {
    const res = await fetch(`/api/messages/${encodeURIComponent(user1Id)}/${encodeURIComponent(user2Id)}`);
    if (res.ok) {
      const data: DirectMessage[] = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch {}

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
  try {
    const res = await fetch(`/api/conversations/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data: DirectMessage[] = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch {}

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

  try {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    });
  } catch {}

  const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
  let all: DirectMessage[] = [];
  if (stored) {
    try {
      all = JSON.parse(stored);
    } catch {}
  }
  const updated = [...all, newMsg];
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));

  if (isLiveSupabaseActive() && supabaseInstance) {
    try {
      await supabaseInstance.from('direct_messages').insert([newMsg]);
    } catch {}
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

// Complete SQL Schema for Supabase project SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ============================================================
-- PEERFORGE: Complete Database Schema
-- Run this in your Supabase Project SQL Editor (1-click setup)
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
  isRealRegistration BOOLEAN DEFAULT true,
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

-- 3. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  recipientId TEXT NOT NULL,
  senderId TEXT NOT NULL,
  senderName TEXT NOT NULL,
  senderAvatar TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  linkTab TEXT,
  targetId TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Direct Messages Table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id TEXT PRIMARY KEY,
  senderId TEXT NOT NULL,
  senderName TEXT NOT NULL,
  senderAvatar TEXT,
  recipientId TEXT NOT NULL,
  recipientName TEXT NOT NULL,
  recipientAvatar TEXT,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read requests" ON public.requests FOR SELECT USING (true);
CREATE POLICY "Public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public read direct_messages" ON public.direct_messages FOR SELECT USING (true);

-- Allow inserting, updating, and deleting
CREATE POLICY "Allow all on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all on requests" ON public.requests FOR ALL USING (true);
CREATE POLICY "Allow all on notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Allow all on direct_messages" ON public.direct_messages FOR ALL USING (true);
`;
