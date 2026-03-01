import { state } from "./state.js";
import { qs } from "./dom.js";
import { resumeTimer, startTimer, stopTimer } from "./timer.js";
import { startAILoop, stopAILoop } from "./aiOrchestrator.js";
import { goTo } from "./router.js";
import {playMP3} from "./sound.js";

let _paused = false;

/* ── Public API ─────────────────────────────────────────── */

export function isPaused() {
  return _paused;
}

export function initPause() {
  qs("#btn-pause")?.addEventListener("click", togglePause);
  qs("#pause-resume")?.addEventListener("click", resume);
  qs("#pause-restart")?.addEventListener("click", _restart);
  qs("#pause-quit")?.addEventListener("click", _quitToMenu);

  document.addEventListener("keydown", (e) => {
    if (state.phase !== "game" || state.gameEnded) return;
    if (e.key === "Escape") togglePause();
  });
}

export function showPauseButton() {
  qs("#btn-pause")?.classList.add("visible");
}

export function hidePauseButton() {
  const btn = qs("#btn-pause");
  if (!btn) return;
  btn.classList.remove("visible", "is-paused");
  if (_paused) _forceResume();
}

export function togglePause() {
  _paused ? resume() : pause();
}

export function pause() {
  if (_paused || state.phase !== "game" || state.gameEnded) return;
  playMP3('/audio/buttonClick.mp3', { volume: 0.8 });

  _paused = true;
  state.gamePaused = true;

  stopTimer();
  stopAILoop();

  const inp = qs("#chat-input"),
    snd = qs("#btn-send");
  if (inp) inp.disabled = true;
  if (snd) snd.disabled = true;

  qs("#btn-pause")?.classList.add("is-paused");

  _fillStats();
  _showOverlay();
}

export function resume() {
  if (!_paused) return;
  _forceResume();
}

/* ── Internal ────────────────────────────────────────────── */

function _forceResume() {
  _paused = false;
  state.gamePaused = false;

  _hideOverlay(() => {
    qs("#btn-pause")?.classList.remove("is-paused");
    if (!state.gameEnded) {
      const inp = qs("#chat-input"),
        snd = qs("#btn-send");
      if (inp) inp.disabled = false;
      if (snd) snd.disabled = false;
      resumeTimer();
      startAILoop();
    }
  });
}

function _showOverlay() {
  const el = qs("#pause-overlay");
  if (!el) return;

  // 1. Make it a flex container and visible in the DOM
  el.style.display = "flex";
  el.style.opacity = "0";

  // 2. Force a reflow so the browser registers display:flex before GSAP reads it
  void el.offsetHeight;

  // 3. Now animate
  gsap
    .timeline()
    .to(el, { opacity: 1, duration: 0.35, ease: "power2.out" })
    .fromTo(
      ".pause-panel",
      { opacity: 0, y: 28, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.8)" },
      "-=0.2",
    )
    .fromTo(
      [".pause-badge", ".pause-title", ".pause-topic"],
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: "power2.out" },
      "-=0.3",
    )
    .fromTo(
      ".pause-divider",
      { scaleX: 0 },
      { scaleX: 1, duration: 0.3, ease: "power2.out" },
      "-=0.15",
    )
    .fromTo(
      ".pause-menu .pause-btn",
      { opacity: 0, x: -14 },
      { opacity: 1, x: 0, duration: 0.28, stagger: 0.07, ease: "power2.out" },
      "-=0.2",
    )
    .fromTo(
      ".pause-stats",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.28 },
      "-=0.15",
    );
}

function _hideOverlay(onDone) {
  const el = qs("#pause-overlay");
  if (!el) {
    onDone?.();
    return;
  }

  gsap
    .timeline({
      onComplete: () => {
        // Fully remove from layout so it can NEVER bleed through
        el.style.display = "none";
        el.style.opacity = "";
        gsap.set(
          [
            ".pause-panel",
            ".pause-badge",
            ".pause-title",
            ".pause-topic",
            ".pause-divider",
            ".pause-menu .pause-btn",
            ".pause-stats",
          ],
          { clearProps: "all" },
        );
        onDone?.();
      },
    })
    .to(".pause-panel", {
      opacity: 0,
      y: 16,
      scale: 0.93,
      duration: 0.22,
      ease: "power2.in",
    })
    .to(el, { opacity: 0, duration: 0.25, ease: "power2.in" }, "-=0.1");
}

function _fillStats() {
  const m = Math.floor(state.timeLeft / 60);
  const s = state.timeLeft % 60;

  const t = qs("#pause-stat-time");
  const g = qs("#pause-stat-msgs");
  const p = qs("#pause-stat-players");
  const q = qs("#pause-topic-text");

  if (t) t.textContent = `${m}:${s.toString().padStart(2, "0")}`;
  if (g) g.textContent = state.playerMsgCount;
  if (p) p.textContent = (state.chatRoom?.aiPlayers?.length ?? 0) + 1;
  if (q) q.textContent = state.promptText ? `"${state.promptText}"` : "";
}

async function _restart() {
  _paused = false;
  state.gamePaused = false;
  _hideOverlay(async () => {
    hidePauseButton();
    await new Promise((r) => setTimeout(r, 80));
    const { startGame } = await import("./screens/gameScreen.js");
    startGame();
  });
}

async function _quitToMenu() {
  _paused = false;
  state.gamePaused = false;
  state.gameEnded = true;
  stopTimer();
  stopAILoop();
  _hideOverlay(() => {
    hidePauseButton();
    state.phase = "start";
    state.gameEnded = false;
    goTo("start");
  });
}
