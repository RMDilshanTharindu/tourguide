import express from "express";
import multer from "multer";
import { identifyImageSubject } from "../rag/imagehandle.js";
import { queryVectorDb } from "../rag/queringVectors.js";
import { generateResponse } from "../rag/responseGenerator.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

export default function createImageRoutes(vectorDb) {

  // POST /api/image-search
  router.post("/image-search", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image is required" });
      }

      console.log("Image received");

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
      const results = await queryVectorDb(identifiedSubject, vectorDb);

      console.log(results[0])
      console.log("Generating Final response using returned chunks.....")

      // 3. generate response
      const finalResponse = await generateResponse(
        identifiedSubject,
        results
      );

      console.log("Answer generated...........")
      

      res.json({
        success: true,
        topic, //short topic for frontend
        identifiedSubject, // full name
        data: finalResponse
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}