// FlowMotion Web Audio & Dubbing Synthesis Engine

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate high quality procedural atmospheric soundscapes
export function createAtmosphericSoundscape(
  ctx: AudioContext,
  category: 'anime_combat' | 'cinematic_drone' | 'cyber_pulse' | 'ambient_nature' | 'epic_rise',
  duration: number,
  outputNode: AudioNode
): { stop: () => void } {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.4, ctx.currentTime);
  masterGain.connect(outputNode);

  const activeNodes: (AudioScheduledSourceNode | AudioNode)[] = [masterGain];

  if (category === 'cinematic_drone') {
    // Deep Sub-Bass Rumble + Filtered Warm Stereo Drone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(54.5, ctx.currentTime); // Subtle beating

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + duration);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.01, ctx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 2);
    droneGain.gain.setValueAtTime(0.35, ctx.currentTime + Math.max(0, duration - 2));
    droneGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(masterGain);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + duration);
    osc2.stop(ctx.currentTime + duration);
    activeNodes.push(osc1, osc2, filter, droneGain);
  } else if (category === 'anime_combat') {
    // Dynamic periodic clashes, sonic boom whooshes, and intense harmonic tension
    const numClashes = Math.max(2, Math.floor(duration / 3.5));
    for (let i = 0; i < numClashes; i++) {
      const clashTime = ctx.currentTime + 1.2 + i * 3.5;
      if (clashTime + 1.5 > ctx.currentTime + duration) break;

      // Metallic high clang
      const metalOsc = ctx.createOscillator();
      const metalGain = ctx.createGain();
      metalOsc.type = 'triangle';
      metalOsc.frequency.setValueAtTime(1400, clashTime);
      metalOsc.frequency.exponentialRampToValueAtTime(400, clashTime + 0.35);

      metalGain.gain.setValueAtTime(0.01, clashTime);
      metalGain.gain.linearRampToValueAtTime(0.5, clashTime + 0.02);
      metalGain.gain.exponentialRampToValueAtTime(0.001, clashTime + 0.8);

      metalOsc.connect(metalGain);
      metalGain.connect(masterGain);
      metalOsc.start(clashTime);
      metalOsc.stop(clashTime + 0.85);

      // Low Sonic Boom Impact
      const boomOsc = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(120, clashTime);
      boomOsc.frequency.exponentialRampToValueAtTime(32, clashTime + 0.6);

      boomGain.gain.setValueAtTime(0.6, clashTime);
      boomGain.gain.exponentialRampToValueAtTime(0.001, clashTime + 0.9);

      boomOsc.connect(boomGain);
      boomGain.connect(masterGain);
      boomOsc.start(clashTime);
      boomOsc.stop(clashTime + 1.0);

      activeNodes.push(metalOsc, metalGain, boomOsc, boomGain);
    }
  } else if (category === 'cyber_pulse') {
    // Arpeggiated Synth Wave Pulse
    const synthOsc = ctx.createOscillator();
    const synthGain = ctx.createGain();
    synthOsc.type = 'sawtooth';
    synthOsc.frequency.setValueAtTime(110, ctx.currentTime);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(4, ctx.currentTime); // 4Hz pulse
    lfoGain.gain.setValueAtTime(25, ctx.currentTime);
    lfo.connect(synthOsc.frequency);

    synthGain.gain.setValueAtTime(0.25, ctx.currentTime);
    synthOsc.connect(synthGain);
    synthGain.connect(masterGain);

    lfo.start();
    synthOsc.start();
    lfo.stop(ctx.currentTime + duration);
    synthOsc.stop(ctx.currentTime + duration);
    activeNodes.push(synthOsc, synthGain, lfo, lfoGain);
  } else if (category === 'ambient_nature') {
    // Gentle pink/brown noise wind & river stream
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);

    whiteNoise.start();
    whiteNoise.stop(ctx.currentTime + duration);
    activeNodes.push(whiteNoise, filter, noiseGain);
  } else {
    // Epic Rise
    const riseOsc = ctx.createOscillator();
    const riseGain = ctx.createGain();
    riseOsc.type = 'sine';
    riseOsc.frequency.setValueAtTime(60, ctx.currentTime);
    riseOsc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration);

    riseGain.gain.setValueAtTime(0.05, ctx.currentTime);
    riseGain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + duration);

    riseOsc.connect(riseGain);
    riseGain.connect(masterGain);
    riseOsc.start();
    riseOsc.stop(ctx.currentTime + duration);
    activeNodes.push(riseOsc, riseGain);
  }

  return {
    stop: () => {
      try {
        masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      } catch (e) {
        // Ignored if already stopped
      }
    }
  };
}

// Auto-Dubbing Speech Synthesis Engine
export function speakDialogue({
  text,
  language = 'Tagalog',
  pitch = 1.0,
  rate = 1.0,
  volume = 1.0,
  onStart,
  onEnd
}: {
  text: string;
  language?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
}): SpeechSynthesisUtterance | null {
  if (!('speechSynthesis' in window)) return null;

  window.speechSynthesis.cancel(); // cancel any pending speech
  const utterance = new SpeechSynthesisUtterance(text);

  const langLower = language.toLowerCase();
  let langCode = 'en-US';

  if (langLower.includes('tagalog') || langLower.includes('filipino')) {
    langCode = 'fil-PH';
  } else if (langLower.includes('japan')) {
    langCode = 'ja-JP';
  } else if (langLower.includes('span')) {
    langCode = 'es-ES';
  } else if (langLower.includes('korean')) {
    langCode = 'ko-KR';
  } else if (langLower.includes('french')) {
    langCode = 'fr-FR';
  } else if (langLower.includes('german')) {
    langCode = 'de-DE';
  }

  utterance.lang = langCode;
  utterance.pitch = pitch;
  utterance.rate = rate;
  utterance.volume = volume;

  // Try to find matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langCode.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopAllSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
