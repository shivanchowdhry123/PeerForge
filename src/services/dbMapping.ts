import { StudentProfile, RequestTicket, AppNotification, DirectMessage } from '../types';

/**
 * PostgreSQL automatically folds unquoted column names to lowercase.
 * These mapping utilities provide rock-solid bidirectional translation
 * between TypeScript camelCase models and PostgreSQL/Supabase columns.
 */

export interface DbProfileRow {
  id: string;
  userid?: string;
  userId?: string;
  fullname?: string;
  fullName?: string;
  handle?: string;
  email?: string;
  avatarurl?: string | null;
  avatarUrl?: string | null;
  grade?: string;
  department?: string;
  bio?: string | null;
  gpahonorroll?: boolean;
  gpaHonorRoll?: boolean;
  ispeertutorcertified?: boolean;
  isPeerTutorCertified?: boolean;
  availability?: string;
  enrolledclasses?: any;
  enrolledClasses?: any;
  skills?: any;
  tutoringsubjects?: any;
  tutoringSubjects?: any;
  seekinghelpwith?: any;
  seekingHelpWith?: any;
  contactmethods?: any;
  contactMethods?: any;
  totalsessionscompleted?: number;
  totalSessionsCompleted?: number;
  rating?: number | string;
  isrealregistration?: boolean;
  isRealRegistration?: boolean;
  joineddate?: string;
  joinedDate?: string;
}

export function profileToDb(p: StudentProfile): Record<string, any> {
  return {
    id: p.id,
    userid: p.userId,
    fullname: p.fullName,
    handle: p.handle,
    email: p.email,
    avatarurl: p.avatarUrl || null,
    grade: p.grade,
    department: p.department,
    bio: p.bio || '',
    gpahonorroll: Boolean(p.gpaHonorRoll),
    ispeertutorcertified: Boolean(p.isPeerTutorCertified),
    availability: p.availability || 'Available Now',
    enrolledclasses: Array.isArray(p.enrolledClasses) ? p.enrolledClasses : [],
    skills: Array.isArray(p.skills) ? p.skills : [],
    tutoringsubjects: Array.isArray(p.tutoringSubjects) ? p.tutoringSubjects : [],
    seekinghelpwith: Array.isArray(p.seekingHelpWith) ? p.seekingHelpWith : [],
    contactmethods: p.contactMethods || {},
    totalsessionscompleted: p.totalSessionsCompleted || 0,
    rating: Number(p.rating) || 5.0,
    isrealregistration: p.isRealRegistration !== false,
    joineddate: p.joinedDate || new Date().toISOString()
  };
}

export function profileFromDb(row: any): StudentProfile {
  return {
    id: row.id,
    userId: row.userid || row.userId || row.id,
    fullName: row.fullname || row.fullName || 'Student',
    handle: row.handle || '',
    email: row.email || '',
    avatarUrl: row.avatarurl || row.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    grade: (row.grade as any) || 'Grade 11',
    department: (row.department as any) || 'STEM & Coding',
    bio: row.bio || '',
    gpaHonorRoll: row.gpahonorroll ?? row.gpaHonorRoll ?? true,
    isPeerTutorCertified: row.ispeertutorcertified ?? row.isPeerTutorCertified ?? false,
    availability: (row.availability as any) || 'Available Now',
    enrolledClasses: Array.isArray(row.enrolledclasses) ? row.enrolledclasses : Array.isArray(row.enrolledClasses) ? row.enrolledClasses : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
    tutoringSubjects: Array.isArray(row.tutoringsubjects) ? row.tutoringsubjects : Array.isArray(row.tutoringSubjects) ? row.tutoringSubjects : [],
    seekingHelpWith: Array.isArray(row.seekinghelpwith) ? row.seekinghelpwith : Array.isArray(row.seekingHelpWith) ? row.seekingHelpWith : [],
    contactMethods: row.contactmethods || row.contactMethods || {},
    totalSessionsCompleted: Number(row.totalsessionscompleted ?? row.totalSessionsCompleted) || 0,
    rating: Number(row.rating) || 5.0,
    isRealRegistration: row.isrealregistration ?? row.isRealRegistration ?? true,
    joinedDate: row.joineddate || row.joinedDate || new Date().toISOString()
  };
}

