import express from "express";
import Course from "../models/Course.js";
import CourseRegistration from "../models/CourseRegistration.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const courses = await Course.find();
  const counts = await CourseRegistration.aggregate([
    { $group: { _id: "$course", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json(courses.map((c) => ({
    code: c.code, title: c.title, dept: c.department || "—",
    students: countMap.get(String(c._id)) || 0,
  })));
});

router.post("/import", requireAuth, requireRole("ADMIN"), async (req, res) => {
  // Expects { courses: [{ semesterId, code, title, department, durationMins }] }
  const { courses = [] } = req.body || {};
  const results = { imported: 0, rejected: [] };
  for (const c of courses) {
    try {
      await Course.create(c);
      results.imported++;
    } catch (err) {
      results.rejected.push({ code: c.code, reason: err.message });
    }
  }
  res.json({ status: "success", ...results });
});

export default router;
