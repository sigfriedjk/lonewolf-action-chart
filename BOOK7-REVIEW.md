# Book 7 integration — local implementation, 15 October 2026

**Castle Death** extends the approved Book 6 foundation from `codex/book6-cloud-handoff` at `c4a904722ae8a9e6384ed784221f3a49a72e8dbb`. Books 1–7 are included in the authorized `book7v1` release of 15 October 2026. The source-verification continuation below preceded release authorization; its statements about uncommitted work describe that earlier checkpoint.

## Behavior

Book 7 reuses the six tabs, setup dialog, Magnakai grid, Mastery dialog, Lore-circle checks, and arrow controls. Fresh setup creates an independent chart with three recommended Magnakai selections. Continued setup requires completion confirmation and copies the source without changing its scores, wounds, selections, equipment, safekeeping, or notes. The new encounter and bookmark reset.

Book 6 → 7 preserves Magnakai selections, multiple masteries, checked circles, and arrows. Confirmed Magnakai completions raise the recommended skill count; Kai completions and skipped adventures do not. The player chooses the additional Discipline and any additional mastery. Learning Weaponmastery later starts with three types; its earlier acquisition is explained as guidance rather than inferred from book number. Counts do not lock editing. The optional full-Kai confirmation retains confirmed Book 6 completion.

Book 7 has its own five-choice supply list and Dessi map. Three Meals occupy three backpack slots; Lantern and Rope are Backpack Items. Three Fireseeds create three zero-bonus Special Item records, individually removable with Undo. Quiver supplies add six arrows once, retaining any existing total and quiver record. No shots, Fireseed effects, confiscation, poison, or bookmark-triggered effects are automated. Existing inventory limits remain.

Primate improvements appear as reference text in the relevant Discipline dialogs. They add no new controls or automatic bonuses. Existing arithmetic helpers and manually checked circles retain their Book 6 behavior. The Meals link was shortened to avoid wrapping on the smallest phone; control placement and CSS are unchanged.

## Sources

Reviewed the official [single-page Book 7](https://www.projectaon.org/en/xhtml-simple/lw/07cd.htm), edition dated 16 November 2024. Relevant anchors: `#gamerulz`, `#discplnz`, `#wpnmstry`, `#equipmnt`, `#howcarry`, `#howmuch`, `#howuse`, `#levels`, `#lorecrcl`, `#lcbonus`, `#imprvdsc`, `#action`, `#cmbtrulz`, `#crtable`, and `#footnotz`.

The previous environment rejected the development download with HTTP 403. On 15 October 2026, a fresh environment's published policy and `/etc/codex/network-policy.json` included `www.projectaon.org` (also `*.projectaon.org` and `projectaon.org`). The status API reported policy state `unknown`; actual network-enabled execution of `bash scripts/download-books.sh` succeeded through the configured proxy. The archive passed `unzip -tq` and extracted into Git-ignored `all-books-simple/`.

Verified the expected Book 1–7 files under `all-books-simple/en/xhtml-simple/lw/`: `01fftd.htm`, `02fotw.htm`, `03tcok.htm`, `04tcod.htm`, `05sots.htm`, `06tkot.htm`, and `07cd.htm`. The downloaded Book 7 identifies the same 16 November 2024 edition (SHA-256 `d3bcfbc0c2f7ddc06c20fff78b26894a1f896f486bae77dad2b230061baa9648`). Its Game Rules, Equipment/carrying/use, training levels, Lore-circle bonuses, Primate improvements, and Lantern footnote agree with the implemented records and manual guidance. No new Book 7 source discrepancy was found.

The Equipment footnote clarifies the Lantern is self-lighting. Section footnotes concerning equipment, arrow loss, and encounter exceptions remain player-directed. No narrative or illustrations are included.

Progression guidance also follows Project Aon's [Magnakai Disciplines](https://www.projectaon.org/en/ReadersHandbook/MagnakaiDisciplines), [training levels](https://www.projectaon.org/en/ReadersHandbook/MagnakaiTraining), and [improved Disciplines](https://www.projectaon.org/en/ReadersHandbook/MagnakaiImprovedDisciplines). Four selected skills correspond to Primate; Primate does not increase melee Weaponmastery to +4. No higher-rank abilities are inferred from extra selections.

## Saves and verification

Book 7 uses the existing character version 2/campaign version 3 format and v3 storage key. A fresh Book 7 without any Book 6 chart still upgrades old storage correctly. Earlier keys remain. All seven charts round-trip; invalid imports preserve the current campaign. Importing an older campaign after upgrading keeps v3 current, preventing stale newer saves from reappearing. Old app versions cannot read Book 7 exports.

All seven Node suites, three JavaScript syntax checks, and `git diff --check` passed. `tests/book7.test.js` covers supplies, capacity failures, nested independence, incomplete/dead/active-combat source records, explicit completion, skipped books, manual progression, Primate guidance, seven-chart validation, actual form handlers, storage upgrade without Book 6, reload, export/import, and Undo. Tests run without downloads; the optional local Book 7 table comparison reports whether it ran.

After the successful download, all seven suites passed again with the optional local Book 2–7 comparisons executing. Book 6 and Book 7 each matched all 130 combat-table cells by roll label. The existing, documented Book 5 `8/4` transcription exception remains explicitly handled by its comparison test; no engine correction was needed. All three JavaScript syntax checks, shell syntax, and `git diff --check` passed. The fresh checkout was restored to the exact Book 6 handoff commit, then the prior chat's recorded Book 7 edits and download script were recovered as uncommitted work. No books or temporary artifacts were staged or committed. The browser results below are from the previous chat; this source-verification continuation made no further app changes.

Browser checks passed at 390×844, 375×667, and 320×568 through real UI actions: Book 6 → 7 with all five supplies, retained wounds/circles/masteries/arrows, all six tabs, manual skill/mastery editing, protected fixed-roll combat and Undo, arrow editing and Undo, reload, actual file export/import, and fresh Book 7 replacement/Undo. Normal pages fit without vertical or horizontal scrolling; setup and Mastery dialogs have no horizontal overflow. No browser errors occurred. Physical-phone testing was not performed.

## book7v1 integration verification — 15 October 2026

Jon authorized integrating Books 6–7 into main and creating `book7v1`. Before pushing, all seven suites passed with local Book 2–7 comparisons, all three JavaScript syntax checks, shell syntax, and `git diff --check`. The real Chromium flows were repeated at 390×844, 375×667, and 320×568: Book 6 setup, Magnakai selections/masteries/circle/arrows, independent Book 7 continuation with five supplies, all six tabs without overflow, Primate selection/mastery editing, protected combat and Undo, reload, actual export/import, and fresh Book 7 replacement/Undo. All passed without browser errors. Physical-phone testing was not performed. Downloaded sources and temporary browser artifacts remain outside Git.
