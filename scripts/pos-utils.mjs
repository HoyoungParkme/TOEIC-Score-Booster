import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const WORD_DATA_PATH = path.join(ROOT_DIR, "client/src/lib/wordData.ts");
const POS_DATA_PATH = path.join(ROOT_DIR, "client/src/lib/partOfSpeechData.ts");
const WORD_DATA_MARKER = "export const wordData: WordEntry[] = ";

export const SIMPLE_PART_OF_SPEECH = [
  "n.",
  "v.",
  "adj.",
  "adv.",
  "prep.",
  "conj.",
  "pron.",
  "det.",
  "phr.",
  "v. phr.",
  "adj. phr.",
  "adv. phr.",
  "prep. phr.",
];

const PREPOSITION_WORDS = new Set([
  "aboard",
  "about",
  "above",
  "across",
  "after",
  "against",
  "along",
  "amid",
  "among",
  "around",
  "as",
  "at",
  "before",
  "behind",
  "below",
  "beneath",
  "beside",
  "besides",
  "between",
  "beyond",
  "by",
  "concerning",
  "despite",
  "down",
  "during",
  "except",
  "for",
  "from",
  "in",
  "inside",
  "into",
  "like",
  "near",
  "of",
  "off",
  "on",
  "onto",
  "out",
  "outside",
  "over",
  "past",
  "per",
  "regarding",
  "round",
  "since",
  "through",
  "throughout",
  "till",
  "to",
  "toward",
  "towards",
  "under",
  "underneath",
  "until",
  "up",
  "upon",
  "via",
  "with",
  "within",
  "without",
]);

const CONJUNCTION_WORDS = new Set([
  "although",
  "because",
  "if",
  "lest",
  "once",
  "than",
  "that",
  "though",
  "unless",
  "whether",
  "whereas",
  "while",
]);

const PRONOUN_WORDS = new Set([
  "anyone",
  "anybody",
  "anything",
  "everyone",
  "everybody",
  "everything",
  "someone",
  "somebody",
  "something",
  "nobody",
  "nothing",
  "what",
  "whatever",
  "which",
  "whichever",
  "who",
  "whoever",
  "whom",
  "whomever",
  "whose",
]);

const DETERMINER_WORDS = new Set([
  "a",
  "an",
  "all",
  "another",
  "any",
  "both",
  "each",
  "either",
  "every",
  "few",
  "many",
  "much",
  "neither",
  "other",
  "several",
  "some",
  "that",
  "the",
  "these",
  "this",
  "those",
]);

const ADVERB_WORDS = new Set([
  "abroad",
  "ahead",
  "alone",
  "almost",
  "already",
  "apart",
  "aside",
  "away",
  "here",
  "hence",
  "indoors",
  "instead",
  "just",
  "nearly",
  "never",
  "now",
  "often",
  "otherwise",
  "outdoors",
  "quite",
  "rarely",
  "rather",
  "seldom",
  "sometimes",
  "soon",
  "still",
  "then",
  "there",
  "thus",
  "together",
  "very",
  "yet",
]);

const NOUN_SUFFIXES = [
  "tion",
  "sion",
  "ment",
  "ness",
  "ity",
  "ship",
  "ance",
  "ence",
  "acy",
  "ism",
  "ist",
  "dom",
  "hood",
];

const ADJECTIVE_SUFFIXES = [
  "able",
  "ible",
  "al",
  "ant",
  "ary",
  "ent",
  "ful",
  "ic",
  "ical",
  "ish",
  "ive",
  "less",
  "like",
  "ory",
  "ous",
];

const VERB_SUFFIXES = ["ate", "en", "ify", "ise", "ize"];

const KOREAN_ADVERB_WORDS = new Set([
  "가까스로",
  "가까이",
  "간단히",
  "결국",
  "계속",
  "곧",
  "급히",
  "나란히",
  "내내",
  "당연히",
  "대신",
  "다시",
  "따라서",
  "멀리",
  "몸소",
  "미리",
  "바로",
  "별로",
  "별도로",
  "상당히",
  "서둘러",
  "아주",
  "아직",
  "완전히",
  "이미",
  "자주",
  "점차",
  "즉시",
  "직접",
  "철저히",
  "특히",
  "함께",
  "항상",
  "확실히",
  "동시에",
  "거의",
]);

