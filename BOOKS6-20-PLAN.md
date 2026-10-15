# Books 6–20 completion plan

Planning review: 14 October 2026. Release checkpoint: Books 1–7 (`book7v1`, 15 October 2026). Book 6 and then Book 7 were approved and implemented. This plan covers Lone Wolf's original Books 1–20 arc; Books 21 onward are outside this scope. The initial documentation task did not authorize implementation/release; the later approval covered Book 6 implementation. The 15 October request subsequently authorized Book 7, included in the authorized `book7v1` integration; see [BOOK7-REVIEW.md](BOOK7-REVIEW.md).

## Product direction

An electronic paper Action Chart: simple, helpful, and controlled by the player. The player reads the adventure, interprets its instructions, and enforces its rules. The app records choices and can help with arithmetic; it should not become a computer game or decide what the player is allowed to do.

- Prefer editable records, brief reference guidance, existing score controls, and Journal over additional automated systems.
- Do not infer encounters, elapsed time, section effects, completion, healing, meals, or skill use from a bookmark change.
- Do not add eligibility gates, mandatory rule checks, automatic item removal, or irreversible progression as part of new book support. Book number alone must not award earned skills; distinguish printed series-entry assumptions from completed-adventure history and let the player confirm their record.
- Preserve independent charts, browser saves, migration, export/import, safekeeping, and Undo. Copying into another book must not alter the source chart.
- Retain the six-tab mobile-first shell and compact headers. More books should not mean more permanent controls on every page.
- Keep plain HTML/CSS/JavaScript, no dependencies or build step. A reader, quest engine, spell simulator, accounts, cloud sync, and PWA are outside scope. Previously set-aside source selection, external-food, and extra encounter-effect controls remain set aside.

## Review of the existing app

The separation is useful: `rules.js` contains arithmetic, `campaign.js` owns setup and save validation, and `app.js` handles the browser/UI. Existing manual scores, custom Special Items, notes, fixed/random rolls, and campaign-wide Undo provide a strong base.

The current implementation is more restrictive than the new product direction. These are existing behaviors, not new requirements:

| Area | Current behavior | Planning decision |
| --- | --- | --- |
| Inventory | Two weapons/eight backpack entries are hard limits in setup, UI, and save validation. | Discuss reference counts versus enforcement; Book 13 also needs ten backpack entries. Never loosen only the UI while imports still reject the resulting chart. |
| Progression | Kai-only skill list, `5 + completedBooks.length`, one mastered weapon; carryover requires full skill selection, positive EP, and no active combat. | Separate series records and player-confirmed history. Discuss relaxation of existing gates before changing their behavior. |
| Combat/actions | Automatic bonuses, damage, and defeat; meals, potions, and storage have combat/death restrictions. | Preserve current behavior during this planning task; review which helpers remain useful and how the player corrects their result. No expansion into a rules referee. |
| Editing | Score editing exists, but EP is capped; skill selections and inventory are constrained. | Do not describe the current app as fully unrestricted. Any broad removal of restrictions is a major behavior change to discuss. |
| Saves | Validation recognizes only Books 1–5 and strips unknown character fields through a fixed whitelist. | New records must survive load, validation, export/import, copying, and Undo; adding fields only to rendering will lose data. |
| Navigation | Book menu and setup are driven partly by metadata; skill text, quick rules, slots, and combat labels still assume Kai rules. | Audit these together rather than simply adding fifteen book titles. |

Keep structural validation (valid JSON, supported versions, safe text/numbers, coherent references, reasonable resource limits) distinct from game legality. Preserve safeguards against corruption and accidental replacement. A player-entered exception is not inherently a corrupt save.

## Source review and remaining research

All fifteen local Project Aon source files are available under ignored `all-books-simple/en/xhtml-simple/lw/`. This review checked their titles/series headings and sampled Book 6 and Book 13 rules, Disciplines, and equipment. It is not a completed rules audit of all fifteen books.

Book 6 introduces Magnakai selections, multiple weapon masteries, Lore-circles, Bow/quiver records, and psychic abilities with costs. Its entry text describes prior Kai mastery separately from newly selected Magnakai skills. Book 13 introduces Grand Master selections and entry scores, inherited ability/bonus questions, ten backpack spaces, and guidance restricting Special Item carryover. These are reasons for explicit transition design, not permission to impose automatic grants or discard items.

