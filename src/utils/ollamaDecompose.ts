import type { SentencePuzzle } from "../types/puzzle";

export const DEFAULT_OLLAMA_URL = "http://localhost:11434";
export const DEFAULT_OLLAMA_MODEL = "qwen2.5:7b";

const GRAMMAR_TYPES = [
  "noun", "pronoun", "topicParticle", "subjectParticle", "objectParticle",
  "locationParticle", "directionParticle", "comitativeParticle",
  "possessiveParticle", "quoteParticle", "timeExpression", "adverb",
  "frequencyAdverb", "adjective", "verb", "teForm", "auxiliary",
  "clauseConnector", "nominalizer",
];

const SYSTEM_PROMPT = `You are a Japanese linguistics expert creating data for a Japanese grammar puzzle game.

Given a Japanese sentence, decompose it into grammatical puzzle pieces. Output a single JSON object with this exact shape:

{
  "level": "N5" | "N4" | "N3",
  "japanese": "<the original sentence>",
  "translation": "<French translation>",
  "explanation": "<1–2 sentence French explanation of the overall structure>",
  "pieces": [
    {
      "pid": "p1",
      "text": "<Japanese fragment>",
      "reading": "<hiragana reading, or empty string if already kana>",
      "meaning": "<French meaning of this fragment>",
      "grammarType": "<one of the types listed below>",
      "acceptsLeft": ["<grammarType>", ...],
      "acceptsRight": ["<grammarType>", ...]
    }
  ],
  "validOrders": [["p1","p2",...], ...],
  "grammarNotes": [
    { "rule": "<French rule name>", "explanation": "<French explanation>" }
  ]
}

Available grammarTypes: ${GRAMMAR_TYPES.join(", ")}

Rules:
- Split at the finest meaningful grammatical level: each particle is its own piece, each word is its own piece. Keep te-form + auxiliary combinations (e.g. 降っている) together when they form a single grammatical unit.
- acceptsLeft for the first piece must be [].
- acceptsRight for the last piece must be [].
- List ALL valid orderings in validOrders (Japanese allows some reordering of time/place expressions). Most sentences have 1–3 valid orders.
- Include 2–4 grammar notes covering the key grammar points of the sentence.
- All human-readable strings (translation, explanation, meaning, notes) must be in French.
- Output ONLY valid JSON. No markdown fences, no extra text.`;

/** Stable ID derived from the Japanese text - avoids duplicates on re-sync. */
function makeId(japanese: string): string {
  let h = 0;
  for (const c of japanese) h = Math.trunc(Math.imul(31, h) + (c.codePointAt(0) ?? 0));
  return `anki-${Math.abs(h).toString(36)}`;
}

function assignIds(data: Record<string, unknown>, japanese: string): SentencePuzzle {
  const sid = makeId(japanese);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pieces = (data.pieces as any[]).map((piece, i) => {
    const newId = `${sid}-p${i + 1}`;
    return { ...piece, id: newId, pid: undefined };
  });

  // Remap pid references in validOrders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pidToId: Record<string, string> = (data.pieces as any[]).reduce(
    (acc, piece, i) => ({ ...acc, [piece.pid ?? `p${i + 1}`]: `${sid}-p${i + 1}` }),
    {},
  );

  const validOrders = ((data.validOrders as string[][]) ?? []).map((order) =>
    order.map((p) => pidToId[p] ?? p),
  );

  return {
    ...(data as Omit<SentencePuzzle, "id" | "pieces" | "validOrders">),
    id: sid,
    pieces,
    validOrders,
  } as SentencePuzzle;
}

export async function ollamaDecompose(
  sentence: string,
  ollamaUrl: string,
  model: string,
): Promise<SentencePuzzle> {
  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Sentence: ${sentence}` },
      ],
      stream: false,
      format: "json",
      options: { temperature: 0.1 },
    }),
  });

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);

  const data = await res.json();
  const content: string = data?.message?.content;
  if (!content) throw new Error("Ollama returned empty content");

  const parsed = JSON.parse(content) as Record<string, unknown>;
  return assignIds(parsed, sentence);
}
