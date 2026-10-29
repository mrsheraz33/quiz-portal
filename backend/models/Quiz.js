// backend/models/Quiz.js
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct: { type: String, required: true },
  explanation: { type: String, default: "" },
});

const quizSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
    },
    timeLimit: {
      type: Number,
      required: true, // in minutes
    },
    questions: [questionSchema],
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    quizCode: {
      type: String,
      required: true,
      unique: true, // short unique code for link
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);