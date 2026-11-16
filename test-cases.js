// Runs the 3 test cases twice each and prints the picks. Run with: npm test

import { pickGames } from "./picker.js";
import { GAMES } from "./games.js";

const cases = [
  { players: 4, ages: "Adults", time: "30 minutes", mood: "Competitive" },
  { players: 9, ages: "Mixed ages", time: "5 minutes", mood: "Loud and chaotic" },
  { players: 2, ages: "Under 8", time: "10 minutes", mood: "Chill" },
];

const byName = Object.fromEntries(GAMES.map((g) => [g.name, g]));

for (const [i, answers] of cases.entries()) {
  for (const run of [1, 2]) {
    console.log(`\n=== Case ${i + 1}, run ${run}: ${answers.players} players, ${answers.ages}, ${answers.time}, ${answers.mood} ===`);
    const { note, games } = pickGames(answers);
    if (note) console.log(`Note: ${note}`);
    for (const g of games) {
      const info = byName[g.name];
      console.log(`\n* ${g.name}  [${info.players[0]}-${info.players[1]} players, ~${info.minutes} min]`);
      console.log(`  Why: ${g.why}`);
      if (g.adjust) console.log(`  To make it work: ${g.adjust}`);
      g.steps.forEach((s, n) => console.log(`  ${n + 1}. ${s}`));
    }
  }
}
