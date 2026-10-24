import { CafeScene } from './scene.js';
import { TABLES } from './data.js';

/* ------------------------------------------------------------------ *
 *  boot
 * ------------------------------------------------------------------ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let scene;
try {
  scene = new CafeScene($('#scene'));
  window.__zen = scene;
} catch (err) {
  console.error('3D scene unavailable — using photographic fallback', err);
  document.documentElement.classList.add('no-3d');
  scene = {
    hoverId: null,
    selectedId: null,
    setSelected() {},
    pickAt() { return null; },
    screenPos() { return null; },
    measure() {},
  };
}

document.body.classList.add('is-loaded');
$('#year').textContent = new Date().getFullYear();

/* ------------------------------------------------------------------ *
 *  header themes
 * ------------------------------------------------------------------ */
const nav = $('#nav');
const themed = $$('[data-theme]');
function updateNav() {
  let theme = 'dark';
  for (const s of themed) {
    const r = s.getBoundingClientRect();
    if (r.top <= 84 && r.bottom > 84) theme = s.dataset.theme;
  }
  nav.classList.toggle('is-dark', theme === 'light');
  nav.classList.toggle('is-solid', scrollY > innerHeight * 0.9 && theme === 'light');
}
addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ------------------------------------------------------------------ *
 *  reveal + parallax
 * ------------------------------------------------------------------ */
const revealTargets = $$('.space__head > *, .space__list li, .shot, .menu__head > *, .dishes li, .visit__copy > *, .visit__photo, .row');
revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${Math.min(i % 4, 3) * 0.06}s`;
});
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
revealTargets.forEach(el => io.observe(el));

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const parallaxEls = $$('[data-parallax]');
function parallax() {
  if (reduce) return;
  const vh = innerHeight;
  parallaxEls.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const d = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
    el.style.transform = `translate3d(0, ${d.toFixed(1)}px, 0)`;
  });
}
addEventListener('scroll', parallax, { passive: true });
parallax();

/* ------------------------------------------------------------------ *
 *  reservation state
 * ------------------------------------------------------------------ */
const STORE = 'zenzone.reservations.v1';
const loadBookings = () => {
  try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; }
};
const saveBookings = list => {
  try { localStorage.setItem(STORE, JSON.stringify(list)); } catch {}
};
let bookings = loadBookings();

const now = new Date();
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const state = {
  step: 1,
  guests: 1,
  date: iso(now),
  time: null,
  tableId: null,
  name: '',
  phone: '',
  note: '',
};

/* slots */
function slotsFor(dateStr) {
  const out = [];
  for (let m = 11 * 60 + 30; m <= 22 * 60 + 30; m += 30) {
    out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return out;
}
function defaultTime() {
  const target = new Date(now.getTime() + 75 * 60000);
  if (target.getHours() >= 22 && target.getMinutes() > 30) return null;
  const m = Math.ceil((target.getHours() * 60 + target.getMinutes()) / 30) * 30;
  const clamped = Math.min(Math.max(m, 11 * 60 + 30), 22 * 60 + 30);
  return `${pad(Math.floor(clamped / 60))}:${pad(clamped % 60)}`;
}
state.time = defaultTime() || '19:00';

const fmtTime = t => {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${pad(m)} ${ap}`;
};
const fmtDateLong = ds => {
  const d = new Date(ds + 'T12:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};
const fmtDateFull = ds => {
  const d = new Date(ds + 'T12:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
};
const todayStr = iso(now);
const isPastSlot = (dateStr, timeStr) => {
  if (dateStr !== todayStr) return false;
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime() < now.getTime() + 45 * 60000;
};
const tableBooked = (id, dateStr, timeStr) =>
  bookings.some(b => b.tableId === id && b.date === dateStr && b.time === timeStr);

/* ------------------------------------------------------------------ *
 *  elements
 * ------------------------------------------------------------------ */
const els = {
  steps: $$('#steps li'),
  panels: $$('.panel'),
  guestChips: $('#guestChips'),
  dates: $('#dateStrip'),
  times: $('#timeGrid'),
  plan: $('#plan'),
  picked: $('#pickedCard'),
  pickedId: $('#pickedId'),
  pickedZone: $('#pickedZone'),
  pickedSeats: $('#pickedSeats'),
  summary: $('#summary'),
  footSummary: $('#footSummary'),
  next: $('#nextBtn'),
  back: $('#backBtn'),
  form: $('#detailsForm'),
  name: $('#guestName'),
  phone: $('#guestPhone'),
  note: $('#guestNote'),
  error: $('#formError'),
  doneSub: $('#doneSub'),
  doneCard: $('#doneCard'),
  stageNoteText: $('#stageNoteText'),
  tip: $('#tableTip'),
  toast: $('#toast'),
};

let toastTimer;
function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('is-on'), 3200);
}

/* ------------------------------------------------------------------ *
 *  step 1 — guests, dates, times
 * ------------------------------------------------------------------ */
function renderGuests() {
  $$('.chip', els.guestChips).forEach(b => {
    b.classList.toggle('is-on', Number(b.dataset.guests) === state.guests);
    b.setAttribute('aria-pressed', Number(b.dataset.guests) === state.guests);
  });
}
els.guestChips.addEventListener('click', e => {
  const b = e.target.closest('.chip');
  if (!b) return;
  state.guests = Number(b.dataset.guests);
  renderGuests();
  if (state.tableId) {
    const t = TABLES.find(x => x.id === state.tableId);
    if (!t || t.seats < state.guests) {
      state.tableId = null;
      scene.setSelected(null);
      toast('That table is a little small now — pick another.');
    }
  }
  renderPlan();
  renderFoot();
});

function renderDates() {
  els.dates.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const ds = iso(d);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'date' + (ds === state.date ? ' is-on' : '');
    b.dataset.date = ds;
    b.innerHTML = `<span class="dow">${i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' })}</span><span class="dom">${d.getDate()}</span>`;
    b.setAttribute('aria-pressed', ds === state.date);
    els.dates.appendChild(b);
  }
}
els.dates.addEventListener('click', e => {
  const b = e.target.closest('.date');
  if (!b) return;
  state.date = b.dataset.date;
  if (isPastSlot(state.date, state.time)) state.time = null;
  renderDates();
  renderTimes();
  validateSelection();
  renderFoot();
});

