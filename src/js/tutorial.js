import { qs } from "./dom.js";

//  SVG icons ─

const ICONS = {
  fire: `<svg viewBox="0 0 24 24"><path d="M12 2C12 2 8 6 8 10C8 10 6 8.5 6 7C4 9 3 11.5 3 14C3 18.3 7.1 22 12 22C16.9 22 21 18.3 21 14C21 9 12 2 12 2Z"/><path d="M12 22C12 22 9 19 9 16C9 14.5 10 13 12 13C14 13 15 14.5 15 16C15 19 12 22 12 22Z"/></svg>`,
  chat: `<svg viewBox="0 0 24 24"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"/></svg>`,
  mask: `<svg viewBox="0 0 24 24"><path d="M12 3C7 3 3 6 3 10V14C3 16.2 4.1 18.2 5.9 19.5C7.6 20.7 9.7 21 12 21C14.3 21 16.4 20.7 18.1 19.5C19.9 18.2 21 16.2 21 14V10C21 6 17 3 12 3Z"/><path d="M9 11C9 11.6 8.6 12 8 12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10C8.6 10 9 10.4 9 11Z" fill="currentColor" stroke="none"/><path d="M17 11C17 11.6 16.6 12 16 12C15.4 12 15 11.6 15 11C15 10.4 15.4 10 16 10C16.6 10 17 10.4 17 11Z" fill="currentColor" stroke="none"/><path d="M9 15C9.5 16.2 10.7 17 12 17C13.3 17 14.5 16.2 15 15"/></svg>`,
  vote: `<svg viewBox="0 0 24 24"><path d="M9 11L12 14L22 4"/><path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"/></svg>`,
  win:  `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M12 14L9 21H15L12 14Z"/><path d="M8 14L3 21"/><path d="M16 14L21 21"/></svg>`,
};

//  Slides 

const SLIDES = [
  {
    icon: ICONS.fire,
    title: "Gather Around",
    body: `Six AI characters and <strong>one human</strong> — you — sit around the same campfire. Nobody knows who is human. Your only goal is to <strong>not be found out</strong>.`,
    pills: [],
  },
  {
    icon: ICONS.chat,
    title: "A Question is Lit",
    body: `Everyone gets the <strong>same prompt</strong>. A countdown burns down. Then the chat opens — the AIs start talking immediately. You have <strong>90 seconds</strong>.`,
    pills: ["90 seconds", "random prompt", "3 messages minimum"],
  },
  {
    icon: ICONS.mask,
    title: "Blend In",
    body: `Type like a person who is <strong>pretending to be an AI</strong>. Be casual, stay in the conversation, react to what others say. Sound too human and they will notice.`,
    pills: [],
  },
  {
    icon: ICONS.vote,
    title: "The Vote",
    body: `When the fire dies down, each AI <strong>reviews the transcript</strong> and casts a vote for who they think is human. Their personalities shape their suspicion.`,
    pills: ["6 votes", "in-character reasoning"],
  },
  {
    icon: ICONS.win,
    title: "Win the Night",
    body: `If you receive the <strong>most votes</strong>, you are found. If the AIs disagree enough among themselves, you slip away undetected. Blend in to win.`,
    pills: [],
  },
];

//  State ─

let _current = 0;
let _isOpen  = false;

//  Init 

export function initTutorial() {
  _buildHTML();
  _bindEvents();
}

//  Open / Close ─

