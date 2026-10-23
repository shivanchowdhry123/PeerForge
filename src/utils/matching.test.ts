import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMatchScore, filterProfiles, filterRequests } from './matching';
import { StudentProfile, QuestionnaireAnswers, RequestTicket } from '../types';

const mockProfileA: StudentProfile = {
  id: 'p1',
  userId: 'u1',
  fullName: 'Elena Rostova',
  handle: '@elena_calc',
  email: 'elena.rostova@oakridge.edu',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  grade: 'Grade 12',
  department: 'STEM & Coding',
  bio: 'AP Calculus BC and Physics C TA. Love explaining Taylor series!',
  gpaHonorRoll: true,
  isPeerTutorCertified: true,
  availability: 'Available Now',
  enrolledClasses: ['AP Calculus BC', 'AP Physics C: Mechanics', 'AP Computer Science A'],
  skills: [
    { id: 's1', name: 'Calculus', category: 'STEM & Coding', endorsementsCount: 42 },
    { id: 's2', name: 'Python', category: 'STEM & Coding', endorsementsCount: 18 }
  ],
  tutoringSubjects: ['Calculus BC', 'Precalculus', 'Physics C'],
  seekingHelpWith: ['AP Literature'],
  contactMethods: {
    email: 'elena.rostova@oakridge.edu',
    campusLocation: 'Math Wing Room 204'
  },
  totalSessionsCompleted: 38,
  rating: 4.9,
  joinedDate: '2024-09-01'
};

const mockProfileB: StudentProfile = {
  id: 'p2',
  userId: 'u2',
  fullName: 'Marcus Vance',
  handle: '@marcus_v',
  email: 'marcus.v@oakridge.edu',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  grade: 'Grade 10',
  department: 'Humanities & Writing',
  bio: 'Debate Captain and literary analysis nerd.',
  gpaHonorRoll: true,
  isPeerTutorCertified: false,
  availability: 'Study Partner Only',
  enrolledClasses: ['AP European History', 'Honors English II'],
  skills: [
    { id: 's3', name: 'Essay Writing', category: 'Humanities & Writing', endorsementsCount: 15 }
  ],
  tutoringSubjects: ['World History', 'Rhetoric'],
  seekingHelpWith: ['Chemistry'],
  contactMethods: {
    email: 'marcus.v@oakridge.edu'
  },
  totalSessionsCompleted: 6,
  rating: 4.6,
  joinedDate: '2025-01-10'
};

test('calculateMatchScore rewards subject tutoring, department, availability and certification', () => {
  const answers: QuestionnaireAnswers = {
    needType: 'one-on-one-tutor',
    subject: 'Calculus BC',
    department: 'STEM & Coding',
    targetGrade: 'Grade 12',
    urgency: 'Critical (Next 24h)',
    locationPreference: 'In-Person (School Library/Labs)',
    specificTopicNotes: 'Struggling with infinite series convergence tests'
  };

  const resultA = calculateMatchScore(mockProfileA, answers);
  const resultB = calculateMatchScore(mockProfileB, answers);

  assert.ok(resultA.score >= 80, `Expected Elena to score >= 80 for Calculus BC, got ${resultA.score}`);
  assert.ok(resultB.score < 20, `Expected Marcus to score low for Calculus BC, got ${resultB.score}`);
  assert.ok(resultA.matchReasons.length > 3, 'Expected multiple positive match reasons');
});

test('filterProfiles filters by text query across name, skills, and classes', () => {
  const profiles = [mockProfileA, mockProfileB];

  const searchCalculus = filterProfiles(profiles, 'calculus', 'All Departments', 'All Grades', 'All Statuses', false, 'recommended');
  assert.equal(searchCalculus.length, 1);
  assert.equal(searchCalculus[0].fullName, 'Elena Rostova');

  const searchDebate = filterProfiles(profiles, 'debate', 'All Departments', 'All Grades', 'All Statuses', false, 'recommended');
  assert.equal(searchDebate.length, 1);
  assert.equal(searchDebate[0].fullName, 'Marcus Vance');

  const certifiedOnly = filterProfiles(profiles, '', 'All Departments', 'All Grades', 'All Statuses', true, 'recommended');
  assert.equal(certifiedOnly.length, 1);
  assert.equal(certifiedOnly[0].fullName, 'Elena Rostova');
});

test('filterRequests properly filters by status and urgency', () => {
  const mockTickets: RequestTicket[] = [
    {
      id: 'req1',
      creatorId: 'u10',
      creatorName: 'Sophie Chang',
      creatorAvatar: '',
      creatorGrade: 'Grade 11',
      title: 'Need help with AP Chem equilibrium',
      description: 'Le Chatelier problems for Friday quiz',
      subject: 'AP Chemistry',
      department: 'STEM & Coding',
      urgency: 'Critical (Next 24h)',
      status: 'Open',
      preferredLocation: 'Chemistry Lab Hall',
      createdAt: '2026-10-23T08:00:00Z',
      offers: [],
      tags: ['Chemistry', 'Equilibrium']
    },
    {
      id: 'req2',
      creatorId: 'u11',
      creatorName: 'Leo Morales',
      creatorAvatar: '',
      creatorGrade: 'Grade 9',
      title: 'Looking for French speech practice partner',
      description: 'Preparing for 5-minute oral exam',
      subject: 'French II',
      department: 'Languages & Linguistics',
      urgency: 'Standard (This Week)',
      status: 'Resolved',
      preferredLocation: 'Virtual',
      createdAt: '2026-10-22T10:00:00Z',
      offers: [],
      tags: ['French', 'Pronunciation']
    }
  ];

  const openOnly = filterRequests(mockTickets, '', 'All Departments', 'All Urgencies', 'Open');
  assert.equal(openOnly.length, 1);
  assert.equal(openOnly[0].id, 'req1');

  const criticalOnly = filterRequests(mockTickets, '', 'All Departments', 'Critical (Next 24h)', 'All Statuses');
  assert.equal(criticalOnly.length, 1);
  assert.equal(criticalOnly[0].id, 'req1');
});
