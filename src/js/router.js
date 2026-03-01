// src/js/router.js

import { state } from './state.js';
import { qs } from './dom.js';

const SCREENS = ['start', 'onboarding', 'game', 'voting', 'result'];
let _current = null;

export function goTo(name) {
  if (!SCREENS.includes(name)) return;
  const next = qs(`#${name}-screen`);
  if (!next) return;

  state.phase = name;

  // If a full-screen cinematic overlay is up (fs-stage or fire-flash),
  // skip ALL crossfade — just swap instantly underneath
  const cinemaActive = !!document.getElementById("fs-stage");

  if (_current && _current !== next) {
    if (cinemaActive) {
      _current.classList.remove("active");
      _current.style.opacity = "";
      _showScreen(next, name, true);
    } else {
      gsap.to(_current, {
        opacity: 0, duration: 0.35, ease: "power2.inOut",
        onComplete: () => {
          _current.classList.remove("active");
          _current.style.opacity = "";
          _showScreen(next, name, false);
        },
      });
    }
  } else {
    if (_current) _current.classList.remove("active");
    _showScreen(next, name, false);
  }

  _current = next;
}

function _showScreen(el, name, instant) {
  // Force-remove active from ALL screens before showing the next one
  document.querySelectorAll(".screen").forEach(s => {
    if (s !== el) {
      s.classList.remove("active");
      s.style.opacity = "";
    }
  });

  el.classList.add("active");

  if (instant) {
    gsap.set(el, { opacity: 1 });
    return;
  }

  switch (name) {
    case 'start':
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' });
      break;
    case 'onboarding':
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
      gsap.fromTo('.onboarding-card',
        { opacity: 0, y: 28, scale: 0.96 },
        { opacity: 1, y: 0,  scale: 1, duration: 0.6, delay: 0.1, ease: 'back.out(1.6)' });
      break;
    case 'game':
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
      break;
    case 'voting':
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
      break;
    case 'result':
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' });
      break;
    default:
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4 });
  }
}


export function initRouter() {
  const start = qs('#start-screen');
  if (start) {
    start.classList.add('active');
    _current = start;
  }
}