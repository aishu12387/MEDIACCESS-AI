import { User, Doctor, Appointment, Prescription, AppNotification, AccessibilitySettings } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'mediaccess_current_user',
  USERS: 'mediaccess_users',
  DOCTORS: 'mediaccess_doctors',
  APPOINTMENTS: 'mediaccess_appointments',
  PRESCRIPTIONS: 'mediaccess_prescriptions',
  NOTIFICATIONS: 'mediaccess_notifications',
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  mode: 'normal',
  textSize: 'normal',
  highContrast: false,
  voiceGender: 'female',
  speechRate: 1.0,
  spokenFeedback: true,
  captionSize: 'normal',
  language: 'English',
  hapticAudioFeedback: true,
};

const SEED_DOCTORS: Doctor[] = [
  {
    id: 'doc-sharma',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@mediaccess.health',
    specialization: 'Cardiology',
    qualifications: 'MD, DM (Cardiology) - AIIMS',
    experienceYears: 12,
    fee: 500,
    clinicName: 'Metro Heart Care Institute',
    location: 'Bandra West, Mumbai',
    rating: 4.9,
    reviewCount: 148,
    isVerified: true,
    gender: 'female',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['10:00', '11:00', '14:00', '16:00', '17:00', '18:30'],
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    bio: 'Senior Interventional Cardiologist specializing in preventive cardiology, chest pain evaluation, echocardiography, and heart failure management.',
    registrationNumber: 'MCI-CARD-2012-8821',
    languages: ['English', 'Hindi', 'Marathi'],
  },
  {
    id: 'doc-verma',
    name: 'Dr. Rajesh Verma',
    email: 'rajesh.verma@mediaccess.health',
    specialization: 'Neurology',
    qualifications: 'MBBS, MD, DM (Neurology) - NIMHANS',
    experienceYears: 16,
    fee: 750,
    clinicName: 'Advanced Brain & Spine Center',
    location: 'Indiranagar, Bangalore',
    rating: 4.8,
    reviewCount: 210,
    isVerified: true,
    gender: 'male',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableSlots: ['11:00', '12:30', '15:00', '17:30'],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    bio: 'Consultant Neurologist focusing on stroke care, migraine headaches, epilepsy, neuropathy, and movement disorders.',
    registrationNumber: 'KMC-NEURO-2008-4109',
    languages: ['English', 'Hindi', 'Kannada'],
  },
  {
    id: 'doc-iyer',
    name: 'Dr. Ananya Iyer',
    email: 'ananya.iyer@mediaccess.health',
    specialization: 'Dermatology',
    qualifications: 'MD (Dermatology, Venereology & Leprosy)',
    experienceYears: 8,
    fee: 450,
    clinicName: 'Skin Aesthetics & Laser Clinic',
    location: 'Connaught Place, New Delhi',
    rating: 4.9,
    reviewCount: 185,
    isVerified: true,
    gender: 'female',
    availableDays: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
    availableSlots: ['09:30', '11:00', '13:00', '16:00', '19:00'],
    avatar: 'https://images.unsplash.com/photo-1594824813583-05708892ca39?auto=format&fit=crop&q=80&w=400',
    bio: 'Board-certified Dermatologist experienced in acne treatments, eczema, chronic rashes, allergy testing, and cosmetic dermatology.',
    registrationNumber: 'DMC-DERM-2016-1934',
    languages: ['English', 'Hindi', 'Tamil'],
  },
  {
    id: 'doc-patel',
    name: 'Dr. Vikram Patel',
    email: 'vikram.patel@mediaccess.health',
    specialization: 'General Medicine',
    qualifications: 'MBBS, MD (Internal Medicine) - KEM',
    experienceYears: 10,
    fee: 350,
    clinicName: 'City Primary Care PolyClinic',
    location: 'Navrangpura, Ahmedabad',
    rating: 4.7,
    reviewCount: 320,
    isVerified: true,
    gender: 'male',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['09:00', '10:30', '12:00', '15:00', '17:00', '18:00'],
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    bio: 'Primary care specialist treating viral fevers, hypertension, diabetes management, respiratory infections, and preventative health screenings.',
    registrationNumber: 'GMC-MED-2014-9902',
    languages: ['English', 'Hindi', 'Gujarati'],
  },
  {
    id: 'doc-menon',
    name: 'Dr. Sunita Menon',
    email: 'sunita.menon@mediaccess.health',
    specialization: 'Pediatrics',
    qualifications: 'MD (Pediatrics), DCH',
    experienceYears: 14,
    fee: 500,
    clinicName: 'Little Angels Child Care Hospital',
    location: 'Kochi, Kerala',
    rating: 4.9,
    reviewCount: 240,
    isVerified: true,
    gender: 'female',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['10:00', '11:30', '14:30', '16:30', '18:00'],
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    bio: 'Senior Pediatrician with dedication to child growth, newborn care, immunization, developmental assessments, and childhood asthma.',
    registrationNumber: 'TCMC-PED-2010-3341',
    languages: ['English', 'Hindi', 'Malayalam'],
  },
  {
    id: 'doc-malhotra',
    name: 'Dr. Amit Malhotra',
    email: 'amit.malhotra@mediaccess.health',
    specialization: 'Orthopedics',
    qualifications: 'MS (Orthopedics), Fellowship Joint Reconstruction',
    experienceYears: 11,
    fee: 600,
    clinicName: 'Care Orthopedic & Spine Center',
    location: 'Sector 62, Noida',
    rating: 4.8,
    reviewCount: 162,
    isVerified: true,
    gender: 'male',
    availableDays: ['Monday', 'Wednesday', 'Thursday', 'Saturday'],
    availableSlots: ['11:00', '13:00', '15:30', '17:00'],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    bio: 'Orthopedic specialist in sports injuries, knee and hip pain, arthritis management, fractures, and accessible rehabilitation plans.',
    registrationNumber: 'UPMC-ORTHO-2013-5572',
    languages: ['English', 'Hindi', 'Punjabi'],
  },
];

