export interface Skill {
  name: string;
  category: 'Technical' | 'Creative' | 'Academic' | 'Leadership & Sports' | 'Other';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  verified: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  gmailAccount?: string;
  password?: string;
  avatar: string;
  grade: string; // e.g. "Grade 11"
  section: string; // "A", "B", "C"
  house?: 'Agni' | 'Vayu' | 'Jal' | 'Prithvi';
  role: 'student' | 'moderator' | 'teacher' | 'admin' | 'developer';
  bio: string;
  skills: Skill[];
  interests: string[];
  academicStrengths: string[];
  projects: Array<{
    id: string;
    title: string;
    description: string;
    role: string;
    status: 'completed' | 'in-progress';
    link?: string;
  }>;
  achievements: Array<{
    title: string;
    issuer: string;
    date: string;
    verified: boolean;
  }>;
  availability: 'Active & Seeking Projects' | 'Open to Collaborate' | 'Focusing on Studies / Busy';
  privacySettings: {
    showGradeToAll: boolean;
    allowDirectMessages: 'anyone' | 'project_partners' | 'verified_only';
    showAchievements: boolean;
  };
  completeness: number;
  isVerified: boolean;
  isApproved: boolean;
  isDeactivated?: boolean;
  joinedDate: string;
}

export interface MessageReaction {
  [emoji: string]: string[]; // emoji -> array of userIds
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  reactions?: MessageReaction;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  readBy: string[];
}

export interface Conversation {
  id: string;
  name?: string;
  isGroup: boolean;
  participantIds: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: string;
  };
  updatedAt: string;
  projectId?: string;
}

export interface Question {
  id: string;
  authorId: string;
  authorName: string;
  authorGrade: string;
  authorAvatar: string;
  title: string;
  body: string;
  topic: string;
  tags: string[];
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
  answersCount: number;
  acceptedAnswerId?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorGrade: string;
  authorAvatar: string;
  body: string;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
  isAccepted: boolean;
}

export interface ProjectRole {
  id: string;
  title: string;
  requiredSkill: string;
  status: 'open' | 'filled';
  assigneeId?: string;
  assigneeName?: string;
}

export interface ProjectApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  studentAvatar: string;
  roleId: string;
  roleTitle: string;
  note: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  approvedBy?: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'reviewed' | 'resolved';
  developerNotes?: string;
  assignedDeveloper?: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  ownerId: string;
  ownerName: string;
  ownerGrade: string;
  ownerAvatar: string;
  teamSize: number;
  deadline: string;
  status: 'recruiting' | 'in-progress' | 'completed';
  requiredSkills: string[];
  openRoles: ProjectRole[];
  members: Array<{
    studentId: string;
    role: string;
    name: string;
    avatar: string;
  }>;
  applications: ProjectApplication[];
  tasks: ProjectTask[];
  updates: Array<{
    id: string;
    date: string;
    text: string;
  }>;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'Official Announcement' | 'Competition' | 'Exhibition' | 'Club Meeting' | 'Workshop';
  description: string;
  organizer: string;
  isOfficial: boolean;
  rsvpCount: number;
  isRsvpd: boolean;
  linkText?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'message' | 'invite' | 'answer' | 'system';
  title: string;
  description: string;
  read: boolean;
  timestamp: string;
  actionTab?: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reportedUserName: string;
  targetType: 'profile' | 'message' | 'question' | 'post';
  targetId: string;
  reason: string;
  details: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  timestamp: string;
}

export interface AIMatchResult {
  student: StudentProfile;
  matchScore: number;
  rationale: string;
  matchingSkills: string[];
  complementaryRole: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  category: 'Project Document' | 'Assignment / Notes' | 'Competition Entry' | 'Code / Technical' | 'Other';
  description?: string;
  projectId?: string;
}
