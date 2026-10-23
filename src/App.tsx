import React, { useState, useEffect } from 'react';
import { User, UserRole, AccessibilityMode } from './types';
import { dataStore } from './services/dataStore';
import { voiceService } from './services/voiceAssistant';
import { soundService } from './services/soundService';

import { Header } from './components/common/Header';
import { VoiceAssistantBar } from './components/common/VoiceAssistantBar';
import { WelcomeRoleScreen } from './components/auth/WelcomeRoleScreen';
import { PatientAuth } from './components/auth/PatientAuth';
import { AccessibilityOnboarding } from './components/auth/AccessibilityOnboarding';
import { DoctorAuth } from './components/auth/DoctorAuth';

import { PatientHome } from './components/patient/PatientHome';
import { DoctorSearch } from './components/patient/DoctorSearch';
import { AppointmentsScreen } from './components/patient/AppointmentsScreen';
import { ConsultationRoom } from './components/consultation/ConsultationRoom';
import { PrescriptionsScreen } from './components/prescriptions/PrescriptionsScreen';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { EmergencyModal } from './components/emergency/EmergencyModal';
import { SettingsModal } from './components/settings/SettingsModal';

type AppStep =
  | 'welcome_role'
  | 'patient_auth'
  | 'patient_onboarding'
  | 'doctor_auth'
  | 'main_app';

