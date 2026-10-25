import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentProfile, RequestTicket, HelpOffer, AppNotification, DirectMessage } from '../types';
import { INITIAL_PROFILES, INITIAL_REQUESTS } from './seedData';
import {
  profileToDb,
  profileFromDb,
  requestToDb,
  requestFromDb,
  notificationToDb,
  notificationFromDb,
  messageToDb,
  messageFromDb
} from './dbMapping';

// Storage keys
const STORAGE_KEY_PROFILES = 'peerforge_profiles_v2';
const STORAGE_KEY_REQUESTS = 'peerforge_requests_v2';
const STORAGE_KEY_NOTIFICATIONS = 'peerforge_notifications_v2';
const STORAGE_KEY_MESSAGES = 'peerforge_messages_v2';
const STORAGE_KEY_OUTBOX = 'peerforge_sync_outbox_v2';

// Cloud database credentials - default fallback ensures zero-configuration Vercel production hosting
export const DEFAULT_SUPABASE_URL = 'https://hgwmksnszoeqztqvvzkg.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnd21rc25zem9lcXp0cXZ2emtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NzA0NDcsImV4cCI6MjEwODM0NjQ0N30.y8W3h71MAVl5kSSA_z-W9MMbevgXdrdHG4m0eFNZ1bw';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  return {
    url: envUrl || DEFAULT_SUPABASE_URL,
    anonKey: envKey || DEFAULT_SUPABASE_ANON_KEY,
    isCustom: Boolean(envUrl && envKey)
  };
}

export function saveSupabaseConfig(_url: string, _anonKey: string): void {
  // Configured via environment or verified Supabase instance
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
      console.warn('Failed to initialize Supabase client:', err);
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
  if (!supabaseInstance) {
    initSupabaseClient();
  }
  return supabaseInstance;
}

export function isLiveSupabaseActive(): boolean {
  return isConnectedToLiveSupabase && !!supabaseInstance;
}

/* =====================================================================
   SYNC QUEUE & STATUS MONITORING
===================================================================== */

export interface QueuedSyncItem {
  id: string;
  type:
    | 'profile_upsert'
    | 'profile_delete'
    | 'request_upsert'
    | 'notification_insert'
    | 'message_insert';
  payload: any;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

export interface SyncState {
  status: 'connected' | 'syncing' | 'error' | 'offline';
  isLiveSupabase: boolean;
  pendingCount: number;
  lastSyncedAt: Date | null;
  lastError: string | null;
  syncAttempts: number;
  profileCount: number;
  requestCount: number;
}

function getStoredOutbox(): QueuedSyncItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OUTBOX);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveOutbox(items: QueuedSyncItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_OUTBOX, JSON.stringify(items));
    notifySyncState();
  } catch (err) {
    console.error('Failed to save sync outbox:', err);
  }
}

function queueForSync(
  type: QueuedSyncItem['type'],
  payload: any,
  errorMessage?: string
): void {
  const items = getStoredOutbox();
  const existingIdx = items.findIndex(
    (i) => i.type === type && i.payload?.id === payload?.id
  );

  const newItem: QueuedSyncItem = {
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    payload,
    createdAt: Date.now(),
    retryCount: 0,
    lastError: errorMessage
  };

  if (existingIdx >= 0) {
    items[existingIdx] = newItem;
  } else {
    items.push(newItem);
  }
  saveOutbox(items);
  updateSyncState({
    status: 'error',
    lastError: errorMessage || 'Item waiting to sync to cloud database'
  });
}

let currentSyncState: SyncState = {
  status: 'connected',
  isLiveSupabase: true,
  pendingCount: 0,
  lastSyncedAt: null,
  lastError: null,
  syncAttempts: 0,
  profileCount: 0,
  requestCount: 0
};

type SyncListener = (state: SyncState) => void;
type DataListener = () => void;

const syncListeners = new Set<SyncListener>();
const dataListeners = new Set<DataListener>();

export function subscribeSyncState(listener: SyncListener): () => void {
  syncListeners.add(listener);
  listener(getSyncState());
  return () => {
    syncListeners.delete(listener);
  };
}

export function subscribeDataUpdates(listener: DataListener): () => void {
  dataListeners.add(listener);
  return () => {
    dataListeners.delete(listener);
  };
}

export function getSyncState(): SyncState {
  const outbox = getStoredOutbox();
  return {
    ...currentSyncState,
    isLiveSupabase: isLiveSupabaseActive(),
    pendingCount: outbox.length
  };
}

