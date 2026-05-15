const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateAnswer = async (question, context) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const prompt = `
You are an AI cultural heritage assistant.

Answer the user's question using ONLY the given context.
If the context is not enough, say: "I don't have enough verified information."

Question:
${question}

Context:
${context}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = { generateAnswer };