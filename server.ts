import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  profileToDb,
  profileFromDb,
  requestToDb,
  requestFromDb,
  notificationToDb,
  notificationFromDb,
  messageToDb,
  messageFromDb
} from './src/services/dbMapping';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory & file for centralized cross-device persistence
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

interface DatabaseSchema {
  profiles: any[];
  requests: any[];
  notifications: any[];
  messages: any[];
}

function initLocalDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
        requests: Array.isArray(parsed.requests) ? parsed.requests : [],
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        messages: Array.isArray(parsed.messages) ? parsed.messages : []
      };
    } catch (e) {
      console.warn('Error reading db file, reinitializing', e);
    }
  }

  const initial: DatabaseSchema = {
    profiles: [],
    requests: [],
    notifications: [],
    messages: []
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  return initial;
}

let db = initLocalDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database file:', err);
  }
}

// Supabase integration on backend
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hgwmksnszoeqztqvvzkg.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnd21rc25zem9lcXp0cXZ2emtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NzA0NDcsImV4cCI6MjEwODM0NjQ0N30.y8W3h71MAVl5kSSA_z-W9MMbevgXdrdHG4m0eFNZ1bw';

let supabase: SupabaseClient | null = null;
let supabaseConnected = false;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    (async () => {
      try {
        const { error } = await supabase!.from('profiles').select('id').limit(1);
        if (!error) {
          supabaseConnected = true;
          console.log('Successfully connected to live Supabase database with profiles table!');
        }
      } catch {}
    })();
  } catch (err) {
    console.warn('Supabase client initialization warning:', err);
  }
}

