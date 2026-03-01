// Vite root = src/, publicDir = ../public  (the-seventh/public/)
// So the-seventh/public/assets/avatars/wilson.png → served at /assets/avatars/wilson.png
const BASE = "/assets/avatars/";
const FALLBACK = BASE + "default.png";

const AVATAR_MAP = {
  "__human__":               BASE + "player.png",
  "Wilson McFurster":        BASE + "wilson.png",
  "Elliott":                 BASE + "elliott.png",
  "Kiosk (they/them)":       BASE + "kiosk.png",
  "Moth GF":                 BASE + "moth.png",
  "Jessica":                 BASE + "jessica.png",
  "NarutoSaskueFan10924828": BASE + "csguy.png",
  "Ogga Booga Guy":          BASE + "caveman.png",
  "-... . . .--. -... . . ..--": BASE + "robot.png",
  "Karen":                   BASE + "karen.png",
  "Cruncy":                  BASE + "crunchy.png",
  "Classic":                 BASE + "classic.png",
  "Mommy":                   BASE + "mommy.png",
  "Adventurer":              BASE + "adventurer.png",
  "DaveFromAccounting":      BASE + "boomer.png",
  "TruthSeeker99":           BASE + "truthseeker.png",
  "Zoe":                     BASE + "sarcastic_girl.png",
  "MasterKitten":            BASE + "discordmod.png",
};

export function getAvatarSrc(name, isHuman = false) {
  if (isHuman) return AVATAR_MAP["__human__"] ?? FALLBACK;
  return AVATAR_MAP[name] ?? FALLBACK;
}

export function makeAvatarImg(src, alt = "") {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.loading = "lazy";
  img.decoding = "async";
  img.onerror = () => {
    if (img.src !== FALLBACK) img.src = FALLBACK;
  };
  return img;
}