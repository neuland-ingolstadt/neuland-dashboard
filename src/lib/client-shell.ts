import { SIDEBAR_COLLAPSED_KEY } from "#/lib/sidebar";
import { THEME_STORAGE_KEY } from "#/lib/theme";

export const clientShellScript = `
(function () {
  try {
    if (localStorage.getItem('${SIDEBAR_COLLAPSED_KEY}') === '1') {
      document.documentElement.setAttribute('data-sidebar-collapsed', '');
    }
  } catch (e) {}

  var storageKey = '${THEME_STORAGE_KEY}';
  var cycle = ['system', 'light', 'dark'];
  var labels = {
    system: 'System-Design',
    light: 'Helles Design',
    dark: 'Dunkles Design',
  };
  var THEME_TRANSITION_MS = 180;

  function readMode() {
    try {
      var stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {}
    return 'system';
  }

  function applyMode(mode) {
    var root = document.documentElement;
    try {
      if (mode === 'system') {
        root.removeAttribute('data-theme');
        localStorage.removeItem(storageKey);
        return;
      }
      root.setAttribute('data-theme', mode);
      localStorage.setItem(storageKey, mode);
    } catch (e) {}
  }

  function nextMode(mode) {
    var index = cycle.indexOf(mode);
    return cycle[(index + 1) % cycle.length];
  }

  function syncToggle(button, mode) {
    button.setAttribute('data-theme-mode', mode);
    button.setAttribute('aria-label', labels[mode]);
    button.title = labels[mode];
    button.querySelectorAll('[data-theme-icon]').forEach(function (icon) {
      var active = icon.getAttribute('data-theme-icon') === mode;
      icon.classList.toggle('hidden', !active);
    });
  }

  function syncToggles() {
    var mode = readMode();
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      syncToggle(button, mode);
    });
  }

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function commitTheme(mode) {
    applyMode(mode);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (toggle) {
      syncToggle(toggle, mode);
    });
  }

  function applyThemeWithTransition(mode) {
    if (prefersReducedMotion()) {
      commitTheme(mode);
      return;
    }
    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(function () { commitTheme(mode); });
      return;
    }
    var root = document.documentElement;
    root.classList.add('theme-transition');
    commitTheme(mode);
    window.setTimeout(function () {
      root.classList.remove('theme-transition');
    }, THEME_TRANSITION_MS);
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-theme-toggle]');
    if (!button) return;
    event.preventDefault();
    applyThemeWithTransition(nextMode(readMode()));
  });

  applyMode(readMode());
  document.addEventListener('neuland:theme-hydrate', syncToggles);
})();
`;
