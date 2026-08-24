import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

process.env.JWT_SECRET = "integration-test-secret";
process.env.NODE_ENV = "test";

let replSet;
let server;
let baseUrl;
let createApp;
let signToken;
let models;

before(async () => {
  // MongoDB 7 remains compatible with older development Macs while still
  // supporting the replica-set transactions exercised by these tests.
  replSet = await MongoMemoryReplSet.create({ binary: { version: "7.0.14" }, replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
  ({ createApp } = await import("./app.js"));
  ({ signToken } = await import("./middleware/auth.js"));
  models = {
    Course: (await import("./models/Course.js")).default,
    CourseRegistration: (await import("./models/CourseRegistration.js")).default,
    ExamTimetable: (await import("./models/ExamTimetable.js")).default,
    Invigilator: (await import("./models/Invigilator.js")).default,
    Semester: (await import("./models/Semester.js")).default,
    Session: (await import("./models/Session.js")).default,
    Student: (await import("./models/Student.js")).default,
    StudentSeatAssignment: (await import("./models/StudentSeatAssignment.js")).default,
    TimeSlot: (await import("./models/TimeSlot.js")).default,
    Venue: (await import("./models/Venue.js")).default,
  };
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (mongoose.connection.readyState) await mongoose.disconnect();
  if (replSet) await replSet.stop();
});

function token(role, linkedId) {
  return signToken({ _id: new mongoose.Types.ObjectId(), role, linkedId });
}

async function request(path, { method = "GET", body, bearer } = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

async function basicExamData() {
  const session = await models.Session.create({ name: "2026/2027", startDate: new Date("2026-09-01"), endDate: new Date("2027-07-31") });
  const semester = await models.Semester.create({ session: session._id, name: "First" });
  return { session, semester };
}

test("health and missing routes use the expected response envelopes", async () => {
  const health = await request("/health");
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, "ok");

  const missing = await request("/does-not-exist");
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).code, "NOT_FOUND");
});

test("student-only and admin-only routes enforce roles", async () => {
  const noToken = await request("/api/v1/me/venue?query=CSC406");
  assert.equal(noToken.status, 401);

  const studentToken = token("STUDENT", new mongoose.Types.ObjectId());
  const adminAction = await request("/api/v1/venues", {
    method: "POST",
    bearer: studentToken,
    body: { name: "Hall", location: "Campus", capacity: 20 },
  });
  assert.equal(adminAction.status, 403);

  const wrongMeRoute = await request("/api/v1/me/assignments", { bearer: studentToken });
  assert.equal(wrongMeRoute.status, 403);
});

test("allocation saves an exact student venue and seat in one transaction", async () => {
  const { semester } = await basicExamData();
  const course = await models.Course.create({ semester: semester._id, code: "CSC406", title: "Special Topics" });
  const student = await models.Student.create({ matricNo: "FUL/CSC/22/0001", name: "Test Student" });
  const venue = await models.Venue.create({ name: "Test Hall", location: "Main Campus", capacity: 10, tag: "TH" });
  const slot = await models.TimeSlot.create({ label: "Morning", startTime: "09:00", endTime: "11:00" });
  const exam = await models.ExamTimetable.create({ course: course._id, timeSlot: slot._id, examDate: new Date("2026-09-08") });
  await models.CourseRegistration.create({ student: student._id, course: course._id });
  await models.Invigilator.create({ staffId: "FUL/STAFF/0001", name: "Test Staff" });

  const generated = await request("/api/v1/allocation/generate", {
    method: "POST",
    bearer: token("ADMIN"),
    body: { ratio: 40 },
  });
  assert.equal(generated.status, 200);
  const summary = await generated.json();
  assert.equal(summary.studentsSeated, 1);

  const savedSeat = await models.StudentSeatAssignment.findOne({ student: student._id, examTimetable: exam._id });
  assert.equal(savedSeat.seatNumber, "S-001");

  const ownVenue = await request("/api/v1/me/venue?query=CSC406", { bearer: token("STUDENT", student._id) });
  assert.equal(ownVenue.status, 200);
  const ownVenueBody = await ownVenue.json();
  assert.equal(ownVenueBody.venue, venue.name);
  assert.equal(ownVenueBody.seat, "S-001");

  const utilization = await request("/api/v1/allocation");
  const [venueUsage] = await utilization.json();
  assert.equal(venueUsage.used, 1);
  assert.equal(venueUsage.sessions[0].used, 1);
});

test("timetable generation stores the dates supplied with exam slots", async () => {
  const { semester } = await basicExamData();
  const [courseA, courseB] = await models.Course.insertMany([
    { semester: semester._id, code: "CSC401", title: "Course A" },
    { semester: semester._id, code: "CSC402", title: "Course B" },
  ]);
  const student = await models.Student.create({ matricNo: "FUL/CSC/22/0002", name: "Shared Student" });
  await models.CourseRegistration.insertMany([
    { student: student._id, course: courseA._id },
    { student: student._id, course: courseB._id },
  ]);
  const slot = await models.TimeSlot.create({ label: "Morning", startTime: "09:00", endTime: "11:00" });

  const generated = await request("/api/v1/timetable/generate", {
    method: "POST",
    bearer: token("ADMIN"),
    body: {
      examSlots: [
        { timeSlotId: slot._id, examDate: "2026-09-08" },
        { timeSlotId: slot._id, examDate: "2026-09-09" },
      ],
    },
  });
  assert.equal(generated.status, 200);
  const saved = await models.ExamTimetable.find({ course: { $in: [courseA._id, courseB._id] } }).sort({ examDate: 1 });
  assert.deepEqual(saved.map((entry) => entry.examDate.toISOString().slice(0, 10)), ["2026-09-08", "2026-09-09"]);
});
