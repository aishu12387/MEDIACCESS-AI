import { VoiceIntentResult, AccessibilityMode } from '../types';
import { soundService } from './soundService';

type VoiceStateListener = (state: {
  isListening: boolean;
  transcript: string;
  isProcessing: boolean;
  responseMessage: string;
  confirmationDialog?: {
    message: string;
    action: () => void;
    cancelAction?: () => void;
  } | null;
}) => void;

class VoiceAssistantService {
  private recognition: any = null;
  private isListening = false;
  private listeners: Set<VoiceStateListener> = new Set();
  private currentTranscript = '';
  private isProcessing = false;
  private responseMessage = '';
  private pendingConfirmation: {
    message: string;
    action: () => void;
    cancelAction?: () => void;
  } | null = null;

  private actionHandlers: {
    onNavigate?: (screen: string) => void;
    onSearchDoctors?: (params: { query?: string; specialization?: string; maxFee?: number }) => void;
    onBookAppointmentRequest?: (params: { doctorName?: string; date?: string; time?: string }) => void;
    onCancelAppointmentRequest?: (params: { appointmentId?: string; doctorName?: string }) => void;
    onRescheduleRequest?: (params: { appointmentId?: string; doctorName?: string; newDate?: string; newTime?: string }) => void;
    onReadPrescription?: (action?: string) => void;
    onStartConsultation?: (appointmentId?: string) => void;
    onTriggerEmergency?: () => void;
    onChangeAccessibilityMode?: (mode: AccessibilityMode) => void;
    onShowNotifications?: () => void;
  } = {};

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.currentTranscript = '';
          soundService.playMicStart();
          this.notifyListeners();
        };

        this.recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              this.currentTranscript = event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          if (interim) {
            this.currentTranscript = interim;
          }
          this.notifyListeners();
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice/error:', event.error);
          this.isListening = false;
          soundService.playMicStop();
          this.notifyListeners();
        };

        this.recognition.onend = () => {
          this.isListening = false;
          soundService.playMicStop();
          if (this.currentTranscript.trim()) {
            this.processCommand(this.currentTranscript.trim());
          }
          this.notifyListeners();
        };
      } catch (e) {
        console.error('Failed to initialize SpeechRecognition:', e);
      }
    }
  }

  public registerActionHandlers(handlers: typeof this.actionHandlers) {
    this.actionHandlers = { ...this.actionHandlers, ...handlers };
  }

  public subscribe(listener: VoiceStateListener) {
    this.listeners.add(listener);
    listener({
      isListening: this.isListening,
      transcript: this.currentTranscript,
      isProcessing: this.isProcessing,
      responseMessage: this.responseMessage,
      confirmationDialog: this.pendingConfirmation,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) =>
      listener({
        isListening: this.isListening,
        transcript: this.currentTranscript,
        isProcessing: this.isProcessing,
        responseMessage: this.responseMessage,
        confirmationDialog: this.pendingConfirmation,
      })
    );
  }

  public startListening() {
    if (this.isListening) return;

    if (this.recognition) {
      try {
        this.currentTranscript = '';
        this.responseMessage = '';
        this.recognition.start();
      } catch (err) {
        // Recognition might already be running or blocked
        console.warn('Speech recognition start failed, using fallback:', err);
      }
    } else {
      // Fallback for browsers without speech recognition
      soundService.announce('Speech recognition is not supported in this browser. Please use text commands.');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {}
    }
    this.isListening = false;
    this.notifyListeners();
  }

  // Handle Voice Confirmation ("Yes", "Confirm", "No", "Cancel")
  public handleConfirmationResponse(confirmed: boolean) {
    if (!this.pendingConfirmation) return;

    const dialog = this.pendingConfirmation;
    this.pendingConfirmation = null;

    if (confirmed) {
      soundService.playSuccess();
      dialog.action();
    } else {
      soundService.playError();
      if (dialog.cancelAction) {
        dialog.cancelAction();
      } else {
        this.speakAndSetMessage('Action cancelled.');
      }
    }
    this.notifyListeners();
  }

  public async processCommand(rawCommand: string) {
    const command = rawCommand.trim();
    if (!command) return;

    this.isProcessing = true;
    this.currentTranscript = command;
    this.notifyListeners();

    // Check if we are waiting for a pending confirmation (e.g. User said "Yes", "Confirm", "Cancel", "No")
    if (this.pendingConfirmation) {
      const lower = command.toLowerCase();
      if (lower.includes('yes') || lower.includes('confirm') || lower.includes('book') || lower.includes('sure') || lower.includes('do it')) {
        this.isProcessing = false;
        this.handleConfirmationResponse(true);
        return;
      } else if (lower.includes('no') || lower.includes('cancel') || lower.includes('stop') || lower.includes('don\'t')) {
        this.isProcessing = false;
        this.handleConfirmationResponse(false);
        return;
      }
    }

    try {
      // First attempt Gemini AI intent detection via server
      const res = await fetch('/api/ai/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      if (res.ok) {
        const intentResult: VoiceIntentResult = await res.json();
        this.executeIntent(intentResult, command);
        return;
      }
    } catch (e) {
      console.warn('Server Gemini NLU offline or delayed, falling back to local NLU engine:', e);
    }

    // Fallback to local high-precision rule & synonym engine
    const fallbackIntent = this.detectIntentLocally(command);
    this.executeIntent(fallbackIntent, command);
  }

  private detectIntentLocally(command: string): VoiceIntentResult {
    const text = command.toLowerCase();

    // Emergency
    if (text.includes('emergency') || text.includes('ambulance') || text.includes('urgent help') || text.includes('help me')) {
      return {
        intent: 'EMERGENCY',
        parameters: {},
        spokenResponse: 'Opening emergency assistance. Please confirm if you need an ambulance or urgent help.',
        requiresConfirmation: true,
        confirmationMessage: 'Do you want to initiate an emergency call and alert nearby services?',
      };
    }

    // Accessibility Mode
    if (text.includes('visually impaired') || text.includes('blind mode') || text.includes('vision mode')) {
      return {
        intent: 'CHANGE_ACCESSIBILITY_MODE',
        parameters: { mode: 'visually_impaired' },
        spokenResponse: 'Switched accessibility mode to Visually Impaired. High contrast and voice narration activated.',
      };
    }
    if (text.includes('hearing impaired') || text.includes('deaf mode')) {
      return {
        intent: 'CHANGE_ACCESSIBILITY_MODE',
        parameters: { mode: 'hearing_impaired' },
        spokenResponse: 'Switched accessibility mode to Hearing Impaired. Live captions and visual alerts activated.',
      };
    }
    if (text.includes('speech impaired') || text.includes('cannot speak') || text.includes('speech mode')) {
      return {
        intent: 'CHANGE_ACCESSIBILITY_MODE',
        parameters: { mode: 'speech_impaired' },
        spokenResponse: 'Switched accessibility mode to Speech Impaired. AAC communication board and sign language detection enabled.',
      };
    }
    if (text.includes('normal mode') || text.includes('default mode')) {
      return {
        intent: 'CHANGE_ACCESSIBILITY_MODE',
        parameters: { mode: 'normal' },
        spokenResponse: 'Switched accessibility mode to standard normal view.',
      };
    }

    // Prescription reading
    if (text.includes('read prescription') || text.includes('read my prescription') || text.includes('read medicine') || text.includes('voice prescription')) {
      return {
        intent: 'READ_PRESCRIPTION',
        parameters: { action: 'start' },
        spokenResponse: 'Reading your digital prescription.',
      };
    }
    if (text.includes('next medicine')) {
      return {
        intent: 'READ_PRESCRIPTION',
        parameters: { action: 'next' },
        spokenResponse: 'Reading next medicine in your prescription.',
      };
    }
    if (text.includes('repeat that') || text.includes('repeat medicine')) {
      return {
        intent: 'READ_PRESCRIPTION',
        parameters: { action: 'repeat' },
        spokenResponse: 'Repeating current medicine.',
      };
    }
    if (text.includes('stop reading') || text.includes('stop prescription')) {
      return {
        intent: 'READ_PRESCRIPTION',
        parameters: { action: 'stop' },
        spokenResponse: 'Prescription reading stopped.',
      };
    }
    if (text.includes('prescription') || text.includes('prescriptions')) {
      return {
        intent: 'VIEW_PRESCRIPTION',
        parameters: {},
        spokenResponse: 'Opening your digital prescriptions.',
      };
    }

    // Appointment Booking (e.g. "Book Dr. Sharma tomorrow at 5 PM")
    if (text.includes('book') || text.includes('schedule') || text.includes('appointment with')) {
      let doctorName = 'Dr. Priya Sharma';
      if (text.includes('verma')) doctorName = 'Dr. Rajesh Verma';
      if (text.includes('iyer')) doctorName = 'Dr. Ananya Iyer';
      if (text.includes('patel')) doctorName = 'Dr. Vikram Patel';
      if (text.includes('menon')) doctorName = 'Dr. Sunita Menon';
      if (text.includes('malhotra')) doctorName = 'Dr. Amit Malhotra';

      let time = '17:00';
      if (text.includes('10 am') || text.includes('10:00')) time = '10:00';
      if (text.includes('11 am') || text.includes('11:00')) time = '11:00';
      if (text.includes('2 pm') || text.includes('14:00')) time = '14:00';
      if (text.includes('4 pm') || text.includes('16:00')) time = '16:00';
      if (text.includes('5 pm') || text.includes('17:00')) time = '17:00';

      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      const date = text.includes('tomorrow') ? tomorrow : today;

      return {
        intent: 'BOOK_APPOINTMENT',
        parameters: { doctorName, date, time },
        spokenResponse: `${doctorName} is available ${text.includes('tomorrow') ? 'tomorrow' : 'today'} at ${time}. Should I book this appointment for you?`,
        requiresConfirmation: true,
        confirmationMessage: `Dr. Priya Sharma is available tomorrow at 5 PM. Should I book the appointment?`,
      };
    }

    // Consultation
    if (text.includes('start consultation') || text.includes('call my doctor') || text.includes('join call') || text.includes('video call') || text.includes('start call')) {
      return {
        intent: 'START_CONSULTATION',
        parameters: {},
        spokenResponse: 'Connecting you to your secure telemedicine consultation room.',
      };
    }

    // Appointments management
    if (text.includes('next appointment') || text.includes('when is my next') || text.includes('upcoming appointment')) {
      return {
        intent: 'VIEW_APPOINTMENTS',
        parameters: { filter: 'upcoming' },
        spokenResponse: 'Your next consultation is with Dr. Priya Sharma today at 5:00 PM for cardiology review.',
      };
    }
    if (text.includes('cancel my appointment') || text.includes('cancel appointment')) {
      return {
        intent: 'CANCEL_APPOINTMENT',
        parameters: {},
        spokenResponse: 'Are you sure you want to cancel your upcoming appointment with Dr. Priya Sharma?',
        requiresConfirmation: true,
        confirmationMessage: 'Confirm cancelling your appointment with Dr. Priya Sharma?',
      };
    }
    if (text.includes('appointments') || text.includes('my bookings')) {
      return {
        intent: 'VIEW_APPOINTMENTS',
        parameters: {},
        spokenResponse: 'Opening your appointments dashboard.',
      };
    }

    // Doctor Search / Specializations
    if (text.includes('cardiologist') || text.includes('heart doctor') || text.includes('heart specialist') || text.includes('chest pain')) {
      return {
        intent: 'SEARCH_DOCTOR',
        parameters: { specialization: 'Cardiology' },
        spokenResponse: 'Finding top cardiologists. Dr. Priya Sharma with 12 years experience is available.',
      };
    }
    if (text.includes('dermatologist') || text.includes('skin doctor') || text.includes('rash') || text.includes('skin specialist')) {
      return {
        intent: 'SEARCH_DOCTOR',
        parameters: { specialization: 'Dermatology' },
        spokenResponse: 'Found Dr. Ananya Iyer, specialist in Dermatology and skin care.',
      };
    }
    if (text.includes('neurologist') || text.includes('brain doctor') || text.includes('headache specialist') || text.includes('nerve')) {
      return {
        intent: 'SEARCH_DOCTOR',
        parameters: { specialization: 'Neurology' },
        spokenResponse: 'Found Dr. Rajesh Verma, Consultant Neurologist at Advanced Brain & Spine Center.',
      };
    }
    if (text.includes('pediatrician') || text.includes('child doctor') || text.includes('baby doctor')) {
      return {
        intent: 'SEARCH_DOCTOR',
        parameters: { specialization: 'Pediatrics' },
        spokenResponse: 'Found Dr. Sunita Menon, Senior Pediatrician at Little Angels Hospital.',
      };
    }
    if (text.includes('orthopedic') || text.includes('bone doctor') || text.includes('joint pain') || text.includes('fracture')) {
      return {
        intent: 'SEARCH_DOCTOR',
        parameters: { specialization: 'Orthopedics' },
        spokenResponse: 'Found Dr. Amit Malhotra, Orthopedic and Joint Specialist.',
      };
    }
    if (text.includes('under 500') || text.includes('below 500') || text.includes('cheap') || text.includes('affordable')) {
      return {
        intent: 'FILTER_DOCTOR',
        parameters: { maxFee: 500 },
        spokenResponse: 'Showing verified doctors with consultation fee of 500 rupees or less.',
      };
    }
    if (text.includes('find doctor') || text.includes('search doctor') || text.includes('doctors near me')) {
      return {
        intent: 'SEARCH_DOCTOR',
        parameters: {},
        spokenResponse: 'Opening doctor search. You can filter by specialty, fee, or rating.',
      };
    }

    // Notifications
    if (text.includes('notification') || text.includes('notifications') || text.includes('alerts')) {
      return {
        intent: 'VIEW_NOTIFICATIONS',
        parameters: {},
        spokenResponse: 'Reading your notifications: You have a consultation confirmed today at 5:00 PM with Dr. Priya Sharma.',
      };
    }

    // Navigation
    if (text.includes('go home') || text.includes('home') || text.includes('main screen')) {
      return {
        intent: 'GO_HOME',
        parameters: {},
        spokenResponse: 'Navigating to home.',
      };
    }
    if (text.includes('go back') || text.includes('back')) {
      return {
        intent: 'GO_BACK',
        parameters: {},
        spokenResponse: 'Going back to the previous screen.',
      };
    }
    if (text.includes('profile') || text.includes('my account')) {
      return {
        intent: 'OPEN_PROFILE',
        parameters: {},
        spokenResponse: 'Opening your patient profile and medical information.',
      };
    }
    if (text.includes('settings') || text.includes('accessibility settings')) {
      return {
        intent: 'OPEN_SETTINGS',
        parameters: {},
        spokenResponse: 'Opening accessibility settings.',
      };
    }

    return {
      intent: 'UNKNOWN',
      parameters: { query: command },
      spokenResponse: `I heard: "${command}". How can I help you with doctors, appointments, or prescriptions?`,
    };
  }

  private executeIntent(intentResult: VoiceIntentResult, originalCommand: string) {
    this.isProcessing = false;
    const { intent, parameters, spokenResponse, requiresConfirmation, confirmationMessage } = intentResult;

    if (requiresConfirmation && (confirmationMessage || spokenResponse)) {
      this.pendingConfirmation = {
        message: confirmationMessage || spokenResponse,
        action: () => {
          this.executeConfirmedAction(intent, parameters);
        },
      };
      this.speakAndSetMessage(confirmationMessage || spokenResponse);
      this.notifyListeners();
      return;
    }

    this.executeConfirmedAction(intent, parameters, spokenResponse);
  }

  private executeConfirmedAction(intent: string, parameters: Record<string, any>, responseText?: string) {
    const defaultSpoken = responseText || 'Action completed.';

    switch (intent) {
      case 'SEARCH_DOCTOR':
      case 'FILTER_DOCTOR':
        if (this.actionHandlers.onNavigate) this.actionHandlers.onNavigate('doctors');
        if (this.actionHandlers.onSearchDoctors) this.actionHandlers.onSearchDoctors(parameters);
        this.speakAndSetMessage(defaultSpoken);
        break;

      case 'BOOK_APPOINTMENT':
        if (this.actionHandlers.onBookAppointmentRequest) {
          this.actionHandlers.onBookAppointmentRequest(parameters);
        }
        this.speakAndSetMessage('Your appointment has been successfully booked with Dr. Priya Sharma.');
        soundService.playSuccess();
        break;

      case 'CANCEL_APPOINTMENT':
        if (this.actionHandlers.onCancelAppointmentRequest) {
          this.actionHandlers.onCancelAppointmentRequest(parameters);
        }
        this.speakAndSetMessage('Your appointment has been cancelled successfully.');
        break;

      case 'RESCHEDULE_APPOINTMENT':
        if (this.actionHandlers.onRescheduleRequest) {
          this.actionHandlers.onRescheduleRequest(parameters);
        }
        this.speakAndSetMessage('Your appointment has been rescheduled.');
        break;

      case 'VIEW_APPOINTMENTS':
        if (this.actionHandlers.onNavigate) this.actionHandlers.onNavigate('appointments');
        this.speakAndSetMessage(defaultSpoken);
        break;

      case 'START_CONSULTATION':
        if (this.actionHandlers.onNavigate) this.actionHandlers.onNavigate('consultation');
        if (this.actionHandlers.onStartConsultation) this.actionHandlers.onStartConsultation(parameters.appointmentId);
        this.speakAndSetMessage(defaultSpoken);
        break;

      case 'VIEW_PRESCRIPTION':
        if (this.actionHandlers.onNavigate) this.actionHandlers.onNavigate('prescriptions');
        this.speakAndSetMessage(defaultSpoken);
        break;

      case 'READ_PRESCRIPTION':
        if (this.actionHandlers.onNavigate) this.actionHandlers.onNavigate('prescriptions');
        if (this.actionHandlers.onReadPrescription) this.actionHandlers.onReadPrescription(parameters.action);
        this.speakAndSetMessage(defaultSpoken);
        break;

      case 'VIEW_NOTIFICATIONS':
        if (this.actionHandlers.onShowNotifications) this.actionHandlers.onShowNotifications();
        this.speakAndSetMessage(defaultSpoken);
        break;

      case 'OPEN_PROFILE':
        if (this.actionHandlers.onNavigate) this.actionHandlers.onNavigate('profile');
        this.speakAndSetMessage(defaultSpoken);
        break;

      case 'OPEN_SETTINGS':
        if (this.actionHandlers.onNavigate) this.actionHandlers.onNavigate('settings');
        this.speakAndSetMessage(defaultSpoken);
        break;

      case 'GO_HOME':
        if (this.actionHandlers.onNavigate) this.actionHandlers.onNavigate('home');
        this.speakAndSetMessage(defaultSpoken);
        break;

      case 'GO_BACK':
        if (this.actionHandlers.onNavigate) this.actionHandlers.onNavigate('back');
        this.speakAndSetMessage(defaultSpoken);
        break;

      case 'EMERGENCY':
        if (this.actionHandlers.onTriggerEmergency) this.actionHandlers.onTriggerEmergency();
        this.speakAndSetMessage('Emergency assistance activated. Finding immediate help.');
        break;

      case 'CHANGE_ACCESSIBILITY_MODE':
        if (parameters.mode && this.actionHandlers.onChangeAccessibilityMode) {
          this.actionHandlers.onChangeAccessibilityMode(parameters.mode as AccessibilityMode);
        }
        this.speakAndSetMessage(defaultSpoken);
        break;

      default:
        this.speakAndSetMessage(defaultSpoken);
        break;
    }

    this.notifyListeners();
  }

  public speakAndSetMessage(message: string) {
    this.responseMessage = message;
    this.notifyListeners();
    soundService.speak(message);
    soundService.announce(message, false);
  }
}

export const voiceService = new VoiceAssistantService();
