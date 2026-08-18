window.EITheme = (function () {
  var KEY = 'ei-theme';
  var OPACITY_KEY = 'ei-panel-opacity';
  var PALETTE_KEY = 'ei-palette';
  var DEFAULT_OPACITY = 92;
  var DEFAULT_PALETTE = 'amber';

  var PALETTES = {
    amber: {
      labelKey: 'palette_amber',
      accent: '#f0c14b',
      accentHover: '#f5cd66',
      accentPressed: '#d9a832',
      accentMuted: 'rgba(240, 193, 75, 0.22)',
      accentGlow: 'rgba(240, 193, 75, 0.35)',
      accentInkLight: '#8a6a12',
      ambient: '#ffe08a',
      warm: '#f0d9a8',
    },
    ocean: {
      labelKey: 'palette_ocean',
      accent: '#3aa7d6',
      accentHover: '#54b7e0',
      accentPressed: '#2b8fb8',
      accentMuted: 'rgba(58, 167, 214, 0.22)',
      accentGlow: 'rgba(58, 167, 214, 0.35)',
      accentInkLight: '#1a5f7a',
      ambient: '#7ec8e8',
      warm: '#a8d4e8',
    },
    forest: {
      labelKey: 'palette_forest',
      accent: '#4caf7a',
      accentHover: '#62c08c',
      accentPressed: '#3a9463',
      accentMuted: 'rgba(76, 175, 122, 0.22)',
      accentGlow: 'rgba(76, 175, 122, 0.35)',
      accentInkLight: '#1f6b45',
      ambient: '#8fd4a8',
      warm: '#b8d9c4',
    },
    rose: {
      labelKey: 'palette_rose',
      accent: '#e07a8a',
      accentHover: '#e9929f',
      accentPressed: '#c45f70',
      accentMuted: 'rgba(224, 122, 138, 0.22)',
      accentGlow: 'rgba(224, 122, 138, 0.35)',
      accentInkLight: '#8a3040',
      ambient: '#f0a8b4',
      warm: '#e8c4c8',
    },
    slate: {
      labelKey: 'palette_slate',
      accent: '#7a8494',
      accentHover: '#8f98a6',
      accentPressed: '#636c7a',
      accentMuted: 'rgba(122, 132, 148, 0.22)',
      accentGlow: 'rgba(122, 132, 148, 0.35)',
      accentInkLight: '#3a4250',
      ambient: '#b0b8c4',
      warm: '#c8ccd4',
    },
  };

  function lsGet(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      if (v != null && v !== '') return v;
    } catch (e) { /* CEF */ }
    return fallback;
  }

  function lsSet(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (e) { /* ignore */ }
  }

  function get() {
    var v = lsGet(KEY, 'light');
    return v === 'dark' ? 'dark' : 'light';
  }

  function getOpacity() {
    var v = parseInt(lsGet(OPACITY_KEY, String(DEFAULT_OPACITY)), 10);
    if (isNaN(v)) return DEFAULT_OPACITY;
    return Math.max(40, Math.min(100, v));
  }

  function getPalette() {
    var v = lsGet(PALETTE_KEY, DEFAULT_PALETTE);
    return PALETTES[v] ? v : DEFAULT_PALETTE;
  }

  function applyOpacity(pct) {
    pct = Math.max(40, Math.min(100, Number(pct) || DEFAULT_OPACITY));
    document.documentElement.style.setProperty('--ei-panel-opacity', String(pct / 100));
    lsSet(OPACITY_KEY, pct);
    return pct;
  }

  function applyPalette(id) {
    id = PALETTES[id] ? id : DEFAULT_PALETTE;
    var p = PALETTES[id];
    var root = document.documentElement;
    root.setAttribute('data-palette', id);
    root.style.setProperty('--ds-color-accent', p.accent);
    root.style.setProperty('--ds-color-accent-hover', p.accentHover);
    root.style.setProperty('--ds-color-accent-pressed', p.accentPressed);
    root.style.setProperty('--ds-color-accent-muted', p.accentMuted);
    root.style.setProperty('--ds-color-accent-glow', p.accentGlow);
    root.style.setProperty('--ds-ambient-accent', p.ambient);
    root.style.setProperty('--ds-ambient-warm', p.warm);
    root.style.setProperty('--ds-glow-accent', '0 8px 24px ' + p.accentGlow);
    root.style.setProperty('--ds-glow-accent-lg', '0 12px 40px ' + p.accentGlow);

    if (get() === 'dark') {
      root.style.setProperty('--ds-color-accent-ink', p.accent);
    } else {
      root.style.setProperty('--ds-color-accent-ink', p.accentInkLight);
    }

    lsSet(PALETTE_KEY, id);
    return id;
  }

  function apply(theme) {
    theme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    lsSet(KEY, theme);

    var btn = document.getElementById('btn-theme');
    if (btn && window.t) {
      var tip = theme === 'dark' ? t('theme_to_light') : t('theme_to_dark');
      btn.setAttribute('title', tip);
      btn.setAttribute('aria-label', tip);
    }

    applyOpacity(getOpacity());
    applyPalette(getPalette());
    if (window.EIWindow) EIWindow.init();
    return theme;
  }

  function toggle() {
    return apply(get() === 'dark' ? 'light' : 'dark');
  }

  function init() {
    apply(get());
  }

  function listPalettes() {
    return Object.keys(PALETTES).map(function (id) {
      return { id: id, accent: PALETTES[id].accent, labelKey: PALETTES[id].labelKey };
    });
  }

  return {
    get: get,
    apply: apply,
    toggle: toggle,
    init: init,
    getOpacity: getOpacity,
    applyOpacity: applyOpacity,
    getPalette: getPalette,
    applyPalette: applyPalette,
    listPalettes: listPalettes,
  };
})();
