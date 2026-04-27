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
  },
];
