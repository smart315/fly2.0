import React, { useState, useEffect, useRef } from 'react';
import { Fly2Header } from './components/Fly2Header';
import { Fly2CoreCanvas } from './components/Fly2CoreCanvas';
import { Fly2Chat } from './components/Fly2Chat';
import { Fly2Diagnostics } from './components/Fly2Diagnostics';
import {
  AssistantMode,
  CoreVisualMode,
  Message,
  TelemetryData,
} from './types';
import fly2ArtImage from './assets/images/fly2_neural_core_1786624204713.jpg';
import { Sparkles, Cpu, Layers, Maximize2, RefreshCw } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      role: 'assistant',
      content:
        '안녕하세요! 저는 **fly2.0**입니다. 황금빛 플라즈마 코어와 전자기 신경 망상체로 이루어진 양자 AI 비서입니다. 무엇을 도와드릴까요?',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AssistantMode>('balanced');
  const [visualMode, setVisualMode] = useState<CoreVisualMode>('canvas3d');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    quantumCoherence: 99.8,
    coreFrequency: 4.8,
    synapseFlux: 12.4,
    neuralLoad: 24,
    activeNodes: 2048,
    status: 'idle',
  });

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Periodic telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        quantumCoherence: Math.min(
          100,
          Math.max(98.5, prev.quantumCoherence + (Math.random() - 0.5) * 0.2)
        ),
        synapseFlux: Math.max(
          10.0,
          Math.min(18.0, prev.synapseFlux + (Math.random() - 0.5) * 0.5)
        ),
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Send message to fly2.0
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    setTelemetry((prev) => ({ ...prev, status: 'thinking' }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode,
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        'fly2.0 코어 수신 오류: 양자 신경망 데이터를 재구성하는 중입니다.';

      const assistantMsg: Message = {
        id: `fly2_${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setTelemetry((prev) => ({ ...prev, status: 'idle' }));

      // Auto TTS if enabled
      if (ttsEnabled) {
        handlePlayAudio(replyText, assistantMsg.id);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content:
          'fly2.0 신경망 서버와의 연결에 문제가 발생했습니다. 백엔드 서비스 상태를 확인해주세요.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setTelemetry((prev) => ({ ...prev, status: 'idle' }));
    } finally {
      setIsLoading(false);
    }
  };

  // Play audio TTS
  const handlePlayAudio = async (text: string, msgId: string) => {
    if (playingMsgId === msgId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingMsgId(null);
      setTelemetry((prev) => ({ ...prev, status: 'idle' }));
      return;
    }

    setPlayingMsgId(msgId);
    setTelemetry((prev) => ({ ...prev, status: 'speaking' }));

    // Try server-side TTS first
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (data.audio) {
        const audioSrc = `data:audio/wav;base64,${data.audio}`;
        const audio = new Audio(audioSrc);
        currentAudioRef.current = audio;

        audio.onended = () => {
          setPlayingMsgId(null);
          setTelemetry((prev) => ({ ...prev, status: 'idle' }));
        };

        audio.onerror = () => {
          fallbackBrowserTTS(text, msgId);
        };

        audio.play().catch(() => {
          fallbackBrowserTTS(text, msgId);
        });
        return;
      }
    } catch (e) {
      console.warn('Server TTS unavailable, using browser synthesis:', e);
    }

    // Fallback Web Speech Synthesis
    fallbackBrowserTTS(text, msgId);
  };

  const fallbackBrowserTTS = (text: string, msgId: string) => {
    if (!window.speechSynthesis) {
      setPlayingMsgId(null);
      setTelemetry((prev) => ({ ...prev, status: 'idle' }));
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[`*#_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.05;

    utterance.onend = () => {
      setPlayingMsgId(null);
      setTelemetry((prev) => ({ ...prev, status: 'idle' }));
    };

    utterance.onerror = () => {
      setPlayingMsgId(null);
      setTelemetry((prev) => ({ ...prev, status: 'idle' }));
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleResetChat = () => {
    if (currentAudioRef.current) currentAudioRef.current.pause();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setPlayingMsgId(null);
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        content:
          'fly2.0 신경망 세션이 초기화되었습니다. 새로운 질문이나 작업을 시작해보세요!',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    setTelemetry((prev) => ({ ...prev, status: 'idle' }));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none selection:bg-cyan-500/30">
      {/* HUD Header */}
      <Fly2Header
        telemetry={telemetry}
        mode={mode}
        setMode={setMode}
        visualMode={visualMode}
        setVisualMode={setVisualMode}
        ttsEnabled={ttsEnabled}
        setTtsEnabled={setTtsEnabled}
        onResetChat={handleResetChat}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-3 gap-3 relative z-10">
        {/* Left/Top: fly2.0 Visual Entity Display */}
        <div className="w-full md:w-1/2 lg:w-[48%] h-64 md:h-full relative rounded-2xl border border-cyan-900/40 bg-slate-900/80 overflow-hidden shadow-2xl flex flex-col">
          {/* Visual Entity Frame Header */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-950/80 border border-cyan-800/50 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-mono text-cyan-300 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>fly2.0 CORE ENTITY</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 capitalize">{visualMode}</span>
          </div>

          {/* Render Area */}
          <div className="relative flex-1 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
            {/* 3D Canvas Matrix Mode */}
            {(visualMode === 'canvas3d' || visualMode === 'hybrid') && (
              <div className="absolute inset-0 z-10">
                <Fly2CoreCanvas status={telemetry.status} />
              </div>
            )}

            {/* AI Art Asset Mode */}
            {(visualMode === 'artImage' || visualMode === 'hybrid') && (
              <div
                className={`relative w-full h-full flex items-center justify-center ${
                  visualMode === 'hybrid' ? 'opacity-40 mix-blend-screen z-0' : 'z-10'
                }`}
              >
                <img
                  src={fly2ArtImage}
                  alt="fly2.0 Quantum Core Entity"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter brightness-110 contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
              </div>
            )}
          </div>

          {/* Visual Overlay Telemetry Badges */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <div className="bg-slate-950/80 border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 backdrop-blur-sm">
              <span className="text-slate-500">STATUS: </span>
              <span className="text-amber-300 uppercase font-bold">
                {telemetry.status}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-cyan-300 backdrop-blur-sm">
              <span>DRAG TO ROTATE CORE MATRIX</span>
            </div>
          </div>
        </div>

        {/* Right/Bottom: fly2.0 Chat & Interaction Console */}
        <div className="w-full md:w-1/2 lg:w-[52%] flex-1 h-full flex flex-col min-h-0">
          <Fly2Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onPlayAudio={handlePlayAudio}
            playingMsgId={playingMsgId}
            status={telemetry.status}
          />
        </div>
      </main>

      {/* Diagnostics Modal */}
      <Fly2Diagnostics
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        telemetry={telemetry}
      />
    </div>
  );
}
