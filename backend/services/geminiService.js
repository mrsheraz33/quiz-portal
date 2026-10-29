// backend/services/geminiService.js
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateQuiz(topic, difficulty, count) {
  try {
    const quizSchema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: {
            type: "array",
            items: { type: "string" },
            minItems: 4,
            maxItems: 4,
          },
          correct: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["question", "options", "correct", "explanation"],
      },
    };

    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: `Generate ${count} multiple choice questions on "${topic}" with "${difficulty}" difficulty level. Each question must have exactly 4 options. Only one option is correct. Provide a short explanation for the correct answer.`,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: quizSchema,
      },
    });

    const text = interaction.output_text;
    const questions = JSON.parse(text);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid quiz format from AI");
    }

    return questions;
  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw new Error("Failed to generate quiz from AI");
  }
}

module.exports = { generateQuiz };
