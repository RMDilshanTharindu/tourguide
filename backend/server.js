import express from "express";
import { ingestion } from "./src/rag/ingest.js";

import createSearchRoutes from "./src/routes/searchRoutes.js";
import createImageRoutes from "./src/routes/imageRoutes.js";
import createChatRoutes from "./src/routes/chatRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import { connectDB } from "./src/config/db.js";

import dotenv from "dotenv";
dotenv.config();

const swaggerDoc = YAML.load("./swagger.yaml");

const app = express();
app.use(express.json());

await connectDB();

let vectorDb = [];

async function init() {
  console.log("Starting ingestion...");
  await ingestion();
  //console.log("Total vectors:", vectorDb.length);
  
  //authentication
  app.use("/api/auth", authRoutes);

  //attach routes AFTER DB ready
  app.use("/api", createSearchRoutes());
  app.use("/api", createImageRoutes(vectorDb));
  app.use("/api", createChatRoutes(vectorDb));

  //api documenaion
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

}

await init();

const PORT = 3030;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});