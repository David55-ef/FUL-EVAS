import express from "express";
import Venue from "../models/Venue.js";
import Course from "../models/Course.js";
import ExamTimetable from "../models/ExamTimetable.js";
import VenueAllocation from "../models/VenueAllocation.js";
import Student from "../models/Student.js";
import StudentSeatAssignment from "../models/StudentSeatAssignment.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { pick } from "../utils/pick.js";

const VENUE_UPDATE_FIELDS = ["name", "location", "capacity", "status", "art", "images", "tag", "mapX", "mapY"];

const router = express.Router();

function toClient(v, used = 0) {
  return {
    id: v._id, name: v.name, loc: v.location, cap: v.capacity, used,
    art: v.art, tag: v.tag, mx: v.mapX, my: v.mapY, status: v.status,
    images: v.images || [],
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Public read for the demo (an exam officer / admin token would gate this in production)
router.get("/", async (req, res) => {
  const venues = await Venue.find().sort({ name: 1 });
  res.json(venues.map((v) => toClient(v, 0)));
});

// Public lookup for the landing page. A course code returns the scheduled
// venue/time; a matric number can also reveal the student's own seat if one
// has already been assigned.
router.get("/search", async (req, res) => {
  const query = (req.query.query || "").toString().trim();
  if (!query) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "Enter a course code or matric number" });
  }

  const safeQuery = escapeRegex(query);
  const course = await Course.findOne({ code: new RegExp(`^${safeQuery}$`, "i"), status: { $ne: "INACTIVE" } });
  let student = null;
  let timetableEntry = null;
  let seatAssignment = null;

  if (course) {
    timetableEntry = await ExamTimetable.findOne({ course: course._id }).populate("course").populate("timeSlot");
  } else {
    student = await Student.findOne({ matricNo: new RegExp(`^${safeQuery}$`, "i"), isActive: { $ne: false } });
    if (!student) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "No scheduled exam was found for that search" });
    seatAssignment = await StudentSeatAssignment.findOne({ student: student._id })
      .populate({ path: "examTimetable", populate: ["course", "timeSlot"] })
      .populate({ path: "venueAllocation", populate: "venue" })
      .sort({ createdAt: 1 });
    timetableEntry = seatAssignment?.examTimetable;
  }

  if (!timetableEntry) {
    return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "That exam has not been scheduled yet" });
  }

  const allocations = await VenueAllocation.find({ examTimetable: timetableEntry._id }).populate("venue");
  const firstAllocation = seatAssignment?.venueAllocation || allocations[0];
  if (!firstAllocation) {
    return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "That exam has not been allocated to a venue yet" });
  }

  res.json({
    code: timetableEntry.course?.code,
    title: timetableEntry.course?.title,
    venue: allocations.map((allocation) => allocation.venue?.name).filter(Boolean).join(", ") || firstAllocation.venue?.name,
    venueArt: firstAllocation.venue?.art || "nlt",
    venueLoc: firstAllocation.venue?.location || "",
    date: timetableEntry.examDate ? new Date(timetableEntry.examDate).toDateString() : "TBA",
    time: timetableEntry.timeSlot ? `${timetableEntry.timeSlot.startTime} - ${timetableEntry.timeSlot.endTime}` : "TBA",
    seat: seatAssignment?.seatNumber || "Sign in for seat",
  });
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { name, location, capacity, art, tag, mapX, mapY } = req.body || {};
  if (!name || !location || !capacity) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "name, location, and capacity are required" });
  }
  const venue = await Venue.create({ name, location, capacity, art, tag: tag || name.slice(0, 6).toUpperCase(), mapX, mapY });
  res.status(201).json(toClient(venue));
});

router.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const updates = pick(req.body, VENUE_UPDATE_FIELDS);
  const venue = await Venue.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!venue) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Venue not found" });
  res.json(toClient(venue));
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const venue = await Venue.findByIdAndUpdate(req.params.id, { status: "INACTIVE" }, { new: true });
  if (!venue) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Venue not found" });
  res.json({ status: "success", message: "Venue deactivated" });
});

export default router;
