# Lone Wolf Action Chart prototype

A mobile-first companion for **Book 1: Flight from the Dark** and **Book 2: Fire on the Water**. Plain HTML, CSS, and JavaScript; no frameworks, build step, account, or backend.

Open `index.html` in a browser, or run `node preview.js` and visit **http://127.0.0.1:4173**. The server is only for local preview. For static hosting, copy `index.html`, `styles.css`, `app.js`, `campaign.js`, and `rules.js` together.

## Moving into Book 2

Tap the book title below the header, then **Carry Book 1 character into Book 2**. Finish any combat and choose your five Book 1 disciplines first. Confirm that you completed the book, choose a sixth Discipline, enter or accept the royal gold roll, and choose up to two Royal Armoury items. Uncheck a carried weapon if you want to exchange it for a new one. A full backpack requires choosing other supplies or freeing space in Book 1 first; carried items are never silently discarded.

Your scores, current endurance, gold, weapons, backpack, Meals, Special Items, Weaponskill mastery, and journal are copied. The Seal of Hammerdal is added, royal gold is added without a cap, and the new bookmark starts at section 1. Endurance is preserved; it is not automatically refilled. New armour adds its endurance bonus. Each book then keeps an independent chart: later edits in one book do not change the other. Switching books does not grant supplies again.

Book 2 can also start with a fresh character and five disciplines. To restart the active book, use **Menu → Start a new adventure**. Undo can restore a replaced chart during the current session. Export saves both book charts together. Existing Book 1 browser saves and JSON backups migrate automatically; the original browser storage key is retained.

## GitHub Pages

The live app is published at **https://sigfriedjk.github.io/lonewolf-action-chart/**. GitHub Pages serves the root of the `main` branch; pushing changes to that branch automatically updates the site. `.nojekyll` keeps the plain static files unchanged.

