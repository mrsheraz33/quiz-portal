// backend/routes/quizRoutes.js
const express = require("express");
const router = express.Router();

const {
  createQuiz,
  getQuizByCode,
  submitQuiz,
  getMyProgress,
  getAllRecords,
   getDashboardStats,
} = require("../controllers/quizController");

const {
  protectTeacher,
  protectStudent,
} = require("../middleware/authMiddleware");

// Teacher routes
router.post("/create", protectTeacher, createQuiz);
router.get("/records", protectTeacher, getAllRecords);
router.get("/stats", protectTeacher, getDashboardStats);
// Student routes
router.get("/code/:code", getQuizByCode); // public (link se aata hai)
router.post("/submit", protectStudent, submitQuiz);
router.get("/my-progress", protectStudent, getMyProgress);

module.exports = router;