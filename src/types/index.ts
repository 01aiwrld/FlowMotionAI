export type AIModelId =
  | 'seedance-2.5'
  | 'minimax-video-01'
  | 'kling-2.0'
  | 'veo-2-flow'
  | 'sora-2-turbo'
  | 'wanx-2.1';

export type LLMModelId =
  | 'gemini-4-argon'
  | 'chatgpt-gpt-6-astra'
  | 'claude-fable-5.1'
  | 'gemini-3.8-flash';

export interface AIModel {
  id: AIModelId;
  name: string;
  provider: string;
  tagline: string;
  badge: string;
  bestFor: string;
  motionPurity: number; // 1-100
  color: string;
}

export type CameraMotion =
  | 'static'
  | 'pan_right'
  | 'pan_left'
  | 'tilt_up'
  | 'tilt_down'
  | 'zoom_in'
  | 'zoom_out'
  | 'orbit_360'
  | 'drone_crane'
  | 'whip_pan'
  | 'action_shake';

export type AspectRatioType = '16:9' | '9:16' | '1:1' | '4:3' | '21:9';

export type SubtitleStyle = 'anime_bold' | 'cinematic_bar' | 'karaoke_glow' | 'minimal_clean';

export interface CaptionLine {
  id: string;
  start: number; // in seconds
  end: number;
  text: string;
}

export interface PhotoKeyframe {
  id: string;
  imageUrl: string;
  fileName: string;
  prompt: string; // "what the uploaded photo should be doing in the video"
  motionStrength: number; // 1 - 5
  transition: 'morph' | 'crossfade' | 'whip_cut' | 'zoom_drift';
}

export interface SoundEffectTrack {
  id: string;
  name: string;
  category: 'anime_combat' | 'cinematic_drone' | 'cyber_pulse' | 'ambient_nature' | 'epic_rise';
  enabled: boolean;
  volume: number; // 0 - 1
}

export interface DubbingConfig {
  enabled: boolean;
  language: string; // 'Tagalog' | 'English' | 'Japanese' | etc.
  voicePersona: 'anime_hero' | 'calm_narrator' | 'action_tagalog' | 'epic_storyteller' | 'cyber_ai';
  dialogueScript: string;
  volume: number;
  speed: number;
  pitch: number;
}

export interface VideoProject {
  id: string;
  title: string;
  createdAt: number;
  model: AIModelId;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatioType;
  duration: number; // 8 to 60 seconds
  fps: 30 | 60;
  cameraMotion: CameraMotion;
  motionIntensity: number; // 1 to 5
  presetStyle: 'anime_combat' | 'cinematic_landscape' | 'cyberpunk' | 'photorealistic' | 'custom';
  
  // Up to 5 uploaded photos with individual prompts
  photos: PhotoKeyframe[];
  
  // Auto Caption & Subtitles
  autoCaption: boolean;
  captionLanguage: string;
  subtitleStyle: SubtitleStyle;
  captions: CaptionLine[];
  burnSubtitles: boolean;
  
  // Auto Dubbing
  dubbing: DubbingConfig;
  
  // Audio & Music
  bgmAudioUrl?: string;
  bgmAudioName?: string;
  bgmVolume: number;
  sfxTracks: SoundEffectTrack[];
  
  // Output preview / export cache
  outputVideoUrl?: string;
  thumbnailUrl?: string;
}

export type ImageModelId =
  | 'imagen-3-ultra'
  | 'flux-pro-1.1'
  | 'midjourney-v7'
  | 'dall-e-4';

export interface GeneratedImage {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: AspectRatioType;
  imageUrl: string;
  createdAt: number;
  model: string;
}

export interface SunoMusicTrack {
  id: string;
  title: string;
  prompt: string;
  lyrics?: string;
  genre: 'anime_battle_ost' | 'cinematic_orchestral' | 'cyberpunk_synth' | 'lofi_chill' | 'tagalog_opm' | 'phonk_drift' | 'ambient_zen';
  mood: string;
  bpm: number;
  duration: number; // in seconds (15 - 120s)
  audioUrl: string;
  audioBlob?: Blob;
  createdAt: number;
  isInstrumental: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelUsed?: LLMModelId;
  suggestedPrompts?: string[];
  generatedImageUrl?: string;
}

export interface CustomExtension {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  endpointUrl?: string;
  customSystemPrompt?: string;
}
