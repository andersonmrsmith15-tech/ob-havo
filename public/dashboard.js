'use strict';

const ALERT_LABELS = {
  yomgir: "Yomg'ir", qor: 'Qor', issiq: 'Jazirama', sovuq: 'Sovuq', shamol: 'Kuchli shamol', havo_sifati: 'Havo sifati',
};
const UZ_MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];
const REFRESH_MS = 30_000;

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDay = (iso) => { const [, m, d] = iso.split('-').map(Number); return `${d}-${UZ_MONTHS[m - 1]}`; };

const state = { data: null, sort: { key: 'sana', dir: -1 }, knownIds: null };

/* ---------- Ma'lumot olish ---------- */
async function load() {
  const btn = $('#refresh');
  btn.classList.add('loading');
  btn.disabled = true;
  try {
    const r = await fetch('/api/dashboard', { cache: 'no-store', credentials: 'same-origin' });
    if (r.status === 401) throw new Error("Sessiya tugadi — sahifani qayta yuklab, login va parolni kiriting.");
    const j = await r.json();
    if (!j.ok) throw new Error(j.message || 'Xatolik');
    $('#error').hidden = true;
    state.data = j;
    render();
    $('#updated').textContent = `Yangilandi: ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  } catch (err) {
    $('#error').textContent = err.message === 'Failed to fetch' ? "Server bilan aloqa yo'q." : err.message;
    $('#error').hidden = false;
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

/* ---------- Umumiy render ---------- */
function render() {
  const d = state.data;
  countUp($('#t-jami'), d.jami);
  countUp($('#t-bugun'), d.bugun);
  countUp($('#t-hafta'), d.hafta);
  const prev7 = d.kunlik.slice(0, 7).reduce((a, x) => a + x.soni, 0);
  const last7 = d.kunlik.slice(7).reduce((a, x) => a + x.soni, 0);
  $('#t-hafta-note').textContent = prev7 === 0
    ? (last7 ? 'oldingi haftada obuna yo\'q edi' : 'hali obuna yo\'q')
    : `oldingi haftaga nisbatan ${last7 >= prev7 ? '+' : ''}${Math.round(((last7 - prev7) / prev7) * 100)}%`;
  const top = d.shaharlar[0];
  $('#t-top').textContent = top ? top.shahar : '—';
  $('#t-top-note').textContent = top ? `${top.soni} ta obunachi (${Math.round((top.soni / d.jami) * 100)}%)` : 'hali obuna yo\'q';

  renderLine($('#c-daily'), d.kunlik, 'h-daily');
  renderBars($('#c-city'), d.shaharlar.map((x) => ({ label: x.shahar, value: x.soni })), 'h-city', 'obunachi');
  renderBars($('#c-alert'), d.ogohlantirishlar.map((x) => ({ label: ALERT_LABELS[x.tur] || x.tur, value: x.soni })), 'h-alert', 'kishi');

  fillFilter($('#f-city'), [...new Set(d.yozuvlar.map((r) => r.shahar))].sort(), (v) => v);
  fillFilter($('#f-alert'), Object.keys(ALERT_LABELS), (v) => ALERT_LABELS[v]);
  renderTable();
}

function countUp(el, to) {
  const from = Number(el.dataset.v || 0);
  el.dataset.v = to;
  if (from === to || matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to; return; }
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - t0) / 700);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function niceMax(v) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/* ---------- Tooltip ---------- */
function tooltip(container) {
  let el = container.querySelector('.tooltip');
  if (!el) { el = document.createElement('div'); el.className = 'tooltip'; el.setAttribute('aria-hidden', 'true'); container.append(el); }
  return {
    show(x, y, title, value) {
      el.innerHTML = `<div class="t-title">${esc(title)}</div><div class="t-val"><i></i>${esc(value)}</div>`;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.classList.add('show');
    },
    hide() { el.classList.remove('show'); },
  };
}

/* ---------- Chiziqli grafik (kunlik) ---------- */
function renderLine(box, rows, labelledBy) {
  const W = Math.max(280, box.clientWidth), H = 220;
  const P = { l: 30, r: 12, t: 12, b: 26 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const max = niceMax(Math.max(...rows.map((r) => r.soni), 1));
  const x = (i) => P.l + (rows.length === 1 ? iw / 2 : (i / (rows.length - 1)) * iw);
  const y = (v) => P.t + ih - (v / max) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => Math.round(max * k)).filter((v, i, a) => a.indexOf(v) === i);

  const line = rows.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r.soni).toFixed(1)}`).join('');
  const area = `${line}L${x(rows.length - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;
  const total = rows.reduce((a, r) => a + r.soni, 0);
  const summary = `Oxirgi 14 kunda jami ${total} ta obuna. Eng ko'p: ${Math.max(...rows.map((r) => r.soni))} ta bir kunda.`;

  box.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${labelledBy}" tabindex="0" aria-describedby="${labelledBy}-desc">
      <desc id="${labelledBy}-desc">${esc(summary)}</desc>
      <g class="axis">
        ${ticks.map((v) => `<line class="gridline" x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${P.l - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('')}
        ${rows.map((r, i) => (i % 2 === (rows.length - 1) % 2) ? `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${fmtDay(r.kun)}</text>` : '').join('')}
      </g>
      <line class="baseline" x1="${P.l}" x2="${W - P.r}" y1="${y(0)}" y2="${y(0)}"/>
      <path d="${area}" fill="var(--series-soft)"/>
      <path d="${line}" fill="none" stroke="var(--series)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <g class="cross" visibility="hidden">
        <line class="cross-line" y1="${P.t}" y2="${y(0)}" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 3"/>
        <circle class="cross-dot" r="5" fill="var(--series)" stroke="var(--surface)" stroke-width="2"/>
      </g>
      <rect class="hit" x="${P.l}" y="${P.t}" width="${iw}" height="${ih}"/>
    </svg>`;

  const svg = box.querySelector('svg'), cross = svg.querySelector('.cross');
  const tip = tooltip(box);
  let cur = -1;
  const show = (i) => {
    cur = Math.max(0, Math.min(rows.length - 1, i));
    const cx = x(cur), cy = y(rows[cur].soni);
    cross.setAttribute('visibility', 'visible');
    cross.querySelector('.cross-line').setAttribute('x1', cx);
    cross.querySelector('.cross-line').setAttribute('x2', cx);
    cross.querySelector('.cross-dot').setAttribute('cx', cx);
    cross.querySelector('.cross-dot').setAttribute('cy', cy);
    tip.show(cx, cy, fmtDay(rows[cur].kun), `${rows[cur].soni} ta obuna`);
  };
  const hide = () => { cross.setAttribute('visibility', 'hidden'); tip.hide(); };
  svg.querySelector('.hit').addEventListener('mousemove', (e) => {
    const px = e.clientX - svg.getBoundingClientRect().left;
    show(Math.round(((px - P.l) / iw) * (rows.length - 1)));
  });
  svg.addEventListener('mouseleave', hide);
  svg.addEventListener('blur', hide);
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(cur < 0 ? rows.length - 1 : cur + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur < 0 ? rows.length - 1 : cur - 1); }
    if (e.key === 'Escape') hide();
  });
}

