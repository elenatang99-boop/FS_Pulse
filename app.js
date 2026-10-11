/* FS Pulse app logic. Reads window.FSPULSE (js/data.js). No frameworks, no build step. */
(function () {
  'use strict';
  var D = window.FSPULSE;
  var KEY = 'fspulse.decisions.v1';
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
  function cardHTML(it, showEd) {
    var lines = it.lines.map(function (l) { return '<span class="tag line">' + esc(LINE[l].label) + '</span>'; }).join('');
    var src = it.sources.map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.name) + ' \u2197</a>'; }).join('');
    return '<article class="card p-' + band(it) + '" id="card-' + it.id + '">' +
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
