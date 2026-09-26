// Everyday vocabulary Jev picks from. It can only ever return one of these
// words (or one of the person's own words) - it never makes a word up.
//
// Jev's Choice question takes at most 255 options, so the list is sent as
// several "chunks" in one request. Each chunk leaves room for none_of_these.

export const NONE = "none_of_these";
export const CHUNK_MAX = 249; // + none_of_these = 250 <= 255

const split = (s) => s.split(",").map((w) => w.trim()).filter(Boolean);

// group = picture-board colour (people yellow, doing green, things orange,
// feelings blue, time purple), following common AAC colour-coding.
const LISTS = {
  food: ["thing", split(`bread, toast, butter, jam, marmalade, honey, cheese, egg, bacon, sausage, ham, chicken, beef, pork, lamb, fish, salmon, tuna, prawns, soup, stew, curry, rice, pasta, spaghetti, pizza, sandwich, burger, chips, crisps, potato, mashed potato, roast potatoes, carrot, peas, beans, baked beans, broccoli, cabbage, cauliflower, lettuce, tomato, cucumber, onion, garlic, mushroom, sweetcorn, apple, banana, orange, pear, grapes, strawberry, raspberry, blueberry, lemon, peach, plum, cherry, melon, pineapple, mango, cereal, porridge, cornflakes, yoghurt, cake, biscuit, chocolate, sweets, ice cream, custard, pudding, crumble, pie, pastry, scone, muffin, doughnut, pancake, crackers, nuts, peanut butter, salt, black pepper, sugar, flour, oil, vinegar, ketchup, mustard, mayonnaise, gravy, sauce, salad, noodles, omelette, fish and chips, roast dinner, fry-up, jelly, trifle, popcorn, chewing gum, mints, cream, steak, meatballs, lasagne, quiche, kebab, stuffing, Yorkshire pudding, mince pie, hot dog, bagel, taco, burrito, nachos, sushi, fried chicken, waffle, pretzel, brownie, cupcake, maple syrup, hash browns, ice lolly`)],
  drink: ["thing", split(`water, tea, coffee, milk, juice, orange juice, apple juice, squash, lemonade, cola, hot chocolate, beer, wine, whisky, gin, cider, smoothie, milkshake, decaf, herbal tea, sparkling water, ice`)],
  home1: ["thing", split(`cup, mug, glass, plate, bowl, saucer, knife, fork, spoon, teaspoon, kettle, toaster, microwave, oven, fridge, freezer, dishwasher, sink, tap, frying pan, saucepan, lid, tray, tin opener, bottle opener, corkscrew, jug, teapot, teabag, straw, napkin, tea towel, sponge, washing-up liquid, bin, bin bag, recycling, table, chair, sofa, armchair, bed, pillow, duvet, blanket, sheet, mattress, wardrobe, drawer, shelf, cupboard, desk, lamp, light bulb, light switch, plug, socket, curtains, blinds, window, door, key, lock, doorbell, letterbox, stairs, lift, carpet, rug, mirror, clock, alarm clock, watch, calendar, radiator, heater, fan, thermostat, candle, matches, lighter, vase, picture frame, photo, painting, cushion, towel, soap, shampoo, toothbrush, toothpaste, razor, comb, hairbrush, hairdryer, deodorant, perfume, aftershave, tissues, toilet roll, toilet, bath, shower, washing machine, tumble dryer, iron, ironing board, hoover, mop, bucket, broom, dustpan, duster, clothes peg, laundry basket, coat hanger, needle, thread, scissors, sellotape, glue, pen, pencil, paper, envelope, stamp, notebook, diary, battery, torch, umbrella`)],
  home2: ["thing", split(`walking stick, zimmer frame, wheelchair, hearing aid, glasses, reading glasses, sunglasses, dentures, remote control, television, radio, record player, phone, mobile phone, charger, headphones, computer, laptop, tablet computer, keyboard, computer mouse, printer, camera, newspaper, magazine, book, crossword, jigsaw, playing cards, dice, board game, knitting needles, wool, paintbrush, hammer, nail, screw, screwdriver, spanner, drill, saw, ladder, tape measure, toolbox, garden hose, watering can, lawnmower, spade, rake, wheelbarrow, seeds, plant pot, flower, tree, grass, hedge, shed, greenhouse, bird feeder, fence, gate, bike, car, car keys, wallet, purse, handbag, bag, suitcase, rucksack, money, coins, bank card, cash, receipt, bill, ticket, passport, driving licence, bus pass, letter, parcel, pension, rent, council tax, electricity, gas, insurance, bank account, savings, change, price, shopping list, form, signature, PIN number, password, internet, wifi, video call, text message, app, screen, button, volume, channel, subtitles`)],
  clothes: ["thing", split(`shirt, t-shirt, blouse, jumper, cardigan, jacket, coat, raincoat, trousers, jeans, shorts, skirt, dress, suit, tie, belt, socks, tights, underwear, vest, pyjamas, dressing gown, slippers, shoes, trainers, boots, wellies, sandals, hat, cap, scarf, gloves, earrings, necklace, ring, wedding ring, bracelet, handkerchief, apron, uniform, swimming trunks, button, zip, shoelaces, pocket`)],
  body: ["thing", split(`head, face, hair, eye, ear, nose, mouth, lips, tongue, tooth, throat, neck, shoulder, arm, elbow, wrist, hand, finger, thumb, fingernail, chest, heart, lungs, stomach, back, hip, bottom, leg, knee, ankle, foot, toe, skin, bone, blood, brain, bladder, kidney, muscle, spine, forehead, cheek, chin, eyebrow, beard, moustache`)],
  health: ["thing", split(`doctor, nurse, hospital, surgery, pharmacy, ambulance, appointment, prescription, medicine, tablets, painkillers, paracetamol, inhaler, insulin, injection, blood pressure, blood test, x-ray, scan, operation, bandage, plaster, ointment, thermometer, pain, headache, toothache, earache, backache, stomach ache, cough, cold, flu, fever, sore throat, dizzy, sick, itch, rash, swelling, bruise, cut, burn, fall, stroke, speech therapist, physio, exercise, dentist, optician, carer, care home`)],
  people: ["people", split(`mum, dad, wife, husband, son, daughter, brother, sister, grandson, granddaughter, grandchildren, grandma, grandad, aunt, uncle, cousin, nephew, niece, baby, child, boy, girl, man, woman, friend, neighbour, family, teacher, postman, plumber, electrician, builder, cleaner, hairdresser, barber, vicar, shopkeeper, bus driver, taxi driver, police officer, firefighter, lawyer, boss, visitor`)],
  places: ["thing", split(`home, house, flat, bedroom, bathroom, kitchen, living room, dining room, hallway, garden, garage, loft, shop, supermarket, corner shop, butcher, bakery, post office, bank, cash machine, library, church, school, park, beach, seaside, sea, river, lake, mountain, hill, forest, countryside, city, town, village, street, road, pavement, bus stop, train station, airport, car park, petrol station, pub, restaurant, cafe, cinema, theatre, museum, swimming pool, gym, football ground, hotel, market, garden centre, allotment, cemetery, office, work, farm, zoo`)],
  transport: ["thing", split(`bus, train, taxi, bicycle, motorbike, van, lorry, plane, boat, ship, ferry, tram, the underground, coach, scooter, mobility scooter, pushchair`)],
  animals: ["thing", split(`dog, cat, puppy, kitten, bird, budgie, parrot, goldfish, rabbit, hamster, horse, cow, sheep, pig, hen, duck, goose, swan, robin, pigeon, seagull, fox, squirrel, hedgehog, mice, rat, frog, snake, spider, bee, wasp, fly, butterfly, ant, slug, snail, worm, lion, tiger, elephant, monkey, bear, giraffe`)],
  actions: ["doing", split(`eat, drink, sleep, wake up, get up, sit down, stand up, walk, run, lie down, rest, wash, brush teeth, shave, get dressed, cook, bake, boil, fry, clean, tidy up, wash up, dry, sweep, dig, plant, water the plants, mow the lawn, read, write, draw, sing, dance, listen, watch, look, see, hear, smell, taste, touch, talk, call, send a text, visit, go out, come home, leave, wait, stop, start, finish, help, carry, lift, push, pull, open, close, turn on, turn off, buy, pay, sell, go shopping, borrow, lend, give, take, bring, send, post, pick up, drop, lose, find, look for, remember, forget, think, know, understand, learn, play, win, knit, sew, go fishing, swim, cycle, drive, park the car, fix, build, break, throw away, pray, laugh, cry, smile, hug, kiss, shout, whisper, sneeze, yawn, breathe, climb, hurry, relax, worry, celebrate, go to the toilet, have a bath, have a shower`)],
  feelings: ["feeling", split(`happy, sad, angry, upset, worried, anxious, scared, nervous, excited, bored, lonely, tired, sleepy, hungry, thirsty, full, hot, warm, comfortable, uncomfortable, sore, ill, better, worse, fine, frustrated, embarrassed, confused, proud, grateful, relieved, calm, busy, fed up, homesick`)],
  time: ["time", split(`morning, afternoon, evening, night, today, tomorrow, yesterday, week, weekend, month, year, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, breakfast, lunch, dinner, supper, birthday, Christmas, Easter, holiday, anniversary, wedding, funeral, rain, sun, snow, wind, fog, storm, thunder, cloud, rainbow, frost, Halloween`)],
  hobbies: ["thing", split(`football, cricket, tennis, golf, snooker, darts, bowls, bingo, quiz, sudoku, puzzle, chess, dominoes, music, song, film, TV programme, the news, weather forecast, soap opera, gardening, fishing, knitting, cooking, baking, photography`)],
};

