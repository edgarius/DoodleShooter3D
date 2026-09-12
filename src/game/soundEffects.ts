// Synthesizer for 100% web-native playful sound effects & doodle background music
class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isMusicMuted: boolean = false;
  private musicInterval: number | null = null;
  private musicStep: number = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playShoot(type: 'clip' | 'pencil' | 'crayon' | 'ball') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'clip' || type === 'ball') {
      // Clothespin click & metal snap ping
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.09);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } else if (type === 'pencil') {
      // Fast automatic rifle graphite tap
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(920, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } else {
      // Heavy crayon shotgun boom: multiple fast bursts
      [420, 310, 220, 160].forEach((freq, i) => {
        if (!this.ctx) return;
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'square';
        subOsc.frequency.setValueAtTime(freq, t + i * 0.015);
        subOsc.frequency.exponentialRampToValueAtTime(80, t + i * 0.015 + 0.12);
        subGain.gain.setValueAtTime(0.14, t + i * 0.015);
        subGain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.015 + 0.12);
        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(t + i * 0.015);
        subOsc.stop(t + i * 0.015 + 0.12);
      });
    }
  }

  // Enemy shoots ink projectile
  public playEnemyShoot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.12);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Ammo pickup sound
  public playAmmoPickup() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [440, 660, 880].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.05);
      gain.gain.setValueAtTime(0.16, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.05 + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.1);
    });
  }

  public playHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playEnemyDefeated() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Cheerful comic pop: rapid rising chirp followed by paper poof
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(540, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.22);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playPlayerHurt() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.15);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playReload() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Paper rustle sound sequence
    [0, 0.15, 0.35].forEach((offset, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400 + idx * 80, t + offset);
      osc.frequency.linearRampToValueAtTime(600 + idx * 100, t + offset + 0.08);
      gain.gain.setValueAtTime(0.15, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.08);
    });
  }

  public playPowerup() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, High C
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.2, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.2);
    });
  }

  public playWaveClear() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [392, 523.25, 659.25, 783.99]; // G, C, E, G
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(0.22, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.35);
    });
  }

  // Playful doodle background music loop
  public startMusic() {
    if (this.musicInterval) return;
    this.initContext();

    const melody = [
      261.63, 293.66, 329.63, 392.0, 329.63, 293.66, 261.63, 0,
      329.63, 349.23, 392.0, 523.25, 392.0, 349.23, 329.63, 0,
      440.0, 392.0, 349.23, 329.63, 293.66, 261.63, 293.66, 0,
      261.63, 329.63, 392.0, 329.63, 293.66, 261.63, 261.63, 0
    ];

    this.musicInterval = window.setInterval(() => {
      if (this.isMuted || this.isMusicMuted || !this.ctx) return;
      const freq = melody[this.musicStep % melody.length];
      this.musicStep++;

      if (freq > 0) {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        // Low pass filter for soft toy-like sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, t);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.17);
      }
    }, 220);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public toggleMusic() {
    this.isMusicMuted = !this.isMusicMuted;
    return this.isMusicMuted;
  }
}

export const sounds = new SoundManager();