The [book2v1 release](https://github.com/sigfriedjk/lonewolf-action-chart/releases/tag/book2v1) preserves the first Book 2 implementation at commit `c5c89f7`, before the compact header redesign.
The [book2v2 release](https://github.com/sigfriedjk/lonewolf-action-chart/releases/tag/book2v2) preserves the compact layout at commit `6895e43`, before the Discipline gesture update.

The original downloaded books are excluded from Git and deployment. The app links to Project Aon for reading. Export a localhost save and import it on the live site if you want to move an existing adventure there; browser storage is separate for each origin.

## Included

- Five bottom navigation buttons: Stats, Kai, Gear, Combat, and Journal.
- Book switcher, independent book charts, and Book 1 → Book 2 character carryover with a sixth Discipline and Royal Armoury setup.
- Editable scores, current endurance, gold, Meals, and section bookmark.
- Compact shared book/section navigation. The bookmark is editable from every tab. Stats shows Lone Wolf and Undo; Kai offers Weaponskill mastery with the selection count below the grid; Gear offers capacity and Add; Journal offers Rules and Export beside the title.
- Tap a Kai Discipline to read its description without changing selection. Hold for about half a second, then release to select or remove it; a gold progress line confirms the hold. Moving your finger or cancelling the gesture prevents selection. The description also has a Select/Remove button for keyboard, screen-reader, and ordinary tap use. Five/six-skill limits and Undo still apply.
- New-adventure setup: random scores, starting gold, found equipment, and Weaponskill mastery. Choose five disciplines in the Kai view.
- Two weapons, eight backpack slots including Meals, and a usual pouch limit of 50 Gold Crowns (totals can exceed it); Special Items are separate. Long inventory and combat lists are paginated.
- Mindblast, mastered equipped weapon, unarmed penalty, and configurable section combat skill modifier.
- Exact Kai combat table shared by Books 1 and 2, one round at a time. Random or manually selected numbers, instant-kill results, and evasion when permitted by the book. The combat header shows the enemy and current round; tap **Log** to open a paginated history, including each round's ratio and losses.
- Shield adds 2 CS. Add the Sommerswerd using **Gear → Special → Add Special Item → Known item**, then equip it from Special Items. It adds 8 CS plus sword Weaponskill (+2 for Short Sword, Sword, or Broadsword). Tick **Undead enemy** when starting combat to double enemy endurance loss. It uses no regular weapon or backpack slot.
- Manual Healing, Meals, Healing Potions, and equipment endurance bonuses.
- Meals and **Eat a Meal** share one card on Stats. Tap the Meal count to open the Backpack; eating is available on Stats only. Apply Healing with the Endurance **+** button, which remains visible on compact phone screens.
- Automatic browser storage, JSON export/import, and undo for the last 30 chart changes during this session. Notes autosave as you type; text edits are not individually added to Undo.

The initial chart is an editable starter with CS 15, EP 25, an Axe, one Meal, a Map, and a Healing Potion. Use **Menu → Start a new adventure** to roll a character. Scores and chosen disciplines can also be entered manually.

## Scope and layout

This prototype supports Books 1 and 2, with a layout intended to fit ordinary portrait phone screens without page scrolling. Inventory uses two, three, or four items per page, depending on screen height. Combat history uses eight rounds per page in a dialog. Small landscape viewports, larger accessibility text, and dialogs can scroll when needed to keep controls reachable. No book reader is embedded. Endurance +/− controls remain available on the tested compact portrait screens; Edit scores supports larger adjustments.

Follow the book for exceptions. Healing is applied manually once per numbered section without combat. Sommerswerd undead damage is automated; other unusual combat effects, custom potions, and section-specific losses require manual score adjustments. Books 3 onward are not implemented. The app runs without network calls once loaded, but it does not yet provide an installable/offline PWA cache.

Saves belong to the browser and origin (a local file, localhost, and a hosted domain have separate storage). Export before switching devices or clearing browser data. The app reports unavailable browser storage and offers export. Import validates the save format and asks before replacing the chart. If stored data is invalid, the app shows a recovery message and creates a starter chart.

## Verification

Run `node tests/rules.test.js`, `node tests/campaign.test.js`, `node tests/app-save.test.js`, and `node tests/disciplines.test.js`. Tests compare all 130 combat cells and paired ratio boundaries, check Book 2 table parity when its local XHTML is available, and exercise Shield, Sommerswerd, sword masteries, undead damage, evasion, and instant kills. Campaign tests cover legacy migration, independent book saves, carryover, sixth Discipline, armoury exchanges, capacity checks, gold above 50, and invalid imports. App tests exercise browser storage migration and undo across books. Gesture tests cover read-only taps, held releases, ghost-click suppression, movement/cancellation, keyboard selection, and five/six-skill limits. Syntax checks: `node --check app.js`, `node --check campaign.js`, and `node --check rules.js`.

Browser verification covered 390×844, 375×667, and 320×568 portrait layouts, the book's combat example, round undo, evasion, a full backpack and pagination, new-adventure setup, persistence after reload, and JSON export/import. All five starter tabs fit without scrolling at the tested portrait sizes. The browser reported no console warnings or errors. `prototype-phone.png` shows the Chart at 390×844.

Book 2 verification covered carryover, switching back to the untouched Book 1 bookmark and journal, persistence after reload, fresh character setup, two-book JSON export/import, Sommerswerd equipment, undead damage, combat Undo, and all five tabs (including the combat setup form) at the same three phone sizes.

Compact header verification covered the shared bookmark, Chart Undo, Gear Add, Journal character count, and paginated combat history. All five tabs fit at 390×844, 375×667, and 320×568, including an active nine-round combat record. No dependencies were added.

Discipline verification covered real 750 ms pointer holds for selection and removal, quick taps, keyboard Enter, explicit dialog selection, full-skill limits, and a quick tap immediately after a hold. The grid, hint, and description dialogs fit the same three phone sizes without scrolling or horizontal overflow.

Meal card verification covered eating, Hunting exceptions, immediate count updates, Undo, and opening the Backpack from the count. Both book charts fit the three tested portrait sizes with Endurance +/− visible and no Eat button in Gear.

## Sources

Rules were checked against `all-books-simple/en/xhtml-simple/lw/01fftd.htm` and `02fotw.htm`, especially Game Rules, Kai Disciplines, Equipment, Combat Rules, and Combat Results Table. Book 2 sections 79 and 242 and their footnotes describe the Sommerswerd.

Inspired by [Eric's Action Chart](https://www.projectaon.org/staff/eric/lw01.htm). [Project Aon](https://www.projectaon.org/) provides the original books. Lone Wolf was created by Joe Dever. This is an unofficial fan-made prototype; it contains no book narrative or illustrations. Locally downloaded book files retain their own notices and license and are not part of this repository.

Gold Crowns have +/− controls and direct editing, with /50 retained as a reference. Totals above 50 persist through reload, export/import, and Book 2 carryover. Every Stats roll jiggles and highlights the number, even for repeated results; reduced-motion settings use only a highlight. Screen readers receive a numbered roll announcement.
