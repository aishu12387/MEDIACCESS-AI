import React, { useState } from 'react';
import { User, Appointment, Prescription } from '../../types';
import { dataStore } from '../../services/dataStore';
import { soundService } from '../../services/soundService';
import { generatePrescriptionPDF } from '../../services/prescriptionPdf';
import {
  Stethoscope,
  Video,
  FilePlus,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Eye,
  Ear,
  Mic,
  Sparkles,
  Plus,
  X,
  Trash2,
} from 'lucide-react';

interface DoctorDashboardProps {
  doctorUser: User;
  onStartConsultation: (appointmentId: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctorUser,
  onStartConsultation,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    dataStore.getAppointments(doctorUser.id, 'DOCTOR')
  );

  // New Prescription Modal
  const [showRxModal, setShowRxModal] = useState(false);
  const [selectedPatientApt, setSelectedPatientApt] = useState<Appointment | null>(
    appointments[0] || null
  );
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState(() => {
    return new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0];
  });
  const [medicines, setMedicines] = useState([
    {
      name: 'Amlodipine',
      dosage: '5mg',
      frequency: 'Once daily after breakfast',
      duration: '30 days',
      instructions: 'Monitor BP weekly',
    },
  ]);

  const handleAddMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      { name: '', dosage: '', frequency: 'Twice daily', duration: '5 days', instructions: 'Take after meals' },
    ]);
  };

  const handleRemoveMedicineRow = (idx: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientApt) return;

    const newRx = dataStore.createPrescription({
      appointmentId: selectedPatientApt.id,
      patientId: selectedPatientApt.patientId,
      patientName: selectedPatientApt.patientName,
      doctorId: doctorUser.id,
      doctorName: doctorUser.name,
      doctorSpecialization: 'Cardiology',
      doctorLicense: 'MCI-CARD-2012-8821',
      date: new Date().toISOString().split('T')[0],
      diagnosis: diagnosis || 'Clinical Evaluation & Symptomatic Relief',
      medicines: medicines.filter((m) => m.name.trim().length > 0),
      instructions,
      followUpDate,
    });

    soundService.playSuccess();
    soundService.announce('Digital prescription created and dispatched to patient.');
    setShowRxModal(false);

    // Offer instant PDF download
    generatePrescriptionPDF(newRx);
  };

  const getAccessibilityBadge = (mode?: string) => {
    switch (mode) {
      case 'visually_impaired':
        return { label: 'Visually Impaired', icon: Eye, bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'hearing_impaired':
        return { label: 'Hearing Impaired (Needs Captions)', icon: Ear, bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'speech_impaired':
        return { label: 'Speech Impaired (Needs AAC / Sign)', icon: Mic, bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'deaf_speech_impaired':
        return { label: 'Deaf + Speech (Sign & Captions)', icon: Sparkles, bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      default:
        return { label: 'Standard Mode', icon: Users, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-28">
      {/* Doctor Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/30 shrink-0">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                Doctor Professional Portal
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> License Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Welcome, {doctorUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Senior Consultant Cardiologist • Metro Heart Care Institute
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRxModal(true)}
          className="px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all focus:outline-hidden focus:ring-4 focus:ring-sky-400"
        >
          <FilePlus className="w-4 h-4" />
          <span>Issue New E-Prescription</span>
        </button>
      </div>

      {/* Practitioner Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Consultations", val: '4 Scheduled', icon: Calendar, color: 'text-sky-600 bg-sky-50' },
          { label: 'Active Patients in Queue', val: '1 Ready', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Prescriptions Issued', val: '28 this week', icon: FileText, color: 'text-purple-600 bg-purple-50' },
          { label: 'Telemedicine Earnings', val: '₹14,200', icon: DollarSign, color: 'text-teal-600 bg-teal-50' },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${m.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">{m.label}</span>
                <strong className="text-lg font-black text-slate-900">{m.val}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Consultation Queue with Patient Accessibility Badges */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Today's Consultation Schedule
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review patient accessibility profiles in advance to prepare live speech transcription or sign-language tools.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-700">
            {appointments.length} Patients Scheduled
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {appointments.map((apt) => {
            const accBadge = getAccessibilityBadge(apt.patientAccessibilityMode);
            const BadgeIcon = accBadge.icon;
            return (
              <div
                key={apt.id}
                className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 p-3 rounded-2xl transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-extrabold text-slate-900">{apt.patientName}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded-md text-slate-700">
                      Time: {apt.time}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    Reason: <em>{apt.notes || 'Routine consultation'}</em>
                  </p>

                  {/* Accessibility Alert for Doctor */}
                  <div className="pt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${accBadge.bg}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>Patient Accessibility: {accBadge.label}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedPatientApt(apt);
                      setShowRxModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Write Rx
                  </button>

                  <button
                    onClick={() => onStartConsultation(apt.id)}
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-sky-600/30 flex items-center gap-2 transition-all focus:outline-hidden focus:ring-4 focus:ring-sky-400"
                  >
                    <Video className="w-4 h-4" />
                    <span>Launch Tele-Room</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Prescription Modal */}
      {showRxModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">Create Digital Prescription</h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong>{selectedPatientApt?.patientName}</strong> • Date: {new Date().toISOString().split('T')[0]}
                </p>
              </div>
              <button
                onClick={() => setShowRxModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Clinical Diagnosis
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Essential Hypertension & Stress Palpitations"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Medicines List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Medications & Dosages
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                {medicines.map((med, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineRow(index)}
                          className="text-rose-500 hover:text-rose-700 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Medicine name (e.g. Paracetamol)"
                        value={med.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMedicines((prev) => {
                            const copy = [...prev];
                            copy[index].name = val;
                            return copy;
                          });
                        }}
                        className="px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 500mg)"
                        value={med.dosage}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMedicines((prev) => {
                            const copy = [...prev];
                            copy[index].dosage = val;
                            return copy;
                          });
                        }}
                        className="px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Frequency (e.g. Twice daily after meals)"
                        value={med.frequency}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMedicines((prev) => {
                            const copy = [...prev];
                            copy[index].frequency = val;
                            return copy;
                          });
                        }}
                        className="px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 5 days)"
                        value={med.duration}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMedicines((prev) => {
                            const copy = [...prev];
                            copy[index].duration = val;
                            return copy;
                          });
                        }}
                        className="px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Doctor Lifestyle Advice / Instructions
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Drink 3 liters of water, avoid salty snacks, rest adequately."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Follow-Up Review Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-600/30"
                >
                  Sign & Generate PDF Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
