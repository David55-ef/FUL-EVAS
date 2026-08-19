import express from "express";
import Course from "../models/Course.js";
import CourseRegistration from "../models/CourseRegistration.js";
import ExamTimetable from "../models/ExamTimetable.js";
import TimeSlot from "../models/TimeSlot.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { generateTimetable, buildConflicts } from "../engine/scheduler.js";
import { pick } from "../utils/pick.js";

const router = express.Router();

const TIMETABLE_UPDATE_FIELDS = ["timeSlot", "examDate", "clash"];

// GET /api/v1/timetable — grouped by time slot, for the Admin Timetable screen.
// Staff-only: students use /me/timetable, which is scoped to their own
// registrations rather than exposing the whole university's exam schedule.
router.get("/", requireAuth, requireRole("ADMIN", "EXAM_OFFICER", "INVIGILATOR"), async (req, res) => {
  const entries = await ExamTimetable.find().populate("course").populate("timeSlot");
  const bySlot = new Map();
  for (const e of entries) {
    const label = `${e.timeSlot?.label || ""} ${e.examDate ? new Date(e.examDate).toDateString() : ""}`.trim();
    if (!bySlot.has(label)) bySlot.set(label, []);
    bySlot.get(label).push({
      code: e.course?.code, title: e.course?.title,
      venue: "(see allocation)", clash: e.clash,
    });
  }
  res.json([...bySlot.entries()].map(([time, items]) => ({ time, items })));
});

// POST /api/v1/timetable/generate — runs the scheduling engine end-to-end
router.post("/generate", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { timeSlotIds } = req.body || {};
  if (!Array.isArray(timeSlotIds) || timeSlotIds.length === 0) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "timeSlotIds is required" });
  }

  const courses = (await Course.find()).map((c) => ({ id: String(c._id), code: c.code }));
  const registrations = (await CourseRegistration.find()).map((r) => ({
    studentId: String(r.student), courseId: String(r.course),
  }));

  const conflicts = buildConflicts(registrations);
  const { assignments, unscheduled } = generateTimetable(courses, timeSlotIds, conflicts);

  // Persist: naive date assignment (one exam date per slot batch); a real
  // deployment would map slot ids to specific calendar dates via TimeSlot/Session config.
  const ops = [...assignments.entries()].map(([courseId, timeSlotId]) => ({
    updateOne: {
      filter: { course: courseId },
      update: { course: courseId, timeSlot: timeSlotId, examDate: new Date(), clash: false },
      upsert: true,
    },
  }));
  if (ops.length) await ExamTimetable.bulkWrite(ops);

  for (const courseId of unscheduled) {
    await ExamTimetable.updateOne(
      { course: courseId },
      { course: courseId, timeSlot: timeSlotIds[0], examDate: new Date(), clash: true },
      { upsert: true }
    );
  }

  res.json({
    status: "success",
    scheduled: assignments.size,
    unscheduled: unscheduled.map((id) => ({ courseId: id, reason: "no_conflict_free_slot" })),
  });
});

router.put("/:examId", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const updates = pick(req.body, TIMETABLE_UPDATE_FIELDS);
  const entry = await ExamTimetable.findByIdAndUpdate(req.params.examId, updates, { new: true, runValidators: true });
  if (!entry) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Timetable entry not found" });
  res.json(entry);
});

export default router;
