# Developer handoff — Books 1–20 integration

**Current continuation — 16 October 2026:** Jon authorizes development through Book 20 with discussion before new layout or major behavior decisions, and subsequently requests merging and deploying the completed work. Books 13–20 are implemented for the main integration. Read [BOOK13-REVIEW.md](BOOK13-REVIEW.md) and [BOOKS14-20-REVIEW.md](BOOKS14-20-REVIEW.md). Jon approved the Grand Master foundation with all ten backpack rows on one page, removed small-phone design requirements, deferred live verification, and approved Book 16's flaming-weapon/Kai-blast controls, Book 19's three unarmed choices, and Book 20's one-round Kai-ray action. The previous immutable checkpoint remains `book12v1` at `84b9fe66e1b660483097fe064018f4b1cc6429cd`. GitHub Pages publishes the updated `main`; use its Actions run to verify the deployment commit.

Start with this file, [README.md](README.md), and [BOOKS3-5-REVIEW.md](BOOKS3-5-REVIEW.md). The current integration supports Lone Wolf Books 1–20, including Grand Master training, player-selected improvements, ten backpack rows on one page, book-specific setup, and compatible campaign saves. Integration date: 16 October 2026.

**Book 7 continuation — 15 October 2026:** The current request authorized Book 7. Its local implementation extends the handoff commit `c4a904722ae8a9e6384ed784221f3a49a72e8dbb` with independent Magnakai continuation, Book 7 supplies, and manual Primate guidance. See [BOOK7-REVIEW.md](BOOK7-REVIEW.md). It reuses Book 6 controls and save versions. Run all seven suites, including `node tests/book7.test.js`. Books 8 onward remain outside this release.

**Book 6 development work:** Jon approved implementing Book 6, plus four manually checked Lore-circle bonuses with readiness highlighting and an editable arrow total beside Gold. The compact layout was explicitly approved. The implementation is included in `book7v1`. Read [BOOK6-REVIEW.md](BOOK6-REVIEW.md) for actual behavior, exact source anchors, save migration, and verification. Book 7 is covered by the continuation above; Books 8 onward require their own scope.

## Books 8–12 integration — 16 October 2026

Jon authorized work through Book 12, stopping for layout/implementation decisions. Books 8–12 and the approved player-selected Weaponmastery, adjusted missile roll, psychic attacks/costs, and Curing action are included in `book12v1`. Read [BOOKS8-12-REVIEW.md](BOOKS8-12-REVIEW.md), including source differences, new record fields/defaults, and verification. The new optional-import `weaponmasteryLevel` field defaults to Standard; current validation preserves it, and older app versions can discard it. Keep the v3 storage keys and independent charts. Run `node tests/books8-9.test.js` and `node tests/books10-12.test.js` in addition to the existing seven suites. Jon subsequently authorized pushing, tagging, and deploying this work as `book12v1`.

## Release checkpoints

Jon authorized integrating Books 6–7 into `main` and creating the new immutable `book7v1` tag. The Book 6 foundation is commit `c4a904722ae8a9e6384ed784221f3a49a72e8dbb`; Book 7 and the download script were recovered from the previous chat's recorded edits before source verification. The previous published checkpoint is `book12v1`; the current integration on `main` adds Books 13–20; `book7v1` is the previous release; `codex/book6-cloud-handoff` remains the older Book 6 checkpoint.

- Repository: https://github.com/sigfriedjk/lonewolf-action-chart
- Current integration: https://github.com/sigfriedjk/lonewolf-action-chart/tree/main
- Previous checkpoint: https://github.com/sigfriedjk/lonewolf-action-chart/tree/book12v1
- Live app: https://sigfriedjk.github.io/lonewolf-action-chart/index.html
- Production branch: `main`; GitHub Pages publishes the repository root.

Ignored Project Aon downloads, browser adventure saves, and temporary screenshots are excluded. Run `bash scripts/download-books.sh` for optional local Book 2–20 source comparisons. All fourteen suites also run without those downloads. Browser saves stay on their original origin; use app export/import to move them.

## Product constraints and accepted scope

