# Book 6 integration — local implementation, 14 October 2026

Book 6, **The Kingdoms of Terror**, is included with Book 7 in the authorized `book7v1` release of 15 October 2026. The audit and original verification below record the Book 6 implementation before that integration.

## Agreed scope

Jon approved the Book 6 proposal and its compact layout on 14 October. Keep the six tabs and the Kai navigation label. Book 6 uses the Discipline grid for Magnakai skills; Mastery opens multiple weapon masteries, inherited Kai skills, and reference guidance. Three initial skills/masteries and Kai Master Superior are guidance, not selection locks. Earlier Books 1–5 retain their existing progression and inventory behavior.

Jon changed the initial manual Lore-circle proposal: four checkboxes now appear in a 2×2 block below the Discipline grid. A gold highlight and **Ready** text identify circles whose required Magnakai skills are selected. The player can check any circle; changing skills does not silently change its check. Only checked circles supply automatic CS/EP bonuses. Do not also put these bonuses in Extra CS/EP. Toggling a circle preserves wounds by changing current and maximum EP together; a dead hero stays at zero. Removing a bonus can reduce current EP to zero, ending an active combat. Undo restores the whole change.

Jon also requested arrows on Stats beside Gold. On Book 6, the left resource card has separate tappable Gold and Arrows totals, with direct editing and −/+ in their dialogs. Meals stays on the right. Earlier books keep their visible Gold −/+ controls. Arrows are a single editable total (0–9999, a software bound), not a simulated ammunition system. A starting Quiver adds six arrows once. Switching, reloading, carrying/storing/removing a quiver, and editing its description do not alter the arrow total. Special Item descriptions can be edited by tapping the name/description on Book 6, without changing their bonuses.

Psi-surge remains manual: ordinary Mindblast +2 is calculated when inherited Mindblast or Magnakai Psi-surge is selected, unless the enemy is marked immune. For a surge, add another +2 Extra CS, subtract 2 EP on Stats per used round, and remove the temporary CS when stopping. Follow the book about immunity and the 6-EP threshold. Healing/Curing, archery rolls, the tournament, unusual items, section effects, and exceptions remain manual. No automatic section processing or additional encounter modes were added.

## Setup, inheritance, and bonus ownership

Fresh Book 6 scores are CS 10–19 and EP 20–29; entry grants no inherited Kai bonuses by book number. Select three Magnakai Disciplines after starting. Continued entry copies the latest earlier chart, including wounds, scores, actual selected Kai skills, equipment, safekeeping, and notes. It resets the new chart's section, encounter, and last roll without modifying its source. The player confirms completion; source skill count, positive EP, and inactive combat are not eligibility gates for Book 6. Copying a dead source does not revive it.

An optional setup confirmation records completion of all five Kai adventures and all ten basic skills, including the final skill not previously selected. Otherwise only the confirmed source chain and selected skills are copied. Inherited skills and original Weaponskill mastery remain editable in Mastery. The Project Aon handbook explicitly leaves incomplete histories to player judgment.

Five optional, distinct supply choices: Sword, Potion of Laumspur (one dose, 4 EP recovery), Warhammer, Bow, Quiver (six arrows), four Special Rations (four Meals/slots), Quarterstaff, Padded Leather Waistcoat (+2 EP), Rope, Dagger, Tinderbox, Axe. Map of the Stornlands and 10–19 starting Crowns are added. Rope/Tinderbox are Backpack Items. Two regular weapons and eight backpack entries remain the current inventory limits. Failed setup preserves the source and form. Opening an existing chart grants nothing.

- Base scores and Extra CS/EP are player records. Existing adjustments are copied without reinterpretation.
- Checked Lore-circles own their calculated bonuses: Fire +1 CS/+2 EP; Light +0/+3; Solaris +1/+3; Spirit +3/+3.
- Magnakai Weaponmastery owns +3 with an equipped mastered melee weapon. Applicable inherited Weaponskill supplies +2 only when the higher bonus does not apply; they never sum to +5. Sword/Short Sword/Broadsword mastery applies to the Sommerswerd as in earlier charts.
- Inherited Mindblast or selected Psi-surge supplies one ordinary +2 mental bonus. Psi-screen or inherited Mindshield blocks the existing incoming Mindblast helper.
- Carried item bonuses remain item-owned. Stored items do not supply them. Bow is a regular carried weapon but counts as unarmed in ordinary melee; apply shot bonuses manually.

