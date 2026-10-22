import React, { useState } from 'react';
import { GeneratedImage, AspectRatioType, ImageModelId } from '../../types';
import { generateStudioImage, enhancePromptApi } from '../../services/api';
import { Image as ImageIcon, Sparkles, Download, Film, Wand2, Layers, Check, ExternalLink, Zap } from 'lucide-react';

interface ImageStudioProps {
  images: GeneratedImage[];
  onAddImage: (img: GeneratedImage) => void;
  onSendToVideoFlow: (img: GeneratedImage) => void;
}

const IMAGE_MODELS: { id: ImageModelId; name: string; provider: string; badge: string; highlight: string }[] = [
  { id: 'imagen-3-ultra', name: 'Imagen 3 Ultra (Gemini 2.1)', provider: 'Google DeepMind', badge: 'Ultra Accurate', highlight: 'Photorealistic textures, crisp lighting & accurate anatomy' },
  { id: 'flux-pro-1.1', name: 'Flux Pro 1.1 Ultra', provider: 'Black Forest Labs', badge: 'Top Fidelity', highlight: 'High dynamic range, detailed hands & typography' },
  { id: 'midjourney-v7', name: 'Midjourney v7 Aesthetic', provider: 'Midjourney Engine', badge: 'Cinematic Art', highlight: 'Breathtaking anime combat, color grading & film grain' },
  { id: 'dall-e-4', name: 'DALL-E 4 Studio', provider: 'OpenAI', badge: 'Prompt Faithful', highlight: 'Complex multi-subject composition & spatial geometry' }
];

const IMAGE_STYLES = [
  { id: 'anime', label: '⚡ Realistic Anime Combat', desc: 'Ufotable & Shinkai inspired high-energy anime with speedlines' },
  { id: 'cinematic_landscape', label: '🏔️ 4K Cinematic Landscape', desc: 'Volumetric atmosphere & Arri anamorphic look' },
  { id: 'photorealism', label: '📸 Ultra Photorealism', desc: 'Hyper-accurate skin, textures & 8k studio lighting' },
  { id: 'cyberpunk', label: '🌃 Cyberpunk & Sci-Fi', desc: 'Vibrant neon rain & reflective metallic armors' },
  { id: 'ghibli', label: '🍃 Studio Ghibli Painterly', desc: 'Lush hand-painted colors & nostalgic clouds' },
  { id: 'octane_3d', label: '🔮 3D Octane / Unreal 5', desc: 'Subsurface scattering & raytraced caustics' }
];

const ASPECT_RATIOS: { id: AspectRatioType; label: string; desc: string; icon: string }[] = [
  { id: '16:9', label: '16:9 Landscape', desc: 'YouTube, TV & Wide Cinema', icon: '🖥️' },
  { id: '9:16', label: '9:16 Vertical', desc: 'TikTok, Reels, Shorts', icon: '📱' },
  { id: '1:1', label: '1:1 Square', desc: 'Instagram & Profile Avatar', icon: '⏹️' },
  { id: '4:3', label: '4:3 Classic', desc: 'Standard & Retro Framing', icon: '📺' },
  { id: '21:9', label: '21:9 Ultra-Wide', desc: 'Anamorphic IMAX Scope', icon: '🎬' }
];

