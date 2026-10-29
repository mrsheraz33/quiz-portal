// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");

// Token verify karo aur teacher attach karo
const protectTeacher = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const teacher = await Teacher.findById(decoded.id).select("-password");
    if (!teacher) {
      return res.status(401).json({ message: "Teacher not found" });
    }

    req.teacher = teacher;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Token verify karo aur student attach karo
const protectStudent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const student = await Student.findById(decoded.id).select("-password");
    if (!student) {
      return res.status(401).json({ message: "Student not found" });
    }

    req.student = student;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { protectTeacher, protectStudent };