// Chunk plan - the same slices that passed the blind test.
// The person's own words go into the people/places slice.
const PLAN = [
  ["food & drink", ["food", "drink"]],
  ["things at home 1", ["home1"]],
  ["things at home 2, money & tech", ["home2"]],
  ["clothes, body & health", ["clothes", "body", "health"]],
  ["people, places, transport & animals", ["people", "places", "transport", "animals"]],
  ["doing, feeling, time & hobbies", ["actions", "feelings", "time", "hobbies"]],
];
export const PERSONAL_CHUNK = 4;

// The lists above are British English. For American visitors each British word
// is swapped for the American one; null = left out (no everyday US equivalent).
const US_WORDS = {
  chips: "fries", crisps: "chips", prawns: "shrimp", sweetcorn: "corn", porridge: "oatmeal", yoghurt: "yogurt",
  biscuit: "cookie", sweets: "candy", doughnut: "donut", omelette: "omelet", lasagne: "lasagna", jelly: "Jell-O",
  "fry-up": "bacon and eggs", "mashed potato": "mashed potatoes", "roast potatoes": "roasted potatoes",
  "roast dinner": "pot roast", crumble: "cobbler", "mince pie": null, "Yorkshire pudding": null, trifle: null, "ice lolly": "popsicle",
  squash: "fruit punch", cola: "soda", whisky: "whiskey",
  tap: "faucet", "tin opener": "can opener", "washing-up liquid": "dish soap", "tea towel": "dish towel",
  bin: "trash can", "bin bag": "trash bag", duvet: "comforter", wardrobe: "closet", socket: "outlet", lift: "elevator",
  letterbox: "mailbox", hoover: "vacuum", "clothes peg": "clothespin", sellotape: "tape", torch: "flashlight",
  diary: "planner", "toilet roll": "toilet paper", bath: "bathtub", "tumble dryer": "dryer", jug: "pitcher",
  "walking stick": "cane", "zimmer frame": "walker", "mobile phone": "cell phone", "tablet computer": "tablet",
  jigsaw: "jigsaw puzzle", wool: "yarn", spanner: "wrench", spade: "shovel", "plant pot": "flower pot",
  purse: "coin purse", handbag: "purse", rucksack: "backpack", "bank card": "debit card",
  "driving licence": "driver's license", parcel: "package", "council tax": "property tax", subtitles: "captions",
  jumper: "sweater", trousers: "pants", vest: "undershirt", tights: "pantyhose", pyjamas: "pajamas",
  "dressing gown": "bathrobe", trainers: "sneakers", wellies: "rain boots", "swimming trunks": "swim trunks", zip: "zipper",
  moustache: "mustache",
  surgery: "doctor's office", operation: "surgery", tablets: "pills", paracetamol: "Tylenol", plaster: "Band-Aid",
  physio: "physical therapist", optician: "eye doctor", carer: "caregiver", "care home": "nursing home",
  mum: "mom", grandad: "grandpa", neighbour: "neighbor", postman: "mailman", vicar: "pastor", builder: "contractor",
  garden: "yard", flat: "apartment", loft: "attic", shop: "store", supermarket: "grocery store",
  "corner shop": "convenience store", "cash machine": "ATM", seaside: "the coast", sea: "ocean", pavement: "sidewalk",
  "car park": "parking lot", "petrol station": "gas station", pub: "bar", cinema: "movie theater", theatre: "theater",
  "football ground": "stadium", "garden centre": "garden center", allotment: "community garden",
  lorry: "truck", motorbike: "motorcycle", "the underground": "the subway", tram: "streetcar", coach: null, pushchair: "stroller",
  budgie: "parakeet",
  "wash up": "do the dishes", post: "mail", "go to the toilet": "go to the bathroom",
  "have a bath": "take a bath", "have a shower": "take a shower",
  holiday: "vacation",
  football: "soccer", snooker: "pool", bowls: "bowling", quiz: "trivia", film: "movie", "TV programme": "TV show",
};
// Only in the US list. Added after the swaps, so American "football" doesn't become soccer.
const US_EXTRA = {
  food: ["mac and cheese", "grilled cheese", "meatloaf", "cornbread", "pickle"], drink: ["iced tea", "root beer"],
  time: ["Thanksgiving", "Fourth of July"], hobbies: ["football", "baseball", "basketball"],
};

