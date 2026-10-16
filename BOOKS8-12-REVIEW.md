# Books 8–12 continuation — 16 October 2026

Books 8–12 are included in the authorized `book12v1` release of 16 October 2026. Jon approved working through Book 12 with the explicit player choices below, then requested pushing, tagging, and deploying the completed work. Earlier local verification checkpoints below describe the implementation before release authorization.

## Agreed implementation

Jon rejected automatic rank-based improvements and approved a player-selected Weaponmastery level in the existing Mastery dialog. Standard gives +3 mastered melee / −4 unarmed; Tutelary gives +3 / −2; Scion-kai gives +4 / −1. These are replacement values, not extra bonuses to enter again in Extra CS or the section adjustment. Matching inherited Weaponskill remains +2 only when the higher mastery does not apply. Bow in ordinary melee uses the selected unarmed penalty; applicable sword mastery applies to the Sommerswerd.

The selected level applies only while the Weaponmastery Discipline is selected. Neither book number, completion history, nor the number of skills enables an improvement. Fresh entries and old Magnakai saves missing the field default to Standard. The choice is retained during independent carryover, validation, reload, export/import, and Undo. It is editable even with incomplete histories; no new rank eligibility gates were added.

`weaponmasteryLevel` is an optional-to-import enum (`standard`, `tutelary`, `scion`) on character version 2, defaulted and retained by the current validator. Campaign/storage remains v3; prior storage keys remain. Earlier app versions can discard the new field when importing/exporting, and cannot read Book 8/9 charts. Export before rollback. No existing base scores or wound records are rewritten on load.

## Books 8–9

| Book | Source | Sections | Supplies | Map |
| --- | --- | --- | --- | --- |
| 8 · The Jungle of Horrors | `08tjoh.htm` | 350 | Five optional distinct choices | Map of the Danarg |
| 9 · The Cauldron of Fear | `09tcof.htm` | 350 | Five optional distinct choices | Map of Anari |

Both use Sword, Bow, Quiver (six arrows), Rope, one ordinary Laumspur dose, self-lighting Lantern, Mace, three Meals, Dagger, and three Fireseeds. Rope/Lantern/potions use backpack slots; each Meal uses a slot; Fireseeds are separate removable Special Items. Setup adds 10–19 Crowns once. Existing weapon/backpack capacity handling remains. Reopening a saved chart grants nothing.

Fresh entry recommends three Magnakai skills; confirmed Magnakai completions increase the recommendation, not actual selections. Continued entry copies scores, wounds, skills, masteries, selected mastery improvement, manually checked circles, arrows, gear/safekeeping, and notes independently; bookmark/encounter reset. No healing, inferred skills, item losses, or section effects occur automatically.

Tutelary and Principalin guidance is in the existing Discipline dialogs. Section-dependent improvements remain reference text. The twelve-Special-Item carrying limit introduced in Book 8 is guidance in quick rules; Carry/Safekeeping remains player-controlled, without automatic storage/discard or new validation limits. Book 8 currency conversion (four Lune per Crown), unusual encounters, and one-off item effects remain manual records.

## Source audit

Ignored Project Aon sources: `all-books-simple/en/xhtml-simple/lw/08tjoh.htm` and `09tcof.htm`. Checked `#gamerulz`, `#discplnz`, `#wpnmstry`, `#equipmnt`, `#howcarry`, `#howmuch`, `#howuse`, `#levels`, `#lorecrcl`, `#lcbonus`, `#imprvdsc`/`#tutelary`, `#action`, `#crtable`, and chart-relevant footnotes. Fresh scores remain CS 10–19 / EP 20–29; eight backpack slots and two weapons remain. Lore-circle bonuses match the shared implementation. The Lantern is self-lighting. Book 9's section 316 footnote explicitly reiterates Tutelary's −2 unarmed penalty. Encounter restrictions, lost equipment, and section-granted items remain player-directed. No narrative or illustrations are bundled.

## Verification

