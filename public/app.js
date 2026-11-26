'use strict';

/* =========================================================
   1. Ma'lumotlar: shaharlar, tarjimalar, ob-havo kodlari
   ========================================================= */
const CITIES = [
  { id: 'Toshkent',  lat: 41.2995, lon: 69.2401, region: 'Toshkent sh.', alt: ['tashkent', 'ташкент'] },
  { id: 'Samarqand', lat: 39.6542, lon: 66.9597, region: 'Samarqand vil.', alt: ['samarkand', 'самарканд'] },
  { id: 'Buxoro',    lat: 39.7747, lon: 64.4286, region: 'Buxoro vil.', alt: ['bukhara', 'бухара'] },
  { id: 'Andijon',   lat: 40.7821, lon: 72.3442, region: 'Andijon vil.', alt: ['andijan', 'андижан'] },
  { id: 'Namangan',  lat: 40.9983, lon: 71.6726, region: 'Namangan vil.', alt: ['наманган'] },
  { id: "Farg'ona",  lat: 40.3864, lon: 71.7864, region: "Farg'ona vil.", alt: ['fergana', 'fargona', 'фергана'] },
  { id: 'Nukus',     lat: 42.4600, lon: 59.6100, region: "Qoraqalpog'iston", alt: ['нукус'] },
  { id: 'Qarshi',    lat: 38.8606, lon: 65.7891, region: 'Qashqadaryo vil.', alt: ['karshi', 'карши'] },
  { id: 'Termiz',    lat: 37.2242, lon: 67.2783, region: 'Surxondaryo vil.', alt: ['termez', 'термез'] },
  { id: 'Jizzax',    lat: 40.1158, lon: 67.8422, region: 'Jizzax vil.', alt: ['jizzakh', 'джизак'] },
  { id: 'Navoiy',    lat: 40.0844, lon: 65.3792, region: 'Navoiy vil.', alt: ['navoi', 'навои'] },
  { id: 'Guliston',  lat: 40.4897, lon: 68.7842, region: 'Sirdaryo vil.', alt: ['gulistan', 'гулистан'] },
  { id: 'Urganch',   lat: 41.5500, lon: 60.6333, region: 'Xorazm vil.', alt: ['urgench', 'ургенч'] },
  { id: 'Xiva',      lat: 41.3783, lon: 60.3639, region: 'Xorazm vil.', alt: ['khiva', 'хива'] },
  { id: "Qo'qon",    lat: 40.5286, lon: 70.9425, region: "Farg'ona vil.", alt: ['kokand', 'qoqon', 'коканд'] },
  { id: 'Chirchiq',  lat: 41.4689, lon: 69.5822, region: 'Toshkent vil.', alt: ['chirchik', 'чирчик'] },
];

