import type { PuzzlePiece as PuzzlePieceType } from "../types/puzzle";

const grammarLabels: Record<PuzzlePieceType["grammarType"], string> = {
  noun: "Noun",
  pronoun: "Pronoun",
  topicParticle: "Topic",
  subjectParticle: "Subject",
  objectParticle: "Object",
  locationParticle: "Place",
  directionParticle: "Direction",
  comitativeParticle: "With",
  possessiveParticle: "Possessive",
  quoteParticle: "Quote",
  timeExpression: "Time",
  adverb: "Adverb",
  frequencyAdverb: "Frequency",
  adjective: "Adjective",
  verb: "Verb",
  teForm: "Te form",
  auxiliary: "Auxiliary",
  clauseConnector: "Connector",
  nominalizer: "Nominalizer",
};

type PuzzlePieceProps = {
  piece: PuzzlePieceType;
  index: number;
  isCorrectPosition: boolean;
  isConnectionInvalid: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (index: number) => void;
};

export function PuzzlePiece({
  piece,
  index,
  isCorrectPosition,
  isConnectionInvalid,
  onDragStart,
  onDragOver,
  onDrop,
}: PuzzlePieceProps) {
  const className = [
    "puzzle-piece",
    `grammar-${piece.grammarType}`,
    isCorrectPosition ? "correct-position" : "",
    isConnectionInvalid ? "invalid-connection" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(index)}
      title={`${piece.meaning}${piece.reading ? ` - ${piece.reading}` : ""}`}
    >
      <div className="piece-main-text">{piece.text}</div>
      <div className="piece-reading">{piece.reading}</div>
      <div className="piece-type">{grammarLabels[piece.grammarType]}</div>
    </div>
  );
}