function updateSyncState(partial: Partial<SyncState>): void {
  const outbox = getStoredOutbox();
  currentSyncState = {
    ...currentSyncState,
    ...partial,
    pendingCount: outbox.length
  };
  notifySyncState();
}

function notifySyncState(): void {
  const state = getSyncState();
  syncListeners.forEach((l) => {
    try {
      l(state);
    } catch {}
  });
}

function notifyDataUpdates(): void {
  dataListeners.forEach((l) => {
    try {
      l();
    } catch {}
  });
}

/* =====================================================================
   BACKGROUND 10-SECOND AUTO-SYNC & RETRY WORKER
===================================================================== */

let isSyncingInProgress = false;

export async function processSyncQueueAndRefresh(): Promise<void> {
  if (isSyncingInProgress) return;
  isSyncingInProgress = true;

  try {
    const client = getSupabase();
    const outbox = getStoredOutbox();

    if (client && outbox.length > 0) {
      updateSyncState({ status: 'syncing' });
      const remaining: QueuedSyncItem[] = [];

      for (const item of outbox) {
        try {
          if (item.type === 'profile_upsert') {
            const row = profileToDb(item.payload);
            const { error } = await client.from('profiles').upsert(row, { onConflict: 'id' });
            if (error) throw new Error(error.message);
          } else if (item.type === 'profile_delete') {
            const { error } = await client.from('profiles').delete().eq('id', item.payload.id);
            if (error) throw new Error(error.message);
          } else if (item.type === 'request_upsert') {
            const row = requestToDb(item.payload);
            const { error } = await client.from('requests').upsert(row, { onConflict: 'id' });
            if (error) throw new Error(error.message);
          } else if (item.type === 'notification_insert') {
            const row = notificationToDb(item.payload);
            const { error } = await client.from('notifications').upsert(row, { onConflict: 'id' });
            if (error) throw new Error(error.message);
          } else if (item.type === 'message_insert') {
            const row = messageToDb(item.payload);
            const { error } = await client.from('direct_messages').upsert(row, { onConflict: 'id' });
            if (error) throw new Error(error.message);
          }
        } catch (itemErr: any) {
          console.warn(`Sync retry failed for ${item.type}:`, itemErr);
          item.retryCount += 1;
          item.lastError = itemErr?.message || 'Sync failed';
          remaining.push(item);
        }
      }

      saveOutbox(remaining);

      if (remaining.length > 0) {
        updateSyncState({
          status: 'error',
          lastError: remaining[0].lastError || 'Some changes could not be saved to cloud database',
          syncAttempts: currentSyncState.syncAttempts + 1
        });
      } else {
        updateSyncState({
          status: 'connected',
          lastError: null,
          lastSyncedAt: new Date()
        });
      }
    }

    // Silently refresh data from Supabase so Computer B gets new profiles/posts from Computer A
    if (client) {
      try {
        const { data: profRows, error: pErr } = await client
          .from('profiles')
          .select('*')
          .order('joineddate', { ascending: false });

        if (!pErr && Array.isArray(profRows)) {
          const mappedProfs = profRows.map(profileFromDb);
          localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(mappedProfs));
          currentSyncState.profileCount = mappedProfs.length;
        }

        const { data: reqRows, error: rErr } = await client
          .from('requests')
          .select('*')
          .order('createdat', { ascending: false });

        if (!rErr && Array.isArray(reqRows)) {
          const mappedReqs = reqRows.map(requestFromDb);
          localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(mappedReqs));
          currentSyncState.requestCount = mappedReqs.length;
        }

        if (!pErr && !rErr) {
          updateSyncState({
            status: outbox.length > 0 ? 'error' : 'connected',
            lastSyncedAt: new Date(),
            lastError: outbox.length > 0 ? currentSyncState.lastError : null
          });
          notifyDataUpdates();
        }
      } catch (refreshErr: any) {
        console.warn('Silent cloud data refresh warning:', refreshErr);
      }
    }
  } catch (err: any) {
    console.error('Process sync queue exception:', err);
    updateSyncState({
      status: 'error',
      lastError: err?.message || 'Connection to cloud database interrupted'
    });
  } finally {
    isSyncingInProgress = false;
  }
}

// Start automatic 10-second silent sync worker
if (typeof window !== 'undefined') {
  setInterval(() => {
    processSyncQueueAndRefresh().catch(() => {});
  }, 10000);
}

