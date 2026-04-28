#!/usr/bin/env python3
"""
anki_to_puzzle.py
=================
Converts sentences from an Anki deck into the SentencePuzzle TypeScript format
used by bunpoukisoku-no-geemu.

Requirements:
    pip install -r scripts/requirements.txt   (only 'requests')

Prerequisites:
    - Anki must be open
    - AnkiConnect plugin installed in Anki (https://ankiweb.net/shared/info/2055492159)
    - Ollama running locally  (https://ollama.com)

Usage:
    # List available decks
    python scripts/anki_to_puzzle.py --list-decks

    # List models available in Ollama
    python scripts/anki_to_puzzle.py --list-models

    # Convert a deck (writes to src/data/anki_puzzles.ts)
    python scripts/anki_to_puzzle.py --deck "MyDeck"

    # Choose a specific Ollama model and limit to 10 sentences
    python scripts/anki_to_puzzle.py --deck "MyDeck" --model qwen2.5:7b --limit 10

    # Custom Ollama URL (default: http://localhost:11434)
    python scripts/anki_to_puzzle.py --deck "MyDeck" --ollama-url http://192.168.1.10:11434
"""

import argparse
import json
import os
import re
import sys
import time

import requests

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ANKI_CONNECT_URL = "http://localhost:8765"
DEFAULT_OLLAMA_URL = "http://localhost:11434"
DEFAULT_MODEL = "qwen2.5:7b"

GRAMMAR_TYPES = [
    "noun", "pronoun", "topicParticle", "subjectParticle", "objectParticle",
    "locationParticle", "directionParticle", "comitativeParticle",
    "possessiveParticle", "quoteParticle", "timeExpression", "adverb",
    "frequencyAdverb", "adjective", "verb", "teForm", "auxiliary",
    "clauseConnector", "nominalizer",
]

SYSTEM_PROMPT = f"""You are a Japanese linguistics expert creating data for a Japanese grammar puzzle game.

Given a Japanese sentence, decompose it into grammatical puzzle pieces. Output a single JSON object with this exact shape:

{{
  "level": "N5" | "N4" | "N3",
  "japanese": "<the original sentence>",
  "translation": "<French translation>",
  "explanation": "<1–2 sentence French explanation of the overall structure>",
  "pieces": [
    {{
      "pid": "p1",
      "text": "<Japanese fragment>",
      "reading": "<hiragana reading, or empty string if already kana>",
      "meaning": "<French meaning of this fragment>",
      "grammarType": "<one of the types listed below>",
      "acceptsLeft": ["<grammarType>", ...],
      "acceptsRight": ["<grammarType>", ...]
    }}
  ],
  "validOrders": [["p1","p2",...], ...],
  "grammarNotes": [
    {{ "rule": "<French rule name>", "explanation": "<French explanation>" }}
  ]
}}

Available grammarTypes: {", ".join(GRAMMAR_TYPES)}

Rules:
- Split at the finest meaningful grammatical level: each particle is its own piece, each word is its own piece. Keep te-form + auxiliary combinations (e.g. 降っている) together when they form a single grammatical unit.
- acceptsLeft for the first piece must be [].
- acceptsRight for the last piece must be [].
- List ALL valid orderings in validOrders (Japanese allows some reordering of time/place expressions). Most sentences have 1–3 valid orders.
- Include 2–4 grammar notes covering the key grammar points of the sentence.
- All human-readable strings (translation, explanation, meaning, notes) must be in French.
- Output ONLY valid JSON. No markdown fences, no extra text."""


# ---------------------------------------------------------------------------
# AnkiConnect helpers
# ---------------------------------------------------------------------------

def anki_request(action: str, **params) -> object:
    payload = {"action": action, "version": 6, "params": params}
    try:
        resp = requests.post(ANKI_CONNECT_URL, json=payload, timeout=10)
        resp.raise_for_status()
    except requests.exceptions.ConnectionError:
        print(
            "ERROR: Cannot connect to AnkiConnect.\n"
            "  --> Make sure Anki is open and the AnkiConnect plugin is installed.\n"
            "  --> Plugin page: https://ankiweb.net/shared/info/2055492159"
        )
        sys.exit(1)
    result = resp.json()
    if result.get("error"):
        raise RuntimeError(f"AnkiConnect: {result['error']}")
    return result["result"]


def list_decks() -> list[str]:
    return sorted(anki_request("deckNames"))


