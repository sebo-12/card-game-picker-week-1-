// Local test server only. When deployed, any static host serves these files.
// Start it with: npm run dev

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const PORT = process.env.PORT || 3000;
const FILES = ["index.html", "styles.css", "app.js", "picker.js", "games.js"];
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript" };

createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  const file = path === "/" ? "index.html" : path.slice(1);
  if (!FILES.includes(file)) { res.statusCode = 404; return res.end("Not found"); }
  res.setHeader("Content-Type", TYPES[extname(file)]);
  res.end(await readFile(join(import.meta.dirname, file)));
}).listen(PORT, () => console.log(`Card Game Picker running at http://localhost:${PORT}`));
