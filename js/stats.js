/**
 * FocusFlow — Study Statistics, Session History & Gamification Engine
 * Tracks completed focus sessions, calculates daily streaks, renders visual charts,
 * and powers the dynamic Level & XP progression system.
 */

class StatsEngine {
  constructor() {
    this.history = [];
    this.xp = 0;
    this.level = 1;

    this.cacheDom();
    this.loadData();
    this.bindEvents();
    this.updateGamificationUI();
  }

  cacheDom() {
    // Top Nav
    this.tabDashboard = document.getElementById('tab-dashboard');
    this.userLevelText = document.getElementById('user-level');
    this.levelProgressFill = document.getElementById('lvl-progress-fill');

    // Dashboard Modal Elements
    this.dashboardModal = document.getElementById('dashboard-modal');
    this.btnCloseDashboard = document.getElementById('btn-close-dashboard');

    // Stat metric elements
    this.statTodayMinutes = document.getElementById('stat-today-minutes');
    this.statTotalMinutes = document.getElementById('stat-total-minutes');
    this.statStreakDays = document.getElementById('stat-streak-days');
    this.statCompletedCount = document.getElementById('stat-completed-count');

    // Visual chart & history table
    this.weeklyChart = document.getElementById('weekly-chart-bars');
    this.historyList = document.getElementById('session-history-list');
    this.btnClearHistory = document.getElementById('btn-clear-history');
  }

  bindEvents() {
    if (this.tabDashboard) {
      this.tabDashboard.addEventListener('click', () => this.openDashboard());
    }

    if (this.btnCloseDashboard) {
      this.btnCloseDashboard.addEventListener('click', () => this.closeDashboard());
    }

    if (this.btnClearHistory) {
      this.btnClearHistory.addEventListener('click', () => this.clearHistory());
    }
  }

