import { promises as fs } from "fs";
import OpenAI from "openai";
import "dotenv/config";

const apiKey = process.env.CHATGPT_DICTIONARY_API_KEY;
const testName = "word-refine";
const testNo = 3;

/**
 * test 1: gpt-4o-mini
 * test 2: gpt-4.1-mini
 * test 3: gpt-4.1
 */

const openai = new OpenAI({
  apiKey,
});

const buildPrompt = `
You are an ESL dictionary editor (think: Oxford Learner's Dictionary).

- Please review this word definition and make improvements if required
- Keep example sentences consistent with the specific word form being defined; if the word is "break", the example should use "break" and not "broke" (sentence must still be correct)
- Return a single valid JSON object with the same structure
- Use valid JSON only — no explanations, markdown, or extra formatting.

---
🧱 JSON word definition for the word: BREAK

{
  "meanings": [
    {
      "partOfSpeech": "verb",
      "definition": "to separate into pieces or to cause something to stop working",
      "example": "I accidentally break my phone when I drop it.",
      "tags": [
        "action",
        "everyday"
      ],
      "synonyms": [
        "shatter",
        "fracture"
      ]
    },
    {
      "partOfSpeech": "verb",
      "definition": "to stop doing something for a short time",
      "example": "Let's take a break and have some coffee.",
      "tags": [
        "action",
        "everyday"
      ]
    }
  ],
}
`;

const completion = openai.chat.completions.create({
  model: "gpt-4.1-2025-04-14", // gpt-4o-mini | gpt-4.1-mini | ...
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
