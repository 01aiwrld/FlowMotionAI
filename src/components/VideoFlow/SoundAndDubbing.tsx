import React, { useRef, useState } from 'react';
import { CaptionLine, DubbingConfig, SoundEffectTrack, SubtitleStyle } from '../../types';
import { speakDialogue, stopAllSpeech } from '../../services/audioEngine';
import { generateAutoCaptions } from '../../services/api';
import { Volume2, Mic, Subtitles, Music, Upload, Play, Square, Sparkles, Languages, Check } from 'lucide-react';

interface SoundAndDubbingProps {
  autoCaption: boolean;
  onAutoCaptionChange: (enabled: boolean) => void;
  captionLanguage: string;
  onCaptionLanguageChange: (lang: string) => void;
  subtitleStyle: SubtitleStyle;
  onSubtitleStyleChange: (style: SubtitleStyle) => void;
  burnSubtitles: boolean;
  onBurnSubtitlesChange: (burn: boolean) => void;
  captions: CaptionLine[];
  onCaptionsChange: (captions: CaptionLine[]) => void;
  
  dubbing: DubbingConfig;
  onDubbingChange: (dubbing: DubbingConfig) => void;
  
  bgmAudioUrl?: string;
  bgmAudioName?: string;
  onBgmAudioChange: (url?: string, name?: string) => void;
  bgmVolume: number;
  onBgmVolumeChange: (vol: number) => void;
  
  sfxTracks: SoundEffectTrack[];
  onSfxTracksChange: (tracks: SoundEffectTrack[]) => void;
  
  videoPrompt: string;
  duration: number;
}

const SUPPORTED_LANGUAGES = [
  'Tagalog',
  'English',
  'Japanese',
  'Spanish',
  'Korean',
  'Mandarin',
  'French',
  'German',
  'Hindi',
  'Indonesian'
];

