import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudentProfile,
  Skill,
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
  ProjectApplication,
  ActivityEvent,
  EventRegistration
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_PROJECTS,
  INITIAL_QUESTIONS,
  INITIAL_ANSWERS,
  INITIAL_EVENTS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_CONTACT_INQUIRIES,
  INITIAL_UPLOADED_FILES,
  INITIAL_ACTIVITIES
} from '../data/initialData';
import {
  supabase,
  isSupabaseConfigured,
  saveSupabaseStudent,
  deleteSupabaseStudent,
  saveSupabaseProject,
  deleteSupabaseProject,
  saveSupabaseQuestion,
  deleteSupabaseQuestion,
  saveSupabaseAnswer,
  deleteSupabaseAnswer,
  saveSupabaseMessage,
  saveSupabaseConversation,
  saveSupabaseEvent,
  deleteSupabaseEvent,
  fetchSupabaseEventRegistrations,
  saveSupabaseEventRegistration,
  deleteSupabaseEventRegistration,
  updateSupabaseFacultyApproval,
  convertSupabaseTeacherToStudent,
  saveSupabaseNotification,
  deleteSupabaseNotification,
  clearSupabaseNotifications,
  saveSupabaseReport,
  saveSupabaseContactInquiry,
  saveSupabaseUpload,
  deleteSupabaseUpload,
  fetchSupabaseStudents,
  fetchSupabaseProjects,
  fetchSupabaseQuestions,
  fetchSupabaseAnswers,
  fetchSupabaseConversations,
  fetchSupabaseMessages,
  fetchSupabaseEvents,
  fetchSupabaseNotifications,
  fetchSupabaseReports,
  fetchSupabaseContactInquiries,
  fetchSupabaseUploads,
  subscribeToSupabaseRealtime,
  resendSupabaseConfirmation
} from '../services/supabaseClient';

interface AppContextType {
  currentUser: StudentProfile | null;
  allStudents: StudentProfile[];
  projects: Project[];
  questions: Question[];
  answers: Answer[];
  events: SchoolEvent[];
  eventRegistrations: EventRegistration[];
  notifications: AppNotification[];
  conversations: Conversation[];
  messages: Message[];
  reports: ContentReport[];
  contactInquiries: ContactInquiry[];
  uploadedFiles: UploadedFile[];
  activities: ActivityEvent[];
  unreadNotifsCount: number;
  unreadMessagesCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedStudentForProfile: StudentProfile | null;
  setSelectedStudentForProfile: (student: StudentProfile | null) => void;
  selectedQuestionForDetail: Question | null;
  setSelectedQuestionForDetail: (q: Question | null) => void;
  selectedProjectForDetail: Project | null;
  setSelectedProjectForDetail: (p: Project | null) => void;
  themeMode: 'light' | 'dark' | 'system';
  theme: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  switchUser: (studentId: string) => void;
  updateCurrentUserProfile: (updated: Partial<StudentProfile>) => void;
  addSkillToCurrent: (skill: Skill) => void;
  removeSkillFromCurrent: (skillName: string) => void;
  sendMessage: (convId: string, text: string, replyTo?: Message['replyTo']) => void;
  openDirectMessageWith: (student: StudentProfile) => void;
  createGroupConversation: (name: string, participantIds: string[], topic?: string) => string;
  reactToMessage: (messageId: string, emoji: string) => void;
  createProject: (newProject: Partial<Project>) => void;
  deleteProject: (projectId: string) => Promise<boolean>;
  applyToProject: (projectId: string, roleId: string, roleTitle: string, note: string) => void;
  handleProjectApplication: (projectId: string, appId: string, action: 'accepted' | 'rejected', declineReason?: string) => void;
  toggleProjectTask: (projectId: string, taskId: string) => void;
  addProjectMilestone: (projectId: string, title: string) => void;
  editProjectMilestone: (projectId: string, taskId: string, newTitle: string) => void;
  deleteProjectMilestone: (projectId: string, taskId: string) => void;
  askQuestion: (newQ: Partial<Question>) => Promise<Question>;
  deleteQuestion: (questionId: string) => Promise<boolean>;
  postAnswer: (questionId: string, body: string) => void;
  deleteAnswer: (answerId: string) => Promise<boolean>;
  upvoteAnswer: (answerId: string) => void;
  acceptAnswer: (questionId: string, answerId: string) => void;
  toggleEventRsvp: (eventId: string) => Promise<boolean>;
  submitContentReport: (report: Partial<ContentReport>) => void;
  resolveReport: (reportId: string, action: 'dismiss' | 'action_taken', note?: string) => void;
  markNotificationsAsRead: () => void;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  clearAllNotifications: () => Promise<boolean>;
  exportMyData: () => void;
  deactivateOwnAccount: () => void;
  reactivateOwnAccount: () => void;
  deleteStudentAccount: (studentId: string, studentName?: string, studentEmail?: string) => Promise<boolean>;
  approveFacultyAccount: (teacherId: string) => Promise<boolean>;
  rejectFacultyAccount: (teacherId: string) => Promise<boolean>;
  addEvent: (eventData: Omit<SchoolEvent, 'id' | 'rsvpCount' | 'isRsvpd'>) => void;
  deleteEvent: (eventId: string) => Promise<boolean>;
  updatePassword: (password: string) => void;
  linkGmailAccount: (gmail: string) => void;
  addNewProfile: (profile: Partial<StudentProfile>) => void;
  submitContactInquiry: (inquiryData: {
    name: string;
    email: string;
    category: string;
    subject: string;
    message: string;
  }) => string;
  resolveContactInquiry: (inquiryId: string, status: 'reviewed' | 'resolved', developerNotes?: string) => void;
  developerAcceptApplication: (projectId: string, appId: string, devNote?: string) => void;
  isDeveloperMode: boolean;
  setIsDeveloperMode: (active: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  activeSearchQuery: string;
  setActiveSearchQuery: (q: string) => void;
  inviteStudentModal: { isOpen: boolean; student: StudentProfile | null };
  setInviteStudentModal: (state: { isOpen: boolean; student: StudentProfile | null }) => void;
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
  isAuthenticated: boolean;
  loginWithGmail: (gmail: string, password?: string) => Promise<{
    success: boolean;
    message: string;
    user?: StudentProfile;
    isEmailUnconfirmed?: boolean;
    unconfirmedEmail?: string;
  }>;
  signUpWithGmail: (data: {
    name: string;
    email: string;
    role: 'student' | 'teacher';
    grade?: string;
    section?: string;
    department?: string;
    password?: string;
    bio?: string;
    skills?: string[];
  }) => Promise<{
    success: boolean;
    message: string;
    user?: StudentProfile;
    requiresEmailConfirmation?: boolean;
    email?: string;
  }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  authRole: 'student' | 'teacher';
  setAuthRole: (role: 'student' | 'teacher') => void;
  openAuthModal: (mode: 'login' | 'signup', role?: 'student' | 'teacher') => void;
  closeAuthModal: () => void;
  uploadFile: (file: File, category: string, description?: string, projectId?: string) => Promise<{ success: boolean; file?: UploadedFile; error?: string }>;
  deleteUploadedFile: (id: string) => Promise<boolean>;
  refreshUploadedFiles: () => Promise<void>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const normalizeStudentProfile = (raw: any): StudentProfile => {
  if (!raw) return raw;
  const theme = raw.defaultTheme || raw.default_theme || raw.privacySettings?.defaultTheme || undefined;
  const isApproved =
    typeof raw.is_approved === 'boolean'
      ? raw.is_approved
      : typeof raw.isApproved === 'boolean'
      ? raw.isApproved
      : raw.role === 'teacher'
      ? false
      : true;

  return {
    ...raw,
    isApproved,
    defaultTheme: theme
  };
};

const SESSION_STORAGE_KEY = 'peerforge_user_session';

const getInitialStoredUser = (): StudentProfile | null => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return normalizeStudentProfile(parsed);
      }
    }
  } catch (err) {
    console.warn('Could not restore user session from localStorage:', err);
  }
  return null;
};

const THEME_MODE_KEY = 'peerforge_theme_mode';

