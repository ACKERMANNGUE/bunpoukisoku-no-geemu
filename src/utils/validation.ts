import type { PuzzlePiece, ValidationResult } from "../types/puzzle";

export function canConnect(leftPiece: PuzzlePiece, rightPiece: PuzzlePiece): boolean {
  return (
    leftPiece.acceptsRight.includes(rightPiece.grammarType) &&
    rightPiece.acceptsLeft.includes(leftPiece.grammarType)
  );
}

export function validatePieces(pieces: PuzzlePiece[], validOrders: string[][]): ValidationResult {
  const pieceIds = pieces.map((p) => p.id);

  // Check if the current arrangement exactly matches any valid order.
  const matchedOrderIndex = validOrders.findIndex(
    (order) => order.length === pieceIds.length && order.every((id, i) => id === pieceIds[i]),
  );

  if (matchedOrderIndex >= 0) {
    return {
      isCorrect: true,
      correctPositions: pieces.length,
      invalidConnections: [],
      bestOrderIds: validOrders[matchedOrderIndex],
      matchedOrderIndex,
    };
  }

  // Find the valid order with the most pieces already in the right positions.
  const orderScores = validOrders.map((order) =>
    order.reduce((acc, id, idx) => acc + (pieceIds[idx] === id ? 1 : 0), 0),
  );
  const bestScore = Math.max(...orderScores);
  const bestOrderIndex = orderScores.indexOf(bestScore);

  // Check pairwise neighbour connections for visual feedback on wrong arrangements.
  const invalidConnections: number[] = [];
  for (let index = 0; index < pieces.length - 1; index += 1) {
    if (!canConnect(pieces[index], pieces[index + 1])) {
      invalidConnections.push(index);
    }
  }

  return {
    isCorrect: false,
    correctPositions: bestScore,
    invalidConnections,
    bestOrderIds: validOrders[bestOrderIndex],
    matchedOrderIndex: -1,
  };
}
