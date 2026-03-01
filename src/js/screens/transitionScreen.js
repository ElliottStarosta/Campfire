import { sleep } from "../dom.js";

export async function playFireTransition(onComplete, promptText = "") {
  return _runTransition(onComplete, promptText);
}
export async function playFullTransition(onComplete, promptText = "") {
  return _runTransition(onComplete, promptText);
}

async function _runTransition(onComplete, promptText) {
  const overlay = document.getElementById("fire-transition");
  if (!overlay) { onComplete?.(); return; }

  overlay.classList.add("active");

  // ── Reset base elements ───────────────────────────────────
  gsap.set(overlay,          { opacity: 0 });
  gsap.set(".ft-vignette",   { opacity: 0 });
  gsap.set(".ft-campfire",   { scale: 0.55, opacity: 0, y: 70, transformOrigin: "50% 100%" });
  gsap.set(".ft-ember",      { opacity: 0 });
  gsap.set(".ft-glow",       { opacity: 0 });
  // Hide the original text-wrap — we use our own top-anchored container
  gsap.set(".ft-text-wrap",  { opacity: 0, pointerEvents: "none" });

  // ── Build top-text container (question + countdown sit ABOVE fire) ──
  // Reuse elements between games if they already exist
  let topBox      = overlay.querySelector(".ft-top-box");
  let questionEl  = overlay.querySelector(".ft-q");
  let eyebrowEl   = overlay.querySelector(".ft-eyebrow");
  let countdownEl = overlay.querySelector(".ft-cd");

  if (!topBox) {
    topBox = document.createElement("div");
    topBox.className = "ft-top-box";
    Object.assign(topBox.style, {
      position:        "absolute",
      top:             "0",
      left:            "0",
      right:           "0",
      height:          "52%",       // top half — fire lives in the bottom half
      display:         "flex",
      flexDirection:   "column",
      alignItems:      "center",
      justifyContent:  "center",
      gap:             "12px",
      zIndex:          "20",
      pointerEvents:   "none",
      padding:         "0 32px",
    });
    overlay.appendChild(topBox);

    eyebrowEl = document.createElement("span");
    eyebrowEl.className = "ft-eyebrow";
    Object.assign(eyebrowEl.style, {
      fontFamily:    "var(--font-mono)",
      fontSize:      "0.7rem",
      letterSpacing: "0.4em",
      textTransform: "uppercase",
      color:         "var(--c-teal-2)",
    });
    eyebrowEl.textContent = "Tonight's question";
    topBox.appendChild(eyebrowEl);

    questionEl = document.createElement("p");
    questionEl.className = "ft-q";
    Object.assign(questionEl.style, {
      fontFamily:  "var(--font-body)",
      fontStyle:   "italic",
      fontSize:    "clamp(1.1rem, 3vw, 2rem)",
      fontWeight:  "300",
      color:       "var(--c-cream-1)",
      textAlign:   "center",
      maxWidth:    "600px",
      lineHeight:  "1.45",
      textShadow:  "0 0 50px rgba(238,211,136,0.4)",
      margin:      "0",
    });
    topBox.appendChild(questionEl);

    // Divider
    const divider = document.createElement("div");
    Object.assign(divider.style, {
      width:      "50px",
      height:     "1px",
      background: "linear-gradient(90deg, transparent, var(--c-amber-1), transparent)",
      flexShrink: "0",
    });
    topBox.appendChild(divider);

    countdownEl = document.createElement("div");
    countdownEl.className = "ft-cd";
    Object.assign(countdownEl.style, {
      fontFamily:      "var(--font-display)",
      fontSize:        "4.5rem",
      color:           "var(--c-amber-1)",
      textShadow:      "0 0 40px rgba(239,181,118,0.6)",
      lineHeight:      "1",
      minHeight:       "5rem",
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
    });
    topBox.appendChild(countdownEl);
  }

  // Reset for this run
  questionEl.textContent  = `"${promptText}"`;
  countdownEl.textContent = "";
  gsap.set(topBox,       { opacity: 0 });
  gsap.set(eyebrowEl,    { opacity: 0, y: -12 });
  gsap.set(questionEl,   { opacity: 0, y: 16 });
  gsap.set(countdownEl,  { opacity: 0, scale: 1.4 });

  _animateEmbers();

  // ── Phase 1: Fire rises ───────────────────────────────────
  await new Promise(resolve => {
    gsap.timeline({ onComplete: resolve })
      .to(overlay,          { opacity: 1,                  duration: 1.2, ease: "power1.inOut" })
      .to(".ft-campfire",   { scale: 1, opacity: 1, y: 0,  duration: 1.1, ease: "power2.out"   }, "-=0.7")
      .to(".ft-glow",       { opacity: 0.5,                duration: 0.9, ease: "power2.out"   }, "-=0.8")
      .to(".ft-vignette",   { opacity: 0.6,                duration: 0.8, ease: "power2.inOut" }, "-=0.6")
      .to(".ft-ember",      { opacity: 1,                  duration: 0.4                       }, "-=0.4")
      .to(".ft-campfire",   { scale: 1.3, y: 12,           duration: 1.6, ease: "power1.inOut" }, "-=0.1");
  });

  // ── Phase 2: Question fades in above the fire ─────────────
  await new Promise(resolve => {
    gsap.timeline({ onComplete: resolve })
      .to(topBox,      { opacity: 1,                duration: 0.3 })
      .to(eyebrowEl,   { opacity: 1, y: 0,          duration: 0.5, ease: "power2.out" }, "-=0.1")
      .to(questionEl,  { opacity: 1, y: 0,          duration: 0.7, ease: "power2.out" }, "-=0.3");
  });

  await sleep(900);

  // ── Phase 3: Countdown ────────────────────────────────────
  gsap.to(countdownEl, { opacity: 1, duration: 0.3 });

  for (let n = 3; n >= 1; n--) {
    countdownEl.textContent = String(n);
    gsap.fromTo(countdownEl,
      { scale: 1.5, opacity: 0 },
      { scale: 1,   opacity: 1, duration: 0.35, ease: "back.out(2)" }
    );
    await sleep(950);
  }

  await sleep(150);

  // ── Phase 4: Fade out ─────────────────────────────────────
  await new Promise(resolve => {
    gsap.to(overlay, { opacity: 0, duration: 0.85, ease: "power2.inOut", onComplete: resolve });
  });

  overlay.classList.remove("active");
  gsap.set(overlay,     { opacity: "" });
  gsap.set(topBox,      { opacity: 0 });
  gsap.set(questionEl,  { opacity: 0 });
  gsap.set(countdownEl, { opacity: 0 });

  onComplete?.();
}

function _animateEmbers() {
  document.querySelectorAll(".ft-ember-particle").forEach((e, i) => {
    const sx = (Math.random() - 0.5) * 40;
    const ex = sx + (Math.random() - 0.5) * 80;
    const ey = -(60 + Math.random() * 130);
    gsap.fromTo(e,
      { x: sx, y: 0, opacity: 0, scale: 0.4 },
      {
        x: ex, y: ey, opacity: 0, scale: 0,
        duration: 1.8 + Math.random() * 1.0,
        delay:    i * 0.1 + Math.random() * 0.25,
        ease:     "power1.out",
        repeat:   -1,
        repeatDelay: Math.random() * 0.6,
        onRepeat() {
          gsap.set(e, { x: sx, y: 0, opacity: 0.75, scale: 0.4 + Math.random() * 0.4 });
        },
      }
    );
  });
}