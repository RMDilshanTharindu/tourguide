import express from "express";
import { ingestion } from "./src/rag/ingest.js";

import createSearchRoutes from "./src/routes/searchRoutes.js";
import createImageRoutes from "./src/routes/imageRoutes.js";

const app = express();
app.use(express.json());

let vectorDb = [];

async function init() {
  console.log("Starting ingestion...");
  vectorDb = await ingestion();
  console.log("Total vectors:", vectorDb.length);

  //attach routes AFTER DB ready
  app.use("/api", createSearchRoutes(vectorDb));
  app.use("/api", createImageRoutes(vectorDb));
}

await init();

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});