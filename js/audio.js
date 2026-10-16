/**
 * FocusFlow — Multi-Track Ambient Sound & Music Synthesizer
 * Provides procedural noise generators (Brown, White, Pink) and multi-channel
 * ambient mixer for custom study soundscapes with Web Audio API.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.masterGain = null;

    // Track definitions
    this.tracks = {
      brown: { node: null, gain: null, isPlaying: false, volume: 0.5, type: 'procedural' },
      white: { node: null, gain: null, isPlaying: false, volume: 0.3, type: 'procedural' },
      rain:  { node: null, gain: null, isPlaying: false, volume: 0.4, type: 'procedural_rain' },
      lofi:  { audio: null, isPlaying: false, volume: 0.5, type: 'lofi_player' }
    };

    this.lofiStreams = [
      { title: 'Chillhop Beats — Midnight Study', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
      { title: 'Cozy Rain & Warm Coffee', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=rain-and-nostalgia-chill-lofi-song-8493.mp3' },
      { title: 'Gentle Dreams Synthwave', url: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c937107f7f.mp3?filename=lofi-chill-medium-version-159456.mp3' }
    ];
    this.currentLofiIndex = 0;

    this.cacheDom();
    this.bindEvents();
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  cacheDom() {
    // Quick dock controls
    this.soundToggleBtn = document.getElementById('btn-sound-toggle');
    this.volumeSlider = document.getElementById('sound-volume-slider');
    this.volumeText = document.getElementById('sound-volume-text');
    this.statusBadge = document.getElementById('sound-status-badge');
    this.iconOff = document.getElementById('sound-icon-off');
    this.iconOn = document.getElementById('sound-icon-on');
    this.ambientMuteBtn = document.getElementById('btn-ambient-mute');

    // Mixer modal / drawer controls
    this.btnToggleMixer = document.getElementById('btn-toggle-mixer');
    this.mixerModal = document.getElementById('mixer-modal');
    this.btnCloseMixer = document.getElementById('btn-close-mixer');

    // Individual track controls in mixer
    this.mixerSwitches = document.querySelectorAll('.mixer-track-toggle');
    this.mixerSliders = document.querySelectorAll('.mixer-volume-slider');

    // Lofi player controls
    this.btnLofiPlay = document.getElementById('btn-lofi-play');
    this.btnLofiNext = document.getElementById('btn-lofi-next');
    this.lofiTrackTitle = document.getElementById('lofi-track-title');
  }

  bindEvents() {
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => this.toggleTrack('brown'));
    }

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        this.setTrackVolume('brown', val);
        if (this.volumeText) this.volumeText.textContent = `${e.target.value}%`;
      });
    }

    if (this.ambientMuteBtn) {
      this.ambientMuteBtn.addEventListener('click', () => this.toggleMasterMute());
    }

    if (this.btnToggleMixer) {
      this.btnToggleMixer.addEventListener('click', () => this.toggleMixerModal());
    }

    if (this.btnCloseMixer) {
      this.btnCloseMixer.addEventListener('click', () => this.closeMixerModal());
    }

    // Modal track controls
    this.mixerSwitches.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const trackName = e.target.dataset.track;
        if (e.target.checked) {
          this.startTrack(trackName);
        } else {
          this.stopTrack(trackName);
        }
      });
    });

    this.mixerSliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const trackName = e.target.dataset.track;
        const val = parseFloat(e.target.value) / 100;
        this.setTrackVolume(trackName, val);
      });
    });

    // Lofi Beats Player
    if (this.btnLofiPlay) {
      this.btnLofiPlay.addEventListener('click', () => this.toggleLofi());
    }
    if (this.btnLofiNext) {
      this.btnLofiNext.addEventListener('click', () => this.nextLofiTrack());
    }
  }

  toggleMasterMute() {
    this.ensureAudioContext();
    this.isMuted = !this.isMuted;
    if (this.ambientMuteBtn) {
      this.ambientMuteBtn.style.opacity = this.isMuted ? '0.4' : '1';
    }
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.audioCtx.currentTime);
    }
    if (this.tracks.lofi.audio) {
      this.tracks.lofi.audio.muted = this.isMuted;
    }
  }

  toggleMixerModal() {
    if (this.mixerModal) {
      this.mixerModal.classList.toggle('hidden');
    }
  }

  closeMixerModal() {
    if (this.mixerModal) {
      this.mixerModal.classList.add('hidden');
    }
  }

  /* ---------------- Sound Generators ---------------- */

  createBrownNoiseBuffer() {
    const bufferSize = this.audioCtx.sampleRate * 5;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }

  createWhiteNoiseBuffer() {
    const bufferSize = this.audioCtx.sampleRate * 4;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    return buffer;
  }

  startTrack(trackName) {
    this.ensureAudioContext();
    const track = this.tracks[trackName];
    if (!track || track.isPlaying) return;

    if (trackName === 'brown') {
      const noiseBuffer = this.createBrownNoiseBuffer();
      track.node = this.audioCtx.createBufferSource();
      track.node.buffer = noiseBuffer;
      track.node.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.audioCtx.currentTime);

      track.gain = this.audioCtx.createGain();
      track.gain.gain.setValueAtTime(track.volume, this.audioCtx.currentTime);

      track.node.connect(filter);
      filter.connect(track.gain);
      track.gain.connect(this.masterGain);
      track.node.start();
      track.isPlaying = true;
      this.updateDockUI(true);

    } else if (trackName === 'white') {
      const buffer = this.createWhiteNoiseBuffer();
      track.node = this.audioCtx.createBufferSource();
      track.node.buffer = buffer;
      track.node.loop = true;

      track.gain = this.audioCtx.createGain();
      track.gain.gain.setValueAtTime(track.volume * 0.4, this.audioCtx.currentTime);

      track.node.connect(track.gain);
      track.gain.connect(this.masterGain);
      track.node.start();
      track.isPlaying = true;

    } else if (trackName === 'rain') {
      // Procedural soft rain using white noise passed through bandpass filters with random bursts
      const buffer = this.createWhiteNoiseBuffer();
      track.node = this.audioCtx.createBufferSource();
      track.node.buffer = buffer;
      track.node.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      filter.Q.setValueAtTime(0.8, this.audioCtx.currentTime);

      track.gain = this.audioCtx.createGain();
      track.gain.gain.setValueAtTime(track.volume * 0.8, this.audioCtx.currentTime);

      track.node.connect(filter);
      filter.connect(track.gain);
      track.gain.connect(this.masterGain);
      track.node.start();
      track.isPlaying = true;

    } else if (trackName === 'lofi') {
      this.playLofi();
    }

    this.syncMixerUI(trackName, true);
  }

  stopTrack(trackName) {
    const track = this.tracks[trackName];
    if (!track || !track.isPlaying) return;

    if (track.node) {
      try {
        track.node.stop();
        track.node.disconnect();
      } catch (e) {}
      track.node = null;
    }

    if (trackName === 'lofi' && track.audio) {
      track.audio.pause();
    }

    track.isPlaying = false;
    if (trackName === 'brown') {
      this.updateDockUI(false);
    }
    this.syncMixerUI(trackName, false);
  }

  toggleTrack(trackName) {
    if (this.tracks[trackName]?.isPlaying) {
      this.stopTrack(trackName);
    } else {
      this.startTrack(trackName);
    }
  }

  setTrackVolume(trackName, volume) {
    const track = this.tracks[trackName];
    if (!track) return;
    track.volume = volume;

    if (track.gain && this.audioCtx) {
      track.gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    }
    if (trackName === 'lofi' && track.audio) {
      track.audio.volume = volume;
    }
  }

  /* ---------------- Lofi Beats Player ---------------- */

  toggleLofi() {
    if (this.tracks.lofi.isPlaying) {
      this.stopTrack('lofi');
      if (this.btnLofiPlay) this.btnLofiPlay.textContent = 'Play';
    } else {
      this.startTrack('lofi');
      if (this.btnLofiPlay) this.btnLofiPlay.textContent = 'Pause';
    }
  }

  playLofi() {
    const current = this.lofiStreams[this.currentLofiIndex];
    if (!this.tracks.lofi.audio) {
      this.tracks.lofi.audio = new Audio();
      this.tracks.lofi.audio.crossOrigin = 'anonymous';
      this.tracks.lofi.audio.loop = true;
    }

    this.tracks.lofi.audio.src = current.url;
    this.tracks.lofi.audio.volume = this.tracks.lofi.volume;
    this.tracks.lofi.audio.muted = this.isMuted;
    
    this.tracks.lofi.audio.play().then(() => {
      this.tracks.lofi.isPlaying = true;
      if (this.lofiTrackTitle) this.lofiTrackTitle.textContent = current.title;
      this.syncMixerUI('lofi', true);
    }).catch(err => {
      console.warn('Lofi stream autoplay failed, fallback ready', err);
    });
  }

  nextLofiTrack() {
    this.currentLofiIndex = (this.currentLofiIndex + 1) % this.lofiStreams.length;
    if (this.tracks.lofi.isPlaying) {
      this.playLofi();
    } else {
      if (this.lofiTrackTitle) this.lofiTrackTitle.textContent = this.lofiStreams[this.currentLofiIndex].title;
    }
  }

  /* ---------------- UI Synchronization ---------------- */

  updateDockUI(playing) {
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

  syncMixerUI(trackName, isPlaying) {
    const toggle = document.querySelector(`.mixer-track-toggle[data-track="${trackName}"]`);
    if (toggle) toggle.checked = isPlaying;
  }

  playSessionChime() {
    this.ensureAudioContext();
    const now = this.audioCtx.currentTime;
    const notes = [528, 660, 792];

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.25 / (idx + 1), now + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 2.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 3.0);
    });
  }
}

// Global SoundEngine instance
window.soundEngine = new SoundEngine();