**Current direction — 14 October 2026:** Continue development here. The initial Books 6–20 request covered review/planning; the subsequent Book 6 proposal and compact layout have now been approved and implemented locally. Read [BOOKS6-20-PLAN.md](BOOKS6-20-PLAN.md) and [BOOK6-REVIEW.md](BOOK6-REVIEW.md) for agreed decisions and the remaining scope. The product is an electronic paper Action Chart; the player interprets and enforces the rules. Prefer editable records and manual adjustments over more automation. Existing restrictions documented below describe the released Books 1–5 behavior, not requirements to extend them. Discuss further layout or major behavior changes with Jon before implementation.

This is a plain JavaScript, mobile-first Action Chart. Keep the six tabs (Stats, Kai, Backpack, Special, Combat, Journal), compact headers, and all ten Grand Master backpack rows on one page. Small phones are no longer a design requirement. Verify current phone and desktop sizes; dialogs and smaller/landscape or enlarged-text layouts may scroll to keep controls reachable.

Jon prefers no installations unless strictly required. The project has no dependencies, build step, server component, or package-manager setup. Use an existing Node runtime for preview/tests. Preserve saves and existing uncommitted work. Current instructions from Jon take precedence over these notes.

The approved Book 5 additions are implemented. Other optional proposals (alternative source-chart selector, external-food controls, and other encounter-effect controls) were explicitly set aside; Journal and manual score controls cover those needs. Do not revive them as unfinished requirements. Books 6–7 are included in `book7v1`; Books 8–12 are included in `book12v1`; Books 13–20 are included in the main integration; Book 21 is outside scope. A reader, accounts/cloud sync, and a PWA/offline cache remain outside scope.

## File map

| File | Responsibility |
| --- | --- |
| `index.html` | Static shell, responsive viewport, script order, cache-busting URLs. |
| `styles.css` | Compact phone layout, height breakpoints, inventory rows, dialogs, gestures, roll animation, reduced motion. |
| `app.js` | Rendering, dialogs, events, browser storage, Undo, import/export, navigation, UI gesture timing. |
| `campaign.js` | Pure book setup, carryover, supplies, save validation/migration, Special Item moves, Lore-circle toggles. Exposes `LWCampaign` in browser and CommonJS for tests. |
| `rules.js` | Kai/Magnakai Disciplines and weapons, Lore-circle arithmetic, combat table, CS/EP calculations, potion/food helpers and rounds. Exposes `LWRules`/CommonJS. |
| `preview.js` | Optional localhost-only static server on port 4173. Serves the five app files and local source books. Never deploy as a server. |
| `tests/` | Direct Node tests, VM browser harnesses, canonical combat-table fixture. |
| `BOOKS3-5-REVIEW.md` | Implemented behavior, source correction, verification evidence and limitations. |

Script order is rules → campaign → app. The deployed app has no network calls after loading; external book links open Project Aon. Reference books under `all-books-simple/` are ignored and must not be committed or deployed. No book narrative or illustrations are bundled.

## State, storage and compatibility

**Grand Master extension:** character version 3 / campaign version 4 / `lone-wolf-action-chart-v4`, retaining all earlier keys. Earlier chart versions and numeric values are preserved. New records: `grandMaster`, `grandMasteries`, `grandAdvances`, `grandUnarmed`, `grandFlaming`. `grandUnarmed` retains false for inherited arithmetic and true for the approved zero penalty; the explicit `crown` value adds +3 instead. Missing `grandFlaming` defaults to false. Explicit choices own calculated bonuses; they are not inferred from progression. The newest key takes precedence even if corrupt; after upgrade, Undo and older imports continue writing v4. See the reviews for new round fields and defaults. The Magnakai section below describes the earlier v3 generation.


**Magnakai extension (Books 6–7):** chart version 2 adds `magnakai`, `masteries`, `loreCircles`, `arrows`; existing `disciplines`/`mastery` record inherited Kai benefits. Earlier charts remain version 1. First use of Book 6 or 7 writes campaign version 3 to `lone-wolf-action-chart-v3`, retaining old keys. Load prefers v3 without silently falling back if corrupt. After upgrade, Undo and old imports continue writing v3. New records survive validation, reload, exports/imports, and Undo. See the review for limits and migration details. Books 6–7 entry uses player-confirmed completion without the old skill-count/EP/combat eligibility gates; selections are editable and book number grants no earned skills.

