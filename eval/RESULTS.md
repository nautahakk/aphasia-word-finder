# Evaluation results (UK English)

Run: 2026-09-26 · model: jev-latest · UK word list · 105 cases (100 answerable, 5 unanswerable)

> The descriptions are **simulated** aphasic speech written by a separate AI agent that never saw the method. Real aphasic speech, and real speech-to-text on it, will be harder. Treat these numbers as "the idea works", not "it works for patients".

| | First guess right | Right word in the top 3 tiles |
|---|---|---|
| Full description | 84/100 (84%) | 98/100 (98%) |
| First half only (mid-sentence) | 61/100 (61%) | 79/100 (79%) |

Unanswerable descriptions ("this one here you know") flagged as "keep going": 5/5

Time for both requests: median 521 ms, 90th percentile 580 ms.

## By category (full description)

| Category | First guess | Top 3 |
|---|---|---|
| describe | 11/12 | 12/12 |
| disfluent | 15/15 | 15/15 |
| wrong-related-word | 8/10 | 10/10 |
| sound-alike | 10/10 | 10/10 |
| stt-misheard | 5/6 | 5/6 |
| very-short | 4/8 | 8/8 |
| personal | 10/12 | 12/12 |
| action | 5/8 | 8/8 |
| feeling | 6/6 | 6/6 |
| time-weather | 6/6 | 6/6 |
| confusable | 4/7 | 6/7 |

## Not in the top 3

- **hairbrush** · said: "have you seen me airbrush gone off the side in the bathroom again" · got: aftershave (0.27), mirror (0.23), shave (0.14)
- **cup / mug** · said: "just the thing for me tea of a morning not a fancy one just the plain one" · got: teabag (0.37), tea (0.25), milk (0.05)
