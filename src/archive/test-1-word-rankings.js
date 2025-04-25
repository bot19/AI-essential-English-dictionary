import { promises as fs } from "fs";
import OpenAI from "openai";
import "dotenv/config";

const apiKey = process.env.CHATGPT_DICTIONARY_API_KEY;
const testNo = 3;

// console.log("api key", process.env, process.env.CHATGPT_DICTIONARY_API_KEY);

const openai = new OpenAI({
  apiKey,
});

const buildPrompt = `
You are a professional lexicographer. For the list of words below, assign each a rank from 1 to 10 based on its importance and frequency in English for ESL learners, similar to the criteria used in the Oxford 5000. A rank of 1 means the word is extremely essential and frequently used; 10 means it is much less essential or less commonly used.

words:
- apple
- hello
- direction
- restaurant
- dryer
- junction
- chef
- you
- operation
- expectation

Output format (JSON only):
Return a valid JSON object where:
- Keys are the words.
- Values are integers (1-10).
- The object is sorted by ascending rank (i.e., most essential words first).
- Do not include any explanation, comments, or formatting outside of the JSON object.
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
      `word-rankings-${testNo}.json`,
      JSON.stringify(jsonContent, null, 2),
      "utf8"
    );
  })
  .then(() => console.log("Successfully wrote to json file"))
  .catch((error) => console.error("Error:", error));
