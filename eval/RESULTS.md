# Evaluation results (UK English)

Run: 2026-09-28 · model: jev-latest · UK word list · 105 cases (100 answerable, 5 unanswerable)

> The descriptions are **simulated** aphasic speech written by a separate AI agent that never saw the method. Real aphasic speech, and real speech-to-text on it, will be harder. Treat these numbers as "the idea works", not "it works for patients".

| | First guess right | Right word in the top 3 tiles |
|---|---|---|
| Full description | 84/100 (84%) | 97/100 (97%) |
| First half only (mid-sentence) | 57/100 (57%) | 78/100 (78%) |

Unanswerable descriptions ("this one here you know") flagged as "keep going": 5/5

Time for both requests: median 506 ms, 90th percentile 543 ms.

## By category (full description)

| Category | First guess | Top 3 |
|---|---|---|
| describe | 11/12 | 12/12 |
| disfluent | 15/15 | 15/15 |
| wrong-related-word | 8/10 | 10/10 |
| sound-alike | 10/10 | 10/10 |
| stt-misheard | 5/6 | 6/6 |
| very-short | 4/8 | 6/8 |
| personal | 10/12 | 12/12 |
| action | 5/8 | 8/8 |
| feeling | 6/6 | 6/6 |
| time-weather | 6/6 | 6/6 |
| confusable | 4/7 | 6/7 |

## Not in the top 3

- **sweets** · said: "leo's coming get treats" · got: visit (0.23), biscuit (0.14), Biscuit (0.13)
- **dinner** · said: "starving when's tea" · got: hungry (0.74), tea (0.060000000000000005), supper (0.05)
- **cup / mug** · said: "just the thing for me tea of a morning not a fancy one just the plain one" · got: tea (0.32), teabag (0.28), milk (0.06)
