import express from "express";
import mongoose from "mongoose";
import Venue from "../models/Venue.js";
import CourseRegistration from "../models/CourseRegistration.js";
import ExamTimetable from "../models/ExamTimetable.js";
import VenueAllocation from "../models/VenueAllocation.js";
import InvigilatorAssignment from "../models/InvigilatorAssignment.js";
import Invigilator from "../models/Invigilator.js";
import StudentSeatAssignment from "../models/StudentSeatAssignment.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { allocateVenues, assignInvigilators } from "../engine/allocator.js";
import { pick } from "../utils/pick.js";

const router = express.Router();

const ALLOCATION_UPDATE_FIELDS = ["venue"];

function seatLabel(index) {
  return `S-${String(index + 1).padStart(3, "0")}`;
}

// GET /api/v1/allocation — current venue utilisation, for Overview/Venues/Allocation screens
router.get("/", async (req, res) => {
  const venues = await Venue.find();
  const allocations = await VenueAllocation.find().populate({
    path: "examTimetable",
    populate: ["course", "timeSlot"],
  });
  const invigilatorCounts = await InvigilatorAssignment.aggregate([
    { $group: { _id: "$venueAllocation", count: { $sum: 1 } } },
  ]);
  const invigilatorsByAllocation = new Map(invigilatorCounts.map((item) => [String(item._id), item.count]));
  const sessionsByVenue = new Map();
  for (const a of allocations) {
    const venueId = String(a.venue);
    if (!sessionsByVenue.has(venueId)) sessionsByVenue.set(venueId, new Map());
    const exam = a.examTimetable;
    const date = exam?.examDate ? new Date(exam.examDate).toISOString().slice(0, 10) : "TBA";
    const slotId = String(exam?.timeSlot?._id || exam?.timeSlot || "TBA");
    const sessionKey = `${date}|${slotId}`;
    const venueSessions = sessionsByVenue.get(venueId);
    const current = venueSessions.get(sessionKey) || {
      date,
      time: exam?.timeSlot?.label || "TBA",
      used: 0,
      invigilators: 0,
      courses: [],
    };
    current.used += a.studentCount;
    current.invigilators += invigilatorsByAllocation.get(String(a._id)) || 0;
    if (exam?.course?.code) current.courses.push(exam.course.code);
    venueSessions.set(sessionKey, current);
  }
  res.json(venues.map((v) => ({
    id: v._id, name: v.name, loc: v.location, cap: v.capacity,
    // A room's capacity resets for every exam session. `used` is therefore
    // its busiest session, not the incorrect sum across different days.
    used: Math.max(0, ...[...(sessionsByVenue.get(String(v._id))?.values() || [])].map((s) => s.used)),
    sessions: [...(sessionsByVenue.get(String(v._id))?.values() || [])],
    art: v.art, tag: v.tag, mx: v.mapX, my: v.mapY,
    images: v.images || [],
  })));
});

// GET /api/v1/allocation/records — printable allocation rows for officers/admins
router.get("/records", requireAuth, requireRole("ADMIN", "EXAM_OFFICER"), async (req, res) => {
  const allocations = await VenueAllocation.find()
    .populate("venue")
    .populate({ path: "examTimetable", populate: ["course", "timeSlot"] })
    .sort({ _id: 1 });
  const assignmentCounts = await InvigilatorAssignment.aggregate([
    { $group: { _id: "$venueAllocation", count: { $sum: 1 } } },
  ]);
  const invigilatorsByAllocation = new Map(assignmentCounts.map((item) => [String(item._id), item.count]));

  res.json(allocations.map((allocation) => {
    const exam = allocation.examTimetable;
    const date = exam?.examDate ? new Date(exam.examDate).toDateString() : "TBA";
    return {
      id: allocation._id,
      code: exam?.course?.code || "Unknown course",
      title: exam?.course?.title || "",
      venue: allocation.venue?.name || "Unknown venue",
      location: allocation.venue?.location || "",
      date,
      time: exam?.timeSlot ? `${exam.timeSlot.startTime} - ${exam.timeSlot.endTime}` : "TBA",
      when: `${date} ${exam?.timeSlot?.label || ""}`.trim(),
      students: allocation.studentCount,
      invigilators: invigilatorsByAllocation.get(String(allocation._id)) || 0,
    };
  }));
});

