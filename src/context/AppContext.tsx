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
  UploadedFile
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
  INITIAL_UPLOADED_FILES
} from '../data/initialData';
import {
  supabase,
  isSupabaseConfigured,
  saveSupabaseStudent,
  saveSupabaseProject,
  saveSupabaseQuestion,
  deleteSupabaseQuestion,
  saveSupabaseAnswer,
  deleteSupabaseAnswer,
  saveSupabaseMessage,
  saveSupabaseConversation,
  saveSupabaseEvent,
  saveSupabaseNotification,
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
  subscribeToSupabaseRealtime
} from '../services/supabaseClient';

interface AppContextType {
  currentUser: StudentProfile | null;
  allStudents: StudentProfile[];
  projects: Project[];
  questions: Question[];
  answers: Answer[];
  events: SchoolEvent[];
  notifications: AppNotification[];
  conversations: Conversation[];
  messages: Message[];
  reports: ContentReport[];
  contactInquiries: ContactInquiry[];
  uploadedFiles: UploadedFile[];
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
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  theme: 'light' | 'dark';
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
  applyToProject: (projectId: string, roleId: string, roleTitle: string, note: string) => void;
  handleProjectApplication: (projectId: string, appId: string, action: 'accepted' | 'rejected') => void;
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
  toggleEventRsvp: (eventId: string) => void;
  submitContentReport: (report: Partial<ContentReport>) => void;
  resolveReport: (reportId: string, action: 'dismiss' | 'action_taken', note?: string) => void;
  markNotificationsAsRead: () => void;
  exportMyData: () => void;
  deactivateOwnAccount: () => void;
  reactivateOwnAccount: () => void;
  addEvent: (eventData: Omit<SchoolEvent, 'id' | 'rsvpCount' | 'isRsvpd'>) => void;
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
  isAuthenticated: boolean;
  loginWithGmail: (gmail: string, password?: string) => Promise<{ success: boolean; message: string; user?: StudentProfile }>;
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
  }) => Promise<{ success: boolean; message: string; user?: StudentProfile }>;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Application Data States
  const [allStudents, setAllStudents] = useState<StudentProfile[]>(() => (isSupabaseConfigured ? [] : INITIAL_STUDENTS));
  const [currentUser, setCurrentUser] = useState<StudentProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [projects, setProjects] = useState<Project[]>(() => (isSupabaseConfigured ? [] : INITIAL_PROJECTS));
  const [questions, setQuestions] = useState<Question[]>(() => (isSupabaseConfigured ? [] : INITIAL_QUESTIONS));
  const [answers, setAnswers] = useState<Answer[]>(() => (isSupabaseConfigured ? [] : INITIAL_ANSWERS));
  const [events, setEvents] = useState<SchoolEvent[]>(() => (isSupabaseConfigured ? [] : INITIAL_EVENTS));
  const [conversations, setConversations] = useState<Conversation[]>(() => (isSupabaseConfigured ? [] : INITIAL_CONVERSATIONS));
  const [messages, setMessages] = useState<Message[]>(() => (isSupabaseConfigured ? [] : INITIAL_MESSAGES));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => (isSupabaseConfigured ? [] : INITIAL_NOTIFICATIONS));
  const [reports, setReports] = useState<ContentReport[]>(() => (isSupabaseConfigured ? [] : INITIAL_REPORTS));
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(() => (isSupabaseConfigured ? [] : INITIAL_CONTACT_INQUIRIES));
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => (isSupabaseConfigured ? [] : INITIAL_UPLOADED_FILES));

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
        fetchSupabaseUploads()
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
        uploads
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
      });

      // 2. Auth Session Check & Auth State Change Listener
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const { data: sbStudent } = await supabase
            .from('students')
            .select('*')
            .or(`id.eq.${session.user.id},email.eq.${session.user.email}`)
            .maybeSingle();

          if (sbStudent) {
            setCurrentUser(sbStudent as StudentProfile);
            setIsAuthenticated(true);
          }
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setCurrentUser(null);
        } else if (session?.user) {
          const { data: sbStudent } = await supabase
            .from('students')
            .select('*')
            .or(`id.eq.${session.user.id},email.eq.${session.user.email}`)
            .maybeSingle();

          if (sbStudent) {
            setCurrentUser(sbStudent as StudentProfile);
            setIsAuthenticated(true);
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
            const student = payload.new as StudentProfile;
            setAllStudents(prev => {
              const exists = prev.some(s => s.id === student.id);
              return exists ? prev.map(s => (s.id === student.id ? student : s)) : [student, ...prev];
            });
            setCurrentUser(curr => (curr && curr.id === student.id ? student : curr));
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
    } else {
      // Fallback: Local Server API Sync
      Promise.all([
        fetch('/api/students').then(r => r.json()).catch(() => []),
        fetch('/api/projects').then(r => r.json()).catch(() => []),
        fetch('/api/questions').then(r => r.json()).catch(() => []),
        fetch('/api/events').then(r => r.json()).catch(() => []),
        fetch('/api/conversations').then(r => r.json()).catch(() => []),
        fetch('/api/messages').then(r => r.json()).catch(() => []),
        fetch('/api/notifications').then(r => r.json()).catch(() => [])
      ]).then(([studentsRes, projectsRes, questionsRes, eventsRes, convRes, msgRes, notifRes]) => {
        if (Array.isArray(studentsRes) && studentsRes.length > 0) setAllStudents(studentsRes);
        if (Array.isArray(projectsRes) && projectsRes.length > 0) setProjects(projectsRes);
        if (Array.isArray(questionsRes) && questionsRes.length > 0) setQuestions(questionsRes);
        if (Array.isArray(eventsRes) && eventsRes.length > 0) setEvents(eventsRes);
        if (Array.isArray(convRes) && convRes.length > 0) setConversations(convRes);
        if (Array.isArray(msgRes) && msgRes.length > 0) setMessages(msgRes);
        if (Array.isArray(notifRes) && notifRes.length > 0) setNotifications(notifRes);
      });
    }

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Theme Sync
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const switchUser = (studentId: string) => {
    const s = allStudents.find(item => item.id === studentId);
    if (s) {
      setCurrentUser(s);
      setIsAuthenticated(true);
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

  const handleProjectApplication = (projectId: string, appId: string, action: 'accepted' | 'rejected') => {
    if (!currentUser) return;
    let updatedProject: Project | undefined;

    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          const isDev = currentUser.role === 'developer';
          const approvedByNote = isDev && p.ownerId !== currentUser.id
            ? `Lead Developer (${currentUser.name})`
            : p.ownerName;

          const updatedApps = p.applications.map(a =>
            a.id === appId
              ? {
                  ...a,
                  status: action,
                  approvedBy: action === 'accepted' ? approvedByNote : undefined
                }
              : a
          );
          let updatedMembers = [...p.members];
          let updatedRoles = [...p.openRoles];

          if (action === 'accepted') {
            const targetApp = p.applications.find(a => a.id === appId);
            if (targetApp) {
              if (!updatedMembers.some(m => m.studentId === targetApp.studentId)) {
                updatedMembers.push({
                  studentId: targetApp.studentId,
                  role: targetApp.roleTitle,
                  name: targetApp.studentName,
                  avatar: targetApp.studentAvatar
                });
              }
              updatedRoles = updatedRoles.map(r =>
                r.id === targetApp.roleId
                  ? { ...r, status: 'filled' as const, assigneeId: targetApp.studentId, assigneeName: targetApp.studentName }
                  : r
              );
            }
          }

          updatedProject = {
            ...p,
            applications: updatedApps,
            members: updatedMembers,
            openRoles: updatedRoles
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

  const developerAcceptApplication = (projectId: string, appId: string, devNote?: string) => {
    if (!currentUser) return;
    let acceptedApplicantName = '';
    let roleName = '';
    let projectTitle = '';
    let updatedProject: Project | undefined;

    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          projectTitle = p.title;
          const targetApp = p.applications.find(a => a.id === appId);
          if (!targetApp) return p;

          acceptedApplicantName = targetApp.studentName;
          roleName = targetApp.roleTitle;

          const updatedApps = p.applications.map(a =>
            a.id === appId
              ? {
                  ...a,
                  status: 'accepted' as const,
                  approvedBy: `Developer Authority (${currentUser.name})${devNote ? ` - ${devNote}` : ''}`
                }
              : a
          );

          let updatedMembers = [...p.members];
          if (!updatedMembers.some(m => m.studentId === targetApp.studentId)) {
            updatedMembers.push({
              studentId: targetApp.studentId,
              role: targetApp.roleTitle,
              name: targetApp.studentName,
              avatar: targetApp.studentAvatar
            });
          }

          const updatedRoles = p.openRoles.map(r =>
            r.id === targetApp.roleId
              ? { ...r, status: 'filled' as const, assigneeId: targetApp.studentId, assigneeName: targetApp.studentName }
              : r
          );

          updatedProject = {
            ...p,
            applications: updatedApps,
            members: updatedMembers,
            openRoles: updatedRoles
          };
          return updatedProject;
        }
        return p;
      })
    );

    const devNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      type: 'system',
      title: `Developer Approved: ${acceptedApplicantName || 'Candidate'}`,
      description: `Accepted application for "${roleName}" on project "${projectTitle}". Granted cross-role developer & teacher authority.`,
      read: false,
      timestamp: 'Just now',
      actionTab: 'projects'
    };

    setNotifications(prev => [devNotif, ...prev]);

    if (isSupabaseConfigured) {
      if (updatedProject) saveSupabaseProject(updatedProject);
      saveSupabaseNotification(devNotif);
    }
  };

  const toggleProjectTask = (projectId: string, taskId: string) => {
    let updatedProject: Project | undefined;
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          updatedProject = {
            ...p,
            tasks: p.tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
          };
          return updatedProject;
        }
        return p;
      })
    );

    if (updatedProject) {
      const targetProj = updatedProject;
      setSelectedQuestionForDetail(null);
      setSelectedProjectForDetail(prev => (prev?.id === projectId ? targetProj : prev));
      if (isSupabaseConfigured) saveSupabaseProject(targetProj);
    }
  };

  const addProjectMilestone = (projectId: string, title: string) => {
    if (!title.trim()) return;
    let updatedProject: Project | undefined;
    const newTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      completed: false
    };

    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          updatedProject = {
            ...p,
            tasks: [...p.tasks, newTask]
          };
          return updatedProject;
        }
        return p;
      })
    );

    if (updatedProject) {
      const targetProj = updatedProject;
      setSelectedProjectForDetail(prev => (prev?.id === projectId ? targetProj : prev));
      if (isSupabaseConfigured) saveSupabaseProject(targetProj);
    }
  };

  const editProjectMilestone = (projectId: string, taskId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    let updatedProject: Project | undefined;

    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          updatedProject = {
            ...p,
            tasks: p.tasks.map(t => (t.id === taskId ? { ...t, title: newTitle.trim() } : t))
          };
          return updatedProject;
        }
        return p;
      })
    );

    if (updatedProject) {
      const targetProj = updatedProject;
      setSelectedProjectForDetail(prev => (prev?.id === projectId ? targetProj : prev));
      if (isSupabaseConfigured) saveSupabaseProject(targetProj);
    }
  };

  const deleteProjectMilestone = (projectId: string, taskId: string) => {
    let updatedProject: Project | undefined;

    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          updatedProject = {
            ...p,
            tasks: p.tasks.filter(t => t.id !== taskId)
          };
          return updatedProject;
        }
        return p;
      })
    );

    if (updatedProject) {
      const targetProj = updatedProject;
      setSelectedProjectForDetail(prev => (prev?.id === projectId ? targetProj : prev));
      if (isSupabaseConfigured) saveSupabaseProject(targetProj);
    }
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

  const toggleEventRsvp = (eventId: string) => {
    let updatedEvt: SchoolEvent | undefined;
    setEvents(prev =>
      prev.map(e => {
        if (e.id === eventId) {
          const isRsvpd = !e.isRsvpd;
          updatedEvt = {
            ...e,
            isRsvpd,
            rsvpCount: e.rsvpCount + (isRsvpd ? 1 : -1)
          };
          return updatedEvt;
        }
        return e;
      })
    );

    if (isSupabaseConfigured && updatedEvt) {
      saveSupabaseEvent(updatedEvt);
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

  const addEvent = (eventData: Omit<SchoolEvent, 'id' | 'rsvpCount' | 'isRsvpd'>) => {
    const newEvent: SchoolEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      rsvpCount: 1,
      isRsvpd: true
    };
    setEvents(prev => [newEvent, ...prev]);

    if (isSupabaseConfigured) {
      saveSupabaseEvent(newEvent);
    }
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
      name: inquiryData.name,
      email: inquiryData.email,
      category: inquiryData.category,
      subject: inquiryData.subject,
      message: inquiryData.message,
      submittedAt: 'Just now',
      status: 'new'
    };

    setContactInquiries(prev => [newInquiry, ...prev]);

    const devNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'user-aakriti',
      type: 'system',
      title: `Developer Alert: Contact Inquiry from ${inquiryData.name}`,
      description: `"${inquiryData.subject}" - Categorized under ${inquiryData.category}. Routed strictly to Developers.`,
      read: false,
      timestamp: 'Just now',
      actionTab: 'contact'
    };
    setNotifications(prev => [devNotif, ...prev]);

    if (isSupabaseConfigured) {
      saveSupabaseContactInquiry(newInquiry);
      saveSupabaseNotification(devNotif);
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

    if (isSupabaseConfigured && updatedInquiry) {
      saveSupabaseContactInquiry(updatedInquiry);
    }
  };

  const loginWithGmail = async (
    gmail: string,
    password?: string
  ): Promise<{ success: boolean; message: string; user?: StudentProfile }> => {
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
        } else if (data?.user) {
          const { data: sbProfile } = await supabase
            .from('students')
            .select('*')
            .or(`id.eq.${data.user.id},email.eq.${cleanEmail}`)
            .maybeSingle();

          if (sbProfile) {
            profileToLogin = sbProfile as StudentProfile;
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
              isApproved: true,
              joinedDate: new Date().toISOString().split('T')[0]
            };
            await saveSupabaseStudent(profileToLogin);
          }
        }
      } catch (e) {
        console.warn('Supabase auth exception:', e);
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
    setAllStudents(prev => {
      const exists = prev.some(s => s.id === profileToLogin!.id);
      return exists ? prev.map(s => (s.id === profileToLogin!.id ? profileToLogin! : s)) : [profileToLogin!, ...prev];
    });

    return {
      success: true,
      message: `Welcome back, ${profileToLogin.name}!`,
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
  }): Promise<{ success: boolean; message: string; user?: StudentProfile }> => {
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
      isApproved: true,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setAllStudents(prev => [newProfile, ...prev]);

    if (isSupabaseConfigured) {
      await saveSupabaseStudent(newProfile);
    }

    setCurrentUser(newProfile);
    setIsAuthenticated(true);

    return { success: true, message: `Account created successfully! Welcome to PeerForge, ${cleanName}.`, user: newProfile };
  };

  const logout = async () => {
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
    ? notifications.filter(n => !n.read && (n.userId === currentUser.id || n.userId === 'all')).length
    : 0;
  const unreadMessagesCount = currentUser
    ? messages.filter(m => m.senderId !== currentUser.id && !m.readBy?.includes(currentUser.id)).length
    : 0;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allStudents,
        projects,
        questions,
        answers,
        events,
        notifications,
        conversations,
        messages,
        reports,
        contactInquiries,
        uploadedFiles,
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
        theme,
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
        exportMyData,
        deactivateOwnAccount,
        reactivateOwnAccount,
        addEvent,
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
        refreshUploadedFiles
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
