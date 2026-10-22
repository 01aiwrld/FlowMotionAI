import React, { useState } from 'react';
import { VideoProject, GeneratedImage, SunoMusicTrack } from '../../types';
import { FolderKanban, Film, Image as ImageIcon, Music, Download, Trash2, ExternalLink, FileText, Share2, Sparkles, Play } from 'lucide-react';

interface ProjectVaultProps {
  projects: VideoProject[];
  images: GeneratedImage[];
  musicTracks?: SunoMusicTrack[];
  onOpenProject: (project: VideoProject) => void;
  onDeleteProject: (id: string) => void;
  onDeleteImage: (id: string) => void;
  onDeleteTrack?: (id: string) => void;
}

export const ProjectVault: React.FC<ProjectVaultProps> = ({
  projects,
  images,
  musicTracks = [],
  onOpenProject,
  onDeleteProject,
  onDeleteImage,
  onDeleteTrack
}) => {
  const [filter, setFilter] = useState<'all' | 'videos' | 'images' | 'music'>('all');

  const handleDownloadVideo = (p: VideoProject) => {
    if (!p.outputVideoUrl) return;
    const a = document.createElement('a');
    a.href = p.outputVideoUrl;
    a.download = `${p.title.toLowerCase().replace(/\s+/g, '_')}_${p.duration}s.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSRT = (p: VideoProject) => {
    if (p.captions.length === 0) return;
    const formatSRTTime = (seconds: number) => {
      const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
      const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
      const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
      const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
      return `${hrs}:${mins}:${secs},${ms}`;
    };

    const srtContent = p.captions
      .map((cap, i) => `${i + 1}\n${formatSRTTime(cap.start)} --> ${formatSRTTime(cap.end)}\n${cap.text}\n`)
      .join('\n');

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.title.toLowerCase().replace(/\s+/g, '_')}_subtitles.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadImage = (img: GeneratedImage) => {
    const a = document.createElement('a');
    a.href = img.imageUrl;
    a.download = `flowmotion_${img.style}_${img.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadMusic = (m: SunoMusicTrack) => {
    const a = document.createElement('a');
    a.href = m.audioUrl;
    a.download = `${m.title.toLowerCase().replace(/\s+/g, '_')}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportJSON = (p: VideoProject) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(p, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${p.title.toLowerCase().replace(/\s+/g, '_')}_project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalItems = projects.length + images.length + musicTracks.length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border border-amber-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Project Vault & Export Hub
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Offline Stored
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access, preview, and download all final outputs: Videos (.WebM/MP4), Suno Music Tracks (.WAV), 4K Images (.JPG), and Subtitles (.SRT).
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-white/10 text-xs overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium shrink-0 ${
              filter === 'all' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalItems})
          </button>
          <button
            onClick={() => setFilter('videos')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium shrink-0 ${
              filter === 'videos' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Videos ({projects.length})
          </button>
          <button
            onClick={() => setFilter('images')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium shrink-0 ${
              filter === 'images' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Images ({images.length})
          </button>
          <button
            onClick={() => setFilter('music')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium shrink-0 ${
              filter === 'music' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Suno Music ({musicTracks.length})
          </button>
        </div>
      </div>

      {/* Download Entire Application Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/60 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Download Entire FlowMotion AI Application</h4>
            <p className="text-xs text-slate-400">
              Download the complete codebase package including backend API server, video engines, and Suno audio synthesizers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/flowmotion-app.zip"
            download="flowmotion-app.zip"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-pink-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download App (.zip)</span>
          </a>

          <a
            href="/flowmotion-ai-studio.tar.gz"
            download="flowmotion-ai-studio.tar.gz"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Archive (.tar.gz)</span>
          </a>
        </div>
      </div>

      {/* Content */}
      {totalItems === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border-2 border-dashed border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-200 text-base">Your Vault is Empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create videos in Video Flow, generate music in Suno Studio, or generate photos in Image Studio to view and download them here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Video Projects */}
          {(filter === 'all' || filter === 'videos') &&
            projects.map((proj) => (
              <div
                key={proj.id}
                className="rounded-2xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Thumbnail / Video Preview */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden border-b border-white/5">
                    {proj.thumbnailUrl || proj.outputVideoUrl ? (
                      <img
                        src={proj.thumbnailUrl || proj.photos[0]?.imageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                        <Film className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-mono">Video Ready to Render</span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="bg-black/80 backdrop-blur-md text-indigo-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        {proj.model}
                      </span>
                      <span className="bg-black/80 backdrop-blur-md text-white font-mono text-[10px] px-2 py-0.5 rounded">
                        {proj.duration}s · {proj.aspectRatio}
                      </span>
                    </div>

                    {proj.autoCaption && (
                      <span className="absolute top-2 right-2 bg-emerald-500/80 backdrop-blur-md text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                        CC ({proj.captionLanguage})
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-white truncate">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {proj.prompt}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>{proj.fps} FPS</span>
                      <span>·</span>
                      <span>{proj.cameraMotion.replace('_', ' ')}</span>
                      <span>·</span>
                      <span>{proj.photos.length} photos</span>
                    </div>
                  </div>
                </div>

                {/* Card Export & Action Bar */}
                <div className="p-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenProject(proj)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Studio</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {proj.outputVideoUrl && (
                      <button
                        onClick={() => handleDownloadVideo(proj)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs cursor-pointer transition-all"
                        title="Download Final Output Video"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    )}

                    {proj.captions.length > 0 && (
                      <button
                        onClick={() => handleDownloadSRT(proj)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 cursor-pointer"
                        title="Export Subtitles (.SRT)"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleExportJSON(proj)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 cursor-pointer"
                      title="Export Project JSON"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-900/30 text-rose-400 cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {/* Generated Images */}
          {(filter === 'all' || filter === 'images') &&
            images.map((img) => (
              <div
                key={img.id}
                className="rounded-2xl bg-slate-900/60 border border-white/10 hover:border-pink-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="relative aspect-video bg-slate-950 overflow-hidden border-b border-white/5">
                    <img
                      src={img.imageUrl}
                      alt={img.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-black/80 backdrop-blur-md text-pink-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        IMAGE · {img.aspectRatio}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">
                      {img.style}
                    </span>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {img.prompt}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDownloadImage(img)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Image</span>
                  </button>

                  <button
                    onClick={() => onDeleteImage(img.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-900/30 text-rose-400 cursor-pointer"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

          {/* Suno Music Tracks */}
          {(filter === 'all' || filter === 'music') &&
            musicTracks.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-slate-900/60 border border-white/10 hover:border-violet-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-lg"
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-violet-400" />
                      <span className="font-bold text-sm text-slate-100 truncate">{m.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded">
                      {m.bpm} BPM · {m.duration}s
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {m.prompt}
                  </p>

                  <span className="inline-block text-[10px] font-mono uppercase text-slate-500">
                    Genre: {m.genre.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDownloadMusic(m)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Track (.WAV)</span>
                  </button>

                  {onDeleteTrack && (
                    <button
                      onClick={() => onDeleteTrack(m.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-900/30 text-rose-400 cursor-pointer"
                      title="Delete Track"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
