import React from 'react';
import {
  Activity,
  Cpu,
  Radio,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AssistantMode, CoreVisualMode, TelemetryData } from '../types';

interface Fly2HeaderProps {
  telemetry: TelemetryData;
  mode: AssistantMode;
  setMode: (mode: AssistantMode) => void;
  visualMode: CoreVisualMode;
  setVisualMode: (mode: CoreVisualMode) => void;
  ttsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => void;
  onResetChat: () => void;
  onOpenDiagnostics: () => void;
}

export const Fly2Header: React.FC<Fly2HeaderProps> = ({
  telemetry,
  mode,
  setMode,
  visualMode,
  setVisualMode,
  ttsEnabled,
  setTtsEnabled,
  onResetChat,
  onOpenDiagnostics,
}) => {
  const getStatusBadge = () => {
    switch (telemetry.status) {
      case 'thinking':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <Zap className="w-3.5 h-3.5 animate-spin" />
            SYNAPSE PROCESSING
          </span>
        );
      case 'speaking':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
            <Radio className="w-3.5 h-3.5 animate-ping" />
            QUANTUM EMITTING
          </span>
        );
      case 'listening':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Activity className="w-3.5 h-3.5" />
            MIC LINKED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-cyan-400 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            CORE ONLINE
          </span>
        );
    }
  };

  return (
    <header className="relative z-20 w-full bg-slate-950/80 backdrop-blur-md border-b border-cyan-900/40 px-4 py-3 text-slate-100 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-cyan-950/20">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer" onClick={onOpenDiagnostics}>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-cyan-500 to-blue-600 opacity-75 blur-sm group-hover:opacity-100 transition duration-300 animate-pulse" />
          <div className="relative w-10 h-10 rounded-full bg-slate-900 border border-cyan-400/60 flex items-center justify-center font-bold text-amber-300 text-lg shadow-inner">
            fly<span className="text-cyan-400 font-extrabold text-xs">2.0</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-amber-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              fly2.0
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-cyan-950 border border-cyan-800/60 text-cyan-300">
              v2.04 Quantum
            </span>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Autonomous Quantum Neural Assistant Core
          </p>
        </div>
      </div>

      {/* Telemetry Stats Bar (Hidden on small screens) */}
      <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-900/30 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Coherence:</span>
          <span className="text-cyan-300 font-bold">{telemetry.quantumCoherence.toFixed(1)}%</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Synapse:</span>
          <span className="text-amber-300 font-bold">{telemetry.synapseFlux.toFixed(1)} TF</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Nodes:</span>
          <span className="text-slate-200">{telemetry.activeNodes}</span>
        </div>
      </div>

      {/* Controls & Mode Selectors */}
      <div className="flex items-center gap-2">
        {/* Assistant Thinking Mode */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setMode('balanced')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              mode === 'balanced'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Balanced AI Response"
          >
            Balanced
          </button>
          <button
            onClick={() => setMode('coder')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              mode === 'coder'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Coding & Technical Master Mode"
          >
            Coder
          </button>
          <button
            onClick={() => setMode('creative')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              mode === 'creative'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Creative Visionary Mode"
          >
            Creative
          </button>
        </div>

        {/* Visual Matrix Mode Toggle */}
        <button
          onClick={() => {
            const modes: CoreVisualMode[] = ['canvas3d', 'hybrid', 'artImage'];
            const next = modes[(modes.indexOf(visualMode) + 1) % modes.length];
            setVisualMode(next);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-700/50 text-xs font-medium text-slate-300 hover:text-cyan-300 transition"
          title="Toggle Core Visual Renderer Mode"
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span className="capitalize">{visualMode}</span>
        </button>

        {/* Voice/TTS Toggle */}
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-2 rounded-lg border transition ${
            ttsEnabled
              ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-900/30'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={ttsEnabled ? 'Voice Synthesis Active' : 'Voice Synthesis Muted'}
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Reset Chat */}
        <button
          onClick={onResetChat}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-800/60 text-slate-400 hover:text-red-400 transition"
          title="Reset fly2.0 Session"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
