import express from "express";
import multer from "multer";
import path from "path";
import { ingestion } from "../rag/ingest.js";

import { verifyAdmin } from "../middleware/authAdminMiddleware.js";

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
    // 2. The Admin Uplode and Ingest Route

    router.post("/upload-and-ingest",verifyAdmin, upload.single("file"), async (req, res) => {
    
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
