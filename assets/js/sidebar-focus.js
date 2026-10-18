/* Keep Chirpy's off-canvas sidebar out of the mobile keyboard/accessibility tree. */
(() => {
  'use strict';

  const sidebar = document.getElementById('sidebar');
  const trigger = document.getElementById('sidebar-trigger');
  if (!sidebar || !trigger) return;

  // Match Chirpy 7.2's sidebar/topbar breakpoint, not Bootstrap's default.
  const desktop = window.matchMedia('(min-width: 850px)');
  const isOpen = () => document.body.hasAttribute('sidebar-display');
  const focusTrigger = () => trigger.focus({ preventScroll: true });
  const focusSidebar = () => sidebar.querySelector('a[href]')?.focus({ preventScroll: true });
  let wasOpen = isOpen();

  trigger.setAttribute('aria-controls', 'sidebar');

  function sync() {
    const open = isOpen();
    const hidden = !desktop.matches && !open;
    // Move focus before making its current container inert.
    if (hidden && sidebar.contains(document.activeElement)) focusTrigger();
    sidebar.inert = hidden;
    trigger.setAttribute('aria-expanded', String(open));

    if (!desktop.matches && open !== wasOpen) {
      if (open) {
        // The sidebar precedes the trigger in DOM order. Keyboard activation
        // needs an entry point; pointer activation need not move focus.
        if (document.activeElement === trigger) focusSidebar();
      } else {
        focusTrigger();
      }
    }
    wasOpen = open;
  }

  function resize() {
    if (desktop.matches && isOpen()) {
      // Use Chirpy's handler so its private toggle state and mask stay in sync.
      trigger.click();
    }
    sync();
    // Only rescue focus that would otherwise remain on a hidden control.
    if (desktop.matches && document.activeElement === trigger) focusSidebar();
  }

  new MutationObserver(sync).observe(document.body, {
    attributes: true,
    attributeFilter: ['sidebar-display']
  });
  desktop.addEventListener('change', resize);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.defaultPrevented || desktop.matches || !isOpen()) return;
    // Leave Escape to an active dialog, such as the shared theme editor.
    if (document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')) return;
    event.preventDefault();
    trigger.click();
  });
  sync();
})();
