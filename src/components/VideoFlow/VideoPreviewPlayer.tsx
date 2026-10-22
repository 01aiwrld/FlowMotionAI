import React, { useEffect, useRef, useState } from 'react';
import { VideoProject, AspectRatioType } from '../../types';
import { VideoRenderer, RenderProgress } from '../../services/videoEngine';
import { Play, Pause, RotateCcw, Download, Share2, Maximize2, Sparkles, FileText, Check, Film, Eye, MonitorPlay, X } from 'lucide-react';

interface VideoPreviewPlayerProps {
  project: VideoProject;
  onUpdateProject: (project: VideoProject) => void;
  onSaveToVault: () => void;
  onAspectRatioChange?: (ratio: AspectRatioType) => void;
}

export const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({
  project,
  onUpdateProject,
  onSaveToVault,
  onAspectRatioChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<VideoRenderer | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isRenderingExport, setIsRenderingExport] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(project.outputVideoUrl || null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showDirectorModal, setShowDirectorModal] = useState<boolean>(false);

  const animFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Initialize canvas renderer
  useEffect(() => {
    let width = 1280;
    let height = 720;
    if (project.aspectRatio === '9:16') {
      width = 720;
      height = 1280;
    } else if (project.aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
    } else if (project.aspectRatio === '4:3') {
      width = 1080;
      height = 810;
    } else if (project.aspectRatio === '21:9') {
      width = 1680;
      height = 720;
    }

    const renderer = new VideoRenderer(width, height);
    rendererRef.current = renderer;
    const canvas = renderer.getCanvas();
    canvasRef.current = canvas;

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      canvas.className = 'w-full h-full object-contain rounded-xl select-none';
      containerRef.current.appendChild(canvas);
    }

    renderer.preloadProjectImages(project).then(() => {
      renderer.drawFrame(project, currentTime);
    });

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [project.aspectRatio, project.photos]);

  // Redraw when project changes or time changes
  useEffect(() => {
    if (rendererRef.current && !isPlaying) {
      rendererRef.current.drawFrame(project, currentTime);
    }
  }, [project, currentTime, isPlaying]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= project.duration) {
          setIsPlaying(false);
          return 0;
        }
        if (rendererRef.current) {
          rendererRef.current.drawFrame(project, next);
        }
        return next;
      });

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying, project]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (rendererRef.current) {
      rendererRef.current.drawFrame(project, newTime);
    }
  };

  const handleGenerateAndExportVideo = async () => {
    if (!rendererRef.current) return;
    setIsPlaying(false);
    setIsRenderingExport(true);

    try {
      const { url, thumbnailUrl } = await rendererRef.current.exportVideo(project, (progress) => {
        setRenderProgress(progress);
      });

      setDownloadUrl(url);
      onUpdateProject({
        ...project,
        outputVideoUrl: url,
        thumbnailUrl
      });
      onSaveToVault();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Video generation error:', err);
    } finally {
      setIsRenderingExport(false);
      setRenderProgress(null);
    }
  };

  const handleDownloadVideoFile = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_${project.duration}s.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSRT = () => {
    if (project.captions.length === 0) return;
    const formatSRTTime = (seconds: number) => {
      const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
      const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
      const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
      const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
      return `${hrs}:${mins}:${secs},${ms}`;
    };

    const srtContent = project.captions
      .map((cap, i) => `${i + 1}\n${formatSRTTime(cap.start)} --> ${formatSRTTime(cap.end)}\n${cap.text}\n`)
      .join('\n');

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_subtitles.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadVTT = () => {
    if (project.captions.length === 0) return;
    const formatVTTTime = (seconds: number) => {
      const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
      const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
      const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
      return `${mins}:${secs}.${ms}`;
    };

    const vttContent = `WEBVTT\n\n` + project.captions
      .map((cap, i) => `${i + 1}\n${formatVTTTime(cap.start)} --> ${formatVTTTime(cap.end)}\n${cap.text}\n`)
      .join('\n');

    const blob = new Blob([vttContent], { type: 'text/vtt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_subtitles.vtt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportProjectJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_flow_project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Aspect Ratio Quick Bar for Video Generation */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-indigo-400" />
          <span>Preferred Video Aspect Ratio:</span>
        </span>
        <div className="flex items-center gap-1">
          {(['16:9', '9:16', '1:1', '4:3', '21:9'] as const).map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => onAspectRatioChange && onAspectRatioChange(ratio)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                project.aspectRatio === ratio
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative aspect-video max-h-[500px] w-full rounded-2xl bg-slate-950 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center group">
        <div ref={containerRef} className="w-full h-full flex items-center justify-center" />

        {/* Floating Quick Action Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <span className="bg-black/75 backdrop-blur-md text-white font-mono text-[11px] px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {project.model.toUpperCase()}
          </span>
          <span className="bg-black/75 backdrop-blur-md text-slate-300 font-mono text-[11px] px-2 py-1 rounded-lg border border-white/10">
            {project.fps} FPS · {project.aspectRatio}
          </span>
        </div>

        {/* Top-Right: Instant Preview Modal trigger & Fullscreen */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={() => setShowDirectorModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/75 hover:bg-indigo-600 text-white backdrop-blur-md border border-white/10 text-xs font-semibold cursor-pointer transition-all shadow-lg"
            title="Instant Live Director Preview without waiting for render"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Live Preview (0s Wait)</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Render Progress Overlay */}
        {isRenderingExport && renderProgress && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-indigo-500 transition-all duration-300"
                  fill="transparent"
                  strokeDasharray={213}
                  strokeDashoffset={213 - (213 * renderProgress.percent) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono text-white">
                {renderProgress.percent}%
              </span>
            </div>

            <div>
              <h4 className="font-bold text-base text-white">Synthesizing Highest Quality Video...</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">{renderProgress.statusText}</p>
              <p className="text-[11px] text-indigo-400 mt-1">
                Baking Seedance 2.5 motion, auto-captions, and Suno audio mix
              </p>
            </div>

            <button
              onClick={() => rendererRef.current?.cancelRender()}
              className="px-3 py-1 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 text-xs font-semibold cursor-pointer border border-rose-500/30"
            >
              Cancel Render
            </button>
          </div>
        )}
      </div>

      {/* Scrubber & Player Controls */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2.5">
        {/* Timeline Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-indigo-400 font-bold shrink-0">
            {String(Math.floor(currentTime / 60)).padStart(2, '0')}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
          </span>

          <input
            type="range"
            min="0"
            max={project.duration}
            step="0.05"
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />

          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            {String(Math.floor(project.duration / 60)).padStart(2, '0')}:{String(Math.floor(project.duration % 60)).padStart(2, '0')}
          </span>
        </div>

        {/* Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Left: Playback controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/30 cursor-pointer transition-all"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => handleSeek(0)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              title="Reset to beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowDirectorModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-medium cursor-pointer transition-all"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>Preview First (0s)</span>
            </button>
          </div>

          {/* Right: Generate Full Video & Direct Download button */}
          <div className="flex items-center gap-2">
            {/* Generate & Bake Video Button */}
            <button
              type="button"
              disabled={isRenderingExport}
              onClick={handleGenerateAndExportVideo}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isRenderingExport ? 'Generating Video...' : 'Generate Full Video'}</span>
            </button>

            {/* Direct Prominent Download Final Output Button */}
            {downloadUrl && (
              <button
                type="button"
                onClick={handleDownloadVideoFile}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-xl shadow-indigo-500/30 cursor-pointer transition-all animate-bounce"
                title="Download Final Output Video (.webm/.mp4)"
              >
                <Download className="w-4 h-4" />
                <span>Download Final Video</span>
              </button>
            )}

            {/* Export Menu Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 cursor-pointer transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-300" />
                <span>Export...</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-56 rounded-xl bg-slate-900 border border-white/10 shadow-2xl p-2 z-50 space-y-1">
                  {downloadUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDownloadVideoFile();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Film className="w-4 h-4 text-indigo-400" />
                      <span>Download Final Video (.WebM/MP4)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      handleDownloadSRT();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Export Subtitles (.SRT)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleDownloadVTT();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Export WebVTT (.VTT)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleExportProjectJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>Export Project Data (.JSON)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center justify-center gap-2 py-1 text-xs text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Final video generated! Ready to download.</span>
          </div>
        )}
      </div>

      {/* Instant Director Preview Modal (0s Wait) */}
      {showDirectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MonitorPlay className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Live Director Preview (Instant 0s Check)</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  Real-time Scrubbing
                </span>
              </div>
              <button
                onClick={() => setShowDirectorModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Preview composition, camera motion, burned subtitles, and photo transitions instantaneously at 60fps before generating the full video file to save time!
            </p>

            <div className="relative aspect-video max-h-[500px] w-full rounded-2xl bg-black overflow-hidden border border-white/10 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                {canvasRef.current && (
                  <canvas
                    width={canvasRef.current.width}
                    height={canvasRef.current.height}
                    ref={(node) => {
                      if (node && rendererRef.current) {
                        rendererRef.current.drawFrame(project, currentTime);
                        const c = node.getContext('2d');
                        if (c) c.drawImage(canvasRef.current!, 0, 0);
                      }
                    }}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Play Live Preview'}</span>
                </button>
                <span className="font-mono text-xs text-indigo-400">
                  {currentTime.toFixed(1)}s / {project.duration}s
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowDirectorModal(false);
                    handleGenerateAndExportVideo();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Looks Great, Generate Full Video!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
