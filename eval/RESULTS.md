# Evaluation results

Run: 2026-09-25 · model: jev-latest · 105 cases (100 answerable, 5 unanswerable)

> The descriptions are **simulated** aphasic speech written by a separate AI agent that never saw the method. Real aphasic speech, and real speech-to-text on it, will be harder. Treat these numbers as "the idea works", not "it works for patients".

| | First guess right | Right word in the top 3 tiles |
|---|---|---|
| Full description | 85/100 (85%) | 99/100 (99%) |
| First half only (mid-sentence) | 57/100 (57%) | 77/100 (77%) |

Unanswerable descriptions ("this one here you know") flagged as "keep going": 5/5

Time for both requests: median 748 ms, 90th percentile 1138 ms.

## By category (full description)

| Category | First guess | Top 3 |
|---|---|---|
| describe | 11/12 | 12/12 |
| disfluent | 15/15 | 15/15 |
| wrong-related-word | 8/10 | 10/10 |
| sound-alike | 10/10 | 10/10 |
| stt-misheard | 5/6 | 5/6 |
| very-short | 4/8 | 8/8 |
| personal | 11/12 | 12/12 |
| action | 5/8 | 8/8 |
| feeling | 6/6 | 6/6 |
| time-weather | 6/6 | 6/6 |
| confusable | 4/7 | 7/7 |

## Not in the top 3

- **hairbrush** · said: "have you seen me airbrush gone off the side in the bathroom again" · got: aftershave (0.3), mirror (0.28), shave (0.09)
