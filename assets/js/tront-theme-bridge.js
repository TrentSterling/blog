/* Keep Chirpy 7.2's comments/diagrams in sync with the shared four-peg editor. */
(function () {
    'use strict';
    var html = document.documentElement, lastMode;
    /* Derive the heading ramp from the applied tokens, not storage: live drags,
       blocked storage, Undo and cross-tab changes all use the same render path.
       Keep every interpolated color readable against the editor's worst ground.
       The shared editor applies synchronously in <head>; this runs before paint. */
    function syncHeading() {
        var api = window.TrontThemeEditor, T = window.Tront;
        if (!api || !T || !html.style) return;
        var style = html.style, preview = style.getPropertyValue('--te-preview');
        var colors = preview.match(/#[a-f\d]{6}/gi);
        if (!colors || colors.length !== 4) return;
        var dark = html.getAttribute('data-te-mode') !== 'light';
        var ink = T.hexToRgb(style.getPropertyValue('--te-ink'));
        var grounds = [];
        ['bg', 'panel', 'elem', 'hover', 'wash', 'button'].forEach(function (role) {
            (style.getPropertyValue('--te-' + role).match(/#[a-f\d]{6}/gi) || []).forEach(function (color) { grounds.push(T.hexToRgb(color)); });
        });
        if (!ink || !grounds.length) return;
        var bound = [0, 1, 2].map(function (channel) {
            return Math[dark ? 'max' : 'min'].apply(Math, grounds.map(function (color) { return color[channel]; }));
        });
        var raw = colors.map(T.hexToRgb), ramp;
        for (var step = 0; step <= 100; step++) {
            ramp = raw.map(function (color) { return T.mix(color, ink, step / 100); });
            var foregroundBound = [0, 1, 2].map(function (channel) {
                return Math[dark ? 'min' : 'max'].apply(Math, ramp.map(function (color) { return color[channel]; }));
            });
            if (api.contrast(foregroundBound, bound) >= 4.7) break;
        }
        var index = 0, gradient = preview.replace(/#[a-f\d]{6}/gi, function () { return T.toHex(ramp[index++]); });
        if (style.getPropertyValue('--tront-heading-gradient') !== gradient) style.setProperty('--tront-heading-gradient', gradient);
    }
    function sync() {
        syncHeading();
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
    new MutationObserver(sync).observe(html, { attributes: true, attributeFilter: ['data-te-mode', 'style'] });
})();