export async function triggerManualSync(): Promise<SyncState> {
  await processSyncQueueAndRefresh();
  return getSyncState();
}

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  profilesOk: boolean;
  requestsOk: boolean;
  notificationsOk: boolean;
  messagesOk: boolean;
  error?: string;
}> {
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      profilesOk: false,
      requestsOk: false,
      notificationsOk: false,
      messagesOk: false,
      error: 'Supabase client is not initialized'
    };
  }

  try {
    const [pRes, rRes, nRes, mRes] = await Promise.all([
      client.from('profiles').select('id').limit(1),
      client.from('requests').select('id').limit(1),
      client.from('notifications').select('id').limit(1),
      client.from('direct_messages').select('id').limit(1)
    ]);

    const profilesOk = !pRes.error;
    const requestsOk = !rRes.error;
    const notificationsOk = !nRes.error;
    const messagesOk = !mRes.error;
    const allOk = profilesOk && requestsOk && notificationsOk && messagesOk;

    return {
      success: allOk,
      profilesOk,
      requestsOk,
      notificationsOk,
      messagesOk,
      error:
        pRes.error?.message ||
        rRes.error?.message ||
        nRes.error?.message ||
        mRes.error?.message
    };
  } catch (e: any) {
    return {
      success: false,
      profilesOk: false,
      requestsOk: false,
      notificationsOk: false,
      messagesOk: false,
      error: e?.message || 'Failed to ping Supabase database'
    };
  }
}

/* =====================================================================
   DATA REPOSITORY API (Direct Supabase Cloud + Outbox Retry Queue)
===================================================================== */

export async function fetchAllProfiles(): Promise<StudentProfile[]> {
  const client = getSupabase();

  // 1. Try Supabase directly (primary for Vercel and cross-device sync)
  if (client) {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .order('joineddate', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map(profileFromDb);
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(mapped));
        updateSyncState({
          status: getStoredOutbox().length > 0 ? 'error' : 'connected',
          lastSyncedAt: new Date(),
          profileCount: mapped.length
        });
        return mapped;
      } else if (error) {
        console.warn('Supabase profiles fetch returned error:', error.message);
        updateSyncState({
          status: 'error',
          lastError: `Database query error: ${error.message}`
        });
      }
    } catch (err: any) {
      console.warn('Supabase fetch exception, trying local fallback:', err);
      updateSyncState({
        status: 'error',
        lastError: err?.message || 'Could not reach Supabase cloud database'
      });
    }
  }

  // 2. Try server API if running in Express
  try {
    const res = await fetch('/api/profiles');
    if (res.ok) {
      const serverProfiles: StudentProfile[] = await res.json();
      if (Array.isArray(serverProfiles) && serverProfiles.length > 0) {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(serverProfiles));
        return serverProfiles;
      }
    }
  } catch {}

  // 3. Fallback to local storage cache
  const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {}
  }

  return [];
}

export async function saveProfile(profile: StudentProfile): Promise<StudentProfile> {
  // 1. Save optimistically to local cache immediately
  const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
  let localList: StudentProfile[] = [];
  if (stored) {
    try {
      localList = JSON.parse(stored);
    } catch {}
  }
  const index = localList.findIndex((p) => p.id === profile.id);
  const updated =
    index >= 0
      ? localList.map((p, i) => (i === index ? profile : p))
      : [profile, ...localList];
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(updated));

  // 2. Upsert directly to Supabase cloud database
  const client = getSupabase();
  let cloudSuccess = false;

  if (client) {
    try {
      const row = profileToDb(profile);
      const { error } = await client.from('profiles').upsert(row, { onConflict: 'id' });
      if (error) {
        console.error('Supabase profile upsert error:', error.message);
        queueForSync('profile_upsert', profile, `Cloud save failed: ${error.message}`);
      } else {
        cloudSuccess = true;
        updateSyncState({
          status: getStoredOutbox().length > 0 ? 'error' : 'connected',
          lastSyncedAt: new Date(),
          lastError: getStoredOutbox().length > 0 ? currentSyncState.lastError : null
        });
      }
    } catch (err: any) {
      console.error('Supabase profile save exception:', err);
      queueForSync(
        'profile_upsert',
        profile,
        err?.message || 'Network error saving profile to cloud'
      );
    }
  } else {
    queueForSync(
      'profile_upsert',
      profile,
      'Supabase client not initialized. Will retry silently.'
    );
  }

  // 3. Mirror to server API if available (non-blocking)
  fetch('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  }).catch(() => {});

  if (!cloudSuccess) {
    // Notify data listeners of optimistic save
    notifyDataUpdates();
  }

  return profile;
}

