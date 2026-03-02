import "../css/variables.css";
import "../css/base.css";
import "../css/environment.css";
import "../css/screens.css";
import "../css/introAdditions.css";
import "../css/promptReveal.css";
import "../css/pause.css";
import "../css/tutorial.css";

import { initEnvironment } from "./environment.js";
import { initRouter } from "./router.js";
import { initStartScreen } from "./screens/startscreen.js";
import { initOnboardingScreen } from "./screens/onboardingScreen.js";
import { initGameScreen } from "./screens/gameScreen.js";
import { initResultScreen } from "./screens/resultsScreen.js";
import { initRosterScreen } from "./screens/rosterScreen.js";
import { initPause } from "./pause.js";
import { initGlobalButtonSounds, playMP3 } from "./sound.js";
import { initTutorial } from "./tutorial.js";

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("page-loader");

  // Init everything
  initEnvironment();
  initRouter();
  initStartScreen();
  initOnboardingScreen();
  initGameScreen();
  initResultScreen();
  initRosterScreen();
  initPause();
  initTutorial();
  initGlobalButtonSounds("/audio/buttonClick.mp3", { volume: 0.8 });

  // Start ambiance — loops forever throughout the entire game
  document.addEventListener(
    "click",
    () => {
      playMP3("/audio/loading-ambiance.mp3", {
        loop: true,
        volume: 0.05,
        fadeIn: 1.5,
      });
    },
    { once: true },
  );

  // Remove loader — use a timeout fallback in case transitionend never fires
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!loader) return;

      loader.classList.add("fade-out");

      // Primary: transitionend
      loader.addEventListener(
        "transitionend",
        () => {
          loader.remove();
        },
        { once: true },
      );

      // Fallback: if transition never fires (e.g. reduced motion), force remove
      setTimeout(() => {
        if (loader.parentNode) loader.remove();
      }, 800);
    });
  });
});