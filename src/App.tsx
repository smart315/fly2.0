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
        '안녕하십니까, 보스. **fly2.0 (JARVIS 프로토콜)** 시스템이 온라인 상태입니다. 자막은 한국어로 표시되며, 음성은 자비스 영어 음성으로 출력됩니다. 무엇을 지원해 드릴까요, Sir?',
      voiceText:
        'Good day, sir. JARVIS protocols are fully active. All telemetry systems are nominal. How may I assist you today, sir?',
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
  const [voiceName, setVoiceName] = useState<string>('Puck'); // Default JARVIS male voice
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

  // Synchronous Text & English Voice reveal streamer
  const streamMessageAndVoice = async (
    msgId: string,
    fullKoreanText: string,
    englishVoiceText: string,
    timestamp: string
  ) => {
    // Insert initial empty message with English voice reference
    const initialMsg: Message = {
      id: msgId,
      role: 'assistant',
      content: '',
      voiceText: englishVoiceText,
      timestamp,
    };
    setMessages((prev) => [...prev, initialMsg]);

    let audioToPlay: HTMLAudioElement | null = null;
    let useFallbackTTS = false;

    // Fetch English TTS audio before starting text stream if TTS is enabled
    if (ttsEnabled) {
      setPlayingMsgId(msgId);
      setTelemetry((prev) => ({ ...prev, status: 'speaking' }));

      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: fullKoreanText,
            voiceText: englishVoiceText,
            voiceName,
          }),
        });

        const data = await res.json();
        if (data.audio) {
          const audioSrc = `data:audio/wav;base64,${data.audio}`;
          audioToPlay = new Audio(audioSrc);
          currentAudioRef.current = audioToPlay;

          audioToPlay.onended = () => {
            setPlayingMsgId(null);
            setTelemetry((prev) => ({ ...prev, status: 'idle' }));
          };
        } else {
          useFallbackTTS = true;
        }
      } catch (err) {
        console.warn('TTS request error, using fallback browser voice:', err);
        useFallbackTTS = true;
      }
    }

    // Play English Voice audio while Korean subtitles begin streaming simultaneously
    if (audioToPlay) {
      audioToPlay.play().catch(() => {
        fallbackBrowserTTS(fullKoreanText, msgId, englishVoiceText);
      });
    } else if (ttsEnabled && useFallbackTTS) {
      fallbackBrowserTTS(fullKoreanText, msgId, englishVoiceText);
    } else {
      setTelemetry((prev) => ({ ...prev, status: 'idle' }));
    }

    // Typewriter Korean Subtitles Stream (synchronized with audio output)
    const totalChars = fullKoreanText.length;
    let currentCharIndex = 0;
    const chunkSize = Math.max(1, Math.ceil(totalChars / 90));
    const intervalMs = Math.max(15, Math.min(30, Math.floor(3200 / (totalChars / chunkSize))));

    const interval = setInterval(() => {
      currentCharIndex += chunkSize;
      if (currentCharIndex >= totalChars) {
        currentCharIndex = totalChars;
        clearInterval(interval);
      }

      const revealedText = fullKoreanText.slice(0, currentCharIndex);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, content: revealedText, voiceText: englishVoiceText }
            : m
        )
      );
    }, intervalMs);
  };

  // Send message to fly2.0 (JARVIS Protocol)
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
        'Sir, fly2.0 코어 신호 재구성이 필요합니다. 요청을 다시 확인해 주시겠습니까?';
      const englishVoiceText =
        data.voiceText ||
        'Quantum core data synchronized and ready for command, sir.';

      const assistantMsgId = `fly2_${Date.now()}`;
      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Simultaneously trigger Korean subtitle stream and English JARVIS voice
      await streamMessageAndVoice(
        assistantMsgId,
        replyText,
        englishVoiceText,
        timestamp
      );
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content:
          'Sir, fly2.0 서버 네트워크 통신에 오류가 발생했습니다. 시스템 연결을 확인해 주십시오.',
        voiceText: 'Communication telemetry failure. Reconnecting now, sir.',
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

  // Play audio TTS in English JARVIS voice
  const handlePlayAudio = async (
    text: string,
    msgId: string,
    voiceText?: string
  ) => {
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

    // Try server-side TTS first with English JARVIS voice
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceText,
          voiceName,
        }),
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
          fallbackBrowserTTS(text, msgId, voiceText);
        };

        audio.play().catch(() => {
          fallbackBrowserTTS(text, msgId, voiceText);
        });
        return;
      }
    } catch (e) {
      console.warn('Server TTS unavailable, using browser synthesis:', e);
    }

    // Fallback Web Speech Synthesis
    fallbackBrowserTTS(text, msgId, voiceText);
  };

  const fallbackBrowserTTS = (
    text: string,
    msgId: string,
    voiceText?: string
  ) => {
    if (!window.speechSynthesis) {
      setPlayingMsgId(null);
      setTelemetry((prev) => ({ ...prev, status: 'idle' }));
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = (voiceText || text).replace(/[`*#_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-GB';
    utterance.rate = 1.0;
    utterance.pitch = 0.85; // Refined JARVIS tone

    // Pick British or English masculine voice
    const voices = window.speechSynthesis.getVoices();
    const britishMaleVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('british') ||
          v.name.toLowerCase().includes('uk') ||
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('george') ||
          v.name.toLowerCase().includes('oliver') ||
          v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('david'))
    );
    if (britishMaleVoice) {
      utterance.voice = britishMaleVoice;
    }

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
          'fly2.0 신경망 세션이 초기화되었습니다. 새로운 질문이나 작업을 시작해보세요, Sir!',
        voiceText:
          'Neural matrix session reset. Ready for your instructions, sir.',
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
        voiceName={voiceName}
        setVoiceName={setVoiceName}
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
            onListeningChange={(isListening) => {
              setTelemetry((prev) => ({
                ...prev,
                status: isListening ? 'listening' : 'idle',
              }));
            }}
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
