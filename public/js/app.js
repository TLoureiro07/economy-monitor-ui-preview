(function () {
  var app = document.getElementById('app');
  var localeReady = false;

  if (window.EITheme) EITheme.init();

  function openUI() {
    app.classList.add('is-open');
    if (window.EITheme) EITheme.apply(EITheme.get());
    if (window.EIWindow) EIWindow.init();
    ensureLocale().then(function () {
      window.EIRouter.go('overview');
    });
  }

  function closeUI() {
    app.classList.remove('is-open');
    EIApi.close();
  }

  function ensureLocale() {
    if (localeReady) {
      if (window.EIi18n) EIi18n.applyStatic();
      if (window.EITheme) EITheme.apply(EITheme.get());
      return Promise.resolve();
    }
    return EIApi.request('getUiLocales').then(function (locRes) {
      if (locRes && locRes.ok && locRes.data && window.EIi18n && locRes.data.packs) {
        EIi18n.loadPacks(locRes.data.packs);
      }
      return EIApi.request('getSettings');
    }).then(function (res) {
      var code = (res.data && res.data.locale) || 'en';
      if (window.EIi18n) {
        EIi18n.setLocale(code);
      }
      localeReady = true;
      if (window.EITheme) EITheme.apply(EITheme.get());
    }).catch(function () {
      if (window.EIi18n) EIi18n.setLocale('en');
      localeReady = true;
      if (window.EITheme) EITheme.apply(EITheme.get());
    });
  }

  document.querySelectorAll('.ds-pill-nav__item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.EIRouter.go(btn.getAttribute('data-route'));
    });
  });

  document.getElementById('btn-close').addEventListener('click', closeUI);
  document.getElementById('btn-refresh').addEventListener('click', function () {
    window.EIRouter.refresh();
  });
  var btnSettings = document.getElementById('btn-settings');
  if (btnSettings) {
    btnSettings.addEventListener('click', function () {
      window.EIRouter.go('settings');
    });
  }
  var btnTheme = document.getElementById('btn-theme');
  if (btnTheme && window.EITheme) {
    btnTheme.addEventListener('click', function () {
      EITheme.toggle();
      if (window.EIRouter) EIRouter.refresh();
    });
  }

  window.addEventListener('message', function (event) {
    var data = event.data || {};
    if (data.action === 'open') openUI();
    if (data.action === 'close') app.classList.remove('is-open');
    if (data.action === 'response') EIApi.handleResponse(data);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && app.classList.contains('is-open')) {
      closeUI();
    }
  });

  if (window.EIi18n) EIi18n.applyStatic();
})();
