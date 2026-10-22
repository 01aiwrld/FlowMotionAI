import React, { useState, useEffect } from 'react';
import { Film, Image as ImageIcon, Music, MessageSquare, FolderKanban, Wifi, WifiOff, Download, Sparkles, ShieldCheck, RefreshCw, Smartphone } from 'lucide-react';

interface HeaderProps {
  activeTab: 'video' | 'image' | 'music' | 'copilot' | 'vault';
  setActiveTab: (tab: 'video' | 'image' | 'music' | 'copilot' | 'vault') => void;
  projectCount: number;
  onOpenUpdates: () => void;
  onOpenPhoneModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  projectCount,
  onOpenUpdates,
  onOpenPhoneModal
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090a0f]/85 border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('video')}>
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group">
            <Sparkles className="w-5 h-5 text-white transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse opacity-0 group-hover:opacity-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                FlowMotion
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Studio
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Unlimited AI Image & Video Flow</p>
          </div>
        </div>

        {/* Navigation Tabs (Google Flow minimalist style) */}
        <nav className="flex items-center p-1 bg-slate-900/80 rounded-2xl border border-white/10 shadow-inner overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Video Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Image Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('music')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'music'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Suno Music</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'copilot'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden xs:inline">Flow Copilot</span>
            <span className="xs:hidden">Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'vault'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Projects</span>
            {projectCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-mono">
                {projectCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2">
          {/* Zero Credit Free Unlimited Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Unlimited · 0 Credits</span>
          </div>

          {/* Direct Download App ZIP Button (Visible Everywhere) */}
          <a
            href="/flowmotion-app.zip"
            download="flowmotion-app.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-pink-500/30 transition-all shrink-0 cursor-pointer animate-pulse"
            title="Download Complete App Code (ZIP)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download App (ZIP)</span>
          </a>

          {/* Install on Phone Button */}
          <button
            onClick={onOpenPhoneModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-emerald-600/30 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 text-xs font-medium cursor-pointer transition-all"
            title="Install App to iPhone or Android Phone"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Install on Phone</span>
          </button>

          {/* System Update & Extensions Button */}
          <button
            onClick={onOpenUpdates}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 border border-white/10 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-300 text-xs font-medium cursor-pointer transition-all"
            title="System Updates & Custom Feature Extension Hub"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">Updates & Extensions</span>
          </button>

          {/* PWA Install Button */}
          {canInstall && (
            <button
              onClick={handleInstallClick}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-all"
              title="Install App for Offline Access"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install PWA</span>
            </button>
          )}

          {/* Offline / Online Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border ${
              isOnline
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
            }`}
            title={isOnline ? 'Online with Cloud AI' : 'Offline Mode Active'}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
