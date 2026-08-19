// Scheduling engine — assigns each course to a time slot such that no
// student is required to sit two examinations in the same slot.
//
// Modelled as graph colouring: courses are nodes, an edge connects two
// courses that share at least one registered student, and each time slot
// is a colour. A greedy, most-constrained-first heuristic is used, which
// is fast and effective at realistic university timetabling volumes.

/**
 * @param {Array<{id:string, code:string}>} courses
 * @param {Array<string>} timeSlotIds - available time slot identifiers, in order
 * @param {Array<{courseA:string, courseB:string}>} conflicts - precomputed
 *   pairs of course ids that share at least one student
 * @returns {{ assignments: Map<string,string>, unscheduled: string[] }}
 */
export function generateTimetable(courses, timeSlotIds, conflicts) {
  const adjacency = new Map(courses.map((c) => [c.id, new Set()]));
  for (const { courseA, courseB } of conflicts) {
    adjacency.get(courseA)?.add(courseB);
    adjacency.get(courseB)?.add(courseA);
  }

  // Most-constrained-first: courses with the most conflicts are scheduled first,
  // since they have the fewest safe slots remaining as the schedule fills up.
  const ordered = [...courses].sort(
    (a, b) => (adjacency.get(b.id)?.size || 0) - (adjacency.get(a.id)?.size || 0)
  );

  const assignments = new Map(); // courseId -> timeSlotId
  const unscheduled = [];

  for (const course of ordered) {
    const neighbours = adjacency.get(course.id) || new Set();
    const usedSlots = new Set([...neighbours].map((n) => assignments.get(n)).filter(Boolean));
    const freeSlot = timeSlotIds.find((slot) => !usedSlots.has(slot));
    if (freeSlot) {
      assignments.set(course.id, freeSlot);
    } else {
      unscheduled.push(course.id);
    }
  }

  return { assignments, unscheduled };
}

/**
 * Builds the conflict pair list from course-registration records.
 * @param {Array<{studentId:string, courseId:string}>} registrations
 * @returns {Array<{courseA:string, courseB:string}>}
 */
export function buildConflicts(registrations) {
  const byStudent = new Map();
  for (const { studentId, courseId } of registrations) {
    if (!byStudent.has(studentId)) byStudent.set(studentId, new Set());
    byStudent.get(studentId).add(courseId);
  }

  const seen = new Set();
  const conflicts = [];
  for (const courseSet of byStudent.values()) {
    const list = [...courseSet];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const key = [list[i], list[j]].sort().join("|");
        if (!seen.has(key)) {
          seen.add(key);
          conflicts.push({ courseA: list[i], courseB: list[j] });
        }
      }
    }
  }
  return conflicts;
}
