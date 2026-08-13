import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  Sparkles,
  Bot,
  User,
  Square,
  RefreshCw,
} from 'lucide-react';
import { Message, PresetPrompt } from '../types';
import { presetPrompts } from '../data/presetPrompts';

interface Fly2ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onPlayAudio: (text: string, msgId: string) => void;
  playingMsgId: string | null;
  status: 'idle' | 'thinking' | 'speaking' | 'listening';
}

export const Fly2Chat: React.FC<Fly2ChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onPlayAudio,
  playingMsgId,
  status,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Speech Recognition setup
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR'; // Default Korean, auto handles English too
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950/70 rounded-2xl border border-cyan-900/30 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 my-auto">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-amber-300 shadow-xl shadow-cyan-950/50">
                <Sparkles className="w-8 h-8 animate-pulse text-amber-400" />
              </div>
            </div>

            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-bold text-slate-100">
                Greetings, I am <span className="bg-gradient-to-r from-amber-300 to-cyan-300 bg-clip-text text-transparent font-extrabold">fly2.0</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your quantum neural AI assistant. Connected to dynamic neural matrix core. Ask me anything, generate ideas, analyze code, or speak directly to me.
              </p>
            </div>

            {/* Quick Preset Prompts */}
            <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
              {presetPrompts.map((preset: PresetPrompt) => (
                <button
                  key={preset.id}
                  onClick={() => onSendMessage(preset.prompt)}
                  className="group p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition flex items-start gap-3 text-xs"
                >
                  <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 group-hover:text-amber-300 group-hover:border-amber-500/40 transition">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                      {preset.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {preset.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg: Message) => {
            const isUser = msg.role === 'user';
            const isPlaying = playingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-cyan-500/50 flex-shrink-0 flex items-center justify-center text-amber-300 text-xs font-bold shadow-md shadow-cyan-950">
                    fly
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-br from-cyan-900/70 to-blue-950/80 border border-cyan-500/40 text-slate-100 rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-lg rounded-tl-none'
                  }`}
                >
                  <div className="markdown-body">
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => onPlayAudio(msg.content, msg.id)}
                          className={`p-1 rounded hover:bg-slate-800 transition ${
                            isPlaying ? 'text-amber-400 animate-pulse' : 'text-slate-400 hover:text-cyan-300'
                          }`}
                          title="Listen with fly2.0 Voice"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
                          title="Copy to clipboard"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-slate-300 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-cyan-500/50 flex items-center justify-center text-amber-300 text-xs font-bold animate-pulse">
              fly
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-900/90 border border-cyan-900/40 text-xs text-cyan-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>fly2.0 is synthesizing quantum response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800">
        <form onSubmit={handleFormSubmit} className="flex items-end gap-2">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl border transition flex-shrink-0 ${
              isListening
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-cyan-300 hover:border-cyan-800'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak to fly2.0'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Area */}
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Listening to your voice...'
                  : 'Ask fly2.0 anything... (Shift+Enter for newline)'
              }
              rows={1}
              className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 text-xs sm:text-sm resize-none max-h-32"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 text-slate-950 font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition flex-shrink-0 shadow-lg shadow-cyan-950/50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