const SEED_PATIENT: User = {
  id: 'patient-demo-1',
  email: 'aishwarya@mediaccess.health',
  name: 'Aishwarya Tandurwar',
  role: 'PATIENT',
  phone: '+91 98234 56789',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  accessibilitySettings: {
    ...DEFAULT_ACCESSIBILITY_SETTINGS,
    mode: 'visually_impaired',
    textSize: 'large',
    spokenFeedback: true,
    highContrast: false,
  },
  createdAt: new Date().toISOString(),
};

const SEED_DOCTOR_USER: User = {
  id: 'doc-sharma',
  email: 'priya.sharma@mediaccess.health',
  name: 'Dr. Priya Sharma',
  role: 'DOCTOR',
  phone: '+91 98111 22334',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
  accessibilitySettings: {
    ...DEFAULT_ACCESSIBILITY_SETTINGS,
    mode: 'normal',
  },
  createdAt: new Date().toISOString(),
};

// Seed initial appointment for today
const todayStr = new Date().toISOString().split('T')[0];

const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    patientId: 'patient-demo-1',
    patientName: 'Aishwarya Tandurwar',
    patientAccessibilityMode: 'visually_impaired',
    doctorId: 'doc-sharma',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'Cardiology',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    date: todayStr,
    time: '17:00',
    status: 'confirmed',
    fee: 500,
    notes: 'Follow up on mild chest discomfort and blood pressure monitoring.',
    meetLink: '/consultation/apt-101',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'apt-102',
    patientId: 'patient-demo-1',
    patientName: 'Aishwarya Tandurwar',
    patientAccessibilityMode: 'visually_impaired',
    doctorId: 'doc-iyer',
    doctorName: 'Dr. Ananya Iyer',
    doctorSpecialization: 'Dermatology',
    doctorAvatar: 'https://images.unsplash.com/photo-1594824813583-05708892ca39?auto=format&fit=crop&q=80&w=400',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    time: '11:00',
    status: 'confirmed',
    fee: 450,
    notes: 'Seasonal allergy rash consultation.',
    meetLink: '/consultation/apt-102',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

const SEED_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-201',
    appointmentId: 'apt-101',
    patientId: 'patient-demo-1',
    patientName: 'Aishwarya Tandurwar',
    doctorId: 'doc-sharma',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'Cardiology',
    doctorLicense: 'MCI-CARD-2012-8821',
    date: todayStr,
    diagnosis: 'Mild Hypertension & Stress-induced Palpitations',
    medicines: [
      {
        name: 'Amlodipine Besylate',
        dosage: '5 mg',
        frequency: 'Once daily in the morning',
        duration: '30 days',
        instructions: 'Take with or without food. Monitor blood pressure weekly.',
      },
      {
        name: 'Paracetamol',
        dosage: '650 mg',
        frequency: 'SOS (as needed for headache/body pain)',
        duration: '5 days',
        instructions: 'Take after meals. Maximum 3 tablets per 24 hours.',
      },
      {
        name: 'Vitamin D3 & B12 Supplement',
        dosage: '1 Capsule',
        frequency: 'Once weekly on Sundays',
        duration: '8 weeks',
        instructions: 'Take after breakfast with milk or water.',
      },
    ],
    instructions: 'Maintain low sodium diet (<2.5g salt/day). Walk 30 minutes daily. Avoid excess caffeine. Review BP readings after 2 weeks.',
    followUpDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
];

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'patient-demo-1',
    title: 'Consultation Confirmed',
    message: 'Your tele-consultation with Dr. Priya Sharma is confirmed for today at 5:00 PM.',
    type: 'booking_confirmed',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    linkTo: '/appointments',
  },
  {
    id: 'notif-2',
    userId: 'patient-demo-1',
    title: 'New Digital Prescription Available',
    message: 'Dr. Priya Sharma has issued your official digital prescription. Voice reading is ready.',
    type: 'prescription_ready',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    linkTo: '/prescriptions',
  },
];

