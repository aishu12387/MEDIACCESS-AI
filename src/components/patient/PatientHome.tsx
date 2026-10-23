import React from 'react';
import { User, Appointment, Prescription } from '../../types';
import { dataStore } from '../../services/dataStore';
import { voiceService } from '../../services/voiceAssistant';
import { soundService } from '../../services/soundService';
import {
  Mic,
  Search,
  Calendar,
  Video,
  FileText,
  AlertTriangle,
  Sliders,
  Bell,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Volume2,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

interface PatientHomeProps {
  user: User;
  onNavigate: (screen: string) => void;
  onTriggerEmergency: () => void;
}

export const PatientHome: React.FC<PatientHomeProps> = ({
  user,
  onNavigate,
  onTriggerEmergency,
}) => {
  const appointments: Appointment[] = dataStore.getAppointments(user.id, 'PATIENT');
  const upcoming = appointments.find((a) => a.status === 'confirmed');
  const latestRx: Prescription | undefined = dataStore.getLatestPrescription(user.id);

  const isVisuallyImpaired = user.accessibilitySettings.mode === 'visually_impaired';
  const isHearingImpaired = user.accessibilitySettings.mode === 'hearing_impaired';
  const isSpeechImpaired =
    user.accessibilitySettings.mode === 'speech_impaired' ||
    user.accessibilitySettings.mode === 'deaf_speech_impaired';

  const handleStartMic = () => {
    soundService.announce('Voice Assistant activated. How can I help you?');
    voiceService.startListening();
  };

  const handleReadLatestRx = () => {
    if (!latestRx) {
      soundService.speak('You do not have any saved prescriptions.');
      return;
    }
    soundService.speak(
      `Your prescription from ${latestRx.doctorName} for ${latestRx.diagnosis} contains ${latestRx.medicines.length} medicines. Medicine 1: ${latestRx.medicines[0].name}, ${latestRx.medicines[0].dosage}, ${latestRx.medicines[0].frequency} for ${latestRx.medicines[0].duration}.`
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-32">
      {/* Welcome & Accessibility Awareness Banner */}
      <section
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md relative overflow-hidden"
        aria-labelledby="welcome-heading"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold bg-teal-100 text-teal-800 rounded-full border border-teal-200">
                Patient Dashboard
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Profile: <strong className="capitalize text-slate-800">{user.accessibilitySettings.mode.replace('_', ' ')}</strong>
              </span>
            </div>

            <h1
              id="welcome-heading"
              className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight"
            >
              Good day, <span className="text-teal-600">{user.name.split(' ')[0]}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Every feature of MediAccess AI is voice-enabled. You can search doctors, schedule appointments, review digital prescriptions, or start consultations using natural speech.
            </p>
          </div>

          {/* Quick Emergency Voice Shortcut Banner */}
          <button
            onClick={onTriggerEmergency}
            className="flex items-center gap-3 px-5 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-2xl border-2 border-rose-300 font-bold text-sm shadow-xs transition-all focus:outline-hidden focus:ring-4 focus:ring-rose-400 group"
            aria-label="Urgent Emergency Medical Help. Say 'I need emergency help' or tap here."
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black uppercase text-rose-600 block">Emergency</span>
              <span className="text-sm font-extrabold text-slate-900">Need Immediate Help?</span>
            </div>
          </button>
        </div>
      </section>

      {/* Prominent Voice Assistant Hub ("How can I help you?" with Large Mic) */}
      <section
        className={`p-6 sm:p-10 rounded-3xl text-center border-2 transition-all relative overflow-hidden ${
          isVisuallyImpaired
            ? 'bg-slate-950 text-white border-amber-400 shadow-2xl'
            : 'bg-gradient-to-b from-teal-900 to-slate-900 text-white border-teal-500/30 shadow-xl'
        }`}
        aria-label="Voice-first assistant interaction center"
      >
        <div className="max-w-xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Global Voice Core Active
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            How can I help you?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Tap the microphone or say any natural command like{' '}
            <span className="text-teal-300 font-semibold">"Find a cardiologist"</span> or{' '}
            <span className="text-teal-300 font-semibold">"Book Dr. Sharma tomorrow at 5 PM"</span>.
          </p>

          {/* Large Center Microphone Button */}
          <div className="pt-4 pb-2">
            <button
              onClick={handleStartMic}
              className="group relative inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-2xl shadow-teal-500/50 hover:scale-105 active:scale-95 transition-all focus:outline-hidden focus:ring-8 focus:ring-teal-400/50"
              aria-label="Tap to speak with MediAccess AI Voice Assistant"
            >
              <span className="absolute -inset-3 rounded-full bg-teal-400/30 animate-ping pointer-events-none" />
              <Mic className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.5]" />
            </button>
            <div className="mt-3">
              <span className="text-xs font-black uppercase tracking-widest text-teal-400">
                TAP TO SPEAK
              </span>
            </div>
          </div>

          {/* Quick Voice Prompt Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {[
              'Find a cardiologist',
              'Doctors under 500 rupees',
              'When is my next appointment?',
              'Read my prescription',
              'Start my consultation',
            ].map((cmd) => (
              <button
                key={cmd}
                onClick={() => voiceService.processCommand(cmd)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-teal-800/60 text-slate-300 hover:text-teal-200 text-xs font-medium border border-slate-700/80 transition-colors"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Primary Action Tiles Grid (Find Doctor, Appointments, Consultation, Prescriptions) */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="text-xl font-black text-slate-900 mb-4">
          Quick Healthcare Portals
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Tile 1: Find Doctor */}
          <button
            onClick={() => onNavigate('doctors')}
            className="p-6 rounded-3xl bg-white hover:bg-teal-50/50 border-2 border-slate-200 hover:border-teal-500 text-left shadow-md hover:shadow-xl transition-all group flex flex-col justify-between focus:outline-hidden focus:ring-4 focus:ring-teal-400"
            aria-label="Find Doctors. Search specialists by voice or text."
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Search className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-teal-900">
                Find Doctors
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Cardiology, Dermatology, Neurology, Pediatrics with voice booking and fee filters.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
              <span>Search Specialists</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Tile 2: Appointments */}
          <button
            onClick={() => onNavigate('appointments')}
            className="p-6 rounded-3xl bg-white hover:bg-blue-50/50 border-2 border-slate-200 hover:border-blue-500 text-left shadow-md hover:shadow-xl transition-all group flex flex-col justify-between focus:outline-hidden focus:ring-4 focus:ring-blue-400"
            aria-label="Appointments. View scheduled consultations, reminders, and bookings."
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-900">
                Appointments
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                View upcoming appointments, reschedule, or simulate the 15-minute reminder.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>{appointments.length} Total Bookings</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Tile 3: Video Consultation */}
          <button
            onClick={() => onNavigate('consultation')}
            className="p-6 rounded-3xl bg-white hover:bg-emerald-50/50 border-2 border-slate-200 hover:border-emerald-500 text-left shadow-md hover:shadow-xl transition-all group flex flex-col justify-between focus:outline-hidden focus:ring-4 focus:ring-emerald-400"
            aria-label="Live Tele-Consultation. Join WebRTC consultation room with live transcription and sign language."
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Video className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-900">
                Consultation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Accessible room with real camera, doctor subtitles, sign language recognition, and AAC board.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Open Room</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Tile 4: Prescriptions */}
          <button
            onClick={() => onNavigate('prescriptions')}
            className="p-6 rounded-3xl bg-white hover:bg-purple-50/50 border-2 border-slate-200 hover:border-purple-500 text-left shadow-md hover:shadow-xl transition-all group flex flex-col justify-between focus:outline-hidden focus:ring-4 focus:ring-purple-400"
            aria-label="Digital Prescriptions. View and voice-read doctor prescriptions and download PDFs."
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-purple-900">
                Prescriptions
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Step-by-step medication voice narration with "Next medicine" controls and PDF downloads.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>View E-Prescriptions</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* Upcoming Consultation Spotlight & Latest Prescription Quick Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Appointment Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Upcoming Consultation
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Today at 5:00 PM
              </span>
            </div>

            {upcoming ? (
              <div className="flex items-start gap-4">
                <img
                  src={upcoming.doctorAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
                  alt={upcoming.doctorName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">{upcoming.doctorName}</h3>
                  <p className="text-xs font-semibold text-teal-700">{upcoming.doctorSpecialization}</p>
                  <p className="text-xs text-slate-500">{upcoming.notes}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active appointment scheduled for today.</p>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate('consultation')}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-sm focus:outline-hidden focus:ring-4 focus:ring-teal-400"
            >
              <Video className="w-4 h-4" />
              <span>Join Consultation Room</span>
            </button>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Manage Appointment
            </button>
          </div>
        </div>

        {/* Latest Prescription Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Latest Digital Prescription
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {latestRx?.date || 'Recent'}
              </span>
            </div>

            {latestRx ? (
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {latestRx.diagnosis}
                </h3>
                <p className="text-xs font-medium text-slate-600">
                  Issued by: <strong className="text-slate-800">{latestRx.doctorName}</strong> ({latestRx.doctorSpecialization})
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {latestRx.medicines.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs"
                    >
                      💊 {m.name} {m.dosage}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No prescriptions stored yet.</p>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleReadLatestRx}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-sm focus:outline-hidden focus:ring-4 focus:ring-purple-400"
              aria-label="Listen to prescription read aloud"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen Aloud (TTS)</span>
            </button>
            <button
              onClick={() => onNavigate('prescriptions')}
              className="text-xs font-bold text-purple-700 hover:text-purple-800"
            >
              View Full Rx & PDF
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
