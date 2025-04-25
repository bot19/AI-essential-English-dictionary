import { promises as fs } from "fs";
import OpenAI from "openai";
import "dotenv/config";

const apiKey = process.env.CHATGPT_DICTIONARY_API_KEY;
const testName = "word-defs-structured";
const testNo = 10;

/**
 * test 10: "gpt-4.1-2025-04-14"
 * dryer
 * result: as good as it will get.
 *
 * test 09: "gpt-4.1-2025-04-14"
 * light
 * result: as good as it will get.
 *
 * test 08: "gpt-4.1-2025-04-14"
 * break; add word family array + simplified phonetics
 * result: as good as it will get.
 *
 * test 07: "gpt-4.1-2025-04-14"
 * break
 * result: very good. Missing "broken" sense, but has 4 senses
 *
 * test 06: "gpt-4.1-mini-2025-04-14"
 * break
 * result: more senses = good, but still break v broke issue
 *
 * test 05: "o3-mini-2025-01-31"
 * break; temperature not supported
 * result: results not good, 5/10
 *
 * test 04: "gpt-4o-mini-2024-07-18"
 * break; re-add lots of sense instructions
 * result: still have combined senses issue
 *
 * test 03: "gpt-4o-mini-2024-07-18"
 * break + more specificity to avoid break v broke issue
 * result: more meanings & no b break v broke issue but combined senses
 *
 * test 02: "gpt-4o-mini-2024-07-18"
 * break + specify English UK
 * result: ugh oh, the break v broke issue again
 *
 * test 01: "gpt-4o-mini-2024-07-18"
 * dryer
 * result: superior v 3-in-1 (def 1), superior v single def gpt-4.1-2025-04-14
 */

const openai = new OpenAI({
  apiKey,
});

const response = await openai.responses.create({
  model: "gpt-4.1-2025-04-14",
  store: false, // don't need convo context
  temperature: 0, // make more deterministic, 0+ encourages variation
  input: [
    {
      role: "system",
      content:
        "You are a professional ESL (English-UK) lexicographer creating structured dictionary entries for high-quality learning resources like the Cambridge or Oxford Learner's Dictionary.",
    },
    {
      role: "user",
      content: "Create a dictionary entry (English-UK) for the word: dryer",
    },
  ],
  text: {
    format: {
      type: "json_schema", // Specifies JSON schema format for structured output
      name: "dictionary_entry", // Custom name for the schema
      schema: {
        type: "object",
        properties: {
          word: {
            type: "string",
            description: "The headword being defined, in its base form.",
          },
          level: {
            type: "object",
            properties: {
              cefr: {
                type: "string",
                description: "CEFR level for overall word difficulty.",
              },
              rank: {
                type: "integer",
                description:
                  "Rank of importance for ESL learners, 1 = most essential, 10 = least essential.",
              },
            },
            required: ["cefr", "rank"],
            additionalProperties: false,
          },
          phonetics: {
            type: "object",
            properties: {
              IPA: {
                type: "string",
                description: "International Phonetic Alphabet transcription.",
              },
              simplified: {
                type: "string",
                description:
                  "an easy, phonetic-style rendering that mimics how native English speakers might 'sound it out' using regular alphabet letters—especially useful for learners unfamiliar with IPA.",
              },
            },
            required: ["IPA", "simplified"],
            additionalProperties: false,
          },
          meanings: {
            type: "array",
            description:
              "List of distinct meanings appropriate for ESL learners. Use consistent meanings across entries. Prioritize core CEFR A1, A2, B1 senses. List each clearly distinct meaning separately. If a word has only one relevant meaning, include only that. Do not combine unrelated or distinct senses into one definition. Do not repeat the same sense unless the usage is significantly different. Include as many distinct senses as are appropriate for ESL learners — whether that's 1, 2, 3, 4, 5 or more in rare cases.",
            items: {
              type: "object",
              properties: {
                partOfSpeech: { type: "string" },
                definition: {
                  type: "string",
                  description: "Clear, ESL-friendly definition.",
                },
                example: {
                  type: "string",
                  description:
                    "Natural, everyday sentence using the word in its base form. Example sentences must not use inflected forms. E.g. for break - don't use: broke, broken, breaking.",
                },
                level: {
                  type: "object",
                  properties: {
                    cefr: {
                      type: "string",
                      description: "CEFR level for this specific meaning.",
                    },
                    rank: {
                      type: "integer",
                      description: "Rank of importance for this meaning.",
                    },
                  },
                  required: ["cefr", "rank"],
                  additionalProperties: false,
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Topic or label (optional, can be empty if not applicable).",
                },
                synonyms: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Synonyms or similar words (optional, can be empty if not applicable).",
                },
              },
              required: [
                "partOfSpeech",
                "definition",
                "example",
                "level",
                "tags",
                "synonyms",
              ],
              additionalProperties: false,
            },
          },
          wordFamily: {
            type: "array",
            items: { type: "string" },
            description:
              "Optional list of related words or forms (Word Families or Derivatives). If none, return empty array.",
          },
          notes: {
            type: "array",
            description:
              "Optional notes (e.g., usage, grammar, context, pronunciation).",
            items: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["usage", "grammar", "context", "pronunciation"],
                },
                content: {
                  type: "string",
                },
              },
              required: ["type", "content"],
              additionalProperties: false, // Disallow extra properties in 'notes'
            },
          },
        },
        required: [
          "word",
          "level",
          "phonetics",
          "meanings",
          "wordFamily",
          "notes",
        ], // Added 'notes' to 'required' array
        additionalProperties: false, // Disallow extra properties at the top level
      },
      strict: true, // Ensures strict schema enforcement
    },
  },
});

// try handling response
try {
  // log the response
  const dictionaryEntry = JSON.parse(response.output_text);
  console.log(JSON.stringify(dictionaryEntry, null, 2));

  // Write to file with pretty formatting
  fs.writeFile(
    `${testName}-${testNo}.json`,
    JSON.stringify(dictionaryEntry, null, 2),
    "utf8"
  );
} catch (error) {
  console.error("Error:", error);
} finally {
  console.log("Successfully wrote to json file");
}
