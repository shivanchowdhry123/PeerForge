export type GradeLevel = 
  | 'Class 1'
  | 'Class 2'
  | 'Class 3'
  | 'Class 4'
  | 'Class 5'
  | 'Class 6'
  | 'Class 7'
  | 'Class 8'
  | 'Class 9'
  | 'Class 10'
  | 'Class 11'
  | 'Class 12'
  | 'Alumni'
  | 'Faculty & Staff'
  | string;

export const ALL_GRADE_LEVELS: string[] = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'Alumni',
  'Faculty & Staff'
];

export type Department = 
  | 'STEM & Coding'
  | 'Humanities & Writing'
  | 'Languages & Linguistics'
  | 'Visual & Performing Arts'
  | 'Robotics & Engineering'
  | 'Business, Debate & Civics'
  | 'Athletics & Wellness';

export type AvailabilityStatus = 'Available Now' | 'Accepting Tutees' | 'Study Partner Only' | 'Busy / Finals Prep';

export interface SkillTag {
  id: string;
  name: string;
  category: Department;
  endorsementsCount: number;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  handle: string;
  email: string;
  avatarUrl: string;
  grade: GradeLevel;
  department: Department;
  bio: string;
  gpaHonorRoll: boolean;
  isPeerTutorCertified: boolean;
  availability: AvailabilityStatus;
  enrolledClasses: string[];
  skills: SkillTag[];
  tutoringSubjects: string[];
  seekingHelpWith: string[];
  contactMethods: {
    email: string;
    discord?: string;
    campusLocation?: string; // e.g. "Science Wing Lab B", "Library 2nd Floor Study Rm 4"
    phone?: string;
  };
  totalSessionsCompleted: number;
  rating: number; // 1-5
  joinedDate: string;
  isRealRegistration?: boolean;
}

export type UrgencyLevel = 'Critical (Next 24h)' | 'Urgent (2-3 Days)' | 'Standard (This Week)' | 'Ongoing Project';

export type RequestStatus = 'Open' | 'In Progress' | 'Resolved';

export interface HelpOffer {
  id: string;
  helperId: string;
  helperName: string;
  helperAvatar: string;
  helperGrade: GradeLevel;
  message: string;
  contactEmail: string;
  createdAt: string;
}

export interface RequestTicket {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorGrade: GradeLevel;
  title: string;
  description: string;
  subject: string;
  department: Department;
  urgency: UrgencyLevel;
  status: RequestStatus;
  preferredLocation: string;
  createdAt: string;
  offers: HelpOffer[];
  tags: string[];
}

export interface QuestionnaireAnswers {
  needType: 'one-on-one-tutor' | 'study-group' | 'project-partner' | 'exam-cram';
  subject: string;
  department: Department;
  targetGrade?: GradeLevel | 'Any Grade';
  urgency: UrgencyLevel;
  locationPreference: 'In-Person (School Library/Labs)' | 'Virtual (Meet/Discord)' | 'Hybrid / Flexible';
  specificTopicNotes: string;
}

export interface MatchScoreResult {
  profile: StudentProfile;
  score: number; // 0 - 100
  matchReasons: string[];
}

export type NotificationType = 'offer' | 'session' | 'message' | 'endorsement';

export interface AppNotification {
  id: string;
  recipientId: string; // student / teacher ID or 'all'
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  linkTab?: 'directory' | 'requests';
  targetId?: string; // e.g. request ID or message thread ID
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  content: string;
  createdAt: string;
  read: boolean;
}

