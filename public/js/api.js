/**
 * Preview NUI bridge — same EIApi surface as production, backed by mock data.
 */
window.EIApi = (function () {
  var pending = {};
  var seq = 1;
  var DELAY_MIN = 280;
  var DELAY_MAX = 520;

  function delay() {
    return DELAY_MIN + Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN));
  }

  function request(name, payload) {
    var reqId = 'r' + (seq++);
    return new Promise(function (resolve) {
      pending[reqId] = resolve;
      setTimeout(function () {
        var handler = window.EIMockData && EIMockData.handle;
        var data = handler ? handler(name, payload || {}) : { ok: false, error: 'no_mock' };
        handleResponse({ reqId: reqId, payload: { ok: true, data: data } });
      }, delay());
      setTimeout(function () {
        if (pending[reqId]) {
          delete pending[reqId];
          resolve({ ok: false, error: 'timeout' });
        }
      }, 25000);
    });
  }

  function handleResponse(msg) {
    var resolve = pending[msg.reqId];
    if (!resolve) return;
    delete pending[msg.reqId];
    resolve(msg.payload || { ok: false });
  }

  function close() {
    var app = document.getElementById('app');
    if (app) app.classList.remove('is-open');
    return Promise.resolve({ ok: true });
  }

  function formatMoney(n) {
    n = Number(n) || 0;
    var loc = (window.EIi18n && EIi18n.getLocale()) || 'en';
    var map = { en: 'en-GB', pt: 'pt-PT', es: 'es-ES', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL' };
    return n.toLocaleString(map[loc] || 'en-GB');
  }

  function formatCompact(n) {
    var neg = Number(n) < 0;
    n = Math.abs(Number(n) || 0);
    var s;
    if (n >= 1e9) s = (n / 1e9).toFixed(n >= 1e10 ? 0 : 1).replace(/\.0$/, '') + 'B';
    else if (n >= 1e6) s = (n / 1e6).toFixed(n >= 1e7 ? 1 : 1).replace(/\.0$/, '') + 'M';
    else if (n >= 1e3) s = (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k';
    else s = String(Math.round(n));
    return (neg ? '-' : '') + s;
  }

  function formatTs(ts) {
    if (!ts) return '—';
    var d = new Date(ts * 1000);
    var loc = (window.EIi18n && EIi18n.getLocale()) || 'en';
    var map = { en: 'en-GB', pt: 'pt-PT', es: 'es-ES', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL' };
    return d.toLocaleString(map[loc] || 'en-GB');
  }

  return {
    request: request,
    handleResponse: handleResponse,
    close: close,
    formatMoney: formatMoney,
    formatCompact: formatCompact,
    formatTs: formatTs,
  };
})();
