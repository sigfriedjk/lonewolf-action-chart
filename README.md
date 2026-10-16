# Lone Wolf Action Chart

A mobile-first companion for **Lone Wolf Books 1–20**, written in plain HTML, CSS, and JavaScript. No framework, build step, account, backend, or dependencies. The current main version supports Books 1–20. The previous immutable checkpoint, book12v1, supports Books 1–12.

**Current version:** [Books 1–20 on main](https://github.com/sigfriedjk/lonewolf-action-chart/tree/main) · **Previous tag:** [book12v1](https://github.com/sigfriedjk/lonewolf-action-chart/tree/book12v1) · **Play:** [Action Chart](https://sigfriedjk.github.io/lonewolf-action-chart/index.html) · **Developer:** [HANDOFF.md](HANDOFF.md)

The direct `index.html` link is provided because it resolved a previously reported phone 404 at the directory URL. Saves stay on the same origin.

## Product direction and next books

Books 13–20 are integrated under the approved Grand Master approach. [Book 13](BOOK13-REVIEW.md) and the [Books 14–20 review](BOOKS14-20-REVIEW.md) record source audits, approved controls, save compatibility, and verification. Jon authorized merging and deploying this completed work on 16 October 2026. Direct live-site verification remains deferred.

The goal is an electronic paper Action Chart: simple recordkeeping and useful arithmetic, with the player interpreting and enforcing the rules. The current Books 1–5 app still enforces some inventory, skill, and action limits described below; these are existing behaviors to review, not a mandate to expand rule enforcement.

[BOOKS6-20-PLAN.md](BOOKS6-20-PLAN.md) records the 14 October 2026 review and remaining roadmap. Jon subsequently approved Book 6 and its compact layout; [BOOK6-REVIEW.md](BOOK6-REVIEW.md) records the Book 6 implementation. [BOOK7-REVIEW.md](BOOK7-REVIEW.md) records Book 7’s source audit and verification. Books 8–12 are included in `book12v1`; [BOOKS8-12-REVIEW.md](BOOKS8-12-REVIEW.md) records the approved choices and verification. Books 13–20 are included in the main integration; Book 21 is outside scope. Discuss further layout or major behavior changes before implementation. Prefer existing manual controls and Journal for adventure-specific exceptions.

## Book 6

Book 6 adds separate Magnakai selections and multiple weapon masteries, with inherited Kai benefits editable in Mastery. Three initial selections/masteries and Kai Master Superior are reference guidance. Completed earlier adventures are player-confirmed; copying never modifies the source chart. All-five completion can explicitly record all ten basic Kai skills, while fresh entry grants no inherited mechanical benefits.

On Kai, four Lore-circle checkboxes apply CS/EP bonuses automatically. Gold highlighting and **Ready** show that the required skills are selected. Checks stay under your control, including after skill edits; do not duplicate their bonuses in Extra CS/EP. Changes preserve wounds and never revive a dead hero. Arrows share the Stats resource card with Gold; tap either total for direct editing and −/+. A starting Quiver adds six arrows once; later shots, replenishment, and quiver moves are manual. Meals stays alongside. Earlier books retain their Gold controls.

Five optional supplies include Bow, Quiver, four rations, Rope/Tinderbox, and the +2 EP waistcoat. Weaponmastery +3 replaces a matching inherited Weaponskill +2. Psi-screen protects against incoming Mindblast. Ordinary Mindblast is calculated; In this release, player-chosen psychic attacks include their bonus and EP cost; ordinary healing and section exceptions remain manual. Bow counts as unarmed in ordinary melee. Tap a Book 6 Special Item's name/description to edit its description.

Using Book 6 creates a version 3 campaign under a new browser-storage key, retaining the old keys. Legacy imports remain supported; new exports need the newer app. See the review for migration and verification details.

## Book 7

Castle Death uses the same Magnakai controls. Book 6 continuation preserves selected skills, masteries, checked Lore-circles, arrows, and wounds. Confirmed Magnakai completions increase the recommended skill count; choose your new Discipline and any earned mastery yourself. Primate improvements are reference text in the Discipline dialogs. Fresh Book 7 still recommends three skills and grants no inherited Kai bonuses.

Five optional supplies use Book 7's own list: a Lantern is a Backpack Item, three Meals use three slots, and three Fireseeds are separate Special Items you remove manually as used. A selected Quiver adds six arrows once. Setup adds a Map of Dessi. No encounter effects or equipment losses are applied from bookmarks. Book 7 uses the same v3 storage as Book 6, including when starting without a Book 6 chart.

## Books 8–12

Books 8–9 reuse the Magnakai charts with their own maps, five supply choices, and Tutelary/Principalin guidance. In Mastery, explicitly select Standard (+3 melee / −4 unarmed), Tutelary (+3 / −2), or Scion-kai (+4 / −1). The choice applies with Weaponmastery selected, is retained in carryover and saves, and supports Undo. Book number and skill count never select an improvement. Older Magnakai saves default to Standard. Do not duplicate the selected improvement in manual CS adjustments.

Books 10–12 add their own setup lists and further training guidance. Continued Book 11 grants no supplies or gold; fresh Book 11 grants two Meals plus six choices. Book 12 offers six choices including four Meals. Every chart stays independent.

For Magnakai characters, **Psychic attack** on Combat (also in the menu) lets you choose Mindblast or Psi-surge, including Archmaster versions, or no psychic attack. The chart adds the selected bonus and includes surge's EP cost each Fight/Evade round. Do not duplicate these in Extra CS or manual EP deductions. You decide whether your skills, current EP, and the encounter permit the attack. The standard default preserves existing Mindblast behavior; it never chooses higher-rank abilities.

**Adjusted missile roll**, in the menu or Weaponmastery dialog, adds selected Bow mastery +3, Mentora +2, and a section modifier to a rolled or entered 0–9 number. You mark off arrows yourself. **Restore 20 EP**, in the Curing dialog, applies Archmaster recovery when you press it; the chart reminds you of the conditions and leaves the 100-day limit to your record. Both support Undo.

## Books 13–20

Grand Master charts use the existing six tabs. Kai shows twelve Grand Master Disciplines, with four initially recommended. Mastery holds Grand weapon types, inherited Kai/Magnakai records, checked Lore-circles, and the applied advance count. Completed Grand Master adventures increase the recommendation; you select skills and apply earned advances yourself. Each applied advance adds +1 CS/+2 maximum EP and preserves wounds. Do not duplicate these in Extra CS/EP.

Fresh entry uses CS 25–34 / EP 30–39, with no inherited numeric benefits selected. Continuation preserves actual scores, wounds, chosen benefits, possessions, safekeeping, and notes independently. You may explicitly confirm completed Magnakai training; no benefits are inferred from book number. Review the Special Item carryover list in setup and manage Carry/Safekeeping yourself.

Selected Grand weapon types give +5 melee, replacing lower mastery. Mastery offers inherited unarmed training, Grand Master zero penalty, or Grand Crown +3; the choice replaces earlier unarmed arithmetic. Adjusted missile roll offers Grand Bow +5, replacing Magnakai Bow and Mentora. Psychic attack adds Kai-surge +8/1 EP or Grand Master Mindblast +4/0 alongside inherited choices. Bonuses replace one another. Deliverance offers Restore 20 EP, with the 8-EP/once-per-20-days reminder; you decide eligibility and track time.

For Sun Lord training, explicitly check Flaming weapon in Mastery to add 1 enemy EP loss on a successful Fight round with an eligible weapon. Kai-blast in Psychic attack replaces other attacks: two entered or rolled numbers (zero = one) add 2–18 enemy EP loss alongside the normal round and cost 4 EP. The round log includes these effects within total losses.

For Sun Prince training, **Fight one round with Kai-ray** in Psychic combat adds up to 15 enemy EP loss and costs up to 4 EP alongside a normal round. It replaces the other psychic attack for that round and retains your usual choice afterward. More than 10 EP and once-per-combat use are player-checked conditions. All choices/actions support Undo and saves. Other spells, time limits, section exceptions, and equipment losses remain player-directed.

All ten Grand Master backpack rows remain on one page. Small phones are no longer a design requirement; smaller viewports can scroll.

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
- **Backpack:** Eight rows for Books 1–12; ten for Books 13–20, on one page, including empty slots. Meals each use a slot. Tap an empty row to add supplies; use/remove controls stay with carried items. Ordinary Healing Potion and Potion of Laumspur recover up to 4 EP after combat.
- **Special:** Carry/Safekeeping toggle, carried-item Store buttons, and stored-item Carry buttons. Add items in Carry; longer lists are paginated. Stored items give no bonuses. Undo remains on Stats and in the menu.
- **Combat:** Enemy scores, section CS adjustment, enemy Mindblast damage per round, immunity to your Mindblast, and undead status. Use a random or chosen 0–9 roll, evade only when the book permits it, and open Log for paginated round history. Undo restores the whole round.
- **Journal:** Autosaved notes, Rules, and Export. Keep notes about section-specific effects, external food, and other exceptions here.

The shared book title opens book switching/setup, and the shared section gear edits the bookmark. The initial Book 1 chart is an editable starter: CS 15, EP 25, Axe, one Meal, Map, and Healing Potion. Use **Menu → Start a new adventure** for rolled setup.

## Books and carryover

Each book keeps an independent chart. For Books 1–5, finish combat, select all available Disciplines in an earlier chart, then use the book menu's carryover action. The form names the source, requires confirmation that it was completed, and lets you learn one new Discipline. It copies scores, current wounds, mastery, gold, equipment, and notes; resets bookmark/combat; adds the destination's map/gifts and 10–19 starting Crowns; and lets you exchange weapons/take starting supplies. Books 6–7 use the player-confirmed transitions described above. Opening an existing chart grants nothing again.

Sequential play gives five, six, seven, eight, and nine Disciplines in Books 1–5. Fresh starts have five; skipped adventures do not award their skills. The latest eligible earlier chart is the automatic carryover source. Restarting the active book explicitly replaces only that chart and can be undone during the session.

| Book | Adventure | Starting supply choices | Map/gifts | Sections |
| --- | --- | --- | --- | --- |
| 1 | Flight from the Dark | Monastery item plus basic kit | Map of Sommerlund | 350 |
| 2 | Fire on the Water | Up to 2 Royal Armoury choices | Map of Sommerlund, Seal of Hammerdal | 350 |
| 3 | The Caverns of Kalte | Up to 2 choices | Map of Kalte | 350 |
| 4 | The Chasm of Doom | Up to 6 choices | Map of the Southlands, Badge of Rank | 350 |
| 5 | Shadow on the Sand | Up to 4 choices | Map of Vassagonia | 400 |
| 6 | The Kingdoms of Terror | Up to 5 choices | Map of the Stornlands | 350 |
| 7 | Castle Death | Up to 5 choices | Map of Dessi | 350 |
| 8 | The Jungle of Horrors | Up to 5 choices | Map of the Danarg | 350 |
| 9 | The Cauldron of Fear | Up to 5 choices | Map of Anari | 350 |
| 10 | The Dungeons of Torgar | Up to 5 choices | Map of Ghatan | 350 |
| 11 | The Prisoners of Time | Fresh: up to 6; continued: none | Fresh: 2 Meals; no map | 350 |
| 12 | The Masters of Darkness | Up to 6 choices | Map of the Darklands | 350 |
| 13 | The Plague Lords of Ruel | Up to 5 choices | Map of the Dark Realm of Ruel | 350 |
| 14 | The Captives of Kaag | Up to 5 choices | Map of the Darklands | 350 |
| 15 | The Darke Crusade | Up to 5 choices | Map of the Western Tentarias | 350 |
| 16 | The Legacy of Vashna | Up to 4 choices | Map of the Maakengorge | 350 |
| 17 | The Deathlord of Ixia | Up to 4 choices | Map of Ixia and the Hardlands | 350 |
| 18 | Dawn of the Dragons | Up to 4 choices | Map of Northern Magnamund | 350 |
| 19 | Wolf’s Bane | Up to 4 choices | Map of Sommerlund and the Wildlands | 350 |
| 20 | The Curse of Naar | Up to 4 choices | Map of the Planes of Existence | 350 |

Supply selectors are optional: leave unused ones at No item. Different choices are required. Listed ration/potion bundles expand into individual Meals/doses. Duplicate or capacity errors preserve the form and existing charts. Regular weapons are limited to two, backpack contents to eight in Books 1–12 or ten in Books 13–20, including every Meal/dose; supplies are never silently discarded. New armour adjusts current/max EP by its bonus without healing prior wounds.

## Safekeeping and combat effects

On Special, **Store** moves an item to safekeeping; **Carry** retrieves it. Storage is available on all charts, for use when the book permits it. Stored items remain in saves/export and are unaffected when carried items are discarded. Moving armour preserves wounds; storage that would reduce a living hero to zero EP is blocked. Retrieval cannot revive a dead hero. Storing an equipped Sommerswerd unequips it; retrieval does not automatically equip it. Moves are blocked during active combat.

Mindblast gives +2 CS unless the enemy is immune. **Enemy Mindblast** is a separate EP-per-round amount supplied by the encounter; zero means none. Mindshield blocks it. Otherwise it is added to table losses, including evasion, and capped at current EP. Results/history identify its portion within total hero loss. One-off mental attacks use Endurance −/+.

Shield adds 2 CS while carried. Equip the Sommerswerd from Special or the Stats weapon dialog for +8 CS; applicable sword Weaponskill adds +2. Undead enemy EP losses double. Unarmed combat subtracts 4 CS. The Special Items known-item selector provides Shield/Sommerswerd; custom EP/CS effects are supported.

Apply Healing manually once per numbered section without combat, using Endurance +. Book 3 Hunting does not provide Meals in Kalte: Eat a Meal consumes a carried ration or loses 3 EP if none exists. When a section supplies ice-sledge/external food, leave backpack Meals alone. Book 4's Wildlands/mines and Book 5's desert Hunting restrictions remain section-directed through Meal required. Other unusual potions, partial immunities, and encounter effects use existing manual controls and Journal.

## Saves and limits

Changes autosave in this browser. First using a Grand Master chart upgrades to campaign v4 under a new storage key, retaining the older stored copies. Older imports and Undo continue using the newest key once upgraded; corrupt newest data does not silently load stale progress. Older app versions cannot read Grand Master exports. Export before rollback. **Export** saves every book chart, including safekeeping. **Import** previews and validates a file before replacing the campaign and can be undone during the session. Legacy Book 1/2 saves migrate; the old storage key is retained. Undo keeps 30 campaign changes during the current session; reload clears Undo, and individual note edits do not create entries.

Saves belong to the browser/origin. Local files, localhost, and production have separate storage. Export/import to change devices or origins. If storage is unavailable the app asks you to export; invalid stored data triggers a recovery notice and an editable starter chart. Older app releases cannot read later-book saves, so export before testing rollback.

Book 21 onward, a book reader, cloud sync/accounts, and a PWA/offline cache are outside scope. The current main integration supports Books 1–20; `book12v1` remains the previous immutable checkpoint. Once loaded, the chart makes no network calls. Grand Master layouts were checked at 390×844, 430×932, and 1280×900. Small phones are no longer a design requirement; dialogs, smaller viewports, or enlarged text may scroll to keep controls reachable. Special lists and combat history use pagination. The 100 combined carried/stored Special Item records are a software safeguard rather than a game slot limit.

## Verify and continue development

Download and unzip the Project Aon books needed as development references:

```sh
bash scripts/download-books.sh
```

This requires Bash, `curl`, and `unzip`, and downloads [all-books-simple.zip](https://www.projectaon.org/en/pub/all-books-simple.zip) into a temporary directory before extracting it to the Git-ignored `all-books-simple/` directory. The script works from any working directory and overwrites matching extracted files when rerun. It removes the temporary archive on exit. Keep the books' notices/license intact; do not commit or deploy these reference files. In restricted development environments, allow HTTPS access to `www.projectaon.org` first.

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
node tests/book7.test.js
node tests/books8-9.test.js
node tests/books10-12.test.js
node tests/book13.test.js
node tests/books14-15.test.js
node tests/book16.test.js
node tests/books17-18.test.js
node tests/books19-20.test.js
bash -n scripts/download-books.sh
git diff --check
```

Tests cover combat table/bonuses, carryover and saves, full starting supplies, gesture cancellation, safekeeping, Mindblast/Mindshield, equipment limits, and Undo. The Book 6 suite adds Magnakai/inherited records, Lore-circles, arrows, and version 3 migration/imports. The Book 7 suite adds independent Magnakai continuation, manual progression, its supplies, seven-chart saves, and storage upgrade without Book 6. They run without the ignored source downloads using a tracked combat-table fixture; extra Book 2–20 source comparisons run when local XHTML exists. The current suites also cover all twenty charts, explicit Grand Master bonuses, one-page ten-slot capacity, v4 save retention, Kai-blast, flaming weapons, and the one-round Kai-ray action. Browser verification and source details are in [BOOKS3-5-REVIEW.md](BOOKS3-5-REVIEW.md), [BOOK6-REVIEW.md](BOOK6-REVIEW.md), [BOOK7-REVIEW.md](BOOK7-REVIEW.md), [BOOKS8-12-REVIEW.md](BOOKS8-12-REVIEW.md), [BOOK13-REVIEW.md](BOOK13-REVIEW.md), and [BOOKS14-20-REVIEW.md](BOOKS14-20-REVIEW.md). Physical-phone testing was not performed.

Read [HANDOFF.md](HANDOFF.md) for architecture, save schema, invariants, known limitations, deployment, and next-book guidance. [AGENTS.md](AGENTS.md) gives concise repository instructions. Other optional proposals were set aside by Jon and are not pending requirements.

## Releases and deployment

GitHub Pages publishes the root of `main`; `.nojekyll` keeps the static assets unchanged. Updates to main deploy automatically. Browser asset changes require fresh query versions in `index.html`. The repository excludes downloaded books, adventure backups, temporary files, and dependencies.

[CHANGELOG.md](CHANGELOG.md) records release checkpoints: `book2v1`, `book2v2`, `book2v3`, `book2v4`, `book5v1`, `book7v1`, and `book12v1`. Use immutable tags when reviewing or handing off a known version.

## Sources

Rules were checked against local Project Aon `01fftd.htm`, `02fotw.htm`, `03tcok.htm`, `04tcod.htm`, and `05sots.htm` (Game Rules, Disciplines, Equipment, Combat Rules/Table). The current official Book 5 table image corrects one discrepancy in the downloaded simple edition; the review documents that correction.

Book 6 was checked against local `06tkot.htm`, including its training, Lore-circle, equipment, chart/table, and footnote sections, plus the official Magnakai/Newsletter clarifications linked in its review.

Book 7 was reviewed against the official single-page edition and Magnakai handbook guidance; [BOOK7-REVIEW.md](BOOK7-REVIEW.md) records the source anchors and actual verification.

Books 13–20 were audited individually against the ignored Project Aon XHTML sources, including fresh/continued entry, supplies, training, combat tables, and relevant footnotes. Their reviews record deliberate player-controlled handling of section exceptions.

Inspired by [Eric's Action Chart](https://www.projectaon.org/staff/eric/lw01.htm). [Project Aon](https://www.projectaon.org/) provides the original books. Lone Wolf was created by Joe Dever. This unofficial fan project bundles no narrative text or illustrations. Local reference downloads retain their own notices/license and are excluded from Git and deployment.
