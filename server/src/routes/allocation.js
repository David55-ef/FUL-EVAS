import express from "express";
import Venue from "../models/Venue.js";
import Course from "../models/Course.js";
import CourseRegistration from "../models/CourseRegistration.js";
import ExamTimetable from "../models/ExamTimetable.js";
import VenueAllocation from "../models/VenueAllocation.js";
import InvigilatorAssignment from "../models/InvigilatorAssignment.js";
import Invigilator from "../models/Invigilator.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { allocateVenues, assignInvigilators } from "../engine/allocator.js";
import { pick } from "../utils/pick.js";

const router = express.Router();

const ALLOCATION_UPDATE_FIELDS = ["venue", "studentCount"];

// GET /api/v1/allocation — current venue utilisation, for Overview/Venues/Allocation screens
router.get("/", async (req, res) => {
  const venues = await Venue.find();
  const allocations = await VenueAllocation.find();
  const usedByVenue = new Map();
  for (const a of allocations) {
    const key = String(a.venue);
    usedByVenue.set(key, (usedByVenue.get(key) || 0) + a.studentCount);
  }
  res.json(venues.map((v) => ({
    name: v.name, loc: v.location, cap: v.capacity,
    used: usedByVenue.get(String(v._id)) || 0,
    art: v.art, tag: v.tag, mx: v.mapX, my: v.mapY,
    images: v.images || [],
  })));
});

// POST /api/v1/allocation/generate — runs the allocation engine end-to-end
router.post("/generate", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { ratio = 40 } = req.body || {};

  const venues = (await Venue.find({ status: "ACTIVE" })).map((v) => ({ id: String(v._id), capacity: v.capacity }));
  const timetableEntries = await ExamTimetable.find({ clash: false }).populate("course");
  const counts = await CourseRegistration.aggregate([{ $group: { _id: "$course", count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  const scheduledCourses = timetableEntries.map((e) => ({
    courseId: String(e.course._id),
    timeSlotId: String(e.timeSlot),
    studentCount: countMap.get(String(e.course._id)) || 0,
  }));

  const { allocations, shortfalls } = allocateVenues(venues, scheduledCourses);

  await VenueAllocation.deleteMany({});
  await InvigilatorAssignment.deleteMany({});

  const examIdByCourse = new Map(timetableEntries.map((e) => [String(e.course._id), String(e._id)]));
  const created = [];
  for (const a of allocations) {
    const doc = await VenueAllocation.create({
      examTimetable: examIdByCourse.get(a.courseId),
      venue: a.venueId,
      studentCount: a.studentCount,
    });
    created.push({ ...a, allocationId: String(doc._id) });
  }

  const invigilators = (await Invigilator.find()).map((i) => ({ id: String(i._id) }));
  const { assignments, understaffed } = assignInvigilators(
    invigilators,
    created.map((c) => ({ venueId: c.venueId, courseId: c.courseId, studentCount: c.studentCount, timeSlotId: c.timeSlotId, allocationId: c.allocationId })),
    ratio
  );
  for (const a of assignments) {
    const allocationId = created.find((c) => c.venueId === a.venueId && c.courseId === a.courseId)?.allocationId;
    if (allocationId) await InvigilatorAssignment.create({ venueAllocation: allocationId, invigilator: a.invigilatorId });
  }

  res.json({
    status: "success",
    venuesAllocated: created.length,
    shortfalls,
    understaffed,
  });
});

router.put("/:allocationId", requireAuth, requireRole("ADMIN", "EXAM_OFFICER"), async (req, res) => {
  const updates = pick(req.body, ALLOCATION_UPDATE_FIELDS);
  const allocation = await VenueAllocation.findByIdAndUpdate(req.params.allocationId, updates, { new: true, runValidators: true });
  if (!allocation) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Allocation not found" });
  res.json(allocation);
});

export default router;
