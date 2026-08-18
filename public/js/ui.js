/**
 * Shared UI helpers — feed rows, metrics, escape
 */
window.EIUI = (function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function iconSvg(name) {
    var paths = {
      in: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
      out: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
      transfer: '<path d="M17 3v10"/><path d="m13 9 4 4 4-4"/><path d="M7 21V11"/><path d="m3 15 4-4 4 4"/>',
      wallet: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M16 14h2"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      chart: '<path d="M3 3v18h18"/><path d="M7 14v4"/><path d="M12 10v8"/><path d="M17 6v12"/>',
      list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
      alert: '<path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
      refresh: '<path d="M21 12a9 9 0 1 1-2.3-6"/><path d="M21 3v6h-6"/>',
      calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
      chevronLeft: '<path d="m15 18-6-6 6-6"/>',
      chevronRight: '<path d="m9 18 6-6-6-6"/>',
      back: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
      coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="M9.05 16.71A6 6 0 0 0 16.71 11"/><path d="M7 10h1"/>',
      pulse: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
      trendUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
      trendDown: '<path d="m3 7 6 6 4-4 8 8"/><path d="M17 17h4v-4"/>',
      trendFlat: '<path d="M5 12h14"/><path d="m15 8 4 4-4 4"/>',
      bank: '<path d="m3 10 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/><path d="M2 20h20"/>',
      note: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9.5v5"/><path d="M18 9.5v5"/>',
      dirty: '<path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7"/><path d="M6.5 7h11l1.2 12.2A2 2 0 0 1 16.7 21.5H7.3a2 2 0 0 1-2-2.3L6.5 7Z"/><path d="M12 11.5v5"/><path d="M10.2 14h3.6"/>',
      copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
      check: '<path d="M20 6 9 17l-5-5"/>',
      chevronDown: '<path d="m6 9 6 6 6-6"/>',
      home: '<path d="m3 10 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 21v-6h6v6"/>',
      building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12h12"/><path d="M6 16h12"/><path d="M10 6h.01"/><path d="M14 6h.01"/><path d="M10 10h.01"/><path d="M14 10h.01"/><path d="M2 22h20"/>',
      car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
      fuel: '<path d="M3 22V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M3 12h10"/><path d="M14 12h1a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V8.5a2.5 2.5 0 0 0-.7-1.7L17 3"/>',
      crosshair: '<circle cx="12" cy="12" r="10"/><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/>',
      pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
      box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
      shoppingBag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
      briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
      store: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M10 22V12h4v10"/><path d="M2 7h20"/><path d="M15 7v.01"/><path d="M9 7v.01"/>',
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (paths[name] || paths.wallet) + '</svg>';
  }

  function stripEmoji(s) {
    return String(s == null ? '' : s)
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
      .replace(/[\u2600-\u27BF]/g, '')
      .replace(/[\uFE0F\u200D]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /** Category / title → lucide-style icon name (no emoji). */
  function titleIconName(row) {
    var cat = String(row.category_key || row.category || '').toLowerCase();
    var key = String(row.title_key || row.title || row.reason || '').toLowerCase();
    var activity = String(row.activity || (row.meta && row.meta.activity) || '').toLowerCase();

    if (activity.indexOf('storage') === 0 || key.indexOf('tx_storage') === 0 || cat === 'storage') return 'box';
    if (cat === 'property' || /house|motel|hotel|apartment|property|rent/.test(key)) return 'home';
    if (cat === 'vehicle' || /vehicle|impound|fuel|mod|repair|trunk|glove/.test(key)) {
      return /fuel/.test(key) ? 'fuel' : 'car';
    }
    if (cat === 'weapon' || /weapon|ammo|gun/.test(key)) return 'crosshair';
    if (cat === 'drugs' || /drug|wash|launder/.test(key)) return 'pill';
    if (cat === 'banking' || /deposit|withdraw|banking|bank|atm/.test(key)) return 'bank';
    if (cat === 'society' || /society|invoice/.test(key)) return 'users';
    if (cat === 'job' || /salary|paycheck|wage/.test(key)) return 'briefcase';
    if (cat === 'shop' || /purchase|sale|shop|buy/.test(key)) return 'shoppingBag';
    if (cat === 'admin' || /admin/.test(key)) return 'shield';
    if (cat === 'casino' || /casino|blackjack|roulette|slots|poker|gambling/.test(key)) return 'sparkles';
    if (cat === 'sell') return 'shoppingBag';
    return null;
  }

  function metric(opts) {
    opts = opts || {};
    var toneCls = '';
    if (opts.tone === 'in') toneCls = ' ds-metric__icon--in';
    else if (opts.tone === 'out') toneCls = ' ds-metric__icon--out';
    else if (opts.accent) toneCls = ' ds-metric__icon--accent';
    var icon = opts.icon ? '<div class="ds-metric__icon' + toneCls + '">' + iconSvg(opts.icon) + '</div>' : '';
    return (
      '<div class="ds-metric">' +
        '<div class="ds-metric__top">' +
          icon +
          '<div class="ds-metric__label">' + esc(opts.label) + '</div>' +
        '</div>' +
        '<div class="ds-metric__value">' + (opts.value != null ? opts.value : '—') + '</div>' +
        (opts.hint ? '<div class="ds-metric__hint">' + esc(opts.hint) + '</div>' : '') +
      '</div>'
    );
  }

  function amountClass(row) {
    var activity = row.activity || '';
    var base = 'ds-amount';
    if (activity === 'deposit' || activity === 'withdraw') base += ' ds-amount--neutral';
    else if (row.direction === 'in') base += ' ds-amount--in';
    else if (row.direction === 'out') base += ' ds-amount--out';
    var n = Math.abs(Number(row.amount) || 0);
    if (n >= 100000) base += ' ds-amount--xl';
    else if (n >= 10000) base += ' ds-amount--lg';
    return base;
  }

  function amountPrefix(row) {
    var activity = row.activity || '';
    if (activity === 'deposit' || activity === 'withdraw') return '';
    if (row.direction === 'in') return '+';
    if (row.direction === 'out') return '−';
    return '';
  }

  function feedIconTone(row) {
    var activity = row.activity || '';
    if (activity === 'deposit' || activity === 'withdraw') return 'neutral';
    if (row.direction === 'in') return 'in';
    if (row.direction === 'out') return 'out';
    return '';
  }

  function feedDirLabel(tone) {
    if (!window.t) {
      if (tone === 'in') return 'Incoming';
      if (tone === 'out') return 'Outgoing';
      if (tone === 'neutral') return 'Bank';
      return '';
    }
    if (tone === 'in') return t('dir_in');
    if (tone === 'out') return t('dir_out');
    if (tone === 'neutral') return t('dir_bank');
    return '';
  }

  function feedIconName(row) {
    var activity = row.activity || '';
    if (activity === 'deposit' || activity === 'withdraw' || activity === 'inv_transfer') return 'transfer';
    if (activity === 'storage_deposit' || activity === 'storage_withdraw') {
      return row.direction === 'in' ? 'in' : 'out';
    }
    if (row.direction === 'in') return 'in';
    if (row.direction === 'out') return 'out';
    return 'wallet';
  }

  function storageSubtitle(row) {
    var meta = row && row.meta;
    if (!meta) return null;
    var activity = row.activity || meta.activity || '';
    if (activity !== 'storage_deposit' && activity !== 'storage_withdraw' && activity !== 'inv_transfer') {
      return null;
    }

    function L(key, fallback) {
      if (window.t) {
        var v = t(key);
        if (v && v !== key) return v;
      }
      return fallback;
    }

    if (activity === 'inv_transfer') {
      var who = meta.counterpart_name || meta.target_label || meta.label || '';
      if (!who) return null;
      if (row.direction === 'out') return '→ ' + who;
      if (row.direction === 'in') return '← ' + who;
      return String(who);
    }

    var kind = String(meta.storage_type || meta.to_type || meta.from_type || '');
    var plateRaw = meta.plate ? String(meta.plate) : '';
    var plate = plateRaw
      ? (L('storage_plate', 'Plate') + ': ' + plateRaw)
      : '';
    var owner = meta.owner_name ? String(meta.owner_name) : '';
    var label = meta.target_label || meta.label || '';

    if (kind === 'glovebox') {
      return plate
        ? (L('storage_glovebox', 'Glovebox') + ' · ' + plate)
        : L('storage_glovebox', 'Glovebox');
    }
    if (kind === 'trunk') {
      return plate
        ? (L('storage_trunk', 'Trunk') + ' · ' + plate)
        : L('storage_trunk', 'Trunk');
    }
    if (kind === 'drop') return L('storage_drop', 'Drop');
    if (kind === 'stash' || kind === 'property') {
      if (owner && label && String(label) !== owner) return label + ' · ' + owner;
      return owner || label || L('storage_stash', 'Stash');
    }
    return plate || owner || label || null;
  }

  function resolveTitle(row) {
    if (!row) return '—';
    var key = row.title_key;
    var raw = row.title || row.reason || '';
    var item = row.title_item || (row.meta && (row.meta.label || row.meta.item)) || '';

    function purchaseItemFromText(text) {
      if (!text) return '';
      var m = String(text).match(/^(?:compra|buy|purchase|achat|kauf)\s*:\s*(.+)$/i);
      return m ? m[1].trim() : '';
    }

    if (!item) item = purchaseItemFromText(raw) || purchaseItemFromText(row.meta && row.meta.label);

    // Only treat as purchase when explicitly marked — meta.label is often a reason copy, not a shop item
    if (!key && (raw === 'tx_purchase' || purchaseItemFromText(raw))) {
      key = 'tx_purchase';
      if (!item) item = purchaseItemFromText(raw) || '';
    }
    if (!key && row.title_item && (row.title_key === 'tx_purchase' || raw === 'tx_purchase')) {
      key = 'tx_purchase';
      item = row.title_item;
    }

    function saleItemFromText(text) {
      if (!text) return '';
      var m = String(text).match(/^(.+?)\s+sold\s*$/i)
        || String(text).match(/^(?:sold|sale|venda|venta)\s*:\s*(.+)$/i);
      return m ? m[1].trim() : '';
    }

    var rawLower = String(raw || '').toLowerCase();
    var itemLower = String(item || '').toLowerCase();
    var catKey = row.category_key || '';
    if (!key && (raw === 'tx_sale' || row.title_key === 'tx_sale' || catKey === 'sell'
        || /\bsold\b/.test(rawLower) || /\bsale\b/.test(rawLower) || /\bsell\b/.test(rawLower)
        || /\bvenda\b/.test(rawLower) || /\bventa\b/.test(rawLower)
        || /\bsold\b/.test(itemLower))) {
      key = 'tx_sale';
      if (!row.title_item) {
        var saleItem = saleItemFromText(raw) || saleItemFromText(item);
        if (saleItem) item = saleItem;
      } else {
        item = row.title_item;
      }
    }

    if (!key && raw) {
      var lower = String(raw).toLowerCase();
      var aliases = {
        'recebeu de admin': 'tx_admin_in',
        'received from admin': 'tx_admin_in',
        'removido por admin': 'tx_admin_out',
        'removed by admin': 'tx_admin_out',
        'saldo definido por admin': 'tx_admin_set',
        'balance set by admin': 'tx_admin_set',
        'movimento admin': 'tx_admin_move',
        'admin movement': 'tx_admin_move',
        'tx_admin_in': 'tx_admin_in',
        'tx_admin_out': 'tx_admin_out',
        'tx_admin_set': 'tx_admin_set',
        'tx_admin_move': 'tx_admin_move',
        'tx_deposit': 'tx_deposit',
        'tx_withdraw': 'tx_withdraw',
        'tx_society_deposit': 'tx_society_deposit',
        'tx_society_withdraw': 'tx_society_withdraw',
        'society deposit': 'tx_society_deposit',
        'society withdraw': 'tx_society_withdraw',
        'depósito de sociedade': 'tx_society_deposit',
        'levantamento de sociedade': 'tx_society_withdraw',
        'tx_received': 'tx_received',
        'tx_spent': 'tx_spent',
        'tx_transfer': 'tx_transfer',
        'tx_movement': 'tx_movement',
        'tx_purchase': 'tx_purchase',
        'tx_storage_deposit': 'tx_storage_deposit',
        'tx_storage_withdraw': 'tx_storage_withdraw',
        'tx_storage_deposit_cash': 'tx_storage_deposit_cash',
        'tx_storage_deposit_black': 'tx_storage_deposit_black',
        'tx_storage_withdraw_cash': 'tx_storage_withdraw_cash',
        'tx_storage_withdraw_black': 'tx_storage_withdraw_black',
        'tx_inv_transfer': 'tx_inv_transfer',
        'tx_sale': 'tx_sale',
        'drugs sold': 'tx_sale',
        deposit: 'tx_deposit',
        depósito: 'tx_deposit',
        withdraw: 'tx_withdraw',
        levantamento: 'tx_withdraw',
        received: 'tx_received',
        spent: 'tx_spent',
        transfer: 'tx_transfer',
        transferência: 'tx_transfer',
        movement: 'tx_movement',
        movimento: 'tx_movement',
      };
      key = aliases[lower];
    }

    var activity = row.activity || (row.meta && row.meta.activity) || '';
    var acc = String(row.account || '').toLowerCase();
    var isBlack = acc === 'black_money' || acc === 'dirty';
    if (key === 'tx_storage_deposit' || (!key && activity === 'storage_deposit')) {
      key = isBlack ? 'tx_storage_deposit_black' : 'tx_storage_deposit_cash';
    } else if (key === 'tx_storage_withdraw' || (!key && activity === 'storage_withdraw')) {
      key = isBlack ? 'tx_storage_withdraw_black' : 'tx_storage_withdraw_cash';
    }

    // Fix purchase mis-tags like "Purchase: Drugs Sold"
    if (key === 'tx_purchase') {
      var sellProbe = (String(item || '') + ' ' + String(raw || '')).toLowerCase();
      if (/\bsold\b/.test(sellProbe) || /\bsale\b/.test(sellProbe) || /\bvenda\b/.test(sellProbe) || /\bventa\b/.test(sellProbe)
          || catKey === 'sell') {
        key = 'tx_sale';
        var fixedSale = saleItemFromText(item) || saleItemFromText(raw);
        if (fixedSale) item = fixedSale;
      }
    }

    // Society boss-menu moves (resource / reason), never Purchase
    var resProbe = String(row.resource || '').toLowerCase();
    var societyProbe = (String(raw || '') + ' ' + String(item || '') + ' ' + resProbe).toLowerCase();
    if (key === 'tx_purchase' || !key) {
      if (resProbe.indexOf('society') >= 0 || societyProbe.indexOf('society deposit') >= 0
          || societyProbe.indexOf('society withdraw') >= 0 || societyProbe.indexOf('tx_society_') >= 0
          || catKey === 'society') {
        var isSocOut = societyProbe.indexOf('withdraw') >= 0 || row.direction === 'in';
        if (societyProbe.indexOf('deposit') >= 0) isSocOut = false;
        if (societyProbe.indexOf('withdraw') >= 0) isSocOut = true;
        key = isSocOut ? 'tx_society_withdraw' : 'tx_society_deposit';
        item = '';
      }
    }

    if (key === 'tx_purchase' && window.t) {
      var purchaseLabel = t('tx_purchase');
      if (purchaseLabel && purchaseLabel !== 'tx_purchase') {
        return stripEmoji(item ? (purchaseLabel + ': ' + item) : purchaseLabel);
      }
    }

    if (key === 'tx_sale' && window.t) {
      var saleLabel = t('tx_sale');
      if (saleLabel && saleLabel !== 'tx_sale') {
        return stripEmoji(item ? (saleLabel + ': ' + item) : saleLabel);
      }
    }

    if (key && window.t) {
      var translated = t(key);
      if (translated && translated !== key) return stripEmoji(translated);
    }
    if (raw && String(raw).indexOf('tx_') === 0 && window.t) {
      var tr = t(raw);
      if (tr && tr !== raw) return stripEmoji(tr);
    }
    // Legacy localized purchase titles → current locale
    var legacyItem = purchaseItemFromText(raw);
    if (legacyItem && window.t) {
      var pl = t('tx_purchase');
      if (pl && pl !== 'tx_purchase') return stripEmoji(pl + ': ' + legacyItem);
    }
    return stripEmoji(raw || (window.t ? t('tx_movement') : 'Movement'));
  }

  function feedRow(row, opts) {
    opts = opts || {};
    var tone = feedIconTone(row);
    var iconCls = 'ds-feed__icon' + (tone ? ' ds-feed__icon--' + tone : '');
    var badge = '';
    var catKey = row.category_key || (typeof row.category === 'string' ? row.category : '');
    var catLabel = '';

    if (row.activity === 'deposit' || row.activity === 'withdraw') {
      badge = '<span class="ds-badge ds-badge--accent">' + esc(window.t ? t('bank') : 'Bank') + '</span>';
    } else if (catKey || row.category) {
      catLabel = (window.t && catKey) ? (t('cat_' + catKey) || catKey) : (row.category || catKey);
      if (catLabel === ('cat_' + catKey)) catLabel = catKey;
      badge = '<span class="ds-badge ds-badge--neutral">' + esc(stripEmoji(catLabel)) + '</span>';
    }

    var player = opts.hidePlayer
      ? ''
      : '<span>' + esc(row.player_name || row.player_identifier || (window.t ? t('name') : 'Player')) + '</span><span class="ds-feed__dot">·</span>';

    var dirLabel = feedDirLabel(tone);
    var dirBadge = dirLabel
      ? '<span class="ds-badge ds-badge--dir ds-badge--dir-' + (tone || 'neutral') + '" title="' + esc(dirLabel) + '">' + esc(dirLabel) + '</span><span class="ds-feed__dot">·</span>'
      : '';

    var resource = row.resource;
    if (resource === 'unclassified' || resource === 'unknown') resource = null;
    var localizedStorage = storageSubtitle(row);
    var subtitle = localizedStorage
      ? esc(localizedStorage)
      : (row.subtitle
        ? esc(stripEmoji(row.subtitle))
        : esc((row.account || '') + (resource ? ' · ' + resource : '')));
    if (!localizedStorage && row.subtitle && /unclassified/i.test(row.subtitle)) {
      var parts = [];
      if (row.account) parts.push(row.account);
      if (resource) parts.push(resource);
      if (parts.length) subtitle = esc(parts.join(' · '));
    }

    var left;
    if (!opts.hideAvatar && row.avatar_url) {
      left =
        '<div class="ei-feed-avatar">' +
          '<img class="ei-avatar" src="' + esc(row.avatar_url) + '" alt="" loading="lazy" referrerpolicy="no-referrer" />' +
        '</div>';
    } else {
      left = '<div class="' + iconCls + '" title="' + esc(dirLabel || '') + '">' + iconSvg(feedIconName(row)) + '</div>';
    }

    var amountCls = amountClass(row);
    var amountHtml =
      '<div class="' + amountCls + '" title="' + esc((amountPrefix(row) + '€' + EIApi.formatMoney(row.amount))) + '">' +
        amountPrefix(row) + '€' + EIApi.formatMoney(row.amount) +
      '</div>';

    var titleText = resolveTitle(row);
    var titleIcon = titleIconName(row);
    var titleHtml = titleIcon
      ? '<span class="ds-feed__title-icon" aria-hidden="true">' + iconSvg(titleIcon) + '</span><span class="ds-feed__title-text">' + esc(titleText) + '</span>'
      : esc(titleText);

    return (
      '<article class="ds-feed__row">' +
        left +
        '<div class="ds-feed__body">' +
          '<div class="ds-feed__title">' + titleHtml + '</div>' +
          '<div class="ds-feed__sub">' + subtitle + '</div>' +
          '<div class="ds-feed__meta">' +
            dirBadge +
            player +
            '<span>' + EIApi.formatTs(row.ts) + '</span>' +
            (badge ? '<span class="ds-feed__dot">·</span>' + badge : '') +
          '</div>' +
        '</div>' +
        '<div class="ds-feed__side">' + amountHtml + '</div>' +
      '</article>'
    );
  }

  function setPageMetrics(items) {
    var el = document.getElementById('page-metrics');
    if (!el) return;
    if (!items || !items.length) {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }
    el.hidden = false;
    el.innerHTML = items.map(function (m) {
      return (
        '<div class="ei-pagehead__metric">' +
          '<div class="ei-pagehead__metric-value">' + (m.value != null ? m.value : '—') + '</div>' +
          '<div class="ei-pagehead__metric-label">' + esc(m.label) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function clearPageMetrics() {
    setPageMetrics([]);
  }

  /**
   * Custom dropdown (evita o popup nativo do <select>).
   * opts: { id, options:[{value,label}], value, onChange(value) }
   * returns HTML string; call bindDropdown(rootOrId, opts) after insert.
   */
  function dropdownHtml(opts) {
    opts = opts || {};
    var id = opts.id || 'ds-dd';
    var value = opts.value != null ? opts.value : '';
    var options = opts.options || [];
    var current = options[0] || { value: '', label: '—' };
    for (var i = 0; i < options.length; i++) {
      if (String(options[i].value) === String(value)) {
        current = options[i];
        break;
      }
    }

    var items = options.map(function (o) {
      var active = String(o.value) === String(current.value) ? ' is-active' : '';
      return (
        '<button type="button" class="ds-dropdown__option' + active + '" data-value="' + esc(o.value) + '" role="option">' +
          esc(o.label) +
        '</button>'
      );
    }).join('');

    return (
      '<div class="ds-dropdown" id="' + esc(id) + '" data-value="' + esc(current.value) + '">' +
        '<button type="button" class="ds-dropdown__trigger" aria-haspopup="listbox" aria-expanded="false">' +
          '<span class="ds-dropdown__label">' + esc(current.label) + '</span>' +
          '<span class="ds-dropdown__chevron" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>' +
        '</button>' +
        '<div class="ds-dropdown__menu" role="listbox">' +
          '<div class="ds-dropdown__menu-scroll">' + items + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function bindDropdown(id, onChange) {
    var root = typeof id === 'string' ? document.getElementById(id) : id;
    if (!root) return null;

    var trigger = root.querySelector('.ds-dropdown__trigger');
    var menu = root.querySelector('.ds-dropdown__menu');
    var label = root.querySelector('.ds-dropdown__label');

    function close() {
      root.classList.remove('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    function open() {
      document.querySelectorAll('.ds-dropdown.is-open').forEach(function (el) {
        if (el !== root) el.classList.remove('is-open');
      });
      root.classList.add('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
    }

    function toggle() {
      if (root.classList.contains('is-open')) close();
      else open();
    }

    function setValue(value, silent) {
      var opt = null;
      root.querySelectorAll('.ds-dropdown__option').forEach(function (btn) {
        var match = String(btn.getAttribute('data-value')) === String(value);
        btn.classList.toggle('is-active', match);
        if (match) opt = btn;
      });
      if (!opt) return;
      root.setAttribute('data-value', value);
      if (label) label.textContent = opt.textContent;
      if (!silent && typeof onChange === 'function') onChange(value);
    }

    if (trigger) {
      trigger.onclick = function (e) {
        e.stopPropagation();
        toggle();
      };
    }

    if (menu) {
      menu.onclick = function (e) {
        var btn = e.target.closest('.ds-dropdown__option');
        if (!btn) return;
        e.stopPropagation();
        setValue(btn.getAttribute('data-value'));
        close();
      };
    }

    // one shared document listener is fine; close if click outside
    if (!window.__eiDropdownDocBound) {
      window.__eiDropdownDocBound = true;
      document.addEventListener('click', function () {
        document.querySelectorAll('.ds-dropdown.is-open').forEach(function (el) {
          el.classList.remove('is-open');
          var t = el.querySelector('.ds-dropdown__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      });
    }

    return {
      getValue: function () { return root.getAttribute('data-value') || ''; },
      setValue: setValue,
      close: close,
    };
  }

  function tr(key, fallback) {
    if (window.t) {
      var v = t(key);
      if (v && v !== key) return v;
    }
    return fallback;
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function parseYmd(s) {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return null;
    var p = String(s).split('-');
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    if (isNaN(d.getTime())) return null;
    return d;
  }

  function formatYmd(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function monthNames() {
    return tr('cal_months', 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec').split(',');
  }

  function weekdayNames() {
    return tr('cal_weekdays', 'Mo,Tu,We,Th,Fr,Sa,Su').split(',');
  }

  /** Compact display: 17/07/2026 */
  function formatDateCompact(ymd, withYear) {
    var d = parseYmd(ymd);
    if (!d) return '';
    var core = pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1);
    if (withYear === false) return core;
    if (withYear === 'short') return core + '/' + String(d.getFullYear()).slice(-2);
    return core + '/' + d.getFullYear();
  }

  function formatDateLabel(ymd) {
    var d = parseYmd(ymd);
    if (!d) return tr('period_pick_day', 'Pick a specific day');
    return formatDateCompact(ymd, true);
  }

  function formatRangeLabel(from, to) {
    if (!from && !to) return tr('period_pick_range', 'Select a day or range');
    if (from && (!to || from === to)) return formatDateLabel(from);
    return formatDateCompact(from, true) + ' – ' + formatDateCompact(to, true);
  }

  function ymdAddDays(ymd, delta) {
    var d = parseYmd(ymd) || new Date();
    d.setDate(d.getDate() + delta);
    return formatYmd(d);
  }

  /**
   * Custom datepicker.
   * opts: { id, value, from, to, range:true, placeholder }
   */
  function datepickerHtml(opts) {
    opts = opts || {};
    var id = opts.id || 'ds-dp';
    var range = !!opts.range;
    var from = opts.from ? String(opts.from) : '';
    var to = opts.to ? String(opts.to) : '';
    var value = opts.value ? String(opts.value) : '';
    if (!range && value) {
      from = value;
      to = value;
    }
    if (from && !to) to = from;
    var placeholder = opts.placeholder
      || (range ? tr('period_pick_range', 'Select a day or range') : tr('period_pick_day', 'Pick a specific day'));
    var label = range ? formatRangeLabel(from, to) : (value ? formatDateLabel(value) : placeholder);
    if (!from && !value) label = placeholder;
    var hasValue = range ? !!(from && to) : !!value;
    return (
      '<div class="ds-datepicker' + (hasValue ? ' has-value' : '') + (range ? ' ds-datepicker--range' : '') + '"' +
        ' id="' + esc(id) + '"' +
        ' data-range="' + (range ? '1' : '0') + '"' +
        ' data-value="' + esc(range ? '' : value) + '"' +
        ' data-from="' + esc(from) + '"' +
        ' data-to="' + esc(to) + '">' +
        '<button type="button" class="ds-datepicker__trigger" aria-haspopup="dialog" aria-expanded="false" title="' + esc(placeholder) + '">' +
          '<span class="ds-datepicker__icon" aria-hidden="true">' + iconSvg('calendar') + '</span>' +
          '<span class="ds-datepicker__label">' + esc(label) + '</span>' +
        '</button>' +
        '<div class="ds-datepicker__panel" role="dialog" aria-label="' + esc(placeholder) + '" hidden></div>' +
      '</div>'
    );
  }

  function bindDatepicker(id, onChange) {
    var root = typeof id === 'string' ? document.getElementById(id) : id;
    if (!root) return null;

    var trigger = root.querySelector('.ds-datepicker__trigger');
    var label = root.querySelector('.ds-datepicker__label');
    var panel = root.querySelector('.ds-datepicker__panel');
    var isRange = root.getAttribute('data-range') === '1';
    var draftFrom = null;
    var viewDate = parseYmd(root.getAttribute('data-to') || root.getAttribute('data-from') || root.getAttribute('data-value')) || new Date();
    var view = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);

    function currentFrom() { return root.getAttribute('data-from') || ''; }
    function currentTo() { return root.getAttribute('data-to') || ''; }

    function close() {
      root.classList.remove('is-open');
      draftFrom = null;
      if (panel) panel.hidden = true;
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    function open() {
      document.querySelectorAll('.ds-datepicker.is-open').forEach(function (el) {
        if (el !== root) {
          el.classList.remove('is-open');
          var p = el.querySelector('.ds-datepicker__panel');
          if (p) p.hidden = true;
          var t = el.querySelector('.ds-datepicker__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
      document.querySelectorAll('.ds-dropdown.is-open').forEach(function (el) {
        el.classList.remove('is-open');
      });
      draftFrom = null;
      renderPanel();
      root.classList.add('is-open');
      if (panel) panel.hidden = false;
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
    }

    function emitChange(from, to, silent, opts) {
      opts = opts || {};
      if (isRange) {
        if (!silent && typeof onChange === 'function') {
          onChange({
            from: from || '',
            to: to || from || '',
            all_time: !!opts.allTime,
          });
        }
      } else if (!silent && typeof onChange === 'function') {
        onChange(from || '');
      }
    }

    function applySelection(from, to, silent, opts) {
      opts = opts || {};
      var allTime = !!opts.allTime;
      from = from || '';
      to = to || from || '';
      if (allTime) {
        from = '';
        to = '';
        root.setAttribute('data-all-time', '1');
      } else {
        root.removeAttribute('data-all-time');
      }
      if (from && to && from > to) {
        var tmp = from;
        from = to;
        to = tmp;
      }
      root.setAttribute('data-from', from);
      root.setAttribute('data-to', to);
      root.setAttribute('data-value', isRange ? '' : from);
      root.classList.toggle('has-value', !!(from && to) || allTime);
      if (label) {
        if (allTime) {
          label.textContent = tr('cal_all_time', 'All time');
        } else if (isRange) {
          label.textContent = from
            ? formatRangeLabel(from, to)
            : tr('period_pick_range', 'Select a day or range');
        } else {
          label.textContent = from
            ? formatDateLabel(from)
            : tr('period_pick_day', 'Pick a specific day');
        }
      }
      if (to || from) {
        var d = parseYmd(to || from);
        if (d) view = new Date(d.getFullYear(), d.getMonth(), 1);
      }
      if (root.classList.contains('is-open')) renderPanel();
      emitChange(from, to, silent, { allTime: allTime });
    }

    function setValue(value, silent) {
      if (value && typeof value === 'object') {
        if (value.all_time) {
          applySelection('', '', silent, { allTime: true });
          return;
        }
        applySelection(value.from || '', value.to || value.from || '', silent);
        return;
      }
      value = value ? String(value) : '';
      applySelection(value, value, silent);
    }

    function renderPanel() {
      if (!panel) return;
      var selectedFrom = draftFrom || currentFrom();
      var selectedTo = draftFrom ? '' : currentTo();
      var today = formatYmd(new Date());
      var y = view.getFullYear();
      var m = view.getMonth();
      var months = monthNames();
      var weekdays = weekdayNames();
      var firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
      var daysInMonth = new Date(y, m + 1, 0).getDate();
      var rangeStart = selectedFrom;
      var rangeEnd = selectedTo || selectedFrom;
      if (rangeStart && rangeEnd && rangeStart > rangeEnd) {
        var swap = rangeStart;
        rangeStart = rangeEnd;
        rangeEnd = swap;
      }
      var cells = '';
      var i;
      for (i = 0; i < firstDow; i++) {
        cells += '<span class="ds-datepicker__day is-empty" aria-hidden="true"></span>';
      }
      for (i = 1; i <= daysInMonth; i++) {
        var ymd = y + '-' + pad2(m + 1) + '-' + pad2(i);
        var cls = 'ds-datepicker__day';
        if (ymd === today) cls += ' is-today';
        if (ymd > today) cls += ' is-disabled';
        if (rangeStart && rangeEnd && ymd >= rangeStart && ymd <= rangeEnd) cls += ' is-in-range';
        if (ymd === rangeStart) cls += ' is-range-start is-selected';
        if (ymd === rangeEnd) cls += ' is-range-end is-selected';
        cells +=
          '<button type="button" class="' + cls + '" data-date="' + ymd + '"' +
          (ymd > today ? ' disabled' : '') + '>' + i + '</button>';
      }

      var hint = '';
      if (isRange) {
        hint = draftFrom
          ? tr('cal_select_end', 'Select the end day')
          : tr('cal_range_hint', 'One day or start → end');
      }

      panel.innerHTML =
        '<div class="ds-datepicker__nav">' +
          '<button type="button" class="ds-datepicker__nav-btn" data-nav="-1" aria-label="Previous">' + iconSvg('chevronLeft') + '</button>' +
          '<div class="ds-datepicker__month">' + esc((months[m] || '') + ' ' + y) + '</div>' +
          '<button type="button" class="ds-datepicker__nav-btn" data-nav="1" aria-label="Next">' + iconSvg('chevronRight') + '</button>' +
        '</div>' +
        (hint ? '<div class="ds-datepicker__hint">' + esc(hint) + '</div>' : '') +
        '<div class="ds-datepicker__weekdays">' +
          weekdays.map(function (w) {
            return '<span class="ds-datepicker__weekday">' + esc(w) + '</span>';
          }).join('') +
        '</div>' +
        '<div class="ds-datepicker__grid">' + cells + '</div>' +
        '<div class="ds-datepicker__footer">' +
          '<button type="button" class="ds-datepicker__action" data-action="clear">' + esc(tr('cal_clear', 'Clear')) + '</button>' +
          '<div class="ds-datepicker__footer-actions">' +
            '<button type="button" class="ds-datepicker__action" data-action="all">' + esc(tr('cal_all_time', 'All time')) + '</button>' +
            '<button type="button" class="ds-datepicker__action ds-datepicker__action--accent" data-action="today">' + esc(tr('cal_today', 'Today')) + '</button>' +
          '</div>' +
        '</div>';
    }

    if (trigger) {
      trigger.onclick = function (e) {
        e.stopPropagation();
        if (root.classList.contains('is-open')) close();
        else open();
      };
    }

    if (panel) {
      panel.onclick = function (e) {
        e.stopPropagation();
        var nav = e.target.closest('[data-nav]');
        if (nav) {
          view = new Date(view.getFullYear(), view.getMonth() + Number(nav.getAttribute('data-nav')), 1);
          renderPanel();
          return;
        }
        var action = e.target.closest('[data-action]');
        if (action) {
          var act = action.getAttribute('data-action');
          if (act === 'clear') {
            draftFrom = null;
            applySelection('', '');
            close();
          } else if (act === 'all') {
            draftFrom = null;
            applySelection('', '', false, { allTime: true });
            close();
          } else if (act === 'today') {
            var today = formatYmd(new Date());
            draftFrom = null;
            applySelection(today, today);
            close();
          }
          return;
        }
        var day = e.target.closest('.ds-datepicker__day[data-date]:not(.is-disabled)');
        if (!day) return;
        var picked = day.getAttribute('data-date');
        if (!isRange) {
          applySelection(picked, picked);
          close();
          return;
        }
        if (!draftFrom) {
          draftFrom = picked;
          renderPanel();
          return;
        }
        applySelection(draftFrom, picked);
        draftFrom = null;
        close();
      };
    }

    if (!window.__eiDatepickerDocBound) {
      window.__eiDatepickerDocBound = true;
      document.addEventListener('click', function () {
        document.querySelectorAll('.ds-datepicker.is-open').forEach(function (el) {
          el.classList.remove('is-open');
          var p = el.querySelector('.ds-datepicker__panel');
          if (p) p.hidden = true;
          var t = el.querySelector('.ds-datepicker__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.ds-datepicker.is-open').forEach(function (el) {
          el.classList.remove('is-open');
          var p = el.querySelector('.ds-datepicker__panel');
          if (p) p.hidden = true;
        });
      });
    }

    return {
      getValue: function () {
        if (isRange) {
          return {
            from: currentFrom(),
            to: currentTo() || currentFrom(),
            all_time: root.getAttribute('data-all-time') === '1',
          };
        }
        return currentFrom() || root.getAttribute('data-value') || '';
      },
      setValue: setValue,
      close: close,
    };
  }

  function titleCaseWords(text) {
    return String(text || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(function (word) {
        if (word.length <= 4 && word === word.toUpperCase()) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  /** Human label for Money Flow / economic activity keys (i18n first, then Title Case). */
  function formatFlowLabel(key) {
    if (key == null || key === '') return '—';
    key = String(key);
    var rawKey = key.toLowerCase();

    if (rawKey === 'drugs sold' || rawKey === 'drug sold') key = 'flow_drugs_sold';
    else if (rawKey === 'lsc purchase' || rawKey === 'lsc_purchase' || rawKey.indexOf('lsc purchase') >= 0) {
      key = 'flow_lsc_purchase';
    } else if (rawKey === 'admin' || rawKey === 'flow_admin_injected') {
      key = 'flow_admin_injected';
    }

    if (window.t) {
      var translated = t(key);
      if (translated && translated !== key) return translated;
    }

    var human = key;
    if (human.indexOf('tx_') === 0) human = human.slice(3);
    else if (human.indexOf('flow_') === 0) human = human.slice(5);
    else if (human.indexOf('activity_') === 0) human = human.slice(9);
    else if (human.indexOf('cat_') === 0) human = human.slice(4);
    else if (human.indexOf('highlight_') === 0) human = human.slice(10);

    return titleCaseWords(human);
  }

  return {
    esc: esc,
    iconSvg: iconSvg,
    titleIconName: titleIconName,
    metric: metric,
    feedRow: feedRow,
    setPageMetrics: setPageMetrics,
    clearPageMetrics: clearPageMetrics,
    dropdownHtml: dropdownHtml,
    bindDropdown: bindDropdown,
    datepickerHtml: datepickerHtml,
    bindDatepicker: bindDatepicker,
    ymdAddDays: ymdAddDays,
    formatYmd: formatYmd,
    formatRangeLabel: formatRangeLabel,
    formatDateCompact: formatDateCompact,
    formatFlowLabel: formatFlowLabel,
  };
})();
