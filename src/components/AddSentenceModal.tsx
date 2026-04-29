import { FilePlus2, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GrammarType, SentencePuzzle } from "../types/puzzle";
import { loadManualPuzzles, saveManualPuzzles } from "../utils/manualSentences";

const ALL_GRAMMAR_TYPES: GrammarType[] = [
  "noun",
  "pronoun",
  "topicParticle",
  "subjectParticle",
  "objectParticle",
  "locationParticle",
  "directionParticle",
  "comitativeParticle",
  "possessiveParticle",
  "quoteParticle",
  "timeExpression",
  "adverb",
  "frequencyAdverb",
  "adjective",
  "verb",
  "teForm",
  "auxiliary",
  "clauseConnector",
  "nominalizer",
  "interjection",
  "copula",
  "sentenceFinalParticle",
];

const GRAMMAR_TYPE_LABELS: Record<GrammarType, string> = {
  noun: "Nom",
  pronoun: "Pronom",
  topicParticle: "Particule de thème",
  subjectParticle: "Particule de sujet",
  objectParticle: "Particule d'objet",
  locationParticle: "Particule de lieu",
  directionParticle: "Particule de direction",
  comitativeParticle: "Particule comitative",
  possessiveParticle: "Particule possessive",
  quoteParticle: "Particule de citation",
  timeExpression: "Expression temporelle",
  adverb: "Adverbe",
  frequencyAdverb: "Adverbe de fréquence",
  adjective: "Adjectif",
  verb: "Verbe",
  teForm: "Forme en て",
  auxiliary: "Auxiliaire",
  clauseConnector: "Connecteur de proposition",
  nominalizer: "Nominalisateur",
  interjection: "Interjection",
  copula: "Copule",
  sentenceFinalParticle: "Particule finale",
};

type PieceForm = {
  key: string;
  text: string;
  reading: string;
  meaning: string;
  grammarType: GrammarType;
  acceptsLeft: GrammarType[];
  acceptsRight: GrammarType[];
};

type GrammarNoteForm = {
  key: string;
  rule: string;
  explanation: string;
};

type Props = {
  readonly onSave: (puzzles: SentencePuzzle[]) => void;
};

function makePiece(index: number): PieceForm {
  return {
    key: `piece-${Date.now()}-${index}`,
    text: "",
    reading: "",
    meaning: "",
    grammarType: "noun",
    acceptsLeft: [],
    acceptsRight: [],
  };
}

function makeNote(): GrammarNoteForm {
  return { key: `note-${Date.now()}`, rule: "", explanation: "" };
}

