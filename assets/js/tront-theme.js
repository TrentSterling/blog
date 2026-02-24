/**
 * TRONT Theme Cycler for Chirpy Blog
 *
 * Overrides Theme.flip() to cycle: Light → Dark → TRONT Cyan → TRONT Purple
 *
 * Two-attribute system:
 *   data-mode  = "light" | "dark"
 *   data-theme = "tront-cyan" | "tront-purple" | absent (stock)
 *
 * Loaded synchronously after theme.min.js to prevent flash.
 */

(function () {
  var STORAGE_KEY = 'tront-theme';
  var MODE_ATTR = 'data-mode';
  var THEME_ATTR = 'data-theme';

  var THEMES = [
    { id: 'light',        mode: 'light', theme: null,           icon: '☀️', label: 'Light' },
    { id: 'dark',         mode: 'dark',  theme: null,           icon: '🌙', label: 'Dark' },
    { id: 'tront-cyan',   mode: 'dark',  theme: 'tront-cyan',  icon: '⚡', label: 'Cyan' },
    { id: 'tront-purple', mode: 'dark',  theme: 'tront-purple', icon: '✨', label: 'Purple' },
    { id: 'tront-ember',  mode: 'dark',  theme: 'tront-ember',  icon: '🔥', label: 'Ember' }
  ];

  function getIndex(id) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) return i;
    }
    return 0;
  }

  function applyTheme(entry) {
    var html = document.documentElement;

    // Always explicitly set data-mode (light or dark)
    html.setAttribute(MODE_ATTR, entry.mode);

    // Set or clear data-theme for TRONT accents
    if (entry.theme) {
      html.setAttribute(THEME_ATTR, entry.theme);
    } else {
      html.removeAttribute(THEME_ATTR);
    }

    // Persist in localStorage (durable) + sessionStorage (Chirpy compat)
    localStorage.setItem(STORAGE_KEY, entry.id);
    sessionStorage.setItem('mode', entry.mode);
  }

  function updateButton(entry) {
    var btn = document.getElementById('mode-toggle');
    if (!btn) return;

    var icon = btn.querySelector('.theme-icon');
    if (icon) icon.textContent = entry.icon;

    var label = btn.querySelector('.theme-label');
    if (label) label.textContent = entry.label;

    btn.setAttribute('aria-label', entry.label + ' theme');
  }

  function updateNavbarBtn(entry) {
    var btn = document.getElementById('tront-theme-btn');
    if (!btn) return;

    var icon = btn.querySelector('.theme-icon');
    if (icon) icon.textContent = entry.icon;

    var label = btn.querySelector('.theme-label');
    if (label) label.textContent = ' ' + entry.label;

    btn.setAttribute('aria-label', entry.label + ' theme');
  }

  function notifyGiscus() {
    window.postMessage({ id: Theme.ID }, '*');
  }

  // --- Apply saved theme immediately (before paint) ---
  var savedId = localStorage.getItem(STORAGE_KEY);
  if (savedId) {
    applyTheme(THEMES[getIndex(savedId)]);
  }

  // --- Override Theme.flip to cycle ---
  Theme.flip = function () {
    var currentId = localStorage.getItem(STORAGE_KEY);

    var currentIdx;
    if (currentId) {
      currentIdx = getIndex(currentId);
    } else {
      // First click — detect what Chirpy set
      var mode = document.documentElement.getAttribute(MODE_ATTR);
      currentIdx = mode === 'dark' ? 1 : 0;
    }

    var nextIdx = (currentIdx + 1) % THEMES.length;
    var next = THEMES[nextIdx];

    applyTheme(next);
    updateButton(next);
    updateNavbarBtn(next);
    notifyGiscus();
  };

  // --- Set initial button state once DOM is ready ---
  function initButton() {
    var id = localStorage.getItem(STORAGE_KEY);
    var entry;
    if (id) {
      entry = THEMES[getIndex(id)];
    } else {
      // No saved theme — detect current state and show it
      var mode = document.documentElement.getAttribute(MODE_ATTR);
      entry = THEMES[mode === 'dark' ? 1 : 0];
    }
    updateButton(entry);
    updateNavbarBtn(entry);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButton);
  } else {
    initButton();
  }
})();
