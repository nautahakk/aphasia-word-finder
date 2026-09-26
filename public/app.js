// Word Finder - page logic. No framework, no build step.
import { DEMO_WORDS, DEMO_WORDS_US } from "./demo-words.js";

const STORE = "wordfinder.mywords.v1";
const LOCALE_STORE = "wordfinder.locale";
const LANG = { uk: "en-GB", us: "en-US" }; // word list, speech recognition and voice
const DEMO = { uk: DEMO_WORDS, us: DEMO_WORDS_US };
const MAX_WORDS = 60;
const ASK_DELAY_MS = 700; // wait for a short pause before guessing
const EXAMPLES = [
  "the the thing you boil the water in for the tea",
  "on my wrist it tells you the the time",
  "cold white you pour it on the the cereal",
  "my wife no no the girl the one who lives by the sea",
  "when you can't sleep and you keep thinking about the bills",
];

const MESSAGES = {
  idle: "Tap the button, then describe the word you can't find. Say anything about it.",
  listening: "Listening… say anything about it. Tap again to stop.",
  listeningReady: "Listening… is it one of these? Tap it to hear it said.",
  listeningUnsure: "Listening… not sure yet. Keep going, say more about it.",
  thinking: "Thinking…",
  ready: "Is it one of these? Tap it to hear it said.",
  unsure: "Not sure yet. Keep going: say more about it.",
  blocked: "The microphone is blocked. Allow it in the browser's settings, or type instead.",
  error: "Couldn't get guesses. Check the connection and try again.",
};

const $ = (sel) => document.querySelector(sel);
const els = {
  mic: $("#mic"), micLabel: $("#mic-label"), noVoice: $("#no-voice"), status: $("#status"), heard: $("#heard"),
  form: $("#type-form"), typed: $("#typed"), clear: $("#clear"),
  tiles: $("#tiles"), empty: $("#empty"), said: $("#said"), saidWord: $("#said-word"), saidWho: $("#said-who"),
  again: $("#again"), notIt: $("#not-it"), examples: $("#examples"),
  open: $("#open-words"), count: $("#words-count"), dialog: $("#words-dialog"), list: $("#words-list"),
  add: $("#add-word"), newWord: $("#new-word"), newWho: $("#new-who"), newPhoto: $("#new-photo"),
  addError: $("#add-error"), reset: $("#reset-demo"), locales: [...document.querySelectorAll("[data-locale]")],
};

const startLocale = detectLocale();
const state = {
  locale: startLocale,
  personal: loadWords(startLocale),
  pictos: {},
  pictosUS: {},     // American words, and ones that mean something else there ("chips", "purse")
  transcript: "",
  committed: "",   // speech from earlier recognition sessions (browsers stop after a silence)
  session: "",     // speech from the current session
  listening: false,
  rec: null,
  seq: 0,
  controller: null,
  lastAsked: "",
  results: null,
  chosen: null,
  timer: null,
};

// ---------- storage ----------
// UK or US English: the visitor's earlier choice, else the browser's language.
function detectLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_STORE);
    if (saved === "uk" || saved === "us") return saved;
  } catch { /* storage blocked */ }
  const english = (navigator.languages?.length ? navigator.languages : [navigator.language || ""]).find((l) => /^en\b/i.test(l)) || "";
  return /^en-(US|CA)\b/i.test(english) ? "us" : "uk";
}
function loadWords(locale) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    if (Array.isArray(saved)) return saved;
  } catch { /* blocked or corrupt storage: fall back to the demo */ }
  return DEMO[locale].map((w) => ({ ...w }));
}
function hasSavedWords() {
  try { return localStorage.getItem(STORE) !== null; } catch { return false; }
}
const isDemo = (list, locale) => list.length === DEMO[locale].length
  && list.every((p, i) => p.word === DEMO[locale][i].word && p.who === DEMO[locale][i].who && !p.photo);
function saveWords() {
  try {
    localStorage.setItem(STORE, JSON.stringify(state.personal));
    return true;
  } catch {
    return false; // storage full (photos) or blocked
  }
}

// ---------- helpers ----------
const joinText = (...parts) => parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}
function initials(word) {
  return word.replace(/^the /i, "").split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
}
function setStatus(kind, text) {
  els.status.dataset.kind = kind;
  els.status.textContent = text ?? MESSAGES[kind];
}

