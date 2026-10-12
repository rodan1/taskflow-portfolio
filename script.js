(() => {
  'use strict';

  const STORAGE_KEY = 'taskflow.tasks.v1';

  // ---------- State ----------
  let tasks = [];
  let currentFilter = 'all';
  let storageWorks = true;

  // ---------- Element references ----------
  const $ = (id) => document.getElementById(id);
  const form = $('task-form');
  const input = $('task-input');
  const errorEl = $('form-error');
  const list = $('task-list');
  const emptyState = $('empty-state');
  const clearBtn = $('clear-completed');
  const dialog = $('confirm-dialog');
  const notice = $('storage-notice');

  // ---------- Storage ----------
  // Only keep entries that look like real tasks, so bad stored data can't break the app.
  function isValidTask(t) {
    return t && typeof t.id === 'string' && typeof t.text === 'string'
      && t.text.trim() !== '' && typeof t.completed === 'boolean';
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Stored data is not a list');
      return parsed.filter(isValidTask);
    } catch (err) {
      // Unreadable data (or storage blocked): start fresh instead of crashing.
      if (err instanceof SyntaxError || err.message === 'Stored data is not a list') {
        showNotice('Saved data was unreadable, so TaskFlow started with an empty list.');
      } else {
        storageWorks = false;
        showNotice('Browser storage is unavailable. Tasks will be lost when you close this tab.');
      }
      return [];
    }
  }

  function saveTasks() {
    if (!storageWorks) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      storageWorks = false;
      showNotice('Could not save your tasks. Changes will be lost when you close this tab.');
    }
  }

  function showNotice(message) {
    notice.textContent = message;
    notice.hidden = false;
  }

  // ---------- Task actions ----------
  function createId() {
    return (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function addTask(text) {
    tasks.unshift({ id: createId(), text, completed: false, createdAt: Date.now() });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) task.completed = !task.completed;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter((t) => !t.completed);
    saveTasks();
    render();
  }

  // ---------- Rendering ----------
  const TRASH_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 6V4h4v2m-6 0l.7 10h6.6L14 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Built with createElement + textContent so user text is never parsed as HTML.
  function createTaskItem(task) {
    const li = document.createElement('li');
    li.className = 'task' + (task.completed ? ' task--done' : '');
    li.dataset.id = task.id;

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'task__check';
    check.checked = task.completed;
    check.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'active' : 'completed'}`);

    const text = document.createElement('span');
    text.className = 'task__text';
    text.textContent = task.text;

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'task__delete';
    del.setAttribute('aria-label', `Delete "${task.text}"`);
    del.innerHTML = TRASH_ICON; // fixed, trusted markup only

    li.append(check, text, del);
    return li;
  }

  function getVisibleTasks() {
    if (currentFilter === 'active') return tasks.filter((t) => !t.completed);
    if (currentFilter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }

  const EMPTY_MESSAGES = {
    all: ['No tasks yet', 'Add your first task above to start planning your day.'],
    active: ['Nothing left to do', 'Every task is complete. Add a new one or enjoy the break.'],
    completed: ['No completed tasks', 'Tasks you finish will show up here.'],
  };

  function renderStats() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    $('stat-total').textContent = total;
    $('stat-completed').textContent = completed;
    $('stat-pending').textContent = total - completed;

    $('progress-ring').style.setProperty('--pct', percent);
    $('progress-ring').setAttribute('aria-label', `${percent} percent complete`);
    $('progress-value').textContent = percent + '%';
    $('progress-label').textContent = total === 0
      ? 'Add a task to get started'
      : `${completed} of ${total} tasks done`;
    clearBtn.disabled = completed === 0;
  }

  function render() {
    const visible = getVisibleTasks();
    list.replaceChildren(...visible.map(createTaskItem));

    emptyState.hidden = visible.length > 0;
    if (visible.length === 0) {
      const [title, message] = EMPTY_MESSAGES[currentFilter];
      $('empty-title').textContent = title;
      $('empty-text').textContent = message;
    }

    document.querySelectorAll('.filter').forEach((btn) => {
      const active = btn.dataset.filter === currentFilter;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    renderStats();
  }

  // ---------- Events ----------
  form.addEventListener('submit', (event) => {
    event.preventDefault(); // also handles the Enter key
    const text = input.value.trim();
    if (!text) {
      errorEl.textContent = 'Enter a task name before adding it.';
      errorEl.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    errorEl.hidden = true;
    input.removeAttribute('aria-invalid');
    addTask(text);
    input.value = '';
    input.focus();
  });

  input.addEventListener('input', () => {
    errorEl.hidden = true;
    input.removeAttribute('aria-invalid');
  });

  // One listener on the list handles every task (event delegation).
  list.addEventListener('change', (event) => {
    if (event.target.classList.contains('task__check')) {
      toggleTask(event.target.closest('.task').dataset.id);
    }
  });
  list.addEventListener('click', (event) => {
    const del = event.target.closest('.task__delete');
    if (del) deleteTask(del.closest('.task').dataset.id);
  });

  document.querySelector('.filters').addEventListener('click', (event) => {
    const btn = event.target.closest('.filter');
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    render();
  });

  clearBtn.addEventListener('click', () => {
    const count = tasks.filter((t) => t.completed).length;
    if (count === 0) return;
    $('dialog-text').textContent = `This will permanently remove ${count} completed ${count === 1 ? 'task' : 'tasks'}. This can't be undone.`;
    dialog.showModal();
  });
  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'confirm') clearCompleted();
    dialog.returnValue = '';
  });

  // ---------- Start ----------
  tasks = loadTasks();
  render();
})();
