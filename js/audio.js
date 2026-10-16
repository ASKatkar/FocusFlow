/**
 * FocusFlow — Upgraded Focus Music & Brainwave Sound Lab
 * Features 10 Lo-Fi, Piano & Ambient Study Tracks, Scientific Binaural Beats
 * (Alpha, Beta, Theta, Solfeggio frequencies), and Multi-Track Ambient Soundscapes.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.masterGain = null;

    // Ambient procedural tracks
    this.ambientTracks = {
      brown: { node: null, gain: null, isPlaying: false, volume: 0.5 },
      white: { node: null, gain: null, isPlaying: false, volume: 0.3 },
      rain:  { node: null, gain: null, isPlaying: false, volume: 0.4 },
      fire:  { node: null, gain: null, isPlaying: false, volume: 0.35 }
    };

    // Scientific Binaural Beats Generator (Alpha, Beta, Theta, Solfeggio)
    this.binauralState = {
      activeType: null, // 'alpha' | 'beta' | 'theta' | 'solfeggio' | null
      isPlaying: false,
      volume: 0.4,
      oscLeft: null,
      oscRight: null,
      gainNode: null,
      currentLabel: ''
    };

    // Expanded 10 Curated Focus & Study Music Tracks
    this.musicTracks = [
      {
        id: 'lofi-1',
        title: 'Midnight Study Session',
        category: 'Lo-Fi Chillhop',
        desc: 'Mellow Rhodes & gentle boom-bap rhythm for deep focus',
        url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
      },
      {
        id: 'lofi-2',
        title: 'Rain & Nostalgia Lofi',
        category: 'Lo-Fi Chillhop',
        desc: 'Soft vinyl texture with relaxing acoustic keys',
        url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=rain-and-nostalgia-chill-lofi-song-8493.mp3'
      },
      {
        id: 'piano-1',
        title: 'Peaceful Study Piano Solo',
        category: 'Study Piano',
        desc: 'Gentle classical acoustic piano for reading & writing',
        url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=peaceful-piano-117565.mp3'
      },
      {
        id: 'lofi-3',
        title: 'Late Night Coding Grooves',
        category: 'Lo-Fi Chillhop',
        desc: 'Downtempo synth pads designed to prevent mental fatigue',
        url: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c937107f7f.mp3?filename=lofi-chill-medium-version-159456.mp3'
      },
      {
        id: 'lofi-4',
        title: 'Coffee Shop Study Session',
        category: 'Lo-Fi Chillhop',
        desc: 'Warm acoustic guitar chords with cozy cafe vibes',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=lofi-beat-chill-110255.mp3'
      },
      {
        id: 'ambient-1',
        title: 'Deep Cosmos Meditation & Flow',
        category: 'Ambient Flow',
        desc: 'Ethereal cosmic pads for uninterrupted deep problem-solving',
        url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_82c6ae1849.mp3?filename=deep-meditation-ambient-11883.mp3'
      },
      {
        id: 'acoustic-1',
        title: 'Morning Sun Acoustic Guitar',
        category: 'Acoustic Focus',
        desc: 'Calming fingerstyle guitar for literature & creative tasks',
        url: 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_67b3096b79.mp3?filename=acoustic-guitars-ambient-111155.mp3'
      },
      {
        id: 'piano-2',
        title: 'Floating Clouds Piano & Strings',
        category: 'Study Piano',
        desc: 'Airy piano swells and ambient strings for exam focus',
        url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_c8b93512b9.mp3?filename=ambient-piano-amp-strings-10711.mp3'
      },
      {
        id: 'zen-1',
        title: 'Zen Garden Bamboo Flute',
        category: 'Zen Meditation',
        desc: 'Peaceful traditional flute and bell chimes for mental serenity',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c35272a041.mp3?filename=zen-garden-110057.mp3'
      },
      {
        id: 'lofi-5',
        title: 'Sunset Study Chillhop',
        category: 'Lo-Fi Chillhop',
        desc: 'Smooth rhythmic drums with vinyl warmth for steady pace',
        url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7962c.mp3?filename=lofi-chill-124976.mp3'
      }
    ];

    this.currentMusicIndex = 0;
    this.musicAudio = null;
    this.isMusicPlaying = false;
    this.musicVolume = 0.55;

    this.cacheDom();
    this.bindEvents();
    this.updateDockDisplay();
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
    // Bottom dock player elements
    this.btnDockPlay = document.getElementById('btn-sound-toggle');
    this.btnDockPrev = document.getElementById('btn-dock-prev');
    this.btnDockNext = document.getElementById('btn-dock-next');
    this.dockTitle = document.getElementById('dock-track-title');
    this.dockCategory = document.getElementById('dock-track-category');
    this.volumeSlider = document.getElementById('sound-volume-slider');
    this.volumeText = document.getElementById('sound-volume-text');
    this.equalizerBars = document.getElementById('dock-equalizer');
    this.ambientMuteBtn = document.getElementById('btn-ambient-mute');
    this.btnOpenSoundLab = document.getElementById('btn-open-sound-lab');
    this.btnOpenSoundLabPill = document.getElementById('btn-open-sound-lab-pill');

    // Floating Lab Button & Modal
    this.btnToggleMixer = document.getElementById('btn-toggle-mixer');
    this.soundLabModal = document.getElementById('mixer-modal');
    this.btnCloseLab = document.getElementById('btn-close-mixer');

    // Sound Lab tabs
    this.labTabs = document.querySelectorAll('.soundlab-tab');
    this.labPanels = document.querySelectorAll('.soundlab-panel');

    // Music list container in Lab
    this.musicTrackList = document.getElementById('music-tracks-container');
    this.binauralCards = document.querySelectorAll('.binaural-card');
  }

  bindEvents() {
    // Dock play/pause
    if (this.btnDockPlay) {
      this.btnDockPlay.addEventListener('click', () => this.togglePrimaryAudio());
    }

    // Dock skip track controls
    if (this.btnDockPrev) {
      this.btnDockPrev.addEventListener('click', () => this.prevMusicTrack());
    }
    if (this.btnDockNext) {
      this.btnDockNext.addEventListener('click', () => this.nextMusicTrack());
    }

    // Dock volume slider
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        this.setMasterVolume(val);
      });
    }

    if (this.ambientMuteBtn) {
      this.ambientMuteBtn.addEventListener('click', () => this.toggleMasterMute());
    }

    // Open/Close Sound Lab Modal
    if (this.btnToggleMixer) {
      this.btnToggleMixer.addEventListener('click', () => this.openSoundLab());
    }
    if (this.btnOpenSoundLab) {
      this.btnOpenSoundLab.addEventListener('click', () => this.openSoundLab());
    }
    if (this.btnOpenSoundLabPill) {
      this.btnOpenSoundLabPill.addEventListener('click', () => this.openSoundLab());
    }
    if (this.btnCloseLab) {
      this.btnCloseLab.addEventListener('click', () => this.closeSoundLab());
    }

    // Sound Lab Tab Navigation
    this.labTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.labTabs.forEach(t => t.classList.remove('active'));
        this.labPanels.forEach(p => p.classList.add('hidden'));

        e.currentTarget.classList.add('active');
        const targetPanel = document.getElementById(e.currentTarget.dataset.panel);
        if (targetPanel) targetPanel.classList.remove('hidden');
      });
    });

    // Ambient toggles and sliders
    document.querySelectorAll('.ambient-track-toggle').forEach(t => {
      t.addEventListener('change', (e) => {
        const track = e.target.dataset.track;
        if (e.target.checked) this.startAmbient(track);
        else this.stopAmbient(track);
      });
    });

    document.querySelectorAll('.ambient-slider').forEach(s => {
      s.addEventListener('input', (e) => {
        const track = e.target.dataset.track;
        const val = parseFloat(e.target.value) / 100;
        this.setAmbientVolume(track, val);
      });
    });

    // Binaural Cards click
    this.binauralCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.binaural;
        this.toggleBinauralBeat(type);
      });
    });

    this.renderMusicList();
  }

  /* ---------------- Lo-Fi & Study Music Player ---------------- */

  playMusicTrack(index) {
    this.ensureAudioContext();
    this.stopBinaural(); // Switch from binaural to music

    if (index >= 0 && index < this.musicTracks.length) {
      this.currentMusicIndex = index;
    }
    const current = this.musicTracks[this.currentMusicIndex];

    if (!this.musicAudio) {
      this.musicAudio = new Audio();
      this.musicAudio.crossOrigin = 'anonymous';
      this.musicAudio.loop = true;
      this.musicAudio.addEventListener('ended', () => this.nextMusicTrack());
    }

    this.musicAudio.src = current.url;
    this.musicAudio.volume = this.musicVolume;
    this.musicAudio.muted = this.isMuted;

    this.musicAudio.play().then(() => {
      this.isMusicPlaying = true;
      this.updateDockDisplay();
      this.renderMusicList();
    }).catch(err => {
      console.warn('Playback notice:', err);
    });
  }

  pauseMusic() {
    if (this.musicAudio) {
      this.musicAudio.pause();
    }
    this.isMusicPlaying = false;
    this.updateDockDisplay();
    this.renderMusicList();
  }

  toggleMusic() {
    if (this.isMusicPlaying) {
      this.pauseMusic();
    } else {
      this.playMusicTrack(this.currentMusicIndex);
    }
  }

  nextMusicTrack() {
    const nextIdx = (this.currentMusicIndex + 1) % this.musicTracks.length;
    this.playMusicTrack(nextIdx);
  }

  prevMusicTrack() {
    const prevIdx = (this.currentMusicIndex - 1 + this.musicTracks.length) % this.musicTracks.length;
    this.playMusicTrack(prevIdx);
  }

  /* ---------------- Scientific Binaural Beats Generator ---------------- */

  toggleBinauralBeat(type) {
    this.ensureAudioContext();

    if (this.binauralState.isPlaying && this.binauralState.activeType === type) {
      this.stopBinaural();
      return;
    }

    // Stop music if starting binaural
    this.pauseMusic();
    this.stopBinaural();
    this.startBinaural(type);
  }

  startBinaural(type) {
    this.ensureAudioContext();

    // Base pitch & target frequency separation
    let baseFreq = 216; // Pure grounding pitch (Hz)
    let beatFreq = 10;  // Alpha default (10 Hz)
    let label = 'Alpha Waves (10Hz) — Memory Focus';

    if (type === 'alpha') {
      beatFreq = 10; // 10 Hz Alpha for relaxed alertness & memory
      label = 'Alpha Waves (10Hz) — Memory Focus';
    } else if (type === 'beta') {
      beatFreq = 18; // 18 Hz Beta for problem solving & coding
      label = 'Beta Waves (18Hz) — Active Logic';
    } else if (type === 'theta') {
      beatFreq = 6;  // 6 Hz Theta for creative flow
      label = 'Theta Waves (6Hz) — Creative Flow';
    } else if (type === 'solfeggio') {
      baseFreq = 528; // 528 Hz miracle transformation tone
      beatFreq = 8;
      label = '528Hz Solfeggio — Mental Clarity';
    }

    try {
      const merger = this.audioCtx.createChannelMerger(2);

      // Left Channel
      const oscL = this.audioCtx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);

      const gainL = this.audioCtx.createGain();
      gainL.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
      oscL.connect(gainL);
      gainL.connect(merger, 0, 0); // To left ear

      // Right Channel (Separated by target beat frequency)
      const oscR = this.audioCtx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(baseFreq + beatFreq, this.audioCtx.currentTime);

      const gainR = this.audioCtx.createGain();
      gainR.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
      oscR.connect(gainR);
      gainR.connect(merger, 0, 1); // To right ear

      // Master Binaural Gain
      this.binauralState.gainNode = this.audioCtx.createGain();
      this.binauralState.gainNode.gain.setValueAtTime(this.binauralState.volume * 0.45, this.audioCtx.currentTime);

      merger.connect(this.binauralState.gainNode);
      this.binauralState.gainNode.connect(this.masterGain);

      oscL.start();
      oscR.start();

      this.binauralState.oscLeft = oscL;
      this.binauralState.oscRight = oscR;
      this.binauralState.activeType = type;
      this.binauralState.isPlaying = true;
      this.binauralState.currentLabel = label;

      this.updateDockDisplay();
      this.updateBinauralUI();
    } catch (e) {
      console.error('Binaural generator error:', e);
    }
  }

  stopBinaural() {
    if (!this.binauralState.isPlaying) return;

    if (this.binauralState.oscLeft) {
      try { this.binauralState.oscLeft.stop(); } catch(e){}
    }
    if (this.binauralState.oscRight) {
      try { this.binauralState.oscRight.stop(); } catch(e){}
    }

    this.binauralState.oscLeft = null;
    this.binauralState.oscRight = null;
    this.binauralState.isPlaying = false;
    this.binauralState.activeType = null;

    this.updateDockDisplay();
    this.updateBinauralUI();
  }

  updateBinauralUI() {
    this.binauralCards.forEach(card => {
      const type = card.dataset.binaural;
      const isActive = this.binauralState.isPlaying && this.binauralState.activeType === type;
      card.classList.toggle('active', isActive);
      const badge = card.querySelector('.binaural-status');
      if (badge) badge.textContent = isActive ? 'Playing' : 'Ready';
    });
  }

  /* ---------------- Procedural Ambient Soundscapes ---------------- */

  startAmbient(trackName) {
    this.ensureAudioContext();
    const track = this.ambientTracks[trackName];
    if (!track || track.isPlaying) return;

    if (trackName === 'brown') {
      const noiseBuffer = this.createNoiseBuffer(3.5, true);
      track.node = this.audioCtx.createBufferSource();
      track.node.buffer = noiseBuffer;
      track.node.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.audioCtx.currentTime);

      track.gain = this.audioCtx.createGain();
      track.gain.gain.setValueAtTime(track.volume * 0.6, this.audioCtx.currentTime);

      track.node.connect(filter);
      filter.connect(track.gain);
      track.gain.connect(this.masterGain);
      track.node.start();
      track.isPlaying = true;

    } else if (trackName === 'rain') {
      const buffer = this.createNoiseBuffer(0.2, false);
      track.node = this.audioCtx.createBufferSource();
      track.node.buffer = buffer;
      track.node.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, this.audioCtx.currentTime);
      filter.Q.setValueAtTime(0.7, this.audioCtx.currentTime);

      track.gain = this.audioCtx.createGain();
      track.gain.gain.setValueAtTime(track.volume * 0.65, this.audioCtx.currentTime);

      track.node.connect(filter);
      filter.connect(track.gain);
      track.gain.connect(this.masterGain);
      track.node.start();
      track.isPlaying = true;

    } else if (trackName === 'white') {
      const buffer = this.createNoiseBuffer(0.12, false);
      track.node = this.audioCtx.createBufferSource();
      track.node.buffer = buffer;
      track.node.loop = true;

      track.gain = this.audioCtx.createGain();
      track.gain.gain.setValueAtTime(track.volume * 0.3, this.audioCtx.currentTime);

      track.node.connect(track.gain);
      track.gain.connect(this.masterGain);
      track.node.start();
      track.isPlaying = true;

    } else if (trackName === 'fire') {
      const buffer = this.createNoiseBuffer(0.4, true);
      track.node = this.audioCtx.createBufferSource();
      track.node.buffer = buffer;
      track.node.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);

      track.gain = this.audioCtx.createGain();
      track.gain.gain.setValueAtTime(track.volume * 0.5, this.audioCtx.currentTime);

      track.node.connect(filter);
      filter.connect(track.gain);
      track.gain.connect(this.masterGain);
      track.node.start();
      track.isPlaying = true;
    }
  }

  stopAmbient(trackName) {
    const track = this.ambientTracks[trackName];
    if (!track || !track.isPlaying) return;

    if (track.node) {
      try { track.node.stop(); track.node.disconnect(); } catch(e){}
      track.node = null;
    }
    track.isPlaying = false;
  }

  setAmbientVolume(trackName, vol) {
    const track = this.ambientTracks[trackName];
    if (!track) return;
    track.volume = vol;
    if (track.gain) {
      track.gain.gain.setValueAtTime(vol * 0.6, this.audioCtx.currentTime);
    }
  }

  createNoiseBuffer(scale, isBrown = false) {
    const bufferSize = this.audioCtx.sampleRate * 4;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (isBrown) {
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        data[i] = lastOut * scale;
      } else {
        data[i] = white * scale;
      }
    }
    return buffer;
  }

  /* ---------------- Master & Dock Sync ---------------- */

  togglePrimaryAudio() {
    if (this.binauralState.isPlaying) {
      this.stopBinaural();
    } else {
      this.toggleMusic();
    }
  }

  setMasterVolume(val) {
    this.musicVolume = val;
    this.binauralState.volume = val;
    if (this.musicAudio) this.musicAudio.volume = val;
    if (this.binauralState.gainNode) {
      this.binauralState.gainNode.gain.setValueAtTime(val * 0.45, this.audioCtx.currentTime);
    }
    if (this.volumeText) this.volumeText.textContent = `${Math.round(val * 100)}%`;
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
    if (this.musicAudio) {
      this.musicAudio.muted = this.isMuted;
    }
  }

  updateDockDisplay() {
    const isPlaying = this.isMusicPlaying || this.binauralState.isPlaying;

    if (this.dockTitle) {
      if (this.binauralState.isPlaying) {
        this.dockTitle.textContent = this.binauralState.currentLabel;
      } else {
        this.dockTitle.textContent = this.musicTracks[this.currentMusicIndex].title;
      }
    }

    if (this.dockCategory) {
      if (this.binauralState.isPlaying) {
        this.dockCategory.textContent = '🧠 Binaural Beat';
      } else {
        this.dockCategory.textContent = this.musicTracks[this.currentMusicIndex].category;
      }
    }

    // Play/Pause icon in dock
    const iconPlay = document.getElementById('sound-icon-off');
    const iconPause = document.getElementById('sound-icon-on');
    if (iconPlay && iconPause) {
      iconPlay.classList.toggle('hidden', isPlaying);
      iconPause.classList.toggle('hidden', !isPlaying);
    }

    if (this.btnDockPlay) {
      this.btnDockPlay.classList.toggle('active', isPlaying);
    }

    // Animated sound wave bars
    if (this.equalizerBars) {
      this.equalizerBars.classList.toggle('animating', isPlaying);
    }
  }

  renderMusicList() {
    if (!this.musicTrackList) return;

    this.musicTrackList.innerHTML = this.musicTracks.map((track, idx) => {
      const isCurrent = this.isMusicPlaying && this.currentMusicIndex === idx;
      return `
        <div class="music-card-item ${isCurrent ? 'active' : ''}" data-index="${idx}">
          <div class="music-card-left">
            <span class="music-play-icon">${isCurrent ? '⏸' : '▶'}</span>
            <div class="music-card-meta">
              <span class="music-card-title">${track.title}</span>
              <span class="music-card-desc">${track.desc}</span>
            </div>
          </div>
          <span class="music-card-badge">${track.category}</span>
        </div>
      `;
    }).join('');

    this.musicTrackList.querySelectorAll('.music-card-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (this.isMusicPlaying && this.currentMusicIndex === idx) {
          this.pauseMusic();
        } else {
          this.playMusicTrack(idx);
        }
      });
    });
  }

  openSoundLab() {
    if (this.soundLabModal) {
      this.soundLabModal.classList.remove('hidden');
      this.renderMusicList();
      this.updateBinauralUI();
    }
  }

  closeSoundLab() {
    if (this.soundLabModal) {
      this.soundLabModal.classList.add('hidden');
    }
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
