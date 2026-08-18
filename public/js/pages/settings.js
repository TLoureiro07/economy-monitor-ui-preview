window.EIPages = window.EIPages || {};

window.EIPages.settings = {
  get title() { return t('settings_title'); },
  get subtitle() { return t('settings_sub'); },

  render: function (root) {
    var self = this;
    EIUI.clearPageMetrics();
    root.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('loading')) + '</div>';

    return EIApi.request('getSettings').then(function (res) {
      if (!res.ok) {
        root.innerHTML = '<div class="ei-empty">' + EIUI.esc(t('error_load')) + '</div>';
        return;
      }
      var data = res.data || {};
      var locale = data.locale || 'en';
      if (window.EIi18n) {
        EIi18n.setLocale(locale);
        document.getElementById('page-title').textContent = self.title;
        document.getElementById('page-subtitle').textContent = self.subtitle;
      }
      self._paint(root, data);
    });
  },

  _kindLabel: function (kind) {
    if (kind === 'category') return t('settings_kind_category');
    if (kind === 'reason') return t('settings_kind_reason');
    if (kind === 'player') return t('settings_kind_player');
    if (kind === 'resource') return t('settings_kind_resource');
    return kind;
  },

  _choiceHtml: function (id, options, active) {
    return (
      '<div class="ei-choice" id="' + EIUI.esc(id) + '">' +
        options.map(function (opt) {
          var on = opt.value === active ? ' is-active' : '';
          return (
            '<button type="button" class="ei-choice__btn' + on + '" data-value="' + EIUI.esc(opt.value) + '">' +
              EIUI.esc(opt.label) +
            '</button>'
          );
        }).join('') +
      '</div>'
    );
  },

  _paint: function (root, data) {
    var self = this;
    var rules = data.rules || (data.blacklist && data.blacklist.rules) || [];
    var notify = data.notify || {};
    var discordMentions = notify.discord_mentions !== false;
    var ingameAlerts = notify.ingame_alerts !== false;

    var kindOpts = [
      { value: 'reason', label: t('settings_kind_reason') },
      { value: 'category', label: t('settings_kind_category') },
      { value: 'player', label: t('settings_kind_player') },
      { value: 'resource', label: t('settings_kind_resource') },
    ];
    var catOpts = [
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
      { value: 'salary', label: t('cat_salary') },
      { value: 'transfer', label: t('cat_transfer') },
      { value: 'purchase', label: t('cat_purchase') },
      { value: 'sell', label: t('cat_sell') },
      { value: 'admin', label: t('cat_admin') },
      { value: 'unknown', label: t('cat_unknown') },
    ];

    var opacity = (window.EITheme && EITheme.getOpacity) ? EITheme.getOpacity() : 92;
    var palette = (window.EITheme && EITheme.getPalette) ? EITheme.getPalette() : 'amber';
    var palettes = (window.EITheme && EITheme.listPalettes) ? EITheme.listPalettes() : [];

    root.innerHTML =
      '<div class="ei-settings">' +
        '<div class="ei-settings__row2">' +
          '<div class="ds-card">' +
            '<div class="ds-card__header">' +
              '<div>' +
                '<div class="ds-card__title">' + EIUI.esc(t('settings_appearance')) + '</div>' +
                '<div class="ds-caption">' + EIUI.esc(t('settings_appearance_help')) + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="ei-field-stack">' +
              '<div class="ds-field">' +
                '<label class="ds-field__label">' + EIUI.esc(t('settings_palette')) + '</label>' +
                '<div class="ei-palette" id="ei-palette">' +
                  palettes.map(function (p) {
                    var on = p.id === palette ? ' is-active' : '';
                    return (
                      '<button type="button" class="ei-palette__swatch' + on + '" data-palette="' + EIUI.esc(p.id) + '" ' +
                        'style="--sw:' + EIUI.esc(p.accent) + '" title="' + EIUI.esc(t(p.labelKey)) + '" aria-label="' + EIUI.esc(t(p.labelKey)) + '"></button>'
                    );
                  }).join('') +
                '</div>' +
              '</div>' +
              '<div class="ds-field">' +
                '<label class="ds-field__label" for="ei-opacity">' + EIUI.esc(t('settings_opacity')) + '</label>' +
                '<div class="ei-opacity">' +
                  '<input class="ei-opacity__range" id="ei-opacity" type="range" min="40" max="100" step="1" value="' + opacity + '" />' +
                  '<span class="ei-opacity__value" id="ei-opacity-val">' + opacity + '%</span>' +
                '</div>' +
              '</div>' +
              '<div class="ds-field">' +
                '<label class="ds-field__label">' + EIUI.esc(t('settings_layout')) + '</label>' +
                '<div class="ds-caption" style="margin-bottom:8px">' + EIUI.esc(t('settings_layout_help')) + '</div>' +
                '<button class="ds-btn ds-btn--ghost ds-btn--sm" id="ei-layout-reset" type="button">' + EIUI.esc(t('settings_layout_reset')) + '</button>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="ds-card">' +
            '<div class="ds-card__header">' +
              '<div>' +
                '<div class="ds-card__title">' + EIUI.esc(t('settings_notifications')) + '</div>' +
                '<div class="ds-caption">' + EIUI.esc(t('settings_notifications_help')) + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="ei-toggle-row">' +
              '<div class="ei-toggle-row__text">' +
                '<div class="ei-toggle-row__title">' + EIUI.esc(t('settings_discord_mentions')) + '</div>' +
                '<div class="ds-caption">' + EIUI.esc(t('settings_discord_mentions_help')) + '</div>' +
              '</div>' +
              '<label class="ei-switch">' +
                '<input type="checkbox" id="ei-discord-mentions"' + (discordMentions ? ' checked' : '') + ' />' +
                '<span class="ei-switch__ui" aria-hidden="true"></span>' +
              '</label>' +
            '</div>' +
            '<div class="ei-toggle-row">' +
              '<div class="ei-toggle-row__text">' +
                '<div class="ei-toggle-row__title">' + EIUI.esc(t('settings_ingame_alerts')) + '</div>' +
                '<div class="ds-caption">' + EIUI.esc(t('settings_ingame_alerts_help')) + '</div>' +
              '</div>' +
              '<label class="ei-switch">' +
                '<input type="checkbox" id="ei-ingame-alerts"' + (ingameAlerts ? ' checked' : '') + ' />' +
                '<span class="ei-switch__ui" aria-hidden="true"></span>' +
              '</label>' +
            '</div>' +
            '<div id="ei-notify-msg" class="ds-caption" style="margin-top:10px"></div>' +
          '</div>' +
        '</div>' +

        '<div class="ds-card">' +
          '<div class="ds-card__header">' +
            '<div>' +
              '<div class="ds-card__title">' + EIUI.esc(t('settings_blacklist')) + '</div>' +
              '<div class="ds-caption">' + EIUI.esc(t('settings_blacklist_help')) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="ei-settings__add ei-settings__add--rules">' +
            EIUI.dropdownHtml({ id: 'bl-kind', options: kindOpts, value: 'reason' }) +
            '<div id="bl-value-wrap" class="ei-settings__value-wrap"></div>' +
            '<button class="ds-btn ds-btn--primary ds-btn--sm" id="bl-add" type="button">' + EIUI.esc(t('add')) + '</button>' +
          '</div>' +
          '<div id="bl-msg" class="ds-caption" style="margin-top:8px"></div>' +
          '<div id="bl-rules-list" class="ei-settings__list"></div>' +
        '</div>' +
      '</div>';

    /* Appearance bindings */
    var opacityInput = document.getElementById('ei-opacity');
    var opacityVal = document.getElementById('ei-opacity-val');
    if (opacityInput) {
      opacityInput.oninput = function () {
        var v = Number(opacityInput.value);
        if (opacityVal) opacityVal.textContent = v + '%';
        if (window.EITheme) EITheme.applyOpacity(v);
      };
    }

    var paletteEl = document.getElementById('ei-palette');
    if (paletteEl) {
      paletteEl.querySelectorAll('[data-palette]').forEach(function (btn) {
        btn.onclick = function () {
          var id = btn.getAttribute('data-palette');
          if (window.EITheme) EITheme.applyPalette(id);
          paletteEl.querySelectorAll('.ei-palette__swatch').forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
          });
        };
      });
    }

    var resetBtn = document.getElementById('ei-layout-reset');
    if (resetBtn) {
      resetBtn.onclick = function () {
        if (window.EIWindow) EIWindow.reset();
      };
    }

    /* Notify prefs */
    function saveNotify() {
      var msg = document.getElementById('ei-notify-msg');
      var dm = document.getElementById('ei-discord-mentions');
      var ig = document.getElementById('ei-ingame-alerts');
      if (msg) msg.textContent = t('loading');
      EIApi.request('saveNotifyPrefs', {
        discord_mentions: !!(dm && dm.checked),
        ingame_alerts: !!(ig && ig.checked),
      }).then(function (r) {
        if (!msg) return;
        if (!r.ok || !(r.data && r.data.ok !== false)) {
          msg.textContent = t('error_load');
          return;
        }
        msg.textContent = t('saved');
      });
    }

    var dmEl = document.getElementById('ei-discord-mentions');
    var igEl = document.getElementById('ei-ingame-alerts');
    if (dmEl) dmEl.onchange = saveNotify;
    if (igEl) igEl.onchange = saveNotify;

    /* Blacklist */
    function currentKind() {
      var dd = document.getElementById('bl-kind');
      return (dd && dd.getAttribute('data-value')) || 'reason';
    }

    function paintValueInput() {
      var wrap = document.getElementById('bl-value-wrap');
      if (!wrap) return;
      var kind = currentKind();
      if (kind === 'category') {
        wrap.innerHTML = EIUI.dropdownHtml({ id: 'bl-value-cat', options: catOpts, value: 'salary' });
        EIUI.bindDropdown('bl-value-cat');
      } else {
        var ph = t('settings_reason_ph');
        if (kind === 'player') ph = t('settings_player_ph');
        if (kind === 'resource') ph = t('settings_resource_ph');
        wrap.innerHTML = '<input class="ds-input" id="bl-value" placeholder="' + EIUI.esc(ph) + '" autocomplete="off" />';
      }
    }

    paintValueInput();
    EIUI.bindDropdown('bl-kind', function () {
      paintValueInput();
    });

    function setMsg(text, isError) {
      var el = document.getElementById('bl-msg');
      if (!el) return;
      el.textContent = text || '';
      el.style.color = isError ? '#a33' : '';
    }

    function renderRules(items) {
      var el = document.getElementById('bl-rules-list');
      if (!el) return;
      if (!items || !items.length) {
        el.innerHTML = '<div class="ei-empty" style="padding:12px 0">' + EIUI.esc(t('settings_empty')) + '</div>';
        return;
      }
      el.innerHTML = items.map(function (row) {
        var active = row.active !== false;
        var display = row.value;
        if (row.kind === 'category') {
          display = t('cat_' + row.value) || row.value;
        }
        var status = active
          ? '<span class="ds-badge ds-badge--neutral">' + EIUI.esc(t('hidden')) + '</span>'
          : '<span class="ds-badge">' + EIUI.esc(t('active')) + '</span>';
        var btnLabel = active ? t('reactivate') : t('disable');
        return (
          '<div class="ei-settings__row' + (active ? ' is-hidden' : '') + '" data-id="' + EIUI.esc(row.id) + '">' +
            '<div class="ds-min-w-0">' +
              '<div class="ei-settings__row-title">' + EIUI.esc(display) + '</div>' +
              '<div class="ds-caption">' + EIUI.esc(self._kindLabel(row.kind)) + '</div>' +
            '</div>' +
            status +
            '<button class="ds-btn ds-btn--ghost ds-btn--sm ei-bl-toggle" type="button" data-active="' + (active ? '0' : '1') + '">' +
              EIUI.esc(btnLabel) +
            '</button>' +
          '</div>'
        );
      }).join('');

      el.querySelectorAll('.ei-bl-toggle').forEach(function (btn) {
        btn.onclick = function () {
          var row = btn.closest('.ei-settings__row');
          var id = row && row.getAttribute('data-id');
          var nextActive = btn.getAttribute('data-active') === '1';
          EIApi.request('setBlacklistActive', { id: Number(id), active: nextActive }).then(function (r) {
            var payload = r.data || {};
            var settings = payload.settings || payload;
            if (r.ok && payload.ok !== false && (settings.rules || settings.blacklist)) {
              self._paint(root, settings);
            } else {
              self.render(root);
            }
          });
        };
      });
    }

    renderRules(rules);

    document.getElementById('bl-add').onclick = function () {
      var kind = currentKind();
      var value = '';
      var label = '';
      if (kind === 'category') {
        var catDd = document.getElementById('bl-value-cat');
        value = catDd ? catDd.getAttribute('data-value') : 'salary';
        label = t('cat_' + value) || value;
      } else {
        var input = document.getElementById('bl-value');
        value = (input && input.value || '').trim();
        label = value;
      }
      if (!value) {
        setMsg(t('settings_empty'), true);
        return;
      }

      setMsg(t('loading'));
      EIApi.request('addBlacklist', { kind: kind, value: value, label: label }).then(function (r) {
        var payload = r.data || {};
        if (!r.ok || payload.ok === false) {
          setMsg((payload.error || r.error || t('error_load')), true);
          return;
        }
        var settings = payload.settings || payload;
        if (settings && (settings.rules || settings.blacklist)) {
          self._paint(root, settings);
          setMsg(t('saved'));
        } else {
          self.render(root);
        }
      });
    };
  },
};
