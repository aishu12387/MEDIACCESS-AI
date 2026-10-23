import React, { useState } from 'react';
import { User, AccessibilityMode, TextSize, CaptionSize, AccessibilitySettings } from '../../types';
import { dataStore } from '../../services/dataStore';
import { soundService } from '../../services/soundService';
import {
  Heart,
  Eye,
  Ear,
  Mic,
  Sparkles,
  UserCheck,
  Check,
  ArrowRight,
  Sliders,
  Volume2,
  Contrast,
  Languages,
} from 'lucide-react';

interface AccessibilityOnboardingProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

export const AccessibilityOnboarding: React.FC<AccessibilityOnboardingProps> = ({
  user,
  onComplete,
}) => {
  const [selectedMode, setSelectedMode] = useState<AccessibilityMode>(
    user.accessibilitySettings.mode || 'visually_impaired'
  );
  const [textSize, setTextSize] = useState<TextSize>(
    user.accessibilitySettings.textSize || 'large'
  );
  const [highContrast, setHighContrast] = useState<boolean>(
    user.accessibilitySettings.highContrast || false
  );
  const [spokenFeedback, setSpokenFeedback] = useState<boolean>(
    user.accessibilitySettings.spokenFeedback ?? true
  );
  const [captionSize, setCaptionSize] = useState<CaptionSize>(
    user.accessibilitySettings.captionSize || 'large'
  );
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Spanish'>(
    user.accessibilitySettings.language || 'English'
  );
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>(
    user.accessibilitySettings.voiceGender || 'female'
  );

  const modeOptions: {
    id: AccessibilityMode;
    title: string;
    description: string;
    icon: any;
    features: string[];
    recommendedTextSize: TextSize;
    recommendedHighContrast: boolean;
  }[] = [
    {
      id: 'normal',
      title: '1. Standard / Normal Mode',
      description: 'Standard medical dashboard with full visual layout and optional voice commands.',
      icon: UserCheck,
      features: ['Standard layout', 'Optional voice input', 'Full visual controls'],
      recommendedTextSize: 'normal',
      recommendedHighContrast: false,
    },
    {
      id: 'visually_impaired',
      title: '2. Visually Impaired',
      description: 'Optimized for low-vision and blind patients. Voice-first command execution, spoken screen feedback, large typography.',
      icon: Eye,
      features: ['Primary Voice Assistant', 'Auto TTS Screen Reader', 'High-Contrast & Scaled Fonts', 'Audible Confirmations'],
      recommendedTextSize: 'large',
      recommendedHighContrast: true,
    },
    {
      id: 'hearing_impaired',
      title: '3. Hearing Impaired',
      description: 'Optimized for deaf and hard-of-hearing patients. Live real-time speech transcription during consultations and visual indicators.',
      icon: Ear,
      features: ['Real-time doctor speech transcription', 'Scalable consultation captions', 'Visual audio pulse rings', 'Sign language support'],
      recommendedTextSize: 'normal',
      recommendedHighContrast: false,
    },
    {
      id: 'speech_impaired',
      title: '4. Speech Impaired',
      description: 'For patients unable to speak verbally. AAC medical communication board, quick symptom phrases, and sign-to-speech engine.',
      icon: Mic,
      features: ['Interactive AAC communication board', 'Doctor Text-to-Speech playback', 'Pre-configured medical phrases', 'Sign language to text'],
      recommendedTextSize: 'normal',
      recommendedHighContrast: false,
    },
    {
      id: 'deaf_speech_impaired',
      title: '5. Hearing + Speech Impaired',
      description: 'Complete dual accessibility: camera sign-language recognition to text + live doctor speech transcription + AAC board.',
      icon: Sparkles,
      features: ['Sign language gesture recognition', 'Live two-way real-time transcription', 'AAC communication board', 'Full visual haptics'],
      recommendedTextSize: 'large',
      recommendedHighContrast: true,
    },
  ];

  const handleModeChange = (modeId: AccessibilityMode) => {
    setSelectedMode(modeId);
    const chosen = modeOptions.find((m) => m.id === modeId);
    if (chosen) {
      setTextSize(chosen.recommendedTextSize);
      if (chosen.recommendedHighContrast) setHighContrast(true);
      soundService.playSuccess();
      soundService.speak(`Selected ${chosen.title}. ${chosen.description}`);
    }
  };

  const handleFinish = () => {
    const newSettings: AccessibilitySettings = {
      mode: selectedMode,
      textSize,
      highContrast,
      voiceGender,
      speechRate: 1.0,
      spokenFeedback,
      captionSize,
      language,
      hapticAudioFeedback: true,
    };

    const updatedUser: User = {
      ...user,
      accessibilitySettings: newSettings,
    };

    dataStore.setCurrentUser(updatedUser);
    soundService.playSuccess();
    soundService.announce('Accessibility preferences configured successfully. Entering Patient Dashboard.');
    onComplete(updatedUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Question */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-600/30">
            <Heart className="w-8 h-8 fill-white/20 stroke-white" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/80 px-3 py-1 rounded-full border border-teal-200">
            First-Time Accessible Onboarding
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            "How can we make your healthcare experience more accessible?"
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            Choose your accessibility profile. MediAccess AI will customize doctor search, tele-consultation rooms, prescriptions, and navigation to your unique needs.
          </p>
        </div>

        {/* 5 Selectable Profile Cards */}
        <div className="space-y-4 mb-8">
          {modeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleModeChange(opt.id)}
                className={`w-full p-5 sm:p-6 rounded-3xl border-2 text-left transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 focus:outline-hidden focus:ring-4 focus:ring-teal-400 ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-600 shadow-xl ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      {opt.title}
                      {isSelected && (
                        <span className="text-xs font-bold px-2 py-0.5 bg-teal-600 text-white rounded-full">
                          Selected
                        </span>
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {opt.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {opt.features.map((feat) => (
                        <span
                          key={feat}
                          className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs"
                        >
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-5 h-5 stroke-[3]" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Additional Accessibility Controls (Language, Text Size, Voice, High Contrast) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6 mb-8">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-extrabold text-slate-900">
              Customize Voice, Display & Captions (Optional)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Text Size */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Text Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'large', 'xlarge'] as TextSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setTextSize(size)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      textSize === size
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Spanish">Spanish (Español)</option>
              </select>
            </div>

            {/* High Contrast */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                High Contrast Theme
              </label>
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  highContrast
                    ? 'bg-amber-400 text-slate-950 border-amber-500 font-black'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Contrast className="w-4 h-4" />
                <span>{highContrast ? 'High Contrast ON' : 'Standard Contrast'}</span>
              </button>
            </div>

            {/* Caption Size */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Live Caption Size
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
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cSize}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Preference */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Assistant Voice
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['female', 'male'] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => {
                      setVoiceGender(gender);
                      soundService.speak(
                        `Hello! I will be your ${gender} voice assistant.`,
                        { gender }
                      );
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      voiceGender === gender
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {gender} Voice
                  </button>
                ))}
              </div>
            </div>

            {/* Spoken Feedback */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Spoken Screen Feedback
              </label>
              <button
                type="button"
                onClick={() => setSpokenFeedback(!spokenFeedback)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  spokenFeedback
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{spokenFeedback ? 'Voice Feedback Enabled' : 'Muted'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            💡 You can change your accessibility settings anytime by saying: "Change my accessibility mode".
          </p>

          <button
            onClick={handleFinish}
            className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-base rounded-2xl shadow-xl shadow-teal-600/30 transition-all flex items-center justify-center gap-3 focus:outline-hidden focus:ring-4 focus:ring-teal-400"
          >
            <span>Save & Go to Patient Home</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