const I18N = {
  uz: {
    skip: "Asosiy kontentga o'tish", searchLabel: 'Shahar qidirish', searchPh: 'Shahar qidirish…',
    feelsLike: 'His qilinadi', high: 'Eng yuqori', low: 'Eng past',
    hourly: 'Soatlik prognoz', next24: 'Keyingi 24 soat', daily: '7 kunlik prognoz', details: "Batafsil ko'rsatkichlar",
    map: "O'zbekiston xaritasi", layerTemp: 'Harorat', layerPrecip: "Yog'in", layerWind: 'Shamol',
    mapHint: "Shahar belgisini bosing — ob-havo shu shaharga almashadi.",
    subTitle: "Ob-havo ogohlantirishlariga obuna", subDesc: "Shahringizda yomg'ir, qor yoki keskin o'zgarishlar bo'lsa, sizga xabar beramiz.",
    fName: 'Ismingiz', fPhone: 'Telefon raqami', fCity: 'Shahar', fAlerts: 'Qaysi ogohlantirishlar kerak?', fNote: 'Izoh (ixtiyoriy)',
    aRain: "Yomg'ir", aSnow: 'Qor', aHot: 'Jazirama', aCold: 'Sovuq', aWind: 'Kuchli shamol', aAir: 'Havo sifati',
    save: 'Saqlash', loading: 'Yuklanmoqda…', source: "Ma'lumot manbai:",
    gmTitle: 'Joriy ob-havoni alohida oynada ochish (Open-Meteo)',
    openForm: "Formani to'ldirish", close: 'Yopish', dlgDesc: "Ma'lumotlaringiz \"Saqlash\" tugmasi bosilishi bilan bazaga yoziladi.",
    now: 'Hozir', today: 'Bugun', humidity: 'Namlik', wind: 'Shamol', uv: 'UV indeksi', pressure: 'Bosim',
    visibility: "Ko'rinish", sun: 'Quyosh', aqi: 'Havo sifati', precip: "Yog'ingarchilik",
    sunrise: 'Chiqishi', sunset: 'Botishi', gusts: 'Shamol zarbi', dew: 'Shudring nuqtasi',
    precipToday: "Bugun jami", precipNext: "Keyingi 24 soat ehtimoli",
    uvLow: 'Past', uvMod: "O'rtacha", uvHigh: 'Yuqori', uvVHigh: 'Juda yuqori', uvExt: 'Xavfli',
    aqiGood: 'Yaxshi', aqiMod: "O'rtacha", aqiUSG: 'Sezgirlar uchun zararli', aqiBad: 'Zararli', aqiVBad: 'Juda zararli', aqiHaz: 'Xavfli',
    visGood: 'Juda yaxshi ko\'rinish', visMid: "O'rtacha ko'rinish", visBad: 'Yomon ko\'rinish',
    pHigh: 'Yuqori bosim', pNorm: 'Normal', pLow: 'Past bosim',
    humDry: 'Quruq havo', humOk: 'Qulay', humWet: 'Nam havo',
    updated: 'Yangilandi', sample: "Jonli ma'lumot olinmadi — namuna ma'lumotlar ko'rsatilmoqda.",
    toNight: "Tungi rejimga o'tish", toDay: "Kunduzgi rejimga o'tish",
    subCount: (n) => `${n} kishi obuna bo'lgan`,
    errName: "Ismingizni kiriting (kamida 2 ta harf).", errPhone: "Telefon raqami noto'g'ri. Masalan: +998 90 123 45 67",
    errCity: 'Shaharni tanlang.', errNote: 'Izoh 500 belgidan oshmasin.', errForm: "Formada xatolar bor — qizil bilan belgilangan maydonlarni tekshiring.",
    errNet: "Server bilan aloqa yo'q. Internetni tekshirib, qayta urinib ko'ring.", errServer: "Saqlashda xatolik yuz berdi. Keyinroq urinib ko'ring.",
    success: "Ma'lumot muvaffaqiyatli yuklandi! ✓",
    dirs: ['Sh', 'ShSh', 'Sharq', 'JSh', 'J', "JG'", "G'arb", "ShG'"],
    windFrom: (d) => `${d} tomondan`,
  },
  ru: {
    skip: 'Перейти к содержимому', searchLabel: 'Поиск города', searchPh: 'Поиск города…',
    feelsLike: 'Ощущается', high: 'Максимум', low: 'Минимум',
    hourly: 'Почасовой прогноз', next24: 'Ближайшие 24 часа', daily: 'Прогноз на 7 дней', details: 'Подробности',
    map: 'Карта Узбекистана', layerTemp: 'Температура', layerPrecip: 'Осадки', layerWind: 'Ветер',
    mapHint: 'Нажмите на город, чтобы переключить прогноз.',
    subTitle: 'Подписка на погодные оповещения', subDesc: 'Сообщим о дожде, снеге или резких изменениях погоды в вашем городе.',
    fName: 'Ваше имя', fPhone: 'Телефон', fCity: 'Город', fAlerts: 'Какие оповещения нужны?', fNote: 'Комментарий (необязательно)',
    aRain: 'Дождь', aSnow: 'Снег', aHot: 'Жара', aCold: 'Холод', aWind: 'Сильный ветер', aAir: 'Качество воздуха',
    save: 'Сохранить', loading: 'Загрузка…', source: 'Источник данных:',
    gmTitle: 'Текущая погода в отдельном окне (Open-Meteo)',
    openForm: 'Заполнить форму', close: 'Закрыть', dlgDesc: 'Данные сохраняются в базу сразу после нажатия «Сохранить».',
    now: 'Сейчас', today: 'Сегодня', humidity: 'Влажность', wind: 'Ветер', uv: 'УФ-индекс', pressure: 'Давление',
    visibility: 'Видимость', sun: 'Солнце', aqi: 'Качество воздуха', precip: 'Осадки',
    sunrise: 'Восход', sunset: 'Закат', gusts: 'Порывы', dew: 'Точка росы',
    precipToday: 'Всего сегодня', precipNext: 'Вероятность за 24 ч',
    uvLow: 'Низкий', uvMod: 'Умеренный', uvHigh: 'Высокий', uvVHigh: 'Очень высокий', uvExt: 'Опасный',
    aqiGood: 'Хорошее', aqiMod: 'Умеренное', aqiUSG: 'Вредно для чувствительных', aqiBad: 'Вредное', aqiVBad: 'Очень вредное', aqiHaz: 'Опасное',
    visGood: 'Отличная видимость', visMid: 'Средняя видимость', visBad: 'Плохая видимость',
    pHigh: 'Повышенное', pNorm: 'Нормальное', pLow: 'Пониженное',
    humDry: 'Сухо', humOk: 'Комфортно', humWet: 'Влажно',
    updated: 'Обновлено', sample: 'Не удалось получить данные — показан пример.',
    toNight: 'Ночной режим', toDay: 'Дневной режим',
    subCount: (n) => `Подписчиков: ${n}`,
    errName: 'Введите имя (минимум 2 буквы).', errPhone: 'Неверный номер. Пример: +998 90 123 45 67',
    errCity: 'Выберите город.', errNote: 'Не более 500 символов.', errForm: 'В форме есть ошибки — проверьте отмеченные поля.',
    errNet: 'Нет связи с сервером. Проверьте интернет и попробуйте снова.', errServer: 'Ошибка сохранения. Попробуйте позже.',
    success: 'Данные успешно сохранены! ✓',
    dirs: ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'],
    windFrom: (d) => `Направление: ${d}`,
  },
  en: {
    skip: 'Skip to content', searchLabel: 'Search city', searchPh: 'Search city…',
    feelsLike: 'Feels like', high: 'High', low: 'Low',
    hourly: 'Hourly forecast', next24: 'Next 24 hours', daily: '7-day forecast', details: 'Details',
    map: 'Uzbekistan map', layerTemp: 'Temperature', layerPrecip: 'Precipitation', layerWind: 'Wind',
    mapHint: 'Click a city marker to switch the forecast.',
    subTitle: 'Subscribe to weather alerts', subDesc: "We'll notify you about rain, snow or sudden changes in your city.",
    fName: 'Your name', fPhone: 'Phone number', fCity: 'City', fAlerts: 'Which alerts do you want?', fNote: 'Note (optional)',
    aRain: 'Rain', aSnow: 'Snow', aHot: 'Heat', aCold: 'Cold', aWind: 'Strong wind', aAir: 'Air quality',
    save: 'Save', loading: 'Loading…', source: 'Data source:',
    gmTitle: 'Current weather in a separate window (Open-Meteo)',
    openForm: 'Fill in the form', close: 'Close', dlgDesc: 'Your data is saved to the database as soon as you press Save.',
    now: 'Now', today: 'Today', humidity: 'Humidity', wind: 'Wind', uv: 'UV index', pressure: 'Pressure',
    visibility: 'Visibility', sun: 'Sun', aqi: 'Air quality', precip: 'Precipitation',
    sunrise: 'Sunrise', sunset: 'Sunset', gusts: 'Gusts', dew: 'Dew point',
    precipToday: 'Total today', precipNext: 'Chance in next 24h',
    uvLow: 'Low', uvMod: 'Moderate', uvHigh: 'High', uvVHigh: 'Very high', uvExt: 'Extreme',
    aqiGood: 'Good', aqiMod: 'Moderate', aqiUSG: 'Unhealthy for sensitive', aqiBad: 'Unhealthy', aqiVBad: 'Very unhealthy', aqiHaz: 'Hazardous',
    visGood: 'Excellent visibility', visMid: 'Moderate visibility', visBad: 'Poor visibility',
    pHigh: 'High', pNorm: 'Normal', pLow: 'Low',
    humDry: 'Dry', humOk: 'Comfortable', humWet: 'Humid',
    updated: 'Updated', sample: 'Live data unavailable — showing sample data.',
    toNight: 'Switch to night mode', toDay: 'Switch to day mode',
    subCount: (n) => `${n} subscribers`,
    errName: 'Enter your name (at least 2 letters).', errPhone: 'Invalid phone number. Example: +998 90 123 45 67',
    errCity: 'Choose a city.', errNote: 'Max 500 characters.', errForm: 'Please fix the highlighted fields.',
    errNet: 'Cannot reach the server. Check your connection and try again.', errServer: 'Saving failed. Please try later.',
    success: 'Data uploaded successfully! ✓',
    dirs: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    windFrom: (d) => `From ${d}`,
  },
};

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const UZ_DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const UZ_DAYS_SHORT = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

