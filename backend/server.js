import fs from "fs";
import { ingestion } from "./ingest.js";
import { queryVectorDb } from "./queringVectors.js";
import { identifyImageSubject } from "./imagehandle.js";

async function main() {
  try {
    console.log("Starting ingestion...");

    const vectorDb = await ingestion();

    console.log(`Total vectors: ${vectorDb.length}`);

    // ---------------- QUERY TEXT ----------------
    const question = "What is Sigiriya?";

    console.log("\nSearching text...");

    const textResults = await queryVectorDb(question, vectorDb);

    console.log("\nTop Text Results:\n");

    textResults.forEach((r, i) => {
      console.log(`#${i + 1}`);
      console.log(r.text);
      console.log(r.score);
    });

    // ---------------- IMAGE PART ----------------
    const imagePath = "./images/Sigiriya.jpeg";

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const identifiedSubject = await identifyImageSubject(
      base64Image,
      "image/jpeg"
    );

    // ---------------- IMAGE-BASED SEARCH ----------------
    console.log("\nSearching about image...");

    const imageResults = await queryVectorDb(identifiedSubject, vectorDb);

    console.log("\nTop Image Results:\n");

    imageResults.forEach((r, i) => {
      console.log(`#${i + 1}`);
      console.log(r.text);
      console.log(r.score);
    });

  } catch (err) {
    console.error("Error:", err);
  }
}

main();