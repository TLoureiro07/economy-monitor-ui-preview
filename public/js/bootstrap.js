/**
 * Auto-open the dashboard in standalone browser preview (no FiveM).
 */
(function () {
  window.__PREVIEW_MODE__ = true;

  function boot() {
    window.dispatchEvent(new MessageEvent('message', { data: { action: 'open' } }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
