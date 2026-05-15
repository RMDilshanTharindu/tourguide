const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const searchRoutes = require("./routes/searchRoutes");

const app = express();

// Connect Database
connectDB();

// Middleware FIRST
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes AFTER middleware
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/search", searchRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});