import { state } from "../state.js";
import { qs } from "../dom.js";
import { startGame } from "./gameScreen.js";
import { playFireTransition } from "./transitionScreen.js";

const PROMPTS = [
  "If you had to eat only one food forever, what would it be and why?",
  "What's the scariest thing you've ever done willingly?",
  "Would you rather be famous for something embarrassing or forgotten forever?",
  "What's the most useless skill you actually have?",
  "If animals could talk, which would be the most annoying?",
  "What's one thing you'd change about how humans work?",
  "If you could uninvent one thing, what would it be?",
  "What's the weirdest dream you've ever had?",
  "Would you rather fight one horse-sized duck or a hundred duck-sized horses?",
  "What's something you believe that most people think is weird?",
  "What's a hill you'd absolutely die on?",
  "If your life had a theme song, what genre would it be?",
];

export function initOnboardingScreen() {
  qs("#btn-join")?.addEventListener("click", _handleJoin);
  qs("#player-name")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") _handleJoin();
  });
}

function _handleJoin() {
  const nameInput = qs("#player-name");
  const name = nameInput?.value.trim();

  if (!name) {
    gsap.fromTo(nameInput,
      { x: 0 },
      { x: [-8, 8, -6, 6, -4, 0], duration: 0.4, ease: "none" }
    );
    nameInput?.focus();
    return;
  }

  state.playerName     = name;
  state.playerPronouns = qs("#player-pronouns")?.value ?? "they/them";
  state.pendingPrompt  = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  // Button press feedback
  gsap.to(".btn-join", { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1,
    onComplete: () => {
      // CRITICAL: hide onboarding immediately so the router doesn't
      // try to crossfade from it when goTo("game") is called later
      const onboarding = document.getElementById("onboarding-screen");
      if (onboarding) {
        gsap.to(onboarding, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            onboarding.classList.remove("active");
            onboarding.style.opacity = "";
          }
        });
      }

      // Fire transition shows the question + countdown, then calls startGame
      playFireTransition(() => startGame(), state.pendingPrompt);
    }
  });
}