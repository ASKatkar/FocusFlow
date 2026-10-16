/**
 * FocusFlow — Pomodoro Timer Engine
 * Handles timer countdown, SVG ring animations, environment switching,
 * modal configuration, cycle tracking, and keyboard shortcuts.
 */

class PomodoroTimer {
  constructor() {
    // Config defaults (in minutes)
    this.durations = {
      focus: 25,
      shortBreak: 5,
      longBreak: 15
    };
    this.autoStartBreaks = true;

    // Load saved settings if any
    this.loadSettings();

    // State variables
    this.currentMode = 'focus'; // 'focus' | 'shortBreak' | 'longBreak'
    this.timeLeft = this.durations[this.currentMode] * 60;
    this.totalDuration = this.timeLeft;
    this.timerId = null;
    this.isRunning = false;
    this.sessionCycle = 1;
    this.totalCompletedSessions = 0;

    // SVG Ring metrics (radius = 142)
    this.circumference = 2 * Math.PI * 142; // ~892.21

    this.cacheDom();
    this.bindEvents();
    this.updateDisplay();
    this.updateRingProgress();
  }

  cacheDom() {
    this.timeDisplay = document.getElementById('time-display');
    this.timerStatus = document.getElementById('timer-status');
    this.ringProgress = document.getElementById('timer-progress');
    this.btnTogglePlay = document.getElementById('btn-toggle-play');
    this.playIcon = document.getElementById('play-icon');
    this.pauseIcon = document.getElementById('pause-icon');
    this.btnReset = document.getElementById('btn-reset');
    this.btnSkip = document.getElementById('btn-skip');
    this.modePills = document.querySelectorAll('.mode-pill');
    this.sessionDots = document.querySelectorAll('.session-dots .dot');

    // Dock indicators
    this.labelFocus = document.getElementById('label-focus-time');
    this.labelBreak = document.getElementById('label-break-time');

    // Environment elements
    this.envItems = document.querySelectorAll('.env-item');

    // Fullscreen buttons
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.btnScreenExpand = document.getElementById('btn-screen-expand');

    // Modal elements
    this.settingsModal = document.getElementById('settings-modal');
    this.btnCustomize = document.getElementById('btn-customize-timer');
    this.btnCloseModal = document.getElementById('btn-close-modal');
    this.btnCancelSettings = document.getElementById('btn-cancel-settings');
    this.btnSaveSettings = document.getElementById('btn-save-settings');
    this.inputFocus = document.getElementById('input-focus');
    this.inputShort = document.getElementById('input-short');
    this.inputLong = document.getElementById('input-long');
    this.inputAutostart = document.getElementById('input-autostart');
  }

