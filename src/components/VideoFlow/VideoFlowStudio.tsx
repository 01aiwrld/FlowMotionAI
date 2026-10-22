import React, { useState } from 'react';
import { VideoProject, AIModelId, CameraMotion, PhotoKeyframe, SubtitleStyle, DubbingConfig, SoundEffectTrack } from '../../types';
import { ModelSelector } from './ModelSelector';
import { PhotoAnimator } from './PhotoAnimator';
import { MotionControls } from './MotionControls';
import { SoundAndDubbing } from './SoundAndDubbing';
import { VideoPreviewPlayer } from './VideoPreviewPlayer';
import { enhancePromptApi } from '../../services/api';
import { Wand2, Sparkles, Flame, Mountain, Eye, Terminal } from 'lucide-react';

interface VideoFlowStudioProps {
  currentProject: VideoProject;
  setCurrentProject: React.Dispatch<React.SetStateAction<VideoProject>>;
  onSaveProject: (project: VideoProject) => void;
}

const PROMPT_PRESETS = [
  {
    name: '⚡ Realistic Anime Fight',
    style: 'anime_combat' as const,
    model: 'seedance-2.5' as AIModelId,
    prompt: 'Two master samurai duel at twilight upon a crumbling stone bridge amid cherry blossoms. Fluid katana parries with blue lightning aura, spark bursts, and bullet-time slow motion.'
  },
  {
    name: '🏔️ 4K Drone Mountain Landscape',
    style: 'cinematic_landscape' as const,
    model: 'veo-2-flow' as AIModelId,
    prompt: 'Ultra-wide aerial drone glide through misty emerald fjord peaks at golden hour. Sun rays glistening across glacial alpine lakes with natural volumetric fog and water ripples.'
  },
  {
    name: '🇵🇭 Tagalog Action Scene',
    style: 'anime_combat' as const,
    model: 'kling-2.0' as AIModelId,
    prompt: 'Makatotohanang bakbakan ng mga mandirigma sa ilalim ng ulan na may kumikislap na espada at malalakas na shockwaves, dynamic camera tracking shot.'
  },
  {
    name: '🌃 Cyberpunk Kinetic Drift',
    style: 'cyberpunk' as const,
    model: 'minimax-video-01' as AIModelId,
    prompt: 'Hyper-detailed futuristic metropolis in heavy rain with neon reflections. High-speed cyber vehicle drifts through illuminated skyscrapers with anamorphic light flares.'
  }
];

