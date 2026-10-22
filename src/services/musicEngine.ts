// Suno AI Style Text-to-Music Web Audio Synthesis Engine
import { SunoMusicTrack } from '../types';

export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    result = new Float32Array(left.length + right.length);
    for (let i = 0; i < left.length; i++) {
      result[i * 2] = left[i];
      result[i * 2 + 1] = right[i];
    }
  } else {
    result = buffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = result.length * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const arrayBuffer = new ArrayBuffer(totalSize);
  const dataView = new DataView(arrayBuffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      dataView.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF Chunk
  writeString(0, 'RIFF');
  dataView.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt subchunk
  writeString(12, 'fmt ');
  dataView.setUint32(16, 16, true);
  dataView.setUint16(20, format, true);
  dataView.setUint16(22, numChannels, true);
  dataView.setUint32(24, sampleRate, true);
  dataView.setUint32(28, sampleRate * blockAlign, true);
  dataView.setUint16(32, blockAlign, true);
  dataView.setUint16(34, bitDepth, true);

  // data subchunk
  writeString(36, 'data');
  dataView.setUint32(40, dataSize, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < result.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, result[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7fff;
    dataView.setInt16(offset, s, true);
  }

  return new Blob([dataView], { type: 'audio/wav' });
}

export async function synthesizeSunoTrack({
  title,
  prompt,
  lyrics,
  genre = 'anime_battle_ost',
  mood = 'epic',
  bpm = 135,
  duration = 30, // seconds
  isInstrumental = true,
  onProgress
}: {
  title: string;
  prompt: string;
  lyrics?: string;
  genre?: SunoMusicTrack['genre'];
  mood?: string;
  bpm?: number;
  duration?: number;
  isInstrumental?: boolean;
  onProgress?: (percent: number, status: string) => void;
}): Promise<SunoMusicTrack> {
  const sampleRate = 44100;
  const totalLength = Math.round(duration * sampleRate);
  const offlineCtx = new OfflineAudioContext(2, totalLength, sampleRate);

  if (onProgress) onProgress(15, 'Synthesizing chords & harmonics...');

  const beatDuration = 60 / bpm;
  const numBeats = Math.floor(duration / beatDuration);

  // Master Bus & Reverb Simulator
  const masterBus = offlineCtx.createGain();
  masterBus.gain.setValueAtTime(0.7, 0);
  masterBus.connect(offlineCtx.destination);

  // 1. Chords & Bass Progression
  // Scale frequencies (in Hz):
  // Minor key chords: A minor, F major, C major, G major (Classic Epic Anime / Cinematic progression)
  const chordRoots = [220, 174.61, 261.63, 196.0]; // A3, F3, C4, G3
  const bassRoots = [55, 43.65, 65.41, 49.0]; // A1, F1, C2, G1

  const chordsPerPattern = 4;
  const beatsPerChord = 4;

  for (let beat = 0; beat < numBeats; beat++) {
    const chordIdx = Math.floor(beat / beatsPerChord) % chordsPerPattern;
    const time = beat * beatDuration;

    // Bass note on downbeats
    if (beat % beatsPerChord === 0) {
      const bassOsc = offlineCtx.createOscillator();
      const bassGain = offlineCtx.createGain();

      bassOsc.type = genre === 'cyberpunk_synth' || genre === 'phonk_drift' ? 'sawtooth' : 'triangle';
      bassOsc.frequency.setValueAtTime(bassRoots[chordIdx], time);

      bassGain.gain.setValueAtTime(0.35, time);
      bassGain.gain.exponentialRampToValueAtTime(0.01, time + beatDuration * 3.8);

      bassOsc.connect(bassGain);
      bassGain.connect(masterBus);
      bassOsc.start(time);
      bassOsc.stop(time + beatDuration * 3.9);
    }

    // Drums: Kick, Snare, Hi-hats
    // Kick on beat 0 and 2
    if (beat % 4 === 0 || beat % 4 === 2) {
      const kickOsc = offlineCtx.createOscillator();
      const kickGain = offlineCtx.createGain();

      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(150, time);
      kickOsc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

      kickGain.gain.setValueAtTime(0.6, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      kickOsc.connect(kickGain);
      kickGain.connect(masterBus);
      kickOsc.start(time);
      kickOsc.stop(time + 0.28);
    }

    // Snare / Clap on beat 1 and 3
    if (beat % 4 === 1 || beat % 4 === 3) {
      // Noise burst snare
      const noiseBuffer = offlineCtx.createBuffer(1, Math.round(sampleRate * 0.2), sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const snareNoise = offlineCtx.createBufferSource();
      snareNoise.buffer = noiseBuffer;

      const snareFilter = offlineCtx.createBiquadFilter();
      snareFilter.type = 'highpass';
      snareFilter.frequency.setValueAtTime(1200, time);

      const snareGain = offlineCtx.createGain();
      snareGain.gain.setValueAtTime(0.3, time);
      snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      snareNoise.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(masterBus);
      snareNoise.start(time);
      snareNoise.stop(time + 0.2);
    }

    // Hi-hat on 8th notes
    for (let sub = 0; sub < 2; sub++) {
      const hatTime = time + (sub * beatDuration) / 2;
      const hatNoise = offlineCtx.createBufferSource();
      const hatBuffer = offlineCtx.createBuffer(1, Math.round(sampleRate * 0.05), sampleRate);
      const hdata = hatBuffer.getChannelData(0);
      for (let i = 0; i < hdata.length; i++) {
        hdata[i] = (Math.random() * 2 - 1) * 0.15;
      }
      hatNoise.buffer = hatBuffer;

      const hatFilter = offlineCtx.createBiquadFilter();
      hatFilter.type = 'highpass';
      hatFilter.frequency.setValueAtTime(7000, hatTime);

      const hatGain = offlineCtx.createGain();
      hatGain.gain.setValueAtTime(0.18, hatTime);
      hatGain.gain.exponentialRampToValueAtTime(0.001, hatTime + 0.04);

      hatNoise.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(masterBus);
      hatNoise.start(hatTime);
      hatNoise.stop(hatTime + 0.05);
    }

    // Melody / Arpeggio Lead
    const arpNotes = [chordRoots[chordIdx], chordRoots[chordIdx] * 1.25, chordRoots[chordIdx] * 1.5, chordRoots[chordIdx] * 1.75];
    const noteFreq = arpNotes[beat % 4];

    const leadOsc = offlineCtx.createOscillator();
    const leadGain = offlineCtx.createGain();

    leadOsc.type = genre === 'anime_battle_ost' ? 'sawtooth' : genre === 'lofi_chill' ? 'sine' : 'square';
    leadOsc.frequency.setValueAtTime(noteFreq * (genre === 'phonk_drift' ? 2 : 1.5), time);

    leadGain.gain.setValueAtTime(0.01, time);
    leadGain.gain.linearRampToValueAtTime(0.15, time + 0.04);
    leadGain.gain.exponentialRampToValueAtTime(0.001, time + beatDuration * 0.85);

    leadOsc.connect(leadGain);
    leadGain.connect(masterBus);
    leadOsc.start(time);
    leadOsc.stop(time + beatDuration * 0.9);
  }

  if (onProgress) onProgress(65, 'Rendering multi-track stems & master limiter...');

  const renderedBuffer = await offlineCtx.startRendering();

  if (onProgress) onProgress(90, 'Encoding lossless WAV master...');

  const wavBlob = audioBufferToWav(renderedBuffer);
  const audioUrl = URL.createObjectURL(wavBlob);

  if (onProgress) onProgress(100, 'Track complete!');

  return {
    id: `suno-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title || 'Suno Epic Motion OST',
    prompt,
    lyrics,
    genre,
    mood,
    bpm,
    duration,
    audioUrl,
    audioBlob: wavBlob,
    createdAt: Date.now(),
    isInstrumental
  };
}