function renderTimes() {
  els.times.innerHTML = '';
  slotsFor(state.date).forEach(t => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'time' + (state.time === t ? ' is-on' : '');
    b.textContent = fmtTime(t).replace(' ', '').toLowerCase();
    b.dataset.time = t;
    const past = isPastSlot(state.date, t);
    b.disabled = past;
    if (past) b.classList.add('is-full');
    b.setAttribute('aria-pressed', state.time === t);
    els.times.appendChild(b);
  });
}
els.times.addEventListener('click', e => {
  const b = e.target.closest('.time');
  if (!b || b.disabled) return;
  state.time = b.dataset.time;
  renderTimes();
  validateSelection();
  renderFoot();
});

function validateSelection() {
  if (!state.tableId) return;
  const t = TABLES.find(x => x.id === state.tableId);
  if (!t || t.seats < state.guests || tableBooked(t.id, state.date, state.time)) {
    state.tableId = null;
    scene.setSelected(null);
    renderPlan();
  }
  renderFoot();
}

/* ------------------------------------------------------------------ *
 *  step 2 — floor plan + 3d picking
 * ------------------------------------------------------------------ */
function planPos(x, z) {
  return {
    left: 8 + ((x + 6.6) / 13.2) * 84,
    top: 8 + ((z + 6) / 13.2) * 84,
  };
}
function renderPlan() {
  if (!els.plan) return;
  $$('.plan__table', els.plan).forEach(n => n.remove());
  TABLES.forEach(t => {
    const p = planPos(t.x, t.z);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'plan__table';
    b.dataset.table = t.id;
    const tooSmall = t.seats < state.guests;
    const taken = tableBooked(t.id, state.date, state.time);
    b.classList.toggle('is-off', tooSmall || taken);
    b.classList.toggle('is-sel', state.tableId === t.id);
    b.style.left = p.left + '%';
    b.style.top = p.top + '%';
    b.style.width = (t.seats >= 6 ? 58 : t.seats === 4 ? 42 : 32) + 'px';
    b.style.height = (t.seats >= 6 ? 30 : t.seats === 4 ? 36 : 32) + 'px';
    b.title = `${t.id} · ${t.seats} seats · ${t.zone}${taken ? ' · booked at this time' : tooSmall ? ' · too small for your party' : ''}`;
    b.setAttribute('aria-label', `${t.id}, ${t.seats} seats, ${t.zone}`);
    b.innerHTML = `<span class="dots">${'<i></i>'.repeat(Math.min(t.seats, 6))}</span>`;
    b.addEventListener('click', () => {
      if (tooSmall) return toast(`Table ${t.id} seats ${t.seats}. Try a larger table.`);
      if (taken) return toast(`Table ${t.id} is taken at ${fmtTime(state.time)}.`);
      selectTable(t.id);
    });
    els.plan.appendChild(b);
  });
}

