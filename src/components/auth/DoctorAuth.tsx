import React, { useState } from 'react';
import { User, Doctor } from '../../types';
import { dataStore, DEFAULT_ACCESSIBILITY_SETTINGS } from '../../services/dataStore';
import { soundService } from '../../services/soundService';
import {
  Stethoscope,
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  Award,
  DollarSign,
  Building,
  MapPin,
  FileCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface DoctorAuthProps {
  onBack: () => void;
  onSuccess: (user: User) => void;
}

export const DoctorAuth: React.FC<DoctorAuthProps> = ({ onBack, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Pre-filled defaults for quick testing
  const [name, setName] = useState('Dr. Priya Sharma');
  const [email, setEmail] = useState('priya.sharma@mediaccess.health');
  const [password, setPassword] = useState('doctor1234');
  const [specialization, setSpecialization] = useState('Cardiology');
  const [qualifications, setQualifications] = useState('MD, DM (Cardiology) - AIIMS');
  const [experienceYears, setExperienceYears] = useState(12);
  const [fee, setFee] = useState(500);
  const [clinicName, setClinicName] = useState('Metro Heart Care Institute');
  const [location, setLocation] = useState('Bandra West, Mumbai');
  const [registrationNumber, setRegistrationNumber] = useState('MCI-CARD-2012-8821');
  const [error, setError] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid medical email address.');
      soundService.playError();
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      soundService.playError();
      return;
    }

    if (isRegister) {
      if (!name || !registrationNumber) {
        setError('Please enter your full name and Medical Council Registration Number.');
        soundService.playError();
        return;
      }

      // Create new doctor record
      const doctorId = `doc-${Date.now()}`;
      const newDoctor: Doctor = {
        id: doctorId,
        name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
        email,
        specialization,
        qualifications,
        experienceYears,
        fee,
        clinicName,
        location,
        rating: 5.0,
        reviewCount: 1,
        isVerified: true, // verified for demo preview
        gender: 'female',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableSlots: ['10:00', '12:00', '15:00', '17:00'],
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
        bio: `${specialization} specialist with ${experienceYears} years of clinical expertise.`,
        registrationNumber,
        languages: ['English', 'Hindi'],
      };

      dataStore.saveDoctor(newDoctor);

      const doctorUser: User = {
        id: doctorId,
        name: newDoctor.name,
        email,
        role: 'DOCTOR',
        avatar: newDoctor.avatar,
        accessibilitySettings: { ...DEFAULT_ACCESSIBILITY_SETTINGS },
        createdAt: new Date().toISOString(),
      };

      dataStore.setCurrentUser(doctorUser);
      soundService.playSuccess();
      soundService.announce('Doctor registration and license verification successful.');
      onSuccess(doctorUser);
    } else {
      // Existing Doctor Sign In
      const existingDoc = dataStore.getDoctors()[0];
      const doctorUser: User = {
        id: existingDoc.id,
        name: existingDoc.name,
        email: existingDoc.email,
        role: 'DOCTOR',
        avatar: existingDoc.avatar,
        accessibilitySettings: { ...DEFAULT_ACCESSIBILITY_SETTINGS },
        createdAt: new Date().toISOString(),
      };

      dataStore.setCurrentUser(doctorUser);
      soundService.playSuccess();
      soundService.announce('Signed in to Doctor Dashboard.');
      onSuccess(doctorUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-900 mb-6 p-2 rounded-xl hover:bg-sky-50 transition-colors focus:outline-hidden focus:ring-4 focus:ring-sky-400"
          aria-label="Back to role selection"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Role Selection</span>
        </button>

        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/30">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {isRegister ? 'Doctor Credentialing & Registration' : 'Doctor Portal Sign In'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold">MediAccess AI Healthcare Provider Suite</p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-3xl border border-slate-200">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Doctor Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Priya Sharma"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Medical Registration No.
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="MCI-CARD-2012-8821"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Specialization
                    </label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Qualifications
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Award className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={qualifications}
                        onChange={(e) => setQualifications(e.target.value)}
                        placeholder="MBBS, MD, DM"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Consultation Fee (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        min="100"
                        max="5000"
                        value={fee}
                        onChange={(e) => setFee(parseInt(e.target.value, 10))}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Clinic / Hospital Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Building className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="Apollo Hospital / Private Clinic"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Location / City
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Bandra West, Mumbai"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Doctor Professional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@mediaccess.health"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
              <span>
                All registered practitioners undergo license authentication before issuing digital prescriptions.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-xl shadow-lg shadow-sky-600/30 transition-all focus:outline-hidden focus:ring-4 focus:ring-sky-400"
            >
              {isRegister ? 'Register & Verify Practitioner Profile' : 'Sign In as Doctor'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-sm font-bold text-sky-700 hover:text-sky-800"
            >
              {isRegister
                ? 'Already verified? Sign in to Doctor Dashboard'
                : 'New medical practitioner? Register here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
