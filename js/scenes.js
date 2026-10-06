/*
  Scroll-driven scenes (desktop). All scenes are stacked inside one pinned
  stage, and a single timeline is scrubbed by scroll position. Timeline time
  is measured in scenes: time 0 = scene 1 fully shown, time 1 = scene 2, ...
  Each handoff overlaps the outgoing and incoming scene, so nothing cuts.

  On smaller screens or with reduced motion, gsap.matchMedia reverts all of
  this and the page falls back to normal stacked sections.
*/
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
// some scenes have no giant word or scroll hint; empty selections are expected
gsap.config({ nullTargetWarn: false });

const STAGED_QUERY = '(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const SCROLL_PER_SCENE = 1.5; // viewport heights of scrolling per handoff
const SCRUB = 0.8; // seconds of smoothing between scroll and timeline

/* ---------- choreography ---------- */

/* Outgoing scene: content drifts up, blurs and fades. */
function leave(tl, scene, at) {
  const q = gsap.utils.selector(scene);
  const out = { immediateRender: false, ease: 'power2.in' };

  tl.fromTo(q('.scroll-hint'), { opacity: 1 }, { opacity: 0, duration: 0.12, ...out }, at - 0.18)
    .fromTo(q('.bigword'), { x: 0, opacity: 1 }, { x: '-22vw', opacity: 0, duration: 0.55, ...out }, at)
    .fromTo(q('.label'), { y: 0, opacity: 1 }, { y: -40, opacity: 0, duration: 0.3, ...out }, at)
    .fromTo(
      q('.line'),
      { yPercent: 0, opacity: 1, filter: 'blur(0px)' },
      { yPercent: -45, opacity: 0, filter: 'blur(12px)', duration: 0.32, stagger: 0.045, ...out },
      at
    )
    // panels: no blur (they already use backdrop-filter, and blurring both is costly)
    .fromTo(
      q('[data-anim="panel"]'),
      { y: 0, opacity: 1 },
      { y: -70, opacity: 0, duration: 0.3, stagger: 0.04, ...out },
      at + 0.06
    )
    .set(scene, { autoAlpha: 0 }, at + 0.62);
}

/* Incoming scene: giant word slides in from the side, headline lines rise and
   un-blur one after another, then panels follow with a stagger. */
function enter(tl, scene, at) {
  const q = gsap.utils.selector(scene);
  const inn = { ease: 'power3.out' }; // fromTo renders its start state immediately, so the scene waits hidden

  tl.set(scene, { autoAlpha: 1 }, at - 0.02)
    .fromTo(q('.bigword'), { x: '32vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ...inn }, at)
    .fromTo(q('.label'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ...inn }, at + 0.04)
    .fromTo(
      q('.line'),
      { yPercent: 60, opacity: 0, filter: 'blur(14px)' },
      { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.42, stagger: 0.07, ...inn },
      at + 0.08
    )
    .fromTo(
      q('[data-anim="panel"]'),
      { y: 90, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.36, stagger: 0.06, ...inn },
      at + 0.2
    );
}

/* Full handoff: the next scene starts arriving while the current one is still leaving. */
function handoff(tl, from, to, i) {
  leave(tl, from, i + 0.15);
  enter(tl, to, i + 0.4);
}

/* Intro arrives on page load (the only time-based animation). */
function revealIntro(scene) {
  const q = gsap.utils.selector(scene);
  return gsap
    .timeline({ delay: 0.25, defaults: { ease: 'expo.out' } })
    .from(q('.label'), { y: 24, opacity: 0, duration: 1 })
    .from(q('.line__inner'), { yPercent: 70, opacity: 0, filter: 'blur(16px)', duration: 1.4, stagger: 0.14 }, 0.1)
    .from(q('[data-anim="panel"]'), { y: 30, opacity: 0, duration: 1.1 }, 0.55)
    .from(q('.scroll-hint'), { opacity: 0, duration: 1 }, 0.9);
}

/* ---------- setup ---------- */

export function initScenes({ onProgress, onActive }) {
  const root = document.documentElement;
  const stage = document.querySelector('[data-stage]');
  const scenes = [...stage.querySelectorAll('.scene')];
  const last = scenes.length - 1;
  const mm = gsap.matchMedia();

  mm.add(STAGED_QUERY, () => {
    root.classList.add('is-staged');

    /* smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync */
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    const lenisRaf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);

    /* timeline */
    gsap.set(scenes.slice(1), { autoAlpha: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    for (let i = 0; i < last; i++) handoff(tl, scenes[i], scenes[i + 1], i);
    tl.set({}, {}, last); // pad so timeline time == scene index

    const st = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: () => `+=${window.innerHeight * SCROLL_PER_SCENE * last}`,
      pin: true,
      scrub: SCRUB,
      animation: tl,
      invalidateOnRefresh: true,
    });

    /* active scene + background follow the (smoothed) timeline time */
    let active = -1;
    function setActive(index) {
      if (index === active) return;
      active = index;
      scenes.forEach((s, i) => { s.inert = i !== index; });
      onActive?.(index);
    }
    const sync = () => {
      const t = tl.time();
      onProgress?.(t);
      setActive(Math.round(t));
    };
    gsap.ticker.add(sync);
    setActive(0);

    /* resting halfway through a handoff looks broken, so settle on the nearest scene */
    const scrollFor = (index) => st.start + (st.end - st.start) * (index / last);
    let settleTimer = 0;
    lenis.on('scroll', () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        const t = st.progress * last;
        if (st.progress <= 0 || st.progress >= 1) return;
        const frac = t - Math.floor(t);
        if (frac < 0.1 || frac > 0.9) return;
        const target = lenis.direction > 0 ? (frac > 0.3 ? Math.ceil(t) : Math.floor(t)) : frac < 0.7 ? Math.floor(t) : Math.ceil(t);
        lenis.scrollTo(scrollFor(target), { duration: 0.9 });
      }, 220);
    });

    /* in-page links (dots, name, hash links) go to a scene's resting point */
    function goTo(index, { immediate = false } = {}) {
      const distance = Math.abs(index - active);
      lenis.resize(); // the pin adds page height; make sure Lenis knows before jumping
      setActive(index);
      lenis.scrollTo(scrollFor(index), {
        immediate,
        duration: 1.2 + distance * 0.25,
        onComplete: () => scenes[index].focus({ preventScroll: true }),
      });
    }
    function onClick(e) {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const index = scenes.findIndex((s) => `#${s.id}` === link.getAttribute('href'));
      if (index < 0) return;
      e.preventDefault();
      goTo(index);
      history.replaceState(null, '', index === 0 ? location.pathname + location.search : `#${scenes[index].id}`);
    }
    document.addEventListener('click', onClick);

    /* intro reveal, and honour a #scene hash on load */
    const startIndex = scenes.findIndex((s) => `#${s.id}` === location.hash);
    if (startIndex > 0) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        goTo(startIndex, { immediate: true });
      });
    } else {
      revealIntro(scenes[0]);
    }

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    if (new URLSearchParams(location.search).has('debug')) window.__scenes = { tl, st, lenis, goTo };

    return () => {
      clearTimeout(settleTimer);
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(sync);
      gsap.ticker.remove(lenisRaf);
      lenis.destroy();
      scenes.forEach((s) => { s.inert = false; });
      root.classList.remove('is-staged');
    };
  });

  return mm;
}
