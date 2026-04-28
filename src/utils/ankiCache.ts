import type { SentencePuzzle } from "../types/puzzle";

const PUZZLES_KEY = "bunpou_anki_puzzles";
const LAST_SYNC_KEY = "bunpou_anki_last_sync";

export type AnkiSyncConfig = {
  deck: string;
  field: string;
  ollamaUrl: string;
  model: string;
  fetchLimit: number;
};

const CONFIG_KEY = "bunpou_anki_config";
const CONFIG_DEFAULTS: AnkiSyncConfig = {
  deck: "",
  field: "Sentence",
  ollamaUrl: "http://localhost:11434",
  model: "qwen2.5:7b",
  fetchLimit: 20,
};

export function loadCachedPuzzles(): SentencePuzzle[] {
  try {
    const raw = localStorage.getItem(PUZZLES_KEY);
    return raw ? (JSON.parse(raw) as SentencePuzzle[]) : [];
  } catch {
    return [];
  }
}

export function saveCachedPuzzles(puzzles: SentencePuzzle[]): void {
  localStorage.setItem(PUZZLES_KEY, JSON.stringify(puzzles));
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
}

export function clearCachedPuzzles(): void {
  localStorage.removeItem(PUZZLES_KEY);
  localStorage.removeItem(LAST_SYNC_KEY);
}

export function lastSyncDate(): Date | null {
  const raw = localStorage.getItem(LAST_SYNC_KEY);
  return raw ? new Date(raw) : null;
}

export function loadSyncConfig(): AnkiSyncConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...CONFIG_DEFAULTS, ...(JSON.parse(raw) as Partial<AnkiSyncConfig>) } : CONFIG_DEFAULTS;
  } catch {
    return CONFIG_DEFAULTS;
  }
}

export function saveSyncConfig(config: AnkiSyncConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