export function requestToDb(r: RequestTicket): Record<string, any> {
  return {
    id: r.id,
    creatorid: r.creatorId,
    creatorname: r.creatorName,
    creatoravatar: r.creatorAvatar || null,
    creatorgrade: r.creatorGrade,
    title: r.title,
    description: r.description,
    subject: r.subject,
    department: r.department,
    urgency: r.urgency,
    status: r.status,
    preferredlocation: r.preferredLocation || null,
    tags: Array.isArray(r.tags) ? r.tags : [],
    offers: Array.isArray(r.offers) ? r.offers : [],
    createdat: r.createdAt || new Date().toISOString()
  };
}

export function requestFromDb(row: any): RequestTicket {
  return {
    id: row.id,
    creatorId: row.creatorid || row.creatorId || 'guest',
    creatorName: row.creatorname || row.creatorName || 'Student',
    creatorAvatar: row.creatoravatar || row.creatorAvatar || '',
    creatorGrade: (row.creatorgrade || row.creatorGrade || 'Grade 11') as any,
    title: row.title || 'Help Request',
    description: row.description || '',
    subject: row.subject || 'General Study',
    department: (row.department || 'STEM & Coding') as any,
    urgency: (row.urgency || 'Standard (This Week)') as any,
    status: (row.status || 'Open') as any,
    preferredLocation: row.preferredlocation || row.preferredLocation || 'School Library',
    tags: Array.isArray(row.tags) ? row.tags : [],
    offers: Array.isArray(row.offers) ? row.offers : [],
    createdAt: row.createdat || row.createdAt || new Date().toISOString()
  };
}

export function notificationToDb(n: AppNotification): Record<string, any> {
  return {
    id: n.id,
    recipientid: n.recipientId,
    senderid: n.senderId,
    sendername: n.senderName,
    senderavatar: n.senderAvatar || null,
    title: n.title,
    message: n.message,
    type: n.type,
    read: Boolean(n.read),
    linktab: n.linkTab || null,
    targetid: n.targetId || null,
    createdat: n.createdAt || new Date().toISOString()
  };
}

export function notificationFromDb(row: any): AppNotification {
  return {
    id: row.id,
    recipientId: row.recipientid || row.recipientId || '',
    senderId: row.senderid || row.senderId || '',
    senderName: row.sendername || row.senderName || '',
    senderAvatar: row.senderavatar || row.senderAvatar || '',
    title: row.title || '',
    message: row.message || '',
    type: (row.type || 'message') as any,
    read: Boolean(row.read),
    linkTab: (row.linktab || row.linkTab || undefined) as any,
    targetId: row.targetid || row.targetId || undefined,
    createdAt: row.createdat || row.createdAt || new Date().toISOString()
  };
}

export function messageToDb(m: DirectMessage): Record<string, any> {
  return {
    id: m.id,
    senderid: m.senderId,
    sendername: m.senderName,
    senderavatar: m.senderAvatar || null,
    recipientid: m.recipientId,
    recipientname: m.recipientName,
    recipientavatar: m.recipientAvatar || null,
    content: m.content,
    read: Boolean(m.read),
    createdat: m.createdAt || new Date().toISOString()
  };
}

export function messageFromDb(row: any): DirectMessage {
  return {
    id: row.id,
    senderId: row.senderid || row.senderId || '',
    senderName: row.sendername || row.senderName || '',
    senderAvatar: row.senderavatar || row.senderAvatar || '',
    recipientId: row.recipientid || row.recipientId || '',
    recipientName: row.recipientname || row.recipientName || '',
    recipientAvatar: row.recipientavatar || row.recipientAvatar || '',
    content: row.content || '',
    read: Boolean(row.read),
    createdAt: row.createdat || row.createdAt || new Date().toISOString()
  };
}