// WMO ob-havo kodlari → [uz, ru, en, ikonka turi, fon mavzusi]
const WMO = {
  0: ['Ochiq osmon', 'Ясно', 'Clear sky', 'clear', 'sunny'],
  1: ['Asosan ochiq', 'Преимущественно ясно', 'Mainly clear', 'clear', 'sunny'],
  2: ['Qisman bulutli', 'Переменная облачность', 'Partly cloudy', 'partly', 'cloudy'],
  3: ['Bulutli', 'Пасмурно', 'Overcast', 'cloudy', 'cloudy'],
  45: ['Tuman', 'Туман', 'Fog', 'fog', 'cloudy'],
  48: ['Qirovli tuman', 'Изморозь', 'Rime fog', 'fog', 'cloudy'],
  51: ['Yengil shivalama', 'Слабая морось', 'Light drizzle', 'drizzle', 'rain'],
  53: ['Shivalama', 'Морось', 'Drizzle', 'drizzle', 'rain'],
  55: ['Kuchli shivalama', 'Сильная морось', 'Dense drizzle', 'drizzle', 'rain'],
  56: ['Muzli shivalama', 'Ледяная морось', 'Freezing drizzle', 'drizzle', 'rain'],
  57: ['Muzli shivalama', 'Ледяная морось', 'Freezing drizzle', 'drizzle', 'rain'],
  61: ["Yengil yomg'ir", 'Небольшой дождь', 'Light rain', 'rain', 'rain'],
  63: ["Yomg'ir", 'Дождь', 'Rain', 'rain', 'rain'],
  65: ["Kuchli yomg'ir", 'Сильный дождь', 'Heavy rain', 'rain', 'rain'],
  66: ["Muzli yomg'ir", 'Ледяной дождь', 'Freezing rain', 'rain', 'rain'],
  67: ["Muzli yomg'ir", 'Ледяной дождь', 'Freezing rain', 'rain', 'rain'],
  71: ['Yengil qor', 'Небольшой снег', 'Light snow', 'snow', 'snow'],
  73: ['Qor', 'Снег', 'Snow', 'snow', 'snow'],
  75: ["Kuchli qor", 'Сильный снег', 'Heavy snow', 'snow', 'snow'],
  77: ['Qor donalari', 'Снежная крупа', 'Snow grains', 'snow', 'snow'],
  80: ["Jala", 'Ливень', 'Rain showers', 'rain', 'rain'],
  81: ["Jala", 'Ливень', 'Rain showers', 'rain', 'rain'],
  82: ["Kuchli jala", 'Сильный ливень', 'Violent showers', 'rain', 'rain'],
  85: ["Qor yog'ishi", 'Снегопад', 'Snow showers', 'snow', 'snow'],
  86: ["Kuchli qor yog'ishi", 'Сильный снегопад', 'Heavy snow showers', 'snow', 'snow'],
  95: ["Momaqaldiroq", 'Гроза', 'Thunderstorm', 'thunder', 'rain'],
  96: ["Do'lli momaqaldiroq", 'Гроза с градом', 'Thunderstorm with hail', 'thunder', 'rain'],
  99: ["Do'lli momaqaldiroq", 'Гроза с градом', 'Thunderstorm with hail', 'thunder', 'rain'],
};
const LANG_IDX = { uz: 0, ru: 1, en: 2 };
const wmo = (code) => WMO[code] || WMO[2];

/* =========================================================
   2. Holat
   ========================================================= */
const state = {
  city: CITIES[0],
  unit: localStorage.getItem('unit') || 'C',
  lang: localStorage.getItem('lang') || 'uz',
  modeOverride: null, // null | 'night' | 'day'
  data: null,
  mapData: null,
  mapLayer: 'temp',
  sample: false,
};
const t = (k) => I18N[state.lang][k] ?? I18N.uz[k] ?? k;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* =========================================================
   3. Yordamchi funksiyalar
   ========================================================= */
const toUnit = (c) => (state.unit === 'F' ? c * 9 / 5 + 32 : c);
const fmtT = (c, withUnit = false) => {
  const v = Math.round(toUnit(c));
  return `${v > 0 && state.unit === 'C' ? '' : ''}${v}°${withUnit ? state.unit : ''}`;
};
const hhmm = (iso) => iso.slice(11, 16);
const dirName = (deg) => t('dirs')[Math.round(deg / 45) % 8];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => s.toLowerCase().replace(/[ʻʼ'`‘’]/g, '').replace(/\s+/g, ' ').trim();

function formatDate(iso, opts = 'long') {
  const d = new Date(iso + (iso.length <= 10 ? 'T12:00' : ''));
  if (state.lang === 'uz') {
    if (opts === 'short') return UZ_DAYS_SHORT[d.getDay()];
    return `${UZ_DAYS[d.getDay()]}, ${d.getDate()}-${UZ_MONTHS[d.getMonth()]}`;
  }
  const loc = state.lang === 'ru' ? 'ru-RU' : 'en-GB';
  if (opts === 'short') return d.toLocaleDateString(loc, { weekday: 'short' });
  return d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' });
}

function tashkentNowIso() {
  // Toshkent vaqti (UTC+5) bo'yicha "YYYY-MM-DDTHH:MM"
  const d = new Date(Date.now() + 5 * 3600e3);
  return d.toISOString().slice(0, 16);
}

function countUp(el, to, { decimals = 0, suffix = '', duration = 900 } = {}) {
  const from = Number(el.dataset.v ?? 0);
  el.dataset.v = to;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = to.toFixed(decimals) + suffix;
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = (from + (to - from) * e).toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function tempColor(c) {
  // -20 → ko'k, 0 → havorang, 15 → yashil, 25 → sariq, 35+ → qizil
  const stops = [[-20, [96, 165, 250]], [0, [125, 211, 252]], [10, [134, 239, 172]], [20, [253, 224, 71]], [30, [251, 146, 60]], [40, [239, 68, 68]]];
  if (c <= stops[0][0]) return `rgb(${stops[0][1]})`;
  for (let i = 1; i < stops.length; i++) {
    if (c <= stops[i][0]) {
      const [a, ca] = stops[i - 1], [b, cb] = stops[i];
      const k = (c - a) / (b - a);
      return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * k)).join(',')})`;
    }
  }
  return `rgb(${stops.at(-1)[1]})`;
}

/* =========================================================
   4. Animatsiyali SVG ikonkalar
   ========================================================= */
const SUN = (cx = 32, cy = 32, r = 11) => `
  <g class="wi-sun-rays" stroke="#FDB813" stroke-width="3" stroke-linecap="round">
    ${Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4, r1 = r + 5, r2 = r + 10;
      return `<line x1="${cx + r1 * Math.cos(a)}" y1="${cy + r1 * Math.sin(a)}" x2="${cx + r2 * Math.cos(a)}" y2="${cy + r2 * Math.sin(a)}"/>`;
    }).join('')}
  </g>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#FDB813"/>`;
const MOON = (cx = 30, cy = 28) => `<path d="M${cx + 10} ${cy + 8}A13 13 0 1 1 ${cx - 2} ${cy - 13} 10 10 0 0 0 ${cx + 10} ${cy + 8}z" fill="#F4E9B8"/>`;
const CLOUD = (fill = '#fff', dx = 0, dy = 0) =>
  `<path class="wi-cloud" transform="translate(${dx} ${dy})" d="M20 50h26a10 10 0 0 0 1-20 14 14 0 0 0-27 3 8.5 8.5 0 0 0 0 17z" fill="${fill}"/>`;

