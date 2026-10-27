import test from 'node:test';
import assert from 'node:assert/strict';
import { RequestTicket, HelpOffer } from '../types';

function canUserDeleteRequest(
  profile: { userId: string; id: string; fullName: string; grade: string } | null,
  ticket: RequestTicket
): boolean {
  if (!profile) {
    return !ticket.creatorId || ticket.creatorId === 'guest' || ticket.creatorId.startsWith('guest-');
  }
  const isAuthor = Boolean(
    profile.userId === ticket.creatorId ||
    profile.id === ticket.creatorId ||
    (profile.fullName && ticket.creatorName && profile.fullName.trim().toLowerCase() === ticket.creatorName.trim().toLowerCase())
  );
  const isFacultyOrAdmin = Boolean(
    profile.grade === 'Faculty & Staff'
  );
  return isAuthor || isFacultyOrAdmin;
}

function canUserDeleteOffer(
  profile: { userId: string; id: string; fullName: string; grade: string } | null,
  ticket: RequestTicket,
  offer: HelpOffer
): boolean {
  if (!profile) return false;
  return Boolean(
    profile.userId === offer.helperId ||
    profile.id === offer.helperId ||
    (profile.fullName && offer.helperName && profile.fullName.trim().toLowerCase() === offer.helperName.trim().toLowerCase()) ||
    profile.userId === ticket.creatorId ||
    profile.id === ticket.creatorId ||
    profile.grade === 'Faculty & Staff'
  );
}

test('request ticket deletion filters out target request', () => {
  const reqs: RequestTicket[] = [
    {
      id: 'req-1',
      creatorId: 'user-1',
      creatorName: 'Alice',
      creatorAvatar: '',
      creatorGrade: 'Class 11',
      title: 'AP Physics Help',
      description: 'Need help with kinematics',
      subject: 'AP Physics',
      department: 'STEM & Coding',
      urgency: 'Standard (This Week)',
      status: 'Open',
      preferredLocation: 'Library',
      createdAt: new Date().toISOString(),
      offers: [],
      tags: ['Physics']
    },
    {
      id: 'req-2',
      creatorId: 'user-2',
      creatorName: 'Bob',
      creatorAvatar: '',
      creatorGrade: 'Class 10',
      title: 'World History Essay',
      description: 'DBQ thesis feedback',
      subject: 'World History',
      department: 'Humanities & Writing',
      urgency: 'Urgent (2-3 Days)',
      status: 'Open',
      preferredLocation: 'Library',
      createdAt: new Date().toISOString(),
      offers: [],
      tags: ['History']
    }
  ];

  const updated = reqs.filter((r) => r.id !== 'req-1');
  assert.equal(updated.length, 1);
  assert.equal(updated[0].id, 'req-2');
});

test('request offer deletion removes targeted offer message', () => {
  const ticket: RequestTicket = {
    id: 'req-1',
    creatorId: 'user-1',
    creatorName: 'Alice',
    creatorAvatar: '',
    creatorGrade: 'Class 11',
    title: 'AP Physics Help',
    description: 'Kinematics',
    subject: 'Physics',
    department: 'STEM & Coding',
    urgency: 'Standard (This Week)',
    status: 'Open',
    preferredLocation: 'Library',
    createdAt: new Date().toISOString(),
    offers: [
      {
        id: 'off-1',
        helperId: 'helper-1',
        helperName: 'Charlie',
        helperAvatar: '',
        helperGrade: 'Class 12',
        message: 'I can help during 4th period',
        contactEmail: 'charlie@school.edu',
        createdAt: new Date().toISOString()
      },
      {
        id: 'off-2',
        helperId: 'helper-2',
        helperName: 'Diana',
        helperAvatar: '',
        helperGrade: 'Class 11',
        message: 'Free after school today',
        contactEmail: 'diana@school.edu',
        createdAt: new Date().toISOString()
      }
    ],
    tags: []
  };

  const updatedOffers = ticket.offers.filter((o) => o.id !== 'off-1');
  assert.equal(updatedOffers.length, 1);
  assert.equal(updatedOffers[0].id, 'off-2');
});

test('authorization check: only creator or faculty can delete request', () => {
  const ticket: RequestTicket = {
    id: 'req-1',
    creatorId: 'user-100',
    creatorName: 'Maya Lin',
    creatorAvatar: '',
    creatorGrade: 'Class 11',
    title: 'Need Chemistry Lab Partner',
    description: 'Titration experiment prep',
    subject: 'Chemistry',
    department: 'STEM & Coding',
    urgency: 'Urgent (2-3 Days)',
    status: 'Open',
    preferredLocation: 'Science Wing',
    createdAt: new Date().toISOString(),
    offers: [],
    tags: []
  };

  const creatorUser = { userId: 'user-100', id: 'prof-100', fullName: 'Maya Lin', grade: 'Class 11' };
  const anotherStudent = { userId: 'user-200', id: 'prof-200', fullName: 'John Doe', grade: 'Class 10' };
  const facultyUser = { userId: 'user-fac', id: 'prof-fac', fullName: 'Dr. Smith', grade: 'Faculty & Staff' };

  // Creator can delete
  assert.equal(canUserDeleteRequest(creatorUser, ticket), true);
  // Other student cannot delete
  assert.equal(canUserDeleteRequest(anotherStudent, ticket), false);
  // Faculty can delete
  assert.equal(canUserDeleteRequest(facultyUser, ticket), true);
});

test('authorization check: helper or ticket creator can delete offer message', () => {
  const ticket: RequestTicket = {
    id: 'req-1',
    creatorId: 'user-100',
    creatorName: 'Maya Lin',
    creatorAvatar: '',
    creatorGrade: 'Class 11',
    title: 'Chemistry Help',
    description: 'Prep',
    subject: 'Chemistry',
    department: 'STEM & Coding',
    urgency: 'Standard (This Week)',
    status: 'Open',
    preferredLocation: 'Lab',
    createdAt: new Date().toISOString(),
    offers: [],
    tags: []
  };

  const offer: HelpOffer = {
    id: 'off-10',
    helperId: 'helper-50',
    helperName: 'Samir Patel',
    helperAvatar: '',
    helperGrade: 'Class 12',
    message: 'I can assist you with titration formulas',
    contactEmail: 'samir@school.edu',
    createdAt: new Date().toISOString()
  };

  const helperUser = { userId: 'helper-50', id: 'prof-50', fullName: 'Samir Patel', grade: 'Class 12' };
  const ticketCreator = { userId: 'user-100', id: 'prof-100', fullName: 'Maya Lin', grade: 'Class 11' };
  const unrelatedUser = { userId: 'random-99', id: 'prof-99', fullName: 'Alex Wong', grade: 'Class 9' };

  // The helper who posted it can delete it
  assert.equal(canUserDeleteOffer(helperUser, ticket, offer), true);
  // The ticket owner can remove it from their ticket
  assert.equal(canUserDeleteOffer(ticketCreator, ticket, offer), true);
  // Unrelated student cannot delete it
  assert.equal(canUserDeleteOffer(unrelatedUser, ticket, offer), false);
});