## Save compatibility

Earlier charts remain character version 1. Book 6 uses character version 2, with `magnakai`, `masteries`, `loreCircles`, and `arrows`; `disciplines`/`mastery` hold the inherited Kai record. Completed-adventure history stays distinct from Magnakai selections. Structural validation preserves all these fields and rejects duplicate/unknown choices or invalid numeric values; selecting more than the recommended three Magnakai skills/masteries is valid.

Before Book 6 is used, existing campaign version 2/storage behavior is retained. The first Book 6 write upgrades the campaign to version 3 under `lone-wolf-action-chart-v3`, retaining the prior v2 and v1 storage keys. Load prefers v3; corrupt v3 data shows recovery rather than silently loading older progress. Once upgraded, Undo and importing an older campaign continue writing v3, so a stale newer key cannot override the imported/undone state on reload. Import accepts legacy single charts, old v2 campaigns, new v3 campaigns, and single Book 6 charts. New exports require the newer app; an old app sees only its retained older storage snapshot. Export before rollback or changing origin.

## Source audit

Ignored local source: `all-books-simple/en/xhtml-simple/lw/06tkot.htm`.

- `#gamerulz`: fresh scores, continued scores/equipment, EP limits.
- `#discplnz`, `#wpnmstry`, `#curing`, `#hntmstry`, `#psisurge`, `#psiscrn`: initial Magnakai selections, weapon masteries, recovery, food and psychic arithmetic.
- `#equipmnt`, `#howcarry`, `#howmuch`, `#howuse`: five choices, quantities, map/gold, Bow/quiver, waistcoat and backpack allocation.
- `#levels`, `#lorecrcl`, `#lcbonus`, `#imprvdsc`: starting rank, four circles and their bonuses; higher-rank improvements are described in future books, not applied by this integration.
- `#action`, `#cmbtrulz`, `#crtable`: chart records and all 130 shared combat-table cells, compared by roll label.
- `#footnotz`, especially `#sect26-1-foot` and `#sect252-1-foot`: tournament and shot-specific exceptions remain manual. `#errstat` describes the revised tournament opponent, which the player enters from their edition.

Official clarification sources: [Magnakai Disciplines](https://www.projectaon.org/en/ReadersHandbook/MagnakaiDisciplines), [Lore-circles](https://www.projectaon.org/en/ReadersHandbook/MagnakaiLoreCircles), and [newsletter excerpts](https://www.projectaon.org/en/ReadersHandbook/NewsletterExcerpts), especially No. 8 (non-stacking mastery/recovery), Summer Special 1987, and No. 10 (inherited benefits). Their recovery-at-adventure-end clarification is guidance for manual editing; this implementation preserves wounds during copying as agreed, without silently healing the hero.

## Verification

All six Node suites, the three JavaScript syntax checks, and `git diff --check` passed on 14 October 2026. Optional local Book 2–6 comparisons ran and passed. No release workflow or live production verification was run because publishing has not been authorized.

Run the five existing Node suites, `node tests/book6.test.js`, three syntax checks, and `git diff --check`. The new suite covers fresh/continued entry, all-five confirmation, incomplete and skipped histories, no automatic revival, full supplies, capacity errors, inheritance, weapon/psychic arithmetic, manual Lore-circle checks, wounds/death, migration, original storage retention, corruption, real form handlers, arrows, reload, export/import, and Undo. Optional local source comparison checks all 130 Book 6 combat-table cells; tests do not require book downloads.

Browser verification uses local saves, leaving production saves untouched. All six Book 6 tabs fit without page/horizontal scrolling at 390×844, 375×667, and 320×568. Setup and Mastery dialogs scroll vertically without horizontal overflow. Full five-choice continuation, skill selection, Ready highlighting, a checked Fire bonus, weapon/inherited mastery editing, arrow direct editing/−/Undo, reload, and protected fixed-roll combat/Undo were exercised through real UI actions. Special Item description layout was tightened after finding overflow at the larger two sizes. Physical-phone testing has not been performed.
