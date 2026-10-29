// backend/controllers/quizController.js
const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");
const { generateQuiz } = require("../services/geminiService");

// Short unique code generate karo (e.g., a7x9k2)
const generateQuizCode = () => {
  return Math.random().toString(36).substring(2, 8);
};

// Teacher: Generate quiz using AI
const createQuiz = async (req, res) => {
  try {
    const { topic, difficulty, timeLimit, questionCount } = req.body;

    if (!topic || !difficulty || !timeLimit || !questionCount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // AI se questions generate karo
    const questions = await generateQuiz(topic, difficulty, questionCount);

    // Unique quiz code
    let quizCode;
    let exists = true;
    while (exists) {
      quizCode = generateQuizCode();
      exists = await Quiz.findOne({ quizCode });
    }

    // Save quiz
    const quiz = await Quiz.create({
      topic,
      difficulty,
      timeLimit,
      questions,
      teacherId: req.teacher.id,
      quizCode,
    });

    res.status(201).json({
      message: "Quiz created successfully",
      quiz: {
        id: quiz._id,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        totalQuestions: quiz.questions.length,
        quizCode: quiz.quizCode,
        link: `/student/register.html?code=${quiz.quizCode}`,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Student: Get quiz by code (without correct answers)
const getQuizByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const quiz = await Quiz.findOne({ quizCode: code });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Correct answers hide karo
    const safeQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));

    res.status(200).json({
      quiz: {
        id: quiz._id,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        questions: safeQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Student: Submit quiz
const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, status } = req.body;
    // answers = [{ questionId, selected }]

    if (!quizId || !answers) {
      return res.status(400).json({ message: "Missing data" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Calculate score
    let score = 0;
    const detailed = quiz.questions.map((q) => {
      const submitted = answers.find(
        (a) => a.questionId === q._id.toString()
      );
      const selected = submitted ? submitted.selected : "";
      const isCorrect = selected === q.correct;
      if (isCorrect) score++;

      return {
        question: q.question,
        correct: q.correct,
        selected,
        isCorrect,
        explanation: q.explanation,
      };
    });

    // Save attempt
    const attempt = await Attempt.create({
      studentId: req.student.id,
      quizId,
      answers,
      score,
      total: quiz.questions.length,
      status: status || "completed",
      submittedAt: new Date(),
    });

    res.status(201).json({
      message: "Quiz submitted",
      attemptId: attempt._id,
      score,
      total: quiz.questions.length,
      details: detailed,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Student: Get own progress
const getMyProgress = async (req, res) => {
  try {
    const attempts = await Attempt.find({ studentId: req.student.id })
      .populate("quizId", "topic difficulty")
      .sort({ createdAt: -1 });

    const formatted = attempts.map((a) => ({
      attemptId: a._id,
      topic: a.quizId?.topic || "Deleted Quiz",
      difficulty: a.quizId?.difficulty || "-",
      score: a.score,
      total: a.total,
      status: a.status,
      date: a.createdAt,
    }));

    res.status(200).json({ attempts: formatted });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Teacher: Get all attempts on own quizzes
const getAllRecords = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacherId: req.teacher.id }).select(
      "_id topic"
    );
    const quizIds = quizzes.map((q) => q._id);

    const attempts = await Attempt.find({ quizId: { $in: quizIds } })
      .populate("studentId", "name studentId")
      .populate("quizId", "topic difficulty")
      .sort({ createdAt: -1 });

    const formatted = attempts.map((a) => ({
      studentName: a.studentId?.name || "Unknown",
      studentId: a.studentId?.studentId || "-",
      topic: a.quizId?.topic || "-",
      difficulty: a.quizId?.difficulty || "-",
      score: a.score,
      total: a.total,
      status: a.status,
      date: a.createdAt,
    }));

    res.status(200).json({ records: formatted });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Teacher: Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacherId: req.teacher.id }).select("_id");
    const quizIds = quizzes.map((q) => q._id);

    const totalQuizzes = quizzes.length;

    const attempts = await Attempt.find({ quizId: { $in: quizIds } });
    const totalAttempts = attempts.length;

    let avgScore = 0;
    if (attempts.length > 0) {
      const totalPct = attempts.reduce((sum, a) => {
        return sum + (a.total > 0 ? (a.score / a.total) * 100 : 0);
      }, 0);
      avgScore = Math.round(totalPct / attempts.length);
    }

    res.status(200).json({ totalQuizzes, totalAttempts, avgScore });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createQuiz,
  getQuizByCode,
  submitQuiz,
  getMyProgress,
  getAllRecords,
  getDashboardStats,
};