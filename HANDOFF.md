# Developer handoff — Book 6 local implementation

Start with this file, [README.md](README.md), and [BOOKS3-5-REVIEW.md](BOOKS3-5-REVIEW.md). The release supports Lone Wolf Books 1–5, including full starting supplies for Books 4/5, Special Item safekeeping, and enemy Mindblast damage. Release date: 13 October 2026.

**Current development work:** Jon approved implementing Book 6, plus four manually checked Lore-circle bonuses with readiness highlighting and an editable arrow total beside Gold. The compact layout was explicitly approved. The implementation is unreleased; the published checkpoint below remains `book5v1`. Read [BOOK6-REVIEW.md](BOOK6-REVIEW.md) for actual behavior, exact source anchors, save migration, and verification. Books 7 onward and release/publishing still require their own scope.

## Cloud-machine handoff — 15 October 2026

Jon requested committing and pushing all current development, including plans, for continuation on a cloud machine. The handoff branch is **`codex/book6-cloud-handoff`**, based on `main` at `12c2297f9d1da30859dad99396ed725a423a85a6`. Use this branch rather than `main` to obtain Book 6 and the plans. Main publishes automatically to GitHub Pages and was deliberately left unchanged; no new release tag was created.

```text
git clone --branch codex/book6-cloud-handoff https://github.com/sigfriedjk/lonewolf-action-chart.git
cd lonewolf-action-chart
```

Read this handoff, README, BOOKS3-5-REVIEW, BOOK6-REVIEW, and BOOKS6-20-PLAN. All code, six test suites, planning/review documents, and AGENTS instructions are in Git. Use an available Node runtime; no dependency installation or build is required. The six Node suites, three syntax checks, and whitespace checks passed again on 15 October. Browser QA evidence below/in the Book 6 review belongs to the earlier local session; it was not repeated for this handoff.

Ignored Project Aon book downloads, browser adventure saves, and temporary screenshots are not part of the repository. Tests run without the downloads, with source comparisons explicitly optional. Browser saves stay on their original browser/origin; export/import through the app if a playthrough must move to another origin or machine. No credentials or adventure backups belong in Git.

- Repository: https://github.com/sigfriedjk/lonewolf-action-chart
- Release checkpoint: https://github.com/sigfriedjk/lonewolf-action-chart/releases/tag/book5v1
- Live app: https://sigfriedjk.github.io/lonewolf-action-chart/index.html
- Production branch: `main`; GitHub Pages publishes the repository root.

## Product constraints and accepted scope

**Current direction — 14 October 2026:** Continue development here. The initial Books 6–20 request covered review/planning; the subsequent Book 6 proposal and compact layout have now been approved and implemented locally. Read [BOOKS6-20-PLAN.md](BOOKS6-20-PLAN.md) and [BOOK6-REVIEW.md](BOOK6-REVIEW.md) for agreed decisions and the remaining scope. The product is an electronic paper Action Chart; the player interprets and enforces the rules. Prefer editable records and manual adjustments over more automation. Existing restrictions documented below describe the released Books 1–5 behavior, not requirements to extend them. Discuss further layout or major behavior changes with Jon before implementation.

This is a plain JavaScript, mobile-first Action Chart. Keep the six tabs (Stats, Kai, Backpack, Special, Combat, Journal), compact headers, and ordinary portrait layouts that fit without page scrolling. Dialogs and unusually small/landscape or enlarged-text layouts may scroll to keep controls reachable.

Jon prefers no installations unless strictly required. The project has no dependencies, build step, server component, or package-manager setup. Use an existing Node runtime for preview/tests. Preserve saves and existing uncommitted work. Current instructions from Jon take precedence over these notes.

The approved Book 5 additions are implemented. Other optional proposals (alternative source-chart selector, external-food controls, and other encounter-effect controls) were explicitly set aside; Journal and manual score controls cover those needs. Do not revive them as unfinished requirements. Book 6 is local work awaiting release authorization; Books 7 onward, a reader, accounts/cloud sync, and a PWA/offline cache are outside the current implementation.

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

**Book 6 extension:** chart version 2 adds `magnakai`, `masteries`, `loreCircles`, `arrows`; existing `disciplines`/`mastery` record inherited Kai benefits. Earlier charts remain version 1. First use of Book 6 writes campaign version 3 to `lone-wolf-action-chart-v3`, retaining old keys. Load prefers v3 without silently falling back if corrupt. After upgrade, Undo and old imports continue writing v3. New records survive validation, reload, exports/imports, and Undo. See the review for limits and migration details. Book 6 entry uses player-confirmed completion without the old skill-count/EP/combat eligibility gates; selections are editable and book number grants no earned skills.

**Released Books 1–5 baseline:** `localStorage['lone-wolf-action-chart-v2']` stores `{version:2, activeBook, books}`. Each earlier chart remains `version:1` and has its own scores, current EP, gold, weapons/equipped index, backpack/Meals, carried `special`, `storedSpecial`, Disciplines/mastery, section, notes, last roll, and combat. The older `lone-wolf-action-chart-v1` key is retained for migration; do not erase it. The bullets below describe that baseline, with Book 6's exceptions described above and in its review.

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

Two regular weapons, eight backpack slots including every Meal/potion dose. `/50` is a gold reference, while totals above 50 are deliberately supported. The Special Item limit of 100 combined carried/stored records is a software safeguard, not a game slot limit.

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
git diff --check
```

All tests run from a normal clone without the ignored book downloads: rules tests use the tracked Book 1 fixture. Additional comparisons against local Book 2–5 XHTML run only when those sources exist. This optional source verification was performed for this release; its absence in another clone does not mean it was performed there.

Browser smoke checks: 390×844, 375×667, 320×568; all six tabs; carried/stored pagination; full supply submission and capacity errors; armour/Sommerswerd moves; protected/unprotected Mindblast with fixed rolls; Undo; reload; export/import. Setup/history dialogs may scroll vertically. Physical-phone testing and arbitrary enlarged accessibility text were not part of release verification.

## Publishing and continuing

Only the five app assets (`index.html`, `styles.css`, `rules.js`, `campaign.js`, `app.js`) are required to run. Pages currently serves `main` at root; `.nojekyll` is tracked. Update query versions in `index.html` when changing browser assets to prevent stale script/style combinations on phones.

For an authorized release: verify clean/understood worktree and remote head, run the checks, commit source/tests/docs, publish to `main`, wait for the Pages workflow success for that exact commit, and verify the live UI. Create the requested immutable tag/release at that commit and verify its SHA. Never move an existing release tag. Tag history is listed in README.

GitHub connector tools were used to publish Git objects/ref updates; the signed-in GitHub Releases page supplied tag/release creation. `gh` was unavailable and was not installed. Future developers may use their configured Git credentials/CLI instead. If connector publishing is used, include new documentation and tests, use a base tree, and check the branch's expected SHA before updating. Sync the local checkout without discarding unrelated work.

No unfinished approved feature remains at `book5v1`. Book 6 is implemented locally following the approved discussion; see [BOOK6-REVIEW.md](BOOK6-REVIEW.md). The remaining roadmap is [BOOKS6-20-PLAN.md](BOOKS6-20-PLAN.md). Before Book 7, audit its setup/training/progression individually and discuss differences that change layout or major behavior. Do not extrapolate higher-rank powers from the Book 6 selection counts. For future fixes, add focused tests for changed state transitions and verify affected phone layouts. Keep documentation clear about local implementation versus published release.
