import type { SentencePuzzle } from "../types/puzzle";

type SentenceResultProps = {
  sentence: SentencePuzzle;
  isVisible: boolean;
  matchedOrderIndex: number;
  isAnswerRevealed: boolean;
};

export function SentenceResult({ sentence, isVisible, matchedOrderIndex, isAnswerRevealed }: SentenceResultProps) {
  if (!isVisible) {
    return null;
  }

  const pieceById = Object.fromEntries(sentence.pieces.map((p) => [p.id, p]));

  if (isAnswerRevealed) {
    const hasMultipleOrders = sentence.validOrders.length > 1;

    return (
      <section className="result-card answer-reveal-card">
        <h2>{hasMultipleOrders ? "Réponses possibles" : "La réponse"}</h2>
        <p className="reveal-intro">
          {hasMultipleOrders
            ? `Cette phrase admet ${sentence.validOrders.length} ordres valides :`
            : "Voici l'ordre correct des pièces :"}
        </p>
        <ol className="answer-orders">
          {sentence.validOrders.map((order, i) => (
            <li key={i} className="answer-order-item">
              {hasMultipleOrders && <span className="order-label">Ordre {i + 1}</span>}
              <span className="order-japanese">{order.map((id) => pieceById[id].text).join("")}</span>
              <span className="order-pieces">
                {order.map((id) => pieceById[id].text).join("\u3000\u00b7\u3000")}
              </span>
            </li>
          ))}
        </ol>
        <p className="translation-result">{sentence.translation}</p>
        {sentence.grammarNotes.length > 0 && (
          <div className="grammar-notes">
            <h3>Notes grammaticales</h3>
            <ul>
              {sentence.grammarNotes.map((note) => (
                <li key={note.rule}>
                  <strong>{note.rule}</strong> - {note.explanation}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    );
  }

  const isAlternativeOrder = matchedOrderIndex > 0;

  return (
    <section className="result-card">
      <h2>{isAlternativeOrder ? "Ordre alternatif valide !" : "Phrase correcte !"}</h2>
      {isAlternativeOrder && (
        <p className="alternative-order-note">
          Vous avez trouvé un ordre alternatif valide. L'ordre canonique est :
        </p>
      )}
      <p className="japanese-result">{sentence.japanese}</p>
      <p className="translation-result">{sentence.translation}</p>
      <p className="explanation-result">{sentence.explanation}</p>
      {sentence.grammarNotes.length > 0 && (
        <div className="grammar-notes">
          <h3>Notes grammaticales</h3>
          <ul>
            {sentence.grammarNotes.map((note) => (
              <li key={note.rule}>
                <strong>{note.rule}</strong> - {note.explanation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
