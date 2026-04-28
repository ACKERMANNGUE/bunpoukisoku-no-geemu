import { RefreshCw, Sparkles, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { sentencePuzzles } from "../data/sentences";
import type { SentencePuzzle } from "../types/puzzle";
import { loadSyncConfig, saveSyncConfig } from "../utils/ankiCache";
import { DEFAULT_OLLAMA_MODEL, DEFAULT_OLLAMA_URL, ollamaDecompose, ollamaGenerateSentences } from "../utils/ollamaDecompose";

const GEN_PUZZLES_KEY = "bunpou_gen_puzzles";
const GEN_LAST_SYNC_KEY = "bunpou_gen_last_sync";

function loadGenPuzzles(): SentencePuzzle[] {
  try {
    const raw = localStorage.getItem(GEN_PUZZLES_KEY);
    return raw ? (JSON.parse(raw) as SentencePuzzle[]) : [];
  } catch {
    return [];
  }
}

function saveGenPuzzles(puzzles: SentencePuzzle[]): void {
  localStorage.setItem(GEN_PUZZLES_KEY, JSON.stringify(puzzles));
  localStorage.setItem(GEN_LAST_SYNC_KEY, new Date().toISOString());
}

function clearGenPuzzles(): void {
  localStorage.removeItem(GEN_PUZZLES_KEY);
  localStorage.removeItem(GEN_LAST_SYNC_KEY);
}

function lastGenDate(): Date | null {
  const raw = localStorage.getItem(GEN_LAST_SYNC_KEY);
  return raw ? new Date(raw) : null;
}

type GenStatus =
  | { type: "idle" }
  | { type: "running"; done: number; total: number; current: string }
  | { type: "done"; count: number }
  | { type: "error"; message: string };

type Props = {
  readonly onSyncComplete: (puzzles: SentencePuzzle[]) => void;
};

export function SentencesGenSync({ onSyncComplete }: Props) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState(loadSyncConfig);
  const [count, setCount] = useState(5);
  const [status, setStatus] = useState<GenStatus>({ type: "idle" });
  const [lastSync, setLastSync] = useState<Date | null>(lastGenDate);
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPanelStyle({ top: rect.bottom + 10, left: rect.left });
  }, [open]);

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

  function handleConfigChange(patch: Partial<ReturnType<typeof loadSyncConfig>>) {
    const next = { ...config, ...patch };
    setConfig(next);
    saveSyncConfig(next);
  }

  async function handleGenerate() {
    abortRef.current = false;
    const examples = sentencePuzzles.map((p) => p.japanese);

    setStatus({ type: "running", done: 0, total: 0, current: "Génération des nouvelles phrases…" });

    let newSentences: string[];
    try {
      newSentences = await ollamaGenerateSentences(count, examples, config.ollamaUrl, config.model);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ type: "error", message: `Erreur lors de la génération : ${message}` });
      return;
    }

    if (newSentences.length === 0) {
      setStatus({ type: "error", message: "Ollama n'a retourné aucune phrase." });
      return;
    }

    const puzzles: SentencePuzzle[] = [];

    try {
      for (let i = 0; i < newSentences.length; i++) {
        if (abortRef.current) break;
        const sentence = newSentences[i];
        setStatus({ type: "running", done: i, total: newSentences.length, current: sentence });
        try {
          const puzzle = await ollamaDecompose(sentence, config.ollamaUrl, config.model);
          puzzles.push(puzzle);
        } catch {
          // Skip sentences that fail to parse — non-fatal
        }
      }

      saveGenPuzzles(puzzles);
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
    clearGenPuzzles();
    setLastSync(null);
    setStatus({ type: "idle" });
    onSyncComplete([]);
  }

  function handleAbort() {
    abortRef.current = true;
  }

  const isRunning = status.type === "running";

  return (
    <>
      <button
        ref={buttonRef}
        className="secondary-button anki-toggle-button"
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Générer de nouvelles phrases japonaises via Ollama"
      >
        <Sparkles size={16} />
        Générer
        {lastSync && <span className="anki-sync-badge" />}
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="anki-panel"
          style={{ top: panelStyle.top, left: panelStyle.left }}
        >
          <div className="anki-panel-header">
            <span>Nouvelles phrases par Ollama</span>
            <button className="anki-close-button" type="button" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="anki-panel-body">
            <p className="anki-last-sync" style={{ marginTop: 0 }}>
              Ollama génère de nouvelles phrases inspirées des {sentencePuzzles.length} exemples, puis les décompose.
            </p>

            <div className="anki-field-row">
              <label htmlFor="gen-count">Nb de phrases</label>
              <input
                id="gen-count"
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, Number.parseInt(e.target.value, 10) || 1)))}
              />
            </div>
            <div className="anki-field-row">
              <label htmlFor="gen-model">Modèle Ollama</label>
              <input
                id="gen-model"
                type="text"
                placeholder={DEFAULT_OLLAMA_MODEL}
                value={config.model}
                onChange={(e) => handleConfigChange({ model: e.target.value })}
              />
            </div>

            <div className="anki-field-row">
              <label htmlFor="gen-url">URL Ollama</label>
              <input
                id="gen-url"
                type="text"
                placeholder={DEFAULT_OLLAMA_URL}
                value={config.ollamaUrl}
                onChange={(e) => handleConfigChange({ ollamaUrl: e.target.value })}
              />
            </div>

            {lastSync && (
              <p className="anki-last-sync">
                Dernière génération : {lastSync.toLocaleString("fr-FR")}
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
                    style={{ width: `${(status.done / status.total) * 100}%` }}
                  />
                </div>
                <p className="anki-progress-label">
                  {status.done} / {status.total} - {status.current}
                </p>
              </div>
            )}

            {status.type === "done" && (
              <p className="anki-success">
                {status.count} phrase{status.count === 1 ? "" : "s"} générée{status.count === 1 ? "" : "s"} avec succès.
              </p>
            )}
          </div>

          <div className="anki-panel-footer">
            {isRunning ? (
              <button
                className="danger-button"
                type="button"
                onClick={handleAbort}
              >
                <X size={16} />
                Arrêter
              </button>
            ) : (
              <>
                <button
                  className="primary-button"
                  type="button"
                  onClick={handleGenerate}
                >
                  <RefreshCw size={16} />
                  {`Générer ${count} phrase${count > 1 ? "s" : ""}`}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleClear}
                  title="Supprimer les phrases générées"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      , document.body)}
    </>
  );
}

export { loadGenPuzzles };
