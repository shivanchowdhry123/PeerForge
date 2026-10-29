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
  UploadedFile
} from '../types/index.ts';

export const INITIAL_STUDENTS: StudentProfile[] = [];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'project-1',
    title: 'PeerForge Academic Portal & Doubt Solver',
    description: 'Dynamic peer-to-peer web system enabling real-time collaboration, peer Q&A doubt resolution, and skill-matching across Classes 9–12.',
    category: 'Software & Web',
    ownerId: 'user-aakriti',
    ownerName: 'Aakriti Narayan',
    ownerGrade: 'Grade 11',
    ownerAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aakriti',
    teamSize: 4,
    deadline: '2026-12-15',
    status: 'recruiting',
    requiredSkills: ['React & TypeScript', 'Python', 'UI/UX Design', 'Mathematics (Calculus)'],
    openRoles: [
      { id: 'role-1', title: 'Lead App Developer', requiredSkill: 'React & TypeScript', status: 'filled', assigneeId: 'user-aakriti', assigneeName: 'Aakriti Narayan' },
      { id: 'role-2', title: 'Algorithms & Testing Partner', requiredSkill: 'Python', status: 'open' },
      { id: 'role-3', title: 'Faculty Co-Advisor & Evaluator', requiredSkill: 'Academic Mentorship', status: 'open' }
    ],
    members: [
      { studentId: 'user-aakriti', role: 'Lead Architect', name: 'Aakriti Narayan', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aakriti' }
    ],
    applications: [
      {
        id: 'app-teacher-1',
        studentId: 'user-teacher-mentor',
        studentName: 'Mr. Rajesh Sharma (Faculty Mentor)',
        studentGrade: 'Faculty Mentor',
        studentAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TeacherSharma',
        roleId: 'role-3',
        roleTitle: 'Faculty Co-Advisor & Evaluator',
        note: 'Happy to supervise project documentation, evaluation criteria, and school lab access for testing.',
        status: 'pending',
        createdAt: '1 hour ago'
      }
    ],
    tasks: [
      { id: 'task-1', title: 'Initialize PeerForge repository and responsive layout', completed: true, assignee: 'Aakriti Narayan' },
      { id: 'task-2', title: 'Integrate dynamic profile counter and secure credential management', completed: true, assignee: 'Aakriti Narayan' },
      { id: 'task-3', title: 'Configure upcoming events publishing for Developers & Teachers', completed: true, assignee: 'Aakriti Narayan' },
      { id: 'task-4', title: 'Build direct file uploads in /uploads folder with shared access', completed: true, assignee: 'Aakriti Narayan' }
    ],
    updates: [
      { id: 'up-1', date: 'Oct 25, 2026', text: 'PeerForge launched for OPG World School students with instant account control.' },
      { id: 'up-2', date: 'Oct 27, 2026', text: 'Enabled dedicated /uploads file repository for student resource sharing.' }
    ]
  },
  {
    id: 'project-2',
    title: 'Autonomous Solar Rover with Edge AI',
    description: 'Autonomous planetary exploration rover prototype featuring dual-axis solar tracking, LiDAR obstacle navigation, and edge camera object detection.',
    category: 'Robotics & Hardware',
    ownerId: 'user-vihaan',
    ownerName: 'Vihaan Kapoor',
    ownerGrade: 'Grade 12',
    ownerAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vihaan',
    teamSize: 3,
    deadline: '2026-11-14',
    status: 'recruiting',
    requiredSkills: ['Python', 'Arduino & ESP32', 'Machine Learning & AI'],
    openRoles: [
      { id: 'role-rover-1', title: 'Computer Vision Lead', requiredSkill: 'Python', status: 'filled', assigneeId: 'user-vihaan', assigneeName: 'Vihaan Kapoor' },
      { id: 'role-rover-2', title: 'Chassis & Power Hardware Specialist', requiredSkill: 'Arduino & ESP32', status: 'open' }
    ],
    members: [
      { studentId: 'user-vihaan', role: 'Team Lead', name: 'Vihaan Kapoor', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vihaan' }
    ],
    applications: [],
    tasks: [
      { id: 'task-r1', title: 'Complete CAD chassis blueprint for 3D printing', completed: true, assignee: 'Vihaan Kapoor' },
      { id: 'task-r2', title: 'Wire dual-axis LDR solar tracking circuit', completed: false }
    ],
    updates: [
      { id: 'up-r1', date: 'Oct 22, 2026', text: 'Chassis motor drivers tested with 12V Li-ion battery pack.' }
    ]
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    authorId: 'user-aakriti',
    authorName: 'Aakriti Narayan',
    authorGrade: 'Grade 11',
    authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aakriti',
    title: 'Best problem sets for mastering Class 11 Physics (Mechanics & Rotational Dynamics)?',
    body: 'For mentors and seniors: what references or past competitive olympiad questions build the deepest intuition for rotational equilibrium, torque vectors, and conservation of angular momentum?',
    topic: 'Physics & STEM',
    tags: ['Physics', 'Class 11', 'Mechanics', 'Olympiad'],
    createdAt: '3 hours ago',
    upvotes: 6,
    upvotedBy: ['user-aakriti', 'user-vihaan'],
    answersCount: 1,
    acceptedAnswerId: 'ans-1'
  },
  {
    id: 'q-2',
    authorId: 'user-kabir',
    authorName: 'Kabir Mehta',
    authorGrade: 'Grade 9',
    authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kabir',
    title: 'How to calculate current draw when powering multiple SG90 micro servos from Arduino 5V pin?',
    body: 'Whenever I connect three SG90 servo motors to the 5V rail on my Arduino Uno, the microcontroller brownouts and resets. Should I use an external 5V 2A buck regulator or capacitor filtering?',
    topic: 'Electronics & Robotics',
    tags: ['Robotics', 'Arduino', 'Power Electronics', 'Hardware'],
    createdAt: '1 day ago',
    upvotes: 8,
    upvotedBy: ['user-aakriti', 'user-vihaan', 'user-kabir'],
    answersCount: 1,
    acceptedAnswerId: 'ans-2'
  }
];

