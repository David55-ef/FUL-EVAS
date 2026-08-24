import express from "express";
import Course from "../models/Course.js";
import CourseRegistration from "../models/CourseRegistration.js";
import ExamTimetable from "../models/ExamTimetable.js";
import TimeSlot from "../models/TimeSlot.js";
import VenueAllocation from "../models/VenueAllocation.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { generateTimetable, buildConflicts } from "../engine/scheduler.js";
import { pick } from "../utils/pick.js";

const router = express.Router();
const TIMETABLE_UPDATE_FIELDS = ["timeSlot", "examDate", "clash"];

function nextExamDates(count, start = new Date()) {
  const dates = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  while (dates.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

router.get("/", requireAuth, requireRole("ADMIN", "EXAM_OFFICER", "INVIGILATOR"), async (req, res) => {
  const entries = await ExamTimetable.find().populate("course").populate("timeSlot");
  const allocations = await VenueAllocation.find({ examTimetable: { $in: entries.map((entry) => entry._id) } }).populate("venue");
  const venuesByExam = new Map();
  for (const allocation of allocations) {
    const key = String(allocation.examTimetable);
    if (!venuesByExam.has(key)) venuesByExam.set(key, []);
    venuesByExam.get(key).push(allocation.venue?.name);
  }

  const bySlot = new Map();
  for (const entry of entries) {
    const label = `${entry.timeSlot?.label || ""} ${entry.examDate ? new Date(entry.examDate).toDateString() : ""}`.trim();
    if (!bySlot.has(label)) bySlot.set(label, []);
    bySlot.get(label).push({
      id: entry._id,
      code: entry.course?.code,
      title: entry.course?.title,
      venue: venuesByExam.get(String(entry._id))?.filter(Boolean).join(", ") || "Not allocated",
      clash: entry.clash,
    });
  }
  res.json([...bySlot.entries()].map(([time, items]) => ({ time, items })));
});

// Dated exam slots let a morning or afternoon slot be reused on many days.
// The older timeSlotIds input remains supported for existing callers.
router.post("/generate", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { timeSlotIds, examSlots, startDate } = req.body || {};
  const fallbackDate = startDate ? new Date(startDate) : new Date();
  if (Number.isNaN(fallbackDate.getTime())) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "startDate is invalid" });
  }
  let hasDatedSlots = Array.isArray(examSlots) && examSlots.length > 0;
  let generatedSlots = null;
  if (!hasDatedSlots && (!Array.isArray(timeSlotIds) || timeSlotIds.length === 0)) {
    const slotDocs = await TimeSlot.find().sort({ startTime: 1 });
    if (!slotDocs.length) {
      return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "Create at least one time slot before generating a timetable" });
    }
    const coursesCount = await Course.countDocuments({ status: { $ne: "INACTIVE" } });
    const daysNeeded = Math.max(1, Math.ceil(coursesCount / slotDocs.length));
    const dates = nextExamDates(daysNeeded, fallbackDate);
    generatedSlots = dates.flatMap((date) => slotDocs.map((slot) => ({ timeSlotId: slot._id, examDate: date })));
    hasDatedSlots = true;
  }

  const requestedExamSlots = generatedSlots || examSlots;
  const requestedSlotIds = hasDatedSlots ? requestedExamSlots.map((slot) => slot.timeSlotId) : timeSlotIds;
  if (requestedSlotIds.some((id) => !id)) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "Every exam slot needs a timeSlotId" });
  }
  const slotDocs = await TimeSlot.find({ _id: { $in: requestedSlotIds } });
  const slotById = new Map(slotDocs.map((slot) => [String(slot._id), slot]));
  if (slotById.size !== new Set(requestedSlotIds.map(String)).size) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "One or more time slots do not exist" });
  }

  const rawOptions = hasDatedSlots ? requestedExamSlots : timeSlotIds.map((timeSlotId) => ({ timeSlotId }));
  const options = rawOptions.map((option) => {
    const slot = slotById.get(String(option.timeSlotId));
    return {
      timeSlotId: String(option.timeSlotId),
      examDate: new Date(option.examDate || slot.examDate || fallbackDate),
    };
  });
  if (options.some((option) => Number.isNaN(option.examDate.getTime()))) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "Every exam date must be valid" });
  }

  const optionByKey = new Map(options.map((option) => [
    `${option.examDate.toISOString().slice(0, 10)}|${option.timeSlotId}`,
    option,
  ]));
  if (optionByKey.size !== options.length) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "Exam slots must be unique by date and time" });
  }

  const courses = (await Course.find({ status: { $ne: "INACTIVE" } })).map((course) => ({ id: String(course._id), code: course.code }));
  const registrations = (await CourseRegistration.find()).map((registration) => ({
    studentId: String(registration.student), courseId: String(registration.course),
  }));
  const conflicts = buildConflicts(registrations);
  const { assignments, unscheduled } = generateTimetable(courses, [...optionByKey.keys()], conflicts);

  const operations = [...assignments.entries()].map(([courseId, optionKey]) => {
    const option = optionByKey.get(optionKey);
    return {
      updateOne: {
        filter: { course: courseId },
        update: { course: courseId, timeSlot: option.timeSlotId, examDate: option.examDate, clash: false },
        upsert: true,
      },
    };
  });
  if (operations.length) await ExamTimetable.bulkWrite(operations);

  const firstOption = options[0];
  for (const courseId of unscheduled) {
    await ExamTimetable.updateOne(
      { course: courseId },
      { course: courseId, timeSlot: firstOption.timeSlotId, examDate: firstOption.examDate, clash: true },
      { upsert: true }
    );
  }

  res.json({
    status: "success",
    scheduled: assignments.size,
    examSlots: options,
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
