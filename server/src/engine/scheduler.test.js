import { test } from "node:test";
import assert from "node:assert/strict";
import { generateTimetable, buildConflicts } from "./scheduler.js";

test("buildConflicts finds courses sharing a student", () => {
  const regs = [
    { studentId: "s1", courseId: "c1" },
    { studentId: "s1", courseId: "c2" },
    { studentId: "s2", courseId: "c2" },
    { studentId: "s2", courseId: "c3" },
  ];
  const conflicts = buildConflicts(regs);
  const keys = conflicts.map((c) => [c.courseA, c.courseB].sort().join("|")).sort();
  assert.deepEqual(keys, ["c1|c2", "c2|c3"]);
});

test("buildConflicts produces no duplicate pairs for a student with many courses", () => {
  const regs = [
    { studentId: "s1", courseId: "c1" },
    { studentId: "s1", courseId: "c2" },
    { studentId: "s1", courseId: "c3" },
  ];
  const conflicts = buildConflicts(regs);
  assert.equal(conflicts.length, 3); // c1-c2, c1-c3, c2-c3, each exactly once
});

test("generateTimetable never places conflicting courses in the same slot", () => {
  const courses = [{ id: "c1" }, { id: "c2" }, { id: "c3" }, { id: "c4" }];
  const conflicts = [
    { courseA: "c1", courseB: "c2" },
    { courseA: "c2", courseB: "c3" },
    { courseA: "c1", courseB: "c3" },
  ];
  const { assignments, unscheduled } = generateTimetable(courses, ["S1", "S2", "S3"], conflicts);

  assert.equal(unscheduled.length, 0, "all courses should be schedulable with 3 slots for a 3-clique");
  for (const { courseA, courseB } of conflicts) {
    assert.notEqual(
      assignments.get(courseA),
      assignments.get(courseB),
      `${courseA} and ${courseB} must not share a slot`
    );
  }
});

test("generateTimetable flags courses it cannot fit into the available slots", () => {
  // A 3-clique (c1,c2,c3 all mutually conflicting) cannot fit into 2 slots.
  const courses = [{ id: "c1" }, { id: "c2" }, { id: "c3" }];
  const conflicts = [
    { courseA: "c1", courseB: "c2" },
    { courseA: "c2", courseB: "c3" },
    { courseA: "c1", courseB: "c3" },
  ];
  const { unscheduled } = generateTimetable(courses, ["S1", "S2"], conflicts);
  assert.equal(unscheduled.length, 1, "exactly one course of the 3-clique cannot be scheduled in 2 slots");
});

test("generateTimetable places entirely independent courses in the same slot", () => {
  const courses = [{ id: "c1" }, { id: "c2" }, { id: "c3" }];
  const { assignments, unscheduled } = generateTimetable(courses, ["S1"], []);
  assert.equal(unscheduled.length, 0);
  assert.equal(assignments.get("c1"), "S1");
  assert.equal(assignments.get("c2"), "S1");
  assert.equal(assignments.get("c3"), "S1");
});
