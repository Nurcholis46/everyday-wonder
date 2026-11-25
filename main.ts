import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Entry for "Everyday Wonder, Two Days to Find the Line": one sentence
// that makes a small everyday moment strange and new. The shadow is not
// a shape that follows you but a housemate who got home first and is
// waiting to be let in — an evening shadow falling on a doormat, a
// thing anyone coming home has actually seen, turned at an angle the
// reader has not met before, with the twist landing in the last words.
// Alternatives set aside: a bus-stop bench still warm from a stranger
// (warm, but its turn is a gentle metaphor about time, not a jolt); an
// automatic door opening for the wind (playful, but the surprise is a
// shop's mistake, one step removed from the reader's own body); a
// reflection waving after you have gone (leans on the well-worn
// mirror-double trope). The shadow gets home first: the strangeness
// happens to you, on your own doormat, in a single read.
const SENTENCE =
  "My shadow arrived home before I did and was already waiting on the doormat, impatient to be let in.";

// Gate from the kit: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only white space. The checks here are strict on
// purpose — exactly this one sentence, byte for byte: no carriage
// return, no leading or trailing padding, no control characters
// (including U+2028/U+2029) — so the file can never ship a different
// text to the judge than the one gated.
const charCount = [...SENTENCE].length;
if (charCount < 1 || charCount > 200 || SENTENCE.trim().length === 0) {
  throw new Error(
    `entry must be 1-200 characters of non-blank text, got ${charCount}`,
  );
}
if (SENTENCE.includes("\n") || SENTENCE.includes("\r")) {
  throw new Error("entry must be a single sentence on one line");
}
if (SENTENCE !== SENTENCE.trim()) {
  throw new Error("entry must not start or end with whitespace");
}
if (/[\u0000-\u001f\u007f\u2028\u2029]/.test(SENTENCE)) {
  throw new Error("entry must not contain control characters");
}

// The grader sets MAKEFUN_OUTPUT_DIR; fall back to /output when unset.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, "entry.txt");
writeFileSync(outputPath, SENTENCE, { encoding: "utf8", mode: 0o644 });
// The grader collects outputs as another user: leave the file readable
// by everyone, or the run fails with "<path> is not readable".
chmodSync(outputPath, 0o644);

// Read back and prove the file on disk is exactly the gated sentence:
// a write that silently truncated, re-encoded or padded the entry
// would otherwise ship a different text than the one checked above.
const written = readFileSync(outputPath, "utf8");
if (written !== SENTENCE) {
  throw new Error("entry file does not match the gated sentence");
}
if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(SENTENCE, "utf8")) {
  throw new Error("entry file byte length does not match the gated sentence");
}
console.log(`wrote ${outputPath} (${charCount} characters)`);