export async function deleteProfile(profileId: string): Promise<boolean> {
  // 1. Optimistic local delete
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

  // 2. Cloud delete
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from('profiles').delete().eq('id', profileId);
      if (error) {
        queueForSync('profile_delete', { id: profileId }, error.message);
      }
    } catch (err: any) {
      queueForSync('profile_delete', { id: profileId }, err?.message || 'Delete failed');
    }
  }

  // 3. Mirror to server API
  fetch(`/api/profiles/${encodeURIComponent(profileId)}`, {
    method: 'DELETE'
  }).catch(() => {});

  notifyDataUpdates();
  return true;
}

export async function endorseSkill(
  profileId: string,
  skillId: string
): Promise<StudentProfile | null> {
  const profiles = await fetchAllProfiles();
  const target = profiles.find((p) => p.id === profileId);
  if (!target) return null;

  const updatedSkills = (target.skills || []).map((s) => {
    if (s.id === skillId) {
      return { ...s, endorsementsCount: (s.endorsementsCount || 0) + 1 };
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
  const client = getSupabase();

  // 1. Direct Supabase
  if (client) {
    try {
      const { data, error } = await client
        .from('requests')
        .select('*')
        .order('createdat', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map(requestFromDb);
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(mapped));
        currentSyncState.requestCount = mapped.length;
        return mapped;
      }
    } catch (err) {
      console.warn('Direct Supabase fetch requests warning:', err);
    }
  }

  // 2. Server API
  try {
    const res = await fetch('/api/requests');
    if (res.ok) {
      const data: RequestTicket[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(data));
        return data;
      }
    }
  } catch {}

  // 3. Local fallback
  const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {}
  }

  return [];
}

export async function createRequestTicket(
  ticket: Omit<RequestTicket, 'id' | 'createdAt' | 'offers'>
): Promise<RequestTicket> {
  const newTicket: RequestTicket = {
    ...ticket,
    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
    offers: []
  };

  // 1. Local cache
  const requests = await fetchAllRequests();
  const updated = [newTicket, ...requests];
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));

  // 2. Direct Supabase
  const client = getSupabase();
  if (client) {
    try {
      const row = requestToDb(newTicket);
      const { error } = await client.from('requests').insert([row]);
      if (error) {
        console.error('Supabase request create error:', error.message);
        queueForSync('request_upsert', newTicket, `Request sync failed: ${error.message}`);
      } else {
        updateSyncState({
          status: getStoredOutbox().length > 0 ? 'error' : 'connected',
          lastSyncedAt: new Date()
        });
      }
    } catch (err: any) {
      queueForSync(
        'request_upsert',
        newTicket,
        err?.message || 'Failed to save request to cloud'
      );
    }
  } else {
    queueForSync('request_upsert', newTicket, 'Supabase offline');
  }

  // 3. Mirror to server
  fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTicket)
  }).catch(() => {});

  notifyDataUpdates();
  return newTicket;
}

export async function addOfferToRequest(
  requestId: string,
  offer: Omit<HelpOffer, 'id' | 'createdAt'>
): Promise<RequestTicket | null> {
  const newOffer: HelpOffer = {
    ...offer,
    id: `off-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  const requests = await fetchAllRequests();
  const target = requests.find((r) => r.id === requestId);
  if (!target) return null;

  const updatedTicket: RequestTicket = {
    ...target,
    status: target.status === 'Open' ? 'In Progress' : target.status,
    offers: [...(target.offers || []), newOffer]
  };

  const updatedList = requests.map((r) => (r.id === requestId ? updatedTicket : r));
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedList));

  const client = getSupabase();
  if (client) {
    try {
      const row = requestToDb(updatedTicket);
      const { error } = await client.from('requests').upsert(row, { onConflict: 'id' });
      if (error) {
        queueForSync('request_upsert', updatedTicket, error.message);
      }
    } catch (err: any) {
      queueForSync('request_upsert', updatedTicket, err?.message);
    }
  }

  // Server API mirror
  fetch(`/api/requests/${encodeURIComponent(requestId)}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newOffer)
  }).catch(() => {});

  notifyDataUpdates();
  return updatedTicket;
}

