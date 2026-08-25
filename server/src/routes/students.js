import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { departmentFromMatric } from "../utils/department.js";
import { pick } from "../utils/pick.js";

const router = express.Router();

router.get("/", requireAuth, requireRole("ADMIN", "EXAM_OFFICER"), async (req, res) => {
  const students = await Student.find({ isActive: { $ne: false } }).sort({ matricNo: 1 });
  res.json(students);
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { matricNo, name, email, level, password } = req.body || {};
  if (!matricNo || !name || !password || password.length < 8) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "matricNo, name, and a password of at least 8 characters are required" });
  }
  const normalizedMatric = matricNo.trim().toUpperCase();
  let student;
  await mongoose.connection.transaction(async (session) => {
    [student] = await Student.create([{
      matricNo: normalizedMatric,
      name: name.trim(),
      email,
      department: departmentFromMatric(normalizedMatric) || null,
      level,
    }], { session });
    await User.create([{
      username: normalizedMatric,
      passwordHash: await bcrypt.hash(password, 10),
      role: "STUDENT",
      linkedId: student._id,
    }], { session });
  });
  res.status(201).json(student);
});

router.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const updates = pick(req.body, ["name", "email", "department", "level"]);
  const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!student) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Student not found" });
  res.json(student);
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!student) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Student not found" });
  await User.updateOne({ linkedId: student._id, role: "STUDENT" }, { isActive: false });
  res.json({ status: "success", message: "Student deactivated" });
});

export default router;
