// backend/models/Attempt.js
const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: [
      {
        questionId: String,
        selected: String,
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["started", "completed", "auto-submitted"],
      default: "started",
    },
    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);