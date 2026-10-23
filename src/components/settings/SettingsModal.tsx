import React, { useState } from 'react';
import { User, AccessibilityMode, TextSize, CaptionSize } from '../../types';
import { dataStore } from '../../services/dataStore';
import { soundService } from '../../services/soundService';
import {
  Sliders,
  X,
  Eye,
  Ear,
  Mic,
  Sparkles,
  UserCheck,
  Type,
  Contrast,
  Volume2,
  Check,
  Languages,
} from 'lucide-react';

interface SettingsModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  onClose,
  onUpdateUser,
}) => {
  const [mode, setMode] = useState<AccessibilityMode>(user.accessibilitySettings.mode);
  const [textSize, setTextSize] = useState<TextSize>(user.accessibilitySettings.textSize);
  const [highContrast, setHighContrast] = useState<boolean>(user.accessibilitySettings.highContrast);
  const [spokenFeedback, setSpokenFeedback] = useState<boolean>(user.accessibilitySettings.spokenFeedback);
  const [captionSize, setCaptionSize] = useState<CaptionSize>(user.accessibilitySettings.captionSize);
  const [language, setLanguage] = useState(user.accessibilitySettings.language);

  const handleSave = () => {
    const updated = dataStore.updateUserAccessibility({
      mode,
      textSize,
      highContrast,
      spokenFeedback,
      captionSize,
      language,
    });
    soundService.playSuccess();
    soundService.announce('Accessibility settings updated successfully.');
    if (updated) onUpdateUser(updated);
    onClose();
  };

  const modeOptions: { id: AccessibilityMode; label: string; icon: any }[] = [
    { id: 'normal', label: 'Standard Mode', icon: UserCheck },
    { id: 'visually_impaired', label: 'Visually Impaired', icon: Eye },
    { id: 'hearing_impaired', label: 'Hearing Impaired', icon: Ear },
    { id: 'speech_impaired', label: 'Speech Impaired', icon: Mic },
    { id: 'deaf_speech_impaired', label: 'Deaf + Speech', icon: Sparkles },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-title" className="text-xl font-black text-slate-900">
                Accessibility Preferences
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Adjust display, voice narration, and communication modes
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accessibility Profile Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Active Accessibility Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {modeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = mode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setMode(opt.id)}
                  className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-teal-50 border-teal-600 shadow-xs ring-2 ring-teal-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isSelected ? 'text-teal-600' : 'text-slate-500'
                    }`}
                  />
                  <span className="text-xs font-extrabold text-slate-900">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Size */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Typography Scaling
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'large', 'xlarge'] as TextSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setTextSize(size)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                  textSize === size
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-900 block">High Contrast Visual Theme</span>
            <span className="text-[11px] text-slate-500">
              Enhanced contrast borders and highlights for low-vision users
            </span>
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              highContrast
                ? 'bg-amber-400 text-slate-950 font-black'
                : 'bg-white border border-slate-300 text-slate-700'
            }`}
          >
            {highContrast ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Live Caption Size for Consultations */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Consultation Caption Size (Hearing Impaired)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'large', 'huge'] as CaptionSize[]).map((cSize) => (
              <button
                key={cSize}
                type="button"
                onClick={() => setCaptionSize(cSize)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                  captionSize === cSize
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {cSize}
              </button>
            ))}
          </div>
        </div>

        {/* Spoken Feedback Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Voice Screen Feedback (TTS)</span>
            <span className="text-[11px] text-slate-500">
              Speaks confirmation messages and screen state changes aloud
            </span>
          </div>
          <button
            onClick={() => setSpokenFeedback(!spokenFeedback)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              spokenFeedback
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700'
            }`}
          >
            {spokenFeedback ? 'Active' : 'Muted'}
          </button>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-600/30"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
