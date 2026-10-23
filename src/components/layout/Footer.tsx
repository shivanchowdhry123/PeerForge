import React from 'react';
import { Compass, ShieldCheck, Heart, BookOpen } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'home' | 'directory' | 'requests' | 'about') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About Platform */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-tight font-display text-base">PeerForge</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              OPG World School’s peer talent exchange and student directory. Fostering cross-grade mentorship and academic collaboration across Classes 1-12+, Alumni, and Faculty.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>OPG World School Honor Code Compliant</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 font-display">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-indigo-400 transition-colors">
                  Overview &amp; Highlights
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('directory')} className="hover:text-indigo-400 transition-colors">
                  Student Directory (Classes 1-12+)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('requests')} className="hover:text-indigo-400 transition-colors">
                  Request Board &amp; Help Desk
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-indigo-400 transition-colors">
                  Origin Story &amp; Leadership Team
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Departments & Tutoring */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 font-display">
              Academic Hubs
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400 hover:text-slate-200 cursor-pointer" onClick={() => onNavigate('directory')}>
                STEM &amp; Computer Science
              </li>
              <li className="text-slate-400 hover:text-slate-200 cursor-pointer" onClick={() => onNavigate('directory')}>
                Robotics &amp; Engineering Lab
              </li>
              <li className="text-slate-400 hover:text-slate-200 cursor-pointer" onClick={() => onNavigate('directory')}>
                Humanities &amp; Writing Center
              </li>
              <li className="text-slate-400 hover:text-slate-200 cursor-pointer" onClick={() => onNavigate('directory')}>
                Languages &amp; World Cultures
              </li>
              <li className="text-slate-400 hover:text-slate-200 cursor-pointer" onClick={() => onNavigate('directory')}>
                Speech, Debate &amp; Model UN
              </li>
            </ul>
          </div>

          {/* Col 4: Safety & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1 font-display">
              Safety &amp; Support
            </h4>
            <p className="text-xs text-slate-400">
              Encouraging ethical academic assistance, peer support, and student safety across campus.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Peer Tutors</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Honor Code Enforced</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              For academic inquiries or guidance, reach out to the PeerForge Steering Committee.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} OPG World School Talent Exchange. Built for students, by students.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> for peer education
            </span>
            <span>•</span>
            <span>Privacy &amp; Safety First</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