export async function updateRequestStatus(
  requestId: string,
  status: 'Open' | 'In Progress' | 'Resolved'
): Promise<RequestTicket | null> {
  const requests = await fetchAllRequests();
  const target = requests.find((r) => r.id === requestId);
  if (!target) return null;

  const updatedTicket: RequestTicket = {
    ...target,
    status
  };

  const updatedList = requests.map((r) => (r.id === requestId ? updatedTicket : r));
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedList));

  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client
        .from('requests')
        .update({ status })
        .eq('id', requestId);
      if (error) {
        queueForSync('request_upsert', updatedTicket, error.message);
      }
    } catch (err: any) {
      queueForSync('request_upsert', updatedTicket, err?.message);
    }
  }

  fetch(`/api/requests/${encodeURIComponent(requestId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).catch(() => {});

  notifyDataUpdates();
  return updatedTicket;
}

/* =====================================================================
   NOTIFICATIONS & DIRECT MESSAGING (Cross-Device API)
===================================================================== */

export async function fetchNotifications(recipientId: string): Promise<AppNotification[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('notifications')
        .select('*')
        .or(`recipientid.eq.${recipientId},recipientid.eq.all`)
        .order('createdat', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map(notificationFromDb);
      }
    } catch {}
  }

  try {
    const res = await fetch(`/api/notifications/${encodeURIComponent(recipientId)}`);
    if (res.ok) {
      const data: AppNotification[] = await res.json();
      if (Array.isArray(data)) return data;
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

  const client = getSupabase();
  if (client) {
    try {
      const row = notificationToDb(newNotif);
      const { error } = await client.from('notifications').insert([row]);
      if (error) {
        queueForSync('notification_insert', newNotif, error.message);
      }
    } catch (err: any) {
      queueForSync('notification_insert', newNotif, err?.message);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  let all: AppNotification[] = [];
  if (stored) {
    try {
      all = JSON.parse(stored);
    } catch {}
  }
  const updated = [newNotif, ...all];
  localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));

  fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newNotif)
  }).catch(() => {});

  return newNotif;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const client = getSupabase();
  if (client) {
    try {
      await client.from('notifications').update({ read: true }).eq('id', id);
    } catch {}
  }

  fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH'
  }).catch(() => {});

  const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  if (!stored) return;
  try {
    const all: AppNotification[] = JSON.parse(stored);
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
  } catch {}
}

export async function markAllNotificationsAsRead(recipientId: string): Promise<void> {
  const client = getSupabase();
  if (client) {
    try {
      await client
        .from('notifications')
        .update({ read: true })
        .or(`recipientid.eq.${recipientId},recipientid.eq.all`);
    } catch {}
  }

  fetch('/api/notifications/read-all', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientId })
  }).catch(() => {});

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

export async function fetchDirectMessages(
  user1Id: string,
  user2Id: string
): Promise<DirectMessage[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('direct_messages')
        .select('*')
        .or(
          `and(senderid.eq.${user1Id},recipientid.eq.${user2Id}),and(senderid.eq.${user2Id},recipientid.eq.${user1Id})`
        )
        .order('createdat', { ascending: true });

      if (!error && Array.isArray(data)) {
        return data.map(messageFromDb);
      }
    } catch {}
  }

  try {
    const res = await fetch(
      `/api/messages/${encodeURIComponent(user1Id)}/${encodeURIComponent(user2Id)}`
    );
    if (res.ok) {
      const data: DirectMessage[] = await res.json();
      if (Array.isArray(data)) return data;
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
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('direct_messages')
        .select('*')
        .or(`senderid.eq.${userId},recipientid.eq.${userId}`)
        .order('createdat', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map(messageFromDb);
      }
    } catch {}
  }

  try {
    const res = await fetch(`/api/conversations/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data: DirectMessage[] = await res.json();
      if (Array.isArray(data)) return data;
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

  const client = getSupabase();
  if (client) {
    try {
      const row = messageToDb(newMsg);
      const { error } = await client.from('direct_messages').insert([row]);
      if (error) {
        queueForSync('message_insert', newMsg, error.message);
      }
    } catch (err: any) {
      queueForSync('message_insert', newMsg, err?.message);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
  let all: DirectMessage[] = [];
  if (stored) {
    try {
      all = JSON.parse(stored);
    } catch {}
  }
  const updated = [...all, newMsg];
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));

  // Mirror to server API
  fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newMsg)
  }).catch(() => {});

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
  const combined = [
    ...realOnly,
    ...INITIAL_PROFILES.filter((s) => !realOnly.some((r) => r.id === s.id))
  ];
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(combined));
  return combined;
}

// Complete SQL Schema reference
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

CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read requests" ON public.requests FOR SELECT USING (true);
CREATE POLICY "Public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public read direct_messages" ON public.direct_messages FOR SELECT USING (true);

CREATE POLICY "Allow all on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all on requests" ON public.requests FOR ALL USING (true);
CREATE POLICY "Allow all on notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Allow all on direct_messages" ON public.direct_messages FOR ALL USING (true);
`;
