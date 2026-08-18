window.EIPages = window.EIPages || {};

window.EIPages.overview = {
  get title() { return t('overview_title'); },
  get subtitle() { return t('overview_sub'); },

  _tpl: function (key, params) {
    var s = t(key);
    params = params || {};
    Object.keys(params).forEach(function (k) {
      s = s.split('{' + k + '}').join(String(params[k]));
    });
    return s;
  },

  _heatmapLabel: function (key) {
    var map = {
      players: 'heat_players',
      societies: 'heat_societies',
      property: 'heat_property_storages',
      properties: 'heat_property_storages',
      vehicle: 'heat_vehicle_storages',
      vehicles: 'heat_vehicle_storages',
      unknown: 'heat_other',
      other: 'heat_other',
    };
    return t(map[key] || key);
  },

  _heatmapColor: function (key) {
    var map = {
      players: '#4aa3ff',
      societies: '#2fad6a',
      property: '#e0a84b',
      properties: '#e0a84b',
      vehicle: '#5B8CFF',
      vehicles: '#5B8CFF',
      unknown: '#8a8790',
      other: '#8a8790',
    };
    return map[key] || '#8a8790';
  },

  _sparklineSvg: function (values, positive) {
    values = values || [];
    if (values.length < 2) {
      values = positive ? [40, 48, 45, 58, 62, 55, 70, 68, 75, 80] : [80, 72, 75, 60, 58, 55, 48, 50, 42, 38];
    }
    var w = 196;
    var h = 40;
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    if (max === min) {
      max = min + 1;
    }
    var pts = values.map(function (v, i) {
      var x = (i / (values.length - 1)) * w;
      var y = h - ((v - min) / (max - min)) * (h - 6) - 3;
      return x.toFixed(1) + ',' + y.toFixed(1);
    });
    var stroke = positive ? '#2fad6a' : '#e07070';
    var fill = positive ? 'rgba(47,173,106,0.18)' : 'rgba(224,112,112,0.16)';
    var area = '0,' + h + ' ' + pts.join(' ') + ' ' + w + ',' + h;
    return (
      '<svg class="ei-sparkline" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true">' +
        '<line class="ei-sparkline__base" x1="0" y1="' + (h * 0.62).toFixed(1) + '" x2="' + w + '" y2="' + (h * 0.62).toFixed(1) + '" />' +
        '<polygon fill="' + fill + '" points="' + area + '" />' +
        '<polyline fill="none" stroke="' + stroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points="' + pts.join(' ') + '" />' +
      '</svg>'
    );
  },

  _healthSparkValues: function (chart) {
    chart = chart || [];
    if (!chart.length) return [];
    return chart.map(function (p) {
      var inn = Number(p.in_amount) || 0;
      var out = Number(p.out_amount) || 0;
      var tot = inn + out;
      if (tot <= 0) return 55;
      var balance = inn / tot;
      return Math.round(35 + balance * 55);
    });
  },

  _wealthBreakdownLabel: function (key) {
    var map = {
      bank: 'bank',
      cash: 'money',
      dirty: 'dirty_money',
      vipcoins: 'vip_coins',
    };
    return t(map[key] || key);
  },

  _flowActivityName: function (row) {
    if (!row) return '—';
    var key = row.title_key || row.label || row.activity_key || row.resource || '';
    return EIUI.formatFlowLabel ? EIUI.formatFlowLabel(key) : (key || '—');
  },

  _insightHtml: function (item) {
    var tone = item.tone || 'info';
    var icon = item.icon || 'chart';
    var params = item.params || {};
    var raw = t(item.key || '');
    Object.keys(params).forEach(function (k) {
      var val = params[k];
      if (k === 'name' && val && EIUI.formatFlowLabel) {
        val = EIUI.formatFlowLabel(val);
      }
      raw = raw.split('{' + k + '}').join(String(val));
    });
    // Emphasize key tokens after escape by re-injecting strong around known values
    var html = EIUI.esc(raw);
    ['name', 'amount', 'pct', 'from', 'to', 'count'].forEach(function (k) {
      if (params[k] == null) return;
      var tokenVal = params[k];
      if (k === 'name' && tokenVal && EIUI.formatFlowLabel) {
        tokenVal = EIUI.formatFlowLabel(tokenVal);
      }
      var token = EIUI.esc(String(tokenVal));
      if (!token) return;
      html = html.split(token).join('<strong class="ei-insight__em">' + token + '</strong>');
    });
    return (
      '<div class="ei-insight ei-insight--' + EIUI.esc(tone) + '">' +
        '<div class="ei-insight__icon" aria-hidden="true">' + EIUI.iconSvg(icon) + '</div>' +
        '<div class="ei-insight__text">' + html + '</div>' +
      '</div>'
    );
  },

  render: function (root) {
    var self = this;
    EIUI.clearPageMetrics();
    root.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('loading')) + '</div>';

    return EIApi.request('overview').then(function (res) {
      if (!res.ok) {
        root.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('error_load')) + '</div>';
        return;
      }
      var d = res.data || {};
      var health = d.health || {};
      var wealth = d.wealth || {};
      var heatmap = d.heatmap || [];
      var flow = d.money_flow || {};
      var sources = flow.sources || [];
      var sinks = flow.sinks || [];
      var insights = d.insights || [];

      var score = Math.max(0, Math.min(100, Number(health.score) || 0));
      var status = health.status || 'healthy';
      var statusLabel = t('health_' + status);
      var delta = Number(health.delta) || 0;
      var deltaAbs = Math.abs(delta);
      var deltaFlat = deltaAbs < 0.05;
      var deltaUp = delta >= 0;
      var deltaPct = deltaAbs.toFixed(1).replace(/\.0$/, '');
      var healthMsg = self._tpl(health.message_key || 'health_msg_ok', health.message_params || {});
      if (health.message_params && health.message_params.name && EIUI.formatFlowLabel) {
        var hName = String(health.message_params.name);
        var hNameFmt = EIUI.formatFlowLabel(hName);
        if (hNameFmt && hNameFmt !== hName) {
          healthMsg = healthMsg.split(hName).join(hNameFmt);
        }
      }
      var healthHintCls = 'ei-stat-card__hint';
      var sparkVals = self._healthSparkValues(d.chart_24h);
      var sparkSvg = self._sparklineSvg(sparkVals, deltaFlat ? true : deltaUp);
      var trendCls = 'ei-trend' + (deltaFlat ? ' ei-trend--flat' : (deltaUp ? ' ei-trend--up' : ' ei-trend--down'));
      var trendIcon = EIUI.iconSvg(deltaFlat ? 'trendFlat' : (deltaUp ? 'trendUp' : 'trendDown'));
      var trendTxt = deltaFlat
        ? self._tpl('health_delta_flat')
        : self._tpl(deltaUp ? 'health_delta_up' : 'health_delta_down', { n: deltaPct });

      var heatVisible = (heatmap || []).slice().sort(function (a, b) {
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      });

      var heatRows = heatVisible.map(function (row) {
        var amt = Number(row.amount) || 0;
        var pctVal = Math.max(0, Math.min(100, Number(row.pct) || 0));
        if (amt > 0 && pctVal <= 0) pctVal = 1;
        var color = self._heatmapColor(row.key);
        var valueTxt = '€' + EIApi.formatCompact(amt) + ' (' + pctVal + '%)';
        return (
          '<div class="ei-heat__row">' +
            '<div class="ei-heat__top">' +
              '<div class="ei-heat__left">' +
                '<span class="ei-heat__dot" style="background:' + EIUI.esc(color) + '"></span>' +
                '<div class="ei-heat__meta">' +
                  '<div class="ei-heat__label">' + EIUI.esc(self._heatmapLabel(row.key)) + '</div>' +
                '</div>' +
              '</div>' +
              '<div class="ei-heat__val">' + EIUI.esc(valueTxt) + '</div>' +
            '</div>' +
            '<div class="ei-heat__track" aria-hidden="true">' +
              '<div class="ei-heat__fill" style="width:' + pctVal + '%;background:' + EIUI.esc(color) + '"></div>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      function flowList(items, sign) {
        if (window.EIPages && EIPages.statistics && typeof EIPages.statistics._flowList === 'function') {
          return EIPages.statistics._flowList(items, sign);
        }
        if (!items.length) {
          return '<div class="ei-empty ei-empty--sm">' + EIUI.esc(t('no_activity')) + '</div>';
        }
        var tone = sign < 0 ? 'is-out' : 'is-in';
        return (
          '<div class="ei-flow__list">' +
            items.map(function (row) {
              var pref = sign < 0 ? '−' : '+';
              var name = self._flowActivityName(row);
              var pct = Number(row.pct) || 0;
              if (pct < 0) pct = 0;
              if (pct > 100) pct = 100;
              return (
                '<div class="ei-flow__row ei-flow__row--stats">' +
                  '<div class="ei-flow__main">' +
                    '<div class="ei-flow__topline">' +
                      '<span class="ei-flow__name">' + EIUI.esc(name) + '</span>' +
                      '<span class="ei-flow__vol ' + tone + '">' + pref + '€' + EIApi.formatCompact(row.volume) + '</span>' +
                    '</div>' +
                    '<div class="ei-flow__bar" aria-hidden="true">' +
                      '<div class="ei-flow__bar-fill ' + tone + '" style="width:' + pct + '%"></div>' +
                    '</div>' +
                  '</div>' +
                  '<span class="ei-flow__pct">' + EIUI.esc(String(row.pct || 0)) + '%</span>' +
                '</div>'
              );
            }).join('') +
          '</div>'
        );
      }

      var insightHtml = !insights.length
        ? '<div class="ei-empty ei-empty--sm">' + EIUI.esc(t('no_activity')) + '</div>'
        : '<div class="ei-insights">' + insights.map(function (item) {
            return self._insightHtml(item);
          }).join('') + '</div>';

      root.innerHTML =
        '<div class="ei-ov">' +
          '<div class="ei-ov-row ei-ov-row--top">' +
            '<section class="ei-stat-card ei-stat-card--wealth">' +
              '<div class="ei-stat-card__head">' +
                '<div class="ei-stat-card__icon ei-stat-card__icon--coins" aria-hidden="true">' + EIUI.iconSvg('coins') + '</div>' +
                '<div class="ei-stat-card__title">' + EIUI.esc(t('total_economy')) + '</div>' +
              '</div>' +
              '<div class="ei-wealth-donut">' +
                '<div class="ei-wealth-donut__chart">' +
                  '<canvas id="ov-wealth-donut"></canvas>' +
                '</div>' +
                '<div class="ei-wealth-donut__legend" id="ov-wealth-legend"></div>' +
              '</div>' +
            '</section>' +

            '<section class="ei-stat-card ei-health ei-health--' + EIUI.esc(status) + '">' +
              '<div class="ei-stat-card__head">' +
                '<div class="ei-stat-card__icon ei-stat-card__icon--pulse" aria-hidden="true">' + EIUI.iconSvg('pulse') + '</div>' +
                '<div class="ei-stat-card__title">' + EIUI.esc(t('economy_health')) + '</div>' +
              '</div>' +
              '<div class="ei-stat-card__body">' +
                '<div class="ei-stat-card__metric">' +
                  '<span class="ei-stat-card__value">' + score + '</span>' +
                  '<span class="ei-stat-card__unit">/ 100 · ' + EIUI.esc(statusLabel.toUpperCase()) + '</span>' +
                '</div>' +
                '<div class="ei-stat-card__foot">' +
                  '<span class="' + trendCls + '">' +
                    '<span class="ei-trend__icon" aria-hidden="true">' + trendIcon + '</span>' +
                    '<span class="ei-trend__txt">' + EIUI.esc(trendTxt) + '</span>' +
                  '</span>' +
                  sparkSvg +
                '</div>' +
                '<div class="' + healthHintCls + '">' + EIUI.esc(healthMsg) + '</div>' +
              '</div>' +
            '</section>' +

            '<section class="ds-card ei-ov-card ei-summary-card">' +
              '<div class="ei-ov-card__head">' +
                '<div class="ei-stat-card__icon ei-stat-card__icon--insight" aria-hidden="true">' + EIUI.iconSvg('list') + '</div>' +
                '<div class="ds-card__title">' + EIUI.esc(t('todays_summary')) + '</div>' +
              '</div>' +
              insightHtml +
            '</section>' +
          '</div>' +

          '<div class="ei-ov-split">' +
            '<section class="ds-card ei-ov-card ei-flow-card">' +
              '<div class="ei-ov-card__head">' +
                '<div class="ei-stat-card__icon ei-stat-card__icon--flow" aria-hidden="true">' + EIUI.iconSvg('transfer') + '</div>' +
                '<div class="ds-card__title">' + EIUI.esc(t('money_flow')) + '</div>' +
              '</div>' +
              '<div class="ds-caption ei-ov-card__caption">' + EIUI.esc(t('money_flow_sub')) + '</div>' +
              '<div class="ei-flow-card__body">' +
                '<div class="ei-flow">' +
                  '<div class="ei-flow__col">' +
                    '<div class="ei-flow__head is-in">' + EIUI.esc(t('sources')) + '</div>' +
                    flowList(sources, 1) +
                  '</div>' +
                  '<div class="ei-flow__col">' +
                    '<div class="ei-flow__head is-out">' + EIUI.esc(t('sinks')) + '</div>' +
                    flowList(sinks, -1) +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</section>' +

            '<section class="ds-card ei-ov-card ei-heat-card">' +
              '<div class="ei-ov-card__head">' +
                '<div class="ei-stat-card__icon ei-stat-card__icon--chart" aria-hidden="true">' + EIUI.iconSvg('chart') + '</div>' +
                '<div class="ds-card__title">' + EIUI.esc(t('wealth_heatmap')) + '</div>' +
              '</div>' +
              '<div class="ei-heat">' +
                (heatRows || '<div class="ei-empty ei-empty--sm">' + EIUI.esc(t('no_activity')) + '</div>') +
              '</div>' +
            '</section>' +
          '</div>' +
        '</div>';

      if (window.EICharts && EICharts.renderDonut) {
        var breakdown = wealth.breakdown || [
          { key: 'bank', amount: wealth.bank, color: '#5B8CFF', format: 'money' },
          { key: 'cash', amount: wealth.cash, color: '#3DDC97', format: 'money' },
          { key: 'dirty', amount: wealth.dirty, color: '#F472B6', format: 'money' },
          { key: 'vipcoins', amount: wealth.vipcoins || 0, color: '#F5C542', format: 'count' },
        ];

        function formatWealthVal(row, amt) {
          if (row.format === 'count' || row.key === 'vipcoins') return EIApi.formatMoney(amt);
          // Prefer exact under 100k so 6851 doesn't become "6.9k"
          if (amt < 100000) return '€' + EIApi.formatMoney(amt);
          return '€' + EIApi.formatCompact(amt);
        }

        // sqrt keeps relative order but stops bank from swallowing small slices
        function chartWeight(amt) {
          amt = Math.max(0, Number(amt) || 0);
          if (amt <= 0) return 0;
          return Math.sqrt(amt);
        }

        var wealthSegs = breakdown.map(function (row) {
          var amt = Number(row.amount) || 0;
          return {
            key: row.key,
            label: self._wealthBreakdownLabel(row.key),
            amount: amt,
            chartAmount: chartWeight(amt),
            color: row.color,
            display: formatWealthVal(row, amt),
            format: row.format,
          };
        });

        // Always list every money type in the legend (incl. €0) for clarity / promo
        var legendEl = document.getElementById('ov-wealth-legend');
        if (legendEl) {
          legendEl.innerHTML = wealthSegs.map(function (s) {
            return (
              '<div class="ei-wealth-donut__row">' +
                '<span class="ei-wealth-donut__swatch" style="background:' + EIUI.esc(s.color) + '"></span>' +
                '<span class="ei-wealth-donut__name">' + EIUI.esc(s.label) + '</span>' +
                '<span class="ei-wealth-donut__val">' + EIUI.esc(s.display) + '</span>' +
              '</div>'
            );
          }).join('');
        }

        var anyPositive = wealthSegs.some(function (s) { return s.amount > 0; });
        // Chart: real proportions when there is money; equal slices when everything is €0
        // so the ring still shows Bank / Money / Dirty / VIP Coins
        var donutSegs = anyPositive
          ? wealthSegs.filter(function (s) { return s.chartAmount > 0; })
          : wealthSegs.map(function (s) {
              return Object.assign({}, s, { chartAmount: 1 });
            });

        var centerTotal = Number(wealth.total) || 0;
        var centerTxt = centerTotal < 100000
          ? ('€' + EIApi.formatMoney(centerTotal))
          : ('€' + EIApi.formatCompact(centerTotal));

        EICharts.renderDonut(document.getElementById('ov-wealth-donut'), donutSegs, {
          centerValue: centerTxt,
          centerLabel: t('total_economy_center'),
          cutout: '74%',
          spacing: 4,
        });
      }
    });
  },
};
