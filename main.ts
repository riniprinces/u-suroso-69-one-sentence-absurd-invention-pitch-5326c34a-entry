import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/**
 * One-Sentence Absurd Invention Pitch — entry program.
 *
 * The invention: a toaster that launches every slice under a tiny
 * parachute. The annoyance it fixes: toast always lands butter-side down.
 * The mechanism is silly yet weirdly plausible — a slice that drifts down
 * under silk can never flip onto the butter, so breakfast survives the fall.
 *
 * The program writes the pitch to /output/entry.txt and refuses to finish
 * unless the file passes every gate rule: UTF-8 text, 1-220 characters,
 * not only whitespace, exactly one sentence, no trailing newline.
 */
const ENTRY = {
  pitch:
    "A toaster that launches every slice under a tiny parachute, so your toast can never land butter-side down again.",
  outputPath: "/output/entry.txt",
  minChars: 1,
  maxChars: 220,
} as const;

type Failure = { rule: string; detail: string };

function checkLength(text: string): Failure | null {
  const chars = [...text].length;
  if (chars < ENTRY.minChars || chars > ENTRY.maxChars) {
    return { rule: "length", detail: `${chars} characters, allowed ${ENTRY.minChars}-${ENTRY.maxChars}` };
  }
  return null;
}

function checkNotBlank(text: string): Failure | null {
  if (text.trim().length === 0) {
    return { rule: "blank", detail: "entry is only whitespace" };
  }
  return null;
}

function checkSingleSentence(text: string): Failure | null {
  const enders = [...text].filter((ch) => ch === "." || ch === "!" || ch === "?");
  if (enders.length !== 1) {
    return { rule: "one-sentence", detail: `found ${enders.length} sentence enders, expected 1` };
  }
  if (!text.endsWith(".")) {
    return { rule: "one-sentence", detail: "the single sentence must end with a period" };
  }
  if (text.endsWith("\n")) {
    return { rule: "no-trailing-newline", detail: "a trailing newline counts toward the 220 characters" };
  }
  return null;
}

function validate(text: string): void {
  const failures = [checkLength, checkNotBlank, checkSingleSentence]
    .map((check) => check(text))
    .filter((f): f is Failure => f !== null);
  if (failures.length > 0) {
    const summary = failures.map((f) => `${f.rule}: ${f.detail}`).join(" | ");
    throw new Error(`gate failed — ${summary}`);
  }
}

function writeEntry(text: string): void {
  mkdirSync(dirname(ENTRY.outputPath), { recursive: true });
  writeFileSync(ENTRY.outputPath, text, { encoding: "utf8" });
}

function verifyWritten(text: string): void {
  const onDisk = readFileSync(ENTRY.outputPath, "utf8");
  if (onDisk !== text) {
    throw new Error("round-trip check failed: file contents differ from the pitch");
  }
  if (onDisk.length !== [...text].length) {
    throw new Error("round-trip check failed: character count changed on disk");
  }
}

function run(): void {
  validate(ENTRY.pitch);
  writeEntry(ENTRY.pitch);
  verifyWritten(ENTRY.pitch);
  console.log(
    `wrote ${[...ENTRY.pitch].length}-character pitch to ${ENTRY.outputPath}: ${JSON.stringify(ENTRY.pitch)}`,
  );
}

run();
