export type GrammarType =
  | "noun"
  | "pronoun"
  | "topicParticle"
  | "subjectParticle"
  | "objectParticle"
  | "locationParticle"
  | "directionParticle"
  | "comitativeParticle"
  | "possessiveParticle"
  | "quoteParticle"
  | "timeExpression"
  | "adverb"
  | "adjective"
  | "verb"
  | "teForm"
  | "auxiliary"
  | "clauseConnector"
  | "nominalizer";

export type PuzzlePiece = {
  id: string;
  text: string;
  reading?: string;
  meaning: string;
  grammarType: GrammarType;
  correctIndex: number;
  acceptsLeft: GrammarType[];
  acceptsRight: GrammarType[];
};

export type SentencePuzzle = {
  id: string;
  level: "N5" | "N4" | "N3";
  japanese: string;
  translation: string;
  explanation: string;
  pieces: PuzzlePiece[];
};

export type ValidationResult = {
  isCorrect: boolean;
  correctPositions: number;
  invalidConnections: number[];
};
