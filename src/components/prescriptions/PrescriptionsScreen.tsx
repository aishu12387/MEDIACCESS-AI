import React, { useState, useEffect } from 'react';
import { Prescription, User } from '../../types';
import { dataStore } from '../../services/dataStore';
import { soundService } from '../../services/soundService';
import { generatePrescriptionPDF } from '../../services/prescriptionPdf';
import {
  FileText,
  Volume2,
  Download,
  SkipForward,
  RotateCcw,
  Square,
  Sparkles,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  ShieldCheck,
  Play,
} from 'lucide-react';

interface PrescriptionsScreenProps {
  user: User;
  initialReadingAction?: string;
}

export const PrescriptionsScreen: React.FC<PrescriptionsScreenProps> = ({
  user,
  initialReadingAction,
}) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() =>
    dataStore.getPrescriptions(user.id)
  );
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(
    prescriptions[0] || null
  );

  // Voice Reader State
  const [isReading, setIsReading] = useState(false);
  const [currentMedicineIndex, setCurrentMedicineIndex] = useState(0);

  useEffect(() => {
    if (initialReadingAction === 'start' && selectedRx) {
      startVoiceReading();
    } else if (initialReadingAction === 'next') {
      handleNextMedicine();
    } else if (initialReadingAction === 'repeat') {
      handleRepeatMedicine();
    } else if (initialReadingAction === 'stop') {
      handleStopReading();
    }
  }, [initialReadingAction]);

  const startVoiceReading = () => {
    if (!selectedRx || selectedRx.medicines.length === 0) return;
    setIsReading(true);
    setCurrentMedicineIndex(0);

    const med = selectedRx.medicines[0];
    const text = `Your prescription from ${selectedRx.doctorName} for ${selectedRx.diagnosis} contains ${selectedRx.medicines.length} medicines. Medicine 1: ${med.name}, ${med.dosage}, take ${med.frequency} for ${med.duration}. Directions: ${med.instructions}. Say "Next medicine" or click Next to continue.`;

    soundService.speak(text, {
      onEnd: () => {},
    });
    soundService.announce(text, false);
  };

  const handleNextMedicine = () => {
    if (!selectedRx) return;
    const nextIdx = currentMedicineIndex + 1;
    if (nextIdx < selectedRx.medicines.length) {
      setCurrentMedicineIndex(nextIdx);
      const med = selectedRx.medicines[nextIdx];
      const text = `Medicine ${nextIdx + 1}: ${med.name}, ${med.dosage}, take ${med.frequency} for ${med.duration}. Directions: ${med.instructions}.`;
      soundService.speak(text);
      soundService.announce(text, false);
    } else {
      const finishText = `That is all ${selectedRx.medicines.length} medicines in this prescription. Follow-up is scheduled for ${selectedRx.followUpDate || 'as needed'}.`;
      soundService.speak(finishText);
      setIsReading(false);
    }
  };

  const handleRepeatMedicine = () => {
    if (!selectedRx) return;
    const med = selectedRx.medicines[currentMedicineIndex];
    if (med) {
      const text = `Repeating Medicine ${currentMedicineIndex + 1}: ${med.name}, ${med.dosage}, take ${med.frequency} for ${med.duration}. Directions: ${med.instructions}.`;
      soundService.speak(text);
      soundService.announce(text, false);
    }
  };

  const handleStopReading = () => {
    soundService.stopSpeaking();
    setIsReading(false);
    soundService.playSuccess();
    soundService.announce('Prescription voice reading stopped.');
  };

  const handleDownloadPDF = (rx: Prescription) => {
    generatePrescriptionPDF(rx);
    soundService.playSuccess();
    soundService.announce('Official prescription PDF generated and downloaded.');
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Page Title & Voice Prompt */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Digital Prescriptions & Voice Reader
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Certified electronic prescriptions with step-by-step medication voice narration and PDF exports.
          </p>
        </div>

        <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-900 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Say: "Read my prescription" for hands-free audio narration.</span>
        </div>
      </div>

      {/* Main Prescription Container */}
      {selectedRx ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Interactive Voice Reading Controller */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gradient-to-b from-purple-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-purple-500/30 space-y-5">
              <div className="flex items-center gap-2">
                <Volume2 className="w-6 h-6 text-purple-400" />
                <h3 className="font-extrabold text-lg">Prescription Voice Reader</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Reads medicine names, dosages, and daily instructions aloud for visually impaired and elderly patients.
              </p>

              {/* Reader Controls */}
              <div className="space-y-2">
                {!isReading ? (
                  <button
                    onClick={startVoiceReading}
                    className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-teal-500/40 flex items-center justify-center gap-2 text-sm transition-all focus:outline-hidden focus:ring-4 focus:ring-teal-400"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Start Voice Reading</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-purple-800/60 rounded-xl border border-purple-400/40 text-xs font-bold text-purple-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                      Currently reading Medicine {currentMedicineIndex + 1} of {selectedRx.medicines.length}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleNextMedicine}
                        className="py-2.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                        <span>Next Medicine</span>
                      </button>

                      <button
                        onClick={handleRepeatMedicine}
                        className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Repeat That</span>
                      </button>
                    </div>

                    <button
                      onClick={handleStopReading}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop Reading</span>
                    </button>
                  </div>
                )}
              </div>

              {/* PDF Download Button */}
              <div className="pt-2 border-t border-purple-800/60">
                <button
                  onClick={() => handleDownloadPDF(selectedRx)}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4 text-purple-300" />
                  <span>Download Official PDF Prescription</span>
                </button>
              </div>
            </div>

            {/* Prescriptions Selector */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Prescription History
              </span>
              <div className="space-y-2">
                {prescriptions.map((rx) => (
                  <button
                    key={rx.id}
                    onClick={() => {
                      setSelectedRx(rx);
                      setIsReading(false);
                      soundService.playSuccess();
                    }}
                    className={`w-full p-3 rounded-2xl border text-left text-xs transition-all ${
                      selectedRx.id === rx.id
                        ? 'bg-purple-50 border-purple-500 shadow-xs ring-2 ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <strong className="block text-slate-900 font-bold">{rx.diagnosis}</strong>
                    <span className="text-slate-500">{rx.doctorName} • {rx.date}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Prescription Sheet (Medical Rx Format) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-teal-700">
                  MediAccess AI Telemedicine Network
                </span>
                <h2 className="text-2xl font-black text-slate-900">Digital E-Prescription</h2>
                <p className="text-xs text-slate-500">
                  Prescription ID: <strong className="font-mono text-slate-700">{selectedRx.id.toUpperCase()}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <h3 className="font-black text-slate-900 text-base">{selectedRx.doctorName}</h3>
                <p className="text-xs font-bold text-teal-700">{selectedRx.doctorSpecialization}</p>
                <p className="text-xs text-slate-400">Reg: {selectedRx.doctorLicense}</p>
              </div>
            </div>

            {/* Patient & Date Meta Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Patient Name</span>
                <strong className="text-slate-900 font-bold text-sm">{selectedRx.patientName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Consultation Date</span>
                <strong className="text-slate-800 font-bold text-sm">{selectedRx.date}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Follow-Up Date</span>
                <strong className="text-teal-700 font-bold text-sm">{selectedRx.followUpDate || 'As needed'}</strong>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Clinical Diagnosis:
              </span>
              <p className="text-lg font-black text-slate-900">{selectedRx.diagnosis}</p>
            </div>

            {/* Rx Medications Table */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-teal-700 font-serif">℞</span>
                <h3 className="font-extrabold text-slate-900 text-base">Prescribed Medications</h3>
              </div>

              <div className="space-y-3">
                {selectedRx.medicines.map((med, idx) => {
                  const isActiveReading = isReading && currentMedicineIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        isActiveReading
                          ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <h4 className="font-extrabold text-slate-900 text-base">
                              {med.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-bold text-xs">
                              {med.dosage}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-600 mt-1 pl-7">
                            Directions: {med.instructions}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200 block">
                            {med.frequency}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium block mt-1">
                            Duration: {med.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructions & Advice */}
            {selectedRx.instructions && (
              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
                  Doctor Lifestyle & Treatment Advice:
                </span>
                <p className="text-xs sm:text-sm text-teal-950 font-medium leading-relaxed">
                  {selectedRx.instructions}
                </p>
              </div>
            )}

            {/* Footer & Digital Verification */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
                <span>Verified e-Signature stored in secure Firebase repository.</span>
              </div>
              <div className="text-left sm:text-right font-semibold">
                <span className="text-teal-700 block font-bold">Digitally signed by: {selectedRx.doctorName}</span>
                <span>License: {selectedRx.doctorLicense}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No prescriptions found.</h3>
        </div>
      )}
    </div>
  );
};
