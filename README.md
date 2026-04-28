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
- **Anki integration** - import sentences from any Anki deck and decompose them automatically with a local Ollama model

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

Then open the local URL shown by Vite (e.g. `http://localhost:5173`).

## Production build

```bash
npm run build
```

## Project structure

```txt
scripts/
  anki_to_puzzle.py   <-- CLI import tool (Anki --> TypeScript)
  requirements.txt
src/
  components/
    AnkiSync.tsx
    ProgressPanel.tsx
    PuzzleBoard.tsx
    PuzzlePiece.tsx
    SentenceResult.tsx
  data/
    sentences.ts
  types/
    puzzle.ts
  utils/
    ankiCache.ts
    ankiConnect.ts
    ollamaDecompose.ts
    shuffle.ts
    validation.ts
  App.tsx
  main.tsx
  styles.css
```

---

## Anki integration

Sentences can be imported from Anki in two ways: directly from the browser UI (recommended), or via the CLI script.

### Prerequisites

#### 1. AnkiConnect

Install the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) plugin in Anki:

> Anki --> Tools --> Add-ons --> Get Add-ons --> paste code `2055492159`

Then allow the app's origin in AnkiConnect's config so the browser can call its API.

> Anki --> Tools --> Add-ons --> AnkiConnect --> Config

Add `http://localhost:5173` (or whichever port Vite is using) to `webCorsOriginList`:

```json
{
  "webCorsOriginList": [
    "http://localhost",
    "http://localhost:5173"
  ]
}
```

Restart Anki after saving.  
**Verify**: with Anki open, visit `http://localhost:8765` in a browser - you should see `"AnkiConnect v.6"`.

#### 2. Ollama

Install [Ollama](https://ollama.com) and pull a model capable of structured JSON output.  
`qwen2.5:7b` (default) gives good results on Japanese grammar:

```bash
ollama pull qwen2.5:7b
```

Start the Ollama server if it is not already running:

```bash
ollama serve
```

**Verify**: `http://localhost:11434/api/tags` should return a JSON list of your installed models.

By default the app expects Ollama at `http://localhost:11434`. If you run it on a different host or port, update the URL in the Anki sync panel.

---

### Option A - Browser UI (recommended)

Click the **Anki** button in the top-left of the app.  
Fill in the settings (deck name, card field, model, Ollama URL) and click **Synchroniser avec Anki**.

The app will:
1. Fetch all unique sentences from the chosen deck via AnkiConnect.
2. Send each sentence to Ollama for grammatical decomposition.
3. Cache the resulting puzzles in `localStorage` so they survive page reloads.
4. Immediately add them to the game pool.

Settings and the last sync date are persisted. Subsequent clicks re-sync from scratch and overwrite the cache.

---

### Option B - CLI script

Useful for batch processing or when you want to commit the generated puzzles to the repository.

```bash
pip install -r scripts/requirements.txt

# List available decks
python scripts/anki_to_puzzle.py --list-decks

# List available Ollama models
python scripts/anki_to_puzzle.py --list-models

# Import a deck (writes to src/data/anki_puzzles.ts)
python scripts/anki_to_puzzle.py --deck "My Japanese Deck"

# Options
#   --field Sentence          Card field containing the Japanese sentence (default: Sentence)
#   --model qwen2.5:7b        Ollama model to use
#   --ollama-url URL          Ollama base URL (default: http://localhost:11434)
#   --limit 20                Process only the first N sentences
#   --start-index 100         Starting ID index (default: 100 --> sentence-100)
#   --output path/to/file.ts  Output file (default: src/data/anki_puzzles.ts)
```

After generation, import the file in `src/data/sentences.ts`:

```ts
import { ankiPuzzles } from "./anki_puzzles";
export const allPuzzles = [...sentencePuzzles, ...ankiPuzzles];
```

---

## Add a sentence manually

Edit `src/data/sentences.ts` and add a new `SentencePuzzle` object.

Each piece must define:

- `text`: Japanese text displayed on the puzzle piece
- `reading`: kana/romaji helper
- `meaning`: French meaning
- `grammarType`: grammatical category
- `acceptsLeft`: allowed grammar types on the left
- `acceptsRight`: allowed grammar types on the right

## Notes

This project supports multiple valid sentence orders (via `validOrders` arrays on each puzzle) and richer grammar rules (grammar notes per sentence explaining the patterns used).