function selectTable(id) {
  const t = TABLES.find(x => x.id === id);
  if (!t) return;
  if (t.seats < state.guests) {
    toast(`Table ${id} seats ${t.seats} — too small for ${state.guests}.`);
    return;
  }
  if (tableBooked(id, state.date, state.time)) {
    toast(`Table ${id} is taken at ${fmtTime(state.time)}.`);
    return;
  }
  state.tableId = id;
  scene.setSelected(id);
  renderPlan();
  els.picked.hidden = false;
  els.pickedId.textContent = t.id;
  els.pickedZone.textContent = t.zone;
  els.pickedSeats.textContent = `${t.seats} seats`;
  els.stageNoteText.textContent = `${t.id} · ${t.zone}`;
  if (state.step === 1) goStep(2);
  renderFoot();
}

/* 3D hover + click */
const stage = $('.reserve__stage');
let hoverRaf = 0;
function updateTip(cx, cy) {
  if (!scene.hoverId) { els.tip.hidden = true; return; }
  const p = scene.screenPos(scene.hoverId);
  const t = TABLES.find(x => x.id === scene.hoverId);
  if (!p || !t || !p.visible) { els.tip.hidden = true; return; }
  els.tip.hidden = false;
  els.tip.textContent = `${t.id} · ${t.seats} seats`;
  els.tip.style.left = `${p.x}px`;
  els.tip.style.top = `${p.y}px`;
}
stage.addEventListener('pointermove', e => {
  const id = scene.pickAt(e.clientX, e.clientY);
  const playable = id && (() => {
    const t = TABLES.find(x => x.id === id);
    return t && t.seats >= state.guests && !tableBooked(id, state.date, state.time);
  })();
  scene.hoverId = id;
  stage.style.cursor = playable ? 'pointer' : 'default';
  cancelAnimationFrame(hoverRaf);
  hoverRaf = requestAnimationFrame(() => updateTip(e.clientX, e.clientY));
}, { passive: true });
stage.addEventListener('pointerleave', () => {
  scene.hoverId = null;
  els.tip.hidden = true;
});
stage.addEventListener('click', e => {
  if (state.step === 4) return;
  if (e.target.closest('a,button')) return;
  const id = scene.pickAt(e.clientX, e.clientY);
  if (!id) return;
  selectTable(id);
});

/* ------------------------------------------------------------------ *
 *  step 3 / 4 — details, confirmation
 * ------------------------------------------------------------------ */
function renderSummary() {
  const t = TABLES.find(x => x.id === state.tableId);
  els.summary.innerHTML = `
    <div><span class="s-k">Date</span><span class="s-v"><strong>${fmtDateLong(state.date)}</strong></span></div>
    <div><span class="s-k">Time</span><span class="s-v"><strong>${fmtTime(state.time)}</strong></span></div>
    <div><span class="s-k">Guests</span><span class="s-v">${state.guests} ${state.guests === 1 ? 'guest' : 'guests'}</span></div>
    <div><span class="s-k">Table</span><span class="s-v"><strong>${t ? t.id : '—'}</strong>${t ? ` · ${t.seats} seats` : ''}</span></div>
    <div style="grid-column:1/-1"><span class="s-k">Where</span><span class="s-v">${t ? t.zone : '—'}</span></div>
  `;
}

