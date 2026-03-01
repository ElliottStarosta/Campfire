import { state } from "../state.js";
import { goTo } from "../router.js";
import { qs, sleep, hexAlpha, safeId } from "../dom.js";
import { getAvatarSrc, makeAvatarImg } from "../avatars.js";
import { showResult } from "./resultsScreen.js";
import { playMP3 } from "../sound.js";

export function startVoting() {
  playMP3('/audio/votingStart.mp3', { volume: 0.9 });  
  _buildVotingGrid();
  goTo("voting");
  _runVoteSequence();
}

function _buildVotingGrid() {
  const grid = qs("#vote-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const players = _getPlayers();
  state.votingPlayers = players;

  players.forEach((p) => {
    const card = document.createElement("div");
    card.className = "vote-card";
    card.id = `vcard-${safeId(p.name)}`;

    const avatarDiv = document.createElement("div");
    avatarDiv.className = "vote-card-avatar";
    avatarDiv.appendChild(makeAvatarImg(p.avatarSrc, p.name));

    card.innerHTML = `<div class="sus-tag">SUS</div>`;
    card.appendChild(avatarDiv);
    card.insertAdjacentHTML(
      "beforeend",
      `
      <div class="vote-card-name">${_esc(p.name)}</div>
      <div class="vote-card-count" id="vcount-${safeId(p.name)}">0</div>
      <div class="vote-pips" id="vpips-${safeId(p.name)}"></div>
    `,
    );
    grid.appendChild(card);
  });
}

async function _runVoteSequence() {
  const log = qs("#vote-log");

  // Cards entrance
  await sleep(400);
  gsap.fromTo(
    ".vote-card",
    { opacity: 0, scale: 0.55, y: 30 },
    { opacity: 1, scale: 1, y: 0, duration: 0.55, stagger: 0.09, ease: "back.out(1.6)" },
  );

  await sleep(900);
  if (log) log.textContent = "The AIs are deliberating…";

  const voters  = state.chatRoom?.aiPlayers ?? [];
  const history = state.chatRoom?.getHistory() ?? [];

  for (let i = 0; i < voters.length; i++) {
    await sleep(1350);

    const voter  = voters[i];
    const target = await _pickTarget(voter, history);
    if (!target) continue;

    target.votes++;
    playMP3('/audio/voteCast.mp3', { volume: 0.7 });

    if (log) {
      gsap.fromTo(log, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 });
log.innerHTML = `<strong>${_esc(voter.name)}</strong>&nbsp;pointed at&nbsp;<strong>${_esc(target.name)}</strong>`;
    }

    const countEl = qs(`#vcount-${safeId(target.name)}`);
    const pipsEl  = qs(`#vpips-${safeId(target.name)}`);
    const card    = qs(`#vcard-${safeId(target.name)}`);

    if (countEl) {
      gsap.fromTo(
        countEl,
        { scale: 1.4, color: "#ffd05b" },
        { scale: 1, color: "#efb576", duration: 0.4, ease: "back.out" },
      );
      countEl.textContent = target.votes;
    }

    if (pipsEl) {
      const dot = document.createElement("div");
      dot.className = "vote-pip";
      dot.style.background = voter.color ?? "#e99566";
      pipsEl.appendChild(dot);
    }

    if (card) {
      card.classList.add("has-vote");
      gsap.fromTo(
        card,
        { scale: 1.12, boxShadow: "0 0 30px rgba(239,181,118,0.5)" },
        { scale: 1,    boxShadow: "0 0 24px rgba(239,181,118,0.2)", duration: 0.4 },
      );
    }
  }

  await sleep(1500);
  _revealResult(log);
}


async function _pickTarget(voter, history) {
  const players = state.votingPlayers;

  const transcript = history
    .slice(-30)
    .map(m => `${m.author}: ${m.message}`)
    .join("\n");

  const names = players.map(p => p.name).join(", ");

  // Pull the AI's own messages so they can reflect on their own vibe vs others
  const voterLines = history
    .filter(m => m.author === voter.name)
    .map(m => `"${m.message}"`)
    .join(", ");

  const prompt = `You are ${voter.name}.

Your personality: ${voter.personality}
Your speaking style: ${voter.speakingStyle}
Your own messages in this chat: ${voterLines || "(you didn't speak)"}

A human was hiding among AIs in this group chat, pretending to be an AI. 
The participants were: ${names}

Recent conversation:
${transcript}

Based on your personality and instincts as ${voter.name}, who feels most human to you? 
Think about: who responded too naturally, too slowly, used too much empathy, broke the vibe, or just felt off.
Reply with ONLY the exact name of who you suspect. Choose from: ${names}`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `${voter.fullSystemPrompt}\n\nYou are now voting on who the human is. Stay in character as ${voter.name} — your personality should influence your suspicion. A paranoid character suspects differently than a laid-back one.`,
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 20,
        temperature: 0.55,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data  = await res.json();
    const reply = (data.choices?.[0]?.message?.content ?? "").trim();

    const match = players.find(p =>
      reply.toLowerCase().includes(p.name.toLowerCase())
    );
    if (match) return match;
  } catch (err) {
    console.warn(`[Vote] ${voter.name} failed, falling back:`, err);
  }

  // Fallback
  if (Math.random() < 0.6) return players.find(p => p.isHuman) ?? null;
  const others = players.filter(p => p.name !== voter.name && !p.isHuman);
  return others.length ? others[Math.floor(Math.random() * others.length)] : players.find(p => p.isHuman);
}

async function _revealResult(log) {
  const players = state.votingPlayers;
  const maxVotes = Math.max(...players.map((p) => p.votes));
  const humanPl = players.find((p) => p.isHuman);
  const humanLoses = (humanPl?.votes ?? 0) === maxVotes && 
    players.filter(p => p.votes === maxVotes).length === 1;
  // Dim non-leaders
  players.forEach((p) => {
    const card = qs(`#vcard-${safeId(p.name)}`);
    if (!card) return;

    if (p.votes === maxVotes) {
      card.classList.add(
        p.isHuman ? "is-loser" : humanLoses ? "eliminated" : "is-winner",
      );
    } else {
      setTimeout(() => {
        card.classList.add("eliminated");
        gsap.to(card, {
          scale: 0.86,
          opacity: 0.18,
          duration: 0.55,
          ease: "power2.inOut",
        });
      }, 600);
    }
  });

  // Spotlight the most-voted
  await sleep(1000);

  if (log) {
    gsap.fromTo(
      log,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out" },
    );

    log.innerHTML = humanLoses
      ? `The logs crackle… <strong>${_esc(state.playerName)}</strong> was found out. They were human all along.`
      : `The fire settles… <strong>${_esc(state.playerName)}</strong> blended in perfectly. The AIs were fooled.`;
  }

  const humanVotes = humanPl?.votes ?? 0;
  await sleep(2800);
  showResult(humanLoses ? "lose" : "win", humanVotes);
}

function _getPlayers() {
  const aiPlayers = state.chatRoom?.aiPlayers ?? [];
  return [
    {
      name: state.playerName,
      avatarSrc: getAvatarSrc(null, true),
      color: "#efb576",
      isHuman: true,
      votes: 0,
    },
    ...aiPlayers.map((ai) => ({
      name: ai.name,
      avatarSrc: getAvatarSrc(ai.name),
      color: ai.color ?? "#acbc8e",
      isHuman: false,
      votes: 0,
    })),
  ];
}

function _esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}