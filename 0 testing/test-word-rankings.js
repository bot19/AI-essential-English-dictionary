import { promises as fs } from "fs";
import OpenAI from "openai";
import "dotenv/config";

const apiKey = process.env.CHATGPT_DICTIONARY_API_KEY;
const testNo = 1;

// console.log("api key", process.env, process.env.CHATGPT_DICTIONARY_API_KEY);

const openai = new OpenAI({
  apiKey,
});

const buildPrompt = `
You are a professional Lexicographer. For the following words, provide a rough rank appropriate to their usage and importance in the English language for an ESL learner. The rank should be a number between 1 and 10, where 1 is the most common/essential and 10 is the least common/essential.

words (separated by commas):
"fun, fur, gap, gas, gay, get, gig, god, gum, gun, gut, guy, gym, ham, hat, her, hey"

output format (JSON):
{ "word": rank, "word2": rank2, ... }

The output should be a JSON object with the words as keys and their ranks as int values. The keys should be sorted in alphabetical order.
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
