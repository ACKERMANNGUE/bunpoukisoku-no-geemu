import type { SentencePuzzle } from "../types/puzzle";

type SentenceResultProps = {
  sentence: SentencePuzzle;
  isVisible: boolean;
};

export function SentenceResult({ sentence, isVisible }: SentenceResultProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <section className="result-card">
      <h2>Phrase correcte</h2>
      <p className="japanese-result">{sentence.japanese}</p>
      <p className="translation-result">{sentence.translation}</p>
      <p className="explanation-result">{sentence.explanation}</p>
    </section>
  );
}
