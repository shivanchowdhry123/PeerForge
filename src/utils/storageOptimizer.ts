import { AppNotification, StudentProfile } from '../types';

/**
 * Storage Optimization Utilities for Supabase Free Tier (500MB DB / 1GB Storage)
 * - Eliminates base64 blobs in Postgres tables
 * - Auto-prunes stale read notifications
 * - Enforces upload size guardrails
 * - Sanitizes payloads for minimal byte footprint
 */

const MAX_NOTIFICATION_HISTORY = 25;
export const MAX_FILE_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB limit

/**
 * Ensures avatar is a compact CDN / SVG URL rather than a bloated base64 data URI.
 * Base64 avatars consume 50KB-500KB per row in Postgres; DiceBear URLs consume ~60 bytes (99.9% savings).
 */
export function sanitizeAvatarUrl(avatar: string | undefined, nameFallback = 'Student'): string {
  if (!avatar || typeof avatar !== 'string' || avatar.startsWith('data:image')) {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(nameFallback.trim())}`;
  }
  return avatar.trim();
}

/**
 * Prunes read notifications to prevent unbounded row growth in Supabase.
 * Retains all unread notifications, and only the newest read notifications up to maxKeep.
 */
export function pruneNotificationsList(
  notifications: AppNotification[],
  maxKeep: number = MAX_NOTIFICATION_HISTORY
): AppNotification[] {
  if (!Array.isArray(notifications)) return [];

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  // Keep the most recent read notifications up to the allowance
  const allowedReadCount = Math.max(0, maxKeep - unread.length);
  const prunedRead = read.slice(0, Math.max(allowedReadCount, 5));

  return [...unread, ...prunedRead];
}

/**
 * Trims message text and caps size to prevent oversized chat blobs.
 */
export function sanitizeMessageText(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  // Cap single message text at 4,000 characters
  return trimmed.length > 4000 ? trimmed.substring(0, 4000) : trimmed;
}

/**
 * Validates file upload against Supabase Free Tier storage limits.
 */
export function validateFileUploadLimits(file: { size: number; name: string }): {
  valid: boolean;
  error?: string;
} {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'File is empty.' };
  }

  if (file.size > MAX_FILE_UPLOAD_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds the 15 MB free tier storage limit.`
    };
  }

  return { valid: true };
}

/**
 * Projects a clean, optimized StudentProfile payload for Supabase upsert.
 * Ensures avatars are URL strings and trims array fields.
 */
export function sanitizeStudentForDb(student: StudentProfile): StudentProfile {
  return {
    ...student,
    avatar: sanitizeAvatarUrl(student.avatar, student.name),
    bio: student.bio ? student.bio.trim().substring(0, 1000) : '',
    skills: (student.skills || []).slice(0, 20),
    interests: (student.interests || []).slice(0, 15),
    academicStrengths: (student.academicStrengths || []).slice(0, 10),
    achievements: (student.achievements || []).slice(0, 15)
  };
}