export function openTutorial() {
  if (_isOpen) return;
  _isOpen  = true;
  _current = 0;

  const backdrop = document.getElementById("tutorial-backdrop");
  const modal    = document.getElementById("tutorial-modal");

  backdrop.classList.add("active");
  _goToSlide(0, false);

  gsap.set(backdrop, { opacity: 0, visibility: "visible" });
  gsap.set(modal,    { opacity: 0, y: 32, scale: 0.94 });

  gsap.timeline()
    .to(backdrop, { opacity: 1, duration: 0.35, ease: "power2.out" })
    .to(modal,    { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }, "-=0.2")
    .fromTo(".tut-header", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.25")
    .fromTo(".tut-footer", { opacity: 0, y: 10  }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.25");
}

export function closeTutorial() {
  if (!_isOpen) return;
  _isOpen = false;

  const backdrop = document.getElementById("tutorial-backdrop");
  const modal    = document.getElementById("tutorial-modal");

  gsap.timeline({
    onComplete: () => {
      backdrop.classList.remove("active");
      gsap.set(backdrop, { clearProps: "all" });
      gsap.set(modal,    { clearProps: "all" });
    },
  })
    .to(modal,    { opacity: 0, y: 20, scale: 0.95, duration: 0.28, ease: "power2.in" })
    .to(backdrop, { opacity: 0, duration: 0.25 }, "-=0.1");
}

//  Build DOM 

function _buildHTML() {
  const backdrop = document.createElement("div");
  backdrop.id = "tutorial-backdrop";

  const modal = document.createElement("div");
  modal.id = "tutorial-modal";

  modal.innerHTML = `
    <div class="tut-header">
      <div>
        <span class="tut-eyebrow">Guide</span>
        <span class="tut-heading">How to Play</span>
      </div>
      <button class="tut-close" id="tut-close" aria-label="Close">✕</button>
    </div>
    <div class="tut-viewport" id="tut-viewport"></div>
    <div class="tut-footer">
      <button class="tut-arrow" id="tut-prev" aria-label="Previous" disabled>
        <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="tut-dots" id="tut-dots"></div>
      <button class="tut-arrow" id="tut-next" aria-label="Next">
        <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  `;

  // Slides
  const viewport = modal.querySelector("#tut-viewport");
  SLIDES.forEach((s, i) => {
    const slide = document.createElement("div");
    slide.className = `tut-slide${i === 0 ? " active" : ""}`;
    slide.dataset.index = i;
    const pillsHTML = s.pills.length
      ? `<div class="tut-pills">${s.pills.map((p, pi) => `<span class="tut-pill${pi === 0 ? " lit" : ""}">${p}</span>`).join("")}</div>`
      : "";
    slide.innerHTML = `
      <div class="tut-icon">${s.icon}</div>
      <div class="tut-slide-title">${s.title}</div>
      <p class="tut-slide-body">${s.body}</p>
      ${pillsHTML}
    `;
    viewport.appendChild(slide);
  });

  // Dots
  const dotsEl = modal.querySelector("#tut-dots");
  SLIDES.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = `tut-dot${i === 0 ? " active" : ""}`;
    dot.setAttribute("aria-label", `Slide ${i + 1}`);
    dot.dataset.index = i;
    dotsEl.appendChild(dot);
  });

  // CTA
  const cta = document.createElement("button");
  cta.className = "tut-cta";
  cta.id = "tut-cta";
  cta.textContent = "Let's go";
  modal.querySelector(".tut-footer").appendChild(cta);

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

//  Events ─

function _bindEvents() {
  // This is the one that was missing
  document.getElementById("btn-tutorial")?.addEventListener("click", openTutorial);

  document.getElementById("tut-close")?.addEventListener("click", closeTutorial);
  document.getElementById("tut-cta")?.addEventListener("click", closeTutorial);

  document.getElementById("tut-prev")?.addEventListener("click", () => {
    if (_current > 0) _goToSlide(_current - 1, true, "left");
  });

  document.getElementById("tut-next")?.addEventListener("click", () => {
    if (_current < SLIDES.length - 1) _goToSlide(_current + 1, true, "right");
  });

  document.getElementById("tut-dots")?.addEventListener("click", (e) => {
    const dot = e.target.closest(".tut-dot");
    if (!dot) return;
    const idx = parseInt(dot.dataset.index, 10);
    if (idx !== _current) _goToSlide(idx, true, idx > _current ? "right" : "left");
  });

  document.getElementById("tutorial-backdrop")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("tutorial-backdrop")) closeTutorial();
  });

  document.addEventListener("keydown", (e) => {
    if (!_isOpen) return;
    if (e.key === "Escape")     closeTutorial();
    if (e.key === "ArrowRight" && _current < SLIDES.length - 1) _goToSlide(_current + 1, true, "right");
    if (e.key === "ArrowLeft"  && _current > 0)                 _goToSlide(_current - 1, true, "left");
  });
}

//  Slide transition 

function _goToSlide(index, animate = true, direction = "right") {
  const slides  = document.querySelectorAll(".tut-slide");
  const dots    = document.querySelectorAll(".tut-dot");
  const prevBtn = document.getElementById("tut-prev");
  const nextBtn = document.getElementById("tut-next");
  const cta     = document.getElementById("tut-cta");

  const outSlide = slides[_current];
  const inSlide  = slides[index];
  const xOut     = direction === "right" ? -40 : 40;
  const xIn      = direction === "right" ?  40 : -40;

  if (animate && outSlide && inSlide) {
    gsap.timeline()
      .to(outSlide, {
        opacity: 0, x: xOut, duration: 0.28, ease: "power2.in",
        onComplete: () => {
          outSlide.classList.remove("active");
          gsap.set(outSlide, { x: 0 });
        },
      })
      .call(() => {
        inSlide.classList.add("active");
        gsap.set(inSlide, { opacity: 0, x: xIn });
      })
      .fromTo(inSlide,
        { opacity: 0, x: xIn },
        { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" },
      )
      .fromTo(inSlide.querySelector(".tut-icon"),
        { scale: 0.7, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" },
        "-=0.2",
      )
      .fromTo(
        [
          inSlide.querySelector(".tut-slide-title"),
          inSlide.querySelector(".tut-slide-body"),
          inSlide.querySelector(".tut-pills"),
        ].filter(Boolean),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.07, ease: "power2.out" },
        "-=0.25",
      );
  } else {
    if (outSlide) outSlide.classList.remove("active");
    if (inSlide)  inSlide.classList.add("active");
    if (inSlide)  gsap.set(inSlide, { opacity: 1, x: 0 });
  }

  _current = index;

  dots.forEach((d, i) => d.classList.toggle("active", i === index));

  if (prevBtn) prevBtn.disabled = index === 0;

  const isLast = index === SLIDES.length - 1;
  if (nextBtn) {
    nextBtn.disabled = isLast;
    gsap.to(nextBtn, { opacity: isLast ? 0 : 1, duration: 0.2 });
  }
  if (cta) {
    if (isLast) {
      cta.classList.add("visible");
      gsap.fromTo(cta,
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.8)", delay: 0.3 },
      );
    } else {
      cta.classList.remove("visible");
      gsap.set(cta, { opacity: 0 });
    }
  }
}