  loadData() {
    try {
      const savedHistory = localStorage.getItem('focusflow_session_history');
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      } else {
        // Pre-populate realistic sample data so dashboard looks vibrant immediately
        const now = Date.now();
        const oneDay = 86400000;
        this.history = [
          { id: '1', date: now - oneDay * 3, duration: 25, type: 'focus', task: 'Read Chapter 3 biology' },
          { id: '2', date: now - oneDay * 2, duration: 50, type: 'focus', task: 'Math practice set 4' },
          { id: '3', date: now - oneDay * 1, duration: 25, type: 'focus', task: 'English essay drafting' },
          { id: '4', date: now - 3600000, duration: 25, type: 'focus', task: 'Complete Chapter 4 reading' }
        ];
      }

      const savedXp = localStorage.getItem('focusflow_xp');
      this.xp = savedXp ? parseInt(savedXp, 10) : 125;
      this.calculateLevel();
    } catch (e) {
      console.warn('Failed to load session history', e);
      this.history = [];
      this.xp = 0;
      this.level = 1;
    }
  }

  saveData() {
    try {
      localStorage.setItem('focusflow_session_history', JSON.stringify(this.history));
      localStorage.setItem('focusflow_xp', this.xp.toString());
    } catch (e) {}
  }

  calculateLevel() {
    // Level formula: Level = Math.floor(XP / 100) + 1
    this.level = Math.floor(this.xp / 100) + 1;
    this.currentLevelXp = this.xp % 100;
  }

  addXp(amount) {
    const oldLevel = this.level;
    this.xp += amount;
    this.calculateLevel();
    this.saveData();
    this.updateGamificationUI();

    if (this.level > oldLevel) {
      this.notifyLevelUp(this.level);
    }
  }

  notifyLevelUp(newLevel) {
    if (window.soundEngine) {
      window.soundEngine.playSessionChime();
    }
    const banner = document.createElement('div');
    banner.className = 'level-up-toast';
    banner.innerHTML = `🎉 <strong>LEVEL UP!</strong> You reached Level ${newLevel}!`;
    document.body.appendChild(banner);
    setTimeout(() => {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 400);
    }, 3500);
  }

  updateGamificationUI() {
    if (this.userLevelText) {
      this.userLevelText.textContent = this.level;
    }
    if (this.levelProgressFill) {
      const percentage = Math.min(100, Math.max(5, this.currentLevelXp));
      this.levelProgressFill.style.width = `${percentage}%`;
    }
  }

  /**
   * Records a completed focus session
   */
  recordSession(durationMinutes, taskTitle) {
    const entry = {
      id: Date.now().toString(),
      date: Date.now(),
      duration: durationMinutes,
      type: 'focus',
      task: taskTitle || 'General Study'
    };

    this.history.unshift(entry);
    // 1 focus minute = 2 XP points
    this.addXp(durationMinutes * 2);
    this.saveData();
  }

  openDashboard() {
    this.renderMetrics();
    this.renderWeeklyChart();
    this.renderHistoryList();
    if (this.dashboardModal) {
      this.dashboardModal.classList.remove('hidden');
    }
  }

  closeDashboard() {
    if (this.dashboardModal) {
      this.dashboardModal.classList.add('hidden');
    }
  }

  clearHistory() {
    if (confirm('Are you sure you want to clear your study session history?')) {
      this.history = [];
      this.saveData();
      this.renderMetrics();
      this.renderWeeklyChart();
      this.renderHistoryList();
    }
  }

  renderMetrics() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let todayMinutes = 0;
    let totalMinutes = 0;

    this.history.forEach(session => {
      totalMinutes += session.duration;
      if (session.date >= todayStart.getTime()) {
        todayMinutes += session.duration;
      }
    });

    const streak = this.calculateStreak();

    if (this.statTodayMinutes) this.statTodayMinutes.textContent = `${todayMinutes}m`;
    if (this.statTotalMinutes) this.statTotalMinutes.textContent = `${totalMinutes}m`;
    if (this.statStreakDays) this.statStreakDays.textContent = `${streak} ${streak === 1 ? 'Day' : 'Days'}`;
    if (this.statCompletedCount) this.statCompletedCount.textContent = this.history.length;
  }

  calculateStreak() {
    if (this.history.length === 0) return 0;

    const daysWithStudy = new Set();
    this.history.forEach(item => {
      const dateStr = new Date(item.date).toDateString();
      daysWithStudy.add(dateStr);
    });

    let streak = 0;
    let checkDate = new Date();

    // Check today first, if not studied yet today, check yesterday
    const todayStr = checkDate.toDateString();
    if (!daysWithStudy.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (daysWithStudy.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return Math.max(1, streak);
  }

  renderWeeklyChart() {
    if (!this.weeklyChart) return;

    // Last 7 days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      let mins = 0;
      this.history.forEach(session => {
        if (session.date >= d.getTime() && session.date < nextD.getTime()) {
          mins += session.duration;
        }
      });

      daysData.push({
        label: i === 0 ? 'Today' : dayNames[d.getDay()],
        minutes: mins
      });
    }

    const maxMins = Math.max(60, ...daysData.map(d => d.minutes));

    this.weeklyChart.innerHTML = daysData.map(d => {
      const heightPercent = Math.max(6, Math.round((d.minutes / maxMins) * 100));
      return `
        <div class="chart-col">
          <div class="chart-bar-wrap" title="${d.minutes} mins studied">
            <div class="chart-bar-fill" style="height: ${heightPercent}%;">
              <span class="chart-tooltip">${d.minutes}m</span>
            </div>
          </div>
          <span class="chart-col-label">${d.label}</span>
        </div>
      `;
    }).join('');
  }

  renderHistoryList() {
    if (!this.historyList) return;

    if (this.history.length === 0) {
      this.historyList.innerHTML = `
        <div class="history-empty">
          <p>No study sessions recorded yet. Start a focus session to build your log!</p>
        </div>
      `;
      return;
    }

    this.historyList.innerHTML = this.history.slice(0, 15).map(item => {
      const timeStr = new Date(item.date).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="history-item">
          <div class="history-left">
            <span class="history-badge">✓ Focus</span>
            <span class="history-task" title="${item.task}">${item.task}</span>
          </div>
          <div class="history-right">
            <span class="history-duration">+${item.duration}m</span>
            <span class="history-date">${timeStr}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.statsEngine = new StatsEngine();
});