const KOREAN_ADJECTIVE_TOKENS = new Set([
  "가능한",
  "객원의",
  "결정적인",
  "겸손한",
  "교양 있는",
  "관련된",
  "귀중한",
  "깔끔한",
  "관련된",
  "능숙한",
  "대담한",
  "두꺼운",
  "매력적인",
  "명랑한",
  "명백한",
  "명확한",
  "모범적인",
  "미미한",
  "방문의",
  "방문하는",
  "방어적인",
  "보이는",
  "분명한",
  "불리한",
  "생활적인",
  "없는",
  "엄격한",
  "열렬한",
  "열심인",
  "완벽한",
  "완전한",
  "우아한",
  "우울한",
  "유능한",
  "유창한",
  "이례적인",
  "이상적인",
  "있는",
  "적절한",
  "절대적인",
  "정교한",
  "좋은",
  "주의하는",
  "주목할 만한",
  "중요한",
  "중인",
  "철저한",
  "필요한",
  "합리적인",
  "헌신적인",
  "호소하는",
  "확실한",
  "훌륭한",
  "활동적인",
  "잘 교육된",
  "예술적인",
]);

const COMPOSITE_ORDER = ["adj", "v", "adv", "prep", "conj", "pron", "det", "n"];

const PART_OF_SPEECH_OVERRIDES = {
  80000104: "adj. phr.",
  80000112: "n.",
  80000140: "adj./n.",
  80000201: "adj. phr.",
  80000202: "adv. phr.",
  80000203: "adv. phr.",
  80000223: "prep.",
  80000245: "n.",
  80000701: "adv. phr.",
  80000702: "adj.",
  80000703: "adv. phr.",
  80001401: "adv./prep.",
};

export function getWordDataPath() {
  return WORD_DATA_PATH;
}

export function getPosDataPath() {
  return POS_DATA_PATH;
}

export function parseWordData() {
  const text = fs.readFileSync(WORD_DATA_PATH, "utf8");
  const start = text.indexOf(WORD_DATA_MARKER);
  const jsonStart = text.indexOf("[", start + WORD_DATA_MARKER.length);
  const end = text.lastIndexOf("];");

  if (start === -1 || jsonStart === -1 || end === -1) {
    throw new Error("Failed to parse wordData.ts");
  }

  return JSON.parse(text.slice(jsonStart, end + 1));
}

function cleanWord(word) {
  return word
    .toLowerCase()
    .replace(/\(=.*?\)/g, "")
    .replace(/\([^)]*\)/g, "")
    .trim();
}

function splitMeaning(meaning) {
  return meaning
    .split(/[,;/]/)
    .map((part) => part.replace(/^\([^)]*\)\s*/, "").trim())
    .filter(Boolean);
}

function tokenLastWord(token) {
  const tokens = token.split(/\s+/);
  return tokens[tokens.length - 1];
}

function isKoreanAdverb(token) {
  return (
    KOREAN_ADVERB_WORDS.has(token) ||
    /(하게|히|도록|이도록|게|하여|게도|적으로)$/.test(token)
  );
}

function isKoreanAdjective(token) {
  if (KOREAN_ADJECTIVE_TOKENS.has(token)) {
    return true;
  }

  if (/^(잘 교육된|교양 있는|문제가 있는|관심 있는|주목할 만한)$/.test(token)) {
    return true;
  }

  if (
    token.includes(" ") &&
    /(은|는|된|중인|있는|없는|적인|스러운|로운|할|될|받는|가는|오는|보이는|하는)$/.test(
      tokenLastWord(token),
    )
  ) {
    return true;
  }

  return /(적인|스러운|로운|가능한|필요한|중요한|명백한|분명한|적절한|귀중한|대담한|겸손한|깔끔한|명랑한|예술적인|집중적인|거대한|주기적인|모범적인|대표적인|결정적인|이례적인|훌륭한|열광적인|관련된|능숙한|유능한|명확한|교양 있는|호소하는|매력적인|주의하는)$/.test(
    token,
  );
}

function isKoreanVerb(token) {
  if (isKoreanAdjective(token) || isKoreanAdverb(token)) {
    return false;
  }

  if (/^[~(]?[^)~]*[을를에와과로에게서] .*다$/.test(token)) {
    return true;
  }

  return /다$/.test(token);
}

