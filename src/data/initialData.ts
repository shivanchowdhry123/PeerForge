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

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'user-aakriti',
    name: 'Aakriti Narayan',
    email: 'aakriti.narayan955@gmail.com',
    gmailAccount: 'aakriti.narayan955@gmail.com',
    password: 'Password@123',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aakriti',
    grade: 'Grade 11',
    section: 'A',
    house: 'Agni',
    role: 'student',
    bio: 'Class 11 Student & Tech Lead of PeerForge at OPG World School. Passionate about software architecture, collaborative peer networks, algorithms, and STEM innovation.',
    skills: [
      { name: 'Full-Stack Web Development', category: 'Technical', level: 'Advanced', verified: true },
      { name: 'React & TypeScript', category: 'Technical', level: 'Advanced', verified: true },
      { name: 'Python', category: 'Technical', level: 'Advanced', verified: true },
      { name: 'UI/UX Design', category: 'Creative', level: 'Advanced', verified: true },
      { name: 'Peer Tutoring & Leadership', category: 'Leadership & Sports', level: 'Advanced', verified: true },
      { name: 'Mathematics (Calculus)', category: 'Academic', level: 'Advanced', verified: true }
    ],
    interests: ['Software Engineering', 'Robotics', 'Space Science', 'Physics', 'Digital Design'],
    academicStrengths: ['Computer Science', 'Mathematics', 'Physics'],
    projects: [
      {
        id: 'proj-pf',
        title: 'PeerForge Platform',
        description: 'Dynamic peer-to-peer network designed by Class 11 students at OPG World School for students in Classes 9 through 12.',
        role: 'Lead Architect & App Developer',
        status: 'in-progress'
      }
    ],
    achievements: [
      {
        title: 'OPG World School Tech Innovation Lead',
        issuer: 'OPG World School Tech Society',
        date: 'Oct 2026',
        verified: true
      },
      {
        title: 'CBSE Regional Science & Tech Conclave Finalist',
        issuer: 'CBSE Delhi Region',
        date: 'Nov 2025',
        verified: true
      }
    ],
    availability: 'Active & Seeking Projects',
    privacySettings: {
      showGradeToAll: true,
      allowDirectMessages: 'anyone',
      showAchievements: true
    },
    completeness: 100,
    isVerified: true,
    isApproved: true,
    joinedDate: '2026-08-10'
  },
  {
    id: 'user-teacher-mentor',
    name: 'Mr. Rajesh Sharma',
    email: 'teacher.opgworldschool@gmail.com',
    gmailAccount: 'teacher.opgworldschool@gmail.com',
    password: 'Password@123',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TeacherSharma',
    grade: 'Computer Science & Robotics',
    section: 'Faculty',
    role: 'teacher',
    bio: 'Senior Faculty Mentor in Computer Science and Robotics at OPG World School. Advising students across Classes 9–12 on competitive exhibitions, research papers, and technical prototypes.',
    skills: [
      { name: 'Computer Science Mentorship', category: 'Academic', level: 'Advanced', verified: true },
      { name: 'Robotics & Microcontrollers', category: 'Technical', level: 'Advanced', verified: true },
      { name: 'CBSE Curriculum & Research Guidance', category: 'Academic', level: 'Advanced', verified: true },
      { name: 'Project Evaluation', category: 'Academic', level: 'Advanced', verified: true }
    ],
    interests: ['Robotics Education', 'Artificial Intelligence in Pedagogy', 'STEM Competitions'],
    academicStrengths: ['Computer Science', 'Electronics', 'Applied Mathematics'],
    projects: [
      {
        id: 'proj-pf',
        title: 'PeerForge Platform',
        description: 'Dynamic peer-to-peer network designed by Class 11 students at OPG World School for students in Classes 9 through 12.',
        role: 'Faculty Mentor & Academic Advisor',
        status: 'in-progress'
      }
    ],
    achievements: [
      {
        title: 'Distinguished STEM Educator Award',
        issuer: 'OPG World School Administration',
        date: 'Sep 2026',
        verified: true
      }
    ],
    availability: 'Open to Collaborate',
    privacySettings: {
      showGradeToAll: true,
      allowDirectMessages: 'anyone',
      showAchievements: true
    },
    completeness: 100,
    isVerified: true,
    isApproved: true,
    joinedDate: '2026-07-15'
  },
  {
    id: 'user-vihaan',
    name: 'Vihaan Kapoor',
    email: 'vihaan.kapoor.opg@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vihaan',
    grade: 'Grade 12',
    section: 'B',
    house: 'Agni',
    role: 'student',
    bio: 'Class 12 STEM enthusiast preparing for JEE Advanced and International Informatics Olympiad. Specializing in Python algorithms, computer vision with OpenCV, and competitive mathematics.',
    skills: [
      { name: 'Machine Learning & AI', category: 'Technical', level: 'Advanced', verified: true },
      { name: 'Python', category: 'Technical', level: 'Advanced', verified: true },
      { name: 'Advanced Calculus', category: 'Academic', level: 'Advanced', verified: true },
      { name: 'OpenCV & Image Processing', category: 'Technical', level: 'Intermediate', verified: true }
    ],
    interests: ['Machine Learning', 'Competitive Programming', 'Astrophysics', 'Chess'],
    academicStrengths: ['Mathematics', 'Computer Science', 'Physics'],
    projects: [
      {
        id: 'proj-solar-rover',
        title: 'Autonomous Solar Rover',
        description: 'Obstacle-avoidance autonomous exploration rover powered by solar tracking servos and edge AI inference.',
        role: 'Vision & Navigation Developer',
        status: 'in-progress'
      }
    ],
    achievements: [
      {
        title: 'CBSE Regional Math Olympiad Gold',
        issuer: 'CBSE Delhi Regional Board',
        date: 'Dec 2025',
        verified: true
      }
    ],
    availability: 'Active & Seeking Projects',
    privacySettings: {
      showGradeToAll: true,
      allowDirectMessages: 'anyone',
      showAchievements: true
    },
    completeness: 95,
    isVerified: true,
    isApproved: true,
    joinedDate: '2026-08-15'
  },
  {
    id: 'user-ananya',
    name: 'Ananya Desai',
    email: 'ananya.desai.opg@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ananya',
    grade: 'Grade 10',
    section: 'A',
    house: 'Vayu',
    role: 'student',
    bio: 'Class 10 student passionate about graphic design, Figma UI/UX, and Public Speaking. President of the OPG Junior Debate Circle and delegate for Delhi Model United Nations.',
    skills: [
      { name: 'UI/UX Design', category: 'Creative', level: 'Advanced', verified: true },
      { name: 'Public Speaking & Debate', category: 'Leadership & Sports', level: 'Advanced', verified: true },
      { name: 'Figma & Design Systems', category: 'Creative', level: 'Advanced', verified: true },
      { name: 'Content & Pitch Deck Writing', category: 'Creative', level: 'Intermediate', verified: true }
    ],
    interests: ['Digital Art', 'Model United Nations', 'Philosophy', 'Creative Writing'],
    academicStrengths: ['English', 'Social Science', 'Design Thinking'],
    projects: [
      {
        id: 'proj-mun-portal',
        title: 'OPG World MUN Research Dossier',
        description: 'Comprehensive research repository for high school delegates representing diverse geopolitical blocs.',
        role: 'Chief Editor & Visual Lead',
        status: 'completed'
      }
    ],
    achievements: [
      {
        title: 'Best Delegate - High School MUN NCR',
        issuer: 'Delhi Youth Parliament',
        date: 'Jan 2026',
        verified: true
      }
    ],
    availability: 'Open to Collaborate',
    privacySettings: {
      showGradeToAll: true,
      allowDirectMessages: 'anyone',
      showAchievements: true
    },
    completeness: 90,
    isVerified: true,
    isApproved: true,
    joinedDate: '2026-08-20'
  },
  {
    id: 'user-kabir',
    name: 'Kabir Mehta',
    email: 'kabir.mehta.opg@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kabir',
    grade: 'Grade 9',
    section: 'C',
    house: 'Jal',
    role: 'student',
    bio: 'Grade 9 tinkerer with passion for hands-on electronics, soldering, ESP32 microcontrollers, and 3D printing. Looking to team up with senior coders for school exhibitions.',
    skills: [
      { name: 'Arduino & ESP32', category: 'Technical', level: 'Intermediate', verified: true },
      { name: 'Circuit Design & Soldering', category: 'Technical', level: 'Intermediate', verified: true },
      { name: '3D CAD Modeling', category: 'Creative', level: 'Beginner', verified: false }
    ],
    interests: ['Hardware Hacking', 'Drones', 'Clean Energy Prototypes'],
    academicStrengths: ['Science', 'Applied Mathematics'],
    projects: [
      {
        id: 'proj-smart-bin',
        title: 'Automated Solar Smart Segregation Bin',
        description: 'Inductive and ultrasonic sensing waste segregation prototype for school corridors.',
        role: 'Hardware Builder',
        status: 'in-progress'
      }
    ],
    achievements: [
      {
        title: 'Junior Tinkerer Award 2026',
        issuer: 'OPG World School STEM Club',
        date: 'Aug 2026',
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
    joinedDate: '2026-09-01'
  },
  {
    id: 'user-rhea',
    name: 'Rhea Sen',
    email: 'rhea.sen.opg@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rhea',
    grade: 'Grade 11',
    section: 'B',
    house: 'Prithvi',
    role: 'student',
    bio: 'Class 11 PCB student working on biocatalysis, sustainable water purification, and bio-informatics. Enthusiastic about interdisciplinary STEM and research paper publishing.',
    skills: [
      { name: 'Biotechnology & Wet Lab', category: 'Academic', level: 'Advanced', verified: true },
      { name: 'Organic Chemistry', category: 'Academic', level: 'Advanced', verified: true },
      { name: 'Scientific Data Analysis', category: 'Technical', level: 'Intermediate', verified: true }
    ],
    interests: ['Biochemistry', 'Microbiology', 'Sustainable Ecology', 'Science Journalism'],
    academicStrengths: ['Biology', 'Chemistry', 'Environmental Science'],
    projects: [
      {
        id: 'proj-water-filter',
        title: 'Moringa Seed Bio-Coagulant Water Filter',
        description: 'Low-cost water clarification model using organic seed coagulants, tested against Yamuna river water samples.',
        role: 'Principal Student Investigator',
        status: 'in-progress'
      }
    ],
    achievements: [
      {
        title: 'National Children Science Congress State Finalist',
        issuer: 'DST & NCSC India',
        date: 'Feb 2026',
        verified: true
      }
    ],
    availability: 'Open to Collaborate',
    privacySettings: {
      showGradeToAll: true,
      allowDirectMessages: 'anyone',
      showAchievements: true
    },
    completeness: 90,
    isVerified: true,
    isApproved: true,
    joinedDate: '2026-08-18'
  }
];

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