type PatientScreen =
  | 'home'
  | 'doctors'
  | 'appointments'
  | 'consultation'
  | 'prescriptions'
  | 'settings';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [step, setStep] = useState<AppStep>('welcome_role');
  const [patientScreen, setPatientScreen] = useState<PatientScreen>('home');
  const [activeConsultationAptId, setActiveConsultationAptId] = useState<string | undefined>();
  const [prescriptionVoiceAction, setPrescriptionVoiceAction] = useState<string | undefined>();
  const [doctorSearchFilter, setDoctorSearchFilter] = useState<{
    query?: string;
    specialization?: string;
    maxFee?: number;
  }>({});

  const [showEmergency, setShowEmergency] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Initialize data store on app mount
  useEffect(() => {
    dataStore.init();
    const stored = dataStore.getCurrentUser();
    if (stored) {
      setCurrentUser(stored);
      setStep('main_app');
    }
  }, []);

  // Register Global Voice Assistant action handlers
  useEffect(() => {
    voiceService.registerActionHandlers({
      onNavigate: (screen: string) => {
        if (screen === 'home') setPatientScreen('home');
        else if (screen === 'doctors') setPatientScreen('doctors');
        else if (screen === 'appointments') setPatientScreen('appointments');
        else if (screen === 'consultation') setPatientScreen('consultation');
        else if (screen === 'prescriptions') setPatientScreen('prescriptions');
        else if (screen === 'settings') setShowSettings(true);
        else if (screen === 'back') setPatientScreen('home');
      },

      onSearchDoctors: (params) => {
        setDoctorSearchFilter(params);
        setPatientScreen('doctors');
      },

      onBookAppointmentRequest: (params) => {
        if (!currentUser) return;
        const targetDoctor = dataStore.getDoctors().find(
          (d) =>
            params.doctorName &&
            d.name.toLowerCase().includes(params.doctorName.toLowerCase())
        ) || dataStore.getDoctors()[0];

        const date = params.date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const time = params.time || '17:00';

        dataStore.createAppointment({
          patientId: currentUser.id,
          patientName: currentUser.name,
          patientAccessibilityMode: currentUser.accessibilitySettings.mode,
          doctorId: targetDoctor.id,
          doctorName: targetDoctor.name,
          doctorSpecialization: targetDoctor.specialization,
          doctorAvatar: targetDoctor.avatar,
          date,
          time,
          status: 'confirmed',
          fee: targetDoctor.fee,
          notes: 'Voice Assistant Automated Booking',
          meetLink: `/consultation/apt-${Date.now()}`,
        });

        setPatientScreen('appointments');
      },

      onCancelAppointmentRequest: (params) => {
        if (!currentUser) return;
        const userApts = dataStore.getAppointments(currentUser.id, 'PATIENT');
        const target = userApts.find((a) => a.status === 'confirmed');
        if (target) {
          dataStore.updateAppointmentStatus(target.id, 'cancelled');
          setPatientScreen('appointments');
        }
      },

      onReadPrescription: (action?: string) => {
        setPatientScreen('prescriptions');
        setPrescriptionVoiceAction(action || 'start');
      },

      onStartConsultation: (appointmentId?: string) => {
        setActiveConsultationAptId(appointmentId);
        setPatientScreen('consultation');
      },

      onTriggerEmergency: () => {
        setShowEmergency(true);
      },

      onChangeAccessibilityMode: (mode: AccessibilityMode) => {
        if (!currentUser) return;
        const updated = dataStore.updateUserAccessibility({ mode });
        if (updated) setCurrentUser(updated);
      },

      onShowNotifications: () => {
        if (currentUser) {
          const list = dataStore.getNotifications(currentUser.id);
          const top = list[0];
          soundService.speak(
            top
              ? `You have ${list.length} notifications. Most recent: ${top.title}. ${top.message}`
              : 'You have no new notifications.'
          );
        }
      },
    });
  }, [currentUser]);

  // Handle Role Selection from Welcome Screen
  const handleSelectRole = (role: UserRole) => {
    if (role === 'PATIENT') {
      setStep('patient_auth');
    } else {
      setStep('doctor_auth');
    }
  };

  // Demo Shortcuts
  const handleDemoPatient = () => {
    const demo = dataStore.loginDemoPatient();
    setCurrentUser(demo);
    setStep('main_app');
    setPatientScreen('home');
    soundService.playSuccess();
    soundService.speak('Welcome back Aishwarya. Patient Dashboard is ready.');
  };

  const handleDemoDoctor = () => {
    const doc = dataStore.loginDemoDoctor();
    setCurrentUser(doc);
    setStep('main_app');
    soundService.playSuccess();
    soundService.speak('Welcome back Dr. Priya Sharma. Doctor Portal is ready.');
  };

  // Patient Authentication Success
  const handlePatientAuthSuccess = (user: User, isNewRegistration: boolean) => {
    setCurrentUser(user);
    if (isNewRegistration) {
      setStep('patient_onboarding');
    } else {
      setStep('main_app');
      setPatientScreen('home');
    }
  };

  // Onboarding Complete
  const handleOnboardingComplete = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setStep('main_app');
    setPatientScreen('home');
  };

  // Doctor Auth Success
  const handleDoctorAuthSuccess = (docUser: User) => {
    setCurrentUser(docUser);
    setStep('main_app');
  };

  // Logout
  const handleLogout = () => {
    dataStore.setCurrentUser(null);
    setCurrentUser(null);
    setStep('welcome_role');
    setPatientScreen('home');
    soundService.playSuccess();
    soundService.announce('Logged out successfully.');
  };

  // Compute Accessibility Styling Classes
  const textSizeClass =
    currentUser?.accessibilitySettings.textSize === 'xlarge'
      ? 'text-size-xlarge'
      : currentUser?.accessibilitySettings.textSize === 'large'
      ? 'text-size-large'
      : 'text-size-normal';

  const isHighContrast = currentUser?.accessibilitySettings.highContrast;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${textSizeClass} ${
        isHighContrast ? 'high-contrast-mode' : 'bg-slate-50'
      }`}
    >
      {/* Screen Reader ARIA Live Region for Accessibility */}
      <div id="mediaccess-sr-live" aria-live="polite" aria-atomic="true" className="sr-only" />

      {/* Screen 1: Welcome & Role Selection */}
      {step === 'welcome_role' && (
        <WelcomeRoleScreen
          onSelectRole={handleSelectRole}
          onDemoPatient={handleDemoPatient}
          onDemoDoctor={handleDemoDoctor}
        />
      )}

      {/* Screen 2A: Patient Login & Registration */}
      {step === 'patient_auth' && (
        <PatientAuth
          onBack={() => setStep('welcome_role')}
          onSuccess={handlePatientAuthSuccess}
        />
      )}

      {/* Screen 2B: First-Time Patient Accessibility Profile Setup */}
      {step === 'patient_onboarding' && currentUser && (
        <AccessibilityOnboarding
          user={currentUser}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Screen 2C: Doctor Login & Registration */}
      {step === 'doctor_auth' && (
        <DoctorAuth
          onBack={() => setStep('welcome_role')}
          onSuccess={handleDoctorAuthSuccess}
        />
      )}

      {/* Screen 3: Main Application (Role-Based) */}
      {step === 'main_app' && currentUser && (
        <>
          <Header
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenSettings={() => setShowSettings(true)}
            onNavigate={(screen) => setPatientScreen(screen as PatientScreen)}
            currentScreen={patientScreen}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            {currentUser.role === 'DOCTOR' ? (
              // Doctor Dashboard or Consultation
              patientScreen === 'consultation' ? (
                <ConsultationRoom
                  user={currentUser}
                  appointmentId={activeConsultationAptId}
                  onEndCall={() => setPatientScreen('home')}
                />
              ) : (
                <DoctorDashboard
                  doctorUser={currentUser}
                  onStartConsultation={(aptId) => {
                    setActiveConsultationAptId(aptId);
                    setPatientScreen('consultation');
                  }}
                />
              )
            ) : (
              // Patient Portals
              <>
                {patientScreen === 'home' && (
                  <PatientHome
                    user={currentUser}
                    onNavigate={(screen) => setPatientScreen(screen as PatientScreen)}
                    onTriggerEmergency={() => setShowEmergency(true)}
                  />
                )}

                {patientScreen === 'doctors' && (
                  <DoctorSearch
                    user={currentUser}
                    initialQuery={doctorSearchFilter.query}
                    initialSpecialization={doctorSearchFilter.specialization || 'All'}
                    initialMaxFee={doctorSearchFilter.maxFee}
                    onAppointmentBooked={() => setPatientScreen('appointments')}
                  />
                )}

                {patientScreen === 'appointments' && (
                  <AppointmentsScreen
                    user={currentUser}
                    onStartConsultation={(aptId) => {
                      setActiveConsultationAptId(aptId);
                      setPatientScreen('consultation');
                    }}
                  />
                )}

                {patientScreen === 'consultation' && (
                  <ConsultationRoom
                    user={currentUser}
                    appointmentId={activeConsultationAptId}
                    onEndCall={() => setPatientScreen('home')}
                  />
                )}

                {patientScreen === 'prescriptions' && (
                  <PrescriptionsScreen
                    user={currentUser}
                    initialReadingAction={prescriptionVoiceAction}
                  />
                )}
              </>
            )}
          </main>

          {/* Persistent Global Floating Voice Assistant */}
          <VoiceAssistantBar onTriggerEmergency={() => setShowEmergency(true)} />
        </>
      )}

      {/* Emergency Modal Dialog */}
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}

      {/* Settings & Accessibility Preferences Modal */}
      {showSettings && currentUser && (
        <SettingsModal
          user={currentUser}
          onClose={() => setShowSettings(false)}
          onUpdateUser={(updated) => setCurrentUser(updated)}
        />
      )}
    </div>
  );
}
