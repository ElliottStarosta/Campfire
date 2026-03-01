# The Seventh One
First Place, Campfire Hackathon by Hack Club
24-hour hackathon held in Ottawa, Ontario
Theme: *Beneath the Surface*

---

## What It Is

The Seventh One is a browser-based social deduction game where one human player attempts to pass as an AI in a group chat. Six AI characters and one human are placed around a virtual campfire and given a shared conversation prompt. The human must respond naturally and blend in. At the end of the round, each AI votes on who they believe is human. If the human avoids being the most-voted player, they win.

The theme of the hackathon was "beneath the surface." The game takes that concept literally: a human hiding in plain sight within an AI conversation.

---

## Gameplay

1. The player enters their name and joins the fire.
2. A random conversation prompt is revealed with a short countdown.
3. A 90-second chat round begins. Six AI personalities converse around the topic and the player must participate.
4. The player must send at least three messages to remain in the game.
5. When time expires, each AI votes for who they believe is human, reasoning based on the conversation history and their own personality.
6. The result is revealed.

---

## AI Characters

Seventeen distinct AI personalities are defined, six of which are randomly selected each round. Each character has a defined personality, speaking style, and backstory that shapes both how they chat and how they vote. Voting is in-character: a paranoid character suspects differently than a laid-back one, and each AI reasons through the full transcript before casting their vote.

---

## Tech Stack

- **Frontend:** Vanilla JavaScript (ES modules), HTML, CSS
- **Animations:** GSAP 3
- **AI:** Anthropic Claude API via a backend proxy (`/api/chat`)
- **Build tool:** Vite
- **Hosting:** Netlify

---

## Running Locally

```bash
npm install
npm run dev
```

A backend endpoint at `/api/chat` is required to proxy requests to the Anthropic API. You will need a valid Anthropic API key configured server-side.

---

## Credits

- **Code:** Elliott Starosta
- **Illustrations:** Naomi Cheng and Annie Liang

---

## License

MIT. See [LICENSE](LICENSE) for details.
