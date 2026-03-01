import { state } from "../state.js";
import { goTo } from "../router.js";
import { qs } from "../dom.js";
import { makeAvatarImg } from "../avatars.js";
import { startGame } from "./gameScreen.js";

/**
 * @param {'win'|'lose'|'kicked'} outcome
 * @param {number} [votesReceived]
 */
export function showResult(outcome, votesReceived = 0) {
  goTo("result");

  const iconWrap = qs("#result-icon");
  const heading = qs("#result-heading");
  const desc = qs("#result-desc");
  const votesEl = qs("#stat-votes");
  const msgsEl = qs("#stat-msgs");

  const iconSrc =
    {
      win: "/icons/win.png",
      lose: "/icons/caught.png",
      kicked: "/icons/kicked.png",
    }[outcome] ?? "/avatars/default.png";

  if (iconWrap) {
    iconWrap.innerHTML = "";
    const img = makeAvatarImg(iconSrc, outcome);
    img.style.cssText = "width:100%;height:100%;object-fit:contain;";
    iconWrap.appendChild(img);
  }

  const COPY = {
    win: {
      heading: "You Blended In",
      cls: "win",
      desc: "The flames revealed nothing. You spoke like one of them — or did the AIs just talk too much like humans?",
    },
    lose: {
      heading: "You Were Found",
      cls: "lose",
      desc: "The fire burns away all pretence. Your humanity was showing. The circle saw through you.",
    },
    kicked: {
      heading: "Burned Out",
      cls: "lose",
      desc: "You didn't say enough to stay around the fire. At least three messages needed — the embers faded without you.",
    },
  };

  const copy = COPY[outcome] ?? COPY.lose;
  if (heading) {
    heading.textContent = copy.heading;
    heading.className = `result-heading ${copy.cls}`;
  }
  if (desc) desc.textContent = copy.desc;
  if (votesEl) votesEl.textContent = votesReceived;
  if (msgsEl) msgsEl.textContent = state.playerMsgCount;

  // GSAP entrance
  const tl = gsap.timeline({ delay: 0.2 });
  tl.fromTo(
    "#result-icon",
    { scale: 0, rotation: -15, opacity: 0 },
    {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: 0.75,
      ease: "back.out(1.8)",
    },
  )
    .fromTo(
      "#result-heading",
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
      "-=0.25",
    )
    .fromTo(
      "#result-desc",
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5 },
      "-=0.3",
    )
    .fromTo(
      ".stat-block",
      { opacity: 0, y: 14, scale: 0.88 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.12,
        duration: 0.45,
        ease: "back.out(1.5)",
      },
      "-=0.2",
    )
    .fromTo(
      "#btn-again",
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" },
      "-=0.1",
    );

  // Animated number count-up
  _countUp(votesEl, 0, votesReceived, 1000);
  _countUp(msgsEl, 0, state.playerMsgCount, 1200);
}

function _countUp(el, from, to, durationMs) {
  if (!el || to === 0) return;
  const obj = { val: from };
  gsap.to(obj, {
    val: to,
    duration: durationMs / 1000,
    delay: 1.3,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = Math.round(obj.val);
    },
  });
}

export function initResultScreen() {
  qs("#btn-again")?.addEventListener("click", () => {
    // Reset the onboarding form so it's fresh
    const nameInput = qs("#player-name");
    if (nameInput) nameInput.value = "";

    // Re-enable the join button in case it was mid-animation
    const joinBtn = qs("#btn-join");
    if (joinBtn) gsap.set(joinBtn, { scale: 1, opacity: 1, clearProps: "all" });

    // Ensure onboarding screen opacity is clean before routing
    const onboarding = qs("#onboarding-screen");
    if (onboarding) {
      onboarding.style.opacity = "";
      gsap.set(onboarding, { opacity: 0, clearProps: "opacity" });
    }

    goTo("onboarding");
  });
}

