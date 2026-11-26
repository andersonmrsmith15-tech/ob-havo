'use strict';

// Open-Meteo: token kerak emas, CORS ochiq — brauzerdan to'g'ridan-to'g'ri chaqiramiz.
// Asosiy so'rov: /v1/forecast?latitude=..&longitude=..&current_weather=true
// Soatlik va 7 kunlik bo'limlar uchun shu so'rovga hourly/daily parametrlari qo'shiladi.
const API = 'https://api.open-meteo.com/v1/forecast';

const CITIES = {
  Toshkent: [41.31, 69.28], Samarqand: [39.6542, 66.9597], Buxoro: [39.7747, 64.4286],
  Andijon: [40.7821, 72.3442], Namangan: [40.9983, 71.6726], "Farg'ona": [40.3864, 71.7864],
  Nukus: [42.46, 59.61], Qarshi: [38.8606, 65.7891], Termiz: [37.2242, 67.2783],
  Jizzax: [40.1158, 67.8422], Navoiy: [40.0844, 65.3792], Guliston: [40.4897, 68.7842],
  Urganch: [41.55, 60.6333], Xiva: [41.3783, 60.3639], "Qo'qon": [40.5286, 70.9425], Chirchiq: [41.4689, 69.5822],
};

// WMO ob-havo kodi → [o'zbekcha tavsif, kunduzgi emoji, tungi emoji]
const WMO = {
  0: ['Ochiq osmon', '☀️', '🌙'], 1: ['Asosan ochiq', '🌤️', '🌙'], 2: ['Qisman bulutli', '⛅', '☁️'], 3: ['Bulutli', '☁️', '☁️'],
  45: ['Tuman', '🌫️', '🌫️'], 48: ['Qirovli tuman', '🌫️', '🌫️'],
  51: ['Yengil shivalama', '🌦️', '🌧️'], 53: ['Shivalama', '🌦️', '🌧️'], 55: ['Kuchli shivalama', '🌧️', '🌧️'],
  56: ['Muzli shivalama', '🌧️', '🌧️'], 57: ['Muzli shivalama', '🌧️', '🌧️'],
  61: ["Yengil yomg'ir", '🌦️', '🌧️'], 63: ["Yomg'ir", '🌧️', '🌧️'], 65: ["Kuchli yomg'ir", '🌧️', '🌧️'],
  66: ["Muzli yomg'ir", '🌧️', '🌧️'], 67: ["Muzli yomg'ir", '🌧️', '🌧️'],
  71: ['Yengil qor', '🌨️', '🌨️'], 73: ['Qor', '🌨️', '🌨️'], 75: ['Kuchli qor', '❄️', '❄️'], 77: ['Qor donalari', '🌨️', '🌨️'],
  80: ['Jala', '🌦️', '🌧️'], 81: ['Jala', '🌧️', '🌧️'], 82: ['Kuchli jala', '⛈️', '⛈️'],
  85: ["Qor yog'ishi", '🌨️', '🌨️'], 86: ["Kuchli qor yog'ishi", '❄️', '❄️'],
  95: ['Momaqaldiroq', '⛈️', '⛈️'], 96: ["Do'lli momaqaldiroq", '⛈️', '⛈️'], 99: ["Do'lli momaqaldiroq", '⛈️', '⛈️'],
};
const wmo = (code, isDay = 1) => { const w = WMO[code] || ["Noma'lum", '🌡️', '🌡️']; return { text: w[0], emoji: isDay ? w[1] : w[2] }; };

const DIRS = ['Shimol', 'Shimoli-sharq', 'Sharq', 'Janubi-sharq', 'Janub', "Janubi-g'arb", "G'arb", "Shimoli-g'arb"];
const dirName = (deg) => (deg == null ? '' : DIRS[Math.round(deg / 45) % 8]);
const UZ_DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const T = (v) => (v == null ? '—' : `${Math.round(v) > 0 ? '+' : ''}${Math.round(v)}°`);
const hhmm = (iso) => (iso ? iso.slice(11, 16) : '—');
const dayName = (iso, i) => {
  const d = new Date(`${iso}T12:00:00`);
  return { name: i === 0 ? 'Bugun' : i === 1 ? 'Ertaga' : UZ_DAYS[d.getDay()], date: `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}` };
};
const arrow = (deg) => (deg == null ? '' :
  `<svg class="arrow" viewBox="0 0 12 12" style="transform:rotate(${deg + 180}deg)" aria-hidden="true"><path d="M6 0l4 11-4-3-4 3z" fill="currentColor"/></svg>`);