function iconSvg(code, isDay = 1) {
  const kind = wmo(code)[3];
  const label = wmo(code)[LANG_IDX[state.lang]];
  let body = '';
  switch (kind) {
    case 'clear': body = isDay ? SUN() : MOON(32, 32); break;
    case 'partly': body = (isDay ? SUN(24, 22, 9) : MOON(24, 20)) + CLOUD('#fff', 4, 4); break;
    case 'cloudy': body = CLOUD('#cbd5e1', -6, -6) + CLOUD('#fff', 2, 2); break;
    case 'fog': body = CLOUD('#e2e8f0', 0, -6) + `<g class="wi-fog" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"><line x1="14" y1="52" x2="50" y2="52"/><line x1="20" y1="58" x2="46" y2="58"/></g>`; break;
    case 'drizzle':
    case 'rain': body = CLOUD('#e2e8f0', 0, -8) + `<g stroke="#7cc4ff" stroke-width="3" stroke-linecap="round">
        <line class="wi-drop" x1="24" y1="48" x2="22" y2="54"/><line class="wi-drop" x1="33" y1="48" x2="31" y2="54"/><line class="wi-drop" x1="42" y1="48" x2="40" y2="54"/></g>`; break;
    case 'snow': body = CLOUD('#f1f5f9', 0, -8) + `<g fill="#fff">
        <circle class="wi-flake" cx="24" cy="50" r="2.6"/><circle class="wi-flake" cx="33" cy="52" r="2.6"/><circle class="wi-flake" cx="42" cy="50" r="2.6"/></g>`; break;
    case 'thunder': body = CLOUD('#94a3b8', 0, -8) + `<path class="wi-bolt" d="M33 42l-7 11h6l-3 9 9-13h-6l4-7z" fill="#FDE047"/>`; break;
  }
  return `<svg viewBox="0 0 64 64" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>${body}</svg>`;
}

const UI_ICONS = {
  humidity: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
  uv: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  pressure: '<circle cx="12" cy="13" r="8"/><path d="M12 13l4-4M12 5V3"/>',
  visibility: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  sun: '<path d="M17 18a5 5 0 0 0-10 0M12 2v7M4.2 10.2l1.4 1.4M1 18h2M21 18h2M18.4 11.6l1.4-1.4M23 22H1M8 6l4-4 4 4"/>',
  aqi: '<path d="M4 14a4 4 0 0 1 4-4h9a3 3 0 1 0-3-3M4 18h12a3 3 0 1 1-3 3"/>',
  precip: '<path d="M8 19v2M8 13v2M16 19v2M16 13v2M12 21v2M12 15v2M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3"/>',
};
const uiIcon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${UI_ICONS[k]}</svg>`;

/* =========================================================
   5. Ma'lumot olish (Open-Meteo) + namuna ma'lumot
   ========================================================= */
async function fetchJson(url, ms = 7000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

async function loadWeather(city) {
  const q = new URLSearchParams({
    latitude: city.lat, longitude: city.lon, timezone: 'Asia/Tashkent', forecast_days: 7, wind_speed_unit: 'ms',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,dew_point_2m',
    hourly: 'temperature_2m,precipitation_probability,weather_code,is_day,visibility,uv_index',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max',
  });
  const aq = new URLSearchParams({ latitude: city.lat, longitude: city.lon, timezone: 'Asia/Tashkent', current: 'us_aqi,pm2_5,pm10' });
  const [w, a] = await Promise.all([
    fetchJson(`https://api.open-meteo.com/v1/forecast?${q}`),
    fetchJson(`https://air-quality-api.open-meteo.com/v1/air-quality?${aq}`).catch(() => null),
  ]);
  w.air = a?.current ?? { us_aqi: 58, pm2_5: 17, pm10: 34 };
  return w;
}

async function loadMapData() {
  const q = new URLSearchParams({
    latitude: CITIES.map((c) => c.lat).join(','), longitude: CITIES.map((c) => c.lon).join(','),
    timezone: 'Asia/Tashkent', wind_speed_unit: 'ms',
    current: 'temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,weather_code,is_day',
  });
  const res = await fetchJson(`https://api.open-meteo.com/v1/forecast?${q}`);
  return (Array.isArray(res) ? res : [res]).map((r) => r.current);
}

/** Namuna ma'lumot: Toshkent, +18°C, qisman bulutli (boshqa shaharlar uchun biroz farq bilan). */
function sampleWeather(city) {
  const seed = CITIES.indexOf(city);
  const base = 18 + ((seed * 7) % 9) - 4 - (city.lat - 41.3) * 1.2;
  const nowIso = tashkentNowIso();
  const today = nowIso.slice(0, 10);
  const startH = new Date(today + 'T00:00Z');
  const hourly = { time: [], temperature_2m: [], precipitation_probability: [], weather_code: [], is_day: [], visibility: [], uv_index: [] };
  for (let i = 0; i < 48; i++) {
    const d = new Date(startH.getTime() + i * 3600e3);
    const h = d.getUTCHours();
    hourly.time.push(d.toISOString().slice(0, 16));
    hourly.temperature_2m.push(+(base - 6 + 7 * Math.sin(((h - 9) / 24) * 2 * Math.PI)).toFixed(1));
    const pop = i > 30 && i < 40 ? 40 + (i % 4) * 10 : (i % 7) * 3;
    hourly.precipitation_probability.push(pop);
    hourly.weather_code.push(pop > 45 ? 61 : h > 10 && h < 17 ? 2 : h < 7 || h > 19 ? 1 : 3);
    hourly.is_day.push(h >= 7 && h < 18 ? 1 : 0);
    hourly.visibility.push(18000);
    hourly.uv_index.push(h >= 7 && h < 18 ? Math.max(0, 3.4 * Math.sin(((h - 7) / 11) * Math.PI)) : 0);
  }
  const dcodes = [2, 3, 61, 1, 0, 2, 3];
  const daily = { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], sunrise: [], sunset: [], uv_index_max: [], precipitation_sum: [], precipitation_probability_max: [] };
  for (let i = 0; i < 7; i++) {
    const d = new Date(startH.getTime() + i * 86400e3).toISOString().slice(0, 10);
    daily.time.push(d);
    daily.weather_code.push(dcodes[i]);
    daily.temperature_2m_max.push(+(base + 2 - (i === 2 ? 4 : 0) + (i % 3)).toFixed(1));
    daily.temperature_2m_min.push(+(base - 9 - (i === 2 ? 2 : 0) + (i % 2)).toFixed(1));
    daily.sunrise.push(`${d}T07:${String(14 + i).padStart(2, '0')}`);
    daily.sunset.push(`${d}T17:${String(12 - i).padStart(2, '0')}`);
    daily.uv_index_max.push(3.4);
    daily.precipitation_sum.push(i === 2 ? 4.2 : 0);
    daily.precipitation_probability_max.push(i === 2 ? 70 : (i * 5) % 20);
  }
  const h = Number(nowIso.slice(11, 13));
  return {
    current: {
      time: nowIso, temperature_2m: seed === 0 ? 18 : +base.toFixed(1), apparent_temperature: seed === 0 ? 17 : +(base - 1).toFixed(1),
      relative_humidity_2m: 52, is_day: h >= 7 && h < 18 ? 1 : 0, precipitation: 0, weather_code: 2,
      pressure_msl: 1018, wind_speed_10m: 3.6, wind_direction_10m: 315, wind_gusts_10m: 7.2, dew_point_2m: 8,
    },
    hourly, daily, air: { us_aqi: 62, pm2_5: 18, pm10: 36 },
  };
}