function goStep(n) {
  state.step = n;
  els.panels.forEach(p => { p.hidden = Number(p.dataset.panel) !== n; });
  els.steps.forEach(li => {
    const i = Number(li.dataset.stepDot);
    li.classList.toggle('is-active', i === n);
    li.classList.toggle('is-done', i < n);
  });
  els.back.hidden = n === 1 || n === 4;
  if (n === 1) {
    els.next.hidden = false;
    els.next.textContent = 'Choose a table';
    els.next.disabled = false;
  } else if (n === 2) {
    els.next.hidden = false;
    els.next.textContent = 'Continue';
    els.next.disabled = !state.tableId;
  } else if (n === 3) {
    els.next.hidden = false;
    els.next.textContent = 'Confirm reservation';
    els.next.disabled = false;
    renderSummary();
  } else {
    els.next.hidden = true;
  }
  $('.booker__scroll').scrollTop = 0;
  renderFoot();
}

function renderFoot() {
  const d = state.date === todayStr ? 'today' : fmtDateLong(state.date);
  const t = TABLES.find(x => x.id === state.tableId);
  els.footSummary.textContent = `${state.guests} ${state.guests === 1 ? 'guest' : 'guests'} · ${d} · ${fmtTime(state.time)}${t ? ` · ${t.id}` : ''}`;
  if (state.step === 2) els.next.disabled = !state.tableId;
}

function validPhone(raw) {
  const digits = raw.replace(/[^\d]/g, '');
  const ten = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}

els.next.addEventListener('click', () => {
  if (state.step === 1) {
    if (!state.time) return toast('Pick a time for your table.');
    goStep(2);
  } else if (state.step === 2) {
    if (!state.tableId) return toast('Pick a table in the room or on the plan.');
    goStep(3);
  } else if (state.step === 3) {
    confirmBooking();
  }
});
els.back.addEventListener('click', () => goStep(Math.max(1, state.step - 1)));

function confirmBooking() {
  const name = els.name.value.trim();
  const phone = validPhone(els.phone.value);
  els.error.hidden = true;
  if (name.length < 2) {
    els.error.textContent = 'Please add a name we can call out.';
    els.error.hidden = false;
    els.name.focus();
    return;
  }
  if (!phone) {
    els.error.textContent = 'A 10-digit Indian mobile number, please.';
    els.error.hidden = false;
    els.phone.focus();
    return;
  }
  if (!state.tableId) { els.error.textContent = 'Pick a table first.'; els.error.hidden = false; return; }
  if (tableBooked(state.tableId, state.date, state.time)) {
    els.error.textContent = 'Someone just took that table. Please pick another.';
    els.error.hidden = false;
    state.tableId = null;
    scene.setSelected(null);
    renderPlan();
    goStep(2);
    return;
  }

  const code = 'ZZ-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const booking = {
    code, tableId: state.tableId, guests: state.guests, date: state.date, time: state.time,
    name, phone, note: els.note.value.trim(), createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  saveBookings(bookings);

  const t = TABLES.find(x => x.id === state.tableId);
  els.doneSub.textContent = `${fmtDateFull(state.date)} · ${fmtTime(state.time)}`;
  els.doneCard.innerHTML = `
    <div class="dc-row"><span class="dc-k">Reference</span><span class="dc-v dc-code">${code}</span></div>
    <div class="dc-row"><span class="dc-k">Table</span><span class="dc-v">${t.id} · ${t.seats} seats<br><span style="color:rgba(21,27,20,.5);font-size:.72rem">${t.zone}</span></span></div>
    <div class="dc-row"><span class="dc-k">Guests</span><span class="dc-v">${state.guests}</span></div>
    <div class="dc-row"><span class="dc-k">Name</span><span class="dc-v">${escapeHtml(name)}</span></div>
  `;
  goStep(4);
  els.stageNoteText.textContent = `${t.id} held for ${name.split(' ')[0]}`;
  toast(`Table ${t.id} held · ${code}`);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

$('#againBtn').addEventListener('click', () => {
  state.tableId = null;
  scene.setSelected(null);
  els.name.value = '';
  els.phone.value = '';
  els.note.value = '';
  els.picked.hidden = true;
  els.stageNoteText.textContent = 'Tap any table in the room';
  renderPlan();
  goStep(1);
});

els.form.addEventListener('submit', e => {
  e.preventDefault();
  confirmBooking();
});

/* ------------------------------------------------------------------ *
 *  init
 * ------------------------------------------------------------------ */
renderGuests();
renderDates();
renderTimes();
renderPlan();
goStep(1);
addEventListener('load', () => scene.measure());
setTimeout(() => scene.measure(), 600);
addEventListener('resize', () => scene.measure(), { passive: true });