Before implementing each book, inspect its Game Rules, Disciplines, Equipment, training levels/improved abilities, combat table, Action Chart, and editorial footnotes. Record exact local file/anchor references, fresh versus continued setup, section bounds, supplies, quantities, and any differences from the previous book. Consult the official Project Aon edition if sources conflict. Summarize only chart-relevant rules; do not copy narrative, illustrations, or bulk source text into tracked files.

## Discussion checkpoints

Pause for Jon's response **before implementing any layout change or major feature/behavior change**. This applies throughout the project, not just at series boundaries. Research and prepare a concrete, concise proposal first: the problem, the smallest option, a sketch/example if useful, save implications, and what can remain manual. Record the agreed decision here. Silence is not approval; continue only independent research/documentation while waiting.

Initial decisions to bring to Jon, after focused research:

1. How to ease existing rule enforcement while preserving useful arithmetic and safe saves. Recommend editable records and reference guidance; do not introduce a second strict/free-play mode by default.
2. How Magnakai and inherited skills, multiple masteries, rank, and Lore-circle information fit in the current Discipline tab/dialogs. Even a tab rename or rearrangement should be discussed.
3. Whether arrows, psychic costs, and limited-use abilities need dedicated fields at all. Start with ordinary item descriptions, Journal, and manual adjustments; do not add automatic combat modes, cooldowns, or an archery simulator without agreement.
4. Before Book 13, how to show ten backpack slots within the phone layout and record Grand Master/inherited abilities without double-counting bonuses. Present carryover restrictions as guidance for player choice, not silent deletions.

The initial review left all four decisions pending. The subsequent Book 6 discussion resolved the following scope; the Grand Master transition remains pending.

### Book 6 decisions agreed 14 October 2026

Jon approved the concrete Book 6 implementation proposal, then approved the compact layout for the requested additions. See [BOOK6-REVIEW.md](BOOK6-REVIEW.md) for implementation, source anchors, and verification.

- Keep the six tabs and Kai navigation label. Use the Discipline grid for ten Magnakai choices; Mastery holds multiple weapon masteries, inherited Kai skills, and reference guidance. Three initial skills/masteries and Kai Master Superior are guidance. Counts do not lock Book 6 choices.
- Continued Book 6 setup uses explicit completion confirmation without the existing full-skill/positive-EP/inactive-combat gates. Copy the earlier chart independently without healing wounds. An optional all-five confirmation records the full Kai history and all ten basic skills; no skill is awarded by book number alone. Inherited benefits are editable.
- Retain the current inventory limits for this step. Broad relaxation of Books 1–5 enforcement remains a separate discussion.
- Four Lore-circle checkboxes occupy a 2×2 block below the Discipline grid. Highlight and Ready text identify satisfied skill requirements; checks stay player-controlled. Checked circles own the automatic CS/EP bonuses. Toggling preserves wounds and does not revive a dead hero. This supersedes the proposed manual Extra CS/EP entry for Lore-circles.
- Arrows are an editable Stats total sharing the left resource card with Gold; both open direct-edit/−/+ dialogs. Meals stays beside them. A starting Quiver adds six arrows once. No shot simulation or automatic arrow spending. This supersedes using the quiver description as the arrow counter.
- Psi-surge, Healing/Curing, shot modifiers, unusual encounters, and section effects stay manual with explicit guidance. Overlapping Kai/Magnakai mastery bonuses do not stack.
- Book 6 uses a version 2 character inside a version 3 campaign stored under a new v3 key, retaining prior storage. All new records round-trip; old charts keep their values and version 1 structure. Publishing/tagging is not authorized by this approval.

## Delivery sequence

### 1. Establish the shared foundation with Book 6

Audit Book 6 and prepare the first discussion proposals. After agreement, extend book/series metadata and the save model minimally: separate skill tiers and mastery records, explicit player-confirmed progression, and only approved additional chart fields. Decide migration/versioning before writing new saves. Preserve existing Books 1–5 values; never reroll or recompute old characters on load.

Implement and verify one complete Book 6 flow: fresh setup, continuation, manual edits, switching, reload, export/import, and Undo. Identify the owner of each bonus (base score, entered adjustment, item, or approved calculated helper) so it cannot be applied twice. Treat manual handling of a section exception as a supported workflow, not an unfinished automation feature.

### 2. Extend Magnakai support through Book 12

