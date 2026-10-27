import { StudentProfile, QuestionnaireAnswers, MatchScoreResult, RequestTicket } from '../types';

/**
 * Calculates a match score (0-100) between a user's questionnaire request and a candidate mentor/peer profile.
 */
export function calculateMatchScore(
  profile: StudentProfile,
  answers: QuestionnaireAnswers
): MatchScoreResult {
  let score = 0;
  const matchReasons: string[] = [];

  const subjectLower = answers.subject.trim().toLowerCase();
  const notesLower = (answers.specificTopicNotes || '').toLowerCase();

  // 1. Department match (15 points)
  if (profile.department === answers.department) {
    score += 15;
    matchReasons.push(`Shares specialty in ${answers.department}`);
  }

  // 2. Tutoring Subject direct match (35 points)
  const offersSubject = profile.tutoringSubjects.some(
    (subj) =>
      subj.toLowerCase().includes(subjectLower) ||
      subjectLower.includes(subj.toLowerCase())
  );
  if (offersSubject) {
    score += 35;
    matchReasons.push(`Actively tutors in "${answers.subject}"`);
  }

  // 3. Enrolled or completed coursework match (15 points)
  const courseMatch = profile.enrolledClasses.some(
    (course) =>
      course.toLowerCase().includes(subjectLower) ||
      subjectLower.includes(course.toLowerCase())
  );
  if (courseMatch) {
    score += 15;
    matchReasons.push(`Enrolled in or completed related curriculum`);
  }

  // 4. Skills tags matching notes or subject (15 points)
  const matchingSkills = profile.skills.filter(
    (skill) =>
      subjectLower.includes(skill.name.toLowerCase()) ||
      skill.name.toLowerCase().includes(subjectLower) ||
      (notesLower && notesLower.includes(skill.name.toLowerCase()))
  );
  if (matchingSkills.length > 0) {
    score += Math.min(15, matchingSkills.length * 8);
    matchReasons.push(`Key skill endorsements: ${matchingSkills.map((s) => s.name).join(', ')}`);
  }

  // 5. Grade level preference (10 points)
  if (!answers.targetGrade || answers.targetGrade === 'Any Grade' || profile.grade === answers.targetGrade) {
    score += 10;
    if (answers.targetGrade && answers.targetGrade !== 'Any Grade') {
      matchReasons.push(`Matches requested grade bracket (${profile.grade})`);
    }
  }

  // 6. Availability bonus (10 points)
  if (profile.availability === 'Available Now') {
    score += 10;
    matchReasons.push('Available immediately for sessions');
  } else if (profile.availability === 'Accepting Tutees') {
    score += 8;
    matchReasons.push('Open to new peer tutees');
  }

  // 7. Peer tutor certified bonus (5 bonus points)
  if (profile.isPeerTutorCertified) {
    score += 5;
    matchReasons.push('School-Certified Peer Tutor');
  }

  // Clamp score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  return {
    profile,
    score: finalScore,
    matchReasons,
  };
}

/**
 * Filter and sort student profiles according to user criteria.
 */
