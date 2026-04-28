import type { SentencePuzzle } from "../types/puzzle";

export const DEFAULT_OLLAMA_URL = "http://localhost:11434";
export const DEFAULT_OLLAMA_MODEL = "qwen2.5:7b";

const GRAMMAR_TYPES = [
  "noun", "pronoun", "topicParticle", "subjectParticle", "objectParticle",
  "locationParticle", "directionParticle", "comitativeParticle",
  "possessiveParticle", "quoteParticle", "timeExpression", "adverb",
  "frequencyAdverb", "adjective", "verb", "teForm", "auxiliary",
  "clauseConnector", "nominalizer", "interjection", "copula", "sentenceFinalParticle",
];

const SYSTEM_PROMPT = `You are a Japanese linguistics expert creating data for a Japanese grammar puzzle game. The player is a French speaker learning Japanese.

Given a Japanese sentence, decompose it into grammatical puzzle pieces. Output a single JSON object.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE EXAMPLE — study carefully, follow the same pattern exactly
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Input: 私は昨日友達と映画を見ました。
{
  "level": "N5",
  "japanese": "私は昨日友達と映画を見ました。",
  "translation": "Hier, j'ai regardé un film avec un ami.",
  "explanation": "私は introduit le thème, 昨日 place le contexte temporel, 友達と indique l'accompagnement, 映画を marque l'objet direct, et le verbe 見ました termine la phrase.",
  "pieces": [
    { "pid": "p1", "text": "私",      "reading": "わたし",    "meaning": "moi / je",            "grammarType": "pronoun",           "acceptsLeft": [],                             "acceptsRight": ["topicParticle"] },
    { "pid": "p2", "text": "は",      "reading": "",          "meaning": "particule de thème",  "grammarType": "topicParticle",      "acceptsLeft": ["pronoun","noun"],             "acceptsRight": ["timeExpression","noun","adverb"] },
    { "pid": "p3", "text": "昨日",    "reading": "きのう",    "meaning": "hier",                "grammarType": "timeExpression",     "acceptsLeft": ["topicParticle"],              "acceptsRight": ["noun"] },
    { "pid": "p4", "text": "友達",    "reading": "ともだち",  "meaning": "ami",                 "grammarType": "noun",               "acceptsLeft": ["timeExpression"],             "acceptsRight": ["comitativeParticle"] },
    { "pid": "p5", "text": "と",      "reading": "",          "meaning": "avec (accompagnement)","grammarType": "comitativeParticle", "acceptsLeft": ["noun","pronoun"],             "acceptsRight": ["noun"] },
    { "pid": "p6", "text": "映画",    "reading": "えいが",    "meaning": "film",                "grammarType": "noun",               "acceptsLeft": ["comitativeParticle"],          "acceptsRight": ["objectParticle"] },
    { "pid": "p7", "text": "を",      "reading": "",          "meaning": "particule d'objet",   "grammarType": "objectParticle",     "acceptsLeft": ["noun"],                       "acceptsRight": ["verb"] },
    { "pid": "p8", "text": "見ました","reading": "みました",  "meaning": "ai regardé",          "grammarType": "verb",               "acceptsLeft": ["objectParticle"],             "acceptsRight": [] }
  ],
  "validOrders": [
    ["p1","p2","p3","p4","p5","p6","p7","p8"],
    ["p3","p1","p2","p4","p5","p6","p7","p8"]
  ],
  "grammarNotes": [
    { "rule": "Ordre SOV", "explanation": "Le japonais place le verbe en fin de phrase. Tous les compléments (temps, lieu, objet) précèdent le verbe." },
    { "rule": "は : particule de thème", "explanation": "は (wa) introduit le thème de la phrase et suit directement le nom ou le pronom qu'elle marque." },
    { "rule": "Liberté du repère temporel", "explanation": "昨日 (hier) peut se placer avant ou après le thème 私は. Les deux ordres sont naturels en japonais." }
  ]
}

Input: 雨が降っているので、今日は家で勉強します。
{
  "level": "N4",
  "japanese": "雨が降っているので、今日は家で勉強します。",
  "translation": "Comme il pleut, aujourd'hui j'étudie à la maison.",
  "explanation": "雨が identifie le sujet, 降っている exprime une action en cours, ので donne la cause, puis 今日は家で勉強します décrit l'action principale.",
  "pieces": [
    { "pid": "p1", "text": "雨",         "reading": "あめ",           "meaning": "pluie",                   "grammarType": "noun",            "acceptsLeft": [],                              "acceptsRight": ["subjectParticle"] },
    { "pid": "p2", "text": "が",         "reading": "",               "meaning": "particule de sujet",      "grammarType": "subjectParticle",  "acceptsLeft": ["noun"],                        "acceptsRight": ["teForm"] },
    { "pid": "p3", "text": "降っている", "reading": "ふっている",      "meaning": "est en train de tomber",  "grammarType": "teForm",           "acceptsLeft": ["subjectParticle"],             "acceptsRight": ["clauseConnector"] },
    { "pid": "p4", "text": "ので",       "reading": "",               "meaning": "parce que / comme",       "grammarType": "clauseConnector",  "acceptsLeft": ["teForm","verb","adjective","copula"], "acceptsRight": ["timeExpression","noun","pronoun"] },
    { "pid": "p5", "text": "今日",       "reading": "きょう",         "meaning": "aujourd'hui",             "grammarType": "timeExpression",   "acceptsLeft": ["clauseConnector"],             "acceptsRight": ["topicParticle"] },
    { "pid": "p6", "text": "は",         "reading": "",               "meaning": "particule de thème",      "grammarType": "topicParticle",    "acceptsLeft": ["timeExpression","noun"],        "acceptsRight": ["noun"] },
    { "pid": "p7", "text": "家",         "reading": "いえ",           "meaning": "maison",                  "grammarType": "noun",             "acceptsLeft": ["topicParticle"],               "acceptsRight": ["locationParticle"] },
    { "pid": "p8", "text": "で",         "reading": "",               "meaning": "lieu de l'action",        "grammarType": "locationParticle", "acceptsLeft": ["noun"],                        "acceptsRight": ["verb","noun"] },
    { "pid": "p9", "text": "勉強します", "reading": "べんきょうします","meaning": "j'étudie",               "grammarType": "verb",             "acceptsLeft": ["locationParticle","objectParticle"], "acceptsRight": [] }
  ],
  "validOrders": [["p1","p2","p3","p4","p5","p6","p7","p8","p9"]],
  "grammarNotes": [
    { "rule": "ので : cause formelle", "explanation": "ので exprime une cause logique et objective, plus formelle que から. Il suit la forme en て du verbe ou un adjectif." },
    { "rule": "〜ている : aspect continu", "explanation": "降っている = forme en て + いる. Exprime une action en cours ou un état persistant." }
  ]
}

Input: この映画はとても面白いですね。
{
  "level": "N5",
  "japanese": "この映画はとても面白いですね。",
  "translation": "Ce film est vraiment intéressant, n'est-ce pas ?",
  "explanation": "この modifie 映画 (ce film), は marque le thème, とても intensifie l'adjectif 面白い, です est la copule polie, ね cherche l'accord de l'interlocuteur.",
  "pieces": [
    { "pid": "p1", "text": "この",     "reading": "",          "meaning": "ce / cet (démonstratif proche)",   "grammarType": "adjective",          "acceptsLeft": [],                        "acceptsRight": ["noun"] },
    { "pid": "p2", "text": "映画",     "reading": "えいが",    "meaning": "film",                            "grammarType": "noun",               "acceptsLeft": ["adjective"],              "acceptsRight": ["topicParticle"] },
    { "pid": "p3", "text": "は",       "reading": "",          "meaning": "particule de thème",              "grammarType": "topicParticle",      "acceptsLeft": ["noun"],                  "acceptsRight": ["adverb","adjective"] },
    { "pid": "p4", "text": "とても",   "reading": "",          "meaning": "très / vraiment",                 "grammarType": "adverb",             "acceptsLeft": ["topicParticle"],          "acceptsRight": ["adjective"] },
    { "pid": "p5", "text": "面白い",   "reading": "おもしろい","meaning": "intéressant (adjectif en い)",    "grammarType": "adjective",          "acceptsLeft": ["adverb"],                "acceptsRight": ["copula"] },
    { "pid": "p6", "text": "です",     "reading": "",          "meaning": "est (copule polie)",              "grammarType": "copula",             "acceptsLeft": ["adjective","noun"],       "acceptsRight": ["sentenceFinalParticle"] },
    { "pid": "p7", "text": "ね",       "reading": "",          "meaning": "n'est-ce pas ? (recherche accord)","grammarType": "sentenceFinalParticle","acceptsLeft": ["copula","verb","auxiliary"], "acceptsRight": [] }
  ],
  "validOrders": [["p1","p2","p3","p4","p5","p6","p7"]],
  "grammarNotes": [
    { "rule": "この : démonstratif proximal", "explanation": "この (ce/cet) est un adjectif démonstratif qui modifie directement un nom. Il désigne quelque chose de proche du locuteur." },
    { "rule": "Adjectif en い : forme de base", "explanation": "面白い est un adjectif en い. Il s'emploie directement avant un nom ou en fin de proposition, suivi de です pour la politesse." },
    { "rule": "です : copule polie", "explanation": "です suit un adjectif ou un nom et rend la phrase polie. Il ne porte pas de sens lexical mais marque l'assertion et la politesse." },
    { "rule": "ね : particule finale de partage", "explanation": "ね en fin de phrase cherche l'assentiment de l'interlocuteur (≈ « n'est-ce pas ? »). Elle adoucit le propos." }
  ]
}

Input: 食べ終わったら洗い物をしますね。
{
  "level": "N4",
  "japanese": "食べ終わったら洗い物をしますね。",
  "translation": "Quand vous aurez fini de manger, vous ferez la vaisselle, n'est-ce pas ?",
  "explanation": "食べ終わった est la forme passée de 食べ終わる (finir de manger). たら exprime la condition temporelle (quand X, alors Y) et est une pièce séparée du verbe. 洗い物 est le nom-objet, marqué séparément par を. します est le verbe. ね cherche l'accord.",
  "pieces": [
    { "pid": "p1", "text": "食べ終わった", "reading": "たべおわった",  "meaning": "a fini de manger",                  "grammarType": "verb",                 "acceptsLeft": [],                           "acceptsRight": ["clauseConnector"] },
    { "pid": "p2", "text": "たら",         "reading": "",              "meaning": "quand / si (conditionnel passé)",  "grammarType": "clauseConnector",     "acceptsLeft": ["verb"],                     "acceptsRight": ["noun","pronoun"] },
    { "pid": "p3", "text": "洗い物",       "reading": "あらいもの",    "meaning": "vaisselle à laver",               "grammarType": "noun",                 "acceptsLeft": ["clauseConnector"],          "acceptsRight": ["objectParticle"] },
    { "pid": "p4", "text": "を",           "reading": "",              "meaning": "particule d'objet direct",         "grammarType": "objectParticle",       "acceptsLeft": ["noun"],                     "acceptsRight": ["verb"] },
    { "pid": "p5", "text": "します",       "reading": "",              "meaning": "faire (forme polie)",             "grammarType": "verb",                 "acceptsLeft": ["objectParticle"],           "acceptsRight": ["sentenceFinalParticle"] },
    { "pid": "p6", "text": "ね",           "reading": "",              "meaning": "n'est-ce pas ? (cherche l'accord)","grammarType": "sentenceFinalParticle", "acceptsLeft": ["verb"],                     "acceptsRight": [] }
  ],
  "validOrders": [["p1","p2","p3","p4","p5","p6"]],
  "grammarNotes": [
    { "rule": "〜たら : conditionnel temporel", "explanation": "たら s'attache à la forme passée du verbe (〜た → 〜たら). Il est TOUJOURS une pièce séparée : 食べ終わった (verb) + たら (clauseConnector)." },
    { "rule": "〜をします : objet + する séparés", "explanation": "Quand を est explicitement écrit entre un nom et する, les trois éléments sont des pièces distinctes : 洗い物 (noun) + を (objectParticle) + します (verb). Ne jamais fusionner." },
    { "rule": "ね : particule finale de partage", "explanation": "ね en fin de phrase cherche l'assentiment de l'interlocuteur (≈ « n'est-ce pas ? »). Toujours une pièce séparée, après le verbe." }
  ]
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALLOWED grammarType values — use ONLY these exact strings:
${GRAMMAR_TYPES.join(", ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRAMMAR CLASSIFICATION GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ PARTICLES — each particle is always its own separate piece, NEVER attached to the preceding word:
  は → topicParticle          (theme; also used for contrast)
  も → topicParticle          (inclusive topic / "also / even"; same slot as は)
  が → subjectParticle        (grammatical subject; also marks object of desire/ability verbs)
  を → objectParticle         (direct object)
  の → possessiveParticle     (possession, modification: 私の本; also nominalizer after verb: 食べるの)
  と → comitativeParticle     (accompaniment with a PERSON: 友達と行く). ONLY と with people.
  と → quoteParticle          (quotation before 言う/思う/聞く: 「〜」と言う)
  へ → directionParticle      (direction of movement: 東京へ行く)
  に → locationParticle       ALL uses of に without exception:
                               • location (公園にいる)
                               • destination (東京に行く)
                               • time (三時に会う)
                               • result / choice (何にしますか、医者になる)
                               • purpose (買いに行く)
                               • indirect object / recipient (先生に渡す、友達に話す)
                               に is NEVER comitativeParticle. NEVER.
  で → locationParticle       • location of action (公園で遊ぶ)
                               • means / instrument / material (電車で行く、日本語で話す)
  から → locationParticle     (source / starting point: 学校から帰る; after predicate → clauseConnector)
  まで → locationParticle     (limit / extent: 駅まで歩く)
  より → locationParticle     (comparative source / "than": これよりあれ)
  だけ → auxiliary            (only / just: これだけ)
  しか → auxiliary            (only [with negative]: これしか〜ない)
  ばかり → auxiliary          (nothing but / just finished: 食べてばかりいる)
  か → sentenceFinalParticle  when sentence-final (question marker: 行きますか)
  か → quoteParticle          when embedded (whether: 〜かどうか知らない)

▶ SENTENCE-FINAL PARTICLES (always the last piece, acceptsRight: []):
  ね → sentenceFinalParticle  (seeking agreement: 〜ですね)
  よ → sentenceFinalParticle  (assertion / new info: 〜ですよ)
  か → sentenceFinalParticle  (question: 〜ますか)
  ぞ / ぜ → sentenceFinalParticle  (strong masculine assertion)
  わ → sentenceFinalParticle  (feminine sentence-final)
  な → sentenceFinalParticle  (masculine contemplation / prohibition: するな)
  さ → sentenceFinalParticle  (casual assertion)
  Combinations (ね, よ, かな, よね, ですね, ですよ) → one sentenceFinalParticle piece

▶ COPULA:
  です, だ, である, じゃない, ではない, でした, だった → copula
  The copula follows nouns and な-adjectives (or い-adjectives with です for politeness).
  Split from the preceding word: "静かだ" → "静か" (adjective) + "だ" (copula)
  Exception: do NOT split "〜ではない / じゃない" — keep as one copula piece.

▶ ADJECTIVES:
  い-adjectives (ends in い: 大きい, 難しい, 面白い, 新しい):
    → grammarType "adjective" in all positions (attributive or predicative)
    い-adverb form (ends in く: 早く, 大きく) → adverb
  な-adjectives (きれい, 有名, 静か, 便利, 好き, 嫌い, 大丈夫):
    Before noun: keep 「な」 attached → "きれいな" = adjective (one piece)
    Predicate: split → "きれい" (adjective) + "だ"/"です" (copula)
    Adverb form: split → "きれい" (adjective) + "に" (locationParticle)
  Prenominal demonstratives (この, その, あの, どの, こんな, そんな, あんな) → adjective
  Prenominal quantifiers (たくさんの, 多くの) → adjective

▶ PRONOUNS and DEMONSTRATIVES:
  Personal: 私, 僕, 俺, 彼, 彼女, あなた, 君, あなたたち → pronoun
  Impersonal demonstratives: これ, それ, あれ, どれ → pronoun
  Place demonstratives: ここ, そこ, あそこ, どこ → noun (they function as place nouns)

▶ VERBS — what to keep together as ONE piece:
  • Plain / polite / negative / past forms: 食べる, 食べます, 食べない, 食べた, 食べました → verb
  • Potential: 食べられる, 話せる → verb
  • Passive: 食べられる, 書かれる → verb
  • Causative: 食べさせる, 行かせる → verb
  • する-verbs WITHOUT explicit を: keep noun + する fused: 勉強する, 練習します, 説明した → verb
  • する-verbs WITH explicit を: split into 3 separate pieces: 洗い物をします → 洗い物 (noun) + を (objectParticle) + します (verb)
  • Desire: 食べたい, 行きたい → auxiliary (keep 〜たい as one auxiliary piece)
  • Must: 〜なければならない, 〜なくてはいけない → auxiliary (one piece)
  • Permission: 〜てもいい → auxiliary
  • Prohibition: 〜てはいけない → auxiliary
  • Modals: かもしれない, だろう, でしょう, にちがいない, はずだ → auxiliary
  • 〜てほしい, 〜てくれ, 〜てください → auxiliary

▶ TE-FORM CHAINS — keep as ONE teForm piece when semantically fused:
  〜ている / 〜ていた (progressive/resultant state)
  〜てしまう / 〜てしまった (completion / regret)
  〜ておく / 〜ておいた (preparation)
  〜てみる / 〜てみた (trying)
  〜てくる / 〜てきた (incoming action / change)
  〜ていく / 〜ていった (outgoing action / change)
  〜てあげる / 〜てくれる / 〜もらう (benefactive)
  Bare て-form chain: 〜て, 〜て... (enumeration) → teForm for each linked verb + て

▶ CLAUSE CONNECTORS — keep the connector attached to its predicate as ONE clauseConnector piece:
  ので (because, objective cause) → clauseConnector
  から (because, subjective cause) after predicate → clauseConnector
  が (but, however) between clauses → clauseConnector
  けど / けれど / けれども (but, though) → clauseConnector
  のに (although, in spite of, for the purpose of) → clauseConnector
  〜たら (conditional: if/when X happened) → TWO pieces: verb (past form) + たら (clauseConnector). Example: 食べたら → 食べた (verb) + たら (clauseConnector)
  〜ば (conditional: if X) → TWO pieces: verb (conditional form) + ば (clauseConnector). Example: 食べれば → 食べれ (verb) + ば (clauseConnector)
  〜なら (conditional: if it's the case that) → clauseConnector (own piece after verb/copula)
  〜と (natural / inevitable conditional: Xとなる) → clauseConnector
  〜ながら (while doing) — keep attached to verb stem: 歩きながら → clauseConnector
  〜ために / 〜ため (purpose / cause) → clauseConnector
  〜前に (before doing) — keep as timeExpression
  〜後で / 〜てから (after doing) → clauseConnector or timeExpression
  そして, だから, それで, しかし, でも (conjunctive adverbs) → clauseConnector

▶ NOMINALIZERS:
  こと (nominalizes a clause: 〜することが大切) → nominalizer
  の (nominalizes a clause after a verb: 〜するのが好き) → nominalizer (NOT possessiveParticle here)
  ため, わけ, はず when nominalizing → nominalizer
  ように (purpose / result goal: できるように) → nominalizer

▶ ADVERBS:
  Manner/degree: とても, もっと, もう, まだ, ちょっと, かなり, なかなか, ずっと → adverb
  Frequency: よく, たまに, いつも, ときどき, めったに → frequencyAdverb
  Sentence-initial conjunctive: そして, でも, だから, しかし → clauseConnector

▶ TIME EXPRESSIONS — standalone time words are one piece:
  今日, 明日, 昨日, 来週, 先週, 今年, 〜月, 〜曜日, before に or alone → timeExpression
  Number + counter when temporal (三時, 五分, 一週間) → timeExpression
  前に (before doing), 後で (after doing) → timeExpression

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY RULES (every violation makes the output unusable)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0. SCHEMA: every piece MUST have ALL these fields: pid, text, reading, meaning, grammarType, acceptsLeft, acceptsRight.
   • text = the exact Japanese characters from the input sentence (kanji + kana as written).
   • reading = ALL-HIRAGANA pronunciation, ONLY when text contains at least one kanji; otherwise "".
   NEVER put the Japanese segment only in reading without text. BAD: {reading:"たべおわった"} GOOD: {text:"食べ終わった", reading:"たべおわった"}
1. Every grammarType MUST be from the ALLOWED list. Use the GUIDE above.
2. Every value in acceptsLeft and acceptsRight MUST also be from the ALLOWED list.
3. acceptsLeft of the FIRST piece = []. acceptsRight of the LAST piece = [].
4. ALL human-readable text (translation, explanation, meaning, rule, explanation in grammarNotes) MUST be in French. No English. No Japanese in those fields.
5. Each particle (は, が, を, に, で, へ, と, の, か, ね, よ, etc.) is ALWAYS its own separate piece. NEVER fused with the preceding noun or verb. Examples: 映画は → 映画 + は; 東京に → 東京 + に; 面白いですね → 面白い + です + ね; 洗い物をします → 洗い物 + を + します; 食べたら → 食べた + たら.
6. acceptsLeft/acceptsRight must reflect the real grammar flow: what type of piece can appear immediately to the left/right of this piece.
7. validOrders MUST contain only pid strings ("p1", "p2", ...). NEVER put Japanese text in validOrders. The verb/copula MUST be last (before any sentenceFinalParticle). List all natural orderings (usually 1–3).
8. grammarNotes: 2–4 notes, ALL in French. No Japanese text in rule or explanation fields.
9. reading: hiragana/katakana furigana ONLY, NEVER romaji. Mandatory and non-empty for every piece containing at least one kanji. Set to "" only for pure-kana or pure-symbol pieces.
10. Output ONLY valid JSON. No markdown fences, no extra text.`;


