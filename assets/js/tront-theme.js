/**
 * TRONT Theme Cycler for Chirpy Blog
 *
 * Overrides Theme.flip() to cycle: Light → Dark → TRONT Cyan → TRONT Purple
 *
 * Two-attribute system:
 *   data-mode  = Chirpy's "dark" or absent (light)
 *   data-theme = "tront-cyan" | "tront-purple" or absent (stock)
 *
 * Loaded synchronously after theme.min.js to prevent flash.
 */

(function () {
  var STORAGE_KEY = 'tront-theme';
  var MODE_ATTR = 'data-mode';
  var THEME_ATTR = 'data-theme';

  var THEMES = [
    { id: 'light',        mode: null,   theme: null,           icon: 'fas fa-sun',             label: 'Light' },
    { id: 'dark',         mode: 'dark', theme: null,           icon: 'fas fa-moon',            label: 'Dark' },
    { id: 'tront-cyan',   mode: 'dark', theme: 'tront-cyan',  icon: 'fas fa-bolt',            label: 'TRONT Cyan' },
    { id: 'tront-purple', mode: 'dark', theme: 'tront-purple', icon: 'fas fa-magic',           label: 'TRONT Purple' }
  ];

  function getIndex(id) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) return i;
    }
    return 0;
  }

  function applyTheme(entry) {
    var html = document.documentElement;

    // Set data-mode
    if (entry.mode) {
      html.setAttribute(MODE_ATTR, entry.mode);
    } else {
      html.removeAttribute(MODE_ATTR);
    }

    // Set data-theme
    if (entry.theme) {
      html.setAttribute(THEME_ATTR, entry.theme);
    } else {
      html.removeAttribute(THEME_ATTR);
    }

    // Persist in both localStorage (durable) and sessionStorage (Chirpy compat)
    localStorage.setItem(STORAGE_KEY, entry.id);
    if (entry.mode) {
      sessionStorage.setItem('mode', entry.mode);
    } else {
      sessionStorage.removeItem('mode');
    }
  }

  function updateIcon(entry) {
    var btn = document.getElementById('mode-toggle');
    if (!btn) return;
    var icon = btn.querySelector('i');
    if (!icon) return;
    // Replace all fa- icon classes
    icon.className = entry.icon;
    btn.setAttribute('aria-label', entry.label);
  }

  function notifyGiscus() {
    window.postMessage({ id: Theme.ID }, '*');
  }

  // --- Apply saved theme immediately (before paint) ---
  var savedId = localStorage.getItem(STORAGE_KEY);
  if (savedId) {
    var idx = getIndex(savedId);
    applyTheme(THEMES[idx]);
  }

  // --- Override Theme.flip to cycle ---
  Theme.flip = function () {
    var currentId = localStorage.getItem(STORAGE_KEY);

    // Determine current index
    var currentIdx;
    if (currentId) {
      currentIdx = getIndex(currentId);
    } else {
      // First click — detect what Chirpy set
      var mode = document.documentElement.getAttribute(MODE_ATTR);
      currentIdx = mode === 'dark' ? 1 : 0;
    }

    // Advance to next
    var nextIdx = (currentIdx + 1) % THEMES.length;
    var next = THEMES[nextIdx];

    applyTheme(next);
    updateIcon(next);
    notifyGiscus();
  };

  // --- Set initial icon once DOM is ready ---
  function initIcon() {
    var savedId2 = localStorage.getItem(STORAGE_KEY);
    if (savedId2) {
      updateIcon(THEMES[getIndex(savedId2)]);
    }
    // else: Chirpy's default icon (fa-adjust) is fine for light/dark
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIcon);
  } else {
    initIcon();
  }
})();
