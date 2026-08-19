import { test } from "node:test";
import assert from "node:assert/strict";
import { allocateVenues, assignInvigilators } from "./allocator.js";

test("allocateVenues never exceeds a venue's capacity within a slot", () => {
  const venues = [{ id: "v1", capacity: 100 }, { id: "v2", capacity: 50 }];
  const scheduledCourses = [
    { courseId: "c1", timeSlotId: "S1", studentCount: 120 },
    { courseId: "c2", timeSlotId: "S1", studentCount: 20 },
  ];
  const { allocations, shortfalls } = allocateVenues(venues, scheduledCourses);

  const totalsByVenue = {};
  for (const a of allocations) {
    totalsByVenue[a.venueId] = (totalsByVenue[a.venueId] || 0) + a.studentCount;
  }
  assert.ok(totalsByVenue.v1 <= 100, "v1 must not exceed capacity 100");
  assert.ok((totalsByVenue.v2 || 0) <= 50, "v2 must not exceed capacity 50");
  // Total demand is 140 against total capacity 150, so everyone fits — no shortfall.
  assert.equal(shortfalls.length, 0);
});

test("allocateVenues fits demand exactly equal to total capacity with no shortfall", () => {
  const venues = [{ id: "v1", capacity: 100 }, { id: "v2", capacity: 50 }];
  const scheduledCourses = [{ courseId: "c1", timeSlotId: "S1", studentCount: 150 }];
  const { allocations, shortfalls } = allocateVenues(venues, scheduledCourses);
  const total = allocations.reduce((sum, a) => sum + a.studentCount, 0);
  assert.equal(total, 150);
  assert.equal(shortfalls.length, 0);
});

test("allocateVenues splits a course across multiple venues when needed", () => {
  const venues = [{ id: "v1", capacity: 100 }, { id: "v2", capacity: 100 }];
  const scheduledCourses = [{ courseId: "c1", timeSlotId: "S1", studentCount: 150 }];
  const { allocations } = allocateVenues(venues, scheduledCourses);
  const forC1 = allocations.filter((a) => a.courseId === "c1");
  assert.equal(forC1.length, 2, "a 150-student course should be split across 2 venues of capacity 100 each");
  assert.equal(forC1.reduce((s, a) => s + a.studentCount, 0), 150);
});

test("allocateVenues flags a shortfall when total demand exceeds total capacity", () => {
  const venues = [{ id: "v1", capacity: 50 }];
  const scheduledCourses = [{ courseId: "c1", timeSlotId: "S1", studentCount: 80 }];
  const { shortfalls } = allocateVenues(venues, scheduledCourses);
  assert.equal(shortfalls.length, 1);
  assert.equal(shortfalls[0].remaining, 30);
});

test("allocateVenues keeps separate time slots on independent capacity ledgers", () => {
  const venues = [{ id: "v1", capacity: 100 }];
  const scheduledCourses = [
    { courseId: "c1", timeSlotId: "S1", studentCount: 100 },
    { courseId: "c2", timeSlotId: "S2", studentCount: 100 },
  ];
  const { allocations, shortfalls } = allocateVenues(venues, scheduledCourses);
  assert.equal(shortfalls.length, 0, "the same venue can be reused across different time slots");
  assert.equal(allocations.length, 2);
});

test("assignInvigilators never assigns the same invigilator twice in one slot", () => {
  const invigilators = [{ id: "i1" }, { id: "i2" }];
  const allocations = [
    { venueId: "v1", courseId: "c1", studentCount: 40, timeSlotId: "S1" },
    { venueId: "v2", courseId: "c2", studentCount: 40, timeSlotId: "S1" },
  ];
  const { assignments, understaffed } = assignInvigilators(invigilators, allocations, 40);
  const ids = assignments.map((a) => a.invigilatorId);
  assert.equal(new Set(ids).size, ids.length, "no invigilator id should repeat within the same slot");
  assert.equal(understaffed.length, 0);
});

test("assignInvigilators flags understaffed venues when the pool runs out", () => {
  const invigilators = [{ id: "i1" }];
  const allocations = [
    { venueId: "v1", courseId: "c1", studentCount: 40, timeSlotId: "S1" },
    { venueId: "v2", courseId: "c2", studentCount: 40, timeSlotId: "S1" },
  ];
  const { understaffed } = assignInvigilators(invigilators, allocations, 40);
  assert.equal(understaffed.length, 1, "second venue cannot be staffed from a pool of 1");
});

test("assignInvigilators reuses the same invigilator pool across different time slots", () => {
  const invigilators = [{ id: "i1" }];
  const allocations = [
    { venueId: "v1", courseId: "c1", studentCount: 40, timeSlotId: "S1" },
    { venueId: "v1", courseId: "c2", studentCount: 40, timeSlotId: "S2" },
  ];
  const { understaffed } = assignInvigilators(invigilators, allocations, 40);
  assert.equal(understaffed.length, 0, "a single invigilator can cover both slots since they don't overlap");
});
