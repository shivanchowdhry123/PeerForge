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
  UploadedFile,
  EventRegistration
} from '../types';

import { sanitizeStudentForDb, sanitizeMessageText } from '../utils/storageOptimizer';

const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return String(import.meta.env[key]).trim().replace(/^["']|["']$/g, '');
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return String(process.env[key]).trim().replace(/^["']|["']$/g, '');
  }
  return '';
};

const SUPABASE_URL =
  getEnvVar('VITE_SUPABASE_URL') ||
  getEnvVar('SUPABASE_URL') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') ||
  'https://placeholder.supabase.co';

const SUPABASE_ANON_KEY =
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  getEnvVar('SUPABASE_ANON_KEY') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  getEnvVar('SUPABASE_PUBLISHABLE_KEY') ||
  'placeholder';

export const SUPABASE_REDIRECT_URL = 'https://peerforgehq.vercel.app';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('placeholder') &&
  !SUPABASE_URL.includes('your-project')
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Resend Supabase signup confirmation email to user.
 */
export async function resendSupabaseConfirmation(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: SUPABASE_REDIRECT_URL
      }
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to resend confirmation email.' };
  }
}

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
    if (!data) return [];
    return data.map((row: any) => {
      const isApproved =
        typeof row.is_approved === 'boolean'
          ? row.is_approved
          : typeof row.isApproved === 'boolean'
          ? row.isApproved
          : row.role === 'teacher'
          ? false
          : true;

      return {
        ...row,
        isApproved,
        defaultTheme: row.defaultTheme || row.default_theme || row.privacySettings?.defaultTheme || 'light'
      };
    }) as StudentProfile[];
  } catch (err) {
    console.warn('Supabase fetch students error:', err);
    return null;
  }
}

// --- TEACHER ACCOUNT APPROVALS ---
export async function fetchSupabasePendingFaculty(): Promise<StudentProfile[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('role', 'teacher');
    if (error) throw error;
    if (!data) return [];
    return data
      .filter((row: any) => row.is_approved === false || row.isApproved === false)
      .map((row: any) => ({
        ...row,
        isApproved: false,
        defaultTheme: row.defaultTheme || row.default_theme || row.privacySettings?.defaultTheme || 'light'
      })) as StudentProfile[];
  } catch (err) {
    console.warn('Supabase fetch pending faculty error:', err);
    return null;
  }
}

export async function updateSupabaseFacultyApproval(teacherId: string, isApproved: boolean): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error: err1 } = await supabase
      .from('students')
      .update({ is_approved: isApproved, isApproved: isApproved })
      .eq('id', teacherId);
    if (!err1) return true;

    const { error: err2 } = await supabase
      .from('students')
      .update({ is_approved: isApproved })
      .eq('id', teacherId);
    if (!err2) return true;

    const { error: err3 } = await supabase
      .from('students')
      .update({ isApproved: isApproved })
      .eq('id', teacherId);
    if (!err3) return true;

    console.warn('Supabase update faculty approval error:', err1 || err2 || err3);
    return false;
  } catch (err) {
    console.warn('Supabase update faculty approval error:', err);
    return false;
  }
}

/**
 * Converts a rejected teacher account into a standard student account in Supabase.
 */
export async function convertSupabaseTeacherToStudent(teacherId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error: err1 } = await supabase
      .from('students')
      .update({
        role: 'student',
        is_approved: true,
        isApproved: true,
        grade: 'Grade 11',
        section: 'A'
      })
      .eq('id', teacherId);
    if (!err1) return true;

    const { error: err2 } = await supabase
      .from('students')
      .update({
        role: 'student',
        is_approved: true,
        grade: 'Grade 11',
        section: 'A'
      })
      .eq('id', teacherId);
    if (!err2) return true;

    console.warn('Supabase convert teacher to student error:', err1 || err2);
    return false;
  } catch (err) {
    console.warn('Supabase convert teacher to student exception:', err);
    return false;
  }
}

export async function saveSupabaseStudent(student: StudentProfile): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const cleanStudent = sanitizeStudentForDb(student);

  // Attempt 1: Standard PostgreSQL snake_case 'default_theme'
  try {
    const { defaultTheme, ...withSnakeCase } = cleanStudent;
    const { error: errSnake } = await supabase.from('students').upsert(withSnakeCase);
    if (!errSnake) return true;

    // Attempt 2: If default_theme column does not exist, try camelCase 'defaultTheme'
    if (errSnake.message?.includes('default_theme') || errSnake.code === 'PGRST204') {
      const { default_theme, ...withCamelCase } = cleanStudent;
      const { error: errCamel } = await supabase.from('students').upsert(withCamelCase);
      if (!errCamel) return true;

      // Attempt 3: If neither root column exists yet, omit both and persist inside privacySettings JSONB
      if (errCamel.message?.includes('defaultTheme') || errCamel.code === 'PGRST204') {
        const { default_theme, defaultTheme, ...safeFallback } = cleanStudent;
        const { error: errFallback } = await supabase.from('students').upsert(safeFallback);
        if (!errFallback) return true;
      }
    }

    console.warn('Supabase save student error:', errSnake);
    return false;
  } catch (err) {
    console.warn('Supabase save student error:', err);
    return false;
  }
}

