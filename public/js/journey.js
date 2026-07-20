/* CarthaBot — scroll-driven road journey.
   The top-down robot rolls down a winding SVG track as you scroll: its position
   is a pure function of scroll progress (getPointAtLength), the wheel hubs spin
   with distance travelled, the 13 RGB LEDs glow, and each station lights up as
   the robot reaches it. Deterministic, GPU-only transforms, mobile + reduced
   motion aware — no jank, no scroll hijacking. */
(function () {
  'use strict';

  var track = document.getElementById('journeyTrack');
  if (!track) return;
  var svg   = document.getElementById('journeyRoad');
  var path  = document.getElementById('roadPath');
  var bot   = document.getElementById('roadBot');
  if (!svg || !path || !bot) return;

  var hubs   = bot.querySelectorAll('.rb-hub');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var VB_W = 100, VB_H = 1000;
  var len = path.getTotalLength();
  if (!len || !isFinite(len)) return;

  // ---- collect stations from the DOM ----
  var stations = Array.prototype.map.call(track.querySelectorAll('.station'), function (el) {
    var frac = parseFloat(el.getAttribute('data-frac'));
    var color = el.getAttribute('data-color') || '#E8232A';
    el.style.setProperty('--mc', color);          // so the active-card glow matches the station

    var marker = document.createElement('span');
    marker.className = 'st-marker';
    marker.style.setProperty('--mc', color);
    track.appendChild(marker);

    var connector = document.createElement('span');
    connector.className = 'st-connector';
    connector.style.setProperty('--mc', color);
    track.appendChild(connector);

    return { el: el, frac: isNaN(frac) ? 0 : frac, marker: marker, connector: connector, lit: null };
  });

  // cached geometry (refreshed on layout)
  var offx = 0, offy = 0, sw = 0, sh = 0;

  function pointPx(frac) {
    var p = path.getPointAtLength(Math.max(0, Math.min(1, frac)) * len);
    return { x: offx + p.x / VB_W * sw, y: offy + p.y / VB_H * sh };
  }

  // ---- place markers, cards and connectors on the exact path points ----
  function layout() {
    var sr = svg.getBoundingClientRect();
    var tr = track.getBoundingClientRect();
    offx = sr.left - tr.left;
    offy = sr.top - tr.top;
    sw = sr.width;
    sh = sr.height;

    stations.forEach(function (st) {
      var pt = pointPx(st.frac);
      st.marker.style.left = pt.x + 'px';
      st.marker.style.top  = pt.y + 'px';
      st.el.style.top      = pt.y + 'px';

      // connector runs horizontally from the path point to the card's inner edge
      var cr = st.el.getBoundingClientRect();
      var tr2 = track.getBoundingClientRect();
      var isRight = st.el.classList.contains('right');
      var innerX = isRight ? (cr.left - tr2.left) : (cr.right - tr2.left);
      var x1 = Math.min(pt.x, innerX), x2 = Math.max(pt.x, innerX);
      st.connector.style.left  = x1 + 'px';
      st.connector.style.width = Math.max(0, x2 - x1) + 'px';
      st.connector.style.top   = pt.y + 'px';
    });

    update();
  }

  // ---- per-frame: drive the robot from scroll progress ----
  var ledStation = null;
  stations.forEach(function (s) { if (Math.abs(s.frac - 0.5) < 0.06) ledStation = s; });

  function progress() {
    var vh = window.innerHeight;
    var r = track.getBoundingClientRect();
    var denom = r.height - vh * 0.72;
    if (denom <= 0) return 0;
    var p = (vh * 0.18 - r.top) / denom;
    return Math.max(0, Math.min(1, p));
  }

  function update() {
    var p = reduced ? 0.5 : progress();

    // robot position
    var L = p * len;
    var a = path.getPointAtLength(L);
    var ax = offx + a.x / VB_W * sw, ay = offy + a.y / VB_H * sh;

    // orient the robot along the road's direction of travel (centred tangent
    // in real pixels so it steers with the line like a real vehicle)
    var d = 7;
    var t1 = path.getPointAtLength(Math.max(0, L - d));
    var t2 = path.getPointAtLength(Math.min(len, L + d));
    var tx = (t2.x - t1.x) / VB_W * sw, ty = (t2.y - t1.y) / VB_H * sh;
    var ang = Math.atan2(ty, tx) * 180 / Math.PI;             // ~90 heading straight down
    var heading = Math.max(-34, Math.min(34, ang - 90));      // 0 = driving down the page
    bot.style.transform = 'translate(' + ax + 'px,' + ay + 'px) translate(-50%,-50%) rotate(' + heading + 'deg)';

    // (kept for the SVG-robot variant) spin any wheel hubs with distance travelled
    var turn = p * len * 4;
    for (var i = 0; i < hubs.length; i++) hubs[i].style.transform = 'rotate(' + turn + 'deg)';

    // light up stations already reached
    stations.forEach(function (st) {
      var on = p >= st.frac - 0.015;
      if (on === st.lit) return;
      st.lit = on;
      st.el.classList.toggle('is-active', on);
      st.marker.classList.toggle('is-lit', on);
      st.connector.classList.toggle('is-lit', on);
    });

    // extra LED shimmer while parked at the RGB-LED station
    if (ledStation) bot.classList.toggle('leds-hot', Math.abs(p - ledStation.frac) < 0.07);
  }

  // ---- reveal cards as they enter the viewport ----
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
    stations.forEach(function (st) { io.observe(st.el); });
  } else {
    stations.forEach(function (st) { st.el.classList.add('in'); });
  }

  // ---- wire up scroll / resize ----
  layout();

  if (reduced) {
    // static, fully-readable state — no continuous animation
    stations.forEach(function (st) { st.el.classList.add('in', 'is-active'); st.marker.classList.add('is-lit'); st.connector.classList.add('is-lit'); });
  } else {
    var raf = 0;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; update(); });
    }, { passive: true });

    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(layout, 120);
    });

    // fonts / images can shift the layout after first paint — re-measure once settled
    window.addEventListener('load', function () { setTimeout(layout, 60); });
  }
})();
