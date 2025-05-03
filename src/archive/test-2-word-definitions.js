import { promises as fs } from "fs";
import OpenAI from "openai";
import "dotenv/config";

const apiKey = process.env.OPENAI_API_KEY;
const testName = "word-definitions";
const testNo = 15;

/**
 * test 15: gpt-4.1-2025-04-14
 * 1 def - dryer
 * result: 15 v 1 - perfect.
 *
 * test 14: gpt-4.1-2025-04-14
 * 1 def - light
 * result: 14 v 1 - perfect.
 *
 * test 13: gpt-4.1-2025-04-14
 * 1 def - break; prompt guidelines emp. multiple definitions
 * result: as good as 10, just traded one definition for another.
 *
 * test 12: gpt-4.1-2025-04-14
 * 1 def - break; more concise prompt guidelines
 * result: as good as 10, just traded one definition for another.
 *
 * test 11: chatgpt-4o-latest
 * 1 def - break
 * result: ugh. More definitions but wonky examples again. Nope.
 *
 * test 10: chatgpt-4.1
 * 1 def - break
 * result: perfect. Wall overcame; get what you paid for.
 *
 * test 01: gpt-4o-mini
 * 3 defs - quality dropped due to excessive output?
 * tokens: i: 471 / o: 633 / t: 1104
 *
 * test 02: gpt-4o-mini
 * 1 def - see if quality improves
 * result: MIXED, slightly more output, but incorrect meanings
 *
 * test 03: gpt-4o-mini
 * 1 def - more clear instructions/safeguards
 * result: no mixed meanings, can it be improved?
 *
 * test 04: gpt-4o-mini
 * 1 def - improve tags + synonym instructions
 * result: no change in tags/synonums, meanings differ - why? = AI non-determinism
 *
 * test 05: gpt-4o-mini
 * 1 def - increase determinism, improve prompt
 * result: not as elaborate as test 1, but seems good enough
 *
 * test 06: gpt-4o-mini
 * 1 def - break
 * result: looks good, except used "broke" in example sentence; should be break!
 *
 * test 07: gpt-4o-mini
 * 1 def - break; example should use word in the same form as the definition
 * result: example uses "break", but it's incorrect!
 *
 * test 08: gpt-4o-mini
 * 1 def - break; improve prompt for better example sentences
 * result: ex. sentence good, definition is being merged, confusing
 *
 * test 09: gpt-4o-mini
 * 1 def - break; improve prompt for better defs
 * result: seems to have hit a wall. Need a new approach.
 */

const openai = new OpenAI({
  apiKey,
});

const buildPrompt = `
You are a professional ESL lexicographer creating structured dictionary entries for high-quality learning resources similar to the Cambridge Online Dictionary or Oxford Learner's Dictionary.

For the word: "dryer"

Return a single valid JSON object with the following structure:

---
🧱 JSON Schema:

{
  "word": "string",  
  "level": {
    "cefr": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
    "rank": 1-10  // 1 = most essential, 10 = least essential for ESL learners
  },
  "phonetics": {
    "IPA": "string"  // International Phonetic Alphabet transcription
  },
  "meanings": [
    {
      "partOfSpeech": "string",
      "definition": "string",
      "example": "string",
      "level": {
        "cefr": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
        "rank": 1-10 // 1 = most essential, 10 = least essential for ESL learners
      },
      "tags": ["tag1", "tag2" ... ], // topic or label (optional, as needed)
      "synonyms": ["tag1", "tag2" ... ] // similar words (optional, as needed)
    }
    // more meanings if necessary for ESL learners
  ],
  "notes": [
    {
      "type": "usage" | "grammar" | "context" | "pronunciation",
      "content": "string"
    }
  ]
}

---
🧷 Guidelines:

Clarity
- Prioritize clear, simple definitions suitable for ESL learners.
- Include synonyms or tags only if available; otherwise, omit.

Example Sentences
- Use natural, everyday language in examples.
- Sentences must use the headword in its base form.
- Do not use inflected forms (e.g. for break - broke, broken, breaking).

Word Senses
- Use consistent meanings across entries.
- Prioritize core CEFR A1, A2, B1 senses.
- List each clearly distinct meaning separately.
- If a word has only one relevant meaning, include only that.
- Do not combine unrelated or distinct senses into one definition.
- Do not repeat the same sense unless the usage is significantly different.
- Include as many distinct senses as are appropriate for ESL learners — whether that's 1, 2, 3, 4, 5 or more in rare cases.

Formatting
- Output valid JSON only — no extra formatting, markdown, or explanations.
`;

const completion = openai.chat.completions.create({
  model: "gpt-4.1-2025-04-14",
  store: false, // don't need convo context
  messages: [{ role: "user", content: buildPrompt }],
  temperature: 0, // make more deterministic, 0+ encourages variation
});

// write to file

completion
  .then((result) => {
    const message = result.choices[0].message;

    // log it out
    console.log(message);

    // Parse the string to ensure it's valid JSON
    const jsonContent = JSON.parse(message.content);
    // Write to file with pretty formatting
    return fs.writeFile(
      `${testName}-${testNo}.json`,
      JSON.stringify(jsonContent, null, 2),
      "utf8"
    );
  })
  .then(() => console.log("Successfully wrote to json file"))
  .catch((error) => console.error("Error:", error));
