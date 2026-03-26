import {
  parsePartOfSpeechData,
  parseWordData,
  validatePartOfSpeechMap,
} from "./pos-utils.mjs";

const words = parseWordData();
const partOfSpeechById = parsePartOfSpeechData();
const validation = validatePartOfSpeechMap(words, partOfSpeechById);

console.log(`${validation.covered}/${validation.total} covered`);
console.log(`${validation.missing.length} missing`);
console.log(`${validation.extra.length} extra`);
console.log(`${validation.invalid.length} invalid labels`);

if (validation.missing.length > 0) {
  console.log(
    `Missing sample: ${validation.missing.slice(0, 10).join(", ")}`,
  );
}

if (validation.extra.length > 0) {
  console.log(`Extra sample: ${validation.extra.slice(0, 10).join(", ")}`);
}

if (validation.invalid.length > 0) {
  console.log(
    `Invalid sample: ${validation.invalid
      .slice(0, 10)
      .map(({ id, value }) => `${id}:${value}`)
      .join(", ")}`,
  );
}

if (
  validation.missing.length > 0 ||
  validation.extra.length > 0 ||
  validation.invalid.length > 0
) {
  process.exitCode = 1;
}
