// ============================================================================
// FINIS TEMPORIS · 《时间的尽头》
// Procedural WebAudio Cosmic Organ, Relativistic Escapement & Relic Chimes
// ============================================================================

export class ChronoAudioEngine {
  constructor() {
    this.ctx = null;
    this.isEnabled = false;
    this.masterGain = null;
    this.filterNode = null;
    this.oscillators = [];
    this.tickAccumulator = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.0;

    // Warm low-pass filter for cosmic organ pad
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 340;
    this.filterNode.Q.value = 2.2;

    // Stereo feedback delay for cathedral/cosmos space
    this.delayL = this.ctx.createDelay(2.0);
    this.delayR = this.ctx.createDelay(2.0);
    this.delayL.delayTime.value = 0.38;
    this.delayR.delayTime.value = 0.52;

    const fbGain = this.ctx.createGain();
    fbGain.gain.value = 0.36;

    this.filterNode.connect(this.masterGain);
    this.filterNode.connect(this.delayL);
    this.delayL.connect(this.delayR);
    this.delayR.connect(fbGain);
    fbGain.connect(this.delayL);
    this.delayR.connect(this.masterGain);

    this.masterGain.connect(this.ctx.destination);

    // Interstellar-inspired warm cosmic drone chord (D minor 9 / suspended fifths)
    const baseFreqs = [55.0, 82.41, 110.0, 164.81, 220.0, 246.94, 329.63];
    baseFreqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i < 2 ? 'sawtooth' : i % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (i - 3) * 4.5;

      gain.gain.value = i < 2 ? 0.045 : 0.028;
      osc.connect(gain);
      gain.connect(this.filterNode);
      osc.start();
      this.oscillators.push({ osc, gain, baseFreq: freq });
    });
  }

  toggle() {
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isEnabled = !this.isEnabled;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(this.isEnabled ? 0.42 : 0.0, now, 0.45);
    return this.isEnabled;
  }

  update(dt, timeScale, cursorActive) {
    if (!this.isEnabled || !this.ctx) return;

    const now = this.ctx.currentTime;
    const absScale = Math.abs(timeScale);

    // Modulate filter cutoff by time velocity & cursor gravity
    const targetCutoff = 180 + absScale * 220 + (cursorActive ? 240 : 0);
    this.filterNode.frequency.setTargetAtTime(Math.min(targetCutoff, 1600), now, 0.12);

    // Subtle pitch bend when time reverses or dilates
    const detuneShift = timeScale < 0 ? -120 : (absScale - 1.0) * 35;
    this.oscillators.forEach((item, idx) => {
      item.osc.detune.setTargetAtTime((idx - 3) * 4.5 + detuneShift, now, 0.2);
    });

    // Relativistic escapement tick (proportional to proper time flow)
    this.tickAccumulator += dt * absScale;
    if (this.tickAccumulator >= 1.0 && absScale > 0.04) {
      this.tickAccumulator = 0;
      this._triggerClockTick(timeScale < 0);
    }
  }

  _triggerClockTick(isReversed = false) {
    if (!this.isEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const pitch = isReversed ? 980 : 1320;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.045);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playRelicChime(relicId = 0) {
    if (!this.isEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    // Lydian cosmic scale frequencies
    const scale = [440, 493.88, 554.37, 622.25, 659.25, 739.99, 830.61, 880, 987.77, 1108.73, 1244.5, 1318.5];
    const freq = scale[relicId % scale.length];

    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    overtone.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    overtone.frequency.setValueAtTime(freq * 2.0, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);

    osc.connect(gain);
    overtone.connect(gain);
    gain.connect(this.delayL);
    gain.connect(this.masterGain);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 1.5);
    overtone.stop(now + 1.5);
  }

  playCollapsePulse() {
    if (!this.isEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    sub.type = 'sine';
    sub.frequency.setValueAtTime(140, now);
    sub.frequency.exponentialRampToValueAtTime(28, now + 1.8);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.1);

    sub.connect(gain);
    gain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 2.2);
  }
}
