import express from "express";
import multer from "multer";
import path from "path";
import { ingestion } from "../rag/ingest.js";
import fs from "fs/promises";

import { verifyAdmin } from "../middleware/authAdminMiddleware.js";
import { ingestRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// 1. Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export default function(){

    // List Files 
    router.get("/files", verifyAdmin, async (req, res) => {
        try {
            const directoryPath = "./uploads/";
            // Read the directory
            const files = await fs.readdir(directoryPath);
            
            res.status(200).json({
                message: "Files retrieved successfully",
                files: files // Returns an array of filenames
            });
        } catch (error) {
            console.error("Failed to list files:", error);
            res.status(500).json({ error: "Unable to scan directory or folder does not exist." });
        }
    });


    // 2. The Admin Uplode and Ingest Route

    router.post("/upload-and-ingest",verifyAdmin, ingestRateLimiter, upload.single("file"), async (req, res) => {
    
    console.log("file recived")
    try {
        console.log(`File uploaded: ${req.file.filename}. Starting ingestion...`);
        
        console.log("Starting ingestion")
        // Trigger your ingestion logic
        await ingestion();

        res.status(200).json({
        message: "File uploaded and ingestion completed successfully!",
        file: req.file.filename,
        });
    } catch (error) {
        console.error("Ingestion failed:", error);
        res.status(500).json({ error: "File uploaded, but ingestion failed." });
    }
    });

    return router    
}