export const VideoFlowStudio: React.FC<VideoFlowStudioProps> = ({
  currentProject,
  setCurrentProject,
  onSaveProject
}) => {
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);

  const handleEnhancePrompt = async () => {
    if (!currentProject.prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePromptApi(
        currentProject.prompt,
        currentProject.model,
        currentProject.presetStyle
      );
      setCurrentProject((prev) => ({
        ...prev,
        prompt: enhanced
      }));
    } finally {
      setIsEnhancing(false);
    }
  };

  const applyPreset = (preset: typeof PROMPT_PRESETS[0]) => {
    setCurrentProject((prev) => ({
      ...prev,
      title: preset.name.replace(/[^a-zA-Z0-9 ]/g, '').trim(),
      prompt: preset.prompt,
      model: preset.model,
      presetStyle: preset.style
    }));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner: Google Flow Inspired Studio Control */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Unlimited AI Video Generator Flow
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Google Flow UI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate unlimited 8-60 second videos with Seedance 2.5, Kling 2.0 & MiniMax. Upload up to 5 photos with action prompts, auto captions, and dubbing!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={currentProject.title}
            onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
            className="px-3 py-1.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
            placeholder="Project Title"
          />
        </div>
      </div>

      {/* Main Studio Grid: Left Controls (Clean Google Flow Cards) & Right Viewport Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Model, Prompt, Photos, Motion, Sound (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Model Selector */}
          <ModelSelector
            selectedModel={currentProject.model}
            onSelectModel={(id) => setCurrentProject({ ...currentProject, model: id })}
          />

          {/* 2. Prompt Card */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cinematic Video Prompt</span>
              </label>

              <button
                type="button"
                disabled={isEnhancing}
                onClick={handleEnhancePrompt}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isEnhancing ? 'Expanding Prompt...' : 'Enhance with AI'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={currentProject.prompt}
              onChange={(e) => setCurrentProject({ ...currentProject, prompt: e.target.value })}
              placeholder="Describe your scene: e.g. Realistic anime katana fight under torrential rain with violet lightning aura and bullet-time deflections..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/60 border border-white/10 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-inner"
            />

            {/* Quick Inspiration Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-400">
              <span className="text-[11px] text-slate-500 shrink-0 font-medium">Inspiration:</span>
              {PROMPT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-[11px] font-medium border border-white/5 whitespace-nowrap cursor-pointer transition-all"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Photo Animator (Up to 5 uploaded photos with individual action prompts) */}
          <PhotoAnimator
            photos={currentProject.photos}
            onPhotosChange={(photos) => setCurrentProject({ ...currentProject, photos })}
          />

          {/* 4. Motion & Duration Controls (8s to 60s) */}
          <MotionControls
            duration={currentProject.duration}
            onDurationChange={(duration) => setCurrentProject({ ...currentProject, duration })}
            cameraMotion={currentProject.cameraMotion}
            onCameraMotionChange={(cameraMotion) => setCurrentProject({ ...currentProject, cameraMotion })}
            motionIntensity={currentProject.motionIntensity}
            onMotionIntensityChange={(motionIntensity) => setCurrentProject({ ...currentProject, motionIntensity })}
            fps={currentProject.fps}
            onFpsChange={(fps) => setCurrentProject({ ...currentProject, fps })}
            aspectRatio={currentProject.aspectRatio}
            onAspectRatioChange={(aspectRatio) => setCurrentProject({ ...currentProject, aspectRatio })}
          />

          {/* 5. Sound, Dubbing & Auto-Captions (Tagalog & all languages) */}
          <SoundAndDubbing
            autoCaption={currentProject.autoCaption}
            onAutoCaptionChange={(autoCaption) => setCurrentProject({ ...currentProject, autoCaption })}
            captionLanguage={currentProject.captionLanguage}
            onCaptionLanguageChange={(captionLanguage) => setCurrentProject({ ...currentProject, captionLanguage })}
            subtitleStyle={currentProject.subtitleStyle}
            onSubtitleStyleChange={(subtitleStyle) => setCurrentProject({ ...currentProject, subtitleStyle })}
            burnSubtitles={currentProject.burnSubtitles}
            onBurnSubtitlesChange={(burnSubtitles) => setCurrentProject({ ...currentProject, burnSubtitles })}
            captions={currentProject.captions}
            onCaptionsChange={(captions) => setCurrentProject({ ...currentProject, captions })}
            dubbing={currentProject.dubbing}
            onDubbingChange={(dubbing) => setCurrentProject({ ...currentProject, dubbing })}
            bgmAudioUrl={currentProject.bgmAudioUrl}
            bgmAudioName={currentProject.bgmAudioName}
            onBgmAudioChange={(url, name) => setCurrentProject({ ...currentProject, bgmAudioUrl: url, bgmAudioName: name })}
            bgmVolume={currentProject.bgmVolume}
            onBgmVolumeChange={(vol) => setCurrentProject({ ...currentProject, bgmVolume: vol })}
            sfxTracks={currentProject.sfxTracks}
            onSfxTracksChange={(sfxTracks) => setCurrentProject({ ...currentProject, sfxTracks })}
            videoPrompt={currentProject.prompt}
            duration={currentProject.duration}
          />
        </div>

        {/* Right Column: Video Preview Player & Real-time Scrubber (5 Cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <VideoPreviewPlayer
            project={currentProject}
            onUpdateProject={(updated) => setCurrentProject(updated)}
            onSaveToVault={() => onSaveProject(currentProject)}
            onAspectRatioChange={(ratio) => setCurrentProject({ ...currentProject, aspectRatio: ratio })}
          />
        </div>
      </div>
    </div>
  );
};
