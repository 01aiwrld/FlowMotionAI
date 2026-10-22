import React from 'react';
import { AIModel, AIModelId } from '../../types';
import { Zap, Sparkles, Flame, Mountain, Eye, Video } from 'lucide-react';

export const VIDEO_MODELS: AIModel[] = [
  {
    id: 'seedance-2.5',
    name: 'Seedance 2.5',
    provider: 'ByteDance AI',
    tagline: 'Ultra-Fluid Anime & Kinetic Combat',
    badge: 'Popular',
    bestFor: 'Realistic Anime fight scenes, Katana slashes, lightning aura & martial arts',
    motionPurity: 99,
    color: 'from-amber-500 to-rose-500'
  },
  {
    id: 'kling-2.0',
    name: 'Kling 2.0 HD',
    provider: 'Kuaishou AI',
    tagline: 'Complex Multi-Subject Martial Arts',
    badge: 'Action Master',
    bestFor: 'Physical choreography, rapid sword deflection & acrobatic flips',
    motionPurity: 97,
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'minimax-video-01',
    name: 'MiniMax Video-01',
    provider: 'Hailuo AI',
    tagline: 'Photorealistic Physics & Cinematic Light',
    badge: 'High Fidelity',
    bestFor: 'True-to-life human motion, cloth physics & cinematic lighting',
    motionPurity: 96,
    color: 'from-violet-500 to-purple-600'
  },
  {
    id: 'veo-2-flow',
    name: 'Google Veo 2',
    provider: 'Google DeepMind',
    tagline: 'Cinematic 4K Landscapes & Drone Tracking',
    badge: 'Flow Core',
    bestFor: 'Sweeping aerial mountain ridges, glacial lakes & seamless camera flow',
    motionPurity: 98,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'sora-2-turbo',
    name: 'Sora 2 Turbo',
    provider: 'OpenAI',
    tagline: 'Hyper-Realistic 60s Coherent Simulation',
    badge: '60s Coherence',
    bestFor: 'Extended continuous shot sequences and deep spatial stability',
    motionPurity: 95,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'wanx-2.1',
    name: 'WanX 2.1',
    provider: 'Alibaba AI',
    tagline: 'Dynamic Cel-Shaded Anime & Ink Motion',
    badge: 'Anime Ink',
    bestFor: 'Stylized Japanese animation, fluid ink transitions & speedlines',
    motionPurity: 94,
    color: 'from-pink-500 to-purple-500'
  }
];

interface ModelSelectorProps {
  selectedModel: AIModelId;
  onSelectModel: (id: AIModelId) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelectModel }) => {
  const currentModel = VIDEO_MODELS.find((m) => m.id === selectedModel) || VIDEO_MODELS[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI Video Model Engine</span>
        </label>
        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Unlimited Free Access
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {VIDEO_MODELS.map((model) => {
          const isSelected = model.id === selectedModel;
          return (
            <button
              key={model.id}
              onClick={() => onSelectModel(model.id)}
              className={`relative text-left p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-slate-800/90 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/50 border-white/5 hover:border-white/15 hover:bg-slate-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">
                    {model.provider}
                  </span>
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {model.badge}
                  </span>
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-white truncate">
                  {model.name}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{model.tagline}</p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Motion: {model.motionPurity}%</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-indigo-400 animate-ping' : 'bg-slate-600'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Model Capability Bar */}
      <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{currentModel.name}:</span>
          <span className="text-slate-400">{currentModel.bestFor}</span>
        </div>
        <div className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
          Max Duration: 60s · 60 FPS Fluid
        </div>
      </div>
    </div>
  );
};
