import { state, resetGame } from "../state.js";
import { goTo } from "../router.js";
import { qs, hexAlpha, sleep } from "../dom.js";
import { getAvatarSrc, makeAvatarImg } from "../avatars.js";
import { clearFeed, appendMessage, appendSystem } from "../chat.js";
import { startTimer, initTimer } from "../timer.js";
import {
  openConversation,
  stopAILoop,
  triggerReaction,
} from "../aiOrchestrator.js";
import { ChatRoom } from "../AIPersonalities.js";
import { startVoting } from "./votingScreen.js";
import { showPauseButton, hidePauseButton} from "../pause.js";

export function initGameScreen() {
  qs("#btn-send")?.addEventListener("click", _sendMessage);
  qs("#chat-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      _sendMessage();
    }
  });
  initTimer(_onTimeUp);
}

/**
 * Called by onBoardingScreen's transition onComplete.
 * Onboarding is already hidden. Just show game screen and start.
 */
export async function startGame() {
  const savedPrompt = state.pendingPrompt;

  resetGame();
  clearFeed();

  // Use the prompt that was already shown in the transition
  state.promptText = savedPrompt || "What's the weirdest dream you've ever had?";
  state.pendingPrompt = null;

  state.chatRoom = new ChatRoom(state.promptText);

  // Go straight to game — onboarding is already gone
  goTo("game");
  showPauseButton();

  const topicEl = qs("#topic-text");
  if (topicEl) topicEl.textContent = `"${state.promptText}"`;

  _buildPlayersStrip();
  _setInputEnabled(true);
  qs("#chat-input")?.focus();
  _updateCounter();
  startTimer();
  openConversation(state.promptText);
}

function _buildPlayersStrip() {
  const strip = qs("#players-strip");
  if (!strip) return;
  strip.innerHTML = "";

  strip.appendChild(
    _makePip(getAvatarSrc(null, true), state.playerName, "#efb576", true),
  );
  state.chatRoom.aiPlayers.forEach((ai) => {
    strip.appendChild(
      _makePip(getAvatarSrc(ai.name), ai.name, ai.color ?? "#acbc8e", false),
    );
  });

  gsap.fromTo(
    ".player-pip",
    { opacity: 0, scale: 0.4 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.45,
      stagger: 0.07,
      ease: "back.out(2)",
      delay: 0.1,
    },
  );
}

function _makePip(src, name, color, isHuman) {
  const pip = document.createElement("div");
  pip.className = `player-pip${isHuman ? " is-human" : ""}`;
  pip.title = name;
  pip.dataset.name = name;
  if (isHuman) pip.dataset.human = "true";
  pip.style.background = hexAlpha(color, 0.15);
  pip.style.borderColor = hexAlpha(color, isHuman ? 0.7 : 0.3);
  pip.appendChild(makeAvatarImg(src, name));
  const dot = document.createElement("div");
  dot.className = "pip-online";
  pip.appendChild(dot);
  return pip;
}

function _sendMessage() {
  const input = qs("#chat-input");
  const msg = input?.value.trim();
  if (!msg || state.phase !== "game" || input?.disabled) return;

  input.value = "";
  state.playerMsgCount++;
  state.chatRoom.addHumanMessage(state.playerName, msg);
  appendMessage(state.playerName, msg, "#efb576", true);
  _updateCounter();

  if (Math.random() < 0.55) triggerReaction();
}

function _updateCounter() {
  const el = qs("#msg-counter");
  if (!el) return;
  const rem = Math.max(0, 3 - state.playerMsgCount);
  if (rem > 0) {
    el.textContent = `Send ${rem} more message${rem !== 1 ? "s" : ""} to stay in the game`;
    el.className = `msg-counter ${rem === 1 ? "danger" : "warn"}`;
  } else {
    el.textContent = `${state.playerMsgCount} messages sent`;
    el.className = "msg-counter";
  }
}

function _setInputEnabled(on) {
  const input = qs("#chat-input");
  const btn = qs("#btn-send");
  if (input) input.disabled = !on;
  if (btn) btn.disabled = !on;
}

async function _onTimeUp() {
  state.gameEnded = true;
  stopAILoop();
  hidePauseButton();
  _setInputEnabled(false);

  if (state.playerMsgCount < 3) {
    const { showResult } = await import("./resultsScreen.js");
    showResult("kicked");
    return;
  }

  appendSystem("Time is up — the embers are fading…");
  setTimeout(() => startVoting(), 1800);
}
