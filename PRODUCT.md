# Card Game Picker

Written from the project brief. Lines marked *(assumed)* were inferred, not stated.

## What it is
A one-page web app for a group that has a standard 52-card deck but can't decide what to play. They answer 4 questions (players, ages, time, mood) and get 3 real, well-known card games with one line on why each fits and 3 short steps to play.

## Who uses it
- A group sitting at a table, usually passing one phone around.
- Ages range from young kids to adults; all copy must be readable by a 10-year-old.
- Hands may be full of cards and the room may be noisy *(assumed)*, so controls are large and the flow is short.

## Surface mode
Operate. The visitor's success is "we picked a game and know how to start" in under a minute.

## Pinned by the brief
- Title color and buttons: deep green `#1B5E20`. Cards: white. Page: soft gray `#F5F5F5`.
- Clean sans-serif (Inter). Ample white space, simple layout.
- Phone first. Buttons at least 48px tall. Visible label on every field. Readable contrast.
- Nothing above the form except the title and one intro line.

## Tone
Plain, friendly, brief. No jokes in the controls; a little warmth in the loading line ("Shuffling the deck").

## How picks are made
No AI and no API key. The app picks from a built-in list of 39 well-known games (`games.js`), each checked against Pagat.com and linked to its Pagat page. Games are tagged with the same words as the dropdowns.

## Must never
- Suggest a game that needs anything beyond one standard deck (plus pencil and paper for score).
- Invent a game or a rule.