/** Stable ID derived from the Japanese text - avoids duplicates on re-sync. */
function makeId(japanese: string): string {
  let h = 0;
  for (const c of japanese) h = Math.trunc(Math.imul(31, h) + (c.codePointAt(0) ?? 0));
  return `anki-${Math.abs(h).toString(36)}`;
}

/**
 * Normalize raw LLM output to fix common structural mistakes before converting to SentencePuzzle.
 * Handles: array wrapping, text/reading field swap, numeric validOrders indices, plain-string grammarNotes.
 */
function normalizeParsed(raw: unknown): Record<string, unknown> {
  // Unwrap if the model returned an array instead of an object
  let obj: Record<string, unknown>;
  if (Array.isArray(raw) && raw.length > 0) {
    obj = raw[0] as Record<string, unknown>;
  } else if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    obj = raw as Record<string, unknown>;
  } else {
    obj = {};
  }

  // Normalize pieces
  const rawPieces = Array.isArray(obj.pieces) ? (obj.pieces as Record<string, unknown>[]) : [];
  const pieces = rawPieces.map((piece, i) => {
    let text = typeof piece.text === "string" ? piece.text.trim() : "";
    let reading = typeof piece.reading === "string" ? piece.reading.trim() : "";
    // If text is missing but reading has content (model confused the fields), use reading as text
    if (!text && reading) {
      text = reading;
      reading = "";
    }
    return {
      ...piece,
      pid: typeof piece.pid === "string" && piece.pid ? piece.pid : `p${i + 1}`,
      text,
      reading,
      meaning: typeof piece.meaning === "string" ? piece.meaning : "",
    };
  });

  // Build index → pid mapping so numeric validOrders can be remapped
  const indexToPid: Record<number, string> = {};
  pieces.forEach((p, i) => { indexToPid[i] = p.pid as string; });

  // Normalize validOrders: convert numeric indices to pid strings
  const rawOrders = Array.isArray(obj.validOrders) ? (obj.validOrders as unknown[]) : [];
  const validOrders: string[][] = rawOrders
    .map((order): string[] => {
      if (!Array.isArray(order)) return [];
      return (order as unknown[]).map((item): string => {
        if (typeof item === "number") return indexToPid[item] ?? `p${item + 1}`;
        if (typeof item === "string") return item;
        return String(item);
      });
    })
    .filter((o) => o.length > 0);

  // Fallback: single canonical order if validOrders is empty
  const finalOrders = validOrders.length > 0 ? validOrders : [pieces.map((p) => p.pid as string)];

  // Normalize grammarNotes: convert plain strings to { rule, explanation } objects
  const rawNotes = Array.isArray(obj.grammarNotes) ? (obj.grammarNotes as unknown[]) : [];
  const grammarNotes = rawNotes.map((note, i) => {
    if (typeof note === "string") return { rule: `Note ${i + 1}`, explanation: note };
    if (typeof note === "object" && note !== null) return note;
    return { rule: `Note ${i + 1}`, explanation: String(note) };
  });

  return { ...obj, pieces, validOrders: finalOrders, grammarNotes };
}