export const SoundAndDubbing: React.FC<SoundAndDubbingProps> = ({
  autoCaption,
  onAutoCaptionChange,
  captionLanguage,
  onCaptionLanguageChange,
  subtitleStyle,
  onSubtitleStyleChange,
  burnSubtitles,
  onBurnSubtitlesChange,
  captions,
  onCaptionsChange,
  dubbing,
  onDubbingChange,
  bgmAudioUrl,
  bgmAudioName,
  onBgmAudioChange,
  bgmVolume,
  onBgmVolumeChange,
  sfxTracks,
  onSfxTracksChange,
  videoPrompt,
  duration
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    onBgmAudioChange(url, file.name);
  };

  const handleTestDubbing = () => {
    if (isSpeaking) {
      stopAllSpeech();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = dubbing.dialogueScript || (captions.length > 0 ? captions[0].text : 'Simulan ang paglikha.');
    setIsSpeaking(true);
    speakDialogue({
      text: textToSpeak,
      language: dubbing.language,
      pitch: dubbing.pitch,
      rate: dubbing.speed,
      volume: dubbing.volume,
      onEnd: () => setIsSpeaking(false)
    });
  };

  const handleGenerateCaptionsClick = async () => {
    setIsGeneratingCaptions(true);
    try {
      const generated = await generateAutoCaptions(videoPrompt || 'Cinematic epic scene', captionLanguage, duration);
      onCaptionsChange(generated);
      // Also update dubbing script if blank
      if (!dubbing.dialogueScript && generated.length > 0) {
        onDubbingChange({
          ...dubbing,
          dialogueScript: generated.map((c) => c.text).join(' ')
        });
      }
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  const toggleSfxTrack = (id: string) => {
    onSfxTracksChange(
      sfxTracks.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : { ...t, enabled: false }))
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
      {/* Left: Auto-Captions & Auto-Dubbing */}
      <div className="space-y-4">
        {/* Auto Captioning Box */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Subtitles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Auto Captioning
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoCaption}
                onChange={(e) => onAutoCaptionChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {autoCaption && (
            <div className="space-y-2.5 p-3 rounded-xl bg-slate-950/40 border border-white/5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Languages className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Language:</span>
                </div>
                <select
                  value={captionLanguage}
                  onChange={(e) => onCaptionLanguageChange(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang} {lang === 'Tagalog' ? '🇵🇭 (Tagalog)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subtitle Visual Style */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 text-[11px]">Subtitle Style:</span>
                <select
                  value={subtitleStyle}
                  onChange={(e) => onSubtitleStyleChange(e.target.value as SubtitleStyle)}
                  className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="anime_bold">⚡ Anime Action Bold</option>
                  <option value="cinematic_bar">🎬 Cinematic Letterbox Bar</option>
                  <option value="karaoke_glow">✨ Karaoke Pulse Glow</option>
                  <option value="minimal_clean">⚪ Minimalist Clean</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={burnSubtitles}
                    onChange={(e) => onBurnSubtitlesChange(e.target.checked)}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Burn subtitles directly into video</span>
                </label>

                <button
                  type="button"
                  disabled={isGeneratingCaptions}
                  onClick={handleGenerateCaptionsClick}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-medium cursor-pointer transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isGeneratingCaptions ? 'Syncing...' : 'Generate Subtitles'}</span>
                </button>
              </div>

              {/* Captions Preview List */}
              {captions.length > 0 && (
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1 pt-1 border-t border-white/5 text-[11px]">
                  {captions.map((cap, i) => (
                    <div key={cap.id || i} className="flex items-center justify-between gap-2 text-slate-400">
                      <span className="font-mono text-[10px] text-indigo-400">{cap.start}s - {cap.end}s</span>
                      <span className="truncate text-slate-200 flex-1">{cap.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Auto Dubbing Box */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Auto Dubbing & Voice Dialogue
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dubbing.enabled}
                onChange={(e) => onDubbingChange({ ...dubbing, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          {dubbing.enabled && (
            <div className="space-y-2.5 p-3 rounded-xl bg-slate-950/40 border border-white/5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">Dubbing Persona:</span>
                <select
                  value={dubbing.voicePersona}
                  onChange={(e) =>
                    onDubbingChange({ ...dubbing, voicePersona: e.target.value as any })
                  }
                  className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="anime_hero">⚔️ Anime Combat Protagonist</option>
                  <option value="action_tagalog">🇵🇭 Tagalog Cinematic Hero</option>
                  <option value="calm_narrator">🎙️ Calm Documentary Narrator</option>
                  <option value="epic_storyteller">📜 Epic Legend Storyteller</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Dialogue Script (Tagalog / English / Multi-language):
                </label>
                <textarea
                  rows={2}
                  value={dubbing.dialogueScript}
                  onChange={(e) => onDubbingChange({ ...dubbing, dialogueScript: e.target.value })}
                  placeholder="e.g. Hindi pa tapos ang laban! Narito ang kapangyarihan ng ating pangarap!"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-white/10 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestDubbing}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-pink-600/30 hover:bg-pink-600/40 border border-pink-500/30 text-pink-300 text-xs font-medium cursor-pointer transition-all"
                >
                  {isSpeaking ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isSpeaking ? 'Stop Voice' : 'Preview Voice Dubbing'}</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Speed:</span>
                  <input
                    type="range"
                    min="0.7"
                    max="1.3"
                    step="0.05"
                    value={dubbing.speed}
                    onChange={(e) => onDubbingChange({ ...dubbing, speed: parseFloat(e.target.value) })}
                    className="w-16 accent-pink-500 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                  <span className="font-mono text-[10px] text-pink-400">{dubbing.speed}x</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Atmospheric Sound Effects & Upload Music/SFX */}
      <div className="space-y-4">
        {/* Atmospheric Soundscapes */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Atmospheric Sound Effects (Google Flow)
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Web Audio FX</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {sfxTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => toggleSfxTrack(track.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  track.enabled
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/40 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[11px] text-slate-200">{track.name}</span>
                  {track.enabled && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 capitalize">{track.category.replace('_', ' ')}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Custom Music / Sound Effects */}
        <div className="space-y-2.5 p-3 rounded-xl bg-slate-950/40 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Upload Music or Sound Effects
              </span>
            </div>
            {bgmAudioName && (
              <span className="text-[10px] text-cyan-400 font-mono truncate max-w-[140px]">
                {bgmAudioName}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Upload custom MP3/WAV background music or dialogue audio to bake into the final video.
          </p>

          <input
            type="file"
            ref={audioInputRef}
            onChange={handleAudioUpload}
            accept="audio/*"
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{bgmAudioName ? 'Replace Audio File' : 'Choose Audio File (.mp3/.wav)'}</span>
            </button>

            {bgmAudioName && (
              <button
                type="button"
                onClick={() => onBgmAudioChange(undefined, undefined)}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>

          {bgmAudioUrl && (
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
              <span>BGM Volume:</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={bgmVolume}
                onChange={(e) => onBgmVolumeChange(parseFloat(e.target.value))}
                className="w-24 accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
              <span className="font-mono text-cyan-400 text-[10px]">
                {Math.round(bgmVolume * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