  bindEvents() {
    // Timer Controls
    this.btnTogglePlay.addEventListener('click', () => this.togglePlay());
    this.btnReset.addEventListener('click', () => this.resetTimer());
    this.btnSkip.addEventListener('click', () => this.skipCycle());

    // Mode Pills (Focus, Short Break, Long Break)
    this.modePills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        this.switchMode(mode);
      });
    });

    // Environment switcher
    this.envItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const env = e.currentTarget.dataset.env;
        this.switchEnvironment(env);
      });
    });

    // Fullscreen
    if (this.btnFullscreen) this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    if (this.btnScreenExpand) this.btnScreenExpand.addEventListener('click', () => this.toggleFullscreen());

    // Modal Events
    if (this.btnCustomize) this.btnCustomize.addEventListener('click', () => this.openSettings());
    if (this.btnCloseModal) this.btnCloseModal.addEventListener('click', () => this.closeSettings());
    if (this.btnCancelSettings) this.btnCancelSettings.addEventListener('click', () => this.closeSettings());
    if (this.btnSaveSettings) this.btnSaveSettings.addEventListener('click', () => this.saveSettingsFromModal());

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return; // Ignore inside modals
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        this.resetTimer();
      } else if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      }
    });
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('focusflow_timer_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.durations.focus = parsed.focus || 25;
        this.durations.shortBreak = parsed.shortBreak || 5;
        this.durations.longBreak = parsed.longBreak || 15;
        this.autoStartBreaks = parsed.autoStartBreaks !== false;
      }
    } catch (e) {
      console.warn('Could not load timer settings from localStorage', e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('focusflow_timer_settings', JSON.stringify({
        focus: this.durations.focus,
        shortBreak: this.durations.shortBreak,
        longBreak: this.durations.longBreak,
        autoStartBreaks: this.autoStartBreaks
      }));
    } catch (e) {}
  }

  togglePlay() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isRunning = true;
    this.updatePlayBtnUI(true);

    this.timerId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    this.updatePlayBtnUI(false);
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.timeLeft = this.durations[this.currentMode] * 60;
    this.totalDuration = this.timeLeft;
    this.updateDisplay();
    this.updateRingProgress();
  }

  tick() {
    if (this.timeLeft > 0) {
      this.timeLeft--;
      this.updateDisplay();
      this.updateRingProgress();
    } else {
      this.handleCycleCompletion();
    }
  }

  handleCycleCompletion() {
    this.pauseTimer();

    // Play chime sound
    if (window.soundEngine) {
      window.soundEngine.playSessionChime();
    }

    if (this.currentMode === 'focus') {
      this.totalCompletedSessions++;
      this.sessionCycle++;

      // After 4 focus cycles, recommend long break
      if (this.sessionCycle > 4) {
        this.sessionCycle = 1;
        this.switchMode('longBreak');
      } else {
        this.switchMode('shortBreak');
      }
      this.updateCycleDots();
    } else {
      // Break completed, switch back to Focus
      this.switchMode('focus');
    }

    if (this.autoStartBreaks) {
      setTimeout(() => this.startTimer(), 1500);
    }
  }

  skipCycle() {
    this.pauseTimer();
    if (this.currentMode === 'focus') {
      this.switchMode('shortBreak');
    } else {
      this.switchMode('focus');
    }
  }

  switchMode(newMode) {
    if (!this.durations[newMode]) return;
    this.pauseTimer();
    this.currentMode = newMode;

    // Update active mode pill
    this.modePills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.mode === newMode);
    });

    // Update status subtitle
    const statusText = newMode === 'focus' ? 'FOCUSING' : (newMode === 'shortBreak' ? 'SHORT BREAK' : 'LONG BREAK');
    this.timerStatus.textContent = statusText;

    // Set new duration
    this.timeLeft = this.durations[newMode] * 60;
    this.totalDuration = this.timeLeft;

    this.updateDisplay();
    this.updateRingProgress();
  }

  updateDisplay() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    this.timeDisplay.textContent = formatted;

    // Update page title
    const modeLabel = this.currentMode === 'focus' ? 'Focus' : 'Break';
    document.title = `(${formatted}) ${modeLabel} — FocusFlow`;
  }

  updateRingProgress() {
    if (!this.ringProgress) return;
    const progressFraction = (this.totalDuration - this.timeLeft) / this.totalDuration;
    const offset = this.circumference * (1 - progressFraction);
    this.ringProgress.style.strokeDashoffset = offset;
  }

  updatePlayBtnUI(running) {
    if (this.playIcon && this.pauseIcon) {
      this.playIcon.classList.toggle('hidden', running);
      this.pauseIcon.classList.toggle('hidden', !running);
    }
    this.btnTogglePlay.classList.toggle('pulse', !running);
  }

  updateCycleDots() {
    this.sessionDots.forEach((dot, index) => {
      dot.classList.toggle('active', index < this.sessionCycle);
    });
  }

  switchEnvironment(envName) {
    document.body.className = `theme-${envName}`;

    this.envItems.forEach(item => {
      item.classList.toggle('active', item.dataset.env === envName);
    });
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  /* Modal Settings Handlers */
  openSettings() {
    this.inputFocus.value = this.durations.focus;
    this.inputShort.value = this.durations.shortBreak;
    this.inputLong.value = this.durations.longBreak;
    this.inputAutostart.checked = this.autoStartBreaks;
    this.settingsModal.classList.remove('hidden');
  }

  closeSettings() {
    this.settingsModal.classList.add('hidden');
  }

  saveSettingsFromModal() {
    const focusVal = parseInt(this.inputFocus.value, 10);
    const shortVal = parseInt(this.inputShort.value, 10);
    const longVal = parseInt(this.inputLong.value, 10);

    if (focusVal >= 1 && focusVal <= 120) this.durations.focus = focusVal;
    if (shortVal >= 1 && shortVal <= 60) this.durations.shortBreak = shortVal;
    if (longVal >= 1 && longVal <= 60) this.durations.longBreak = longVal;
    this.autoStartBreaks = this.inputAutostart.checked;

    this.saveSettings();

    // Update bottom dock summary
    if (this.labelFocus) this.labelFocus.textContent = `${this.durations.focus}m`;
    if (this.labelBreak) this.labelBreak.textContent = `${this.durations.shortBreak}m`;

    // Reset current countdown to reflect new setting if not running
    if (!this.isRunning) {
      this.resetTimer();
    }

    this.closeSettings();
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.pomodoroTimer = new PomodoroTimer();
});
