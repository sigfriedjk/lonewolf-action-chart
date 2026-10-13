# Books 3–5 integration review — 13 October 2026

Release checkpoint: [book5v1](https://github.com/sigfriedjk/lonewolf-action-chart/releases/tag/book5v1). This document records implemented behavior and pre-release verification. See [HANDOFF.md](HANDOFF.md) for continued development and [CHANGELOG.md](CHANGELOG.md) for release history.

## Completed

Books 3–5 are available through the existing book menu, with independent charts, carryover, earned Disciplines, starting supplies, maps and gifts, gold, and book-specific bookmarks. Book 3 prevents Hunting from replacing carried Meals in Kalte. Sequential play gives seven, eight, and nine Disciplines in Books 3, 4, and 5; a fresh start has five. Skipped adventures grant no bonus Disciplines. Earlier charts remain independent, and current wounds carry forward.

The three approved interface additions are now implemented:

- **Full starting supplies:** Book 4 has six optional selectors; Book 5 has four. Unused selectors stay at No item. Choices must be different and respect two regular weapons and eight backpack slots. The listed two-potion/five-ration Book 4 bundles expand into two doses and five Meals; Book 5's ration bundle expands into two Meals. Duplicate or capacity errors preserve the form and existing charts.
- **Special Carry/Safekeeping:** The header toggle replaces Undo on this tab. Store buttons move carried items to safekeeping; Carry buttons retrieve stored items. Both lists retain pagination. Stored items survive saves/import/export and are excluded from equipment bonuses. Storing an equipped Sommerswerd unequips it; retrieval does not automatically equip it. Armour moves preserve the current wound deficit, and storage that would reduce a living hero to zero EP is rejected. A dead hero is not revived by retrieval. Moves are blocked during active combat. Undo is still available on Stats and in the menu. Controls are available on all book charts; follow the book about when to use them.
- **Enemy Mindblast:** Combat setup accepts the section's EP damage per round, defaulting to zero. Mindshield blocks it automatically. Otherwise it is added to the combat-table hero loss, including evasion rounds, and capped at current EP. Results and combat history identify the Mindblast portion within the total loss. Saved combats and Undo retain the configuration and round breakdown. Legacy combats default to zero incoming Mindblast.

No other optional proposals will be implemented. Notes about external food, alternative carryover sources, one-off mental attacks, and other section-specific effects can be handled through Journal and the existing score controls.

## Verification

All JavaScript syntax checks and all five automated suites pass. The five suites also passed in a clean copy without the ignored book downloads, verifying the dependency-free handoff. Checks cover Books 1–5 save migration/round trips; independent charts; carryover and skipped books; full six/four-choice setup submissions; equipment capacities; safekeeping and retrieval; bonus changes; zero-EP safeguards; duplicate Shield/Sommerswerd retrieval; storage during combat; reload and Undo; incoming Mindblast, Mindshield, evasion, instant kills and capped losses; and legacy combat migration.

Browser verification exercised all six Book 4 choices and all four Book 5 choices through the actual forms, with duplicate rejection and correct inventory quantities. A six-choice Book 4 setup produced two weapons, five Meals, two separate Laumspur doses, Chainmail and Shield. Book 5's four choices produced its selected weapon, potion, two Meals, and Shield.

Carry and Safekeeping, combat setup, and active combat fit at 390×844, 375×667, and 320×568 without page scrolling or horizontal overflow. The six-selector setup dialog has no horizontal overflow at these sizes; dialogs can scroll vertically. Real armour moves changed wounded EP from 25/28 to 21/24 and back. Storing an equipped Sommerswerd removed its bonus and left the hero unarmed. A fixed combat roll lost 4 EP with Mindshield and 6 EP without it, with 2 Mindblast EP shown in results/history and preserved after reload. No browser warnings or errors were reported. No physical-phone session was performed.

The previous core integration also passed 54 combinations of Books 3–5, six tabs, and three portrait sizes, and verified section 400 and five-chart persistence. Approved CSS changes are limited to the Special toggle/item actions and the combat-log Mindblast breakdown. Other tabs retain their layout.

## Sources

Local Project Aon `03tcok.htm`, `04tcod.htm`, and `05sots.htm`: Game Rules, Kai Disciplines, Equipment, and Combat Results Table. Book 3's Helghast encounters specify 2 EP per round unless protected by Mindshield; enter the amount required by the particular encounter.

The downloaded simple Book 5 has a transcription discrepancy: roll 8, ratio −10/−9 reads `8/4`. The current official [negative combat table](https://www.projectaon.org/en/xhtml/lw/05sots/crtneg.png) reads `5/4`, matching the other Kai books. The engine retains `5/4`; the source-comparison test explicitly documents this correction. See the official [Book 5 combat-table page](https://www.projectaon.org/en/xhtml/lw/05sots/crtable.htm).

The app links to each official book and includes no narrative text or illustrations.

Run with the existing Node runtime:

```text
node --check app.js
node --check campaign.js
node --check rules.js
node tests/rules.test.js
node tests/campaign.test.js
node tests/app-save.test.js
node tests/disciplines.test.js
node tests/books3-5.test.js
```
