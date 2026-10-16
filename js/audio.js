/**
 * FocusFlow — Web Audio API Synthesizer & Procedural Sound Engine
 * Provides crystal bowl timer chime alerts and procedural Brown Noise generator.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.brownNoiseNode = null;
    this.brownNoiseGain = null;
    this.isNoisePlaying = false;
    this.noiseVolume = 0.5;

    this.initElements();
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initElements() {
    this.soundToggleBtn = document.getElementById('btn-sound-toggle');
    this.volumeSlider = document.getElementById('sound-volume-slider');
    this.volumeText = document.getElementById('sound-volume-text');
    this.statusBadge = document.getElementById('sound-status-badge');
    this.iconOff = document.getElementById('sound-icon-off');
    this.iconOn = document.getElementById('sound-icon-on');
    this.ambientMuteBtn = document.getElementById('btn-ambient-mute');

    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => this.toggleBrownNoise());
    }

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        this.noiseVolume = parseFloat(e.target.value) / 100;
        if (this.volumeText) this.volumeText.textContent = `${e.target.value}%`;
        if (this.brownNoiseGain) {
          this.brownNoiseGain.gain.setValueAtTime(this.isMuted ? 0 : this.noiseVolume, this.audioCtx.currentTime);
        }
      });
    }

    if (this.ambientMuteBtn) {
      this.ambientMuteBtn.addEventListener('click', () => {
        this.isMuted = !this.isMuted;
        this.ambientMuteBtn.style.opacity = this.isMuted ? '0.4' : '1';
        if (this.brownNoiseGain) {
          this.brownNoiseGain.gain.setValueAtTime(this.isMuted ? 0 : this.noiseVolume, this.audioCtx.currentTime);
        }
      });
    }
  }

  /**
   * Procedural Brown Noise generator using a 5-second looped AudioBuffer.
   * Brown noise has a 6dB/octave dropoff giving it a deep, soothing rumble.
   */
  createBrownNoiseBuffer() {
    const bufferSize = this.audioCtx.sampleRate * 5; // 5-second buffer
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Integrate white noise to create brownian noise
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 3.5; // Gain scaling
    }
    return buffer;
  }

  toggleBrownNoise() {
    this.ensureAudioContext();

    if (this.isNoisePlaying) {
      this.stopBrownNoise();
    } else {
      this.startBrownNoise();
    }
  }

  startBrownNoise() {
    if (this.isNoisePlaying) return;

    try {
      const noiseBuffer = this.createBrownNoiseBuffer();
      this.brownNoiseNode = this.audioCtx.createBufferSource();
      this.brownNoiseNode.buffer = noiseBuffer;
      this.brownNoiseNode.loop = true;

      // Soft low-pass filter to smooth edges
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.audioCtx.currentTime);

      this.brownNoiseGain = this.audioCtx.createGain();
      this.brownNoiseGain.gain.setValueAtTime(this.isMuted ? 0 : this.noiseVolume * 0.7, this.audioCtx.currentTime);

      this.brownNoiseNode.connect(filter);
      filter.connect(this.brownNoiseGain);
      this.brownNoiseGain.connect(this.audioCtx.destination);

      this.brownNoiseNode.start();
      this.isNoisePlaying = true;
      this.updateSoundUI(true);
    } catch (e) {
      console.error('Failed to start Brown Noise:', e);
    }
  }

  stopBrownNoise() {
    if (!this.isNoisePlaying) return;

    if (this.brownNoiseNode) {
      try {
        this.brownNoiseNode.stop();
        this.brownNoiseNode.disconnect();
      } catch (e) {}
      this.brownNoiseNode = null;
    }
    this.isNoisePlaying = false;
    this.updateSoundUI(false);
  }

  updateSoundUI(playing) {
    if (this.statusBadge) {
      this.statusBadge.textContent = playing ? 'Active' : 'Off';
      this.statusBadge.classList.toggle('active', playing);
    }
    if (this.soundToggleBtn) {
      this.soundToggleBtn.classList.toggle('active', playing);
    }
    if (this.iconOff && this.iconOn) {
      this.iconOff.classList.toggle('hidden', playing);
      this.iconOn.classList.toggle('hidden', !playing);
    }
  }

  /**
   * Plays a gentle, pleasant Tibetan singing bowl / crystal chime tone
   * to alert when a focus session or break period finishes.
   */
  playSessionChime() {
    this.ensureAudioContext();

    const now = this.audioCtx.currentTime;
    const notes = [528, 660, 792]; // Relaxing harmonic chord (Hz)

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.25 / (idx + 1), now + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 2.8);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 3.0);
    });
  }
}

// Global instance
window.soundEngine = new SoundEngine();
