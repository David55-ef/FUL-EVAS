import express from "express";
import Course from "../models/Course.js";
import Student from "../models/Student.js";
import ExamTimetable from "../models/ExamTimetable.js";
import VenueAllocation from "../models/VenueAllocation.js";
import CourseRegistration from "../models/CourseRegistration.js";
import Invigilator from "../models/Invigilator.js";
import InvigilatorAssignment from "../models/InvigilatorAssignment.js";
import TimeSlot from "../models/TimeSlot.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { departmentFromMatric } from "../utils/department.js";

const router = express.Router();

const ROLE_TO_CLIENT = { ADMIN: "admin", EXAM_OFFICER: "officer", INVIGILATOR: "invigilator", STUDENT: "student" };

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/v1/me/profile — who am I, according to my own verified token.
// This is what lets a page refresh (or the frontend booting up with a saved
// token) restore role and department WITHOUT ever trusting anything the
// client claims about itself — role/department are re-derived here from
// req.user.sub (the token's subject), the same as every other /me/* route.
router.get("/profile", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user || !user.isActive) {
    return res.status(401).json({ status: "error", code: "INVALID_TOKEN", message: "Account no longer active" });
  }

  const payload = {
    role: ROLE_TO_CLIENT[user.role],
    name: user.name || null,
    department: null,
  };

  if (user.role === "STUDENT") {
    const student = await Student.findById(user.linkedId).catch(() => null);
    if (student) {
      payload.name = student.name;
      payload.matricNo = student.matricNo;
      payload.department = departmentFromMatric(student.matricNo) || student.department || null;
    }
  } else if (user.role === "INVIGILATOR") {
    const staff = await Invigilator.findById(user.linkedId).catch(() => null);
    if (staff) {
      payload.name = staff.name;
      payload.department = staff.department || null;
    }
  }

  res.json(payload);
});

// GET /api/v1/me/venue?query=<course code or matric number>
// Powers the Student "Find My Venue" search screen.
router.get("/venue", async (req, res) => {
  const query = (req.query.query || "").toString().trim();
  if (!query) return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "query is required" });

  let course = null;
  const safeQuery = escapeRegex(query);

  // Try as a course code first.
  course = await Course.findOne({ code: new RegExp(`^${safeQuery}$`, "i") });

  // Otherwise, try resolving a matric number to their nearest upcoming exam.
  if (!course) {
    const student = await Student.findOne({ matricNo: new RegExp(`^${safeQuery}$`, "i") });
    if (student) {
      const reg = await CourseRegistration.findOne({ student: student._id }).populate("course");
      course = reg?.course || null;
    }
  }

  if (!course) {
    return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "No course or student found for that query" });
  }

  const timetableEntry = await ExamTimetable.findOne({ course: course._id }).populate("timeSlot");
  if (!timetableEntry) {
    return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "This course has not been scheduled yet" });
  }

  const allocation = await VenueAllocation.findOne({ examTimetable: timetableEntry._id }).populate("venue");

  res.json({
    code: course.code,
    title: course.title,
    venue: allocation?.venue?.name || "Not yet allocated",
    venueArt: allocation?.venue?.art || "nlt",
    venueLoc: allocation?.venue?.location || "",
    date: timetableEntry.examDate ? new Date(timetableEntry.examDate).toDateString() : "TBA",
    time: timetableEntry.timeSlot ? `${timetableEntry.timeSlot.startTime} – ${timetableEntry.timeSlot.endTime}` : "TBA",
    seat: "TBA",
  });
});

// GET /api/v1/me/timetable — the logged-in student's full exam schedule
router.get("/timetable", requireAuth, async (req, res) => {
  const studentId = req.user.linkedId;
  const registrations = await CourseRegistration.find({ student: studentId }).populate("course");
  const courseIds = registrations.map((r) => r.course?._id).filter(Boolean);
  const entries = await ExamTimetable.find({ course: { $in: courseIds } }).populate("course").populate("timeSlot");

  res.json(entries.map((e) => ({
    time: `${e.timeSlot?.label || ""} ${e.examDate ? new Date(e.examDate).toDateString() : ""}`.trim(),
    code: e.course?.code,
    title: e.course?.title,
    venue: "(see allocation)",
  })));
});

// GET /api/v1/me/assignments — the logged-in invigilator's assigned venues
router.get("/assignments", requireAuth, async (req, res) => {
  const invigilatorId = req.user.linkedId;
  const assignments = await InvigilatorAssignment.find({ invigilator: invigilatorId })
    .populate({ path: "venueAllocation", populate: [{ path: "venue" }, { path: "examTimetable", populate: ["course", "timeSlot"] }] });

  res.json(assignments.map((a) => ({
    venue: a.venueAllocation?.venue?.name,
    art: a.venueAllocation?.venue?.art,
    loc: a.venueAllocation?.venue?.location,
    course: a.venueAllocation?.examTimetable?.course?.code,
    studentCount: a.venueAllocation?.studentCount,
  })));
});

export default router;