export async function deleteSupabaseStudent(
  studentId: string,
  studentName?: string,
  studentEmail?: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    let success = false;
    if (studentId) {
      const { error: errId } = await supabase.from('students').delete().eq('id', studentId);
      if (!errId) success = true;
    }
    if (studentEmail) {
      const { error: errEmail } = await supabase.from('students').delete().eq('email', studentEmail);
      if (!errEmail) success = true;
    }
    if (studentName) {
      const { error: errName } = await supabase.from('students').delete().eq('name', studentName);
      if (!errName) success = true;
    }
    return success;
  } catch (err) {
    console.warn('Supabase delete student error:', err);
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

export async function deleteSupabaseProject(projectId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase delete project error:', err);
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

export async function deleteSupabaseEvent(eventId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw error;
    // Also clean up any registrations for this event
    try {
      await supabase.from('event_registrations').delete().eq('event_id', eventId);
    } catch {
      // Ignore cleanup error
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete event error:', err);
    return false;
  }
}

// --- EVENT REGISTRATIONS (RSVP) ---
export async function fetchSupabaseEventRegistrations(): Promise<EventRegistration[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('event_registrations').select('*');
    if (error) throw error;
    if (!data) return [];
    return data.map((row: any) => ({
      id: row.id,
      eventId: row.eventId || row.event_id,
      userId: row.userId || row.user_id,
      userName: row.userName || row.user_name,
      userEmail: row.userEmail || row.user_email,
      createdAt: row.createdAt || row.created_at
    })) as EventRegistration[];
  } catch (err) {
    console.warn('Supabase fetch event registrations note (table may not exist yet):', err);
    return null;
  }
}

export async function saveSupabaseEventRegistration(registration: EventRegistration): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    // Attempt 1: Standard PostgreSQL snake_case
    const payloadSnake = {
      id: registration.id,
      event_id: registration.eventId,
      user_id: registration.userId,
      user_name: registration.userName || '',
      user_email: registration.userEmail || '',
      created_at: registration.createdAt || new Date().toISOString()
    };
    const { error: errSnake } = await supabase.from('event_registrations').upsert(payloadSnake);
    if (!errSnake) return true;

    // Attempt 2: CamelCase
    const payloadCamel = {
      id: registration.id,
      eventId: registration.eventId,
      userId: registration.userId,
      userName: registration.userName || '',
      userEmail: registration.userEmail || '',
      createdAt: registration.createdAt || new Date().toISOString()
    };
    const { error: errCamel } = await supabase.from('event_registrations').upsert(payloadCamel);
    if (!errCamel) return true;

    console.warn('Supabase save event registration error:', errSnake || errCamel);
    return false;
  } catch (err) {
    console.warn('Supabase save event registration exception:', err);
    return false;
  }
}

export async function deleteSupabaseEventRegistration(eventId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    // Attempt 1: Standard snake_case
    const { error: errSnake } = await supabase
      .from('event_registrations')
      .delete()
      .match({ event_id: eventId, user_id: userId });
    if (!errSnake) return true;

    // Attempt 2: CamelCase
    const { error: errCamel } = await supabase
      .from('event_registrations')
      .delete()
      .match({ eventId: eventId, userId: userId });
    if (!errCamel) return true;

    return false;
  } catch (err) {
    console.warn('Supabase delete event registration exception:', err);
    return false;
  }
}

// --- NOTIFICATIONS ---
export async function fetchSupabaseNotifications(userId?: string, userRole?: string): Promise<AppNotification[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    let query = supabase.from('notifications').select('*');
    if (userId) {
      let matchStr = `userId.eq.${userId},userId.eq.all`;
      if (userRole === 'developer' || userRole === 'admin') {
        matchStr += `,userId.eq.developer`;
      }
      if (userRole === 'teacher') {
        matchStr += `,userId.eq.teacher`;
      }
      query = query.or(matchStr);
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

export async function deleteSupabaseNotification(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase delete notification error:', err);
    return false;
  }
}

export async function clearSupabaseNotifications(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('notifications').delete().eq('userId', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase clear notifications error:', err);
    return false;
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
