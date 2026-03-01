
/** Shorthand querySelector */
export const qs  = (sel, ctx = document) => ctx.querySelector(sel);
export const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Escape HTML for safe text insertion */
export function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Convert hex color + alpha to rgba() string */
export function hexAlpha(hex, alpha = 1) {
  const h = (hex ?? '#888888').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) || 128;
  const g = parseInt(h.slice(2, 4), 16) || 128;
  const b = parseInt(h.slice(4, 6), 16) || 128;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Make a safe CSS id from any string */
export function safeId(str) {
  return String(str).replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

/** Promise-based sleep */
export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/** Clamp a number between min and max */
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}