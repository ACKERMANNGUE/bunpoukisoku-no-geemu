import { useMemo, useState } from "react";
import { ArrowRight, Check, CheckCheck, Eye, RefreshCw, Shuffle } from "lucide-react";
import { sentencePuzzles } from "../data/sentences";
import type { PuzzlePiece as PuzzlePieceType, SentencePuzzle } from "../types/puzzle";
import { shuffleArray } from "../utils/shuffle";
import { validatePieces } from "../utils/validation";
import { loadCachedPuzzles } from "../utils/ankiCache";
import { PuzzlePiece } from "./PuzzlePiece";
import { ProgressPanel } from "./ProgressPanel";
import { SentenceResult } from "./SentenceResult";
import { AnkiSync } from "./AnkiSync";
import { SentencesGenSync, loadGenPuzzles } from "./SentencesGenSync";

function getRandomSentence(pool: SentencePuzzle[], currentId?: string): SentencePuzzle {
  const candidates = pool.filter((sentence) => sentence.id !== currentId);
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function buildInitialState() {
  const all = [...sentencePuzzles, ...loadCachedPuzzles(), ...loadGenPuzzles()];
  const shuffled = shuffleArray(all.length > 0 ? all : sentencePuzzles);
  return {
    current: shuffled[0],
    pending: shuffled.slice(1).map((p) => p.id),
    cycleTotal: shuffled.length,
  };
}

function initializePieces(sentence: SentencePuzzle): PuzzlePieceType[] {
  return shuffleArray(sentence.pieces);
}

export function PuzzleBoard() {
  const [ankiPuzzles, setAnkiPuzzles] = useState<SentencePuzzle[]>(() => loadCachedPuzzles());
  const [genPuzzles, setGenPuzzles] = useState<SentencePuzzle[]>(() => loadGenPuzzles());

  const allPuzzles = useMemo(
    () => [...sentencePuzzles, ...ankiPuzzles, ...genPuzzles],
    [ankiPuzzles, genPuzzles],
  );

  const [initState] = useState(buildInitialState);
  const [currentSentence, setCurrentSentence] = useState<SentencePuzzle>(initState.current);
  const [pendingIds, setPendingIds] = useState<string[]>(initState.pending);
  const [cycleTotal, setCycleTotal] = useState(initState.cycleTotal);
  const [cycleJustReset, setCycleJustReset] = useState(false);
  const [pieces, setPieces] = useState<PuzzlePieceType[]>(() => initializePieces(initState.current));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [completedByLevel, setCompletedByLevel] = useState<Record<"N5" | "N4" | "N3" | "N2" | "N1", number>>({ N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 });

  const validationResult = useMemo(() => validatePieces(pieces, currentSentence.validOrders), [pieces, currentSentence]);

  function resetCurrentSentence(): void {
    setPieces(initializePieces(currentSentence));
    setDraggedIndex(null);
    setHasSubmitted(false);
    setIsAnswerRevealed(false);
  }

  function loadNextSentence(): void {
    setCycleJustReset(false);
    let nextSentence: SentencePuzzle;
    if (pendingIds.length === 0) {
      nextSentence = getRandomSentence(allPuzzles, currentSentence.id);
    } else {
      const nextId = pendingIds[0];
      nextSentence = allPuzzles.find((p) => p.id === nextId) ?? getRandomSentence(allPuzzles, currentSentence.id);
      setPendingIds([...pendingIds.slice(1), currentSentence.id]);
    }
    setCurrentSentence(nextSentence);
    setPieces(initializePieces(nextSentence));
    setDraggedIndex(null);
    setHasSubmitted(false);
    setIsAnswerRevealed(false);
  }

  function dismissCurrentAndNext(): void {
    let nextSentence: SentencePuzzle;
    if (pendingIds.length === 0) {
      const newShuffled = shuffleArray([...allPuzzles]);
      nextSentence = newShuffled[0] ?? currentSentence;
      setCycleTotal(newShuffled.length);
      setPendingIds(newShuffled.slice(1).map((p) => p.id));
      setCycleJustReset(true);
    } else {
      const nextId = pendingIds[0];
      nextSentence = allPuzzles.find((p) => p.id === nextId) ?? getRandomSentence(allPuzzles, currentSentence.id);
      setPendingIds(pendingIds.slice(1));
      setCycleJustReset(false);
    }
    setCurrentSentence(nextSentence);
    setPieces(initializePieces(nextSentence));
    setDraggedIndex(null);
    setHasSubmitted(false);
    setIsAnswerRevealed(false);
  }

  function handleSubmit(): void {
    setCycleJustReset(false);
    setHasSubmitted(true);

    if (validationResult.isCorrect) {
      setCompletedByLevel((prev) => ({ ...prev, [currentSentence.level]: prev[currentSentence.level] + 1 }));
    }
  }

  function handleDrop(targetIndex: number): void {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      return;
    }

    setPieces((previousPieces) => {
      const updatedPieces = [...previousPieces];
      const [movedPiece] = updatedPieces.splice(draggedIndex, 1);
      updatedPieces.splice(targetIndex, 0, movedPiece);
      return updatedPieces;
    });

    setDraggedIndex(null);
    setHasSubmitted(false);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
  }

  const assembledSentence = pieces.map((piece) => piece.text).join("");

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">文法規則のゲーム</p>
          <h1>Reconstruisez la phrase japonaise</h1>
          <p className="hero-description">
            Déplacez les morceaux pour reformer la phrase. Les couleurs indiquent les rôles grammaticaux.
          </p>
          <div className="hero-actions">
            <AnkiSync
              onSyncComplete={(puzzles) => {
                setAnkiPuzzles(puzzles);
              }}
            />
            <SentencesGenSync
              onSyncComplete={(puzzles) => {
                setGenPuzzles(puzzles);
              }}
            />
          </div>
        </div>
        <div className="hero-meta">
          <small className="hero-meta-label">phrases terminées</small>
          <table className="level-table">
            <thead>
              <tr>
                {(["N5", "N4", "N3", "N2", "N1"] as const).map((lvl) => (
                  <th key={lvl}>{lvl}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {(["N5", "N4", "N3", "N2", "N1"] as const).map((lvl) => (
                  <td key={lvl}>{completedByLevel[lvl]}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="target-card">
        <div>
          <span className="card-label">Traduction cible - {currentSentence.level}</span>
          <p>{currentSentence.translation}</p>
          {cycleJustReset && (
            <p className="cycle-reset-notice">🎉 Toutes les phrases validées ! Nouveau cycle démarré.</p>
          )}
        </div>
        <div className="target-card-side">
          <span className="queue-counter" title={`Phrases dans la file (dont celle-ci) : ${pendingIds.length + 1} / ${cycleTotal}`}>
            {pendingIds.length + 1} / {cycleTotal}
          </span>
          <button className="secondary-button" type="button" onClick={resetCurrentSentence}>
            <Shuffle size={18} />
            Mélanger
          </button>
        </div>
      </section>

      <section className="assembled-card">
        <span className="card-label">Phrase assemblée actuellement</span>
        <p>{assembledSentence}</p>
      </section>

      <ProgressPanel result={validationResult} totalPieces={pieces.length} totalValidOrders={currentSentence.validOrders.length} hasSubmitted={hasSubmitted} />

      <section className="board-card">
        <div className="piece-list">
          {pieces.map((piece, index) => (
            <PuzzlePiece
              key={piece.id}
              piece={piece}
              index={index}
              isCorrectPosition={hasSubmitted && validationResult.bestOrderIds[index] === piece.id}
              isConnectionInvalid={hasSubmitted && validationResult.invalidConnections.includes(index)}
              onDragStart={setDraggedIndex}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </section>

      <section className="actions-card">
        <button className="primary-button" type="button" onClick={handleSubmit}>
          <Check size={18} />
          Vérifier
        </button>
        <button className="secondary-button" type="button" onClick={resetCurrentSentence}>
          <RefreshCw size={18} />
          Recommencer
        </button>
        {!validationResult.isCorrect && (
          <button className="secondary-button reveal-button" type="button" onClick={() => setIsAnswerRevealed(true)}>
            <Eye size={18} />
            Voir la réponse
          </button>
        )}
        <button className="secondary-button" type="button" onClick={loadNextSentence}>
          <ArrowRight size={18} />
          Phrase suivante
        </button>
        {((hasSubmitted && validationResult.isCorrect) || isAnswerRevealed) && (
          <button className="secondary-button success-button" type="button" onClick={dismissCurrentAndNext}>
            <CheckCheck size={18} />
            Retirer de la file
          </button>
        )}
      </section>

      <SentenceResult
        sentence={currentSentence}
        isVisible={(hasSubmitted && validationResult.isCorrect) || isAnswerRevealed}
        matchedOrderIndex={validationResult.matchedOrderIndex}
        isAnswerRevealed={isAnswerRevealed && !validationResult.isCorrect}
      />
    </main>
  );
}
