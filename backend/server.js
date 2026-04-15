import { ingestion } from "./ingest.js";
import { queryVectorDb } from "./queringVectors.js";

async function main() {
  try {
    console.log("Starting ingestion...");

    // 1. build vector DB
    const vectorDb = await ingestion();

    console.log(`Total vectors: ${vectorDb.length}`);

    // 2. test query
    const question = "What is Sigiriya?";

    console.log("\nSearching...");

    const results = await queryVectorDb(question, vectorDb);

    console.log("\nTop Results:\n");

    results.forEach((r, i) => {
      console.log(`#${i + 1}`);
      console.log("Text:", r.text);
      console.log("Score:", r.score);
      console.log("--------------------");
    });

  } catch (err) {
    console.error("Error:", err);
  }
}

main();