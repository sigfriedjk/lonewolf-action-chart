# Development

The app supports Books 1–20 using plain HTML, CSS, and JavaScript. There are no dependencies, build step, accounts, or server component. Product direction is in [README.md](README.md); working agreements for future agents are in [AGENT.md](AGENT.md).

## Run locally

Open `index.html` directly, or use an existing Node runtime (Node 24 was used for verification):

```sh
node preview.js
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/); Ctrl+C stops the preview. No `npm install` is needed. The preview is localhost-only and serves the five app assets plus optional ignored source books. It is development tooling, not a production server.

Saves belong to their browser and origin. Local files, localhost, and the live site have separate storage. Use Export/Import to move a campaign; export before testing an older app version.

## File responsibilities

| File | Responsibility |
| --- | --- |
| `index.html` | Static shell, viewport, script order, cache-busting asset URLs. |
| `styles.css` | Phone/desktop layout, ten-row Grand Master backpack, dialogs, gestures, reduced motion. |
| `rules.js` | Pure training/weapon data, combat table, arithmetic, recovery, psychic and missile helpers. Exposes `LWRules` and CommonJS. |
| `campaign.js` | Pure book metadata/setup, carryover, supplies, validation/migration, safekeeping and bonus changes. Exposes `LWCampaign` and CommonJS. |
| `app.js` | Rendering, events/dialogs, browser storage, navigation, gestures, import/export, Undo. |
| `preview.js` | Optional static preview on port 4173. |
| `tests/` | Direct Node suites, VM browser harnesses, tracked canonical combat-table fixture. |
| `scripts/download-books.sh` | Optional Project Aon reference download; output is Git-ignored. |

Browser script order is rules → campaign → app. Once loaded, the app makes no network calls; external book links open Project Aon. Only the five app assets are required to run.

## State and save compatibility

Each campaign is `{version, activeBook, books}`. Every book owns an independent chart with scores, current EP, gold, weapons/equipped index, backpack/Meals, carried `special`, `storedSpecial`, training, section, notes, last roll, and combat. `completedBooks` records the player-confirmed source chain, not every earlier book number.

| Charts | Character version | Campaign/storage |
| --- | --- | --- |
| Books 1–5 | 1 | Campaign 2, `lone-wolf-action-chart-v2`; legacy `lone-wolf-action-chart-v1` imports/storage remain supported. |
| Books 6–12 | 2 | Campaign 3, `lone-wolf-action-chart-v3`. |
| Books 13–20 | 3 | Campaign 4, `lone-wolf-action-chart-v4`. |

A campaign can contain mixed character versions. Keep earlier numeric values and chart versions on migration; never reroll or silently reinterpret old scores. Loading prefers v4, then v3, then v2/v1. If the newest stored data is corrupt, show recovery rather than silently selecting older progress. Keep all previous keys. Once upgraded, Undo and imports of older campaigns continue writing the newest active storage version so stale newer data cannot reappear on reload.

`validateSave` accepts legacy single charts and supported campaigns, returns cleaned independent objects, and rejects malformed/unsupported records. Every new field must survive validation, loading, copying, export/import, and Undo. Invalid imports must leave the current campaign unchanged. Older app versions may reject newer books or discard newer optional fields.

Magnakai fields are `magnakai`, `masteries`, `loreCircles`, and `arrows`; `disciplines`/`mastery` retain inherited Kai training. `weaponmasteryLevel` defaults to `standard`; explicit choices are `standard`, `tutelary`, and `scion`. `psychicMode` defaults to `legacy`, preserving ordinary Mindblast without granting higher attacks. `lastAdjustedRoll` defaults to null and stores raw roll, signed modifier, selected bonus flags, and a validated total; `lastRoll` stays raw 0–9.

Grand Master charts add `grandMaster`, `grandMasteries`, `grandAdvances` (initially zero), `grandUnarmed` (false = inherited, true = zero penalty, `crown` = +3), and `grandFlaming` (default false). Inherited Kai/Magnakai records remain separate. Adjusted rolls may add `grandBow:true`; older result objects retain their shape.

Combat rounds store total `heroLoss`/`enemyLoss`, with included portions: incoming `mindblastLoss`, and optional `surgeLoss`, `flameLoss`, `blastRolls`/`blastLoss`/`blastCost`, and `rayLoss`/`rayCost`. Do not add these breakdown fields to the totals a second time. Costs and damage are capped at remaining EP; validators reject inconsistent breakdowns.

`change()` snapshots the entire campaign, mutates, persists, and rerenders. Undo is session-only, capped at 30 entries. When replacing `state`, let `persist()` update `campaign.books[activeBook]`. Notes save on input without creating individual Undo entries. Views, filters, pages, gestures, and Carry/Safekeeping selection are transient; the Special location resets to Carry on reload.

## Setup and rule invariants

`startBook(book, source, options)` clones a validated source. Starting/replacing a chart grants that book's setup supplies once; switching existing charts grants nothing. Continued charts preserve wounds, possessions, safekeeping, actual training, and notes, while resetting bookmark/encounter. The source stays independent. Books 1–5 require a living source, full Kai selection, and no active combat; they learn one additional Discipline. Books 6–20 use explicit completion without those eligibility gates. They recommend earned selections but never select them automatically. Copying a dead source does not revive it.

- Books 1–12 fresh scores are CS 10–19 / EP 20–29. Grand Master fresh scores are CS 25–34 / EP 30–39. Fresh advanced entry grants no inherited numeric benefits; full Kai/Magnakai confirmations are explicit player choices.
- Two regular weapons; eight backpack spaces for Books 1–12, ten for Books 13–20. Each Meal and potion dose uses a space. Duplicate/capacity failures preserve the setup form and existing charts. Twelve Special Items and fifty Crowns are reference limits; gold above 50 is supported. The combined 100 carried/stored Special Item limit is a software safeguard.
- Book 11 continuation grants no new gold, map, or supplies; fresh entry grants two Meals and six optional choices. Book 12 has six choices, including four Meals. Grand Master Books 13–15 have five choices; Books 16–20 have four. Every Grand Master setup adds 20–29 Crowns once. Use each book's metadata for its actual list/map; do not extrapolate from adjacent books.
- `equipped` is a weapon index, −1 unarmed, or −2 carried Sommerswerd. Stored items cannot be equipped and supply no bonuses. Storing an equipped Sommerswerd unequips it; retrieval does not re-equip it. Duplicate carried Shield/Sommerswerd retrieval is blocked.
- `moveSpecial` is pure. Armour moves preserve wounds, cannot reduce a living hero to zero, and cannot revive a dead hero. Moves are blocked during active combat. Lore-circle/advance edits also preserve wounds and never revive; removing their bonuses may reduce EP to zero and end combat.
- Checked Lore-circles own their CS/EP bonuses: Fire +1/+2, Light +0/+3, Solaris +1/+3, Spirit +3/+3. Readiness highlighting is guidance; skill edits do not change checks. Grand advances own +1 CS/+2 maximum EP each. Do not duplicate either in manual Extra CS/EP.
- Matching Grand mastery +5 replaces Magnakai +3/+4 and Kai +2. Matching sword masteries apply to the Sommerswerd. Grand Bow +5 replaces Bow +3 and Mentora +2. The selected unarmed value replaces earlier penalties; Bow counts as unarmed in ordinary melee. None of these selections grants a weapon.
- Sommerswerd adds +8 CS when equipped and doubles normal enemy loss against undead. Carried Shield adds +2 CS. Incoming Mindblast is separate from the selected attack and is blocked by Mindshield/Psi-screen/Kai-screen. Section modifiers cover unusual exceptions.
- Select one psychic attack. Ordinary/Archmaster surge is +4/2 EP or +6/1 EP; Grand Master Mindblast is +4/no cost and Kai-surge +8/1 EP. Selected surge costs apply on Fight/Evade even against immunity. The player checks skill/EP eligibility; the app does not infer rank upgrades.
- Flaming weapon adds at most 1 enemy EP on a successful normal Fight hit, never evasion or a zero-damage result. Kai-blast replaces psychic CS bonuses, costs up to 4 EP, and adds two 0–9 numbers with zero treated as one. Immunity blocks its damage; evasion ignores enemy losses. Neither extra damage is multiplied by Sommerswerd.
- Kai-ray supplements one normal Fight round with up to 15 enemy EP loss / 4 hero EP cost, replacing the usual psychic attack for that round and retaining the saved mode afterward. Immunity applies. More than 10 EP and once-per-combat use stay player decisions, with Undo and no use counter.
- Healing/Curing's ordinary 1 EP per noncombat section is manual. Archmaster Curing and Deliverance each offer capped Restore 20 EP actions without revival; eligibility reminders are respectively 6 EP/100 days and 8 EP/20 days in combat. Time limits remain player-tracked. Ordinary Healing Potion/Laumspur recovers 4 EP after combat; Alether uses manual Section CS +2 and dose removal.
- Book 3 Hunting provides no free Meals in Kalte. Sledge/external food and later section exceptions stay manual. Quiver setup adds six arrows once; shots, quiver moves, replenishment, and bookmark effects never change arrows automatically.

## Automated checks

Run from the repository root using existing Node. All fourteen suites work without book downloads:

```sh
node --check app.js
node --check campaign.js
node --check rules.js
for test_file in tests/*.test.js; do
  node "$test_file" || exit 1
done
bash -n scripts/download-books.sh
git diff --check
```

Suites cover rules, campaign setup/validation, browser save handling, Discipline gestures, Books 3–5, Book 6, Book 7, Books 8–9, Books 10–12, Book 13, Books 14–15, Book 16, Books 17–18, and Books 19–20. The canonical Book 1 combat-table fixture is tracked. Additional local Book 2–20 source comparisons run only when the ignored XHTML files exist; skipped comparisons are reported separately.

## Browser and live verification

Use isolated browser contexts and actual UI actions, including real file export/import. Do not mutate a player's production saves. Current verification sizes are 390×844, 430×932, and 1280×900. Check six-tab navigation, setup/full supplies/capacity failures, all ten Grand Master backpack rows together, Mastery/inherited records, Carry/Safekeeping, fixed-roll combat and logs, special helpers, switching, Undo, reload, and valid/invalid imports. Normal pages at those sizes should fit; dialogs and smaller viewports can scroll. Physical-phone testing is a separate activity.

For a live check, fetch `index.html` and the exact asset URLs it references; compare their bytes with the intended deployment commit before exercising the UI. Confirm all twenty books are available. Exercise Grand Master continuation, v4 upgrade retaining old keys, chosen advances/masteries, Deliverance, Kai-ray and the next ordinary psychic round, Kai-blast/flame, adjusted Grand Bow rolls, and twenty-chart persistence. Confirm malformed imports preserve the current campaign. Report the tested commit and distinguish deployed checks from local tests.

On 16 October 2026, the five live assets matched integration commit `d7a6a46fe0d705167ea9edf1207503da7561d9b9` byte-for-byte (HTTP 200). Isolated Chromium flows passed at all three sizes above: Book 13 entry and continuation through Book 20 with unchanged source charts; six tabs; ten-row backpacks, including full inventories; chosen mastery/advances/unarmed training and Undo; Deliverance; fixed-roll Kai-ray/log/Undo, retained Kai-surge and its next-round cost; Kai-blast/flaming damage; adjusted Grand Bow total 13; all twenty charts switched, reloaded, and exported/imported through actual files; invalid import preserved the campaign. No browser errors occurred. All fourteen Node suites, JavaScript/shell syntax, and whitespace checks passed. Optional downloaded-source comparisons were skipped in this checkout. Physical-phone testing was not performed.

## Rules and source references

Optional local references require Bash, `curl`, and `unzip`:

```sh
bash scripts/download-books.sh
```

The script fetches [all-books-simple.zip](https://www.projectaon.org/en/pub/all-books-simple.zip), validates/extracts it into ignored `all-books-simple/`, overwrites matching extracted files on rerun, and removes the temporary archive. Keep original notices/license intact. Allow HTTPS to `www.projectaon.org` in restricted environments. Never commit or deploy these downloads, adventure saves, narrative, illustrations, or temporary QA artifacts.

Book metadata in `campaign.js` supplies each source slug: local files live at `all-books-simple/en/xhtml-simple/lw/<slug>.htm`; official single-page editions use `https://www.projectaon.org/en/xhtml-simple/lw/<slug>.htm`. Check the individual book's `#gamerulz`, `#discplnz`, `#equipmnt`, carrying/use, `#levels`, `#imprvdsc`, `#action`, `#cmbtrulz`, `#crtable`, and `#footnotz` anchors where present. Training subsections include `#tutelary`, `#guardian`, `#sunkght`, `#sunlord`, `#sunthane`, `#grandthane`, `#grandcrown`, and `#sunprince`. Inspect fresh/continued entry separately and compare combat rows by their roll labels, since some editions print zero last.

The downloaded simple Book 5 has a known transcription discrepancy: roll 8, ratio −10/−9 prints `8/4`; the current official [negative table image](https://www.projectaon.org/en/xhtml/lw/05sots/crtneg.png) shows `5/4`. Keep the shared `5/4` value and explicit test exception. No other discrepancy was found in the previous Books 2–20 source checks.

Useful official clarifications: [Magnakai Disciplines](https://www.projectaon.org/en/ReadersHandbook/MagnakaiDisciplines), [Lore-circles](https://www.projectaon.org/en/ReadersHandbook/MagnakaiLoreCircles), [newsletter excerpts](https://www.projectaon.org/en/ReadersHandbook/NewsletterExcerpts), [Grand Master rules](https://www.projectaon.org/en/ReadersHandbook/GrandMaster), [Disciplines](https://www.projectaon.org/en/ReadersHandbook/GrandMasterDisciplines), [training](https://www.projectaon.org/en/ReadersHandbook/GrandMasterTraining), [equipment](https://www.projectaon.org/en/ReadersHandbook/GrandMasterEquipment), and [combat](https://www.projectaon.org/en/ReadersHandbook/GrandMasterCombat). Use a book's own supply list when generic handbook equipment differs. Book 13 `#gamerulz-1-foot` separates permanent scores from bonuses; `#discplnz-1-foot` explains replacement mastery/Grand Bow. Book 19 `#sect276-1-foot` and Book 20 `#sect330-1-foot` illustrate why unarmed exceptions and equipment loss remain player-directed. Plane of Darkness Sommerswerd changes and unusual weapon interpretations use manual section adjustments, not bookmark-triggered changes.

## Deployment

[Repository](https://github.com/sigfriedjk/lonewolf-action-chart) · [Live app](https://sigfriedjk.github.io/lonewolf-action-chart/index.html) · [Release history](CHANGELOG.md)

GitHub Pages publishes the root of `main`; `.nojekyll` is tracked. The direct `index.html` link avoids a previously reported directory-URL phone 404. Keep `index.html`, `styles.css`, `rules.js`, `campaign.js`, and `app.js` together. Bump asset query versions in `index.html` whenever browser assets change; documentation-only edits need no bump.

For an authorized release, inspect the worktree and remote head, run the checks, commit intended source/tests/docs, publish to `main`, and verify the Pages workflow succeeds for that exact commit. Then verify the live asset bytes and UI. Create a tag/release only when requested, at the verified commit, and never move an existing tag. Preserve unrelated work and check the expected remote SHA before updating a branch. Keep downloaded books, credentials, backups, and test artifacts out of the publication. Historical release approvals do not authorize a new release.

Books 1–20 are implemented; Book 21 onward has no approved implementation scope. Earlier reviews and handoffs are retained in Git history rather than duplicated in the working tree.
