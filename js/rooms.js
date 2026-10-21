/**
 * FocusFlow v4.0.0 - Virtual Study Rooms & Peer Presence Engine
 * Handles virtual room channels, live student presence wall, peer interactions & cheering
 */

class RoomsEngine {
  constructor() {
    this.tabRooms = document.getElementById('tab-rooms');
    this.roomsModal = document.getElementById('rooms-modal');
    this.btnCloseRooms = document.getElementById('btn-close-rooms');
    this.buddiesGrid = document.getElementById('buddies-grid');
    this.activePeersCount = document.getElementById('active-peers-count');
    this.channelCards = document.querySelectorAll('.room-channel-card');
    this.joinButtons = document.querySelectorAll('.btn-join-room');

    this.currentRoom = localStorage.getItem('focusflow_active_room') || 'library';

    // Simulated peer study buddies roster across different study channels
    this.peers = [
      {
        id: 'peer-1',
        name: 'Atharav K.',
        badge: 'You',
        flag: '🇮🇳',
        avatarBg: 'linear-gradient(135deg, #6366f1, #a855f7)',
        room: 'library',
        task: 'Developing FocusFlow v4.0 & DevOps Pipeline',
        status: 'In Pomodoro',
        timeLeft: '18m left',
        streak: '🔥 5-Day Streak',
        cheers: 28
      },
      {
        id: 'peer-2',
        name: 'Sarah Jenkins',
        badge: 'Peer',
        flag: '🇬🇧',
        avatarBg: 'linear-gradient(135deg, #ec4899, #f43f5e)',
        room: 'library',
        task: 'Biochemistry — Krebs Cycle & ATP Synthase',
        status: 'In Pomodoro',
        timeLeft: '22m left',
        streak: '🔥 3-Day Streak',
        cheers: 14
      },
      {
        id: 'peer-3',
        name: 'Kenji Takahashi',
        badge: 'Peer',
        flag: '🇯🇵',
        avatarBg: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        room: 'night-city',
        task: 'LeetCode 75 — Binary Tree Level Order',
        status: 'In Pomodoro',
        timeLeft: '11m left',
        streak: '🔥 12-Day Streak',
        cheers: 42
      },
      {
        id: 'peer-4',
        name: 'Elena Rostova',
        badge: 'Peer',
        flag: '🇩🇪',
        avatarBg: 'linear-gradient(135deg, #10b981, #059669)',
        room: 'cafe',
        task: 'European Economics & Monetary Policy',
        status: 'On 5m Break',
        timeLeft: '3m break',
        streak: '🔥 8-Day Streak',
        cheers: 31
      },
      {
        id: 'peer-5',
        name: 'Liam Chen',
        badge: 'Peer',
        flag: '🇨🇦',
        avatarBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
        room: 'starry',
        task: 'Astrophysics — General Relativity & Orbitals',
        status: 'In Pomodoro',
        timeLeft: '25m left',
        streak: '🔥 15-Day Streak',
        cheers: 56
      },
      {
        id: 'peer-6',
        name: 'Maya Patel',
        badge: 'Peer',
        flag: '🇮🇳',
        avatarBg: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        room: 'cafe',
        task: 'Architectural Design Portfolio Review',
        status: 'In Pomodoro',
        timeLeft: '16m left',
        streak: '🔥 4-Day Streak',
        cheers: 19
      },
      {
        id: 'peer-7',
        name: 'Marcus Brody',
        badge: 'Peer',
        flag: '🇺🇸',
        avatarBg: 'linear-gradient(135deg, #3b82f6, #6366f1)',
        room: 'night-city',
        task: 'Kubernetes Cluster Setup & Dockerfile',
        status: 'In Pomodoro',
        timeLeft: '9m left',
        streak: '🔥 9-Day Streak',
        cheers: 35
      },
      {
        id: 'peer-8',
        name: 'Amara Diallo',
        badge: 'Peer',
        flag: '🇫🇷',
        avatarBg: 'linear-gradient(135deg, #14b8a6, #06b6d4)',
        room: 'library',
        task: 'Literature Review — Modern Philosophy',
        status: 'On 5m Break',
        timeLeft: '2m break',
        streak: '🔥 6-Day Streak',
        cheers: 22
      }
    ];

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderBuddies();
    this.updateActiveRoomUI(this.currentRoom);
  }