function assignIds(data: Record<string, unknown>, japanese: string): SentencePuzzle {
  data = normalizeParsed(data);
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

const GENERATE_SYSTEM_PROMPT = `You are a Japanese language teacher creating practice sentences for a grammar puzzle game for French speakers.

Given example sentences for style/level reference, generate EXACTLY the number of NEW Japanese sentences requested.

Each sentence MUST:
- Be 100% Japanese — no Latin letters, no English words, no mixed-script words
- Use only kanji, hiragana, katakana and Japanese punctuation
- Be different from every example (different vocabulary, different topic)
- Be natural, everyday spoken or written Japanese
- Have a clear grammatical structure with explicit particles
- Be between 8 and 50 characters
- End with 。or ！or ？
- Cover a variety of JLPT levels (N5, N4, N3) and a variety of grammar patterns:
    SOV sentences with は/が, te-form chains, conditional (〜たら/〜ば/〜なら), cause (〜ので/〜から),
    い-adjective predicates, な-adjective predicates, potential form, passive form,
    sentence-final particles (〜ね, 〜よ, 〜か), nominalizer こと/の, relative clauses,
    time expressions, frequencyAdverbs, polite and casual registers.

Output a JSON object with this exact shape:
{ "sentences": ["<sentence1>", "<sentence2>", ...] }

CRITICAL: The "sentences" array MUST contain EXACTLY the requested number of sentences. Count before outputting.
Output ONLY valid JSON. No markdown fences, no extra text. Do NOT repeat any example sentence.`;

async function fetchSentenceBatch(
  needed: number,
  examples: string[],
  exclude: Set<string>,
  ollamaUrl: string,
  model: string,
): Promise<string[]> {
  const exampleList = examples.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const excludeNote = exclude.size > 0
    ? `\n\nAlso do NOT repeat these already-generated sentences:\n${[...exclude].map((s, i) => `${i + 1}. ${s}`).join("\n")}`
    : "";
  const userMessage = `Generate EXACTLY ${needed} new Japanese sentences. The array must have exactly ${needed} elements.\n\nExample sentences for style reference (do NOT reuse these):\n${exampleList}${excludeNote}`;

  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: GENERATE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      stream: false,
      format: "json",
      options: {
        temperature: 0.8,
        num_predict: -1,
        num_ctx: 4096,
      },
    }),
  });

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);

  const data = await res.json();
  const content: string = data?.message?.content;
  if (!content) throw new Error("Ollama returned empty content");

  const parsed = JSON.parse(content) as { sentences?: unknown };
  if (!Array.isArray(parsed.sentences)) throw new Error("Format de réponse inattendu (sentences manquant)");
  // Reject sentences that contain Latin/ASCII letters — they are not valid Japanese
  return (parsed.sentences as unknown[])
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .filter((s) => !/[a-zA-Z]/.test(s));
}

