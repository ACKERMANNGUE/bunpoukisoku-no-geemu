# 文法規則のゲーム

A standalone React + TypeScript MVP for learning Japanese sentence structure through visual puzzle pieces.

## Features

- Random sentence selection from a baseline dataset
- Japanese sentence chunks displayed as visual puzzle pieces
- Drag-and-drop reordering
- Validation by correct order
- Grammar connection validation
- Visual feedback for correct positions and invalid connections
- Sentence explanation after success
- Responsive layout for desktop and mobile browsers

## Requirements

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Then open the local URL shown by Vite.

## Production build

```bash
npm run build
```

## Project structure

```txt
src/
  components/
    ProgressPanel.tsx
    PuzzleBoard.tsx
    PuzzlePiece.tsx
    SentenceResult.tsx
  data/
    sentences.ts
  types/
    puzzle.ts
  utils/
    shuffle.ts
    validation.ts
  App.tsx
  main.tsx
  styles.css
```

## Add a new sentence

Edit `src/data/sentences.ts` and add a new `SentencePuzzle` object.

Each piece must define:

- `text`: Japanese text displayed on the puzzle piece
- `reading`: kana/romaji helper
- `meaning`: French meaning
- `grammarType`: grammatical category
- `correctIndex`: expected final position
- `acceptsLeft`: allowed grammar types on the left
- `acceptsRight`: allowed grammar types on the right

## Notes

This MVP intentionally uses direct order validation. The next step would be to support multiple valid sentence orders and richer grammar rules.
