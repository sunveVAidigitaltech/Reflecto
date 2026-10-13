/**
 * REFLECTO - AUDIO & MELODY SYNTHESIZER
 * Pure procedural sound & music generation using Web Audio API.
 * High-fidelity, zero external asset dependencies, zero network latency.
 * Features:
 * - Cheerful, calming pastel ambient lullaby loop (pentatonic arpeggio)
 * - Candy mirror pops and rotation clicks
 * - Star wake-up chime & happy giggle bell
 * - Victory sequential star pops & fanfare
 */

class SoundFX {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicMuted = false;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.hasUnlocked = false;

    // Music playback state
    this.musicTimer = null;
    this.musicStep = 0;
    this.isMusicPlaying = false;

    // Load user preferences
    const savedMute = localStorage.getItem('reflecto_sfx_muted') || localStorage.getItem('aetheria_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }

    const savedMusicMute = localStorage.getItem('reflecto_music_muted');
    if (savedMusicMute !== null) {
      this.isMusicMuted = savedMusicMute === 'true';
    }
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Sub-bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music Sub-bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMusicMuted ? 0 : 0.18, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.hasUnlocked = true;

      // Start music if not muted
      if (!this.isMusicMuted) {
        this.startMusic();
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.isMusicPlaying && !this.isMusicMuted && this.ctx) {
      this.startMusic();
    }
  }

  // Toggle SFX Sound
  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    localStorage.setItem('reflecto_sfx_muted', this.isMuted.toString());
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Toggle Background Music
  toggleMusic() {
    this.ensureContext();
    this.isMusicMuted = !this.isMusicMuted;
    localStorage.setItem('reflecto_music_muted', this.isMusicMuted.toString());

    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.isMusicMuted ? 0 : 0.18, this.ctx.currentTime);
    }

    if (!this.isMusicMuted) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.isMusicMuted;
  }

  // =========================================================================
  // PROCEDURAL PASTEL BACKGROUND MELODY (Gentle Pentatonic Lullaby)
  // =========================================================================
  startMusic() {
    if (this.isMusicPlaying || this.isMusicMuted) return;
    this.isMusicPlaying = true;

    // 16-step soothing lullaby pattern (C Major Pentatonic: C4, D4, E4, G4, A4, C5)
    const melodyNotes = [
      261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
      392.00, 329.63, 440.00, 392.00, // G4, E4, A4, G4
      293.66, 329.63, 392.00, 440.00, // D4, E4, G4, A4
      523.25, 440.00, 392.00, 329.63  // C5, A4, G4, E4
    ];

    const bassNotes = [
      130.81, 130.81, 164.81, 164.81, // C3, C3, E3, E3
      174.61, 174.61, 196.00, 196.00  // F3, F3, G3, G3
    ];

    const stepInterval = 420; // ms per note (relaxed, cheerful pace)

    const tick = () => {
      if (!this.isMusicPlaying || this.isMusicMuted || !this.ctx) return;

      const now = this.ctx.currentTime;
      const mFreq = melodyNotes[this.musicStep % melodyNotes.length];

      // Play soft bell note
      this.playPluckNote(mFreq, now, 0.35, 0.12);

      // Play bass note every 2 steps
      if (this.musicStep % 2 === 0) {
        const bIdx = Math.floor(this.musicStep / 2) % bassNotes.length;
        const bFreq = bassNotes[bIdx];
        this.playPluckNote(bFreq, now, 0.65, 0.14, 'sine');
      }

      this.musicStep++;
      this.musicTimer = setTimeout(tick, stepInterval);
    };

    tick();
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  playPluckNote(freq, startTime, duration = 0.4, peakGain = 0.12, type = 'triangle') {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, startTime);
    filter.frequency.exponentialRampToValueAtTime(300, startTime + duration);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  // =========================================================================
  // JUICY SOUND EFFECTS
  // =========================================================================

  // Bubbly Candy Pop on mirror tap
  candyPop() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.07);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Mirror rotation click
  rotateClick() {
    this.candyPop();
  }

  // Star wake-up joyful chime
  starWakeupChime() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const chimeFrequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Joyful arpeggio)

    chimeFrequencies.forEach((freq, idx) => {
      const noteTime = now + idx * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.38);
    });
  }

  // Target crystal / star illuminated
  crystalHit() {
    this.starWakeupChime();
  }

  // Victory Star Award Ding (index 0, 1, 2)
  starAwardDing(index = 0) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const scale = [523.25, 659.25, 1046.50]; // C5, E5, C6
    const freq = scale[Math.min(index, scale.length - 1)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Level Win Fanfare (triumphant chord progression)
  victoryFanfare() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const chords = [
      { f: 523.25, t: 0.0 },   // C5
      { f: 659.25, t: 0.08 },  // E5
      { f: 783.99, t: 0.16 },  // G5
      { f: 1046.50, t: 0.28 }, // C6
      { f: 1318.51, t: 0.42 }  // E6
    ];

    chords.forEach((item) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, now + item.t);

      gain.gain.setValueAtTime(0.001, now + item.t);
      gain.gain.linearRampToValueAtTime(0.22, now + item.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + item.t);
      osc.stop(now + item.t + 0.65);
    });
  }

  // Grumpy Cloud Hit / Bump
  softThud() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Magic Donut Portal warp
  portalWarp() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  // Beam Splitter pulse
  splitterPulse() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    [660, 990].forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.23);
    });
  }

  // Color Filter tone
  filterTone() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.21);
  }

  // Undo step
  undoTick() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }
}

// Global audio singleton
window.soundFX = new SoundFX();
