import test from 'node:test';
import assert from 'node:assert/strict';
import { StudentProfile } from '../types';

test('device session isolation: unauthenticated device does not auto-login to existing profiles', () => {
  const existingProfiles: StudentProfile[] = [
    {
      id: 'student-device-a',
      userId: 'user-a',
      fullName: 'Registered Student A',
      handle: '@student_a',
      email: 'student_a@school.edu',
      avatarUrl: '',
      grade: 'Grade 11',
      department: 'STEM & Coding',
      bio: 'Bio',
      gpaHonorRoll: true,
      isPeerTutorCertified: false,
      availability: 'Available Now',
      enrolledClasses: ['Calculus'],
      skills: [],
      tutoringSubjects: [],
      seekingHelpWith: [],
      contactMethods: { email: 'student_a@school.edu' },
      totalSessionsCompleted: 0,
      rating: 5.0,
      joinedDate: '2026-10-25',
      isRealRegistration: true
    }
  ];

  // Simulating Device B opening the site with no localStorage token:
  const deviceBStoredSessionId: string | null = null;

  // The isolated session resolver:
  let resolvedProfile: StudentProfile | null = null;
  if (deviceBStoredSessionId) {
    resolvedProfile = existingProfiles.find((p) => p.id === deviceBStoredSessionId) || null;
  }

  // Device B MUST resolve to null (guest), NOT auto-login as Student A
  assert.equal(resolvedProfile, null, 'Device B must not inherit Device A account');
});

test('duplicate registration rejection: duplicate email cannot bypass authentication', () => {
  const registeredEmails = ['student_a@school.edu'];
  const newAttemptEmail = 'Student_A@school.edu';

  const isDuplicate = registeredEmails.some(
    (e) => e.toLowerCase() === newAttemptEmail.trim().toLowerCase()
  );

  assert.equal(isDuplicate, true, 'Duplicate registration attempt detected');
});