export function filterProfiles(
  profiles: StudentProfile[],
  query: string,
  departmentFilter: string,
  gradeFilter: string,
  availabilityFilter: string,
  verifiedOnly: boolean,
  sortBy: string
): StudentProfile[] {
  const cleanQuery = query.trim().toLowerCase();

  const filtered = profiles.filter((p) => {
    // Text search in name, bio, skills, classes
    if (cleanQuery) {
      const nameMatch = p.fullName.toLowerCase().includes(cleanQuery);
      const handleMatch = p.handle.toLowerCase().includes(cleanQuery);
      const bioMatch = p.bio.toLowerCase().includes(cleanQuery);
      const skillMatch = p.skills.some((s) => s.name.toLowerCase().includes(cleanQuery));
      const classMatch = p.enrolledClasses.some((c) => c.toLowerCase().includes(cleanQuery));
      const tutorMatch = p.tutoringSubjects.some((t) => t.toLowerCase().includes(cleanQuery));

      if (!nameMatch && !handleMatch && !bioMatch && !skillMatch && !classMatch && !tutorMatch) {
        return false;
      }
    }

    if (departmentFilter && departmentFilter !== 'All Departments' && p.department !== departmentFilter) {
      return false;
    }

    if (gradeFilter && gradeFilter !== 'All Grades' && p.grade !== gradeFilter) {
      return false;
    }

    if (availabilityFilter && availabilityFilter !== 'All Statuses' && p.availability !== availabilityFilter) {
      return false;
    }

    if (verifiedOnly && !p.isPeerTutorCertified) {
      return false;
    }

    return true;
  });

  // Sorting
  return filtered.sort((a, b) => {
    if (sortBy === 'endorsements') {
      const aEndorsements = a.skills.reduce((sum, s) => sum + s.endorsementsCount, 0);
      const bEndorsements = b.skills.reduce((sum, s) => sum + s.endorsementsCount, 0);
      return bEndorsements - aEndorsements;
    }
    if (sortBy === 'sessions') {
      return b.totalSessionsCompleted - a.totalSessionsCompleted;
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (sortBy === 'name') {
      return a.fullName.localeCompare(b.fullName);
    }
    // Default: 'recommended' - combination of certified tutor + rating + sessions
    const aWeight = (a.isPeerTutorCertified ? 20 : 0) + a.rating * 5 + a.totalSessionsCompleted;
    const bWeight = (b.isPeerTutorCertified ? 20 : 0) + b.rating * 5 + b.totalSessionsCompleted;
    return bWeight - aWeight;
  });
}

/**
 * Filter and sort request tickets for the School Request Board.
 * Supports:
 * - requestQuery: topic, subject, class, description, tags, location
 * - studentQuery: student creator name or helper names in offers
 * - departmentFilter: academic department
 * - urgencyFilter: urgency level
 * - statusFilter: 'Open', 'In Progress', 'Resolved'
 * - gradeFilter: Class/Grade level of creator
 * - offerStatusFilter: 'All', 'Needs Helpers', 'Has Active Offers'
 * - sortBy: 'newest', 'oldest', 'urgency', 'offers'
 */
export function filterRequests(
  requests: RequestTicket[],
  requestQuery: string = '',
  departmentFilter: string = 'All Departments',
  urgencyFilter: string = 'All Urgencies',
  statusFilter: string = 'All Statuses',
  studentQuery: string = '',
  gradeFilter: string = 'All Grades',
  offerStatusFilter: string = 'All',
  sortBy: string = 'newest'
): RequestTicket[] {
  const cleanReqQuery = requestQuery.trim().toLowerCase();
  const cleanStudentQuery = studentQuery.trim().toLowerCase();

  const filtered = requests.filter((req) => {
    // 1. Request details search: subject, title, description, location, tags
    if (cleanReqQuery) {
      const titleMatch = req.title.toLowerCase().includes(cleanReqQuery);
      const descMatch = req.description.toLowerCase().includes(cleanReqQuery);
      const subjMatch = req.subject.toLowerCase().includes(cleanReqQuery);
      const locMatch = req.preferredLocation ? req.preferredLocation.toLowerCase().includes(cleanReqQuery) : false;
      const deptMatch = req.department.toLowerCase().includes(cleanReqQuery);
      const tagMatch = (req.tags || []).some((t) => t.toLowerCase().includes(cleanReqQuery));

      if (!titleMatch && !descMatch && !subjMatch && !locMatch && !deptMatch && !tagMatch) {
        return false;
      }
    }

    // 2. Dedicated student name search: creator name or helper names in offers
    if (cleanStudentQuery) {
      const creatorMatch = req.creatorName.toLowerCase().includes(cleanStudentQuery);
      const helperMatch = (req.offers || []).some((o) =>
        o.helperName.toLowerCase().includes(cleanStudentQuery)
      );

      if (!creatorMatch && !helperMatch) {
        return false;
      }
    }

    // 3. Department filter
    if (departmentFilter && departmentFilter !== 'All Departments' && req.department !== departmentFilter) {
      return false;
    }

    // 4. Urgency filter
    if (urgencyFilter && urgencyFilter !== 'All Urgencies') {
      if (urgencyFilter === 'Critical' || urgencyFilter.includes('Critical')) {
        if (!req.urgency.includes('Critical')) return false;
      } else if (req.urgency !== urgencyFilter) {
        return false;
      }
    }

    // 5. Status filter
    if (statusFilter && statusFilter !== 'All Statuses' && req.status !== statusFilter) {
      return false;
    }

    // 6. Grade filter
    if (gradeFilter && gradeFilter !== 'All Grades') {
      const gradeLower = gradeFilter.toLowerCase();
      const creatorGradeLower = (req.creatorGrade || '').toLowerCase();
      if (!creatorGradeLower.includes(gradeLower) && creatorGradeLower !== gradeLower) {
        return false;
      }
    }

    // 7. Offer status filter ('Needs Helpers' vs 'Has Active Offers')
    if (offerStatusFilter && offerStatusFilter !== 'All' && offerStatusFilter !== 'All Offers') {
      const offersCount = (req.offers || []).length;
      if (offerStatusFilter === 'Needs Helpers' || offerStatusFilter === 'needs-helpers' || offerStatusFilter === 'No Offers') {
        if (offersCount > 0) return false;
      } else if (offerStatusFilter === 'Has Active Offers' || offerStatusFilter === 'has-offers') {
        if (offersCount === 0) return false;
      }
    }

    return true;
  });

  // Urgency weight map for sorting
  const urgencyWeight = (urgency: string): number => {
    if (urgency.includes('Critical')) return 4;
    if (urgency.includes('Urgent')) return 3;
    if (urgency.includes('Standard')) return 2;
    return 1;
  };

  // 8. Sorting
  return filtered.sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'urgency') {
      const weightDiff = urgencyWeight(b.urgency) - urgencyWeight(a.urgency);
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'offers') {
      const offersDiff = (b.offers?.length || 0) - (a.offers?.length || 0);
      if (offersDiff !== 0) return offersDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // Default: 'newest'
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
