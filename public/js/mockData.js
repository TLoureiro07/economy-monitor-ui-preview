/**
 * Standalone preview mock data — fictional players & transactions only.
 */
window.EIMockData = (function () {
  var now = Math.floor(Date.now() / 1000);

  function ts(hoursAgo) {
    return now - Math.round(hoursAgo * 3600);
  }

  var PLAYERS = [
    {
      id: 1,
      name: 'Alex Morgan',
      identifier: 'char1:demo00000001',
      license: 'license:demo000000000001',
      steam: 'steam:110000100000001',
      online: true,
      server_id: 12,
      discord_username: 'alexm_demo',
      playtime_sec: 864000,
      job: { label: 'Mechanic', grade_label: 'Senior', name: 'mechanic' },
    },
    {
      id: 2,
      name: 'Jordan Lee',
      identifier: 'char1:demo00000002',
      license: 'license:demo000000000002',
      online: true,
      server_id: 24,
      playtime_sec: 432000,
      job: { label: 'Police', grade_label: 'Officer', name: 'police' },
    },
    {
      id: 3,
      name: 'Sam Rivera',
      identifier: 'char1:demo00000003',
      license: 'license:demo000000000003',
      online: false,
      playtime_sec: 1209600,
      job: { label: 'Real Estate', grade_label: 'Agent', name: 'realestate' },
    },
    {
      id: 4,
      name: 'Taylor Brooks',
      identifier: 'char1:demo00000004',
      license: 'license:demo000000000004',
      online: false,
      playtime_sec: 259200,
    },
    {
      id: 5,
      name: 'Casey Nguyen',
      identifier: 'char1:demo00000005',
      license: 'license:demo000000000005',
      online: true,
      server_id: 7,
      playtime_sec: 604800,
      job: { label: 'Taxi', grade_label: 'Driver', name: 'taxi' },
    },
    {
      id: 6,
      name: 'Riley Chen',
      identifier: 'char1:demo00000006',
      license: 'license:demo000000000006',
      online: false,
      playtime_sec: 172800,
    },
  ];

  var TIMELINE = [
    { id: 101, ts: ts(0.3), direction: 'in', category: 'salary', amount: 4200, player_name: 'Alex Morgan', player_identifier: 'char1:demo00000001', reason: 'Salary Payment', account: 'bank', resource: 'esx_society' },
    { id: 102, ts: ts(0.8), direction: 'out', category: 'shop', amount: 850, player_name: 'Jordan Lee', player_identifier: 'char1:demo00000002', reason: 'Purchase: supplies', account: 'cash', resource: 'ox_inventory' },
    { id: 103, ts: ts(1.2), direction: 'in', category: 'job', amount: 12500, player_name: 'Casey Nguyen', player_identifier: 'char1:demo00000005', reason: 'Taxi Fare', account: 'cash', resource: 'qb-taxi' },
    { id: 104, ts: ts(2.5), direction: 'out', category: 'vehicle', amount: 3200, player_name: 'Sam Rivera', player_identifier: 'char1:demo00000003', reason: 'Vehicle Repair', account: 'bank', resource: 'mechanic_job' },
    { id: 105, ts: ts(3.1), direction: 'in', category: 'society', amount: 98000, player_name: 'Taylor Brooks', player_identifier: 'char1:demo00000004', reason: 'Society deposit', account: 'bank', resource: 'esx_society' },
    { id: 106, ts: ts(4.0), direction: 'out', category: 'property', amount: 15000, player_name: 'Riley Chen', player_identifier: 'char1:demo00000006', reason: 'House Rent', account: 'bank', resource: 'housing' },
    { id: 107, ts: ts(5.5), direction: 'in', category: 'transfer', amount: 5000, player_name: 'Alex Morgan', player_identifier: 'char1:demo00000001', reason: 'Transfer received', account: 'bank', resource: 'banking' },
    { id: 108, ts: ts(6.2), direction: 'out', category: 'casino', amount: 2200, player_name: 'Jordan Lee', player_identifier: 'char1:demo00000002', reason: 'Casino', account: 'cash', resource: 'casino' },
    { id: 109, ts: ts(8.0), direction: 'in', category: 'sell', amount: 18500, player_name: 'Sam Rivera', player_identifier: 'char1:demo00000003', reason: 'Property Sale', account: 'bank', resource: 'realestate' },
    { id: 110, ts: ts(10.0), direction: 'out', category: 'weapon', amount: 4500, player_name: 'Casey Nguyen', player_identifier: 'char1:demo00000005', reason: 'Weapon Purchase', account: 'cash', resource: 'ammunation' },
    { id: 111, ts: ts(12.0), direction: 'in', category: 'admin', amount: 250000, player_name: 'Taylor Brooks', player_identifier: 'char1:demo00000004', reason: 'Government Grant', account: 'bank', resource: 'admin' },
    { id: 112, ts: ts(14.5), direction: 'out', category: 'drugs', amount: 7800, player_name: 'Riley Chen', player_identifier: 'char1:demo00000006', reason: 'Drug Sales', account: 'black_money', resource: 'drugs' },
    { id: 113, ts: ts(16.0), direction: 'in', category: 'banking', amount: 1200, player_name: 'Alex Morgan', player_identifier: 'char1:demo00000001', reason: 'Deposit', account: 'bank', resource: 'banking' },
    { id: 114, ts: ts(18.0), direction: 'out', category: 'purchase', amount: 640, player_name: 'Jordan Lee', player_identifier: 'char1:demo00000002', reason: 'Purchase: water', account: 'cash', resource: 'shop' },
    { id: 115, ts: ts(20.0), direction: 'in', category: 'job', amount: 8900, player_name: 'Casey Nguyen', player_identifier: 'char1:demo00000005', reason: 'Job Revenue', account: 'cash', resource: 'qb-jobs' },
  ];

  var ALERT_RULES = [
    { id: 'player_receive_over', label: 'High inflow', enabled: true, threshold: 500000, window_sec: 300, unit: 'money', type: 'player_receive_over' },
    { id: 'player_spend_over', label: 'High outflow', enabled: true, threshold: 250000, window_sec: 300, unit: 'money', type: 'player_spend_over' },
    { id: 'single_tx_over', label: 'Large single transaction', enabled: true, threshold: 100000, unit: 'money', type: 'single_tx_over' },
    { id: 'player_tx_rate', label: 'Transaction rate', enabled: true, threshold: 20, window_sec: 60, unit: 'count', type: 'player_tx_rate' },
    { id: 'server_created_over', label: 'Server money creation', enabled: false, threshold: 2000000, window_sec: 3600, unit: 'money', type: 'server_created_over' },
    { id: 'admin_money_over', label: 'Admin injection', enabled: true, threshold: 100000, unit: 'money', type: 'admin_money_over' },
  ];

  var state = {
    alerts: [
      { id: 1, ts: ts(1.5), rule_id: 'admin_money_over', message: 'Admin money movement above the limit', acked: false, player_name: 'Taylor Brooks', player_pk: 4, online: false },
      { id: 2, ts: ts(4.2), rule_id: 'player_receive_over', message: 'Player received above the configured limit', acked: false, player_name: 'Alex Morgan', player_pk: 1, online: true, server_id: 12 },
      { id: 3, ts: ts(8.0), rule_id: 'single_tx_over', message: 'Single transaction above the limit', acked: true, acked_at: ts(7.5), player_name: 'Sam Rivera', player_pk: 3, online: false },
      { id: 4, ts: ts(12.0), rule_id: 'player_spend_over', message: 'Player spent above the configured limit', acked: false, player_name: 'Riley Chen', player_pk: 6, online: false },
    ],
    rules: ALERT_RULES.map(function (r) { return Object.assign({}, r); }),
    settings: {
      locale: 'en',
      palette: 'amber',
      opacity: 92,
      blacklist: { rules: [] },
      notify: { discord_mentions: true, ingame_alerts: true },
    },
  };

  function playerByPk(pk) {
    pk = Number(pk);
    for (var i = 0; i < PLAYERS.length; i++) {
      if (PLAYERS[i].id === pk) return Object.assign({}, PLAYERS[i]);
    }
    return null;
  }

  function playerSummary(pk) {
    var base = 120000 + pk * 45000;
    return {
      received: base + 28000,
      spent: base - 12000,
      date_from: '2026-08-01',
      date_to: '2026-08-18',
    };
  }

  function balancesFor(pk) {
    var mul = Number(pk) || 1;
    return { cash: 4200 * mul, bank: 85000 * mul, black: 1200 * mul, available: true, online: !!(playerByPk(pk) && playerByPk(pk).online) };
  }

  function filterTimeline(payload) {
    payload = payload || {};
    var items = TIMELINE.slice();
    var q = String(payload.q || payload.query || '').trim().toLowerCase();
    var cat = payload.category;
    var minAmount = payload.min_amount ? Number(payload.min_amount) : null;

    if (q) {
      items = items.filter(function (row) {
        return (
          String(row.player_name || '').toLowerCase().indexOf(q) >= 0 ||
          String(row.reason || '').toLowerCase().indexOf(q) >= 0 ||
          String(row.resource || '').toLowerCase().indexOf(q) >= 0
        );
      });
    }
    if (cat) items = items.filter(function (row) { return row.category === cat; });
    if (minAmount != null && !isNaN(minAmount)) {
      items = items.filter(function (row) { return Number(row.amount) >= minAmount; });
    }

    var limit = Math.min(Number(payload.limit) || 25, 50);
    var page = Math.max(Number(payload.page) || 1, 1);
    var total = items.length;
    var pages = Math.max(1, Math.ceil(total / limit));
    if (page > pages) page = pages;
    var start = (page - 1) * limit;
    var slice = items.slice(start, start + limit);

    if (payload.player_pk) {
      var pk = Number(payload.player_pk);
      slice = TIMELINE.filter(function (row) {
        return row.player_identifier === (playerByPk(pk) || {}).identifier;
      }).slice(0, limit);
      total = slice.length;
      pages = 1;
      page = 1;
    }

    return { items: slice, page: page, limit: limit, total: total, pages: pages };
  }

  function searchPlayers(query) {
    var q = String(query || '').trim().toLowerCase();
    if (!q || (q.length < 2 && !/^\d+$/.test(q))) return { items: [] };
    if (/^\d+$/.test(q)) {
      var byId = PLAYERS.filter(function (p) { return String(p.server_id) === q || String(p.id) === q; });
      return { items: byId };
    }
    return {
      items: PLAYERS.filter(function (p) {
        return (
          p.name.toLowerCase().indexOf(q) >= 0 ||
          p.identifier.toLowerCase().indexOf(q) >= 0 ||
          p.license.toLowerCase().indexOf(q) >= 0
        );
      }),
    };
  }

  function overview() {
    return {
      health: {
        score: 84,
        status: 'healthy',
        delta: 2.4,
        message_key: 'health_msg_ok',
        message_params: {},
      },
      wealth: {
        total: 48200000,
        players: 28500000,
        societies: 8200000,
        property: 6500000,
        vehicle: 5000000,
      },
      heatmap: [
        { key: 'players', amount: 28500000, pct: 59 },
        { key: 'societies', amount: 8200000, pct: 17 },
        { key: 'property', amount: 6500000, pct: 14 },
        { key: 'vehicle', amount: 5000000, pct: 10 },
      ],
      money_flow: {
        sources: [
          { name: 'Job Revenue', volume: 1240000, pct: 28 },
          { name: 'Property Sales', volume: 980000, pct: 22 },
          { name: 'Salary Payment', volume: 720000, pct: 16 },
          { name: 'Society deposit', volume: 540000, pct: 12 },
        ],
        sinks: [
          { name: 'Vehicle Repair', volume: 680000, pct: 18 },
          { name: 'House Rent', volume: 520000, pct: 14 },
          { name: 'Shop', volume: 410000, pct: 11 },
          { name: 'Casino', volume: 380000, pct: 10 },
        ],
      },
      insights: [
        { key: 'insight_growth_up', params: { pct: 4.2 } },
        { key: 'insight_alerts_open', params: { count: 3 } },
        { key: 'insight_source_dominant', params: { name: 'Job Revenue', amount: '€1.2M', pct: 28 } },
        { key: 'insight_no_suspicious', params: {} },
      ],
      chart_24h: Array.from({ length: 24 }, function (_, i) {
        return {
          in_amount: 180000 + i * 12000 + (i % 3) * 8000,
          out_amount: 140000 + i * 9000 + (i % 4) * 6000,
        };
      }),
    };
  }

  function statistics() {
    var players = PLAYERS.map(function (p, i) {
      return {
        id: p.id,
        name: p.name,
        total: 420000 + i * 98000,
        cash: 4200 + i * 800,
        bank: 85000 + i * 22000,
        black: 1200 + i * 400,
        growth_30d: (i % 2 === 0 ? 1 : -1) * (12000 + i * 3500),
        growth_pct: (i % 2 === 0 ? 1 : -1) * (4.2 + i * 0.8),
      };
    });

    return {
      economic_insights: {
        top_source: { activity: 'Job Revenue', volume: 1240000, resource: 'qb-jobs', player_name: 'Casey Nguyen' },
        top_sink: { activity: 'Vehicle Repair', volume: 680000, resource: 'mechanic_job', player_name: 'Sam Rivera' },
        largest_tx: { amount: 250000, direction: 'in', activity: 'Government Grant', resource: 'admin', player_name: 'Taylor Brooks' },
      },
      richest_players: players,
      richest_societies: [
        { name: 'police', label: 'Police Department', key: 'police', total: 2400000, growth_30d: 120000, growth_pct: 5.2 },
        { name: 'ambulance', label: 'EMS', key: 'ambulance', total: 980000, growth_30d: -15000, growth_pct: -1.5 },
        { name: 'mechanic', label: 'Los Santos Customs', key: 'mechanic', total: 720000, growth_30d: 48000, growth_pct: 7.1 },
      ],
      richest_property: [
        { label: 'Vinewood Hills Apt.', owner_name: 'Sam Rivera', money: 380000, dirty: 40000, amount: 420000, storage_type: 'apartment' },
        { label: 'Mirror Park House', owner_name: 'Riley Chen', money: 165000, dirty: 20000, amount: 185000, storage_type: 'house' },
      ],
      richest_vehicles: [
        { plate: 'DEMO01', owner_name: 'Alex Morgan', money: 85000, dirty: 10000, amount: 95000, storage_type: 'trunk' },
        { plate: 'DEMO42', owner_name: 'Jordan Lee', money: 38000, dirty: 4000, amount: 42000, storage_type: 'glovebox' },
      ],
      money_flow: {
        date_from: '2026-08-18',
        date_to: '2026-08-18',
        sources: overview().money_flow.sources,
        sinks: overview().money_flow.sinks,
      },
      largest: {
        items: TIMELINE.slice(0, 8).map(function (row) {
          return {
            amount: row.amount,
            direction: row.direction,
            category: row.category,
            player_name: row.player_name,
            resource: row.resource,
            reason: row.reason,
            ts: row.ts,
          };
        }),
      },
      top_activities: [
        { activity: 'Job Revenue', volume: 1240000, count: 842 },
        { activity: 'Salary Payment', volume: 720000, count: 156 },
        { activity: 'Vehicle Repair', volume: 680000, count: 312 },
      ],
      top_resources: [
        { resource: 'qb-jobs', volume: 980000, count: 420 },
        { resource: 'esx_society', volume: 760000, count: 98 },
        { resource: 'ox_inventory', volume: 540000, count: 1204 },
      ],
    };
  }

  function handle(name, payload) {
    switch (name) {
      case 'overview':
        return overview();
      case 'statistics':
        return statistics();
      case 'timeline':
        return filterTimeline(payload);
      case 'search':
        return searchPlayers(payload && payload.query);
      case 'onlinePlayers':
        return {
          items: PLAYERS.filter(function (p) { return p.online; }),
          count: PLAYERS.filter(function (p) { return p.online; }).length,
        };
      case 'player': {
        var pk = payload && payload.player_pk;
        var player = playerByPk(pk);
        if (!player) return { player: null, summary: null, timeline: [], error: 'not_found' };
        var timeline = TIMELINE.filter(function (row) {
          return row.player_identifier === player.identifier;
        }).slice(0, 20);
        return {
          player: player,
          summary: playerSummary(pk),
          timeline: timeline,
          balances: balancesFor(pk),
        };
      }
      case 'playerSummary':
        return { ok: true, summary: playerSummary(payload && payload.player_pk) };
      case 'alerts':
        return { items: state.alerts.slice(), rules: state.rules.slice() };
      case 'ackAlert': {
        var id = Number(payload && payload.id);
        state.alerts.forEach(function (a) {
          if (a.id === id) {
            a.acked = true;
            a.acked_at = now;
          }
        });
        return { ok: true };
      }
      case 'saveAlertRules':
        if (payload && payload.rules) state.rules = payload.rules;
        return { ok: true };
      case 'getUiLocales':
        return {
          packs: window.EIDemoLocales || {},
          default: 'en',
          languages: ['en', 'pt'],
        };
      case 'getSettings':
        return state.settings;
      case 'saveNotifyPrefs':
        if (payload) {
          state.settings.notify = {
            discord_mentions: payload.discord_mentions !== false,
            ingame_alerts: payload.ingame_alerts !== false,
          };
        }
        return { ok: true };
      case 'addBlacklist': {
        var rules = state.settings.blacklist.rules || [];
        rules.push({
          id: rules.length + 1,
          kind: payload.kind || 'reason',
          value: payload.value || '',
          label: payload.label || payload.value || '',
          active: true,
        });
        state.settings.blacklist.rules = rules;
        return { ok: true, rules: rules };
      }
      case 'setBlacklistActive': {
        var rid = Number(payload && payload.id);
        (state.settings.blacklist.rules || []).forEach(function (r) {
          if (r.id === rid) r.active = !!payload.active;
        });
        return { ok: true };
      }
      default:
        return { ok: false, error: 'unknown_endpoint' };
    }
  }

  return { handle: handle, PLAYERS: PLAYERS };
})();
