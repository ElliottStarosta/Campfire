const ctx = new (window.AudioContext || window.webkitAudioContext)();
document.addEventListener('click', () => {
  if (ctx.state === 'suspended') ctx.resume();
}, { once: true });

// ── MP3 playback ───────────────────────────────────────────────────────────
const _audioCache = {};

export function playMP3(src, { volume = 1.0, loop = false, fadeIn = 0 } = {}) {
  if (ctx.state === 'suspended') ctx.resume();

  // For short one-shot SFX, clone the node so rapid clicks don't cut out
  // For looping ambiance, reuse the same element
  let audio;
  if (loop) {
    if (!_audioCache[src]) _audioCache[src] = new Audio(src);
    audio = _audioCache[src];
    audio.currentTime = 0;
  } else {
    // Always create a fresh Audio for one-shots so they never conflict
    audio = new Audio(src);
    // Still cache it so stopMP3 can find it if needed
    _audioCache[src] = audio;
  }

  audio.loop   = loop;
  audio.volume = fadeIn > 0 ? 0 : volume;

  const playPromise = audio.play().catch(err => {
    // Silently swallow autoplay errors — user hasn't interacted yet
    console.warn('[SFX] play blocked:', src, err.message);
  });

  if (fadeIn > 0 && playPromise) {
    playPromise.then(() => {
      const steps    = 30;
      const interval = (fadeIn * 1000) / steps;
      const step     = volume / steps;
      let current    = 0;
      const timer = setInterval(() => {
        current++;
        audio.volume = Math.min(volume, step * current);
        if (current >= steps) clearInterval(timer);
      }, interval);
    });
  }

  return audio;
}

export function stopMP3(src, { fadeOut = 0 } = {}) {
  const audio = _audioCache[src];
  if (!audio) return;

  if (fadeOut > 0) {
    const steps    = 30;
    const interval = (fadeOut * 1000) / steps;
    const startVol = audio.volume;
    const step     = startVol / steps;
    let current    = 0;
    const timer = setInterval(() => {
      current++;
      audio.volume = Math.max(0, startVol - step * current);
      if (current >= steps) {
        clearInterval(timer);
        audio.pause();
        audio.currentTime = 0;
      }
    }, interval);
  } else {
    audio.pause();
    audio.currentTime = 0;
  }
}

export function setMP3Volume(src, volume) {
  const audio = _audioCache[src];
  if (audio) audio.volume = Math.max(0, Math.min(1, volume));
}

// ── Global button click sounds ─────────────────────────────────────────────
export function initGlobalButtonSounds(clickSrc, { volume = 0.8 } = {}) {
  document.addEventListener('click', (e) => {
    const isButton = e.target.closest(
      'button, [role="button"], .btn-gather, .btn-join, .btn-again, .rcar-card, .vote-card, .pause-btn'
    );
    if (!isButton) return;

    // Each click gets a brand-new Audio so rapid clicking never cuts out
    const audio = new Audio(clickSrc);
    audio.volume = volume;
    audio.play().catch(() => {});
  });
}