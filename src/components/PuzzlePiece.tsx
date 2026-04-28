import type { PuzzlePiece as PuzzlePieceType } from "../types/puzzle";

const grammarLabels: Record<PuzzlePieceType["grammarType"], string> = {
  noun: "Nom",
  pronoun: "Pronom",
  topicParticle: "Topic",
  subjectParticle: "Sujet",
  objectParticle: "Objet",
  locationParticle: "Lieu",
  directionParticle: "Direction",
  comitativeParticle: "Avec",
  possessiveParticle: "Possessif",
  quoteParticle: "Citation",
  timeExpression: "Temps",
  adverb: "Adverbe",
  frequencyAdverb: "Frequence",
  adjective: "Adjective",
  verb: "Verbe",
  teForm: "Te-forme",
  auxiliary: "Auxiliaire",
  clauseConnector: "Connecteur",
  nominalizer: "Nominaliseur",
  interjection: "Interjection",
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
