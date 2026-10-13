# Working on Lone Wolf Action Chart

Read `HANDOFF.md`, `README.md`, and `BOOKS3-5-REVIEW.md` before changing book/rule/save behavior. Follow the current user's scope and preferences; these instructions are not a separate approval gate.

- Keep the app plain HTML/CSS/JavaScript with no build step or dependencies. Reuse an available Node runtime; avoid installing software unless required.
- Preserve browser saves, migration, independent book charts, safekeeping, and Undo. Book number alone must not grant Disciplines.
- Preserve the six-tab mobile-first layout and compact headers. Test affected screens at 390×844, 375×667, and 320×568. Dialogs may scroll; normal portrait pages should fit.
- Verify new book rules against Project Aon, preferably the ignored local XHTML sources. Do not commit or deploy book downloads, narrative text, illustrations, adventure backups, credentials, or temporary test artifacts.
- Put pure rules/setup/validation in `rules.js`/`campaign.js`; keep rendering and browser events in `app.js`. Update asset query versions in `index.html` when browser assets change.
- Run the relevant tests, and before release run all five Node suites and three JavaScript syntax checks listed in `HANDOFF.md`, plus `git diff --check`.
- Keep handoff/docs accurate. The alternative source selector, external-food controls, and extra encounter-effect controls were set aside by Jon; they are not pending approved work.
- Preserve existing work. Publish/tag when authorized by the current request/session; do not infer a release from unrelated changes, and do not rewrite existing tags.