def get_sentences_from_deck(deck: str, field: str) -> list[str]:
    """Return deduplicated list of sentence strings from the given deck/field."""
    card_ids = anki_request("findCards", query=f'deck:"{deck}"')
    if not card_ids:
        return []
    cards_info = anki_request("cardsInfo", cards=card_ids)
    seen: set[str] = set()
    sentences: list[str] = []
    for card in cards_info:
        raw = card.get("fields", {}).get(field, {}).get("value", "")
        # Strip HTML tags
        text = re.sub(r"<[^>]+>", "", raw).strip()
        if text and text not in seen:
            seen.add(text)
            sentences.append(text)
    return sentences


# ---------------------------------------------------------------------------
# Ollama helpers
# ---------------------------------------------------------------------------

def list_ollama_models(ollama_url: str) -> list[str]:
    try:
        resp = requests.get(f"{ollama_url}/api/tags", timeout=10)
        resp.raise_for_status()
        return [m["name"] for m in resp.json().get("models", [])]
    except requests.exceptions.ConnectionError:
        print(
            f"ERROR: Cannot connect to Ollama at {ollama_url}.\n"
            "  --> Make sure Ollama is running: ollama serve"
        )
        sys.exit(1)


def decompose(sentence: str, sentence_index: int, model: str, ollama_url: str, retries: int = 3) -> dict:
    """Call Ollama to produce a SentencePuzzle-compatible dict."""
    url = f"{ollama_url}/api/chat"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Sentence: {sentence}"},
        ],
        "stream": False,
        "format": "json",
        "options": {"temperature": 0.1},
    }
    for attempt in range(1, retries + 1):
        try:
            resp = requests.post(url, json=payload, timeout=180)
            resp.raise_for_status()
            content = resp.json()["message"]["content"]
            data = json.loads(content)
            return _assign_ids(data, sentence_index)
        except (json.JSONDecodeError, KeyError) as exc:
            if attempt == retries:
                raise RuntimeError(f"Failed to parse Ollama response after {retries} attempts: {exc}") from exc
            time.sleep(2)
        except requests.exceptions.ConnectionError:
            print(
                f"ERROR: Cannot connect to Ollama at {ollama_url}.\n"
                "  --> Make sure Ollama is running: ollama serve"
            )
            sys.exit(1)


def _assign_ids(data: dict, sentence_index: int) -> dict:
    """Replace placeholder pid values with real ids like s050-p1."""
    sid = f"sentence-{sentence_index:03d}"
    data["id"] = sid

    pid_map: dict[str, str] = {}
    for i, piece in enumerate(data.get("pieces", []), start=1):
        old = piece.get("pid", f"p{i}")
        new = f"s{sentence_index}-p{i}"
        pid_map[old] = new
        piece["id"] = new
        piece.pop("pid", None)

    data["validOrders"] = [
        [pid_map.get(p, p) for p in order]
        for order in data.get("validOrders", [])
    ]
    return data


# ---------------------------------------------------------------------------
# TypeScript serialisation
# ---------------------------------------------------------------------------

def _ts_str(value: str) -> str:
    """Return a safely escaped TypeScript string literal (with surrounding quotes)."""
    escaped = value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    return f'"{escaped}"'


def _ts_str_list(items: list[str]) -> str:
    return "[" + ", ".join(_ts_str(i) for i in items) + "]"


def puzzle_to_ts(p: dict) -> str:
    pieces_lines = []
    for piece in p["pieces"]:
        al = _ts_str_list(piece["acceptsLeft"])
        ar = _ts_str_list(piece["acceptsRight"])
        pieces_lines.append(
            f'      {{ id: {_ts_str(piece["id"])}, text: {_ts_str(piece["text"])}, '
            f'reading: {_ts_str(piece.get("reading", ""))}, '
            f'meaning: {_ts_str(piece["meaning"])}, '
            f'grammarType: {_ts_str(piece["grammarType"])}, '
            f'acceptsLeft: {al}, acceptsRight: {ar} }},'
        )

    orders_lines = []
    for order in p["validOrders"]:
        ids = ", ".join(_ts_str(i) for i in order)
        orders_lines.append(f"      [{ids}],")

    notes_lines = []
    for note in p.get("grammarNotes", []):
        notes_lines.append(
            f'      {{ rule: {_ts_str(note["rule"])}, explanation: {_ts_str(note["explanation"])} }},'
        )

    pieces_block  = "\n".join(pieces_lines)
    orders_block  = "\n".join(orders_lines)
    notes_block   = "\n".join(notes_lines)

    return (
        f"  {{\n"
        f"    id: {_ts_str(p['id'])},\n"
        f"    level: {_ts_str(p['level'])},\n"
        f"    japanese: {_ts_str(p['japanese'])},\n"
        f"    translation: {_ts_str(p['translation'])},\n"
        f"    explanation:\n"
        f"      {_ts_str(p['explanation'])},\n"
        f"    pieces: [\n{pieces_block}\n    ],\n"
        f"    validOrders: [\n{orders_block}\n    ],\n"
        f"    grammarNotes: [\n{notes_block}\n    ],\n"
        f"  }}"
    )


