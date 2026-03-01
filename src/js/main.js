import "../css/variables.css";
import "../css/base.css";
import "../css/environment.css";
import "../css/screens.css";
import "../css/introAdditions.css";
import "../css/promptReveal.css";
import "../css/pause.css";

import { initEnvironment } from "./environment.js";
import { initRouter }      from "./router.js";
import { initStartScreen } from "./screens/startscreen.js";
import { initOnboardingScreen } from "./screens/onboardingScreen.js";
import { initGameScreen }  from "./screens/gameScreen.js";
import { initResultScreen } from "./screens/resultsScreen.js";
import { initRosterScreen } from "./screens/rosterScreen.js";
import { initPause }       from "./pause.js";

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

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (loader) {
        loader.classList.add("fade-out");
        // Remove from DOM after transition so it can't block clicks
        loader.addEventListener("transitionend", () => loader.remove(), { once: true });
      }
    });
  });
});