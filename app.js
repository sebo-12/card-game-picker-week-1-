// Browser code for Card Game Picker. Picks from the built-in game list (picker.js).

import { pickGames } from "./picker.js";

const $ = (id) => document.getElementById(id);

const form = $("picker");
const fields = ["players", "ages", "time", "mood"].map($);
const pickButton = $("pick");
const againButton = $("again");
const hint = $("hint");
const statusBox = $("status");
const errorBox = $("error");
const results = $("results");
const noteBox = $("note");
const gamesList = $("games");
const template = $("game-template");

const GENERIC_ERROR = "Something went wrong. Try again.";
const SHUFFLE_MS = 500; // short pause so "Shuffling the deck" is visible

let busy = false;
let shownGames = []; // names already shown for these answers (skipped on "Pick again")

const allFilled = () => fields.every((f) => f.value !== "");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function refreshButton() {
  pickButton.disabled = busy || !allFilled();
  hint.hidden = allFilled();
}

fields.forEach((f) =>
  f.addEventListener("change", () => {
    shownGames = []; // new answers = fresh start
    refreshButton();
  })
);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  pick({ again: false });
});

againButton.addEventListener("click", () => pick({ again: true }));

function setBusy(on, activeButton) {
  busy = on;
  activeButton.textContent = on ? "Picking..." : activeButton.dataset.label;
  activeButton.setAttribute("aria-busy", String(on));
  againButton.disabled = on;
  refreshButton();
}

async function pick({ again }) {
  if (busy || !allFilled()) return;

  const activeButton = again ? againButton : pickButton;
  activeButton.dataset.label ??= activeButton.textContent;

  // Show the spinner and any error next to the button that was pressed.
  activeButton.after(statusBox);
  statusBox.after(errorBox);
  statusBox.hidden = false;
  errorBox.hidden = true;
  if (again) gamesList.classList.add("is-stale");
  setBusy(true, activeButton);

  try {
    await wait(SHUFFLE_MS);
    const answers = {
      players: Number(fields[0].value),
      ages: fields[1].value,
      time: fields[2].value,
      mood: fields[3].value,
    };
    const result = pickGames(answers, again ? shownGames : []);
    const names = result.games.map((g) => g.name);
    shownGames = again && !result.startedOver ? [...shownGames, ...names] : names;
    render(result);
    if (!again) scrollToResults();
  } catch (err) {
    console.error(err);
    errorBox.textContent = GENERIC_ERROR;
    errorBox.hidden = false;
  } finally {
    statusBox.hidden = true;
    gamesList.classList.remove("is-stale");
    setBusy(false, activeButton);
  }
}

function render({ note, games }) {
  noteBox.textContent = note || "";
  noteBox.hidden = !note;

  gamesList.replaceChildren(
    ...games.map((game) => {
      const card = template.content.firstElementChild.cloneNode(true);
      card.querySelector(".game-name").textContent = game.name;
      card.querySelector(".game-why").textContent = game.why;

      const adjust = card.querySelector(".game-adjust");
      adjust.hidden = !game.adjust;
      adjust.querySelector("span").textContent = game.adjust;

      card.querySelector(".game-steps").replaceChildren(
        ...game.steps.map((step) => {
          const li = document.createElement("li");
          li.textContent = step;
          return li;
        })
      );

      const link = card.querySelector(".game-link");
      link.href = game.url;
      link.setAttribute("aria-label", `Full rules for ${game.name} on Pagat.com (opens in a new tab)`);
      return card;
    })
  );

  results.hidden = false;
}

function scrollToResults() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  results.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

refreshButton();
