import fs from "fs";
import { ingestion } from "./ingest.js";
import { queryVectorDb } from "./queringVectors.js";
import { identifyImageSubject } from "./imagehandle.js";
import { chat } from "./chat.js";
import { generateResponse } from "./responseGenerator.js";

async function main() {
  try {
    console.log("Starting ingestion...");

    const vectorDb = await ingestion();

    console.log(` Total vectors: ${vectorDb.length}`);

    // ---------------- TEXT SEARCH ----------------
    const question = "What is Sigiriya?";

    console.log("\n Text Search...");

    const textResults = await queryVectorDb(question, vectorDb);

    textResults.forEach((r, i) => {
      console.log(`#${i + 1}`, r.text, r.score);
    });

    //generate final response
    console.log("\n\nGenerating Proper Responce using LLM......")
    const finalResponse = await generateResponse(question, textResults);
    console.log("\nFinal Responce :\n",finalResponse)

    // ---------------- IMAGE SEARCH ----------------
    const imagePath = "./images/Sigiriya.jpeg";

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const identifiedSubject = await identifyImageSubject(
      base64Image,
      "image/jpeg"
    );

    console.log("\n Image Subject:", identifiedSubject);

    const imageResults = await queryVectorDb(identifiedSubject, vectorDb);

    imageResults.forEach((r, i) => {
      console.log(`#${i + 1}`, r.text, r.score);
    });

    // ---------------- CHAT ----------------
    let chatHistory = [];

    const latestMessage = "Tell me about Gal wiharaya";

    chatHistory.push({ role: "user", text: latestMessage });

    const response = await chat(latestMessage, vectorDb, chatHistory);

    chatHistory.push({ role: "assistant", text: response });

    console.log("\nAI Response:\n");
    console.log(response);

  } catch (err) {
    console.error("Error:", err);
  }
}

main();