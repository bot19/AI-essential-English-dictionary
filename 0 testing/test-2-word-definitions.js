import { promises as fs } from "fs";
import OpenAI from "openai";
import "dotenv/config";

const apiKey = process.env.CHATGPT_DICTIONARY_API_KEY;
const testName = "word-definitions";
const testNo = 4;

/**
 * test 1: 3 defs - quality dropped due to excessive output?
 * -- tokens: i: 471 / o: 633 / t: 1104
 *
 * test 2: 1 def - see if quality improves
 * -- result: MIXED, slightly more output, but incorrect meanings
 *
 * test 3: 1 def - more clear instructions/safeguards
 * -- result: no mixed meanings, can it be improved?
 *
 * test 4: 1 def - improve tags + synonym instructions
 * -- result:
 */

const openai = new OpenAI({
  apiKey,
});

const buildPrompt = `
You are a professional ESL lexicographer creating structured dictionary entries for high-quality learner resources similar to the Cambridge Online Dictionary or Oxford Learner's Dictionary.

For the word: "light".

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

- Prioritize clear, simple definitions suitable for ESL learners
- Keep example sentences natural and in everyday contexts
- Include 1 or more distinct senses of the word as definitions, as needed.
- If the word only has one common and relevant meaning for ESL learners, provide only that.
- If the word has multiple clearly distinct meanings (especially across different contexts or parts of speech), list each meaning separately.
- Never merge unrelated meanings into one definition (e.g., “not heavy” vs “bright” for light).
- If a meaning doesn’t have synonyms or tags, leave those fields out
- Use valid JSON only — no extra explanations or markdown
`;

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: false, // don't need convo context
  messages: [{ role: "user", content: buildPrompt }],
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
