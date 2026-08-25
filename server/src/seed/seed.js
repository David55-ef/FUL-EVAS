import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import Session from "../models/Session.js";
import Semester from "../models/Semester.js";
import Venue from "../models/Venue.js";
import Course from "../models/Course.js";
import Student from "../models/Student.js";
import CourseRegistration from "../models/CourseRegistration.js";
import Invigilator from "../models/Invigilator.js";
import TimeSlot from "../models/TimeSlot.js";
import User from "../models/User.js";
import StudentSeatAssignment from "../models/StudentSeatAssignment.js";
import VenueAllocation from "../models/VenueAllocation.js";
import InvigilatorAssignment from "../models/InvigilatorAssignment.js";
import ExamTimetable from "../models/ExamTimetable.js";

import { venues, courseDefs, invigilatorDefs, timeSlotDefs, generateStudents } from "./seedData.js";

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("✗ MONGO_URI is not set. Add it to server/.env before seeding.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✓ Connected. Clearing existing data...");

  await Promise.all([
    Session.deleteMany({}), Semester.deleteMany({}), Venue.deleteMany({}),
    Course.deleteMany({}), Student.deleteMany({}), CourseRegistration.deleteMany({}),
    Invigilator.deleteMany({}), TimeSlot.deleteMany({}), User.deleteMany({}),
    StudentSeatAssignment.deleteMany({}), VenueAllocation.deleteMany({}),
    InvigilatorAssignment.deleteMany({}), ExamTimetable.deleteMany({}),
  ]);

  const session = await Session.create({ name: "2025/2026", startDate: new Date("2025-09-01"), endDate: new Date("2026-07-31") });
  const semester = await Semester.create({ session: session._id, name: "First" });

  const createdVenues = await Venue.insertMany(venues);
  console.log(`✓ ${createdVenues.length} venues`);

  const createdCourses = await Course.insertMany(
    courseDefs.map((c) => ({ ...c, semester: semester._id, durationMins: 120 }))
  );
  console.log(`✓ ${createdCourses.length} courses`);
  const courseByCode = new Map(createdCourses.map((c) => [c.code, c]));

  const studentDefs = generateStudents(30);
  const createdStudents = await Student.insertMany(
    studentDefs.map((s) => ({ matricNo: s.matricNo, name: s.name, department: s.department, level: s.level }))
  );
  console.log(`✓ ${createdStudents.length} students`);
  const studentByMatric = new Map(createdStudents.map((s) => [s.matricNo, s]));

  const registrations = studentDefs.map((s) => ({
    student: studentByMatric.get(s.matricNo)._id,
    course: courseByCode.get(s.courseCode)._id,
  }));
  await CourseRegistration.insertMany(registrations, { ordered: false }).catch(() => {});
  console.log(`✓ ${registrations.length} course registrations`);

  const createdInvigilators = await Invigilator.insertMany(invigilatorDefs);
  console.log(`✓ ${createdInvigilators.length} invigilators`);

  const createdSlots = await TimeSlot.insertMany(timeSlotDefs);
  console.log(`✓ ${createdSlots.length} time slots`);

  const passwordHash = await bcrypt.hash("password", 10);
  await User.insertMany([
    { username: "FUL/STAFF/ADMIN", passwordHash, role: "ADMIN", name: "System Administrator" },
    { username: "FUL/STAFF/OFFICER", passwordHash, role: "EXAM_OFFICER", name: "Examinations Office" },
    ...createdInvigilators.map((invigilator) => ({
      username: invigilator.staffId,
      passwordHash,
      role: "INVIGILATOR",
      name: invigilator.name,
      linkedId: invigilator._id,
    })),
  ]);

  // Every seeded student gets a real login account — not just the first
  // one — all sharing the same demo password. studentDefs and
  // createdStudents are in the same order (insertMany preserves array
  // order), so zipping them together pairs each User up with the right
  // Student record's _id.
  const studentUsers = createdStudents.map((student) => ({
    username: student.matricNo,
    passwordHash,
    role: "STUDENT",
    linkedId: student._id,
  }));
  await User.insertMany(studentUsers);

  console.log("✓ Demo login accounts created (password: 'password' for all):");
  console.log("   Administrator  → FUL/STAFF/ADMIN");
  console.log("   Exam Officer   → FUL/STAFF/OFFICER");
  console.log(`   Invigilator    → ${invigilatorDefs[0].staffId}`);
  console.log(`   Students       → all ${studentUsers.length} students can log in with their own matric number`);
  console.log(`                    (e.g. ${studentDefs[0].matricNo}, ${studentDefs[1].matricNo}, ${studentDefs[2].matricNo}, ...)`);

  console.log("\n✓ Seed complete.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
