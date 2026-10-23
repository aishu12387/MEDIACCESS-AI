import React from 'react';
import { UserRole } from '../../types';
import { soundService } from '../../services/soundService';
import {
  Heart,
  User,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Accessibility,
  CheckCircle2,
  Lock,
  Volume2,
} from 'lucide-react';

interface WelcomeRoleScreenProps {
  onSelectRole: (role: UserRole) => void;
  onDemoPatient: () => void;
  onDemoDoctor: () => void;
}

export const WelcomeRoleScreen: React.FC<WelcomeRoleScreenProps> = ({
  onSelectRole,
  onDemoPatient,
  onDemoDoctor,
}) => {
  const handleRoleSelect = (role: UserRole) => {
    soundService.playSuccess();
    soundService.announce(
      role === 'PATIENT' ? 'Continuing as Patient' : 'Continuing as Doctor'
    );
    onSelectRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/70 via-white to-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Banner with Screen-Reader Semantics */}
      <div className="max-w-4xl mx-auto w-full pt-4 sm:pt-8 text-center space-y-4">
        {/* MediAccess Logo Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-teal-100/80 border border-teal-200 rounded-full shadow-xs">
          <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white">
            <Heart className="w-3.5 h-3.5 fill-white/20 stroke-white" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-teal-900 tracking-wide">
            MediAccess AI Telemedicine Platform
          </span>
        </div>

        {/* Brand Title & Tagline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-display">
          MediAccess <span className="text-teal-600">AI</span>
        </h1>

        <p className="text-lg sm:text-2xl font-bold text-teal-800 tracking-tight">
          "Healthcare Without Communication Barriers."
        </p>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Welcome to MediAccess AI. An AI-powered, voice-first telemedicine platform designed to empower patients of all abilities to consult doctors independently.
        </p>
      </div>

      {/* Main Two Large Role Selection Cards */}
      <main className="max-w-4xl mx-auto w-full my-8">
        <h2 className="text-center text-xl sm:text-2xl font-black text-slate-900 mb-6">
          How would you like to continue?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1: Continue as Patient */}
          <button
            onClick={() => handleRoleSelect('PATIENT')}
            className="group relative bg-white hover:bg-teal-50/40 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-teal-500 shadow-xl hover:shadow-2xl transition-all text-left flex flex-col justify-between focus:outline-hidden focus:ring-4 focus:ring-teal-500"
            aria-label="Continue as Patient. Accessible healthcare for all abilities with voice assistance and personalized modes."
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform">
                <User className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 font-mono">
                  Accessible Care
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-teal-900 mt-1">
                  Continue as Patient
                </h3>
                <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
                  Voice-first doctor search, appointment booking, real-time live captions, sign language recognition, and voice prescription reader.
                </p>
              </div>

              {/* Supported Accessibility Badges */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {['Normal', 'Visually Impaired', 'Hearing Impaired', 'Speech Impaired'].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg group-hover:bg-teal-100/70 group-hover:text-teal-800 transition-colors"
                    >
                      {badge}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-teal-700 font-bold text-base group-hover:translate-x-1 transition-transform">
              <span>Patient Portal Login / Register</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Card 2: Continue as Doctor */}
          <button
            onClick={() => handleRoleSelect('DOCTOR')}
            className="group relative bg-white hover:bg-sky-50/40 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-sky-500 shadow-xl hover:shadow-2xl transition-all text-left flex flex-col justify-between focus:outline-hidden focus:ring-4 focus:ring-sky-500"
            aria-label="Continue as Doctor. Professional medical portal for consultations, patient records, and digital prescriptions."
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/30 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 font-mono">
                  Verified Healthcare Providers
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-sky-900 mt-1">
                  Continue as Doctor
                </h3>
                <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
                  Professional tele-consultation suite with live patient transcription, accessible communication board, digital PDF prescription generation, and appointment queue.
                </p>
              </div>

              {/* Provider Features Badges */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {['Verified Licensure', 'Video Consultations', 'E-Prescriptions PDF', 'Queue Management'].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg group-hover:bg-sky-100/70 group-hover:text-sky-800 transition-colors"
                    >
                      {badge}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-sky-700 font-bold text-base group-hover:translate-x-1 transition-transform">
              <span>Doctor Portal Login / Register</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Instant Demo Testing Shortcuts */}
        <div className="mt-8 p-5 bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-teal-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Instant Interactive Evaluation & Demo
              </h4>
              <p className="text-xs text-slate-600">
                One-click test sign-in with pre-configured patient accessibility preferences or doctor consultation schedule.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={onDemoPatient}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm focus:outline-hidden focus:ring-4 focus:ring-teal-400"
            >
              Demo as Patient
            </button>
            <button
              onClick={onDemoDoctor}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm focus:outline-hidden focus:ring-4 focus:ring-slate-500"
            >
              Demo as Doctor
            </button>
          </div>
        </div>
      </main>

      {/* Accessible Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-4 pb-2 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          HIPAA & Accessibility Standards Compliant
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <Lock className="w-4 h-4 text-teal-600" />
          Secure Firebase Authentication & Firestore RBAC
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <Volume2 className="w-4 h-4 text-teal-600" />
          Voice-First Navigation Enabled
        </span>
      </footer>
    </div>
  );
};
