const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const imageToGenerativePart = (path, mimeType) => {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType,
    },
  };
};

const generateImageDescription = async (filePath, mimeType) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    });

  const prompt =
    "Describe this image clearly for a cultural heritage knowledge system. Mention visible objects, place type, historical/cultural clues, materials, and important details.";

  const imagePart = imageToGenerativePart(filePath, mimeType);

  const result = await model.generateContent([prompt, imagePart]);
  const response = result.response;

  return response.text();
};

module.exports = { generateImageDescription };