function sampleMap() {
  return CITIES.map((c) => {
    const w = sampleWeather(c).current;
    return { ...w, precipitation: c.lat > 41 ? 0 : (CITIES.indexOf(c) % 3) * 0.4, wind_speed_10m: 2 + (CITIES.indexOf(c) % 5), wind_direction_10m: (CITIES.indexOf(c) * 47) % 360 };
  });
}

/* =========================================================
   6. Render
   ========================================================= */
function currentHourIndex(d) {
  const key = d.current.time.slice(0, 13);
  const i = d.hourly.time.findIndex((x) => x.slice(0, 13) >= key);
  return Math.max(0, i);
}

function applyTheme() {
  const d = state.data;
  if (!d) return;
  const theme0 = wmo(d.current.weather_code)[4];
  const isNight = state.modeOverride ? state.modeOverride === 'night' : !d.current.is_day;
  const theme = isNight && (theme0 === 'sunny' || theme0 === 'cloudy') ? 'night' : theme0;
  document.body.className = `theme-${theme}${isNight ? ' is-night' : ''}`;
  $('#mode-btn').setAttribute('aria-label', isNight ? t('toDay') : t('toNight'));
  renderParticles(theme);
}

let lastParticles = '';
function renderParticles(theme) {
  if (theme === lastParticles) return;
  lastParticles = theme;
  const box = $('#particles');
  box.innerHTML = '';
  const rnd = (a, b) => a + Math.random() * (b - a);
  const frag = document.createDocumentFragment();
  if (theme === 'rain') {
    for (let i = 0; i < 90; i++) {
      const el = document.createElement('i');
      el.className = 'drop';
      el.style.cssText = `left:${rnd(0, 110)}%;animation-duration:${rnd(0.55, 0.9)}s;animation-delay:${rnd(-2, 0)}s;opacity:${rnd(0.3, 0.8)}`;
      frag.append(el);
    }
  } else if (theme === 'snow') {
    for (let i = 0; i < 70; i++) {
      const el = document.createElement('i');
      const s = rnd(2, 6);
      el.className = 'flake';
      el.style.cssText = `left:${rnd(0, 100)}%;width:${s}px;height:${s}px;animation-duration:${rnd(7, 14)}s;animation-delay:${rnd(-14, 0)}s`;
      frag.append(el);
    }
  } else if (theme === 'night') {
    for (let i = 0; i < 110; i++) {
      const el = document.createElement('i');
      el.className = 'star';
      el.style.cssText = `left:${rnd(0, 100)}%;top:${rnd(0, 70)}%;animation-duration:${rnd(1.5, 4)}s;animation-delay:${rnd(-4, 0)}s;transform:scale(${rnd(0.5, 1.4)})`;
      frag.append(el);
    }
  }
  box.append(frag);
}

function renderHero() {
  const d = state.data, c = d.current, today = 0;
  $('#city-name').textContent = state.city.id;
  $('#datetime').textContent = `${formatDate(c.time.slice(0, 10))} · ${tashkentNowIso().slice(11, 16)}`;
  $('#hero-icon').innerHTML = iconSvg(c.weather_code, c.is_day);
  const tempEl = $('#temp-now');
  tempEl.innerHTML = '';
  const num = document.createElement('span');
  tempEl.append(num, '°');
  num.dataset.v = 0;
  countUp(num, Math.round(toUnit(c.temperature_2m)));
  tempEl.setAttribute('aria-label', `${Math.round(toUnit(c.temperature_2m))} ${state.unit === 'C' ? 'Celsius' : 'Fahrenheit'}`);
  $('#condition').textContent = wmo(c.weather_code)[LANG_IDX[state.lang]];
  $('#feels').textContent = fmtT(c.apparent_temperature);
  $('#tmax').textContent = fmtT(d.daily.temperature_2m_max[today]);
  $('#tmin').textContent = fmtT(d.daily.temperature_2m_min[today]);
}

function renderHourly() {
  const d = state.data, start = currentHourIndex(d);
  const html = [];
  for (let i = start; i < Math.min(start + 24, d.hourly.time.length); i++) {
    const pop = d.hourly.precipitation_probability[i] ?? 0;
    const isNow = i === start;
    const time = isNow ? t('now') : hhmm(d.hourly.time[i]);
    html.push(`<div class="hour${isNow ? ' now' : ''}" role="listitem" aria-label="${esc(time)}: ${fmtT(d.hourly.temperature_2m[i])}, ${pop}%">
      <span class="h-time">${esc(time)}</span>
      ${iconSvg(d.hourly.weather_code[i], d.hourly.is_day[i])}
      <span class="h-temp">${fmtT(d.hourly.temperature_2m[i])}</span>
      <span class="h-pop">${pop >= 10 ? `<svg width="9" height="11" viewBox="0 0 12 16" aria-hidden="true"><path d="M6 0s6 7 6 10a6 6 0 0 1-12 0C0 7 6 0 6 0z" fill="#7cc4ff"/></svg>${pop}%` : ''}</span>
    </div>`);
  }
  $('#hourly').innerHTML = html.join('');
}

function renderDaily() {
  const d = state.data.daily;
  const lo = Math.min(...d.temperature_2m_min), hi = Math.max(...d.temperature_2m_max), span = hi - lo || 1;
  const nowT = state.data.current.temperature_2m;
  $('#daily').innerHTML = d.time.map((day, i) => {
    const mn = d.temperature_2m_min[i], mx = d.temperature_2m_max[i];
    const left = ((mn - lo) / span) * 100, width = ((mx - mn) / span) * 100;
    const pop = d.precipitation_probability_max[i] ?? 0;
    const dot = i === 0 ? `<i style="left:${((nowT - lo) / span) * 100}%" aria-hidden="true"></i>` : '';
    const name = i === 0 ? t('today') : formatDate(day, 'short');
    return `<li class="day" aria-label="${esc(name)}: ${esc(wmo(d.weather_code[i])[LANG_IDX[state.lang]])}, ${fmtT(mn)} – ${fmtT(mx)}">
      <span class="d-name">${esc(name)}</span>
      ${iconSvg(d.weather_code[i], 1)}
      <span class="d-min">${fmtT(mn)}${pop >= 20 ? `<span class="d-pop">${pop}%</span>` : ''}</span>
      <span class="range" aria-hidden="true"><span style="left:${left}%;width:${Math.max(width, 4)}%;background:linear-gradient(90deg, ${tempColor(mn)}, ${tempColor(mx)})"></span>${dot}</span>
      <span class="d-max">${fmtT(mx)}</span>
    </li>`;
  }).join('');
}

