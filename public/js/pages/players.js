window.EIPages = window.EIPages || {};

/**
 * Players — search + profile in the same tab.
 */
window.EIPages.players = {
  get title() { return t('players_title'); },
  get subtitle() { return t('players_sub'); },
  _view: 'search', // search | profile

  render: function (root) {
    var self = this;
    var pk = window.EIState && window.EIState.selectedPlayerPk;

    if (self._view === 'profile' && pk) {
      return self._renderProfile(root, pk);
    }

    self._view = 'search';
    return self._renderSearch(root);
  },

  _openPlayer: function (root, pk) {
    window.EIState = window.EIState || {};
    window.EIState.selectedPlayerPk = Number(pk);
    this._view = 'profile';
    this.render(root);
  },

  _bindPlayerRows: function (el, root) {
    var self = this;
    el.querySelectorAll('.ei-players-table__row').forEach(function (row) {
      row.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        self._openPlayer(root, row.getAttribute('data-pk'));
      });
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          self._openPlayer(root, row.getAttribute('data-pk'));
        }
      });
    });
    el.querySelectorAll('button[data-pk]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        self._openPlayer(root, btn.getAttribute('data-pk'));
      };
    });
  },

  _renderPlayersTable: function (items, opts) {
    opts = opts || {};
    var showOnlineId = !!opts.showOnlineId;
    return (
      '<table class="ds-table ei-players-table"><thead><tr>' +
        '<th class="ei-col-avatar" scope="col" aria-label="' + EIUI.esc(t('col_discord')) + '"></th>' +
        '<th class="ei-col-name" scope="col">' + EIUI.esc(t('name')) + '</th>' +
        '<th class="ei-col-ident" scope="col">' + EIUI.esc(t('identifier')) + '</th>' +
        '<th class="ei-col-license" scope="col">' + EIUI.esc(t('license')) + '</th>' +
        '<th class="ei-col-action" scope="col"></th>' +
      '</tr></thead><tbody>' +
      items.map(function (p) {
        var avatar = p.avatar_url
          ? '<img class="ei-avatar" src="' + EIUI.esc(p.avatar_url) + '" alt="" loading="lazy" referrerpolicy="no-referrer" />'
          : '<div class="ei-avatar ei-avatar--placeholder">' + EIUI.esc((p.name || '?').charAt(0).toUpperCase()) + '</div>';
        var nameExtra = '';
        if (showOnlineId && p.server_id != null) {
          nameExtra =
            '<div class="ds-caption ei-players-table__sid">' +
              EIUI.esc(t('alert_ingame_id') + ' ' + p.server_id) +
            '</div>';
        }
        return '<tr class="ei-players-table__row" data-pk="' + p.id + '" tabindex="0" role="button">' +
          '<td class="ei-col-avatar">' + avatar + '</td>' +
          '<td class="ei-col-name"><strong>' + EIUI.esc(p.name) + '</strong>' + nameExtra + '</td>' +
          '<td class="ei-col-ident ds-truncate">' + EIUI.esc(p.identifier) + '</td>' +
          '<td class="ei-col-license ds-truncate">' + EIUI.esc(p.license) + '</td>' +
          '<td class="ei-col-action"><button class="ds-btn ds-btn--soft ds-btn--sm" data-pk="' + p.id + '" type="button">' + EIUI.esc(t('open')) + '</button></td>' +
          '</tr>';
      }).join('') + '</tbody></table>'
    );
  },

  _paintOnlineList: function (el, root) {
    var self = this;
    el.classList.add('ei-empty');
    el.innerHTML = EIUI.esc(t('loading'));
    return EIApi.request('onlinePlayers', {}).then(function (res) {
      if (!res.ok) {
        el.classList.add('ei-empty');
        el.innerHTML = EIUI.esc(t('error_load'));
        return;
      }
      var items = (res.data && res.data.items) || [];
      EIUI.setPageMetrics([{ label: t('online'), value: items.length }]);
      if (!items.length) {
        el.classList.remove('ei-empty');
        el.innerHTML =
          '<div class="ds-card__header ei-players-list-header">' +
            '<div class="ds-card__title">' + EIUI.esc(t('players_online_list')) + '</div>' +
            '<span class="ds-badge ds-badge--neutral">0</span>' +
          '</div>' +
          '<div class="ei-empty">' + EIUI.esc(t('players_none_online')) + '</div>';
        return;
      }
      el.classList.remove('ei-empty');
      el.innerHTML =
        '<div class="ds-card__header ei-players-list-header">' +
          '<div class="ds-card__title">' + EIUI.esc(t('players_online_list')) + '</div>' +
          '<span class="ds-badge ds-badge--success">' + items.length + '</span>' +
        '</div>' +
        self._renderPlayersTable(items, { showOnlineId: true });
      self._bindPlayerRows(el, root);
    });
  },

  _renderSearch: function (root) {
    var self = this;
    EIUI.clearPageMetrics();
    document.getElementById('page-title').textContent = t('players_title');
    document.getElementById('page-subtitle').textContent = t('players_search_hint');

    root.innerHTML =
      '<div class="ei-search-bar">' +
        '<input class="ds-input" id="search-q" type="search" placeholder="' + EIUI.esc(t('players_placeholder')) + '" autocomplete="off" spellcheck="false" />' +
        '<button class="ds-btn ds-btn--primary ds-btn--sm" id="search-go" type="button">' + EIUI.esc(t('search')) + '</button>' +
      '</div>' +
      '<div class="ds-card ds-card--flush"><div id="search-results" class="ei-empty">' + EIUI.esc(t('loading')) + '</div></div>';

    var timer = null;
    var el = document.getElementById('search-results');

    function run() {
      var q = document.getElementById('search-q').value.trim();
      var isId = /^\d+$/.test(q);
      if (!q || (q.length < 2 && !isId)) {
        self._paintOnlineList(el, root);
        return;
      }
      el.classList.add('ei-empty');
      el.innerHTML = EIUI.esc(t('loading'));
      EIApi.request('search', { query: q }).then(function (res) {
        if (!res.ok) {
          el.classList.add('ei-empty');
          el.innerHTML = EIUI.esc(t('error_load'));
          return;
        }
        var items = (res.data && res.data.items) || [];
        EIUI.setPageMetrics([{ label: t('results'), value: items.length }]);
        if (!items.length) {
          el.classList.add('ei-empty');
          el.innerHTML = EIUI.esc(t('no_results'));
          return;
        }
        el.classList.remove('ei-empty');
        el.innerHTML =
          '<div class="ds-card__header ei-players-list-header">' +
            '<div class="ds-card__title">' + EIUI.esc(t('results')) + '</div>' +
            '<span class="ds-badge ds-badge--neutral">' + items.length + '</span>' +
          '</div>' +
          self._renderPlayersTable(items, { showOnlineId: false });
        self._bindPlayerRows(el, root);
      });
    }

    document.getElementById('search-go').onclick = run;
    document.getElementById('search-q').addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(run, 220);
    });
    self._paintOnlineList(el, root);
    document.getElementById('search-q').focus();
  },

  _periodFrom: '',
  _periodTo: '',

  _defaultPeriodRange: function () {
    var to = EIUI.formatYmd ? EIUI.formatYmd(new Date()) : '';
    if (!to) {
      var d = new Date();
      var p = function (n) { return n < 10 ? '0' + n : String(n); };
      to = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }
    var from = EIUI.ymdAddDays ? EIUI.ymdAddDays(to, -29) : to;
    return { from: from, to: to };
  },

  _formatPlaytime: function (sec) {
    sec = Math.max(0, Math.floor(Number(sec) || 0));
    if (sec <= 0) return t('playtime_none');
    var d = Math.floor(sec / 86400);
    var h = Math.floor((sec % 86400) / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var parts = [];
    if (d > 0) parts.push(d + t('playtime_d'));
    if (h > 0) parts.push(h + t('playtime_h'));
    if (m > 0 || parts.length === 0) parts.push(m + t('playtime_m'));
    return parts.join(' ');
  },

  _periodLabel: function (from, to) {
    if (!from) return t('period_last_n').replace('%s', '30');
    // Compact DD/MM (no year) — widgets are narrow
    if (EIUI.formatDateCompact) {
      var a = EIUI.formatDateCompact(from, false);
      if (!to || from === to) return a;
      return a + ' – ' + EIUI.formatDateCompact(to, false);
    }
    if (EIUI.formatRangeLabel) {
      return EIUI.formatRangeLabel(from, to || from);
    }
    if (to && from !== to) return from + ' – ' + to;
    return from;
  },

  _metricLabels: function (from, to) {
    var suffix = this._periodLabel(from, to);
    return {
      received: t('received') + ' (' + suffix + ')',
      spent: t('spent') + ' (' + suffix + ')',
    };
  },

  _truncateId: function (value, head, tail) {
    var s = String(value || '');
    head = head == null ? 8 : head;
    tail = tail == null ? 6 : tail;
    if (s.length <= head + tail + 1) return s;
    return s.slice(0, head) + '…' + s.slice(-tail);
  },

  _copyFallback: function (text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  },

  _bindCopyButtons: function (root) {
    var self = this;
    if (!root) return;
    root.querySelectorAll('.ei-copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var v = btn.getAttribute('data-copy') || '';
        function done() {
          btn.classList.add('is-copied');
          btn.setAttribute('title', t('copied'));
          btn.innerHTML = EIUI.iconSvg('check');
          clearTimeout(btn._copyTimer);
          btn._copyTimer = setTimeout(function () {
            btn.classList.remove('is-copied');
            btn.setAttribute('title', t('copy'));
            btn.innerHTML = EIUI.iconSvg('copy');
          }, 1200);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(v).then(done).catch(function () {
            self._copyFallback(v);
            done();
          });
        } else {
          self._copyFallback(v);
          done();
        }
      });
    });
  },

  _idLine: function (label, value, opts) {
    opts = opts || {};
    if (!value) return '';
    var raw = String(value);
    var shown = opts.truncate === false ? raw : this._truncateId(raw, opts.head, opts.tail);
    var extra = opts.extra
      ? '<span class="ei-id-line__extra">' + EIUI.esc(opts.extra) + '</span>'
      : '';
    return (
      '<div class="ei-id-line">' +
        '<span class="ei-id-line__label">' + EIUI.esc(label) + '</span>' +
        '<code class="ei-id-line__val" title="' + EIUI.esc(raw) + '">' + EIUI.esc(shown) + '</code>' +
        extra +
        '<button type="button" class="ei-copy-btn" data-copy="' + EIUI.esc(raw) + '" title="' + EIUI.esc(t('copy')) + '" aria-label="' + EIUI.esc(t('copy')) + '">' +
          EIUI.iconSvg('copy') +
        '</button>' +
      '</div>'
    );
  },

  _statCard: function (opts) {
    return '<div class="ds-card ei-player-stat">' + EIUI.metric(opts) + '</div>';
  },

  _statCardsHtml: function (bal, summary) {
    var self = this;
    function moneyVal(n) {
      if (bal && bal.available === false) return '—';
      return '€' + EIApi.formatMoney(n);
    }
    summary = summary || {};
    return (
      self._statCard({ label: t('cash'), value: moneyVal(bal && bal.cash), icon: 'note' }) +
      self._statCard({ label: t('bank'), value: moneyVal(bal && bal.bank), icon: 'wallet' }) +
      self._statCard({ label: t('dirty_money'), value: moneyVal(bal && bal.black), icon: 'dirty' }) +
      self._statCard({ label: t('received'), value: '€' + EIApi.formatMoney(summary.received), icon: 'in', tone: 'in' }) +
      self._statCard({ label: t('spent'), value: '€' + EIApi.formatMoney(summary.spent), icon: 'out', tone: 'out' })
    );
  },

  _renderProfile: function (root, pk) {
    var self = this;
    EIUI.clearPageMetrics();
    document.getElementById('page-title').textContent = t('players_title');
    document.getElementById('page-subtitle').textContent = t('players_sub');

    if (!self._periodFrom || !self._periodTo) {
      var def = self._defaultPeriodRange();
      self._periodFrom = def.from;
      self._periodTo = def.to;
    }
    var dateFrom = self._periodFrom;
    var dateTo = self._periodTo;
    var reqPayload = { player_pk: pk, date_from: dateFrom, date_to: dateTo };

    root.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('loading')) + '</div>';
    return EIApi.request('player', reqPayload).then(function (res) {
      if (!res.ok) {
        root.innerHTML =
          '<button class="ds-btn ds-btn--ghost ds-btn--sm" id="pl-back" type="button"><span class="ds-btn__icon" aria-hidden="true">' + EIUI.iconSvg('back') + '</span>' + EIUI.esc(t('back')) + '</button>' +
          '<div class="ei-empty">' + EIUI.esc(t('error_load')) +
          (res.error ? '<br/><span class="ds-caption">' + String(res.error) + '</span>' : '') +
          '</div>';
        document.getElementById('pl-back').onclick = function () {
          self._view = 'search';
          self.render(root);
        };
        return;
      }
      if (!res.data || !res.data.player) {
        root.innerHTML =
          '<button class="ds-btn ds-btn--ghost ds-btn--sm" id="pl-back" type="button"><span class="ds-btn__icon" aria-hidden="true">' + EIUI.iconSvg('back') + '</span>' + EIUI.esc(t('back')) + '</button>' +
          '<div class="ei-empty">' + EIUI.esc(t('no_results')) + '</div>';
        document.getElementById('pl-back').onclick = function () {
          self._view = 'search';
          self.render(root);
        };
        return;
      }

      var p = res.data.player || {};
      var s = res.data.summary || {};
      var bal = res.data.balances || {};
      if (s.date_from && s.date_to) {
        self._periodFrom = s.date_from;
        self._periodTo = s.date_to;
      } else if (s.date) {
        self._periodFrom = s.date;
        self._periodTo = s.date;
      }
      dateFrom = self._periodFrom;
      dateTo = self._periodTo;

      var discordUser = p.discord_username ? ('@' + p.discord_username) : '';
      var isOnline = !!(p.online || (bal && bal.online));
      var serverId = p.server_id != null ? p.server_id : null;
      var jobInfo = p.job || {};
      var jobLabel = jobInfo.label || jobInfo.name || '';
      var jobGrade = jobInfo.grade_label || '';
      var steamRaw = (p.steam || '').trim();
      var steamLine = '';
      if (steamRaw) {
        steamLine = /^steam:/i.test(steamRaw) ? steamRaw : ('steam:' + steamRaw);
      }
      var licenseRaw = (p.license || '').trim();
      var licenseLine = '';
      if (licenseRaw) {
        licenseLine = /^(license2?|live):/i.test(licenseRaw) ? licenseRaw : ('license:' + licenseRaw);
      }
      var liveRaw = (p.live || '').trim();
      var liveLine = '';
      if (liveRaw) {
        liveLine = /^(live|xbl):/i.test(liveRaw) ? liveRaw : ('live:' + liveRaw);
      }
      if (liveLine && licenseLine && licenseLine === liveLine) {
        licenseLine = '';
      }
      var charLine = p.identifier || '';
      var playtimeSec = Number(p.playtime_sec) || 0;
      var playtimeLine = self._formatPlaytime(playtimeSec);

      var moreIds =
        (charLine ? self._idLine(t('char_id'), charLine, { head: 10, tail: 8 }) : '') +
        (steamLine ? self._idLine('Steam', steamLine, { head: 8, tail: 8 }) : '') +
        (licenseLine ? self._idLine('License', licenseLine, { head: 10, tail: 8 }) : '') +
        (liveLine ? self._idLine('Live', liveLine, { head: 8, tail: 8 }) : '');

      root.innerHTML =
        '<div class="ei-player-profile">' +
          '<div class="ei-player-toolbar">' +
            '<button class="ds-btn ds-btn--ghost ds-btn--sm" id="pl-back" type="button"><span class="ds-btn__icon" aria-hidden="true">' + EIUI.iconSvg('back') + '</span>' + EIUI.esc(t('back')) + '</button>' +
            '<div class="ei-player-toolbar__period">' +
              '<span class="ds-field__label">' + EIUI.esc(t('period')) + '</span>' +
              EIUI.datepickerHtml({
                id: 'pl-date',
                range: true,
                from: dateFrom,
                to: dateTo,
                placeholder: t('period_pick_range'),
              }) +
            '</div>' +
          '</div>' +
          '<div class="ds-card ei-player-identity">' +
            '<div class="ei-player-identity__main">' +
              '<div class="ei-player-avatar' + (isOnline ? ' is-online' : ' is-offline') + '" title="' + EIUI.esc(isOnline ? t('online') : t('offline')) + '">' +
                (p.avatar_url
                  ? '<img class="ei-avatar ei-avatar--lg" src="' + EIUI.esc(p.avatar_url) + '" alt="" referrerpolicy="no-referrer" />'
                  : '<div class="ei-avatar ei-avatar--lg ei-avatar--placeholder">' + EIUI.esc((p.name || '?').charAt(0).toUpperCase()) + '</div>') +
                '<span class="ei-player-avatar__status" aria-hidden="true"></span>' +
              '</div>' +
              '<div class="ei-player-identity__meta">' +
                '<div class="ds-heading-sm">' + EIUI.esc(p.name || p.identifier) + '</div>' +
                (isOnline && serverId != null
                  ? '<div class="ei-player-identity__sid">' + EIUI.esc(t('alert_ingame_id') + ' ' + serverId) + '</div>'
                  : '') +
                (discordUser
                  ? '<div class="ei-player-identity__discord">' + EIUI.esc(t('discord_id') + ': ' + discordUser) + '</div>'
                  : '') +
                (jobLabel
                  ? '<div class="ei-player-identity__job">' + EIUI.esc(t('job') + ': ' + jobLabel + (jobGrade ? ' · ' + jobGrade : '')) + '</div>'
                  : '') +
                '<div class="ei-player-identity__playtime">' + EIUI.esc(t('playtime') + ': ' + playtimeLine) + '</div>' +
                (moreIds
                  ? '<details class="ei-player-ids-disclosure"><summary><span>' + EIUI.esc(t('player_ids')) + '</span><span class="ei-player-ids-disclosure__chev" aria-hidden="true">' + EIUI.iconSvg('chevronDown') + '</span></summary>' + moreIds + '</details>'
                  : '') +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="ei-player-stat-row" id="pl-metrics">' +
            self._statCardsHtml(bal, s) +
          '</div>' +
          '<div class="ds-card">' +
            '<div class="ds-card__header" style="margin-bottom:10px"><div class="ds-card__title">' + EIUI.esc(t('recent_activity')) + '</div></div>' +
            '<div class="ei-filters ei-filters--player" id="pl-act-filters">' +
              '<input class="ds-input ei-filters__search" id="pl-act-q" type="search" placeholder="' + EIUI.esc(t('filter_activity_search')) + '" autocomplete="off" spellcheck="false" />' +
              EIUI.dropdownHtml({
                id: 'pl-act-dir',
                options: [
                  { value: '', label: t('filter_all_directions') },
                  { value: 'in', label: t('entries') },
                  { value: 'out', label: t('exits') },
                ],
                value: '',
              }) +
              EIUI.dropdownHtml({
                id: 'pl-act-cat',
                options: [
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
                ],
                value: '',
              }) +
              '<input class="ds-input" id="pl-act-min" type="number" min="0" step="1" placeholder="' + EIUI.esc(t('filter_min_amount')) + '" />' +
            '</div>' +
            '<div id="pl-tl" class="ds-feed"><div class="ei-empty">' + EIUI.esc(t('loading')) + '</div></div>' +
            '<div class="ei-pager" id="pl-act-pager" hidden></div>' +
          '</div>' +
        '</div>';

      self._bindCopyButtons(root);

      document.getElementById('pl-back').onclick = function () {
        self._view = 'search';
        window.EIState.selectedPlayerPk = null;
        self.render(root);
      };

      var actDirection = '';
      var actCategory = '';
      var actPage = 1;
      var actPages = 1;
      var actTotal = 0;
      var actReq = 0;
      var actLimit = 25;

      function ymdToTs(ymd, endOfDay) {
        if (!ymd) return null;
        var p = String(ymd).split('-');
        if (p.length !== 3) return null;
        var y = Number(p[0]);
        var m = Number(p[1]) - 1;
        var d = Number(p[2]);
        if (!y || m < 0 || !d) return null;
        var dt = endOfDay
          ? new Date(y, m, d, 23, 59, 59)
          : new Date(y, m, d, 0, 0, 0);
        return Math.floor(dt.getTime() / 1000);
      }

      function activityPayload(page) {
        var qEl = document.getElementById('pl-act-q');
        var minEl = document.getElementById('pl-act-min');
        var payload = {
          page: page || actPage,
          limit: actLimit,
          player_pk: pk,
          category: actCategory || null,
          direction: actDirection || null,
          q: qEl ? qEl.value.trim() : '',
          min_amount: minEl && minEl.value ? minEl.value : null,
        };
        var fromTs = self._periodAllTime ? null : ymdToTs(self._periodFrom, false);
        var toTs = self._periodAllTime ? null : ymdToTs(self._periodTo, true);
        if (fromTs) payload.from_ts = fromTs;
        if (toTs) payload.to_ts = toTs;
        return payload;
      }

      function renderActivityPager() {
        var el = document.getElementById('pl-act-pager');
        if (!el) return;
        if (actTotal <= actLimit) {
          el.hidden = true;
          el.innerHTML = '';
          return;
        }
        el.hidden = false;
        el.innerHTML =
          '<button class="ds-btn ds-btn--ghost ds-btn--sm" id="pl-act-prev" type="button"' +
            (actPage <= 1 ? ' disabled' : '') + '>← ' + EIUI.esc(t('previous')) + '</button>' +
          '<span class="ei-pager__label">' + EIUI.esc(t('page')) + ' <strong>' + actPage + '</strong> / ' + actPages +
            ' · ' + actTotal + ' ' + EIUI.esc(t('records')) + '</span>' +
          '<button class="ds-btn ds-btn--ghost ds-btn--sm" id="pl-act-next" type="button"' +
            (actPage >= actPages ? ' disabled' : '') + '>' + EIUI.esc(t('next')) + ' →</button>';
        var prev = document.getElementById('pl-act-prev');
        var next = document.getElementById('pl-act-next');
        if (prev) prev.onclick = function () { if (actPage > 1) loadActivity(actPage - 1); };
        if (next) next.onclick = function () { if (actPage < actPages) loadActivity(actPage + 1); };
      }

      function loadActivity(page) {
        actPage = page || 1;
        var reqId = ++actReq;
        var el = document.getElementById('pl-tl');
        if (!el) return;
        el.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('loading')) + '</div>';
        return EIApi.request('timeline', activityPayload(actPage)).then(function (res) {
          if (reqId !== actReq) return;
          if (!res.ok) {
            el.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('error_load')) + '</div>';
            renderActivityPager();
            return;
          }
          var data = res.data || {};
          var items = data.items || [];
          actPage = data.page || actPage;
          actPages = data.pages || 1;
          actTotal = data.total || 0;
          if (!items.length) {
            el.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('no_activity')) + '</div>';
            renderActivityPager();
            return;
          }
          el.innerHTML = items.map(function (row) {
            return EIUI.feedRow(row, { hidePlayer: true, hideAvatar: true });
          }).join('');
          renderActivityPager();
        });
      }

      function paintMetrics(summary) {
        var box = document.getElementById('pl-metrics');
        if (!box) return;
        box.innerHTML = self._statCardsHtml(bal, summary);
      }

      function refreshSummary(nextFrom, nextTo, allTime) {
        var payload = { player_pk: pk };
        if (allTime) {
          self._periodFrom = '';
          self._periodTo = '';
          self._periodAllTime = true;
          payload.all_time = true;
        } else {
          self._periodAllTime = false;
          if (!nextFrom || !nextTo) {
            var def = self._defaultPeriodRange();
            nextFrom = def.from;
            nextTo = def.to;
          }
          self._periodFrom = nextFrom;
          self._periodTo = nextTo;
          payload.date_from = nextFrom;
          payload.date_to = nextTo;
        }
        var dateApi = self._dateApi;
        if (dateApi) {
          var cur = dateApi.getValue() || {};
          if (allTime) {
            if (!cur.all_time) dateApi.setValue({ all_time: true }, true);
          } else if (cur.from !== nextFrom || cur.to !== nextTo || cur.all_time) {
            dateApi.setValue({ from: nextFrom, to: nextTo }, true);
          }
        }
        EIApi.request('playerSummary', payload).then(function (r) {
          if (!r.ok || !(r.data && r.data.summary)) return;
          paintMetrics(r.data.summary);
        });
        loadActivity(1);
      }

      self._dateApi = EIUI.bindDatepicker('pl-date', function (range) {
        if (range && range.all_time) {
          refreshSummary('', '', true);
          return;
        }
        var from = range && range.from ? String(range.from) : '';
        var to = range && range.to ? String(range.to) : from;
        if (!from) {
          refreshSummary('', '');
          return;
        }
        refreshSummary(from, to || from);
      });

      var actDebounce = null;
      function scheduleActivityReload() {
        clearTimeout(actDebounce);
        actDebounce = setTimeout(function () { loadActivity(1); }, 280);
      }

      EIUI.bindDropdown('pl-act-dir', function (value) {
        actDirection = value || '';
        loadActivity(1);
      });
      EIUI.bindDropdown('pl-act-cat', function (value) {
        actCategory = value || '';
        loadActivity(1);
      });
      document.getElementById('pl-act-q').addEventListener('input', scheduleActivityReload);
      document.getElementById('pl-act-min').addEventListener('input', scheduleActivityReload);

      return loadActivity(1);
    });
  },
};
window.EIPages.search = window.EIPages.players;
window.EIPages.player = {
  get title() { return t('players_title'); },
  get subtitle() { return t('players_sub'); },
  render: function (root) {
    window.EIPages.players._view = 'profile';
    return window.EIPages.players.render(root);
  },
};
