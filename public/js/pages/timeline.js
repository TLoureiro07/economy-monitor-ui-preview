window.EIPages = window.EIPages || {};

window.EIPages.timeline = {
  get title() { return t('timeline_title'); },
  get subtitle() { return t('timeline_sub'); },
  _page: 1,
  _pages: 1,
  _total: 0,
  _limit: 25,
  _req: 0,
  _category: '',

  render: function (root) {
    var self = this;
    self._page = 1;
    self._category = '';
    EIUI.clearPageMetrics();

    var categoryOptions = [
      { value: '', label: t('filter_all_categories') },
      { value: 'property', label: t('cat_property') },
      { value: 'vehicle', label: t('cat_vehicle') },
      { value: 'casino', label: t('cat_casino') },
      { value: 'society', label: t('cat_society') },
      { value: 'banking', label: t('cat_banking') },
      { value: 'shop', label: t('cat_shop') },
      { value: 'job', label: t('cat_job') },
      { value: 'weapon', label: t('cat_weapon') },
      { value: 'drugs', label: t('cat_drugs') },
      { value: 'storage', label: t('cat_storage') },
      { value: 'transfer', label: t('cat_transfer') },
      { value: 'salary', label: t('cat_salary') },
      { value: 'purchase', label: t('cat_purchase') },
      { value: 'sell', label: t('cat_sell') },
      { value: 'admin', label: t('cat_admin') },
      { value: 'unknown', label: t('cat_unknown') },
    ];

    root.innerHTML =
      '<div class="ei-filters">' +
        '<input class="ds-input ei-filters__search" id="tl-q" type="search" placeholder="' + EIUI.esc(t('filter_activity_search')) + '" autocomplete="off" spellcheck="false" />' +
        EIUI.dropdownHtml({ id: 'tl-category', options: categoryOptions, value: '' }) +
        '<input class="ds-input" id="tl-min" type="number" placeholder="' + EIUI.esc(t('filter_min_amount')) + '" />' +
      '</div>' +
      '<div id="tl-feed" class="ds-feed"><div class="ei-empty">' + EIUI.esc(t('loading')) + '</div></div>' +
      '<div class="ei-pager" id="tl-pager" hidden></div>';

    var debounceTimer = null;
    var categoryDd = EIUI.bindDropdown('tl-category', function (value) {
      self._category = value || '';
      load(1);
    });

    function filtersPayload(page) {
      var qEl = document.getElementById('tl-q');
      var minEl = document.getElementById('tl-min');
      return {
        page: page || self._page,
        limit: self._limit,
        q: qEl ? qEl.value.trim() : '',
        category: self._category || null,
        min_amount: minEl && minEl.value ? minEl.value : null,
      };
    }

    function renderPager() {
      var el = document.getElementById('tl-pager');
      if (!el) return;
      if (self._total <= 0) {
        el.hidden = true;
        el.innerHTML = '';
        return;
      }
      el.hidden = false;
      el.innerHTML =
        '<button class="ds-btn ds-btn--ghost ds-btn--sm" id="tl-prev" type="button"' +
          (self._page <= 1 ? ' disabled' : '') + '>← ' + EIUI.esc(t('previous')) + '</button>' +
        '<span class="ei-pager__label">' + EIUI.esc(t('page')) + ' <strong>' + self._page + '</strong> / ' + self._pages +
          ' · ' + self._total + ' ' + EIUI.esc(t('records')) + '</span>' +
        '<button class="ds-btn ds-btn--ghost ds-btn--sm" id="tl-next" type="button"' +
          (self._page >= self._pages ? ' disabled' : '') + '>' + EIUI.esc(t('next')) + ' →</button>';

      var prev = document.getElementById('tl-prev');
      var next = document.getElementById('tl-next');
      if (prev) prev.onclick = function () { if (self._page > 1) load(self._page - 1); };
      if (next) next.onclick = function () { if (self._page < self._pages) load(self._page + 1); };
    }

    function load(page) {
      self._page = page || 1;
      var reqId = ++self._req;
      var el = document.getElementById('tl-feed');
      el.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('loading')) + '</div>';

      return EIApi.request('timeline', filtersPayload(self._page)).then(function (res) {
        if (reqId !== self._req) return;
        if (!res.ok) {
          el.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('error_load')) +
            (res.error ? '<br/><span class="ds-caption">' + String(res.error) + '</span>' : '') +
            '</div>';
          renderPager();
          return;
        }
        var data = res.data || {};
        var items = data.items || [];
        self._page = data.page || self._page;
        self._pages = data.pages || 1;
        self._total = data.total || 0;

        EIUI.setPageMetrics([
          { label: t('total'), value: self._total },
          { label: t('page'), value: self._page + '/' + self._pages },
        ]);

        if (!items.length) {
          el.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('no_results')) + '</div>';
          renderPager();
          return;
        }
        el.innerHTML = items.map(function (row) {
          return EIUI.feedRow(row);
        }).join('');
        renderPager();
      });
    }

    function scheduleReload() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        load(1);
      }, 280);
    }

    document.getElementById('tl-q').addEventListener('input', scheduleReload);
    document.getElementById('tl-min').addEventListener('input', scheduleReload);

    void categoryDd;

    return load(1);
  },
};
