/**
 * Audio Feedback Utility
 * Provides non-intrusive audio feedback for study session events.
 * Uses Web Audio API to generate sounds programmatically (no external assets needed).
 */

class AudioFeedbackService {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  /**
   * Play an alert/notification sound for pause events
   */
  playPauseAlert(): void {
    if (!this.isEnabled) return;

    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Create a gentle alert sound (two-tone chime)
      const oscillator1 = ctx.createOscillator();
      const oscillator2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(ctx.destination);

      // First tone
      oscillator1.frequency.setValueAtTime(523.25, now); // C5
      oscillator1.type = 'sine';

      // Second tone (harmony)
      oscillator2.frequency.setValueAtTime(659.25, now); // E5
      oscillator2.type = 'sine';

      // Envelope for gentle fade
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.6);

      oscillator1.start(now);
      oscillator2.start(now);
      oscillator1.stop(now + 0.6);
      oscillator2.stop(now + 0.6);
    } catch (error) {
      console.warn('Audio feedback unavailable:', error);
    }
  }

  /**
   * Speak "Keep focusing" using Web Speech API
   */
  speakKeepFocusing(): void {
    if (!this.isEnabled) return;

    try {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance('Keep focusing');
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.7;

        // Use a calm voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
          v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
        ) || voices.find(v => v.lang.startsWith('en'));
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.warn('Speech synthesis unavailable:', error);
    }
  }

  /**
   * Play a positive/happy completion sound
   */
  playCompletionSound(): void {
    if (!this.isEnabled) return;

    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Create a happy ascending arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 - Major chord arpeggio
      const noteDuration = 0.15;
      const totalDuration = notes.length * noteDuration + 0.3;

      notes.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(freq, now);
        oscillator.type = 'sine';

        const noteStart = now + index * noteDuration;
        gainNode.gain.setValueAtTime(0, noteStart);
        gainNode.gain.linearRampToValueAtTime(0.25, noteStart + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.15, noteStart + noteDuration);
        gainNode.gain.linearRampToValueAtTime(0, noteStart + noteDuration + 0.2);

        oscillator.start(noteStart);
        oscillator.stop(noteStart + noteDuration + 0.3);
      });

      // Add a final sustained chord
      setTimeout(() => {
        const chordNotes = [523.25, 659.25, 783.99];
        chordNotes.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
        });
      }, notes.length * noteDuration * 1000);
    } catch (error) {
      console.warn('Audio feedback unavailable:', error);
    }
  }

  /**
   * Combined pause event handler - plays alert and speaks
   */
  onSessionPause(): void {
    this.playPauseAlert();
    // Slight delay for speech to not overlap with sound
    setTimeout(() => {
      this.speakKeepFocusing();
    }, 400);
  }

  /**
   * Completion event handler
   */
  onSessionComplete(): void {
    this.playCompletionSound();
  }

  /**
   * Enable/disable audio feedback
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if audio feedback is enabled
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const audioFeedback = new AudioFeedbackService();
