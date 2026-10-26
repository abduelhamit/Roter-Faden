# Letters follow from words and paths

The editor could ask for the 48 letters first and then check that the words fit them, or take the words and their drawn paths as the source and derive the letters from those. We derive: every cell claimed by a path takes the next letter of the word or Roter Faden that owns it, so the grid can never disagree with the puzzle's answers and the editor needs no letter input at all. The cost is that the grid cannot be shaped independently of the words, and a row's text length has to equal its path length before its letters land in a finished puzzle.

## Considered Options

- **Typed letters first** — 48 letters are typed or pasted, then words are entered and paths drawn; a path that does not spell its word is an error. More faithful to a classic word-search editor and lets a creator start from a grid, but adds a second input surface and a whole new rule.
- **Derived, with a manual letter override** — the grid follows the words, but a cell can be overtyped. Lighter than typed-first, yet every override needs a "this word no longer matches its cells" error and a way back.

## Consequences

- A draft row still lands the prefix letters its path covers while its text is shorter than the path, so the editor can show partial work; validation requires the two lengths to match, and `checkDraft` flags a mismatch early so the editor need not wait for it.
- Two draft paths may claim the same cell: the first row that has a letter for it keeps it (the faden comes first, then the theme words), and a later row's letter there is dropped. A row whose text ends before the cell writes nothing, so a later row can still fill it. Validation's coverage rule reports the shared cell when the draft is validated.
- Reversing the decision means adding a letter input and a "the path spells the selected word" rule to the editor, plus a way to reconcile typed letters with already drawn paths.
- The letters of a finished puzzle are never stored twice: the draft keeps only words, texts and paths, and the puzzle shape keeps only letters and paths.
