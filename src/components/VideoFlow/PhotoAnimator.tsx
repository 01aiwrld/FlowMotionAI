import React, { useRef } from 'react';
import { PhotoKeyframe } from '../../types';
import { ImagePlus, Trash2, Sparkles, ArrowRight, MoveUp, MoveDown, Layers, Zap } from 'lucide-react';

interface PhotoAnimatorProps {
  photos: PhotoKeyframe[];
  onPhotosChange: (photos: PhotoKeyframe[]) => void;
}

// Preset starter photos so user can test immediately with 1-click
const PRESET_PHOTOS = [
  {
    name: 'Anime Swordsman',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23130d24"/><circle cx="200" cy="180" r="50" fill="%230b0716"/><path d="M 170 230 L 230 230 L 250 360 L 150 360 Z" fill="%230b0716"/><line x1="160" y1="200" x2="310" y2="150" stroke="%2300f0ff" stroke-width="8"/><circle cx="215" cy="175" r="5" fill="%23ffffff"/><circle cx="200" cy="200" r="160" fill="none" stroke="%23ff0055" stroke-width="4" stroke-dasharray="8 12"/></svg>',
    defaultPrompt: 'Draw glowing katana with high-voltage blue lightning aura and dash forward in bullet-time'
  },
  {
    name: 'Misty Alpine Mountain',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%231e293b"/><polygon points="0,400 120,180 260,320 340,140 400,400" fill="%230f172a"/><circle cx="280" cy="120" r="40" fill="%23f59e0b"/><rect y="280" width="400" height="120" fill="%2338bdf8" opacity="0.4"/></svg>',
    defaultPrompt: 'Smooth cinematic drone descent over the peaks with golden hour sunrays reflecting on the water'
  },
  {
    name: 'Cyberpunk Warrior',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23090a15"/><circle cx="200" cy="170" r="45" fill="%231e1b4b"/><rect x="180" y="215" width="40" height="150" fill="%231e1b4b"/><circle cx="200" cy="165" r="12" fill="%23ec4899"/><line x1="20" y1="360" x2="380" y2="360" stroke="%2306b6d4" stroke-width="4"/></svg>',
    defaultPrompt: 'Turn helmet visor towards the viewer as pink and cyan neon rain bounces off armor'
  }
];

export const PhotoAnimator: React.FC<PhotoAnimatorProps> = ({ photos, onPhotosChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - photos.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const imageUrl = loadEvt.target?.result as string;
        const newKeyframe: PhotoKeyframe = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          imageUrl,
          fileName: file.name,
          prompt: 'Fluid motion tracking, character moves dynamically with cinematic lighting',
          motionStrength: 2,
          transition: 'zoom_drift'
        };
        onPhotosChange([...photos, newKeyframe]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddPreset = (preset: typeof PRESET_PHOTOS[0]) => {
    if (photos.length >= 5) return;
    const newKeyframe: PhotoKeyframe = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      imageUrl: preset.url,
      fileName: preset.name,
      prompt: preset.defaultPrompt,
      motionStrength: 2.5,
      transition: 'morph'
    };
    onPhotosChange([...photos, newKeyframe]);
  };

  const handleUpdatePrompt = (id: string, promptText: string) => {
    onPhotosChange(photos.map((p) => (p.id === id ? { ...p, prompt: promptText } : p)));
  };

  const handleUpdateMotionStrength = (id: string, strength: number) => {
    onPhotosChange(photos.map((p) => (p.id === id ? { ...p, motionStrength: strength } : p)));
  };

  const handleDeletePhoto = (id: string) => {
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newPhotos = [...photos];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newPhotos.length) return;
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIdx];
    newPhotos[targetIdx] = temp;
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-pink-400" />
            <span>Image-to-Video Photo Animator</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
              {photos.length} / 5 Photos
            </span>
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload up to 5 photos and describe exactly what each photo should be doing in the video.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={photos.length >= 5}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              photos.length >= 5
                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-md shadow-pink-500/20 cursor-pointer'
            }`}
          >
            <ImagePlus className="w-3.5 h-3.5" />
            <span>Upload Photo ({5 - photos.length} left)</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Starters if slots available */}
      {photos.length < 5 && (
        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
          <span className="text-slate-400 font-medium">Quick Starters:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_PHOTOS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleAddPreset(preset)}
                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition-all cursor-pointer flex items-center gap-1"
              >
                <Zap className="w-2.5 h-2.5 text-pink-400" />
                <span>+ {preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Photos Cards */}
      {photos.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-pink-500/40 rounded-xl p-6 text-center transition-all cursor-pointer bg-slate-950/30 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <ImagePlus className="w-6 h-6" />
          </div>
          <p className="text-xs font-medium text-slate-300">Click to upload reference photos (Max 5)</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Add action prompts to animate characters, fight poses, or landscape transitions!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 pt-1">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="p-3 rounded-xl bg-slate-950/50 border border-white/10 hover:border-pink-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 group"
            >
              {/* Photo Thumbnail + Sequence badge */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-slate-900">
                <img
                  src={photo.imageUrl}
                  alt={photo.fileName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">
                  #{idx + 1}
                </span>
              </div>

              {/* Action Prompt Textbox per photo */}
              <div className="flex-1 w-full space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[200px]">
                    {photo.fileName}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move earlier in timeline"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === photos.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move later in timeline"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer ml-1"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={photo.prompt}
                    onChange={(e) => handleUpdatePrompt(photo.id, e.target.value)}
                    placeholder="Tell what this uploaded photo should be doing in the video..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-white/10 focus:border-pink-500 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Motion Dynamics:</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={photo.motionStrength}
                      onChange={(e) => handleUpdateMotionStrength(photo.id, parseFloat(e.target.value))}
                      className="w-20 accent-pink-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono text-pink-400">{photo.motionStrength}x</span>
                  </div>
                  <span className="text-slate-500">Timeline segment: ~{idx * 20}%-{(idx + 1) * 20}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
