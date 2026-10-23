import React, { useState, useEffect } from 'react';
import { voiceService } from '../../services/voiceAssistant';
import { soundService } from '../../services/soundService';
import {
  Mic,
  MicOff,
  Volume2,
  Send,
  Sparkles,
  Check,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface VoiceAssistantBarProps {
  onTriggerEmergency?: () => void;
}

export const VoiceAssistantBar: React.FC<VoiceAssistantBarProps> = ({ onTriggerEmergency }) => {
  const [voiceState, setVoiceState] = useState<{
    isListening: boolean;
    transcript: string;
    isProcessing: boolean;
    responseMessage: string;
    confirmationDialog?: {
      message: string;
      action: () => void;
      cancelAction?: () => void;
    } | null;
  }>({
    isListening: false,
    transcript: '',
    isProcessing: false,
    responseMessage: '',
    confirmationDialog: null,
  });

  const [textCommand, setTextCommand] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = voiceService.subscribe((state) => {
      setVoiceState(state);
      if (state.confirmationDialog || state.responseMessage || state.isListening) {
        setIsExpanded(true);
      }
    });
    return unsubscribe;
  }, []);

  const handleToggleListening = () => {
    if (voiceState.isListening) {
      voiceService.stopListening();
    } else {
      voiceService.startListening();
      setIsExpanded(true);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textCommand.trim()) return;
    const cmd = textCommand.trim();
    setTextCommand('');
    voiceService.processCommand(cmd);
    setIsExpanded(true);
  };

  const handleQuickCommand = (cmd: string) => {
    voiceService.processCommand(cmd);
    setIsExpanded(true);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none"
      role="region"
      aria-label="Global Voice Assistant"
    >
      <div className="max-w-3xl mx-auto pointer-events-auto">
        {/* Floating Voice Card Container */}
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-700 transition-all">
          
          {/* Pending Voice Confirmation Banner (e.g. "Dr. Sharma is available tomorrow at 5 PM. Should I book the appointment?") */}
          {voiceState.confirmationDialog && (
            <div
              className="mb-4 p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-100 flex flex-col sm:flex-row items-center justify-between gap-3 animate-bounce-subtle"
              role="alertdialog"
              aria-live="assertive"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                    Voice Confirmation Required
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {voiceState.confirmationDialog.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => voiceService.handleConfirmationResponse(true)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/30 transition-all focus:outline-hidden focus:ring-4 focus:ring-emerald-400"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Yes, Confirm</span>
                </button>
                <button
                  onClick={() => voiceService.handleConfirmationResponse(false)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 border border-slate-600 transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Transcript / Feedback Section */}
          {(voiceState.transcript || voiceState.responseMessage || voiceState.isListening || voiceState.isProcessing) && (
            <div className="mb-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  {voiceState.isListening && (
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                      Listening to your voice... Speak now
                    </div>
                  )}
                  {voiceState.isProcessing && (
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      Understanding command with Gemini AI...
                    </div>
                  )}
                  {voiceState.transcript && (
                    <p className="text-sm font-medium text-slate-200">
                      <span className="text-xs text-slate-400 mr-1.5 font-bold">You said:</span>
                      "{voiceState.transcript}"
                    </p>
                  )}
                  {voiceState.responseMessage && (
                    <p className="text-sm font-semibold text-teal-300 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 shrink-0 text-teal-400" />
                      {voiceState.responseMessage}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => soundService.speak(voiceState.responseMessage || voiceState.transcript)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Repeat voice response"
                  aria-label="Repeat speech output"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Core Voice Controls Row */}
          <div className="flex items-center gap-3">
            {/* Primary Large Microphone Button */}
            <button
              onClick={handleToggleListening}
              className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all transform active:scale-95 shrink-0 focus:outline-hidden focus:ring-4 focus:ring-teal-400 ${
                voiceState.isListening
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 scale-105 animate-pulse'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/40'
              }`}
              aria-label={
                voiceState.isListening
                  ? 'Stop listening to voice commands'
                  : 'Start Global Voice Assistant. Tap to speak.'
              }
              title={voiceState.isListening ? 'Stop listening' : 'Speak to MediAccess AI'}
            >
              {voiceState.isListening ? (
                <>
                  <span className="absolute -inset-1 rounded-2xl bg-rose-500 opacity-30 animate-ping" />
                  <MicOff className="w-7 h-7 sm:w-8 sm:h-8 z-10" />
                </>
              ) : (
                <Mic className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              )}
            </button>

            {/* Natural Language Input Bar (Text or Voice) */}
            <form onSubmit={handleTextSubmit} className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={textCommand}
                  onChange={(e) => setTextCommand(e.target.value)}
                  placeholder={
                    voiceState.isListening
                      ? 'Listening to you speak...'
                      : 'Speak or type: "Find a cardiologist", "Book Dr. Sharma tomorrow at 5 PM"...'
                  }
                  className="w-full h-12 sm:h-14 pl-4 pr-10 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm sm:text-base focus:outline-hidden focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50"
                  aria-label="Enter medical voice command or query"
                />
                {textCommand && (
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-colors"
                    aria-label="Send command"
                  >
                    <Send className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </form>

            {/* Quick Suggestions toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-3 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800 transition-colors"
              title="Toggle voice command suggestions"
              aria-label="Toggle voice suggestions"
            >
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Quick Voice Suggestions Chips (Expandable) */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Try saying:
              </span>
              {[
                { label: '🩺 Find a cardiologist', cmd: 'Find a cardiologist' },
                { label: '💰 Doctors under ₹500', cmd: 'Show doctors under 500 rupees' },
                { label: '📅 Book Dr. Sharma tomorrow 5 PM', cmd: 'Book Dr. Sharma tomorrow at 5 PM' },
                { label: '⏰ My next appointment?', cmd: 'When is my next appointment?' },
                { label: '💊 Read my prescription', cmd: 'Read my prescription' },
                { label: '📹 Start consultation', cmd: 'Start my consultation' },
                { label: '🚨 Emergency help', cmd: 'I need emergency help' },
                { label: '👁️ Visually Impaired mode', cmd: 'Change my accessibility mode to visually impaired' },
              ].map((chip) => (
                <button
                  key={chip.cmd}
                  onClick={() => handleQuickCommand(chip.cmd)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-teal-900/60 hover:text-teal-300 text-slate-300 text-xs font-medium border border-slate-700/60 hover:border-teal-500/40 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