// POST /api/v1/allocation/generate — runs the allocation engine end-to-end
router.post("/generate", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { ratio = 40 } = req.body || {};
  if (!Number.isFinite(Number(ratio)) || Number(ratio) < 1) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "ratio must be at least 1" });
  }

  let result;
  await mongoose.connection.transaction(async (session) => {
    const venueDocs = await Venue.find({ status: "ACTIVE" }).session(session);
    const venues = venueDocs.map((v) => ({ id: String(v._id), capacity: v.capacity }));
    const timetableEntries = await ExamTimetable.find({ clash: false }).session(session).populate("course");
    const registrations = await CourseRegistration.find().session(session).populate("student");

    const registrationsByCourse = new Map();
    for (const registration of registrations) {
      if (!registration.student || registration.student.isActive === false) continue;
      const courseId = String(registration.course);
      if (!registrationsByCourse.has(courseId)) registrationsByCourse.set(courseId, []);
      registrationsByCourse.get(courseId).push(registration.student);
    }
    for (const students of registrationsByCourse.values()) {
      students.sort((a, b) => a.matricNo.localeCompare(b.matricNo));
    }

    const scheduledCourses = timetableEntries.map((entry) => ({
      courseId: String(entry.course._id),
      timeSlotId: `${new Date(entry.examDate).toISOString().slice(0, 10)}|${entry.timeSlot}`,
      studentCount: registrationsByCourse.get(String(entry.course._id))?.length || 0,
    }));
    const { allocations, shortfalls } = allocateVenues(venues, scheduledCourses);

    // All replacement writes share one transaction: either the complete new
    // allocation is committed, or the previous valid allocation stays intact.
    await StudentSeatAssignment.deleteMany({}).session(session);
    await InvigilatorAssignment.deleteMany({}).session(session);
    await VenueAllocation.deleteMany({}).session(session);

    const examByCourse = new Map(timetableEntries.map((e) => [String(e.course._id), e]));
    const allocationDocs = allocations.map((a) => ({
      examTimetable: examByCourse.get(a.courseId)._id,
      venue: a.venueId,
      studentCount: a.studentCount,
    }));
    const insertedAllocations = allocationDocs.length
      ? await VenueAllocation.insertMany(allocationDocs, { session })
      : [];
    const created = allocations.map((a, index) => ({
      ...a,
      allocationId: String(insertedAllocations[index]._id),
      examTimetableId: String(allocationDocs[index].examTimetable),
    }));

    const courseCursors = new Map();
    const venueSeatCursors = new Map();
    const seatDocs = [];
    for (const allocation of created) {
      const students = registrationsByCourse.get(allocation.courseId) || [];
      const start = courseCursors.get(allocation.courseId) || 0;
      const assignedStudents = students.slice(start, start + allocation.studentCount);
      const venueSessionKey = `${allocation.timeSlotId}|${allocation.venueId}`;
      const firstSeat = venueSeatCursors.get(venueSessionKey) || 0;
      assignedStudents.forEach((student, index) => seatDocs.push({
        examTimetable: allocation.examTimetableId,
        venueAllocation: allocation.allocationId,
        venue: allocation.venueId,
        sessionKey: allocation.timeSlotId,
        student: student._id,
        seatNumber: seatLabel(firstSeat + index),
      }));
      courseCursors.set(allocation.courseId, start + assignedStudents.length);
      venueSeatCursors.set(venueSessionKey, firstSeat + assignedStudents.length);
    }
    if (seatDocs.length) await StudentSeatAssignment.insertMany(seatDocs, { session });

    const invigilators = (await Invigilator.find({ isActive: { $ne: false } }).session(session)).map((i) => ({ id: String(i._id) }));
    const { assignments, understaffed } = assignInvigilators(invigilators, created, Number(ratio));
    const invigilatorDocs = assignments.map((assignment) => {
      const allocation = created.find((c) => (
        c.venueId === assignment.venueId
        && c.courseId === assignment.courseId
        && c.timeSlotId === assignment.timeSlotId
      ));
      return allocation && { venueAllocation: allocation.allocationId, invigilator: assignment.invigilatorId };
    }).filter(Boolean);
    if (invigilatorDocs.length) await InvigilatorAssignment.insertMany(invigilatorDocs, { session });

    result = {
      status: "success",
      venuesAllocated: created.length,
      studentsSeated: seatDocs.length,
      shortfalls,
      understaffed,
    };
  });

  res.json(result);
});

router.put("/:allocationId", requireAuth, requireRole("ADMIN", "EXAM_OFFICER"), async (req, res) => {
  const updates = pick(req.body, ALLOCATION_UPDATE_FIELDS);
  const allocation = await VenueAllocation.findByIdAndUpdate(req.params.allocationId, updates, { new: true, runValidators: true });
  if (!allocation) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Allocation not found" });
  res.json(allocation);
});

export default router;
