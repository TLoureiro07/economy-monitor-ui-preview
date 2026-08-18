window.EIRouter = (function () {
  var current = 'overview';
  var ALIAS = { search: 'players', player: 'players', wealth: 'statistics' };

  function pageTitle(page, route) {
    if (!page) return route;
    if (typeof page.title === 'function') return page.title();
    return page.title || route;
  }

  function pageSubtitle(page) {
    if (!page) return '';
    if (typeof page.subtitle === 'function') return page.subtitle();
    return page.subtitle || '';
  }

  function go(route) {
    var requested = route || 'overview';
    current = ALIAS[requested] || requested;

    if (requested === 'players' || requested === 'search') {
      if (window.EIPages.players) window.EIPages.players._view = 'search';
    }
    if (requested === 'player' && window.EIPages.players) {
      window.EIPages.players._view = 'profile';
    }

    document.querySelectorAll('.ds-pill-nav__item').forEach(function (btn) {
      var isSettings = current === 'settings';
      btn.classList.toggle('is-active', !isSettings && btn.getAttribute('data-route') === current);
    });
    var settingsBtn = document.getElementById('btn-settings');
    if (settingsBtn) {
      settingsBtn.classList.toggle('is-active', current === 'settings');
    }

    var page = window.EIPages[current];
    document.getElementById('page-title').textContent = pageTitle(page, current);
    document.getElementById('page-subtitle').textContent = pageSubtitle(page);
    if (window.EIUI) EIUI.clearPageMetrics();

    var root = document.getElementById('page-root');
    if (page && page.render) {
      page.render(root);
    } else {
      root.innerHTML = '<div class="ei-empty">' + (window.t ? t('no_results') : 'Not found.') + '</div>';
    }
  }

  function refresh() {
    var page = window.EIPages[current];
    var root = document.getElementById('page-root');
    if (page && page.render) {
      page.render(root);
    } else {
      go(current);
    }
  }

  function currentRoute() {
    return current;
  }

  return { go: go, refresh: refresh, current: currentRoute };
})();