/** Returns exactly `count` sentences, retrying up to 3 times if Ollama returns fewer. */
export async function ollamaGenerateSentences(
  count: number,
  examples: string[],
  ollamaUrl: string,
  model: string,
): Promise<string[]> {
  const exampleSet = new Set(examples);
  const collected: string[] = [];
  const seen = new Set<string>(exampleSet);
  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES && collected.length < count; attempt++) {
    const needed = count - collected.length;
    const batch = await fetchSentenceBatch(needed, examples, new Set(collected), ollamaUrl, model);

    for (const s of batch) {
      const trimmed = s.trim();
      if (!seen.has(trimmed)) {
        seen.add(trimmed);
        collected.push(trimmed);
        if (collected.length === count) break;
      }
    }
  }

  // Always return exactly `count` (slice if somehow over, keep what we have if under after retries)
  return collected.slice(0, count);
}

// ─── Validator agent ──────────────────────────────────────────────────────────

const VALIDATE_SYSTEM_PROMPT = `You are a strict quality-control agent for Japanese grammar puzzle data.

You receive a fully decomposed Japanese sentence (JSON). Detect and fix ALL errors below, then output the corrected JSON in the same format.

━━━ MISSING OR WRONG FIELDS ━━━
Every piece MUST have a "text" field containing the exact Japanese segment (kanji + kana as written in the sentence).
If a piece has no "text" field but has a "reading" field, copy "reading" into "text" and clear "reading" to "". Then set the correct reading (all-hiragana) only if "text" contains kanji.
validOrders MUST contain only pid strings ("p1", "p2", ...). If validOrders contains Japanese text or numbers, rebuild it from the piece pids in sentence order.
grammarNotes MUST be in French. If any note is in Japanese or English, translate it to French.

━━━ ATOMICITY ━━━
Each grammatical particle must be its own separate piece. If any piece fuses a particle with a word, split it.
Particles: は, が, を, に, で, へ, と, の, か, も, から, まで, より, だけ, ながら, なのに, ので, から, ね, よ, etc.
Examples:
  "中国語の本を" → "中国語" + "の" + "本" + "を"
  "友達と"     → "友達" + "と"
  "面白いですね" → "面白い" + "です" + "ね"
  "東京に"     → "東京" + "に"
  "きれいな花" → "きれいな" + "花"  (keep な attached to the na-adjective)
  "洗い物をします" → "洗い物" + "を" + "します"  (3 pieces even for する-verb when を is explicit)
  "食べたら"   → "食べた" + "たら"  (verb past form + たら as separate clauseConnector)
  "食べれば"   → "食べれ" + "ば"    (verb conditional form + ば as separate clauseConnector)

━━━ WRONG GRAMMAR TYPE ━━━
Fix any misclassified grammarType using these rules:

  PARTICLES:
    は / も → topicParticle
    が → subjectParticle
    を → objectParticle
    の (possession/modification) → possessiveParticle
    へ → directionParticle
    と (accompaniment with person) → comitativeParticle
    と (quotation before 言う/思う) → quoteParticle
    に (ALL uses: location, destination, time, result, purpose, indirect object) → locationParticle
    に is NEVER comitativeParticle
    で (location of action, means) → locationParticle
    から/まで/より as spatial/temporal → locationParticle
    から/ので/が/けど/のに/ながら/なら after predicate → clauseConnector
    たら/ば → SEPARATE clauseConnector piece after the verb (食べたら → 食べた + たら)
    だけ/しか/ばかり → auxiliary
    か/ね/よ/ぞ/ぜ/わ/な/さ sentence-final → sentenceFinalParticle

  COPULA: です, だ, である, じゃない, ではない, でした, だった → copula

  ADJECTIVES:
    い-adjective (大きい, 難しい, 面白い) → adjective
    な-adjective + な before noun (きれいな, 有名な, 静かな) → adjective (keep な fused)
    な-adjective alone (predicate, before だ/です) → adjective
    この/その/あの/どの/こんな/そんな/あんな → adjective
    い-adjective adverb form (早く, 大きく) → adverb

  VERBS:
    する-compounds WITHOUT explicit を: keep noun+する fused (勉強する, 練習します) → verb
    する-compounds WITH explicit を: split into 3 pieces (洗い物をします → 洗い物 + を + します)
    Potential (食べられる, 話せる), passive (書かれる), causative (頼む) → verb
    　1たい/たがる → auxiliary
    　…なければならない/なくてはいけない → auxiliary
    　…てもいい/てはいけない → auxiliary
    　かもしれない/だろう/でしょう/はずだ/にちがいない → auxiliary

  TE-FORM chains (keep fused as teForm):
    ている/ていた, てしまう/てしまった, ておく, てみる, てくる/てきた, ていく, てあげる, てくれる, てもらう

  PRONOUNS: 私, 僕, 俗, 彼, 彼女, あなた, 君, これ, それ, あれ, どれ → pronoun
  PLACE DEMONSTRATIVES: ここ, そこ, あそこ, どこ → noun
  INTERJECTIONS: あっ, えっ, おっ, ねえ, うん, いや, あのう, すみません (standalone) → interjection
  NOMINALIZERS: こと (after verb clause), の (nominalizer after verb), ように, わけ, はず → nominalizer

ALLOWED grammarType values: ${GRAMMAR_TYPES.join(", ")}

After any split or type correction:
- Re-number pids p1, p2, p3… sequentially
- Update all pid references in validOrders
- Update acceptsLeft/acceptsRight to reflect the corrected grammar flow
- Update furigana: non-empty reading MANDATORY for any piece with at least one kanji; "" for pure-kana pieces
- Ensure ALL meaning/explanation/grammarNotes text remains in French

Output ONLY valid JSON. No markdown fences, no extra text.`;

