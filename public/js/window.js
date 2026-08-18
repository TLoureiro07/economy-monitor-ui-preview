/**
 * Draggable / resizable NUI panel (desktop-window style).
 */
window.EIWindow = (function () {
  var GEOM_KEY = 'ei-panel-geom';
  var MIN_W = 760;
  var MIN_H = 480;
  var PAD = 12;
  var DEFAULT_W = 1449;
  var DEFAULT_H = 831;

  var bound = false;
  var drag = null;
  var resize = null;

  function lsGet() {
    try {
      var raw = localStorage.getItem(GEOM_KEY);
      if (!raw) return null;
      var g = JSON.parse(raw);
      if (!g || typeof g !== 'object') return null;
      return g;
    } catch (e) {
      return null;
    }
  }

  function lsSet(g) {
    try {
      localStorage.setItem(GEOM_KEY, JSON.stringify(g));
    } catch (e) { /* ignore */ }
  }

  function shellEl() {
    return document.querySelector('.ei-shell');
  }

  function clampGeom(g) {
    var vw = window.innerWidth || 1280;
    var vh = window.innerHeight || 720;
    var w = Math.max(MIN_W, Math.min(vw - PAD * 2, Number(g.w) || defaultW()));
    var h = Math.max(MIN_H, Math.min(vh - PAD * 2, Number(g.h) || defaultH()));
    var x = Number(g.x);
    var y = Number(g.y);
    if (isNaN(x)) x = Math.round((vw - w) / 2);
    if (isNaN(y)) y = Math.round((vh - h) / 2);
    x = Math.max(PAD, Math.min(vw - w - PAD, x));
    y = Math.max(PAD, Math.min(vh - h - PAD, y));
    return { x: x, y: y, w: w, h: h };
  }

  function defaultW() {
    return Math.min(DEFAULT_W, Math.max(MIN_W, (window.innerWidth || 1280) - PAD * 2));
  }

  function defaultH() {
    return Math.min(DEFAULT_H, Math.max(MIN_H, (window.innerHeight || 720) - PAD * 2));
  }

  function defaultGeom() {
    var w = defaultW();
    var h = defaultH();
    return clampGeom({
      x: Math.round(((window.innerWidth || 1280) - w) / 2),
      y: Math.round(((window.innerHeight || 720) - h) / 2),
      w: w,
      h: h,
    });
  }

  function applyGeom(g) {
    var shell = shellEl();
    if (!shell) return;
    g = clampGeom(g || lsGet() || defaultGeom());
    shell.style.left = g.x + 'px';
    shell.style.top = g.y + 'px';
    shell.style.width = g.w + 'px';
    shell.style.height = g.h + 'px';
    shell.style.right = 'auto';
    shell.style.bottom = 'auto';
    shell.style.maxWidth = 'none';
    shell.style.maxHeight = 'none';
    shell.classList.add('ei-shell--windowed');
    lsSet(g);
    return g;
  }

  function readGeom() {
    var shell = shellEl();
    if (!shell) return defaultGeom();
    var rect = shell.getBoundingClientRect();
    return clampGeom({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
  }

  function reset() {
    try {
      localStorage.removeItem(GEOM_KEY);
    } catch (e) { /* ignore */ }
    return applyGeom(defaultGeom());
  }

  function ensureHandles(shell) {
    if (shell.querySelector('.ei-resize')) return;
    var dirs = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    dirs.forEach(function (d) {
      var h = document.createElement('div');
      h.className = 'ei-resize ei-resize--' + d;
      h.setAttribute('data-dir', d);
      h.setAttribute('aria-hidden', 'true');
      shell.appendChild(h);
    });
  }

  function isInteractive(el) {
    if (!el || !el.closest) return false;
    return !!el.closest('button, a, input, select, textarea, label, .ds-pill-nav, .ds-dropdown, .ds-datepicker, .ei-resize');
  }

  function onPointerDown(e) {
    var shell = shellEl();
    if (!shell || !shell.contains(e.target)) return;

    var handle = e.target.closest && e.target.closest('.ei-resize');
    if (handle) {
      e.preventDefault();
      var g = readGeom();
      resize = {
        dir: handle.getAttribute('data-dir'),
        sx: e.clientX,
        sy: e.clientY,
        ox: g.x,
        oy: g.y,
        ow: g.w,
        oh: g.h,
      };
      shell.classList.add('is-resizing');
      return;
    }

    var topnav = e.target.closest && e.target.closest('.ei-topnav');
    if (!topnav || isInteractive(e.target)) return;

    e.preventDefault();
    var g2 = readGeom();
    drag = {
      sx: e.clientX,
      sy: e.clientY,
      ox: g2.x,
      oy: g2.y,
    };
    shell.classList.add('is-dragging');
  }

  function onPointerMove(e) {
    if (drag) {
      applyGeom({
        x: drag.ox + (e.clientX - drag.sx),
        y: drag.oy + (e.clientY - drag.sy),
        w: readGeom().w,
        h: readGeom().h,
      });
      return;
    }
    if (!resize) return;

    var dx = e.clientX - resize.sx;
    var dy = e.clientY - resize.sy;
    var x = resize.ox;
    var y = resize.oy;
    var w = resize.ow;
    var h = resize.oh;
    var dir = resize.dir;

    if (dir.indexOf('e') >= 0) w = resize.ow + dx;
    if (dir.indexOf('s') >= 0) h = resize.oh + dy;
    if (dir.indexOf('w') >= 0) {
      w = resize.ow - dx;
      x = resize.ox + dx;
    }
    if (dir.indexOf('n') >= 0) {
      h = resize.oh - dy;
      y = resize.oy + dy;
    }

    // Keep opposite edge fixed when hitting min size
    if (w < MIN_W && dir.indexOf('w') >= 0) {
      x = resize.ox + resize.ow - MIN_W;
      w = MIN_W;
    }
    if (h < MIN_H && dir.indexOf('n') >= 0) {
      y = resize.oy + resize.oh - MIN_H;
      h = MIN_H;
    }

    applyGeom({ x: x, y: y, w: w, h: h });
  }

  function onPointerUp() {
    var shell = shellEl();
    if (drag || resize) {
      if (shell) {
        shell.classList.remove('is-dragging');
        shell.classList.remove('is-resizing');
      }
      applyGeom(readGeom());
    }
    drag = null;
    resize = null;
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
    window.addEventListener('resize', function () {
      applyGeom(lsGet() || readGeom());
    });
  }

  function init() {
    var shell = shellEl();
    if (!shell) return;
    ensureHandles(shell);
    bind();
    applyGeom(lsGet() || defaultGeom());
  }

  return {
    init: init,
    apply: applyGeom,
    reset: reset,
    read: readGeom,
  };
})();