// ---------- speech out ----------
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANG[state.locale];
  u.rate = 0.9;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.replace("_", "-") === u.lang);
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

// ---------- speech in ----------
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function setupSpeech() {
  if (!Recognition) {
    els.mic.disabled = true;
    els.noVoice.hidden = false;
    return;
  }
  const rec = new Recognition();
  rec.lang = LANG[state.locale];
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = (e) => {
    let text = "";
    for (let i = 0; i < e.results.length; i++) text += `${e.results[i][0].transcript} `;
    state.session = text.trim();
    setTranscript(joinText(state.committed, state.session));
  };
  rec.onerror = (e) => {
    const stopWith = (kind, text) => { stopListening({ ask: false }); setStatus(kind, text); };
    if (e.error === "not-allowed" || e.error === "service-not-allowed") stopWith("blocked");
    else if (e.error === "network") stopWith("error", "Voice needs an internet connection. Type it instead, or try again.");
    else if (e.error === "audio-capture") stopWith("error", "No microphone found. Type it instead.");
    // "no-speech" and "aborted" are normal during long pauses - keep going
  };
  rec.onend = () => {
    // Browsers end a session after a silence. People with aphasia pause a lot,
    // so keep listening until they tap stop (or pick a word).
    if (!state.listening) return;
    state.committed = joinText(state.committed, state.session);
    state.session = "";
    try { rec.start(); } catch { setTimeout(() => { try { if (state.listening) rec.start(); } catch { /* give up quietly */ } }, 300); }
  };
  state.rec = rec;
}

function startListening() {
  resetSearch();
  state.listening = true;
  try { state.rec.start(); } catch { /* already started */ }
  els.mic.setAttribute("aria-pressed", "true");
  els.micLabel.textContent = "Listening… tap to stop";
  setStatus("listening");
}

function stopListening({ ask = true } = {}) {
  state.listening = false;
  try { state.rec?.stop(); } catch { /* not running */ }
  els.mic.setAttribute("aria-pressed", "false");
  els.micLabel.textContent = "Tap to talk";
  if (state.results) showResultStatus();
  else setStatus("idle");
  if (ask && state.transcript) askNow(); // only asks again if the words changed
}

function showResultStatus() {
  const { unsure, guesses = [] } = state.results;
  if (unsure) return setStatus(state.listening ? "listeningUnsure" : "unsure");
  const one = guesses.length === 1;
  if (state.listening) setStatus("listeningReady", one ? "Listening… is it this one? Tap it to hear it said." : undefined);
  else setStatus("ready", one ? "Is it this one? Tap it to hear it said." : undefined);
}

// ---------- transcript + asking ----------
function setTranscript(text, { from = "voice" } = {}) {
  state.transcript = text;
  els.heard.textContent = text || "—";
  if (from === "voice" && els.typed.value) els.typed.value = "";
  clearTimeout(state.timer);
  state.timer = setTimeout(() => ask(state.transcript), ASK_DELAY_MS);
}

function askNow() {
  clearTimeout(state.timer);
  ask(state.transcript);
}

async function ask(text) {
  const said = text.trim();
  if (said.length < 4 || said === state.lastAsked) return;
  state.lastAsked = said;
  const seq = ++state.seq;
  state.controller?.abort();
  const controller = new AbortController();
  state.controller = controller;
  if (!state.listening) setStatus("thinking");
  els.tiles.setAttribute("aria-busy", "true");
  try {
    const res = await fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ said, locale: state.locale, personal: state.personal.map(({ word, who }) => ({ word, who })) }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (seq !== state.seq) return;
    if (!res.ok) throw new Error(data.error || MESSAGES.error);
    state.results = data;
    state.chosen = null;
    els.said.hidden = true;
    renderTiles();
    showResultStatus();
  } catch (err) {
    if (err.name === "AbortError" || seq !== state.seq) return;
    state.lastAsked = ""; // let the same text be tried again
    setStatus("error", err.message || MESSAGES.error);
  } finally {
    if (seq === state.seq) els.tiles.removeAttribute("aria-busy");
  }
}

