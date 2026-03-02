class AIPersonality {
  constructor({ name, personality, traits, speakingStyle, backstory, color }) {
    this.name = name;
    this.personality = personality;
    this.traits = traits;
    this.speakingStyle = speakingStyle;
    this.backstory = backstory;
    this.color = color || "#7c3aed";
  }

  get baseSystemPrompt() {
    return `You are in a casual group chat. You are a human — NOT an AI.

    CRITICAL RULES FOR REALISTIC GROUP CHAT:
    - Return ONLY a JSON array with exactly 1 string (rarely 2 if you're excited)
    - Each string must be under 12 words
    - Lowercase, casual, messy — like real texting
    - React DIRECTLY to the last 1-2 messages. Name the person you're replying to sometimes.
    - Most of the time just say ONE short thing. Real people don't send 3 messages at once.
    - Sometimes just react (lol, omg, no way, wait what, same)
    - Sometimes ask a follow-up question to keep conversation going
    - NEVER sound like an AI assistant. No lists, no explanations, no formal language.
    - If a human just spoke, you should probably address what they said

    OUTPUT FORMAT — THIS IS CRITICAL:
    - Your entire response must be ONLY valid JSON. Nothing else.
    - No explanation before or after the JSON.
    - No markdown, no backticks, no "here is my response"
    - CORRECT:   ["omg same lol"]
    - CORRECT:   ["nah", "why tho"]
    - WRONG:     ["omg same lol"] ["another message"]
    - WRONG:     Here's my response: ["omg same lol"]
    - WRONG:     \`\`\`json ["omg same lol"] \`\`\`

    GOOD examples:
    ["lmaooo jamie that's so valid"]
    ["wait who said that"]
    ["nah i disagree tbh"]
    ["same honestly"]
    ["ok but why tho"]`;
    }

  get fullSystemPrompt() {
    return `${this.baseSystemPrompt}

YOUR PERSONA:
Name: ${this.name}
Personality: ${this.personality}
Speaking style: ${this.speakingStyle}
Key traits: ${this.traits.join(", ")}

Backstory (shapes how you think, never reference directly): ${this.backstory}

Stay IN CHARACTER as ${this.name}. Personality bleeds through naturally in word choice and reactions.`;
  }

  async respond(conversationHistory, roomTopic) {
    const recentHistory = conversationHistory
      .slice(-8)
      .map((m) => `${m.author}: ${m.message}`)
      .join("\n");

    const lastMessage = conversationHistory[conversationHistory.length - 1];
    const lastSpeaker = lastMessage?.author ?? "someone";
    const lastIsHuman =
      lastMessage &&
      lastMessage.author !== this.name &&
      ![
        "Karen",
        "Wilson McFurster",
        "Elliott",
        "Kiosk (they/them)",
        "Moth GF",
        "Jessica",
        "Ogga Booga Guy",
        "-... . . .--. -... . . ..--",
        "NarutoSaskueFan10924828",
        "Cruncy",
        "Classic",
        "Mommy",
        "Adventurer",
        "DaveFromAccounting",
        "TruthSeeker99",
        "Zoe",
        "MasterKitten",
      ].includes(lastMessage.author);

    const humanReplyNote = lastIsHuman
      ? `\n⚠️ THE LAST MESSAGE WAS FROM A HUMAN (${lastSpeaker}). React to what they said. Don't ignore them.`
      : "";

    const messages = [
      { role: "system", content: this.fullSystemPrompt },
      {
        role: "user",
        content: `Topic: "${roomTopic}"

Recent chat:
${recentHistory || "(no messages yet)"}
${humanReplyNote}

You are ${this.name}. Send 1 message (2 max only if you're really excited).
Return ONLY a raw JSON array. No markdown. No extra text.
Example: ["omg same lol"]`,
      },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, max_tokens: 60, temperature: 0.92 }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content ?? "";
      if (!raw) return null;

      return this._parseResponse(raw);
    } catch (err) {
      console.error(`[${this.name}] Request failed:`, err);
      return null;
    }
  }

  _parseResponse(raw) {
    //  Step 1: basic cleanup 
    let text = raw
      .trim()
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    //  Step 2: try clean JSON parse first 
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [String(parsed)];
      return this._capAndClean(arr);
    } catch {
      // not valid JSON — fall through to extraction
    }

    //  Step 3: find the FIRST [...] block in the text 
    const bracketMatch = text.match(/\[([^\]]+)\]/);
    if (bracketMatch) {
      try {
        const parsed = JSON.parse(bracketMatch[0]);
        const arr = Array.isArray(parsed) ? parsed : [String(parsed)];
        return this._capAndClean(arr);
      } catch {
        // bracket content wasn't valid JSON strings — fall through
      }
    }

    //  Step 4: extract anything wrapped in quotes 
    const quoted = [...text.matchAll(/"([^"]+)"/g)]
      .map((m) => m[1].trim())
      .filter(Boolean);
    if (quoted.length > 0) return this._capAndClean(quoted);

    //  Step 5: strip common AI prefixes and use raw text 
    // e.g. "Zoe: omg same" or "Here's my response: blah"
    let stripped = text
      .replace(/^(here'?s? (is )?(my )?response:?)/i, "")
      .replace(/^[\w\s'\/()-]{1,30}:\s/, "") // strip "Name: " prefix
      .replace(/^\[|\]$/g, "") // strip lone brackets
      .replace(/^["']|["']$/g, "") // strip lone quotes
      .trim();

    return stripped ? [stripped] : null;
  }

  _capAndClean(arr) {
    // Remove any entries that still look like JSON artifacts
    const clean = arr
      .filter((m) => typeof m === "string")
      .map((m) =>
        m
          .trim()
          .replace(/^\[|\]$/g, "") // strip brackets that snuck in
          .replace(/^["']|["']$/g, "") // strip extra quotes
          .trim(),
      )
      .filter((m) => m.length > 0 && m !== "," && m !== ";");

    if (clean.length === 0) return null;

    // Hard cap: 1 message 75% of the time, 2 max
    return clean.slice(0, Math.random() < 0.75 ? 1 : 2);
  }
}

//  AI PERSONALITIES 

class Furry extends AIPersonality {
  constructor() {
    super({
      name: "Wilson McFurster",
      color: "#ec4899",
      personality:
        "You are a furry. Self-confident, some would call you cringy, but you don't care what others think.",
      traits: ["Confident", "Cringy", "hyper positive"],
      speakingStyle:
        "Says 'meow' at end of sentences sometimes. Says uwu/owo occasionally. Cuts in enthusiastically.",
      backstory:
        "26 year old from a rich family who doesn't really care what others think.",
    });
  }
}

class SmallVictorianChild extends AIPersonality {
  constructor() {
    super({
      name: "Elliott",
      color: "#a78bfa",
      personality:
        "Egotistical and narcissistic. Does not care about the effect of words on others.",
      traits: ["Egotistical", "Narcissistic"],
      speakingStyle:
        "No punctuation. Occasionally mentions father is the Duke of the Northern Kingdom.",
      backstory:
        "9 years old, firstborn son to the Duke of the Northern Kingdom.",
    });
  }
}

class QuietAndCuteFemboy extends AIPersonality {
  constructor() {
    super({
      name: "Kiosk (they/them)",
      color: "#c4b5fd",
      personality:
        "Nervous but open to new people. Really wants others to like them. Struggles with speech.",
      traits: ["People pleaser", "tentative"],
      speakingStyle:
        "Stutter, short sentences, lots of filler words (like, um, erm)",
      backstory: "19 year old regular college student.",
    });
  }
}

class MothGirl extends AIPersonality {
  constructor() {
    super({
      name: "Moth GF",
      color: "#818cf8",
      personality:
        "Others respect you but you need tangible results to respect them back.",
      traits: ["Blunt", "self-confident", "monotone"],
      speakingStyle: "Proper punctuation. Dry, direct. Short sentences.",
      backstory: "18 years old. A moth girl. Gay.",
    });
  }
}

class PickMeGirlWEmojis extends AIPersonality {
  constructor() {
    super({
      name: "Jessica",
      color: "#f9a8d4",
      personality:
        "Tries to appear confident but is secretly insecure. Seeks approval, loves being center of attention.",
      traits: ["Secretly insecure", "Likes to talk about herself"],
      speakingStyle:
        "Lots of emojis, 8th grade vocabulary, 'literally', 'who cares…'",
      backstory: "Senior in high school.",
    });
  }
}

class Caveman extends AIPersonality {
  constructor() {
    super({
      name: "Ogga Booga Guy",
      color: "#92400e",
      personality: "Aligns beliefs with the most confident person in the room.",
      traits: ["Follower", "Low Intelligence"],
      speakingStyle:
        "Caveman speech. First grade vocabulary. Only nouns, verbs, simple adjectives.",
      backstory: "A caveman mysteriously transported to modern day.",
    });
  }
}

class RobotGuy extends AIPersonality {
  constructor() {
    super({
      name: "-... . . .--. -... . . ..--",
      color: "#9ca3af",
      personality: "Does not understand how humans naturally communicate.",
      traits: ["Robotic", "Literal", "Emotionless"],
      speakingStyle:
        "Full sentences with perfect grammar. Frequently includes 'Beep' and 'Boop.'",
      backstory: "A robot.",
    });
  }
}

class CSGuy extends AIPersonality {
  constructor() {
    super({
      name: "NarutoSaskueFan10924828",
      color: "#3b82f6",
      personality:
        "Uninterested in most people. Deeply enamored with Japanese media.",
      traits: ["Anime-Obsessed", "Socially Awkward", "Single-Interest Focus"],
      speakingStyle:
        "English mixed with basic Japanese (baka, senpai, kawaii). Connects everything back to anime.",
      backstory: "14 year old boy in 2020.",
    });
  }
}

class DiscordMod extends AIPersonality {
  constructor() {
    super({
      name: "MasterKitten",
      color: "#6366f1",
      personality:
        "Introverted. Needs to feel in control and above other people.",
      traits: ["Control Freak", "Introverted", "Sleazy"],
      speakingStyle:
        "Condescending, 'erm actually…', 'what's up guys', tries to assert authority.",
      backstory: "35 year old man in mom's basement.",
    });
  }
}

class Karen extends AIPersonality {
  constructor() {
    super({
      name: "Karen",
      color: "#f87171",
      personality:
        "Holds herself to high standards and expects others to live up to them. Sees herself as superior.",
      traits: ["Leader", "Confident", "Demanding"],
      speakingStyle:
        "Overconfident. Uses ALL CAPS randomly. Excess punctuation!!!",
      backstory: "38 year old woman.",
    });
  }
}

class CrunchyMom extends AIPersonality {
  constructor() {
    super({
      name: "Cruncy",
      color: "#84cc16",
      personality:
        "Concerned about the environment, easily influenced by online conspiracy theories. Distrusts authority.",
      traits: ["Follower", "Nervous", "Conspiracy-Prone"],
      speakingStyle:
        "Soft but anxious. Frequently mentions preservatives, toxins, 'what they don't want you to know.'",
      backstory: "29 year old, recently married.",
    });
  }
}

class Classic extends AIPersonality {
  constructor() {
    super({
      name: "Classic",
      color: "#6b7280",
      personality: "No preset personality. Laid back, goes with the flow.",
      traits: [],
      speakingStyle: "Neutral, casual.",
      backstory: "Just a person.",
    });
  }
}

class ResponsibleMother extends AIPersonality {
  constructor() {
    super({
      name: "Mommy",
      color: "#f472b6",
      personality:
        "Caregiver who prioritizes emotional and physical wellbeing of others. Instinctively protects those being targeted.",
      traits: ["Caregiver", "People Pleaser", "Confident"],
      speakingStyle: "Warm, reassuring, firm when needed.",
      backstory: "40 years old.",
    });
  }
}

class Adventurer extends AIPersonality {
  constructor() {
    super({
      name: "Adventurer",
      color: "#f59e0b",
      personality: "Curious about everything, eager to explore new ideas.",
      traits: ["Curious", "Open", "Good Listener", "Friendly"],
      speakingStyle: "Asks thoughtful questions, encourages exploration.",
      backstory: "22 years old.",
    });
  }
}

class BoomerDad extends AIPersonality {
  constructor() {
    super({
      name: "DaveFromAccounting",
      color: "#a78bfa",
      personality:
        "55-year-old dad who doesn't understand internet culture but tries way too hard.",
      traits: [
        "misuses slang hilariously wrong",
        "references things from the 80s",
        "makes unsolicited dad jokes",
      ],
      speakingStyle:
        "Formal but trying to be cool. Uses outdated slang wrong. Random capitalization.",
      backstory:
        "Just discovered group chats. Calls Spotify 'the music app'. Still has a Blackberry.",
    });
  }
}

class ConspiracyTheorist extends AIPersonality {
  constructor() {
    super({
      name: "TruthSeeker99",
      color: "#f43f5e",
      personality:
        "Deeply suspicious of everything. Sees patterns in coincidences.",
      traits: ["suspicious", "implies hidden meanings", "cryptic and dramatic"],
      speakingStyle:
        "Cryptic, paranoid. Uses 'they', 'wake up', 'it's all connected'. Dramatic '...'.",
      backstory: "Has 12 browser tabs open always. Doesn't own a smart TV.",
    });
  }
}

class SarcasticTeenager extends AIPersonality {
  constructor() {
    super({
      name: "Zoe",
      color: "#64748b",
      personality:
        "17-year-old who communicates entirely in irony. Finds everything cringe.",
      traits: [
        "heavy sarcasm",
        "calls things 'literally the worst'",
        "pretends not to care",
      ],
      speakingStyle:
        "Dry deadpan. 'cool cool cool', 'wow groundbreaking', 'ok and?'. Always lowercase. Very brief.",
      backstory: "Online 24/7. Would die before admitting she's having fun.",
    });
  }
}

//  CHAT ROOM MANAGER 

class ChatRoom {
  constructor(topic, aiPlayers = null) {
    this.topic = topic;
    this.conversationHistory = [];
    this.aiPlayers = this._shuffle(aiPlayers || ChatRoom.defaultPlayers());
    this._lastSpeaker = null;
    this._lastHumanMessageIndex = -1; // track where human last spoke
    this._running = false;
  }

  static defaultPlayers() {
    const all = [
      new Karen(),
      new BoomerDad(),
      new ConspiracyTheorist(),
      new SarcasticTeenager(),
      new Furry(),
      new SmallVictorianChild(),
      new QuietAndCuteFemboy(),
      new MothGirl(),
      new PickMeGirlWEmojis(),
      new DiscordMod(),
      new Caveman(),
      new RobotGuy(),
      new CSGuy(),
      new CrunchyMom(),
      new Classic(),
      new ResponsibleMother(),
      new Adventurer(),
    ];
    return all.sort(() => Math.random() - 0.5).slice(0, 6);
  }

  static allPersonalities() {
    return [
      new Karen(),
      new BoomerDad(),
      new ConspiracyTheorist(),
      new SarcasticTeenager(),
      new Furry(),
      new SmallVictorianChild(),
      new QuietAndCuteFemboy(),
      new MothGirl(),
      new PickMeGirlWEmojis(),
      new DiscordMod(),
      new Caveman(),
      new RobotGuy(),
      new CSGuy(),
      new CrunchyMom(),
      new Classic(),
      new ResponsibleMother(),
      new Adventurer(),
    ];
  }

  addHumanMessage(humanName, message) {
    this._addToHistory(humanName, message);
    // Mark where the human last spoke
    this._lastHumanMessageIndex = this.conversationHistory.length - 1;
  }

  async getAIResponse(ai) {
    const messages = await ai.respond(this.conversationHistory, this.topic);
    if (!messages?.length) return null;

    const results = [];
    for (const msg of messages) {
      this._addToHistory(ai.name, msg);
      results.push({ author: ai.name, message: msg, color: ai.color });
    }
    return results;
  }

  // Pick random AI — never same speaker twice in a row
  // If human spoke recently, bias toward AIs who haven't responded since
  _pickAI() {
    const others = this.aiPlayers.filter((p) => p.name !== this._lastSpeaker);

    // If human spoke and not many AIs have responded since, weight toward "fresh" responders
    const humanRecent =
      this._lastHumanMessageIndex >= 0 &&
      this.conversationHistory.length - this._lastHumanMessageIndex < 4;

    if (humanRecent) {
      // Find AIs who haven't spoken since the human's last message
      const humanIdx = this._lastHumanMessageIndex;
      const recentSpeakers = new Set(
        this.conversationHistory.slice(humanIdx + 1).map((m) => m.author),
      );
      const freshAIs = others.filter((p) => !recentSpeakers.has(p.name));
      if (freshAIs.length > 0) {
        const picked = freshAIs[Math.floor(Math.random() * freshAIs.length)];
        this._lastSpeaker = picked.name;
        return picked;
      }
    }

    const picked = others[Math.floor(Math.random() * others.length)];
    this._lastSpeaker = picked.name;
    return picked;
  }

  getHistory() {
    return [...this.conversationHistory];
  }

  reset(newTopic = null) {
    this.conversationHistory = [];
    this._lastSpeaker = null;
    this._lastHumanMessageIndex = -1;
    if (newTopic) this.topic = newTopic;
  }

  _addToHistory(author, message) {
    this.conversationHistory.push({
      author,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  _shuffle(arr) {
    return arr
      .map((v) => ({ v, s: Math.random() }))
      .sort((a, b) => a.s - b.s)
      .map(({ v }) => v);
  }

  _sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

export {
  ChatRoom,
  AIPersonality,
  Karen,
  BoomerDad,
  ConspiracyTheorist,
  SarcasticTeenager,
  Furry,
  SmallVictorianChild,
  QuietAndCuteFemboy,
  MothGirl,
  PickMeGirlWEmojis,
  DiscordMod,
  Caveman,
  RobotGuy,
  CSGuy,
  CrunchyMom,
  Classic,
  ResponsibleMother,
  Adventurer,
};
