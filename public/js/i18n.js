window.EIi18n = (function () {
  var locale = 'en';
  // Minimal fallback until locales/locales.lua is loaded from the server
  var packs = {
    en: {
      brand: 'Economy Monitor',
      loading: 'Loading…',
      error_load: 'Failed to load.',
      close: 'Close',
      refresh: 'Refresh',
      settings_title: 'Settings',
      nav_overview: 'Overview',
      nav_timeline: 'Timeline',
      nav_players: 'Players',
      nav_statistics: 'Statistics',
      nav_alerts: 'Alerts',
      nav_settings: 'Settings',
    },
  };

  function t(key) {
    var pack = packs[locale] || packs.en;
    return (pack && pack[key]) || (packs.en && packs.en[key]) || key;
  }

  function setLocale(code) {
    if (packs[code]) locale = code;
    else locale = 'en';
    applyStatic();
    return locale;
  }

  function getLocale() { return locale; }

  function loadPacks(next) {
    if (!next || typeof next !== 'object') return;
    packs = next;
    api.packs = packs;
    if (!packs[locale] && packs.en) locale = 'en';
    applyStatic();
  }

  function available() {
    return Object.keys(packs || {});
  }

  function applyStatic() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', t(key));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (key) el.setAttribute('title', t(key));
    });
    var brand = document.getElementById('ei-brand-text');
    if (brand) brand.textContent = t('brand');
  }

  var api = {
    t: t,
    setLocale: setLocale,
    getLocale: getLocale,
    applyStatic: applyStatic,
    loadPacks: loadPacks,
    available: available,
    packs: packs,
  };
  return api;
})();

window.t = function (key) { return window.EIi18n.t(key); };
