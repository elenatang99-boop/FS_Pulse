/* FS Pulse app logic. Reads window.FSPULSE (js/data.js). No frameworks, no build step. */
(function () {
  'use strict';
  var D = window.FSPULSE;
  var KEY = 'fspulse.decisions';
  var app = document.getElementById('app');
  var COUNTRIES = Object.keys(D.countries);
  var AREA = {}, LINE = {}, ACT = {};
  D.areas.forEach(function (a) { AREA[a.key] = a; });
  D.lines.forEach(function (l) { LINE[l.key] = l; });
  D.actions.forEach(function (a) { ACT[a.key] = a; });
  var EDS = D.editions.slice().sort(function (a, b) { return a.end < b.end ? 1 : -1; }); // newest first
  var LATEST = EDS[0];
  var BANDS = { high: 'High', medium: 'Medium', low: 'Low' };

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function edByNum(n) { return EDS.filter(function (e) { return e.number === n; })[0]; }
  function score(it) { return it.impact * it.urgency; }
  function band(it) { var s = score(it); return s >= 6 ? 'high' : s >= 3 ? 'medium' : 'low'; }
  function d0(iso) { return new Date(iso + 'T00:00:00'); }
  function fmtD(iso) { return d0(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function fmtShort(iso) { return d0(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
  function fmtRange(ed) { return fmtShort(ed.start) + ' \u2013 ' + fmtD(ed.end); }
  function cmpPriority(a, b) {
    return (score(b) - score(a)) || (b.impact - a.impact) || (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
  }
  function sortItems(arr, mode) {
    var out = arr.slice();
    if (mode === 'date') out.sort(function (a, b) { return (a.date < b.date ? 1 : a.date > b.date ? -1 : 0) || cmpPriority(a, b); });
    else if (mode === 'country') out.sort(function (a, b) { return (COUNTRIES.indexOf(a.country) - COUNTRIES.indexOf(b.country)) || cmpPriority(a, b); });
    else out.sort(cmpPriority);
    return out;
  }

  /* ---------- saved decisions (browser only) ---------- */
  var decisions = {};
  try { decisions = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { decisions = {}; }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(decisions)); } catch (e) { /* storage unavailable: keep in memory */ } }
  function getDec(id) { return decisions[id] || {}; }
  function setDec(id, patch) { decisions[id] = Object.assign({}, decisions[id], patch); persist(); }
  function decAction(it) { return getDec(it.id).action || ''; }
  function ownerOf(it) { return getDec(it.id).owner || it.owner; }
  function undecidedTotal() { return D.items.filter(function (it) { return !decAction(it); }).length; }
  function updateNav(page) {
    document.getElementById('undecidedCount').textContent = undecidedTotal();
    Array.prototype.forEach.call(document.querySelectorAll('.nav a'), function (a) {
      a.classList.toggle('active', a.getAttribute('data-page') === page);
    });
  }

  /* ---------- filter state ---------- */
  var currentEd = LATEST.number;
  function freshF() { return { country: [], area: [], priority: [], line: [], status: [], q: '', scope: 'edition', sort: 'priority' }; }
  var F = freshF();
  var GROUPS = ['country', 'area', 'priority', 'line', 'status'];

  function hasVal(it, g, v) {
    switch (g) {
      case 'country': return it.country === v;
      case 'area': return it.primary === v || it.secondary === v;
      case 'priority': return band(it) === v;
      case 'line': return it.lines.indexOf(v) > -1;
      case 'status': return (decAction(it) || 'undecided') === v;
    }
    return false;
  }
  function matchGroup(it, g) {
    var sel = F[g];
    if (!sel.length) return true;
    return sel.some(function (v) { return hasVal(it, g, v); }); // any tag matches
  }
  function matchQ(it) {
    if (!F.q) return true;
    var hay = [it.title, it.summary, it.why, it.country, D.countries[it.country].name, AREA[it.primary].label,
      it.secondary ? AREA[it.secondary].label : '',
      it.lines.map(function (l) { return LINE[l].label; }).join(' '),
      it.sources.map(function (s) { return s.name; }).join(' ')].join(' ').toLowerCase();
    return F.q.toLowerCase().split(/\s+/).every(function (t) { return !t || hay.indexOf(t) > -1; });
  }
  function scopeItems() {
    return D.items.filter(function (it) { return F.scope === 'all' || it.edition === currentEd; });
  }
  function filtered(skip) {
    skip = skip || [];
    return scopeItems().filter(function (it) {
      return GROUPS.every(function (g) { return skip.indexOf(g) > -1 || matchGroup(it, g); }) && matchQ(it);
    });
  }
  function anyFilter() {
    return GROUPS.some(function (g) { return F[g].length; }) || !!F.q;
  }
  function resetFilters() { var s = F.scope, o = F.sort; F = freshF(); F.scope = s; F.sort = o; }

  /* ---------- Briefing page ---------- */
  function tagsHTML(it, showEd) {
    var c = D.countries[it.country];
    var h = '<span class="tag country-' + it.country + '" title="' + esc(c.name) + '">' + it.country + '</span>';
    if (showEd) h += '<span class="tag area">Ed ' + it.edition + '</span>';
    h += '<span class="tag area">' + esc(AREA[it.primary].label) + '</span>';
    if (it.secondary) h += '<span class="tag area secondary" title="Secondary area">' + esc(AREA[it.secondary].label) + '</span>';
    return h;
  }
  function badgeHTML(it) {
    var b = band(it);
    return '<span class="badge ' + b + '" title="Impact ' + it.impact + ' x Urgency ' + it.urgency + '">' + BANDS[b] + ' \u00b7 ' + score(it) + '</span>';
  }
  function actionPanelHTML(it) {
    var d = getDec(it.id), sel = d.action || '', own = ownerOf(it);
    var btns = D.actions.map(function (a) {
      return '<button type="button" class="abtn' + (sel === a.key ? ' selected' : '') + '" data-act="' + a.key + '" aria-pressed="' + (sel === a.key) +
        '" title="' + esc(a.def) + '">' + esc(a.label) + (it.action === a.key ? '<span class="sug">suggested</span>' : '') + '</button>';
    }).join('');
    var owners = D.owners.map(function (o) { return '<option' + (o === own ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('');
    return '<div class="action-panel" data-id="' + it.id + '"><h4>Proposed action</h4><div class="abtns">' + btns + '</div>' +
      '<div class="afields"><select class="f-owner" aria-label="Owner">' + owners + '</select>' +
      '<input type="date" class="f-due" aria-label="Due date" value="' + esc(d.due || '') + '">' +
      '<input type="text" class="f-note" aria-label="Note" placeholder="Note: what will we do?" value="' + esc(d.note || '') + '">' +
      '<span class="saved" aria-live="polite">Saved</span></div></div>';
  }
  function addrBadgeHTML(it) {
    var a = decAction(it);
    return '<span class="addr-badge' + (a ? ' ' + esc(a) : '') + '">' +
      (a && ACT[a] ? '\u2713 Addressed <small>\u00b7 ' + esc(ACT[a].label) + '</small>' : '') + '</span>';
  }
  function paintAddressed(id) {
    var card = document.getElementById('card-' + id), it = itemById(id);
    if (!card || !it) return;
    var a = decAction(it), badge = card.querySelector('.addr-badge');
    Object.keys(ACT).forEach(function (k) { card.classList.remove('a-' + k); });
    card.classList.toggle('addressed', !!a);
    if (a) card.classList.add('a-' + a);
    if (badge) {
      badge.className = 'addr-badge' + (a ? ' ' + a : '');
      badge.innerHTML = a && ACT[a] ? '\u2713 Addressed <small>\u00b7 ' + esc(ACT[a].label) + '</small>' : '';
    }
  }
  function cardHTML(it, showEd) {
    var lines = it.lines.map(function (l) { return '<span class="tag line">' + esc(LINE[l].label) + '</span>'; }).join('');
    var src = it.sources.map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.name) + ' \u2197</a>'; }).join('');
    return '<article class="card p-' + band(it) + (decAction(it) ? ' addressed a-' + decAction(it) : '') + '" id="card-' + it.id + '">' + addrBadgeHTML(it) +
      '<div class="meta">' + tagsHTML(it, showEd) + badgeHTML(it) + '<span class="date">' + fmtD(it.date) + '</span></div>' +
      '<h3>' + esc(it.title) + '</h3><p class="summary">' + esc(it.summary) + '</p>' +
      '<div class="why"><strong>Why it matters to us</strong>' + esc(it.why) + '</div>' +
      '<div class="lines">' + lines + '</div><div class="sources">Sources: ' + src + '</div>' + actionPanelHTML(it) + '</article>';
  }

  function renderEdHead() {
    var ed = edByNum(currentEd), i = EDS.indexOf(ed);
    var older = EDS[i + 1], newer = EDS[i - 1];
    var items = D.items.filter(function (it) { return it.edition === ed.number; });
    var high = items.filter(function (it) { return band(it) === 'high'; }).length;
    var wait = items.filter(function (it) { return !decAction(it); }).length;
    var opts = EDS.map(function (e) {
      return '<option value="' + e.number + '"' + (e.number === ed.number ? ' selected' : '') + '>Edition ' + e.number + ' \u00b7 ' + esc(fmtRange(e)) + (e === LATEST ? ' (latest)' : '') + '</option>';
    }).join('');
    var rates = COUNTRIES.map(function (c) {
      var r = ed.rates[c];
      return '<div class="tile country-' + c + '"><div class="label">' + c + ' \u00b7 ' + esc(D.countries[c].rateLabel) + '</div><div class="value">' + esc(r.value) + '</div><div class="note">' + esc(r.note) + '</div></div>';
    }).join('');
    document.getElementById('edHead').innerHTML =
      '<div class="edition-head"><div class="edition-top"><h1 class="edition-title">Edition ' + ed.number + ' \u00b7 ' + esc(fmtRange(ed)) +
      (ed === LATEST ? '<span class="latest">LATEST</span>' : '') + '</h1>' +
      '<div class="nav-controls"><button class="btn" data-ed="' + (older ? older.number : '') + '"' + (older ? '' : ' disabled') + '>\u2190 Older</button>' +
      '<select id="edSelect" aria-label="Choose edition">' + opts + '</select>' +
      '<button class="btn" data-ed="' + (newer ? newer.number : '') + '"' + (newer ? '' : ' disabled') + '>Newer \u2192</button></div></div>' +
      '<p class="inbrief"><strong>In brief:</strong> ' + esc(ed.inBrief) + '</p><p class="pub" style="color:#6a6f7a;font-size:13px;margin:4px 0 0">Published ' + fmtD(ed.published) + '</p>' +
      '<div class="tiles">' + rates + '<div class="tile edition-tile"><div class="label">This edition</div><div class="value">' + items.length + ' items</div><div class="note">' + high + ' high priority \u00b7 ' + wait + ' awaiting action</div></div></div></div>';
  }
  function renderTop3() {
    var items = D.items.filter(function (it) { return it.edition === currentEd; }).sort(cmpPriority).slice(0, 3);
    document.getElementById('top3').innerHTML = '<div class="top3"><h2>Top 3 for leadership this fortnight</h2><div class="top3-row">' +
      items.map(function (it, i) {
        return '<button type="button" class="top3-item p-' + band(it) + '" data-jump="' + it.id + '"><div class="rank">#' + (i + 1) + '</div>' +
          '<div class="meta">' + '<span class="tag country-' + it.country + '">' + it.country + '</span>' + badgeHTML(it) + '</div><div class="t">' + esc(it.title) + '</div></button>';
      }).join('') + '</div></div>';
  }
  function chipHTML(g, v, label, n) {
    var on = F[g].indexOf(v) > -1;
    return '<button type="button" class="chip' + (on ? ' active' : '') + (n === 0 && !on ? ' zero' : '') + '" data-chip data-g="' + g + '" data-v="' + v + '" aria-pressed="' + on + '">' + esc(label) + '<span class="n">' + n + '</span></button>';
  }
  function countFor(g, v) { return filtered([g]).filter(function (it) { return hasVal(it, g, v); }).length; }
  function heatHTML() {
    var base = filtered(['country', 'area']);
    var h = '<table class="heat"><thead><tr><th></th>' + COUNTRIES.map(function (c) { return '<th style="color:' + D.countries[c].colour + '">' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    D.areas.forEach(function (a) {
      h += '<tr><th class="rowh" scope="row">' + esc(a.label) + '</th>';
      COUNTRIES.forEach(function (c) {
        var n = base.filter(function (it) { return it.country === c && (it.primary === a.key || it.secondary === a.key); }).length;
        var sel = F.country.length === 1 && F.country[0] === c && F.area.length === 1 && F.area[0] === a.key;
        h += '<td><button type="button" class="h' + Math.min(n, 3) + (sel ? ' sel' : '') + '" data-heat data-c="' + c + '" data-a="' + a.key + '" aria-label="' + esc(a.label) + ', ' + c + ': ' + n + ' items">' + n + '</button></td>';
      });
      h += '</tr>';
    });
    return h + '</tbody></table>';
  }
  function renderFilterDyn() {
    var el = document.getElementById('filterDyn');
    if (!el) return;
    var h = '<h3>Country</h3><div class="chips">' + COUNTRIES.map(function (c) { return chipHTML('country', c, c + ' \u00b7 ' + D.countries[c].name, countFor('country', c)); }).join('') + '</div>' +
      '<h3>Area of interest</h3><div class="chips">' + D.areas.map(function (a) { return chipHTML('area', a.key, a.label, countFor('area', a.key)); }).join('') + '</div>' +
      '<h3>Priority</h3><div class="chips">' + ['high', 'medium', 'low'].map(function (b) { return chipHTML('priority', b, BANDS[b], countFor('priority', b)); }).join('') + '</div>' +
      '<h3>Business line</h3><div class="chips">' + D.lines.map(function (l) { return chipHTML('line', l.key, l.label, countFor('line', l.key)); }).join('') + '</div>' +
      '<h3>Action status</h3><div class="chips">' + chipHTML('status', 'undecided', 'Undecided', countFor('status', 'undecided')) +
      D.actions.map(function (a) { return chipHTML('status', a.key, a.label, countFor('status', a.key)); }).join('') + '</div>' +
      '<h3>Country \u00d7 area heatmap</h3>' + heatHTML() +
      '<button type="button" class="clear" data-clear>Clear all filters</button>';
    el.innerHTML = h;
  }
  function renderFeed() {
    var el = document.getElementById('feed');
    if (!el) return;
    var ed = edByNum(currentEd);
    var items = sortItems(filtered(), F.sort);
    var total = scopeItems().length;
    var h = '<div class="feed-head"><div class="showing">Showing ' + items.length + ' of ' + total + ' items' + (F.scope === 'all' ? ' (all editions)' : '') + '</div></div>';
    if (F.scope === 'edition') {
      (ed.nil || []).forEach(function (c) {
        if (!F.country.length || F.country.indexOf(c) > -1) {
          h += '<div class="nil-note"><strong>Nil return \u00b7 ' + c + ':</strong> no material developments for ' + esc(D.countries[c].name) + ', ' + esc(fmtRange(ed)) + '. ' + esc(ed.nilNote || '') + '</div>';
        }
      });
    }
    if (!items.length) {
      h += '<div class="empty"><h3>Nothing matches these filters</h3><p>Try removing a filter or searching for a different word.</p><button type="button" class="btn primary" data-clear>Clear all filters</button></div>';
    } else {
      h += items.map(function (it) { return cardHTML(it, F.scope === 'all'); }).join('');
    }
    el.innerHTML = h;
  }
  function refreshBriefingParts() { renderFilterDyn(); renderFeed(); }

  function renderBriefing(itemId) {
    var ed = edByNum(currentEd);
    document.title = 'Edition ' + ed.number + ' | FS Pulse';
    app.innerHTML = '<div id="edHead"></div><div id="top3"></div><div class="layout"><aside class="filters" id="filters" aria-label="Filters">' +
      '<h3>Search</h3><input type="search" id="q" placeholder="Search headlines and summaries" value="' + esc(F.q) + '">' +
      '<h3>Scope</h3><div class="chips" id="scopeChips"></div>' +
      '<div class="sortrow"><label for="sortSel">Sort by</label><select id="sortSel"><option value="priority">Priority</option><option value="date">Date</option><option value="country">Country</option></select></div>' +
      '<div id="filterDyn"></div></aside><section id="feed" aria-live="polite"></section></div>';
    renderScopeChips();
    document.getElementById('sortSel').value = F.sort;
    renderEdHead(); renderTop3(); refreshBriefingParts();
    if (itemId) { jumpTo(itemId); }
  }
  function renderScopeChips() {
    var el = document.getElementById('scopeChips');
    if (!el) return;
    el.innerHTML = [['edition', 'This edition'], ['all', 'All editions']].map(function (s) {
      return '<button type="button" class="chip' + (F.scope === s[0] ? ' active' : '') + '" data-scope="' + s[0] + '">' + s[1] + '</button>';
    }).join('');
  }
  function jumpTo(id) {
    var it = D.items.filter(function (x) { return x.id === id; })[0];
    if (!it) return;
    var el = document.getElementById('card-' + id);
    if (!el) {
      if (it.edition !== currentEd) { currentEd = it.edition; }
      resetFilters(); F.scope = 'edition';
      if (document.getElementById('edHead')) { renderEdHead(); renderTop3(); renderScopeChips(); refreshBriefingParts(); }
      el = document.getElementById('card-' + id);
    }
    if (!el) return;
    setTimeout(function () {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
      setTimeout(function () { el.classList.remove('flash'); }, 2200);
    }, 50);
  }

  /* ---------- Archive page ---------- */
  function renderArchive() {
    document.title = 'Archive | FS Pulse';
    var h = '<h1>Archive</h1><p style="color:#6a6f7a">All fortnightly editions, newest first. Select one to open it.</p><div class="archive-grid">';
    EDS.forEach(function (ed) {
      var items = D.items.filter(function (it) { return it.edition === ed.number; });
      var high = items.filter(function (it) { return band(it) === 'high'; }).length;
      var decided = items.filter(function (it) { return decAction(it); }).length;
      var counts = COUNTRIES.map(function (c) { return items.filter(function (it) { return it.country === c; }).length; });
      var bar = COUNTRIES.map(function (c, i) { return counts[i] ? '<span class="' + c + '" style="flex:' + counts[i] + '" title="' + c + ': ' + counts[i] + '"></span>' : ''; }).join('');
      var stats = COUNTRIES.map(function (c, i) {
        return (ed.nil || []).indexOf(c) > -1 ? c + ' nil return' : c + ' ' + counts[i];
      }).join(' \u00b7 ');
      h += '<button type="button" class="ed-card" data-open-ed="' + ed.number + '"><div class="pub">Published ' + fmtD(ed.published) + (ed === LATEST ? ' <span class="latest">LATEST</span>' : '') + '</div>' +
        '<h3>Edition ' + ed.number + ' \u00b7 ' + esc(fmtRange(ed)) + '</h3><p>' + esc(ed.inBrief) + '</p>' +
        '<div class="mixbar" aria-label="Country mix">' + bar + '</div><div class="ed-stats"><span>' + esc(stats) + '</span></div>' +
        '<div class="ed-stats" style="margin-top:6px"><span><strong>' + items.length + '</strong> items</span><span><strong>' + high + '</strong> high priority</span><span><strong>' + decided + ' of ' + items.length + '</strong> decided</span></div></button>';
    });
    app.innerHTML = h + '</div>';
  }

  /* ---------- Action tracker ---------- */
  var T = { ed: 'all', country: 'all', status: '' };
  function trackerBase() {
    return D.items.filter(function (it) {
      return (T.ed === 'all' || String(it.edition) === String(T.ed)) && (T.country === 'all' || it.country === T.country);
    });
  }
  function trackerRows() {
    var rows = trackerBase().filter(function (it) { return !T.status || (decAction(it) || 'undecided') === T.status; });
    return sortItems(rows, 'priority');
  }
  function renderTracker() {
    document.title = 'Action tracker | FS Pulse';
    var base = trackerBase(), rows = trackerRows();
    function cnt(k) { return base.filter(function (it) { return (decAction(it) || 'undecided') === k; }).length; }
    var edOpts = '<option value="all">All editions</option>' + EDS.map(function (e) { return '<option value="' + e.number + '"' + (String(T.ed) === String(e.number) ? ' selected' : '') + '>Edition ' + e.number + '</option>'; }).join('');
    var cOpts = '<option value="all">All countries</option>' + COUNTRIES.map(function (c) { return '<option value="' + c + '"' + (T.country === c ? ' selected' : '') + '>' + esc(D.countries[c].name) + '</option>'; }).join('');
    var tiles = D.actions.concat([{ key: 'undecided', label: 'Not yet decided' }]).map(function (a) {
      return '<button type="button" class="tile' + (T.status === a.key ? ' on' : '') + '" data-tstatus="' + a.key + '"><div class="label">' + esc(a.label) + '</div><div class="value">' + cnt(a.key) + '</div><div class="note">' + (T.status === a.key ? 'Click to clear filter' : 'Click to filter') + '</div></button>';
    }).join('');
    var body = rows.map(function (it) {
      var d = getDec(it.id);
      return '<tr><td><a href="#/briefing/' + it.edition + '/' + it.id + '">' + esc(it.title) + '</a><div style="font-size:12px;color:#6a6f7a">Ed ' + it.edition + ' \u00b7 ' + fmtD(it.date) + '</div></td>' +
        '<td><span class="tag country-' + it.country + '">' + it.country + '</span></td><td>' + badgeHTML(it) + '</td><td>' + esc(ACT[it.action].label) + '</td>' +
        '<td class="dec' + (d.action ? '' : ' undecided') + '">' + (d.action ? esc(ACT[d.action].label) : 'Not yet decided') + '</td>' +
        '<td>' + esc(ownerOf(it)) + '</td><td>' + (d.due ? fmtD(d.due) : '\u2013') + '</td><td>' + esc(d.note || '') + '</td></tr>';
    }).join('');
    app.innerHTML = '<h1>Action tracker</h1><p style="color:#6a6f7a">Every development with its suggested and recorded action. Decisions are made on the briefing cards and saved in this browser.</p>' +
      '<div class="toolbar"><label>Edition <select id="tEd">' + edOpts + '</select></label><label>Country <select id="tCountry">' + cOpts + '</select></label><span class="spacer"></span>' +
      '<button type="button" class="btn" data-accept>Accept suggestions for undecided</button><button type="button" class="btn primary" data-export>Export CSV</button></div>' +
      '<div class="tiles five">' + tiles + '</div><p style="margin:10px 0 6px;font-weight:600">' + rows.length + ' of ' + base.length + ' developments</p>' +
      '<div class="table-wrap"><table class="tracker"><thead><tr><th>Development</th><th>Country</th><th>Priority</th><th>Suggested</th><th>Decision</th><th>Owner</th><th>Due</th><th>Note</th></tr></thead><tbody>' +
      (body || '<tr><td colspan="8" style="text-align:center;color:#6a6f7a;padding:24px">No developments match this view.</td></tr>') + '</tbody></table></div>';
    document.getElementById('tEd').value = String(T.ed);
  }
  function acceptSuggestions() {
    var todo = trackerRows().filter(function (it) { return !decAction(it); });
    if (!todo.length) { window.alert('There are no undecided items in the current view.'); return; }
    if (!window.confirm('Record the suggested action and default owner for ' + todo.length + ' undecided item(s) in the current view? You can change any of them afterwards.')) return;
    todo.forEach(function (it) { setDec(it.id, { action: it.action, owner: ownerOf(it) }); });
    updateNav('tracker'); renderTracker();
  }
  function csvCell(v) {
    v = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
    return '"' + v.replace(/"/g, '""') + '"';
  }
  function exportCSV() {
    var head = ['Edition', 'Date', 'Country', 'Title', 'Primary area', 'Secondary area', 'Business lines', 'Impact', 'Urgency', 'Score', 'Priority',
      'Suggested action', 'Decision', 'Owner', 'Due date', 'Note', 'Sources'];
    var lines = [head.map(csvCell).join(',')];
    trackerRows().forEach(function (it) {
      var d = getDec(it.id);
      lines.push([it.edition, it.date, it.country, it.title, AREA[it.primary].label, it.secondary ? AREA[it.secondary].label : '',
        it.lines.map(function (l) { return LINE[l].label; }).join('; '), it.impact, it.urgency, score(it), BANDS[band(it)],
        ACT[it.action].label, d.action ? ACT[d.action].label : 'Not yet decided', ownerOf(it), d.due || '', d.note || '',
        it.sources.map(function (s) { return s.url; }).join(' | ')].map(csvCell).join(','));
    });
    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fs-pulse-actions-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 500);
  }

  /* ---------- How it works ---------- */
  var DRIVERS = [
    ['Licence to operate', 'Could this change who may lend, how, or at what compliance cost?', 'New or amended rules, licence grants, onboarding, disclosure, AML and conduct requirements, enforcement'],
    ['Cost and availability of funding', 'Does this change what we pay for money, or whether we can raise it?', 'Policy-rate moves, benchmark rates, bank liquidity, sukuk, bond and ABS issuance, ratings, FX availability, capital rules'],
    ['Demand and customer behaviour', 'Does this change how much customers want to borrow, or how they borrow?', 'Consumer spending, retail credit growth, inflation, wages, shifts in payment or shopping habits'],
    ['Competitive position', 'Does this change who we compete with, or on what terms?', 'Funding rounds, new licensees, product launches, partnerships, pricing moves, market entry or exit'],
    ['Credit quality', 'Does this change expected losses or underwriting?', 'NPL trends, credit-bureau rules, affordability and scoring rules, fraud patterns, credit-growth caps']
  ];
  function renderHow() {
    document.title = 'How it works | FS Pulse';
    var drv = DRIVERS.map(function (r) { return '<tr><td><strong>' + r[0] + '</strong></td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('');
    var areas = D.areas.map(function (a) { return '<tr><td><code>' + a.key + '</code></td><td>' + esc(a.label) + '</td><td>' + esc(a.desc) + '</td></tr>'; }).join('');
    var lines = D.lines.map(function (l) { return '<tr><td><code>' + l.key + '</code></td><td>' + esc(l.label) + '</td></tr>'; }).join('');
    var acts = D.actions.map(function (a) { return '<tr><td><strong>' + esc(a.label) + '</strong></td><td>' + esc(a.def) + '</td></tr>'; }).join('');
    app.innerHTML = '<div class="how"><h1>How it works</h1>' +
      '<section><h2>Purpose</h2><p>FS Pulse is a fortnightly briefing for senior leaders of a non-bank lender in Saudi Arabia, T&uuml;rkiye and Egypt. It supports one decision each fortnight: which external developments need action on products, pricing, risk appetite, funding or compliance, who owns the action and by when. The aim is a read of under 15 minutes, with every high-priority item carrying a recorded action.</p></section>' +
      '<section><h2>Relevance filter</h2><p>An item is included only if it moves at least one of five value drivers. Items that fail all five, or that concern only banks or insurers with no read-across to a non-bank lender, are dropped.</p><table><thead><tr><th>Driver</th><th>Question</th><th>Typical triggers</th></tr></thead><tbody>' + drv + '</tbody></table></section>' +
      '<section><h2>Area taxonomy</h2><p>Each item has one primary area and at most one secondary area. Choose the primary area by asking what the news is fundamentally about.</p><table><thead><tr><th>Key</th><th>Area</th><th>Covers</th></tr></thead><tbody>' + areas + '</tbody></table>' +
      '<p style="margin-top:12px">Items are also tagged with business lines:</p><table><thead><tr><th>Key</th><th>Business line</th></tr></thead><tbody>' + lines + '</tbody></table></section>' +
      '<section><h2>Priority score</h2><p><strong>Score = Impact \u00d7 Urgency.</strong> High is 6 or more, Medium is 3\u20135 and Low is 2 or less.</p><table><thead><tr><th>Level</th><th>Impact</th><th>Urgency</th></tr></thead><tbody>' +
      '<tr><td>1</td><td>Marginal or indirect</td><td>More than 6 months away, or no deadline</td></tr>' +
      '<tr><td>2</td><td>Affects one line or process, or a small effect on margins or losses</td><td>Effect or deadline in 3\u20136 months</td></tr>' +
      '<tr><td>3</td><td>Material: licence, funding cost, a main line, or loss rates</td><td>Within 3 months, or already in force</td></tr></tbody></table>' +
      '<p style="margin-top:8px">For data-only items, urgency is 2 if the signal could change a decision within six months, otherwise 1. Priority sort uses score, then impact, then date.</p></section>' +
      '<section><h2>Actions and owners</h2><table><thead><tr><th>Action</th><th>Meaning</th></tr></thead><tbody>' + acts + '</tbody></table>' +
      '<p style="margin-top:8px"><strong>Owners:</strong> ' + D.owners.map(esc).join(', ') + '. Each card suggests an action and a default owner; the reader records the actual decision, due date and a note.</p>' +
      '<p><strong>Nil returns:</strong> a country with nothing material in a fortnight gets an explicit nil return, never filler. A source that could not be checked is reported as \u201cnot verified\u201d, not as a nil.</p></section>' +
      '<section><h2>Production roadmap</h2><p>The pages above are a working prototype. The planned production process is:</p><ol>' +
      '<li><strong>Sourcing:</strong> primary sources first (SAMA, SPA, BDDK, TCMB, CBE, FRA), then regional business press, then market reports.</li>' +
      '<li><strong>AI triage with analyst approval:</strong> AI proposes relevance, areas, lines and scores; an analyst approves every item before publication.</li>' +
      '<li><strong>Distribution:</strong> email and Microsoft Teams summaries that link to the site each fortnight.</li>' +
      '<li><strong>Feedback loop:</strong> track which actions were taken and what followed, and use that to refine scoring and selection.</li></ol></section>' +
      '<section><h2>Assumptions</h2><ul>' +
      '<li><strong>Business lines:</strong> consumer finance and BNPL, SME and merchant lending, and auto and equipment leasing, originated digitally and through retail, dealer and fintech partners.</li>' +
      '<li><strong>Funding:</strong> bank credit lines and term loans, plus capital-markets issuance (sukuk, bonds, securitisation) and shareholder support. No deposit-taking.</li>' +
      '<li><strong>Cost of funds:</strong> linked to local benchmark rates, mainly in local currency, with some hard-currency exposure in T&uuml;rkiye and Egypt.</li>' +
      '<li><strong>Sharia compliance:</strong> some products in Saudi Arabia, and possibly Egypt, are Sharia-compliant. This is unconfirmed.</li>' +
      '<li><strong>Content:</strong> items with &ldquo;TODO&rdquo; source links need a deep link before publication.</li></ul></section></div>';
  }

  /* ---------- events ---------- */
  var timers = {};
  function flashSaved(id) {
    var p = document.querySelector('.action-panel[data-id="' + id + '"] .saved');
    if (!p) return;
    p.classList.add('show');
    clearTimeout(timers['s' + id]);
    timers['s' + id] = setTimeout(function () { p.classList.remove('show'); }, 1600);
  }
  function toggle(g, v) {
    var i = F[g].indexOf(v);
    if (i > -1) F[g].splice(i, 1); else F[g].push(v);
  }
  function itemById(id) { return D.items.filter(function (x) { return x.id === id; })[0]; }

  app.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-chip]'))) { toggle(t.getAttribute('data-g'), t.getAttribute('data-v')); refreshBriefingParts(); return; }
    if ((t = e.target.closest('[data-scope]'))) { F.scope = t.getAttribute('data-scope'); renderScopeChips(); refreshBriefingParts(); return; }
    if ((t = e.target.closest('[data-heat]'))) {
      var c = t.getAttribute('data-c'), a = t.getAttribute('data-a');
      var same = F.country.length === 1 && F.country[0] === c && F.area.length === 1 && F.area[0] === a;
      F.country = same ? [] : [c]; F.area = same ? [] : [a];
      refreshBriefingParts(); return;
    }
    if ((t = e.target.closest('[data-clear]'))) {
      resetFilters();
      var q = document.getElementById('q'); if (q) q.value = '';
      refreshBriefingParts(); return;
    }
    if ((t = e.target.closest('[data-jump]'))) { jumpTo(t.getAttribute('data-jump')); return; }
    if ((t = e.target.closest('[data-ed]'))) { var n = t.getAttribute('data-ed'); if (n) location.hash = '#/briefing/' + n; return; }
    if ((t = e.target.closest('[data-open-ed]'))) { location.hash = '#/briefing/' + t.getAttribute('data-open-ed'); return; }
    if ((t = e.target.closest('[data-tstatus]'))) { var k = t.getAttribute('data-tstatus'); T.status = T.status === k ? '' : k; renderTracker(); return; }
    if (e.target.closest('[data-accept]')) { acceptSuggestions(); return; }
    if (e.target.closest('[data-export]')) { exportCSV(); return; }
    if ((t = e.target.closest('[data-act]'))) {
      var panel = t.closest('.action-panel'), id = panel.getAttribute('data-id'), it = itemById(id);
      var key = t.getAttribute('data-act'), next = decAction(it) === key ? '' : key;
      setDec(id, { action: next, owner: panel.querySelector('.f-owner').value });
      updateNav('briefing'); renderEdHead(); renderFilterDyn();
      if (F.status.length) { renderFeed(); }
      else {
        Array.prototype.forEach.call(panel.querySelectorAll('.abtn'), function (b) {
          var on = b.getAttribute('data-act') === next;
          b.classList.toggle('selected', on); b.setAttribute('aria-pressed', on);
        });
      }
      paintAddressed(id);
      flashSaved(id);
    }
  });
  app.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'q') { F.q = t.value.trim(); renderFeed(); renderFilterDyn(); return; }
    if (t.classList.contains('f-note')) {
      var id = t.closest('.action-panel').getAttribute('data-id'), val = t.value;
      clearTimeout(timers['n' + id]);
      timers['n' + id] = setTimeout(function () { setDec(id, { note: val }); flashSaved(id); }, 400);
    }
  });
  app.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'edSelect') { location.hash = '#/briefing/' + t.value; return; }
    if (t.id === 'sortSel') { F.sort = t.value; renderFeed(); return; }
    if (t.id === 'tEd') { T.ed = t.value; renderTracker(); return; }
    if (t.id === 'tCountry') { T.country = t.value; renderTracker(); return; }
    if (t.classList.contains('f-owner') || t.classList.contains('f-due')) {
      var id = t.closest('.action-panel').getAttribute('data-id');
      var patch = t.classList.contains('f-owner') ? { owner: t.value } : { due: t.value };
      setDec(id, patch); flashSaved(id);
    }
  });

  /* ---------- router and startup ---------- */
  function route() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var page = ['briefing', 'archive', 'tracker', 'how'].indexOf(parts[0]) > -1 ? parts[0] : 'briefing';
    updateNav(page);
    if (page === 'briefing') {
      var n = parseInt(parts[1], 10);
      currentEd = edByNum(n) ? n : LATEST.number;
      renderBriefing(parts[2]);
      if (!parts[2]) window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
      if (page === 'archive') renderArchive();
      else if (page === 'tracker') renderTracker();
      else renderHow();
    }
  }
  window.addEventListener('hashchange', route);
  if (!location.hash) { location.hash = '#/briefing'; } else { route(); }
})();