`tests/books8-9.test.js` checks supplies, capacities, fresh/continued and dead sources, nested independence, wounds, explicit mastery levels, Bow/unarmed/Sommerswerd arithmetic, non-stacking Kai mastery, no inferred improvements with all ten skills, invalid enum rejection, old defaults, nine-chart saves, actual Mastery form handling, reload, and Undo. At this intermediate checkpoint the Book 7 unsupported-book test used Book 10; the final continuation uses Book 13. Optional local Book 8 and 9 comparisons each match all 130 combat-table cells by roll label; no new source discrepancy was found.

All eight Node suites passed with local Book 2–9 source comparisons, three JavaScript syntax checks, shell syntax, and `git diff --check`. Real Chromium checks passed independently for Books 8 and 9 at 390×844, 375×667, and 320×568. They exercised five-choice setup, carried wounds/circles/masteries/arrows, selecting Tutelary then Scion-kai, all six tabs without page overflow, Mastery/setup dialogs without horizontal overflow, protected fixed-roll combat/Undo, arrow editing/Undo, reload, actual export/import, and fresh replacement/Undo. No browser errors occurred. Physical-phone testing was not performed. At this intermediate checkpoint the only new layout control was the approved selector inside the existing scrollable Mastery dialog; CSS and permanent tab layouts are unchanged.

## Books 10–12 — approved and implemented

Jon approved the concrete proposal for adjusted missile rolls, player-selected psychic attacks, and player-triggered Archmaster Curing. Implementation and source differences:

- Book 10 `#imprvdsc`: Mentora missile rolls gain +2; the earlier chart had no adjusted missile-roll control. Alether is a Backpack Item giving +2 CS for one combat. Alether is recorded in the backpack; use the existing Section CS modifier +2 and remove the dose yourself. The adjusted-roll helper supports selected Bow mastery +3, Mentora +2, and a signed section modifier. The result is not clamped to 0–9; arrows and targets remain manual.
- Book 11 `#equipmnt`: continued characters skip new equipment/gold; fresh characters receive two Meals and 10–19 Crowns plus six supply choices. Its Scion-kai melee/unarmed values are already represented by the approved selector. The continued form offers no supplies/gold or weapon exchanges; carried weapons, backpack, Special Items, arrows, scores, wounds, and notes are copied independently. Fresh setup has all six choices, with the initial two Meals counted toward backpack capacity. No map is granted.
- Book 12 `#imprvdsc`: Archmaster Mindblast +3 or Psi-surge +6 costing 1 EP per used round, with the 4-EP threshold; Curing can restore 20 EP at 6 EP or less, once per 100 days. The Psychic combat dialog includes those choices alongside ordinary Mindblast +2 and surge +4 / 2 EP, plus No psychic attack. The selected surge cost is charged on each Fight or Evade round, capped at remaining EP, even against an immune enemy. Enemy psychic damage remains separate; results/logs identify surge costs within total hero loss. The player decides the threshold/immunity conditions. The Curing dialog shows the 6-EP / combat / once-per-100-days conditions and a Restore 20 EP button; maximum EP is respected, zero EP is not revived, and elapsed days are not tracked.

Book 10 has five supplies and a Map of Ghatan, replacing Fireseeds with Alether. Book 11 has six fresh-only supplies and no automatic map/gold/equipment for a continued hero. Book 12 has six supplies, including four Meals, Quarterstaff and Axe, and a Map of the Darklands. Books 10 and 12 add 10–19 Crowns once at setup. All three have 350 sections, CS 10–19 / EP 20–29 for fresh entry, and three initial recommended Magnakai skills. Continued history increases recommendations without granting selections or upgrading improvements.

Audited local `10tdot.htm`, `11tpot.htm`, `12tmod.htm`: Game Rules, Magnakai Disciplines, Equipment/carrying/use, Action Chart, training levels, Lore-circle requirements/bonuses, Improved Disciplines, combat rules/table, and chart-relevant footnotes. Book 10 `#imprvdsc` describes Mentora missile accuracy; Book 11 describes Scion-kai mastery/unarmed improvement; Book 12 describes Archmaster psychic/Curing improvements. All three Lanterns are self-lighting. Unusual weapons, poison, item losses, zero-as-ten section exceptions, and special combat restrictions stay player-directed. No bookmark effects, narrative, or illustrations are added. No new table discrepancy was found; all 390 local Book 10–12 cells match the shared table. Book 13 and release work remain outside this request.

