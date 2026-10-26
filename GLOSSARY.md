# Roter Faden

A German word-search puzzle on a 6 columns × 8 rows grid. This is the vocabulary the code, the issues and the UI share. German in parentheses is the label the UI uses.

## Grid

**Cell**:
One of the 48 positions of the grid, indexed 0–47 row-major.
_Avoid_: field, square

**Letters**:
The 48 uppercase A–Z characters, one per cell.
_Avoid_: characters, text

**Board** (Spielfeld):
The rendered grid: the letters plus the lines drawn through them.
_Avoid_: grid, field

**Path** (Pfad):
The ordered cells of one word, each 8-adjacent to the previous one and never repeated.
_Avoid_: line, trace, route

**Cell group**:
The unordered set of cells a path covers. A submission matches a word by its group, not by its order.
_Avoid_: cells, selection

## Answers

**Word** (Wort):
The letters a player has to spell. A word is not its path: the same word may be spelled in either order inside its group, and in a finished puzzle the text is read from the letters along the path rather than stored.
_Avoid_: term, entry, solution word

**Theme word** (Themenwort):
A blue word of at least 4 letters that must be in the dictionary.
_Avoid_: keyword, answer

**Roter Faden**:
The single red answer. It must touch two opposite edges, and its text is the creator's free choice — a phrase without spaces is valid — so it is exempt from the dictionary.
_Avoid_: faden word, red line, red answer

**Clue** (Hinweis):
The German sentence shown above the board. Free text, not normalized to A–Z.
_Avoid_: title, question

**Valid puzzle** (gültiges Rätsel):
A puzzle that passes every rule of validation. Only a valid puzzle has a play URL.
_Avoid_: finished puzzle, solved puzzle

**Play URL** (Spiel-URL):
The shareable `#v1.…` link that carries a valid puzzle.
_Avoid_: share link, game URL

## Editor

**Draft** (Entwurf):
A puzzle being built in the editor, possibly incomplete and invalid. It becomes a valid puzzle only when it passes validation.
_Avoid_: puzzle, template, project

**Problem** (Problem):
Something the editor shows on a row or on the whole puzzle: a rule violation from validation or a draft-only problem, with a German message and the cells to highlight.
_Avoid_: issue (that means a GitHub issue here), error

**Selection** (Auswahl):
The trace in progress on the board, before it is submitted.
_Avoid_: path, highlight

**Row** (Zeile):
One answer's strip in the word panel: the Roter Faden or one theme word, with its input, path and problems. A row subject names one such row; a violation that belongs to two rows or to neither has the puzzle as its subject.
_Avoid_: line, entry
