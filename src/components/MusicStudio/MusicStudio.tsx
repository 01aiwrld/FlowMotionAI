import React, { useState, useRef } from 'react';
import { SunoMusicTrack } from '../../types';
import { synthesizeSunoTrack } from '../../services/musicEngine';
import { Music, Play, Pause, Download, Sparkles, Film, Disc3, Mic2, Wand2, Sliders, Volume2, Check } from 'lucide-react';

interface MusicStudioProps {
  tracks: SunoMusicTrack[];
  onAddTrack: (track: SunoMusicTrack) => void;
  onAttachToVideo: (track: SunoMusicTrack) => void;
}

const GENRES: { id: SunoMusicTrack['genre']; label: string; desc: string; defaultBpm: number }[] = [
  { id: 'anime_battle_ost', label: '⚡ Anime Battle OST', desc: 'Epic minor chords, aggressive 808s, soaring lead', defaultBpm: 145 },
  { id: 'cinematic_orchestral', label: '🎻 Cinematic Orchestral', desc: 'Dramatic brass, deep cellos & rolling timpani', defaultBpm: 110 },
  { id: 'cyberpunk_synth', label: '🌃 Cyberpunk Synthwave', desc: 'Neon arpeggios, heavy saw bass, sidechain pump', defaultBpm: 128 },
  { id: 'tagalog_opm', label: '🇵🇭 Tagalog OPM Acoustic', desc: 'Soulful acoustic guitar & emotional piano ballad', defaultBpm: 100 },
  { id: 'phonk_drift', label: '🏎️ Phonk Drift', desc: 'Memphis 808 glide, punchy drums, cowbell lead', defaultBpm: 150 },
  { id: 'lofi_chill', label: '☕ Lo-Fi Chillhop', desc: 'Warm jazzy Rhodes, vinyl flutter, soft rimshot', defaultBpm: 80 },
  { id: 'ambient_zen', label: '🧘 Ambient Zen', desc: 'Meditative river stream, resonant bamboo flute', defaultBpm: 60 }
];

