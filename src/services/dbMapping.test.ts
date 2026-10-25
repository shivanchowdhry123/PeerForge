import test from 'node:test';
import assert from 'node:assert/strict';
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
import { StudentProfile, RequestTicket, AppNotification, DirectMessage } from '../types';

test('profileToDb maps camelCase properties to PostgreSQL lowercase columns', () => {
  const profile: StudentProfile = {
    id: 'p-1',
    userId: 'u-1',
    fullName: 'Shivan Chowdhry',
    handle: '@shivan_c',
    email: 'chowdhryshivan@gmail.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    grade: 'Grade 12',
    department: 'STEM & Coding',
    bio: 'Coding & Physics',
    gpaHonorRoll: true,
    isPeerTutorCertified: true,
    availability: 'Available Now',
    enrolledClasses: ['AP CS', 'Calculus'],
    skills: [{ id: 's1', name: 'TypeScript', category: 'STEM & Coding', endorsementsCount: 5 }],
    tutoringSubjects: ['TypeScript', 'Math'],
    seekingHelpWith: ['French'],
    contactMethods: { email: 'chowdhryshivan@gmail.com', discord: 'shivan#0001' },
    totalSessionsCompleted: 12,
    rating: 4.95,
    joinedDate: '2026-10-24T12:00:00Z',
    isRealRegistration: true
  };

  const dbRow = profileToDb(profile);

  assert.equal(dbRow.id, 'p-1');
  assert.equal(dbRow.userid, 'u-1');
  assert.equal(dbRow.fullname, 'Shivan Chowdhry');
  assert.equal(dbRow.contactmethods.discord, 'shivan#0001');
  assert.equal(dbRow.gpahonorroll, true);
  assert.equal(dbRow.ispeertutorcertified, true);
  assert.equal(dbRow.tutoringsubjects.length, 2);
  assert.equal(dbRow.totalsessionscompleted, 12);
});

test('profileFromDb correctly reconstructs profile from lowercase PostgreSQL columns', () => {
  const dbRow = {
    id: 'p-2',
    userid: 'u-2',
    fullname: 'Elena Rostova',
    handle: '@elena_r',
    email: 'elena@school.edu',
    avatarurl: 'https://example.com/elena.jpg',
    grade: 'Grade 11',
    department: 'STEM & Coding',
    bio: 'Calculus TA',
    gpahonorroll: true,
    ispeertutorcertified: true,
    availability: 'Available Now',
    enrolledclasses: ['AP Calc BC'],
    skills: [{ id: 's2', name: 'Calculus', category: 'STEM & Coding', endorsementsCount: 10 }],
    tutoringsubjects: ['Calculus BC'],
    seekinghelpwith: ['Art'],
    contactmethods: { email: 'elena@school.edu' },
    totalsessionscompleted: 8,
    rating: 5,
    isrealregistration: true,
    joineddate: '2026-10-24T12:00:00Z'
  };

  const p = profileFromDb(dbRow);
  assert.equal(p.id, 'p-2');
  assert.equal(p.userId, 'u-2');
  assert.equal(p.fullName, 'Elena Rostova');
  assert.equal(p.isPeerTutorCertified, true);
  assert.equal(p.contactMethods.email, 'elena@school.edu');
  assert.equal(p.enrolledClasses[0], 'AP Calc BC');
});

test('requestToDb and requestFromDb roundtrip preserve fields correctly', () => {
  const request: RequestTicket = {
    id: 'req-99',
    creatorId: 'u-1',
    creatorName: 'Shivan Chowdhry',
    creatorAvatar: 'https://example.com/a.jpg',
    creatorGrade: 'Grade 12',
    title: 'Need help with AP Chem',
    description: 'Equilibrium calculations',
    subject: 'Chemistry',
    department: 'STEM & Coding',
    urgency: 'Critical (Next 24h)',
    status: 'Open',
    preferredLocation: 'Library',
    tags: ['Chemistry', 'Quiz'],
    offers: [],
    createdAt: '2026-10-24T12:00:00Z'
  };

  const dbRow = requestToDb(request);
  assert.equal(dbRow.creatorid, 'u-1');
  assert.equal(dbRow.creatorname, 'Shivan Chowdhry');

  const back = requestFromDb(dbRow);
  assert.equal(back.id, 'req-99');
  assert.equal(back.creatorName, 'Shivan Chowdhry');
  assert.equal(back.preferredLocation, 'Library');
});
