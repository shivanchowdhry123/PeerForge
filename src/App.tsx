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
import { CommunitiesView } from './views/CommunitiesView';
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
  HardDriveUpload
} from 'lucide-react';

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
      case 'communities':
        return <CommunitiesView />;
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
    <div className="min-h-screen bg-ivory-page dark:bg-[var(--bg-ivory)] text-[var(--text-primary)] flex flex-col transition-colors selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Left Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex">
            <div className="w-72 bg-[var(--bg-surface)] h-full p-4 overflow-y-auto animate-in slide-in-from-left">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-2">
                <span className="font-bold text-sm text-[var(--text-primary)]">Navigation Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
          <div className="md:hidden flex items-center justify-between pb-4 mb-2 border-b border-[var(--border-color)]">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] border border-[var(--border-color)]"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              {activeTab.replace('-', ' ')}
            </span>
          </div>

          {/* Deactivation Status Alert */}
          {currentUser?.isDeactivated && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>Your account is currently deactivated and hidden from fellow student directories.</span>
              </div>
              <button
                onClick={reactivateOwnAccount}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shrink-0 shadow-2xs"
              >
                Reactivate Account Now
              </button>
            </div>
          )}

          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden sticky bottom-0 z-40 w-full border-t border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-md px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeTab === 'home' ? 'text-blue-600 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeTab === 'discover' ? 'text-blue-600 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Discover</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-finder')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeTab === 'ai-finder' ? 'text-purple-600 font-bold' : 'text-purple-500'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Match Finder</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`relative flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeTab === 'messages' ? 'text-blue-600 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeTab === 'qa' ? 'text-blue-600 font-bold' : 'text-[var(--text-muted)]'
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