export const INITIAL_ANSWERS: Answer[] = [
  {
    id: 'ans-1',
    questionId: 'q-1',
    authorId: 'user-teacher-mentor',
    authorName: 'Mr. Rajesh Sharma',
    authorGrade: 'Faculty Mentor',
    authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TeacherSharma',
    body: 'Start with I.E. Irodov problems 1.238 to 1.275 for rigid body dynamics, paired with H.C. Verma Vol 1 Chapter 10 for conceptual clarity on torque vectors and moment of inertia tensors. We also have copies in the physics department library and uploaded reference notes in the PeerForge Files Hub.',
    createdAt: '2 hours ago',
    upvotes: 9,
    upvotedBy: ['user-aakriti', 'user-vihaan'],
    isAccepted: true
  },
  {
    id: 'ans-2',
    questionId: 'q-2',
    authorId: 'user-vihaan',
    authorName: 'Vihaan Kapoor',
    authorGrade: 'Grade 12',
    authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vihaan',
    body: 'Never power motors directly from the Arduino onboard 5V regulator! The regulator can only supply ~400mA, but each SG90 servo draws up to 500-600mA at stall torque. Use an external 5V 2A-3A power source with a shared ground with the Arduino, and place a 470uF electrolytic capacitor across the motor power rails to absorb voltage dips.',
    createdAt: '18 hours ago',
    upvotes: 7,
    upvotedBy: ['user-kabir', 'user-aakriti'],
    isAccepted: true
  }
];

export const INITIAL_EVENTS: SchoolEvent[] = [
  {
    id: 'event-1',
    title: 'OPG Annual Inter-School Science & Innovation Conclave 2026',
    date: 'Nov 14, 2026',
    time: '09:00 AM - 03:30 PM',
    location: 'OPG World School Main Auditorium & Quad',
    category: 'Exhibition',
    description: 'Showcasing over 60 working prototypes in robotics, renewable energy, AI applications, and sustainable agricultural science from students across NCR.',
    organizer: 'OPG Science Faculty & Student Council',
    isOfficial: true,
    rsvpCount: 148,
    isRsvpd: true,
    linkText: 'Register Project'
  },
  {
    id: 'event-2',
    title: 'Inter-House Hackathon & Coding Challenge 2026',
    date: 'Nov 20, 2026',
    time: '10:00 AM - 04:00 PM',
    location: 'Computer Science Lab 1 & 2',
    category: 'Competition',
    description: 'Agni, Vayu, Jal, and Prithvi houses clash in a 6-hour rapid development sprint. Challenges include algorithmic problem solving and web application prototyping.',
    organizer: 'OPG Tech Society & House Captains',
    isOfficial: true,
    rsvpCount: 86,
    isRsvpd: false,
    linkText: 'Join House Team'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const INITIAL_MESSAGES: Message[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_REPORTS: ContentReport[] = [];

export const INITIAL_CONTACT_INQUIRIES: ContactInquiry[] = [
  {
    id: 'inq-101',
    name: 'Class 10 Tech Representative',
    email: 'techrep.class10@opgworldschool.com',
    category: 'Project Mentorship',
    subject: 'Requesting developer review for automated attendance tracking prototype',
    message: 'We are designing an RFID attendance prototype for our class exhibition and would like guidance from the PeerForge developers on backend integration with Google Sheets or API endpoints.',
    submittedAt: 'Today at 10:15 AM',
    status: 'new'
  }
];

export const INITIAL_UPLOADED_FILES: UploadedFile[] = [
  {
    id: 'file-1',
    filename: 'OPG_World_School_PeerForge_Guide.txt',
    originalName: 'OPG_World_School_PeerForge_Guide.txt',
    size: 512,
    mimeType: 'text/plain',
    url: '/uploads/OPG_World_School_PeerForge_Guide.txt',
    uploadedAt: 'Today at 09:30 AM',
    uploadedBy: {
      id: 'user-aakriti',
      name: 'Aakriti Narayan',
      role: 'Lead App Developer',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aakriti'
    },
    category: 'Project Document',
    description: 'Official introduction and code of conduct guide for PeerForge platform at OPG World School.',
    projectId: 'project-1'
  }
];