async function ollamaValidatePuzzle(
  raw: Record<string, unknown>,
  ollamaUrl: string,
  model: string,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: VALIDATE_SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(raw) },
      ],
      stream: false,
      format: "json",
      options: {
        temperature: 0.0,  // deterministic — this is a correction pass
        num_predict: -1,
        num_ctx: 4096,
      },
    }),
  });

  if (!res.ok) throw new Error(`Ollama validator HTTP ${res.status}`);

  const data = await res.json();
  const content: string = data?.message?.content;
  if (!content) throw new Error("Ollama validator returned empty content");

  return JSON.parse(content) as Record<string, unknown>;
}

// ─── Decompose ─────────────────────────────────────────────────────────────────

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
        num_predict: -1,   // generate until EOS - never truncate
        num_ctx: 8192,     // larger context needed for the full system prompt
      },
    }),
  });

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);

  const data = await res.json();
  const content: string = data?.message?.content;
  if (!content) throw new Error("Ollama returned empty content");

  const parsed = JSON.parse(content) as Record<string, unknown>;

  // Second pass: validator agent fixes non-atomic pieces and grammarType errors
  let validated = parsed;
  try {
    validated = await ollamaValidatePuzzle(parsed, ollamaUrl, model);
  } catch {
    // Validator failed — fall back to original decomposition
  }

  return assignIds(validated, sentence);
}
