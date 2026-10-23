/**
 * MediAccess AI Sound & Screen Reader Audio Accessibility Service
 * Uses Web Audio API for synthetic audio cues without external file dependencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundService = {
  // Gentle ascending chord on success or confirmation
  playSuccess: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } catch (e) {
      // Audio autoplay policy fallback
    }
  },

  // Soft high beep when microphone begins listening
  playMicStart: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  },

  // Soft lower tone when microphone stops
  playMicStop: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  },

  // Descending two-tone error cue
  playError: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  },

  // Emergency siren alert tone
  playEmergencySiren: (): (() => void) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return () => {};
      let isPlaying = true;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.2, now);

      // Oscillate frequency between 700Hz and 1200Hz
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 2; // 2 Hz sweep
      lfoGain.gain.value = 300;
      osc.frequency.value = 900;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      lfo.start(now);

      return () => {
        if (!isPlaying) return;
        isPlaying = false;
        try {
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          setTimeout(() => {
            osc.stop();
            lfo.stop();
          }, 150);
        } catch (err) {}
      };
    } catch (e) {
      return () => {};
    }
  },

  // Accessible screen reader announcement
  announce: (text: string, speakAloud: boolean = false) => {
    if (typeof document === 'undefined') return;

    let liveRegion = document.getElementById('mediaccess-sr-live');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'mediaccess-sr-live';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = '';
    setTimeout(() => {
      if (liveRegion) liveRegion.textContent = text;
    }, 50);

    if (speakAloud && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {}
    }
  },

  // Text-To-Speech speech synthesizer
  speak: (
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      gender?: 'female' | 'male';
      onEnd?: () => void;
    }
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        if (options?.gender === 'female') {
          const femaleVoice = voices.find(
            (v) =>
              v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('samantha') ||
              v.name.toLowerCase().includes('victoria') ||
              v.name.toLowerCase().includes('zira')
          );
          if (femaleVoice) utterance.voice = femaleVoice;
        } else if (options?.gender === 'male') {
          const maleVoice = voices.find(
            (v) =>
              v.name.toLowerCase().includes('male') ||
              v.name.toLowerCase().includes('david') ||
              v.name.toLowerCase().includes('alex') ||
              v.name.toLowerCase().includes('george')
          );
          if (maleVoice) utterance.voice = maleVoice;
        }
      }

      if (options?.onEnd) {
        utterance.onend = options.onEnd;
        utterance.onerror = options.onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      if (options?.onEnd) options.onEnd();
    }
  },

  stopSpeaking: () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },
};
