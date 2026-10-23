import React, { useState, useEffect, useRef } from 'react';
import { User, Appointment, CaptionSize, SignDetectionResult } from '../../types';
import { dataStore } from '../../services/dataStore';
import { soundService } from '../../services/soundService';
import { signLanguageService, SUPPORTED_MEDICAL_SIGNS } from '../../services/signLanguageService';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  Send,
  MessageSquare,
  Sparkles,
  Contrast,
  Sliders,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Type,
  Hand,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

interface ConsultationRoomProps {
  user: User;
  appointmentId?: string;
  onEndCall: () => void;
}

export const ConsultationRoom: React.FC<ConsultationRoomProps> = ({
  user,
  appointmentId,
  onEndCall,
}) => {
  const appointment: Appointment | undefined = appointmentId
    ? dataStore.getAppointmentById(appointmentId)
    : dataStore.getAppointments(user.id)[0];

  const doctorName = appointment?.doctorName || 'Dr. Priya Sharma';
  const doctorSpecialty = appointment?.doctorSpecialization || 'Cardiology';

  // Video & Audio States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSignLanguageActive, setIsSignLanguageActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Deaf / Hearing-Impaired Captions
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [captionSize, setCaptionSize] = useState<CaptionSize>(
    user.accessibilitySettings.captionSize || 'large'
  );
  const [currentDoctorTranscript, setCurrentDoctorTranscript] = useState(
    `Hello ${user.name.split(' ')[0]}, I am Dr. Priya Sharma. I have reviewed your blood pressure logs and ECG. How are you feeling today?`
  );

  // Speech-Impaired AAC & Text-to-Speech
  const [patientText, setPatientText] = useState('');
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'doctor' | 'patient'; text: string; timestamp: string }>
  >([
    {
      sender: 'doctor',
      text: 'Good day! The consultation line is fully encrypted and accessible.',
      timestamp: '17:00',
    },
  ]);

  // Sign Language Detection State
  const [lastDetectedSign, setLastDetectedSign] = useState<SignDetectionResult | null>({
    sign: 'HELLO_DOCTOR',
    confidence: 0.96,
    text: '👋 Hello Doctor',
    timestamp: Date.now(),
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Quick AAC Medical Phrases for Speech-Impaired Mode
  const quickPhrases = [
    { label: '🤕 I have chest pain', text: 'I am experiencing mild chest discomfort and tightness.' },
    { label: '🌀 I feel dizzy', text: 'I have been feeling dizzy since this morning.' },
    { label: '🔄 Please repeat that', text: 'Could you please repeat that statement more slowly?' },
    { label: '💊 What medicines do I need?', text: 'Which medications should I take, and what is the dosage?' },
    { label: '🙏 Thank you Doctor', text: 'Thank you Doctor, I understand the advice.' },
    { label: '⚠️ Need emergency help', text: 'I feel very unwell and might need urgent hospital care.' },
  ];

  // Simulated Doctor Speech Feed every 20 seconds for deaf mode demonstration
  useEffect(() => {
    const doctorPhrases = [
      `Your heart rate is steady at 74 bpm. Let's make sure you take Amlodipine 5mg each morning.`,
      `Are you experiencing any shortness of breath when walking up the stairs?`,
      `I am preparing your digital e-prescription with full dosage instructions right now.`,
      `Remember to keep your sodium intake low and drink plenty of water throughout the day.`,
    ];

    let idx = 0;
    const interval = setInterval(() => {
      const nextText = doctorPhrases[idx % doctorPhrases.length];
      setCurrentDoctorTranscript(nextText);
      setChatMessages((prev) => [
        ...prev,
        { sender: 'doctor', text: nextText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
      idx++;
    }, 18000);

    return () => clearInterval(interval);
  }, []);

  // Initialize patient camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API is not supported in this browser environment.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Start sign language analysis if canvas is present
        if (videoRef.current && canvasRef.current && isSignLanguageActive) {
          signLanguageService.startRecognition(
            videoRef.current,
            canvasRef.current,
            (result) => {
              setLastDetectedSign(result);
            }
          );
        }
      } catch (err) {
        console.warn('Webcam permission not granted, using simulated stream:', err);
        setCameraError('Webcam permission not granted. Simulated accessible feed is active.');
      }
    }

    startCamera();

    return () => {
      signLanguageService.stopRecognition();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isSignLanguageActive]);

  // Handle Speech-Impaired Text -> Speech (Plays aloud so doctor hears)
  const handleSendPatientSpeech = (textToSend?: string) => {
    const msg = (textToSend || patientText).trim();
    if (!msg) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: 'patient', text: msg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setPatientText('');

    // Speak aloud for doctor
    soundService.speak(msg);
    soundService.playSuccess();
  };

  // Handle simulated sign gesture trigger
  const handleSimulateSign = (signId: string) => {
    const res = signLanguageService.simulateGesture(signId);
    if (res) {
      setLastDetectedSign(res);
      soundService.playSuccess();
      // Auto-broadcast via TTS so doctor hears the patient sign
      soundService.speak(`Patient signed: ${res.text}`);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'patient',
          text: `[Sign Language]: ${res.text}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const getCaptionClass = () => {
    switch (captionSize) {
      case 'huge':
        return 'text-xl sm:text-2xl p-6';
      case 'large':
        return 'text-base sm:text-lg p-5';
      default:
        return 'text-sm sm:text-base p-4';
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Consultation Room Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <h1 className="text-lg sm:text-xl font-black flex items-center gap-2">
              Telemedicine Consultation Room
              <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/40">
                WebRTC Live
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Doctor: <strong>{doctorName}</strong> ({doctorSpecialty}) • Verified Session
            </p>
          </div>
        </div>

        {/* Accessibility Toolbar */}
        <div className="flex items-center gap-2">
          {/* Captions toggle */}
          <button
            onClick={() => setCaptionsEnabled(!captionsEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              captionsEnabled
                ? 'bg-teal-500 text-slate-950 border-teal-400'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Toggle Live Doctor Subtitles"
          >
            <span>CC</span>
            <span>{captionsEnabled ? 'Captions ON' : 'Captions OFF'}</span>
          </button>

          {/* Caption Size cycler */}
          <button
            onClick={() => {
              const sizes: CaptionSize[] = ['normal', 'large', 'huge'];
              const next = sizes[(sizes.indexOf(captionSize) + 1) % sizes.length];
              setCaptionSize(next);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold"
            title="Adjust Caption Size"
          >
            Size: <strong className="uppercase text-teal-400">{captionSize}</strong>
          </button>

          {/* Sign Language toggle */}
          <button
            onClick={() => setIsSignLanguageActive(!isSignLanguageActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              isSignLanguageActive
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Sign Language AI</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewports (Doctor + Patient Pip) */}
      <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 min-h-[440px] sm:min-h-[520px] flex items-center justify-center">
        {/* Doctor Video Stream (Simulated High-Quality Feed) */}
        <div className="relative w-full h-full flex items-center justify-center min-h-[440px] sm:min-h-[520px]">
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=1200"
            alt={doctorName}
            className="w-full h-full object-cover opacity-90"
          />

          {/* Doctor Video Overlay Info */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-white text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{doctorName} (Speaking)</span>
          </div>

          {/* Deaf / Hearing-Impaired LIVE TRANSCRIPTION OVERLAY */}
          {captionsEnabled && (
            <div className="absolute bottom-20 left-4 right-4 sm:left-8 sm:right-8 z-20">
              <div
                className={`bg-slate-950/90 backdrop-blur-md text-amber-300 font-extrabold rounded-2xl border-2 border-amber-400/80 shadow-2xl leading-relaxed text-center ${getCaptionClass()}`}
                role="region"
                aria-live="polite"
              >
                <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-amber-400 mb-1 font-mono">
                  <Volume2 className="w-3.5 h-3.5" />
                  Live Doctor Speech Transcription
                </div>
                "{currentDoctorTranscript}"
              </div>
            </div>
          )}

          {/* Patient Picture-in-Picture Webcam */}
          <div className="absolute top-4 right-4 z-20 w-36 sm:w-52 aspect-video bg-slate-900 rounded-2xl overflow-hidden border-2 border-teal-400 shadow-2xl">
            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                Camera Off
              </div>
            )}
            {/* Hidden canvas for MediaPipe / hand analysis */}
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
              You ({user.name.split(' ')[0]})
            </div>
          </div>

          {/* Sign Language Real-Time Recognized Badge */}
          {isSignLanguageActive && lastDetectedSign && (
            <div className="absolute top-20 right-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-purple-500/80 text-white shadow-xl max-w-xs animate-in fade-in">
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-purple-400 mb-1">
                <span className="flex items-center gap-1">
                  <Hand className="w-3.5 h-3.5" />
                  Sign Language Recognized
                </span>
                <span className="text-emerald-400 font-mono">
                  {Math.round(lastDetectedSign.confidence * 100)}% Match
                </span>
              </div>
              <p className="text-sm font-extrabold text-white">
                {lastDetectedSign.text}
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                Auto-translated to Doctor's speaker via TTS
              </span>
            </div>
          )}
        </div>

        {/* Video Call Controls Bar at Bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700 shadow-2xl">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-xl transition-all ${
              isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3 rounded-xl transition-all ${
              !isVideoOn ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isVideoOn ? 'Turn camera off' : 'Turn camera on'}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={onEndCall}
            className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-rose-600/40 transition-all"
            title="End Telemedicine Call"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Accessible Communication Suite (AAC Board + Sign Language Triggers) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module A: Speech-Impaired AAC Communication Board (Text -> Speech to Doctor) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Speech-Impaired AAC Communication Board
              </h3>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              Text → Doctor Hears via TTS
            </span>
          </div>

          {/* Quick Medical Phrase Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quick Medical Statements (Tap to speak to Doctor):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPatientSpeech(phrase.text)}
                  className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-400 text-xs font-bold text-slate-800 transition-all flex items-center justify-between group"
                >
                  <span>{phrase.label}</span>
                  <Volume2 className="w-3.5 h-3.5 text-teal-600 opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Box to Doctor's Audio */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Type Custom Message (Synthesized Aloud):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={patientText}
                onChange={(e) => setPatientText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendPatientSpeech()}
                placeholder="Type what you want to say to Dr. Priya Sharma..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={() => handleSendPatientSpeech()}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <Volume2 className="w-4 h-4" />
                <span>Speak</span>
              </button>
            </div>
          </div>
        </div>

        {/* Module B: Sign Language Recognition & Gesture Simulator */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Hand className="w-5 h-5 text-purple-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Sign Language Recognition Pipeline
              </h3>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              Camera / MediaPipe
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Move your hand in front of your camera. MediAccess AI identifies medical sign gestures in real time and speaks the translation aloud to the doctor.
          </p>

          {/* Interactive Gesture Test Shortcuts */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Supported Signs (Tap to test gesture recognition):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_MEDICAL_SIGNS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSimulateSign(s.id)}
                  className="p-2 rounded-xl bg-purple-50/70 hover:bg-purple-100 border border-purple-200 text-left text-xs transition-all hover:scale-102"
                >
                  <span className="text-lg block">{s.emoji}</span>
                  <strong className="font-bold text-purple-950 block truncate">{s.label}</strong>
                </button>
              ))}
            </div>
          </div>

          {/* Status info */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Trained TensorFlow & MediaPipe gesture recognition active. Fallback AAC board ready if camera is disabled.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
