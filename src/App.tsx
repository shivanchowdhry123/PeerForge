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
  Menu,
  X,
  AlertTriangle
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
  const { activeTab, setActiveTab, unreadMessagesCount, currentUser, reactivateOwnAccount } = useApp();
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

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        {/* Desktop Left Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-sm flex">
            <div className="w-72 bg-[var(--bg-surface)] h-full p-4 overflow-y-auto animate-in slide-in-from-left duration-200 shadow-2xl border-r border-[var(--border-color)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
                <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Central Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Mobile Top Bar Toggler */}
          <div className="md:hidden flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--border-color)]">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-primary)] border border-[var(--border-color)] shadow-xs hover:border-[var(--border-hover)] transition-all"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              {activeTab.replace('-', ' ')}
            </span>
          </div>

          {/* Deactivation Status Alert */}
          {currentUser?.isDeactivated && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-medium">Your profile is currently deactivated and hidden from peer directories.</span>
              </div>
              <button
                onClick={reactivateOwnAccount}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shrink-0 shadow-xs"
              >
                Reactivate Account Now
              </button>
            </div>
          )}

          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden sticky bottom-0 z-40 w-full border-t border-[var(--border-color)] bg-[var(--bg-surface)]/90 backdrop-blur-lg px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'home' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'discover' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-finder')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'ai-finder' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-purple-500/80'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Matcher</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`relative flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'messages' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-[var(--bg-surface)]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'qa' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Q&A</span>
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
