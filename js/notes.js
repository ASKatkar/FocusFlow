/**
 * FocusFlow v4.0.0 - Focus Scratchpad & Markdown Quick Notes Engine
 * Handles instantaneous note-taking during study sessions, formatting tools,
 * live character/word counters, local persistence, and note exporting.
 */

class NotesEngine {
  constructor() {
    this.drawer = document.getElementById('notes-drawer');
    this.btnToggle = document.getElementById('btn-toggle-notes');
    this.btnClose = document.getElementById('btn-close-notes');
    this.btnExport = document.getElementById('btn-export-notes');
    this.textarea = document.getElementById('notes-content');
    this.wordCountEl = document.getElementById('notes-word-count');
    this.charCountEl = document.getElementById('notes-char-count');
    this.saveStatusEl = document.getElementById('notes-save-status');
    this.toolButtons = document.querySelectorAll('.notes-toolbar .tool-btn');

    this.saveTimeout = null;
    this.init();
  }

  init() {
    this.loadNotes();
    this.bindEvents();
    this.updateCounters();
  }

  loadNotes() {
    if (!this.textarea) return;
    const saved = localStorage.getItem('focusflow_notes');
    if (saved !== null) {
      this.textarea.value = saved;
    } else {
      // Default starter template for fresh students
      this.textarea.value = `# 📝 FocusFlow Study Scratchpad\n\n## 🎯 Today's Learning Objective\n- Master core concepts and complete practice problems.\n\n## 💡 Key Formulas & Notes\n• F = m * a\n• Euler's Formula: e^(i*pi) + 1 = 0\n• Time Complexity: O(log N) binary search\n\n## ⚡ Quick Reminders\n[ ] Review flashcards before bed\n[ ] Drink water during 5-minute break\n`;
    }
  }

  bindEvents() {
    // Open / Close Drawer
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', () => this.toggleDrawer());
    }
    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.closeDrawer());
    }

    // Auto-save & Counter updates on typing
    if (this.textarea) {
      this.textarea.addEventListener('input', () => {
        this.updateCounters();
        this.queueAutoSave();
      });

      // Tab key support in textarea
      this.textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = this.textarea.selectionStart;
          const end = this.textarea.selectionEnd;
          this.textarea.value = this.textarea.value.substring(0, start) + '  ' + this.textarea.value.substring(end);
          this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
        }
      });
    }

    // Toolbar actions
    this.toolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        this.executeToolbarAction(action);
      });
    });

    // Export button
    if (this.btnExport) {
      this.btnExport.addEventListener('click', () => this.exportNotes());
    }
  }

  toggleDrawer() {
    if (!this.drawer) return;
    const isOpen = this.drawer.classList.contains('open');
    if (isOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  openDrawer() {
    if (!this.drawer) return;
    // Close tasks drawer if open to prevent screen clutter
    const tasksDrawer = document.getElementById('tasks-drawer');
    if (tasksDrawer && tasksDrawer.classList.contains('open')) {
      tasksDrawer.classList.remove('open');
    }

    this.drawer.classList.add('open');
    if (this.btnToggle) this.btnToggle.classList.add('active');
    if (this.textarea) {
      setTimeout(() => this.textarea.focus(), 250);
    }
  }

  closeDrawer() {
    if (!this.drawer) return;
    this.drawer.classList.remove('open');
    if (this.btnToggle) this.btnToggle.classList.remove('active');
  }

  updateCounters() {
    if (!this.textarea) return;
    const text = this.textarea.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = this.textarea.value.length;

    if (this.wordCountEl) this.wordCountEl.textContent = `${words} words`;
    if (this.charCountEl) this.charCountEl.textContent = `${chars} chars`;
  }

  queueAutoSave() {
    if (this.saveStatusEl) {
      this.saveStatusEl.textContent = 'Saving...';
      this.saveStatusEl.classList.add('saving');
    }

    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveNotes();
    }, 400);
  }

  saveNotes() {
    if (!this.textarea) return;
    localStorage.setItem('focusflow_notes', this.textarea.value);
    if (this.saveStatusEl) {
      this.saveStatusEl.textContent = 'Saved ✓';
      this.saveStatusEl.classList.remove('saving');
    }
  }

  executeToolbarAction(action) {
    if (!this.textarea) return;
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const val = this.textarea.value;
    const selected = val.substring(start, end);

    switch (action) {
      case 'bold': {
        const replacement = selected ? `**${selected}**` : `**bold text**`;
        this.insertTextAtCursor(replacement, start, end);
        break;
      }
      case 'bullet': {
        const prefix = (start === 0 || val.charAt(start - 1) === '\n') ? '• ' : '\n• ';
        this.insertTextAtCursor(prefix, start, end);
        break;
      }
      case 'todo': {
        const prefix = (start === 0 || val.charAt(start - 1) === '\n') ? '[ ] ' : '\n[ ] ';
        this.insertTextAtCursor(prefix, start, end);
        break;
      }
      case 'timestamp': {
        const now = new Date();
        const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}] `;
        const prefix = (start === 0 || val.charAt(start - 1) === '\n') ? timeStr : '\n' + timeStr;
        this.insertTextAtCursor(prefix, start, end);
        break;
      }
      case 'clear': {
        if (confirm('Are you sure you want to clear your scratchpad notes?')) {
          this.textarea.value = '';
          this.saveNotes();
          this.updateCounters();
        }
        break;
      }
    }
    this.textarea.focus();
  }

  insertTextAtCursor(text, start, end) {
    const val = this.textarea.value;
    this.textarea.value = val.substring(0, start) + text + val.substring(end);
    this.textarea.selectionStart = this.textarea.selectionEnd = start + text.length;
    this.updateCounters();
    this.queueAutoSave();
  }

  exportNotes() {
    if (!this.textarea || !this.textarea.value.trim()) {
      alert('Your scratchpad is empty! Jot down some notes before exporting.');
      return;
    }

    // 1. Copy to clipboard
    navigator.clipboard.writeText(this.textarea.value)
      .then(() => {
        if (window.roomsEngine && typeof window.roomsEngine.showToast === 'function') {
          window.roomsEngine.showToast('📋 Scratchpad notes copied to clipboard!');
        } else {
          alert('Notes copied to clipboard!');
        }
      })
      .catch(() => {});

    // 2. Trigger markdown file download
    const blob = new Blob([this.textarea.value], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FocusFlow_Notes_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.notesEngine = new NotesEngine();
});
