window.EIPages = window.EIPages || {};

window.EIPages.statistics = {
  get title() { return t('statistics_title'); },
  get subtitle() { return t('statistics_sub'); },

  _bucket: 'player',
  _period: 'today',
  _dateFrom: '',
  _dateTo: '',
  _dateApi: null,

  _formatGrowthPct: function (p) {
    p = Number(p) || 0;
    if (!isFinite(p) || p === 0) return null;
    var abs = Math.abs(p);
    var sign = p > 0 ? '+' : '−';
    // Cap extreme outliers so one row doesn't dominate the column
    if (abs > 999) return sign + '999%';
    var rounded = abs.toFixed(1).replace(/\.0$/, '');
    return sign + rounded + '%';
  },
  _growthHtml: function (row) {
    var g = row.growth_30d;
    if (g === null || g === undefined) {
      return '<span class="ei-growth is-flat">—</span>';
    }
    g = Number(g) || 0;
    var cls = g > 0 ? 'is-up' : (g < 0 ? 'is-down' : 'is-flat');
    var arrow = g > 0 ? '↑' : (g < 0 ? '↓' : '·');
    var sign = g > 0 ? '+' : (g < 0 ? '−' : '');
    var money = sign + '€' + EIApi.formatCompact(Math.abs(g));
    var pctStr = this._formatGrowthPct(row.growth_pct);
    var pct = pctStr
      ? ' <span class="ei-growth__sep">·</span> <span class="ei-growth__pct">' + EIUI.esc(pctStr) + '</span>'
      : '';
    return (
      '<span class="ei-growth ' + cls + '">' +
        arrow + ' ' + EIUI.esc(money) +
        ' <span class="ei-growth__period">(' + EIUI.esc(t('growth_30d')) + ')</span>' +
        pct +
      '</span>'
    );
  },

  _empty: function (hintKey) {
    var hint = t(hintKey || 'stats_empty_hint');
    return (
      '<div class="ei-stats-empty">' +
        '<div class="ei-stats-empty__icon" aria-hidden="true">' + EIUI.iconSvg('chart') + '</div>' +
        '<div class="ei-stats-empty__title">' + EIUI.esc(t('no_results')) + '</div>' +
        '<div class="ei-stats-empty__hint">' + EIUI.esc(hint) + '</div>' +
      '</div>'
    );
  },

  _truncateId: function (value, head, tail) {
    var s = String(value || '');
    head = head == null ? 14 : head;
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
      if (btn._eiCopyBound) return;
      btn._eiCopyBound = true;
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

  _looksLikeStorageId: function (value) {
    var s = String(value || '');
    if (s.length < 18) return false;
    var lower = s.toLowerCase();
    return lower.indexOf('stash') >= 0
      || lower.indexOf('pinkcage') >= 0
      || (s.split('_').length >= 3 && s.length > 24);
  },

  /** Truncated id + copy on hover (same pattern as Players). */
  _idChip: function (value, opts) {
    opts = opts || {};
    if (!value) return '';
    var raw = String(value);
    var shown = opts.truncate === false ? raw : this._truncateId(raw, opts.head, opts.tail);
    return (
      '<span class="ei-id-chip" title="' + EIUI.esc(raw) + '">' +
        '<code class="ei-id-chip__val">' + EIUI.esc(shown) + '</code>' +
        '<button type="button" class="ei-copy-btn ei-copy-btn--chip" data-copy="' + EIUI.esc(raw) +
          '" title="' + EIUI.esc(t('copy')) + '" aria-label="' + EIUI.esc(t('copy')) + '">' +
          EIUI.iconSvg('copy') +
        '</button>' +
      '</span>'
    );
  },

  _scrollTable: function (html, opts) {
    opts = opts || {};
    var cls = 'ei-stats-scroll';
    var n = Number(opts.rows) || 0;
    if (n > 0 && n <= 4) cls += ' ei-stats-scroll--fit';
    var footer = opts.footer
      ? '<div class="ei-stats-scroll-hint">' + EIUI.esc(opts.footer) + '</div>'
      : '';
    return '<div class="' + cls + '">' + html + footer + '</div>';
  },

  _tablePlayers: function (rows) {
    if (!rows || !rows.length) return this._empty('stats_empty_players');
    var n = rows.length;
    var footer = '';
    if (n === 1) footer = t('stats_players_sparse_one');
    else if (n > 1 && n < 5) footer = t('stats_players_sparse_few');
    return this._scrollTable(
      '<table class="ds-table ei-stats-table">' +
        '<thead><tr>' +
          '<th>' + EIUI.esc(t('name')) + '</th>' +
          '<th>' + EIUI.esc(t('total')) + '</th>' +
          '<th>' + EIUI.esc(t('col_growth')) + '</th>' +
        '</tr></thead><tbody>' +
        rows.map(function (r) {
          return (
            '<tr>' +
              '<td>' + EIUI.esc(r.name || r.identifier || '—') + '</td>' +
              '<td>€' + EIApi.formatMoney(r.total) + '</td>' +
              '<td>' + window.EIPages.statistics._growthHtml(r) + '</td>' +
            '</tr>'
          );
        }).join('') +
      '</tbody></table>',
      { rows: n, footer: footer }
    );
  },

  _tableSocieties: function (rows) {
    if (!rows || !rows.length) return this._empty('stats_empty_societies');
    var self = this;
    return this._scrollTable(
      '<table class="ds-table ei-stats-table">' +
        '<thead><tr>' +
          '<th>' + EIUI.esc(t('name')) + '</th>' +
          '<th>' + EIUI.esc(t('total')) + '</th>' +
        '</tr></thead><tbody>' +
        rows.map(function (r) {
          var name = r.label || r.key || '—';
          var raw = r.key && String(r.key) !== String(name) ? String(r.key) : '';
          return (
            '<tr>' +
              '<td title="' + EIUI.esc(raw || name) + '">' +
                '<div class="ei-stats-primary">' + EIUI.esc(name) + '</div>' +
                (raw
                  ? '<div class="ei-stats-raw">' +
                      (self._looksLikeStorageId(raw) ? self._idChip(raw) : EIUI.esc(raw)) +
                    '</div>'
                  : '') +
              '</td>' +
              '<td>€' + EIApi.formatMoney(r.total) + '</td>' +
            '</tr>'
          );
        }).join('') +
      '</tbody></table>',
      { rows: rows.length }
    );
  },

  _tableProperty: function (rows) {
    if (!rows || !rows.length) return this._empty('stats_empty_property');
    var self = this;
    return this._scrollTable(
      '<table class="ds-table ei-stats-table">' +
        '<thead><tr>' +
          '<th>' + EIUI.esc(t('col_player')) + '</th>' +
          '<th>' + EIUI.esc(t('col_property')) + '</th>' +
          '<th>' + EIUI.esc(t('col_type')) + '</th>' +
          '<th>' + EIUI.esc(t('money')) + '</th>' +
          '<th>' + EIUI.esc(t('dirty_money')) + '</th>' +
          '<th>' + EIUI.esc(t('total')) + '</th>' +
        '</tr></thead><tbody>' +
        rows.map(function (r) {
          var name = r.display_name || r.property_id || r.label || '—';
          var raw = r.raw_id ? String(r.raw_id) : '';
          var typeLabel = r.storage_type ? t('storage_type_' + r.storage_type) : '';
          if (typeLabel === 'storage_type_' + r.storage_type) typeLabel = r.storage_type || '';

          // Title stays plain text (human name from resolver). Technical id → secondary chip + copy.
          var nameHtml = EIUI.esc(name);
          var rawHtml = '';
          if (raw && (self._looksLikeStorageId(raw) || raw.length > 18)) {
            rawHtml = self._idChip(raw);
          } else if (raw && String(raw) !== String(name)) {
            rawHtml = EIUI.esc(raw);
          }

          return (
            '<tr>' +
              '<td>' +
                '<div class="ei-stats-primary">' + EIUI.esc(r.owner_name || r.owner || '—') + '</div>' +
              '</td>' +
              '<td title="' + EIUI.esc(r.raw_id || name) + '">' +
                '<div class="ei-stats-primary">' + nameHtml + '</div>' +
                (rawHtml ? '<div class="ei-stats-raw">' + rawHtml + '</div>' : '') +
              '</td>' +
              '<td>' + EIUI.esc(typeLabel || '—') + '</td>' +
              '<td>€' + EIApi.formatMoney(r.money) + '</td>' +
              '<td>€' + EIApi.formatMoney(r.dirty) + '</td>' +
              '<td>€' + EIApi.formatMoney(r.amount) + '</td>' +
            '</tr>'
          );
        }).join('') +
      '</tbody></table>',
      { rows: rows.length }
    );
  },

  _tableVehicles: function (rows) {
    if (!rows || !rows.length) return this._empty('stats_empty_vehicle');
    return this._scrollTable(
      '<table class="ds-table ei-stats-table">' +
        '<thead><tr>' +
          '<th>' + EIUI.esc(t('col_player')) + '</th>' +
          '<th>' + EIUI.esc(t('col_plate')) + '</th>' +
          '<th>' + EIUI.esc(t('col_type')) + '</th>' +
          '<th>' + EIUI.esc(t('money')) + '</th>' +
          '<th>' + EIUI.esc(t('dirty_money')) + '</th>' +
          '<th>' + EIUI.esc(t('total')) + '</th>' +
        '</tr></thead><tbody>' +
        rows.map(function (r) {
          var plate = r.plate || '';
          var typeLabel = r.storage_type ? t('storage_type_' + r.storage_type) : '';
          if (typeLabel === 'storage_type_' + r.storage_type) typeLabel = r.storage_type || '';
          var secondary = '';
          if (r.storage_type === 'trunk' || r.storage_type === 'glovebox') {
            secondary = typeLabel;
          } else if (r.display_name && plate && String(r.display_name) !== String(plate)) {
            secondary = String(r.display_name).replace(/\s*[·•]\s*[A-Z0-9]+$/i, '').trim();
            if (secondary === plate) secondary = '';
          }
          return (
            '<tr>' +
              '<td>' + EIUI.esc(r.owner_name || r.owner || '—') + '</td>' +
              '<td title="' + EIUI.esc(r.raw_id || plate || '') + '">' +
                '<div class="ei-stats-primary">' + EIUI.esc(plate || r.display_name || '—') + '</div>' +
                (secondary ? '<div class="ei-stats-raw">' + EIUI.esc(secondary) + '</div>' : '') +
              '</td>' +
              '<td>' + EIUI.esc(typeLabel || '—') + '</td>' +
              '<td>€' + EIApi.formatMoney(r.money) + '</td>' +
              '<td>€' + EIApi.formatMoney(r.dirty) + '</td>' +
              '<td>€' + EIApi.formatMoney(r.amount) + '</td>' +
            '</tr>'
          );
        }).join('') +
      '</tbody></table>',
      { rows: rows.length }
    );
  },

  _txTitle: function (tx) {
    if (tx.title_key && typeof t === 'function') {
      var label = t(tx.title_key);
      if (label && label !== tx.title_key) {
        label = String(label).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').replace(/[\u2600-\u27BF]/g, '').trim();
        if (tx.title_item) return label + ': ' + tx.title_item;
        return label;
      }
    }
    return tx.title || tx.reason || tx.resource || '—';
  },

  _tableLargest: function (items) {
    if (!items || !items.length) return this._empty('stats_empty_largest');
    var self = this;
    return this._scrollTable(
      '<table class="ds-table ei-stats-table">' +
        '<thead><tr>' +
          '<th>' + EIUI.esc(t('col_player')) + '</th>' +
          '<th>' + EIUI.esc(t('name')) + '</th>' +
          '<th>' + EIUI.esc(t('total')) + '</th>' +
          '<th></th>' +
        '</tr></thead><tbody>' +
        items.map(function (tx) {
          var dir = tx.direction === 'out' || tx.direction === 2 ? 'is-out' : 'is-in';
          var sign = dir === 'is-out' ? '−' : '+';
          return (
            '<tr>' +
              '<td>' + EIUI.esc(tx.player_name || '—') + '</td>' +
              '<td>' +
                '<div class="ei-tx-title">' + EIUI.esc(self._txTitle(tx)) + '</div>' +
                (tx.subtitle ? '<div class="ei-tx-sub">' + EIUI.esc(tx.subtitle) + '</div>' : '') +
              '</td>' +
              '<td class="ei-tx-amt ' + dir + '">' + sign + '€' + EIApi.formatMoney(tx.amount) + '</td>' +
              '<td class="ei-tx-ts">' + EIUI.esc(EIApi.formatTs(tx.ts)) + '</td>' +
            '</tr>'
          );
        }).join('') +
      '</tbody></table>'
    );
  },

  _flowList: function (rows, sign) {
    if (!rows || !rows.length) return this._empty('stats_empty_flow');
    var tone = sign < 0 ? 'is-out' : 'is-in';
    return (
      '<div class="ei-flow__list">' +
        rows.map(function (r) {
          var pref = sign < 0 ? '−' : '+';
          var key = r.title_key || r.label || r.activity_key || r.resource || '';
          var name = EIUI.formatFlowLabel ? EIUI.formatFlowLabel(key) : key;
          // Generic Purchase/Sale: append item or resource so sinks are identifiable
          if (key === 'tx_purchase' || key === 'tx_sale') {
            if (r.title_item) name += ': ' + String(r.title_item);
            else if (r.resource && String(r.resource) !== String(key)) name += ' · ' + String(r.resource);
          }
          var pct = Number(r.pct) || 0;
          if (pct < 0) pct = 0;
          if (pct > 100) pct = 100;
          return (
            '<div class="ei-flow__row ei-flow__row--stats">' +
              '<div class="ei-flow__main">' +
                '<div class="ei-flow__topline">' +
                  '<span class="ei-flow__name">' + EIUI.esc(name) + '</span>' +
                  '<span class="ei-flow__vol ' + tone + '">' + pref + '€' + EIApi.formatCompact(r.volume) + '</span>' +
                '</div>' +
                '<div class="ei-flow__bar" aria-hidden="true">' +
                  '<div class="ei-flow__bar-fill ' + tone + '" style="width:' + pct + '%"></div>' +
                '</div>' +
              '</div>' +
              '<span class="ei-flow__pct">' + EIUI.esc(String(r.pct || 0)) + '%</span>' +
            '</div>'
          );
        }).join('') +
      '</div>'
    );
  },

  _insights: function (data) {
    data = data || {};

    function activityName(r) {
      if (!r) return '—';
      var key = r.title_key || r.activity_key || r.label || r.resource;
      var base = EIUI.formatFlowLabel
        ? EIUI.formatFlowLabel(key || r.label || r.resource)
        : (r.label || r.resource || key || '—');
      // Only append item for truly generic purchase/sale
      if (r.title_item && (key === 'tx_purchase' || key === 'tx_sale')) {
        return base + ': ' + String(r.title_item);
      }
      return base;
    }

    function techLine(r) {
      if (!r) return '';
      if (r.tech) return String(r.tech);
      if (r.subtitle) return String(r.subtitle);
      var parts = [];
      var acc = r.account_label || r.account;
      if (acc) {
        var a = String(acc).toLowerCase();
        if (a === 'money' || a === 'cash') parts.push('Cash');
        else if (a === 'bank') parts.push('Bank');
        else if (a === 'black_money' || a === 'dirty') parts.push('Black Money');
        else parts.push(String(acc));
      }
      if (r.resource) parts.push(String(r.resource).replace(/^@/, ''));
      var detail = r.detail || r.event || r.trigger;
      if (detail) {
        var d = String(detail);
        var colon = d.lastIndexOf(':');
        if (colon >= 0 && colon < d.length - 1) d = d.slice(colon + 1);
        parts.push(d);
      }
      return parts.join(' · ');
    }

    function playerLine(r) {
      if (!r || !r.player_name) return '';
      return String(r.player_name);
    }

    function rowIcon(r, fallback) {
      if (EIUI.titleIconName) {
        var name = EIUI.titleIconName({
          title_key: r.title_key || r.activity_key,
          category_key: r.category_key || r.category,
          reason: r.reason,
        });
        if (name) return name;
      }
      return fallback;
    }

    var items = [
      {
        key: 'top_income',
        title: t('insight_top_income_source'),
        icon: 'trendUp',
        tone: 'in',
        row: data.top_income || data.most_profitable,
        value: function (r) {
          return '+€' + EIApi.formatCompact(r.volume || 0);
        },
        sub: activityName,
        showPlayer: true,
      },
      {
        key: 'top_sink',
        title: t('insight_top_money_sink'),
        icon: 'trendDown',
        tone: 'out',
        row: data.top_sink || data.biggest_sink,
        value: function (r) {
          return '−€' + EIApi.formatCompact(r.volume || 0);
        },
        sub: activityName,
        showPlayer: true,
      },
      {
        key: 'largest_tx',
        title: t('insight_largest_tx'),
        icon: 'alert',
        tone: 'alert',
        row: data.largest_tx || data.most_active,
        value: function (r) {
          var amt = Number(r.amount != null ? r.amount : r.volume) || 0;
          var dir = String(r.direction || '').toLowerCase();
          var isIn = dir === 'in' || dir === '1' || Number(r.direction_id) === 1;
          var isSet = dir === 'set' || Number(r.direction_id) === 3;
          if (isSet) return '€' + EIApi.formatCompact(amt);
          return (isIn ? '+' : '−') + '€' + EIApi.formatCompact(amt);
        },
        sub: activityName,
        showPlayer: true,
        forceIcon: 'alert',
        toneFor: function (r) {
          var dir = String(r.direction || '').toLowerCase();
          if (dir === 'in' || Number(r.direction_id) === 1) return 'alert-in';
          if (dir === 'set' || Number(r.direction_id) === 3) return 'alert';
          return 'alert';
        },
      },
    ];

    return (
      '<section class="ds-card ei-stats-card ei-stats-card--wide ei-stats-card--highlights">' +
        '<div class="ds-card__header">' +
          '<div class="ds-card__title">' + EIUI.esc(t('todays_highlights')) +
            '<span class="ei-stats-card__badge">' + EIUI.esc(t('period_today')) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="ei-stats-card__body">' +
          '<div class="ei-econ-insights">' +
            items.map(function (item) {
              var r = item.row;
              if (!r) {
                return (
                  '<div class="ei-econ-insight ei-econ-insight--empty">' +
                    '<div class="ei-econ-insight__label">' + EIUI.esc(item.title) + '</div>' +
                    '<div class="ei-econ-insight__empty">' + EIUI.esc(t('no_results')) + '</div>' +
                  '</div>'
                );
              }
              var tone = item.toneFor ? item.toneFor(r) : item.tone;
              var icon = item.forceIcon || rowIcon(r, item.icon);
              var tech = techLine(r);
              var player = item.showPlayer ? playerLine(r) : '';
              return (
                '<div class="ei-econ-insight ei-econ-insight--' + EIUI.esc(tone) + '">' +
                  '<div class="ei-econ-insight__top">' +
                    '<span class="ei-econ-insight__label">' + EIUI.esc(item.title) + '</span>' +
                  '</div>' +
                  '<div class="ei-econ-insight__name">' +
                    '<span class="ei-econ-insight__activity-icon" aria-hidden="true">' + EIUI.iconSvg(icon) + '</span>' +
                    '<span class="ei-econ-insight__activity-text">' + EIUI.esc(item.sub(r)) + '</span>' +
                  '</div>' +
                  (tech
                    ? '<div class="ei-econ-insight__tech" title="' + EIUI.esc(tech) + '">' + EIUI.esc(tech) + '</div>'
                    : '') +
                  (player
                    ? '<div class="ei-econ-insight__player" title="' + EIUI.esc(player) + '">' + EIUI.esc(player) + '</div>'
                    : '') +
                  '<div class="ei-econ-insight__value">' + EIUI.esc(item.value(r)) + '</div>' +
                '</div>'
              );
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>'
    );
  },

  _filterGroup: function (label, pillsHtml) {
    return (
      '<div class="ei-filter-group">' +
        '<span class="ei-filter-group__label">' + EIUI.esc(label) + '</span>' +
        pillsHtml +
      '</div>'
    );
  },

  _card: function (title, bodyHtml, extraHead) {
    return (
      '<section class="ds-card ei-stats-card">' +
        '<div class="ds-card__header">' +
          '<div class="ds-card__title">' + EIUI.esc(title) +
            '<span class="ei-stats-card__badge">' + EIUI.esc(t('top_10')) + '</span>' +
          '</div>' +
          (extraHead || '') +
        '</div>' +
        '<div class="ei-stats-card__body">' + bodyHtml + '</div>' +
      '</section>'
    );
  },

  _pills: function (name, options, active) {
    return (
      '<div class="ei-pills" data-pills="' + EIUI.esc(name) + '">' +
        options.map(function (o) {
          return (
            '<button type="button" class="ei-pill' + (o.id === active ? ' is-active' : '') + '" data-value="' + EIUI.esc(o.id) + '">' +
              EIUI.esc(o.label) +
            '</button>'
          );
        }).join('') +
      '</div>'
    );
  },

  _tableEconSection: function (title, rows, kind) {
    if (!rows || !rows.length) {
      return (
        '<section class="ds-card ei-stats-card ei-stats-card--econ">' +
          '<div class="ds-card__header"><div class="ds-card__title">' + EIUI.esc(title) + '</div></div>' +
          '<div class="ei-stats-card__body">' + this._empty('no_results') + '</div>' +
        '</section>'
      );
    }
    var rows_html = '';
    if (kind === 'activities') {
      rows_html =
        '<table class="ds-table ei-stats-table">' +
          '<thead><tr>' +
            '<th>#</th>' +
            '<th>' + EIUI.esc(t('econactivity_col_activity')) + '</th>' +
            '<th>' + EIUI.esc(t('econactivity_col_volume')) + '</th>' +
            '<th>' + EIUI.esc(t('transactions_count')) + '</th>' +
          '</tr></thead><tbody>' +
          rows.map(function (r, i) {
            var key = r.title_key || '';
            var label = '';
            if (key) {
              var tr = t(key);
              if (tr && tr !== key) label = tr;
            }
            if (!label && EIUI.formatFlowLabel) label = EIUI.formatFlowLabel(key);
            if (!label) label = key || '—';
            if (r.title_item && (key === 'tx_purchase' || key === 'tx_sale')) {
              label += ': ' + String(r.title_item);
            }
            return (
              '<tr>' +
                '<td class="ei-rank-num">' + EIUI.esc(String(i + 1)) + '</td>' +
                '<td>' + EIUI.esc(label) + '</td>' +
                '<td>€' + EIApi.formatCompact(r.volume || 0) + '</td>' +
                '<td>' + EIUI.esc(String(r.tx_count || 0)) + '</td>' +
              '</tr>'
            );
          }).join('') +
        '</tbody></table>';
    } else {
      rows_html =
        '<table class="ds-table ei-stats-table">' +
          '<thead><tr>' +
            '<th>#</th>' +
            '<th>' + EIUI.esc(t('econactivity_col_resource')) + '</th>' +
            '<th>' + EIUI.esc(t('econactivity_col_volume')) + '</th>' +
            '<th>' + EIUI.esc(t('transactions_count')) + '</th>' +
          '</tr></thead><tbody>' +
          rows.map(function (r, i) {
            return (
              '<tr>' +
                '<td class="ei-rank-num">' + EIUI.esc(String(i + 1)) + '</td>' +
                '<td><code class="ei-resource-tag">' + EIUI.esc(r.resource || '—') + '</code></td>' +
                '<td>€' + EIApi.formatCompact(r.volume || 0) + '</td>' +
                '<td>' + EIUI.esc(String(r.tx_count || 0)) + '</td>' +
              '</tr>'
            );
          }).join('') +
        '</tbody></table>';
    }
    return (
      '<section class="ds-card ei-stats-card ei-stats-card--econ">' +
        '<div class="ds-card__header"><div class="ds-card__title">' + EIUI.esc(title) + '</div></div>' +
        '<div class="ei-stats-card__body">' +
          this._scrollTable(rows_html, { rows: rows.length }) +
        '</div>' +
      '</section>'
    );
  },

  _load: function (root, opts) {
    var self = this;
    opts = opts || {};
    var preserveScroll = !!opts.preserveScroll;
    var savedScroll = preserveScroll ? (root.scrollTop || 0) : 0;

    if (!preserveScroll) {
      root.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('loading')) + '</div>';
    }

    var payload = {
      bucket: self._bucket,
      period: self._period,
    };
    if (self._dateFrom && self._dateTo) {
      payload.date_from = self._dateFrom;
      payload.date_to = self._dateTo;
    }

    return EIApi.request('statistics', payload).then(function (res) {
      if (!res.ok) {
        root.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('error_load')) + '</div>';
        return;
      }
      var d = res.data || {};
      var flow = d.money_flow || {};
      if (flow.date_from) self._dateFrom = flow.date_from;
      if (flow.date_to) self._dateTo = flow.date_to;

      var bucketPills = self._pills('bucket', [
        { id: 'player', label: t('largest_bucket_player') },
        { id: 'society', label: t('largest_bucket_society') },
        { id: 'storage', label: t('largest_bucket_storage') },
        { id: 'unknown', label: t('largest_bucket_unknown') },
      ], self._bucket);

      var periodPills = self._pills('period', [
        { id: 'today', label: t('period_today') },
        { id: 'week', label: t('period_week') },
        { id: 'month', label: t('period_month') },
      ], self._period);

      var largestHead =
        '<div class="ei-stats-card__filters">' +
          self._filterGroup(t('filter_type'), bucketPills) +
          '<div class="ei-filter-group__divider" aria-hidden="true"></div>' +
          self._filterGroup(t('filter_period'), periodPills) +
        '</div>';

      var flowHead =
        '<div class="ei-stats-card__filters">' +
          EIUI.datepickerHtml({
            id: 'st-date',
            range: true,
            from: self._dateFrom,
            to: self._dateTo,
            placeholder: t('period_pick_range') || t('cal_today'),
          }) +
        '</div>';

      root.innerHTML =
        '<div class="ei-stats-grid">' +
          self._insights(d.economic_insights) +
          self._card(t('richest_players'), self._tablePlayers(d.richest_players)) +
          self._card(t('richest_societies'), self._tableSocieties(d.richest_societies)) +
          self._card(t('richest_property'), self._tableProperty(d.richest_property)) +
          self._card(t('richest_vehicle'), self._tableVehicles(d.richest_vehicles)) +
          '<section class="ds-card ei-stats-card ei-stats-card--wide">' +
            '<div class="ds-card__header">' +
              '<div class="ds-card__title">' + EIUI.esc(t('money_flow')) + '</div>' +
              flowHead +
            '</div>' +
            '<div class="ei-stats-card__body ei-stats-flow">' +
              '<div class="ei-flow__col">' +
                '<div class="ei-flow__head is-in">' + EIUI.esc(t('sources')) + '</div>' +
                self._flowList(flow.sources, 1) +
              '</div>' +
              '<div class="ei-flow__col">' +
                '<div class="ei-flow__head is-out">' + EIUI.esc(t('sinks')) + '</div>' +
                self._flowList(flow.sinks, -1) +
              '</div>' +
            '</div>' +
          '</section>' +
          '<section class="ds-card ei-stats-card ei-stats-card--wide">' +
            '<div class="ds-card__header">' +
              '<div class="ds-card__title">' + EIUI.esc(t('largest_transactions')) + '</div>' +
              largestHead +
            '</div>' +
            '<div class="ei-stats-card__body" id="st-largest">' +
              self._tableLargest((d.largest && d.largest.items) || []) +
            '</div>' +
          '</section>' +
          self._tableEconSection(t('econactivity_top_activities'), d.top_activities || [], 'activities') +
          self._tableEconSection(t('econactivity_top_resources'), d.top_resources || [], 'resources') +
        '</div>';

      self._bindCopyButtons(root);

      if (preserveScroll) {
        root.scrollTop = savedScroll;
        // Restore after layout (images/fonts) so it doesn't jump to top
        requestAnimationFrame(function () {
          root.scrollTop = savedScroll;
        });
      }

      function reloadInPlace() {
        self._load(root, { preserveScroll: true });
      }

      root.querySelectorAll('[data-pills="bucket"] .ei-pill').forEach(function (btn) {
        btn.addEventListener('click', function () {
          self._bucket = btn.getAttribute('data-value') || 'player';
          reloadInPlace();
        });
      });
      root.querySelectorAll('[data-pills="period"] .ei-pill').forEach(function (btn) {
        btn.addEventListener('click', function () {
          self._period = btn.getAttribute('data-value') || 'today';
          reloadInPlace();
        });
      });

      if (EIUI.bindDatepicker) {
        self._dateApi = EIUI.bindDatepicker('st-date', function (range) {
          var from = range && range.from ? String(range.from) : '';
          var to = range && range.to ? String(range.to) : from;
          self._dateFrom = from;
          self._dateTo = to;
          reloadInPlace();
        });
      }
    });
  },

  render: function (root) {
    EIUI.clearPageMetrics();
    this._load(root);
  },
};
