export const state = {
  // Player
  playerName: "",
  playerPronouns: "",

  // Game
  phase: "start",      // start | onboarding | game | voting | result
  chatRoom: null,
  promptText: "",
  pendingPrompt: null, // set by onboarding so transition can show it
  playerMsgCount: 0,
  timeLeft: 90,
  totalTime: 90,
  gameEnded: false,
  gamePaused: false,
  // Timers
  timerInterval: null,
  aiScheduleTimer: null,

  // Voting
  votingPlayers: [],   // { name, avatarSrc, color, isHuman, votes }
};

export function resetGame() {
  state.playerMsgCount = 0;
  state.timeLeft = state.totalTime;
  state.gameEnded = false;
  state.gamePaused = false;
  state.chatRoom = null;
  state.votingPlayers = [];
  state.pendingPrompt = null;
  clearInterval(state.timerInterval);
  clearTimeout(state.aiScheduleTimer);
  state.timerInterval = null;
  state.aiScheduleTimer = null; 
}