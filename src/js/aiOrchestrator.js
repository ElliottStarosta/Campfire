import { state } from "./state.js";
import { sleep } from "./dom.js";
import {
  appendMessage,
  appendSystem,
  showTyping,
  removeTyping,
} from "./chat.js";

const MIN_AI_DELAY = 5000;
const MAX_AI_DELAY = 10500;

let _scheduleTimer = null;

export function startAILoop() {
  _scheduleNext();
}

export function stopAILoop() {
  clearTimeout(_scheduleTimer);
  _scheduleTimer = null;
}

function _scheduleNext() {
  if (state.gameEnded || state.gamePaused) return;
  const delay = MIN_AI_DELAY + Math.random() * (MAX_AI_DELAY - MIN_AI_DELAY);
  _scheduleTimer = setTimeout(async () => {
    if (!state.gameEnded && !state.gamePaused && state.phase === "game") {
      await _deliverAIMessage(state.chatRoom._pickAI());
      _scheduleNext();
    }
  }, delay);
}

/**
 * When the human sends a message, 2-3 AIs react with staggered delays.
 */
export function triggerReaction() {
  if (state.gamePaused) return;
  clearTimeout(_scheduleTimer);

  const reactionCount = Math.random() < 0.35 ? 3 : 2;
  _runReactions(reactionCount).then(() => {
    if (!state.gameEnded && !state.gamePaused && state.phase === "game") {
      _scheduleNext();
    }
  });
}

async function _runReactions(count) {
  if (!state.chatRoom || state.gameEnded) return;
  const shuffled = [...state.chatRoom.aiPlayers]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  for (const ai of shuffled) {
    if (state.gameEnded || state.gamePaused) break;
    await sleep(900 + Math.random() * 2600);
    if (state.gameEnded || state.gamePaused) break;
    await _deliverAIMessage(ai);
  }
}

async function _deliverAIMessage(ai) {
  if (!ai || state.gameEnded || state.gamePaused) return;

  const typingEl = showTyping(ai);
  await sleep(700 + Math.random() * 1100);

  if (state.gameEnded || state.gamePaused) { removeTyping(typingEl); return; }
  removeTyping(typingEl);

  const results = await state.chatRoom.getAIResponse(ai);
  if (!results || state.gameEnded || state.gamePaused) return;

  for (let i = 0; i < results.length; i++) {
    if (state.gameEnded || state.gamePaused) break;
    appendMessage(results[i].author, results[i].message, results[i].color, false);
    if (i < results.length - 1) await sleep(420 + Math.random() * 460);
  }
}


/**
 * Opening sequence: all 6 AIs speak once, staggered naturally,
 * then the normal loop begins.
 */
export async function openConversation(promptText) {
  appendSystem(`The fire is lit — "${promptText}"`);
  await sleep(1000);
  if (state.gameEnded) return;

  const allAIs = [...state.chatRoom.aiPlayers].sort(() => Math.random() - 0.5);
  for (const ai of allAIs) {
    if (state.gameEnded) break;
    await sleep(800 + Math.random() * 1400);
    if (state.gameEnded) break;
    await _deliverAIMessage(ai);
  }

  if (!state.gameEnded) startAILoop();
}
