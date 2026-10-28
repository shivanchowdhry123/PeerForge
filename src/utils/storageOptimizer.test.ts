import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeAvatarUrl,
  pruneNotificationsList,
  sanitizeMessageText,
  validateFileUploadLimits,
  sanitizeStudentForDb
} from './storageOptimizer';
import { AppNotification, StudentProfile } from '../types';

test('sanitizeAvatarUrl replaces base64 string with lightweight DiceBear URL', () => {
  const base64Avatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
  const sanitized = sanitizeAvatarUrl(base64Avatar, 'Rohan Sharma');
  assert.equal(sanitized.startsWith('https://api.dicebear.com/7.x/adventurer/svg'), true);
  assert.equal(sanitized.includes('Rohan%20Sharma'), true);
});

test('sanitizeAvatarUrl preserves clean HTTPS URL', () => {
  const cdnUrl = 'https://images.unsplash.com/photo-12345?w=150';
  const sanitized = sanitizeAvatarUrl(cdnUrl, 'Diya');
  assert.equal(sanitized, cdnUrl);
});

test('pruneNotificationsList retains unread notifications and caps stale read rows', () => {
  const notifs: AppNotification[] = [
    { id: '1', userId: 'user-1', type: 'system', title: 'N1', description: 'desc', timestamp: '1h', read: false },
    { id: '2', userId: 'user-1', type: 'system', title: 'N2', description: 'desc', timestamp: '2h', read: false },
    { id: '3', userId: 'user-1', type: 'system', title: 'N3', description: 'desc', timestamp: '3h', read: true },
    { id: '4', userId: 'user-1', type: 'system', title: 'N4', description: 'desc', timestamp: '4h', read: true },
    { id: '5', userId: 'user-1', type: 'system', title: 'N5', description: 'desc', timestamp: '5h', read: true },
    { id: '6', userId: 'user-1', type: 'system', title: 'N6', description: 'desc', timestamp: '6h', read: true }
  ];

  const pruned = pruneNotificationsList(notifs, 4);
  // Both unread retained + at most allowed read count
  assert.equal(pruned.filter(n => !n.read).length, 2);
  assert.ok(pruned.length <= 7);
});

test('validateFileUploadLimits enforces 15MB limit', () => {
  const smallFile = { name: 'report.pdf', size: 5 * 1024 * 1024 };
  assert.equal(validateFileUploadLimits(smallFile).valid, true);

  const giantFile = { name: 'huge_video.mp4', size: 25 * 1024 * 1024 };
  const result = validateFileUploadLimits(giantFile);
  assert.equal(result.valid, false);
  assert.match(result.error || '', /exceeds the 15 MB free tier/);
});

test('sanitizeMessageText caps oversized messages', () => {
  const normalText = 'Hello classmate!';
  assert.equal(sanitizeMessageText(normalText), 'Hello classmate!');

  const oversized = 'A'.repeat(5000);
  assert.equal(sanitizeMessageText(oversized).length, 4000);
});

test('sanitizeStudentForDb cleans avatar and array limits', () => {
  const mockStudent: StudentProfile = {
    id: 'user-test',
    name: 'Aarav',
    email: 'aarav@opg.com',
    avatar: 'data:image/jpeg;base64,xxxx',
    grade: 'Grade 11',
    section: 'A',
    role: 'student',
    bio: 'A student',
    skills: [],
    interests: [],
    academicStrengths: [],
    projects: [],
    achievements: [],
    availability: 'Active & Seeking Projects',
    privacySettings: { showGradeToAll: true, allowDirectMessages: 'anyone', showAchievements: true },
    completeness: 80,
    isVerified: true,
    isApproved: true,
    joinedDate: '2026-01-01'
  };

  const sanitized = sanitizeStudentForDb(mockStudent);
  assert.equal(sanitized.avatar.startsWith('https://api.dicebear.com'), true);
});