**Released Books 1–5 baseline:** `localStorage['lone-wolf-action-chart-v2']` stores `{version:2, activeBook, books}`. Each earlier chart remains `version:1` and has its own scores, current EP, gold, weapons/equipped index, backpack/Meals, carried `special`, `storedSpecial`, Disciplines/mastery, section, notes, last roll, and combat. The older `lone-wolf-action-chart-v1` key is retained for migration; do not erase it. The bullets below describe that baseline, with Magnakai exceptions described above and in the Book 6/7 reviews.

- `validateSave` accepts a legacy single chart or a campaign, returns cleaned independent objects, and rejects malformed or unsupported data. Validation must preserve all newly added fields during round trips.
- `completedBooks` records the completed source adventures in a character's carryover chain. The Discipline limit is five plus that history length; book number alone does not grant skills. Legacy continued Book 2 charts infer `[1]`. Fresh starts have no completed history.
- `startBook(book, source, options)` clones a valid source, requires a living hero with its full skill selection and no active combat, learns one new Discipline, applies this book's supplies/gifts/gold, and returns a new chart. Starting a saved chart again is an explicit replacement with Undo. Switching an existing chart grants no supplies.
- `state.equipped` is a regular weapon index, `-1` for unarmed, or `-2` for the carried Sommerswerd. It must never point to a stored item. Stored Special Items grant no CS/EP bonuses and cannot be equipped.
- `moveSpecial` is pure. Moving armour adjusts current/max EP together to preserve wounds, blocks reducing a living hero to zero, and never revives a dead hero. Returning a stored Shield/Sommerswerd is blocked if that item is already carried. Moves are unavailable during combat.
- `combat.mindblastDamage` is configured enemy EP loss per round. `round.mindblastLoss` is the portion actually charged, included within `heroLoss`. Legacy values default to zero. Mindshield blocks it; evasion still takes hero damage; instant kills and low EP cap all losses.
- `change()` in `app.js` snapshots the whole campaign, executes the mutation, persists, and rerenders. The Undo stack is session-only and capped at 30. If replacing `state`, let `persist()` update `campaign.books[activeBook]`. Notes save on input but do not create individual Undo entries.
- View/filter/page/gesture state is transient. The Special location toggle defaults to Carry after reload. Use UI actions for browser QA; avoid mutating production saves.

Exports include all book charts and safekeeping. Saves belong to the browser/origin: localhost and production are separate. Existing Books 1/2 saves migrate on the same production URL. Old application releases cannot read newer Books 3–5 saves; export before testing a rollback, and never treat a fallback starter chart as a successful migration.

## Rules worth preserving

Two regular weapons; eight backpack slots for Books 1–12 and ten for Grand Master charts, including every Meal/potion dose. `/50` is a gold reference, while totals above 50 are deliberately supported. The Special Item limit of 100 combined carried/stored records is a software safeguard, not a game slot limit.

Sommerswerd adds 8 CS when equipped, applicable sword Weaponskill adds 2, and undead enemy EP losses double. The shield adds 2 CS while carried. Unarmed subtracts 4. Mindblast adds 2 CS unless the enemy is immune; incoming Mindblast is a separate EP-per-round field and Mindshield blocks it.

Book 3 Hunting never provides free Meals in Kalte. Sledge food remains section-directed and is not an implicit backpack item. Book 4/5 Hunting exceptions use the existing Meal required action. Healing is manually applied once per noncombat section. Ordinary Healing Potion/Laumspur restores 4 EP; special/concentrated potions and one-off section losses stay manual.

The shared table is verified against the local books. The downloaded simple Book 5 prints `8/4` at roll 8, ratio −10/−9; the current official table image shows `5/4`. Keep the documented correction and its explicit source-test handling. Some source tables print roll zero last: compare by roll label, not row order.

## Run and verify

Node 24 was used for release verification. No `npm install` is necessary.

