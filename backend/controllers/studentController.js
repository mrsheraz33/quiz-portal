// backend/controllers/studentController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Student ID format: 24-Arid-4836
const studentIdPattern = /^\d{2}-[A-Za-z]+-\d{4}$/;

// Student Register
const register = async (req, res) => {
  try {
    const { name, studentId, password } = req.body;

    if (!name || !studentId || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate studentId format
    if (!studentIdPattern.test(studentId)) {
      return res.status(400).json({
        message: "Invalid Student ID format. Example: 24-Arid-4836",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check duplicate
    const existing = await Student.findOne({ studentId });
    if (existing) {
      return res.status(400).json({ message: "Student ID already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      studentId,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful",
      token: generateToken(student._id),
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Student Login
const login = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(400).json({ message: "Invalid ID or password" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid ID or password" });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(student._id),
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, login };