function renderDetails() {
  const d = state.data, c = d.current, idx = currentHourIndex(d);
  const uv = d.hourly.uv_index?.[idx] ?? d.daily.uv_index_max[0];
  const vis = (d.hourly.visibility?.[idx] ?? 20000) / 1000;
  const aqi = d.air?.us_aqi ?? 50;
  const hum = c.relative_humidity_2m;
  const p = c.pressure_msl;
  const next24pop = Math.max(...d.hourly.precipitation_probability.slice(idx, idx + 24).map((x) => x ?? 0));

  const uvLbl = uv < 3 ? t('uvLow') : uv < 6 ? t('uvMod') : uv < 8 ? t('uvHigh') : uv < 11 ? t('uvVHigh') : t('uvExt');
  const aqiLbl = aqi <= 50 ? t('aqiGood') : aqi <= 100 ? t('aqiMod') : aqi <= 150 ? t('aqiUSG') : aqi <= 200 ? t('aqiBad') : aqi <= 300 ? t('aqiVBad') : t('aqiHaz');
  const visLbl = vis >= 10 ? t('visGood') : vis >= 4 ? t('visMid') : t('visBad');
  const pLbl = p > 1022 ? t('pHigh') : p < 1005 ? t('pLow') : t('pNorm');
  const humLbl = hum < 30 ? t('humDry') : hum > 70 ? t('humWet') : t('humOk');

  // Quyosh yoyi
  const sr = d.daily.sunrise[0], ss = d.daily.sunset[0];
  const toMin = (iso) => Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16));
  const nowMin = toMin(tashkentNowIso());
  const prog = Math.min(1, Math.max(0, (nowMin - toMin(sr)) / (toMin(ss) - toMin(sr))));
  const ang = Math.PI * (1 - prog);
  const sx = 60 + 50 * Math.cos(ang), sy = 58 - 50 * Math.sin(ang);
  const up = nowMin >= toMin(sr) && nowMin <= toMin(ss);

  const card = (key, title, inner) => `<article class="glass card" tabindex="0" aria-labelledby="ct-${key}">
      <h3 class="card-title" id="ct-${key}">${uiIcon(key)}${esc(title)}</h3>${inner}</article>`;

  $('#details').innerHTML = [
    card('humidity', t('humidity'), `
      <div class="card-value"><span data-count="${hum}">0</span><small>%</small></div>
      <div class="meter meter-hum" aria-hidden="true"><span style="width:${hum}%"></span></div>
      <p class="card-note">${esc(humLbl)} · ${esc(t('dew'))} ${fmtT(c.dew_point_2m ?? 8)}</p>`),
    card('wind', t('wind'), `
      <div class="wind-wrap">
        <svg class="compass" viewBox="0 0 100 100" role="img" aria-label="${esc(t('windFrom')(dirName(c.wind_direction_10m)))}">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/>
          ${Array.from({ length: 36 }, (_, i) => { const a = (i * 10 * Math.PI) / 180, r1 = i % 9 === 0 ? 34 : 39; return `<line x1="${50 + r1 * Math.sin(a)}" y1="${50 - r1 * Math.cos(a)}" x2="${50 + 43 * Math.sin(a)}" y2="${50 - 43 * Math.cos(a)}" stroke="rgba(255,255,255,${i % 9 === 0 ? .9 : .35})" stroke-width="${i % 9 === 0 ? 2 : 1}"/>`; }).join('')}
          <text x="50" y="23" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">${t('dirs')[0]}</text>
          <g class="needle" style="transform:rotate(${c.wind_direction_10m + 180}deg)">
            <path d="M50 18 L56 50 L50 46 L44 50Z" fill="#ffd166"/><path d="M50 82 L56 50 L50 54 L44 50Z" fill="rgba(255,255,255,.6)"/>
          </g>
          <circle cx="50" cy="50" r="3.5" fill="#fff"/>
        </svg>
        <div><div class="card-value"><span data-count="${c.wind_speed_10m}" data-dec="1">0</span><small>m/s</small></div>
        <p class="card-note" style="padding-top:2px">${esc(dirName(c.wind_direction_10m))}</p></div>
      </div>
      <p class="card-note">${esc(t('gusts'))}: ${c.wind_gusts_10m.toFixed(1)} m/s</p>`),
    card('uv', t('uv'), `
      <div class="card-value"><span data-count="${uv}" data-dec="0">0</span></div>
      <div class="meter meter-uv" aria-hidden="true"><i style="left:${Math.min(100, (uv / 11) * 100)}%"></i></div>
      <p class="card-note">${esc(uvLbl)}</p>`),
    card('pressure', t('pressure'), `
      <div class="card-value"><span data-count="${p}">0</span><small>hPa</small></div>
      <p class="card-note">${esc(pLbl)} · ${Math.round(p * 0.750062)} mm sim. ust.</p>`),
    card('visibility', t('visibility'), `
      <div class="card-value"><span data-count="${Math.min(vis, 50)}" data-dec="0">0</span><small>km</small></div>
      <p class="card-note">${esc(visLbl)}</p>`),
    card('sun', t('sun'), `
      <svg class="sun-arc" viewBox="0 0 120 66" role="img" aria-label="${esc(t('sunrise'))} ${hhmm(sr)}, ${esc(t('sunset'))} ${hhmm(ss)}">
        <path d="M10 58 A50 50 0 0 1 110 58" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-dasharray="3 4"/>
        <path d="M10 58 A50 50 0 0 1 ${sx.toFixed(1)} ${sy.toFixed(1)}" fill="none" stroke="#ffd166" stroke-width="2.5"/>
        <line x1="4" y1="58" x2="116" y2="58" stroke="rgba(255,255,255,.4)"/>
        ${up ? `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="6" fill="#FDB813" stroke="#fff" stroke-width="2"/>` : ''}
      </svg>
      <div class="sun-times"><span>${esc(t('sunrise'))}<strong>${hhmm(sr)}</strong></span><span style="text-align:right">${esc(t('sunset'))}<strong>${hhmm(ss)}</strong></span></div>`),
    card('aqi', t('aqi'), `
      <div class="card-value"><span data-count="${aqi}">0</span><small>AQI</small></div>
      <div class="meter meter-aqi" aria-hidden="true"><i style="left:${Math.min(100, (aqi / 300) * 100)}%"></i></div>
      <p class="card-note">${esc(aqiLbl)} · PM2.5 ${Math.round(d.air?.pm2_5 ?? 0)} µg/m³</p>`),
    card('precip', t('precip'), `
      <div class="card-value"><span data-count="${d.daily.precipitation_sum[0]}" data-dec="1">0</span><small>mm</small></div>
      <p class="card-note">${esc(t('precipToday'))}<br>${esc(t('precipNext'))}: <strong>${next24pop}%</strong></p>`),
  ].join('');

  $$('#details [data-count]').forEach((el) => countUp(el, Number(el.dataset.count), { decimals: Number(el.dataset.dec || 0) }));
}

