import type { SentencePuzzle } from "../types/puzzle";

export const sentencePuzzles: SentencePuzzle[] = [
  {
    id: "sentence-001",
    level: "N5",
    japanese: "私は昨日友達と映画を見ました。",
    translation: "Hier, j'ai regardé un film avec un ami.",
    explanation:
      "私は introduit le thème, 昨日 place le contexte temporel, 友達と indique l'accompagnement, 映画を marque l'objet direct, et le verbe 見ました termine la phrase.",
    pieces: [
      { id: "s1-p1", text: "私", reading: "わたし", meaning: "moi / je", grammarType: "pronoun", correctIndex: 0, acceptsLeft: [], acceptsRight: ["topicParticle"] },
      { id: "s1-p2", text: "は", reading: "wa", meaning: "particule de thème", grammarType: "topicParticle", correctIndex: 1, acceptsLeft: ["pronoun", "noun"], acceptsRight: ["timeExpression", "noun", "adverb"] },
      { id: "s1-p3", text: "昨日", reading: "きのう", meaning: "hier", grammarType: "timeExpression", correctIndex: 2, acceptsLeft: ["topicParticle"], acceptsRight: ["noun"] },
      { id: "s1-p4", text: "友達", reading: "ともだち", meaning: "ami", grammarType: "noun", correctIndex: 3, acceptsLeft: ["timeExpression"], acceptsRight: ["comitativeParticle"] },
      { id: "s1-p5", text: "と", reading: "to", meaning: "avec", grammarType: "comitativeParticle", correctIndex: 4, acceptsLeft: ["noun", "pronoun"], acceptsRight: ["noun"] },
      { id: "s1-p6", text: "映画", reading: "えいが", meaning: "film", grammarType: "noun", correctIndex: 5, acceptsLeft: ["comitativeParticle"], acceptsRight: ["objectParticle"] },
      { id: "s1-p7", text: "を", reading: "wo", meaning: "particule d'objet", grammarType: "objectParticle", correctIndex: 6, acceptsLeft: ["noun"], acceptsRight: ["verb"] },
      { id: "s1-p8", text: "見ました", reading: "みました", meaning: "ai regardé", grammarType: "verb", correctIndex: 7, acceptsLeft: ["objectParticle"], acceptsRight: [] },
    ],
    validOrders: [
      ["s1-p1", "s1-p2", "s1-p3", "s1-p4", "s1-p5", "s1-p6", "s1-p7", "s1-p8"],
      ["s1-p3", "s1-p1", "s1-p2", "s1-p4", "s1-p5", "s1-p6", "s1-p7", "s1-p8"],
    ],
    grammarNotes: [
      { rule: "Ordre SOV", explanation: "Le japonais place le verbe en fin de phrase. Tous les compléments (temps, lieu, objet) précèdent le verbe." },
      { rule: "は : particule de thème", explanation: "は (wa) introduit le thème de la phrase et suit directement le nom ou le pronom qu'elle marque." },
      { rule: "Liberté du repère temporel", explanation: "昨日 (hier) peut se placer avant ou après le thème 私は. Les deux ordres sont naturels en japonais." },
    ],
  },
  {
    id: "sentence-002",
    level: "N4",
    japanese: "雨が降っているので、今日は家で勉強します。",
    translation: "Comme il pleut, aujourd'hui j'étudie à la maison.",
    explanation:
      "雨が identifie le sujet, 降っている exprime une action en cours, ので donne la cause, puis 今日は家で勉強します décrit l'action principale.",
    pieces: [
      { id: "s2-p1", text: "雨", reading: "あめ", meaning: "pluie", grammarType: "noun", correctIndex: 0, acceptsLeft: [], acceptsRight: ["subjectParticle"] },
      { id: "s2-p2", text: "が", reading: "ga", meaning: "particule de sujet", grammarType: "subjectParticle", correctIndex: 1, acceptsLeft: ["noun"], acceptsRight: ["teForm"] },
      { id: "s2-p3", text: "降っている", reading: "ふっている", meaning: "est en train de tomber", grammarType: "teForm", correctIndex: 2, acceptsLeft: ["subjectParticle"], acceptsRight: ["clauseConnector"] },
      { id: "s2-p4", text: "ので", reading: "node", meaning: "comme / parce que", grammarType: "clauseConnector", correctIndex: 3, acceptsLeft: ["teForm", "verb", "adjective"], acceptsRight: ["timeExpression"] },
      { id: "s2-p5", text: "今日", reading: "きょう", meaning: "aujourd'hui", grammarType: "timeExpression", correctIndex: 4, acceptsLeft: ["clauseConnector"], acceptsRight: ["topicParticle"] },
      { id: "s2-p6", text: "は", reading: "wa", meaning: "particule de thème", grammarType: "topicParticle", correctIndex: 5, acceptsLeft: ["timeExpression", "noun"], acceptsRight: ["noun"] },
      { id: "s2-p7", text: "家", reading: "いえ", meaning: "maison", grammarType: "noun", correctIndex: 6, acceptsLeft: ["topicParticle"], acceptsRight: ["locationParticle"] },
      { id: "s2-p8", text: "で", reading: "de", meaning: "lieu de l'action", grammarType: "locationParticle", correctIndex: 7, acceptsLeft: ["noun"], acceptsRight: ["noun", "verb"] },
      { id: "s2-p9", text: "勉強します", reading: "べんきょうします", meaning: "j'étudie", grammarType: "verb", correctIndex: 8, acceptsLeft: ["locationParticle", "objectParticle"], acceptsRight: [] },
    ],
    validOrders: [
      ["s2-p1", "s2-p2", "s2-p3", "s2-p4", "s2-p5", "s2-p6", "s2-p7", "s2-p8", "s2-p9"],
    ],
    grammarNotes: [
      { rule: "ので : cause formelle", explanation: "ので exprime une cause logique et objective, plus formelle que から. Il s'attache à la forme en て du verbe ou à un adjectif." },
      { rule: "Subordonnée avant principale", explanation: "En japonais, la proposition causale (雨が降っているので) précède toujours la proposition principale." },
      { rule: "〜ている : action en cours", explanation: "降っている exprime un état continu. La forme en て + いる décrit une action qui est en train de se dérouler." },
    ],
  },
  {
    id: "sentence-003",
    level: "N4",
    japanese: "日本語を上手に話せるようになりたいです。",
    translation: "Je veux devenir capable de bien parler japonais.",
    explanation:
      "日本語を marque l'objet, 上手に modifie l'action, 話せる exprime la capacité, ように indique l'objectif ou l'état visé, et なりたいです exprime le désir de devenir ainsi.",
    pieces: [
      { id: "s3-p1", text: "日本語", reading: "にほんご", meaning: "japonais", grammarType: "noun", correctIndex: 0, acceptsLeft: [], acceptsRight: ["objectParticle"] },
      { id: "s3-p2", text: "を", reading: "wo", meaning: "particule d'objet", grammarType: "objectParticle", correctIndex: 1, acceptsLeft: ["noun"], acceptsRight: ["adverb"] },
      { id: "s3-p3", text: "上手に", reading: "じょうずに", meaning: "habilement / bien", grammarType: "adverb", correctIndex: 2, acceptsLeft: ["objectParticle"], acceptsRight: ["verb"] },
      { id: "s3-p4", text: "話せる", reading: "はなせる", meaning: "pouvoir parler", grammarType: "verb", correctIndex: 3, acceptsLeft: ["adverb"], acceptsRight: ["nominalizer"] },
      { id: "s3-p5", text: "ように", reading: "ように", meaning: "de sorte à / afin de", grammarType: "nominalizer", correctIndex: 4, acceptsLeft: ["verb"], acceptsRight: ["verb"] },
      { id: "s3-p6", text: "なりたいです", reading: "なりたいです", meaning: "vouloir devenir", grammarType: "verb", correctIndex: 5, acceptsLeft: ["nominalizer"], acceptsRight: [] },
    ],
    validOrders: [
      ["s3-p1", "s3-p2", "s3-p3", "s3-p4", "s3-p5", "s3-p6"],
      ["s3-p3", "s3-p1", "s3-p2", "s3-p4", "s3-p5", "s3-p6"],
    ],
    grammarNotes: [
      { rule: "ようになる : devenir capable", explanation: "ようになる exprime un changement progressif de capacité ou d'état. Il suit la forme potentielle du verbe." },
      { rule: "Verbe potentiel", explanation: "話せる est la forme potentielle de 話す (parler). Elle exprime la capacité à faire quelque chose." },
      { rule: "Liberté de l'adverbe de manière", explanation: "上手に peut se placer avant ou après 日本語を sans changer le sens. Les deux ordres sont acceptés." },
    ],
  },
  {
    id: "sentence-004",
    level: "N4",
    japanese: "先生が言ったことを忘れないでください。",
    translation: "N'oubliez pas ce que le professeur a dit.",
    explanation:
      "先生が marque le sujet de la proposition, 言ったこと transforme 'ce qui a été dit' en nom, を marque cet ensemble comme objet, puis 忘れないでください donne la demande négative polie.",
    pieces: [
      { id: "s4-p1", text: "先生", reading: "せんせい", meaning: "professeur", grammarType: "noun", correctIndex: 0, acceptsLeft: [], acceptsRight: ["subjectParticle"] },
      { id: "s4-p2", text: "が", reading: "ga", meaning: "particule de sujet", grammarType: "subjectParticle", correctIndex: 1, acceptsLeft: ["noun"], acceptsRight: ["verb"] },
      { id: "s4-p3", text: "言った", reading: "いった", meaning: "a dit", grammarType: "verb", correctIndex: 2, acceptsLeft: ["subjectParticle"], acceptsRight: ["nominalizer"] },
      { id: "s4-p4", text: "こと", reading: "koto", meaning: "chose / fait", grammarType: "nominalizer", correctIndex: 3, acceptsLeft: ["verb"], acceptsRight: ["objectParticle"] },
      { id: "s4-p5", text: "を", reading: "wo", meaning: "particule d'objet", grammarType: "objectParticle", correctIndex: 4, acceptsLeft: ["nominalizer", "noun"], acceptsRight: ["verb"] },
      { id: "s4-p6", text: "忘れないでください", reading: "わすれないでください", meaning: "n'oubliez pas", grammarType: "verb", correctIndex: 5, acceptsLeft: ["objectParticle"], acceptsRight: [] },
    ],
    validOrders: [
      ["s4-p1", "s4-p2", "s4-p3", "s4-p4", "s4-p5", "s4-p6"],
    ],
    grammarNotes: [
      { rule: "こと : nominalisateur", explanation: "こと transforme une proposition verbale en groupe nominal. 先生が言ったこと = \"ce que le professeur a dit\"." },
      { rule: "Proposition relative", explanation: "En japonais, la relative précède toujours le nom qu'elle modifie, contrairement au français." },
      { rule: "〜ないでください : demande négative", explanation: "ないでください suit la forme négative du verbe. C'est une demande polie de ne pas faire quelque chose." },
    ],
  },
  {
    id: "sentence-005",
    level: "N3",
    japanese: "電車に乗る前に、駅で切符を買いました。",
    translation: "Avant de monter dans le train, j'ai acheté un billet à la gare.",
    explanation:
      "電車に乗る前に forme le repère temporel 'avant de monter dans le train'. 駅で indique le lieu de l'action, 切符を marque l'objet acheté, et 買いました termine la phrase.",
    pieces: [
      { id: "s5-p1", text: "電車", reading: "でんしゃ", meaning: "train", grammarType: "noun", correctIndex: 0, acceptsLeft: [], acceptsRight: ["directionParticle"] },
      { id: "s5-p2", text: "に", reading: "ni", meaning: "vers / dans", grammarType: "directionParticle", correctIndex: 1, acceptsLeft: ["noun"], acceptsRight: ["verb"] },
      { id: "s5-p3", text: "乗る", reading: "のる", meaning: "monter", grammarType: "verb", correctIndex: 2, acceptsLeft: ["directionParticle"], acceptsRight: ["timeExpression"] },
      { id: "s5-p4", text: "前に", reading: "まえに", meaning: "avant", grammarType: "timeExpression", correctIndex: 3, acceptsLeft: ["verb"], acceptsRight: ["noun"] },
      { id: "s5-p5", text: "駅", reading: "えき", meaning: "gare", grammarType: "noun", correctIndex: 4, acceptsLeft: ["timeExpression"], acceptsRight: ["locationParticle"] },
      { id: "s5-p6", text: "で", reading: "de", meaning: "lieu de l'action", grammarType: "locationParticle", correctIndex: 5, acceptsLeft: ["noun"], acceptsRight: ["noun"] },
      { id: "s5-p7", text: "切符", reading: "きっぷ", meaning: "billet", grammarType: "noun", correctIndex: 6, acceptsLeft: ["locationParticle"], acceptsRight: ["objectParticle"] },
      { id: "s5-p8", text: "を", reading: "wo", meaning: "particule d'objet", grammarType: "objectParticle", correctIndex: 7, acceptsLeft: ["noun"], acceptsRight: ["verb"] },
      { id: "s5-p9", text: "買いました", reading: "かいました", meaning: "ai acheté", grammarType: "verb", correctIndex: 8, acceptsLeft: ["objectParticle"], acceptsRight: [] },
    ],
    validOrders: [
      ["s5-p1", "s5-p2", "s5-p3", "s5-p4", "s5-p5", "s5-p6", "s5-p7", "s5-p8", "s5-p9"],
    ],
    grammarNotes: [
      { rule: "前に : avant de", explanation: "前に suit un verbe à la forme dictionnaire. 電車に乗る前に = \"avant de monter dans le train\"." },
      { rule: "Repère temporel en début de phrase", explanation: "La subordonnée temporelle (電車に乗る前に) se place en début de phrase, avant la proposition principale." },
      { rule: "に : direction vs で : lieu d'action", explanation: "に (ni) indique la destination (電車に乗る = monter dans le train). で (de) indique le lieu où se déroule l'action (駅で = à la gare)." },
    ],
  },
  {
    id: "sentence-006",
    level: "N4",
    japanese: "山田さんはフランス語を毎日練習しています。",
    translation: "Madame Yamada pratique le français tous les jours.",
    explanation:
      "山田さんは introduce le thème. フランス語を marque l'objet. 毎日 est un adverbe de fréquence mobile qui peut se placer avant ou après l'objet を. 練習しています exprime une action habituelle.",
    pieces: [
      { id: "s6-p1", text: "山田さん", reading: "やまださん", meaning: "Madame Yamada", grammarType: "noun", correctIndex: 0, acceptsLeft: [], acceptsRight: ["topicParticle"] },
      { id: "s6-p2", text: "は", reading: "wa", meaning: "particule de thème", grammarType: "topicParticle", correctIndex: 1, acceptsLeft: ["noun", "pronoun"], acceptsRight: ["noun", "frequencyAdverb"] },
      { id: "s6-p3", text: "フランス語", reading: "フランスご", meaning: "français", grammarType: "noun", correctIndex: 2, acceptsLeft: ["topicParticle", "frequencyAdverb"], acceptsRight: ["objectParticle"] },
      { id: "s6-p4", text: "を", reading: "wo", meaning: "particule d'objet", grammarType: "objectParticle", correctIndex: 3, acceptsLeft: ["noun"], acceptsRight: ["frequencyAdverb", "verb"] },
      { id: "s6-p5", text: "毎日", reading: "まいにち", meaning: "tous les jours", grammarType: "frequencyAdverb", correctIndex: 4, acceptsLeft: ["topicParticle", "objectParticle"], acceptsRight: ["noun", "verb"] },
      { id: "s6-p6", text: "練習しています", reading: "れんしゅうしています", meaning: "pratique", grammarType: "verb", correctIndex: 5, acceptsLeft: ["frequencyAdverb", "objectParticle"], acceptsRight: [] },
    ],
    validOrders: [
      ["s6-p1", "s6-p2", "s6-p3", "s6-p4", "s6-p5", "s6-p6"],
      ["s6-p1", "s6-p2", "s6-p5", "s6-p3", "s6-p4", "s6-p6"],
    ],
    grammarNotes: [
      { rule: "Adverbe de fréquence libre", explanation: "毎日 (tous les jours) peut se placer avant ou après l'objet を. Essayez les deux ordres : ils sont également naturels en japonais !" },
      { rule: "〜しています : aspect habituel", explanation: "〜ています exprime une action habituelle ou en cours. Ici 練習しています = \"pratique\" (habitude régulière)." },
    ],
  },
  {
    id: "sentence-007",
    level: "N5",
    japanese: "来週、友達と京都に行きます。",
    translation: "La semaine prochaine, je vais à Kyoto avec un ami.",
    explanation:
      "来週 est un repère temporel libre qui peut se placer avant ou après 友達と. 友達と indique l'accompagnement. 京都に marque la destination avec に de direction. 行きます est le verbe de déplacement.",
    pieces: [
      { id: "s7-p1", text: "来週", reading: "らいしゅう", meaning: "la semaine prochaine", grammarType: "timeExpression", correctIndex: 0, acceptsLeft: ["comitativeParticle"], acceptsRight: ["noun"] },
      { id: "s7-p2", text: "友達", reading: "ともだち", meaning: "ami", grammarType: "noun", correctIndex: 1, acceptsLeft: ["timeExpression"], acceptsRight: ["comitativeParticle"] },
      { id: "s7-p3", text: "と", reading: "to", meaning: "avec", grammarType: "comitativeParticle", correctIndex: 2, acceptsLeft: ["noun", "pronoun"], acceptsRight: ["noun", "timeExpression"] },
      { id: "s7-p4", text: "京都", reading: "きょうと", meaning: "Kyoto", grammarType: "noun", correctIndex: 3, acceptsLeft: ["comitativeParticle", "timeExpression"], acceptsRight: ["directionParticle"] },
      { id: "s7-p5", text: "に", reading: "ni", meaning: "vers / à", grammarType: "directionParticle", correctIndex: 4, acceptsLeft: ["noun"], acceptsRight: ["verb"] },
      { id: "s7-p6", text: "行きます", reading: "いきます", meaning: "vais", grammarType: "verb", correctIndex: 5, acceptsLeft: ["directionParticle"], acceptsRight: [] },
    ],
    validOrders: [
      ["s7-p1", "s7-p2", "s7-p3", "s7-p4", "s7-p5", "s7-p6"],
      ["s7-p2", "s7-p3", "s7-p1", "s7-p4", "s7-p5", "s7-p6"],
    ],
    grammarNotes: [
      { rule: "Compléments circonstanciels libres", explanation: "来週 (temps) et 友達と (accompagnement) sont tous deux mobiles. Permutez-les : les deux ordres sont naturels en japonais." },
      { rule: "に : particule de direction", explanation: "に (ni) suit un lieu et indique la destination avec un verbe de déplacement comme 行く (aller)." },
    ],
  },
];
