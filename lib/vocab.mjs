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
  food: ["thing", split(`bread, toast, butter, jam, marmalade, honey, cheese, egg, bacon, sausage, ham, chicken, beef, pork, lamb, fish, salmon, tuna, prawns, soup, stew, curry, rice, pasta, spaghetti, pizza, sandwich, burger, chips, crisps, potato, mashed potato, roast potatoes, carrot, peas, beans, baked beans, broccoli, cabbage, cauliflower, lettuce, tomato, cucumber, onion, garlic, mushroom, sweetcorn, apple, banana, orange, pear, grapes, strawberry, raspberry, blueberry, lemon, peach, plum, cherry, melon, pineapple, mango, cereal, porridge, cornflakes, yoghurt, cake, biscuit, chocolate, sweets, ice cream, custard, pudding, crumble, pie, pastry, scone, muffin, doughnut, pancake, crackers, nuts, peanut butter, salt, black pepper, sugar, flour, oil, vinegar, ketchup, mustard, mayonnaise, gravy, sauce, salad, noodles, omelette, fish and chips, roast dinner, fry-up, jelly, trifle, popcorn, chewing gum, mints, cream, steak, meatballs, lasagne, quiche, kebab, stuffing, Yorkshire pudding, mince pie`)],
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
  time: ["time", split(`morning, afternoon, evening, night, today, tomorrow, yesterday, week, weekend, month, year, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, breakfast, lunch, dinner, supper, birthday, Christmas, Easter, holiday, anniversary, wedding, funeral, rain, sun, snow, wind, fog, storm, thunder, cloud, rainbow, frost`)],
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

const GROUP = new Map();
const BASE_CHUNKS = (() => {
  const seen = new Set(); // exact match on purpose: "Biscuit" the dog != "biscuit" the food
  return PLAN.map(([name, keys]) => {
    const words = [];
    for (const k of keys) {
      const [group, list] = LISTS[k];
      for (const w of list) {
        if (seen.has(w)) continue;
        seen.add(w);
        words.push(w);
        GROUP.set(w, group);
      }
    }
    return { name, words };
  });
})();

export const BASE_WORDS = BASE_CHUNKS.flatMap((c) => c.words);
export const groupOf = (word) => GROUP.get(word) ?? "thing";

/** Chunks for one request: base vocabulary + the person's own words. */
export function buildChunks(personal = []) {
  const mine = [];
  const mineSet = new Set();
  for (const p of personal) {
    if (!mineSet.has(p.word)) { mineSet.add(p.word); mine.push(p.word); }
  }
  // a personal word replaces an identical base word (personal wins)
  const chunks = BASE_CHUNKS.map((c) => ({ name: c.name, words: c.words.filter((w) => !mineSet.has(w)) }));
  const host = chunks[PERSONAL_CHUNK];
  const room = Math.max(0, CHUNK_MAX - host.words.length);
  host.words = [...host.words, ...mine.slice(0, room)];
  for (let i = room; i < mine.length; i += CHUNK_MAX) {
    chunks.push({ name: "my words (more)", words: mine.slice(i, i + CHUNK_MAX) });
  }
  return chunks;
}