function renderAll() {
  if (!state.data) return;
  applyTheme();
  renderHero();
  renderHourly();
  renderDaily();
  renderDetails();
  renderMapMarkers();
  $('#updated').textContent = `${t('updated')}: ${tashkentNowIso().slice(11, 16)}`;
  const n = $('#notice');
  n.hidden = !state.sample;
  n.textContent = state.sample ? t('sample') : '';
  $('#main').setAttribute('aria-busy', 'false');
}

/* =========================================================
   7. Xarita (Leaflet)
   ========================================================= */
let map, markerLayer;
function initMap() {
  if (!window.L) return;
  map = L.map('map', { zoomControl: true, scrollWheelZoom: false, attributionControl: true }).setView([41.3, 64.5], 6);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 12, minZoom: 5,
    attribution: '&copy; OpenStreetMap, &copy; CARTO',
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
}

function renderMapMarkers() {
  if (!map || !state.mapData) return;
  markerLayer.clearLayers();
  CITIES.forEach((city, i) => {
    const w = state.mapData[i];
    if (!w) return;
    let pill, bg;
    if (state.mapLayer === 'temp') { pill = fmtT(w.temperature_2m); bg = tempColor(w.temperature_2m); }
    else if (state.mapLayer === 'precip') {
      pill = `${(w.precipitation ?? 0).toFixed(1)} mm`;
      const p = Math.min(1, (w.precipitation ?? 0) / 3);
      bg = `rgb(${Math.round(226 - 166 * p)},${Math.round(240 - 110 * p)},${Math.round(255 - 20 * p)})`;
    } else {
      pill = `<svg viewBox="0 0 12 12" style="transform:rotate(${w.wind_direction_10m + 180}deg)" aria-hidden="true"><path d="M6 0l4 11-4-3-4 3z" fill="#0f172a"/></svg>${w.wind_speed_10m.toFixed(0)} m/s`;
      bg = w.wind_speed_10m > 10 ? '#fca5a5' : w.wind_speed_10m > 5 ? '#fde68a' : '#d1fae5';
    }
    const active = city.id === state.city.id ? ' active' : '';
    const icon = L.divIcon({
      className: '', iconSize: [0, 0],
      html: `<div class="city-marker${active}"><span class="pill" style="background:${bg}">${pill}</span><span class="nm">${esc(city.id)}</span></div>`,
    });
    const m = L.marker([city.lat, city.lon], { icon, keyboard: true, title: city.id, alt: city.id }).addTo(markerLayer);
    m.on('click', () => selectCity(city));
    m.on('keypress', (e) => { if (e.originalEvent.key === 'Enter') selectCity(city); });
  });
}

$$('.seg-btn').forEach((b) => b.addEventListener('click', () => {
  state.mapLayer = b.dataset.layer;
  $$('.seg-btn').forEach((x) => { x.classList.toggle('active', x === b); x.setAttribute('aria-selected', x === b); });
  renderMapMarkers();
}));

/* =========================================================
   8. Shahar tanlash, qidiruv (avtoto'ldirish)
   ========================================================= */
function showSkeleton() {
  $('#main').setAttribute('aria-busy', 'true');
  $('#temp-now').innerHTML = '<span class="skeleton sk-big"></span>';
  $('#hourly').innerHTML = '<div class="skeleton sk-hour"></div>'.repeat(6);
  $('#daily').innerHTML = '<li class="skeleton sk-row"></li>'.repeat(5);
  $('#details').innerHTML = '<div class="glass card skeleton sk-card"></div>'.repeat(8);
}

let reqId = 0;
async function selectCity(city) {
  state.city = city;
  localStorage.setItem('city', city.id);
  $('#f-shahar').value = city.id;
  const my = ++reqId;
  if (state.data) showSkeleton();
  let data;
  try {
    data = await loadWeather(city);
    state.sample = false;
  } catch {
    data = sampleWeather(city);
    state.sample = true;
  }
  if (my !== reqId) return;
  state.data = data;
  renderAll();
}

const input = $('#city-input'), list = $('#city-list');
let activeIdx = -1, matches = [];
function openList(q) {
  const n = norm(q);
  matches = CITIES.filter((c) => !n || norm(c.id).includes(n) || c.alt.some((a) => a.includes(n)) || norm(c.region).includes(n));
  activeIdx = matches.length ? 0 : -1;
  list.innerHTML = matches.length
    ? matches.map((c, i) => `<li role="option" id="opt-${i}" aria-selected="${i === activeIdx}" data-i="${i}">${esc(c.id)}<small>${esc(c.region)}</small></li>`).join('')
    : `<li role="option" aria-disabled="true">—</li>`;
  list.hidden = false;
  input.setAttribute('aria-expanded', 'true');
  input.setAttribute('aria-activedescendant', activeIdx >= 0 ? `opt-${activeIdx}` : '');
}
function closeList() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
function highlight(i) {
  activeIdx = (i + matches.length) % matches.length;
  $$('li', list).forEach((li, j) => li.setAttribute('aria-selected', j === activeIdx));
  input.setAttribute('aria-activedescendant', `opt-${activeIdx}`);
  $(`#opt-${activeIdx}`)?.scrollIntoView({ block: 'nearest' });
}
function choose(i) { const c = matches[i]; if (!c) return; input.value = ''; closeList(); input.blur(); selectCity(c); }

