import fs from "fs";
import {
  buildPartOfSpeechMap,
  formatPartOfSpeechDataFile,
  getPosDataPath,
  parseWordData,
  validatePartOfSpeechMap,
} from "./pos-utils.mjs";

const words = parseWordData();
const partOfSpeechById = buildPartOfSpeechMap(words);
const validation = validatePartOfSpeechMap(words, partOfSpeechById);

if (
  validation.missing.length > 0 ||
  validation.extra.length > 0 ||
  validation.invalid.length > 0
) {
  throw new Error(
    `Cannot generate partOfSpeechData.ts: ${validation.missing.length} missing, ${validation.extra.length} extra, ${validation.invalid.length} invalid`,
  );
}

fs.writeFileSync(
  getPosDataPath(),
  formatPartOfSpeechDataFile(words, partOfSpeechById),
  "utf8",
);

console.log(`Generated ${getPosDataPath()} with ${validation.covered} entries.`);
