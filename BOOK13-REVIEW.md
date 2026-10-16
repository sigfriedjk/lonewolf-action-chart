# Book 13 research — 16 October 2026

**Status: approved and implemented for the Books 1–20 integration.** The current request authorizes development through Book 20, with discussion before layout or major behavior changes. Jon subsequently requested merging and deploying the completed work. The previous immutable checkpoint is Book 12; this review records the Grand Master foundation and its pre-publication verification.

## Baseline and environment

The initial clean checkout was on `work` at the Book 7 release. Fetched `origin/main` and tags, switched to `main`, and verified both `main` and `book12v1` resolve to `84b9fe66e1b660483097fe064018f4b1cc6429cd`. No pre-existing workspace edits were present.

The published environment policy and executor snapshot allowed Project Aon but omitted `sigfriedjk.github.io`. Network-enabled execution downloaded the archive successfully through the configured proxy; archive integrity passed. A direct request to the live app returned HTTP 403. Jon subsequently deferred live verification. Local tests do not establish live-site behavior.

All nine existing Node suites passed with local Book 2–12 source comparisons. All three JavaScript syntax checks, download-script shell syntax, and `git diff --check` passed. Those checks preceded implementation. Subsequent Book 13 browser verification is recorded below.

## Book 13 source findings

Source: ignored `all-books-simple/en/xhtml-simple/lw/13tplor.htm`, SHA-256 `916f5a8da36051055d7b5ec25b509d22470a129702cc7bed217e31500ea8ae42`. The archive is reference material only; no narrative or illustrations are added to the app.

- `#gamerulz`: fresh CS 25–34, EP 30–39. Continued characters may retain their scores and earned benefits. Two weapons and ten Backpack Items including Meals. The footnote `#gamerulz-1-foot` says Discipline bonuses do not alter permanent scores; retain their separate owners.
- `#gamerulz`: Special Item carryover list is Crystal Star Pendant, Sommerswerd, Silver Helm, Dagger of Vashna, Silver Bracers, Jewelled Mace, Silver Bow of Duadon, Helshezag, Kagonite Chainmail, Korlinium Scabbard. This is player guidance, not authority for automatic disposal or storage.
- `#mksumary`, `#discplnz`: the narrative assumes all basic Kai/Magnakai training, including no unarmed CS penalty. Tangible inherited benefits and incomplete histories need explicit player review; do not automatically grant them to a fresh character or infer them from Book 13.
- `#discplnz`, `#wpnmstry`: four initial Grand Master Disciplines; Grand Weaponmastery starts with two weapon types, with another for each completed Grand Master adventure. Melee +5; Bow rolls +5. `#discplnz-1-foot` explicitly replaces lower mastery bonuses and excludes stacking Mentora +2 with Grand Bow +5.
- `#deliver`: Deliverance restores 20 EP when reduced to 8 EP or less in combat, once every 20 days. Player-triggered action can reuse capped recovery; no elapsed-time simulation is needed.
- `#kaisurge`: Kai-surge +8 CS costs 1 EP per used round, unavailable at 6 EP or less; weaker Mindblast +4 costs no EP. These replace other psychic attacks.
- `#hntmstry`, `#howuse`: Grand Huntmastery removes ordinary Meal use; unusual section instructions stay player-directed.
- `#discplnz`: each Grand Master Discipline beyond the original four permits +1 basic CS and +2 basic EP. This requires an explicit applied record, independent of selected-skill count and book number, rather than automatic progression or repeated manual additions.
- `#equipmnt`–`#howuse`: five optional distinct choices: Sword, Bow, Quiver (six arrows), Axe, four Meals, Rope, one Laumspur dose (4 EP), Spear, Dagger. Add Map of the Dark Realm of Ruel and 20–29 Crowns once. Rope/potion/each Meal use backpack spaces. Twelve Special Items and fifty Crowns remain reference limits managed by the player.
- `#levels`, `#imprvdsc`: initial reference rank Kai Grand Defender. Later improvements are explained in subsequent books; no rank-based effects are awarded here.
- `#action`, `#cmbtrulz`, `#crtable`, `#footnotz`: 350 numbered sections; all 130 combat-table cells match the existing shared table by roll label. No new table discrepancy was found. Chart-relevant footnotes are the two inheritance/mastery clarifications above; other footnotes concern section riddles.

