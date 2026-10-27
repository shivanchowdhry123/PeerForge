import { createClient } from '@supabase/supabase-js';
import {
  StudentProfile,
  Project,
  Question,
  Answer,
  Community,
  CommunityPost,
  SchoolEvent,
  AppNotification,
  Conversation,
  Message,
  ContentReport,
  UploadedFile
} from '../types';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
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
 * Handles table synchronization, real-time channels, and robust local/remote fallbacks.
 */

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
    const { error } = await supabase.from('students').upsert(student);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase save student error:', err);
    return false;
  }
}

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
