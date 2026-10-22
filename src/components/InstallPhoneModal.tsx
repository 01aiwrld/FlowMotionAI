import React, { useState } from 'react';
import { Smartphone, Apple, Chrome, Copy, Check, X, QrCode, ExternalLink, ShieldCheck } from 'lucide-react';

interface InstallPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPhoneModal: React.FC<InstallPhoneModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'iphone' | 'android' | 'qr'>('iphone');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Use the live public URL or window.location.href
  const appUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://ais-pre-jiglitffnyckl4koiahksd-508534543056.europe-west2.run.app';

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=6366f1&bgcolor=090a0f&data=${encodeURIComponent(appUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Install on Your Phone</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PWA Mobile App
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Run FlowMotion AI Studio like a native app on iOS or Android with full offline access.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers: iPhone vs Android vs Scan QR */}
        <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('iphone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'iphone'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / iPad</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Chrome className="w-4 h-4" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* Content based on tab */}
        {activeTab === 'iphone' && (
          <div className="space-y-3.5 p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-300">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Apple className="w-4 h-4 text-slate-200" />
              <span>iPhone & iPad (Safari Guide)</span>
            </h4>

            <ol className="space-y-2.5 list-decimal list-inside leading-relaxed text-slate-300">
              <li>
                Open this app URL in <strong className="text-white">Safari</strong> on your iPhone.
              </li>
              <li>
                Tap the <strong className="text-indigo-400">Share button</strong> (the square with an arrow pointing upward <span className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">⎋</span> at the bottom of the screen).
              </li>
              <li>
                Scroll down the share sheet and tap <strong className="text-emerald-400 font-semibold">"Add to Home Screen"</strong> (with the plus icon <span className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">+</span>).
              </li>
              <li>
                Tap <strong className="text-white">"Add"</strong> in the top-right corner.
              </li>
            </ol>

            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>FlowMotion AI will now appear on your home screen with its custom app icon and run full-screen without browser address bars!</span>
            </div>
          </div>
        )}

        {activeTab === 'android' && (
          <div className="space-y-3.5 p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-300">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Chrome className="w-4 h-4 text-emerald-400" />
              <span>Android (Google Chrome Guide)</span>
            </h4>

            <ol className="space-y-2.5 list-decimal list-inside leading-relaxed text-slate-300">
              <li>
                Open this app URL in <strong className="text-white">Google Chrome</strong> on your Android phone.
              </li>
              <li>
                Tap the <strong className="text-emerald-400">three-dot menu (⋮)</strong> in the top-right corner.
              </li>
              <li>
                Tap <strong className="text-indigo-400 font-semibold">"Install App"</strong> or <strong className="text-indigo-400 font-semibold">"Add to Home screen"</strong>.
              </li>
              <li>
                Tap <strong className="text-white">"Install"</strong> to confirm.
              </li>
            </ol>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>The app will be installed to your App Drawer and Home Screen with standalone offline playback!</span>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-white/5 text-center flex flex-col items-center justify-center">
            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 shadow-xl">
              <img
                src={qrCodeUrl}
                alt="Scan to open on phone"
                className="w-48 h-48 rounded-xl object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-xs text-white">Scan with Your Phone's Camera</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Point your iPhone or Android camera at this code to open and install instantly.
              </p>
            </div>
          </div>
        )}

        {/* Copy App Link Box */}
        <div className="p-3 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between gap-2 text-xs">
          <span className="font-mono text-slate-400 truncate text-[11px]">{appUrl}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shrink-0 cursor-pointer transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