export const LOCALES = ["uk", "us"];

const GROUP = new Map();
const US_CHANGED = new Set();
export const US_FROM = new Map(); // American word -> the British word it replaced

function baseChunks(locale) {
  const us = locale === "us";
  const seen = new Set(); // exact match on purpose: "Biscuit" the dog != "biscuit" the food
  return PLAN.map(([name, keys]) => {
    const words = [];
    const add = (w, group) => {
      if (!w || seen.has(w)) return;
      seen.add(w);
      words.push(w);
      GROUP.set(w, group);
    };
    for (const k of keys) {
      const [group, list] = LISTS[k];
      for (const uk of list) {
        const w = us && uk in US_WORDS ? US_WORDS[uk] : uk;
        if (us && w && w !== uk) { US_CHANGED.add(w); US_FROM.set(w, uk); }
        add(w, group);
      }
      if (us) for (const w of US_EXTRA[k] ?? []) { US_CHANGED.add(w); add(w, group); }
    }
    return { name, words };
  });
}
const BASE = { uk: baseChunks("uk"), us: baseChunks("us") };

export const BASE_WORDS = BASE.uk.flatMap((c) => c.words);
export const wordsFor = (locale) => (BASE[locale] ?? BASE.uk).flatMap((c) => c.words);
export const groupOf = (word) => GROUP.get(word) ?? "thing";

// American words that need their own picture. The collisions must never borrow the
// British picture: the same word means something else there ("chips", "purse").
const UK_SET = new Set(BASE_WORDS);
export const US_PICTURE_WORDS = [...US_CHANGED];
export const US_COLLISIONS = US_PICTURE_WORDS.filter((w) => UK_SET.has(w));

/** Chunks for one request: base vocabulary (UK or US) + the person's own words. */
export function buildChunks(personal = [], locale = "uk") {
  const mine = [];
  const mineSet = new Set();
  for (const p of personal) {
    if (!mineSet.has(p.word)) { mineSet.add(p.word); mine.push(p.word); }
  }
  // a personal word replaces an identical base word (personal wins)
  const chunks = (BASE[locale] ?? BASE.uk).map((c) => ({ name: c.name, words: c.words.filter((w) => !mineSet.has(w)) }));
  const host = chunks[PERSONAL_CHUNK];
  const room = Math.max(0, CHUNK_MAX - host.words.length);
  host.words = [...host.words, ...mine.slice(0, room)];
  for (let i = room; i < mine.length; i += CHUNK_MAX) {
    chunks.push({ name: "my words (more)", words: mine.slice(i, i + CHUNK_MAX) });
  }
  return chunks;
}
