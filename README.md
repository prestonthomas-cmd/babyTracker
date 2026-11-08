# Bump Crew 🍼

A baby tracker for **everyone else's** babies. Most pregnancy apps follow one baby, your own. Bump Crew lets you add as many as you like (friends, siblings, coworkers, neighbors) and see where each one is at a glance.

## Features

- **Unlimited babies**, each with parent names, an optional nickname and who they are to you (friend, family, coworker…)
- **Two ways to set timing**: enter a due date, or just "she's 14 weeks" and the due date is worked out for you
- **Weekly size comparisons** in four themes, with a scrollable week-by-week "journey" view:
  - 🍎 Fruits & Veggies: poppy seed → watermelon
  - 🐾 Animals: flea → seal pup
  - 🧁 Sweet Treats: sprinkle → wedding cake
  - ⚽ Toys & Sports: speck of glitter → piñata
- Pick a default theme, or give individual babies their own (your animal-loving friend gets animals)
- Week + day, trimester, approximate length and weight (lb/in or kg/cm), days to go, overdue alerts
- **"Baby arrived!"**: switch to a newborn with birthday and birth weight, then see their age grow
- Filter (on the way / arrived), search, sort by due date, name or date added
- Export/import a JSON backup; data otherwise stays in your browser (localStorage)
- Light and dark mode, works on phones

## Running it

No build step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Tests

```sh
node --test test/*.test.js
```

## Layout

| File | Purpose |
| --- | --- |
| `js/data.js` | Size themes and average length/weight per week (4–40) |
| `js/calc.js` | Date math and unit formatting (no DOM, unit-tested) |
| `js/app.js` | UI: rendering, forms, storage |
| `css/styles.css` | Styles |

Sizes are friendly averages for fun, not medical guidance.
