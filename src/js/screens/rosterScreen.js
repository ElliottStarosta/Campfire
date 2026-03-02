// src/js/screens/rosterScreen.js

import { qs } from "../dom.js";
import { ChatRoom } from "../AIPersonalities.js";
import { getAvatarSrc } from "../avatars.js";

let _isOpen    = false;
let _modalOpen = false;
let _personalities = [];

//  Init 
export function initRosterScreen() {
  qs("#btn-roster")?.addEventListener("click", openRoster);
  qs("#roster-close")?.addEventListener("click", closeRoster);

  qs("#roster-overlay")?.addEventListener("click", (e) => {
    if (e.target === qs("#roster-overlay")) closeRoster();
  });

  qs("#char-modal-backdrop")?.addEventListener("click", closeModal);
  qs("#char-modal-close")?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (_modalOpen) closeModal();
      else if (_isOpen) closeRoster();
    }
  });

  _personalities = ChatRoom.allPersonalities();
  _buildCarousel();
}

//  Open / Close roster 
export function openRoster() {
  if (_isOpen) return;
  _isOpen = true;

  const overlay = qs("#roster-overlay");
  overlay.classList.add("active");

  qs("#rcar-track")?._startLoop?.();

  gsap.set(overlay,              { opacity: 0 });
  gsap.set(".roster-panel",      { y: 50, opacity: 0 });
  gsap.set(".roster-title-wrap", { opacity: 0, y: -16 });

  gsap.timeline()
    .to(overlay,              { opacity: 1, duration: 0.35, ease: "power2.out" })
    .to(".roster-panel",      { y: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, "-=0.15")
    .to(".roster-title-wrap", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.3")
    .fromTo(".rcar-card:not([data-clone])",
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1,   y: 0,  duration: 0.4, stagger: { amount: 0.5, from: "start" }, ease: "back.out(1.5)" },
      "-=0.3"
    );
}

export function closeRoster() {
  if (!_isOpen) return;
  if (_modalOpen) closeModal();
  _isOpen = false;

  qs("#rcar-track")?._stopLoop?.();

  gsap.timeline()
    .to(".rcar-card",      { opacity: 0, scale: 0.85, duration: 0.2, stagger: { amount: 0.15, from: "end" } })
    .to(".roster-panel",   { y: 30, opacity: 0, duration: 0.3, ease: "power2.in" }, "-=0.1")
    .to("#roster-overlay", {
      opacity: 0, duration: 0.25,
      onComplete: () => qs("#roster-overlay")?.classList.remove("active"),
    }, "-=0.1");
}

//  Build carousel 
function _buildCarousel() {
  const track = qs("#rcar-track");
  if (!track) return;
  track.innerHTML = "";

  // We need an inner div that we'll translate — the track is just the clipping window
  const inner = document.createElement("div");
  inner.className = "rcar-inner";
  inner.style.cssText = `
    display: flex;
    gap: 16px;
    will-change: transform;
    user-select: none;
  `;
  track.appendChild(inner);

  const makeCard = (p, i) => {
    const card = document.createElement("div");
    card.className = "rcar-card";
    card.style.setProperty("--cc", p.color ?? "#efb576");
    card.dataset.index = i;

    const avatarSrc = getAvatarSrc(p.name);
    card.innerHTML = `
      <div class="rcar-glow"></div>
      <div class="rcar-avatar">
        <img src="${avatarSrc}" alt="${_esc(p.name)}" onerror="this.src='/assets/avatars/default.png'" />
      </div>
      <div class="rcar-name">${_esc(p.name)}</div>
      <div class="rcar-hint">tap to meet</div>
    `;

    card.addEventListener("click", () => _openModal(i));

    const glow = card.querySelector(".rcar-glow");
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { y: -10, scale: 1.06, duration: 0.3, ease: "back.out(2)" });
      gsap.to(glow, { opacity: 1, scale: 1.4, duration: 0.35, ease: "power2.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { y: 0, scale: 1, duration: 0.35, ease: "power2.out" });
      gsap.to(glow, { opacity: 0, scale: 1, duration: 0.25 });
    });

    return card;
  };

  // Original set
  _personalities.forEach((p, i) => inner.appendChild(makeCard(p, i)));
  // Clone set for seamless wrap
  _personalities.forEach((p, i) => {
    const clone = makeCard(p, i);
    clone.dataset.clone = "true";
    inner.appendChild(clone);
  });

  _initInfiniteScroll(track, inner);
}

