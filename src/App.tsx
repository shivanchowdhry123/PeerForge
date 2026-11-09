import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { DiscoverStudentsView } from './views/DiscoverStudentsView';
import { AISkillFinderView } from './views/AISkillFinderView';
import { MessagesView } from './views/MessagesView';
import { QAView } from './views/QAView';
import { ProjectsView } from './views/ProjectsView';
import { EventsView } from './views/EventsView';
import { NotificationsView } from './views/NotificationsView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { AdminView } from './views/AdminView';
import { AboutUsView } from './views/AboutUsView';
import { ContactUsView } from './views/ContactUsView';
import { UploadsView } from './views/UploadsView';
import { OnboardingModal } from './components/OnboardingModal';
import { InviteToProjectModal } from './components/InviteToProjectModal';
import { AuthModal } from './components/AuthModal';
import {
  Home,
  Compass,
  Sparkles,
  MessageSquare,
  HelpCircle,
  FolderKanban,
  Menu,
  X,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';

const AmbientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Top right gradient aura */}
      <div className="absolute -top-40 -right-40 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-blue-400/10 via-indigo-500/10 to-purple-500/5 dark:from-blue-600/15 dark:via-indigo-600/10 dark:to-purple-600/5 blur-3xl opacity-75 transform-gpu" />
      
      {/* Mid left ambient aura */}
      <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sky-400/10 via-indigo-400/5 to-transparent dark:from-sky-700/15 dark:via-indigo-900/10 dark:to-transparent blur-3xl opacity-60 transform-gpu" />

      {/* Bottom right accent glow */}
      <div className="absolute -bottom-32 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-t from-purple-400/10 via-blue-500/5 to-transparent dark:from-purple-900/15 dark:via-blue-900/10 dark:to-transparent blur-3xl opacity-50 transform-gpu" />

      {/* Subtle modern geometric dot matrix */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, unreadMessagesCount, currentUser, reactivateOwnAccount, isSidebarVisible } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'discover':
        return <DiscoverStudentsView />;
      case 'ai-finder':
        return <AISkillFinderView />;
      case 'messages':
        return <MessagesView />;
      case 'qa':
        return <QAView />;
      case 'projects':
        return <ProjectsView />;
      case 'uploads':
        return <UploadsView />;
      case 'events':
        return <EventsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'about':
        return <AboutUsView />;
      case 'contact':
        return <ContactUsView />;
      case 'admin':
        return <AdminView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col relative transition-colors duration-200">
      {/* Subtle ambient visual canvas */}
      <AmbientBackground />

      {/* Top Navbar */}
      <Navbar />

      <div className="flex-1 flex w-full relative z-10">
        {/* Desktop Left Sidebar (Sticks to far left edge of screen) */}
        {isSidebarVisible && (
          <div className="hidden md:block shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex animate-in fade-in duration-200">
            <div className="w-80 max-w-[85vw] bg-[var(--bg-surface)] h-full p-4 overflow-y-auto animate-in slide-in-from-left duration-250 shadow-2xl flex flex-col justify-between border-r border-[var(--border-color)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                    PF
                  </div>
                  <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">
                    PeerForge Menu
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} isMobileDrawer={true} />
              </div>
            </div>
            <div className="flex-1 cursor-pointer" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Central Content Viewport (Expands across full remaining width beside sidebar) */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Mobile Top Header Indicator */}
          <div className="md:hidden flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-color)] gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-primary)] border border-[var(--border-color)] shadow-xs hover:border-[var(--border-hover)] transition-all cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Menu</span>
            </button>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider truncate shrink-0">
              {activeTab.replace('-', ' ')}
            </span>
          </div>

          {/* Deactivation Status Alert */}
          {currentUser?.isDeactivated && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 backdrop-blur-sm flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-medium">Your profile is currently deactivated and hidden from peer directories.</span>
              </div>
              <button
                onClick={reactivateOwnAccount}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Reactivate Account Now
              </button>
            </div>
          )}

          {/* Pending Teacher Verification Notice Banner */}
          {currentUser?.role === 'teacher' && !currentUser?.isApproved && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 backdrop-blur-sm animate-in fade-in flex-wrap sm:flex-nowrap">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold block sm:inline mr-1.5">Faculty Verification Pending:</span>
                  <span className="text-amber-800 dark:text-amber-300">
                    You are not approved right now and so to limit your abilities you are registered as a student. To approve your account contact any registered peer teacher/ PeerForge Team.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('contact')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors shrink-0 shadow-xs cursor-pointer text-xs"
              >
                Contact Support / Peer Teachers
              </button>
            </div>
          )}

          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden sticky bottom-0 z-40 w-full border-t border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all cursor-pointer shrink-0 ${
            activeTab === 'home'
              ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all cursor-pointer shrink-0 ${
            activeTab === 'discover'
              ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Compass className="w-4 h-4 shrink-0" />
          <span>Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all cursor-pointer shrink-0 ${
            activeTab === 'projects'
              ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FolderKanban className="w-4 h-4 shrink-0" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all cursor-pointer shrink-0 ${
            activeTab === 'qa'
              ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>Doubts</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Global Modals */}
      <OnboardingModal />
      <InviteToProjectModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
