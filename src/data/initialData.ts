import type {
  StudentProfile,
  Question,
  Answer,
  Project,
  SchoolEvent,
  AppNotification,
  Conversation,
  Message,
  ContentReport,
  ContactInquiry,
  UploadedFile,
  ActivityEvent
} from '../types/index.ts';

// Clean database-driven initial states (no hardcoded ghost profiles or mock data)
export const INITIAL_STUDENTS: StudentProfile[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_QUESTIONS: Question[] = [];
export const INITIAL_ANSWERS: Answer[] = [];
export const INITIAL_EVENTS: SchoolEvent[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
export const INITIAL_REPORTS: ContentReport[] = [];
export const INITIAL_CONTACT_INQUIRIES: ContactInquiry[] = [];
export const INITIAL_UPLOADED_FILES: UploadedFile[] = [];
export const INITIAL_ACTIVITIES: ActivityEvent[] = [];
