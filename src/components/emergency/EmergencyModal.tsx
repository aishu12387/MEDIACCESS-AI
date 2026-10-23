import React, { useState, useEffect } from 'react';
import { soundService } from '../../services/soundService';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  X,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  Users,
} from 'lucide-react';

interface EmergencyModalProps {
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ onClose }) => {
  const [countdown, setCountdown] = useState(5);
  const [isAlertTriggered, setIsAlertTriggered] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState('Detecting GPS location...');

  useEffect(() => {
    // Play distinctive emergency siren audio tone
    const stopSiren = soundService.playEmergencySiren();
    soundService.speak(
      'Emergency Mode Activated. Press cancel or say Cancel within 5 seconds to abort.'
    );

    // Request GPS location
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus(
            `GPS Coordinates: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
          );
        },
        () => {
          setLocationStatus('GPS fallback: Bandra West, Mumbai (Metropolitan Zone)');
        }
      );
    } else {
      setLocationStatus('Location: Bandra West, Mumbai (Registered Address)');
    }

    // 5-second countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTriggerEmergencyCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      stopSiren();
    };
  }, []);

  const handleCancel = () => {
    soundService.stopSpeaking();
    soundService.announce('Emergency alert cancelled by user.');
    onClose();
  };

  const handleTriggerEmergencyCall = () => {
    setIsAlertTriggered(true);
    soundService.playSuccess();
    const alertMsg = 'Emergency Call Dispatched. Ambulance and emergency contacts have been notified with your GPS coordinates.';
    soundService.speak(alertMsg);
    soundService.announce(alertMsg, false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-rose-950/80 backdrop-blur-md flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-rose-600 animate-in fade-in zoom-in-95 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-rose-600">
                CRITICAL ASSISTANCE
              </span>
              <h2 id="emergency-title" className="text-2xl font-black text-slate-900">
                Emergency Medical Response
              </h2>
            </div>
          </div>

          <button
            onClick={handleCancel}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            aria-label="Cancel emergency modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Countdown Box */}
        {!isAlertTriggered ? (
          <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Auto-Alert Countdown
            </span>
            <div className="text-5xl font-black text-rose-600 font-mono animate-pulse">
              00:0{countdown}
            </div>
            <p className="text-xs text-rose-800 font-semibold">
              Tap "Cancel Alert" below immediately if this was triggered accidentally.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-black text-emerald-950">
              Emergency Services Dispatched
            </h3>
            <p className="text-xs text-emerald-800 font-medium">
              Ambulance ETA: 6-8 minutes. Nearest Emergency Room: Metro Heart Hospital.
            </p>
          </div>
        )}

        {/* GPS Location pill */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-700">
          <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{locationStatus}</span>
        </div>

        {/* Direct Action Dialers */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Emergency Contacts & Services:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href="tel:108"
              onClick={handleTriggerEmergencyCall}
              className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Ambulance (108 / 112)</span>
            </a>

            <a
              href="tel:911"
              onClick={handleTriggerEmergencyCall}
              className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>Call ICE Emergency Contact</span>
            </a>
          </div>
        </div>

        {/* Cancel button */}
        <div className="pt-2">
          <button
            onClick={handleCancel}
            className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm rounded-xl transition-colors"
          >
            Cancel / False Alarm
          </button>
        </div>
      </div>
    </div>
  );
};
