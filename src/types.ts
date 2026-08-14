export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  voiceText?: string;
  timestamp: string;
  isAudioPlaying?: boolean;
}

export type AssistantMode = 'balanced' | 'precise' | 'creative' | 'coder';

export type CoreVisualMode = 'canvas3d' | 'artImage' | 'hybrid' | 'minimal';

export interface TelemetryData {
  quantumCoherence: number; // e.g. 99.8%
  coreFrequency: number; // e.g. 4.8 GHz
  synapseFlux: number; // e.g. 12.4 TFlops
  neuralLoad: number; // e.g. 24%
  activeNodes: number; // e.g. 2048
  status: 'idle' | 'thinking' | 'speaking' | 'listening';
}

export interface PresetPrompt {
  id: string;
  title: string;
  category: string;
  iconName: string;
  prompt: string;
}
