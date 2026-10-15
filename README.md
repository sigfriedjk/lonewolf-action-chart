# Lone Wolf Action Chart

A mobile-first companion for **Lone Wolf Books 1–6**, written in plain HTML, CSS, and JavaScript. No framework, build step, account, backend, or dependencies. Book 6 is implemented locally and has not yet been published; the live release below supports Books 1–5.

**Release:** [book5v1](https://github.com/sigfriedjk/lonewolf-action-chart/releases/tag/book5v1) · **Play:** [Action Chart](https://sigfriedjk.github.io/lonewolf-action-chart/index.html) · **Developer:** [HANDOFF.md](HANDOFF.md)

The direct `index.html` link is provided because it resolved a previously reported phone 404 at the directory URL. Saves stay on the same origin.

## Product direction and next books

The goal is an electronic paper Action Chart: simple recordkeeping and useful arithmetic, with the player interpreting and enforcing the rules. The current Books 1–5 app still enforces some inventory, skill, and action limits described below; these are existing behaviors to review, not a mandate to expand rule enforcement.

[BOOKS6-20-PLAN.md](BOOKS6-20-PLAN.md) records the 14 October 2026 review and remaining roadmap. Jon subsequently approved Book 6 and its compact layout; [BOOK6-REVIEW.md](BOOK6-REVIEW.md) records the local implementation. Books 7–20 remain planned. Discuss further layout or major behavior changes before implementation. Prefer existing manual controls and Journal for adventure-specific exceptions.

## Book 6 (local implementation)

Book 6 adds separate Magnakai selections and multiple weapon masteries, with inherited Kai benefits editable in Mastery. Three initial selections/masteries and Kai Master Superior are reference guidance. Completed earlier adventures are player-confirmed; copying never modifies the source chart. All-five completion can explicitly record all ten basic Kai skills, while fresh entry grants no inherited mechanical benefits.

On Kai, four Lore-circle checkboxes apply CS/EP bonuses automatically. Gold highlighting and **Ready** show that the required skills are selected. Checks stay under your control, including after skill edits; do not duplicate their bonuses in Extra CS/EP. Changes preserve wounds and never revive a dead hero. Arrows share the Stats resource card with Gold; tap either total for direct editing and −/+. A starting Quiver adds six arrows once; later shots, replenishment, and quiver moves are manual. Meals stays alongside. Earlier books retain their Gold controls.

Five optional supplies include Bow, Quiver, four rations, Rope/Tinderbox, and the +2 EP waistcoat. Weaponmastery +3 replaces a matching inherited Weaponskill +2. Psi-screen protects against incoming Mindblast. Ordinary Mindblast is calculated; Psi-surge's extra CS and per-round EP cost are manual, as are Healing/Curing, shot modifiers, and section exceptions. Bow counts as unarmed in ordinary melee. Tap a Book 6 Special Item's name/description to edit its description.

Using Book 6 creates a version 3 campaign under a new browser-storage key, retaining the old keys. Legacy imports remain supported; new exports need the newer app. See the review for migration and verification details.

## Run locally

Open `index.html` in a browser, or use an existing Node runtime:

```text
node preview.js
```

Visit http://127.0.0.1:4173/ and stop the server with Ctrl+C. For static hosting, keep `index.html`, `styles.css`, `rules.js`, `campaign.js`, and `app.js` together. No package installation is needed.

## Using the chart

Six bottom tabs keep normal portrait phone pages compact:

- **Stats:** Combat Skill, weapon dialog, Endurance −/+, editable gear icons, Gold Crowns −/+ and direct editing, Meals/Eat a Meal, animated random rolls, and Undo. Gold keeps /50 as a reference while allowing higher totals. Every roll animates, including repeated numbers; reduced motion uses a highlight.
- **Kai:** Tap a Discipline to read it. Hold for about half a second, then release to select/remove it; moving or cancelling prevents selection. The description has a Select/Remove button for ordinary tap, keyboard, and screen-reader access. The title shows selected/allowed, and the gear opens mastery settings.
- **Backpack:** Eight rows, including empty slots. Meals each use a slot. Tap an empty row to add supplies; use/remove controls stay with carried items. Ordinary Healing Potion and Potion of Laumspur recover up to 4 EP after combat.
- **Special:** Carry/Safekeeping toggle, carried-item Store buttons, and stored-item Carry buttons. Add items in Carry; longer lists are paginated. Stored items give no bonuses. Undo remains on Stats and in the menu.
- **Combat:** Enemy scores, section CS adjustment, enemy Mindblast damage per round, immunity to your Mindblast, and undead status. Use a random or chosen 0–9 roll, evade only when the book permits it, and open Log for paginated round history. Undo restores the whole round.
- **Journal:** Autosaved notes, Rules, and Export. Keep notes about section-specific effects, external food, and other exceptions here.

The shared book title opens book switching/setup, and the shared section gear edits the bookmark. The initial Book 1 chart is an editable starter: CS 15, EP 25, Axe, one Meal, Map, and Healing Potion. Use **Menu → Start a new adventure** for rolled setup.

## Books and carryover

Each book keeps an independent chart. For Books 1–5, finish combat, select all available Disciplines in an earlier chart, then use the book menu's carryover action. The form names the source, requires confirmation that it was completed, and lets you learn one new Discipline. It copies scores, current wounds, mastery, gold, equipment, and notes; resets bookmark/combat; adds the destination's map/gifts and 10–19 starting Crowns; and lets you exchange weapons/take starting supplies. Book 6 uses the player-confirmed transition described above. Opening an existing chart grants nothing again.

Sequential play gives five, six, seven, eight, and nine Disciplines in Books 1–5. Fresh starts have five; skipped adventures do not award their skills. The latest eligible earlier chart is the automatic carryover source. Restarting the active book explicitly replaces only that chart and can be undone during the session.

| Book | Adventure | Starting supply choices | Map/gifts | Sections |
| --- | --- | --- | --- | --- |
| 1 | Flight from the Dark | Monastery item plus basic kit | Map of Sommerlund | 350 |
| 2 | Fire on the Water | Up to 2 Royal Armoury choices | Map of Sommerlund, Seal of Hammerdal | 350 |
| 3 | The Caverns of Kalte | Up to 2 choices | Map of Kalte | 350 |
| 4 | The Chasm of Doom | Up to 6 choices | Map of the Southlands, Badge of Rank | 350 |
| 5 | Shadow on the Sand | Up to 4 choices | Map of Vassagonia | 400 |
| 6 (local) | The Kingdoms of Terror | Up to 5 choices | Map of the Stornlands | 350 |

Supply selectors are optional: leave unused ones at No item. Different choices are required. Listed ration/potion bundles expand into individual Meals/doses. Duplicate or capacity errors preserve the form and existing charts. Regular weapons are limited to two, backpack contents to eight including every Meal/dose; supplies are never silently discarded. New armour adjusts current/max EP by its bonus without healing prior wounds.

## Safekeeping and combat effects

On Special, **Store** moves an item to safekeeping; **Carry** retrieves it. Storage is available on all charts, for use when the book permits it. Stored items remain in saves/export and are unaffected when carried items are discarded. Moving armour preserves wounds; storage that would reduce a living hero to zero EP is blocked. Retrieval cannot revive a dead hero. Storing an equipped Sommerswerd unequips it; retrieval does not automatically equip it. Moves are blocked during active combat.

Mindblast gives +2 CS unless the enemy is immune. **Enemy Mindblast** is a separate EP-per-round amount supplied by the encounter; zero means none. Mindshield blocks it. Otherwise it is added to table losses, including evasion, and capped at current EP. Results/history identify its portion within total hero loss. One-off mental attacks use Endurance −/+.

Shield adds 2 CS while carried. Equip the Sommerswerd from Special or the Stats weapon dialog for +8 CS; applicable sword Weaponskill adds +2. Undead enemy EP losses double. Unarmed combat subtracts 4 CS. The Special Items known-item selector provides Shield/Sommerswerd; custom EP/CS effects are supported.

Apply Healing manually once per numbered section without combat, using Endurance +. Book 3 Hunting does not provide Meals in Kalte: Eat a Meal consumes a carried ration or loses 3 EP if none exists. When a section supplies ice-sledge/external food, leave backpack Meals alone. Book 4's Wildlands/mines and Book 5's desert Hunting restrictions remain section-directed through Meal required. Other unusual potions, partial immunities, and encounter effects use existing manual controls and Journal.

## Saves and limits

Changes autosave in this browser. **Export** saves every book chart, including safekeeping. **Import** previews and validates a file before replacing the campaign and can be undone during the session. Legacy Book 1/2 saves migrate; the old storage key is retained. Undo keeps 30 campaign changes during the current session; reload clears Undo, and individual note edits do not create entries.

Saves belong to the browser/origin. Local files, localhost, and production have separate storage. Export/import to change devices or origins. If storage is unavailable the app asks you to export; invalid stored data triggers a recovery notice and an editable starter chart. Older app releases cannot read later-book saves, so export before testing rollback.

Books 7 onward, a book reader, cloud sync/accounts, and a PWA/offline cache are outside the current implementation. Book 6 remains outside the published `book5v1` release. Once loaded, the chart makes no network calls. Ordinary portrait layouts were checked at 390×844, 375×667, and 320×568; dialogs, landscape/small viewports, or enlarged text may scroll to keep controls reachable. Special lists and combat history use pagination. The 100 combined carried/stored Special Item records are a software safeguard rather than a game slot limit.

## Verify and continue development

Node 24 was used; no dependencies are required. Run from the repository root:

```text
node --check app.js
node --check campaign.js
node --check rules.js
node tests/rules.test.js
node tests/campaign.test.js
node tests/app-save.test.js
node tests/disciplines.test.js
node tests/books3-5.test.js
node tests/book6.test.js
git diff --check
```

Tests cover combat table/bonuses, carryover and saves, full starting supplies, gesture cancellation, safekeeping, Mindblast/Mindshield, equipment limits, and Undo. The Book 6 suite adds Magnakai/inherited records, Lore-circles, arrows, and version 3 migration/imports. They run without the ignored source downloads using a tracked combat-table fixture; extra Book 2–6 source comparisons run when local XHTML exists. Browser verification and source details are in [BOOKS3-5-REVIEW.md](BOOKS3-5-REVIEW.md) and [BOOK6-REVIEW.md](BOOK6-REVIEW.md). Physical-phone testing was not performed.

Read [HANDOFF.md](HANDOFF.md) for architecture, save schema, invariants, known limitations, deployment, and next-book guidance. [AGENTS.md](AGENTS.md) gives concise repository instructions. Other optional proposals were set aside by Jon and are not pending requirements.

## Releases and deployment

GitHub Pages publishes the root of `main`; `.nojekyll` keeps the static assets unchanged. Updates to main deploy automatically. Browser asset changes require fresh query versions in `index.html`. The repository excludes downloaded books, adventure backups, temporary files, and dependencies.

[CHANGELOG.md](CHANGELOG.md) records release checkpoints: `book2v1`, `book2v2`, `book2v3`, `book2v4`, and `book5v1`. Use immutable tags when reviewing or handing off a known version.

## Sources

Rules were checked against local Project Aon `01fftd.htm`, `02fotw.htm`, `03tcok.htm`, `04tcod.htm`, and `05sots.htm` (Game Rules, Disciplines, Equipment, Combat Rules/Table). The current official Book 5 table image corrects one discrepancy in the downloaded simple edition; the review documents that correction.

Book 6 was checked against local `06tkot.htm`, including its training, Lore-circle, equipment, chart/table, and footnote sections, plus the official Magnakai/Newsletter clarifications linked in its review.

Inspired by [Eric's Action Chart](https://www.projectaon.org/staff/eric/lw01.htm). [Project Aon](https://www.projectaon.org/) provides the original books. Lone Wolf was created by Joe Dever. This unofficial fan project bundles no narrative text or illustrations. Local reference downloads retain their own notices/license and are excluded from Git and deployment.
