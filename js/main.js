import { content } from './content.js';

const { site, scenes } = content;

/* ---------- helpers ---------- */

const esc = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const pad = (n) => String(n).padStart(2, '0');

const isPlaceholder = (value) => !value || /^\[.*\]$/.test(value.trim());

const mailto = (subject) =>
  `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

/* Headline lines: each line is its own span so it can animate separately,
   with a trailing space so copied text reads as a sentence. */
const headlineLines = (lines) =>
  lines
    .map(({ text, outline }) => `<span class="line${outline ? ' line--outline' : ''}"><span class="line__inner">${esc(text)}</span></span> `)
    .join('');

const chips = (items) =>
  `<ul class="chips">${items.map((s) => `<li class="chip">${esc(s)}</li>`).join('')}</ul>`;

const bigWord = (word) => (word ? `<p class="bigword" aria-hidden="true">${esc(word)}</p>` : '');

const label = (index, text) =>
  `<p class="label mono" data-anim="label"><span class="label__num">${pad(index + 1)}</span>${esc(text)}</p>`;

/* ---------- scene renderers ---------- */

const renderers = {
  intro: (s, i) => `
    <div class="scene__inner scene__inner--intro">
      ${label(i, s.label)}
      <h1 class="headline headline--xl" id="${s.id}-title">${headlineLines(s.headline)}</h1>
      <p class="lede" data-anim="panel">${esc(s.text)}</p>
    </div>
    <p class="scroll-hint mono" aria-hidden="true"><span>Scroll</span><span class="scroll-hint__bar"></span></p>`,

  work: (s, i) => `
    ${bigWord(s.bigWord)}
    <div class="scene__inner">
      ${label(i, s.label)}
      <h2 class="headline headline--lg" id="${s.id}-title">${headlineLines([{ text: s.heading }])}</h2>
      <ul class="grid grid--3 cards">
        ${s.projects.map(projectCard).join('')}
      </ul>
    </div>`,

  experience: (s, i) => `
    ${bigWord(s.bigWord)}
    <div class="scene__inner">
      ${label(i, s.label)}
      <h2 class="headline headline--lg" id="${s.id}-title">${headlineLines([{ text: s.heading }])}</h2>
      <ol class="grid grid--3 roles">
        ${s.roles
          .map(
            (r) => `
          <li class="panel role" data-anim="panel">
            <p class="panel__meta mono">${esc(r.dates)}</p>
            <h3 class="panel__title">${esc(r.title)}</h3>
            <p class="role__org">${esc(r.org)}<span class="role__place"> · ${esc(r.place)}</span></p>
            <p class="panel__text">${esc(r.summary)}</p>
            ${r.tags?.length ? chips(r.tags) : ''}
          </li>`
          )
          .join('')}
      </ol>
    </div>`,

  skills: (s, i) => `
    ${bigWord(s.bigWord)}
    <div class="scene__inner">
      ${label(i, s.label)}
      <h2 class="headline headline--lg" id="${s.id}-title">${headlineLines([{ text: s.heading }])}</h2>
      <ul class="grid grid--3">
        ${s.groups
          .map(
            (g, gi) => `
          <li class="panel" data-anim="panel">
            <p class="panel__meta mono">${pad(gi + 1)}</p>
            <h3 class="panel__title">${esc(g.title)}</h3>
            <p class="panel__text">${esc(g.text)}</p>
            ${chips(g.skills)}
          </li>`
          )
          .join('')}
      </ul>
    </div>`,

  education: (s, i) => `
    ${bigWord(s.bigWord)}
    <div class="scene__inner">
      ${label(i, s.label)}
      <h2 class="headline headline--lg" id="${s.id}-title">${headlineLines([{ text: s.heading }])}</h2>
      <ol class="grid grid--3">
        ${s.entries
          .map(
            (e) => `
          <li class="panel" data-anim="panel">
            <p class="panel__meta mono">${esc(e.dates)}</p>
            <h3 class="panel__title">${esc(e.title)}</h3>
            <p class="role__org">${esc(e.school)}</p>
            ${e.note ? `<p class="panel__text">${esc(e.note)}</p>` : ''}
          </li>`
          )
          .join('')}
      </ol>
    </div>`,

  contact: (s, i) => `
    <div class="scene__inner">
      ${label(i, s.label)}
      <h2 class="headline headline--xl" id="${s.id}-title">${headlineLines(s.headline)}</h2>
      <div class="grid grid--2">
        ${s.panels.map(contactPanel).join('')}
      </div>
      <footer class="footer mono" data-anim="panel">
        <a href="${esc(mailto())}">${esc(site.email)}</a>
        ${site.links.map((l) => `<a href="${esc(l.href)}" rel="me noopener" target="_blank">${esc(l.label)}</a>`).join('')}
        <span>© ${new Date().getFullYear()} ${esc(site.name)}</span>
      </footer>
    </div>`,
};

function projectCard(p) {
  const shownClient = p.private ? 'Private client' : isPlaceholder(p.client) ? '' : p.client;
  const images = p.images ?? [];
  const shot = images.length
    ? images
        .map(
          (img, i) =>
            `<img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy" decoding="async" width="1440" height="900"${i === 0 ? ' class="is-active"' : ''}>`
        )
        .join('')
    : `<span class="card__cover" aria-hidden="true"><span class="card__cover-title">${esc(p.title)}</span></span>`;
  const showLink = p.live !== false && !isPlaceholder(p.url);
  const title = !showLink
    ? esc(p.title)
    : `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;

  return `
    <li class="panel card" data-anim="panel">
      <div class="card__shot${images.length > 1 ? ' card__shot--cycle' : ''}${images.length ? '' : ' card__shot--cover'}">${shot}</div>
      <p class="panel__meta mono">${esc(p.type)}${shownClient && shownClient !== p.title ? ` · ${esc(shownClient)}` : ''}${p.status ? ` <span class="tag">${esc(p.status)}</span>` : ''}</p>
      <h3 class="panel__title">${title}</h3>
      <p class="panel__text">${esc(p.description)}</p>
      ${p.tags?.length ? chips(p.tags) : ''}
    </li>`;
}

/* Cards with several screenshots crossfade between them. Paused when the tab
   is hidden; with reduced motion only the first screenshot is shown. */
function cycleShots() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sets = [...document.querySelectorAll('.card__shot--cycle')];
  if (!sets.length) return;
  setInterval(() => {
    if (document.hidden) return;
    sets.forEach((set) => {
      const imgs = [...set.querySelectorAll('img')];
      const current = imgs.findIndex((img) => img.classList.contains('is-active'));
      imgs[current].classList.remove('is-active');
      imgs[(current + 1) % imgs.length].classList.add('is-active');
    });
  }, 3200);
}

function contactPanel(p) {
  // buttons: the first visible one is filled, any after it are outlined
  const links = p.actions
    .map((action) => {
      if (action.type === 'cv') {
        // hidden until site.cv.enabled is true in content.js
        return site.cv.enabled ? { href: site.cv.href, label: action.label, download: site.cv.downloadName } : null;
      }
      if (action.type === 'email') return { href: mailto(action.subject), label: action.label };
      return { href: action.href, label: action.label, external: true };
    })
    .filter(Boolean)
    .map(
      (l, i) =>
        `<a class="btn${i ? ' btn--ghost' : ''}" href="${esc(l.href)}"${l.download ? ` download="${esc(l.download)}"` : ''}${l.external ? ' target="_blank" rel="me noopener"' : ''}>${esc(l.label)}${l.external ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ''}</a>`
    )
    .join('');
  const link = links ? `<div class="btn-row">${links}</div>` : '';
  // email links do nothing on devices with no mail app set up, so the address
  // is always visible too, with a copy button
  const emailAlt = p.actions.some((a) => a.type === 'email')
    ? `<p class="panel__alt">or email <a href="${esc(mailto())}">${esc(site.email)}</a>
        <button class="copy-btn mono" type="button" data-copy="${esc(site.email)}">Copy</button>
        <span class="visually-hidden" role="status" aria-live="polite" data-copy-status></span></p>`
    : '';
  return `
    <div class="panel panel--contact" data-anim="panel">
      <h3 class="panel__title panel__title--lg">${esc(p.title)}</h3>
      <p class="panel__text">${esc(p.text)}</p>
      ${link}
      ${emailAlt}
    </div>`;
}

/* ---------- copy email ---------- */

function enableCopyButtons() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const text = btn.dataset.copy;
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // older browsers / non-secure contexts: copy via a temporary text field
      const field = Object.assign(document.createElement('textarea'), { value: text });
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;opacity:0';
      document.body.append(field);
      field.select();
      ok = document.execCommand('copy');
      field.remove();
    }
    btn.textContent = ok ? 'Copied' : 'Copy failed';
    const status = btn.parentElement.querySelector('[data-copy-status]');
    if (status) status.textContent = ok ? 'Email address copied' : 'Could not copy the email address';
    clearTimeout(btn._reset);
    btn._reset = setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  });
}

/* ---------- render ---------- */

function render() {
  const stage = document.querySelector('[data-stage]');
  stage.innerHTML = scenes
    .map(
      (s, i) => `
    <section class="scene scene--${s.id}" id="${s.id}" data-scene="${i}" tabindex="-1" aria-labelledby="${s.id}-title">
      ${renderers[s.id](s, i)}
    </section>`
    )
    .join('');

  document.querySelector('[data-dots]').innerHTML = scenes
    .map(
      (s, i) => `
    <li><a class="dot" href="#${s.id}" data-dot="${i}"><span class="visually-hidden">${esc(s.nav)}</span><span class="dot__label mono" aria-hidden="true">${esc(s.nav)}</span></a></li>`
    )
    .join('');

  document.querySelector('[data-counter-total]').textContent = pad(scenes.length);
}

/* ---------- active scene (counter + dots) ---------- */

export function setActiveScene(index) {
  const s = scenes[index];
  if (!s) return;
  document.querySelector('[data-counter-num]').textContent = pad(index + 1);
  document.querySelector('[data-counter-name]').textContent = s.nav;
  document.querySelectorAll('[data-dot]').forEach((dot, i) => {
    if (i === index) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  document.documentElement.dataset.scene = s.id;
}

const isStaged = () => document.documentElement.classList.contains('is-staged');

/* Stacked layout: whichever section crosses the middle of the viewport is active.
   (In the pinned desktop layout, scenes.js reports the active scene instead.) */
function watchSections() {
  const observer = new IntersectionObserver(
    (entries) => {
      if (isStaged()) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveScene(Number(entry.target.dataset.scene));
      });
    },
    { rootMargin: '-50% 0px -50% 0px' }
  );
  document.querySelectorAll('.scene').forEach((el) => observer.observe(el));
}

/* ---------- device capabilities ---------- */

function detectMode() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  const lowPower =
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
    navigator.connection?.saveData === true;

  let webgl = false;
  try {
    const c = document.createElement('canvas');
    webgl = !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { /* no WebGL */ }

  return {
    reducedMotion,
    small,
    background: reducedMotion || lowPower || !webgl ? 'static' : small ? 'light' : 'full',
  };
}

/* ---------- background ---------- */

/* Background position as a continuous scene index (0 = first scene, 1 = second...).
   Pinned layout: scenes.js feeds the timeline time. Stacked layout: measured
   from where the sections sit in the viewport. */
let bg = null;
let bgProgress = 0;
function setBgProgress(value) {
  bgProgress = value;
  bg?.setProgress(value);
}

function sectionProgress() {
  const mid = window.innerHeight / 2;
  const sections = document.querySelectorAll('.scene');
  let progress = 0;
  sections.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    if (r.top <= mid) progress = i + Math.min(Math.max((mid - r.top) / r.height, 0), 1) - 0.5;
  });
  return Math.min(Math.max(progress, 0), sections.length - 1);
}

function followStackedScroll() {
  const update = () => { if (!isStaged()) setBgProgress(sectionProgress()); };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

async function startBackground(mode) {
  if (mode.background === 'static') return;

  const root = document.documentElement;
  const fallback = () => {
    bg?.dispose();
    bg = null;
    root.classList.remove('has-webgl');
    root.dataset.bg = 'static';
  };

  try {
    const { initBackground } = await import('./background.js');
    bg = initBackground({
      container: document.getElementById('bg'),
      quality: mode.background,
      onFallback: fallback,
    });
  } catch (err) {
    console.warn('[bg] falling back to static background', err);
    return;
  }
  if (!bg) return;

  bg.setProgress(bgProgress);
  bg.snap();
  if (new URLSearchParams(location.search).has('debug')) window.__bg = bg;

  // fade the canvas in over the static background
  requestAnimationFrame(() => root.classList.add('has-webgl'));
}

/* ---------- scenes ---------- */

async function startScenes(mode) {
  if (mode.reducedMotion) return;
  try {
    const { initScenes } = await import('./scenes.js');
    initScenes({ onProgress: setBgProgress, onActive: setActiveScene });
  } catch (err) {
    // the page stays a readable stacked layout if the animation libraries fail to load
    console.warn('[scenes] animation unavailable', err);
  }
}

/* ---------- boot ---------- */

const mode = detectMode();
document.documentElement.dataset.bg = mode.background;

render();
enableCopyButtons();
cycleShots();
setActiveScene(0);
watchSections();
followStackedScroll();
startScenes(mode);
startBackground(mode);
