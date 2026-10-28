import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudentProfile,
  Skill,
  Question,
  Answer,
  Project,
  Community,
  CommunityPost,
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
  INITIAL_COMMUNITIES,
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
  saveSupabaseAnswer,
  saveSupabaseMessage,
  saveSupabaseConversation,
  fetchSupabaseStudents,
  fetchSupabaseProjects,
  fetchSupabaseQuestions,
  fetchSupabaseAnswers,
  fetchSupabaseConversations,
  fetchSupabaseMessages
} from '../services/supabaseClient';

interface AppContextType {
  currentUser: StudentProfile;
  allStudents: StudentProfile[];
  communities: Community[];
  projects: Project[];
  questions: Question[];
  answers: Answer[];
  events: SchoolEvent[];
  notifications: AppNotification[];
  conversations: Conversation[];
  messages: Message[];
  reports: ContentReport[];
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
  selectedCommunityForDetail: Community | null;
  setSelectedCommunityForDetail: (c: Community | null) => void;
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
  askQuestion: (newQ: Partial<Question>) => Promise<Question>;
  postAnswer: (questionId: string, body: string) => void;
  upvoteAnswer: (answerId: string) => void;
  acceptAnswer: (questionId: string, answerId: string) => void;
  toggleJoinCommunity: (communityId: string) => void;
  createCommunityPost: (communityId: string, content: string, pollQuestion?: string, pollOptions?: string[]) => void;
  likeCommunityPost: (postId: string) => void;
  votePoll: (postId: string, optionIndex: number) => void;
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
  contactInquiries: ContactInquiry[];
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
  uploadedFiles: UploadedFile[];
  uploadFile: (file: File, category: string, description?: string, projectId?: string) => Promise<{ success: boolean; file?: UploadedFile; error?: string }>;
  deleteUploadedFile: (id: string) => Promise<boolean>;
  refreshUploadedFiles: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [allStudents, setAllStudents] = useState<StudentProfile[]>(() => {
    try {
      const version = localStorage.getItem('opg_profiles_version');
      if (version !== 'v6_clean_auth') {
        localStorage.setItem('opg_profiles_version', 'v6_clean_auth');
        localStorage.setItem('opg_students', JSON.stringify(INITIAL_STUDENTS));
        localStorage.removeItem('opg_current_user_id');
        localStorage.removeItem('opg_is_authenticated');
        localStorage.removeItem('opg_contact_inquiries');
        return INITIAL_STUDENTS;
      }
      const saved = localStorage.getItem('opg_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return INITIAL_STUDENTS;
  });
  const [currentUser, setCurrentUser] = useState<StudentProfile>({
    id: 'guest',
    name: 'Visitor',
    email: 'visitor@opgworldschool.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Guest',
    grade: 'N/A',
    section: 'N/A',
    role: 'student',
    bio: 'Welcome to PeerForge. Please sign in to explore.',
    skills: [],
    interests: [],
    academicStrengths: [],
    projects: [],
    achievements: [],
    availability: 'Focusing on Studies / Busy',
    privacySettings: {
      showGradeToAll: false,
      allowDirectMessages: 'verified_only',
      showAchievements: false
    },
    completeness: 0,
    isVerified: false,
    isApproved: false,
    joinedDate: 'N/A'
  });

  // Sync state with backend database API on mount
  useEffect(() => {
    // Check for existing Supabase session
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetch(`/api/students/${session.user.id}`)
            .then(r => r.json())
            .then(student => {
              if (student && !student.error) {
                setCurrentUser(student);
                setIsAuthenticated(true);
              }
            })
            .catch(() => {
              // If profile fetch fails but auth exists, we might need to create it or just stay as guest
            });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          // Optionally fetch profile here too
        } else {
          setIsAuthenticated(false);
          setCurrentUser({
            id: 'guest',
            name: 'Visitor',
            email: 'visitor@opgworldschool.com',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Guest',
            grade: 'N/A',
            section: 'N/A',
            role: 'student',
            bio: 'Welcome to PeerForge. Please sign in to explore.',
            skills: [],
            interests: [],
            academicStrengths: [],
            projects: [],
            achievements: [],
            availability: 'Focusing on Studies / Busy',
            privacySettings: {
              showGradeToAll: false,
              allowDirectMessages: 'verified_only',
              showAchievements: false
            },
            completeness: 0,
            isVerified: false,
            isApproved: false,
            joinedDate: 'N/A'
          });
        }
      });

      return () => subscription.unsubscribe();
    }

