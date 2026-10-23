export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type AccessibilityMode =
  | 'normal'
  | 'visually_impaired'
  | 'hearing_impaired'
  | 'speech_impaired'
  | 'deaf_speech_impaired';

export type TextSize = 'normal' | 'large' | 'xlarge';
export type CaptionSize = 'normal' | 'large' | 'huge';

export interface AccessibilitySettings {
  mode: AccessibilityMode;
  textSize: TextSize;
  highContrast: boolean;
  voiceGender: 'female' | 'male';
  speechRate: number;
  spokenFeedback: boolean;
  captionSize: CaptionSize;
  language: 'English' | 'Hindi' | 'Spanish';
  hapticAudioFeedback: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  accessibilitySettings: AccessibilitySettings;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  fee: number;
  clinicName: string;
  location: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  gender: 'female' | 'male';
  availableDays: string[];
  availableSlots: string[];
  avatar: string;
  bio: string;
  registrationNumber: string;
  languages: string[];
}

export type AppointmentStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAccessibilityMode?: AccessibilityMode;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorAvatar?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  fee: number;
  notes?: string;
  meetLink: string;
  createdAt: string;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorLicense: string;
  date: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  instructions: string;
  followUpDate: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment_reminder' | 'booking_confirmed' | 'cancelled' | 'rescheduled' | 'prescription_ready' | 'doctor_message' | 'emergency';
  timestamp: string;
  read: boolean;
  linkTo?: string;
}

export interface VoiceIntentResult {
  intent: string;
  parameters: Record<string, any>;
  spokenResponse: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  followUpQuestion?: string;
}

export interface SignDetectionResult {
  sign: string;
  confidence: number;
  text: string;
  timestamp: number;
}
