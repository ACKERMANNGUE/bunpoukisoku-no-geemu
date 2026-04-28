import { useMemo, useState } from "react";
import { ArrowRight, Check, Eye, RefreshCw, Shuffle } from "lucide-react";
import { sentencePuzzles } from "../data/sentences";
import type { PuzzlePiece as PuzzlePieceType, SentencePuzzle } from "../types/puzzle";
import { shuffleArray } from "../utils/shuffle";
import { validatePieces } from "../utils/validation";
import { loadCachedPuzzles } from "../utils/ankiCache";
import { PuzzlePiece } from "./PuzzlePiece";
import { ProgressPanel } from "./ProgressPanel";
import { SentenceResult } from "./SentenceResult";
import { AnkiSync } from "./AnkiSync";

function getRandomSentence(pool: SentencePuzzle[], currentId?: string): SentencePuzzle {
  const candidates = pool.filter((sentence) => sentence.id !== currentId);
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function initializePieces(sentence: SentencePuzzle): PuzzlePieceType[] {
  return shuffleArray(sentence.pieces);
}

export function PuzzleBoard() {
  const [ankiPuzzles, setAnkiPuzzles] = useState<SentencePuzzle[]>(() => loadCachedPuzzles());

  const allPuzzles = useMemo(
    () => [...sentencePuzzles, ...ankiPuzzles],
    [ankiPuzzles],
  );

  const [currentSentence, setCurrentSentence] = useState<SentencePuzzle>(() =>
    getRandomSentence(allPuzzles),
  );
  const [pieces, setPieces] = useState<PuzzlePieceType[]>(() => initializePieces(currentSentence));
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
    const nextSentence = getRandomSentence(allPuzzles, currentSentence.id);
    setCurrentSentence(nextSentence);
    setPieces(initializePieces(nextSentence));
    setDraggedIndex(null);
    setHasSubmitted(false);
    setIsAnswerRevealed(false);
  }

  function handleSubmit(): void {
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
            Déplacez les morceaux pour reformer la phrase. Les couleurs et connexions indiquent les rôles grammaticaux.
          </p>
          <div className="hero-actions">
            <AnkiSync
              onSyncComplete={(puzzles) => {
                setAnkiPuzzles(puzzles);
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
        </div>
        <button className="secondary-button" type="button" onClick={resetCurrentSentence}>
          <Shuffle size={18} />
          Mélanger
        </button>
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