Proceed in order, with small reviewable changes per book. Suggested review batches: 7–8, 9–10, 11–12. Research setup and training changes individually; do not assume later books share Book 6 supplies, entry counts, or bonuses. Stop for discussion whenever a difference would require layout or major feature changes.

### 3. Establish the Grand Master transition with Book 13

Research fresh and continued entry separately, including source footnotes and inherited bonuses. Discuss the ten-slot layout and skill presentation before implementation. Preserve source inventories/safekeeping and let the player decide what carries forward. Avoid duplicating lower-tier bonuses in the new totals. Verify Book 12 → 13 and earlier eligible/manual histories explicitly rather than extrapolating Kai progression.

### 4. Extend Grand Master support through Book 20

Suggested review batches: 14–16, 17–18, 19–20, implemented and checked one book at a time. Keep unusual adventure effects in notes/manual scores unless Jon agrees that a reusable chart control is necessary. Review Book 20 as the end of this scope, without adding a new campaign engine or extending into the New Order series.

## Book checklist

Books 6–7 have completed focused audits and local implementations, documented in their reviews. All other rows remain **planned; detailed source audit and implementation pending**. Each needs the same source/setup/save/manual-use checks above, not merely a menu entry.

| Book | Title | Local source | Milestone |
| --- | --- | --- | --- |
| 6 | The Kingdoms of Terror | `06tkot.htm` | Audited and implemented; approved Magnakai foundation; book7v1 |
| 7 | Castle Death | `07cd.htm` | Audited and implemented; Magnakai continuation and manual Primate guidance; book7v1 |
| 8 | The Jungle of Horrors | `08tjoh.htm` | Magnakai continuation |
| 9 | The Cauldron of Fear | `09tcof.htm` | Magnakai continuation |
| 10 | The Dungeons of Torgar | `10tdot.htm` | Magnakai continuation |
| 11 | The Prisoners of Time | `11tpot.htm` | Magnakai continuation |
| 12 | The Masters of Darkness | `12tmod.htm` | Magnakai completion and transition audit |
| 13 | The Plague Lords of Ruel | `13tplor.htm` | Grand Master foundation and discussion checkpoint |
| 14 | The Captives of Kaag | `14tcok.htm` | Grand Master continuation |
| 15 | The Darke Crusade | `15tdc.htm` | Grand Master continuation |
| 16 | The Legacy of Vashna | `16tlov.htm` | Grand Master continuation |
| 17 | The Deathlord of Ixia | `17tdoi.htm` | Grand Master continuation |
| 18 | Dawn of the Dragons | `18dotd.htm` | Grand Master continuation |
| 19 | Wolf's Bane | `19wb.htm` | Grand Master continuation |
| 20 | The Curse of Naar | `20tcon.htm` | Final Books 1–20 regression review |

## Completion and verification

For each book, confirm accurate title/link/section range, source-checked setup guidance, appropriate editable skill/equipment records, and a clear manual path for exceptions. Verify fresh and continued characters, skipped adventures, no book-number-only awards, no duplicate grants on reopening, and independent charts. Any intentional series-entry defaults must be documented and player-confirmed.

Test legacy saves and new records through validation, reload, export/import, and Undo. Check wounds and bonuses at transitions, carried/stored equipment, and approved changes to game-limit validation. Invalid/corrupt imports must not replace a good campaign. Include all twenty charts in final persistence tests.

Run focused automated tests for changed calculations and state transitions. Before any authorized release, run all five existing Node suites, any added suites, three JavaScript syntax checks, and `git diff --check` as listed in HANDOFF. Tests must remain useful without ignored downloads; report optional local-source comparisons separately.

Check affected screens at 390×844, 375×667, and 320×568 using real UI actions. Verify six-tab navigation, setup dialogs, skill/mastery editing, full inventories, combat, switching, and Undo. Normal portrait pages should fit; dialogs can scroll. Do not call browser QA or physical-phone testing complete unless performed.

Update README, HANDOFF, and this checklist with actual supported behavior and remaining decisions. Update asset query versions only when browser assets change. Publish/tag only on explicit release authorization, following HANDOFF; do not rewrite existing tags.

## Baseline verification for this planning review

On 14 October 2026, all five current Node suites and syntax checks for `app.js`, `campaign.js`, and `rules.js` passed using existing Node 24.19.0. Optional local Book 2–5 source comparisons ran and passed. No browser/physical-phone review was performed for this documentation-only task. No runtime behavior changed.
