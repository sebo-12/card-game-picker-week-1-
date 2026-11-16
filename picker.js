// Picks 3 games from the built-in list for the group's answers.
// Runs in the browser (and in Node for test-cases.js). No server, no API key.

import { GAMES } from "./games.js";

// Dropdown "Time available" → minutes. Must match index.html.
export const TIME_MINUTES = {
  "5 minutes": 5,
  "10 minutes": 10,
  "20 minutes": 20,
  "30 minutes": 30,
  "60 minutes or more": 60,
};

const AGE_WORDS = {
  "Under 8": "kids under 8",
  "8 to 12": "kids 8 to 12",
  "Teens": "teens",
  "Adults": "adults",
  "Mixed ages": "mixed ages",
};

const listWords = (words) =>
  words.length <= 1 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;

// Everything about this game that does NOT fit the group, as plain sentences.
// "cost" decides how close a game is when nothing fits perfectly.
function mismatches(game, { players, ages, time, mood }) {
  const found = [];
  const [min, max] = game.players;
  if (players < min || players > max) {
    found.push({
      cost: 3 + Math.min(Math.abs(players - (players < min ? min : max)), 6) * 0.5,
      text: min === max ? `Needs exactly ${min} players.` : `Needs ${min} to ${max} players.`,
    });
  }
  const available = TIME_MINUTES[time];
  if (game.minutes > available) {
    found.push({ cost: 2 + (game.minutes - available) / 15, text: `Needs about ${game.minutes} minutes.` });
  }
  if (!game.ages.includes(ages)) {
    const groups = game.ages.filter((a) => a !== "Mixed ages").map((a) => AGE_WORDS[a]);
    found.push({ cost: 3, text: `Best for ${listWords(groups)}.` });
  }
  if (!game.moods.includes(mood)) {
    found.push({ cost: 2.5, text: `Better for a ${listWords(game.moods.map((m) => m.toLowerCase())).replace(/ and ([^,]*)$/, " or $1")} mood.` });
  }
  return found;
}

// Small random shuffle so "Pick again" and repeat visits feel fresh.
const shuffle = (list) => list.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

/**
 * @param answers {players:number, ages:string, time:string, mood:string}
 * @param alreadyShown names to skip (for "Pick again")
 * @returns {note:string, games:[{name, why, steps, url, adjust}], startedOver:boolean}
 */
export function pickGames(answers, alreadyShown = []) {
  const shown = new Set(alreadyShown);
  let pool = GAMES.filter((g) => !shown.has(g.name));
  let startedOver = false;
  if (pool.length < 3) {
    pool = GAMES; // every game has been shown, so start over
    startedOver = true;
  }

  const rated = shuffle(pool).map((game) => {
    const misses = mismatches(game, answers);
    return { game, misses, cost: misses.reduce((sum, m) => sum + m.cost, 0) };
  });

  // Perfect fits first. Among them, lean toward games that use more of the time.
  const available = TIME_MINUTES[answers.time];
  const perfect = rated
    .filter((r) => r.misses.length === 0)
    .map((r) => ({ ...r, score: Math.random() * 0.6 - r.game.minutes / available }))
    .sort((a, b) => a.score - b.score);
  const closest = rated.filter((r) => r.misses.length > 0).sort((a, b) => a.cost - b.cost);

  const chosen = [...perfect, ...closest].slice(0, 3);
  const someMiss = chosen.some((r) => r.misses.length > 0);

  let note = "";
  if (someMiss && alreadyShown.length === 0) {
    note =
      perfect.length === 0
        ? "No game fits everything you picked, so here are the 3 closest ones and what to change."
        : `Only ${perfect.length === 1 ? "1 game fits" : "2 games fit"} everything you picked, so the others are the closest matches and say what to change.`;
  } else if (someMiss) {
    note = "There are not 3 more games that fit everything, so some of these need a small change.";
  }
  if (startedOver) note = "You have seen every game, so we started the list over. " + note;

  return {
    note: note.trim(),
    startedOver,
    games: chosen.map(({ game, misses }) => ({
      name: game.name,
      why: game.why,
      steps: game.steps,
      url: game.url,
      adjust: misses.map((m) => m.text).join(" "),
    })),
  };
}