```text
node preview.js
# Open http://127.0.0.1:4173/ ; Ctrl+C stops the preview.

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

All tests run from a normal clone without the ignored book downloads: rules tests use the tracked Book 1 fixture. Additional comparisons against local Book 2–20 XHTML run only when those sources exist. This optional source verification was performed for this release; its absence in another clone does not mean it was performed there.

Historical Book 12 browser smoke checks: 390×844, 375×667, 320×568; all six tabs; carried/stored pagination; full supply submission and capacity errors; armour/Sommerswerd moves; protected/unprotected Mindblast with fixed rolls; Undo; reload; export/import. Setup/history dialogs may scroll vertically. Physical-phone testing and arbitrary enlarged accessibility text were not part of release verification.

## Publishing and continuing

Only the five app assets (`index.html`, `styles.css`, `rules.js`, `campaign.js`, `app.js`) are required to run. Pages currently serves `main` at root; `.nojekyll` is tracked. Update query versions in `index.html` when changing browser assets to prevent stale script/style combinations on phones.

For an authorized release: verify clean/understood worktree and remote head, run the checks, commit source/tests/docs, publish to `main`, wait for the Pages workflow success for that exact commit, and verify the live UI. Create the requested immutable tag/release at that commit and verify its SHA. Never move an existing release tag. Tag history is listed in README.

GitHub connector tools were used to publish Git objects/ref updates; the signed-in GitHub Releases page supplied tag/release creation. `gh` was unavailable and was not installed. Future developers may use their configured Git credentials/CLI instead. If connector publishing is used, include new documentation and tests, use a base tree, and check the branch's expected SHA before updating. Sync the local checkout without discarding unrelated work.

No unfinished approved feature remains at `book12v1`. Book 6 follows the approved discussion; see [BOOK6-REVIEW.md](BOOK6-REVIEW.md). The remaining roadmap is [BOOKS6-20-PLAN.md](BOOKS6-20-PLAN.md). Book 7 now has its own audit and verification in [BOOK7-REVIEW.md](BOOK7-REVIEW.md). The approved Book 13 transition and one-page ten-slot backpack are implemented. All individual audits and approved implementation through Book 20 are complete. Keep Book 21 out of this scope; publication of this integration is authorized by Jon's latest request. Do not extrapolate higher-rank powers from the Book 6 selection counts. For future fixes, add focused tests for changed state transitions and verify affected phone layouts. Keep documentation clear about local implementation versus published release.

## Books 13–20 final local verification — 16 October 2026

All fourteen Node suites passed with local Book 2–20 comparisons, and again in a temporary copy containing no downloaded books. All three JavaScript syntax checks, download-script shell syntax, and `git diff --check` passed. Each Grand Master book's 130 combat-table cells matches the shared table; the Book 5 correction remains unchanged.

Real Chromium checks passed for every new book at 390×844, 430×932, and 1280×900 on the final app assets. They covered fresh and continued entry, each full supply form, independent charts, retained wounds/benefits, the one-page ten-slot backpack, all six tabs, dialog scrolling, combat and new costs/effects, reload, actual export/import, replacement/Undo, all twenty charts together, and invalid-import protection. Normal checked pages fit; no browser errors occurred. Small-phone and physical-phone testing were not performed. Live verification is deferred by request.

At that pre-publication checkpoint, no push, tag, deployment, or release had been performed. HEAD and `book12v1` were `84b9fe66e1b660483097fe064018f4b1cc6429cd`; new source/tests/docs were uncommitted local work. Downloads, browser saves, screenshots, and temporary scripts are not tracked. No unfinished approved feature remains within Books 13–20; Book 21 was not started.

## Books 1–20 publication preparation — 16 October 2026

Jon subsequently requested merging and deploying the completed work. Publication checks passed again: all fourteen Node suites with local Book 2–20 comparisons, three JavaScript syntax checks, download-script shell syntax, and whitespace checks. The app assets are unchanged from the final browser verification above. Publication documentation now identifies Books 1–20 on `main`, retaining `book12v1` as the previous immutable checkpoint. Only source, tests, and documentation are included; reference books and temporary artifacts remain excluded.

GitHub Pages uses the existing dynamic `pages build and deployment` workflow from `main`. Confirm its success for the exact integration commit, not merely the latest visible workflow. The environment still omits the live-site host from its allowlist; direct live-site verification remains deferred at Jon's request.
