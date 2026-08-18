window.EICharts = (function () {
  var lineChart = null;
  var donutCharts = {};

  function cssVar(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function renderLine(canvas, points) {
    if (!canvas) return;
    points = points || [];

    var labels = points.map(function (p) {
      var d = new Date((p.hour_ts || 0) * 1000);
      return d.getHours().toString().padStart(2, '0') + 'h';
    });
    var inData = points.map(function (p) { return p.in_amount || 0; });
    var outData = points.map(function (p) { return p.out_amount || 0; });

    var muted = cssVar('--ds-color-text-muted', '#9a9286');
    var secondary = cssVar('--ds-color-text-secondary', '#6e675c');
    var grid = isDark() ? 'rgba(250,247,240,0.06)' : 'rgba(45,42,36,0.06)';
    var outStroke = isDark() ? cssVar('--ds-color-text', '#faf7f0') : '#2d2d2d';

    if (typeof Chart === 'undefined' || !Chart) {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = muted;
      ctx.fillText('Chart.js indisponível — ' + points.length + ' pontos', 10, 20);
      return;
    }

    if (lineChart) {
      lineChart.destroy();
      lineChart = null;
    }

    lineChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Entradas',
            data: inData,
            borderColor: '#2fad6a',
            backgroundColor: 'rgba(47,173,106,0.12)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2.5,
          },
          {
            label: 'Saídas',
            data: outData,
            borderColor: outStroke,
            backgroundColor: isDark() ? 'rgba(250,247,240,0.06)' : 'rgba(45,45,45,0.06)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: secondary,
              usePointStyle: true,
              boxWidth: 8,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: muted, font: { size: 11 } },
            grid: { color: grid, drawBorder: false },
          },
          y: {
            ticks: { color: muted, font: { size: 11 } },
            grid: { color: grid, drawBorder: false },
          },
        },
      },
    });
  }

  /**
   * opts: { centerValue, centerLabel, cutout, spacing }
   */
  function renderDonut(canvas, segments, opts) {
    if (!canvas) return;
    opts = opts || {};
    var chartId = canvas.id || 'donut-default';
    segments = (segments || []).filter(function (s) {
      return (Number(s.chartAmount != null ? s.chartAmount : s.amount) || 0) > 0
        || (Number(s.pct) || 0) > 0;
    });

    var defaultColors = [
      '#5B8CFF',
      '#3DDC97',
      '#F472B6',
      '#F5C542',
      isDark() ? 'rgba(250,247,240,0.35)' : 'rgba(45,42,36,0.28)',
    ];

    if (typeof Chart === 'undefined' || !Chart) return;

    if (donutCharts[chartId]) {
      donutCharts[chartId].destroy();
      donutCharts[chartId] = null;
    }

    if (!segments.length) {
      segments = [{ label: '—', amount: 1, chartAmount: 1, pct: 100, color: isDark() ? 'rgba(250,247,240,0.12)' : 'rgba(45,42,36,0.08)' }];
    }

    var colors = segments.map(function (s, i) {
      return s.color || defaultColors[i % defaultColors.length];
    });
    var track = isDark() ? 'rgba(250,247,240,0.08)' : 'rgba(45,42,36,0.06)';
    var textMain = isDark() ? '#faf7f0' : '#1c1a16';
    var textMuted = cssVar('--ds-color-text-muted', '#9a9286');

    var centerPlugin = {
      id: 'eiDonutCenter_' + chartId,
      afterDraw: function (chart) {
        if (!opts.centerValue && !opts.centerLabel) return;
        var meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data || !meta.data[0]) return;
        var ctx = chart.ctx;
        var mid = meta.data[0];
        var x = mid.x;
        var y = mid.y;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (opts.centerValue) {
          ctx.fillStyle = textMain;
          ctx.font = "700 16px 'Plus Jakarta Sans', sans-serif";
          ctx.fillText(String(opts.centerValue), x, y - (opts.centerLabel ? 7 : 0));
        }
        if (opts.centerLabel) {
          ctx.fillStyle = textMuted;
          ctx.font = "600 9px 'Plus Jakarta Sans', sans-serif";
          ctx.fillText(String(opts.centerLabel).toUpperCase(), x, y + (opts.centerValue ? 10 : 0));
        }
        ctx.restore();
      },
    };

    donutCharts[chartId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: segments.map(function (s) { return s.label; }),
        datasets: [
          {
            data: segments.map(function (s) {
              return Math.max(0, Number(s.chartAmount != null ? s.chartAmount : s.amount) || Number(s.pct) || 0);
            }),
            backgroundColor: colors,
            borderColor: isDark() ? '#1a1814' : '#ffffff',
            borderWidth: opts.spacing != null ? opts.spacing : 3,
            hoverOffset: 3,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: opts.cutout || '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                var s = segments[ctx.dataIndex] || {};
                var val = s.display != null ? s.display : (s.pct != null ? s.pct + '%' : '');
                return ' ' + (s.label || '') + (val ? ' · ' + val : '');
              },
            },
          },
        },
      },
      plugins: [centerPlugin],
    });

    // subtle inner track ring via CSS sibling preferred; keep chart clean
    void track;
  }

  return { renderLine: renderLine, renderDonut: renderDonut };
})();