/* ---------- Gorizontal ustunli grafik ---------- */
function renderBars(box, items, labelledBy, unit) {
  if (!items.length) { box.innerHTML = '<p class="empty">Hali ma\'lumot yo\'q</p>'; return; }
  const W = Math.max(260, box.clientWidth);
  const ROW = 28, BAR = 14, GAP_TOP = 4;
  const labelW = Math.min(110, Math.max(...items.map((i) => i.label.length)) * 7 + 10);
  const valueW = 34;
  const iw = W - labelW - valueW;
  const H = items.length * ROW + GAP_TOP;
  const max = Math.max(...items.map((i) => i.value), 1);
  const r = 4;
  const barPath = (x0, y0, w, h) => {
    if (w <= r) return `M${x0},${y0}h${Math.max(w, 1)}v${h}h-${Math.max(w, 1)}z`;
    return `M${x0},${y0}h${w - r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 -${r},${r}h-${w - r}z`;
  };
  box.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${labelledBy}">
      <desc>${esc(items.map((i) => `${i.label}: ${i.value}`).join('; '))}</desc>
      <line class="baseline" x1="${labelW}" x2="${labelW}" y1="0" y2="${H}"/>
      <g class="bars">
        ${items.map((it, i) => {
          const yy = GAP_TOP + i * ROW, w = (it.value / max) * iw;
          return `<g class="row" data-i="${i}">
            <rect class="hit" x="0" y="${yy}" width="${W}" height="${ROW}"/>
            <text class="bar-label" x="${labelW - 10}" y="${yy + ROW / 2 + 4}" text-anchor="end">${esc(it.label)}</text>
            <path class="bar" d="${barPath(labelW, yy + (ROW - BAR) / 2, w, BAR)}"/>
            <text class="bar-value" x="${labelW + w + 6}" y="${yy + ROW / 2 + 4}">${it.value}</text>
          </g>`;
        }).join('')}
      </g>
    </svg>`;
  const tip = tooltip(box);
  box.querySelectorAll('.row').forEach((g) => {
    const it = items[g.dataset.i], i = Number(g.dataset.i);
    g.addEventListener('mouseenter', () => tip.show(labelW + (it.value / max) * iw / 2, GAP_TOP + i * ROW + 4, it.label, `${it.value} ${unit}`));
    g.addEventListener('mouseleave', () => tip.hide());
  });
}

/* ---------- Jadval ---------- */
function fillFilter(sel, values, label) {
  const keep = sel.value;
  const first = sel.options[0].outerHTML;
  sel.innerHTML = first + values.map((v) => `<option value="${esc(v)}">${esc(label(v))}</option>`).join('');
  sel.value = values.includes(keep) ? keep : '';
}

function filteredRows() {
  const q = $('#q').value.trim().toLowerCase();
  const city = $('#f-city').value, alert = $('#f-alert').value;
  const { key, dir } = state.sort;
  return state.data.yozuvlar
    .filter((r) => (!city || r.shahar === city) && (!alert || r.ogohlantirish.includes(alert)))
    .filter((r) => !q || [r.ism, r.telefon, r.izoh, r.shahar].some((v) => String(v ?? '').toLowerCase().includes(q)))
    .sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * dir);
}

function renderTable() {
  const rows = filteredRows();
  const total = state.data.yozuvlar.length;
  $('#count').textContent = rows.length === total ? `${total} ta yozuv` : `${rows.length} / ${total} ta yozuv`;
  const isNew = (id) => state.knownIds && !state.knownIds.has(id);
  $('#rows').innerHTML = rows.length
    ? rows.map((r) => `<tr class="${isNew(r.id) ? 'new-row' : ''}">
        <td class="num muted">${r.id}</td>
        <td>${esc(r.ism)}</td>
        <td class="num"><a href="tel:${esc(r.telefon.replace(/[^\d+]/g, ''))}">${esc(r.telefon)}</a></td>
        <td>${esc(r.shahar)}</td>
        <td>${r.ogohlantirish.length ? r.ogohlantirish.map((a) => `<span class="tag">${esc(ALERT_LABELS[a] || a)}</span>`).join('') : '<span class="muted">—</span>'}</td>
        <td class="note-cell">${r.izoh ? esc(r.izoh) : '<span class="muted">—</span>'}</td>
        <td class="num muted" style="white-space:nowrap">${esc(r.sana)}</td>
      </tr>`).join('')
    : `<tr><td colspan="7" class="empty">${total ? 'Filtrga mos yozuv topilmadi' : "Hali hech kim obuna bo'lmagan"}</td></tr>`;
  state.knownIds = new Set(state.data.yozuvlar.map((r) => r.id));
}

document.querySelectorAll('th button[data-sort]').forEach((b) => b.addEventListener('click', () => {
  const key = b.dataset.sort;
  state.sort = { key, dir: state.sort.key === key ? -state.sort.dir : (key === 'sana' || key === 'id' ? -1 : 1) };
  document.querySelectorAll('th button[data-sort]').forEach((x) => {
    x.removeAttribute('aria-sort');
    x.textContent = x.textContent.replace(/ [↑↓]$/, '');
  });
  b.setAttribute('aria-sort', state.sort.dir === 1 ? 'ascending' : 'descending');
  b.textContent += state.sort.dir === 1 ? ' ↑' : ' ↓';
  if (state.data) renderTable();
}));
['#q', '#f-city', '#f-alert'].forEach((s) => $(s).addEventListener('input', () => state.data && renderTable()));

/* ---------- CSV eksport ---------- */
$('#export').addEventListener('click', () => {
  if (!state.data) return;
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [['ID', 'Ism', 'Telefon', 'Shahar', 'Ogohlantirishlar', 'Izoh', 'Sana'].map(cell).join(',')];
  filteredRows().forEach((r) => lines.push([r.id, r.ism, r.telefon, r.shahar, r.ogohlantirish.map((a) => ALERT_LABELS[a] || a).join('; '), r.izoh, r.sana].map(cell).join(',')));
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `obunachilar-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

/* ---------- Ishga tushirish ---------- */
$('#refresh').addEventListener('click', load);
let resizeT;
window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => state.data && render(), 150); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });
setInterval(() => { if (!document.hidden) load(); }, REFRESH_MS);
load();
