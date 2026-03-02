import { goTo } from "../router.js";
import { qs } from "../dom.js";
import { openRoster } from "./rosterScreen.js";

export function initStartScreen() {
  qs("#btn-gather")?.addEventListener("click", () => goTo("onboarding"));
  qs("#btn-roster")?.addEventListener("click", openRoster);
  _animateIn();
}

function _animateIn() {
  const tl = gsap.timeline({ delay: 0.3 });

  tl.fromTo(
    ".start-eyebrow",
    { opacity: 0, y: 16, letterSpacing: "0.6em" },
    {
      opacity: 1,
      y: 0,
      letterSpacing: "0.35em",
      duration: 0.9,
      ease: "power3.out",
    },
  )

    .fromTo(
      ".start-title",
      { opacity: 0, y: 40, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "back.out(1.3)" },
      "-=0.5",
    )

    .fromTo(
      ".start-tagline",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
      "-=0.5",
    )

    .fromTo(
      ".rule-pill",
      { opacity: 0, y: 12, scale: 0.88 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.5)",
      },
      "-=0.3",
    )

    .fromTo(
      ".btn-gather",
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.6)" },
      "-=0.2",
    )
    

    // Roster button fades in last
    .fromTo(
      ".btn-roster",
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
      "-=0.2",
    )

    .fromTo(".btn-tutorial",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
      "-=0.2",
    );

    

  // Breathing glow on title
  gsap.to(".start-title", {
    textShadow:
      "0 0 80px rgba(238,211,136,0.7), 0 0 160px rgba(238,211,136,0.3)",
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    delay: 2,
  });
}