async function syncToSupabase(fn: () => Promise<any>) {
  if (!supabase) return;
  try {
    const res = await fn();
    if (res && !res.error) {
      supabaseConnected = true;
    }
  } catch (e) {
    // catch non-blocking sync issues
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  /* -------------------------------------------------------------
     BACKEND API ROUTES (Cross-Device Live Database)
  ------------------------------------------------------------- */

  // Health and Status
  app.get('/api/status', async (_req: Request, res: Response) => {
    let supabaseStatus = 'disconnected';
    let supabaseError = null;

    if (supabase) {
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (!error) {
          supabaseStatus = 'ready';
        } else {
          supabaseStatus = 'tables_missing';
          supabaseError = error.message;
        }
      } catch (e: any) {
        supabaseStatus = 'error';
        supabaseError = e.message;
      }
    }

    res.json({
      status: 'ok',
      crossDeviceDatabase: 'active',
      profileCount: db.profiles.length,
      requestCount: db.requests.length,
      supabaseStatus,
      supabaseError
    });
  });

  // PROFILES API
  app.get('/api/profiles', async (_req: Request, res: Response) => {
    if (supabase && supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('joineddate', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(profileFromDb);
          for (const item of mapped) {
            const idx = db.profiles.findIndex(p => p.id === item.id);
            if (idx >= 0) {
              db.profiles[idx] = item;
            } else {
              db.profiles.push(item);
            }
          }
          saveDatabase();
        }
      } catch {}
    }

    res.json(db.profiles);
  });

  app.post('/api/profiles', async (req: Request, res: Response) => {
    const profile = req.body;
    if (!profile || !profile.id || !profile.fullName) {
      res.status(400).json({ error: 'Invalid profile data' });
      return;
    }

    const index = db.profiles.findIndex(p => p.id === profile.id);
    if (index >= 0) {
      db.profiles[index] = profile;
    } else {
      db.profiles.unshift(profile);
    }
    saveDatabase();

    // Mirror to Supabase with proper lowercase mapping
    syncToSupabase(async () => {
      const row = profileToDb(profile);
      await supabase!.from('profiles').upsert(row, { onConflict: 'id' });
    });

    res.json(profile);
  });

  app.delete('/api/profiles/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    db.profiles = db.profiles.filter(p => p.id !== id);
    saveDatabase();

    syncToSupabase(async () => {
      await supabase!.from('profiles').delete().eq('id', id);
    });

    res.json({ success: true });
  });

  app.post('/api/profiles/:id/endorse', (req: Request, res: Response) => {
    const { id } = req.params;
    const { skillId } = req.body;

    const target = db.profiles.find(p => p.id === id);
    if (!target) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    target.skills = (target.skills || []).map((s: any) => {
      if (s.id === skillId) {
        return { ...s, endorsementsCount: (s.endorsementsCount || 0) + 1 };
      }
      return s;
    });

    saveDatabase();

    syncToSupabase(async () => {
      const row = profileToDb(target);
      await supabase!.from('profiles').upsert(row, { onConflict: 'id' });
    });

    res.json(target);
  });

  // REQUESTS API
  app.get('/api/requests', async (_req: Request, res: Response) => {
    if (supabase && supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .order('createdat', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(requestFromDb);
          for (const item of mapped) {
            const idx = db.requests.findIndex(r => r.id === item.id);
            if (idx >= 0) {
              db.requests[idx] = item;
            } else {
              db.requests.push(item);
            }
          }
          saveDatabase();
        }
      } catch {}
    }

    res.json(db.requests);
  });

  app.post('/api/requests', (req: Request, res: Response) => {
    const ticket = req.body;
    if (!ticket || !ticket.id || !ticket.title) {
      res.status(400).json({ error: 'Invalid ticket data' });
      return;
    }

    const index = db.requests.findIndex(r => r.id === ticket.id);
    if (index >= 0) {
      db.requests[index] = ticket;
    } else {
      db.requests.unshift(ticket);
    }
    saveDatabase();

    syncToSupabase(async () => {
      const row = requestToDb(ticket);
      await supabase!.from('requests').upsert(row, { onConflict: 'id' });
    });

    res.json(ticket);
  });

  app.post('/api/requests/:id/offers', (req: Request, res: Response) => {
    const { id } = req.params;
    const offer = req.body;

    const target = db.requests.find(r => r.id === id);
    if (!target) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    if (!Array.isArray(target.offers)) {
      target.offers = [];
    }
    target.offers.push(offer);
    if (target.status === 'Open') {
      target.status = 'In Progress';
    }

    saveDatabase();

    syncToSupabase(async () => {
      const row = requestToDb(target);
      await supabase!.from('requests').upsert(row, { onConflict: 'id' });
    });

    res.json(target);
  });

  app.patch('/api/requests/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const target = db.requests.find(r => r.id === id);
    if (!target) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    target.status = status;
    saveDatabase();

    syncToSupabase(async () => {
      await supabase!.from('requests').update({ status }).eq('id', id);
    });

    res.json(target);
  });

  app.delete('/api/requests/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.requests = db.requests.filter(r => r.id !== id);
    saveDatabase();

    syncToSupabase(async () => {
      await supabase!.from('requests').delete().eq('id', id);
    });

    res.json({ success: true });
  });

  app.delete('/api/requests/:id/offers/:offerId', (req: Request, res: Response) => {
    const { id, offerId } = req.params;
    const target = db.requests.find(r => r.id === id);
    if (!target) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    target.offers = (target.offers || []).filter((o: any) => o.id !== offerId);
    saveDatabase();

    syncToSupabase(async () => {
      const row = requestToDb(target);
      await supabase!.from('requests').upsert(row, { onConflict: 'id' });
    });

    res.json(target);
  });

  // NOTIFICATIONS API
  app.get('/api/notifications/:recipientId', (req: Request, res: Response) => {
    const { recipientId } = req.params;
    const userNotifs = db.notifications
      .filter(n => n.recipientId === recipientId || n.recipientId === 'all')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(userNotifs);
  });

  app.post('/api/notifications', (req: Request, res: Response) => {
    const notif = req.body;
    db.notifications.unshift(notif);
    saveDatabase();

    syncToSupabase(async () => {
      const row = notificationToDb(notif);
      await supabase!.from('notifications').upsert(row, { onConflict: 'id' });
    });

    res.json(notif);
  });

  app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    db.notifications = db.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveDatabase();

    syncToSupabase(async () => {
      await supabase!.from('notifications').update({ read: true }).eq('id', id);
    });

    res.json({ success: true });
  });

  app.patch('/api/notifications/read-all', (req: Request, res: Response) => {
    const { recipientId } = req.body;
    db.notifications = db.notifications.map(n =>
      (n.recipientId === recipientId || n.recipientId === 'all') ? { ...n, read: true } : n
    );
    saveDatabase();

    syncToSupabase(async () => {
      await supabase!
        .from('notifications')
        .update({ read: true })
        .or(`recipientid.eq.${recipientId},recipientid.eq.all`);
    });

    res.json({ success: true });
  });

  // DIRECT MESSAGES API
  app.get('/api/messages/:user1/:user2', (req: Request, res: Response) => {
    const { user1, user2 } = req.params;
    const msgs = db.messages
      .filter(m => (m.senderId === user1 && m.recipientId === user2) || (m.senderId === user2 && m.recipientId === user1))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    res.json(msgs);
  });

  app.get('/api/conversations/:userId', (req: Request, res: Response) => {
    const { userId } = req.params;
    const msgs = db.messages
      .filter(m => m.senderId === userId || m.recipientId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(msgs);
  });

  app.post('/api/messages', (req: Request, res: Response) => {
    const msg = req.body;
    db.messages.push(msg);

    // Also auto-create a notification for the recipient
    const notif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      recipientId: msg.recipientId,
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderAvatar: msg.senderAvatar,
      title: `Direct Message from ${msg.senderName}`,
      message: msg.content.length > 60 ? `${msg.content.substring(0, 60)}...` : msg.content,
      type: 'message',
      targetId: msg.senderId,
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.unshift(notif);

    saveDatabase();

    syncToSupabase(async () => {
      const rowMsg = messageToDb(msg);
      await supabase!.from('direct_messages').upsert(rowMsg, { onConflict: 'id' });
      const rowNotif = notificationToDb(notif as any);
      await supabase!.from('notifications').upsert(rowNotif, { onConflict: 'id' });
    });

    res.json(msg);
  });

  /* -------------------------------------------------------------
     VITE MIDDLEWARE (Dev) / STATIC ASSETS (Prod)
  ------------------------------------------------------------- */
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Live full-stack backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
