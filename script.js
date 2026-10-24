(function () {
  'use strict';
  var NA = 'non disponible sur ce navigateur';
  var out = document.getElementById('results');
  var scanBtn = document.getElementById('scan');
  var geoBtn = document.getElementById('geo');
  var copyBtn = document.getElementById('copy');
  var status = document.getElementById('status');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var groups = [];
  document.getElementById('year').textContent = new Date().getFullYear();

  function r(label, value, offText) {
    var off = value === null || value === undefined || value === '';
    return { l: label, v: off ? (offText || NA) : String(value), off: off };
  }
  function bytes(n) {
    if (typeof n !== 'number' || !isFinite(n)) return null;
    if (n >= 1073741824) return (n / 1073741824).toFixed(1) + ' Go';
    return Math.round(n / 1048576) + ' Mo';
  }
  function sleep(ms) { return new Promise(function (ok) { setTimeout(ok, reduce ? 0 : ms); }); }

  function browserName() {
    var ua = navigator.userAgent, m;
    var brands = navigator.userAgentData && navigator.userAgentData.brands;
    if (brands) {
      var real = brands.filter(function (b) { return !/not.?a.?brand/i.test(b.brand); });
      var pick = real.filter(function (b) { return b.brand !== 'Chromium'; })[0] || real[0];
      if (pick) return pick.brand + ' ' + pick.version;
    }
    if ((m = ua.match(/(?:Edg|EdgA|EdgiOS)\/([\d.]+)/))) return 'Edge ' + m[1].split('.')[0];
    if ((m = ua.match(/OPR\/([\d.]+)/))) return 'Opera ' + m[1].split('.')[0];
    if ((m = ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/))) return 'Firefox ' + m[1].split('.')[0];
    if ((m = ua.match(/(?:Chrome|CriOS)\/([\d.]+)/))) return 'Chrome ' + m[1].split('.')[0];
    if ((m = ua.match(/Version\/([\d.]+).*Safari/))) return 'Safari ' + m[1].split('.')[0];
    return null;
  }
  function osName() {
    var ua = navigator.userAgent, m;
    if ((m = ua.match(/Android ([\d.]+)/))) return 'Android ' + m[1];
    if (/Android/.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS / iPadOS';
    if (/Windows NT/.test(ua)) return 'Windows';
    if (/Mac OS X/.test(ua)) return 'macOS';
    if (/CrOS/.test(ua)) return 'ChromeOS';
    if (/Linux/.test(ua)) return 'Linux';
    return (navigator.userAgentData && navigator.userAgentData.platform) || null;
  }

  async function collect() {
    var nav = navigator, scr = screen, conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    var dark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    var tz = null, offset = null;
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    var o = -new Date().getTimezoneOffset();
    offset = 'UTC' + (o >= 0 ? '+' : '-') + Math.floor(Math.abs(o) / 60) + (o % 60 ? ':' + String(Math.abs(o) % 60).padStart(2, '0') : '');

    var model = null;
    if (nav.userAgentData && nav.userAgentData.getHighEntropyValues) {
      try { var h = await nav.userAgentData.getHighEntropyValues(['model']); model = h.model || null; } catch (e) {}
    }
    groups.push({ t: 'Appareil', i: '📱', rows: [
      r('Système', osName()),
      r('Modèle', model),
      r('Cœurs CPU (logiques)', nav.hardwareConcurrency),
      r('Mémoire (approx.)', nav.deviceMemory ? '≈ ' + nav.deviceMemory + ' Go' : null),
      r('Écran tactile', nav.maxTouchPoints > 0 ? 'Oui (' + nav.maxTouchPoints + ' points)' : 'Non')
    ]});
    groups.push({ t: 'Écran', i: '🖥️', rows: [
      r('Résolution', scr.width + ' × ' + scr.height),
      r('Densité de pixels', window.devicePixelRatio ? '×' + window.devicePixelRatio : null),
      r('Zone visible', window.innerWidth + ' × ' + window.innerHeight),
      r('Orientation', scr.orientation ? scr.orientation.type : null),
      r('Profondeur de couleur', scr.colorDepth ? scr.colorDepth + ' bits' : null),
      r('Thème préféré', dark ? 'Sombre' : 'Clair')
    ]});
    groups.push({ t: 'Navigateur', i: '🌐', rows: [
      r('Navigateur', browserName()),
      r('Langue', nav.language),
      r('Langues acceptées', (nav.languages || []).join(', ')),
      r('Cookies', nav.cookieEnabled ? 'Activés' : 'Désactivés'),
      r('Fuseau horaire', tz ? tz + ' (' + offset + ')' : offset)
    ]});

    var ip = await getIP();
    groups.push({ t: 'Réseau', i: '📶', rows: [
      r('État', nav.onLine ? 'En ligne' : 'Hors ligne'),
      r('Type de connexion', conn && conn.type),
      r('Qualité estimée', conn && conn.effectiveType),
      r('Débit estimé', conn && conn.downlink ? conn.downlink + ' Mbit/s' : null),
      r('Latence estimée', conn && conn.rtt !== undefined ? conn.rtt + ' ms' : null),
      r('Économiseur de données', conn && conn.saveData !== undefined ? (conn.saveData ? 'Activé' : 'Désactivé') : null),
      r('IP publique', ip, 'indisponible (hors ligne ou service bloqué)')
    ]});

    var bat = [r('Batterie', null)];
    if (nav.getBattery) {
      try {
        var b = await nav.getBattery();
        bat = [r('Niveau', Math.round(b.level * 100) + ' %'), r('En charge', b.charging ? 'Oui' : 'Non')];
      } catch (e) {}
    }
    groups.push({ t: 'Batterie', i: '🔋', rows: bat });

    var sto = [r('Stockage du navigateur', null)];
    if (nav.storage && nav.storage.estimate) {
      try {
        var e = await nav.storage.estimate();
        sto = [r('Quota du navigateur', bytes(e.quota)), r('Utilisé par ce site', bytes(e.usage))];
      } catch (er) {}
    }
    groups.push({ t: 'Stockage', i: '💾', rows: sto, hint: 'Quota alloué au navigateur, pas l’espace libre total de l’appareil.' });
  }

  async function getIP() {
    var ctl = new AbortController();
    var t = setTimeout(function () { ctl.abort(); }, 6000);
    try {
      var res = await fetch('https://api.ipify.org?format=json', { signal: ctl.signal });
      var d = await res.json();
      return d.ip;
    } catch (e) { return null; } finally { clearTimeout(t); }
  }

  function render(g) {
    var card = document.createElement('article'); card.className = 'card';
    var h = document.createElement('h2'); h.textContent = g.i + ' ' + g.t; card.appendChild(h);
    var dl = document.createElement('dl');
    g.rows.forEach(function (row) {
      var d = document.createElement('div'); d.className = 'r';
      var dt = document.createElement('dt'); dt.textContent = row.l;
      var dd = document.createElement('dd'); dd.textContent = row.v; if (row.off) dd.className = 'off';
      d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
    });
    card.appendChild(dl);
    if (g.hint) { var p = document.createElement('small'); p.style.color = 'var(--muted)'; p.textContent = g.hint; card.appendChild(p); }
    out.appendChild(card);
  }

  async function scan() {
    scanBtn.disabled = true; geoBtn.hidden = true; copyBtn.hidden = true;
    out.innerHTML = ''; groups = [];
    status.textContent = '> scan en cours…';
    await collect();
    for (var i = 0; i < groups.length; i++) { render(groups[i]); status.textContent = '> ' + groups[i].t.toLowerCase() + ' ✓'; await sleep(250); }
    var n = groups.reduce(function (s, g) { return s + g.rows.filter(function (x) { return !x.off; }).length; }, 0);
    status.textContent = '> scan terminé : ' + n + ' infos trouvées';
    scanBtn.textContent = '↻ Relancer le scan'; scanBtn.disabled = false;
    geoBtn.hidden = false; copyBtn.hidden = false;
  }

  function locate() {
    if (!navigator.geolocation) { status.textContent = '> position : ' + NA; return; }
    geoBtn.disabled = true; status.textContent = '> position : en attente de ton autorisation…';
    navigator.geolocation.getCurrentPosition(function (p) {
      var g = { t: 'Position', i: '📍', rows: [
        r('Latitude', p.coords.latitude.toFixed(3)), r('Longitude', p.coords.longitude.toFixed(3)),
        r('Précision', '≈ ' + Math.round(p.coords.accuracy) + ' m')
      ]};
      groups.push(g); render(g); status.textContent = '> position ajoutée'; geoBtn.hidden = true;
    }, function () {
      status.textContent = '> position refusée ou indisponible'; geoBtn.disabled = false;
    }, { timeout: 10000 });
  }

  function copyReport() {
    var txt = 'AllInfo — rapport\n' + groups.map(function (g) {
      return '\n[' + g.t + ']\n' + g.rows.map(function (x) { return x.l + ' : ' + x.v; }).join('\n');
    }).join('\n');
    function done() { copyBtn.textContent = '✓ Copié'; setTimeout(function () { copyBtn.textContent = '⧉ Copier le rapport'; }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, function () { status.textContent = '> copie impossible ici'; });
    } else {
      var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { status.textContent = '> copie impossible ici'; }
      document.body.removeChild(ta);
    }
  }

  scanBtn.addEventListener('click', scan);
  geoBtn.addEventListener('click', locate);
  copyBtn.addEventListener('click', copyReport);
})();
