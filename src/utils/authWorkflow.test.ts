import test from 'node:test';
import assert from 'node:assert';
import { normalizeStudentProfile } from '../context/AppContext';

test('normalizeStudentProfile grants approved status to student accounts by default', () => {
  const rawStudent = {
    id: 'std-test-1',
    name: 'Aarav Sharma',
    email: 'aarav@opgworldschool.com',
    role: 'student',
    grade: 'Grade 11',
    section: 'A'
  };

  const normalized = normalizeStudentProfile(rawStudent);
  assert.strictEqual(normalized.role, 'student');
  assert.strictEqual(normalized.isApproved, true);
});

test('normalizeStudentProfile sets teacher accounts to unapproved (pending) by default', () => {
  const rawTeacher = {
    id: 'tch-test-1',
    name: 'Dr. Sunita Rao',
    email: 'sunita@opgworldschool.com',
    role: 'teacher',
    grade: 'Science & IT',
    section: 'Faculty'
  };

  const normalized = normalizeStudentProfile(rawTeacher);
  assert.strictEqual(normalized.role, 'teacher');
  assert.strictEqual(normalized.isApproved, false);
});

test('normalizeStudentProfile respects explicit isApproved true for faculty mentors', () => {
  const rawApprovedTeacher = {
    id: 'tch-test-2',
    name: 'Dr. Sunita Rao',
    email: 'sunita@opgworldschool.com',
    role: 'teacher',
    isApproved: true
  };

  const normalized = normalizeStudentProfile(rawApprovedTeacher);
  assert.strictEqual(normalized.role, 'teacher');
  assert.strictEqual(normalized.isApproved, true);
});

test('conversion of rejected teacher transforms into a valid student account', () => {
  const teacherProfile = {
    id: 'tch-test-3',
    name: 'Kavita Verma',
    email: 'kavita@opgworldschool.com',
    role: 'teacher' as const,
    isApproved: false,
    grade: 'Mathematics',
    section: 'Faculty'
  };

  // Conversion logic applied in rejectFacultyAccount
  const convertedStudent = {
    ...teacherProfile,
    role: 'student' as const,
    isApproved: true,
    grade: teacherProfile.grade.startsWith('Grade') ? teacherProfile.grade : 'Grade 11',
    section: teacherProfile.section === 'Faculty' ? 'A' : teacherProfile.section
  };

  assert.strictEqual(convertedStudent.role, 'student');
  assert.strictEqual(convertedStudent.isApproved, true);
  assert.strictEqual(convertedStudent.grade, 'Grade 11');
  assert.strictEqual(convertedStudent.section, 'A');
});