export const MusicStudio: React.FC<MusicStudioProps> = ({
  tracks,
  onAddTrack,
  onAttachToVideo
}) => {
  const [prompt, setPrompt] = useState<string>(
    'Epic anime final battle theme with rising violin and heavy synth bass drop'
  );
  const [title, setTitle] = useState<string>('Ignite the Soul');
  const [selectedGenre, setSelectedGenre] = useState<SunoMusicTrack['genre']>('anime_battle_ost');
  const [bpm, setBpm] = useState<number>(145);
  const [duration, setDuration] = useState<number>(30);
  const [isInstrumental, setIsInstrumental] = useState<boolean>(true);
  const [lyrics, setLyrics] = useState<string>('');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isWritingLyrics, setIsWritingLyrics] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [attachedSuccess, setAttachedSuccess] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleGenreChange = (genreId: SunoMusicTrack['genre']) => {
    setSelectedGenre(genreId);
    const g = GENRES.find((item) => item.id === genreId);
    if (g) setBpm(g.defaultBpm);
  };

  const handleGenerateLyrics = async () => {
    setIsWritingLyrics(true);
    try {
      const res = await fetch('/api/generate-music-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, genre: selectedGenre, isInstrumental })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.title) setTitle(data.title);
        if (data.lyrics) setLyrics(data.lyrics);
        if (data.bpm) setBpm(data.bpm);
      }
    } catch (e) {
      console.warn('Lyrics generation error:', e);
    } finally {
      setIsWritingLyrics(false);
    }
  };

  const handleGenerateMusic = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setProgressPercent(10);
    setProgressStatus('Initializing Suno AI neural synth...');

    try {
      const newTrack = await synthesizeSunoTrack({
        title: title || prompt.substring(0, 24),
        prompt,
        lyrics,
        genre: selectedGenre,
        bpm,
        duration,
        isInstrumental,
        onProgress: (pct, status) => {
          setProgressPercent(pct);
          setProgressStatus(status);
        }
      });

      onAddTrack(newTrack);
      handlePlayTrack(newTrack);
    } catch (err) {
      console.error('Music synthesis error:', err);
    } finally {
      setIsGenerating(false);
      setProgressPercent(0);
      setProgressStatus('');
    }
  };

  const handlePlayTrack = (track: SunoMusicTrack) => {
    if (activePlayingId === track.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setActivePlayingId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = track.audioUrl;
      audioPlayerRef.current.play().catch(() => {});
      setActivePlayingId(track.id);
    }
  };

  const handleDownloadTrack = (track: SunoMusicTrack) => {
    const a = document.createElement('a');
    a.href = track.audioUrl;
    a.download = `${track.title.toLowerCase().replace(/\s+/g, '_')}_suno.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAttach = (track: SunoMusicTrack) => {
    onAttachToVideo(track);
    setAttachedSuccess(track.id);
    setTimeout(() => setAttachedSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Hidden audio element for playback */}
      <audio
        ref={audioPlayerRef}
        onEnded={() => setActivePlayingId(null)}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-violet-950/50 via-purple-950/40 to-slate-900 border border-violet-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Suno AI Music Generator Studio
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Text-to-Music & OST
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate unlimited custom songs, anime battle themes, and cinematic soundtracks. Export lossless .WAV or attach directly to Video Flow!
          </p>
        </div>

        <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
          Unlimited Audio Generation Active
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Generation Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          {/* Song Title & Prompt */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Track Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Battle of the Crimson Sky"
                className="w-full px-3 py-2 text-xs bg-slate-950/60 border border-white/10 rounded-xl text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Music Style / Description Prompt</span>
                </label>
                <button
                  type="button"
                  disabled={isWritingLyrics}
                  onClick={handleGenerateLyrics}
                  className="text-[11px] font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>{isWritingLyrics ? 'Composing...' : 'AI Arrange Song'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your sound: e.g. High octane anime fight theme with electric guitars, heavy bass drops, and rapid tempo..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/60 border border-white/10 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Genre Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Music Genre & Aesthetic
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GENRES.map((g) => {
                const isSelected = selectedGenre === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleGenreChange(g.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500 text-white shadow-sm ring-1 ring-violet-500/30'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-semibold text-xs text-slate-200 truncate">{g.label}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{g.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tempo & Duration */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tempo (BPM):</span>
                <span className="font-mono text-violet-400 font-bold">{bpm}</span>
              </div>
              <input
                type="range"
                min="60"
                max="180"
                step="5"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                className="w-full accent-violet-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Duration:</span>
                <span className="font-mono text-violet-400 font-bold">{duration}s</span>
              </div>
              <div className="flex items-center gap-1">
                {[15, 30, 60].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer text-center ${
                      duration === dur
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-950/60 border border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lyrics Box (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mic2 className="w-3.5 h-3.5 text-violet-400" />
                <span>Song Structure & Lyrics</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInstrumental}
                  onChange={(e) => setIsInstrumental(e.target.checked)}
                  className="accent-violet-500 rounded"
                />
                <span>Instrumental Only</span>
              </label>
            </div>
            {!isInstrumental && (
              <textarea
                rows={3}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="[Verse 1] Write lyrics or click AI Arrange Song..."
                className="w-full px-3 py-2 text-xs bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-violet-500 font-mono resize-none"
              />
            )}
          </div>

          {/* Generate Track Button */}
          <button
            type="button"
            disabled={isGenerating || !prompt.trim()}
            onClick={handleGenerateMusic}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Music className="w-4 h-4" />
            <span>{isGenerating ? `Synthesizing (${progressPercent}%)...` : 'Generate Suno AI Track'}</span>
          </button>

          {isGenerating && (
            <div className="space-y-1 text-center">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-violet-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] font-mono text-violet-400">{progressStatus}</p>
            </div>
          )}
        </div>

        {/* Right Music Player & Track Library (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Disc3 className="w-4 h-4 text-violet-400 animate-spin" />
              <span>Suno AI Generated Tracks ({tracks.length})</span>
            </h3>

            {tracks.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/40 border-2 border-dashed border-white/10">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-2">
                  <Music className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-slate-300">No tracks synthesized yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Type a prompt on the left to generate epic anime battle themes and cinematic soundtracks!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tracks.map((track) => {
                  const isPlaying = activePlayingId === track.id;
                  const isAttached = attachedSuccess === track.id;
                  return (
                    <div
                      key={track.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isPlaying
                          ? 'bg-violet-950/40 border-violet-500 ring-1 ring-violet-500/30'
                          : 'bg-slate-950/50 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handlePlayTrack(track)}
                            className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-md shadow-violet-500/25 shrink-0 cursor-pointer transition-all"
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-100">{track.title}</h4>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                {track.genre.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{track.prompt}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
                              <span>{track.bpm} BPM</span>
                              <span>·</span>
                              <span>{track.duration}s</span>
                              <span>·</span>
                              <span>{track.isInstrumental ? 'Instrumental' : 'With Lyrics'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={() => handleAttach(track)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                              isAttached
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-200 border border-white/10'
                            }`}
                            title="Attach this music track to current Video Flow project"
                          >
                            {isAttached ? <Check className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                            <span>{isAttached ? 'Attached to Video!' : 'Set as Video BGM'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadTrack(track)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-violet-300 border border-white/10 cursor-pointer transition-all"
                            title="Download Lossless .WAV"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Animated Waveform Visualizer Bar when playing */}
                      {isPlaying && (
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1 h-6">
                          {Array.from({ length: 32 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-gradient-to-t from-violet-500 to-pink-500 rounded-full animate-pulse"
                              style={{
                                height: `${Math.max(15, (Math.sin(i * 0.4 + Date.now() * 0.005) * 0.5 + 0.5) * 100)}%`,
                                animationDuration: `${0.3 + (i % 5) * 0.1}s`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