const getInitialThemeMode = (): 'light' | 'dark' | 'system' => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_MODE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    }
  } catch (e) {}
  return 'system';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>(getInitialThemeMode);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Application Data States & Persistent Session
  const [allStudents, setAllStudents] = useState<StudentProfile[]>(() => (isSupabaseConfigured ? [] : INITIAL_STUDENTS));
  const [currentUser, setCurrentUser] = useState<StudentProfile | null>(getInitialStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(getInitialStoredUser()));

  const persistSession = (profile: StudentProfile | null) => {
    try {
      if (typeof window !== 'undefined') {
        if (profile) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const [projects, setProjects] = useState<Project[]>(() => (isSupabaseConfigured ? [] : INITIAL_PROJECTS));
  const [questions, setQuestions] = useState<Question[]>(() => (isSupabaseConfigured ? [] : INITIAL_QUESTIONS));
  const [answers, setAnswers] = useState<Answer[]>(() => (isSupabaseConfigured ? [] : INITIAL_ANSWERS));
  const [events, setEvents] = useState<SchoolEvent[]>(() => (isSupabaseConfigured ? [] : INITIAL_EVENTS));
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(() => (isSupabaseConfigured ? [] : INITIAL_CONVERSATIONS));
  const [messages, setMessages] = useState<Message[]>(() => (isSupabaseConfigured ? [] : INITIAL_MESSAGES));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => (isSupabaseConfigured ? [] : INITIAL_NOTIFICATIONS));
  const [reports, setReports] = useState<ContentReport[]>(() => (isSupabaseConfigured ? [] : INITIAL_REPORTS));
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(() => (isSupabaseConfigured ? [] : INITIAL_CONTACT_INQUIRIES));
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => (isSupabaseConfigured ? [] : INITIAL_UPLOADED_FILES));
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_ACTIVITIES);

  const addActivityEvent = (act: Omit<ActivityEvent, 'id' | 'timestamp' | 'rawTimestamp'>) => {
    const newAct: ActivityEvent = {
      ...act,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Just now',
      rawTimestamp: Date.now()
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<StudentProfile | null>(null);
  const [selectedQuestionForDetail, setSelectedQuestionForDetail] = useState<Question | null>(null);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-1');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [inviteStudentModal, setInviteStudentModal] = useState<{ isOpen: boolean; student: StudentProfile | null }>({
    isOpen: false,
    student: null
  });
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  const toggleSidebar = () => setIsSidebarVisible(prev => !prev);

  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authRole, setAuthRole] = useState<'student' | 'teacher'>('student');

  const openAuthModal = (mode: 'login' | 'signup', role: 'student' | 'teacher' = 'student') => {
    setAuthModalMode(mode);
    setAuthRole(role);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };



  // Synchronize state with Supabase backend database and setup live subscriptions
  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    const unsubscribes: (() => void)[] = [];

    if (isSupabaseConfigured) {
      // 1. Initial Data Fetch from Supabase
      Promise.all([
        fetchSupabaseStudents(),
        fetchSupabaseProjects(),
        fetchSupabaseQuestions(),
        fetchSupabaseAnswers(),
        fetchSupabaseConversations(),
        fetchSupabaseMessages(),
        fetchSupabaseEvents(),
        fetchSupabaseNotifications(),
        fetchSupabaseReports(),
        fetchSupabaseContactInquiries(),
        fetchSupabaseUploads(),
        fetchSupabaseEventRegistrations()
      ]).then(([
        students,
        projs,
        qs,
        ans,
        convs,
        msgs,
        evts,
        notifs,
        reps,
        inquiries,
        uploads,
        registrations
      ]) => {
        if (students !== null) setAllStudents(students);
        if (projs !== null) setProjects(projs);
        if (qs !== null) setQuestions(qs);
        if (ans !== null) setAnswers(ans);
        if (convs !== null) setConversations(convs);
        if (msgs !== null) setMessages(msgs);
        if (evts !== null) setEvents(evts);
        if (notifs !== null) setNotifications(notifs);
        if (reps !== null) setReports(reps);
        if (inquiries !== null) setContactInquiries(inquiries);
        if (uploads !== null) setUploadedFiles(uploads);
        if (registrations !== null) setEventRegistrations(registrations);
      });

      // 2. Auth Session Check & Auth State Change Listener
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const cleanEmail = (session.user.email || '').trim().toLowerCase();
          const { data: sbStudent } = await supabase
            .from('students')
            .select('*')
            .or(`id.eq.${session.user.id},email.ilike.${cleanEmail},email.eq.${cleanEmail}`)
            .maybeSingle();

          if (sbStudent) {
            const student = normalizeStudentProfile(sbStudent);
            setCurrentUser(student);
            setIsAuthenticated(true);
            persistSession(student);
            const storedMode = typeof window !== 'undefined' ? localStorage.getItem(THEME_MODE_KEY) : null;
            if (!storedMode && student.defaultTheme) {
              setThemeModeState(student.defaultTheme);
            }
          }
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          // Do NOT automatically log out if a verified local session is present in storage,
          // because transient auth rejections or table-based logins should stay authenticated.
          const localStored = typeof window !== 'undefined' ? localStorage.getItem(SESSION_STORAGE_KEY) : null;
          if (!localStored) {
            setIsAuthenticated(false);
            setCurrentUser(null);
            // Retain user's current visual theme; do not force reset to light on signout
          }
        } else if (session?.user) {
          const cleanEmail = (session.user.email || '').trim().toLowerCase();
          const { data: sbStudent } = await supabase
            .from('students')
            .select('*')
            .or(`id.eq.${session.user.id},email.ilike.${cleanEmail},email.eq.${cleanEmail}`)
            .maybeSingle();

          if (sbStudent) {
            const student = normalizeStudentProfile(sbStudent);
            setCurrentUser(student);
            setIsAuthenticated(true);
            persistSession(student);
            const storedMode = typeof window !== 'undefined' ? localStorage.getItem(THEME_MODE_KEY) : null;
            if (!storedMode && student.defaultTheme) {
              setThemeModeState(student.defaultTheme);
            }
          } else {
            const cached = getInitialStoredUser();
            if (cached && (cached.email.toLowerCase() === cleanEmail || cached.id === session.user.id)) {
              setCurrentUser(cached);
              setIsAuthenticated(true);
            }
          }
        }
      });
      unsubscribeAuth = () => subscription.unsubscribe();

      // 3. Live Supabase Real-Time Subscriptions for instant multi-user syncing
      unsubscribes.push(
        subscribeToSupabaseRealtime('messages', (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message;
            setMessages(prev => (prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]));
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as Message;
            setMessages(prev => prev.map(m => (m.id === updatedMsg.id ? updatedMsg : m)));
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== payload.old.id));
          }
        })
      );

      unsubscribes.push(
        subscribeToSupabaseRealtime('conversations', (payload) => {
          if (payload.eventType === 'INSERT') {
            const newConv = payload.new as Conversation;
            setConversations(prev => (prev.some(c => c.id === newConv.id) ? prev : [newConv, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const updatedConv = payload.new as Conversation;
            setConversations(prev => prev.map(c => (c.id === updatedConv.id ? updatedConv : c)));
          }
        })
      );

      unsubscribes.push(
        subscribeToSupabaseRealtime('students', (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const student = normalizeStudentProfile(payload.new);
            setAllStudents(prev => {
              const exists = prev.some(s => s.id === student.id);
              return exists ? prev.map(s => (s.id === student.id ? student : s)) : [student, ...prev];
            });
            setCurrentUser(curr => (curr && curr.id === student.id ? student : curr));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setAllStudents(prev => prev.filter(s => s.id !== deletedId));
            }
          }
        })
      );

      unsubscribes.push(
        subscribeToSupabaseRealtime('projects', (payload) => {
          if (payload.eventType === 'INSERT') {
            const newProj = payload.new as Project;
            setProjects(prev => (prev.some(p => p.id === newProj.id) ? prev : [newProj, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const updatedProj = payload.new as Project;
            setProjects(prev => prev.map(p => (p.id === updatedProj.id ? updatedProj : p)));
          }
        })
      );

      unsubscribes.push(
        subscribeToSupabaseRealtime('questions', (payload) => {
          if (payload.eventType === 'INSERT') {
            const newQ = payload.new as Question;
            setQuestions(prev => (prev.some(q => q.id === newQ.id) ? prev : [newQ, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const updatedQ = payload.new as Question;
            setQuestions(prev => prev.map(q => (q.id === updatedQ.id ? updatedQ : q)));
          }
        })
      );

      unsubscribes.push(
        subscribeToSupabaseRealtime('answers', (payload) => {
          if (payload.eventType === 'INSERT') {
            const newA = payload.new as Answer;
            setAnswers(prev => (prev.some(a => a.id === newA.id) ? prev : [...prev, newA]));
          } else if (payload.eventType === 'UPDATE') {
            const updatedA = payload.new as Answer;
            setAnswers(prev => prev.map(a => (a.id === updatedA.id ? updatedA : a)));
          }
        })
      );

      unsubscribes.push(
        subscribeToSupabaseRealtime('notifications', (payload) => {
          if (payload.eventType === 'INSERT') {
            const newN = payload.new as AppNotification;
            setNotifications(prev => (prev.some(n => n.id === newN.id) ? prev : [newN, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const updatedN = payload.new as AppNotification;
            setNotifications(prev => prev.map(n => (n.id === updatedN.id ? updatedN : n)));
          }
        })
      );

      unsubscribes.push(
        subscribeToSupabaseRealtime('contact_inquiries', (payload) => {
          if (payload.eventType === 'INSERT') {
            const newInq = payload.new as ContactInquiry;
            setContactInquiries(prev => (prev.some(i => i.id === newInq.id) ? prev : [newInq, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const updatedInq = payload.new as ContactInquiry;
            setContactInquiries(prev => prev.map(i => (i.id === updatedInq.id ? updatedInq : i)));
          }
        })
      );

      unsubscribes.push(
        subscribeToSupabaseRealtime('uploaded_files', (payload) => {
          if (payload.eventType === 'INSERT') {
            const newFile = payload.new as UploadedFile;
            setUploadedFiles(prev => (prev.some(f => f.id === newFile.id) ? prev : [newFile, ...prev]));
          } else if (payload.eventType === 'DELETE') {
            setUploadedFiles(prev => prev.filter(f => f.id !== payload.old.id));
          }
        })
      );

      unsubscribes.push(
        subscribeToSupabaseRealtime('events', (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEv = payload.new as SchoolEvent;
            setEvents(prev => (prev.some(e => e.id === newEv.id) ? prev : [newEv, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const updatedEv = payload.new as SchoolEvent;
            setEvents(prev => prev.map(e => (e.id === updatedEv.id ? updatedEv : e)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setEvents(prev => prev.filter(e => e.id !== deletedId));
            }
          }
        })
      );

      unsubscribes.push(
        subscribeToSupabaseRealtime('event_registrations', (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReg: EventRegistration = {
              id: payload.new.id,
              eventId: payload.new.eventId || payload.new.event_id,
              userId: payload.new.userId || payload.new.user_id,
              userName: payload.new.userName || payload.new.user_name,
              userEmail: payload.new.userEmail || payload.new.user_email,
              createdAt: payload.new.createdAt || payload.new.created_at
            };
            setEventRegistrations(prev => (prev.some(r => r.id === newReg.id) ? prev : [newReg, ...prev]));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            const deletedEventId = payload.old?.eventId || payload.old?.event_id;
            const deletedUserId = payload.old?.userId || payload.old?.user_id;
            setEventRegistrations(prev =>
              prev.filter(r => {
                if (deletedId && r.id === deletedId) return false;
                if (deletedEventId && deletedUserId && r.eventId === deletedEventId && r.userId === deletedUserId) return false;
                return true;
              })
            );
          }
        })
      );
    } else {
      // Fallback: Local Server API Sync
      Promise.all([
        fetch('/api/students').then(r => r.json()).catch(() => []),
        fetch('/api/projects').then(r => r.json()).catch(() => []),
        fetch('/api/questions').then(r => r.json()).catch(() => []),
        fetch('/api/events').then(r => r.json()).catch(() => []),
        fetch('/api/conversations').then(r => r.json()).catch(() => []),
        fetch('/api/messages').then(r => r.json()).catch(() => []),
        fetch('/api/notifications').then(r => r.json()).catch(() => []),
        fetch('/api/event-registrations').then(r => r.json()).catch(() => [])
      ]).then(([studentsRes, projectsRes, questionsRes, eventsRes, convRes, msgRes, notifRes, eventRegsRes]) => {
        if (Array.isArray(studentsRes) && studentsRes.length > 0) setAllStudents(studentsRes);
        if (Array.isArray(projectsRes) && projectsRes.length > 0) setProjects(projectsRes);
        if (Array.isArray(questionsRes) && questionsRes.length > 0) setQuestions(questionsRes);
        if (Array.isArray(eventsRes) && eventsRes.length > 0) setEvents(eventsRes);
        if (Array.isArray(convRes) && convRes.length > 0) setConversations(convRes);
        if (Array.isArray(msgRes) && msgRes.length > 0) setMessages(msgRes);
        if (Array.isArray(notifRes) && notifRes.length > 0) setNotifications(notifRes);
        if (Array.isArray(eventRegsRes) && eventRegsRes.length > 0) setEventRegistrations(eventRegsRes);
      });
    }

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Theme Sync on user account load
  useEffect(() => {
    if (currentUser) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(THEME_MODE_KEY) : null;
      if (!stored) {
        const preferred =
          currentUser.defaultTheme ||
          (currentUser as any).default_theme ||
          currentUser.privacySettings?.defaultTheme;
        if (preferred === 'light' || preferred === 'dark' || preferred === 'system') {
          setThemeModeState(preferred);
        }
      }
    }
  }, [currentUser?.id]);

  // Resolve active visual theme (light or dark) based on themeMode & system preference
  useEffect(() => {
    const applyResolvedTheme = () => {
      let resolved: 'light' | 'dark' = 'light';
      if (themeMode === 'light') {
        resolved = 'light';
      } else if (themeMode === 'dark') {
        resolved = 'dark';
      } else {
        const isSystemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = isSystemDark ? 'dark' : 'light';
      }

      setTheme(resolved);
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyResolvedTheme();

    if (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const resolved = e.matches ? 'dark' : 'light';
        setTheme(resolved);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else if ((mediaQuery as any).addListener) {
        (mediaQuery as any).addListener(handleSystemThemeChange);
        return () => (mediaQuery as any).removeListener(handleSystemThemeChange);
      }
    }
  }, [themeMode]);

  const setThemeMode = (mode: 'light' | 'dark' | 'system') => {
    setThemeModeState(mode);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_MODE_KEY, mode);
      }
    } catch (e) {}
    if (currentUser) {
      updateCurrentUserProfile({ defaultTheme: mode });
    }
  };

  const toggleTheme = () => {
    const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setThemeMode(nextMode);
  };

  const switchUser = (studentId: string) => {
    const s = allStudents.find(item => item.id === studentId);
    if (s) {
      const normalized = normalizeStudentProfile(s);
      setCurrentUser(normalized);
      setIsAuthenticated(true);
      persistSession(normalized);
      const pref = normalized.defaultTheme || 'system';
      setThemeModeState(pref as 'light' | 'dark' | 'system');
    }
  };

  const updateCurrentUserProfile = (updated: Partial<StudentProfile>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updated };

    let comp = 50;
    if (updatedUser.bio && updatedUser.bio.length > 20) comp += 15;
    if (updatedUser.skills && updatedUser.skills.length >= 3) comp += 15;
    if (updatedUser.interests && updatedUser.interests.length >= 2) comp += 10;
    if (updatedUser.projects && updatedUser.projects.length >= 1) comp += 10;
    updatedUser.completeness = Math.min(100, comp);

    setCurrentUser(updatedUser);
    persistSession(updatedUser);
    setAllStudents(prev => prev.map(s => (s.id === currentUser.id ? updatedUser : s)));

    if (isSupabaseConfigured) {
      saveSupabaseStudent(updatedUser);
    }
  };

  const addSkillToCurrent = (skill: Skill) => {
    if (!currentUser) return;
    if (currentUser.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) return;
    const updatedSkills = [...currentUser.skills, skill];
    updateCurrentUserProfile({ skills: updatedSkills });
  };

  const removeSkillFromCurrent = (skillName: string) => {
    if (!currentUser) return;
    const updatedSkills = currentUser.skills.filter(s => s.name !== skillName);
    updateCurrentUserProfile({ skills: updatedSkills });
  };

  const sendMessage = (convId: string, text: string, replyTo?: Message['replyTo']) => {
    if (!text.trim() || !currentUser) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
      replyTo,
      readBy: [currentUser.id]
    };

    setMessages(prev => [...prev, newMsg]);

    const targetConv = conversations.find(c => c.id === convId);
    if (targetConv) {
      const updatedConv: Conversation = {
        ...targetConv,
        lastMessage: {
          text: newMsg.text,
          senderId: currentUser.id,
          timestamp: newMsg.timestamp
        },
        updatedAt: new Date().toISOString()
      };
      setConversations(prev => prev.map(c => (c.id === convId ? updatedConv : c)));
      if (isSupabaseConfigured) {
        saveSupabaseConversation(updatedConv);
      }
    }

    if (isSupabaseConfigured) {
      saveSupabaseMessage(newMsg);
    }
  };

  const openDirectMessageWith = (student: StudentProfile) => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    let conv = conversations.find(
      c => !c.isGroup && c.participantIds.includes(currentUser.id) && c.participantIds.includes(student.id)
    );

    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        isGroup: false,
        participantIds: [currentUser.id, student.id],
        updatedAt: new Date().toISOString(),
        lastMessage: {
          text: `Conversation started with ${student.name}`,
          senderId: currentUser.id,
          timestamp: 'Just now'
        }
      };
      setConversations(prev => [conv!, ...prev]);
      if (isSupabaseConfigured) {
        saveSupabaseConversation(conv);
      }
    }

    setActiveConversationId(conv.id);
    setActiveTab('messages');
  };

  const createGroupConversation = (name: string, participantIds: string[], topic?: string): string => {
    if (!currentUser) return '';
    const allParticipants = Array.from(new Set([currentUser.id, ...participantIds]));
    const newGroup: Conversation = {
      id: `conv-group-${Date.now()}`,
      name,
      isGroup: true,
      participantIds: allParticipants,
      updatedAt: new Date().toISOString(),
      lastMessage: {
        text: `Group "${name}" created by ${currentUser.name}${topic ? ` (${topic})` : ''}`,
        senderId: currentUser.id,
        timestamp: 'Just now'
      }
    };

    setConversations(prev => [newGroup, ...prev]);
    setActiveConversationId(newGroup.id);
    setActiveTab('messages');

    const initialMsg: Message = {
      id: `msg-init-${Date.now()}`,
      conversationId: newGroup.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: `Created group channel "${name}". Welcome team!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
      readBy: [currentUser.id]
    };
    setMessages(prev => [...prev, initialMsg]);

    if (isSupabaseConfigured) {
      saveSupabaseConversation(newGroup);
      saveSupabaseMessage(initialMsg);
    }

    return newGroup.id;
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    if (!currentUser) return;
    let targetMsg: Message | undefined;

    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId) {
          const reactions = { ...(m.reactions || {}) };
          if (!reactions[emoji]) reactions[emoji] = [];
          const idx = reactions[emoji].indexOf(currentUser.id);
          if (idx > -1) {
            reactions[emoji].splice(idx, 1);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            reactions[emoji].push(currentUser.id);
          }
          targetMsg = { ...m, reactions };
          return targetMsg;
        }
        return m;
      })
    );

    if (isSupabaseConfigured && targetMsg) {
      saveSupabaseMessage(targetMsg);
    }
  };

  const createProject = (newProject: Partial<Project>) => {
    if (!currentUser) return;
    const project: Project = {
      id: `project-${Date.now()}`,
      title: newProject.title || 'Untitled Project',
      description: newProject.description || '',
      category: newProject.category || 'General Innovation',
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerGrade: currentUser.grade,
      ownerAvatar: currentUser.avatar,
      teamSize: (newProject.openRoles?.length || 2) + 1,
      deadline: newProject.deadline || '2026-12-31',
      status: 'recruiting',
      requiredSkills: newProject.requiredSkills || [],
      openRoles: newProject.openRoles || [
        { id: `role-${Date.now()}-1`, title: 'Core Collaborator', requiredSkill: 'Teamwork', status: 'open' }
      ],
      members: [
        { studentId: currentUser.id, role: 'Project Owner', name: currentUser.name, avatar: currentUser.avatar }
      ],
      applications: [],
      tasks: [
        { id: `task-${Date.now()}-1`, title: 'Form team & establish project goals', completed: false }
      ],
      updates: [
        { id: `up-${Date.now()}-1`, date: 'Today', text: 'Project created on OPG Connect.' }
      ]
    };

    setProjects(prev => [project, ...prev]);

    const groupConv: Conversation = {
      id: `conv-proj-${project.id}`,
      name: `${project.title} (Team)`,
      isGroup: true,
      projectId: project.id,
      participantIds: [currentUser.id],
      updatedAt: new Date().toISOString(),
      lastMessage: {
        text: 'Project collaboration channel initialized.',
        senderId: currentUser.id,
        timestamp: 'Just now'
      }
    };
    setConversations(prev => [groupConv, ...prev]);

    if (isSupabaseConfigured) {
      saveSupabaseProject(project);
      saveSupabaseConversation(groupConv);
    }

    addActivityEvent({
      type: 'project_posted',
      title: '🚀 New Project Posted',
      description: `${currentUser.name} launched "${project.title}" under ${project.category}`,
      actorName: currentUser.name,
      actorAvatar: currentUser.avatar,
      projectId: project.id,
      projectTitle: project.title
    });
  };

  const applyToProject = (projectId: string, roleId: string, roleTitle: string, note: string) => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    const appItem = {
      id: `app-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentGrade: currentUser.grade,
      studentAvatar: currentUser.avatar,
      roleId,
      roleTitle,
      note,
      status: 'pending' as const,
      createdAt: 'Just now'
    };

    let updatedProject: Project | undefined;

    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          updatedProject = {
            ...p,
            applications: [...p.applications, appItem]
          };
          return updatedProject;
        }
        return p;
      })
    );

    if (isSupabaseConfigured && updatedProject) {
      saveSupabaseProject(updatedProject);
    }
  };

  const handleProjectApplication = (
    projectId: string,
    appId: string,
    action: 'accepted' | 'rejected',
    declineReason?: string
  ) => {
    if (!currentUser) return;

    let targetApp: ProjectApplication | undefined;
    let targetProj: Project | undefined;

    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          const isDev = currentUser.role === 'developer';
          const approvedByNote = isDev && p.ownerId !== currentUser.id
            ? `Lead Developer (${currentUser.name})`
            : p.ownerName;

          const foundApp = p.applications.find(a => a.id === appId);
          if (foundApp) targetApp = foundApp;

          const updatedApps = p.applications.map(a =>
            a.id === appId
              ? {
                  ...a,
                  status: action,
                  approvedBy: action === 'accepted' ? approvedByNote : undefined,
                  declineReason: action === 'rejected' ? (declineReason || 'Position filled or candidate selection completed.') : undefined
                }
              : a
          );

          let updatedMembers = [...p.members];
          let updatedRoles = [...p.openRoles];

          if (action === 'accepted' && foundApp) {
            if (!updatedMembers.some(m => m.studentId === foundApp.studentId)) {
              updatedMembers.push({
                studentId: foundApp.studentId,
                role: foundApp.roleTitle,
                name: foundApp.studentName,
                avatar: foundApp.studentAvatar
              });
            }
            updatedRoles = updatedRoles.map(r =>
              r.id === foundApp.roleId || r.title.toLowerCase() === foundApp.roleTitle.toLowerCase()
                ? { ...r, status: 'filled' as const, assigneeId: foundApp.studentId, assigneeName: foundApp.studentName }
                : r
            );
          }

          const updated = {
            ...p,
            applications: updatedApps,
            members: updatedMembers,
            openRoles: updatedRoles
          };
          targetProj = updated;
          return updated;
        }
        return p;
      })
    );

    const proj = targetProj || projects.find(p => p.id === projectId);
    const app = targetApp || proj?.applications.find(a => a.id === appId);

    if (proj && app) {
      const isDev = currentUser.role === 'developer';
      const approvedByNote = isDev && proj.ownerId !== currentUser.id
        ? `Lead Developer (${currentUser.name})`
        : proj.ownerName;

      const updatedApps = proj.applications.map(a =>
        a.id === appId
          ? {
              ...a,
              status: action,
              approvedBy: action === 'accepted' ? approvedByNote : undefined,
              declineReason: action === 'rejected' ? (declineReason || 'Position filled or candidate selection completed.') : undefined
            }
          : a
      );

      let updatedMembers = [...proj.members];
      let updatedRoles = [...proj.openRoles];

      if (action === 'accepted') {
        if (!updatedMembers.some(m => m.studentId === app.studentId)) {
          updatedMembers.push({
            studentId: app.studentId,
            role: app.roleTitle,
            name: app.studentName,
            avatar: app.studentAvatar
          });
        }
        updatedRoles = updatedRoles.map(r =>
          r.id === app.roleId || r.title.toLowerCase() === app.roleTitle.toLowerCase()
            ? { ...r, status: 'filled' as const, assigneeId: app.studentId, assigneeName: app.studentName }
            : r
        );
      }

      const updatedProjObj: Project = {
        ...proj,
        applications: updatedApps,
        members: updatedMembers,
        openRoles: updatedRoles
      };

      setSelectedProjectForDetail(prev => (prev?.id === projectId ? updatedProjObj : prev));

      if (isSupabaseConfigured) {
        saveSupabaseProject(updatedProjObj);
      }

      if (action === 'accepted') {
        // Add candidate to team chat conversation
        let teamConv = conversations.find(c => c.projectId === projectId || c.id === `conv-proj-${projectId}`);
        if (teamConv) {
          const newParticipants = Array.from(new Set([...teamConv.participantIds, app.studentId]));
          const updatedConv: Conversation = {
            ...teamConv,
            participantIds: newParticipants,
            lastMessage: {
              text: `🎉 ${app.studentName} joined the team as ${app.roleTitle}!`,
              senderId: currentUser.id,
              timestamp: 'Just now'
            },
            updatedAt: new Date().toISOString()
          };
          setConversations(prev => prev.map(c => (c.id === teamConv!.id ? updatedConv : c)));
          if (isSupabaseConfigured) saveSupabaseConversation(updatedConv);

          const welcomeMsg: Message = {
            id: `msg-welcome-${Date.now()}`,
            conversationId: teamConv.id,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            text: `🎉 ${app.studentName} has been accepted into the team as ${app.roleTitle}! Welcome to the team!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: {},
            readBy: [currentUser.id]
          };
          setMessages(prev => [...prev, welcomeMsg]);
          if (isSupabaseConfigured) saveSupabaseMessage(welcomeMsg);
        }

        // Add project to student profile
        setAllStudents(prev =>
          prev.map(s => {
            if (s.id === app.studentId) {
              const existingProjs = s.projects || [];
              const newProjObj = {
                id: proj.id,
                title: proj.title,
                description: proj.description,
                role: app.roleTitle,
                status: 'in-progress' as const
              };
              const updatedProjs = existingProjs.some(p => p.id === proj.id)
                ? existingProjs.map(p => (p.id === proj.id ? { ...p, role: app.roleTitle } : p))
                : [...existingProjs, newProjObj];
              const updatedStudent: StudentProfile = { ...s, projects: updatedProjs };
              if (isSupabaseConfigured) saveSupabaseStudent(updatedStudent);
              return updatedStudent;
            }
            return s;
          })
        );

        // Send acceptance notification to candidate
        const acceptNotif: AppNotification = {
          id: `notif-app-accept-${Date.now()}`,
          userId: app.studentId,
          type: 'invite',
          title: `🎉 Application Accepted: ${proj.title}`,
          description: `Congratulations! Your application for "${app.roleTitle}" was accepted by ${approvedByNote}. You have been added to the team chat and project showcase!`,
          read: false,
          timestamp: 'Just now',
          actionTab: 'projects'
        };
        setNotifications(prev => [acceptNotif, ...prev]);
        if (isSupabaseConfigured) saveSupabaseNotification(acceptNotif);

        addActivityEvent({
          type: 'team_accepted',
          title: '🤝 Team Role Accepted',
          description: `${app.studentName} joined "${proj.title}" as ${app.roleTitle}`,
          actorName: app.studentName,
          actorAvatar: app.studentAvatar,
          projectId: proj.id,
          projectTitle: proj.title
        });
      } else {
        // REJECTED: Send decline notification to candidate
        const reasonText = declineReason || 'Position filled or candidate selection completed.';
        const declineNotif: AppNotification = {
          id: `notif-app-decline-${Date.now()}`,
          userId: app.studentId,
          type: 'system',
          title: `Application Update: ${proj.title}`,
          description: `Your application for "${app.roleTitle}" was declined. Reason: "${reasonText}"`,
          read: false,
          timestamp: 'Just now',
          actionTab: 'projects'
        };
        setNotifications(prev => [declineNotif, ...prev]);
        if (isSupabaseConfigured) saveSupabaseNotification(declineNotif);
      }
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    if (!currentUser) return false;

    setProjects(prev => prev.filter(p => p.id !== projectId));
    setSelectedProjectForDetail(prev => (prev?.id === projectId ? null : prev));

    if (isSupabaseConfigured) {
      await deleteSupabaseProject(projectId);
    }
    return true;
  };

  const developerAcceptApplication = (projectId: string, appId: string, devNote?: string) => {
    handleProjectApplication(projectId, appId, 'accepted', devNote);
  };

  const toggleProjectTask = (projectId: string, taskId: string) => {
    let toggledToCompleted = false;
    let milestoneTitle = '';
    let targetProjTitle = '';

    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          targetProjTitle = p.title;
          const targetTask = p.tasks.find(t => t.id === taskId);
          if (targetTask && !targetTask.completed) {
            toggledToCompleted = true;
            milestoneTitle = targetTask.title;
          }
          return {
            ...p,
            tasks: p.tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
          };
        }
        return p;
      })
    );

    setSelectedProjectForDetail(prev => {
      if (prev?.id === projectId) {
        const updated = {
          ...prev,
          tasks: prev.tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
        };
        if (isSupabaseConfigured) saveSupabaseProject(updated);
        return updated;
      }
      return prev;
    });

    if (toggledToCompleted && milestoneTitle) {
      addActivityEvent({
        type: 'milestone_reached',
        title: '🎉 Milestone Reached',
        description: `Reached milestone "${milestoneTitle}" on "${targetProjTitle || 'Project'}"`,
        actorName: currentUser?.name || 'Project Lead',
        actorAvatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leader',
        projectId,
        projectTitle: targetProjTitle
      });
    }
  };

  const addProjectMilestone = (projectId: string, title: string) => {
    if (!title.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      completed: false
    };

    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            tasks: [...p.tasks, newTask]
          };
        }
        return p;
      })
    );

    setSelectedProjectForDetail(prev => {
      if (prev?.id === projectId) {
        const updated = {
          ...prev,
          tasks: [...prev.tasks, newTask]
        };
        if (isSupabaseConfigured) saveSupabaseProject(updated);
        return updated;
      }
      return prev;
    });
  };

  const editProjectMilestone = (projectId: string, taskId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            tasks: p.tasks.map(t => (t.id === taskId ? { ...t, title: newTitle.trim() } : t))
          };
        }
        return p;
      })
    );

    setSelectedProjectForDetail(prev => {
      if (prev?.id === projectId) {
        const updated = {
          ...prev,
          tasks: prev.tasks.map(t => (t.id === taskId ? { ...t, title: newTitle.trim() } : t))
        };
        if (isSupabaseConfigured) saveSupabaseProject(updated);
        return updated;
      }
      return prev;
    });
  };

  const deleteProjectMilestone = (projectId: string, taskId: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            tasks: p.tasks.filter(t => t.id !== taskId)
          };
        }
        return p;
      })
    );

    setSelectedProjectForDetail(prev => {
      if (prev?.id === projectId) {
        const updated = {
          ...prev,
          tasks: prev.tasks.filter(t => t.id !== taskId)
        };
        if (isSupabaseConfigured) saveSupabaseProject(updated);
        return updated;
      }
      return prev;
    });
  };

  const askQuestion = async (newQ: Partial<Question>): Promise<Question> => {
    if (!currentUser) throw new Error('Authentication required');
    const q: Question = {
      id: `q-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorGrade: currentUser.grade,
      authorAvatar: currentUser.avatar,
      title: newQ.title || '',
      body: newQ.body || '',
      topic: newQ.topic || 'General',
      tags: newQ.tags || ['Academics'],
      createdAt: 'Just now',
      upvotes: 0,
      upvotedBy: [],
      answersCount: 0
    };

    setQuestions(prev => [q, ...prev]);

    if (isSupabaseConfigured) {
      await saveSupabaseQuestion(q);
    }

    return q;
  };

  const deleteQuestion = async (questionId: string): Promise<boolean> => {
    if (!currentUser) return false;

    // Remove question
    setQuestions(prev => prev.filter(q => q.id !== questionId));

    // Remove associated answers
    setAnswers(prev => prev.filter(a => a.questionId !== questionId));

    // If currently viewing details of this question, exit detail view
    setSelectedQuestionForDetail(prev => (prev?.id === questionId ? null : prev));

    if (isSupabaseConfigured) {
      await deleteSupabaseQuestion(questionId);
    }
    return true;
  };

  const postAnswer = (questionId: string, body: string) => {
    if (!body.trim() || !currentUser) return;

    const newAns: Answer = {
      id: `ans-${Date.now()}`,
      questionId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorGrade: currentUser.grade,
      authorAvatar: currentUser.avatar,
      body: body.trim(),
      createdAt: 'Just now',
      upvotes: 0,
      upvotedBy: [],
      isAccepted: false
    };

    setAnswers(prev => [...prev, newAns]);

    let updatedQ: Question | undefined;
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          updatedQ = { ...q, answersCount: q.answersCount + 1 };
          return updatedQ;
        }
        return q;
      })
    );

    if (isSupabaseConfigured) {
      saveSupabaseAnswer(newAns);
      if (updatedQ) saveSupabaseQuestion(updatedQ);
    }
  };

  const deleteAnswer = async (answerId: string): Promise<boolean> => {
    if (!currentUser) return false;

    const target = answers.find(a => a.id === answerId);
    if (!target) return false;

    const qId = target.questionId;

    setAnswers(prev => prev.filter(a => a.id !== answerId));

    let updatedQ: Question | undefined;
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === qId) {
          updatedQ = {
            ...q,
            answersCount: Math.max(0, q.answersCount - 1),
            acceptedAnswerId: q.acceptedAnswerId === answerId ? undefined : q.acceptedAnswerId
          };
          return updatedQ;
        }
        return q;
      })
    );

    setSelectedQuestionForDetail(prev => {
      if (prev && prev.id === qId) {
        return {
          ...prev,
          answersCount: Math.max(0, prev.answersCount - 1),
          acceptedAnswerId: prev.acceptedAnswerId === answerId ? undefined : prev.acceptedAnswerId
        };
      }
      return prev;
    });

    if (isSupabaseConfigured) {
      await deleteSupabaseAnswer(answerId);
      if (updatedQ) saveSupabaseQuestion(updatedQ);
    }

    return true;
  };

  const upvoteAnswer = (answerId: string) => {
    if (!currentUser) return;
    let updatedAns: Answer | undefined;

    setAnswers(prev =>
      prev.map(a => {
        if (a.id === answerId) {
          const idx = a.upvotedBy.indexOf(currentUser.id);
          const upvotedBy = [...a.upvotedBy];
          let upvotes = a.upvotes;
          if (idx > -1) {
            upvotedBy.splice(idx, 1);
            upvotes = Math.max(0, upvotes - 1);
          } else {
            upvotedBy.push(currentUser.id);
            upvotes += 1;
          }
          updatedAns = { ...a, upvotes, upvotedBy };
          return updatedAns;
        }
        return a;
      })
    );

    if (isSupabaseConfigured && updatedAns) {
      saveSupabaseAnswer(updatedAns);
    }
  };

  const acceptAnswer = (questionId: string, answerId: string) => {
    let updatedQ: Question | undefined;
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          updatedQ = { ...q, acceptedAnswerId: answerId };
          return updatedQ;
        }
        return q;
      })
    );

    setAnswers(prev =>
      prev.map(a => {
        if (a.questionId === questionId) {
          const updatedA = { ...a, isAccepted: a.id === answerId };
          if (isSupabaseConfigured) saveSupabaseAnswer(updatedA);
          return updatedA;
        }
        return a;
      })
    );

    if (isSupabaseConfigured && updatedQ) {
      saveSupabaseQuestion(updatedQ);
    }
  };

  const toggleEventRsvp = async (eventId: string): Promise<boolean> => {
    if (!currentUser) {
      openAuthModal('login');
      return false;
    }

    const isRegistered = eventRegistrations.some(
      r => r.eventId === eventId && (r.userId === currentUser.id || (currentUser.email && r.userEmail === currentUser.email))
    );

    if (isRegistered) {
      // Deregister: Remove registration record
      setEventRegistrations(prev =>
        prev.filter(r => !(r.eventId === eventId && (r.userId === currentUser.id || (currentUser.email && r.userEmail === currentUser.email))))
      );

      if (isSupabaseConfigured) {
        await deleteSupabaseEventRegistration(eventId, currentUser.id);
      } else {
        fetch(`/api/event-registrations/${eventId}/${currentUser.id}`, { method: 'DELETE' }).catch(() => {});
      }
      return true;
    } else {
      // Register: Create persistent registration record
      const newReg: EventRegistration = {
        id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        eventId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        createdAt: new Date().toISOString()
      };

      setEventRegistrations(prev => [newReg, ...prev]);

      if (isSupabaseConfigured) {
        await saveSupabaseEventRegistration(newReg);
      } else {
        fetch('/api/event-registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReg)
        }).catch(() => {});
      }
      return true;
    }
  };

  const submitContentReport = (report: Partial<ContentReport>) => {
    if (!currentUser) return;
    const newRep: ContentReport = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser.id,
      reportedUserId: report.reportedUserId || 'unknown',
      reportedUserName: report.reportedUserName || 'Student',
      targetType: report.targetType || 'profile',
      targetId: report.targetId || 'unknown',
      reason: report.reason || 'Guidelines violation',
      details: report.details || '',
      status: 'pending',
      timestamp: new Date().toLocaleDateString()
    };
    setReports(prev => [newRep, ...prev]);

    if (isSupabaseConfigured) {
      saveSupabaseReport(newRep);
    }
  };

  const resolveReport = (reportId: string, action: 'dismiss' | 'action_taken', note?: string) => {
    let updatedRep: ContentReport | undefined;
    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          updatedRep = { ...r, status: action === 'dismiss' ? 'dismissed' : 'action_taken' };
          return updatedRep;
        }
        return r;
      })
    );

    if (isSupabaseConfigured && updatedRep) {
      saveSupabaseReport(updatedRep);
    }
  };

  const markNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev =>
      prev.map(n => {
        const updatedN = { ...n, read: true };
        if (isSupabaseConfigured) saveSupabaseNotification(updatedN);
        return updatedN;
      })
    );
  };

  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (isSupabaseConfigured) {
      await deleteSupabaseNotification(notificationId);
    }
    return true;
  };

  const clearAllNotifications = async (): Promise<boolean> => {
    if (!currentUser) return false;
    const currentUserId = currentUser.id;
    setNotifications(prev =>
      prev.filter(n => {
        if (!n) return false;
        // Keep notifications not intended specifically for this user
        if (n.userId === currentUserId) return false;
        return true;
      })
    );
    if (isSupabaseConfigured) {
      await clearSupabaseNotifications(currentUserId);
    }
    return true;
  };

  const exportMyData = () => {
    if (!currentUser) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentUser, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `peerforge_student_archive_${currentUser.id}.json`);
    dlAnchorElem.click();
  };

  const deactivateOwnAccount = () => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      isDeactivated: true,
      availability: 'Focusing on Studies / Busy' as const
    };
    setCurrentUser(updatedUser);
    setAllStudents(prev => prev.map(s => (s.id === currentUser.id ? updatedUser : s)));

    if (isSupabaseConfigured) {
      saveSupabaseStudent(updatedUser);
    }
  };

  const reactivateOwnAccount = () => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      isDeactivated: false,
      availability: 'Active & Seeking Projects' as const
    };
    setCurrentUser(updatedUser);
    setAllStudents(prev => prev.map(s => (s.id === currentUser.id ? updatedUser : s)));

    if (isSupabaseConfigured) {
      saveSupabaseStudent(updatedUser);
    }
  };

  const deleteStudentAccount = async (
    targetId: string,
    targetName?: string,
    targetEmail?: string
  ): Promise<boolean> => {
    const normName = targetName?.toLowerCase().trim();
    const normEmail = targetEmail?.toLowerCase().trim();
    const normId = targetId?.trim();

    // 1. Immediately remove from local allStudents state
    setAllStudents(prev =>
      prev.filter(s => {
        if (normId && s.id === normId) return false;
        if (normName && s.name.toLowerCase().trim() === normName) return false;
        if (normEmail && s.email.toLowerCase().trim() === normEmail) return false;
        return true;
      })
    );

    if (
      currentUser &&
      ((normId && currentUser.id === normId) ||
        (normName && currentUser.name.toLowerCase().trim() === normName) ||
        (normEmail && currentUser.email.toLowerCase().trim() === normEmail))
    ) {
      setCurrentUser(null);
      setIsAuthenticated(false);
      persistSession(null);
    }

    // 2. Also notify server memory if running
    try {
      if (normId) await fetch(`/api/students/${encodeURIComponent(normId)}`, { method: 'DELETE' });
    } catch {
      // fallback
    }

    // 3. Delete from Supabase
    if (isSupabaseConfigured) {
      await deleteSupabaseStudent(targetId, targetName, targetEmail);
    }
    return true;
  };

  const addEvent = (eventData: Omit<SchoolEvent, 'id' | 'rsvpCount' | 'isRsvpd'>) => {
    // Only approved faculty, admins, or developers can publish events
    const canPublish = currentUser && (currentUser.role === 'developer' || currentUser.role === 'admin' || (currentUser.role === 'teacher' && currentUser.isApproved));
    if (!canPublish) {
      console.warn('Action restricted: Only verified and approved faculty members can publish events.');
      return;
    }

    const newEvent: SchoolEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      rsvpCount: 0,
      isRsvpd: false
    };
    setEvents(prev => [newEvent, ...prev]);

    if (isSupabaseConfigured) {
      saveSupabaseEvent(newEvent);
    }
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const canDelete = currentUser.role === 'developer' || currentUser.role === 'admin' || (currentUser.role === 'teacher' && currentUser.isApproved);
    if (!canDelete) return false;

    setEvents(prev => prev.filter(e => e.id !== eventId));
    setEventRegistrations(prev => prev.filter(r => r.eventId !== eventId));

    if (isSupabaseConfigured) {
      await deleteSupabaseEvent(eventId);
    } else {
      fetch(`/api/events/${eventId}`, { method: 'DELETE' }).catch(() => {});
    }
    return true;
  };

  const approveFacultyAccount = async (teacherId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const isElevated = currentUser.role === 'developer' || currentUser.role === 'admin' || (currentUser.role === 'teacher' && currentUser.isApproved);
    if (!isElevated) return false;

    setAllStudents(prev =>
      prev.map(s => (s.id === teacherId ? { ...s, isApproved: true } : s))
    );

    if (currentUser.id === teacherId) {
      setCurrentUser(prev => (prev ? { ...prev, isApproved: true } : prev));
    }

    if (isSupabaseConfigured) {
      await updateSupabaseFacultyApproval(teacherId, true);
    } else {
      fetch(`/api/students/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true, is_approved: true })
      }).catch(() => {});
    }

    const approvedNotif: AppNotification = {
      id: `notif-faculty-approved-${Date.now()}`,
      userId: teacherId,
      type: 'system',
      title: 'Faculty Mentor Account Approved!',
      description:
        'Your faculty mentor account has been approved by school administration. You now have full access to faculty tools, notices, and student mentorship.',
      read: false,
      timestamp: 'Just now',
      actionTab: 'admin'
    };
    setNotifications(prev => [approvedNotif, ...prev]);
    if (isSupabaseConfigured) {
      saveSupabaseNotification(approvedNotif);
    }

    return true;
  };

  const rejectFacultyAccount = async (teacherId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const isElevated = currentUser.role === 'developer' || currentUser.role === 'admin' || (currentUser.role === 'teacher' && currentUser.isApproved);
    if (!isElevated) return false;

    // Convert account to student instead of deleting
    setAllStudents(prev =>
      prev.map(s => {
        if (s.id === teacherId) {
          return {
            ...s,
            role: 'student',
            isApproved: true,
            grade: s.grade && s.grade.startsWith('Grade') ? s.grade : 'Grade 11',
            section: s.section === 'Faculty' ? 'A' : (s.section || 'A')
          };
        }
        return s;
      })
    );

    if (currentUser.id === teacherId) {
      const updatedSelf: StudentProfile = {
        ...currentUser,
        role: 'student',
        isApproved: true,
        grade: currentUser.grade && currentUser.grade.startsWith('Grade') ? currentUser.grade : 'Grade 11',
        section: currentUser.section === 'Faculty' ? 'A' : (currentUser.section || 'A')
      };
      setCurrentUser(updatedSelf);
      persistSession(updatedSelf);
    }

    if (isSupabaseConfigured) {
      await convertSupabaseTeacherToStudent(teacherId);
    } else {
      fetch(`/api/students/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'student', isApproved: true, is_approved: true, grade: 'Grade 11', section: 'A' })
      }).catch(() => {});
    }

    const convertedNotif: AppNotification = {
      id: `notif-faculty-converted-${Date.now()}`,
      userId: teacherId,
      type: 'system',
      title: 'Account Status: Registered as Student',
      description:
        'You are not approved right now and so to limit your abilities you are registered as a student. To approve your account contact any registered peer teacher/ PeerForge Team.',
      read: false,
      timestamp: 'Just now',
      actionTab: 'contact'
    };
    setNotifications(prev => [convertedNotif, ...prev]);
    if (isSupabaseConfigured) {
      saveSupabaseNotification(convertedNotif);
    }

    return true;
  };

  const updatePassword = (newPassword: string) => {
    updateCurrentUserProfile({ password: newPassword });
  };

  const linkGmailAccount = (gmail: string) => {
    updateCurrentUserProfile({
      gmailAccount: gmail,
      email: gmail
    });
  };

  const addNewProfile = (newProfileData: Partial<StudentProfile>) => {
    const cleanEmail = (newProfileData.email || newProfileData.gmailAccount || '').toLowerCase().trim();
    if (cleanEmail && allStudents.some(s => s.email.toLowerCase() === cleanEmail || s.gmailAccount?.toLowerCase() === cleanEmail)) {
      console.warn('Account already exists for', cleanEmail);
      return;
    }
    const newStudent: StudentProfile = {
      id: `user-${Date.now()}`,
      name: newProfileData.name || 'New Profile',
      email: newProfileData.email || 'student@opgworldschool.com',
      gmailAccount: newProfileData.gmailAccount,
      password: newProfileData.password || 'PeerForge@2026',
      avatar: newProfileData.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newProfileData.name || 'Student')}`,
      grade: newProfileData.grade || 'Grade 11',
      section: newProfileData.section || 'A',
      role: newProfileData.role || 'student',
      bio: newProfileData.bio || 'Member at OPG World School.',
      skills: newProfileData.skills || [],
      interests: newProfileData.interests || [],
      academicStrengths: newProfileData.academicStrengths || [],
      projects: [],
      achievements: [],
      availability: 'Open to Collaborate',
      privacySettings: {
        showGradeToAll: true,
        allowDirectMessages: 'anyone',
        showAchievements: true
      },
      completeness: 85,
      isVerified: true,
      isApproved: true,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setAllStudents(prev => [...prev, newStudent]);

    if (isSupabaseConfigured) {
      saveSupabaseStudent(newStudent);
    }
  };

  const submitContactInquiry = (inquiryData: {
    name: string;
    email: string;
    category: string;
    subject: string;
    message: string;
  }): string => {
    const ticketId = `OPG-DEV-${Math.floor(100000 + Math.random() * 900000)}`;
    const newInquiry: ContactInquiry = {
      id: ticketId,
      userId: currentUser?.id,
      name: inquiryData.name,
      email: inquiryData.email,
      category: inquiryData.category,
      subject: inquiryData.subject,
      message: inquiryData.message,
      submittedAt: 'Just now',
      status: 'new'
    };

    setContactInquiries(prev => [newInquiry, ...prev]);

    // Developer-scoped notification (only shown to developer / admin roles)
    const devNotif: AppNotification = {
      id: `notif-dev-${Date.now()}`,
      userId: 'developer',
      type: 'system',
      title: `Developer Alert: Contact Inquiry from ${inquiryData.name}`,
      description: `"${inquiryData.subject}" - Categorized under ${inquiryData.category}. Ticket #${ticketId}`,
      read: false,
      timestamp: 'Just now',
      actionTab: 'contact'
    };

    // User-scoped confirmation notification (shown strictly to the submitter)
    const userTargetId = currentUser?.id || `email-${inquiryData.email.toLowerCase()}`;
    const userConfirmNotif: AppNotification = {
      id: `notif-user-inquiry-${Date.now()}`,
      userId: userTargetId,
      type: 'system',
      title: `Inquiry Submitted (Ticket #${ticketId})`,
      description: `Your developer support request regarding "${inquiryData.subject}" was received and routed to dev staff.`,
      read: false,
      timestamp: 'Just now',
      actionTab: 'contact'
    };

    setNotifications(prev => [devNotif, userConfirmNotif, ...prev]);

    if (isSupabaseConfigured) {
      saveSupabaseContactInquiry(newInquiry);
      saveSupabaseNotification(devNotif);
      saveSupabaseNotification(userConfirmNotif);
    }

    return ticketId;
  };

  const resolveContactInquiry = (inquiryId: string, status: 'reviewed' | 'resolved', developerNotes?: string) => {
    if (!currentUser) return;
    let updatedInquiry: ContactInquiry | undefined;
    setContactInquiries(prev =>
      prev.map(inq => {
        if (inq.id === inquiryId) {
          updatedInquiry = {
            ...inq,
            status,
            developerNotes: developerNotes !== undefined ? developerNotes : inq.developerNotes,
            assignedDeveloper: currentUser.name
          };
          return updatedInquiry;
        }
        return inq;
      })
    );

    if (updatedInquiry) {
      const targetUser = allStudents.find(
        s => (updatedInquiry?.userId && s.id === updatedInquiry.userId) ||
             (updatedInquiry?.email && s.email.toLowerCase() === updatedInquiry.email.toLowerCase())
      );
      const targetUserId = targetUser?.id || updatedInquiry.userId || `email-${updatedInquiry.email.toLowerCase()}`;

      const replyNotif: AppNotification = {
        id: `notif-dev-reply-${Date.now()}`,
        userId: targetUserId,
        type: 'message',
        title: `Developer Reply (Ticket #${inquiryId})`,
        description: `Developer ${currentUser.name} updated your inquiry status to "${status}". ${developerNotes ? `Note: "${developerNotes}"` : ''}`,
        read: false,
        timestamp: 'Just now',
        actionTab: 'contact'
      };

      setNotifications(prev => [replyNotif, ...prev]);

      if (isSupabaseConfigured) {
        saveSupabaseContactInquiry(updatedInquiry);
        saveSupabaseNotification(replyNotif);
      }
    }
  };

  const loginWithGmail = async (
    gmail: string,
    password?: string
  ): Promise<{
    success: boolean;
    message: string;
    user?: StudentProfile;
    isEmailUnconfirmed?: boolean;
    unconfirmedEmail?: string;
  }> => {
    const cleanEmail = gmail.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter your school or Gmail ID.' };
    }

    let profileToLogin: StudentProfile | null = null;

    if (isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (error) {
          console.warn('Supabase sign-in note:', error.message);
          if (error.message.toLowerCase().includes('not confirmed')) {
            return {
              success: false,
              isEmailUnconfirmed: true,
              unconfirmedEmail: cleanEmail,
              message: `Your email address (${cleanEmail}) has not been confirmed yet. Please check your inbox for the confirmation email from Supabase and click the verification link before signing in.`
            };
          }
        } else if (data?.user) {
          const { data: sbProfile } = await supabase
            .from('students')
            .select('*')
            .or(`id.eq.${data.user.id},email.ilike.${cleanEmail},email.eq.${cleanEmail}`)
            .maybeSingle();

          if (sbProfile) {
            profileToLogin = normalizeStudentProfile(sbProfile);
          }

          if (!profileToLogin) {
            const meta = data.user.user_metadata || {};
            profileToLogin = {
              id: data.user.id,
              name: meta.full_name || meta.name || cleanEmail.split('@')[0],
              email: cleanEmail,
              gmailAccount: cleanEmail,
              password: password,
              avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanEmail.split('@')[0])}`,
              grade: meta.role === 'teacher' ? (meta.department || 'Senior Faculty') : (meta.grade || 'Grade 11'),
              section: meta.role === 'teacher' ? 'Faculty' : (meta.section || 'A'),
              role: (meta.role as 'student' | 'teacher') || 'student',
              bio: `OPG World School ${meta.role === 'teacher' ? 'Faculty Mentor' : 'Student'} member.`,
              skills: [
                { name: 'Collaboration', category: 'Leadership & Sports', level: 'Intermediate', verified: true },
                { name: 'Academic Problem Solving', category: 'Academic', level: 'Intermediate', verified: true }
              ],
              interests: ['Peer Collaboration', 'Academics'],
              academicStrengths: ['STEM'],
              projects: [],
              achievements: [
                {
                  title: 'Verified School Member',
                  issuer: 'OPG World School',
                  date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                  verified: true
                }
              ],
              availability: 'Active & Seeking Projects',
              privacySettings: {
                showGradeToAll: true,
                allowDirectMessages: 'anyone',
                showAchievements: true
              },
              completeness: 85,
              isVerified: true,
              isApproved: meta.role === 'teacher' ? false : true,
              joinedDate: new Date().toISOString().split('T')[0]
            };
            await saveSupabaseStudent(profileToLogin);
          }
        }
      } catch (e) {
        console.warn('Supabase auth exception:', e);
      }
    }

    // Direct database query fallback in case user exists in students table or allStudents is loading
    if (!profileToLogin && isSupabaseConfigured) {
      try {
        const { data: dbStudent } = await supabase
          .from('students')
          .select('*')
          .or(`email.ilike.${cleanEmail},gmailAccount.ilike.${cleanEmail},email.eq.${cleanEmail}`)
          .maybeSingle();

        if (dbStudent) {
          if (password && dbStudent.password && dbStudent.password !== password) {
            return {
              success: false,
              message: 'Incorrect password for this account. Please verify credentials.'
            };
          }
          profileToLogin = normalizeStudentProfile(dbStudent);
        }
      } catch (err) {
        console.warn('Direct student lookup in Supabase error:', err);
      }
    }

    if (!profileToLogin) {
      const matched = allStudents.find(
        s =>
          s.email.toLowerCase().trim() === cleanEmail ||
          (s.gmailAccount && s.gmailAccount.toLowerCase().trim() === cleanEmail)
      );

      if (matched) {
        if (password && matched.password && matched.password !== password) {
          return {
            success: false,
            message: 'Incorrect password for this account. Please verify credentials.'
          };
        }
        profileToLogin = matched;
      }
    }

    if (!profileToLogin) {
      return {
        success: false,
        message: 'No registered account found with this email. Please click "Sign Up" to register!'
      };
    }

    setCurrentUser(profileToLogin);
    setIsAuthenticated(true);
    persistSession(profileToLogin);
    const resolvedTheme =
      profileToLogin.defaultTheme === 'dark'
        ? 'dark'
        : profileToLogin.defaultTheme === 'light'
        ? 'light'
        : typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    setTheme(resolvedTheme);
    setAllStudents(prev => {
      const exists = prev.some(s => s.id === profileToLogin!.id);
      return exists ? prev.map(s => (s.id === profileToLogin!.id ? profileToLogin! : s)) : [profileToLogin!, ...prev];
    });

    if (profileToLogin.role === 'teacher' && !profileToLogin.isApproved) {
      setNotifications(prev => {
        const alreadyHas = prev.some(
          n => n.userId === profileToLogin!.id && n.title.includes('Pending Approval')
        );
        if (alreadyHas) return prev;
        const pendingNotif: AppNotification = {
          id: `notif-pending-teacher-${Date.now()}`,
          userId: profileToLogin!.id,
          type: 'system',
          title: 'Faculty Account Pending Approval — Registered as Student',
          description:
            'You are not approved right now and so to limit your abilities you are registered as a student. To approve your account contact any registered peer teacher/ PeerForge Team.',
          read: false,
          timestamp: 'Just now',
          actionTab: 'contact'
        };
        if (isSupabaseConfigured) {
          saveSupabaseNotification(pendingNotif);
        }
        return [pendingNotif, ...prev];
      });
    }

    const welcomeMsg =
      profileToLogin.role === 'teacher' && !profileToLogin.isApproved
        ? `Welcome, ${profileToLogin.name}! Faculty verification is currently in progress. You have full student access while awaiting admin approval.`
        : profileToLogin.role === 'teacher'
        ? `Welcome back, Professor ${profileToLogin.name}!`
        : `Welcome back, ${profileToLogin.name}!`;

    return {
      success: true,
      message: welcomeMsg,
      user: profileToLogin
    };
  };

  const signUpWithGmail = async (data: {
    name: string;
    email: string;
    role: 'student' | 'teacher';
    grade?: string;
    section?: string;
    department?: string;
    password?: string;
    bio?: string;
    skills?: string[];
  }): Promise<{
    success: boolean;
    message: string;
    user?: StudentProfile;
    requiresEmailConfirmation?: boolean;
    email?: string;
  }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name.trim();

    if (!cleanName) {
      return { success: false, message: 'Please provide your full name.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, message: 'Please provide a valid Gmail or school address.' };
    }

    let authUserId = `${data.role}-${Date.now()}`;

    if (isSupabaseConfigured && data.password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            full_name: cleanName,
            role: data.role
          }
        }
      });

      if (authError) {
        return { success: false, message: authError.message };
      }
      if (authData.user) {
        authUserId = authData.user.id;
      }
    } else {
      const exists = allStudents.some(
        s =>
          s.email.toLowerCase() === cleanEmail ||
          s.gmailAccount?.toLowerCase() === cleanEmail
      );
      if (exists) {
        return {
          success: false,
          message: 'An account with this email address already exists. Please sign in directly.'
        };
      }
    }

    const initialSkills: Skill[] = (data.skills && data.skills.length > 0)
      ? data.skills.map(s => ({
          name: s.trim(),
          category: data.role === 'teacher' ? 'Academic' : 'Technical',
          level: 'Intermediate',
          verified: true
        }))
      : data.role === 'teacher'
      ? [
          { name: data.department || 'Academic Mentorship', category: 'Academic', level: 'Advanced', verified: true },
          { name: 'Research & Student Guidance', category: 'Academic', level: 'Advanced', verified: true }
        ]
      : [
          { name: 'Peer Collaboration', category: 'Leadership & Sports', level: 'Intermediate', verified: true },
          { name: 'Academic Problem Solving', category: 'Academic', level: 'Intermediate', verified: true }
        ];

    const newProfile: StudentProfile = {
      id: authUserId,
      name: cleanName,
      email: cleanEmail,
      gmailAccount: cleanEmail,
      password: data.password || 'PeerForge@2026',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanName)}`,
      grade: data.role === 'teacher' ? (data.department || 'Senior Faculty') : (data.grade || 'Grade 11'),
      section: data.role === 'teacher' ? 'Faculty' : (data.section || 'A'),
      role: data.role,
      bio: data.bio || (data.role === 'teacher' ? `Faculty Mentor in ${data.department || 'Academics'} at OPG World School.` : `Student in ${data.grade || 'Grade 11'} at OPG World School.`),
      skills: initialSkills,
      interests: data.role === 'teacher' ? ['STEM Mentorship', 'Inter-School Competitions', 'Academic Research'] : ['Collaborative Projects', 'Science & Technology'],
      academicStrengths: data.role === 'teacher' ? [data.department || 'Academics'] : ['General STEM'],
      projects: [],
      achievements: [
        {
          title: data.role === 'teacher' ? 'Verified Faculty Mentor' : 'Verified Student Member',
          issuer: 'OPG World School',
          date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          verified: true
        }
      ],
      availability: 'Active & Seeking Projects',
      privacySettings: {
        showGradeToAll: true,
        allowDirectMessages: 'anyone',
        showAchievements: true
      },
      completeness: 90,
      isVerified: true,
      isApproved: data.role === 'teacher' ? false : true,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setAllStudents(prev => [newProfile, ...prev]);

    if (data.role === 'teacher') {
      const pendingTeacherNotif: AppNotification = {
        id: `notif-pending-teacher-${Date.now()}`,
        userId: newProfile.id,
        type: 'system',
        title: 'Faculty Account Pending Approval — Registered as Student',
        description:
          'You are not approved right now and so to limit your abilities you are registered as a student. To approve your account contact any registered peer teacher/ PeerForge Team.',
        read: false,
        timestamp: 'Just now',
        actionTab: 'contact'
      };
      setNotifications(prev => [pendingTeacherNotif, ...prev]);
      if (isSupabaseConfigured) {
        saveSupabaseNotification(pendingTeacherNotif);
      }
    }

    if (isSupabaseConfigured) {
      await saveSupabaseStudent(newProfile);
    }

    return {
      success: true,
      requiresEmailConfirmation: true,
      email: cleanEmail,
      message: data.role === 'teacher'
        ? `Faculty account registered! Your account is pending verification. To limit your abilities you are registered as a student. To approve your account contact any registered peer teacher/ PeerForge Team.`
        : `Account created! We've sent a verification email to ${cleanEmail}. Please check your inbox and click the confirmation link, then sign in to your account.`,
      user: newProfile
    };
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please provide an email address.' };
    }
    const res = await resendSupabaseConfirmation(cleanEmail);
    if (res.success) {
      return {
        success: true,
        message: `Confirmation email resent to ${cleanEmail}! Please check your inbox and spam folder.`
      };
    } else {
      return {
        success: false,
        message: res.error || 'Failed to resend confirmation email. Please try again in a few moments.'
      };
    }
  };

  const logout = async () => {
    persistSession(null);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const refreshUploadedFiles = async () => {
    if (isSupabaseConfigured) {
      const files = await fetchSupabaseUploads();
      if (files) setUploadedFiles(files);
    }
  };

  const uploadFile = async (
    file: File,
    category: string,
    description?: string,
    projectId?: string
  ): Promise<{ success: boolean; file?: UploadedFile; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('description', description || '');
      if (projectId) formData.append('projectId', projectId);
      if (currentUser) {
        formData.append('uploaderId', currentUser.id);
        formData.append('uploaderName', currentUser.name);
        formData.append('uploaderRole', currentUser.role);
        formData.append('uploaderAvatar', currentUser.avatar);
      }

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.file) {
        const uploaded: UploadedFile = data.file;
        setUploadedFiles(prev => [uploaded, ...prev]);
        if (isSupabaseConfigured) {
          saveSupabaseUpload(uploaded);
        }
        return { success: true, file: uploaded };
      }
      return { success: false, error: data.error || 'Upload failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during upload' };
    }
  };

  const deleteUploadedFile = async (id: string): Promise<boolean> => {
    try {
      await fetch(`/api/uploads/${id}`, { method: 'DELETE' }).catch(() => {});
      if (isSupabaseConfigured) {
        await deleteSupabaseUpload(id);
      }
      setUploadedFiles(prev => prev.filter(f => f.id !== id));
      return true;
    } catch (e) {
      console.warn('Delete upload error:', e);
      setUploadedFiles(prev => prev.filter(f => f.id !== id));
      return true;
    }
  };

  const unreadNotifsCount = isAuthenticated && currentUser
    ? notifications.filter(n => {
        if (!n || n.read) return false;
        if (n.userId === currentUser.id) return true;
        if (n.userId === 'developer' && (currentUser.role === 'developer' || currentUser.role === 'admin')) return true;
        if (n.userId === 'teacher' && currentUser.role === 'teacher') return true;
        if (n.userId === 'all') return true;
        return false;
      }).length
    : 0;
  const unreadMessagesCount = currentUser
    ? messages.filter(m => m.senderId !== currentUser.id && !m.readBy?.includes(currentUser.id)).length
    : 0;

  // Dynamically compute exact registrant count and user RSVP state from eventRegistrations
  const dynamicEvents: SchoolEvent[] = events.map(evt => {
    const regs = eventRegistrations.filter(r => r.eventId === evt.id);
    const count = regs.length;
    const isUserRsvpd = Boolean(
      currentUser &&
      regs.some(r => r.userId === currentUser.id || (currentUser.email && r.userEmail === currentUser.email))
    );
    return {
      ...evt,
      rsvpCount: count,
      isRsvpd: isUserRsvpd
    };
  });

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allStudents,
        projects,
        questions,
        answers,
        events: dynamicEvents,
        eventRegistrations,
        notifications,
        conversations,
        messages,
        reports,
        contactInquiries,
        uploadedFiles,
        activities,
        unreadNotifsCount,
        unreadMessagesCount,
        activeTab,
        setActiveTab,
        selectedStudentForProfile,
        setSelectedStudentForProfile,
        selectedQuestionForDetail,
        setSelectedQuestionForDetail,
        selectedProjectForDetail,
        setSelectedProjectForDetail,
        activeConversationId,
        setActiveConversationId,
        themeMode,
        theme,
        setThemeMode,
        toggleTheme,
        switchUser,
        updateCurrentUserProfile,
        addSkillToCurrent,
        removeSkillFromCurrent,
        sendMessage,
        openDirectMessageWith,
        createGroupConversation,
        reactToMessage,
        createProject,
        deleteProject,
        applyToProject,
        handleProjectApplication,
        developerAcceptApplication,
        toggleProjectTask,
        addProjectMilestone,
        editProjectMilestone,
        deleteProjectMilestone,
        askQuestion,
        deleteQuestion,
        postAnswer,
        deleteAnswer,
        upvoteAnswer,
        acceptAnswer,
        toggleEventRsvp,
        submitContentReport,
        resolveReport,
        markNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        exportMyData,
        deactivateOwnAccount,
        reactivateOwnAccount,
        deleteStudentAccount,
        approveFacultyAccount,
        rejectFacultyAccount,
        addEvent,
        deleteEvent,
        updatePassword,
        linkGmailAccount,
        addNewProfile,
        submitContactInquiry,
        resolveContactInquiry,
        isDeveloperMode,
        setIsDeveloperMode,
        isOnboardingOpen,
        setIsOnboardingOpen,
        activeSearchQuery,
        setActiveSearchQuery,
        inviteStudentModal,
        setInviteStudentModal,
        isAuthenticated,
        loginWithGmail,
        signUpWithGmail,
        resendVerificationEmail,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        authRole,
        setAuthRole,
        openAuthModal,
        closeAuthModal,
        uploadFile,
        deleteUploadedFile,
        refreshUploadedFiles,
        isSidebarVisible,
        toggleSidebar
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
