import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Key, 
  Server,
  AlertCircle
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  isLiveSupabaseActive, 
  SUPABASE_SQL_SCHEMA,
  resetDemoData 
} from '../../services/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => Promise<void>;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onRefreshData
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [activeTab, setActiveTab] = useState<'connection' | 'schema' | 'architecture'>('connection');
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url.trim(), anonKey.trim());
    setSaveStatus('Credentials saved! Initializing Supabase client...');
    await onRefreshData();
    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);
  };

  const handleResetData = async () => {
    resetDemoData();
    await onRefreshData();
    setSaveStatus('Database refreshed with initial 1,000+ student directory seeds.');
    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLive = isLiveSupabaseActive();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Supabase Cloud Database Backend</h3>
              <p className="text-xs text-slate-400">Zero self-hosting • Out-of-the-box sync • RLS secured</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-6 py-2 bg-slate-850/60 border-b border-slate-800 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('connection')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'connection'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Status &amp; Credentials
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'schema'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SQL DDL Schema
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'architecture'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Architecture &amp; RLS
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'connection' && (
            <div className="space-y-5">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  isLive
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full animate-ping ${
                      isLive ? 'bg-emerald-400' : 'bg-indigo-400'
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {isLive ? 'Connected to Live Supabase Cloud Project' : 'Running on Out-of-the-Box Sandbox Store'}
                    </h4>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {isLive
                        ? 'Real-time PostgreSQL queries and row-level security enabled.'
                        : 'Fully functional client persistence with 1,000+ pre-seeded student records. Add custom Supabase keys below anytime.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetData}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-1 flex-shrink-0"
                  title="Reload seed database"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset Seeds
                </button>
              </div>

              {saveStatus && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{saveStatus}</span>
                </div>
              )}

              {/* Secured Configuration Display */}
              <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Project Credentials Locked &amp; Secured in Root `.env`</span>
                </div>
                <p className="text-slate-400">
                  Supabase database connection details are hardcoded in the root environment configuration (<code className="text-indigo-300">.env</code>). External visitors cannot modify or tamper with the database project configuration.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="block font-medium text-slate-400 mb-1">Project Endpoint:</span>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] truncate">
                      {currentConfig.url || 'Configured via .env (VITE_SUPABASE_URL)'}
                    </div>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400 mb-1">Public Key Status:</span>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] truncate">
                      {currentConfig.anonKey ? '•••••••••••••••• (Injected via .env)' : 'Pending VITE_SUPABASE_ANON_KEY'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">PostgreSQL DDL Migration Script</h4>
                  <p className="text-[11px] text-slate-400">
                    Copy and execute this script once in your Supabase SQL Editor.
                  </p>
                </div>
                <button
                  onClick={handleCopySchema}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-300 max-h-72 overflow-y-auto leading-relaxed">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-850 bg-slate-800/40 border border-slate-700/60 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-emerald-400" />
                  Zero Self-Hosting Architecture
                </h4>
                <p>
                  PeerForge leverages Supabase Managed Postgres for distributed data storage, automatic backups, and real-time subscriptions, eliminating any server maintenance overhead for the school.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-850 bg-slate-800/40 border border-slate-700/60 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Row-Level Security (RLS) &amp; Student Privacy
                </h4>
                <p>
                  All database tables (<code className="text-indigo-300">public.profiles</code> and <code className="text-indigo-300">public.requests</code>) enforce Row-Level Security. Students can only update their personal profile records and manage offers for their created help tickets.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
