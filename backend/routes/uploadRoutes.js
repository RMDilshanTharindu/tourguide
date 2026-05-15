const express = require("express");
const router = express.Router();
const File = require("../models/File");

const fs = require("fs");

const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const { generateEmbedding } = require("../utils/embedding");

const { generateImageDescription } = require("../utils/imageDescription");

// 🔒 Admin-only file upload
router.post("/", protect, admin, upload.single("file"), async (req, res) => {
  try {
    // Example text (later from PDF/image)
    let text = req.file.originalname;

    if (req.file.mimetype.startsWith("image")) {
      try {
        text = await generateImageDescription(req.file.path, req.file.mimetype);
      } catch (error) {
        console.log("IMAGE DESCRIPTION FAILED:", error.message);
        text = req.file.originalname; // fallback
      }
    }

    // Generate embedding
    const embedding = await generateEmbedding(text);

    const newFile = await File.create({
    filename: req.file.filename,
    filepath: req.file.path,
    filetype: req.file.mimetype,
    uploadedBy: req.user.id,

    // ✅ ADD THIS LINE
    description: text,

    embedding: embedding,
    });

    res.json({
      message: "File uploaded + embedding created",
      file: newFile,
    });

  } catch (error) {
    console.log("UPLOAD BACKEND ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/", protect, admin, async (req, res) => {
  try {
    const files = await File.find().populate("uploadedBy", "name email");

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete file from uploads folder
    fs.unlink(file.filepath, (err) => {
      if (err) {
        console.log("File delete error:", err);
      }
    });

    // Delete from database
    await file.deleteOne();

    res.json({ message: "File deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;