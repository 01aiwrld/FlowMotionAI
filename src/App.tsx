import React, { useState, useEffect } from 'react';
import { VideoProject, GeneratedImage, AIModelId, PhotoKeyframe, SunoMusicTrack, CustomExtension, AspectRatioType } from './types';
import { Header } from './components/Header';
import { Download, FolderArchive, X, Sparkles } from 'lucide-react';
import { VideoFlowStudio } from './components/VideoFlow/VideoFlowStudio';
import { ImageStudio } from './components/ImageStudio/ImageStudio';
import { MusicStudio } from './components/MusicStudio/MusicStudio';
import { FlowCopilot } from './components/Copilot/FlowCopilot';
import { ProjectVault } from './components/ProjectVault/ProjectVault';
import { UpdateManagerModal } from './components/UpdateManagerModal';
import { InstallPhoneModal } from './components/InstallPhoneModal';
import {
  saveProject,
  getProjects,
  deleteProject,
  saveImage,
  getImages,
  deleteImage,
  saveMusicTrack,
  getMusicTracks,
  saveExtensions,
  getExtensions
} from './services/db';

const INITIAL_PROJECT: VideoProject = {
  id: `proj-${Date.now()}`,
  title: 'Anime Katana Clashes (Seedance 2.5)',
  createdAt: Date.now(),
  model: 'seedance-2.5',
  prompt: 'Two master samurai duel at twilight on a shattered stone bridge amid cherry blossoms. Fluid katana parries with blue lightning aura, spark bursts, and bullet-time slow motion deflections.',
  aspectRatio: '16:9',
  duration: 15,
  fps: 60,
  cameraMotion: 'orbit_360',
  motionIntensity: 3.5,
  presetStyle: 'anime_combat',
  photos: [],
  autoCaption: true,
  captionLanguage: 'Tagalog',
  subtitleStyle: 'anime_bold',
  captions: [
    { id: 'c1', start: 0.5, end: 4.5, text: 'Haharapin ko ang hamon ng kapalaran.' },
    { id: 'c2', start: 5.0, end: 9.5, text: 'Walang makapipigil sa apoy ng ating espada!' },
    { id: 'c3', start: 10.0, end: 14.5, text: 'Ito ang simula ng walang hanggang tagumpay.' }
  ],
  burnSubtitles: true,
  dubbing: {
    enabled: true,
    language: 'Tagalog',
    voicePersona: 'anime_hero',
    dialogueScript: 'Hindi pa tapos ang laban! Narito ang kapangyarihan ng ating pangarap!',
    volume: 1.0,
    speed: 1.0,
    pitch: 1.05
  },
  bgmVolume: 0.7,
  sfxTracks: [
    { id: 'sfx-combat', name: 'Katana Clash & Sonic Boom', category: 'anime_combat', enabled: true, volume: 0.8 },
    { id: 'sfx-drone', name: 'Cinematic Sub-Bass Drone', category: 'cinematic_drone', enabled: false, volume: 0.7 },
    { id: 'sfx-pulse', name: 'Cyberpunk Neon Pulse', category: 'cyber_pulse', enabled: false, volume: 0.6 },
    { id: 'sfx-nature', name: 'Ambient Breeze & Rain', category: 'ambient_nature', enabled: false, volume: 0.5 }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'music' | 'copilot' | 'vault'>('video');
  const [currentProject, setCurrentProject] = useState<VideoProject>(INITIAL_PROJECT);
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [musicTracks, setMusicTracks] = useState<SunoMusicTrack[]>([]);
  const [extensions, setExtensions] = useState<CustomExtension[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [showDownloadBanner, setShowDownloadBanner] = useState<boolean>(true);

  // Load projects, images, music, and extensions from IndexedDB
  useEffect(() => {
    getProjects().then((loadedProjects) => {
      if (loadedProjects && loadedProjects.length > 0) {
        setProjects(loadedProjects);
      }
    });

    getImages().then((loadedImages) => {
      if (loadedImages && loadedImages.length > 0) {
        setImages(loadedImages);
      }
    });

    getMusicTracks().then((loadedMusic) => {
      if (loadedMusic && loadedMusic.length > 0) {
        setMusicTracks(loadedMusic);
      }
    });

    getExtensions().then((loadedExts) => {
      if (loadedExts && loadedExts.length > 0) {
        setExtensions(loadedExts);
      } else {
        // Default starter extension template
        const defaultExt: CustomExtension = {
          id: 'ext-lora-anime',
          name: 'Hyper-Action Katana Particle Hook',
          version: '1.2.0',
          description: 'Custom anime speedlines and aura intensity booster for Seedance 2.5',
          enabled: true,
          customSystemPrompt: 'Render dynamic electric lightning bolts along the katana blade with 120fps bullet-time shutter.'
        };
        setExtensions([defaultExt]);
        saveExtensions([defaultExt]);
      }
    });

    // Register Service Worker for Offline PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration info:', err);
      });
    }
  }, []);

  const handleSaveProject = async (projectToSave: VideoProject) => {
    await saveProject(projectToSave);
    const updated = await getProjects();
    setProjects(updated);
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    const updated = await getProjects();
    setProjects(updated);
  };

  const handleAddImage = async (img: GeneratedImage) => {
    await saveImage(img);
    const updated = await getImages();
    setImages(updated);
  };

  const handleDeleteImage = async (id: string) => {
    await deleteImage(id);
    const updated = await getImages();
    setImages(updated);
  };

  const handleAddMusicTrack = async (track: SunoMusicTrack) => {
    await saveMusicTrack(track);
    const updated = await getMusicTracks();
    setMusicTracks(updated);
  };

  const handleSaveExtensions = async (exts: CustomExtension[]) => {
    await saveExtensions(exts);
    setExtensions(exts);
  };

  // Attach Suno Music to Video Project
  const handleAttachMusicToVideo = (track: SunoMusicTrack) => {
    setCurrentProject((prev) => ({
      ...prev,
      bgmAudioUrl: track.audioUrl,
      bgmAudioName: `${track.title} (${track.genre})`
    }));
    setActiveTab('video');
  };

  // Bridge from Image Studio to Video Flow
  const handleSendImageToVideoFlow = (img: GeneratedImage) => {
    if (currentProject.photos.length >= 5) {
      alert('Maximum 5 uploaded photos allowed per project. Remove one to add this image.');
      setActiveTab('video');
      return;
    }

    const newKeyframe: PhotoKeyframe = {
      id: `photo-${Date.now()}`,
      imageUrl: img.imageUrl,
      fileName: `Image_${img.style}`,
      prompt: `Animate: ${img.prompt.slice(0, 100)} with fluid camera tracking`,
      motionStrength: 2.5,
      transition: 'morph'
    };

    setCurrentProject((prev) => ({
      ...prev,
      photos: [...prev.photos, newKeyframe]
    }));
    setActiveTab('video');
  };

  // Bridge from Copilot to Video Flow
  const handleUsePromptInVideo = (promptText: string) => {
    let clean = promptText;
    const match = promptText.match(/\*\*Scene:\*\*\s*([^\n]+)/);
    if (match && match[1]) {
      clean = match[1];
    }

    setCurrentProject((prev) => ({
      ...prev,
      prompt: clean
    }));
    setActiveTab('video');
  };

  const handleOpenProjectInStudio = (proj: VideoProject) => {
    setCurrentProject(proj);
    setActiveTab('video');
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header with Suno Music tab and Update Manager trigger */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectCount={projects.length}
        onOpenUpdates={() => setShowUpdateModal(true)}
        onOpenPhoneModal={() => setShowPhoneModal(true)}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-3 space-y-4">
        {/* Prominent Download App Banner */}
        {showDownloadBanner && (
          <div className="relative p-4 rounded-2xl bg-gradient-to-r from-pink-950/60 via-purple-950/50 to-indigo-950/60 border border-pink-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/25">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Download FlowMotion AI Studio (Full Source Code)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Ready to Run
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Download the complete standalone project code to run on your local machine or deploy anywhere!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <a
                href="/flowmotion-app.zip"
                download="flowmotion-app.zip"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-500/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download ZIP (.zip)</span>
              </a>

              <a
                href="/flowmotion-ai-studio.tar.gz"
                download="flowmotion-ai-studio.tar.gz"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tarball (.tar.gz)</span>
              </a>

              <button
                onClick={() => setShowDownloadBanner(false)}
                className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Dismiss Banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        {activeTab === 'video' && (
          <VideoFlowStudio
            currentProject={currentProject}
            setCurrentProject={setCurrentProject}
            onSaveProject={handleSaveProject}
          />
        )}

        {activeTab === 'image' && (
          <ImageStudio
            images={images}
            onAddImage={handleAddImage}
            onSendToVideoFlow={handleSendImageToVideoFlow}
          />
        )}

        {activeTab === 'music' && (
          <MusicStudio
            tracks={musicTracks}
            onAddTrack={handleAddMusicTrack}
            onAttachToVideo={handleAttachMusicToVideo}
          />
        )}

        {activeTab === 'copilot' && (
          <FlowCopilot
            onUsePromptInVideo={handleUsePromptInVideo}
            onAddImageToStudio={handleAddImage}
          />
        )}

        {activeTab === 'vault' && (
          <ProjectVault
            projects={projects}
            images={images}
            musicTracks={musicTracks}
            onOpenProject={handleOpenProjectInStudio}
            onDeleteProject={handleDeleteProject}
            onDeleteImage={handleDeleteImage}
            onDeleteTrack={async (id) => {
              setMusicTracks(musicTracks.filter((m) => m.id !== id));
            }}
          />
        )}
      </main>

      {/* App Updates & Extension Hub Modal */}
      <UpdateManagerModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        extensions={extensions}
        onSaveExtensions={handleSaveExtensions}
      />

      {/* Install on Phone Modal */}
      <InstallPhoneModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
      />
    </div>
  );
}
