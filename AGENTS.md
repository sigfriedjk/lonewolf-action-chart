# Working on Lone Wolf Action Chart

Read `HANDOFF.md`, `README.md`, and `BOOKS3-5-REVIEW.md` before changing book/rule/save behavior. Follow the current user's scope and preferences; these instructions are not a separate approval gate.

Read `BOOKS6-20-PLAN.md` before later-book work and `BOOK6-REVIEW.md` for the approved Book 6 implementation. The goal is an electronic paper Action Chart: the player interprets and enforces rules. Prefer editable records, simple arithmetic, and manual adjustments; do not expand rule enforcement or build a game engine. Per Jon's request, pause to discuss a concrete proposal before implementing any layout change or major feature/behavior change. Existing restrictions are current behavior to review, not a requirement to replicate them. The initial October 14 request covered review/docs/planning; subsequent approval authorized the Book 6 implementation and compact Lore-circle/arrow layout. The October 15 request authorizes committing/pushing the cloud handoff branch, not deploying main or creating a release. Books 7 onward and release work need their own scope.

- Keep the app plain HTML/CSS/JavaScript with no build step or dependencies. Reuse an available Node runtime; avoid installing software unless required.
- Preserve browser saves, migration, independent book charts, safekeeping, and Undo. Book number alone must not grant Disciplines.
- Preserve the six-tab mobile-first layout and compact headers. Test affected screens at 390×844, 375×667, and 320×568. Dialogs may scroll; normal portrait pages should fit.
- Verify new book rules against Project Aon, preferably the ignored local XHTML sources. Do not commit or deploy book downloads, narrative text, illustrations, adventure backups, credentials, or temporary test artifacts.
- Put pure rules/setup/validation in `rules.js`/`campaign.js`; keep rendering and browser events in `app.js`. Update asset query versions in `index.html` when browser assets change.
- Run the relevant tests, and before release run all five Node suites and three JavaScript syntax checks listed in `HANDOFF.md`, plus `git diff --check`.
- Keep handoff/docs accurate. The alternative source selector, external-food controls, and extra encounter-effect controls were set aside by Jon; they are not pending approved work.
- Preserve existing work. Publish/tag when authorized by the current request/session; do not infer a release from unrelated changes, and do not rewrite existing tags.