function _initInfiniteScroll(track, inner) {
  // Current translation offset (negative = scrolled right)
  let offset     = 0;
  let rafId      = null;
  let autoScroll = true;
  let isDragging = false;
  let hasDragged = false;
  let dragStartX = 0;
  let dragStartOffset = 0;
  let velocity   = 0;
  let lastDragX  = 0;
  let lastDragT  = 0;
  let flickRaf   = null;

  const AUTO_SPEED = 0.6; // px per frame

  // Measure the width of ONE full set of cards (half the inner div)
  const getSetWidth = () => {
    // half of total children = one set
    const cards = inner.children;
    if (!cards.length) return 0;
    // The inner div is exactly 2 sets wide; measure it and halve
    return inner.scrollWidth / 2;
  };

  const applyTransform = () => {
    inner.style.transform = `translateX(${offset}px)`;
  };

  const clampOffset = () => {
    const setW = getSetWidth();
    if (!setW) return;
    // When we've scrolled one full set to the left, jump back seamlessly
    if (offset <= -setW) offset += setW;
    // When dragged right past start, jump forward
    if (offset > 0) offset -= setW;
  };

  const loop = () => {
    if (autoScroll && !isDragging) {
      offset -= AUTO_SPEED;
    }
    clampOffset();
    applyTransform();
    rafId = requestAnimationFrame(loop);
  };

  rafId = requestAnimationFrame(loop);

  track._stopLoop  = () => { cancelAnimationFrame(rafId); rafId = null; };
  track._startLoop = () => { if (!rafId) rafId = requestAnimationFrame(loop); };

  //  Mouse drag 
  track.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging      = true;
    hasDragged      = false;
    autoScroll      = false;
    dragStartX      = e.clientX;
    dragStartOffset = offset;
    velocity        = 0;
    lastDragX       = e.clientX;
    lastDragT       = Date.now();
    cancelAnimationFrame(flickRaf);
    track.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 3) hasDragged = true;

    offset = dragStartOffset + dx;
    clampOffset();
    applyTransform();

    const now = Date.now();
    const dt  = Math.max(1, now - lastDragT);
    velocity  = (e.clientX - lastDragX) / dt; // px/ms
    lastDragX = e.clientX;
    lastDragT = now;
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = "grab";

    const setW = getSetWidth();

    if (Math.abs(velocity) > 0.05) {
      // Momentum flick — run outside the main loop so they don't fight
      let v = velocity * 14; // px per frame equivalent
      const flick = () => {
        offset += v;
        v *= 0.91;
        clampOffset();
        applyTransform();
        if (Math.abs(v) > 0.3) {
          flickRaf = requestAnimationFrame(flick);
        } else {
          autoScroll = true;
        }
      };
      flickRaf = requestAnimationFrame(flick);
    } else {
      autoScroll = true;
    }
  });

  //  Touch 
  let touchStartX      = 0;
  let touchStartOffset = 0;

  track.addEventListener("touchstart", (e) => {
    autoScroll       = false;
    touchStartX      = e.touches[0].clientX;
    touchStartOffset = offset;
    cancelAnimationFrame(flickRaf);
  }, { passive: true });

  track.addEventListener("touchmove", (e) => {
    const dx = e.touches[0].clientX - touchStartX;
    offset = touchStartOffset + dx;
    clampOffset();
    applyTransform();
  }, { passive: true });

  track.addEventListener("touchend", () => {
    setTimeout(() => { autoScroll = true; }, 800);
  });

  //  Prevent card click when dragged 
  track.addEventListener("click", (e) => {
  if (hasDragged) {
    e.stopImmediatePropagation();
    e.preventDefault();
    hasDragged = false;
  }
}, true);

window.addEventListener("mouseup", () => {
  setTimeout(() => { hasDragged = false; }, 50);
});
}

//  Modal 
function _openModal(index) {
  if (_modalOpen) return;
  _modalOpen = true;

  const p = _personalities[index];
  if (!p) return;

  const backdrop  = qs("#char-modal-backdrop");
  const modal     = qs("#char-modal");
  const avatar    = qs("#cmod-avatar");
  const name      = qs("#cmod-name");
  const tags      = qs("#cmod-tags");
  const persona   = qs("#cmod-personality");
  const style     = qs("#cmod-style");
  const backstory = qs("#cmod-backstory");

  if (avatar) {
    avatar.innerHTML = "";
    const img = document.createElement("img");
    img.src = getAvatarSrc(p.name);
    img.alt = p.name;
    img.onerror = () => { img.src = "/avatars/default.png"; };
    avatar.appendChild(img);
    avatar.style.setProperty("--cc", p.color ?? "#efb576");
  }
  if (name)      name.textContent      = p.name;
  if (persona)   persona.textContent   = p.personality ?? "—";
  if (style)     style.textContent     = p.speakingStyle ?? "—";
  if (backstory) backstory.textContent = p.backstory ?? "—";

  if (tags) {
    tags.innerHTML = (p.traits ?? [])
      .map(t => `<span class="cmod-trait">${_esc(t)}</span>`)
      .join("");
  }

  backdrop.classList.add("active");

  gsap.set(backdrop, { opacity: 0 });
  gsap.set(modal,    { opacity: 0, scale: 0.88, y: 30 });

  gsap.timeline()
    .to(backdrop, { opacity: 1, duration: 0.3, ease: "power2.out" })
    .to(modal,    { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" }, "-=0.15")
    .fromTo("#cmod-avatar",
      { scale: 0.7, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" },
      "-=0.25"
    )
    .fromTo([".cmod-section", "#cmod-name", "#cmod-tags"],
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out" },
      "-=0.2"
    );
}

export function closeModal() {
  if (!_modalOpen) return;
  _modalOpen = false;

  const backdrop = qs("#char-modal-backdrop");
  const modal    = qs("#char-modal");

  gsap.timeline()
    .to(modal,    { opacity: 0, scale: 0.92, y: 20, duration: 0.25, ease: "power2.in" })
    .to(backdrop, {
      opacity: 0, duration: 0.2,
      onComplete: () => backdrop?.classList.remove("active"),
    }, "-=0.1");
}

function _esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}