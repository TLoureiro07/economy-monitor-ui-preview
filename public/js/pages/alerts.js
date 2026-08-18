window.EIPages = window.EIPages || {};

window.EIPages.alerts = {
  get title() { return t('alerts_title'); },
  get subtitle() { return t('alerts_sub'); },

  _ruleLabel: function (id, fallback) {
    var key = 'alert_rule_' + id + '_label';
    var tr = t(key);
    if (tr && tr !== key) return tr;
    if (fallback) return fallback;
    return String(id || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  },

  _ruleDesc: function (id, fallback) {
    var key = 'alert_rule_' + id + '_desc';
    var tr = t(key);
    if (tr && tr !== key) return tr;
    return fallback || '';
  },

  _ruleMsg: function (id, fallback) {
    var key = 'alert_msg_' + id;
    var tr = t(key);
    if (tr && tr !== key) return tr;
    return fallback || this._ruleLabel(id);
  },

  /** Visual severity for queue icons / accents. */
  _severity: function (ruleId) {
    switch (String(ruleId || '')) {
      case 'admin_money_over':
      case 'server_created_over':
        return { tone: 'critical', icon: 'alert' };
      case 'player_spend_over':
        return { tone: 'warn', icon: 'out' };
      case 'player_receive_over':
        return { tone: 'warn', icon: 'in' };
      case 'player_tx_rate':
        return { tone: 'warn', icon: 'pulse' };
      case 'single_tx_over':
        return { tone: 'info', icon: 'transfer' };
      default:
        return { tone: 'warn', icon: 'pulse' };
    }
  },

  _formatAgo: function (ts) {
    ts = Number(ts) || 0;
    if (!ts) return '';
    var sec = Math.max(0, Math.floor(Date.now() / 1000) - ts);
    if (sec < 60) return t('time_just_now');
    if (sec < 3600) return Math.floor(sec / 60) + t('playtime_m');
    if (sec < 86400) return Math.floor(sec / 3600) + t('playtime_h');
    return Math.floor(sec / 86400) + t('playtime_d');
  },

  _seenLabel: function (a) {
    var ago = this._formatAgo(a.acked_at);
    if (ago) return t('seen_ago').replace('%s', ago);
    return t('seen');
  },

  _queueFilters: {
    status: '', // '' | open | seen
    category: '', // rule_id or ''
    sort: 'newest', // newest | oldest
    player: '',
  },

  _filterQueueItems: function (items) {
    var f = this._queueFilters || {};
    var status = f.status || '';
    var category = f.category || '';
    var sort = f.sort || 'newest';
    var playerQ = String(f.player || '').trim().toLowerCase();
    var out = (items || []).filter(function (a) {
      if (status === 'open' && a.acked) return false;
      if (status === 'seen' && !a.acked) return false;
      if (category && String(a.rule_id || '') !== String(category)) return false;
      if (playerQ) {
        var name = String(a.player_name || '').toLowerCase();
        var sid = a.server_id != null ? String(a.server_id) : '';
        var offline = String(a.offline_id || '').toLowerCase();
        if (name.indexOf(playerQ) === -1 && sid.indexOf(playerQ) === -1 && offline.indexOf(playerQ) === -1) {
          return false;
        }
      }
      return true;
    });
    out.sort(function (a, b) {
      var at = Number(a.ts) || 0;
      var bt = Number(b.ts) || 0;
      if (at === bt) {
        var aid = Number(a.id) || 0;
        var bid = Number(b.id) || 0;
        return sort === 'oldest' ? aid - bid : bid - aid;
      }
      return sort === 'oldest' ? at - bt : bt - at;
    });
    return out;
  },

  _queueRowHtml: function (a) {
    var self = this;
    var ruleId = a.rule_id || '';
    var sev = self._severity(ruleId);
    var isOpen = !a.acked;
    var playerLine = '';
    if (a.player_name || a.server_id || a.offline_id) {
      var statusCls = a.online ? 'ds-badge ds-badge--success' : 'ds-badge ds-badge--neutral';
      var statusTxt = a.online ? t('online') : t('offline');
      var idTxt = '';
      if (a.online && a.server_id != null) {
        idTxt = t('alert_ingame_id') + ' ' + a.server_id;
      } else if (a.offline_id) {
        idTxt = a.offline_id;
      }
      playerLine =
        '<div class="ds-feed__sub ei-alert-player">' +
          (a.player_name ? '<strong>' + EIUI.esc(a.player_name) + '</strong>' : '') +
          '<span class="' + statusCls + '">' + EIUI.esc(statusTxt) + '</span>' +
          (idTxt ? '<span class="ds-feed__dot">·</span><span class="ei-alert-player__id">' + EIUI.esc(idTxt) + '</span>' : '') +
        '</div>';
    }

    var side = isOpen
      ? '<button class="ds-btn ds-btn--primary ds-btn--sm ei-alert-ack" data-ack="' + a.id + '" type="button">' +
          EIUI.esc(t('ack')) +
        '</button>'
      : '<span class="ei-alert-seen" title="' + EIUI.esc(t('seen')) + '">' +
          '<span class="ei-alert-seen__icon" aria-hidden="true">' + EIUI.iconSvg('check') + '</span>' +
          '<span class="ei-alert-seen__text">' + EIUI.esc(self._seenLabel(a)) + '</span>' +
        '</span>';

    return (
      '<div class="ds-feed__row ei-alert-row' + (isOpen ? ' is-open' : ' is-acked') +
        '" data-severity="' + sev.tone + '">' +
        '<div class="ds-feed__icon ds-feed__icon--alert-' + sev.tone + '">' + EIUI.iconSvg(sev.icon) + '</div>' +
        '<div class="ds-feed__body">' +
          '<div class="ds-feed__title">' + EIUI.esc(self._ruleLabel(ruleId)) + '</div>' +
          playerLine +
          '<div class="ds-feed__meta"><span>' + EIApi.formatTs(a.ts) + '</span></div>' +
        '</div>' +
        '<div class="ds-feed__side">' + side + '</div>' +
      '</div>'
    );
  },

  _paintQueueList: function (el, items) {
    var self = this;
    var filtered = self._filterQueueItems(items);
    var countEl = document.getElementById('alerts-queue-count');
    if (countEl) countEl.textContent = String(filtered.length);

    if (!items.length) {
      el.innerHTML = '<div class="ei-empty" style="color:rgba(250,247,240,0.45)">' + EIUI.esc(t('no_alerts')) + '</div>';
      return;
    }
    if (!filtered.length) {
      el.innerHTML = '<div class="ei-empty" style="color:rgba(250,247,240,0.45)">' + EIUI.esc(t('alert_filter_empty')) + '</div>';
      return;
    }

    el.innerHTML = filtered.map(function (a) { return self._queueRowHtml(a); }).join('');
    el.querySelectorAll('[data-ack]').forEach(function (btn) {
      btn.onclick = function () {
        EIApi.request('ackAlert', { id: Number(btn.getAttribute('data-ack')) }).then(function () {
          window.EIRouter.go('alerts');
        });
      };
    });
  },

  render: function (root) {
    var self = this;
    EIUI.clearPageMetrics();
    root.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('loading')) + '</div>';
    return EIApi.request('alerts', { limit: 50 }).then(function (res) {
      if (!res.ok) {
        root.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('error_load')) + '</div>';
        return;
      }
      var items = (res.data && res.data.items) || [];
      var rules = (res.data && res.data.rules) || [];
      var f = self._queueFilters || (self._queueFilters = { status: '', category: '', sort: 'newest', player: '' });
      if (f.player == null) f.player = '';

      var categoryOpts = [{ value: '', label: t('alert_filter_all_categories') }];
      var seenCat = {};
      items.forEach(function (a) {
        var rid = a.rule_id;
        if (!rid || seenCat[rid]) return;
        seenCat[rid] = true;
        categoryOpts.push({ value: rid, label: self._ruleLabel(rid) });
      });
      rules.forEach(function (r) {
        if (!r.id || seenCat[r.id]) return;
        seenCat[r.id] = true;
        categoryOpts.push({ value: r.id, label: self._ruleLabel(r.id, r.label) });
      });
      if (f.category && !seenCat[f.category]) f.category = '';

      EIUI.clearPageMetrics();

      root.innerHTML =
        '<div class="ei-bento ei-bento--alerts">' +
          '<div class="ds-card ei-alerts-panel">' +
            '<div class="ds-card__header">' +
              '<div>' +
                '<div class="ds-card__title">' + EIUI.esc(t('alert_config')) + '</div>' +
                '<div class="ds-caption">' + EIUI.esc(t('alert_config_help')) + '</div>' +
              '</div>' +
              '<button class="ds-btn ds-btn--primary ds-btn--sm" id="alerts-save" type="button">' + EIUI.esc(t('save')) + '</button>' +
            '</div>' +
            '<div id="alerts-rules" class="ei-alert-rules"></div>' +
            '<div id="alerts-save-msg" class="ds-caption ei-alerts-panel__msg"></div>' +
          '</div>' +
          '<div class="ds-card ds-card--dark ei-alerts-panel ei-alerts-panel--queue">' +
            '<div class="ds-card__header ei-alert-queue__header">' +
              '<div class="ds-card__title">' + EIUI.esc(t('alert_queue')) + '</div>' +
              '<div class="ei-alert-queue__tools">' +
                '<input class="ds-input ei-alert-queue__search" id="alerts-filter-player" type="search" placeholder="' +
                  EIUI.esc(t('alert_filter_player')) + '" value="' + EIUI.esc(f.player || '') + '" autocomplete="off" spellcheck="false" />' +
                EIUI.dropdownHtml({
                  id: 'alerts-filter-status',
                  value: f.status,
                  options: [
                    { value: '', label: t('alert_filter_all') },
                    { value: 'open', label: t('alert_filter_unseen') },
                    { value: 'seen', label: t('alert_filter_seen') },
                  ],
                }) +
                EIUI.dropdownHtml({
                  id: 'alerts-filter-category',
                  value: f.category,
                  options: categoryOpts,
                }) +
                EIUI.dropdownHtml({
                  id: 'alerts-filter-sort',
                  value: f.sort || 'newest',
                  options: [
                    { value: 'newest', label: t('alert_filter_newest') },
                    { value: 'oldest', label: t('alert_filter_oldest') },
                  ],
                }) +
                '<span class="ei-alert-queue__count" id="alerts-queue-count" title="' + EIUI.esc(t('alerts_title')) + '">0</span>' +
              '</div>' +
            '</div>' +
            '<div id="alerts-list" class="ds-feed ds-feed--dark ei-alert-queue__list"></div>' +
          '</div>' +
        '</div>';

      self._queueItems = items;

      var rulesEl = document.getElementById('alerts-rules');
      function ruleHasWindow(r) {
        return !(r.type === 'single_tx_over' || r.type === 'admin_money_over');
      }
      var sortedRules = rules.slice().sort(function (a, b) {
        var aw = ruleHasWindow(a) ? 0 : 1;
        var bw = ruleHasWindow(b) ? 0 : 1;
        if (aw !== bw) return aw - bw;
        return 0;
      });

      rulesEl.innerHTML = sortedRules.map(function (r) {
        var isCount = r.unit === 'count';
        var thrLabel = isCount ? t('alert_field_tx') : t('alert_field_money');
        var noWindow = !ruleHasWindow(r);
        var checked = r.enabled !== false ? ' checked' : '';
        var by = r.updated_by_name
          ? '<div class="ds-caption" style="margin-top:6px">' + EIUI.esc(r.updated_by_name) +
            (r.updated_at ? ' · ' + EIApi.formatTs(r.updated_at) : '') + '</div>'
          : '';

        var fields =
          '<div class="ei-alert-rule__fields' + (noWindow ? ' ei-alert-rule__fields--single' : '') + '">' +
            '<div class="ds-field">' +
              '<label class="ds-field__label">' + EIUI.esc(thrLabel) + '</label>' +
              '<input class="ds-input ei-alert-threshold" type="number" min="0" step="1" value="' +
                EIUI.esc(r.threshold) + '" />' +
            '</div>' +
            (noWindow
              ? ''
              : (
                '<div class="ds-field">' +
                  '<label class="ds-field__label">' + EIUI.esc(t('alert_field_sec')) + '</label>' +
                  '<input class="ds-input ei-alert-window" type="number" min="1" step="1" value="' +
                    EIUI.esc(r.window_sec == null ? 60 : r.window_sec) + '" />' +
                '</div>'
              )) +
          '</div>';

        return (
          '<div class="ei-alert-rule" data-rule-id="' + EIUI.esc(r.id) + '" data-no-window="' + (noWindow ? '1' : '0') + '">' +
            '<div class="ei-alert-rule__head">' +
              '<label class="ei-switch">' +
                '<input type="checkbox" class="ei-alert-enabled"' + checked + ' />' +
                '<span class="ei-switch__ui" aria-hidden="true"></span>' +
              '</label>' +
              '<div class="ds-min-w-0">' +
                '<div class="ei-alert-rule__title">' + EIUI.esc(self._ruleLabel(r.id, r.label)) + '</div>' +
                '<div class="ds-caption">' + EIUI.esc(self._ruleDesc(r.id, r.description)) + '</div>' +
              '</div>' +
            '</div>' +
            fields +
            by +
          '</div>'
        );
      }).join('');

      document.getElementById('alerts-save').onclick = function () {
        var msg = document.getElementById('alerts-save-msg');
        var payload = [];
        rulesEl.querySelectorAll('.ei-alert-rule').forEach(function (row) {
          var winEl = row.querySelector('.ei-alert-window');
          var noWindow = row.getAttribute('data-no-window') === '1';
          payload.push({
            id: row.getAttribute('data-rule-id'),
            enabled: row.querySelector('.ei-alert-enabled').checked,
            threshold: Number(row.querySelector('.ei-alert-threshold').value),
            window_sec: noWindow ? 0 : Number(winEl && winEl.value),
          });
        });
        msg.textContent = t('loading');
        EIApi.request('saveAlertRules', { rules: payload }).then(function (r) {
          if (!r.ok || !(r.data && r.data.ok)) {
            msg.textContent = t('error_load');
            return;
          }
          msg.textContent = t('saved');
          window.EIRouter.go('alerts');
        });
      };

      var el = document.getElementById('alerts-list');
      function repaintQueue() {
        self._paintQueueList(el, self._queueItems || items);
      }

      EIUI.bindDropdown('alerts-filter-status', function (value) {
        self._queueFilters.status = value || '';
        repaintQueue();
      });
      EIUI.bindDropdown('alerts-filter-category', function (value) {
        self._queueFilters.category = value || '';
        repaintQueue();
      });
      EIUI.bindDropdown('alerts-filter-sort', function (value) {
        self._queueFilters.sort = value || 'newest';
        repaintQueue();
      });

      var playerInput = document.getElementById('alerts-filter-player');
      var playerDebounce = null;
      if (playerInput) {
        playerInput.addEventListener('input', function () {
          clearTimeout(playerDebounce);
          playerDebounce = setTimeout(function () {
            self._queueFilters.player = playerInput.value || '';
            repaintQueue();
          }, 180);
        });
      }

      repaintQueue();
    });
  },
};
