import React from 'react';
import { X, Cpu, Shield, Zap, Activity, HardDrive, Terminal } from 'lucide-react';
import { TelemetryData } from '../types';

interface Fly2DiagnosticsProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData;
}

export const Fly2Diagnostics: React.FC<Fly2DiagnosticsProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-800/60 rounded-2xl p-6 text-slate-100 shadow-2xl shadow-cyan-950">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base bg-gradient-to-r from-amber-300 to-cyan-300 bg-clip-text text-transparent">
              fly2.0 System Diagnostics & Core Matrix
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-xs font-mono">
          {/* Core Telemetry */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500">QUANTUM COHERENCE</span>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">
                {telemetry.quantumCoherence.toFixed(2)}%
              </div>
            </div>
            <div>
              <span className="text-slate-500">SYNAPSE FLUX RATE</span>
              <div className="text-sm font-bold text-amber-300 mt-0.5">
                {telemetry.synapseFlux.toFixed(2)} TFlops
              </div>
            </div>
            <div>
              <span className="text-slate-500">CORE FREQUENCY</span>
              <div className="text-sm font-bold text-blue-300 mt-0.5">
                {telemetry.coreFrequency} GHz
              </div>
            </div>
            <div>
              <span className="text-slate-500">ACTIVE NEURAL NODES</span>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">
                {telemetry.activeNodes}
              </div>
            </div>
          </div>

          {/* Core Specs */}
          <div className="space-y-2">
            <h4 className="text-slate-400 font-sans font-semibold text-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Core Architecture Specifications
            </h4>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Entity Identifier:</span>
                <span className="text-amber-300 font-bold">fly2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AI Backbone Engine:</span>
                <span>Gemini 3.6 Flash (@google/genai)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Voice Synthesis Engine:</span>
                <span>Gemini 3.1 Flash TTS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Visual Renderer:</span>
                <span>3D Quantum Plasma Canvas & AI Art</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">API Execution Protocol:</span>
                <span className="text-emerald-400">Server-Side Proxy (Secure)</span>
              </div>
            </div>
          </div>

          {/* Console Output Mock */}
          <div className="p-3 bg-black rounded-xl border border-cyan-900/40 text-[10px] text-cyan-400 leading-relaxed font-mono">
            <div className="flex items-center gap-1.5 text-slate-500 border-b border-slate-800 pb-1 mb-1">
              <Terminal className="w-3 h-3" />
              <span>fly2.0 Neural Matrix Telemetry Log</span>
            </div>
            <p>[SYSTEM] Core initialization complete.</p>
            <p>[STATUS] Visual matrix aligned to golden-amber & electric-cyan plasma.</p>
            <p>[NETWORK] Server API endpoint /api/chat pinged: 200 OK.</p>
            <p>[SYNAPSE] Ready for user interaction.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-cyan-500 text-slate-950 text-xs font-bold rounded-xl hover:opacity-90 transition"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
