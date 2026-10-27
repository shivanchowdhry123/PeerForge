import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_STUDENTS,
  INITIAL_COMMUNITIES,
  INITIAL_POSTS,
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
} from './src/data/initialData.ts';
import {
  StudentProfile,
  AIMatchResult,
  Question,
  Answer,
  Project,
  Message,
  Conversation,
  Community,
  CommunityPost,
  SchoolEvent,
  AppNotification,
  ContentReport,
  ContactInquiry,
  UploadedFile
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// AI Studio dev server must always run on port 3000 (nginx proxy runs on 8080)
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure root /uploads directory exists
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically at /uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for File Uploads directly to root /uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    // Clean filename: timestamp-sanitized
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${Date.now()}_${sanitized}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit
});

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// In-Memory Data Store with Initial School Seed
const db = {
  students: [...INITIAL_STUDENTS],
  communities: [...INITIAL_COMMUNITIES],
  posts: [...INITIAL_POSTS],
  projects: [...INITIAL_PROJECTS],
  questions: [...INITIAL_QUESTIONS],
  answers: [...INITIAL_ANSWERS],
  events: [...INITIAL_EVENTS],
  conversations: [...INITIAL_CONVERSATIONS],
  messages: [...INITIAL_MESSAGES],
  notifications: [...INITIAL_NOTIFICATIONS],
  reports: [...INITIAL_REPORTS],
  contactInquiries: [...INITIAL_CONTACT_INQUIRIES],
  uploadedFiles: [...INITIAL_UPLOADED_FILES],
  auditLogs: [
    {
      id: 'log-1',
      action: 'System Init',
      actor: 'System',
      timestamp: new Date().toISOString(),
      details: 'Database initialized with verified OPG World School rosters and file repository in /uploads'
    }
  ]
};

// --- FILE UPLOADS & REPOSITORY ENDPOINTS ---

// List all files in /uploads
app.get('/api/uploads', (_req: Request, res: Response) => {
  res.json({
    files: db.uploadedFiles,
    totalFiles: db.uploadedFiles.length,
    storageDirectory: '/uploads'
  });
});

// Upload new file to root /uploads
app.post('/api/uploads', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { category, description, projectId, uploaderId, uploaderName, uploaderRole, uploaderAvatar } = req.body;

    const newFile: UploadedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      uploadedBy: {
        id: uploaderId || 'user-aakriti',
        name: uploaderName || 'Student Collaborator',
        role: uploaderRole || 'Student',
        avatar: uploaderAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Uploader'
      },
      category: category || 'Project Document',
      description: description || '',
      projectId: projectId || undefined
    };

    db.uploadedFiles.unshift(newFile);

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'File Uploaded',
      actor: newFile.uploadedBy.name,
      timestamp: new Date().toISOString(),
      details: `Uploaded ${newFile.originalName} (${(newFile.size / 1024).toFixed(1)} KB) to /uploads`
    });

    res.status(201).json({
      success: true,
      file: newFile,
      message: 'File successfully stored in root /uploads directory'
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Failed to process file upload: ' + (err.message || 'Server error') });
  }
});

// Delete file from /uploads
app.delete('/api/uploads/:id', (req: Request, res: Response) => {
  const fileIndex = db.uploadedFiles.findIndex(f => f.id === req.params.id);
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const file = db.uploadedFiles[fileIndex];
  const diskPath = path.join(UPLOADS_DIR, file.filename);

  try {
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }
  } catch (e) {
    console.warn('Could not remove file from disk:', e);
  }

  db.uploadedFiles.splice(fileIndex, 1);
  res.json({ success: true, message: 'File deleted from repository' });
});

// --- GENERAL HEALTH & PLATFORM ENDPOINTS ---

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    school: 'OPG World School',
    location: 'Sector 19B, Dwarka, New Delhi',
    platform: 'PeerForge',
    version: '2.0.0',
    uploadsFolder: '/uploads',
    totalUploads: db.uploadedFiles.length,
    geminiAvailable: Boolean(process.env.GEMINI_API_KEY)
  });
});

// --- STUDENT PROFILES & DIRECTORY ---

