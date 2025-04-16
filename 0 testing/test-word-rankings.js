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
You are a professional Lexicographer. For the following words, provide a rank appropriate to their usage and importance in the English language for an ESL learner (think: The Ofxord 5000). The rank should be a number between 1 and 10 (inclusive), where 1 is the most essential and 10 is the least essential.

words:
1. apple
2. hello
3. direction
4. restaurant
5. dryer
6. junction
7. chef
8. you
9. operation
10. expectation

output format (JSON):
{ "word": rank, "word2": rank2, ... }

- The output is a JSON object with the words as keys and their ranks as int values. The keys should be sorted in rank order, with 1 first.
- Only output the JSON object—no explanations.
- Keep JSON clean and valid. This JSON object will be parsed by a program, so don't add any extra text or formatting.
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
