import { promises as fs } from "fs";
import OpenAI from "openai";
import "dotenv/config";

const apiKey = process.env.CHATGPT_DICTIONARY_API_KEY;
const testName = "word-defs-structured";
const testNo = 1;

/**
 * test 01: "gpt-4o-mini-2024-07-18"
 * try using structured output with 4o-mini
 * result:
 */

const openai = new OpenAI({
  apiKey,
});

const response = await openai.responses.create({
  model: "gpt-4o-mini-2024-07-18",
  store: false, // don't need convo context
  temperature: 0, // make more deterministic, 0+ encourages variation
  input: [
    {
      role: "system",
      content:
        "You are a professional ESL lexicographer creating structured dictionary entries for high-quality learning resources like the Cambridge or Oxford Learner's Dictionary.",
    },
    {
      role: "user",
      content: "Create a dictionary entry for the word: break",
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
                enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
                description: "CEFR level for overall word difficulty.",
              },
              rank: {
                type: "integer",
                minimum: 1,
                maximum: 10,
                description:
                  "Rank of importance for ESL learners, 1 = most essential, 10 = least essential.",
              },
            },
            required: ["cefr", "rank"],
          },
          phonetics: {
            type: "object",
            properties: {
              IPA: {
                type: "string",
                description: "International Phonetic Alphabet transcription.",
              },
            },
            required: ["IPA"],
          },
          meanings: {
            type: "array",
            description:
              "List of distinct meanings appropriate for ESL learners.",
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
                    "Natural, everyday sentence using the word in its base form.",
                },
                level: {
                  type: "object",
                  properties: {
                    cefr: {
                      type: "string",
                      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
                    },
                    rank: {
                      type: "integer",
                      minimum: 1,
                      maximum: 10,
                    },
                  },
                  required: ["cefr", "rank"],
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                },
                synonyms: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["partOfSpeech", "definition", "example", "level"],
            },
          },
          notes: {
            type: "array",
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
            },
          },
        },
        required: ["word", "level", "phonetics", "meanings"],
        additionalProperties: false,
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