function tempColor(c) {
  const stops = [[-20, [96, 165, 250]], [0, [125, 211, 252]], [10, [134, 239, 172]], [20, [253, 224, 71]], [30, [251, 146, 60]], [40, [239, 68, 68]]];
  if (c <= stops[0][0]) return `rgb(${stops[0][1]})`;
  for (let i = 1; i < stops.length; i++) {
    if (c <= stops[i][0]) {
      const [a, ca] = stops[i - 1], [b, cb] = stops[i], k = (c - a) / (b - a);
      return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * k)).join(',')})`;
    }
  }
  return `rgb(${stops.at(-1)[1]})`;
}

function buildUrl(city) {
  const [lat, lon] = CITIES[city];
  const q = new URLSearchParams({
    latitude: lat, longitude: lon, current_weather: 'true',
    wind_speed_unit: 'ms', timezone: 'Asia/Tashkent', forecast_days: 7,
    hourly: 'temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,precipitation_probability,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max',
  });
  return `${API}?${q}`;
}

/* ---------- Ma'lumot ---------- */
let reqId = 0;
async function load() {
  const city = $('#city').value;
  const my = ++reqId;
  const btn = $('#refresh');
  btn.classList.add('loading'); btn.disabled = true;
  $('#main').setAttribute('aria-busy', 'true');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const r = await fetch(buildUrl(city), { signal: ctrl.signal });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) throw new Error(j.reason || `Open-Meteo xatosi (${r.status})`);
    if (my !== reqId) return;
    $('#banner').innerHTML = '';
    render(city, j);
  } catch (err) {
    if (my !== reqId) return;
    const msg = err.name === 'AbortError' ? "Open-Meteo javob bermadi (vaqt tugadi)." : err.message === 'Failed to fetch' ? "Internet aloqasi yo'q yoki Open-Meteo'ga ulanib bo'lmadi." : err.message;
    $('#banner').innerHTML = `<div class="banner err">${esc(msg)}</div>`;
  } finally {
    clearTimeout(timer);
    if (my === reqId) { btn.classList.remove('loading'); btn.disabled = false; $('#main').setAttribute('aria-busy', 'false'); }
  }
}

/* ---------- Render ---------- */
function render(city, d) {
  const c = d.current_weather;
  const h = d.hourly, day = d.daily;
  const w = wmo(c.weathercode, c.is_day);
  // current_weather vaqtiga mos soatlik indeks (namlik, bosim, his qilinish shu yerdan)
  const idx = Math.max(0, h.time.findIndex((t) => t.slice(0, 13) >= c.time.slice(0, 13)));
  document.title = `${city}: ${T(c.temperature)} — Joriy ob-havo`;

  $('#now-main').innerHTML = `
    <div class="now-main">
      <div class="now-emoji" role="img" aria-label="${esc(w.text)}">${w.emoji}</div>
      <div class="now-temp" aria-label="Harorat ${T(c.temperature)}">${T(c.temperature)}</div>
    </div>
    <div class="now-desc">${esc(w.text)}</div>
    <div class="now-sub">${esc(city)} · his qilinadi ${T(h.apparent_temperature[idx])} · ${hhmm(c.time)} holatiga</div>`;

  const stats = [
    ['Shamol', `${arrow(c.winddirection)}${c.windspeed.toFixed(1)} <small>m/s</small>`, `${dirName(c.winddirection)} (${c.winddirection}°)`],
    ['Namlik', `${h.relative_humidity_2m[idx]}%`, ''],
    ['Bosim', `${Math.round(h.pressure_msl[idx] * 0.750062)} <small>mm sim. ust.</small>`, `${Math.round(h.pressure_msl[idx])} hPa`],
    ["Yog'in ehtimoli", `${h.precipitation_probability[idx] ?? 0}%`, 'joriy soatda'],
    ['Bugun', `${T(day.temperature_2m_min[0])} … ${T(day.temperature_2m_max[0])}`, 'eng past … eng yuqori'],
    ['Quyosh', `${hhmm(day.sunrise[0])} – ${hhmm(day.sunset[0])}`, 'chiqishi – botishi'],
  ];
  $('#stats').innerHTML = stats.map(([k, v, s]) => `<div class="stat"><span>${k}</span><strong>${v}</strong>${s ? `<span>${esc(s)}</span>` : ''}</div>`).join('');

  const steps = [];
  for (let i = idx; i < Math.min(idx + 24, h.time.length); i++) {
    const sw = wmo(h.weather_code[i], h.is_day[i]);
    const pop = h.precipitation_probability[i] ?? 0;
    steps.push(`<div class="step" role="listitem" aria-label="${hhmm(h.time[i])}: ${T(h.temperature_2m[i])}, ${esc(sw.text)}, yog'in ${pop}%">
      <span class="tm">${i === idx ? 'Hozir' : hhmm(h.time[i])}</span>
      <span class="em" aria-hidden="true">${sw.emoji}</span>
      <span class="tp">${T(h.temperature_2m[i])}</span>
      <span class="pr">${pop >= 10 ? `💧 ${pop}%` : ''}</span>
    </div>`);
  }
  $('#steps').innerHTML = steps.join('');

  const lo = Math.min(...day.temperature_2m_min), hi = Math.max(...day.temperature_2m_max), span = hi - lo || 1;
  $('#days').innerHTML = day.time.map((iso, i) => {
    const { name, date } = dayName(iso, i);
    const dw = wmo(day.weather_code[i], 1);
    const mn = day.temperature_2m_min[i], mx = day.temperature_2m_max[i];
    const left = ((mn - lo) / span) * 100, width = Math.max(4, ((mx - mn) / span) * 100);
    const pr = day.precipitation_sum[i] ? ` · <span class="pr">${day.precipitation_sum[i]} mm</span>` : '';
    return `<li class="day" aria-label="${name}, ${date}: ${esc(dw.text)}, ${T(mn)} dan ${T(mx)} gacha">
      <span class="dn">${name}<small>${date}</small></span>
      <span class="em" aria-hidden="true">${dw.emoji}</span>
      <span class="ds">${esc(dw.text)}${pr}</span>
      <span class="mn">${T(mn)}</span>
      <span class="range" aria-hidden="true"><span style="left:${left}%;width:${width}%;background:linear-gradient(90deg,${tempColor(mn)},${tempColor(mx)})"></span></span>
      <span class="mx">${T(mx)}</span>
    </li>`;
  }).join('');

  $('#meta').textContent = `olingan: ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;
}

/* ---------- Ishga tushirish ---------- */
const names = Object.keys(CITIES);
const params = new URLSearchParams(location.search);
const initial = names.includes(params.get('shahar')) ? params.get('shahar') : (localStorage.getItem('city') || 'Toshkent');
$('#city').innerHTML = names.map((c) => `<option value="${esc(c)}"${c === initial ? ' selected' : ''}>${esc(c)}</option>`).join('');
$('#city').addEventListener('change', () => {
  history.replaceState(null, '', `?shahar=${encodeURIComponent($('#city').value)}`);
  load();
});
$('#refresh').addEventListener('click', load);

// Alohida oyna sifatida ochilgan bo'lsa — "Oynani yopish" tugmasi
if (window.opener && !window.opener.closed) {
  $('#close').hidden = false;
  $('#close').addEventListener('click', () => window.close());
  $('#home').addEventListener('click', (e) => { e.preventDefault(); window.opener.focus(); });
}
load();
setInterval(() => { if (!document.hidden) load(); }, 10 * 60 * 1000);
