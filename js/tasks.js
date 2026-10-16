/**
 * FocusFlow — Task List & Active Focus Management
 * Handles task creation, deletion, completion status, active task pinning,
 * and localStorage persistence.
 */

class TaskManager {
  constructor() {
    this.tasks = [];
    this.activeTaskId = null;
    this.currentFilter = 'all'; // 'all' | 'active' | 'completed'

    this.cacheDom();
    this.loadTasks();
    this.bindEvents();
    this.render();
  }

  cacheDom() {
    this.drawer = document.getElementById('tasks-drawer');
    this.btnToggle = document.getElementById('btn-toggle-tasks');
    this.navTasksBtn = document.getElementById('tab-tasks-nav');
    this.btnClose = document.getElementById('btn-close-tasks');
    this.inputNewTask = document.getElementById('input-new-task');
    this.btnAddTask = document.getElementById('btn-add-task');
    this.tasksList = document.getElementById('tasks-list');
    this.taskBadge = document.getElementById('task-count-badge');
    this.activeTaskLabel = document.getElementById('active-task-label');
    this.activeTaskPill = document.getElementById('active-task-pill');
    this.filterBtns = document.querySelectorAll('.task-filter-btn');
  }

  bindEvents() {
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', () => this.toggleDrawer());
    }
    if (this.navTasksBtn) {
      this.navTasksBtn.addEventListener('click', () => this.toggleDrawer());
    }
    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.closeDrawer());
    }
    if (this.activeTaskPill) {
      this.activeTaskPill.addEventListener('click', () => this.openDrawer());
    }

    if (this.btnAddTask && this.inputNewTask) {
      this.btnAddTask.addEventListener('click', () => this.addTaskFromInput());
      this.inputNewTask.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.addTaskFromInput();
      });
    }

    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentFilter = e.currentTarget.dataset.filter;
        this.render();
      });
    });
  }

  loadTasks() {
    try {
      const saved = localStorage.getItem('focusflow_tasks');
      if (saved) {
        this.tasks = JSON.parse(saved);
      } else {
        // Starter sample tasks
        this.tasks = [
          { id: '1', title: 'Complete Chapter 4 reading', completed: false, createdAt: Date.now() },
          { id: '2', title: 'Outline project milestones', completed: true, createdAt: Date.now() - 3600000 },
          { id: '3', title: 'Review study flashcards', completed: false, createdAt: Date.now() - 7200000 }
        ];
        this.activeTaskId = '1';
      }

      const savedActive = localStorage.getItem('focusflow_active_task_id');
      if (savedActive) {
        this.activeTaskId = savedActive;
      } else if (this.tasks.length > 0) {
        this.activeTaskId = this.tasks[0].id;
      }
    } catch (e) {
      console.warn('Failed to load tasks', e);
      this.tasks = [];
    }
  }

  saveTasks() {
    try {
      localStorage.setItem('focusflow_tasks', JSON.stringify(this.tasks));
      if (this.activeTaskId) {
        localStorage.setItem('focusflow_active_task_id', this.activeTaskId);
      } else {
        localStorage.removeItem('focusflow_active_task_id');
      }
    } catch (e) {}
  }

  toggleDrawer() {
    if (this.drawer.classList.contains('open')) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  openDrawer() {
    this.drawer.classList.add('open');
    if (this.inputNewTask) this.inputNewTask.focus();
  }

  closeDrawer() {
    this.drawer.classList.remove('open');
  }

  addTaskFromInput() {
    const title = this.inputNewTask.value.trim();
    if (!title) return;

    const newTask = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: Date.now()
    };

    this.tasks.unshift(newTask);
    if (!this.activeTaskId) {
      this.activeTaskId = newTask.id;
    }

    this.inputNewTask.value = '';
    this.saveTasks();
    this.render();
  }

  toggleTaskComplete(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    if (this.activeTaskId === id) {
      const remainingIncomplete = this.tasks.find(t => !t.completed);
      this.activeTaskId = remainingIncomplete ? remainingIncomplete.id : null;
    }
    this.saveTasks();
    this.render();
  }

  setActiveTask(id) {
    this.activeTaskId = id;
    this.saveTasks();
    this.render();
  }

  getActiveTask() {
    return this.tasks.find(t => t.id === this.activeTaskId);
  }

  render() {
    // Filter tasks
    let filtered = this.tasks;
    if (this.currentFilter === 'active') {
      filtered = this.tasks.filter(t => !t.completed);
    } else if (this.currentFilter === 'completed') {
      filtered = this.tasks.filter(t => t.completed);
    }

    // Render list
    if (this.tasksList) {
      if (filtered.length === 0) {
        this.tasksList.innerHTML = `
          <div class="tasks-empty-state">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <p>No tasks found in this view.</p>
          </div>
        `;
      } else {
        this.tasksList.innerHTML = filtered.map(task => {
          const isActive = task.id === this.activeTaskId;
          return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isActive ? 'is-active-target' : ''}">
              <label class="task-checkbox-wrap">
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}" class="task-checkbox">
                <span class="custom-checkmark"></span>
              </label>
              
              <span class="task-text" data-id="${task.id}" title="${task.title}">${task.title}</span>

              <div class="task-item-actions">
                <button class="task-pin-btn ${isActive ? 'active' : ''}" data-id="${task.id}" title="${isActive ? 'Active Focus Task' : 'Set as Active Focus'}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="${isActive ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
                <button class="task-delete-btn" data-id="${task.id}" title="Delete Task">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          `;
        }).join('');

        // Attach event listeners to items
        this.tasksList.querySelectorAll('.task-checkbox').forEach(cb => {
          cb.addEventListener('change', (e) => this.toggleTaskComplete(e.target.dataset.id));
        });

        this.tasksList.querySelectorAll('.task-pin-btn').forEach(btn => {
          btn.addEventListener('click', (e) => this.setActiveTask(e.currentTarget.dataset.id));
        });

        this.tasksList.querySelectorAll('.task-delete-btn').forEach(btn => {
          btn.addEventListener('click', (e) => this.deleteTask(e.currentTarget.dataset.id));
        });
      }
    }

    // Update incomplete count badge
    const pendingCount = this.tasks.filter(t => !t.completed).length;
    if (this.taskBadge) {
      this.taskBadge.textContent = pendingCount;
      this.taskBadge.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
    }

    // Update active task banner on center timer
    const active = this.getActiveTask();
    if (this.activeTaskLabel) {
      if (active) {
        this.activeTaskLabel.textContent = `Focusing on: ${active.title}`;
        if (this.activeTaskPill) this.activeTaskPill.style.display = 'inline-flex';
      } else {
        this.activeTaskLabel.textContent = `Focusing on: General Study`;
      }
    }
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.taskManager = new TaskManager();
});
