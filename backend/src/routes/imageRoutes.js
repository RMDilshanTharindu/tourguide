import express from "express";
import multer from "multer";
import { identifyImageSubject } from "../rag/imagehandle.js";
import { queryVectorDb } from "../rag/queringVectors.js";
import { generateResponse } from "../rag/responseGenerator.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { imageRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

export default function createImageRoutes() {

  //PROTECTED ROUTE
  router.post("/image-search",authMiddleware, imageRateLimiter, upload.single("image"), async (req, res) => {

      try {
        const userId = req.userId; 

        if (!req.file) {
          return res.status(400).json({ error: "Image is required" });
        }

        console.log(`User ${userId} uploaded image`);

        // convert to base64
        const base64Image = req.file.buffer.toString("base64");

        // 1. identify subject
        const identifiedSubject = await identifyImageSubject(
          base64Image,
          req.file.mimetype
        );

        console.log("Identified:", identifiedSubject);

        // short topic (2-3 words)
        const topic = identifiedSubject
          .split(" ")
          .slice(0, 3)
          .join(" ");

        // 2. retrieve chunks
        const results = await queryVectorDb(identifiedSubject);

        console.log("Generating Final response...");

        // 3. generate response
        const finalResponse = await generateResponse(
          identifiedSubject,
          results
        );

        res.json({
          success: true,
          userId, // optional for debugging
          topic,
          identifiedSubject,
          data: finalResponse
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  return router;
}