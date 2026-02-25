// Sound utility using Web Audio API
// Generates synthesized sounds without external audio files

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return this.audioContext;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.3,
    fadeOut = true
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(volume, now);
    
    if (fadeOut) {
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    }

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Sound: Menu button click (short pleasant beep)
  playMenuClick(): void {
    this.playTone(440, 0.1, "sine", 0.2);
  }

  // Sound: Cell click (short blip)
  playCellClick(): void {
    this.playTone(880, 0.05, "square", 0.15);
  }

  // Sound: Correct answer (happy ascending chord)
  playCorrect(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Play ascending arpeggio
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = "sine";
      
      const startTime = now + index * 0.05;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.35);
    });
  }

  // Sound: Wrong answer (descending buzz)
  playWrong(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Play descending tones
    [300, 250, 200].forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = "sawtooth";
      
      const startTime = now + index * 0.08;
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }

  // Sound: Game finish / Victory (fanfare)
  playVictory(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0, duration: 0.2 },      // C5
      { freq: 523.25, time: 0.2, duration: 0.2 },    // C5
      { freq: 523.25, time: 0.4, duration: 0.2 },    // C5
      { freq: 659.25, time: 0.6, duration: 0.4 },    // E5
      { freq: 523.25, time: 1.0, duration: 0.4 },    // C5
      { freq: 783.99, time: 1.4, duration: 0.8 },    // G5
    ];

    notes.forEach(({ freq, time, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = "sine";
      
      const startTime = now + time;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }

  // Sound: Game Over (sad descending)
  playGameOver(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 349.23, time: 0, duration: 0.4 },      // F4
      { freq: 329.63, time: 0.3, duration: 0.4 },    // E4
      { freq: 311.13, time: 0.6, duration: 0.4 },    // D#4
      { freq: 293.66, time: 0.9, duration: 1.0 },    // D4
    ];

    notes.forEach(({ freq, time, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = "sawtooth";
      
      const startTime = now + time;
      gainNode.gain.setValueAtTime(0.25, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  resume(): void {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }
}

export const soundManager = new SoundManager();
