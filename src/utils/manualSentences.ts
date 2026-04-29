import type { SentencePuzzle } from "../types/puzzle";

const MANUAL_PUZZLES_KEY = "bunpou_manual_puzzles";

export function loadManualPuzzles(): SentencePuzzle[] {
  try {
    const raw = localStorage.getItem(MANUAL_PUZZLES_KEY);
    return raw ? (JSON.parse(raw) as SentencePuzzle[]) : [];
  } catch {
    return [];
  }
}

export function saveManualPuzzles(puzzles: SentencePuzzle[]): void {
  localStorage.setItem(MANUAL_PUZZLES_KEY, JSON.stringify(puzzles));
}

export function deleteManualPuzzle(id: string): SentencePuzzle[] {
  const updated = loadManualPuzzles().filter((p) => p.id !== id);
  saveManualPuzzles(updated);
  return updated;
}
