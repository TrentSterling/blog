/* Keep Chirpy 7.2's comments/diagrams in sync with the shared four-peg editor. */
(function () {
    'use strict';
    var html = document.documentElement, lastMode;
    function sync() {
        var mode = html.getAttribute('data-te-mode');
        if ((mode !== 'dark' && mode !== 'light') || mode === lastMode) return;
        lastMode = mode;
        html.setAttribute('data-mode', mode);
        try { sessionStorage.setItem('mode', mode); } catch (_) { /* Rendering still works without persistence. */ }
        if (document.readyState !== 'loading' && typeof Theme !== 'undefined') {
            window.postMessage({ id: Theme.ID }, window.location.origin);
        }
    }
    sync();
    new MutationObserver(sync).observe(html, { attributes: true, attributeFilter: ['data-te-mode'] });
})();
