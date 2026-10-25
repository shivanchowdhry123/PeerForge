import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Database, 
  WifiOff, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Layers, 
  ExternalLink 
} from 'lucide-react';
import { 
  subscribeSyncState, 
  getSyncState, 
  triggerManualSync, 
  testSupabaseConnection, 
  SyncState 
} from '../../services/supabaseClient';

export const SyncStatusBanner: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncState>(getSyncState());
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null);
  const [isTestingDiag, setIsTestingDiag] = useState(false);
  const [secondsUntilRetry, setSecondsUntilRetry] = useState(10);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSyncState((state) => {
      setSyncState(state);
      if (state.pendingCount === 0 && !state.lastError) {
        setIsDismissed(false);
      }
    });
    return unsubscribe;
  }, []);

  // Countdown timer for 10-second silent retry
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilRetry((prev) => (prev <= 1 ? 10 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRetry = async () => {
    setIsRetrying(true);
    try {
      const updated = await triggerManualSync();
      setSyncState(updated);
      setSecondsUntilRetry(10);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleOpenDiagnostics = async () => {
    setIsDiagnosticsOpen(true);
    setIsTestingDiag(true);
    try {
      const res = await testSupabaseConnection();
      setDiagnosticsResult(res);
    } finally {
      setIsTestingDiag(false);
    }
  };

  const hasIssues = syncState.pendingCount > 0 || syncState.status === 'error';

  return (
    <>
      {/* Sync Warning Banner if write failed or outbox pending */}
      {hasIssues && !isDismissed && (
        <aside 
          aria-label="Cloud synchronization warning"
          className="w-full bg-gradient-to-r from-amber-950/90 via-rose-950/90 to-amber-950/90 border-b border-amber-600/60 px-4 py-2.5 text-amber-200 text-xs shadow-lg animate-in slide-in-from-top-1 duration-200 z-30"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-400 flex-shrink-0">
                <AlertTriangle className="w-4 h-4 animate-pulse text-amber-400" />
              </span>
              <div className="min-w-0">
                <span className="font-bold text-white tracking-wide">
                  Sync Alert: {syncState.pendingCount} item{syncState.pendingCount === 1 ? '' : 's'} not synced to cloud database
                </span>
                <span className="mx-1.5 text-amber-500 hidden sm:inline">•</span>
                <span className="text-amber-300 truncate inline-block max-w-[280px] sm:max-w-md align-bottom">
                  {syncState.lastError || 'Server connection interrupted'}
                </span>
                <span className="text-amber-400/80 ml-2 font-mono text-[11px]">
                  (auto-retrying silently in {secondsUntilRetry}s)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
              <button
                onClick={handleManualRetry}
                disabled={isRetrying}
                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying...' : 'Retry Now'}</span>
              </button>

              <button
                onClick={handleOpenDiagnostics}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-amber-200 border border-amber-600/40 text-[11px] font-medium transition-colors"
              >
                Inspect Connection
              </button>

              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 rounded hover:bg-amber-900/40 text-amber-300 hover:text-white"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Discreet Live Sync Badge Bar */}
      {!hasIssues && (
        <div className="w-full bg-slate-950/70 border-b border-slate-800/60 px-4 py-1 text-[11px] text-slate-400">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300 font-medium">
                Cloud Database Connected (Supabase)
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 hidden sm:inline">
                Profiles &amp; Requests sync automatically across all devices every 10s
              </span>
            </div>

            <button
              onClick={handleOpenDiagnostics}
              className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition-colors"
            >
              <Database className="w-3 h-3 text-indigo-400" />
              <span>Status Check</span>
            </button>
          </div>
        </div>
      )}

      {/* Diagnostics Modal */}
      {isDiagnosticsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Database className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Cloud Database &amp; Sync Diagnostics
                  </h3>
                  <p className="text-xs text-slate-400">Cross-device verification status</p>
                </div>
              </div>
              <button
                onClick={() => setIsDiagnosticsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Endpoint card */}
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Cloud Database Endpoint
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                    Active
                  </span>
                </div>
                <p className="text-xs font-mono text-indigo-300 break-all">
                  https://hgwmksnszoeqztqvvzkg.supabase.co
                </p>
                <p className="text-[11px] text-slate-400">
                  Direct client-side and server-side cloud synchronization for Vercel and production hosting.
                </p>
              </div>

              {/* Table Statuses */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Database Table Health Check
                </h4>
                {isTestingDiag ? (
                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    Testing live connection to Supabase tables...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800/80 flex items-center justify-between">
                      <span className="font-mono text-slate-300">public.profiles</span>
                      {diagnosticsResult?.profilesOk ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold text-[11px]">Error</span>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800/80 flex items-center justify-between">
                      <span className="font-mono text-slate-300">public.requests</span>
                      {diagnosticsResult?.requestsOk ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold text-[11px]">Error</span>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800/80 flex items-center justify-between">
                      <span className="font-mono text-slate-300">public.notifications</span>
                      {diagnosticsResult?.notificationsOk ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold text-[11px]">Error</span>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800/80 flex items-center justify-between">
                      <span className="font-mono text-slate-300">public.direct_messages</span>
                      {diagnosticsResult?.messagesOk ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold text-[11px]">Error</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sync queue info */}
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Background Retry Worker
                  </span>
                  <span className="text-xs font-mono text-emerald-400">Every 10 Seconds</span>
                </div>
                <p className="text-xs text-slate-400">
                  Any profile or request created on Computer A is saved to the central cloud database immediately.
                  Computer B checks the cloud database every 10 seconds silently and pulls new profiles and posts automatically.
                </p>
                {syncState.lastError && (
                  <div className="p-2 rounded bg-rose-950/50 border border-rose-800/50 text-[11px] text-rose-300">
                    <strong>Last Error Recorded:</strong> {syncState.lastError}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {syncState.lastSyncedAt 
                  ? `Last synced: ${new Date(syncState.lastSyncedAt).toLocaleTimeString()}`
                  : 'Sync worker running'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualRetry}
                  disabled={isRetrying}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Syncing...' : 'Force Sync Now'}</span>
                </button>
                <button
                  onClick={() => setIsDiagnosticsOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