input.addEventListener('input', () => openList(input.value));
input.addEventListener('focus', () => openList(input.value));
input.addEventListener('keydown', (e) => {
  if (list.hidden && e.key === 'ArrowDown') return openList(input.value);
  if (e.key === 'ArrowDown') { e.preventDefault(); highlight(activeIdx + 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(activeIdx - 1); }
  else if (e.key === 'Enter') { e.preventDefault(); choose(activeIdx); }
  else if (e.key === 'Escape') closeList();
});
list.addEventListener('mousedown', (e) => { const li = e.target.closest('li[data-i]'); if (li) { e.preventDefault(); choose(Number(li.dataset.i)); } });
document.addEventListener('click', (e) => { if (!e.target.closest('.search')) closeList(); });

/* =========================================================
   9. °C/°F, rejim, til
   ========================================================= */
function setUnit(u) {
  state.unit = u;
  localStorage.setItem('unit', u);
  $$('.unit-btn').forEach((b) => { const on = b.dataset.unit === u; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
  renderAll();
}
$$('.unit-btn').forEach((b) => b.addEventListener('click', () => setUnit(b.dataset.unit)));

// Open-Meteo sahifasini alohida (popup) oynada ochish; popup bloklansa — oddiy yangi tab (href orqali)
let gmWin = null;
$('#gm-btn').addEventListener('click', (e) => {
  const url = `/open-meteo?shahar=${encodeURIComponent(state.city.id)}`;
  const w = Math.min(1100, screen.availWidth - 40), h = Math.min(860, screen.availHeight - 60);
  const left = Math.max(0, (screen.availWidth - w) / 2), top = Math.max(0, (screen.availHeight - h) / 2);
  if (gmWin && !gmWin.closed) { gmWin.location.href = url; gmWin.focus(); e.preventDefault(); return; }
  gmWin = window.open(url, 'open-meteo',`popup=yes,width=${w},height=${h},left=${left},top=${top}`);
  if (gmWin) e.preventDefault();
});

$('#mode-btn').addEventListener('click', () => {
  const nightNow = document.body.classList.contains('is-night');
  state.modeOverride = nightNow ? 'day' : 'night';
  applyTheme();
  if (state.data) renderHero();
});

function applyLang() {
  document.documentElement.lang = state.lang;
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $$('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  $$('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  $$('.lang-btn').forEach((b) => { const on = b.dataset.lang === state.lang; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
  setButtonLoading(saveBtn.disabled);
  updateSubCount();
  renderAll();
}
$$('.lang-btn').forEach((b) => b.addEventListener('click', () => { state.lang = b.dataset.lang; localStorage.setItem('lang', state.lang); applyLang(); }));

/* =========================================================
   10. Obuna formasi → Neon bazasi
   ========================================================= */
const form = $('#sub-form');
const saveBtn = $('#save-btn');
const formMsg = $('#form-msg');
$('#f-shahar').innerHTML = CITIES.map((c) => `<option value="${esc(c.id)}">${esc(c.id)}</option>`).join('');

/* ---- Modal oyna ---- */
const dialog = $('#form-dialog');
const openBtn = $('#open-form');
let closeTimer = null;

function openForm() {
  clearTimeout(closeTimer);
  if (!saveBtn.disabled) showFormMsg('', '');
  $('#f-shahar').value = state.city.id;
  dialog.classList.remove('closing');
  dialog.showModal();
  setTimeout(() => $('#f-ism').focus(), 50);
}

function closeForm() {
  if (!dialog.open || saveBtn.disabled) return; // saqlanayotganda yopilmaydi
  clearTimeout(closeTimer);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { dialog.close(); return; }
  dialog.classList.add('closing');
  dialog.addEventListener('animationend', () => { dialog.classList.remove('closing'); dialog.close(); }, { once: true });
}

openBtn.addEventListener('click', openForm);
$('#close-form').addEventListener('click', closeForm);
// Esc: animatsiya bilan yopish, saqlash paytida bloklash
dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeForm(); });
// Fon (backdrop) ustiga bosilganda yopish
dialog.addEventListener('mousedown', (e) => { if (e.target === dialog) closeForm(); });
dialog.addEventListener('close', () => openBtn.focus());

const FIELD_INPUT = { ism: '#f-ism', telefon: '#f-tel', shahar: '#f-shahar', izoh: '#f-izoh' };

function setButtonLoading(on) {
  saveBtn.disabled = on;
  saveBtn.classList.toggle('loading', on);
  saveBtn.setAttribute('aria-busy', on ? 'true' : 'false');
  $('.btn-label', saveBtn).textContent = on ? t('loading') : t('save');
}

function setFieldError(name, msg) {
  const inp = $(FIELD_INPUT[name]);
  const err = $(`#e-${name}`);
  if (!inp || !err) return;
  err.textContent = msg || '';
  if (msg) { inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', `e-${name}`); }
  else { inp.removeAttribute('aria-invalid'); inp.removeAttribute('aria-describedby'); }
}

function showFormMsg(text, kind) {
  formMsg.textContent = text;
  formMsg.className = `form-msg ${kind || ''}`;
}

function validateForm(data) {
  const errors = {};
  if (data.ism.length < 2 || data.ism.length > 80) errors.ism = t('errName');
  if (!/^\+?[0-9\s\-()]{7,20}$/.test(data.telefon) || data.telefon.replace(/\D/g, '').length < 7) errors.telefon = t('errPhone');
  if (!CITIES.some((c) => c.id === data.shahar)) errors.shahar = t('errCity');
  if (data.izoh.length > 500) errors.izoh = t('errNote');
  return errors;
}

// Maydon tahrirlanganda xatoni olib tashlash
Object.entries(FIELD_INPUT).forEach(([name, sel]) => {
  $(sel).addEventListener('input', () => { if ($(`#e-${name}`).textContent) setFieldError(name, ''); });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (saveBtn.disabled) return; // ikki marta bosishdan himoya

  const fd = new FormData(form);
  const data = {
    ism: String(fd.get('ism') || '').trim(),
    telefon: String(fd.get('telefon') || '').trim(),
    shahar: String(fd.get('shahar') || ''),
    izoh: String(fd.get('izoh') || '').trim(),
    ogohlantirish: fd.getAll('ogohlantirish'),
  };

  Object.keys(FIELD_INPUT).forEach((k) => setFieldError(k, ''));
  const errors = validateForm(data);
  if (Object.keys(errors).length) {
    Object.entries(errors).forEach(([k, v]) => setFieldError(k, v));
    showFormMsg(t('errForm'), 'bad');
    $(FIELD_INPUT[Object.keys(errors)[0]]).focus();
    return;
  }

  showFormMsg('', '');
  setButtonLoading(true);
  try {
    const res = await fetch('/api/obuna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) {
      showFormMsg(t('success'), 'ok');
      form.reset();
      $('#f-shahar').value = state.city.id;
      updateSubCount();
      // Xabar ko'rinib turishi uchun 2.5 soniyadan keyin oynani yopamiz
      closeTimer = setTimeout(closeForm, 2500);
    } else if (res.status === 422 && json.errors) {
      // Server tomonidagi tekshiruv xatolari
      const map = { ism: 'errName', telefon: 'errPhone', shahar: 'errCity', izoh: 'errNote' };
      Object.keys(json.errors).forEach((k) => setFieldError(k, t(map[k]) || json.errors[k]));
      showFormMsg(t('errForm'), 'bad');
    } else {
      showFormMsg(t('errServer'), 'bad');
    }
  } catch {
    showFormMsg(t('errNet'), 'bad');
  } finally {
    setButtonLoading(false);
  }
});

let subCount = null;
async function updateSubCount() {
  try {
    if (subCount === null || !saveBtn.disabled) {
      const r = await fetch('/api/obuna/soni');
      const j = await r.json();
      if (j.ok) subCount = j.soni;
    }
  } catch { /* server yo'q bo'lsa jim o'tamiz */ }
  $('#sub-count').textContent = subCount != null ? t('subCount')(subCount) : '';
}

/* =========================================================
   11. Ishga tushirish
   ========================================================= */
(async function init() {
  const saved = CITIES.find((c) => c.id === localStorage.getItem('city')) || CITIES[0];
  $$('.unit-btn').forEach((b) => { const on = b.dataset.unit === state.unit; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
  initMap();
  applyLang();
  selectCity(saved);
  try { state.mapData = await loadMapData(); } catch { state.mapData = sampleMap(); }
  renderMapMarkers();
  // Har 10 daqiqada yangilash
  setInterval(() => selectCity(state.city), 10 * 60 * 1000);
})();
