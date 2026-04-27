import { useMemo, useState } from "react";
import { ArrowRight, Check, RefreshCw, Shuffle } from "lucide-react";
import { sentencePuzzles } from "../data/sentences";
import type { PuzzlePiece as PuzzlePieceType, SentencePuzzle } from "../types/puzzle";
import { shuffleArray } from "../utils/shuffle";
import { validatePieces } from "../utils/validation";
import { PuzzlePiece } from "./PuzzlePiece";
import { ProgressPanel } from "./ProgressPanel";
import { SentenceResult } from "./SentenceResult";

function getRandomSentence(currentId?: string): SentencePuzzle {
  const candidates = sentencePuzzles.filter((sentence) => sentence.id !== currentId);
  const pool = candidates.length > 0 ? candidates : sentencePuzzles;
  return pool[Math.floor(Math.random() * pool.length)];
}

function initializePieces(sentence: SentencePuzzle): PuzzlePieceType[] {
  return shuffleArray(sentence.pieces);
}

export function PuzzleBoard() {
  const [currentSentence, setCurrentSentence] = useState<SentencePuzzle>(() => getRandomSentence());
  const [pieces, setPieces] = useState<PuzzlePieceType[]>(() => initializePieces(currentSentence));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const validationResult = useMemo(() => validatePieces(pieces), [pieces]);

  function resetCurrentSentence(): void {
    setPieces(initializePieces(currentSentence));
    setDraggedIndex(null);
    setHasSubmitted(false);
  }

  function loadNextSentence(): void {
    const nextSentence = getRandomSentence(currentSentence.id);
    setCurrentSentence(nextSentence);
    setPieces(initializePieces(nextSentence));
    setDraggedIndex(null);
    setHasSubmitted(false);
  }

  function handleSubmit(): void {
    setHasSubmitted(true);

    if (validationResult.isCorrect) {
      setCompletedCount((previousValue) => previousValue + 1);
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
            Déplacez les morceaux pour reformer la phrase. Les formes, couleurs et connexions indiquent les rôles grammaticaux.
          </p>
        </div>
        <div className="hero-meta">
          <span>Niveau {currentSentence.level}</span>
          <strong>{completedCount}</strong>
          <small>phrases terminées</small>
        </div>
      </section>

      <section className="target-card">
        <div>
          <span className="card-label">Traduction cible</span>
          <p>{currentSentence.translation}</p>
        </div>
        <button className="secondary-button" type="button" onClick={resetCurrentSentence}>
          <Shuffle size={18} />
          Mélanger
        </button>
      </section>

      <section className="assembled-card">
        <span className="card-label">Phrase assemblée</span>
        <p>{assembledSentence}</p>
      </section>

      <section className="board-card">
        <div className="piece-list">
          {pieces.map((piece, index) => (
            <PuzzlePiece
              key={piece.id}
              piece={piece}
              index={index}
              isCorrectPosition={hasSubmitted && piece.correctIndex === index}
              isConnectionInvalid={hasSubmitted && validationResult.invalidConnections.includes(index)}
              onDragStart={setDraggedIndex}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </section>

      <ProgressPanel result={validationResult} totalPieces={pieces.length} hasSubmitted={hasSubmitted} />

      <section className="actions-card">
        <button className="primary-button" type="button" onClick={handleSubmit}>
          <Check size={18} />
          Vérifier
        </button>
        <button className="secondary-button" type="button" onClick={resetCurrentSentence}>
          <RefreshCw size={18} />
          Recommencer
        </button>
        <button className="secondary-button" type="button" onClick={loadNextSentence}>
          <ArrowRight size={18} />
          Phrase suivante
        </button>
      </section>

      <SentenceResult sentence={currentSentence} isVisible={hasSubmitted && validationResult.isCorrect} />
    </main>
  );
}
