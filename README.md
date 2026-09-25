# Aphasia Word Finder

**For people with aphasia: describe the word you can't find, any way you can. Tap the right guess. Hear it said.**

**Try it: [aphasia-word-finder.vercel.app](https://aphasia-word-finder.vercel.app)** (voice works in Chrome, Edge and Safari; typing works everywhere)

Built with [Claude Code](https://claude.com/claude-code) and [Jev](https://docs.typesafe.ai).

After a stroke, many people with aphasia know exactly what they mean but can't get the word out:
*"the hot thing… you drink it… morning… brown"*. Word Finder listens while they talk around the word
and shows its best guesses as big picture tiles. They tap the right one and the tablet says it out loud.

> ⚠️ A demo, not a medical device. It has **not** been tested with people who have aphasia yet.

## Why it can be trusted with this

- **It never makes a word up.** It can only pick from a fixed list: about 900 everyday words plus the person's own names, pets and places.
- **The person always chooses.** Nothing is said until they tap a tile.
- **It says when it isn't sure.** For "this one here, you know" it answers *"Not sure yet, keep going"* instead of guessing wildly.

## How it works

1. **Speech → text:** the browser's built-in speech recognition (Chrome, Edge, Safari). It keeps listening through long pauses.
2. **Guessing:** [Jev](https://docs.typesafe.ai), TypeSafe's *System One* model. Instead of writing text, it answers multiple-choice questions with probabilities. One question can hold 255 options, so the vocabulary is split into 6 slices: one request asks all 6 at once, a second request picks between the ~24 best. About half a second to a second in total.
3. **Pictures and voice:** [ARASAAC](https://arasaac.org) symbols (the kind used in speech therapy) on every tile, and the browser's text-to-speech.

Personal words ("My words", top right): family add the people, pets and places the person talks about, with who each one is ("Margaret: my wife") and an optional photo. They're stored only in that browser.

## Test results

A separate Claude agent wrote 105 descriptions imitating aphasic speech the way speech-to-text would transcribe it: fillers, false starts, wrong related words ("the cat no no the one that barks"), sound-alike errors ("a tup of tea"), very short fragments, and five hopeless ones ("this one here you know"). It never saw how the app works. Results with the app's own code (`npm run eval`, full breakdown in [eval/RESULTS.md](eval/RESULTS.md)):

| | First guess right | Right word in the top 3 tiles |
|---|---|---|
| Full description | **85%** | **99%** |
| Halfway through the sentence | 57% | 77% |

All 5 hopeless descriptions got "Not sure yet, keep going". The one miss out of 100: *"have you seen me airbrush"* (hairbrush). A guess takes about 0.5–1 s.

**The honest caveat:** this speech was *simulated*. Real aphasic speech can be much more broken up, and browser speech-to-text handles it worse. These numbers say "the idea works", not "it works for patients". The next step is testing with speech & language therapists.

## Run it

Needs Node 20+ and a TypeSafe API key ([typesafe.ai](https://typesafe.ai), early access).

```bash
cp .env.example .env      # then put your TYPESAFE_API_KEY in .env
npm start                 # http://localhost:4391
npm test                  # unit tests, no network
npm run eval              # re-runs the blind test (~420 API calls, a few cents)
```

Deploying: it's ready for Vercel (`api/guess.mjs` + `public/`; `vercel.json` sets no framework so Vercel doesn't try to run `server.mjs`, which is only for local use). Set `TYPESAFE_API_KEY` in the project's environment variables; `DAILY_LIMIT` (default 20000 guesses a day) caps the bill. The limits are kept in memory, so they apply per server instance. The key never reaches the browser.

## Privacy

- The browser turns speech into text. **Chrome does this on Google's servers.**
- That text and the list of personal words (not photos) are sent to TypeSafe's API to make the guesses.
- This app's server stores nothing. Personal words and photos stay in the browser (`localStorage`).

## Limitations

- Not tested with people who have aphasia.
- English only; the vocabulary is British-flavoured (tea, crisps, the bowls club).
- Speech recognition on very disfluent speech is unknown territory.
- Needs an internet connection (speech service + Jev).
- 8 of the ~900 words have no ARASAAC symbol and show initials instead.

## Project layout

```
public/          the page (no framework, no build step): index.html, style.css, app.js
lib/             vocabulary, the two-step Jev method, input checks, rate limiting
api/guess.mjs    Vercel function            server.mjs   local server (no dependencies)
eval/            the blind test set + runner test/         unit tests (node --test)
scripts/         builds public/pictos.json (word → ARASAAC symbol id)
```

## Credits

- Built with **Claude** by Anthropic, in [Claude Code](https://claude.com/claude-code). Claude Opus 5.5 wrote the code, the tests and this README. A separate Claude Sonnet 5 agent that never saw the code wrote the blind test set.
- Pictograms: **ARASAAC** (https://arasaac.org), author Sergio Palao, property of the Government of Aragón (Spain), licensed **CC BY-NC-SA 4.0**. Non-commercial use only; loaded from ARASAAC's servers.
- Guessing: **Jev** by TypeSafe.
- Microphone icon: [Lucide](https://lucide.dev) (ISC). Font: [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/) by the Braille Institute (OFL).

Code: MIT (see [LICENSE](LICENSE)). The pictograms are not covered by the MIT licence.
