import { state } from "./state.js";
import { qs } from "./dom.js";
import { getAvatarSrc, makeAvatarImg } from "./avatars.js";
import { hexAlpha } from "./dom.js";
import { playMP3 } from "./sound.js";

const FALLBACK_COLOR = "#acbc8e";

function getFeed() {
  return qs("#chat-feed");
}

export function scrollBottom() {
  const feed = getFeed();
  if (!feed) return;
  gsap.to(feed, {
    scrollTop: feed.scrollHeight,
    duration: 0.35,
    ease: "power2.out",
  });
}

export function appendMessage(author, message, color, isSelf = false) {
  const feed = getFeed();
  if (!feed) return;

  if (isSelf) {
    playMP3('/audio/messageSend.mp3', { volume: 0.6 });
  } else {
    playMP3('/audio/messageReceive.mp3', { volume: 0.5 });
  }

  const row = document.createElement("div");
  row.className = `msg-row ${isSelf ? "from-self" : "from-other"}`;

  // Avatar
  const avatarWrap = document.createElement("div");
  avatarWrap.className = "msg-avatar-wrap";
  const clr = color || FALLBACK_COLOR;
  avatarWrap.style.borderColor = hexAlpha(clr, isSelf ? 0.5 : 0.3);

  const src = isSelf ? getAvatarSrc(null, true) : getAvatarSrc(author);
  avatarWrap.appendChild(makeAvatarImg(src, author));

  // Body
  const body = document.createElement("div");
  body.className = "msg-body";
  body.innerHTML = `
    <span class="msg-name">${_esc(isSelf ? `${state.playerName} (you)` : author)}</span>
    <div class="msg-bubble">${_esc(message)}</div>
  `;

  row.appendChild(avatarWrap);
  row.appendChild(body);
  feed.appendChild(row);

  // Animate in with GSAP + ScrollTrigger isn't needed — manual
  gsap.fromTo(
    row,
    { opacity: 0, y: 10, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "back.out(1.4)" },
  );

  // Flash the speaker pip in the header
  _flashPip(author, isSelf);

  scrollBottom();
  return row;
}

export function appendSystem(text) {
  const feed = getFeed();
  if (!feed) return;
  const div = document.createElement("div");
  div.className = "sys-msg";
  div.textContent = text;
  feed.appendChild(div);
  gsap.fromTo(div, { opacity: 0 }, { opacity: 1, duration: 0.5 });
  scrollBottom();
}

export function showTyping(ai) {
  const feed = getFeed();
  if (!feed) return null;

  const row = document.createElement("div");
  row.className = "typing-row";

  const avatarWrap = document.createElement("div");
  avatarWrap.className = "msg-avatar-wrap";
  const clr = ai.color || FALLBACK_COLOR;
  avatarWrap.style.borderColor = hexAlpha(clr, 0.3);
  avatarWrap.appendChild(makeAvatarImg(getAvatarSrc(ai.name), ai.name));

  row.appendChild(avatarWrap);
  row.insertAdjacentHTML(
    "beforeend",
    `
    <div class="typing-bubble">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `,
  );

  feed.appendChild(row);
  gsap.fromTo(row, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25 });
  scrollBottom();
  return row;
}

export function removeTyping(el) {
  if (!el || !el.parentNode) return;
  gsap.to(el, {
    opacity: 0,
    y: -6,
    duration: 0.2,
    onComplete: () => el.remove(),
  });
}

export function clearFeed() {
  const feed = getFeed();
  if (feed) feed.innerHTML = "";
}

function _flashPip(author, isSelf) {
  const pips = document.querySelectorAll(".player-pip");
  pips.forEach((pip) => {
    const isMatch = isSelf
      ? pip.dataset.human === "true"
      : pip.dataset.name === author;
    if (isMatch) {
      pip.classList.add("speaking");
      gsap.fromTo(
        pip,
        { boxShadow: "0 0 0px rgba(217,106,89,0)" },
        {
          boxShadow: "0 0 14px rgba(217,106,89,0.6)",
          duration: 0.2,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            pip.classList.remove("speaking");
            pip.style.boxShadow = "";
          },
        },
      );
    }
  });
}

function _esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