export const dataStore = {
  // Initialize storage
  init: () => {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(SEED_DOCTORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(SEED_APPOINTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS)) {
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(SEED_PRESCRIPTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    }
  },

  // Auth / Current User
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: User | null) => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  updateUserAccessibility: (settings: Partial<AccessibilitySettings>): User | null => {
    const user = dataStore.getCurrentUser();
    if (!user) return null;
    const updatedUser: User = {
      ...user,
      accessibilitySettings: {
        ...user.accessibilitySettings,
        ...settings,
      },
    };
    dataStore.setCurrentUser(updatedUser);
    return updatedUser;
  },

  // Demo Sign In helpers
  loginDemoPatient: (): User => {
    dataStore.setCurrentUser(SEED_PATIENT);
    return SEED_PATIENT;
  },

  loginDemoDoctor: (): User => {
    dataStore.setCurrentUser(SEED_DOCTOR_USER);
    return SEED_DOCTOR_USER;
  },

  // Doctors
  getDoctors: (): Doctor[] => {
    if (typeof window === 'undefined') return SEED_DOCTORS;
    const raw = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    return raw ? JSON.parse(raw) : SEED_DOCTORS;
  },

  getDoctorById: (id: string): Doctor | undefined => {
    return dataStore.getDoctors().find((d) => d.id === id);
  },

  saveDoctor: (doctor: Doctor) => {
    const docs = dataStore.getDoctors();
    const idx = docs.findIndex((d) => d.id === doctor.id);
    if (idx >= 0) {
      docs[idx] = doctor;
    } else {
      docs.push(doctor);
    }
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(docs));
  },

  // Appointments
  getAppointments: (userId?: string, role?: 'PATIENT' | 'DOCTOR'): Appointment[] => {
    if (typeof window === 'undefined') return SEED_APPOINTMENTS;
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    const all: Appointment[] = raw ? JSON.parse(raw) : SEED_APPOINTMENTS;
    if (!userId) return all;
    if (role === 'DOCTOR') {
      return all.filter((a) => a.doctorId === userId);
    }
    return all.filter((a) => a.patientId === userId);
  },

  getAppointmentById: (id: string): Appointment | undefined => {
    return dataStore.getAppointments().find((a) => a.id === id);
  },

  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const all = dataStore.getAppointments();
    const newApt: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    all.push(newApt);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(all));

    // Also trigger notification
    dataStore.addNotification({
      userId: newApt.patientId,
      title: 'Appointment Booked Successfully',
      message: `Your appointment with ${newApt.doctorName} is confirmed for ${newApt.date} at ${newApt.time}.`,
      type: 'booking_confirmed',
      linkTo: '/appointments',
    });

    return newApt;
  },

  updateAppointmentStatus: (
    id: string,
    status: Appointment['status'],
    details?: { date?: string; time?: string }
  ): Appointment | null => {
    const all = dataStore.getAppointments();
    const apt = all.find((a) => a.id === id);
    if (!apt) return null;

    apt.status = status;
    if (details?.date) apt.date = details.date;
    if (details?.time) apt.time = details.time;

    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(all));

    if (status === 'cancelled') {
      dataStore.addNotification({
        userId: apt.patientId,
        title: 'Appointment Cancelled',
        message: `Your appointment with ${apt.doctorName} on ${apt.date} has been cancelled.`,
        type: 'cancelled',
        linkTo: '/appointments',
      });
    } else if (status === 'rescheduled') {
      dataStore.addNotification({
        userId: apt.patientId,
        title: 'Appointment Rescheduled',
        message: `Your appointment with ${apt.doctorName} has been rescheduled to ${apt.date} at ${apt.time}.`,
        type: 'rescheduled',
        linkTo: '/appointments',
      });
    }

    return apt;
  },

  // Prescriptions
  getPrescriptions: (patientId?: string): Prescription[] => {
    if (typeof window === 'undefined') return SEED_PRESCRIPTIONS;
    const raw = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
    const all: Prescription[] = raw ? JSON.parse(raw) : SEED_PRESCRIPTIONS;
    if (!patientId) return all;
    return all.filter((p) => p.patientId === patientId);
  },

  getLatestPrescription: (patientId: string): Prescription | undefined => {
    const list = dataStore.getPrescriptions(patientId);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  },

  createPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt'>): Prescription => {
    const all = dataStore.getPrescriptions();
    const newRx: Prescription = {
      ...prescription,
      id: `rx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newRx);
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(all));

    // Notify patient
    dataStore.addNotification({
      userId: newRx.patientId,
      title: 'New Digital Prescription Issued',
      message: `Dr. ${newRx.doctorName} has prescribed medication for ${newRx.diagnosis}. You can listen or download the PDF.`,
      type: 'prescription_ready',
      linkTo: '/prescriptions',
    });

    return newRx;
  },

  // Notifications
  getNotifications: (userId: string): AppNotification[] => {
    if (typeof window === 'undefined') return SEED_NOTIFICATIONS;
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: AppNotification[] = raw ? JSON.parse(raw) : SEED_NOTIFICATIONS;
    return all.filter((n) => n.userId === userId);
  },

  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: AppNotification[] = raw ? JSON.parse(raw) : SEED_NOTIFICATIONS;
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    all.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  },

  markAllNotificationsRead: (userId: string) => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: AppNotification[] = raw ? JSON.parse(raw) : SEED_NOTIFICATIONS;
    all.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  },
};