export function AddSentenceModal({ onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<"N5" | "N4" | "N3">("N5");
  const [japanese, setJapanese] = useState("");
  const [translation, setTranslation] = useState("");
  const [explanation, setExplanation] = useState("");
  const [pieces, setPieces] = useState<PieceForm[]>(() => [makePiece(0), makePiece(1)]);
  const [extraOrders, setExtraOrders] = useState<string[]>([]);
  const [grammarNotes, setGrammarNotes] = useState<GrammarNoteForm[]>(() => [makeNote()]);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function resetForm() {
    setLevel("N5");
    setJapanese("");
    setTranslation("");
    setExplanation("");
    setPieces([makePiece(0), makePiece(1)]);
    setExtraOrders([]);
    setGrammarNotes([makeNote()]);
    setError(null);
  }

  function handleOpen() {
    resetForm();
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function updatePiece(key: string, patch: Partial<PieceForm>) {
    setPieces((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }

  function removePiece(key: string) {
    setPieces((prev) => prev.filter((p) => p.key !== key));
  }

  function updateNote(key: string, patch: Partial<GrammarNoteForm>) {
    setGrammarNotes((prev) => prev.map((n) => (n.key === key ? { ...n, ...patch } : n)));
  }

  function removeNote(key: string) {
    setGrammarNotes((prev) => prev.filter((n) => n.key !== key));
  }

  function handleSave() {
    setError(null);
    if (!japanese.trim()) {
      setError("La phrase japonaise est requise.");
      return;
    }
    if (!translation.trim()) {
      setError("La traduction est requise.");
      return;
    }
    if (pieces.length < 2) {
      setError("Au moins 2 pièces sont requises.");
      return;
    }
    if (pieces.some((p) => !p.text.trim())) {
      setError("Toutes les pièces doivent avoir un texte.");
      return;
    }
    if (pieces.some((p) => !p.meaning.trim())) {
      setError("Toutes les pièces doivent avoir une signification.");
      return;
    }

    const id = `manual-${Date.now()}`;
    const builtPieces = pieces.map((p, i) => ({
      id: `${id}-p${i + 1}`,
      text: p.text.trim(),
      ...(p.reading.trim() ? { reading: p.reading.trim() } : {}),
      meaning: p.meaning.trim(),
      grammarType: p.grammarType,
      acceptsLeft: p.acceptsLeft,
      acceptsRight: p.acceptsRight,
    }));

    const defaultOrder = builtPieces.map((p) => p.id);

    const additionalOrders: string[][] = extraOrders
      .map((raw) => {
        const indices = raw.split(",").map((s) => Number.parseInt(s.trim(), 10) - 1);
        if (
          indices.length !== builtPieces.length ||
          indices.some((i) => Number.isNaN(i) || i < 0 || i >= builtPieces.length)
        ) {
          return null;
        }
        return indices.map((i) => builtPieces[i].id);
      })
      .filter((order): order is string[] => order !== null);

    const puzzle: SentencePuzzle = {
      id,
      level,
      japanese: japanese.trim(),
      translation: translation.trim(),
      explanation: explanation.trim(),
      pieces: builtPieces,
      validOrders: [defaultOrder, ...additionalOrders],
      grammarNotes: grammarNotes
        .filter((n) => n.rule.trim())
        .map((n) => ({ rule: n.rule.trim(), explanation: n.explanation.trim() })),
    };

    const existing = loadManualPuzzles();
    const updated = [...existing, puzzle];
    saveManualPuzzles(updated);
    onSave(updated);
    setOpen(false);
  }

  return (
    <>
      <button
        ref={buttonRef}
        className="secondary-button anki-toggle-button"
        type="button"
        onClick={handleOpen}
        title="Ajouter une phrase manuellement"
      >
        <FilePlus2 size={16} />
        Ajouter
      </button>

      {open &&
        createPortal(
          <div className="asm-overlay" onClick={handleClose}>
            <div
              className="asm-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal
              aria-labelledby="asm-title"
            >
              <div className="asm-header">
                <h2 id="asm-title">Ajouter une phrase manuellement</h2>
                <button
                  className="anki-close-button"
                  type="button"
                  onClick={handleClose}
                  aria-label="Fermer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="asm-body">
                {/* ── Section : Infos de base ── */}
                <section className="asm-section">
                  <h3 className="asm-section-title">Informations de base</h3>

                  <div className="anki-field-row">
                    <label htmlFor="asm-level">Niveau JLPT</label>
                    <select
                      id="asm-level"
                      value={level}
                      onChange={(e) =>
                        setLevel(e.target.value as "N5" | "N4" | "N3")
                      }
                    >
                      {(["N5", "N4", "N3"] as const).map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="anki-field-row">
                    <label htmlFor="asm-japanese">Phrase japonaise</label>
                    <input
                      id="asm-japanese"
                      type="text"
                      value={japanese}
                      onChange={(e) => setJapanese(e.target.value)}
                      placeholder="私は学生です。"
                    />
                  </div>

                  <div className="anki-field-row">
                    <label htmlFor="asm-translation">Traduction</label>
                    <input
                      id="asm-translation"
                      type="text"
                      value={translation}
                      onChange={(e) => setTranslation(e.target.value)}
                      placeholder="Je suis étudiant·e."
                    />
                  </div>

                  <div className="anki-field-row asm-field-textarea">
                    <label htmlFor="asm-explanation">Explication</label>
                    <textarea
                      id="asm-explanation"
                      rows={3}
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Décrivez la structure grammaticale de la phrase…"
                    />
                  </div>
                </section>

                {/* ── Section : Pièces ── */}
                <section className="asm-section">
                  <div className="asm-section-header">
                    <h3 className="asm-section-title">
                      Pièces{" "}
                      <span className="asm-count">({pieces.length})</span>
                    </h3>
                    <button
                      className="secondary-button asm-small-btn"
                      type="button"
                      onClick={() =>
                        setPieces((prev) => [...prev, makePiece(prev.length)])
                      }
                    >
                      <Plus size={14} />
                      Ajouter une pièce
                    </button>
                  </div>
                  <p className="asm-hint">
                    Les pièces sont mélangées pendant le jeu. L'ordre dans lequel
                    vous les listez ici est l'ordre valide par défaut.
                  </p>

                  <div className="asm-pieces">
                    {pieces.map((piece, idx) => (
                      <PieceEditor
                        key={piece.key}
                        piece={piece}
                        index={idx}
                        onUpdate={(patch) => updatePiece(piece.key, patch)}
                        onRemove={() => removePiece(piece.key)}
                        canRemove={pieces.length > 2}
                      />
                    ))}
                  </div>
                </section>

                {/* ── Section : Ordres valides supplémentaires ── */}
                <section className="asm-section">
                  <div className="asm-section-header">
                    <h3 className="asm-section-title">Ordres valides supplémentaires</h3>
                    <button
                      className="secondary-button asm-small-btn"
                      type="button"
                      onClick={() => setExtraOrders((prev) => [...prev, ""])}
                    >
                      <Plus size={14} />
                      Ajouter un ordre
                    </button>
                  </div>
                  <p className="asm-hint">
                    Entrez les numéros de pièces (1-based) séparés par des virgules.
                    Ex. pour 5 pièces :{" "}
                    <code className="asm-code">3,1,2,4,5</code>. L'ordre par
                    défaut (1,2,3…) est toujours inclus.
                  </p>

                  {extraOrders.map((order, i) => (
                    <div key={i} className="anki-field-row">
                      <label>Ordre {i + 2}</label>
                      <input
                        type="text"
                        value={order}
                        onChange={(e) =>
                          setExtraOrders((prev) =>
                            prev.map((o, j) => (j === i ? e.target.value : o)),
                          )
                        }
                        placeholder={`1,2,…,${pieces.length}`}
                      />
                      <button
                        className="danger-button asm-icon-btn"
                        type="button"
                        onClick={() =>
                          setExtraOrders((prev) => prev.filter((_, j) => j !== i))
                        }
                        aria-label="Supprimer cet ordre"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </section>

                {/* ── Section : Notes de grammaire ── */}
                <section className="asm-section">
                  <div className="asm-section-header">
                    <h3 className="asm-section-title">Notes de grammaire</h3>
                    <button
                      className="secondary-button asm-small-btn"
                      type="button"
                      onClick={() =>
                        setGrammarNotes((prev) => [...prev, makeNote()])
                      }
                    >
                      <Plus size={14} />
                      Ajouter une note
                    </button>
                  </div>

                  {grammarNotes.map((note) => (
                    <div key={note.key} className="asm-note-row">
                      <div className="anki-field-row">
                        <label>Règle</label>
                        <input
                          type="text"
                          value={note.rule}
                          onChange={(e) =>
                            updateNote(note.key, { rule: e.target.value })
                          }
                          placeholder="Ex. : Ordre SOV"
                        />
                        <button
                          className="danger-button asm-icon-btn"
                          type="button"
                          onClick={() => removeNote(note.key)}
                          aria-label="Supprimer cette note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="anki-field-row asm-field-textarea">
                        <label>Explication</label>
                        <textarea
                          rows={2}
                          value={note.explanation}
                          onChange={(e) =>
                            updateNote(note.key, { explanation: e.target.value })
                          }
                          placeholder="Détaillez la règle grammaticale…"
                        />
                      </div>
                    </div>
                  ))}
                </section>

                {error && <p className="anki-error">{error}</p>}
              </div>

              <div className="asm-footer">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleClose}
                >
                  Annuler
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={handleSave}
                >
                  <Save size={16} />
                  Enregistrer la phrase
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

// ── Sub-component: PieceEditor ──────────────────────────────

type PieceEditorProps = {
  piece: PieceForm;
  index: number;
  onUpdate: (patch: Partial<PieceForm>) => void;
  onRemove: () => void;
  canRemove: boolean;
};

function PieceEditor({
  piece,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: PieceEditorProps) {
  const [expanded, setExpanded] = useState(false);

  function toggleAccepts(
    field: "acceptsLeft" | "acceptsRight",
    type: GrammarType,
    checked: boolean,
  ) {
    const current = piece[field];
    onUpdate({
      [field]: checked ? [...current, type] : current.filter((t) => t !== type),
    });
  }

  return (
    <div className="asm-piece-card">
      <div className="asm-piece-row">
        <span className="asm-piece-index">#{index + 1}</span>

        <input
          className="asm-piece-text"
          type="text"
          value={piece.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Texte (私)"
          aria-label={`Pièce ${index + 1} – texte japonais`}
        />
        <input
          className="asm-piece-reading"
          type="text"
          value={piece.reading}
          onChange={(e) => onUpdate({ reading: e.target.value })}
          placeholder="Lecture (わたし)"
          aria-label={`Pièce ${index + 1} – lecture`}
        />
        <input
          className="asm-piece-meaning"
          type="text"
          value={piece.meaning}
          onChange={(e) => onUpdate({ meaning: e.target.value })}
          placeholder="Signification (moi)"
          aria-label={`Pièce ${index + 1} – signification`}
        />
        <select
          className="asm-piece-type"
          value={piece.grammarType}
          onChange={(e) =>
            onUpdate({ grammarType: e.target.value as GrammarType })
          }
          aria-label={`Pièce ${index + 1} – type grammatical`}
        >
          {ALL_GRAMMAR_TYPES.map((t) => (
            <option key={t} value={t}>
              {GRAMMAR_TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        <button
          className="secondary-button asm-icon-btn"
          type="button"
          title={expanded ? "Masquer les connexions" : "Configurer les connexions"}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "▲" : "▼"}
        </button>

        {canRemove && (
          <button
            className="danger-button asm-icon-btn"
            type="button"
            onClick={onRemove}
            aria-label={`Supprimer la pièce ${index + 1}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {expanded && (
        <div className="asm-piece-connections">
          <ConnectionColumn
            label="Accepte à gauche"
            selected={piece.acceptsLeft}
            onChange={(type, checked) =>
              toggleAccepts("acceptsLeft", type, checked)
            }
          />
          <ConnectionColumn
            label="Accepte à droite"
            selected={piece.acceptsRight}
            onChange={(type, checked) =>
              toggleAccepts("acceptsRight", type, checked)
            }
          />
        </div>
      )}
    </div>
  );
}

// ── Sub-component: ConnectionColumn ────────────────────────

type ConnectionColumnProps = {
  label: string;
  selected: GrammarType[];
  onChange: (type: GrammarType, checked: boolean) => void;
};

function ConnectionColumn({ label, selected, onChange }: ConnectionColumnProps) {
  return (
    <div className="asm-conn-col">
      <strong className="asm-conn-label">{label}</strong>
      <div className="asm-checkbox-grid">
        {ALL_GRAMMAR_TYPES.map((t) => (
          <label key={t} className="asm-checkbox-item">
            <input
              type="checkbox"
              checked={selected.includes(t)}
              onChange={(e) => onChange(t, e.target.checked)}
            />
            <span>{GRAMMAR_TYPE_LABELS[t]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
