/**
 * SNAKE EVOLUTION - Web Audio API Procedural Synthesizer
 * Zero external audio files, 100% offline, low-latency procedural sound effects & background music
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMutedSfx = false;
  private isMutedMusic = false;
  private isHapticsEnabled = true;

  // Music loop state
  private musicIntervalId: number | null = null;
  private musicStep = 0;
  private isMusicPlaying = false;

  private initContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(this.isMutedSfx ? 0 : 0.8, this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(this.isMutedMusic ? 0 : 0.28, this.ctx.currentTime);

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // AudioContext unavailable
    }
  }

  public setSoundFxEnabled(enabled: boolean) {
    this.isMutedSfx = !enabled;
    if (this.ctx && this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(enabled ? 0.8 : 0, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMutedMusic = !enabled;
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(enabled ? 0.28 : 0, this.ctx.currentTime, 0.05);
    }
    if (!enabled && this.isMusicPlaying) {
      this.stopMusic();
    } else if (enabled && !this.isMusicPlaying) {
      this.startMusic();
    }
  }

  public setHapticsEnabled(enabled: boolean) {
    this.isHapticsEnabled = enabled;
  }

  public triggerHaptic(pattern: number | number[] = 15) {
    if (!this.isHapticsEnabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignored
      }
    }
  }

  /**
   * Sound when normal food is consumed.
   * Pitch scales slightly with current combo streak!
   */
  public playEat(combo = 1) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMutedSfx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Base pitch rises with combo
    const baseFreq = 440 + Math.min(combo, 8) * 45;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);

    this.triggerHaptic(12);
  }

  /**
   * Golden apple sparkle sound - fast bright ascending triad
   */
  public playGolden() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMutedSfx) return;

    const t = this.ctx.currentTime;
    const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = t + idx * 0.045;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.3, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.17);
    });

    this.triggerHaptic([18, 30, 25]);
  }

  /**
   * Power-up pickup sound (Shield, Slow, Bonus 2X)
   */
  public playPowerup() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMutedSfx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(960, t + 0.18);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.linearRampToValueAtTime(3200, t + 0.18);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);

    this.triggerHaptic([20, 40, 20]);
  }

  /**
   * Shield absorbs a lethal hit
   */
  public playShieldAbsorb() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMutedSfx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.25);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.25);

    this.triggerHaptic([35, 30, 45]);
  }

  /**
   * Impact / Game Over crunch sound
   */
  public playCrash() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMutedSfx) return;

    const t = this.ctx.currentTime;

    // Sub rumble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.38);

    this.triggerHaptic([60, 40, 90]);
  }

  /**
   * Level up / Victory fanfare
   */
  public playFanfare() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMutedSfx) return;

    const t = this.ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.0 }, // C5
      { freq: 659.25, time: 0.1 }, // E5
      { freq: 783.99, time: 0.2 }, // G5
      { freq: 1046.5, time: 0.32 }, // C6 (held)
    ];

    notes.forEach((n, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteStart = t + n.time;
      const duration = i === 3 ? 0.45 : 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, noteStart);

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.35, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(noteStart);
      osc.stop(noteStart + duration);
    });

    this.triggerHaptic([30, 50, 30, 50, 60]);
  }

  /**
   * Clean mechanical UI button tap
   */
  public playUiTap() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMutedSfx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.04);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.045);

    this.triggerHaptic(8);
  }

  /**
   * Procedural background music loop
   * A gentle, rhythmic synthwave bass and arpeggio that loops seamlessly
   */
  public startMusic() {
    if (this.isMusicPlaying || this.isMutedMusic) return;
    this.initContext();
    if (!this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    this.musicStep = 0;

    // Pentatonic ambient pattern: D minor / F major
    const bassline = [146.83, 146.83, 174.61, 196.0, 146.83, 146.83, 220.0, 196.0]; // D3, D3, F3, G3, D3, D3, A3, G3
    const lead = [440.0, 523.25, 587.33, 659.25, 587.33, 523.25, 440.0, 392.0];

    const stepDuration = 250; // ms per 16th/8th note

    this.musicIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMutedMusic) return;

      const t = this.ctx.currentTime;
      const step = this.musicStep % 8;

      // Bass note
      if (step % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassline[step], t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, t);
        filter.frequency.exponentialRampToValueAtTime(160, t + 0.3);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(t);
        osc.stop(t + 0.32);
      }

      // Soft melodic ambient drop on every 4th step
      if (step === 2 || step === 6) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(lead[step], t);

        leadGain.gain.setValueAtTime(0, t);
        leadGain.gain.linearRampToValueAtTime(0.1, t + 0.05);
        leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        leadOsc.connect(leadGain);
        leadGain.connect(this.musicGain);

        leadOsc.start(t);
        leadOsc.stop(t + 0.45);
      }

      this.musicStep++;
    }, stepDuration);
  }

  public stopMusic() {
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    this.isMusicPlaying = false;
  }
}

export const audio = new AudioManager();
