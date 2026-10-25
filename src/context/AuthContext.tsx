import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile, GradeLevel, Department } from '../types';
import { fetchAllProfiles, saveProfile, deleteProfile, getSupabase, isLiveSupabaseActive } from '../services/supabaseClient';

interface AuthUser {
  id: string;
  email: string;
  role: 'student' | 'tutor' | 'faculty' | 'admin';
}

export interface RegisterStudentPayload {
  email: string;
  password?: string;
  fullName: string;
  handle?: string;
  grade: GradeLevel;
  department: Department;
  bio: string;
  enrolledClasses: string[];
  tutoringSubjects: string[];
  skills: string[];
  seekingHelpWith?: string[];
  campusLocation?: string;
  discord?: string;
  avatarUrl?: string;
  isPeerTutorCertified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: StudentProfile | null;
  isLoading: boolean;
  isLiveSupabase: boolean;
  loginAsDemoUser: (profileId: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, grade: any) => Promise<{ error?: string }>;
  registerFullStudent: (payload: RegisterStudentPayload) => Promise<{ profile?: StudentProfile; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateCurrentProfile: (updatedProfile: StudentProfile) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_STORAGE_KEY = 'peerforge_current_user_profile_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);

  useEffect(() => {
    async function loadInitialSession() {
      setIsLoading(true);
      setIsLiveSupabase(isLiveSupabaseActive());

      const profiles = await fetchAllProfiles();
      const savedProfileId = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      
      // ONLY restore session if this specific device has an active saved profile ID in its localStorage
      if (savedProfileId) {
        const existing = profiles.find((p) => p.id === savedProfileId);
        if (existing) {
          setProfile(existing);
          setUser({
            id: existing.userId,
            email: existing.email,
            role: existing.isPeerTutorCertified ? 'tutor' : 'student'
          });
        } else {
          // Stored ID was deleted or invalid on this device
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
          setProfile(null);
          setUser(null);
        }
      } else {
        // No session stored on this device - user is a guest!
        setProfile(null);
        setUser(null);
      }
      setIsLoading(false);
    }

    loadInitialSession();
  }, []);

  const loginAsDemoUser = async (profileId: string) => {
    const profiles = await fetchAllProfiles();
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      setProfile(target);
      setUser({
        id: target.userId,
        email: target.email,
        role: target.grade === 'Faculty/Alumni' ? 'faculty' : target.isPeerTutorCertified ? 'tutor' : 'student'
      });
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, target.id);
    }
  };

  const registerFullStudent = async (payload: RegisterStudentPayload): Promise<{ profile?: StudentProfile; error?: string }> => {
    if (!payload.email || !payload.fullName) {
      return { error: 'Please provide full name and student school email' };
    }

    // Check duplicate email
    const existingProfiles = await fetchAllProfiles();
    const duplicate = existingProfiles.find(
      (p) => p.email.toLowerCase() === payload.email.trim().toLowerCase()
    );
    if (duplicate) {
      return { error: 'An account with this email already exists. Please sign in with your password.' };
    }

    // If live Supabase, register in auth
    if (isLiveSupabaseActive() && payload.password) {
      const client = getSupabase();
      if (client) {
        try {
          await client.auth.signUp({
            email: payload.email,
            password: payload.password
          });
        } catch (e) {
          console.warn('Supabase auth signup warning:', e);
        }
      }
    }

    const uniqueId = `student-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const studentHandle = payload.handle && payload.handle.startsWith('@')
      ? payload.handle
      : `@${payload.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80'
    ];

    const finalAvatar = payload.avatarUrl?.trim() || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const formattedSkills = (payload.skills || []).map((skillName, idx) => ({
      id: `sk-${uniqueId}-${idx}`,
      name: skillName.trim(),
      category: payload.department,
      endorsementsCount: 1
    }));

    const newStudentProfile: StudentProfile = {
      id: uniqueId,
      userId: `user-${uniqueId}`,
      fullName: payload.fullName.trim(),
      handle: studentHandle,
      email: payload.email.trim(),
      avatarUrl: finalAvatar,
      grade: payload.grade || 'Grade 11',
      department: payload.department || 'STEM & Coding',
      bio: payload.bio?.trim() || 'Newly registered student ready to connect and study!',
      gpaHonorRoll: true,
      isPeerTutorCertified: !!payload.isPeerTutorCertified,
      availability: 'Available Now',
      enrolledClasses: payload.enrolledClasses || [],
      skills: formattedSkills,
      tutoringSubjects: payload.tutoringSubjects || [],
      seekingHelpWith: payload.seekingHelpWith || [],
      contactMethods: {
        email: payload.email.trim(),
        discord: payload.discord?.trim() || undefined,
        campusLocation: payload.campusLocation?.trim() || 'Library Study Commons'
      },
      totalSessionsCompleted: 0,
      rating: 5.0,
      joinedDate: new Date().toISOString(),
      isRealRegistration: true,
      password: payload.password?.trim() || ''
    };

    await saveProfile(newStudentProfile);
    setProfile(newStudentProfile);
    setUser({ id: newStudentProfile.userId, email: newStudentProfile.email, role: newStudentProfile.isPeerTutorCertified ? 'tutor' : 'student' });
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, newStudentProfile.id);

    return { profile: newStudentProfile };
  };

  const signIn = async (email: string, password?: string): Promise<{ error?: string }> => {
    const cleanQuery = email.trim().toLowerCase();
    if (!cleanQuery) {
      return { error: 'Please enter your student name, handle, or email.' };
    }

    if (!password || !password.trim()) {
      return { error: 'Please enter your account password.' };
    }

    const profiles = await fetchAllProfiles();
    const matched = profiles.find((p) => 
      p.email.toLowerCase().trim() === cleanQuery ||
      p.fullName.toLowerCase().trim() === cleanQuery ||
      p.handle.toLowerCase().trim() === cleanQuery
    );

    if (matched) {
      if (matched.password && matched.password !== password.trim()) {
        return { error: `Incorrect password for student account "${matched.fullName}".` };
      }

      setProfile(matched);
      setUser({ id: matched.userId, email: matched.email, role: matched.isPeerTutorCertified ? 'tutor' : 'student' });
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, matched.id);

      if (isLiveSupabaseActive()) {
        const client = getSupabase();
        if (client) {
          try {
            await client.auth.signInWithPassword({ email: matched.email, password: password.trim() });
          } catch (e) {
            console.warn('Supabase auth sign in notice:', e);
          }
        }
      }
      return {};
    }

    if (isLiveSupabaseActive()) {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client.auth.signInWithPassword({ email: cleanQuery, password: password.trim() });
          if (!error && data.user) {
            setUser({ id: data.user.id, email: data.user.email || cleanQuery, role: 'student' });
            return {};
          }
        } catch (e) {}
      }
    }

    return { error: `No student profile found matching "${email}". Please register a new profile.` };
  };

  const signUp = async (email: string, password: string, fullName: string, grade: any): Promise<{ error?: string }> => {
    return (await registerFullStudent({
      email,
      password,
      fullName,
      grade,
      department: 'STEM & Coding',
      bio: 'Newly registered student.',
      enrolledClasses: [],
      tutoringSubjects: [],
      skills: ['General Academics']
    })).error ? { error: 'Registration failed' } : {};
  };

  const signOut = async () => {
    if (isLiveSupabaseActive()) {
      const client = getSupabase();
      if (client) await client.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  const updateCurrentProfile = async (updated: StudentProfile) => {
    await saveProfile(updated);
    setProfile(updated);
  };

  const deleteAccount = async () => {
    if (!profile) return;
    const targetId = profile.id;
    await deleteProfile(targetId);
    if (isLiveSupabaseActive()) {
      const client = getSupabase();
      if (client) {
        try {
          await client.auth.signOut();
        } catch (e) {
          console.warn('Sign out on delete account warning:', e);
        }
      }
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isLiveSupabase,
        loginAsDemoUser,
        signUp,
        registerFullStudent,
        signIn,
        signOut,
        updateCurrentProfile,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
