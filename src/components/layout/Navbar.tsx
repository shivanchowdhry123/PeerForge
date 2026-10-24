import React, { useState } from 'react';
import { 
  Compass, 
  Users, 
  HelpCircle, 
  Sparkles, 
  Info, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Edit3,
  UserPlus,
  LogIn,
  Bell,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentTab: 'home' | 'directory' | 'requests' | 'about';
  onNavigate: (tab: 'home' | 'directory' | 'requests' | 'about') => void;
  onOpenQuestionnaire: () => void;
  onOpenNewRequest: () => void;
  onOpenAuth: () => void;
  onOpenEditProfile: () => void;
  onOpenRegister: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationCount?: number;
  openRequestCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenQuestionnaire,
  onOpenNewRequest,
  onOpenAuth,
  onOpenEditProfile,
  onOpenRegister,
  onOpenNotifications,
  unreadNotificationCount = 0,
  openRequestCount
}) => {
  const { profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Left: Logo & School Branding */}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0 flex-shrink-0" 
            onClick={() => onNavigate('home')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent font-display truncate">
                  PeerForge
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60 whitespace-nowrap">
                  Student Network
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block truncate">Talent Exchange &amp; Student Directory</p>
            </div>
          </div>

          {/* Center: Desktop Navigation Links (Visible on XL screens 1280px+) */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'home'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => onNavigate('directory')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'directory'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              Directory
            </button>

            <button
              onClick={() => onNavigate('requests')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'requests'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Request Board
              {openRequestCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {openRequestCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('about')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'about'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Info className="w-4 h-4" />
              About
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notification Bell Button */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all flex-shrink-0"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 text-indigo-300" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Smart Matching Wizard CTA */}
            <button
              onClick={onOpenQuestionnaire}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Match Me</span>
            </button>


            {/* Quick Post Request Button (Desktop XL screens only) */}
            <button
              onClick={onOpenNewRequest}
              className="hidden 2xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ask for Help</span>
            </button>

            {/* Register as Student Button (Desktop XL screens only) */}
            <button
              onClick={onOpenRegister}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Student</span>
            </button>

            {/* User Profile / Auth State */}
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 pl-1.5 sm:pl-2 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-left"
                  aria-label="User account menu"
                >
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-500/50"
                  />
                  <span className="hidden xl:inline text-xs font-medium text-slate-200 max-w-[90px] truncate">
                    {profile.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 mr-0.5 sm:mr-1" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white">{profile.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{profile.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                          {profile.grade}
                        </span>
                        {profile.isRealRegistration && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                            Registered
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenEditProfile();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-left"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        Edit My Profile &amp; Skills
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenRegister();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-950/40 rounded-lg transition-colors text-left font-medium"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                        Register New Student Profile
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-800 space-y-0.5">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenEditProfile();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors text-left font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        Delete Account
                      </button>

                      <button
                        onClick={() => {
                          signOut();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-slate-400" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Menu hamburger toggle button (Visible on screens < 1280px) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/80 transition-colors ml-1 flex-shrink-0"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-indigo-300" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Drawer for viewports < 1280px */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-900/98 px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-2xl">
          {profile ? (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-indigo-500/50 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{profile.fullName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{profile.email}</p>
                  <span className="inline-block text-[10px] text-indigo-300 font-medium">
                    {profile.grade} • {profile.department}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  onOpenEditProfile();
                  setIsMobileMenuOpen(false);
                }}
                className="p-1.5 text-xs text-indigo-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700 flex-shrink-0"
                title="Edit profile"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-800/40 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-white">Join the Student Network</p>
                <p className="text-[11px] text-slate-300">Create your student profile</p>
              </div>
              <button
                onClick={() => {
                  onOpenRegister();
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm whitespace-nowrap"
              >
                Register
              </button>
            </div>
          )}

          {/* Primary Mobile Action: Smart Matcher CTA */}
          <button
            onClick={() => {
              onOpenQuestionnaire();
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Match Me with a Peer Mentor</span>
          </button>

          {/* Navigation Links */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'home' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Overview &amp; Highlights
            </button>
            <button
              onClick={() => {
                onNavigate('directory');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                currentTab === 'directory' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Student Directory
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">Classes 1–12+</span>
            </button>
            <button
              onClick={() => {
                onNavigate('requests');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                currentTab === 'requests' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Request Board
              </span>
              {openRequestCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  {openRequestCount} open
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onNavigate('about');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                currentTab === 'about' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Info className="w-4 h-4 text-slate-400" />
              About Us &amp; Team
            </button>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenNewRequest();
                setIsMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 text-center flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ask for Help</span>
            </button>
            <button
              onClick={() => {
                onOpenRegister();
                setIsMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 text-white text-center flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Profile</span>
            </button>
          </div>

          {/* Sign In / Sign Out / Delete Account for mobile */}
          <div className="pt-2 border-t border-slate-800 space-y-1">
            {profile ? (
              <>
                <button
                  onClick={() => {
                    onOpenEditProfile();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/30 text-center flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Account</span>
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 text-center flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sign Out ({profile.fullName.split(' ')[0]})</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 text-center flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Existing Account</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