## New records and compatibility

Character version 2 / campaign v3 and storage keys remain. `psychicMode` defaults to `legacy`, preserving ordinary +2 only from selected Mindblast/Psi-surge with zero surge cost; old saves never gain a surge or Archmaster improvement. Explicit choices are saved per chart and retained during carryover; changing mode affects future rounds, not past logs. `lastAdjustedRoll` defaults to null and stores only the raw 0–9 number, signed modifier, player-selected bonus flags, and checked total. `lastRoll` remains a raw 0–9 value for compatibility. Round history optionally retains `surgeLoss` as part of `heroLoss`, alongside incoming `mindblastLoss`. These fields round-trip through validation/export/import/reload and Undo. Earlier apps may discard them; export before rollback. The new helpers are available on Magnakai charts without inferring eligibility from book or skill count.

Access Psychic combat from Combat or the adventure menu; access Adjusted missile roll from the menu or Weaponmastery dialog; access Restore 20 EP from the Curing dialog. The six tabs, ordinary Stats Roll, and CSS are unchanged. The new selectors/actions fit in existing dialogs and the Combat heading. On short screens the existing footer is hidden, so the psychic control stays in the heading for reachability.

`tests/books10-12.test.js` covers distinct setup rules, all offered supplies, wounds and independent carryover, explicit psychic modes, non-stacking bonuses, immunity, evasion, capped costs/death, incoming Mindblast versus surge loss, Curing caps/no revival, signed/above-nine missile results, invalid modes/results/cost logs, legacy defaults, all twelve charts, actual form handlers, reload, and Undo. The old Book 6 quick-rules assertion now checks the approved attack chooser; unsupported-book tests use Book 13.

## Final continuation verification — 16 October 2026

All nine Node suites, three JavaScript syntax checks, shell syntax, and `git diff --check` passed. Optional local Book 2–12 comparisons ran, including all 650 combat-table cells across Books 8–12. The existing documented Book 5 transcription correction remains; no new source discrepancy required an engine change.

Real Chromium flows passed at 390×844, 375×667, and 320×568. Sequential Book 9 → 10 → 11 → 12 setup preserved independent source charts, selected improvements, equipment, arrows, and wounds. All six normal tabs fit without page or horizontal overflow. Checks exercised psychic selection and per-round Archmaster surge cost, round log, Undo, changing to no psychic attack, Curing and Undo, an adjusted result of 13 from raw 9 / section −1 / Bow +3 / Mentora +2, reload, real file export/import, fresh Book 11's full six choices and two initial Meals, replacement/Undo, and fresh Book 12's four Meals. Dialogs had no horizontal overflow. No browser errors occurred. The earlier Book 8–9 flows also passed again with the new helpers before the header reachability fix. Physical-phone testing was not performed.

The initial browser script needed a modal-specific locator for Edit scores; this was a test issue. It also found that the original psychic footer link was hidden by the existing short-screen footer rule. The control was moved into the existing Combat header, and all Book 10–12 browser flows then passed at all three sizes. No CSS change was needed.

At that pre-release checkpoint, Books 8–12 and these documentation/tests remained uncommitted local work; production and `book7v1` were unchanged. No downloaded sources, browser saves, screenshots, or temporary scripts are tracked. Book 13 was not started.

## book12v1 release preparation

Jon explicitly authorized pushing, tagging, and deploying the completed Books 1–12 work. Release checks repeat all nine suites with local Book 2–12 comparisons, three JavaScript syntax checks, shell syntax, and whitespace checks. Real browser evidence immediately above covers the final app assets at all three required sizes. No app changes were made for release preparation. Downloaded books, adventure saves, and temporary artifacts are excluded from the commit. The environment proxy currently rejects direct live-site checks with HTTP 403; deployment status is checked against the exact release commit.
