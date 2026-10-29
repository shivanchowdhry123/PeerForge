import { createClient } from '@supabase/supabase-js';
import {
  StudentProfile,
  Project,
  Question,
  Answer,
  SchoolEvent,
  AppNotification,
  Conversation,
  Message,
  ContentReport,
  ContactInquiry,
  UploadedFile
} from '../types';

import { sanitizeStudentForDb, sanitizeMessageText } from '../utils/storageOptimizer';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project')
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Supabase Data Service Layer for PeerForge OPG World School Platform
 * Handles table synchronization, real-time channels, and fallback handling.
 */

// --- STUDENTS ---
export async function fetchSupabaseStudents(): Promise<StudentProfile[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('students').select('*');
    if (error) throw error;
    return data as StudentProfile[];
  } catch (err) {
    console.warn('Supabase fetch students error:', err);
    return null;
  }
}

export async function saveSupabaseStudent(student: StudentProfile): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const cleanStudent = sanitizeStudentForDb(student);
    const { error } = await supabase.from('students').upsert(cleanStudent);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase save student error:', err);
    return false;
  }
}

// --- PROJECTS ---
export async function fetchSupabaseProjects(): Promise<Project[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    return data as Project[];
  } catch (err) {
    console.warn('Supabase fetch projects error:', err);
    return null;
  }
}

export async function saveSupabaseProject(project: Project): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('projects').upsert(project);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase save project error:', err);
    return false;
  }
}

// --- QUESTIONS ---
export async function fetchSupabaseQuestions(): Promise<Question[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('questions').select('*');
    if (error) throw error;
    return data as Question[];
  } catch (err) {
    console.warn('Supabase fetch questions error:', err);
    return null;
  }
}

export async function saveSupabaseQuestion(question: Question): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('questions').upsert(question);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase save question error:', err);
    return false;
  }
}

export async function deleteSupabaseQuestion(questionId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    await supabase.from('answers').delete().eq('questionId', questionId);
    const { error } = await supabase.from('questions').delete().eq('id', questionId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase delete question error:', err);
    return false;
  }
}

// --- ANSWERS ---
export async function fetchSupabaseAnswers(questionId?: string): Promise<Answer[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    let query = supabase.from('answers').select('*');
    if (questionId) {
      query = query.eq('questionId', questionId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Answer[];
  } catch (err) {
    console.warn('Supabase fetch answers error:', err);
    return null;
  }
}

export async function saveSupabaseAnswer(answer: Answer): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('answers').upsert(answer);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase save answer error:', err);
    return false;
  }
}

export async function deleteSupabaseAnswer(answerId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('answers').delete().eq('id', answerId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase delete answer error:', err);
    return false;
  }
}

// --- CONVERSATIONS ---
export async function fetchSupabaseConversations(userId?: string): Promise<Conversation[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    let query = supabase.from('conversations').select('*');
    if (userId) {
      query = query.contains('participantIds', [userId]);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Conversation[];
  } catch (err) {
    console.warn('Supabase fetch conversations error:', err);
    return null;
  }
}

export async function saveSupabaseConversation(conversation: Conversation): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('conversations').upsert(conversation);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase save conversation error:', err);
    return false;
  }
}

// --- MESSAGES ---
export async function fetchSupabaseMessages(conversationId?: string): Promise<Message[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    let query = supabase.from('messages').select('*');
    if (conversationId) {
      query = query.eq('conversationId', conversationId);
    }
    const { data, error } = await query.order('timestamp', { ascending: true });
    if (error) throw error;
    return data as Message[];
  } catch (err) {
    console.warn('Supabase fetch messages error:', err);
    return null;
  }
}

export async function saveSupabaseMessage(message: Message): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const cleanMessage: Message = {
      ...message,
      text: sanitizeMessageText(message.text)
    };
    const { error } = await supabase.from('messages').upsert(cleanMessage);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase save message error:', err);
    return false;
  }
}

// --- EVENTS ---
export async function fetchSupabaseEvents(): Promise<SchoolEvent[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('events').select('*');
    if (error) throw error;
    return data as SchoolEvent[];
  } catch (err) {
    console.warn('Supabase fetch events error:', err);
    return null;
  }
}

export async function saveSupabaseEvent(event: SchoolEvent): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('events').upsert(event);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase save event error:', err);
    return false;
  }
}

// --- NOTIFICATIONS ---
export async function fetchSupabaseNotifications(userId?: string): Promise<AppNotification[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    let query = supabase.from('notifications').select('*');
    if (userId) {
      query = query.or(`userId.eq.${userId},userId.eq.all`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as AppNotification[];
  } catch (err) {
    console.warn('Supabase fetch notifications error:', err);
    return null;
  }
}

export async function saveSupabaseNotification(notification: AppNotification): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('notifications').upsert(notification);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase save notification error:', err);
    return false;
  }
}

export async function pruneSupabaseNotifications(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { data: readNotifs } = await supabase
      .from('notifications')
      .select('id')
      .eq('userId', userId)
      .eq('read', true)
      .order('timestamp', { ascending: false });

    if (readNotifs && readNotifs.length > 25) {
      const idsToDelete = readNotifs.slice(25).map(n => n.id);
      await supabase.from('notifications').delete().in('id', idsToDelete);
    }
  } catch (err) {
    console.warn('Supabase prune notifications error:', err);
  }
}

// --- REPORTS ---
export async function fetchSupabaseReports(): Promise<ContentReport[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('reports').select('*');
    if (error) throw error;
    return data as ContentReport[];
  } catch (err) {
    console.warn('Supabase fetch reports error:', err);
    return null;
  }
}

export async function saveSupabaseReport(report: ContentReport): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('reports').upsert(report);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase save report error:', err);
    return false;
  }
}

// --- CONTACT INQUIRIES ---
export async function fetchSupabaseContactInquiries(): Promise<ContactInquiry[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('contact_inquiries').select('*');
    if (error) throw error;
    return data as ContactInquiry[];
  } catch (err) {
    console.warn('Supabase fetch contact inquiries error:', err);
    return null;
  }
}

export async function saveSupabaseContactInquiry(inquiry: ContactInquiry): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('contact_inquiries').upsert(inquiry);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase save contact inquiry error:', err);
    return false;
  }
}

// --- UPLOADED FILES ---
export async function fetchSupabaseUploads(): Promise<UploadedFile[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('uploaded_files').select('*');
    if (error) throw error;
    return data as UploadedFile[];
  } catch (err) {
    console.warn('Supabase fetch uploads error:', err);
    return null;
  }
}

export async function saveSupabaseUpload(file: UploadedFile): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('uploaded_files').upsert(file);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase save upload error:', err);
    return false;
  }
}

export async function deleteSupabaseUpload(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('uploaded_files').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase delete upload error:', err);
    return false;
  }
}

/**
 * Setup Real-time Supabase subscriptions for live updates across all clients.
 */
export function subscribeToSupabaseRealtime(table: string, onChange: (payload: any) => void) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        onChange(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
