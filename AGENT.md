# Guidance for future agents

Read [README.md](README.md) for product direction and [DEVELOPMENT.md](DEVELOPMENT.md) before changing rules, setup, saves, or deployment. [CHANGELOG.md](CHANGELOG.md) records released behavior. Keep durable instructions in these documents rather than adding review, plan, or handoff files. The user requested this singular `AGENT.md` filename.

## Working agreement

- Follow the current user's scope and preferences. Discuss a concrete proposal with Jon before implementing a new layout or major feature/behavior change unless that change is already authorized in the current session. These notes are not an additional approval gate for routine work.
- The product is an electronic paper Action Chart. Prefer editable records, useful arithmetic, brief guidance, and Journal over expanded rule enforcement. Do not infer section effects, healing, skill use, time, item losses, or completion from a bookmark or book number.
- Books 1–20 are implemented. Book 21 onward needs its own scope. The alternative source-chart selector, external-food controls, and extra encounter-effect controls were set aside; they are not unfinished approved work.
- Preserve the six tabs and compact headers. The approved Grand Master layout keeps all ten backpack rows on one page. Small-phone fit is no longer required; test current phones and desktops, and allow smaller screens/dialogs to scroll.
- Keep plain HTML/CSS/JavaScript, with no dependencies or build step. Reuse available Node/browser tools; avoid installations unless required. Keep pure arithmetic in `rules.js`, setup/validation in `campaign.js`, and browser behavior in `app.js`.

## Protect existing records

- Preserve independent charts, wounds, safekeeping, migration, export/import, and Undo. Copying must not mutate a source chart or grant supplies again when reopening an existing chart.
- Never infer earned skills, mastery improvements, checked Lore-circles, applied Grand Master advances, or special psychic attacks from book/rank/skill counts. Keep inherited training separate. Each bonus has one owner; replacement bonuses do not stack.
- Retain old storage keys and chart versions. After a storage upgrade, Undo and old imports must still write the newest active key. Corruption must not silently restore stale progress. Validate every new field through loading, carryover, export/import, and Undo.
- Existing inventory and early-book progression restrictions are current behavior, not requirements to expand enforcement. Discuss broad changes; keep UI, setup, and import validation consistent.
- Preserve unrelated workspace changes. Read the actual repository/remote head before describing supported behavior; an attached checkout can lag the deployed site.

## Verification and delivery

Check new book rules against that book's Project Aon sources and footnotes. Keep downloads, narrative, illustrations, adventure backups, credentials, screenshots, and temporary browser scripts out of commits and deployment.

Run affected tests while developing. Before an authorized release, run all fourteen Node suites, three app syntax checks, shell syntax, and `git diff --check` using [DEVELOPMENT.md](DEVELOPMENT.md#automated-checks). Verify changed UI with real actions at current phone and desktop sizes. State separately whether source comparisons, live browser checks, or physical-device checks actually ran.

Update asset query versions in `index.html` when browser assets change. Keep README product-focused and maintain the other three documents as needed. Publish/tag only when the current request/session authorizes it; historical release approvals are not standing authorization for future releases. Never move an existing tag.