function getMeaningCategories(meaning) {
  const tokens = splitMeaning(meaning);
  const categories = new Set();

  for (const token of tokens) {
    if (isKoreanAdverb(token)) {
      categories.add("adv");
      continue;
    }

    if (isKoreanAdjective(token)) {
      categories.add("adj");
      continue;
    }

    if (isKoreanVerb(token)) {
      categories.add("v");
      continue;
    }

    categories.add("n");
  }

  return { categories, tokens };
}

function getEnglishHint(word) {
  const normalized = cleanWord(word);
  const tokens = normalized.split(/\s+/).filter(Boolean);

  if (tokens.length === 1) {
    const token = tokens[0];

    if (PRONOUN_WORDS.has(token)) return "pron";
    if (DETERMINER_WORDS.has(token)) return "det";
    if (CONJUNCTION_WORDS.has(token)) return "conj";
    if (PREPOSITION_WORDS.has(token)) return "prep";
    if (ADVERB_WORDS.has(token) || token.endsWith("ly")) return "adv";
    if (NOUN_SUFFIXES.some((suffix) => token.endsWith(suffix))) return "n";
    if (
      ADJECTIVE_SUFFIXES.some((suffix) => token.endsWith(suffix)) ||
      /(ed|ing)$/.test(token)
    ) {
      return "adj";
    }
    if (VERB_SUFFIXES.some((suffix) => token.endsWith(suffix))) return "v";
    return null;
  }

  const [head] = tokens;
  if (PREPOSITION_WORDS.has(head)) return "prep-phrase";
  return null;
}

function labelForBase(base, isPhrase) {
  if (isPhrase) {
    if (base === "v") return "v. phr.";
    if (base === "adj") return "adj. phr.";
    if (base === "adv") return "adv. phr.";
    if (base === "prep") return "prep. phr.";
  }

  return {
    n: "n.",
    v: "v.",
    adj: "adj.",
    adv: "adv.",
    prep: "prep.",
    conj: "conj.",
    pron: "pron.",
    det: "det.",
  }[base];
}

function compositeLabel(first, second, isPhrase) {
  const ordered = [first, second].sort(
    (left, right) =>
      COMPOSITE_ORDER.indexOf(left) - COMPOSITE_ORDER.indexOf(right),
  );

  return ordered
    .map((base) =>
      labelForBase(base, isPhrase && ["v", "adj", "adv", "prep"].includes(base)),
    )
    .join("/");
}

export function classifyPartOfSpeech(entry) {
  const override = PART_OF_SPEECH_OVERRIDES[entry.id];
  if (override) {
    return override;
  }

  const normalizedWord = cleanWord(entry.word);
  const isPhrase = /\s/.test(normalizedWord);
  const englishHint = getEnglishHint(entry.word);
  const { categories, tokens } = getMeaningCategories(entry.meaningKo);
  const has = (category) => categories.has(category);
  const hasRelationMeaning = tokens.some((token) => token.startsWith("~"));

  if (englishHint === "pron" || englishHint === "det" || englishHint === "conj") {
    return labelForBase(englishHint, false);
  }

  if (englishHint === "prep") {
    if (has("adv")) {
      return compositeLabel("adv", "prep", false);
    }
    return "prep.";
  }

  if (englishHint === "prep-phrase") {
    if (has("adj") && has("adv")) {
      return compositeLabel("adj", "adv", true);
    }
    if (has("adj")) {
      return "adj. phr.";
    }
    if (hasRelationMeaning) {
      return "prep. phr.";
    }
    if (has("adv")) {
      return "adv. phr.";
    }
    return "prep. phr.";
  }

  if (tokens.length === 0) {
    return "n.";
  }

  if (categories.size === 1) {
    const [onlyCategory] = categories;

    if (onlyCategory === "n") {
      if (englishHint === "adj") return labelForBase("adj", isPhrase);
      if (englishHint === "adv") return labelForBase("adv", isPhrase);
      if (englishHint === "v" && !isPhrase) return "v.";
      return "n.";
    }

    return labelForBase(onlyCategory, isPhrase);
  }

  if (has("v") && has("adj") && !has("n") && !has("adv")) {
    return compositeLabel("adj", "v", isPhrase);
  }

  if (has("v") && has("n") && !has("adj") && !has("adv")) {
    return compositeLabel("v", "n", isPhrase);
  }

  if (has("adj") && has("n") && !has("v") && !has("adv")) {
    return compositeLabel("adj", "n", isPhrase);
  }

  if (has("adv") && has("n") && !has("v") && !has("adj")) {
    if (englishHint === "adv" || normalizedWord.endsWith("ly")) {
      return labelForBase("adv", isPhrase);
    }
    return compositeLabel("adv", "n", isPhrase);
  }

  if (has("adj") && has("adv") && !has("v") && !has("n")) {
    if (englishHint === "adv" || normalizedWord.endsWith("ly")) {
      return labelForBase("adv", isPhrase);
    }
    return compositeLabel("adj", "adv", isPhrase);
  }

  if (has("v")) return labelForBase("v", isPhrase);
  if (has("adj")) return labelForBase("adj", isPhrase);
  if (has("adv")) return labelForBase("adv", isPhrase);
  if (englishHint === "adj") return labelForBase("adj", isPhrase);
  if (englishHint === "adv") return labelForBase("adv", isPhrase);

  return "n.";
}