export const ImageStudio: React.FC<ImageStudioProps> = ({
  images,
  onAddImage,
  onSendToVideoFlow
}) => {
  const [prompt, setPrompt] = useState<string>(
    'Master anime samurai with glowing lightning katana, standing upon a shattered bridge at sunset with cherry blossom petals floating in air'
  );
  const [selectedModel, setSelectedModel] = useState<ImageModelId>('imagen-3-ultra');
  const [selectedStyle, setSelectedStyle] = useState<string>('anime');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePromptApi(prompt, selectedModel, selectedStyle);
      setPrompt(enhanced);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const newImage = await generateStudioImage(prompt, selectedStyle, aspectRatio);
      onAddImage(newImage);
      setActiveImage(newImage);
    } catch (err) {
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (img: GeneratedImage) => {
    const a = document.createElement('a');
    a.href = img.imageUrl;
    a.download = `flowmotion_${img.style}_${img.aspectRatio.replace(':', 'x')}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Highest Quality AI Image Generator Studio
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Imagen 3 Ultra & Flux Pro
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate 4K accurate images with preferred aspect ratios (16:9, 9:16, 1:1, 4:3, 21:9). 1-click send to Video Flow to animate with Seedance 2.5!
          </p>
        </div>

        <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
          Unlimited Generations Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Generation Studio Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          {/* Highest Quality Image Generator Model Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              <span>Highest Quality Image Model</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {IMAGE_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-pink-600/20 border-pink-500 text-white shadow-sm ring-1 ring-pink-500/30'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-mono uppercase">{model.provider.split(' ')[0]}</span>
                        <span className="font-semibold text-pink-400">{model.badge}</span>
                      </div>
                      <span className="font-bold text-xs text-slate-100 truncate block">{model.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Image Prompt</span>
              </label>

              <button
                type="button"
                disabled={isEnhancing}
                onClick={handleEnhance}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-300 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
              >
                <Wand2 className="w-3 h-3" />
                <span>{isEnhancing ? 'Expanding...' : 'Enhance Prompt'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your desired photo or anime artwork in high detail..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/60 border border-white/10 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500 transition-all resize-none"
            />
          </div>

          {/* Style Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Artistic Style Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {IMAGE_STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-pink-600/20 border-pink-500 text-white shadow-sm ring-1 ring-pink-500/30'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-semibold text-xs text-slate-200 truncate">{style.label}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{style.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Aspect Ratio Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Preferred Aspect Ratio</span>
              <span className="text-[10px] font-mono text-pink-400 font-bold">{aspectRatio}</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setAspectRatio(ratio.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
                    aspectRatio === ratio.id
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25 ring-1 ring-pink-400/40'
                      : 'bg-slate-950/50 border border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                  title={`${ratio.label} - ${ratio.desc}`}
                >
                  <span className="text-xs">{ratio.icon}</span>
                  <span className="text-[10px] mt-0.5">{ratio.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            disabled={isGenerating || !prompt.trim()}
            onClick={handleGenerate}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-pink-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Rendering 4K Accurate Image...' : 'Generate Unlimited Image'}</span>
          </button>
        </div>

        {/* Right Preview & Recent Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Display Image with Prominent Download Output Button */}
          {activeImage ? (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
              <div className="relative aspect-video max-h-[460px] w-full rounded-xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center group">
                <img
                  src={activeImage.imageUrl}
                  alt={activeImage.prompt}
                  className="w-full h-full object-contain"
                />

                {/* Overlay actions */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-95">
                  <button
                    type="button"
                    onClick={() => handleDownload(activeImage)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-pink-500/30 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Final Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSendToVideoFlow(activeImage)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 cursor-pointer transition-all"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Animate in Video Flow 🎬</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="truncate max-w-[360px] text-slate-300 font-medium">
                  {activeImage.prompt}
                </span>
                <span className="font-mono text-pink-400 uppercase text-[10px] shrink-0">
                  {activeImage.style} · {activeImage.aspectRatio}
                </span>
              </div>
            </div>
          ) : (
            <div className="aspect-video w-full rounded-2xl bg-slate-950/40 border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-3">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-200 text-sm">Ready to Generate Images</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Select your preferred model (Imagen 3 Ultra, Flux Pro, Midjourney v7) and aspect ratio, then click Generate Unlimited Image.
              </p>
            </div>
          )}

          {/* Recent Creations Grid */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Recent Studio Generations ({images.length})
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setActiveImage(img)}
                    className={`relative aspect-video rounded-xl overflow-hidden border cursor-pointer group transition-all ${
                      activeImage?.id === img.id
                        ? 'border-pink-500 ring-2 ring-pink-500/30'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                      <span className="text-[10px] text-white line-clamp-1">{img.prompt}</span>
                      <span className="text-[9px] font-mono text-pink-300">{img.aspectRatio}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
