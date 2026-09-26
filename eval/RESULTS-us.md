# Evaluation results (US English)

Run: 2026-09-26 · model: jev-latest · US word list · 65 cases (60 answerable, 5 unanswerable)

> The descriptions are **simulated** aphasic speech written by a separate AI agent that never saw the method. Real aphasic speech, and real speech-to-text on it, will be harder. Treat these numbers as "the idea works", not "it works for patients".

| | First guess right | Right word in the top 3 tiles |
|---|---|---|
| Full description | 52/60 (87%) | 59/60 (98%) |
| First half only (mid-sentence) | 36/60 (60%) | 47/60 (78%) |

Unanswerable descriptions ("this one here you know") flagged as "keep going": 5/5

Time for both requests: median 501 ms, 90th percentile 534 ms.

## By category (full description)

| Category | First guess | Top 3 |
|---|---|---|
| describe | 8/8 | 8/8 |
| disfluent | 7/8 | 8/8 |
| wrong-related-word | 3/6 | 6/6 |
| sound-alike | 6/6 | 6/6 |
| stt-misheard | 3/4 | 3/4 |
| very-short | 6/6 | 6/6 |
| personal | 8/8 | 8/8 |
| action | 3/5 | 5/5 |
| feeling | 3/3 | 3/3 |
| time-weather | 3/3 | 3/3 |
| confusable | 2/3 | 3/3 |

## Not in the top 3

- **sun** · said: "the son was so bright today i needed my sunglasses" · got: smile (0.37), proud (0.18), David (0.17)
