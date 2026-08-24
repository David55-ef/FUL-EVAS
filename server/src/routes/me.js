import express from "express";
import Course from "../models/Course.js";
import Student from "../models/Student.js";
import ExamTimetable from "../models/ExamTimetable.js";
import CourseRegistration from "../models/CourseRegistration.js";
import Invigilator from "../models/Invigilator.js";
import InvigilatorAssignment from "../models/InvigilatorAssignment.js";
import StudentSeatAssignment from "../models/StudentSeatAssignment.js";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
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
router.get("/venue", requireAuth, requireRole("STUDENT"), async (req, res) => {
  const query = (req.query.query || "").toString().trim();
  const registrations = await CourseRegistration.find({ student: req.user.linkedId }).populate("course");
  let course;
  if (query) {
    const safeQuery = escapeRegex(query);
    course = registrations.find((registration) => new RegExp(`^${safeQuery}$`, "i").test(registration.course?.code))?.course;
    if (!course) {
      return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "You are not registered for that course" });
    }
  } else {
    const courseIds = registrations.map((registration) => registration.course?._id).filter(Boolean);
    const upcoming = await ExamTimetable.find({ course: { $in: courseIds } }).sort({ examDate: 1 });
    const now = new Date();
    const timetableEntry = upcoming.find((entry) => entry.examDate >= now) || upcoming[0];
    course = registrations.find((registration) => String(registration.course?._id) === String(timetableEntry?.course))?.course;
  }
  if (!course) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "No registered examination was found" });

  const timetableEntry = await ExamTimetable.findOne({ course: course._id }).populate("timeSlot");
  if (!timetableEntry) {
    return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "This course has not been scheduled yet" });
  }
  const seatAssignment = await StudentSeatAssignment.findOne({
    examTimetable: timetableEntry._id,
    student: req.user.linkedId,
  }).populate({ path: "venueAllocation", populate: "venue" });
  const allocation = seatAssignment?.venueAllocation;

  res.json({
    code: course.code,
    title: course.title,
    venue: allocation?.venue?.name || "Not yet allocated",
    venueArt: allocation?.venue?.art || "nlt",
    venueLoc: allocation?.venue?.location || "",
    date: timetableEntry.examDate ? new Date(timetableEntry.examDate).toDateString() : "TBA",
    time: timetableEntry.timeSlot ? `${timetableEntry.timeSlot.startTime} – ${timetableEntry.timeSlot.endTime}` : "TBA",
    seat: seatAssignment?.seatNumber || "Not assigned",
  });
});

// GET /api/v1/me/timetable — the logged-in student's full exam schedule
router.get("/timetable", requireAuth, requireRole("STUDENT"), async (req, res) => {
  const studentId = req.user.linkedId;
  const registrations = await CourseRegistration.find({ student: studentId }).populate("course");
  const courseIds = registrations.map((r) => r.course?._id).filter(Boolean);
  const entries = await ExamTimetable.find({ course: { $in: courseIds } }).populate("course").populate("timeSlot");
  const seats = await StudentSeatAssignment.find({
    student: studentId,
    examTimetable: { $in: entries.map((entry) => entry._id) },
  }).populate({ path: "venueAllocation", populate: "venue" });
  const seatByExam = new Map(seats.map((seat) => [String(seat.examTimetable), seat]));

  res.json(entries.map((e) => ({
    time: `${e.timeSlot?.label || ""} ${e.examDate ? new Date(e.examDate).toDateString() : ""}`.trim(),
    code: e.course?.code,
    title: e.course?.title,
    venue: seatByExam.get(String(e._id))?.venueAllocation?.venue?.name || "Not assigned",
    seat: seatByExam.get(String(e._id))?.seatNumber || "Not assigned",
    date: e.examDate,
    startTime: e.timeSlot?.startTime,
    endTime: e.timeSlot?.endTime,
  })));
});

// GET /api/v1/me/assignments — the logged-in invigilator's assigned venues
router.get("/assignments", requireAuth, requireRole("INVIGILATOR"), async (req, res) => {
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