// ---------- tiles ----------
function picture(guess) {
  const box = el("span", "tile__pic");
  const mine = state.personal.find((p) => p.word === guess.word);
  const fallback = () => box.replaceChildren(el("span", "tile__initials", initials(guess.word)));
  if (mine?.photo) {
    const img = new Image();
    img.src = mine.photo;
    img.alt = "";
    box.classList.add("tile__pic--photo");
    box.append(img);
    return box;
  }
  const id = (state.locale === "us" && state.pictosUS[guess.word]) || state.pictos[guess.word];
  if (id) {
    const img = new Image(96, 96);
    img.src = `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;
    img.alt = "";
    img.loading = "lazy";
    img.onerror = fallback;
    box.append(img);
    return box;
  }
  fallback();
  return box;
}

function renderTiles() {
  const data = state.results;
  els.tiles.replaceChildren();
  const guesses = data?.guesses ?? [];
  els.empty.hidden = guesses.length > 0;
  guesses.forEach((g, i) => {
    const best = i === 0 && !data.unsure;
    const tile = el("button", `tile tile--${g.group}${best ? " tile--best" : ""}`);
    tile.type = "button";
    tile.setAttribute("aria-pressed", String(state.chosen === g.word));
    tile.setAttribute("aria-label", g.who ? `${g.word}, ${g.who}` : g.word);
    if (best) tile.append(el("span", "tile__tag", "Best guess"));
    tile.append(picture(g), el("span", "tile__word", g.word));
    if (g.who) tile.append(el("span", "tile__who", g.who));
    tile.addEventListener("click", () => choose(g));
    els.tiles.append(tile);
  });
}

function choose(guess) {
  if (state.listening) stopListening({ ask: false });
  state.chosen = guess.word;
  speak(guess.word);
  els.saidWord.textContent = guess.word;
  els.saidWho.textContent = guess.who ?? "";
  els.saidWho.hidden = !guess.who;
  els.said.hidden = false;
  renderTiles();
  setStatus("chosen", `Said: “${guess.word}”. Tap “Say it again” to repeat it.`);
}

function resetSearch() {
  clearTimeout(state.timer);
  state.controller?.abort();
  state.seq++;
  Object.assign(state, { transcript: "", committed: "", session: "", lastAsked: "", results: null, chosen: null });
  els.heard.textContent = "—";
  els.said.hidden = true;
  els.tiles.replaceChildren();
  els.tiles.removeAttribute("aria-busy");
  els.empty.hidden = false;
}

// ---------- My words ----------
function renderWords() {
  els.count.textContent = `(${state.personal.length})`;
  els.list.replaceChildren(
    ...state.personal.map((p) => {
      const li = el("li", "word");
      const pic = el("span", "word__pic");
      if (p.photo) {
        const img = new Image(64, 64);
        img.src = p.photo;
        img.alt = "";
        pic.append(img);
      } else {
        pic.textContent = initials(p.word);
      }
      const text = el("span");
      text.append(el("span", "word__name", p.word));
      if (p.who) text.append(el("br"), el("span", "word__who", p.who));
      const remove = el("button", "btn btn--quiet btn--danger", "Remove");
      remove.type = "button";
      remove.setAttribute("aria-label", `Remove ${p.word}`);
      remove.addEventListener("click", () => {
        state.personal = state.personal.filter((x) => x !== p);
        saveWords();
        renderWords();
      });
      li.append(pic, text, remove);
      return li;
    }),
  );
}

async function photoToThumb(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const scale = Math.max(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    canvas.getContext("2d").drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function showAddError(message) {
  els.addError.textContent = message;
  els.addError.hidden = !message;
}

async function addWord(e) {
  e.preventDefault();
  const word = els.newWord.value.replace(/\s+/g, " ").trim();
  const who = els.newWho.value.replace(/\s+/g, " ").trim();
  if (!word) return showAddError("Type a name or word first.");
  if (state.personal.some((p) => p.word === word)) return showAddError(`"${word}" is already in your words.`);
  if (state.personal.length >= MAX_WORDS) return showAddError(`That's the most words for now (${MAX_WORDS}). Remove one first.`);
  const entry = { word, who };
  const file = els.newPhoto.files?.[0];
  if (file) {
    try { entry.photo = await photoToThumb(file); } catch { return showAddError("Couldn't read that photo. Try a different one."); }
  }
  state.personal = [...state.personal, entry];
  if (!saveWords()) {
    state.personal = state.personal.slice(0, -1);
    return showAddError("Couldn't save. The browser's storage is full, so try without a photo.");
  }
  showAddError("");
  els.add.reset();
  renderWords();
  els.newWord.focus();
}

let resetArmed = null;
function resetToDemo() {
  if (!resetArmed) {
    els.reset.textContent = "Tap again to replace all your words";
    resetArmed = setTimeout(() => { els.reset.textContent = "Reset to the demo words"; resetArmed = null; }, 4000);
    return;
  }
  clearTimeout(resetArmed);
  resetArmed = null;
  els.reset.textContent = "Reset to the demo words";
  state.personal = DEMO[state.locale].map((w) => ({ ...w }));
  saveWords();
  renderWords();
}

// ---------- UK / US English ----------
function renderLocale() {
  document.documentElement.lang = LANG[state.locale];
  for (const b of els.locales) b.setAttribute("aria-pressed", String(b.dataset.locale === state.locale));
}

function setLocale(locale) {
  if (locale === state.locale) return;
  // someone still on the demo words gets the demo for the other country
  if (isDemo(state.personal, state.locale)) {
    state.personal = DEMO[locale].map((w) => ({ ...w }));
    if (hasSavedWords()) saveWords();
  }
  state.locale = locale;
  try { localStorage.setItem(LOCALE_STORE, locale); } catch { /* storage blocked: choice lasts this visit */ }
  renderLocale();
  renderWords();
  if (state.rec) {
    state.rec.lang = LANG[locale];
    if (state.listening) try { state.rec.stop(); } catch { /* restarts in the new language via onend */ }
  }
  if (state.transcript) { state.lastAsked = ""; askNow(); } // same description, other word list
}

// ---------- wiring ----------
function init() {
  // a saved list that's still the other country's demo follows the language too
  const other = state.locale === "us" ? "uk" : "us";
  if (isDemo(state.personal, other)) state.personal = DEMO[state.locale].map((w) => ({ ...w }));
  renderLocale();
  setupSpeech();
  renderWords();

  const loadPictos = (file, key) => fetch(file)
    .then((r) => (r.ok ? r.json() : {}))
    .then((map) => { state[key] = map; if (state.results) renderTiles(); })
    .catch(() => { /* tiles fall back to initials */ });
  loadPictos("pictos.json", "pictos");
  loadPictos("pictos-us.json", "pictosUS");

  for (const b of els.locales) b.addEventListener("click", () => setLocale(b.dataset.locale));

  els.mic.addEventListener("click", () => (state.listening ? stopListening() : startListening()));

  els.typed.addEventListener("input", () => {
    if (state.listening) stopListening({ ask: false });
    setTranscript(els.typed.value, { from: "typing" });
  });
  els.typed.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); els.form.requestSubmit(); }
  });
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    setTranscript(els.typed.value, { from: "typing" });
    askNow();
  });
  els.clear.addEventListener("click", () => {
    if (state.listening) stopListening({ ask: false });
    els.typed.value = "";
    resetSearch();
    setStatus("idle");
    els.typed.focus();
  });

  els.examples.replaceChildren(
    ...EXAMPLES.map((text) => {
      const chip = el("button", "chip", `“${text}”`);
      chip.type = "button";
      chip.addEventListener("click", () => {
        if (state.listening) stopListening({ ask: false });
        resetSearch();
        els.typed.value = text;
        setTranscript(text, { from: "typing" });
        askNow();
      });
      return chip;
    }),
  );

  els.again.addEventListener("click", () => state.chosen && speak(state.chosen));
  els.notIt.addEventListener("click", () => {
    state.chosen = null;
    els.said.hidden = true;
    renderTiles();
    setStatus("unsure", "Keep going: say more about it, or tap the button to start again.");
  });

  els.open.addEventListener("click", () => { showAddError(""); renderWords(); els.dialog.showModal(); });
  els.add.addEventListener("submit", addWord);
  els.reset.addEventListener("click", resetToDemo);
}

init();
