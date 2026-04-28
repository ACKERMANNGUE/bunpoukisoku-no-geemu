import type { SentencePuzzle } from "../types/puzzle";

export const DEFAULT_OLLAMA_URL = "http://localhost:11434";
export const DEFAULT_OLLAMA_MODEL = "qwen2.5:7b";

const GRAMMAR_TYPES = [
  "noun", "pronoun", "topicParticle", "subjectParticle", "objectParticle",
  "locationParticle", "directionParticle", "comitativeParticle",
  "possessiveParticle", "quoteParticle", "timeExpression", "adverb",
  "frequencyAdverb", "adjective", "verb", "teForm", "auxiliary",
  "clauseConnector", "nominalizer", "interjection",
];

const SYSTEM_PROMPT = `You are a Japanese linguistics expert creating data for a Japanese grammar puzzle game.

Given a Japanese sentence, decompose it into grammatical puzzle pieces. Output a single JSON object.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE EXAMPLE (study this carefully — your output must follow the same pattern exactly)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Input sentence: 私は昨日友達と映画を見ました。

{
  "level": "N5",
  "japanese": "私は昨日友達と映画を見ました。",
  "translation": "Hier, j'ai regardé un film avec un ami.",
  "explanation": "私は introduit le thème, 昨日 place le contexte temporel, 友達と indique l'accompagnement, 映画を marque l'objet direct, et le verbe 見ました termine la phrase.",
  "pieces": [
    { "pid": "p1", "text": "私",     "reading": "わたし",   "meaning": "moi / je",             "grammarType": "pronoun",            "acceptsLeft": [],                              "acceptsRight": ["topicParticle"] },
    { "pid": "p2", "text": "は",     "reading": "",         "meaning": "particule de thème",  "grammarType": "topicParticle",       "acceptsLeft": ["pronoun","noun"],              "acceptsRight": ["timeExpression","noun","adverb"] },
    { "pid": "p3", "text": "昨日",   "reading": "きのう",   "meaning": "hier",                "grammarType": "timeExpression",      "acceptsLeft": ["topicParticle"],               "acceptsRight": ["noun"] },
    { "pid": "p4", "text": "友達",   "reading": "ともだち", "meaning": "ami",                 "grammarType": "noun",                "acceptsLeft": ["timeExpression"],              "acceptsRight": ["comitativeParticle"] },
    { "pid": "p5", "text": "と",     "reading": "",         "meaning": "avec",                "grammarType": "comitativeParticle",  "acceptsLeft": ["noun","pronoun"],              "acceptsRight": ["noun"] },
    { "pid": "p6", "text": "映画",   "reading": "えいが",   "meaning": "film",                "grammarType": "noun",                "acceptsLeft": ["comitativeParticle"],           "acceptsRight": ["objectParticle"] },
    { "pid": "p7", "text": "を",     "reading": "",         "meaning": "particule d'objet",   "grammarType": "objectParticle",      "acceptsLeft": ["noun"],                        "acceptsRight": ["verb"] },
    { "pid": "p8", "text": "見ました","reading": "みました", "meaning": "ai regardé",          "grammarType": "verb",                "acceptsLeft": ["objectParticle"],              "acceptsRight": [] }
  ],
  "validOrders": [
    ["p1","p2","p3","p4","p5","p6","p7","p8"],
    ["p3","p1","p2","p4","p5","p6","p7","p8"]
  ],
  "grammarNotes": [
    { "rule": "Ordre SOV", "explanation": "Le japonais place le verbe en fin de phrase. Tous les compléments précèdent le verbe." },
    { "rule": "は : particule de thème", "explanation": "は (wa) introduit le thème de la phrase et suit directement le nom ou le pronom." },
    { "rule": "Liberté du repère temporel", "explanation": "昨日 peut se placer avant ou après 私は. Les deux ordres sont naturels en japonais." }
  ]
}

Second example — 雨が降っているので、今日は家で勉強します。
{
  "level": "N4",
  "japanese": "雨が降っているので、今日は家で勉強します。",
  "translation": "Comme il pleut, aujourd'hui j'étudie à la maison.",
  "explanation": "雨が identifie le sujet, 降っている exprime une action en cours, ので donne la cause, puis 今日は家で勉強します décrit l'action principale.",
  "pieces": [
    { "pid": "p1", "text": "雨",        "reading": "あめ",         "meaning": "pluie",                     "grammarType": "noun",           "acceptsLeft": [],                              "acceptsRight": ["subjectParticle"] },
    { "pid": "p2", "text": "が",        "reading": "",             "meaning": "particule de sujet",        "grammarType": "subjectParticle", "acceptsLeft": ["noun"],                        "acceptsRight": ["teForm"] },
    { "pid": "p3", "text": "降っている","reading": "ふっている",    "meaning": "est en train de tomber",    "grammarType": "teForm",          "acceptsLeft": ["subjectParticle"],             "acceptsRight": ["clauseConnector"] },
    { "pid": "p4", "text": "ので",      "reading": "",             "meaning": "comme / parce que",         "grammarType": "clauseConnector", "acceptsLeft": ["teForm","verb","adjective"],   "acceptsRight": ["timeExpression"] },
    { "pid": "p5", "text": "今日",      "reading": "きょう",       "meaning": "aujourd'hui",               "grammarType": "timeExpression",  "acceptsLeft": ["clauseConnector"],             "acceptsRight": ["topicParticle"] },
    { "pid": "p6", "text": "は",        "reading": "",             "meaning": "particule de thème",        "grammarType": "topicParticle",   "acceptsLeft": ["timeExpression","noun"],       "acceptsRight": ["noun"] },
    { "pid": "p7", "text": "家",        "reading": "いえ",         "meaning": "maison",                    "grammarType": "noun",            "acceptsLeft": ["topicParticle"],               "acceptsRight": ["locationParticle"] },
    { "pid": "p8", "text": "で",        "reading": "",             "meaning": "lieu de l'action",          "grammarType": "locationParticle","acceptsLeft": ["noun"],                        "acceptsRight": ["noun","verb"] },
    { "pid": "p9", "text": "勉強します","reading": "べんきょうします","meaning": "j'étudie",               "grammarType": "verb",            "acceptsLeft": ["locationParticle","objectParticle"], "acceptsRight": [] }
  ],
  "validOrders": [["p1","p2","p3","p4","p5","p6","p7","p8","p9"]],
  "grammarNotes": [
    { "rule": "ので : cause formelle", "explanation": "ので exprime une cause logique et objective, plus formelle que から." },
    { "rule": "〜ている : action en cours", "explanation": "降っている exprime un état continu : la forme en て + いる décrit une action qui se déroule." }
  ]
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALLOWED grammarType values (use ONLY these exact strings, nothing else):
${GRAMMAR_TYPES.join(", ")}

CRITICAL rules — violating any of these makes the output unusable:
1. grammarType MUST be one of the allowed values above. NEVER use "particle", "postposition", or any other string not in the list. Map particles to their specific type: は→topicParticle, が→subjectParticle, を→objectParticle, に/で (location)→locationParticle, へ→directionParticle, と (with)→comitativeParticle, の→possessiveParticle, と (quote)→quoteParticle. Exclamations and filler words (あっ, えっ, おっ, ねえ, あのう, うん, いや, etc.) → interjection.
2. Every value inside acceptsLeft and acceptsRight arrays MUST also be one of the allowed grammarType values above.
3. acceptsLeft for the first piece must be [].
4. acceptsRight for the last piece must be [].
5. EVERY human-readable string — translation, explanation, meaning, rule, explanation in grammarNotes — MUST be written in French. No English, no Japanese.
6. Split at the finest meaningful grammatical level. Grammatical particles (は, が, を, に, で, へ, と, の, か, も, から, まで, より, など…) are ALWAYS their own separate piece — NEVER attach a particle to the preceding noun or verb. Correct: 発端は → piece「発端」+ piece「は」; 日本語を → piece「日本語」+ piece「を」; 学校に → piece「学校」+ piece「に」. Keep te-form + auxiliary combinations (e.g. 降っている) together only when they form a single indivisible grammatical unit.
7. List ALL valid orderings in validOrders (Japanese allows some reordering of time/place expressions). Most sentences have 1–3 valid orders.
8. Include 2–4 grammar notes covering the key grammar points of the sentence.
9. The "reading" field is furigana — hiragana or katakana ONLY, NEVER romaji. It is MANDATORY and non-empty for every piece whose text contains at least one kanji (e.g. 発端→「ほったん」, 通る→「とおる」, 日本語→「にほんご」, 勉強→「べんきょう」). Set reading to "" only when the piece text is 100% kana with no kanji at all (e.g. は, が, を, に, kana-only words like ので, ことの).
10. Output ONLY valid JSON. No markdown fences, no extra text.
11. EVERYTHING MUST BE IN FRENCH. The user of this data is a French speaker learning Japanese, so all explanations, translations, grammar notes, and meanings must be in French. NO ENGLISH, NO JAPANESE in any human-readable field.
12. The JSON MUST follow the exact structure shown in the examples above, with all required fields present and correctly named.
13. Do NOT include any fields other than those shown in the examples (id, pid, text, reading, meaning, grammarType, acceptsLeft, acceptsRight for pieces; level, japanese, translation, explanation, pieces, validOrders, grammarNotes for the overall sentence).
14. The output MUST be a single JSON object matching the structure of the examples. Do NOT output an array or multiple objects.
15. The "id" field for each piece MUST be a unique string derived from the sentence and piece index (e.g. "anki-<hash>-p1", "anki-<hash>-p2", etc.) to ensure stable IDs across re-syncs.
16. The "validOrders" field MUST list all valid permutations of the pieces that form a grammatically correct sentence in Japanese. Each order is an array of piece IDs (e.g. ["p1","p2","p3","p4","p5","p6","p7","p8"]).
17. The "grammarNotes" field MUST include 2–4 notes explaining the key grammar points of the sentence, with each note containing a "rule" (the grammar point name) and an "explanation" (a brief description in French).
18. The "translation" field MUST be a natural, fluent French translation of the entire Japanese sentence, capturing its meaning accurately.
19. The "explanation" field MUST provide a clear, concise explanation in French of how the pieces fit together grammatically to form the sentence, highlighting the role of each piece.
20. The output MUST be consistent and follow the same format for every sentence, regardless of complexity or grammar points involved.
`;

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
      options: {
        temperature: 0.1,
        num_predict: -1,   // generate until EOS — never truncate
        num_ctx: 4096,     // safe for qwen2.5:7b on 8 GB VRAM
      },
    }),
  });

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);

  const data = await res.json();
  const content: string = data?.message?.content;
  if (!content) throw new Error("Ollama returned empty content");

  const parsed = JSON.parse(content) as Record<string, unknown>;
  return assignIds(parsed, sentence);
}