Official handbook pages also reviewed: [Grand Master rules](https://www.projectaon.org/en/ReadersHandbook/GrandMaster), [Disciplines](https://www.projectaon.org/en/ReadersHandbook/GrandMasterDisciplines), [training](https://www.projectaon.org/en/ReadersHandbook/GrandMasterTraining), and [equipment](https://www.projectaon.org/en/ReadersHandbook/GrandMasterEquipment). The generic equipment page differs from this book; use Book 13's actual five choices and 20–29 Crowns. The handbook describes several optional approaches to rerolling continued scores, without choosing one universally. Proposed default is to preserve continued scores/wounds and use existing score editing for a player-chosen alternative. It also explicitly leaves incomplete inherited training to player judgment.

## Approved transition — implemented

Keep six tabs. On Grand Master charts, the existing Kai tab shows twelve Grand Master choices with four initially recommended; Mastery holds separate Grand/inherited masteries, inherited skills, and the four existing player-controlled Lore-circle checks. Continued charts copy actual earlier records; fresh charts start without inherited numeric benefits. Offer explicit confirmation for a completed Magnakai training record; never infer completion from the source book number.

Jon approved the transition except backpack pagination: all ten rows remain on one page. Meals/doses still count individually. Small phones are no longer a design requirement; smaller viewports can scroll.

Add explicit choices to existing dialogs: Grand weapon types (+5 replacing lower mastery), Grand Master unarmed training (zero penalty, selected by the player; later extended with Grand Crown +3), Kai-surge/Mindblast (+8/1 EP or +4/0), Grand Bow +5 replacing lower Bow/Mentora bonuses, and Deliverance's Restore 20 EP action. Add an editable applied-advance count, initially zero, owning +1 CS/+2 maximum EP per advance. Changes preserve wounds. The player chooses eligibility and records time limits.

Bonus ownership: base scores remain base scores; manual Extra CS/EP remain manual; checked Lore-circles own their existing bonuses; applied Grand Master advances own progression bonuses; carried items own equipment bonuses; one applicable mastery and one selected psychic attack supply their respective bonuses. No reinterpretation or healing on load. New records must survive independent carryover, validation, reload, export/import, and Undo while retaining the older stored snapshot.

Book 13 is implemented. Subsequent individual audits and implementation are recorded in [BOOKS14-20-REVIEW.md](BOOKS14-20-REVIEW.md). Book 21 remains outside scope.

## Save records and verification

Grand Master charts use character version 3 in campaign version 4. The first write with one of these charts uses `lone-wolf-action-chart-v4`, retaining the v3/v2/v1 keys. Loading prefers the newest key; corruption does not silently fall back to stale progress. After upgrading, Undo and older imports continue writing v4. Earlier characters retain their existing version and numeric values.

New records are `grandMaster` (selected Disciplines), `grandMasteries` (chosen weapon types), `grandAdvances` (explicit applied count, initially zero), and `grandUnarmed` (initially false; later extended by the approved Book 19 choice). All inherited Magnakai fields remain separate. Grand Bow is an optional `grandBow:true` field on the adjusted-roll record; old result objects retain their shape. Existing attacks and recovery are retained. Later approved extensions are documented in the continuation review.

`tests/book13.test.js` verifies entry ranges/supplies, full inherited confirmation, skipped histories, independent carryover, dead/active-combat source handling, wounds, ten-slot validation, non-stacking weapon and psychic bonuses, explicit advances, defaults, thirteen-chart saves, real form handlers, storage-key retention, corruption, reload and Undo. Its optional source check verifies all 130 table cells and the twelve Discipline names.

Real Chromium checks passed at 390×844, 430×932, and 1280×900: five-choice continuation, all ten occupied backpack rows together and visible, all six ordinary tabs without overflow, selected Grand skills/masteries/unarmed training/advances/circles, psychic combat and cost, Deliverance and Undo, adjusted Grand Bow result of 13, reload, actual file export/import, and fresh replacement/Undo. Dialogs had no horizontal overflow; no browser errors occurred. Small-phone fit and physical-phone testing were not performed.
