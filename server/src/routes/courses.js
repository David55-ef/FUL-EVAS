import express from "express";
import Course from "../models/Course.js";
import CourseRegistration from "../models/CourseRegistration.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { pick } from "../utils/pick.js";

const router = express.Router();
const COURSE_FIELDS = ["semester", "code", "title", "department", "durationMins", "status"];

router.get("/", async (req, res) => {
  const courses = await Course.find({ status: { $ne: "INACTIVE" } });
  const counts = await CourseRegistration.aggregate([
    { $group: { _id: "$course", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json(courses.map((c) => ({
    id: c._id, code: c.code, title: c.title, dept: c.department || "—",
    students: countMap.get(String(c._id)) || 0,
  })));
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const input = pick(req.body, COURSE_FIELDS);
  if (!input.semester || !input.code || !input.title) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "semester, code, and title are required" });
  }
  const course = await Course.create(input);
  res.status(201).json(course);
});

router.post("/import", requireAuth, requireRole("ADMIN"), async (req, res) => {
  // Expects { courses: [{ semesterId, code, title, department, durationMins }] }
  const { courses = [] } = req.body || {};
  const results = { imported: 0, rejected: [] };
  for (const c of courses) {
    try {
      await Course.create(pick(c, COURSE_FIELDS));
      results.imported++;
    } catch (err) {
      results.rejected.push({ code: c.code, reason: err.message });
    }
  }
  res.json({ status: "success", ...results });
});

router.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, pick(req.body, COURSE_FIELDS), { new: true, runValidators: true });
  if (!course) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Course not found" });
  res.json(course);
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, { status: "INACTIVE" }, { new: true });
  if (!course) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Course not found" });
  res.json({ status: "success", message: "Course deactivated" });
});

export default router;
