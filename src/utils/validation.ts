import type { PuzzlePiece, ValidationResult } from "../types/puzzle";

export function canConnect(leftPiece: PuzzlePiece, rightPiece: PuzzlePiece): boolean {
  return (
    leftPiece.acceptsRight.includes(rightPiece.grammarType) &&
    rightPiece.acceptsLeft.includes(leftPiece.grammarType)
  );
}

export function validatePieces(pieces: PuzzlePiece[]): ValidationResult {
  const correctPositions = pieces.filter((piece, index) => piece.correctIndex === index).length;
  const invalidConnections: number[] = [];

  for (let index = 0; index < pieces.length - 1; index += 1) {
    if (!canConnect(pieces[index], pieces[index + 1])) {
      invalidConnections.push(index);
    }
  }

  return {
    isCorrect: correctPositions === pieces.length,
    correctPositions,
    invalidConnections,
  };
}
