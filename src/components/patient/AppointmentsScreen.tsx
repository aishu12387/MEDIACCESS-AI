import React, { useState } from 'react';
import { Appointment, User } from '../../types';
import { dataStore } from '../../services/dataStore';
import { soundService } from '../../services/soundService';
import { voiceService } from '../../services/voiceAssistant';
import {
  Calendar,
  Clock,
  Video,
  XCircle,
  RotateCcw,
  Bell,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface AppointmentsScreenProps {
  user: User;
  onStartConsultation: (appointmentId: string) => void;
}

export const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({
  user,
  onStartConsultation,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    dataStore.getAppointments(user.id, 'PATIENT')
  );

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [reminderSimulated, setReminderSimulated] = useState<string | null>(null);
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);

  const refreshList = () => {
    setAppointments(dataStore.getAppointments(user.id, 'PATIENT'));
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'upcoming') {
      return apt.status === 'confirmed' || apt.status === 'rescheduled';
    }
    if (activeTab === 'past') {
      return apt.status === 'completed' || apt.status === 'cancelled';
    }
    return true;
  });

  // 15-Minute Reminder Simulator
  const handleSimulate15MinReminder = (apt: Appointment) => {
    soundService.playSuccess();
    const reminderMsg = `Your consultation with ${apt.doctorName} starts in 15 minutes. Please join the telemedicine room.`;
    setReminderSimulated(reminderMsg);

    // Speak aloud for accessibility
    soundService.speak(reminderMsg);
    soundService.announce(reminderMsg, false);

    // Also inject into notifications
    dataStore.addNotification({
      userId: user.id,
      title: 'Consultation Starts in 15 Minutes',
      message: reminderMsg,
      type: 'appointment_reminder',
      linkTo: `/consultation/${apt.id}`,
    });

    setTimeout(() => {
      setReminderSimulated(null);
    }, 8000);
  };

  const handleConfirmCancel = () => {
    if (!cancelModalApt) return;
    dataStore.updateAppointmentStatus(cancelModalApt.id, 'cancelled');
    soundService.playSuccess();
    soundService.speak(`Appointment with ${cancelModalApt.doctorName} has been cancelled.`);
    setCancelModalApt(null);
    refreshList();
  };

  return (
    <div className="space-y-6 pb-28">
      {/* 15-Minute Reminder Alert Banner (when simulated or triggered) */}
      {reminderSimulated && (
        <div
          className="p-4 sm:p-5 rounded-3xl bg-teal-600 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-teal-300 animate-in fade-in slide-in-from-top-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-teal-700 flex items-center justify-center shrink-0 shadow-md">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-200 block">
                15-Minute Consultation Reminder (FCM)
              </span>
              <p className="text-sm sm:text-base font-extrabold">{reminderSimulated}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onStartConsultation(appointments[0]?.id || 'apt-101')}
              className="px-5 py-2.5 bg-white text-teal-900 font-black text-sm rounded-xl shadow-md hover:bg-teal-50 transition-colors"
            >
              Join Room Now
            </button>
            <button
              onClick={() => setReminderSimulated(null)}
              className="p-2 text-teal-200 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Screen Title & Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Appointment Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              View upcoming tele-consultations, reschedule, or simulate 15-minute reminders.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {(['upcoming', 'past', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">No appointments found</h3>
            <p className="text-sm text-slate-500">
              Say: "Book Dr. Sharma tomorrow at 5 PM" to schedule your next consultation.
            </p>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const isConfirmed = apt.status === 'confirmed' || apt.status === 'rescheduled';
            return (
              <div
                key={apt.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-teal-500 shadow-md hover:shadow-xl transition-all space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={apt.doctorAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
                      alt={apt.doctorName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shrink-0 shadow-sm"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-slate-900">{apt.doctorName}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            apt.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'rescheduled'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-teal-700">{apt.doctorSpecialization}</p>
                      <p className="text-xs text-slate-500">{apt.notes}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 font-semibold block">Consultation Fee</span>
                    <strong className="text-lg font-black text-slate-900">₹{apt.fee}</strong>
                  </div>
                </div>

                {/* Date & Time pill info */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>{apt.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>{apt.time}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-800 rounded-xl">
                    <Video className="w-4 h-4 text-teal-600" />
                    <span>Telemedicine Video Room</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 15-Minute reminder simulation button */}
                    {isConfirmed && (
                      <button
                        onClick={() => handleSimulate15MinReminder(apt)}
                        className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition-colors flex items-center gap-1.5"
                        title="Simulate 15-min notification trigger"
                      >
                        <Bell className="w-4 h-4 text-teal-600" />
                        <span>Simulate 15-min Reminder</span>
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => setCancelModalApt(apt)}
                        className="px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>

                  {isConfirmed && (
                    <button
                      onClick={() => onStartConsultation(apt.id)}
                      className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-teal-600/30 transition-all flex items-center gap-2 focus:outline-hidden focus:ring-4 focus:ring-teal-400"
                    >
                      <Video className="w-4 h-4" />
                      <span>Start Consultation</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalApt && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-7 h-7 shrink-0" />
              <h3 className="text-lg font-black text-slate-900">Confirm Cancellation</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to cancel your appointment with <strong>{cancelModalApt.doctorName}</strong> on {cancelModalApt.date} at {cancelModalApt.time}?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setCancelModalApt(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition-colors"
              >
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