app.get('/api/students', (req: Request, res: Response) => {
  const { query, grade, skill, category, availability, house } = req.query;
  let results = [...db.students];

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    results = results.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.bio.toLowerCase().includes(q) ||
      s.skills.some(sk => sk.name.toLowerCase().includes(q)) ||
      s.interests.some(i => i.toLowerCase().includes(q)) ||
      s.academicStrengths.some(a => a.toLowerCase().includes(q))
    );
  }

  if (grade && typeof grade === 'string' && grade !== 'All') {
    results = results.filter(s => s.grade === grade);
  }

  if (house && typeof house === 'string' && house !== 'All') {
    results = results.filter(s => s.house === house);
  }

  if (skill && typeof skill === 'string' && skill !== 'All') {
    const sk = skill.toLowerCase();
    results = results.filter(s => s.skills.some(k => k.name.toLowerCase().includes(sk)));
  }

  if (category && typeof category === 'string' && category !== 'All') {
    results = results.filter(s => s.skills.some(k => k.category === category));
  }

  if (availability && typeof availability === 'string' && availability !== 'All') {
    results = results.filter(s => s.availability === availability);
  }

  res.json(results);
});

app.get('/api/students/:id', (req: Request, res: Response) => {
  const student = db.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  res.json(student);
});

app.post('/api/students', (req: Request, res: Response) => {
  const newStudent: StudentProfile = {
    id: `user-${Date.now()}`,
    name: req.body.name || 'Student Member',
    email: req.body.email || `student.${Date.now()}@opgworldschool.com`,
    avatar: req.body.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(req.body.name || 'OPG')}`,
    grade: req.body.grade || 'Grade 11',
    section: req.body.section || 'A',
    house: req.body.house || 'Agni',
    role: req.body.role || 'student',
    bio: req.body.bio || 'OPG World School student ready to collaborate.',
    skills: req.body.skills || [],
    interests: req.body.interests || [],
    academicStrengths: req.body.academicStrengths || [],
    projects: [],
    achievements: [],
    availability: req.body.availability || 'Active & Seeking Projects',
    privacySettings: {
      showGradeToAll: true,
      allowDirectMessages: 'anyone',
      showAchievements: true
    },
    completeness: 80,
    isVerified: true,
    isApproved: true,
    joinedDate: new Date().toISOString().split('T')[0]
  };

  db.students.unshift(newStudent);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req: Request, res: Response) => {
  const idx = db.students.findIndex(s => s.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const updated: StudentProfile = {
    ...db.students[idx],
    ...req.body
  };

  let comp = 50;
  if (updated.bio && updated.bio.length > 20) comp += 15;
  if (updated.skills && updated.skills.length >= 3) comp += 15;
  if (updated.interests && updated.interests.length >= 2) comp += 10;
  if (updated.projects && updated.projects.length >= 1) comp += 10;
  updated.completeness = Math.min(100, comp);

  db.students[idx] = updated;
  res.json(updated);
});

// --- AI STUDENT DISCOVERY & SEMANTIC MATCHER (WITH QUOTA RESILIENCE) ---

app.post('/api/ai/match-students', async (req: Request, res: Response) => {
  const { query, targetGrade, categoryFilter } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query is required for AI discovery' });
  }

  // Pre-filter candidate list
  let candidatePool = db.students.filter(s => s.isApproved && s.isVerified && !s.isDeactivated);
  if (targetGrade && targetGrade !== 'All') {
    candidatePool = candidatePool.filter(s => s.grade === targetGrade);
  }

  // 1. Attempt Gemini 2.5/3.8 Flash evaluation if API key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const candidatesSummary = candidatePool.map(s => ({
        id: s.id,
        name: s.name,
        grade: s.grade,
        house: s.house,
        bio: s.bio,
        skills: s.skills.map(sk => `${sk.name} (${sk.level})`),
        interests: s.interests,
        strengths: s.academicStrengths,
        availability: s.availability
      }));

      const systemPrompt = `You are the AI Talent Discovery Assistant for OPG World School's networking platform 'PeerForge'.
Analyze the student's request and match the best candidate peers from the school directory based strictly on skills, experience, and academic synergy.
Return strict JSON with this shape:
{
  "extractedRequirements": ["React", "Calculus", "Robotics"],
  "matches": [
    {
      "studentId": "user-aakriti",
      "matchScore": 95,
      "rationale": "Clear 1-2 sentence explanation of why they match.",
      "matchingSkills": ["React & TypeScript", "Full-Stack Web Development"],
      "complementaryRole": "Frontend Architect"
    }
  ]
}`;

      const userPrompt = `Search query: "${query}"
Candidate Student Profiles:
${JSON.stringify(candidatesSummary, null, 2)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\n${userPrompt}`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        const matchedResults: AIMatchResult[] = [];

        if (Array.isArray(parsed.matches)) {
          for (const item of parsed.matches) {
            const student = candidatePool.find(s => s.id === item.studentId);
            if (student) {
              matchedResults.push({
                student,
                matchScore: Math.min(99, Math.max(50, Number(item.matchScore) || 85)),
                rationale: String(item.rationale || 'High alignment with required project proficiencies.'),
                matchingSkills: Array.isArray(item.matchingSkills) && item.matchingSkills.length > 0
                  ? item.matchingSkills
                  : student.skills.slice(0, 2).map(s => s.name),
                complementaryRole: String(item.complementaryRole || 'Core Collaborator')
              });
            }
          }
        }

        if (matchedResults.length > 0) {
          matchedResults.sort((a, b) => b.matchScore - a.matchScore);
          return res.json({
            extractedRequirements: parsed.extractedRequirements || [],
            results: matchedResults,
            aiSource: 'gemini-2.5-flash',
            quotaResilient: true
          });
        }
      }
    } catch (err: any) {
      console.warn('Gemini AI match quota or network error; switching to smart heuristic engine:', err?.message || err);
    }
  }

  // 2. High-Fidelity Heuristic Semantic Matcher (Always Active & Quota-Resilient)
  const qTerms = query.toLowerCase().split(/[\s,+/&|]+/).filter(w => w.length >= 2);
  const matchedResults: AIMatchResult[] = candidatePool.map(student => {
    let score = 35; // base score
    const matchingSkills: string[] = [];

    // Check skills
    student.skills.forEach(skill => {
      const sName = skill.name.toLowerCase();
      const sCat = skill.category.toLowerCase();
      if (qTerms.some(t => sName.includes(t) || t.includes(sName) || sCat.includes(t))) {
        score += skill.level === 'Advanced' ? 28 : skill.level === 'Intermediate' ? 18 : 10;
        matchingSkills.push(skill.name);
      }
    });

    // Check academic strengths
    student.academicStrengths.forEach(str => {
      const sLower = str.toLowerCase();
      if (qTerms.some(t => sLower.includes(t) || t.includes(sLower))) {
        score += 15;
        if (!matchingSkills.includes(str)) matchingSkills.push(str);
      }
    });

    // Check interests
    student.interests.forEach(interest => {
      if (qTerms.some(t => interest.toLowerCase().includes(t))) {
        score += 10;
      }
    });

    // Check bio keywords
    const bioLower = student.bio.toLowerCase();
    qTerms.forEach(t => {
      if (bioLower.includes(t)) score += 6;
    });

    if (student.availability === 'Active & Seeking Projects') score += 10;
    if (student.isVerified) score += 5;
    score = Math.min(98, score);

    let rationale = `Directly matches your search through demonstrated proficiency in ${
      matchingSkills.length > 0 ? matchingSkills.slice(0, 3).join(', ') : 'collaborative teamwork and school projects'
    }.`;
    if (matchingSkills.length === 0) {
      rationale = `Strong candidate with background in ${student.academicStrengths.slice(0, 2).join(' and ')} and active project availability.`;
    }

    const primaryRole = matchingSkills[0] ? `${matchingSkills[0]} Lead` : student.skills[0]?.name ? `${student.skills[0].name} Specialist` : 'Peer Collaborator';

    return {
      student,
      matchScore: score,
      rationale,
      matchingSkills: matchingSkills.length > 0 ? matchingSkills : [student.skills[0]?.name || 'Problem Solving'],
      complementaryRole: primaryRole
    };
  });

  matchedResults.sort((a, b) => b.matchScore - a.matchScore);
  const topMatches = matchedResults.filter(r => r.matchScore >= 45);

  res.json({
    extractedRequirements: qTerms.slice(0, 5),
    results: topMatches.length > 0 ? topMatches : matchedResults.slice(0, 3),
    aiSource: 'smart-heuristic-engine (quota-resilient)',
    quotaResilient: true
  });
});

// --- AI QUESTION ASSISTANT (WITH QUOTA RESILIENCE) ---

app.post('/api/ai/question-assistant', async (req: Request, res: Response) => {
  const { title, body } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Question title is required' });
  }

  const words = title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const similarQuestions = db.questions.filter(q => {
    const qTitle = q.title.toLowerCase();
    return words.some((w: string) => qTitle.includes(w));
  }).slice(0, 3);

  // Gemini AI assistant
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an educational tutor and question coach at OPG World School.
Analyze this student question:
Title: "${title}"
Body: "${body || ''}"

Return JSON:
{
  "suggestedTags": ["Physics", "Mechanics", "Olympiad"],
  "clarityTips": "A helpful 1-sentence tip on how to frame formulas or setup for peer answers.",
  "recommendedTopic": "Physics & STEM | Computer Science | Mathematics | Chemistry & Biology | General"
}`,
        config: { responseMimeType: 'application/json' }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          suggestedTags: parsed.suggestedTags || ['Academics', 'Class 11'],
          clarityTips: parsed.clarityTips || 'Specify textbook chapter or formula being attempted.',
          recommendedTopic: parsed.recommendedTopic || 'Physics & STEM',
          similarExistingQuestions: similarQuestions,
          source: 'gemini-2.5-flash'
        });
      }
    } catch (e: any) {
      console.warn('Gemini question assistant fallback:', e?.message || e);
    }
  }

  // Quota-resilient fallback
  const suggestedTags: string[] = ['OPG Peer Doubt'];
  if (/physics|mechanics|torque|gravity|optics/i.test(title)) suggestedTags.push('Physics', 'STEM');
  else if (/math|calculus|algebra|integral|trig/i.test(title)) suggestedTags.push('Mathematics', 'Calculus');
  else if (/code|react|python|arduino|servo|cs/i.test(title)) suggestedTags.push('Computer Science', 'Coding');
  else suggestedTags.push('Academics', 'Peer Study');

  res.json({
    suggestedTags,
    clarityTips: 'Be specific about what formula or concept you have already tried, and include error messages or question numbers.',
    recommendedTopic: /code|arduino|cs/i.test(title) ? 'Computer Science' : 'Academic Exploration',
    similarExistingQuestions: similarQuestions,
    source: 'smart-heuristic-coach (quota-resilient)'
  });
});

