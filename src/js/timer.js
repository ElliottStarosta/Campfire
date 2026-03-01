import { state } from './state.js';
import { qs }    from './dom.js';
import { playMP3 } from './sound.js';

const TOTAL_DASH = 125.6;

let _onExpire = null;

export function initTimer(onExpireCb) {
  _onExpire = onExpireCb;
}

// Full reset — use when starting a NEW game
export function startTimer() {
  state.timeLeft = state.totalTime; 
  _startTicking(); 
}

// Resume from wherever timeLeft currently is — use after unpause
export function resumeTimer() {
  _startTicking();               
}

export function stopTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
}

function _startTicking() {
  const fillEl   = qs('#timer-ring-fill');
  const digitsEl = qs('#timer-digits');
  const wrapEl   = qs('#timer-wrap');

  _render(fillEl, digitsEl, wrapEl);  // paint current value immediately

  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timeLeft -= 1;
    _render(fillEl, digitsEl, wrapEl);
    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      if (_onExpire) _onExpire();
    }
  }, 1000);
}

function _render(fillEl, digitsEl, wrapEl) {
  if (!fillEl || !digitsEl) return;

  const pct    = state.timeLeft / state.totalTime;
  const offset = TOTAL_DASH * (1 - pct);
  fillEl.style.strokeDashoffset = offset;

  const m = Math.floor(state.timeLeft / 60);
  const s = state.timeLeft % 60;
  digitsEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

  const urgent = state.timeLeft <= 20;
  wrapEl?.classList.toggle('urgent', urgent);

  if (urgent && state.timeLeft % 5 === 0) {
    gsap.fromTo(fillEl,
      { opacity: 0.4 },
      { opacity: 1, duration: 0.3, yoyo: true, repeat: 1 });
  }

  if (state.timeLeft === 30) {
    playMP3('/audio/30Seconds.mp3', { volume: 0.25 });
  }
  if (state.timeLeft === 10) {
    playMP3('/audio/10Seconds.mp3', { volume: 0.65 });
  }
  

 // Tick in last 10 seconds
if (state.timeLeft <= 10 && state.timeLeft > 0) {
  const isLast = state.timeLeft === 1;
  playMP3(isLast ? '/audio/finalTick.mp3' : '/audio/buttonClick.mp3', { volume: isLast ? 0.9 : 0.4 });
}
}