def write_ts_file(puzzles: list[dict], deck: str, output_path: str) -> None:
    entries = ",\n".join(puzzle_to_ts(p) for p in puzzles)
    content = (
        f'import type {{ SentencePuzzle }} from "../types/puzzle";\n\n'
        f'// Auto-generated from Anki deck: {deck}\n'
        f'// To regenerate: python scripts/anki_to_puzzle.py --deck "{deck}"\n\n'
        f"export const ankiPuzzles: SentencePuzzle[] = [\n"
        f"{entries},\n"
        f"];\n"
    )
    with open(output_path, "w", encoding="utf-8") as fh:
        fh.write(content)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert Anki sentences to bunpoukisoku-no-geemu TypeScript format.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--list-decks", action="store_true", help="List available Anki decks and exit.")
    parser.add_argument("--list-models", action="store_true", help="List available Ollama models and exit.")
    parser.add_argument("--deck", metavar="NAME", help="Deck to export.")
    parser.add_argument("--field", default="Sentence", metavar="FIELD",
                        help="Card field containing the Japanese sentence (default: Sentence).")
    parser.add_argument("--model", default=DEFAULT_MODEL, metavar="MODEL",
                        help=f"Ollama model to use (default: {DEFAULT_MODEL}).")
    parser.add_argument("--ollama-url", default=DEFAULT_OLLAMA_URL, metavar="URL",
                        help=f"Ollama base URL (default: {DEFAULT_OLLAMA_URL}).")
    parser.add_argument("--output", metavar="FILE", default="src/data/anki_puzzles.ts",
                        help="Output TypeScript file (default: src/data/anki_puzzles.ts).")
    parser.add_argument("--start-index", type=int, default=100, metavar="N",
                        help="Starting sentence index for IDs, e.g. 100 --> sentence-100 (default: 100).")
    parser.add_argument("--limit", type=int, default=None, metavar="N",
                        help="Maximum number of sentences to process.")
    args = parser.parse_args()

    # --list-models
    if args.list_models:
        models = list_ollama_models(args.ollama_url)
        print("Available Ollama models:")
        for m in models:
            print(f"  • {m}")
        return

    # --list-decks
    if args.list_decks:
        decks = list_decks()
        print("Available Anki decks:")
        for d in decks:
            print(f"  • {d}")
        return

    if not args.deck:
        parser.print_help()
        sys.exit(1)

    # Fetch sentences
    print(f"Connecting to AnkiConnect…")
    sentences = get_sentences_from_deck(args.deck, args.field)
    if not sentences:
        print(f"No sentences found in deck \"{args.deck}\" with field \"{args.field}\".")
        sys.exit(1)

    if args.limit:
        sentences = sentences[: args.limit]

    print(f"Found {len(sentences)} sentence(s). Using model: {args.model}\n")

    puzzles: list[dict] = []

    for i, sentence in enumerate(sentences):
        idx = args.start_index + i
        print(f"  [{i + 1}/{len(sentences)}] {sentence}")
        try:
            puzzle = decompose(sentence, idx, args.model, args.ollama_url)
            puzzles.append(puzzle)
        except Exception as exc:
            print(f"    WARNING: skipped - {exc}")

    if not puzzles:
        print("\nNo puzzles were generated.")
        sys.exit(1)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    write_ts_file(puzzles, args.deck, args.output)
    print(f"\n✓ {len(puzzles)} puzzle(s) written to '{args.output}'.")
    print(
        "\nNext steps:\n"
        f"  1. Review '{args.output}' and adjust any pieces or validOrders if needed.\n"
        "  2. In src/data/sentences.ts (or App.tsx), import ankiPuzzles and spread\n"
        "     it into sentencePuzzles:\n\n"
        "       import { ankiPuzzles } from './anki_puzzles';\n"
        "       export const allPuzzles = [...sentencePuzzles, ...ankiPuzzles];\n"
    )


if __name__ == "__main__":
    main()
