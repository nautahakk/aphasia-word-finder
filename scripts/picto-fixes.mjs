// Hand-checked picture fixes (audit 2026-09-26). ARASAAC's search had picked the wrong
// meaning or a loose match: "plant pot" showed a pothole, "PIN number" a safety pin,
// "toe" tic-tac-toe, "glasses" drinking glasses. null = no picture (initials), because
// a wrong picture is worse than none. Used by scripts/build-pictos.mjs and the tests.

// British words. An American word that replaced one of these gets the same picture.
export const FIXED = {
  "mashed potato": 2539, "roast potatoes": 2503, "baked beans": 3294, porridge: 6921, cornflakes: 2328, scone: 10231,
  "fish and chips": 2520, "fry-up": 2428, "Yorkshire pudding": null, "herbal tea": 2429, teabag: 29802, jelly: 21890,
  squash: 11461, cream: 5523, "picture frame": 3281, "toilet roll": 2862, "tumble dryer": 26431, glasses: 3329,
  "reading glasses": 3329, "computer mouse": 26186, jigsaw: 2540, "playing cards": 3182, "board game": 2501,
  "garden hose": 2929, "plant pot": 3126, hedge: 30241, shed: 8075, "bird feeder": 2490, "car keys": 8153,
  "bank card": 4751, cash: 4630, "bus pass": 36851, "council tax": 35449, "bank account": 3062, signature: 6008,
  "PIN number": 27691, app: 25269, wellies: 2287, "wedding ring": 6900, "swimming trunks": 2270, "care home": 5910,
  surgery: 35337, tablets: 2855, plaster: 8331, "corner shop": 2956, "cash machine": 17190, seaside: 2826,
  "garden centre": 7135, "water the plants": 2817, taste: null, "come home": 6964, anniversary: 6969,
  "TV programme": 29123, film: 24797, baking: 5487, Easter: 32478, toe: 26035, desk: 26071, bottom: 2730,
  call: 6518, fall: 6067, sink: 2399, sheet: 8367, suit: 39694, exercise: 10156, sore: 2367, post: 21828,
  cricket: null, "light switch": 2431,
};

// American words that need their own fix.
export const FIXED_US = { tablet: 9165 };
