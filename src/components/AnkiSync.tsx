import { RefreshCw, Settings, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SentencePuzzle } from "../types/puzzle";
import { ankiDeckNames, ankiGetSentences } from "../utils/ankiConnect";
import { clearCachedPuzzles, lastSyncDate, loadSyncConfig, saveCachedPuzzles, saveSyncConfig } from "../utils/ankiCache";
import { DEFAULT_OLLAMA_MODEL, DEFAULT_OLLAMA_URL, ollamaDecompose } from "../utils/ollamaDecompose";

type SyncStatus =
  | { type: "idle" }
  | { type: "running"; done: number; total: number; current: string }
  | { type: "done"; count: number }
  | { type: "error"; message: string };

type Props = {
  readonly onSyncComplete: (puzzles: SentencePuzzle[]) => void;
};

export function AnkiSync({ onSyncComplete }: Props) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState(loadSyncConfig);
  const [status, setStatus] = useState<SyncStatus>({ type: "idle" });
  const [decks, setDecks] = useState<string[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(lastSyncDate);
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  // Load deck list when panel opens
  useEffect(() => {
    if (!open || decks.length > 0) return;
    ankiDeckNames()
      .then(setDecks)
      .catch(() => setDecks([]));
  }, [open, decks.length]);

  // Position panel below the toggle button
  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPanelStyle({ top: rect.bottom + 10, left: rect.left });
  }, [open]);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function handleConfigChange(patch: Partial<typeof config>) {
    const next = { ...config, ...patch };
    setConfig(next);
    saveSyncConfig(next);
  }

  async function handleSync() {
    if (!config.deck) {
      setStatus({ type: "error", message: "Choisissez un deck Anki." });
      return;
    }

    abortRef.current = false;
    setStatus({ type: "running", done: 0, total: 0, current: "Récupération des cartes…" });

    try {
      const sentences = await ankiGetSentences(config.deck, config.field);
      if (!sentences.length) {
        setStatus({ type: "error", message: `Aucune phrase trouvée dans « ${config.deck} » (champ : ${config.field}).` });
        return;
      }

      const puzzles: SentencePuzzle[] = [];

      for (let i = 0; i < sentences.length; i++) {
        if (abortRef.current) break;
        const sentence = sentences[i];
        setStatus({ type: "running", done: i, total: sentences.length, current: sentence });
        try {
          const puzzle = await ollamaDecompose(sentence, config.ollamaUrl, config.model);
          puzzles.push(puzzle);
        } catch {
          // Skip sentences that fail to parse - non-fatal
        }
      }

      saveCachedPuzzles(puzzles);
      const now = new Date();
      setLastSync(now);
      setStatus({ type: "done", count: puzzles.length });
      onSyncComplete(puzzles);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ type: "error", message });
    }
  }

  function handleClear() {
    clearCachedPuzzles();
    setLastSync(null);
    setStatus({ type: "idle" });
    onSyncComplete([]);
  }

  const isRunning = status.type === "running";

  return (
    <>
      <button
        ref={buttonRef}
        className="secondary-button anki-toggle-button"
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Synchroniser avec Anki"
      >
        <Settings size={16} />
        Anki
        {lastSync && <span className="anki-sync-badge" />}
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="anki-panel"
          style={{ top: panelStyle.top, left: panelStyle.left }}
        >
          <div className="anki-panel-header">
            <span>Synchronisation Anki</span>
            <button className="anki-close-button" type="button" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="anki-panel-body">
            <div className="anki-field-row">
              <label htmlFor="anki-deck">Deck</label>
              {decks.length > 0 ? (
                <select
                  id="anki-deck"
                  value={config.deck}
                  onChange={(e) => handleConfigChange({ deck: e.target.value })}
                >
                  <option value="">- choisir un deck -</option>
                  {decks.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="anki-deck"
                  type="text"
                  placeholder="Nom du deck"
                  value={config.deck}
                  onChange={(e) => handleConfigChange({ deck: e.target.value })}
                />
              )}
            </div>

            <div className="anki-field-row">
              <label htmlFor="anki-field">Champ</label>
              <input
                id="anki-field"
                type="text"
                placeholder="Sentence"
                value={config.field}
                onChange={(e) => handleConfigChange({ field: e.target.value })}
              />
            </div>

            <div className="anki-field-row">
              <label htmlFor="anki-model">Modèle Ollama</label>
              <input
                id="anki-model"
                type="text"
                placeholder={DEFAULT_OLLAMA_MODEL}
                value={config.model}
                onChange={(e) => handleConfigChange({ model: e.target.value })}
              />
            </div>

            <div className="anki-field-row">
              <label htmlFor="anki-url">URL Ollama</label>
              <input
                id="anki-url"
                type="text"
                placeholder={DEFAULT_OLLAMA_URL}
                value={config.ollamaUrl}
                onChange={(e) => handleConfigChange({ ollamaUrl: e.target.value })}
              />
            </div>

            {lastSync && (
              <p className="anki-last-sync">
                Dernière sync : {lastSync.toLocaleString("fr-FR")}
              </p>
            )}

            {status.type === "error" && (
              <p className="anki-error">{status.message}</p>
            )}

            {status.type === "running" && (
              <div className="anki-progress">
                <div className="anki-progress-bar">
                  <div
                    className="anki-progress-fill"
                    style={{ width: status.total ? `${(status.done / status.total) * 100}%` : "4%" }}
                  />
                </div>
                <p className="anki-progress-label">
                  {status.total ? `${status.done} / ${status.total}` : "…"} - {status.current}
                </p>
              </div>
            )}

            {status.type === "done" && (
              <p className="anki-success">
                {status.count} phrase{status.count === 1 ? "" : "s"} importée{status.count === 1 ? "" : "s"} avec succès.
              </p>
            )}
          </div>

          <div className="anki-panel-footer">
            <button
              className="primary-button"
              type="button"
              onClick={handleSync}
              disabled={isRunning}
            >
              <RefreshCw size={16} className={isRunning ? "spin" : ""} />
              {isRunning ? "Synchronisation…" : "Synchroniser avec Anki"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={handleClear}
              disabled={isRunning}
              title="Supprimer les phrases importées"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      , document.body)}
    </>
  );
}