  bindEvents() {
    if (this.tabRooms) {
      this.tabRooms.addEventListener('click', () => this.openModal());
    }

    if (this.btnCloseRooms) {
      this.btnCloseRooms.addEventListener('click', () => this.closeModal());
    }

    // Modal background close
    if (this.roomsModal) {
      this.roomsModal.addEventListener('click', (e) => {
        if (e.target === this.roomsModal) {
          this.closeModal();
        }
      });
    }

    // Room card clicking
    this.channelCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const roomId = card.getAttribute('data-room-id');
        if (roomId) this.switchRoom(roomId);
      });
    });

    this.joinButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const roomId = btn.getAttribute('data-room-id');
        if (roomId) this.switchRoom(roomId);
      });
    });
  }

  openModal() {
    if (this.roomsModal) {
      this.renderBuddies();
      this.roomsModal.classList.remove('hidden');
    }
  }

  closeModal() {
    if (this.roomsModal) {
      this.roomsModal.classList.add('hidden');
    }
  }

  switchRoom(roomId) {
    if (!roomId) return;
    this.currentRoom = roomId;
    localStorage.setItem('focusflow_active_room', roomId);
    this.updateActiveRoomUI(roomId);

    // Coordinate with environment changer in timer.js/audio.js if present
    if (window.timerEngine && typeof window.timerEngine.changeEnvironment === 'function') {
      window.timerEngine.changeEnvironment(roomId);
    }

    // Show floating toast confirmation
    this.showRoomToast(roomId);
    this.renderBuddies();
  }

  updateActiveRoomUI(roomId) {
    this.channelCards.forEach(card => {
      const id = card.getAttribute('data-room-id');
      const btn = card.querySelector('.btn-join-room');
      if (id === roomId) {
        card.classList.add('active');
        if (btn) {
          btn.classList.add('active');
          btn.textContent = 'Current Room';
        }
      } else {
        card.classList.remove('active');
        if (btn) {
          btn.classList.remove('active');
          btn.textContent = 'Join Room';
        }
      }
    });

    // Update active peers counter dynamically
    const roomPeerCount = {
      library: 42,
      cafe: 35,
      'night-city': 24,
      starry: 12
    }[roomId] || 38;

    if (this.activePeersCount) {
      this.activePeersCount.textContent = `${roomPeerCount} Peers in Current Channel`;
    }
  }

  renderBuddies() {
    if (!this.buddiesGrid) return;

    // Filter peers or sort so current room peers are first
    const sortedPeers = [...this.peers].sort((a, b) => {
      if (a.room === this.currentRoom && b.room !== this.currentRoom) return -1;
      if (b.room === this.currentRoom && a.room !== this.currentRoom) return 1;
      return 0;
    });

    this.buddiesGrid.innerHTML = sortedPeers.map(peer => {
      const isCurrentRoom = peer.room === this.currentRoom;
      const roomLabels = {
        library: '🏛️ Oxford Library',
        cafe: '☕ Midnight Café',
        'night-city': '💻 Tech Lab',
        starry: '🌌 Deep Space'
      };

      return `
        <div class="buddy-card ${isCurrentRoom ? 'in-room' : 'other-room'}" data-peer-id="${peer.id}">
          <div class="buddy-top">
            <div class="buddy-avatar" style="background: ${peer.avatarBg};">
              <span>${peer.name.charAt(0)}</span>
              <span class="buddy-flag" title="Flag">${peer.flag}</span>
            </div>
            <div class="buddy-meta">
              <div class="buddy-name-row">
                <span class="buddy-name">${peer.name}</span>
                <span class="buddy-badge ${peer.badge === 'You' ? 'badge-you' : ''}">${peer.badge}</span>
              </div>
              <span class="buddy-room-tag">${roomLabels[peer.room] || peer.room}</span>
            </div>
          </div>

          <div class="buddy-task-box">
            <span class="buddy-task-text" title="${peer.task}">${peer.task}</span>
          </div>

          <div class="buddy-footer">
            <div class="buddy-status-wrap">
              <span class="buddy-status ${peer.status.includes('Break') ? 'status-break' : 'status-focus'}">
                ● ${peer.status} (${peer.timeLeft})
              </span>
              <span class="buddy-streak">${peer.streak}</span>
            </div>

            <button class="btn-cheer" onclick="window.roomsEngine.cheerPeer('${peer.id}')" title="Send focus cheer">
              🙌 <span class="cheer-count" id="cheer-${peer.id}">${peer.cheers}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  cheerPeer(peerId) {
    const peer = this.peers.find(p => p.id === peerId);
    if (!peer) return;

    peer.cheers++;
    const countEl = document.getElementById(`cheer-${peerId}`);
    if (countEl) {
      countEl.textContent = peer.cheers;
      countEl.parentElement.classList.add('cheer-bump');
      setTimeout(() => countEl.parentElement.classList.remove('cheer-bump'), 400);
    }

    // Award +10 XP if statsEngine exists
    if (window.statsEngine && typeof window.statsEngine.addSession === 'function') {
      window.statsEngine.xp = (window.statsEngine.xp || 100) + 10;
      window.statsEngine.calculateLevel();
    }

    this.showToast(`🙌 Sent encouragement to ${peer.name}! (+10 Focus XP)`);
  }

  showRoomToast(roomId) {
    const titles = {
      library: '🏛️ Switched to Oxford Silent Library (42 Peers)',
      cafe: '☕ Switched to Shibuya Midnight Café (35 Peers)',
      'night-city': '💻 Switched to Silicon Valley Night Lab (24 Peers)',
      starry: '🌌 Switched to Deep Space Orbit (12 Peers)'
    };
    this.showToast(titles[roomId] || `Switched Room to ${roomId}`);
  }

  showToast(msg) {
    let toast = document.getElementById('focusflow-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'focusflow-toast';
      toast.className = 'focusflow-toast glass-card';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.roomsEngine = new RoomsEngine();
});