    if (isSupabaseConfigured) {
      Promise.all([
        fetchSupabaseStudents(),
        fetchSupabaseProjects(),
        fetchSupabaseQuestions(),
        fetchSupabaseAnswers(),
        // Conversations and messages are usually fetched per-user/per-conv,
        // but we can fetch them here for initial state if small,
        // or just let the individual views handle it.
        // For now, let's just fetch everything for the demo feel.
        fetch('/api/communities').then(r => r.json()).catch(() => []),
        fetch('/api/events').then(r => r.json()).catch(() => []),
        fetch('/api/notifications').then(r => r.json()).catch(() => []),
      ]).then(([students, projects, questions, answers, communities, events, notifications]) => {
        if (students) setAllStudents(students);
        if (projects) setProjects(projects);
        if (questions) setQuestions(questions);
        if (answers) setAnswers(answers);
        if (Array.isArray(communities)) setCommunities(communities);
        if (Array.isArray(events)) setEvents(events);
        if (Array.isArray(notifications)) setNotifications(notifications);
      });
    } else {
      Promise.all([
        fetch('/api/students').then(r => r.json()).catch(() => []),
        fetch('/api/projects').then(r => r.json()).catch(() => []),
        fetch('/api/questions').then(r => r.json()).catch(() => []),
        fetch('/api/communities').then(r => r.json()).catch(() => []),
        fetch('/api/events').then(r => r.json()).catch(() => []),
        fetch('/api/conversations').then(r => r.json()).catch(() => []),
        fetch('/api/messages').then(r => r.json()).catch(() => []),
        fetch('/api/notifications').then(r => r.json()).catch(() => []),
      ]).then(([studentsRes, projectsRes, questionsRes, communitiesRes, eventsRes, convRes, msgRes, notifRes]) => {
        if (Array.isArray(studentsRes)) {
          setAllStudents(studentsRes);
          const savedId = localStorage.getItem('opg_current_user_id');
          const found = studentsRes.find((s: StudentProfile) => s.id === savedId);
          if (found) setCurrentUser(found);
        }
        if (Array.isArray(projectsRes)) setProjects(projectsRes);
        if (Array.isArray(questionsRes)) setQuestions(questionsRes);
        if (Array.isArray(communitiesRes)) setCommunities(communitiesRes);
        if (Array.isArray(eventsRes)) setEvents(eventsRes);
        if (Array.isArray(convRes)) setConversations(convRes);
        if (Array.isArray(msgRes)) setMessages(msgRes);
        if (Array.isArray(notifRes)) setNotifications(notifRes);
      }).catch(e => console.warn('Backend sync failed:', e));
    }
  }, []);

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<StudentProfile | null>(null);
  const [selectedQuestionForDetail, setSelectedQuestionForDetail] = useState<Question | null>(null);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);
  const [selectedCommunityForDetail, setSelectedCommunityForDetail] = useState<Community | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-1');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [inviteStudentModal, setInviteStudentModal] = useState<{ isOpen: boolean; student: StudentProfile | null }>({
    isOpen: false,
    student: null
  });

  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [answers, setAnswers] = useState<Answer[]>(INITIAL_ANSWERS);
  const [events, setEvents] = useState<SchoolEvent[]>(INITIAL_EVENTS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [reports, setReports] = useState<ContentReport[]>(INITIAL_REPORTS);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('opg_contact_inquiries');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Inquiries storage read error', e);
    }
    return INITIAL_CONTACT_INQUIRIES;
  });
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('opg_is_authenticated');
    return saved === 'true';
  });
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

  useEffect(() => {
    try {
      localStorage.setItem('opg_contact_inquiries', JSON.stringify(contactInquiries));
    } catch (e) {
      console.warn('Inquiries storage write error', e);
    }
  }, [contactInquiries]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('opg_students', JSON.stringify(allStudents));
  }, [allStudents]);

  useEffect(() => {
    localStorage.setItem('opg_current_user_id', currentUser.id);
  }, [currentUser]);

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
    }
  };

  const updateCurrentUserProfile = (updated: Partial<StudentProfile>) => {
    const updatedUser = { ...currentUser, ...updated };
    // Recalculate completeness
    let comp = 50;
    if (updatedUser.bio && updatedUser.bio.length > 20) comp += 15;
    if (updatedUser.skills && updatedUser.skills.length >= 3) comp += 15;
    if (updatedUser.interests && updatedUser.interests.length >= 2) comp += 10;
    if (updatedUser.projects && updatedUser.projects.length >= 1) comp += 10;
    updatedUser.completeness = Math.min(100, comp);

    setCurrentUser(updatedUser);
    setAllStudents(prev => prev.map(s => (s.id === currentUser.id ? updatedUser : s)));

    // Also sync to server if available
    fetch(`/api/students/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    }).catch(e => console.warn('Server sync error', e));

    if (isSupabaseConfigured) {
      saveSupabaseStudent(updatedUser);
    }
  };

  const addSkillToCurrent = (skill: Skill) => {
    if (currentUser.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) {
      return;
    }
    const updatedSkills = [...currentUser.skills, skill];
    updateCurrentUserProfile({ skills: updatedSkills });
  };

  const removeSkillFromCurrent = (skillName: string) => {
    const updatedSkills = currentUser.skills.filter(s => s.name !== skillName);
    updateCurrentUserProfile({ skills: updatedSkills });
  };

  const sendMessage = (convId: string, text: string, replyTo?: Message['replyTo']) => {
    if (!text.trim()) return;

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

    // Call server endpoint
    fetch(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: text.trim(),
        replyTo
      })
    }).catch(e => console.warn('Message sync error', e));

    if (isSupabaseConfigured) {
      saveSupabaseMessage(newMsg);
      saveSupabaseConversation({
        ...conversations.find(c => c.id === convId)!,
        lastMessage: {
          text: newMsg.text,
          senderId: currentUser.id,
          timestamp: newMsg.timestamp
        },
        updatedAt: new Date().toISOString()
      });
    }

    // Simulated peer reply in demo if chatting 1-on-1 with another student
    const conv = conversations.find(c => c.id === convId);
    if (conv && !conv.isGroup) {
      const otherId = conv.participantIds.find(id => id !== currentUser.id);
      const otherStudent = allStudents.find(s => s.id === otherId);
      if (otherStudent && otherStudent.role === 'student') {
        setTimeout(() => {
          const peerReply: Message = {
            id: `msg-${Date.now() + 1}`,
            conversationId: convId,
            senderId: otherStudent.id,
            senderName: otherStudent.name,
            senderAvatar: otherStudent.avatar,
            text: `Thanks for connecting, ${currentUser.name.split(' ')[0]}! Let's collaborate on this at school tomorrow.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: {},
            readBy: [otherStudent.id]
          };
          setMessages(prev => [...prev, peerReply]);
        }, 1400);
      }
    }
  };

  const openDirectMessageWith = (student: StudentProfile) => {
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
    }

    setActiveConversationId(conv.id);
    setActiveTab('messages');
  };

  const createGroupConversation = (name: string, participantIds: string[], topic?: string): string => {
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

    // Send initial system message
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

    return newGroup.id;
  };

  const reactToMessage = (messageId: string, emoji: string) => {
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
          return { ...m, reactions };
        }
        return m;
      })
    );
  };

  const createProject = (newProject: Partial<Project>) => {
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

    // Also create project group chat conversation automatically
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

    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    }).catch(e => console.warn('Project sync error', e));

    if (isSupabaseConfigured) {
      saveSupabaseProject(project);
      saveSupabaseConversation(groupConv);
    }
  };

  const applyToProject = (projectId: string, roleId: string, roleTitle: string, note: string) => {
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

    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            applications: [...p.applications, appItem]
          };
        }
        return p;
      })
    );

    fetch(`/api/projects/${projectId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentGrade: currentUser.grade,
        studentAvatar: currentUser.avatar,
        roleId,
        roleTitle,
        note
      })
    }).catch(e => console.warn('Application sync error', e));
  };

  const handleProjectApplication = (projectId: string, appId: string, action: 'accepted' | 'rejected') => {
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

          return {
            ...p,
            applications: updatedApps,
            members: updatedMembers,
            openRoles: updatedRoles
          };
        }
        return p;
      })
    );
  };

  const developerAcceptApplication = (projectId: string, appId: string, devNote?: string) => {
    let acceptedApplicantName = '';
    let roleName = '';
    let projectTitle = '';

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

          return {
            ...p,
            applications: updatedApps,
            members: updatedMembers,
            openRoles: updatedRoles
          };
        }
        return p;
      })
    );

    // Send confirmation notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        type: 'system',
        title: `Developer Approved: ${acceptedApplicantName || 'Candidate'}`,
        description: `Accepted application for "${roleName}" on project "${projectTitle}". Granted cross-role developer & teacher authority.`,
        read: false,
        timestamp: 'Just now',
        actionTab: 'projects'
      },
      ...prev
    ]);
  };

  const toggleProjectTask = (projectId: string, taskId: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            tasks: p.tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
          };
        }
        return p;
      })
    );
  };

  const askQuestion = async (newQ: Partial<Question>): Promise<Question> => {
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

    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q)
    }).catch(e => console.warn('Question sync error', e));

    if (isSupabaseConfigured) {
      saveSupabaseQuestion(q);
    }

    return q;
  };

  const postAnswer = (questionId: string, body: string) => {
    if (!body.trim()) return;

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

    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          return { ...q, answersCount: q.answersCount + 1 };
        }
        return q;
      })
    );

    fetch(`/api/questions/${questionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorGrade: currentUser.grade,
        authorAvatar: currentUser.avatar,
        body: body.trim()
      })
    }).catch(e => console.warn('Answer sync error', e));

    if (isSupabaseConfigured) {
      saveSupabaseAnswer(newAns);
    }
  };

  const upvoteAnswer = (answerId: string) => {
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
          return { ...a, upvotes, upvotedBy };
        }
        return a;
      })
    );
  };

  const acceptAnswer = (questionId: string, answerId: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          return { ...q, acceptedAnswerId: answerId };
        }
        return q;
      })
    );
    setAnswers(prev =>
      prev.map(a => {
        if (a.questionId === questionId) {
          return { ...a, isAccepted: a.id === answerId };
        }
        return a;
      })
    );
  };

  const toggleJoinCommunity = (communityId: string) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId) {
          const isJoined = !c.isJoined;
          return {
            ...c,
            isJoined,
            membersCount: c.membersCount + (isJoined ? 1 : -1)
          };
        }
        return c;
      })
    );
  };

  const createCommunityPost = (communityId: string, content: string, pollQuestion?: string, pollOptions?: string[]) => {
    // Implement post creation
    fetch(`/api/communities/${communityId}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorGrade: currentUser.grade,
        authorAvatar: currentUser.avatar,
        content,
        poll: pollQuestion && pollOptions ? {
          question: pollQuestion,
          options: pollOptions.map(t => ({ text: t, votes: 0, voters: [] }))
        } : undefined
      })
    }).catch(e => console.warn('Post sync error', e));
  };

  const likeCommunityPost = (postId: string) => {
    fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    }).catch(e => console.warn('Like sync error', e));
  };

  const votePoll = (postId: string, optionIndex: number) => {
    fetch(`/api/posts/${postId}/poll-vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionIndex, userId: currentUser.id })
    }).catch(e => console.warn('Poll vote error', e));
  };

  const toggleEventRsvp = (eventId: string) => {
    setEvents(prev =>
      prev.map(e => {
        if (e.id === eventId) {
          const isRsvpd = !e.isRsvpd;
          return {
            ...e,
            isRsvpd,
            rsvpCount: e.rsvpCount + (isRsvpd ? 1 : -1)
          };
        }
        return e;
      })
    );
  };

  const submitContentReport = (report: Partial<ContentReport>) => {
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

    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRep)
    }).catch(e => console.warn('Report sync error', e));
  };

  const resolveReport = (reportId: string, action: 'dismiss' | 'action_taken', note?: string) => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status: action === 'dismiss' ? 'dismissed' : 'action_taken' } : r))
    );
    fetch(`/api/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note })
    }).catch(e => console.warn('Report resolve sync error', e));
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    }).catch(e => console.warn('Notif sync error', e));
  };

  const exportMyData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentUser, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `peerforge_student_archive_${currentUser.id}.json`);
    dlAnchorElem.click();
  };

  const deactivateOwnAccount = () => {
    const updatedUser = {
      ...currentUser,
      isDeactivated: true,
      availability: 'Focusing on Studies / Busy' as const
    };
    setCurrentUser(updatedUser);
    setAllStudents(prev => {
      const updated = prev.map(s => (s.id === currentUser.id ? updatedUser : s));
      localStorage.setItem('opg_students', JSON.stringify(updated));
      return updated;
    });
  };

  const reactivateOwnAccount = () => {
    const updatedUser = {
      ...currentUser,
      isDeactivated: false,
      availability: 'Active & Seeking Projects' as const
    };
    setCurrentUser(updatedUser);
    setAllStudents(prev => {
      const updated = prev.map(s => (s.id === currentUser.id ? updatedUser : s));
      localStorage.setItem('opg_students', JSON.stringify(updated));
      return updated;
    });
  };

  const addEvent = (eventData: Omit<SchoolEvent, 'id' | 'rsvpCount' | 'isRsvpd'>) => {
    const newEvent: SchoolEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      rsvpCount: 1,
      isRsvpd: true
    };
    setEvents(prev => [newEvent, ...prev]);
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
      console.warn('One student/teacher, one account: account already exists for', cleanEmail);
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

    // Send confidential notification strictly to developer accounts
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

    return ticketId;
  };

  const resolveContactInquiry = (inquiryId: string, status: 'reviewed' | 'resolved', developerNotes?: string) => {
    setContactInquiries(prev =>
      prev.map(inq => {
        if (inq.id === inquiryId) {
          return {
            ...inq,
            status,
            developerNotes: developerNotes !== undefined ? developerNotes : inq.developerNotes,
            assignedDeveloper: currentUser.name
          };
        }
        return inq;
      })
    );
  };

  const loginWithGmail = async (
    gmail: string,
    password?: string
  ): Promise<{ success: boolean; message: string; user?: StudentProfile }> => {
    const cleanEmail = gmail.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter your Gmail ID.' };
    }

    if (isSupabaseConfigured && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        // Fetch profile from our API/DB
        const res = await fetch(`/api/students/${data.user.id}`);
        const student = await res.json();
        if (student && !student.error) {
          setCurrentUser(student);
          setIsAuthenticated(true);
          return { success: true, message: `Welcome back, ${student.name}!`, user: student };
        }
      }
    }

    // Fallback to local memory (for demo or if Supabase not yet setup)
    const matched = allStudents.find(
      s =>
        s.email.toLowerCase().trim() === cleanEmail ||
        (s.gmailAccount && s.gmailAccount.toLowerCase().trim() === cleanEmail)
    );

    if (!matched) {
      return {
        success: false,
        message: 'No registered student or teacher account found with this Gmail ID. Please sign up below!'
      };
    }

    if (password && matched.password && matched.password !== password) {
      return {
        success: false,
        message: 'Incorrect password for this Gmail account. Please verify credentials.'
      };
    }

    setCurrentUser(matched);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    return { success: true, message: `Welcome back, ${matched.name}!`, user: matched };
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
      return { success: false, message: 'Please provide a valid Gmail address.' };
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
      // Local check if not using Supabase
      const exists = allStudents.some(
        s =>
          s.email.toLowerCase() === cleanEmail ||
          s.gmailAccount?.toLowerCase() === cleanEmail
      );
      if (exists) {
        return {
          success: false,
          message: 'One student/teacher, one account: An account with this Gmail ID already exists. Please log in directly.'
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

    // Save to allStudents state
    setAllStudents(prev => [...prev, newProfile]);
    
    // Save to Supabase DB if configured
    if (isSupabaseConfigured) {
      await saveSupabaseStudent(newProfile);
    }

    // Save to local backend
    fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProfile)
    }).catch(e => console.warn('Student profile sync error', e));

    setCurrentUser(newProfile);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    return { success: true, message: `Account created successfully! Welcome to PeerForge, ${cleanName}.`, user: newProfile };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setCurrentUser({
      id: 'guest',
      name: 'Visitor',
      email: 'visitor@opgworldschool.com',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Guest',
      grade: 'N/A',
      section: 'N/A',
      role: 'student',
      bio: 'Welcome to PeerForge. Please sign in to explore.',
      skills: [],
      interests: [],
      academicStrengths: [],
      projects: [],
      achievements: [],
      availability: 'Focusing on Studies / Busy',
      privacySettings: {
        showGradeToAll: false,
        allowDirectMessages: 'verified_only',
        showAchievements: false
      },
      completeness: 0,
      isVerified: false,
      isApproved: false,
      joinedDate: 'N/A'
    });
    localStorage.removeItem('opg_current_user_id');
    localStorage.removeItem('opg_is_authenticated');
  };

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(INITIAL_UPLOADED_FILES);

  const refreshUploadedFiles = async () => {
    try {
      const res = await fetch('/api/uploads');
      const data = await res.json();
      if (data.files && Array.isArray(data.files)) {
        setUploadedFiles(data.files);
      }
    } catch (e) {
      console.warn('Could not refresh uploads from API:', e);
    }
  };

  useEffect(() => {
    refreshUploadedFiles();
  }, []);

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
      formData.append('uploaderId', currentUser.id);
      formData.append('uploaderName', currentUser.name);
      formData.append('uploaderRole', currentUser.role);
      formData.append('uploaderAvatar', currentUser.avatar);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.file) {
        setUploadedFiles(prev => [data.file, ...prev]);
        return { success: true, file: data.file };
      }
      return { success: false, error: data.error || 'Upload failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during upload' };
    }
  };

  const deleteUploadedFile = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/uploads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
        return true;
      }
    } catch (e) {
      console.warn('Delete upload error:', e);
    }
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    return true;
  };

  const unreadNotifsCount = isAuthenticated && currentUser 
    ? notifications.filter(n => !n.read && (n.userId === currentUser.id || n.userId === 'all')).length 
    : 0;
  // Assuming messages have a 'read' property or similar mechanism; adjusting to look for messages not from current user
  const unreadMessagesCount = messages.filter(m => m.senderId !== currentUser.id && !m.readBy?.includes(currentUser.id)).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allStudents,
        communities,
        projects,
        questions,
        answers,
        events,
        notifications,
        conversations,
        messages,
        reports,
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
        selectedCommunityForDetail,
        setSelectedCommunityForDetail,
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
        askQuestion,
        postAnswer,
        upvoteAnswer,
        acceptAnswer,
        toggleJoinCommunity,
        createCommunityPost,
        likeCommunityPost,
        votePoll,
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
        contactInquiries,
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
        uploadedFiles,
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
