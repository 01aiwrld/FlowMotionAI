import { VideoProject, CaptionLine } from '../types';
import { getAudioContext, createAtmosphericSoundscape } from './audioEngine';

export interface RenderProgress {
  percent: number;
  currentSecond: number;
  totalSeconds: number;
  statusText: string;
}

export class VideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isRendering = false;
  private loadedImages: Map<string, HTMLImageElement> = new Map();

  constructor(width = 1280, height = 720) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Could not get 2D context from canvas');
    this.ctx = context;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public async preloadProjectImages(project: VideoProject): Promise<void> {
    const promises = project.photos.map(async (photo) => {
      if (this.loadedImages.has(photo.id)) return;
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          this.loadedImages.set(photo.id, img);
          resolve();
        };
        img.onerror = () => {
          console.warn('Failed to load image keyframe:', photo.fileName);
          resolve();
        };
        img.src = photo.imageUrl;
      });
    });
    await Promise.all(promises);
  }

  // Draw a single frame at timestamp t (in seconds)
  public drawFrame(project: VideoProject, t: number): void {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    const duration = project.duration;
    const progress = Math.min(1, Math.max(0, t / duration));

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply Camera Motion Transformations
    this.applyCameraMotion(ctx, project.cameraMotion, progress, project.motionIntensity, width, height);

    // 1. Check if we have uploaded photos to render for this time slice
    const numPhotos = project.photos.length;
    let renderedPhoto = false;

    if (numPhotos > 0) {
      const sliceDuration = duration / numPhotos;
      const currentPhotoIdx = Math.min(numPhotos - 1, Math.floor(t / sliceDuration));
      const photoKeyframe = project.photos[currentPhotoIdx];
      const img = this.loadedImages.get(photoKeyframe.id);

      if (img && img.complete && img.naturalWidth > 0) {
        const localProgress = (t % sliceDuration) / sliceDuration;
        this.renderPhotoKeyframe(ctx, img, photoKeyframe, localProgress, width, height, project.presetStyle);
        renderedPhoto = true;
      }
    }

    // 2. If no photo or background overlay, render procedural cinematic visual engine
    if (!renderedPhoto) {
      if (project.presetStyle === 'anime_combat' || project.prompt.toLowerCase().includes('anime')) {
        this.renderAnimeCombatScene(ctx, progress, t, width, height, project.motionIntensity);
      } else if (project.presetStyle === 'cinematic_landscape' || project.prompt.toLowerCase().includes('landscape')) {
        this.renderCinematicLandscape(ctx, progress, t, width, height);
      } else if (project.presetStyle === 'cyberpunk') {
        this.renderCyberpunkScene(ctx, progress, t, width, height);
      } else {
        this.renderGeneralCinematic(ctx, progress, t, width, height, project.prompt);
      }
    }

    ctx.restore(); // Restore camera transformation before rendering HUD and subtitles

    // 3. Render Burned Subtitles & Auto-Captions
    if (project.burnSubtitles && project.autoCaption && project.captions.length > 0) {
      this.renderCaptions(ctx, project.captions, t, width, height, project.subtitleStyle);
    }

    // 4. Subtle Cinematic Vignette & Model Watermark / Indicator
    this.renderCinematicOverlays(ctx, width, height, project.model);
  }

  private applyCameraMotion(
    ctx: CanvasRenderingContext2D,
    motion: string,
    p: number,
    intensity: number,
    w: number,
    h: number
  ): void {
    ctx.translate(w / 2, h / 2);

    const intFactor = intensity * 0.4;

    switch (motion) {
      case 'pan_right':
        ctx.translate(-w * 0.08 * p * intFactor, 0);
        break;
      case 'pan_left':
        ctx.translate(w * 0.08 * p * intFactor, 0);
        break;
      case 'tilt_up':
        ctx.translate(0, h * 0.08 * p * intFactor);
        break;
      case 'tilt_down':
        ctx.translate(0, -h * 0.08 * p * intFactor);
        break;
      case 'zoom_in': {
        const scale = 1 + 0.15 * p * intFactor;
        ctx.scale(scale, scale);
        break;
      }
      case 'zoom_out': {
        const scale = 1.15 - 0.15 * p * intFactor;
        ctx.scale(scale, scale);
        break;
      }
      case 'orbit_360': {
        const angle = Math.sin(p * Math.PI * 2) * 0.04 * intFactor;
        const scale = 1.05 + Math.cos(p * Math.PI * 2) * 0.03 * intFactor;
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        break;
      }
      case 'whip_pan': {
        const whip = Math.sin(p * Math.PI * 4) * 0.06 * intFactor;
        ctx.translate(whip * w, 0);
        break;
      }
      case 'action_shake': {
        const shakeX = (Math.sin(p * 80) * 8 + Math.cos(p * 45) * 6) * (intensity * 0.3);
        const shakeY = (Math.cos(p * 70) * 7 + Math.sin(p * 35) * 5) * (intensity * 0.3);
        ctx.translate(shakeX, shakeY);
        break;
      }
      default:
        break;
    }

    ctx.translate(-w / 2, -h / 2);
  }

  private renderPhotoKeyframe(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    keyframe: any,
    p: number,
    w: number,
    h: number,
    style: string
  ): void {
    // Dynamic Ken-Burns and action scaling
    const scale = 1.0 + p * 0.12 * (keyframe.motionStrength || 1.5);
    const offsetX = (p - 0.5) * 40 * (keyframe.motionStrength || 1);

    ctx.save();
    ctx.translate(w / 2 + offsetX, h / 2);
    ctx.scale(scale, scale);

    // Calculate aspect ratio cover
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;
    let dw = w;
    let dh = h;
    if (imgRatio > canvasRatio) {
      dw = h * imgRatio;
    } else {
      dh = w / imgRatio;
    }

    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();

    // Style-specific energy overlay on top of photo
    if (style === 'anime_combat' || keyframe.prompt.toLowerCase().includes('sword') || keyframe.prompt.toLowerCase().includes('attack')) {
      // Anime Energy particles & lightning sparks over the photo
      this.drawAnimeSparks(ctx, p * 10, w, h);
      this.drawSlashArc(ctx, p, w, h);
    } else {
      // Atmospheric light sweep
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(Math.min(1, Math.max(0, p * 1.4 - 0.2)), 'rgba(255, 230, 180, 0.15)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private renderAnimeCombatScene(
    ctx: CanvasRenderingContext2D,
    p: number,
    t: number,
    w: number,
    h: number,
    intensity: number
  ): void {
    // 1. High contrast dusk / storm sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0c071e');
    sky.addColorStop(0.4, '#24103f');
    sky.addColorStop(0.7, '#6b1948');
    sky.addColorStop(1, '#ff5e36');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 2. Anime Speedlines
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2;
    const centerX = w * 0.5 + Math.sin(t * 3) * 50;
    const centerY = h * 0.48;
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2 + t * 0.8;
      const len = 300 + ((i * 17) % 250);
      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(angle) * (180 + Math.sin(t * 10 + i) * 30), centerY + Math.sin(angle) * 120);
      ctx.lineTo(centerX + Math.cos(angle) * (w * 0.8 + len), centerY + Math.sin(angle) * (h * 0.8 + len));
      ctx.stroke();
    }
    ctx.restore();

    // 3. Shattered Stone Bridge / Cliffs in Silhouette
    ctx.fillStyle = '#06050b';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.lineTo(w * 0.35, h * 0.68);
    ctx.lineTo(w * 0.45, h * 0.78);
    ctx.lineTo(w * 0.65, h * 0.73);
    ctx.lineTo(w, h * 0.79);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Floating stone debris
    ctx.fillStyle = '#0f0c18';
    for (let i = 0; i < 8; i++) {
      const stoneX = (w * 0.2 + i * 110 + Math.sin(t * 2 + i) * 40) % w;
      const stoneY = h * 0.55 + Math.cos(t * 1.5 + i) * 50;
      ctx.beginPath();
      ctx.arc(stoneX, stoneY, 12 + (i % 8), 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Clashing Katana Warriors (Silhouette with glowing anime eyes and aura)
    const warrior1X = w * 0.38 + Math.sin(t * 5) * 15;
    const warrior2X = w * 0.62 - Math.sin(t * 5) * 15;
    const groundY = h * 0.72;

    // Blue Aura Warrior (Left)
    this.drawWarriorSilhouette(ctx, warrior1X, groundY, '#00d2ff', true, t);

    // Crimson Aura Warrior (Right)
    this.drawWarriorSilhouette(ctx, warrior2X, groundY, '#ff2a55', false, t);

    // 5. Slash Arcs and Kinetic Sparks
    this.drawAnimeSparks(ctx, t, w, h);
    this.drawSlashArc(ctx, (p * 5) % 1, w, h);

    // Cherry blossom / fiery embers floating
    this.drawFloatingEmbers(ctx, t, w, h);
  }

  private drawWarriorSilhouette(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    auraColor: string,
    isLeft: boolean,
    t: number
  ): void {
    ctx.save();
    // Glowing Aura
    ctx.shadowColor = auraColor;
    ctx.shadowBlur = 35 + Math.sin(t * 8) * 15;

    // Body
    ctx.fillStyle = '#06050a';
    ctx.beginPath();
    ctx.arc(x, y - 110, 22, 0, Math.PI * 2); // Head
    ctx.fill();

    // Torso & Haori coat flowing
    ctx.beginPath();
    ctx.moveTo(x - 15, y - 90);
    ctx.lineTo(x + 15, y - 90);
    ctx.lineTo(x + (isLeft ? 35 : -35) + Math.sin(t * 6) * 10, y - 20);
    ctx.lineTo(x - 20, y);
    ctx.lineTo(x + 20, y);
    ctx.closePath();
    ctx.fill();

    // Katana Blade
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (isLeft) {
      ctx.moveTo(x + 10, y - 70);
      ctx.lineTo(x + 90, y - 95 + Math.sin(t * 12) * 20);
    } else {
      ctx.moveTo(x - 10, y - 70);
      ctx.lineTo(x - 90, y - 95 + Math.cos(t * 12) * 20);
    }
    ctx.stroke();

    // Glowing Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + (isLeft ? 8 : -8), y - 112, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawSlashArc(ctx: CanvasRenderingContext2D, localP: number, w: number, h: number): void {
    if (localP > 0.4 && localP < 0.85) {
      const arcProgress = (localP - 0.4) / 0.45;
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${1 - arcProgress})`;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 40;
      ctx.lineWidth = 14 * (1 - arcProgress);
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.52, 140, -Math.PI * 0.8 + arcProgress * Math.PI, -Math.PI * 0.1 + arcProgress * Math.PI);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawAnimeSparks(ctx: CanvasRenderingContext2D, t: number, w: number, h: number): void {
    ctx.save();
    const clashCenterX = w * 0.5 + Math.sin(t * 4) * 20;
    const clashCenterY = h * 0.52;

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + (t * 5);
      const dist = 30 + (Math.sin(t * 15 + i) * 60);
      ctx.fillStyle = i % 2 === 0 ? '#ffea00' : '#00f0ff';
      ctx.beginPath();
      ctx.arc(clashCenterX + Math.cos(angle) * dist, clashCenterY + Math.sin(angle) * dist, 3 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawFloatingEmbers(ctx: CanvasRenderingContext2D, t: number, w: number, h: number): void {
    ctx.save();
    for (let i = 0; i < 24; i++) {
      const ex = (w * 0.1 + i * 55 + Math.sin(t * 1.2 + i) * 80) % w;
      const ey = (h - ((t * 40 + i * 60) % h));
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 94, 54, 0.7)' : 'rgba(255, 220, 100, 0.6)';
      ctx.beginPath();
      ctx.arc(ex, ey, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderCinematicLandscape(
    ctx: CanvasRenderingContext2D,
    p: number,
    t: number,
    w: number,
    h: number
  ): void {
    // 1. Golden Hour Sky with Sun Flare
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#102542');
    sky.addColorStop(0.35, '#2e4a62');
    sky.addColorStop(0.65, '#e07a5f');
    sky.addColorStop(0.85, '#f4a261');
    sky.addColorStop(1, '#e9c46a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Glowing Sun
    const sunX = w * 0.65;
    const sunY = h * 0.42;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 320);
    sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    sunGlow.addColorStop(0.2, 'rgba(255, 235, 170, 0.6)');
    sunGlow.addColorStop(0.6, 'rgba(244, 162, 97, 0.2)');
    sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, w, h);

    // 2. Distant Alpine Mountain Peaks
    ctx.fillStyle = '#263445';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.62);
    ctx.lineTo(w * 0.22, h * 0.44);
    ctx.lineTo(w * 0.45, h * 0.58);
    ctx.lineTo(w * 0.68, h * 0.38);
    ctx.lineTo(w * 0.88, h * 0.52);
    ctx.lineTo(w, h * 0.45);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 3. Volumetric Fog Layer
    const fogGrad = ctx.createLinearGradient(0, h * 0.48, 0, h * 0.68);
    fogGrad.addColorStop(0, 'rgba(244, 162, 97, 0)');
    fogGrad.addColorStop(0.5, 'rgba(255, 220, 180, 0.35)');
    fogGrad.addColorStop(1, 'rgba(244, 162, 97, 0)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, h * 0.48, w, h * 0.2);

    // 4. Foreground Forest Ridge
    ctx.fillStyle = '#111b24';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.75);
    for (let x = 0; x <= w; x += 15) {
      const treeH = Math.sin(x * 0.05) * 15 + Math.cos(x * 0.02) * 20;
      ctx.lineTo(x, h * 0.72 - treeH);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 5. Crystal Glacial Lake with Sun Reflection
    const waterGrad = ctx.createLinearGradient(0, h * 0.76, 0, h);
    waterGrad.addColorStop(0, 'rgba(16, 37, 66, 0.95)');
    waterGrad.addColorStop(0.5, 'rgba(233, 196, 106, 0.4)');
    waterGrad.addColorStop(1, 'rgba(8, 18, 30, 0.98)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, h * 0.76, w, h * 0.24);

    // Water Ripples
    ctx.strokeStyle = 'rgba(255, 235, 180, 0.4)';
    ctx.lineWidth = 1.5;
    for (let y = h * 0.8; y < h; y += 12) {
      ctx.beginPath();
      ctx.moveTo(w * 0.4, y);
      ctx.lineTo(w * 0.8, y + Math.sin(t * 3 + y) * 2);
      ctx.stroke();
    }
  }

  private renderCyberpunkScene(
    ctx: CanvasRenderingContext2D,
    p: number,
    t: number,
    w: number,
    h: number
  ): void {
    // Cyberpunk Dark City
    ctx.fillStyle = '#070814';
    ctx.fillRect(0, 0, w, h);

    // Skyscrapers with neon windows
    for (let i = 0; i < 14; i++) {
      const bW = w * 0.08 + (i % 4) * 20;
      const bH = h * 0.5 + ((i * 37) % (h * 0.35));
      const bX = i * (w / 12) - 30;
      const bY = h - bH;

      ctx.fillStyle = '#0d1024';
      ctx.fillRect(bX, bY, bW, bH);

      // Neon Sign
      if (i % 3 === 0) {
        ctx.fillStyle = i % 2 === 0 ? '#00f0ff' : '#ff007f';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 15;
        ctx.fillRect(bX + 15, bY + 30, 8, bH * 0.4);
        ctx.shadowBlur = 0;
      }
    }

    // Neon Rain
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 40; i++) {
      const rx = (i * 32 + t * 40) % w;
      const ry = ((t * 800 + i * 50) % h);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 8, ry + 25);
      ctx.stroke();
    }
  }

  private renderGeneralCinematic(
    ctx: CanvasRenderingContext2D,
    p: number,
    t: number,
    w: number,
    h: number,
    prompt: string
  ): void {
    // Sophisticated deep space / cinematic studio ambient
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 50, w * 0.5, h * 0.5, w * 0.7);
    grad.addColorStop(0, '#1a1d36');
    grad.addColorStop(0.5, '#0e101f');
    grad.addColorStop(1, '#05060a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Dynamic fluid ribbon
    ctx.save();
    ctx.lineWidth = 12;
    for (let layer = 0; layer < 4; layer++) {
      ctx.beginPath();
      ctx.strokeStyle = layer % 2 === 0 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(236, 72, 153, 0.35)';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 20;
      for (let x = 0; x <= w; x += 30) {
        const y = h * 0.5 + Math.sin(x * 0.005 + t * 2 + layer) * 120 + Math.cos(x * 0.002 + t) * 60;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderCaptions(
    ctx: CanvasRenderingContext2D,
    captions: CaptionLine[],
    t: number,
    w: number,
    h: number,
    style: string
  ): void {
    const current = captions.find((c) => t >= c.start && t <= c.end);
    if (!current) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const y = h * 0.86;

    if (style === 'anime_bold') {
      // Bold Anime Subtitle with thick outline & glowing yellow
      ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 2;
      ctx.lineWidth = 9;
      ctx.strokeStyle = '#050508';
      ctx.strokeText(current.text, w / 2, y);

      ctx.fillStyle = '#ffea00';
      ctx.shadowColor = '#ff5e00';
      ctx.shadowBlur = 14;
      ctx.fillText(current.text, w / 2, y);
    } else if (style === 'cinematic_bar') {
      // Sleek translucent letterbox backdrop with crisp typography
      ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
      const textWidth = ctx.measureText(current.text).width;
      const padX = 28;
      const padY = 12;

      ctx.fillStyle = 'rgba(10, 12, 18, 0.82)';
      ctx.beginPath();
      ctx.roundRect(w / 2 - textWidth / 2 - padX, y - 20 - padY, textWidth + padX * 2, 40 + padY * 2, 10);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(current.text, w / 2, y);
    } else if (style === 'karaoke_glow') {
      // Pulsing karaoke subtitle
      const scale = 1 + Math.sin(t * 8) * 0.05;
      ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(current.text, w / 2, y);
    } else {
      // Minimal clean Google Flow subtitle
      ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(current.text, w / 2, y);
    }

    ctx.restore();
  }

  private renderCinematicOverlays(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    modelId: string
  ): void {
    // 1. Subtle Anamorphic Lens Flare / Vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.72);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // 2. Google Flow inspired clean top-right model stamp
    ctx.save();
    ctx.textAlign = 'right';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const modelTag = modelId.toUpperCase().replace('-', ' ');
    ctx.fillText(`FLOWMOTION // ${modelTag}`, w - 24, 32);
    ctx.restore();
  }

  // Render & Record Full Video to WebM/MP4 Blob with Mixed Audio
  public async exportVideo(
    project: VideoProject,
    onProgress: (p: RenderProgress) => void
  ): Promise<{ blob: Blob; url: string; thumbnailUrl: string }> {
    this.isRendering = true;
    await this.preloadProjectImages(project);

    const fps = project.fps || 30;
    const totalDuration = project.duration || 15;
    const totalFrames = Math.round(totalDuration * fps);
    const audioCtx = getAudioContext();

    // Setup Web Audio Destination for recording
    const audioDestination = audioCtx.createMediaStreamDestination();

    // Start atmospheric soundscape if enabled
    const activeSfx = project.sfxTracks.find((s) => s.enabled);
    let soundscapeHandle: { stop: () => void } | null = null;
    if (activeSfx) {
      soundscapeHandle = createAtmosphericSoundscape(
        audioCtx,
        activeSfx.category,
        totalDuration,
        audioDestination
      );
    }

    // Connect user BGM if present
    let bgmAudioEl: HTMLAudioElement | null = null;
    if (project.bgmAudioUrl) {
      try {
        bgmAudioEl = new Audio(project.bgmAudioUrl);
        bgmAudioEl.volume = project.bgmVolume || 0.7;
        const bgmSource = audioCtx.createMediaElementSource(bgmAudioEl);
        bgmSource.connect(audioDestination);
        bgmAudioEl.play().catch(() => {});
      } catch (err) {
        console.warn('Could not attach BGM stream:', err);
      }
    }

    // Capture Canvas Stream & Combine with Audio Stream
    const canvasStream = this.canvas.captureStream(fps);
    const combinedTracks = [
      ...canvasStream.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks()
    ];
    const combinedStream = new MediaStream(combinedTracks);

    // Setup MediaRecorder
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }
    }

    const mediaRecorder = new MediaRecorder(combinedStream, mimeType ? { mimeType, videoBitsPerSecond: 8000000 } : undefined);
    const recordedChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.start(100);

    let thumbnailUrl = '';

    // Frame-by-frame rendering loop with exact time pacing
    for (let frame = 0; frame < totalFrames; frame++) {
      if (!this.isRendering) break;

      const currentTime = frame / fps;
      this.drawFrame(project, currentTime);

      // Capture thumbnail at ~2 seconds
      if (frame === Math.round(2 * fps)) {
        thumbnailUrl = this.canvas.toDataURL('image/jpeg', 0.85);
      }

      onProgress({
        percent: Math.round((frame / totalFrames) * 100),
        currentSecond: +currentTime.toFixed(1),
        totalSeconds: totalDuration,
        statusText: `Rendering frame ${frame + 1}/${totalFrames} (${currentTime.toFixed(1)}s / ${totalDuration}s)`
      });

      // Maintain rendering cadence
      await new Promise((r) => setTimeout(r, 1000 / fps));
    }

    // Stop recorder & audio
    if (bgmAudioEl) {
      bgmAudioEl.pause();
    }
    if (soundscapeHandle) {
      soundscapeHandle.stop();
    }

    return new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(finalBlob);
        if (!thumbnailUrl) {
          thumbnailUrl = this.canvas.toDataURL('image/jpeg', 0.85);
        }
        this.isRendering = false;
        resolve({ blob: finalBlob, url: videoUrl, thumbnailUrl });
      };
      mediaRecorder.stop();
    });
  }

  public cancelRender(): void {
    this.isRendering = false;
  }
}
