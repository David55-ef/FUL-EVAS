import express from "express";
import CourseRegistration from "../models/CourseRegistration.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, requireRole("ADMIN", "EXAM_OFFICER"), async (req, res) => {
  const filter = {};
  if (req.query.studentId) filter.student = req.query.studentId;
  if (req.query.courseId) filter.course = req.query.courseId;
  const registrations = await CourseRegistration.find(filter).populate("student").populate("course");
  res.json(registrations);
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { studentId, courseId } = req.body || {};
  if (!studentId || !courseId) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "studentId and courseId are required" });
  }
  const [student, course] = await Promise.all([
    Student.findOne({ _id: studentId, isActive: { $ne: false } }),
    Course.findOne({ _id: courseId, status: { $ne: "INACTIVE" } }),
  ]);
  if (!student || !course) {
    return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Active student or course not found" });
  }
  const registration = await CourseRegistration.create({ student: studentId, course: courseId });
  res.status(201).json(registration);
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const registration = await CourseRegistration.findByIdAndDelete(req.params.id);
  if (!registration) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Registration not found" });
  res.json({ status: "success", message: "Registration removed" });
});

export default router;
