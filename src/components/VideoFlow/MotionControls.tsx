import React from 'react';
import { CameraMotion, AspectRatioType } from '../../types';
import { Clock, Video, Sliders, Move, Gauge, Layers } from 'lucide-react';

interface MotionControlsProps {
  duration: number; // 8 - 60 seconds
  onDurationChange: (duration: number) => void;
  cameraMotion: CameraMotion;
  onCameraMotionChange: (motion: CameraMotion) => void;
  motionIntensity: number; // 1 - 5
  onMotionIntensityChange: (intensity: number) => void;
  fps: 30 | 60;
  onFpsChange: (fps: 30 | 60) => void;
  aspectRatio: AspectRatioType;
  onAspectRatioChange: (ratio: AspectRatioType) => void;
}

const CAMERA_MOTIONS: { id: CameraMotion; label: string; icon: string; desc: string }[] = [
  { id: 'orbit_360', label: '360° Orbit', icon: '🔄', desc: 'Dynamic circular camera spin' },
  { id: 'whip_pan', label: 'Whip Pan', icon: '⚡', desc: 'High-speed action camera snap' },
  { id: 'action_shake', label: 'Combat Impact Shake', icon: '💥', desc: 'Anime sword clash shudder' },
  { id: 'zoom_in', label: 'Push In (Zoom)', icon: '🔍', desc: 'Slow cinematic dolly forward' },
  { id: 'drone_crane', label: 'Drone Crane', icon: '🚁', desc: 'Vertical aerial landscape swoop' },
  { id: 'pan_right', label: 'Pan Right', icon: '➡️', desc: 'Smooth horizontal glide' },
  { id: 'pan_left', label: 'Pan Left', icon: '⬅️', desc: 'Smooth leftward tracking' },
  { id: 'tilt_up', label: 'Tilt Up', icon: '⬆️', desc: 'Cinematic low-to-high reveal' },
  { id: 'static', label: 'Static Lock', icon: '🔒', desc: 'Stationary tripod framing' }
];

const DURATION_PRESETS = [8, 15, 30, 45, 60];

export const MotionControls: React.FC<MotionControlsProps> = ({
  duration,
  onDurationChange,
  cameraMotion,
  onCameraMotionChange,
  motionIntensity,
  onMotionIntensityChange,
  fps,
  onFpsChange,
  aspectRatio,
  onAspectRatioChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
      {/* 1. Duration Control (8 to 60 seconds) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Video Duration</span>
          </label>
          <div className="flex items-center gap-1 font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
            <span>{duration}s</span>
            <span className="text-[10px] text-slate-400">({String(Math.floor(duration / 60)).padStart(2, '0')}:{String(duration % 60).padStart(2, '0')})</span>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="8"
            max="60"
            step="1"
            value={duration}
            onChange={(e) => onDurationChange(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          {/* Quick Duration Chips */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-500 font-mono">Min: 8s</span>
            <div className="flex items-center gap-1.5">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onDurationChange(preset)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                    duration === preset
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset}s
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Max: 60s</span>
          </div>
        </div>

        {/* Aspect Ratio & FPS */}
        <div className="pt-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 mr-1 text-[11px]">Format:</span>
            {(['16:9', '9:16', '1:1', '4:3', '21:9'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => onAspectRatioChange(ratio)}
                className={`px-2 py-1 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                  aspectRatio === ratio
                    ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 mr-1 text-[11px]">Rate:</span>
            {[30, 60].map((rateVal) => (
              <button
                key={rateVal}
                type="button"
                onClick={() => onFpsChange(rateVal as 30 | 60)}
                className={`px-2 py-1 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                  fps === rateVal
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {rateVal} FPS
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Fluid Motion Controls & Camera Motion */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-pink-400" />
            <span>Camera & Motion Dynamics</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Intensity:</span>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={motionIntensity}
              onChange={(e) => onMotionIntensityChange(parseFloat(e.target.value))}
              className="w-16 accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-xs text-pink-400 font-bold">{motionIntensity}x</span>
          </div>
        </div>

        {/* Camera Motion Grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {CAMERA_MOTIONS.map((cam) => {
            const isSelected = cameraMotion === cam.id;
            return (
              <button
                key={cam.id}
                type="button"
                onClick={() => onCameraMotionChange(cam.id)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/40 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                }`}
                title={cam.desc}
              >
                <div className="flex items-center justify-between text-xs">
                  <span>{cam.icon}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </div>
                <div className="text-[11px] font-semibold truncate mt-1">{cam.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
