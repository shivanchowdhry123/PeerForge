import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/home/HomePage';
import { DirectoryPage } from './components/directory/DirectoryPage';
import { RequestBoardPage } from './components/requests/RequestBoardPage';
import { AboutUsPage } from './components/about/AboutUsPage';
import { ProfileModal } from './components/directory/ProfileModal';
import { MatchingWizardModal } from './components/questionnaire/MatchingWizardModal';
import { NewRequestModal } from './components/requests/NewRequestModal';
import { AuthModal } from './components/auth/AuthModal';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { RegisterStudentModal } from './components/auth/RegisterStudentModal';
import { NotificationModal } from './components/notifications/NotificationModal';
import { DirectMessageModal } from './components/messaging/DirectMessageModal';
import { StudentProfile, RequestTicket, Department, UrgencyLevel, RequestStatus, AppNotification } from './types';
import { 
  fetchAllProfiles, 
  fetchAllRequests, 
  endorseSkill, 
  createRequestTicket, 
  addOfferToRequest, 
  updateRequestStatus,
  fetchNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from './services/supabaseClient';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

function MainApp() {
  const { profile: currentUserProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState<'home' | 'directory' | 'requests' | 'about'>('home');
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [requests, setRequests] = useState<RequestTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Notifications & Direct Messages State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDirectMessageOpen, setIsDirectMessageOpen] = useState(false);
  const [directMessageRecipient, setDirectMessageRecipient] = useState<StudentProfile | null>(null);

  // Modals state
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadAllData = async () => {
    try {
      const [profs, reqs] = await Promise.all([
        fetchAllProfiles(),
        fetchAllRequests()
      ]);
      setProfiles(profs);
      setRequests(reqs);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotificationsForUser = async () => {
    if (!currentUserProfile) return;
    const notifs = await fetchNotifications(currentUserProfile.userId);
    setNotifications(notifs);
  };

  useEffect(() => {
    loadAllData();
  }, [currentUserProfile]);

  useEffect(() => {
    if (currentUserProfile) {
      loadNotificationsForUser();
      const interval = setInterval(loadNotificationsForUser, 4000);
      return () => clearInterval(interval);
    }
  }, [currentUserProfile]);

  // Handlers
  const handleStudentRegistered = (newProfile: StudentProfile) => {
    setProfiles((prev) => [newProfile, ...prev.filter((p) => p.id !== newProfile.id)]);
    showToast(`Welcome ${newProfile.fullName}! Your profile has been added to the school directory.`);
    setCurrentTab('directory');
  };

  const handleOpenDirectMessageWithUser = (recipient: StudentProfile | string) => {
    if (typeof recipient === 'string') {
      const matched = profiles.find((p) => p.id === recipient || p.userId === recipient);
      if (matched) {
        setDirectMessageRecipient(matched);
        setIsDirectMessageOpen(true);
      } else {
        showToast('Student profile not found in directory');
      }
    } else {
      setDirectMessageRecipient(recipient);
      setIsDirectMessageOpen(true);
    }
  };

  const handleEndorseSkill = async (profileId: string, skillId: string) => {
    const updated = await endorseSkill(profileId, skillId);
    if (updated) {
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedProfile && selectedProfile.id === updated.id) {
        setSelectedProfile(updated);
      }
      showToast(`Endorsement recorded for ${updated.fullName}!`);

      if (currentUserProfile && currentUserProfile.id !== profileId) {
        await addNotification({
          recipientId: updated.userId,
          senderId: currentUserProfile.userId,
          senderName: currentUserProfile.fullName,
          senderAvatar: currentUserProfile.avatarUrl,
          title: `Skill Endorsement Received`,
          message: `${currentUserProfile.fullName} endorsed your skills on PeerForge!`,
          type: 'endorsement',
          linkTab: 'directory',
          targetId: updated.id
        });
      }
    }
  };

  const handleCreateRequest = async (ticketData: {
    title: string;
    description: string;
    subject: string;
    department: Department;
    urgency: UrgencyLevel;
    preferredLocation: string;
    tags: string[];
  }) => {
    const creator = currentUserProfile || profiles[0];
    const newTicket = await createRequestTicket({
      ...ticketData,
      creatorId: creator ? creator.userId : 'guest',
      creatorName: creator ? creator.fullName : 'Guest Student',
      creatorAvatar: creator ? creator.avatarUrl : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      creatorGrade: creator ? creator.grade : 'Class 11',
      status: 'Open'
    });

    setRequests((prev) => [newTicket, ...prev]);
    showToast('Your help request has been published to the Request Board!');
  };

  const handleOfferHelp = async (requestId: string, offerMessage: string) => {
    const helper = currentUserProfile || profiles[0];
    if (!helper) return;

    const targetTicket = requests.find((r) => r.id === requestId);

    const updated = await addOfferToRequest(requestId, {
      helperId: helper.userId,
      helperName: helper.fullName,
      helperAvatar: helper.avatarUrl,
      helperGrade: helper.grade,
      message: offerMessage,
      contactEmail: helper.email
    });

    if (updated) {
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      showToast('Offer submitted to student! They received a direct notification.');

      if (targetTicket) {
        await addNotification({
          recipientId: targetTicket.creatorId,
          senderId: helper.userId,
          senderName: helper.fullName,
          senderAvatar: helper.avatarUrl,
          title: `New Help Offer on "${targetTicket.title}"`,
          message: `${helper.fullName} (${helper.grade}) offered to help: "${offerMessage}"`,
          type: 'offer',
          linkTab: 'requests',
          targetId: requestId
        });
      }
    }
  };

  const handleUpdateStatus = async (requestId: string, status: RequestStatus) => {
    const updated = await updateRequestStatus(requestId, status);
    if (updated) {
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      showToast(`Request marked as ${status}.`);
    }
  };

  const handleRequestSession = async (mentor: StudentProfile, subject: string, message: string) => {
    showToast(`Session request dispatched to ${mentor.fullName} for ${subject}!`);

    if (currentUserProfile) {
      await addNotification({
        recipientId: mentor.userId,
        senderId: currentUserProfile.userId,
        senderName: currentUserProfile.fullName,
        senderAvatar: currentUserProfile.avatarUrl,
        title: `Study Session Request for ${subject}`,
        message: `${currentUserProfile.fullName} requested a study session: ${message || 'Check your school email for free period timing.'}`,
        type: 'session',
        linkTab: 'directory',
        targetId: mentor.id
      });
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllNotifsRead = async () => {
    if (!currentUserProfile) return;
    await markAllNotificationsAsRead(currentUserProfile.userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const openRequestCount = requests.filter((r) => r.status === 'Open').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="px-4 py-3 rounded-2xl bg-indigo-950 border border-indigo-700/80 shadow-2xl text-white text-xs flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onOpenQuestionnaire={() => setIsQuestionnaireOpen(true)}
        onOpenNewRequest={() => setIsNewRequestOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationCount={unreadCount}
        openRequestCount={openRequestCount}
      />

      {/* Main Body Routing */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            profiles={profiles}
            requests={requests}
            onNavigate={setCurrentTab}
            onOpenQuestionnaire={() => setIsQuestionnaireOpen(true)}
            onSelectProfile={setSelectedProfile}
            onOpenRegister={() => setIsRegisterOpen(true)}
          />
        )}

        {currentTab === 'directory' && (
          <DirectoryPage
            profiles={profiles}
            onSelectProfile={setSelectedProfile}
            onEndorseSkill={handleEndorseSkill}
            onOpenQuestionnaire={() => setIsQuestionnaireOpen(true)}
            onOpenRegister={() => setIsRegisterOpen(true)}
          />
        )}

        {currentTab === 'requests' && (
          <RequestBoardPage
            requests={requests}
            onOpenNewRequest={() => setIsNewRequestOpen(true)}
            onOpenQuestionnaire={() => setIsQuestionnaireOpen(true)}
            onOfferHelp={handleOfferHelp}
            onUpdateStatus={handleUpdateStatus}
            onOpenDirectMessage={handleOpenDirectMessageWithUser}
          />
        )}

        {currentTab === 'about' && <AboutUsPage />}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={setCurrentTab}
      />

      {/* Modals */}
      <ProfileModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onEndorseSkill={handleEndorseSkill}
        onRequestSession={handleRequestSession}
        onOpenDirectMessage={handleOpenDirectMessageWithUser}
      />

      <MatchingWizardModal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        profiles={profiles}
        onSelectProfile={setSelectedProfile}
        onCreateRequestTicket={handleCreateRequest}
      />

      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onSubmit={handleCreateRequest}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      <RegisterStudentModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleStudentRegistered}
      />

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifRead}
        onMarkAllAsRead={handleMarkAllNotifsRead}
        onOpenDirectMessage={(userId) => {
          setIsNotificationsOpen(false);
          handleOpenDirectMessageWithUser(userId);
        }}
        onNavigateTab={(tab) => {
          setIsNotificationsOpen(false);
          setCurrentTab(tab);
        }}
      />

      <DirectMessageModal
        isOpen={isDirectMessageOpen}
        onClose={() => setIsDirectMessageOpen(false)}
        recipient={directMessageRecipient}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