// --- AI PROJECT BRAINSTORMER (WITH QUOTA RESILIENCE) ---

app.post('/api/ai/brainstorm-project', async (req: Request, res: Response) => {
  const { idea, category } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Project idea is required' });
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are the Student Innovation Advisor at OPG World School.
A student wants to build this project:
Idea: "${idea}"
Category: "${category || 'STEM / Innovation'}"

Suggest a high-school feasible project plan with 3 recommended team roles and 4 actionable milestones.
Return JSON:
{
  "projectTitle": "Polished concise project name",
  "refinedDescription": "A concise 2-sentence mission statement.",
  "recommendedRoles": [
    { "roleTitle": "Lead Programmer", "requiredSkill": "Python & OpenCV" },
    { "roleTitle": "Hardware / Sensor Engineer", "requiredSkill": "Arduino / IoT" },
    { "roleTitle": "Visual Designer & Documentation", "requiredSkill": "UI/UX Design" }
  ],
  "milestones": [
    "Milestone 1: Architectural diagram and component acquisition",
    "Milestone 2: Prototype breadboard circuitry & baseline algorithms",
    "Milestone 3: Peer testing & lab evaluation with faculty advisor",
    "Milestone 4: Presentation deck for OPG Science Conclave"
  ]
}`,
        config: { responseMimeType: 'application/json' }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          ...parsed,
          source: 'gemini-2.5-flash'
        });
      }
    } catch (e: any) {
      console.warn('Gemini brainstormer fallback:', e?.message || e);
    }
  }

  // Quota-resilient fallback
  res.json({
    projectTitle: `${idea.split(' ').slice(0, 4).join(' ')} Innovation Prototype`,
    refinedDescription: `An initiative by OPG World School students to design, prototype, and validate ${idea} for academic and peer exhibitions.`,
    recommendedRoles: [
      { roleTitle: 'Technical Development Lead', requiredSkill: 'Python & Web Tech' },
      { roleTitle: 'Hardware / Research Specialist', requiredSkill: 'Electronics & Lab Testing' },
      { roleTitle: 'Design & Presentation Lead', requiredSkill: 'UI/UX Design & Documentation' }
    ],
    milestones: [
      'Milestone 1: Define system requirements and recruit peer team from Classes 9–12',
      'Milestone 2: Build working proof-of-concept in OPG CS & Robotics lab',
      'Milestone 3: Conduct testing rounds and upload documentation to /uploads Files Hub',
      'Milestone 4: Register and showcase at OPG Annual Science Conclave'
    ],
    source: 'smart-heuristic-planner (quota-resilient)'
  });
});

// --- MESSAGES & CONVERSATIONS ---

app.get('/api/conversations', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  let list = db.conversations;
  if (userId) {
    list = list.filter(c => c.participantIds.includes(userId));
  }
  res.json(list);
});

app.get('/api/conversations/:id/messages', (req: Request, res: Response) => {
  const convMessages = db.messages.filter(m => m.conversationId === req.params.id);
  res.json(convMessages);
});

app.post('/api/conversations/:id/messages', (req: Request, res: Response) => {
  const { senderId, text, replyTo } = req.body;
  const conv = db.conversations.find(c => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  const sender = db.students.find(s => s.id === senderId);
  const newMsg: Message = {
    id: `msg-${Date.now()}`,
    conversationId: String(req.params.id),
    senderId,
    senderName: sender?.name || 'Student',
    senderAvatar: sender?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Peer',
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    replyTo: replyTo || undefined,
    readBy: [senderId]
  };

  db.messages.push(newMsg);
  conv.lastMessage = {
    text,
    senderId,
    timestamp: newMsg.timestamp
  };
  conv.updatedAt = new Date().toISOString();

  // Notify other participants
  conv.participantIds.filter(pid => pid !== senderId).forEach(recipientId => {
    db.notifications.unshift({
      id: `notif-${Date.now()}-${recipientId}`,
      userId: recipientId,
      type: 'message',
      title: `New message from ${sender?.name || 'a peer'}`,
      description: text.length > 50 ? `${text.substring(0, 50)}...` : text,
      read: false,
      timestamp: 'Just now',
      actionTab: 'messages'
    });
  });

  res.status(201).json(newMsg);
});

app.post('/api/messages/:id/react', (req: Request, res: Response) => {
  const { userId, emoji } = req.body;
  const msg = db.messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  if (!msg.reactions) msg.reactions = {};
  if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

  const existingIdx = msg.reactions[emoji].indexOf(userId);
  if (existingIdx > -1) {
    msg.reactions[emoji].splice(existingIdx, 1);
    if (msg.reactions[emoji].length === 0) delete msg.reactions[emoji];
  } else {
    msg.reactions[emoji].push(userId);
  }

  res.json(msg);
});

app.post('/api/conversations/direct', (req: Request, res: Response) => {
  const { currentUserId, targetUserId } = req.body;
  let conv = db.conversations.find(
    c => !c.isGroup && c.participantIds.includes(currentUserId) && c.participantIds.includes(targetUserId)
  );

  if (!conv) {
    conv = {
      id: `conv-${Date.now()}`,
      isGroup: false,
      participantIds: [currentUserId, targetUserId],
      updatedAt: new Date().toISOString()
    };
    db.conversations.unshift(conv);
  }

  res.json(conv);
});

// --- QUESTIONS & ANSWERS (PEER DOUBT SOLVING) ---

app.get('/api/questions', (req: Request, res: Response) => {
  const { topic, query } = req.query;
  let list = [...db.questions];

  if (topic && topic !== 'All') {
    list = list.filter(q => q.topic === topic);
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    list = list.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.body.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json(list);
});

app.post('/api/questions', (req: Request, res: Response) => {
  const { authorId, title, body, topic, tags } = req.body;
  const author = db.students.find(s => s.id === authorId);

  const newQuestion: Question = {
    id: `q-${Date.now()}`,
    authorId,
    authorName: author?.name || 'Student Peer',
    authorGrade: author?.grade || 'Grade 11',
    authorAvatar: author?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Doubt',
    title,
    body,
    topic: topic || 'Academics',
    tags: tags || ['General'],
    createdAt: 'Just now',
    upvotes: 0,
    upvotedBy: [],
    answersCount: 0
  };

  db.questions.unshift(newQuestion);
  res.status(201).json(newQuestion);
});

app.get('/api/questions/:id/answers', (req: Request, res: Response) => {
  const answers = db.answers.filter(a => a.questionId === req.params.id);
  res.json(answers);
});

app.post('/api/questions/:id/answers', (req: Request, res: Response) => {
  const { authorId, body } = req.body;
  const q = db.questions.find(item => item.id === req.params.id);
  if (!q) return res.status(404).json({ error: 'Question not found' });

  const author = db.students.find(s => s.id === authorId);
  const newAnswer: Answer = {
    id: `ans-${Date.now()}`,
    questionId: String(req.params.id),
    authorId,
    authorName: author?.name || 'Helpful Peer',
    authorGrade: author?.grade || 'Class 11',
    authorAvatar: author?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Answer',
    body,
    createdAt: 'Just now',
    upvotes: 0,
    upvotedBy: [],
    isAccepted: false
  };

  db.answers.push(newAnswer);
  q.answersCount = (q.answersCount || 0) + 1;

  if (q.authorId !== authorId) {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: q.authorId,
      type: 'answer',
      title: `New answer to your question`,
      description: `${author?.name || 'A peer'} answered: "${q.title}"`,
      read: false,
      timestamp: 'Just now',
      actionTab: 'qa'
    });
  }

  res.status(201).json(newAnswer);
});

app.post('/api/answers/:id/upvote', (req: Request, res: Response) => {
  const { userId } = req.body;
  const ans = db.answers.find(a => a.id === req.params.id);
  if (!ans) return res.status(404).json({ error: 'Answer not found' });

  const idx = ans.upvotedBy.indexOf(userId);
  if (idx > -1) {
    ans.upvotedBy.splice(idx, 1);
    ans.upvotes = Math.max(0, ans.upvotes - 1);
  } else {
    ans.upvotedBy.push(userId);
    ans.upvotes += 1;
  }

  res.json(ans);
});

app.post('/api/questions/:id/accept-answer', (req: Request, res: Response) => {
  const { answerId } = req.body;
  const q = db.questions.find(item => item.id === req.params.id);
  if (!q) return res.status(404).json({ error: 'Question not found' });

  db.answers.filter(a => a.questionId === q.id).forEach(a => {
    a.isAccepted = a.id === answerId;
  });

  q.acceptedAnswerId = answerId;
  res.json({ success: true, acceptedAnswerId: answerId });
});

// --- COMMUNITIES & SOCIETIES ---

app.get('/api/communities', (_req: Request, res: Response) => {
  res.json(db.communities);
});

app.post('/api/communities/:id/join', (req: Request, res: Response) => {
  const comm = db.communities.find(c => c.id === req.params.id);
  if (!comm) return res.status(404).json({ error: 'Community not found' });

  comm.isJoined = !comm.isJoined;
  comm.membersCount += comm.isJoined ? 1 : -1;
  res.json(comm);
});

app.get('/api/communities/:id/posts', (req: Request, res: Response) => {
  const posts = db.posts.filter(p => p.communityId === req.params.id);
  res.json(posts);
});

app.post('/api/communities/:id/posts', (req: Request, res: Response) => {
  const { authorId, content, pollQuestion, pollOptions } = req.body;
  const comm = db.communities.find(c => c.id === req.params.id);
  if (!comm) return res.status(404).json({ error: 'Community not found' });

  const author = db.students.find(s => s.id === authorId);
  const newPost: CommunityPost = {
    id: `post-${Date.now()}`,
    communityId: String(req.params.id),
    authorId,
    authorName: author?.name || 'Student Member',
    authorGrade: author?.grade || 'Class 11',
    authorAvatar: author?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Post',
    content,
    createdAt: 'Just now',
    likes: 0,
    likedBy: [],
    commentsCount: 0,
    poll: pollQuestion && Array.isArray(pollOptions) && pollOptions.length > 0 ? {
      question: pollQuestion,
      options: pollOptions.map((opt: string) => ({ text: opt, votes: 0, voters: [] }))
    } : undefined
  };

  db.posts.unshift(newPost);
  res.status(201).json(newPost);
});

app.post('/api/posts/:id/like', (req: Request, res: Response) => {
  const { userId } = req.body;
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const idx = post.likedBy.indexOf(userId);
  if (idx > -1) {
    post.likedBy.splice(idx, 1);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    post.likedBy.push(userId);
    post.likes += 1;
  }

  res.json(post);
});

app.post('/api/posts/:id/poll-vote', (req: Request, res: Response) => {
  const { userId, optionIndex } = req.body;
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post || !post.poll) return res.status(404).json({ error: 'Poll not found' });

  post.poll.options.forEach((opt, idx) => {
    const voterIdx = opt.voters.indexOf(userId);
    if (voterIdx > -1) {
      opt.voters.splice(voterIdx, 1);
      opt.votes = Math.max(0, opt.votes - 1);
    }
    if (idx === optionIndex) {
      opt.voters.push(userId);
      opt.votes += 1;
    }
  });

  res.json(post);
});

// --- PROJECTS & TEAM BUILDING ---

app.get('/api/projects', (_req: Request, res: Response) => {
  res.json(db.projects);
});

app.post('/api/projects', (req: Request, res: Response) => {
  const { ownerId, title, description, category, teamSize, deadline, requiredSkills, openRoles } = req.body;
  const owner = db.students.find(s => s.id === ownerId);

  const newProject: Project = {
    id: `project-${Date.now()}`,
    title,
    description,
    category: category || 'STEM & Innovation',
    ownerId,
    ownerName: owner?.name || 'Project Lead',
    ownerGrade: owner?.grade || 'Grade 11',
    ownerAvatar: owner?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lead',
    teamSize: teamSize || 3,
    deadline: deadline || '2026-12-31',
    status: 'recruiting',
    requiredSkills: requiredSkills || [],
    openRoles: openRoles || [
      { id: `role-${Date.now()}-1`, title: 'Collaborator', requiredSkill: 'General', status: 'open' }
    ],
    members: [
      {
        studentId: ownerId,
        role: 'Project Founder',
        name: owner?.name || 'Founder',
        avatar: owner?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Founder'
      }
    ],
    applications: [],
    tasks: [
      { id: `task-${Date.now()}-1`, title: 'Kickoff meeting with team members', completed: false }
    ],
    updates: [
      { id: `up-${Date.now()}`, date: new Date().toLocaleDateString(), text: 'Project published on PeerForge.' }
    ]
  };

  db.projects.unshift(newProject);
  res.status(201).json(newProject);
});

app.post('/api/projects/:id/apply', (req: Request, res: Response) => {
  const { studentId, roleId, roleTitle, note } = req.body;
  const proj = db.projects.find(p => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  const student = db.students.find(s => s.id === studentId);
  const newApp = {
    id: `app-${Date.now()}`,
    studentId,
    studentName: student?.name || 'Applicant',
    studentGrade: student?.grade || 'Grade 11',
    studentAvatar: student?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=App',
    roleId,
    roleTitle,
    note: note || '',
    status: 'pending' as const,
    createdAt: 'Just now'
  };

  proj.applications.unshift(newApp);

  // Notify project owner
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: proj.ownerId,
    type: 'invite',
    title: `New application for ${proj.title}`,
    description: `${student?.name} applied for role: ${roleTitle}`,
    read: false,
    timestamp: 'Just now',
    actionTab: 'projects'
  });

  res.status(201).json(newApp);
});

app.post('/api/projects/:id/applications/:appId', (req: Request, res: Response) => {
  const { action, approvedBy } = req.body;
  const proj = db.projects.find(p => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  const application = proj.applications.find(a => a.id === req.params.appId);
  if (!application) return res.status(404).json({ error: 'Application not found' });

  application.status = action;
  if (approvedBy) application.approvedBy = approvedBy;

  if (action === 'accepted') {
    const role = proj.openRoles.find(r => r.id === application.roleId);
    if (role) {
      role.status = 'filled';
      role.assigneeId = application.studentId;
      role.assigneeName = application.studentName;
    }

    if (!proj.members.some(m => m.studentId === application.studentId)) {
      proj.members.push({
        studentId: application.studentId,
        role: application.roleTitle,
        name: application.studentName,
        avatar: application.studentAvatar
      });
    }

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: application.studentId,
      type: 'invite',
      title: `Accepted into ${proj.title}!`,
      description: `You have joined as ${application.roleTitle}.`,
      read: false,
      timestamp: 'Just now',
      actionTab: 'projects'
    });
  }

  res.json({ success: true, application, project: proj });
});

// --- EVENTS & NOTICES ---

app.get('/api/events', (_req: Request, res: Response) => {
  res.json(db.events);
});

app.post('/api/events/:id/rsvp', (req: Request, res: Response) => {
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  event.isRsvpd = !event.isRsvpd;
  event.rsvpCount += event.isRsvpd ? 1 : -1;
  res.json(event);
});

// --- NOTIFICATIONS ---

app.get('/api/notifications', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  let list = db.notifications;
  if (userId) {
    list = list.filter(n => n.userId === userId || n.userId === 'all');
  }
  res.json(list);
});

app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
  const { id, userId } = req.body;
  if (id) {
    const notif = db.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
  } else if (userId) {
    db.notifications.filter(n => n.userId === userId).forEach(n => (n.read = true));
  }
  res.json({ success: true });
});

// --- REPORTS & MODERATION ---

app.post('/api/reports', (req: Request, res: Response) => {
  const { reporterId, reportedUserId, reportedUserName, targetType, targetId, reason, details } = req.body;
  const newReport: ContentReport = {
    id: `rep-${Date.now()}`,
    reporterId,
    reportedUserId,
    reportedUserName: reportedUserName || 'Anonymous',
    targetType,
    targetId,
    reason: reason || 'Community Guidelines Violation',
    details: details || '',
    status: 'pending',
    timestamp: new Date().toLocaleDateString()
  };

  db.reports.unshift(newReport);
  res.status(201).json(newReport);
});

app.get('/api/admin/overview', (_req: Request, res: Response) => {
  res.json({
    totalStudents: db.students.length,
    verifiedStudents: db.students.filter(s => s.isVerified).length,
    activeProjects: db.projects.filter(p => p.status === 'recruiting' || p.status === 'in-progress').length,
    totalQuestions: db.questions.length,
    totalFilesUploaded: db.uploadedFiles.length,
    pendingReports: db.reports.filter(r => r.status === 'pending').length,
    reports: db.reports,
    inquiries: db.contactInquiries,
    auditLogs: db.auditLogs.slice(0, 15)
  });
});

app.post('/api/admin/reports/:id/resolve', (req: Request, res: Response) => {
  const { action, note } = req.body;
  const rep = db.reports.find(r => r.id === req.params.id);
  if (!rep) return res.status(404).json({ error: 'Report not found' });

  rep.status = action === 'dismiss' ? 'dismissed' : 'action_taken';
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: `Report ${action}`,
    actor: 'Admin',
    timestamp: new Date().toISOString(),
    details: `Report ${rep.id} resolved with action ${action}. Note: ${note || 'None'}`
  });

  res.json({ success: true, report: rep });
});

// --- CONTACT INQUIRIES ---

app.get('/api/contact/inquiries', (_req: Request, res: Response) => {
  res.json(db.contactInquiries);
});

app.post('/api/contact/inquiries', (req: Request, res: Response) => {
  const newInq: ContactInquiry = {
    id: `inq-${Date.now()}`,
    name: req.body.name,
    email: req.body.email,
    category: req.body.category || 'General',
    subject: req.body.subject,
    message: req.body.message,
    submittedAt: 'Just now',
    status: 'new'
  };
  db.contactInquiries.unshift(newInq);
  res.status(201).json(newInq);
});

// --- DATA EXPORT ---

app.get('/api/students/:id/export-data', (req: Request, res: Response) => {
  const student = db.students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const userMessages = db.messages.filter(m => m.senderId === student.id);
  const userProjects = db.projects.filter(p => p.ownerId === student.id || p.members.some(m => m.studentId === student.id));
  const userQuestions = db.questions.filter(q => q.authorId === student.id);
  const userFiles = db.uploadedFiles.filter(f => f.uploadedBy.id === student.id);

  res.json({
    school: 'OPG World School',
    studentProfile: student,
    exportedAt: new Date().toISOString(),
    activitySummary: {
      messagesCount: userMessages.length,
      projectsInvolved: userProjects.length,
      questionsAsked: userQuestions.length,
      filesUploaded: userFiles.length
    },
    privacyDeclaration: 'Data generated strictly within the PeerForge firewall under OPG World School Student Data Protection policies.'
  });
});

// --- DEV SERVER (VITE) & PRODUCTION STATIC HOSTING ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`PeerForge OPG World School full-stack server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

startServer();
