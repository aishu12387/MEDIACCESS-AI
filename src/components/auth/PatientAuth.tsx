import React, { useState } from 'react';
import { User, AccessibilityMode } from '../../types';
import { dataStore, DEFAULT_ACCESSIBILITY_SETTINGS } from '../../services/dataStore';
import { soundService } from '../../services/soundService';
import {
  Heart,
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface PatientAuthProps {
  onBack: () => void;
  onSuccess: (user: User, isNewRegistration: boolean) => void;
}

export const PatientAuth: React.FC<PatientAuthProps> = ({ onBack, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  const [name, setName] = useState('Aishwarya Tandurwar');
  const [email, setEmail] = useState('aishwarya@mediaccess.health');
  const [password, setPassword] = useState('patient1234');
  const [phone, setPhone] = useState('+91 98234 56789');
  const [error, setError] = useState('');

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
    if (isRegister && !name.trim()) {
      setError('Please provide your full legal name for medical records.');
      soundService.playError();
      return;
    }

    soundService.playSuccess();

    if (isRegister) {
      const newUser: User = {
        id: `patient-${Date.now()}`,
        name,
        email,
        phone,
        role: 'PATIENT',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        accessibilitySettings: { ...DEFAULT_ACCESSIBILITY_SETTINGS },
        createdAt: new Date().toISOString(),
      };
      dataStore.setCurrentUser(newUser);
      onSuccess(newUser, true); // true = requires onboarding
    } else {
      // Login existing
      const existingUser: User = {
        id: 'patient-demo-1',
        name: name || 'Aishwarya Tandurwar',
        email,
        phone,
        role: 'PATIENT',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        accessibilitySettings: {
          ...DEFAULT_ACCESSIBILITY_SETTINGS,
          mode: 'visually_impaired',
          textSize: 'large',
          spokenFeedback: true,
        },
        createdAt: new Date().toISOString(),
      };
      dataStore.setCurrentUser(existingUser);
      onSuccess(existingUser, false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError('Please enter your email above to receive password reset instructions.');
      return;
    }
    setForgotPasswordSent(true);
    soundService.playSuccess();
    soundService.announce(`Password reset instructions sent to ${email}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900 mb-6 p-2 rounded-xl hover:bg-teal-50 transition-colors focus:outline-hidden focus:ring-4 focus:ring-teal-400"
          aria-label="Back to role selection"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Role Selection</span>
        </button>

        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/30">
            <Heart className="w-7 h-7 fill-white/20 stroke-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {isRegister ? 'Patient Registration' : 'Patient Secure Login'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold">MediAccess AI Patient Portal</p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-200">
          {error && (
            <div
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {forgotPasswordSent && (
            <div
              className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
              role="status"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Password reset link has been dispatched to {email}.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
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
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
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
                  placeholder="patient@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mobile Number (for SMS & 15-min Reminders)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98234 56789"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
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
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-xl shadow-lg shadow-teal-600/30 transition-all focus:outline-hidden focus:ring-4 focus:ring-teal-400 mt-2"
            >
              {isRegister ? 'Register & Setup Accessibility' : 'Sign In as Patient'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-sm font-bold text-teal-700 hover:text-teal-800"
            >
              {isRegister
                ? 'Already have an account? Sign in here'
                : "Don't have an account? Create new patient profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