export function buildPartOfSpeechMap(words) {
  return Object.fromEntries(
    words
      .slice()
      .sort((left, right) => left.id - right.id)
      .map((entry) => [entry.id, classifyPartOfSpeech(entry)]),
  );
}

export function parsePartOfSpeechData() {
  const text = fs.readFileSync(POS_DATA_PATH, "utf8");
  const entries = Array.from(text.matchAll(/^\s*(\d+): "([^"]+)",?$/gm));

  return Object.fromEntries(entries.map(([, id, value]) => [Number(id), value]));
}

export function isValidPartOfSpeech(value) {
  if (SIMPLE_PART_OF_SPEECH.includes(value)) {
    return true;
  }

  const parts = value.split("/");
  if (parts.length !== 2) {
    return false;
  }

  return (
    parts[0] !== parts[1] &&
    SIMPLE_PART_OF_SPEECH.includes(parts[0]) &&
    SIMPLE_PART_OF_SPEECH.includes(parts[1])
  );
}

export function validatePartOfSpeechMap(words, partOfSpeechById) {
  const wordIds = new Set(words.map((entry) => entry.id));
  const partIds = new Set(Object.keys(partOfSpeechById).map(Number));

  const missing = words
    .filter((entry) => !partIds.has(entry.id))
    .map((entry) => entry.id);

  const extra = [...partIds].filter((id) => !wordIds.has(id)).sort((a, b) => a - b);

  const invalid = Object.entries(partOfSpeechById)
    .filter(([, value]) => !isValidPartOfSpeech(value))
    .map(([id, value]) => ({ id: Number(id), value }));

  return {
    covered: words.length - missing.length,
    total: words.length,
    missing,
    extra,
    invalid,
  };
}

export function formatPartOfSpeechDataFile(words, partOfSpeechById) {
  const lines = [
    "/**",
    " * Generated by scripts/generate-pos-map.mjs",
    " * Do not edit manually. Update the generator or overrides instead.",
    " */",
    "",
    "export const SIMPLE_PART_OF_SPEECH = [",
    ...SIMPLE_PART_OF_SPEECH.map((value) => `  ${JSON.stringify(value)},`),
    "] as const;",
    "",
    "export type SimplePartOfSpeech = (typeof SIMPLE_PART_OF_SPEECH)[number];",
    "export type PartOfSpeech =",
    "  | SimplePartOfSpeech",
    "  | `${SimplePartOfSpeech}/${SimplePartOfSpeech}`;",
    "",
    "export const partOfSpeechById: Record<number, PartOfSpeech> = {",
  ];

  let currentLevel = null;
  let currentDay = null;

  for (const entry of words.slice().sort((left, right) => left.id - right.id)) {
    if (entry.level !== currentLevel || entry.day !== currentDay) {
      currentLevel = entry.level;
      currentDay = entry.day;
      lines.push(`  // Level ${entry.level} Day ${entry.day}`);
    }

    lines.push(`  ${entry.id}: ${JSON.stringify(partOfSpeechById[entry.id])},`);
  }

  lines.push("};", "");
  return `${lines.join("\n")}`;
}
