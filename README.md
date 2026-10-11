# Lone Wolf Action Chart prototype

A mobile-first companion for **Book 1: Flight from the Dark**. Plain HTML, CSS, and JavaScript; no frameworks, build step, account, or backend.

Open `index.html` in a browser, or run `node preview.js` and visit **http://127.0.0.1:4173**. The server is only for local preview. For future static hosting, copy `index.html`, `styles.css`, `app.js`, and `rules.js` together.

## GitHub Pages

The live app is published at **https://sigfriedjk.github.io/lonewolf-action-chart/**. GitHub Pages serves the root of the `main` branch; pushing changes to that branch automatically updates the site. `.nojekyll` keeps the plain static files unchanged.

The original downloaded books are excluded from Git and deployment. The app links to Project Aon for reading. Export a localhost save and import it on the live site if you want to move an existing adventure there; browser storage is separate for each origin.

## Included

- Five bottom navigation buttons: Chart, Kai, Gear, Combat, and Journal.
- Editable scores, current endurance, gold, Meals, and section bookmark.
- New-adventure setup: random scores, starting gold, found equipment, and Weaponskill mastery. Choose five disciplines in the Kai view.
- Two weapons, eight backpack slots including Meals, and 50 Gold Crowns; Special Items are separate. Long inventory and combat lists are paginated.
- Mindblast, mastered equipped weapon, unarmed penalty, and configurable section combat skill modifier.
- Exact Book 1 combat table, one round at a time. Random or manually selected numbers, instant-kill results, and evasion when permitted by the book.
- Manual Healing, Meals, Healing Potions, and equipment endurance bonuses.
- Automatic browser storage, JSON export/import, and undo for the last 30 chart changes during this session. Notes autosave as you type; text edits are not individually added to Undo.

The initial chart is an editable starter with CS 15, EP 25, an Axe, one Meal, a Map, and a Healing Potion. Use **Menu → Start a new adventure** to roll a character. Scores and chosen disciplines can also be entered manually.

## Scope and layout

This prototype supports Book 1, with a layout intended to fit ordinary portrait phone screens without page scrolling. Inventory and combat records use smaller pages on shorter screens (one, two, or four items). Small landscape viewports, larger accessibility text, and dialogs can scroll when needed to keep controls reachable. No book reader is embedded. On very short screens the Chart's +/− endurance buttons give way to the Edit scores dialog.

Follow the book for exceptions. Healing is applied manually once per numbered section without combat. Special damage multipliers and other unusual combat effects require manual score adjustments. Later books' additional disciplines, ranks, and rules are not implemented yet. The app runs without network calls once loaded, but it does not yet provide an installable/offline PWA cache.

Saves belong to the browser and origin (a local file, localhost, and a hosted domain have separate storage). Export before switching devices or clearing browser data. The app reports unavailable browser storage and offers export. Import validates the save format and asks before replacing the chart. If stored data is invalid, the app shows a recovery message and creates a starter chart.

## Verification

Run `node tests/rules.test.js`. When the local Book 1 XHTML is available, tests compare all 130 combat result cells directly with it. Otherwise they use a committed table fixture extracted from that source. They check both values of paired ratio columns and exercise bonuses, evasion, instant kills, and endurance bonuses. JavaScript syntax checks: `node --check app.js` and `node --check rules.js`.

Browser verification covered 390×844, 375×667, and 320×568 portrait layouts, the book's combat example, round undo, evasion, a full backpack and pagination, new-adventure setup, persistence after reload, and JSON export/import. All five starter tabs fit without scrolling at the tested portrait sizes. The browser reported no console warnings or errors. `prototype-phone.png` shows the Chart at 390×844.

## Sources

Rules were checked against `all-books-simple/en/xhtml-simple/lw/01fftd.htm`, especially Game Rules, Kai Disciplines, Equipment, Combat Rules, and Combat Results Table. The other bundled books were reviewed for structure; the implementation deliberately starts with Book 1.

Inspired by [Eric's Action Chart](https://www.projectaon.org/staff/eric/lw01.htm). [Project Aon](https://www.projectaon.org/) provides the original books. Lone Wolf was created by Joe Dever. This is an unofficial fan-made prototype; it contains no book narrative or illustrations. Locally downloaded book files retain their own notices and license and are not part of this repository.
